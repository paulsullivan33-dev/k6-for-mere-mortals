// Your first k6 test (chapter 4).
//
// Three virtual users, ten seconds. Each user asks the fixture
// server for its fast endpoint and its slow one, checks the
// answers, then rests for a second and goes again.
//
// One check is built to fail: the slow endpoint waits 0.4
// seconds before answering, so "answered in under 100 ms"
// cannot pass. Watching a check fail, and learning that a
// failed check alone does not fail the run, is the point.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 3,
  duration: '10s',
};

const BASE = 'http://127.0.0.1:18090';

export default function () {
  const fast = http.get(`${BASE}/fast`);
  check(fast, {
    'fast: status is 200': (r) => r.status === 200,
    'fast: body names the endpoint': (r) => r.json('endpoint') === 'fast',
  });

  const slow = http.get(`${BASE}/slow`);
  check(slow, {
    'slow: status is 200': (r) => r.status === 200,
    'slow: answered in under 100 ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
