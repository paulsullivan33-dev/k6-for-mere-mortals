# Writing criteria for this guide

Every "for Mere Mortals" guide is written to the same nine-point
standard, so a reader who trusts one can trust the rest. Here it
is, with the verification notes for this particular guide below.

1. **Fix it first.** Reader outcomes lead, not action items: each
   chapter opens by naming the outcome it delivers, shows a check
   the reader can run to confirm they got it, and a reasonable
   reader finishes able to state what was done, what it means,
   and what to try next.
2. **Plain language.** Short sentences, everyday vocabulary,
   technical terms defined on first use. No slang, and no
   idioms that only make sense in one country — the reader may
   be translating as they go.
3. **No dead ends.** A guide never tells the reader to do
   something it cannot show them how to verify. Every claim a
   reader relies on — an install, a command, an output — is
   something this guide demonstrates or clearly labels
   documented-only below.
4. **Live-verified where it matters.** Procedures are run for
   real in the guide's lab wherever the build machine allows it,
   and the transcripts kept in the repository are the evidence.
   What could not be run is listed honestly below, never
   presented as if it had been.
5. **General audiences.** Nothing in this guide — examples,
   fixtures, names, addresses — is modelled on any particular
   reader or author's real life, network, or organisations.
   The lab's traffic is the lab talking to itself.
6. **Standalone.** A reader needs this guide, its lab, and
   nothing else. Where another guide would genuinely help, it
   is pointed to once, by name, and the chapter still completes
   without it.
7. **Honest about limits.** Chapter 13 names what the tool
   cannot do: outgrow the machine generating the load, mistake
   a closed crowd for an open arrival stream, speak protocols
   beyond its fence without extensions, or let a small run's
   percentiles carry a capacity decision — and it states the
   load a load test places on everything between the generator
   and the target, not just on the target.
8. **The ethics rule is in the text, early.** Chapter 1 and the
   README state the rule plainly — *only systems you own, or
   systems you have explicit permission to test* — before any
   procedure depends on it, and later chapters point back to it
   where the tooling would make crossing the line easy. In this
   lab the point is structural: every script aims at a fixture
   server on 127.0.0.1 that the reader starts and controls, and
   growing the crowd is a one-number change the text treats
   with corresponding care.
9. **Builds clean.** The site builds with MkDocs in strict mode
   with no warnings, and a fresh reader following the chapters
   in order reaches the stated outcome of each.

## Verification notes for this guide

The build machine is a 2-CPU, 7.7 GB Ubuntu 24.04 sandbox.
k6 **v2.3.0** was taken from the project's official GitHub
release (grafana/k6), its tarball verified against the
release's published checksums, and exercised against a
fixture server written for this guide
(`k6-lab/server/fixture_server.py`, Python 3.12.3 standard
library), running on loopback only. All transcripts live in
`k6-lab/transcripts/`; the scripts are `k6-lab/scripts/`.

Run for real, with transcripts as evidence:

- Install and version: the release tarball's SHA-256 checked
  against the project's checksums file, and `k6 version`
  (t00).
- The fixture server's behaviour probed with curl before any
  load was applied: `/fast` answering at once, `/slow` taking
  0.401 s, `/flaky` answering 200 200 200 500 200, and the
  server's own request counts at `/stats` (t01).
- A first test — 3 VUs, 10 s, 21 iterations, 42 requests —
  with one check built to be impossible (under 100 ms from a
  400 ms endpoint): it failed 21 of 21 times, 63 of 84 checks
  passed overall, and the run still exited 0 (t02).
- A staged run (0→5→0 VUs over 24 s): the crowd's climb and
  drain visible in the progress lines, 170 iterations, all
  checks passing, `vus` min 1 / max 5 (t03).
- Thresholds in both directions: a set drawn around healthy
  behaviour passing with exit code 0, its THRESHOLDS section
  ticking each line (t04); and a set drawn to be unreachable
  against `/flaky` and `/slow` — both lines crossed
  (p(95) 442.21 ms against a 100 ms line; failure rate
  11.90% against a 5% line), the "thresholds … have been
  crossed" error, and exit code **99** (t05).
- Two scenarios in one run (constant-vus and ramping-vus
  executors), groups inside both, and two custom metrics
  (a Trend, a Counter) reported in the summary's CUSTOM
  section (t06); the same run with `--summary-mode=full`,
  showing the per-scenario and per-group sections and the
  detailed timing sub-metrics (t07). The fixture's `/stats`
  totals after the t06 run reconcile with every run before
  it — `/flaky` 40 = 5 probes + 21 + 14, `/slow` 78 — so
  k6's counts and the server's agree from both sides.
- Results saved and read back: `--out json` producing 582
  lines — 16 Metric declarations and 566 Point records —
  dissected with jq (counting points, listing metrics with
  their types, lifting out single points with their full tag
  sets) (t08); and `--summary-export` producing the summary
  as JSON, including the per-metric `thresholds` map (t10).
- `k6 inspect` printing the resolved options of the
  scenarios script before any run (t09).

Documented only — described from the project's documentation,
not run, and the text does not claim otherwise:

- Grafana Cloud k6 and every hosted route, including live
  outputs to dashboards and databases; the guide's outputs
  are the terminal, the JSON file and the summary export.
- Distributed execution — spreading one test across several
  generators — and running on any target beyond the local
  fixture.
- The arrival-rate executors (`constant-arrival-rate`,
  `ramping-arrival-rate`): the open model is explained and
  contrasted with the closed one, but the lab ran only the
  closed executors.
- The browser module (driving a real Chromium), WebSocket
  and gRPC testing, and xk6 extensions; chapter 13 places
  them beyond the fence the lab worked inside.
- `setup()`/`teardown()` and data returned from `setup()`:
  named in chapter 12 as a pattern; the fixture needed no
  arranging, so they were not exercised.
- POST bodies, headers and environment-variable secrets in
  chapter 12's chaining recipe: shown as patterns composed
  from the verified GET mechanics — the fixture speaks GET
  only.
- `handleSummary()` for shaping the human-readable summary,
  and `k6 archive`/`k6 cloud` as commands.
- The comparison tools in chapter 12's neighbours chapter
  are characterised, not benchmarked.

Fixtures are this guide's own and deliberately generic: a
small fixture server with three planted
behaviours (fast, slow, failing on a schedule) and five small
scripts that aim only at it. The loads are deliberately
tiny — at most 5 virtual users, at most 24 seconds — because
the build machine's processors are shared, and the text
says so where a reader might otherwise scale a lab number
into a capacity claim. No example is modelled on any real
person, network, service or organisation, and nothing was
load-tested that the lab did not itself originate and run.
