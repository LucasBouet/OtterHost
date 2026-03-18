use anyhow::Result;
use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
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

#[derive(Clone)]
struct AppState {
    metrics: Arc<Mutex<Metrics>>,
}

#[tokio::main]
async fn main() -> Result<()> {
    let state = AppState {
        metrics: Arc::new(Mutex::new(Metrics {
            ram_current: 0.0,
            ram_max: 0.0,
            cpu_usage: 0.0,
            storage_current: 0.0,
            storage_max: 0.0,
        })),
    };

    let app = Router::new()
        .route("/api/metrics", get(get_metrics).post(post_metrics))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    println!("Core API server starting on :8080");

    axum::serve(listener, app).await?;
    Ok(())
}

async fn post_metrics(
    State(state): State<AppState>,
    Json(metrics): Json<Metrics>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let mut metrics_guard = state.metrics.lock().unwrap();
    *metrics_guard = metrics;
    Ok(Json(serde_json::json!({"status": "received"})))
}

async fn get_metrics(State(state): State<AppState>) -> Json<Metrics> {
    let metrics_guard = state.metrics.lock().unwrap();
    Json(metrics_guard.clone())
}
