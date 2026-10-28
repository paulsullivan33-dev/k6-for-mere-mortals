// Thresholds that fail, on purpose (chapter 8).
//
// This test leans on the fixture server's two difficult
// endpoints: /flaky, which fails every fourth request, and
// /slow, which always takes 0.4 seconds. The thresholds are
// drawn where neither can reach:
//
//   http_req_failed    rate<0.05 — a quarter of the flaky
//                      requests fail, so this cannot hold
//   http_req_duration  p(95)<100 — the slow endpoint alone
//                      puts the 95th percentile near 400 ms
//
// k6 marks both thresholds failed in the summary and exits
// with code 99, which is how a CI system learns the run failed
// without reading a word of the report.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 3,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<100'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE = 'http://127.0.0.1:18090';

export default function () {
  const flaky = http.get(`${BASE}/flaky`);
  check(flaky, {
    'flaky: status is 200': (r) => r.status === 200,
  });

  const slow = http.get(`${BASE}/slow`);
  check(slow, {
    'slow: status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
