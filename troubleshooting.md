# Troubleshooting

Symptom first, cause second, in the
order the lab and the documentation
suggest you check them.

## The run "passed" but the checks failed

*Failures all over the checks block, and
the exit code is 0. The lab's own first
run — chapter 4's, with 21 failed checks
and a green exit.*

That is k6 working as designed: **checks
do not fail runs** (chapters 2 and 8).
If the failure should matter, it needs
a threshold — over the metric involved,
or over checks themselves:
`checks: ['rate>0.95']` in `options`.
Until then, a "successful" run means
"the script completed", nothing more.
Treat any report of a passed load test
as unfinished until you know which
thresholds were standing guard.

## The exit code is 99

A threshold was crossed — the run
completed and the *system* failed
(chapter 8, transcript t05). Read the
THRESHOLDS section at the top of the
summary: each crossed line shows the
expression and the actual value side by
side (`✗ 'p(95)<100' p(95)=442.21ms`),
and the final error line names the
metrics involved. 99 is not a crash;
other failure codes mean other things
(script errors, an unreachable target
at start-up), and conflating them in a
CI job makes both unreadable.

## Everything failed, from the first request

*`http_req_failed` at 100%, checks
unanimously red, and the service is
supposedly up.*

1. **The target is not there.** In the
   lab, this is the fixture server not
   running, or running in a terminal you
   closed. Prove the target before
   suspecting the test:
   `curl http://127.0.0.1:18090/fast`
   should answer in your hand.
2. **The address is wrong.** A typo'd
   port or a `localhost` where the
   service binds only `127.0.0.1` (or the
   reverse) produces exactly this. So
   does a proxy environment variable
   quietly rerouting the generator's
   requests elsewhere.
3. **The service fell over under you.**
   Check `/stats` — or your service's
   own count. If it served some requests
   and then stopped, the run did not
   malfunction; it *reported*, and the
   interesting question moved to the
   target.

## The durations look wrong

*Impossibly fast, impossibly slow, or
identical every run.*

1. **You are reading the wrong metric.**
   `iteration_duration` includes sleeps
   by design (chapter 5); the service's
   time lives in `http_req_duration`.
2. **The average is hiding two crowds.**
   A run mixing fast and slow endpoints
   has a mean and median that describe
   neither (chapter 5's 222 ms average
   of ~1 ms and ~400 ms populations).
   Slice by tag — per URL, per group —
   before concluding anything.
3. **Generator and target share a
   machine.** Chapter 13: at any real
   size this blurs both sides. In the
   lab's small runs the effect is below
   the noise; in yours, watch the
   generator's CPU before believing a
   latency.
4. **The percentile barely moves.** Over
   a few dozen requests, p(95) is two
   requests wearing a sash (chapter 13).
   Lengthen the run before arguing with
   it.

## The failure rate is not the rate you planted

Chapter 8's lesson, as a symptom: the
fixture fails every fourth request, the
threshold reports 11.90%. `http_req_failed`
counts **all** requests in the run;
the visits to the failing endpoint were
half the traffic. Before doubting the
arithmetic, ask *of what population is
this metric a rate?* — and when the
answer matters, threshold the tagged
slice (`http_req_failed{url:...}`) or
read the per-check line, which counts
only its own visits.

## Groups or scenarios are missing from the summary

The default summary is the **compact**
one: totals only, groups and scenarios
folded into the whole. Nothing was
lost — the points all exist — but the
*display* needs asking:
`--summary-mode=full` (transcript t07)
prints a section per scenario and a
block per group, with the detailed
timing sub-metrics.

## The summary is not what the script declared

`k6 inspect script.js` prints the
options k6 resolved from the file —
before a single request is sent
(transcript t09). If the run's header
disagrees with your file, an override is
in the room: a command-line flag, an
environment variable, or a config file
outranking the script. Resolve it there
rather than re-reading the script for a
fourth time.
