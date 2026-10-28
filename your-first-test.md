# Your First Test

Outcome: a small server running on your
own machine, a short script that sends
three virtual users to visit it, and a
full run whose summary you can point at
and say *that line came from that
request*. The next chapter teaches you
to read the whole summary; this one gets
it to exist.

## The fixture server

A load test needs a target, and this
guide's target is a **fixture**: a tiny
HTTP server written for the lab, small
enough to read in one sitting, with
behaviour the chapters can rely on. It
lives at `k6-lab/server/fixture_server.py`
and answers on `127.0.0.1`, port 18090 —
an address that never leaves your
machine. Four endpoints:

| Endpoint | Behaviour |
|---|---|
| `/fast` | Answers at once, a small JSON body naming itself |
| `/slow` | Waits 0.4 seconds, then answers the same way |
| `/flaky` | Fails on a schedule: every fourth request gets a 500 |
| `/stats` | A JSON count of the requests each endpoint has served |

Start it in its own terminal and leave
it running for the whole guide:

```bash
python3 k6-lab/server/fixture_server.py
```

Check: ask it things with curl
(transcript `k6-lab/transcripts/t01-fixture-server.txt`):

```text
$ curl -s http://127.0.0.1:18090/fast
{"endpoint": "fast", "ok": true}

$ curl -s -w "  (took %{time_total}s)" http://127.0.0.1:18090/slow
{"endpoint": "slow", "ok": true}  (took 0.401140s)
```

And the flaky endpoint, five times:

```text
200 200 200 500 200
```

Three successes, a failure on the
fourth request as promised, then success
again. `/stats` at that moment showed
`/flaky` at 5: the server keeps its own
count, which later chapters use to check
k6's arithmetic from the other side.

## The first script

`k6-lab/scripts/first-test.js` (printed
in full in chapter 2) declares three
virtual users for ten seconds. Each user,
on each trip around the loop:

1. GETs `/fast` and checks two things:
   the status is 200, and the JSON body
   names the endpoint.
2. GETs `/slow` and checks two things:
   the status is 200, and the answer
   arrived in under 100 ms.
3. Sleeps one second — think time.

The second check on `/slow` cannot pass.
The endpoint waits 400 ms before it even
begins to answer, so a sub-100 ms reply
is impossible, every time, for every
user. That is deliberate: a first test
in which nothing fails teaches you the
shape of a summary but not how failure
looks inside one.

Run it:

```bash
k6 run k6-lab/scripts/first-test.js
```

While it runs, k6 redraws a progress
line once a second: elapsed time, how
many of the three VUs are up, how many
iterations have completed. Ten seconds
is short enough to watch whole.

## What came back

The end of the lab's run (transcript
`k6-lab/transcripts/t02-first-test.txt`):

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

Read it against the script. Twenty-one
iterations ran (you will find
`iterations: 21` further down), each
performing four checks: 84 checks in
all. Every check passed except the
impossible one, which failed all 21
times. The arithmetic agrees with the
server, too: 42 requests left this
machine (21 iterations × 2), and the
fixture's `/stats` count climbs by
exactly that.

And then the surprise this chapter
exists to deliver:

```text
exit code: 0
```

**The run succeeded.** A quarter of its
checks failed, and k6 still reports
success and exits 0 — because checks, by
themselves, are observations, not
verdicts (chapter 2). If you want that
failing check to fail the *run*, you
need a threshold, and chapter 8 will
give the slow endpoint one it cannot
meet and watch the exit code change to
99.

Check: run the script again. The counts
will be the same or off by one — a VU
caught mid-iteration when the clock runs
out is the only wobble — and the slow
check will fail every time. Predictable
failure is the fixture doing its job.
