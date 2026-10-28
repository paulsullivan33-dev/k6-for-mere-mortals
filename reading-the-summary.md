# Reading the Summary

Outcome: you can take the block of text
a k6 run ends with and read every line
of it as a sentence — what was counted,
over how many, and what it means. The
worked example throughout is the first
test's summary, transcript
`k6-lab/transcripts/t02-first-test.txt`.

## The shape of it

A finished run prints its summary in
sections. When thresholds are declared
there is a **THRESHOLDS** section first
(chapter 8); then **TOTAL RESULTS**,
divided into the checks block, then
metric families: **HTTP**, **EXECUTION**,
**NETWORK**, and **CUSTOM** when you
defined metrics of your own (chapter 9).
What follows is the first test's TOTAL
RESULTS, taken in order.

## The checks block

```text
    checks_total.......: 84     8.297222/s
    checks_succeeded...: 75.00% 63 out of 84
    checks_failed......: 25.00% 21 out of 84

    ✓ fast: status is 200
    ✓ fast: body names the endpoint
    ✓ slow: status is 200
    ✗ slow: answered in under 100 ms
      ↳  0% — ✓ 0 / ✗ 21
```

The counts first: how many checks ran in
total, and how they split. Then each
named check with its mark. A check that
failed some of the time gets the extra
line underneath: the percentage that
passed, and the split. Here the story is
plain — three checks passed every time;
one passed *none* of the time, 0 of 21,
which is the signature of an impossible
check (chapter 4 built one on purpose),
not of a flaky service. A check at 50%
tells a different story; a check at 0%
tells you to read the check itself first.

## The HTTP family

```text
    http_req_duration..............: avg=221.95ms min=741.68µs med=223.95ms max=445.76ms p(90)=442.72ms p(95)=442.99ms
      { expected_response:true }...: avg=221.95ms min=741.68µs med=223.95ms max=445.76ms p(90)=442.72ms p(95)=442.99ms
    http_req_failed................: 0.00%  0 out of 42
    http_reqs......................: 42     4.148611/s
```

**`http_req_duration`** is the headline
metric of any load test: how long
requests took, start to finish. It is a
Trend, so it is summarised as a spread:

- **avg** — the mean. Treat it with
  suspicion whenever the crowd visited
  two kinds of endpoint: here 222 ms is
  the average of "about 1 ms" and "about
  400 ms", a wait that roughly *no actual
  requester experienced*.
- **min / max** — the extremes. Max is
  one request's worst moment; min is the
  floor set by the machine and the wire.
- **med** — the median, the middle
  request when all are lined up by
  duration. More honest than the average
  for a single population; here, with two
  populations, it lands at 224 ms, in the
  valley between them, describing neither.
- **p(90) / p(95)** — percentiles. p(95)
  of 443 ms says: 95% of requests
  finished within 443 ms — and 5% waited
  longer. Percentiles are how load
  results are honestly quoted, because
  they describe the tail your unluckiest
  users live in, and thresholds
  (chapter 8) are usually drawn on them.

The indented row beneath is the same
metric narrowed by a **tag**: only the
requests whose response was the expected
kind (a 2xx or 3xx status). In this run
every request qualified, so the rows
agree. In a run with failures, the two
rows part company, and the split is
itself information.

**`http_req_failed`** is a Rate: the
share of requests that failed — a
non-2xx/3xx status, or no answer at all.
Zero here: slow is not failed. Note what
counts: the *transport's* opinion. A 200
with the wrong body is a success on this
line and a failure in a check, which is
why both judges exist.

**`http_reqs`** is a Counter: requests
made, and the rate per second.

## The EXECUTION family

```text
    iteration_duration.............: avg=1.44s ...
    iterations.....................: 21     2.074306/s
    vus............................: 3      min=3       max=3
    vus_max........................: 3      min=3       max=3
```

`iterations` counts completed trips
through the test function. Multiply by
the requests per iteration and you
should land on `http_reqs` — 21 × 2 = 42
here. When the numbers refuse to
reconcile, something in the script is
not doing what you think (a request on a
conditional path is the usual suspect).

`iteration_duration` is the whole trip:
requests *and* sleeps. Its 1.44 s is the
slow request's 0.4 s, the fast request,
and the 1 s `sleep(1)`, added up — which
is why it is not a service metric and
never belongs in a threshold about the
service.

`vus` and `vus_max` are Gauges: how many
virtual users were alive at the end, and
the most that were ever alive. In a
ramped run (chapter 7) these two part
company and tell the ramp's story.

## The NETWORK family

```text
    data_received..................: 7.4 kB 730 B/s
    data_sent......................: 3.2 kB 311 B/s
```

Bytes in and out, bodies and headers
both. Small numbers here — the fixture's
answers are a line of JSON — but against
a real service this is the line that
tells you whether your "load test" was
mostly the service thinking or mostly
both of you shipping a large page back
and forth, and it is the first place to
look when a generator machine's network,
not the service, turns out to be the
ceiling.

## The progress lines are not the summary

While a run is live, k6 redraws status
lines (`running (05.0s), 3/3 VUs, 9
complete…`). The last of them survives
into the transcript under the summary.
They are a heartbeat, useful for knowing
a long run is alive; everything quotable
lives in the sections above them.

Check: take the summary from your own
run of `first-test.js` and the
transcript side by side. Every line
should exist in both, and the counts —
84 checks, 42 requests, 21 iterations —
should match or sit within one iteration
of each other.
