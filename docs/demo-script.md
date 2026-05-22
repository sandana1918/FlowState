FlowState is a real-time incident correlation engine I built from scratch.

The core problem it solves: when something breaks in production, engineers waste
time figuring out if a recent deployment caused it. FlowState automates that correlation.

Here's what actually happens technically:

A background process using node-cron polls the Docker Engine API every 15 seconds
using the Dockerode library, collecting real CPU usage, memory usage, network I/O,
and restart counts from every running container.

Each metric is fed into a rolling Z-score anomaly detector I implemented — it maintains
a sliding window of the last 20 data points per container per metric, calculates the mean
and standard deviation, and flags anything beyond 2.5 standard deviations as anomalous.

When an anomaly is detected, a correlation engine checks PostgreSQL for any deployment
events received in the last 30 minutes via the GitHub webhook integration. If a deployment
is found, it calculates a confidence score based on the time delta between the deploy
and the anomaly.

If there's a correlation, an incident is automatically opened with a full timeline,
a blast radius calculation based on a service dependency graph, and rule-based
resolution steps interpolated with real values like the container name and commit hash.

All of this is pushed live to the React frontend over Socket.io WebSockets —
you watch the incident appear in real time the moment it's detected.

I also built Kubernetes manifests with proper RBAC, HPA, NetworkPolicy, and
non-root security contexts, GitHub Actions CI/CD with Trivy security scanning,
and a Prometheus metrics endpoint for observability.

