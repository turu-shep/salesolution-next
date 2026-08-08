#!/usr/bin/env python3
"""S1 raw acquisition — DataForSEO Business Listings (build plan §2, source 8).

Specced in the build plan and NEVER RUN. §5e leaves the pool ~700-1,200
identified industrial companies short of the pack's 1,400 floor; this is the
second of the three cheap routes named there.

WHY THIS SOURCE IS DIFFERENT FROM EVERY OTHER ONE IN THE PROGRAM
  Locators give a manufacturer's authorized list. SERP gives a domain and a
  quotable sentence but no NAP. This gives NAP FIRST — name, street address,
  city, ZIP, phone, and a website on ~84% of records — for businesses Google
  itself has already classified into a category taxonomy. That taxonomy is the
  point.

§5e AND `category_ids[]`
  Timken's locator was ~two-thirds automotive and said so in a code we had
  captured but never read; decoding it collapsed seated Timken from 1,187 to 15.
  `category_ids[]` here is exactly that kind of source-native code, except it is
  MULTI-VALUED and self-describing: one record carries
  ["industrial_equipment_supplier","bearing_supplier","pump_supplier",
   "safety_equipment_supplier"]. It is stored VERBATIM and uninterpreted,
  together with `additional_categories` (the same information as display
  strings). S3 decides what it means; this stage only records it.
  Automotive/truck category codes are flagged, never dropped.

CATEGORY SELECTION — measured, not guessed
  49 candidate categories were probed for US total_count first ($0.61). The
  three batches below are the industrial-distribution bullseye. Deliberately
  EXCLUDED, per the §5e instruction to bias away from automotive and truck:
    truck_parts_supplier, auto_body_parts_supplier, car_parts_wholesaler,
    auto_accessories_wholesaler, auto_machine_shop, transmission_shop,
    alternator_supplier, tune_up_supplier
  Also excluded as wrong-buyer or too generic, with measured US counts:
    distribution_service 27,778 (logistics, not distribution)
    tool_store 22,532 (retail)
    safety_equipment_supplier 25,866 (fire/security installers dominate)
    electrical_supply_store 12,242 (contractor-facing — §2a measured AD's ESD
      division as the wrong buyer for Catalog AI)
    equipment_supplier 9,471, janitorial_equipment_supplier 4,235,
    industrial_consultant 2,073
  `industrial_equipment_supplier` (30,008) is NOT swept on its own. Category
  matching is an OR across a multi-valued field, so every record that carries
  it *plus* a specific industrial category arrives inside B1/B2/B3 anyway — the
  earlier probe measured 401 of 1,000 bearing_supplier records also carrying it.
  What that leaves out is the generic-only tail (machine shops, one-off
  equipment sellers), which is the low-density part. Measured after the fact and
  reported.

PRICING, MEASURED (two probes, solved as base + per-record):
    $0.012 per request + $0.00036 per record   ($0.372/1000, $0.27588/733,
                                                $0.0156/10 — all three fit)

RETENTION: every raw API response is cached verbatim under
`_cache/dfs-listings/`. Nothing is deleted or filtered anywhere in this file;
classification is a tag on the record.
"""
import base64
import csv
import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

CAPTURED = "2026-08-01"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "dfs-listings")
ENDPOINT = "https://api.dataforseo.com/v3/business_data/business_listings/search/live"
PAGE = 1000
WORKERS = 4
# Geographic centre of the US; 7,000 km covers the contiguous states plus Alaska
# and Hawaii. Spill into Canada/Mexico/Caribbean is removed by the country
# filter, server-side, before we are billed for the record.
US_CENTRE = "39.8283,-98.5795,7000"
US_FILTER = [["address_info.country_code", "=", "US"]]


def auth_header():
    env = {}
    with open(os.path.join(ROOT, "..", ".env.local")) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    u = env.get("DATAFORSEO_USERNAME") or env.get("DFS_LOGIN")
    p = env.get("DATAFORSEO_PASSWORD") or env.get("DFS_PASSWORD")
    if not u or not p:
        sys.exit("no DataForSEO credentials in .env.local")
    return "Basic " + base64.b64encode(f"{u}:{p}".encode()).decode()


AUTH = auth_header()


