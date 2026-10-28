# Thresholds

Outcome: you can draw pass/fail lines
over a run's numbers, read the verdict
in the summary, and use the exit code —
0 or 99 — as the run's answer to "was
that good enough?", which is the whole
reason load tests get run by machines
instead of admired by people.

## What a threshold is

A threshold is one string in `options`,
attached to a metric:

```js
thresholds: {
  http_req_duration: ['p(95)<1000'],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.95'],
}
```

The left side names a metric (chapter
9's four types decide what can be asked
of it). The string is a small
expression: a statistic — `p(95)`,
`avg`, `rate`, `count`, `value` — a
comparison, and a number. A metric may
carry several thresholds, and thresholds
may also be drawn over a tagged slice of
a metric — only the checkout requests,
only one endpoint — which chapter 9's
tags make possible.

While the run goes on, k6 watches the
thresholds; at the end it prints the
**THRESHOLDS** section, above TOTAL
RESULTS, with a mark per line.

## A run that passes

`k6-lab/scripts/thresholds-pass.js`
sends the usual three users to the
fixture's two honest endpoints and
draws the lines a healthy service
should sit inside (transcript
`k6-lab/transcripts/t04-thresholds-pass.txt`):

```text
  █ THRESHOLDS

    checks
    ✓ 'rate>0.95' rate=100.00%

    http_req_duration
    ✓ 'p(95)<1000' p(95)=442ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%
```

Read each line as claim and evidence:
*p(95) came out at 442 ms, under the
1000 ms line* — the 442 being the slow
endpoint's 400 ms wait plus travel time,
exactly as chapter 5's reading predicts.
Every line ticked; the run's exit code:

```text
exit code: 0
```

## A run that fails, on purpose

`k6-lab/scripts/thresholds-fail.js`
visits the two difficult endpoints and
draws lines neither can reach
(transcript
`k6-lab/transcripts/t05-thresholds-fail.txt`):

```text
  █ THRESHOLDS

    http_req_duration
    ✗ 'p(95)<100' p(95)=442.21ms

    http_req_failed
    ✗ 'rate<0.05' rate=11.90%
```

Both crossed, and the run ends with an
error line and a different exit code:

```text
level=error msg="thresholds on metrics 'http_req_duration, http_req_failed' have been crossed"
exit code: 99
```

**99 is k6's "the test ran fine and the
system did not"** — distinct from a
script error or a crashed run, which
fail other ways. A CI job needs nothing
more than that code to stop a release.

One number in that transcript deserves
a second look, because it teaches how
metrics count. The threshold says the
failure rate is 11.90%; the fixture
fails *every fourth* request, which
sounds like 25%. Both are right:
`http_req_failed` is counted over
**every request in the run** — 42 of
them, half to the always-succeeding
`/slow` — and 5 failures over 42 is
11.9%. The flaky check's own line, in
the checks block, tells the per-endpoint
story (5 failures of 21 visits). A
threshold is only ever as precise as
your knowledge of what its metric
includes; when the population matters,
threshold the tagged slice, not the
whole river.

## Drawing lines you can defend

- **Threshold the promise, not the
  hope.** "p(95) under 500 ms" should be
  the service's actual commitment, or a
  step toward it — a line drawn at
  whatever today's run happens to beat
  is a trophy, not a test.
- **Expect to watch one fail early.**
  Like chapter 6's checks, a threshold
  never seen crossing is unverified
  equipment. The lab failing one on
  purpose, in a fixture, is the cheap
  version of that proof.
- **`abortOnFail` exists** for runs
  where a crossed line makes the rest
  pointless — a threshold can stop the
  test the moment it is crossed, instead
  of reporting at the end. The lab did
  not need it at ten seconds; at an hour,
  it saves the hour. It is an option on
  the threshold, described in the
  documentation.

## Checks versus thresholds, settled

Chapter 4's run had 21 failed checks and
exit code 0; this chapter's failing run
had thresholds crossed and exit code 99.
That is the whole relationship: checks
observe the *answers*, thresholds judge
the *numbers*, and only thresholds carry
the verdict. A test with neither is a
measurement. A test with checks but no
thresholds is a measurement with good
notes. A test with thresholds is an
opinion, enforced.
