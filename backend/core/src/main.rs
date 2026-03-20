use anyhow::Result;
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::{
    path::{Path, PathBuf},
    sync::Arc,
};

use tokio::fs;
use tokio::process::Command;
use tokio::sync::Mutex;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

#[derive(Serialize, Deserialize, Clone, Debug)]
struct Metrics {
    ram_current: f64,
    ram_max: f64,
    cpu_usage: f64,
    storage_current: f64,
    storage_max: f64,
}

#[derive(Serialize)]
struct FileEntry {
    name: String,
    path: String,
    is_dir: bool,
    size: u64,
}

#[derive(Clone)]
struct AppState {
    metrics: Arc<Mutex<Metrics>>,
    base_path: Arc<PathBuf>,
}

#[derive(Deserialize)]
struct PathQuery {
    path: Option<String>,
}

#[derive(Serialize)]
struct ExistsResponse {
    exists: bool,
}

#[derive(Deserialize)]
struct CheckPathQuery {
    name: String,
}

#[derive(Deserialize, Debug)]
struct DownloadRequest {
    id: String,
    ports: Vec<u16>,
    env: Vec<String>,
    volumes: Vec<String>,
}

#[derive(Deserialize)]
struct DockerCheckQuery {
    name: String,
}

#[derive(Serialize)]
struct DockerStatusResponse {
    running: bool,
}

#[tokio::main]
async fn main() -> Result<()> {
    // create app dir
    let base_dir = Path::new("/opt/otterhost/docker");

    fs::create_dir_all(base_dir).await.map_err(|e| {
        eprintln!("Failed to create the app directory: {}", e);
        e
    })?;

    let state = AppState {
        metrics: Arc::new(Mutex::new(Metrics {
            ram_current: 0.0,
            ram_max: 0.0,
            cpu_usage: 0.0,
            storage_current: 0.0,
            storage_max: 0.0,
        })),

        base_path: Arc::new(PathBuf::from("/opt/otterhost/")),
    };

    let app = Router::new()
        .route("/api/metrics", get(get_metrics).post(post_metrics))
        .route("/api/files", get(list_files))
        .route("/api/isdownloaded", get(check_folder_exists))
        .route("/api/downloaddocker", axum::routing::post(download_docker))
        .route("/api/isdockerrunning", get(check_container_running))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    println!("Server running on :8080");

    axum::serve(listener, app).await?;
    Ok(())
}

//
// ─── METRICS ─────────────────────────────────────────────────────────────
//

async fn post_metrics(
    State(state): State<AppState>,
    Json(metrics): Json<Metrics>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let mut guard = state.metrics.lock().await;
    *guard = metrics;

    Ok(Json(serde_json::json!({ "status": "received" })))
}

async fn get_metrics(State(state): State<AppState>) -> Json<Metrics> {
    let guard = state.metrics.lock().await;
    Json(guard.clone())
}

//
// ─── FILE EXPLORER ───────────────────────────────────────────────────────
//

fn resolve_path(base: &Path, requested: &str) -> Result<PathBuf, StatusCode> {
    let joined = base.join(requested);

    let resolved = joined.canonicalize().map_err(|_| StatusCode::NOT_FOUND)?;

    if !resolved.starts_with(base) {
        return Err(StatusCode::FORBIDDEN);
    }

    Ok(resolved)
}

async fn list_files(
    State(state): State<AppState>,
    Query(query): Query<PathQuery>,
) -> Result<Json<Vec<FileEntry>>, StatusCode> {
    let requested_path = query.path.unwrap_or_else(|| "".to_string());

    let resolved = resolve_path(&state.base_path, &requested_path)?;

    let mut entries = fs::read_dir(&resolved)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut result = Vec::new();

    while let Some(entry) = entries
        .next_entry()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    {
        let metadata = entry
            .metadata()
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        result.push(FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
        });
    }

    Ok(Json(result))
}

//
// ─── DOCKER ───────────────────────────────────────────────────────
//