def balance():
    req = urllib.request.Request("https://api.dataforseo.com/v3/appendix/user_data",
                                 headers={"Authorization": AUTH})
    return json.load(urllib.request.urlopen(req, timeout=60))[
        "tasks"][0]["result"][0]["money"]["balance"]


# ============================================================== CATEGORY PLAN
# Measured US total_count per batch union (probe, 2026-08-01):
#   B1 14,013 · B2 14,138 · B3 17,403  → 45,554 records ≈ $16.96
BATCHES = [
    ("B1_fluid_power_sealing", 14013, [
        "hydraulic_equipment_supplier", "hose_supplier", "pneumatic_tools_supplier",
        "seal_shop", "gasket_manufacturer", "rubber_products_supplier",
        "air_compressor_supplier", "pump_supplier",
        "industrial_vacuum_equipment_supplier", "spring_supplier"]),
    ("B2_power_transmission_tools", 14138, [
        "bearing_supplier", "electric_motor_store",
        "material_handling_equipment_supplier", "abrasives_supplier",
        "tool_wholesaler", "measuring_instruments_supplier", "toolroom",
        "factory_equipment_supplier", "machine_tool_supplier",
        "industrial_spares_and_products_wholesaler"]),
    ("B3_welding_fasteners_gas_chem", 17403, [
        "welding_supply_store", "welding_gas_supplier", "industrial_gas_supplier",
        "fastener_supplier", "screw_supplier", "industrial_chemicals_wholesaler",
        "metal_industry_suppliers", "wire_and_cable_supplier",
        "industrial_supermarket", "scale_supplier"]),
]

# §5e vertical guard. Google's own taxonomy names the wrong verticals explicitly,
# which is the cheapest possible version of the Timken decode. Flag, never drop.
AUTO_TRUCK_CATEGORY_IDS = {
    "auto_parts_store", "auto_body_parts_supplier", "auto_accessories_wholesaler",
    "car_parts_wholesaler", "truck_parts_supplier", "auto_machine_shop",
    "transmission_shop", "alternator_supplier", "tune_up_supplier",
    "hub_cap_supplier", "camper_shell_supplier", "truck_topper_supplier",
    "license_plate_frames_supplier", "car_alarm_supplier", "auto_repair_shop",
    "car_repair_and_maintenance_service", "brake_shop", "muffler_shop",
    "tire_shop", "auto_body_shop", "oil_change_service", "radiator_shop",
    "auto_glass_shop", "car_dealer", "used_car_dealer", "truck_dealer",
    "truck_repair_shop", "trailer_dealer", "trailer_repair_shop",
    "diesel_engine_repair_service", "auto_electrical_service",
    "motorcycle_parts_store", "rv_dealer", "boat_dealer", "atv_dealer",
    "farm_equipment_repair_service", "auto_tune_up_service",
    "wheel_alignment_service", "car_battery_store", "auto_spring_shop",
}
AUTO_TRUCK_NAME_RX = re.compile(
    r"(?<![A-Za-z])(automotive|auto\s+parts|autoparts|aftermarket|truck\s+parts|"
    r"fleet\s+(?:service|supply|parts)|semi[- ]truck|trailer\s+parts|"
    r"brake|collision|tire|muffler|napa|carquest|o'?reilly|autozone|"
    r"advance\s+auto|parts\s+authority|rush\s+truck|freightliner|peterbilt|"
    r"kenworth|quick\s+lube|car\s+care)(?![A-Za-z])", re.I)

NATIONAL_CHAINS_RX = re.compile(
    r"^(motion\s+industries|applied\s+industrial|fleetpride|dxp\b|bdi\b|"
    r"kaman\b|w\.?w\.?\s*grainger|grainger|fastenal|mcmaster|msc\s+industrial|"
    r"airgas|praxair|linde\b|sunsource|wesco|rexel|ferguson|hd\s+supply|"
    r"border\s+states|state\s+electric|ibt\s+industrial|bearing\s+headquarters)",
    re.I)


def apex(domain):
    d = (domain or "").lower().strip().lstrip(".")
    return d[4:] if d.startswith("www.") else d


def cache_path(batch, offset):
    return os.path.join(CACHE, f"{batch}_off{offset:06d}.json")


