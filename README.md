# FlowState

![Node](https://img.shields.io/badge/node-20%2B-22c55e)
![Frontend CI](https://img.shields.io/badge/frontend-ci-blue)
![Backend CI](https://img.shields.io/badge/backend-ci-blue)
![License](https://img.shields.io/badge/license-MIT-white)

FlowState is a real-time incident correlation engine that watches real Docker containers, ingests real GitHub deployment webhooks, scores live metric anomalies with a rolling Z-score detector, correlates those anomalies to recent deploys, calculates service blast radius, and streams incidents to a live React command center over Socket.io without polling.

## Architecture

```text
GitHub Push
     ↓
GitHub Webhook → POST /api/webhooks/github
     ↓
Deployment Event stored in PostgreSQL
     ↓
node-cron (every 15s) → Docker Engine API
     ↓
Real Container Metrics (CPU, Memory, Network)
     ↓
Z-Score Anomaly Detector
     ↓ (if anomaly)
Correlation Engine → "Was there a deploy in last 30min?"
     ↓ (if yes)
Incident Engine → Open Incident with Blast Radius + Resolution Steps
     ↓
Socket.io → React Dashboard (live, no refresh)
```

## Features

- Real Docker Engine API polling with Windows named pipe support
- Real GitHub webhook ingestion with HMAC signature validation
- PostgreSQL-backed metrics, anomalies, deployments, and incidents
- Redis latest-metric cache with TTL
- Rolling Z-score anomaly detection
- Deployment correlation confidence scoring
- Blast-radius calculation from a service dependency graph
- Live WebSocket dashboard with fallback banner
- Docker Compose, Kubernetes, Helm, GitHub Actions, Trivy, Prometheus

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide, Socket.io Client |
| Backend | Node.js 20, Express, TypeScript, Socket.io, Dockerode, PostgreSQL, Redis, Zod, prom-client |
| Platform | Docker Desktop, Docker Compose, Kubernetes, Helm, GitHub Actions, Trivy, Nginx |

## Prerequisites

- Windows with Docker Desktop
- Node.js 20+
- npm

## Quick Start

```powershell
git clone https://github.com/yourusername/flowstate.git
cd flowstate
docker compose -f docker/docker-compose.yml up -d
cd backend; npm install; npm run dev
cd ../frontend; npm install; npm run dev
```

## Windows Setup

Use `.\scripts\setup-windows.ps1` to copy env files, start infra, wait for PostgreSQL, and apply the initial migration.
If you already have PostgreSQL on `localhost:5432`, FlowState uses `localhost:5433` for the Dockerized project database.

## GitHub Webhook Setup

1. Go to repository settings.
2. Add a webhook.
3. Set URL to `https://your-domain.com/api/webhooks/github`.
4. Set content type to `application/json`.
5. Paste the same secret used in `backend/.env`.
6. Select push events.

## How Anomaly Detection Works

FlowState keeps a rolling window of recent metric points per container and metric. For each new point it computes the mean and standard deviation of the baseline window, then measures how many standard deviations the new point sits above that baseline. Large deviations are statistically unusual and trigger anomalies.

## How Correlation Works

When an anomaly lands, FlowState checks for deployments received inside the configured time window. A deploy within 5 minutes scores HIGH confidence, 5 to 15 minutes scores MEDIUM, and 15 to 30 minutes scores LOW.

## How To Demo

1. Start FlowState.
2. Run one or more demo containers.
3. Trigger a GitHub push event to the webhook.
4. Spike container CPU or memory.
5. Watch the anomaly and incident appear in the dashboard live.

## Kubernetes

```powershell
kind create cluster --name flowstate
kubectl apply -f k8s/
kubectl port-forward svc/flowstate-frontend 3000:80 -n flowstate
kubectl port-forward svc/flowstate-backend 5000:5000 -n flowstate
```

## Prometheus

The backend exposes `/metrics` via `prom-client`. Point Prometheus at `host.docker.internal:5000`.

## Troubleshooting

- If Docker metrics are unavailable, FlowState enters fallback mode and the UI shows a banner.
- If webhooks return `401`, verify `GITHUB_WEBHOOK_SECRET`.
- If the backend cannot boot, confirm PostgreSQL and Redis are healthy.

## Resume Bullets

- Built FlowState, a real-time incident correlation engine using React, TypeScript, Node.js,
  PostgreSQL, Redis, Docker Engine API, Socket.io, and GitHub webhooks — no mock data.
- Implemented a rolling Z-score anomaly detection algorithm that continuously analyzes
  live Docker container metrics (CPU, memory, network) against a sliding baseline window
  to detect statistically significant deviations in real time.
- Built a deployment-to-anomaly correlation engine that automatically links metric spikes
  to recent GitHub push events using configurable time windows and confidence scoring
  (HIGH/MEDIUM/LOW), and calculates blast radius across a service dependency graph.
- Designed a real-time WebSocket pipeline using Socket.io that pushes live metric updates,
  anomaly detections, and incident events to a React dashboard without any polling or
  page refresh.
- Containerized frontend and backend using Docker, deployed to Kubernetes with Deployments,
  Services, Ingress, HPA, NetworkPolicy, RBAC, liveness/readiness probes, and non-root
  security contexts.
- Implemented GitHub Actions CI/CD with Trivy container security scanning, failing the
  pipeline on CRITICAL vulnerabilities and uploading scan artifacts for review.

## Future Improvements

- Add GitHub App support for richer deployment metadata
- Add persistent resolution-step progress sync
- Add SLO burn-rate overlays and alert routing
