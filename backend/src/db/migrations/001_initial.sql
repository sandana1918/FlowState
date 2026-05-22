CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id VARCHAR(64) NOT NULL,
  container_name VARCHAR(255) NOT NULL,
  cpu_percent FLOAT NOT NULL,
  memory_mb FLOAT NOT NULL,
  memory_percent FLOAT NOT NULL,
  network_rx_bytes BIGINT DEFAULT 0,
  network_tx_bytes BIGINT DEFAULT 0,
  restart_count INT DEFAULT 0,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id VARCHAR(64) NOT NULL,
  container_name VARCHAR(255) NOT NULL,
  metric_name VARCHAR(64) NOT NULL,
  metric_value FLOAT NOT NULL,
  zscore FLOAT NOT NULL,
  mean_baseline FLOAT NOT NULL,
  stddev_baseline FLOAT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo VARCHAR(255) NOT NULL,
  branch VARCHAR(255) NOT NULL,
  commit_hash VARCHAR(40) NOT NULL,
  commit_message TEXT,
  author VARCHAR(255),
  author_email VARCHAR(255),
  pushed_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(512) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  affected_service VARCHAR(255) NOT NULL,
  affected_container_id VARCHAR(64),
  trigger_metric VARCHAR(64),
  trigger_value FLOAT,
  trigger_zscore FLOAT,
  correlated_deployment_id UUID REFERENCES deployments(id),
  correlation_confidence VARCHAR(10),
  blast_radius JSONB DEFAULT '{}',
  timeline JSONB DEFAULT '[]',
  resolution_steps JSONB DEFAULT '[]',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_container_collected ON metrics(container_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_detected ON anomalies(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_received ON deployments(received_at DESC);

