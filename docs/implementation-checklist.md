# FlowState Implementation Checklist

## Running Now

- [x] Frontend dev server running on `http://localhost:3000`
- [x] Backend API running on `http://localhost:5000`
- [x] PostgreSQL container running
- [x] Redis container running
- [x] Backend health endpoint returning `mode`

## Backend Core

- [x] Real Docker container listing via Docker Engine
- [x] Real Docker stats collection with CPU, memory, network, restart count
- [x] PostgreSQL schema and migration file
- [x] Redis latest-metric cache writes
- [x] 15-second metric collection loop
- [x] Rolling Z-score anomaly detector
- [x] Deployment correlation service
- [x] Incident creation service
- [x] Rule-based resolution steps
- [x] GitHub webhook endpoint with HMAC validation
- [x] Socket.io event pipeline
- [x] `/metrics` Prometheus endpoint

## API Verification

- [x] `GET /api/health`
- [x] `GET /api/services`
- [x] `GET /api/metrics/current`
- [x] `GET /api/incidents`
- [x] `GET /api/deployments`
- [x] `GET /api/correlations`
- [x] Responses include `mode`

## Frontend

- [x] Dashboard page
- [x] Incidents page
- [x] Services page
- [x] Deployments page
- [x] Logs page
- [x] Metrics page
- [x] Correlations page
- [x] Settings page
- [x] WebSocket client wiring
- [x] Fallback banner support

## Infra / Repo Assets

- [x] Dockerfiles
- [x] Docker Compose
- [x] Kubernetes manifests
- [x] Helm chart
- [x] GitHub Actions workflows
- [x] Prometheus config
- [x] Setup scripts
- [x] README and docs

## Partial

- [~] Dashboard now cleaner and lighter, but the whole app is not yet consistently Google-clean on every page
- [~] Dashboard system chart uses current metric snapshots by service, not a full 30-minute historical multi-line view
- [~] Services page lacks the requested `View Logs` and `View Metrics` actions plus richer uptime/details
- [~] Logs page lacks copy-all, clear, and auto-scroll controls
- [~] Metrics page is missing dedicated network and restart-count charts
- [~] Deployments page is missing correlation status badges and avatar rendering
- [~] Correlations page does not yet use a true time-axis scatter with deployment-aligned vertical markers
- [~] Settings page shows status and graph editing, but does not yet show Docker version details
- [~] Prometheus endpoint exists, but custom business metrics are not yet exported beyond default Node metrics

## Not Verified End-To-End Yet

- [ ] Real GitHub webhook push event received from GitHub
- [ ] Real deployment-to-anomaly incident correlation demonstrated live
- [ ] Full Docker Compose app stack (`frontend` + `backend` containers) verified with `up --build`
- [ ] Kubernetes deployment verified on Kind
