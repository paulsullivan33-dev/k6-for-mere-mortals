# The Moving Parts

A k6 run has more pieces than its one
command suggests. Knowing which piece
holds what is the difference between
"the numbers look wrong" and "of course —
that metric counts *every* request,
including the fast ones".

## The binary

k6 is a single program, written in Go,
that you download and run. It contains
the JavaScript runtime your scripts
execute in, the HTTP client the virtual
users send with, the metric machinery,
and the summary printer. There is no
server to install and nothing to log
into: `k6 run script.js` is the whole
ceremony. Chapter 3 covers installing
it; this guide's lab used **k6 v2.3.0**
from the project's own releases.

## The script

A test is a JavaScript file with a
particular skeleton:

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 3,
  duration: '10s',
};

export default function () {
  const res = http.get('http://127.0.0.1:18090/fast');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

Three pieces matter:

- **Imports.** Capabilities arrive as
  modules: `k6/http` for requests, `k6`
  itself for `check`, `sleep` and
  `group`, `k6/metrics` for custom
  metrics (chapter 9). These are k6's own
  modules, not npm packages; the runtime
  is a JavaScript engine embedded in the
  Go binary, not Node, and most of the
  Node ecosystem is not in the room.
- **`options`.** One exported object
  declaring the run's shape: crowd size,
  duration, stages, thresholds,
  scenarios. k6 reads it before anything
  runs, and command-line flags can
  override parts of it for one run.
- **The default function.** What one
  virtual user does, once. k6 calls it
  again and again, per user, until the
  run's time or iteration budget is spent.

A script may also define `setup()` and
`teardown()` functions — run once at the
start and once at the end, outside the
crowd — for preparing data and tidying
up. The lab's scripts do not need them;
chapter 12 names the pattern.

## Virtual users and iterations

A **virtual user** is one independent
instance of your test function, looping.
VUs share nothing: each has its own
JavaScript runtime, its own cookies, its
own connection pool. Ten VUs are ten
strangers who happen to follow the same
instructions, not one user with ten hands.

One trip through the function is an
**iteration**. The summary counts them,
and times them: `iteration_duration`
includes the requests *and* the sleeps,
which is why the lab's first test shows
iterations of about 1.44 s — a 0.4 s slow
request, a fast one, and the 1-second
`sleep` that stands in for a human
reading the page. That sleep is **think
time**, and leaving it out is the most
common beginner's distortion: a crowd
that never pauses is not a crowd of
users, it is a denial-of-service drill
with better branding.

## Metrics

Everything k6 observes becomes a
**metric**: a named stream of values.
Some are built in and always present —
`http_req_duration`, `http_req_failed`,
`http_reqs`, `iterations`, `data_received`
and friends. Others you define yourself
(chapter 9). Every metric is one of four
types, and the type decides how the
summary can summarise it:

| Type | What it holds | Summarised as |
|---|---|---|
| **Counter** | A sum that only grows | total, and per second |
| **Gauge** | A latest value | last, with min and max |
| **Rate** | A stream of true/false | the percentage that were true |
| **Trend** | A pile of numbers | avg, min, med, max, percentiles |

Each value also carries **tags** —
labels like the URL, the method, the
status code, the scenario and the group —
which is how one metric becomes many
readable slices (the summary's
`{ expected_response:true }` rows are one
such slice), and how saved results can be
taken apart afterwards (chapter 11).

## Checks, thresholds, and the verdict

Two different judges watch a run, and
confusing them is the classic k6
surprise:

- A **check** is an assertion inside the
  test function — *status is 200*, *body
  names the endpoint*. Checks are counted
  and reported, pass and fail. **A failed
  check does not fail the run.** The
  lab's first test "passed" (exit code 0)
  with 21 failed checks, on purpose.
- A **threshold** is a line in `options`
  over a whole metric — *p(95) of
  http_req_duration under 1000 ms*,
  *fewer than 1% of requests failed*.
  Thresholds are evaluated at the end,
  and a crossed threshold **fails the
  run**: k6 exits with code **99**, which
  is how scripts and CI systems read the
  verdict without parsing the report.

Chapter 6 teaches checks, chapter 8
thresholds. The short version: checks
are the lab notebook; thresholds are the
exam.

## Where a run can happen

This guide runs everything **locally**:
one binary, one machine, the target on
the same machine's loopback. k6 also has
a hosted sibling, Grafana Cloud k6, which
runs scripts on Grafana's machines and
keeps results in dashboards, and there
are ways to spread one test across
several generators. Those are
**documented only** in this guide —
named where they belong (chapters 11
and 13), never presented as run — and
chapter 13 explains why the move matters
more than it looks: a crowd raised on a
small laptop measures the laptop.

## Who holds what, when it looks wrong

- The **script** holds the shape: if the
  crowd is the wrong size, `options` is
  where to look, and `k6 inspect` prints
  the shape k6 resolved before you run
  (transcript `k6-lab/transcripts/t09-inspect.txt`).
- The **target** holds its own truth:
  the lab's fixture server counts the
  requests it served (`/stats`), so k6's
  count can be checked against the other
  side of the conversation.
- The **metrics** hold the evidence; the
  **summary** is one reading of them, and
  the saved results file (chapter 11)
  holds every point for other readings.
- The **exit code** holds the verdict:
  0 for "ran, and no threshold crossed",
  99 for a crossed threshold — and a
  failed check, alone, changes neither.
