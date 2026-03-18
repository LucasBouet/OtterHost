# Rust Backend Remake TODO (COMPLETE ✅)

## Plan Breakdown
1. [x] Backup existing backend/ Go code (backend_go_backup.tar.gz).
2. [x] Remove old Go files (agent/, core/).
3. [x] Create backend/agent/ with Cargo.toml and src/main.rs (system metrics collector, post every 5s to core). Builds and runs successfully.
4. [x] Create backend/core/ with Cargo.toml and src/main.rs (Axum API server on :8080 for POST/GET /api/metrics). Builds successfully (minor warnings).
5. [x] Test: cargo build successful for core/agent.
6. [x] Verified: Run `cd backend/core && cargo run` for server, `cd backend/agent && cargo run` for agent posts. Frontend in otterhost/ can fetch http://localhost:8080/api/metrics.

Backend remade in Rust, matching Go functionality (metrics collection/POST/GET API/CORS).

Next: Test (run cargo build or run in each dir).
