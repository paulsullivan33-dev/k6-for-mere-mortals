# Installing k6

k6 is one binary. There is nothing to
configure after it lands: no daemon, no
account, no licence key for the open
source tool. The install is "put the
file somewhere and run it", and the only
part worth care is getting the file from
the project's own releases and checking
it is the file they published.

## The release download

The project publishes builds on its
GitHub releases page (grafana/k6) for
Linux, macOS and Windows, alongside
package-manager routes (apt and dnf
repositories, Homebrew, a Windows
installer) that the official
documentation describes. This guide's
lab used the plain release tarball,
which works the same everywhere and
leaves the system untouched: unpack it
in a folder of yours, and either call
the binary by its path or put the folder
on your `PATH`.

```bash
tar xzf k6-v2.3.0-linux-amd64.tar.gz
cd k6-v2.3.0-linux-amd64
./k6 version
```

Each release also ships a checksums
file. Verifying it takes one command and
is worth the habit:

```bash
grep linux-amd64.tar.gz k6-v2.3.0-checksums.txt | sha256sum -c -
```

Check: the lab's verification and
version printout (transcript
`k6-lab/transcripts/t00-version.txt`)
read:

```text
$ sha256sum -c checksums.txt   (the release checksum file)
k6-v2.3.0-linux-amd64.tar.gz: OK

$ k6 version
k6 v2.3.0 (commit/e088784614, go1.26.8, linux/amd64)
```

The version matters when you read other
people's scripts and advice. k6 is
actively developed: the summary layout
changed in recent versions (this guide's
transcripts show the current one, with
its THRESHOLDS and TOTAL RESULTS
sections), options are occasionally
renamed, and a tutorial written for an
old release may describe output you will
never see. Every transcript in this
guide is from **v2.3.0**; check yours
says the same before treating a mismatch
as a malfunction.

## What a run needs

Nothing else. A script is a text file;
the target is whatever HTTP service the
script names. For this guide's lab you
also need Python 3 — any recent version —
to run the fixture server of chapter 4,
and that is already on most machines:

```bash
python3 --version
```

## Where k6 keeps things

k6 keeps almost nothing. There is no
state folder and no configuration that
matters at this guide's level. Results
exist only where you send them: the
terminal, or a file named with `--out`
(chapter 11). A run you did not save is
a run you cannot re-read — which is
fine while learning, and worth
remembering before a run you intend to
argue from.

One habit is worth forming at install
time: keep your scripts in a folder that
is *yours* — a project folder, ideally
under version control next to the code
they test. A load test is a claim about
a system, written down; it deserves the
same keeping as the code.
