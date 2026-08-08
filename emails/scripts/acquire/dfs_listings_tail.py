#!/usr/bin/env python3
"""S1 raw acquisition — DataForSEO Business Listings, GENERIC TAIL wave (2026-08-04).

This is a SECOND wave on the same source as `dfs_listings.py` (2026-08-01). It
does not touch that payload. Different CAPTURED date, different output files,
different cache directory. `dfs-listings-2026-08-01.json/.csv` is provenance for
the entire current generation and must survive this run byte-for-byte.

WHAT IT BUYS, AND WHY
  The 2026-08-01 sweep took 30 specific industrial categories over one US-wide
  radius and left `industrial_equipment_supplier` (US 30,018) deliberately
  unbought: category matching is an OR across a multi-valued field, so every
  record carrying it *plus* a specific industrial category already arrived
  inside B1/B2/B3 (7,760 of them did). What was left is the GENERIC-ONLY TAIL —
  machine shops, one-off equipment sellers, businesses Google could only
  describe generically. `01-build-plan.md` §5h ruled that tail "not worth
  running" on a signal test. Artur overrode that on 2026-08-04 on a volume test
  and funded it at ~$11. The strategy's caveat still stands and is recorded in
  the handoff: these are the lowest-quality rows in the source and they grow the
  ranked-out backlog faster than the seated list.

THE EXCLUSION FILTER IS THE WHOLE TRICK
  DataForSEO bills per record RETURNED, and `["category_ids","has_not",X]` is
  honoured server-side (probed and confirmed: 30,018 -> 28,434 when one category
  is excluded, and 30,018 - 1,584 = 28,434 exactly). A record carrying any of
  the 30 categories swept on 2026-08-01 is ALREADY IN THAT PAYLOAD by
  construction — each batch returned exactly its server-reported total_count —
  so excluding them is not a filter on information, it is a refusal to buy the
  same rows twice. The API caps `filters` at 8 elements, so 7 exclusions fit
  alongside the country filter; a greedy set-cover on the local 2026-08-01
  payload picked the 7 that cover 6,489 of the 7,760 already-held records
  (83.6%). Measured effect: 30,018 -> 23,528, saving $2.34.

  Residual, stated honestly: a listing created in the last three days that
  carries a swept category is excluded here and was not in the 2026-08-01 pull.
  Three days of Google Business drift, against re-buying 6,489 rows to catch it.

T2 CATEGORY SELECTION — measured co-occurrence, not intuition
  `business_listings/categories_aggregation` returns, for a filtered set, how
  many US listings carry each co-occurring category. That is a contamination
  x-ray for $0.034 a call, and it killed four candidates outright:
    packaging_supply_store  23,230  co: shipping_and_mailing 10,752 /
      office_supply 9,677 / notary_public 6,851 / mailbox_rental 6,813
      -> this is the pack-and-ship retail cluster, not industrial packaging.
    gas_cylinders_supplier   2,661  co: propane 1,549 / fuel 1,258 /
      truck_rental 1,207; 9.7% website -> §5f's propane cluster.
    air_filter_supplier      3,548  co: heating_equipment 1,050 /
      hvac_contractor 1,013 -> HVAC.
    generator_shop           4,292  co: electrician 1,484 / hvac 677.
    belt_shop                  597  co: shoe_store 215 / boot_store 195 /
      hat_shop 193 -> fashion belts. The name lies; the codes do not.
    electrical_wholesaler / electrical_equipment_supplier -> dominated by
      electrical_supply_store + lighting, which §2a measured as the wrong buyer.
  What survived is in T2 below, ranked by domains-per-dollar (US count x
  website fill / cost).

PRICING, MEASURED AND RE-CONFIRMED THIS RUN:
    $0.012 per request + $0.00036 per record
    (limit=1 probe billed $0.0124 = 0.012 + 0.00036, exactly)

HARD SPEND CAP: $13.00 for the whole session, probes included. The guard runs
before every request, not after the invoice.
"""
import csv
import json
import os
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# Import the 2026-08-01 flag logic verbatim so the two waves are comparable.
from dfs_listings import (  # noqa: E402
    AUTH, AUTO_TRUCK_CATEGORY_IDS, AUTO_TRUCK_NAME_RX, NATIONAL_CHAINS_RX,
    apex, dedupe_key, norm_name)

CAPTURED = "2026-08-04"
PRIOR_CAPTURED = "2026-08-01"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "dfs-tail")
SHARDS = os.path.join(CACHE, "_shards")
PROGRESS = os.path.join(SHARDS, "_progress.json")
ENDPOINT = "https://api.dataforseo.com/v3/business_data/business_listings/search/live"
PAGE = 1000
WORKERS = 4
US_CENTRE = "39.8283,-98.5795,7000"
US_FILTER = ["address_info.country_code", "=", "US"]

