import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "https://api-staging.vriddhinexus.example";
const journeyDate = __ENV.JOURNEY_DATE || "2026-09-10";

export const options = {
  scenarios: {
    staging_smoke_load: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 5 },
        { duration: "1m", target: 10 },
        { duration: "30s", target: 0 },
      ],
      gracefulRampDown: "10s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<500", "p(99)<900"],
  },
};

export default function runStagingLoad() {
  const headers = {
    "content-type": "application/json",
    "x-correlation-id": `k6-${__VU}-${__ITER}`,
  };

  const health = http.get(`${baseUrl}/api/v1/health/ready`, { headers });
  check(health, {
    "ready endpoint is not down": (response) => response.status < 500,
  });

  const search = http.post(
    `${baseUrl}/api/v1/search`,
    JSON.stringify({
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
      journeyDate,
      passengerCount: 1,
      page: 1,
      pageSize: 12,
    }),
    { headers },
  );
  check(search, {
    "search returns successfully": (response) => response.status === 201 || response.status === 200,
  });

  const seatLayout = http.get(`${baseUrl}/api/v1/seats/MOCK-BLR-HYD-001?date=${journeyDate}`, {
    headers,
  });
  check(seatLayout, {
    "seat layout is available": (response) => response.status < 500,
  });

  sleep(1);
}
