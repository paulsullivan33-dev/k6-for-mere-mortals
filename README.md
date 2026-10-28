# k6 for Mere Mortals

Your service works — for you, alone,
clicking one button at a time. **k6**
asks the next question: what happens
when a crowd arrives? It is a
**load-testing tool**: you write a small
**JavaScript** script describing what a
visitor does, and k6 runs it as many
**virtual users** at once, for as long
as you say, measuring every request —
how long it took, whether it failed,
what the whole crowd cost. At the end
you get numbers with a shape: averages,
percentiles, failure rates. And if you
drew **thresholds** — pass/fail lines
over those numbers — you get a verdict
with an exit code a machine can read.

This guide explains how a test is put
together, how to run your first one
against a practice server on your own
machine, how to read the summary line by
line, how checks observe and thresholds
judge, how the crowd is shaped and split
into scenarios, and how to keep a run's
evidence in files you can take apart
later. The limits are stated plainly,
including the one that defines the tool:
a load test aimed without permission is
not a test, it is an attack with better
stationery.

The rule that governs everything here is
stated in chapter 1 and returned to in
chapter 13: **load-test only systems you
own, or systems you have explicit
permission to test.** The lab obeyed it
strictly. Every request in this guide
was sent by the lab to a server the lab
itself wrote, on the same machine, at an
address that never leaves that machine.

The lab behind this guide ran the real
thing: **k6 v2.3.0**, the official
release binary, checksum-verified,
against a small **fixture server** —
written for the guide, with a fast
endpoint, an endpoint that always takes
0.4 seconds, and one that fails every
fourth request on schedule, so every
reading k6 produced could be checked
against behaviour known in advance.
Against it the lab ran a first test
whose one impossible check failed 21
times while the run still exited 0,
ramped a crowd up and down through
stages, passed a set of thresholds and
then failed a set on purpose — exit code
99, as promised — split a run into two
scenarios with groups and custom metrics
inside, cross-checked k6's counts
against the server's own bookkeeping,
and saved a run as 566 individual data
points in a JSON file and read them
back with jq.

What the lab could not do, it did not
fake. Its loads were deliberately tiny —
a shared two-processor machine teaches
the same lessons at five users as at
five hundred, and chapter 13 is honest
about where one machine's ceiling is.
Running the crowd from Grafana's cloud,
spreading a test across several
generators, driving a real browser, and
the arrival-rate executors are taught
from the documentation and labelled as
such wherever they appear.
`criteria.md` keeps the full ledger of
what was run and what was only read.

## What this guide covers

- [**What k6 is**](what-k6-is.md) —
  the mental model: a rehearsal crowd
  of virtual users, and the permission
  rule that is part of the tool
- [**The moving parts**](the-moving-parts.md) —
  the binary, the script's skeleton,
  metrics and their four types, and the
  two judges: checks and thresholds
- [**Installing k6**](installing-k6.md) —
  one binary from the project's
  releases, verified against its
  published checksum
- [**Your first test**](your-first-test.md) —
  the fixture server, a three-user
  script, and a run that "passes" with
  a quarter of its checks failed
- [**Reading the summary**](reading-the-summary.md) —
  every line of the end-of-test report:
  percentiles, populations, and why
  the average lies politely
- [**Checks and groups**](checks-and-groups.md) —
  assertions that say what you mean,
  and journeys reported step by step
- [**Shaping the load**](shaping-the-load.md) —
  fixed crowds, fixed counts, and
  stages that ramp; closed models and
  open ones
- [**Thresholds**](thresholds.md) —
  pass/fail lines over the numbers, a
  run that passes them, one that fails
  on purpose, and exit code 99
- [**Metrics and outputs**](metrics-and-outputs.md) —
  measurements of your own, tags that
  slice, and saving every data point
  to a file
- [**Scenarios**](scenarios.md) —
  several workloads in one run, each
  with its own crowd and function
- [**Recipes**](recipes.md) — the
  smoke test, the standard shapes
  named, chaining answers into
  questions, archiving the verdict
- [**The neighbours**](the-neighbours.md) —
  JMeter, Gatling, Locust, the one-line
  hitters, and Grafana Cloud k6: what
  each does instead
- [**Limits**](limits.md) — the
  generator's own ceiling, closed
  crowds in an open world, the protocol
  fence, and the load a load test is
- [**Troubleshooting**](troubleshooting.md) —
  the passing run with failed checks,
  exit 99, the 100% failure that is a
  stopped server, and the percentile
  that barely moves
- [**Glossary**](glossary.md) — the
  terms, collected in one place

## What it doesn't cover

Testing systems you do not own or have
no permission to test — that is not a
harder chapter of this book, it is a
different and uglier activity, and
chapter 13 explains the line. Driving a
real browser for page-experience
metrics, generating a crowd from many
machines or from Grafana's cloud, and
testing protocols beyond HTTP's family
are pointed at, not taught; this guide
stays with one person, one machine, and
their own services, where the tool does
its honest work.

## How to use this guide

Read chapter 1 for the model and the
rule, and chapter 2 before writing
anything — knowing which judge is which
turns later confusion into a named
problem. Chapter 4 takes your first run
in the same sitting as the install,
against the fixture server; do not aim
a script at a real service until the
practice runs feel boring. Chapter 8 is
the one that turns measurements into
opinions: draw your first threshold
there. The lab's transcripts live in
`k6-lab/transcripts/`; its fixture
server is `k6-lab/server/` and its
scripts `k6-lab/scripts/`; its notes are
`examples/lab-notes.txt`.

---

## Part of the series

This guide is one of the [For Mere Mortals](https://paulsullivan33-dev.github.io/mere-mortals/) guides: plain-language guides to the tools programmers and makers use.

Related guides:

- [APIs for Mere Mortals](https://paulsullivan33-dev.github.io/api-for-mere-mortals/)
- [Prometheus and Grafana for Mere Mortals](https://paulsullivan33-dev.github.io/prometheus-and-grafana-for-mere-mortals/)
- [curl for Mere Mortals](https://paulsullivan33-dev.github.io/curl-for-mere-mortals/)

## License

The writing in this guide is licensed under [CC BY 4.0](https://github.com/paulsullivan33-dev/k6-for-mere-mortals/blob/main/LICENSE). Code examples and lab scripts are licensed under the [MIT License](https://github.com/paulsullivan33-dev/k6-for-mere-mortals/blob/main/LICENSE-CODE).