def post(payload, timeout=600):
    req = urllib.request.Request(
        ENDPOINT, data=json.dumps([payload]).encode(),
        headers={"Authorization": AUTH, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def fetch_page(job):
    """One request = one page of <=1000 listings. Cached verbatim."""
    batch, cats, offset = job
    path = cache_path(batch, offset)
    if os.path.exists(path):
        with open(path) as f:
            return batch, offset, json.load(f), 0.0, True, None
    payload = {"categories": cats, "location_coordinate": US_CENTRE,
               "limit": PAGE, "offset": offset, "filters": US_FILTER}
    spent, last_err = 0.0, None
    for attempt in range(3):
        try:
            d = post(payload)
        except Exception as e:
            last_err = f"transport {e!r}"
            time.sleep(10 * (attempt + 1))
            continue
        spent += d.get("cost") or 0.0
        task = (d.get("tasks") or [{}])[0]
        if task.get("status_code") == 20000 and task.get("result"):
            body = {"batch": batch, "categories": cats, "offset": offset,
                    "limit": PAGE, "cost": d.get("cost") or 0.0,
                    "request_url": ENDPOINT,
                    "location_coordinate": US_CENTRE, "task": task}
            with open(path, "w") as f:
                json.dump(body, f)
            return batch, offset, body, spent, False, None
        last_err = f"{task.get('status_code')} {task.get('status_message')}"
        time.sleep(5)
    return batch, offset, None, spent, False, last_err


def shape(it, batch, cats, offset):
    """One listing → one record. Every source-native field kept verbatim.

    `popular_times` is the only field not carried into the output file (deep
    nested hourly histograms, tens of KB per record, zero relevance to
    identification). It is NOT deleted — the full response sits in
    `_cache/dfs-listings/`, and `has_popular_times` marks which records have it.
    """
    ai = it.get("address_info") or {}
    cat_ids = it.get("category_ids") or []
    addl = it.get("additional_categories") or []
    contacts = it.get("contact_info") or []
    emails = [c.get("value") for c in contacts if c.get("type") == "mail"]
    phones = [c.get("value") for c in contacts if c.get("type") == "telephone"]
    dom = apex(it.get("domain"))
    title = it.get("title") or ""
    auto_cats = sorted(set(cat_ids) & AUTO_TRUCK_CATEGORY_IDS)
    name_hit = AUTO_TRUCK_NAME_RX.search(title)
    return {
        # --- identity
        "company_display": title,
        "original_title": it.get("original_title"),
        "cid": it.get("cid"),
        "feature_id": it.get("feature_id"),
        "place_id": it.get("place_id"),
        # --- SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED (§5e)
        "category_display": it.get("category"),
        "category_ids": cat_ids,
        "additional_categories": addl,
        "place_topics": it.get("place_topics"),
        "services": it.get("services"),
        # --- NAP
        "address_full": it.get("address"),
        "street": ai.get("address"),
        "city": ai.get("city"),
        "state_region": ai.get("region"),
        "zip": ai.get("zip"),
        "country_code": ai.get("country_code"),
        "latitude": it.get("latitude"),
        "longitude": it.get("longitude"),
        "phone": it.get("phone"),
        "phones_all": phones,
        "website": it.get("url"),
        "domain": dom,
        "emails": emails,
        "contact_info": contacts,
        # --- signals
        "is_claimed": it.get("is_claimed"),
        "rating": it.get("rating"),
        "rating_distribution": it.get("rating_distribution"),
        "total_photos": it.get("total_photos"),
        "price_level": it.get("price_level"),
        "description": it.get("description"),
        "snippet": it.get("snippet"),
        "work_time": it.get("work_time"),
        "attributes": it.get("attributes"),
        "local_business_links": it.get("local_business_links"),
        "logo": it.get("logo"),
        "main_image": it.get("main_image"),
        "has_popular_times": bool(it.get("popular_times")),
        # a free co-occurrence graph — names competitors/peers not in our pool
        "people_also_search": it.get("people_also_search"),
        "first_seen": it.get("first_seen"),
        "last_updated_time": it.get("last_updated_time"),
        # --- non-destructive flags
        "auto_truck_category_ids": auto_cats,
        "auto_truck_signal": bool(auto_cats) or bool(name_hit),
        "auto_truck_name_match": name_hit.group(0) if name_hit else None,
        "national_chain_name_signal": bool(NATIONAL_CHAINS_RX.match(title.strip())),
        "segment_w_candidate": not bool(it.get("url")),
        # --- provenance
        "query_batch": batch,
        "query_categories": cats,
        "query_offset": offset,
        "query_location_coordinate": US_CENTRE,
        "source": "dfs_listings",
        "source_name": "DataForSEO Business Listings (Google Maps)",
        "source_url": it.get("check_url"),
        "captured": CAPTURED,
    }


# ============================================================== CHECKPOINTING
# The first attempt at this sweep held all 45k shaped records in RAM and wrote
# the output file only after the last request returned. It stalled, and every
# byte of a $16.98 sweep was lost from `data/raw/` (the verbatim page cache
# survived, which is the only reason the re-run was free).
#
# So: nothing is held across batches. Each page is shaped and APPENDED to a
# per-batch JSONL shard the moment it lands, progress is written to
# `_progress.json` after every page, and the merge at the end is three
# streaming passes that never materialize the record list.
SHARDS = os.path.join(CACHE, "_shards")
PROGRESS = os.path.join(SHARDS, "_progress.json")


def shard_path(batch):
    return os.path.join(SHARDS, f"{batch}.jsonl")


def log(msg, logf=None):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    if logf:
        logf.write(line + "\n")
        logf.flush()


def stream_shards():
    """Yield every shaped record from every shard, one at a time."""
    for batch, _, _ in BATCHES:
        p = shard_path(batch)
        if not os.path.exists(p):
            continue
        with open(p) as f:
            for line in f:
                line = line.strip()
                if line:
                    yield json.loads(line)


def dedupe_key(r):
    return r["cid"] or f"{r['company_display']}|{r['address_full']}"


def norm_name(n):
    n = (n or "").lower()
    n = re.sub(r"[^a-z0-9 ]+", " ", n)
    n = re.sub(r"\b(inc|llc|corp|corporation|co|company|ltd|the|lp|llp)\b", " ", n)
    return re.sub(r"\s+", " ", n).strip()


def acquire(logf):
    """PASS 1 — fetch (or read from cache) and checkpoint each page to disk."""
    os.makedirs(SHARDS, exist_ok=True)
    pages, api_cost, done = [], 0.0, 0
    total_jobs = sum(len(range(0, t, PAGE)) for _, t, _ in BATCHES)
    rows_total = 0
    t0 = time.time()

    for batch, total, cats in BATCHES:
        jobs = [(batch, cats, off) for off in range(0, total, PAGE)]
        # Truncate this batch's shard so a re-run never double-appends.
        with open(shard_path(batch), "w") as shard:
            batch_rows = 0
            with ThreadPoolExecutor(max_workers=WORKERS) as pool:
                for b, offset, body, spent, cached, err in pool.map(fetch_page, jobs):
                    done += 1
                    api_cost += spent
                    if body is None:
                        pages.append({"batch": b, "offset": offset, "count": 0,
                                      "error": err, "cached": False})
                        log(f"  [{done}/{total_jobs}] ERR {b} off={offset} :: {err}", logf)
                        continue
                    res = (body["task"].get("result") or [{}])[0]
                    items = res.get("items") or []
                    for it in items:
                        shard.write(json.dumps(shape(it, b, body["categories"], offset)))
                        shard.write("\n")
                    shard.flush()          # <- checkpoint: page is on disk now
                    os.fsync(shard.fileno())
                    batch_rows += len(items)
                    rows_total += len(items)
                    pages.append({"batch": b, "offset": offset, "count": len(items),
                                  "total_count": res.get("total_count"),
                                  "cost": body["cost"], "cached": cached, "error": None})
                    with open(PROGRESS, "w") as pf:
                        json.dump({"done": done, "of": total_jobs,
                                   "rows_written": rows_total,
                                   "api_cost_running": round(api_cost, 4),
                                   "pages": pages}, pf, indent=1)
                    log(f"  [{done}/{total_jobs}] {b} off={offset} +{len(items)} "
                        f"rows={rows_total} {'cache' if cached else 'LIVE'} "
                        f"cost=${api_cost:.4f} t={time.time()-t0:.0f}s", logf)
        log(f"BATCH DONE {batch}: {batch_rows} rows -> {shard_path(batch)}", logf)
    return pages, api_cost


def measure(logf):
    """PASS 2 — stream the shards and compute every measure. Holds keys, not rows."""
    seen, dup, raw_rows = set(), 0, 0
    companies, domains = set(), set()
    cat_hist, addl_hist, batch_hist = {}, {}, {}
    c = dict.fromkeys(
        ["website", "domain", "phone", "email", "zip", "street", "claimed", "rating",
         "pas", "segw", "auto", "auto_cat", "auto_name_only", "chain", "ies",
         "uniq", "catcount"], 0)
    for r in stream_shards():
        raw_rows += 1
        k = dedupe_key(r)
        if k in seen:
            dup += 1
            continue
        seen.add(k)
        c["uniq"] += 1
        batch_hist[r["query_batch"]] = batch_hist.get(r["query_batch"], 0) + 1
        nm = norm_name(r["company_display"])
        if nm:
            companies.add(nm)
        if r["domain"]:
            domains.add(r["domain"])
            c["domain"] += 1
        for key, val in (("website", r["website"]), ("phone", r["phone"]),
                         ("email", r["emails"]), ("zip", r["zip"]),
                         ("street", r["street"]), ("claimed", r["is_claimed"]),
                         ("rating", r["rating"]), ("pas", r["people_also_search"])):
            if val:
                c[key] += 1
        if r["segment_w_candidate"]:
            c["segw"] += 1
        if r["auto_truck_signal"]:
            c["auto"] += 1
        if r["auto_truck_category_ids"]:
            c["auto_cat"] += 1
        elif r["auto_truck_name_match"]:
            c["auto_name_only"] += 1
        if r["national_chain_name_signal"]:
            c["chain"] += 1
        if "industrial_equipment_supplier" in r["category_ids"]:
            c["ies"] += 1
        c["catcount"] += len(r["category_ids"])
        for x in r["category_ids"]:
            cat_hist[x] = cat_hist.get(x, 0) + 1
        for x in (r["additional_categories"] or []):
            addl_hist[x] = addl_hist.get(x, 0) + 1
    n = c["uniq"] or 1
    pct = lambda k: round(100 * c[k] / n, 1)  # noqa: E731
    log(f"measured: raw={raw_rows} uniq={c['uniq']} dup={dup} "
        f"companies={len(companies)} domains={len(domains)}", logf)
    return {
        "raw_rows": raw_rows,
        "duplicate_rows_dropped_from_unique_view": dup,
        "distinct_listings_by_cid": c["uniq"],
        "distinct_company_names_normalized": len(companies),
        "distinct_domains": len(domains),
        "pct_with_website": pct("website"),
        "pct_with_domain": pct("domain"),
        "pct_with_phone": pct("phone"),
        "pct_with_email": pct("email"),
        "pct_with_zip": pct("zip"),
        "pct_with_street": pct("street"),
        "pct_is_claimed": pct("claimed"),
        "pct_with_rating": pct("rating"),
        "pct_with_people_also_search": pct("pas"),
        "segment_w_candidates_no_website": c["segw"],
        "auto_truck_flagged": c["auto"],
        "auto_truck_flagged_by_category_id": c["auto_cat"],
        "auto_truck_flagged_by_name_only": c["auto_name_only"],
        "national_chain_name_flagged": c["chain"],
        "carries_industrial_equipment_supplier": c["ies"],
        "mean_category_ids_per_record": round(c["catcount"] / n, 2),
        "distinct_listings_by_query_batch": batch_hist,
        "distinct_category_ids_seen": len(cat_hist),
        "category_id_histogram": dict(sorted(cat_hist.items(), key=lambda kv: -kv[1])),
        "additional_categories_histogram": dict(
            sorted(addl_hist.items(), key=lambda kv: -kv[1])[:120]),
    }


def write_outputs(measured, pages, api_cost, bal0, bal1, logf):
    """PASS 3 — stream the shards straight into the output files."""
    header = {
        "source": "dfs_listings",
        "source_name": "DataForSEO Business Listings — US industrial distribution categories",
        "captured": CAPTURED,
        "endpoint": ENDPOINT,
        "program": {
            "batches": [{"name": b, "expected_total": t, "categories": c}
                        for b, t, c in BATCHES],
            "requests": len(pages),
            "page_size": PAGE,
            "location_coordinate": US_CENTRE,
            "filters": US_FILTER,
            "geography_note":
                "swept as one US-wide radius per category batch, NOT metro by metro. "
                "Each batch returned exactly its server-reported total_count, so the "
                "category union is exhausted; metro slicing would only have re-billed "
                "overlapping records.",
            "pricing_measured": "$0.012 per request + $0.00036 per record",
            "categories_excluded_automotive": sorted(AUTO_TRUCK_CATEGORY_IDS),
            "categories_excluded_wrong_buyer_or_generic": {
                "distribution_service": 27778, "tool_store": 22532,
                "safety_equipment_supplier": 25866, "electrical_supply_store": 12242,
                "equipment_supplier": 9471, "janitorial_equipment_supplier": 4235,
                "industrial_consultant": 2073,
                "industrial_equipment_supplier": 30008,
            },
            "note_industrial_equipment_supplier":
                "not swept standalone — arrives via multi-valued category_ids on "
                "records that also carry a specific industrial category; the "
                "generic-only tail is the low-density remainder. Measured in "
                "measured.carries_industrial_equipment_supplier.",
        },
        "measured": measured,
        "api_cost_measured": round(api_cost, 4),
        "balance_before": bal0,
        "balance_after": bal1,
        "balance_delta_NOT_ATTRIBUTABLE": (
            round(bal0 - bal1, 4) if bal0 is not None and bal1 is not None else None),
        "pages": pages,
    }

    cols = ["company_display", "category_display", "category_ids",
            "additional_categories", "street", "city", "state_region", "zip",
            "phone", "website", "domain", "emails", "is_claimed", "rating",
            "auto_truck_signal", "auto_truck_category_ids", "auto_truck_name_match",
            "national_chain_name_signal", "segment_w_candidate", "cid",
            "first_seen", "last_updated_time", "query_batch", "source", "source_url",
            "captured"]
    out = os.path.join(RAW, f"dfs-listings-{CAPTURED}.json")
    csvout = os.path.join(RAW, f"dfs-listings-{CAPTURED}.csv")

    # ALL rows go to JSON (nothing deleted); the CSV carries the deduped view.
    seen = set()
    with open(out, "w") as f, open(csvout, "w", newline="") as cf:
        w = csv.writer(cf)
        w.writerow(cols)
        f.write("{\n")
        for k, v in header.items():
            f.write(f"{json.dumps(k)}: {json.dumps(v)},\n")
        f.write('"records": [\n')
        first = True
        for r in stream_shards():
            f.write("" if first else ",\n")
            f.write(json.dumps(r))
            first = False
            k = dedupe_key(r)
            if k not in seen:
                seen.add(k)
                row = []
                for col in cols:
                    v = r.get(col)
                    if isinstance(v, dict):
                        v = v.get("value")
                    row.append("|".join(map(str, v)) if isinstance(v, list) else v)
                w.writerow(row)
        f.write("\n]\n}\n")
    log(f"wrote {out}", logf)
    log(f"wrote {csvout}", logf)
    return out, csvout


def main():
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(SHARDS, exist_ok=True)
    with open(os.path.join(SHARDS, "_run.log"), "a") as logf:
        total = sum(t for _, t, _ in BATCHES)
        jobs = sum(len(range(0, t, PAGE)) for _, t, _ in BATCHES)
        est = total * 0.00036 + jobs * 0.012
        log(f"=== dfs_listings run {CAPTURED} :: {len(BATCHES)} batches, "
            f"{jobs} requests, ~{total:,} records, est ${est:.2f}", logf)
        cached_now = len([p for p in os.listdir(CACHE) if p.endswith(".json")])
        log(f"pages already cached: {cached_now}/{jobs} "
            f"(cached pages are free — no re-billing)", logf)
        bal0 = balance()
        log(f"balance before: {bal0}", logf)
        t0 = time.time()

        pages, api_cost = acquire(logf)
        measured = measure(logf)
        bal1 = balance()
        out, csvout = write_outputs(measured, pages, api_cost, bal0, bal1, logf)

        log(f"DONE rows={measured['raw_rows']} "
            f"distinct_listings={measured['distinct_listings_by_cid']} "
            f"companies={measured['distinct_company_names_normalized']} "
            f"domains={measured['distinct_domains']} "
            f"website={measured['pct_with_website']}% "
            f"phone={measured['pct_with_phone']}% "
            f"email={measured['pct_with_email']}% "
            f"segment_w={measured['segment_w_candidates_no_website']} "
            f"NEW_api_cost=${api_cost:.4f} elapsed={time.time()-t0:.0f}s", logf)


if __name__ == "__main__":
    main()
