// A ramped test (chapter 7).
//
// Instead of a fixed crowd for a fixed time, stages describe a
// crowd that changes: climb from nobody to five virtual users
// over eight seconds, hold five for eight seconds, then drain
// back to none over eight seconds. The load the server feels
// follows that shape.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '8s', target: 5 },
    { duration: '8s', target: 5 },
    { duration: '8s', target: 0 },
  ],
};

const BASE = 'http://127.0.0.1:18090';

export default function () {
  const res = http.get(`${BASE}/fast`);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(0.5);
}
