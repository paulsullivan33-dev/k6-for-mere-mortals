// Two workloads in one run (chapters 6, 9 and 10).
//
// Scenarios let one file hold several workloads, each with its
// own crowd shape and its own function to run:
//
//   browsing  a steady pair of users reading the front page
//             and the fast endpoint
//   checkout  a crowd that ramps from none to three and back,
//             walking the slow step and the unreliable step
//
// Inside the functions, group() gathers requests under a name
// so the summary reports them together. Two custom metrics
// ride along: a Trend recording the slow step's duration, and
// a Counter tallying requests to the flaky endpoint, which the
// server's own /stats count can cross-check afterwards.

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const slowTrend = new Trend('lab_slow_duration');
const flakyRequests = new Counter('lab_flaky_requests');

export const options = {
  scenarios: {
    browsing: {
      executor: 'constant-vus',
      vus: 2,
      duration: '12s',
      exec: 'browsing',
    },
    checkout: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '6s', target: 3 },
        { duration: '6s', target: 0 },
      ],
      exec: 'checkout',
    },
  },
};

const BASE = 'http://127.0.0.1:18090';

export function browsing() {
  group('front page and fast endpoint', () => {
    http.get(`${BASE}/`);
    const res = http.get(`${BASE}/fast`);
    check(res, {
      'fast: status is 200': (r) => r.status === 200,
    });
  });
  sleep(1);
}

export function checkout() {
  group('the slow step', () => {
    const res = http.get(`${BASE}/slow`);
    slowTrend.add(res.timings.duration);
    check(res, {
      'slow: status is 200': (r) => r.status === 200,
    });
  });

  group('the unreliable step', () => {
    const res = http.get(`${BASE}/flaky`);
    flakyRequests.add(1);
    check(res, {
      'flaky: status is 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}
