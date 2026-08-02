#!/usr/bin/env python3
"""Validate the free e-commerce detector against DataForSEO Technologies.

DFS Technologies is one paid task per domain, so it never runs across the list
-- the build plan's cost rule is explicit. It runs on a stratified sample
(default 50) purely to answer: how often does the free HTML detector agree with
a commercial technology fingerprinter?

Agreement is scored two ways, because they answer different questions:
  * platform agreement  -- did we name the same e-commerce platform?
  * commerce agreement  -- did we both conclude "this site sells online"?

The second is the one that matters. We do not need the platform's name to write
the email; we need to know whether there is a cart.
"""
import argparse
import base64
import json
import os
import random
import sys
import time
import urllib.error
import urllib.request

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
REPO = os.path.abspath(os.path.join(ROOT, ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")
ENDPOINT = ("https://api.dataforseo.com/v3/domain_analytics/technologies/"
            "domain_technologies/live")

# DFS category slugs that mean "this site sells online".
ECOM_GROUPS = {"ecommerce", "carts", "payment_processors", "shopping_carts"}
PLATFORM_ALIASES = {
    "shopify": "shopify", "bigcommerce": "bigcommerce",
    "magento": "magento", "adobe commerce": "magento",
    "woocommerce": "woocommerce", "shopware": "shopware",
    "orocommerce": "orocommerce", "oro commerce": "orocommerce",
    "salesforce commerce cloud": "salesforce_b2b",
    "demandware": "salesforce_b2b",
    "sap commerce cloud": "sap_commerce", "hybris": "sap_commerce",
    "znode": "znode", "netsuite": "netsuite_sca", "suitecommerce": "netsuite_sca",
    "volusion": "volusion", "prestashop": "prestashop", "opencart": "opencart",
    "nopcommerce": "nopcommerce", "ecwid": "ecwid",
    "squarespace commerce": "squarespace_commerce",
    "wix stores": "wix_stores", "unilog": "unilog_cimm2",
    "insite commerce": "insite_optimizely", "optimizely": "insite_optimizely",
}


def load_env():
    env = {}
    for name in (".env.local", ".env"):
        p = os.path.join(REPO, name)
        if not os.path.exists(p):
            continue
        with open(p, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    env.update({k: v for k, v in os.environ.items() if k.startswith(("DFS_", "DATAFORSEO_"))})
    return env


def auth_header(env):
    u = env.get("DATAFORSEO_USERNAME") or env.get("DFS_LOGIN")
    p = env.get("DATAFORSEO_PASSWORD") or env.get("DFS_PASSWORD")
    if not u or not p:
        raise SystemExit("no DataForSEO credentials in .env.local")
    return "Basic " + base64.b64encode(("%s:%s" % (u, p)).encode()).decode()


def call(domain, hdr):
    body = json.dumps([{"target": domain}]).encode()
    req = urllib.request.Request(ENDPOINT, data=body, headers={
        "Authorization": hdr, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode("utf-8", "ignore"))
    except urllib.error.HTTPError as e:
        return {"_error": "HTTP %d" % e.code}
    except Exception as e:
        return {"_error": repr(e)[:160]}


def read_dfs(payload):
    """(platform_or_None, sells_online_bool, all_ecom_tech_names, cost)."""
    if "_error" in payload:
        return None, None, [], 0.0, payload["_error"]
    cost = payload.get("cost") or 0.0
    tasks = payload.get("tasks") or []
    if not tasks or tasks[0].get("status_code") != 20000:
        msg = tasks[0].get("status_message") if tasks else "no task"
        return None, None, [], cost, msg
    result = tasks[0].get("result") or []
    if not result or not result[0]:
        return None, None, [], cost, "no result (domain not in index)"
    techs = (result[0].get("technologies") or {})
    names, sells = [], False
    platform = None
    for group, cats in techs.items():
        if not isinstance(cats, dict):
            continue
        for cat, items in cats.items():
            for item in items or []:
                low = str(item).lower()
                if group.lower() in ECOM_GROUPS or cat.lower() in ECOM_GROUPS:
                    names.append(str(item))
                    sells = True
                if platform is None:
                    for alias, canon in PLATFORM_ALIASES.items():
                        if alias in low:
                            platform = canon
                            break
    if platform and not sells:
        sells = True
    return platform, sells, sorted(set(names)), cost, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ecom", default=os.path.join(ENRICH, "_ecom-%s.json" % CAPTURED))
    ap.add_argument("--out", default=os.path.join(ENRICH, "_dfs-sample-%s.json" % CAPTURED))
    ap.add_argument("--n", type=int, default=50)
    ap.add_argument("--seed", type=int, default=11)
    args = ap.parse_args()
    if args.n > 50:
        raise SystemExit("cost rule: sample is capped at 50 paid tasks")

    recs = [r for r in json.load(open(args.ecom))["records"]
            if r["ecommerce_class"] != "unknown"]
    by_class = {}
    for r in recs:
        by_class.setdefault(r["ecommerce_class"], []).append(r)
    rng = random.Random(args.seed)
    sample, classes = [], sorted(by_class)
    per = max(1, args.n // len(classes))
    for c in classes:
        pool = by_class[c]
        rng.shuffle(pool)
        sample.extend(pool[:per])
    rest = [r for r in recs if r not in sample]
    rng.shuffle(rest)
    sample.extend(rest[:max(0, args.n - len(sample))])
    sample = sample[:args.n]

    hdr = auth_header(load_env())
    out, spend = [], 0.0
    for i, r in enumerate(sample, 1):
        payload = call(r["domain"], hdr)
        plat, sells, names, cost, err = read_dfs(payload)
        spend += cost
        out.append({
            "domain": r["domain"],
            "ours_class": r["ecommerce_class"],
            "ours_platform": r["platform"],
            "ours_sells_online": r["ecommerce_class"] == "ecom_full",
            "dfs_platform": plat,
            "dfs_sells_online": sells,
            "dfs_ecom_tech": names,
            "dfs_error": err,
        })
        print("  %2d/%d %-38s ours=%-16s dfs=%s/%s" % (
            i, len(sample), r["domain"], r["ecommerce_class"], plat, sells),
            flush=True)
        time.sleep(0.4)

    scored = [r for r in out if r["dfs_error"] is None]
    comm_agree = sum(1 for r in scored
                     if bool(r["dfs_sells_online"]) == bool(r["ours_sells_online"]))
    plat_pairs = [r for r in scored if r["dfs_platform"] or r["ours_platform"]]
    plat_agree = sum(1 for r in plat_pairs if r["dfs_platform"] == r["ours_platform"])
    payload = {
        "stage": "s3-catalog-dfs-validation",
        "captured": CAPTURED,
        "sample_size": len(out),
        "scored": len(scored),
        "cost_usd": round(spend, 4),
        "commerce_agreement": round(comm_agree / len(scored), 4) if scored else None,
        "platform_agreement": round(plat_agree / len(plat_pairs), 4) if plat_pairs else None,
        "records": out,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1)
    print(json.dumps({k: v for k, v in payload.items() if k != "records"}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
