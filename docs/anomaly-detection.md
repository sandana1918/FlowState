# Anomaly Detection

FlowState uses a rolling Z-score detector over CPU and memory windows. Each new point is scored against the previous `N` points. If the point exceeds the configured threshold, an anomaly row is persisted and the correlation engine runs.

