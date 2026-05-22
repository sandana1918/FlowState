$ErrorActionPreference = "Stop"

Write-Host "Checking Docker Desktop..."
try {
  docker info | Out-Null
} catch {
  throw "Docker Desktop is not running."
}

Write-Host "Checking Node.js..."
$nodeVersion = node -v
if (-not $nodeVersion.StartsWith("v20") -and -not $nodeVersion.StartsWith("v21") -and -not $nodeVersion.StartsWith("v22")) {
  throw "Node.js 20+ is required."
}

Copy-Item backend/.env.example backend/.env -Force
Copy-Item frontend/.env.example frontend/.env -Force

docker compose -f docker/docker-compose.yml up -d postgres redis

Write-Host "Waiting for PostgreSQL..."
$postgresContainer = docker compose -f docker/docker-compose.yml ps -q postgres
for ($i = 0; $i -lt 30; $i++) {
  $status = docker inspect --format="{{.State.Health.Status}}" $postgresContainer 2>$null
  if ($status -eq "healthy") { break }
  Start-Sleep -Seconds 2
}

Get-Content backend/src/db/migrations/001_initial.sql | docker exec -i $postgresContainer psql -U flowstate -d flowstate

Write-Host "FlowState setup complete."
Write-Host "Next:"
Write-Host "1. cd backend; npm install; npm run dev"
Write-Host "2. cd frontend; npm install; npm run dev"
