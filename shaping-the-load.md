# Shaping the Load

Outcome: you can say, in the `options`
object, exactly what crowd you want —
how many, for how long, arriving how —
and recognise the three shapes every k6
test is built from.

## Shape one: a fixed crowd for a fixed time

```js
export const options = {
  vus: 3,
  duration: '10s',
};
```

The first test's shape. Three virtual
users start together, loop until ten
seconds pass, then stop — politely: a
user caught mid-iteration when the
clock ends is allowed to finish it,
which is the "graceful stop" the run's
header mentions, and why a 10-second
test's last progress line lands at
10.1 s. This shape answers "what does a
steady handful of users feel?" and is
where every test should start life.

## Shape two: a fixed crowd for a fixed count

Swap the clock for a budget:

```js
export const options = {
  vus: 3,
  iterations: 30,
};
```

Thirty iterations *in total*, shared
between the three users, then done.
Useful when the work itself is the unit
— process this batch, walk this list —
and when you want runs of exactly
comparable size. The summary cannot tell
the two shapes apart afterwards except
by which of `duration` or `iterations`
the header names; the experience differs
in what varies: shape one fixes time and
lets the count float, shape two fixes
the count and lets the time float.

## Shape three: a crowd that changes — stages

Real arrivals are not a rectangle. They
climb, they hold, they drain.
**Stages** describe the crowd as a
series of targets:

```js
export const options = {
  stages: [
    { duration: '8s', target: 5 },
    { duration: '8s', target: 5 },
    { duration: '8s', target: 0 },
  ],
};
```

Each stage says: over this long, move
the number of living virtual users to
this target. k6 starts and retires users
smoothly across the stage; a stage whose
target equals the previous one is a
hold. The lab ran exactly this against
`/fast` (transcript
`k6-lab/transcripts/t03-stages.txt`),
and the progress lines show the crowd
breathing — climbing through 3/5 and
4/5 VUs on the way up, and on the way
down:

```text
running (22.0s), 2/5 VUs, 163 complete and 0 interrupted iterations
running (23.0s), 1/5 VUs, 167 complete and 0 interrupted iterations
```

The finished run's totals: 170
iterations in 24 seconds, every check
passed, and in the EXECUTION block the
ramp's fingerprint — `vus: min=1 max=5`,
`vus_max: 5`, against the fixed crowd's
flat `min=3 max=3` in chapter 5.

Stages are the shape that finds things.
A service that is fine at five users and
wrong at fifty announces the crossing
somewhere in a ramp; a stress test is,
structurally, a ramp that does not stop
where politeness would.

## Overriding the shape for one run

Options live in the file, but flags win
for a single run:

```bash
k6 run --vus 1 --duration 5s k6-lab/scripts/first-test.js
```

That is the smoke-run habit: same script,
a crowd of one, a few seconds, just to
prove the script and the target agree
before the real shape runs. Environment
variables and a config file can also
carry options; the resolution order and
the full list are in the documentation.
What matters here is the principle: the
file holds the *intended* test, and a
one-off override does not rewrite it.

## The honest limit of every shape

All three shapes are **closed models**:
the crowd size is the control, and the
rate at which work arrives depends on
how fast the service answers. If the
service slows down, a closed crowd
automatically asks less often — each
user is busy waiting. Real crowds are
often **open**: new arrivals keep coming
at their own rate whether or not earlier
ones finished, which is how queues
explode. k6 has arrival-rate executors
for the open model (chapter 10 names
them; the lab did not run them, and
`criteria.md` says so). Know which model
your question needs before the numbers
start meaning things: "can fifty users
browse happily?" is closed; "can the
service absorb 200 arrivals a minute?"
is open, and answering it with a closed
test understates the pile-up exactly
when it matters.
