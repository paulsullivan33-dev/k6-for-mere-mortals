# Glossary

**Arrival rate** — how many new
iterations begin per unit of time. The
controlled variable of the *open* model,
and the thing arrival-rate executors set
directly (chapters 7 and 10).

**Check** — a named assertion inside the
test function, evaluated per response
and counted, pass or fail. Checks inform;
they do not, by themselves, fail a run
(chapters 4 and 6).

**Closed model** — a test whose crowd
size is fixed, so the request rate
emerges from how fast the service
answers. Most of this guide's tests are
closed (chapter 7).

**Counter** — a metric type holding a
growing total, summarised as a count
and a per-second rate (chapter 9).

**Executor** — the engine inside a
scenario that decides when its virtual
users start iterations: constant,
ramping, per-VU or shared iterations,
or arrival-rate (chapter 10).

**Fixture server** — this guide's lab
target: a small program with known
behaviour (a fast endpoint, a 0.4 s
endpoint, one failing every fourth
request), written so the tool's readings
can be checked against ground truth
(chapter 4).

**Gauge** — a metric type holding a
level: the latest value, with min and
max across the run (chapter 9).

**Group** — a named wrapper around part
of a test function, so requests and
checks within it are reported together,
as a step of a journey (chapter 6).

**Iteration** — one complete trip
through a virtual user's test function,
requests, checks and sleeps included
(chapter 2).

**Load test** — a rehearsal crowd: a
program sending requests as many
simulated users, at a shaped rate, to
measure a system's behaviour under
load. The names for its shapes — smoke,
stress, spike, soak — are chapter 12.

**Metric** — a named stream of values a
run produces: built in (`http_req_duration`,
`http_reqs`, …) or defined by the script.
Every metric is a Counter, Gauge, Rate
or Trend (chapter 2).

**Open model** — a test whose *arrival
rate* is fixed, so users are created as
needed to sustain it — the model of
queues and pile-ups (chapters 7 and 13).

**p(95)** — the 95th percentile: the
value at or below which 95% of
observations fell. The usual statistic
for thresholds, because it speaks for
the slow tail without being one
request's anecdote (chapter 5).

**Rate** — a metric type holding a
stream of true/false, summarised as the
percentage that were true —
`http_req_failed` is one (chapter 9).

**Scenario** — a named workload inside
a test, with its own executor, crowd
shape and function; several can run at
once in one `k6 run` (chapter 10).

**Stage** — one movement in a ramp:
over this duration, take the crowd to
this size (chapter 7).

**Summary** — the report k6 prints at
the end of a run: checks, thresholds'
marks, and the metrics in families. The
compact default folds scenarios and
groups together; `--summary-mode=full`
unfolds them (chapters 5 and 6).

**Tag** — a label carried by metric
values — URL, method, status, scenario,
group, or your own — letting one metric
be read in slices (chapters 5 and 9).

**Think time** — the pauses between a
virtual user's requests, standing in
for a human reading and deciding;
usually a `sleep()` in the test
function (chapter 2).

**Threshold** — a pass/fail line over a
metric, declared in `options` and judged
at the end of the run. A crossed
threshold fails the run with exit code
99 (chapter 8).

**Trend** — a metric type holding a
pile of numbers, summarised as avg,
min, med, max and percentiles.
`http_req_duration` is one (chapter 9).

**Virtual user (VU)** — one independent
instance of the test function, looping
for the run's duration: its own runtime,
cookies and connections, sharing nothing
with its neighbours (chapter 2).
