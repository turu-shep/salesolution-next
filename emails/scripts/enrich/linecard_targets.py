#!/usr/bin/env python3
"""Build the line-card harvest target set.

Two inputs, both read-only:
  * emails/lists/deduped-v1.csv        -- every seated company with a resolved
                                          domain (S2 measured 70.3% fill)
  * emails/data/raw/serp-selfid-*.json -- the 1,474 distinct dealer domains the
                                          SERP self-identification program found

Deduped by apex domain. Manufacturer / marketplace / social / trade-press hosts
are dropped using the same exclusion sets the SERP classifier used, because a
manufacturer's own site trivially "names" its own brand and would poison the
brand-count distribution.

Writes emails/data/enrichment/_targets-<date>.json. No network.

§5f step 6 re-runs this scoped to `shortlist-v1.csv` instead: same exclusions,
same apex rule, but `--list`, `--no-serp` and `--exclude-done` let it emit only
the domains the first enrichment pass never reached. Called bare it still
reproduces the original target set.
"""
import argparse
import csv
import importlib.util
import json
import os
import re
import sys

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_DIR = os.path.join(ROOT, "data", "enrichment")

_spec = importlib.util.spec_from_file_location(
    "ss", os.path.join(ROOT, "scripts", "acquire", "serp_selfid.py"))
ss = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ss)
EXCLUDED = ss.EXCLUDED

WWW_RX = re.compile(r"^(?:www|www\d|shop|store|m)\.", re.I)

# Hosts that carry a dealer's PDF but are not the dealer's site. The SERP pass
# classified these as dealer_candidate because the line-card PDF lived there;
# for THIS pass they are useless (and they all 403 or 404 anyway).
CDN_RX = re.compile(
    r"(?:hubspotusercontent|hubspot\.net|cloudfront\.net|amazonaws\.com|"
    r"imimg\.com|squarespace-cdn|wixstatic|googleusercontent|akamaized|"
    r"azureedge|blob\.core\.windows|files\.wordpress|cdn-website|b-cdn\.net|"
    r"netdna-ssl|sharepoint\.com|filesusr\.com|dropbox|drive\.google|"
    r"docs\.google|cachefly|fastly\.net|edgekey)", re.I)
# A hostname label that is a UUID or a bare account number is a file bucket.
UUIDISH_RX = re.compile(r"^(?:[0-9a-f]{8}-[0-9a-f]{4}|[0-9]{5,}|[0-9a-f]{16,})")


def apex(host):
    """Lowercase apex-ish domain. Strips scheme, path, port, and a www/shop prefix."""
    if not host:
        return None
    h = host.strip().lower()
    h = re.sub(r"^[a-z]+://", "", h)
    h = h.split("/")[0].split("?")[0].split("#")[0].split(":")[0]
    h = WWW_RX.sub("", h)
    h = h.strip(".")
    if not h or "." not in h or " " in h:
        return None
    if not re.fullmatch(r"[a-z0-9.-]+", h):
        return None
    return h


