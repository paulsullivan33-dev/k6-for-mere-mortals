// Thresholds that pass (chapter 8).
//
// Thresholds are pass/fail lines drawn over the run's numbers.
// This test only visits endpoints that behave, with lines drawn
// where a healthy service should sit, so every threshold passes
// and the run exits with code 0.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 3,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.95'],
  },
};

const BASE = 'http://127.0.0.1:18090';

export default function () {
  const fast = http.get(`${BASE}/fast`);
  check(fast, {
    'fast: status is 200': (r) => r.status === 200,
  });

  const slow = http.get(`${BASE}/slow`);
  check(slow, {
    'slow: status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
