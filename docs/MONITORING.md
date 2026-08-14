# Monitoring

## Endpoints

- `GET /api/v1/health`
- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- `GET /api/v1/metrics`
- `GET /api/v1/metrics/prometheus`

## Key Metrics

- Requests per second
- Average latency, p50, p95, p99
- Error rate
- Booking success and failure rate
- Seat hold success and expiration rate
- Email success and failure rate
- Queue waiting, failed, delayed, retry, and dead-letter counts
- Redis health
- Database health
- Supplier health
- Payment health

## Alerts

- High API error rate
- High API latency
- Database unavailable
- Redis unavailable
- Queue backlog or dead-letter growth
- Booking failure spike
- Seat hold expiration spike
- Email failure spike
- Supplier failure
- Payment failure
- Disk/storage pressure

## Dashboard Notes

Prometheus scrape output is available at `/api/v1/metrics/prometheus`. Protect it with network policy, ingress rules, or a scrape-specific auth layer before exposing beyond trusted infrastructure.
