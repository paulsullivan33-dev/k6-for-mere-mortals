# Metrics and Outputs

Outcome: you can add measurements of
your own to a run, tag the built-in
ones into per-endpoint slices, and save
a run's every data point to a file you
can take apart afterwards — because the
printed summary is one reading of the
evidence, not the evidence itself.

## The four kinds, revisited as tools

Chapter 2 introduced the metric types;
here they are as choices:

- **Counter** — a growing total: bytes,
  orders placed, errors seen by your own
  definition. `new Counter('name')`,
  `.add(1)` per event.
- **Gauge** — a level at a moment: queue
  depth, cart size. `.add(value)` keeps
  the latest, and the summary reports
  last with min and max.
- **Rate** — a share: how often a thing
  was true. `.add(true)` or `.add(false)`
  per observation; the summary gives the
  percentage.
- **Trend** — a distribution of numbers:
  a duration the built-ins do not time
  for you, a response's size. `.add(ms)`;
  the summary gives the spread and
  percentiles, ready for thresholds.

If none of the four fits, the measurement
is probably two of them, or a check
wearing a costume.

## Custom metrics, run for real

The lab's `scenarios.js` declares two:

```js
import { Trend, Counter } from 'k6/metrics';

const slowTrend = new Trend('lab_slow_duration');
const flakyRequests = new Counter('lab_flaky_requests');
```

— a Trend fed the slow step's duration
on every visit, and a Counter ticked
once per visit to `/flaky`. In the
summary they get their own family
(transcript
`k6-lab/transcripts/t06-scenarios.txt`):

```text
    CUSTOM
    lab_flaky_requests.............: 14     1.118642/s
    lab_slow_duration..............: avg=400.953811 min=400.669932 med=400.912331 max=401.583092 p(90)=401.080183 p(95)=401.275043
```

Two things to notice. The Trend's values
are in milliseconds at full precision —
your metric, your units, and k6 will
not guess them; name and feed
consistently. And the Counter says 14,
which the fixture server can confirm
from its own side: this run sent 14 of
the `/flaky` requests in `/stats`'
running total. A custom metric that can
be cross-checked against the target's
own bookkeeping is worth twice one that
cannot.

Custom metrics take thresholds like any
other: a Trend of your own business
operation — "add to basket took…" — is
usually a better line to defend than a
raw endpoint's timing.

## Tags: one metric, many slices

Every value k6 records carries tags,
and the built-ins arrive pre-tagged:
`url`, `method`, `status`, `scenario`,
`group`, `name`. You met one slice in
chapter 5 — `http_req_duration` narrowed
to `{ expected_response:true }`. In a
script you can add tags of your own to a
request:

```js
http.get(url, { tags: { step: 'checkout' } });
```

Tags are how "the service is slow"
becomes "the checkout step, on POSTs,
returning 200, is slow" without new
metrics: filter the saved points by
tag, or threshold a tagged submetric —
`'http_req_duration{step:checkout}': ['p(95)<500']`.
Chapter 8's warning rides along: a tag
splits a population, and a percentile
over twelve tagged points is a story
about twelve points.

## Saving everything: `--out json`

The summary is printed and gone. For
anything you intend to compare, graph,
or argue from later, save the run:

```bash
k6 run --out json=k6-results.json k6-lab/scripts/first-test.js
```

The file is one JSON object per line,
of two kinds (transcript
`k6-lab/transcripts/t08-json-output.txt`).
**Metric** lines declare a metric and
its type; **Point** lines are single
measurements:

```text
{"type":"Metric","data":{"name":"http_reqs","type":"counter","contains":"default","thresholds":[],"submetrics":null},"metric":"http_reqs"}
{"metric":"http_req_duration","type":"Point","data":{"time":"2026-10-28T12:11:05.901713575Z","value":13.559269,"tags":{"expected_response":"true","group":"","method":"GET","name":"http://127.0.0.1:18090/fast","proto":"HTTP/1.1","scenario":"default","status":"200","url":"http://127.0.0.1:18090/fast"}}}
```

A ten-second, three-user run produced
582 lines: 16 metric declarations and
566 points. Each point is self-contained
— metric, timestamp, value (milliseconds
for durations), and the full tag set —
so ordinary tools can take it apart. The
transcript reads it back with `jq`:
counting points, listing the sixteen
metrics with their types (the four kinds
of chapter 2, all present), and lifting
out three `http_req_duration` points to
show a point's whole anatomy. Note where
a Metric line keeps its name — under
`data`, not beside `type`; the file's
shape is regular, but it repays thirty
seconds of looking before querying.

Other outputs exist for other readers:
`--out csv` for spreadsheets, and live
outputs to databases and dashboards —
including Grafana, via the hosted and
self-hosted routes — which this guide
describes but does not run
(`criteria.md` keeps the ledger).

## Saving just the verdict: summary export

```bash
k6 run --summary-export summary.json k6-lab/scripts/thresholds-pass.js
```

leaves the end-of-test summary as JSON:
each metric's aggregates, and a
`thresholds` map per metric recording,
per threshold, whether it was crossed —
`false` is a pass (transcript
`k6-lab/transcripts/t10-summary-export.txt`):

```text
$ jq ".metrics.http_req_duration" summary.json
{
  "min": 0.220711,
  "med": 222.21087450000002,
  "max": 443.831113,
  "p(90)": 442.5152176,
  "p(95)": 442.90136090000004,
  "avg": 221.62008466666663,
  "thresholds": {
    "p(95)<1000": false
  }
}
```

This is the file a CI system archives:
small, complete, and sufficient to show
next month exactly what this month's
"fast enough" consisted of. For shaping
the *human* summary — your own layout,
your own files — a script can export a
`handleSummary(data)` function and
receive the same structure; that is a
documented pattern the lab did not need,
and chapter 12 points at it.
