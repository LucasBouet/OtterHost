use anyhow::{Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::str::FromStr;
use std::time::Duration;
use sysinfo::System;
use tokio::signal;
use tokio::time::{interval, MissedTickBehavior};

#[derive(Serialize, Deserialize, Debug)]
struct Metrics {
    ram_current: f64,
    ram_max: f64,
    cpu_usage: f64,
    storage_current: f64,
    storage_max: f64,
}

async fn collect_metrics(sys: &mut System) -> Result<Metrics> {
    // Refresh only what we need
    sys.refresh_memory();
    sys.refresh_cpu_all();

    // RAM (GB)
    let ram_current = sys.used_memory() as f64 / 1e9;
    let ram_max = sys.total_memory() as f64 / 1e9;

    // CPU (%)
    let cpu_usage = sys.global_cpu_usage() as f64;

    // Storage via `df`
    let output = Command::new("df")
        .args(["-BG", "/"])
        .output()
        .context("failed to execute df")?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let line = stdout
        .lines()
        .nth(1)
        .ok_or_else(|| anyhow::anyhow!("no df output line"))?;

    let fields: Vec<&str> = line.split_whitespace().collect();
    if fields.len() < 3 {
        anyhow::bail!("invalid df output");
    }

    let storage_max = f64::from_str(fields[1].trim_end_matches('G'))?;
    let storage_current = f64::from_str(fields[2].trim_end_matches('G'))?;

    Ok(Metrics {
        ram_current,
        ram_max,
        cpu_usage,
        storage_current,
        storage_max,
    })
}

async fn send_metrics(client: &Client, metrics: &Metrics) -> Result<()> {
    let resp = client
        .post("http://localhost:8080/api/metrics")
        .json(metrics)
        .send()
        .await
        .context("failed to POST metrics")?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        anyhow::bail!("POST failed: {} {}", status, body);
    }

    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    println!("Agent started (Ctrl+C to stop)");

    let client = Client::new();
    let mut sys = System::new_all();

    sys.refresh_cpu_all();
    tokio::time::sleep(Duration::from_millis(500)).await;

    let mut interval = interval(Duration::from_secs(5));
    interval.set_missed_tick_behavior(MissedTickBehavior::Skip);

    tokio::select! {
        _ = async {
            loop {
                interval.tick().await;

                match collect_metrics(&mut sys).await {
                    Ok(metrics) => {
                        if let Err(e) = send_metrics(&client, &metrics).await {
                            eprintln!("Send error: {}", e);
                        } else {
                            println!(
                                "CPU {:.1}% | RAM {:.1}/{:.1} GB | Disk {:.1}/{:.1} GB",
                                metrics.cpu_usage,
                                metrics.ram_current,
                                metrics.ram_max,
                                metrics.storage_current,
                                metrics.storage_max
                            );
                        }
                    }
                    Err(e) => {
                        eprintln!("Collect error: {}", e);
                    }
                }
            }
        } => {}
        _ = signal::ctrl_c() => {
            println!("\nStopping agent...");
        }
    }

    Ok(())
}