# ------------------------------------------------------------------ THE CAP
HARD_CAP = 13.00                # Artur's cap. Nothing gets bought past this.
PROBE_SPEND = 0.2210            # already spent this session on probes (metered)
MAX_PAGE_COST = PAGE * 0.00036 + 0.012   # $0.372, worst case per in-flight page

# The 30 categories bought 2026-08-01 (dfs_listings.BATCHES), verbatim.
SWEPT_30 = [
    "hydraulic_equipment_supplier", "hose_supplier", "pneumatic_tools_supplier",
    "seal_shop", "gasket_manufacturer", "rubber_products_supplier",
    "air_compressor_supplier", "pump_supplier",
    "industrial_vacuum_equipment_supplier", "spring_supplier",
    "bearing_supplier", "electric_motor_store",
    "material_handling_equipment_supplier", "abrasives_supplier",
    "tool_wholesaler", "measuring_instruments_supplier", "toolroom",
    "factory_equipment_supplier", "machine_tool_supplier",
    "industrial_spares_and_products_wholesaler",
    "welding_supply_store", "welding_gas_supplier", "industrial_gas_supplier",
    "fastener_supplier", "screw_supplier", "industrial_chemicals_wholesaler",
    "metal_industry_suppliers", "wire_and_cable_supplier",
    "industrial_supermarket", "scale_supplier",
]

# (name, measured total_count under these exact filters, categories, exclusions)
BATCHES = [
    ("T1_generic_tail", 23528, ["industrial_equipment_supplier"], [
        # greedy set-cover over the 7,760 already-held IES records: 83.6% covered
        "material_handling_equipment_supplier", "hydraulic_equipment_supplier",
        "welding_supply_store", "pump_supplier", "air_compressor_supplier",
        "fastener_supplier", "hose_supplier"]),
    ("T2_icp_tail", 9260, [
        "automation_company",            # US 5,542 · 73% website · co: IES 634
        "laboratory_equipment_supplier",  # US 2,093 · 73% · co: biotech, lab
        "plastic_products_supplier",      # US 1,308 · 69%
        "chemical_wholesaler",            # US 1,273 · 60%
        "plastic_wholesaler"], [          # US   541 · 60%
        # do not re-buy T1, and do not re-buy 2026-08-01
        "industrial_equipment_supplier", "material_handling_equipment_supplier",
        "industrial_chemicals_wholesaler", "rubber_products_supplier",
        "measuring_instruments_supplier", "tool_wholesaler",
        "industrial_spares_and_products_wholesaler"]),
]

SPENT = 0.0        # this run only; the guard adds PROBE_SPEND
ABORTED = []


def filters_for(exclusions):
    f = [US_FILTER]
    for c in exclusions:
        f += ["and", ["category_ids", "has_not", c]]
    return f


def session_spend():
    return PROBE_SPEND + SPENT


def log(msg, logf=None):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    if logf:
        logf.write(line + "\n")
        logf.flush()


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
    batch, cats, excl, offset = job
    path = cache_path(batch, offset)
    if os.path.exists(path):
        with open(path) as f:
            return batch, offset, json.load(f), 0.0, True, None
    payload = {"categories": cats, "location_coordinate": US_CENTRE,
               "limit": PAGE, "offset": offset, "filters": filters_for(excl)}
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
            body = {"batch": batch, "categories": cats, "exclusions": excl,
                    "offset": offset, "limit": PAGE, "cost": d.get("cost") or 0.0,
                    "request_url": ENDPOINT, "filters": filters_for(excl),
                    "location_coordinate": US_CENTRE, "task": task}
            with open(path, "w") as f:
                json.dump(body, f)
            return batch, offset, body, spent, False, None
        last_err = f"{task.get('status_code')} {task.get('status_message')}"
        time.sleep(5)
    return batch, offset, None, spent, False, last_err


def shape(it, batch, cats, excl, offset):
    """One listing -> one record. Every source-native field kept verbatim.

    Identical field set to the 2026-08-01 wave (same `shape()` contract) plus
    `query_exclusions`, because this payload is NOT a plain category sweep and a
    reader three months from now must be able to see that from the record.
    """
    ai = it.get("address_info") or {}
    cat_ids = it.get("category_ids") or []
    contacts = it.get("contact_info") or []
    emails = [c.get("value") for c in contacts if c.get("type") == "mail"]
    phones = [c.get("value") for c in contacts if c.get("type") == "telephone"]
    title = it.get("title") or ""
    auto_cats = sorted(set(cat_ids) & AUTO_TRUCK_CATEGORY_IDS)
    name_hit = AUTO_TRUCK_NAME_RX.search(title)
    return {
        "company_display": title,
        "original_title": it.get("original_title"),
        "cid": it.get("cid"),
        "feature_id": it.get("feature_id"),
        "place_id": it.get("place_id"),
        # --- SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED (§5e/§5i)
        "category_display": it.get("category"),
        "category_ids": cat_ids,
        "additional_categories": it.get("additional_categories") or [],
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
        "domain": apex(it.get("domain")),
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
        "query_exclusions": excl,
        "query_offset": offset,
        "query_location_coordinate": US_CENTRE,
        "source": "dfs_listings",
        "source_wave": "generic_tail_2026-08-04",
        "source_name": "DataForSEO Business Listings (Google Maps)",
        "source_url": it.get("check_url"),
        "captured": CAPTURED,
    }


