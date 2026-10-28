# The Neighbours

k6 is not the only way to raise a
crowd, and some of its neighbours are
better fits for particular houses. An
honest map — characterised, in this
guide's usual way, not benchmarked:

## Apache JMeter

The elder of the field: open source,
GUI-first, tests assembled as trees of
elements and saved as XML plans. It
speaks many protocols beyond HTTP, has
decades of plugins and institutional
memory, and teams with JMeter plans
already written should keep them —
history is a feature. The trade is
weight and shape: a Java application,
a plan format nobody reviews in a diff
for pleasure, and per-user costs that
bite sooner than k6's. k6's counter-offer
is the thesis of this guide: the test as
a small program, in a real language, in
your repository.

## Gatling

k6's closest rival in spirit: tests as
code (Scala, with Java and Kotlin
fronts), a strong recorder, and reports
that are genuinely good — its HTML
report is the one other tools get
compared to. If your house is a JVM
house, Gatling sits naturally in it.
The shape of the choice is mostly
*which language your team wants its
tests in*, and whether the open-core
edges of its commercial sibling matter
to you.

## Locust

The Python entry: users are Python
classes, the crowd is orchestrated from
a web UI it serves itself, and scaling
across machines is a first-class story.
For a Python team, writing the crowd in
the language of the service has a real
pull, and its live UI is the friendliest
of the three. Its per-user cost is the
known trade — Python users are heavier
than k6's — and its assertions and
verdicts are more hand-rolled than
k6's thresholds.

## The one-liner hitters: hey, wrk, Vegeta, ab

A family of small tools that do one
thing: aim a rate or a count of requests
at one URL. `ab` (ApacheBench) is the
ancestor, installed everywhere and
showing its age; `hey` and `wrk` are
its modern forms; Vegeta is the
scriptable one, with a library as well
as a command. For "how many plain GETs
per second can this page take?" they
are quicker to the answer than any
script. What they cannot do is the
*journey*: log in, chain answers, branch
on content, judge by thresholds. Reach
for them when the question is a single
number about a single URL — and notice
chapter 1's rule applies to them with
exactly the same force.

## Grafana Cloud k6

Not a rival but the same tool's hosted
sibling: Grafana runs your scripts on
their machines, in many places at once,
and keeps the results in dashboards
with history. It answers this guide's
two honest limits — the generator's
ceiling (chapter 13) and results that
evaporate — at the price of an account,
a bill, and your tests naming systems
from the outside in. This guide is
local-only and says so wherever the
cloud would have been the easy answer;
the scripts you write here are the
scripts it runs, which is the correct
shape for a door left open.

## A monitoring tool, doing a different job

Worth one line because the names get
conflated: Prometheus and Grafana watch
a system *while life happens to it* —
continuously, from the inside. k6
visits, on purpose, for ten minutes,
from the outside. The mature setup has
both: k6 raises the crowd, the
dashboards show what the crowd did to
the insides, and the two readings
together are worth more than either.
The Prometheus and Grafana guide in
this series covers that half.
