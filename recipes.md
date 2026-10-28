# Recipes

Small, named ways to use what the
preceding chapters built. Each is a
composition of machinery already run in
the lab, not a new feature.

## The two-minute smoke test

Before any real run of a script:
`--vus 1 --duration 10s` (chapter 7).
One user, a few seconds, thresholds and
all. A smoke test that fails has saved
you a full run's worth of confident
nonsense; a smoke test that passes has
proven the script runs, the target is
the target you think, and the checks
can see. It is also the shape to reach
for whenever a script changes: one user
first, the crowd after the single
stranger has walked the whole path
without falling over.

## Name the question: the standard shapes

Load tests have folk names, and the
names are questions:

- **Smoke** — one or two users, briefly.
  *Does it work at all under any crowd?*
- **Average-load** — the expected crowd,
  at the expected pace, sustained. *Is
  an ordinary busy hour comfortable?*
  This is most tests' real job.
- **Stress** — a ramp past the expected,
  looking for where it bends. *Where is
  the cliff, and what does the view from
  it look like?*
- **Spike** — a sudden vertical arrival:
  a stage whose first target is the full
  crowd, from zero, in seconds. *What
  breaks when everyone arrives at once?*
- **Soak** — an ordinary crowd for a
  long time — hours. *What leaks, grows,
  or quietly rots by hour three?*

Each is only chapters 7 and 10 in
costume: stages and executors arranged
to ask it. Naming yours in the script's
header comment — the lab's scripts do —
is what lets a reader next year know
which question the numbers answered.

## Chain requests: use an answer in the next question

Real journeys depend on earlier
answers. The mechanics are chapter 4's
own: read a field out of one response
and put it in the next request.

```js
const page = http.get(`${BASE}/fast`);
const endpoint = page.json('endpoint');
const res = http.get(`${BASE}/${endpoint}`);
```

With form posts, JSON bodies
(`http.post(url, JSON.stringify({...}),
{ headers: { 'Content-Type': 'application/json' } })`)
and an `Authorization` header the same
way, this is the whole technique; the
rest is your API's own rules, which is
why this guide points at the APIs guide
in this series for the shapes APIs come
in. Take secrets for such scripts from
the environment — `__ENV.API_TOKEN` —
never from the file; a load test in
version control with a live token in it
is chapter 13's problem wearing a
recipe's clothes.

## Archive the verdict, not just the memory

For any run you may later cite:

```bash
k6 run --summary-export runs/2026-10-28-summary.json script.js
k6 run --out json=runs/2026-10-28-points.json script.js
```

The small file (chapter 9) proves what
the verdict was; the large one lets you
re-ask questions the summary did not.
Date the files, keep them with the
script's version, and a future argument
about "did it get slower?" becomes a
diff instead of a memoir.

## Prepare and clean up around the crowd

When a test needs the world arranged —
seed data created, a queue emptied — a
script may export `setup()` and
`teardown()`: run once each, outside
the crowd, before the first user and
after the last. `setup()` may return
data that every VU receives as its
function's argument. The lab's fixture
needed no arranging, so these are
described, not run — the honest label is
in `criteria.md` — but the shape is one
paragraph because there is so little to
it, and guessing wrongly about "once,
not per user" is the only real trap.

## Test the test

Two habits from the lab, generalised:

- **Keep a fixture.** A target whose
  behaviour you *know* — a 400 ms
  endpoint, a scheduled failure — turns
  "is the tool lying?" from a dread into
  a ten-second experiment, for k6 and
  for whatever replaces it.
- **Make something fail on purpose**
  before trusting something that passes:
  one impossible check (chapter 4), one
  unreachable threshold (chapter 8).
  Equipment that has never been seen
  failing is not yet known to work.