def shard_path(batch):
    return os.path.join(SHARDS, f"{batch}.jsonl")


def stream_shards():
    for batch, _, _, _ in BATCHES:
        p = shard_path(batch)
        if not os.path.exists(p):
            continue
        with open(p) as f:
            for line in f:
                line = line.strip()
                if line:
                    yield json.loads(line)


def acquire(logf):
    """PASS 1 — fetch (or read from cache), checkpoint each page, meter the cap."""
    global SPENT
    os.makedirs(SHARDS, exist_ok=True)
    pages, done, rows_total = [], 0, 0
    total_jobs = sum(len(range(0, t, PAGE)) for _, t, _, _ in BATCHES)
    t0 = time.time()

    for batch, total, cats, excl in BATCHES:
        jobs = [(batch, cats, excl, off) for off in range(0, total, PAGE)]
        with open(shard_path(batch), "w") as shard:
            batch_rows, i = 0, 0
            while i < len(jobs):
                # ---- THE GUARD. Worst case for every page about to be in flight.
                wave = jobs[i:i + WORKERS]
                uncached = [j for j in wave if not os.path.exists(cache_path(j[0], j[3]))]
                worst = session_spend() + len(uncached) * MAX_PAGE_COST
                if worst > HARD_CAP:
                    msg = (f"CAP GUARD: session ${session_spend():.4f} + worst-case "
                           f"${len(uncached) * MAX_PAGE_COST:.4f} would exceed "
                           f"${HARD_CAP:.2f}. STOPPING {batch} at offset {wave[0][3]}.")
                    log(msg, logf)
                    ABORTED.append({"batch": batch, "stopped_at_offset": wave[0][3],
                                    "remaining_pages": len(jobs) - i, "reason": msg})
                    break
                with ThreadPoolExecutor(max_workers=WORKERS) as pool:
                    futs = [pool.submit(fetch_page, j) for j in wave]
                    for fut in as_completed(futs):
                        b, offset, body, spent, cached, err = fut.result()
                        done += 1
                        SPENT += spent
                        if body is None:
                            pages.append({"batch": b, "offset": offset, "count": 0,
                                          "error": err, "cached": False})
                            log(f"  [{done}/{total_jobs}] ERR {b} off={offset} :: {err}", logf)
                            continue
                        res = (body["task"].get("result") or [{}])[0]
                        items = res.get("items") or []
                        for it in items:
                            shard.write(json.dumps(
                                shape(it, b, body["categories"], body["exclusions"], offset)))
                            shard.write("\n")
                        shard.flush()
                        os.fsync(shard.fileno())
                        batch_rows += len(items)
                        rows_total += len(items)
                        pages.append({"batch": b, "offset": offset, "count": len(items),
                                      "total_count": res.get("total_count"),
                                      "cost": body["cost"], "cached": cached,
                                      "error": None})
                        with open(PROGRESS, "w") as pf:
                            json.dump({"done": done, "of": total_jobs,
                                       "rows_written": rows_total,
                                       "run_cost": round(SPENT, 4),
                                       "session_spend": round(session_spend(), 4),
                                       "cap": HARD_CAP, "pages": pages}, pf, indent=1)
                        log(f"  [{done}/{total_jobs}] {b} off={offset} +{len(items)} "
                            f"rows={rows_total} {'cache' if cached else 'LIVE'} "
                            f"session=${session_spend():.4f}/{HARD_CAP:.2f} "
                            f"t={time.time() - t0:.0f}s", logf)
                i += WORKERS
        log(f"BATCH DONE {batch}: {batch_rows} rows -> {shard_path(batch)}", logf)
    return pages


