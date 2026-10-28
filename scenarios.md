# Scenarios

Outcome: you can run several workloads
in one test — a steady background crowd
and a ramping foreground one, each
running its own function — and read the
summary per workload instead of blended.

## Why one crowd is sometimes not enough

Every test so far had one `options`
shape and one function: one crowd doing
one thing. Real systems serve mixed
work — many readers, a few buyers, the
occasional administrator — and the
mixture is often the point: the buyers
get slow *because* the readers are
there. Blending both jobs into one
function makes one crowd doing a
stew; **scenarios** keep the jobs
separate inside a single run.

A scenario is a named block in
`options`:

```js
export const options = {
  scenarios: {
    browsing: {
      executor: 'constant-vus',
      vus: 2,
      duration: '12s',
      exec: 'browsing',
    },
    checkout: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '6s', target: 3 },
        { duration: '6s', target: 0 },
      ],
      exec: 'checkout',
    },
  },
};
```

Each scenario names an **executor** —
the engine that decides when its
virtual users run — its own crowd
shape, and, via `exec`, the exported
function its users run. (No `exec`
means the default function; scenarios
are also how the plain `vus`/`duration`
of earlier chapters is implemented
under the hood, as one anonymous
scenario.)

The lab's two (script
`k6-lab/scripts/scenarios.js`, run in
transcript `k6-lab/transcripts/t06-scenarios.txt`):

- **browsing** — two users, steady for
  twelve seconds, reading the front
  page and the fast endpoint, gathered
  under a group (chapter 6).
- **checkout** — a crowd ramping from
  none to three and back over the same
  twelve seconds, walking the slow step
  and the unreliable step, feeding the
  custom metrics of chapter 9.

Both run concurrently, against the same
fixture, and the summary keeps their
evidence separable: values carry the
`scenario` tag, and the full summary
(`--summary-mode=full`, transcript t07)
prints a **SCENARIO** section for each,
with its own checks, HTTP numbers and
groups — browsing's clean sheet next to
checkout's flaky-step failures, instead
of one averaged shrug.

## The executor zoo, briefly

Executors are the shapes of chapter 7,
generalised:

| Executor | Shape |
|---|---|
| `constant-vus` | A fixed crowd for a fixed time |
| `ramping-vus` | A crowd moved through stages |
| `per-vu-iterations` | Each user runs a fixed count of iterations |
| `shared-iterations` | A fixed count shared across the crowd |
| `constant-arrival-rate` | Work *arrives* at a fixed rate; users are created as needed |
| `ramping-arrival-rate` | The arrival rate itself ramps |

The first four are the **closed** model:
the crowd is the control. The last two
are the **open** model of chapter 7: the
*arrival rate* is the control, and k6
spawns users to keep up — up to limits
you set, and chapter 13 explains why the
distinction can flip a conclusion. The
lab ran the two closed executors in the
table's first rows; the arrival-rate
pair is documented only here, honestly
labelled, and the natural next step for
a reader whose question is "can it
absorb N arrivals a minute?"

Scenarios can also be staggered with
`startTime`, given their own environment
variables and tags, and run at different
times of the same test — the machinery
of a small drama, if the system under
test deserves one.

## What scenarios do not do

They do not coordinate. Browsing users
cannot hand a session to checkout users;
each scenario's users are strangers to
the others, as all VUs are. They do not
share the *target's* state safely by
magic: two scenarios mutating the same
fixture data will interfere in the
target exactly as real crowds do, which
is sometimes the test and sometimes a
bug in it. And they do not multiply your
generator: both crowds are drawn from
the same machine's strength, a sentence
chapter 13 expands into a warning.