def load_done(paths):
    """Domains a prior enrichment output already answered for. Never re-fetched.

    Refusals count as done: a 403 was recorded and the domain abandoned, and
    asking the same origin again would be exactly the bypass the policy forbids.
    """
    done = set()
    for p in paths:
        if not os.path.exists(p):
            continue
        with open(p, encoding="utf-8") as f:
            payload = json.load(f)
        for r in payload.get("records", payload if isinstance(payload, list) else []):
            d = (r.get("domain") or "").strip().lower()
            if d:
                done.add(d)
    return done


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="append", default=None,
                    help="CSV with a `domain` column; repeatable. "
                         "Default: lists/deduped-v1.csv")
    ap.add_argument("--no-serp", action="store_true",
                    help="skip the SERP dealer-domain union")
    ap.add_argument("--exclude-done", action="append", default=[],
                    help="prior enrichment JSON whose domains are already "
                         "answered for; repeatable")
    ap.add_argument("--out", default=os.path.join(OUT_DIR, f"_targets-{CAPTURED}.json"))
    args = ap.parse_args()

    lists = args.list or [os.path.join(ROOT, "lists", "deduped-v1.csv")]
    os.makedirs(OUT_DIR, exist_ok=True)
    targets = {}

    # ---- source 1: the deduped seated list(s)
    csv.field_size_limit(10 ** 7)
    from_list = 0
    for path in lists:
        # cwd-relative wins when it resolves; otherwise read it as emails/-relative
        # so `--list lists/shortlist-v1.csv` works from anywhere in the repo.
        if not os.path.exists(path):
            path = os.path.join(ROOT, path)
        with open(path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                d = apex(row.get("domain"))
                if not d:
                    continue
                from_list += 1
                t = targets.setdefault(d, {"domain": d, "origins": [],
                                           "company_display": None, "state": None})
                if "list" not in t["origins"]:
                    t["origins"].append("list")
                t["company_display"] = t["company_display"] or row.get("company_display")
                t["state"] = t["state"] or row.get("state")

    # ---- source 2: SERP dealer domains
    serp_domains = set()
    if not args.no_serp:
        with open(os.path.join(ROOT, "data", "raw",
                               f"serp-selfid-{CAPTURED}.json")) as f:
            serp = json.load(f)
        serp_best = {}
        for r in serp["records"]:
            if r.get("classification") != "dealer_candidate":
                continue
            d = apex(r.get("domain"))
            if not d:
                continue
            serp_domains.add(d)
            prev = serp_best.get(d)
            if prev is None or (r.get("rank_absolute") or 999) < prev[0]:
                serp_best[d] = ((r.get("rank_absolute") or 999), r.get("page_url"))
        for d in serp_domains:
            t = targets.setdefault(d, {"domain": d, "origins": [],
                                       "company_display": None, "state": None})
            if "serp" not in t["origins"]:
                t["origins"].append("serp")
            t["serp_page_url"] = serp_best[d][1]

    excluded = [d for d in targets if d in EXCLUDED]
    cdn = [d for d in targets
           if d not in EXCLUDED
           and (CDN_RX.search(d) or UUIDISH_RX.match(d.split(".")[0]))]
    for d in excluded + cdn:
        del targets[d]

    already = load_done(args.exclude_done)
    covered = [d for d in targets if d in already]
    for d in covered:
        del targets[d]

    rows = sorted(targets.values(), key=lambda r: r["domain"])
    both = sum(1 for r in rows if len(r["origins"]) == 2)
    only_list = sum(1 for r in rows if r["origins"] == ["list"])
    only_serp = sum(1 for r in rows if r["origins"] == ["serp"])

    payload = {
        "built": CAPTURED,
        "inputs": {
            "lists": lists,
            "deduped_v1_rows_with_domain": from_list,
            "serp_dealer_domains": len(serp_domains),
            "exclude_done": args.exclude_done,
        },
        "excluded_known_hosts": len(excluded),
        "excluded_cdn_file_hosts": len(cdn),
        "excluded_already_enriched": len(covered),
        "target_count": len(rows),
        "overlap": {"both": both, "list_only": only_list, "serp_only": only_serp},
        "targets": rows,
    }
    out = args.out
    with open(out, "w") as f:
        json.dump(payload, f, indent=1)

    print(f"list rows with a domain       : {from_list}")
    print(f"dropped (already enriched)    : {len(covered)}")
    print(f"distinct apex from that list  : "
          f"{len({r['domain'] for r in rows if 'list' in r['origins']})}")
    print(f"SERP dealer domains           : {len(serp_domains)}")
    print(f"dropped (manufacturer/etc)    : {len(excluded)}")
    print(f"dropped (CDN / file bucket)   : {len(cdn)}")
    print(f"TARGET SET (distinct apex)    : {len(rows)}")
    print(f"  in both sources             : {both}")
    print(f"  list only                   : {only_list}")
    print(f"  serp only                   : {only_serp}")
    print(f"-> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
