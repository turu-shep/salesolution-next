#!/usr/bin/env python3
"""PTDA ceiling check — Step 4 of the `ptda [UNDERWORKED]` handoff.

Three questions, bounded requests, same posture as the acquisition (>=3s
pacing, one worker, every response cached, 403 => stop, no bypass):

1. What does PTDA itself say its distributor-member count is? The About-page
   path is discovered from the homepage nav rather than guessed (run 1 guessed
   two paths; both 404'd — recorded in the output JSON).
2. Does the `Input2` company-name axis return members the ZIP-grid sweep
   missed? Run 1 posted bare `Sheet0$...` field names, which the DNN form
   ignored (validation echo, no grid) — the real names carry the
   `ctl01$TemplateBody$...` prefix, imported from the acquirer as SHEET.
   Positive control first: if the control fails, absent-name results are void.
3. Redirect micro-pass (dealer sites, one GET each): troyindustrial.com
   (settles the one PLAUSIBLE rollup verdict) and autopartintl.com (the
   surviving domain on the seated BDS row). Run 1 settled both: 522 wall and
   NXDOMAIN respectively — cached in the JSON, not re-fetched.

Writes emails/data/raw/_ptda-ceiling-check-<date>.json (v2 merges over run 1)
and caches every page under emails/data/raw/_cache/ptda-ceiling/.
"""
import gzip
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ptda_acquire import Session, parse, item_count, form_fields, SHEET, UA, URL  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CACHE = os.path.join(ROOT, "data", "raw", "_cache", "ptda-ceiling")
DATE = "2026-08-03"
OUT = os.path.join(ROOT, "data", "raw", f"_ptda-ceiling-check-{DATE}.json")
DELAY = 3.0

INPUT2_TESTS = [
    ("control-present", "Transply", "17101"),
    ("absent-candidate", "Wm. F. Hurst", "67202"),
    ("absent-candidate", "Rainbow Precision", "65806"),
]

os.makedirs(CACHE, exist_ok=True)
prior = {}
if os.path.exists(OUT):
    with open(OUT) as f:
        prior = json.load(f)

results = {"date": DATE, "run": 2,
           "run1_membership_404s": [c.get("url") for c in prior.get("membership_claims", [])
                                    if "error" in c],
           "membership_claims": [], "input2_tests": [],
           "redirects": prior.get("redirects", []),
           "origin_requests_run1": prior.get("origin_requests", 0),
           "origin_requests": 0}


def cached_get(url, tag):
    path = os.path.join(CACHE, tag + ".html.gz")
    if os.path.exists(path):
        with gzip.open(path, "rt", encoding="utf-8", errors="ignore") as f:
            return f.read(), True
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    body = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "ignore")
    results["origin_requests"] += 1
    with gzip.open(path, "wt", encoding="utf-8") as f:
        f.write(body)
    time.sleep(DELAY)
    return body, False


def sentences_with_counts(body):
    text = re.sub(r"<[^>]+>", " ", body)
    text = re.sub(r"\s+", " ", text)
    out = []
    for s in re.split(r"(?<=[.!?]) ", text):
        if re.search(r"\d", s) and re.search(r"member|distributor|manufacturer", s, re.I) \
                and len(s) < 400:
            out.append(s.strip()[:300])
    return out


print("── membership statement: discover About pages from the homepage nav ──")
try:
    home, _ = cached_get("https://www.ptda.org/", "home")
    links = {}
    for m in re.finditer(r'href="([^"]+)"[^>]*>([^<]{2,60})<', home, re.I):
        href, label = m.group(1), re.sub(r"\s+", " ", m.group(2)).strip()
        if re.search(r"about|join|membership|who we are", label, re.I) and "ptda.org" not in href.lower():
            links[label] = urllib.parse.urljoin("https://www.ptda.org/", href)
        elif re.search(r"about|join|membership", href, re.I) and href.lower().startswith("http") \
                and "ptda.org" in href.lower():
            links[label or href] = href
    picked = list(dict.fromkeys(links.values()))[:3]
    results["about_links_discovered"] = links
    quotes_home = sentences_with_counts(home)
    if quotes_home:
        results["membership_claims"].append({"url": "https://www.ptda.org/", "quotes": quotes_home[:6]})
    for i, url in enumerate(picked):
        try:
            body, was_cached = cached_get(url, f"about{i}")
            results["membership_claims"].append(
                {"url": url, "cached": was_cached, "quotes": sentences_with_counts(body)[:6]})
            print(f"  {url} → {len(sentences_with_counts(body))} count-bearing sentences")
        except Exception as e:  # noqa: BLE001
            results["membership_claims"].append({"url": url, "error": repr(e)[:160]})
            print(f"  {url} → ERROR {repr(e)[:80]}")
except Exception as e:  # noqa: BLE001
    results["membership_claims"].append({"url": "https://www.ptda.org/", "error": repr(e)[:160]})

print("── Input2 company-name axis (correct SHEET prefix) ──")
sess = Session()
sess.open_form()
time.sleep(DELAY)
for label, name, zip5 in INPUT2_TESTS:
    tag = re.sub(r"[^a-z0-9]+", "-", name.lower())
    path = os.path.join(CACHE, f"input2b-{tag}.html.gz")
    if os.path.exists(path):
        with gzip.open(path, "rt", encoding="utf-8", errors="ignore") as f:
            body = f.read()
    else:
        f = dict(sess.state or {})
        f.pop("__EVENTTARGET", None)
        f.pop("__EVENTARGUMENT", None)
        f.update({
            SHEET + "Input0$TextBox1": zip5,
            SHEET + "Input1$DropDown1": "100",
            SHEET + "Input2$TextBox1": name,
            SHEET + "Input3$DropDown1": "",
            SHEET + "SubmitButton": "Find",
            "IsControlPostBack": "1",
            "__EVENTTARGET": "",
            "__EVENTARGUMENT": "",
        })
        body = sess._post(f)
        sess.state = form_fields(body)
        with gzip.open(path, "wt", encoding="utf-8") as fh:
            fh.write(body)
        time.sleep(DELAY)
    rows = parse(body, zip5, "", f"{URL}?company={name}")
    items, _pages = item_count(body)
    results["input2_tests"].append({
        "label": label, "name": name, "zip": zip5, "rows_parsed": len(rows),
        "item_count": items,
        "companies": sorted({r["company"] for r in rows})[:10],
    })
    print(f"  {label}: '{name}' @ {zip5} → {len(rows)} rows, item_count={items}")

results["origin_requests"] += sess.origin_requests

with open(OUT, "w") as f:
    json.dump(results, f, indent=1)
total = results["origin_requests_run1"] + results["origin_requests"]
print(f"\nwrote {OUT} · origin requests: run1 {results['origin_requests_run1']} + run2 {results['origin_requests']} = {total}")