def measure(logf):
    """PASS 2 — stream the shards and compute every measure. Holds keys, not rows."""
    seen, dup, raw_rows = set(), 0, 0
    companies, domains = set(), set()
    cat_hist, batch_hist = {}, {}
    keys = ["website", "domain", "phone", "email", "zip", "street", "claimed",
            "rating", "pas", "segw", "auto", "auto_cat", "auto_name_only",
            "chain", "uniq", "catcount"]
    c = dict.fromkeys(keys, 0)
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
        c["catcount"] += len(r["category_ids"])
        for x in r["category_ids"]:
            cat_hist[x] = cat_hist.get(x, 0) + 1
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
        "mean_category_ids_per_record": round(c["catcount"] / n, 2),
        "distinct_listings_by_query_batch": batch_hist,
        "distinct_category_ids_seen": len(cat_hist),
        "category_id_histogram": dict(sorted(cat_hist.items(), key=lambda kv: -kv[1])),
    }


def write_outputs(measured, pages, logf):
    header = {
        "source": "dfs_listings",
        "source_wave": "generic_tail_2026-08-04",
        "source_name": ("DataForSEO Business Listings — US generic industrial tail "
                        "(second wave; does not supersede 2026-08-01)"),
        "captured": CAPTURED,
        "supersedes_nothing": (
            f"dfs-listings-{PRIOR_CAPTURED}.json/.csv is untouched and remains the "
            "provenance for the current generation. This file is additive."),
        "endpoint": ENDPOINT,
        "program": {
            "batches": [{"name": b, "expected_total": t, "categories": c,
                         "exclusions": x, "filters": filters_for(x)}
                        for b, t, c, x in BATCHES],
            "requests": len(pages),
            "page_size": PAGE,
            "location_coordinate": US_CENTRE,
            "geography_note":
                "one US-wide radius per batch, not metro by metro — the shape "
                "proved in the 2026-08-01 wave.",
            "pricing_measured": "$0.012 per request + $0.00036 per record",
            "exclusion_note":
                "`category_ids has_not X` is honoured server-side and reduces the "
                "billed record count. Everything carrying one of the 30 categories "
                "swept on 2026-08-01 is already in that payload by construction, so "
                "the 7 exclusions on T1 refuse a re-buy rather than dropping "
                "information. API caps `filters` at 8 elements.",
            "swept_2026_08_01": SWEPT_30,
            "hard_spend_cap": HARD_CAP,
            "probe_spend_before_this_run": PROBE_SPEND,
            "aborted_for_cap": ABORTED,
        },
        "measured": measured,
        "api_cost_measured_this_run": round(SPENT, 4),
        "session_spend_including_probes": round(session_spend(), 4),
        "pages": pages,
    }
    cols = ["company_display", "category_display", "category_ids",
            "additional_categories", "street", "city", "state_region", "zip",
            "phone", "website", "domain", "emails", "is_claimed", "rating",
            "auto_truck_signal", "auto_truck_category_ids", "auto_truck_name_match",
            "national_chain_name_signal", "segment_w_candidate", "cid",
            "first_seen", "last_updated_time", "query_batch", "query_exclusions",
            "source", "source_wave", "source_url", "captured"]
    out = os.path.join(RAW, f"dfs-listings-{CAPTURED}.json")
    csvout = os.path.join(RAW, f"dfs-listings-{CAPTURED}.csv")
    for p in (out, csvout):
        if PRIOR_CAPTURED in p:
            sys.exit("refusing to write over the prior wave")
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
        total = sum(t for _, t, _, _ in BATCHES)
        jobs = sum(len(range(0, t, PAGE)) for _, t, _, _ in BATCHES)
        est = total * 0.00036 + jobs * 0.012
        log(f"=== dfs_listings_tail {CAPTURED} :: {len(BATCHES)} batches, "
            f"{jobs} requests, {total:,} records", logf)
        log(f"PROJECTED: sweep ${est:.2f} + probes ${PROBE_SPEND:.4f} = "
            f"${est + PROBE_SPEND:.2f}  vs CAP ${HARD_CAP:.2f}", logf)
        if est + PROBE_SPEND > HARD_CAP:
            sys.exit(f"ABORT: projection ${est + PROBE_SPEND:.2f} exceeds cap "
                     f"${HARD_CAP:.2f}. Nothing was bought.")
        t0 = time.time()
        pages = acquire(logf)
        measured = measure(logf)
        write_outputs(measured, pages, logf)
        log(f"DONE rows={measured['raw_rows']} "
            f"distinct={measured['distinct_listings_by_cid']} "
            f"companies={measured['distinct_company_names_normalized']} "
            f"domains={measured['distinct_domains']} "
            f"website={measured['pct_with_website']}% "
            f"phone={measured['pct_with_phone']}% "
            f"email={measured['pct_with_email']}% "
            f"segment_w={measured['segment_w_candidates_no_website']} "
            f"run_cost=${SPENT:.4f} session=${session_spend():.4f} "
            f"elapsed={time.time() - t0:.0f}s", logf)


if __name__ == "__main__":
    main()
