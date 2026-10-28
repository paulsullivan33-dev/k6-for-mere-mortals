#!/usr/bin/env python3
"""A small fixture HTTP server for the k6 guide's lab.

It exists so that every load test in the guide runs against a
target the reader owns, on the reader's own machine, at an
address that never leaves that machine (127.0.0.1, port 18090).

Endpoints, each with behaviour the guide can rely on:

  /       a small text page naming the endpoints
  /fast   answers at once with a JSON body naming itself
  /slow   waits 0.4 seconds, then answers like /fast
  /flaky  fails on a schedule: every fourth request gets a
          500, the rest get a 200
  /stats  a JSON count of the requests each endpoint has
          served, so a reader can check k6's own count of a
          run against the server's

Anything else gets a 404. Standard library only; run it with

  python3 fixture_server.py

and stop it with Ctrl-C.
"""

import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = 18090
SLOW_DELAY = 0.4
FLAKY_EVERY = 4  # every fourth request to /flaky fails

_lock = threading.Lock()
_counts = {"/": 0, "/fast": 0, "/slow": 0, "/flaky": 0, "/stats": 0}
_flaky_seen = 0


def bump(path):
    with _lock:
        _counts[path] = _counts.get(path, 0) + 1


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send(self, code, body, content_type):
        data = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _json(self, code, obj):
        self._send(code, json.dumps(obj), "application/json")

    def do_GET(self):
        global _flaky_seen
        if self.path == "/":
            bump("/")
            self._send(
                200,
                "fixture server: /fast /slow /flaky /stats\n",
                "text/plain",
            )
        elif self.path == "/fast":
            bump("/fast")
            self._json(200, {"endpoint": "fast", "ok": True})
        elif self.path == "/slow":
            bump("/slow")
            time.sleep(SLOW_DELAY)
            self._json(200, {"endpoint": "slow", "ok": True})
        elif self.path == "/flaky":
            bump("/flaky")
            with _lock:
                _flaky_seen += 1
                n = _flaky_seen
            if n % FLAKY_EVERY == 0:
                self._json(500, {"endpoint": "flaky", "ok": False,
                                 "request": n})
            else:
                self._json(200, {"endpoint": "flaky", "ok": True,
                                 "request": n})
        elif self.path == "/stats":
            bump("/stats")
            with _lock:
                snapshot = dict(_counts)
            self._json(200, snapshot)
        else:
            self._json(404, {"error": "no such endpoint",
                             "path": self.path})

    def log_message(self, *args):
        pass  # keep the terminal quiet; /stats is the log


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"fixture server listening on http://{HOST}:{PORT}",
          flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