async fn check_folder_exists(
    State(state): State<AppState>,
    Query(query): Query<CheckPathQuery>,
) -> Result<Json<ExistsResponse>, StatusCode> {
    if query.name.contains("..") || query.name.contains('/') {
        return Err(StatusCode::BAD_REQUEST);
    }

    let path = state.base_path.join(&query.name);

    let exists = match fs::metadata(&path).await {
        Ok(metadata) => metadata.is_dir(),
        Err(_) => false,
    };

    Ok(Json(ExistsResponse { exists }))
}

async fn download_docker(
    State(state): State<AppState>,
    Json(payload): Json<DownloadRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    if payload.id.contains("..") || payload.id.contains('/') {
        return Err(StatusCode::BAD_REQUEST);
    }

    // paths
    let source_dir = Path::new("./src/compose").join(&payload.id);
    let target_dir = state.base_path.join("docker").join(&payload.id);

    if !source_dir.exists() {
        eprintln!("Source compose folder does not exist: {:?}", source_dir);
        return Err(StatusCode::NOT_FOUND);
    }

    if fs::metadata(&target_dir).await.is_ok() {
        fs::remove_dir_all(&target_dir)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    // ─── copy directory ───
    copy_dir_all(&source_dir, &target_dir)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // ─── edit .env file dynamically based on comment sections ───
    let env_file_path = target_dir.join(format!("{}.env", payload.id));

    let content = fs::read_to_string(&env_file_path)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut lines: Vec<String> = content.lines().map(|l| l.to_string()).collect();

    enum Section {
        None,
        Ports,
        Envs,
        Volumes,
    }

    let mut current_section = Section::None;
    let mut port_idx = 0;
    let mut env_idx = 0;
    let mut vol_idx = 0;

    for line in lines.iter_mut() {
        let trimmed = line.trim();

        match trimmed {
            "#ports" => {
                current_section = Section::Ports;
                continue;
            }
            "#envs" => {
                current_section = Section::Envs;
                continue;
            }
            "#volumes" => {
                current_section = Section::Volumes;
                continue;
            }
            _ => {}
        }

        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue; // skip comments or empty lines
        }

        let key = line.split('=').next().unwrap_or("");

        match current_section {
            Section::Ports => {
                if let Some(port) = payload.ports.get(port_idx) {
                    *line = format!("{}={}", key, port);
                    port_idx += 1;
                }
            }
            Section::Envs => {
                if let Some(env) = payload.env.get(env_idx) {
                    *line = format!("{}={}", key, env);
                    env_idx += 1;
                }
            }
            Section::Volumes => {
                if let Some(vol) = payload.volumes.get(vol_idx) {
                    *line = format!("{}={}", key, vol);
                    vol_idx += 1;
                }
            }
            Section::None => {}
        }
    }

    let new_content = lines.join("\n");

    fs::write(&env_file_path, new_content)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({
        "status": "ok",
        "id": payload.id
    })))
}

async fn copy_dir_all(src: &Path, dst: &Path) -> Result<()> {
    let mut queue = VecDeque::new();
    queue.push_back((src.to_path_buf(), dst.to_path_buf()));

    while let Some((current_src, current_dst)) = queue.pop_front() {
        fs::create_dir_all(&current_dst).await?;

        let mut entries = fs::read_dir(&current_src).await?;

        while let Some(entry) = entries.next_entry().await? {
            let ty = entry.file_type().await?;
            let src_path = entry.path();
            let dst_path = current_dst.join(entry.file_name());

            if ty.is_dir() {
                queue.push_back((src_path, dst_path));
            } else {
                fs::copy(&src_path, &dst_path).await?;
            }
        }
    }

    Ok(())
}

async fn check_container_running(
    Query(query): Query<DockerCheckQuery>,
) -> Result<Json<DockerStatusResponse>, StatusCode> {
    if query.name.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let output = Command::new("docker")
        .args([
            "ps",
            "--filter",
            &format!("name={}", query.name),
            "--filter",
            "status=running",
            "--format",
            "{{.Names}}",
        ])
        .output()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !output.status.success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    let running = stdout.lines().any(|line| line.trim() == query.name);

    Ok(Json(DockerStatusResponse { running }))
}