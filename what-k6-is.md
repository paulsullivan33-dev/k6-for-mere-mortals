# What k6 Is

You have built something that answers
requests — a web service, an API, a site.
It works when you test it, alone, clicking
one button at a time. The question k6
exists to answer is different: *what
happens when fifty people arrive at once?
When five hundred do? Which request gets
slow first, and does anything fall over?*

**k6 is a load-testing tool.** It runs a
small program you write — a script — that
pretends to be a crowd. Each member of
the crowd is a **virtual user (VU)**: an
independent loop that sends HTTP requests
to your service, looks at the answers,
and goes around again, for as many
virtual users and as long as your script
says. While the crowd works, k6 measures
everything: how long each request took,
how many failed, how much data moved.
At the end it prints a **summary** of the
run, and — if you drew **thresholds**,
pass/fail lines over the numbers — a
verdict.

The scripts are **JavaScript**, but k6
itself is a single Go binary. The script
is not Node, and there is no browser
involved: a VU is a tight loop of
requests, checks and short sleeps,
running in an embedded JavaScript
runtime. That is what makes the crowd
cheap enough to raise on one machine —
and this guide will be honest, in
chapter 13, about the ceiling that puts
on the crowd's size.

## Why anyone would do this

- **Before the crowd is real.** A launch,
  a sale, a link from a big site: traffic
  arrives whether you rehearsed or not.
  A load test is the rehearsal, on a
  stage you control, where falling over
  costs nothing.
- **To find the slow place.** Services
  rarely degrade evenly. One endpoint
  leans on a database, one report scans a
  whole table. Under load, the weak place
  shows itself in the numbers, named,
  while everything else stays fast.
- **To turn "feels slow" into a line.**
  "The checkout should answer in under
  half a second, 95 times out of 100" is
  a threshold (chapter 8). k6 can enforce
  lines like that on every run, and fail
  a build that crosses them.
- **To learn what your numbers mean.**
  Average, median, the 95th percentile —
  load results are where these stop being
  statistics-class words and start being
  descriptions of somebody's wait.

## The rule, stated before everything else

A load test is, mechanically, a great
many requests arriving at once. Aimed at
a system whose owner did not agree to it,
the same script is a small
denial-of-service attack — there is no
technical difference, only a difference
of permission. So this guide has one
rule, and it is not fine print:

> **Load-test only systems you own, or
> systems you have explicit permission
> to test.**

Your own service on your own machine:
yes. A staging copy your team agreed to
hammer: yes, that agreement is the whole
point of it. A vendor's public API "just
to see", a competitor's site, your
employer's production system at lunch
without asking: no — and several of those
are also breaches of the provider's terms
or of the law, quite apart from this
guide's opinion. Chapter 13 returns to
the edge, including the awkward middle
ground: systems you own that sit on
someone else's cloud, behind someone
else's network.

The lab in this guide stayed well inside
the line. Every test ran against a
**fixture server** the lab wrote for the
purpose — a small program on the same
machine, answering on an address that
never leaves that machine — and the loads
were kept tiny on purpose: a handful of
virtual users, seconds at a time, because
the machine is shared and because a small
run teaches the same lessons as a large
one.

## A familiar shape

A k6 test is one file. It holds three
kinds of thing, and the whole guide is
an unpacking of them:

- **Options** — how big the crowd is and
  how long it works (`vus`, `duration`,
  `stages`, `thresholds`), declared at
  the top of the file.
- **The test function** — what each
  virtual user does on each trip around
  the loop: requests, **checks** on the
  answers, a `sleep` for think time.
- **The summary** — not in the file, but
  produced by every run: the numbers the
  crowd generated, gathered and judged.

A first taste, after installing
(chapter 3) and starting the lab's
fixture server (chapter 4):

```bash
k6 run k6-lab/scripts/first-test.js
```

Three virtual users visit the fixture's
fast and slow endpoints for ten seconds.
The run's end looks like this (transcript
`k6-lab/transcripts/t02-first-test.txt`):

```text
    checks_total.......: 84     8.297222/s
    checks_succeeded...: 75.00% 63 out of 84
    checks_failed......: 25.00% 21 out of 84
```

Eighty-four checks, twenty-one of them
failed — all twenty-one the same check,
against the endpoint that is slow *on
purpose*. Reading that summary properly
is chapter 5; making a failure like it
fail the whole run is chapter 8.

Check: you can run this exact script
yourself once chapters 3 and 4 are done,
and your numbers should rhyme with the
transcript's — same counts, near-enough
timings.

## Who it is for

The developer whose service is about to
meet its first real crowd. The operator
who suspects one endpoint is the weak
place and wants it named. The team that
wants "fast enough" written as a line a
build can fail. The common thread is a
system of your own and a question about
how it behaves when it is busy.

## What it is not

k6 is not a monitoring tool: it makes a
crowd for a few minutes and reports;
watching a running system around the
clock is a different trade (the
Prometheus and Grafana guide in this
series lives there). It is not a
functional test runner: checks can notice
a wrong answer, but k6 is not where a
test suite for correctness belongs. It
is not a security scanner: it finds the
endpoints that get *slow*, not the ones
that are *unsafe*. And it is not a way to
test other people's systems — see the
rule above, which is not a formality.
