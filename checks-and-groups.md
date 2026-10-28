# Checks and Groups

Outcome: you can write checks that say
what you actually mean, read their
results per check instead of in bulk,
and gather related requests under group
names so the summary reports a journey
in pieces instead of one undifferentiated
pile.

## A check is a named expectation

```js
check(res, {
  'fast: status is 200': (r) => r.status === 200,
  'fast: body names the endpoint': (r) => r.json('endpoint') === 'fast',
});
```

Each entry is a name and a small
function of the response, returning true
or false. k6 runs them all, counts each
one separately, and prints the per-check
marks you saw in chapter 5. Three habits
make checks earn their keep:

- **Name them like sentences you would
  say aloud.** The name is all a failing
  check gives you at 2 a.m.; "status is
  200" beats "check1", and naming the
  endpoint ("slow: status is 200") beats
  both when one run visits several.
- **Check the thing you would act on.**
  Status alone misses the 200 that
  carries an error page; the body's shape
  (`r.json('endpoint')`) is usually one
  more line and catches the whole class.
  Chapter 4's second fast check does
  exactly this.
- **Expect failures you design.** The
  first test's impossible check — under
  100 ms from a 400 ms endpoint — failed
  21 of 21 times. A check that can fail
  and does, in rehearsal, proves the
  reporting path works. A suite of checks
  that has never been seen failing is an
  unverified claim about your own test.

And the standing reminder, because it
surprises everyone once: **failed checks
do not fail the run.** They are counted,
printed, and forgotten by the exit
code. Making failure *matter* is
thresholds' job (chapter 8), and one of
the thresholds available is over checks
themselves — `checks: ['rate>0.95']` —
which is how a mostly-checks test earns
a verdict.

## Groups: naming the steps of a journey

Real tests walk a path: arrive, browse,
add to basket, check out. Reported as
one pile, a failure somewhere along the
path is a percentage; reported by step,
it is an address. `group()` is how a
step gets its name:

```js
group('the slow step', () => {
  const res = http.get(`${BASE}/slow`);
  check(res, { 'slow: status is 200': (r) => r.status === 200 });
});
```

Requests made inside the group carry its
name as a tag, checks inside it are
counted under it, and with the full
summary (below) each group gets its own
block of results. The lab's
`scenarios.js` (transcript
`k6-lab/transcripts/t06-scenarios.txt`)
walks two steps — "the slow step" and
"the unreliable step" — plus a browsing
step, and you can watch the unreliable
step's check do its scheduled damage:

```text
    ✓ slow: status is 200
    ✗ flaky: status is 200
      ↳  71% — ✓ 10 / ✗ 4
```

Fourteen visits to `/flaky`, four of
them the scheduled every-fourth failure,
ten successes: 71%. The group structure
is what lets that line be read as "the
unreliable step failed a quarter of its
visits" instead of dissolving into a
run-wide average.

## The compact summary and the full one

By default the summary is *compact*: one
TOTAL RESULTS block, checks gathered
run-wide, and no per-group sections —
convenient, and lossy. The full summary
keeps everything:

```bash
k6 run --summary-mode=full k6-lab/scripts/scenarios.js
```

Transcript `k6-lab/transcripts/t07-groups-full-summary.txt`
shows what changes: a **SCENARIO**
section per scenario (chapter 10), and
beneath each, a block per **GROUP** with
its own checks and HTTP numbers —
including the timing sub-metrics the
compact summary folds away:
`http_req_waiting` (time from sent to
first byte back — the server thinking),
`http_req_receiving` (the answer
arriving), `http_req_connecting`,
`http_req_blocked`, and their kin. When
a step is slow, that split is the
difference between "the server thought
for 400 ms" and "the network took it".

Two cautions belong with groups. A
group is a label, not a transaction:
requests in it are still independent,
and grouping does not make a journey
atomic. And groups nest in the *script*,
while scenarios (next-but-one chapter)
divide the *crowd*; readers confuse the
two once each, usually while wondering
why a group did not get its own users.
Groups organise what one user does.
Scenarios organise how many users do
what.
