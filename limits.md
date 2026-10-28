# Limits

What k6 cannot do, and what it must not
be asked to do — the chapter the rest of
the guide has been promising.

## The generator is a machine too

Every number in every transcript here
was produced by a crowd raised on the
same small computer that ran the target:
two processors, shared with everything
else. At three users and ten seconds
that is no lie — but it is a *ceiling on
the method*, not a detail. A virtual
user costs CPU and memory on the
generator; a few thousand of them on a
laptop will saturate the laptop, and
from that moment the test measures the
laptop's distress, not the service's.
The signature is recognisable:
durations climb in step across *every*
endpoint at once, including ones that
were fast a minute earlier, while the
generator's own CPU sits pinned.

The honest answers, in order: keep the
crowd within the generator's means and
say so when reporting; move the
generator to a bigger or emptier machine
than the target's neighbour; or spread
the test across several generators —
k6 has machinery for this, and Grafana
Cloud k6 (chapter 12) is its hosted
form. Both distributed routes are
documented only in this guide. What is
not an answer is publishing a big
number whose footnote should read "the
laptop fell over first".

## Closed crowds, open world

Chapter 7's warning, as a limit: the
shapes this guide ran are closed models
— the crowd size is fixed, so when the
service slows, the crowd automatically
asks more slowly. Conclusions drawn from
them are about *users*, not *arrivals*.
A service whose danger is a fixed
arrival rate — a webhook endpoint, a
public API behind an advertiser's
schedule — can be certified by a closed
test and still drown on the day, because
the queue grew while every simulated
user politely waited. Arrival-rate
executors exist for exactly this; a
reader whose question is open-shaped
must use them and not borrow a closed
test's comfort.

## A load test is a load

Chapter 1's rule — *systems you own, or
explicit permission* — has a practical
shadow worth stating here. Even a
*permitted* test loads things that are
not yours alone: the network between,
the cloud neighbours sharing a host, the
third-party API your service calls
while being tested — your crowd's
requests land on them too, multiplied.
Cloud and hosting providers commonly
require notice, or forbid load testing
outright, in their terms; a test against
your own rented server can still breach
the agreement it rents under. And a test
that escapes its intended size — a typo
in a target, a stage that ramps to ten
thousand — is an incident, not a
learning experience. Small rehearsals,
explicit permission, and a kill switch
you have actually located: the whole of
the law.

## What the measurement leaves out

- **Small runs make rough percentiles.**
  A p(95) over 42 requests is decided by
  about two requests. The lab's numbers
  are shaped for teaching — clean
  populations, repeatable delays. A
  capacity decision needs thousands of
  points and the humility to re-run.
- **The summary is the end of the run,
  not the run.** A service that was
  dreadful for twenty seconds in the
  middle and fine at both ends can
  average into a pass. Thresholds are
  evaluated over the whole run too.
  When the middle matters, watch the
  live progress, shorten the stages, or
  use an output (chapter 9) and read
  the timeline, not just the totals.
- **A passed test proves a smaller
  thing than it says.** It says: this
  build, this data volume, this crowd
  shape, this generator, today. Change
  the data (a table with a million rows
  where the test had ten) and the answer
  is a new question.

## The protocol fence

k6's home ground is HTTP — HTTP/1.1,
HTTP/2 — with WebSocket and gRPC modules
in the box. Beyond that fence: raw TCP
conversations, arbitrary binary
protocols, and native database drivers
are extension country — the xk6
ecosystem builds custom binaries with
extra modules, which this guide names
and does not run. There is also a
browser module that drives a real
Chromium and measures page experience;
it is heavy, its metrics are a different
subject (what a *person* waits for, not
what a *request* costs), and it is
documented only here. A guide that
taught it from transcripts would need a
different lab.

## The JavaScript is not Node

Scripts run in an embedded runtime
built for this job. There is no `npm
install` inside a test, no reaching for
the nearest package out of habit;
k6's own modules, libraries written for
k6 and loaded from files or (in the
general k6 world) remote URLs, and the
xk6 extension route are the options.
This is a limit with a silver lining:
a test that runs in the embedded
runtime runs the same everywhere the
binary runs, which is what makes a
transcript from one machine a fair
promise about another.
