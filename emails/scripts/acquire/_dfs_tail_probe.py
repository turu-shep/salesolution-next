#!/usr/bin/env python3
"""Pre-spend probe for the DFS generic-tail sweep (2026-08-04).

Answers three questions before a cent goes on the main buy:
  1. Does a server-side `category_ids` exclusion filter work? If it does, the
     ~7,760 records that already reached us on 2026-08-01 do not get re-bought.
  2. What is the exact US total_count of each candidate tail category?
  3. What is the union total_count of the batch we actually intend to buy?

Every response is cached verbatim under `_cache/dfs-tail/`. Every call prints
its measured cost and the running total. HARD CAP enforced in the caller.
"""
import base64
import json
import os
import sys
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "dfs-tail")
SEARCH = "https://api.dataforseo.com/v3/business_data/business_listings/search/live"
AGG = "https://api.dataforseo.com/v3/business_data/business_listings/categories_aggregation/live"
US_CENTRE = "39.8283,-98.5795,7000"
US_FILTER = ["address_info.country_code", "=", "US"]

# The 30 categories bought on 2026-08-01 (dfs_listings.py BATCHES, verbatim).
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

SPENT = 0.0


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


def post(url, payload, tag, cap=1.50):
    """One billed call. Caches verbatim, meters cost, refuses to pass the cap."""
    global SPENT
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f"probe_{tag}.json")
    if os.path.exists(path):
        with open(path) as f:
            d = json.load(f)
        print(f"  [{tag}] CACHED  cost=$0.0000  running=${SPENT:.4f}")
        return d
    if SPENT >= cap:
        sys.exit(f"probe cap ${cap} reached at ${SPENT:.4f}")
    req = urllib.request.Request(
        url, data=json.dumps([payload]).encode(),
        headers={"Authorization": AUTH, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        d = json.load(r)
    cost = d.get("cost") or 0.0
    SPENT += cost
    task = (d.get("tasks") or [{}])[0]
    with open(path, "w") as f:
        json.dump({"payload": payload, "url": url, "response": d}, f)
    print(f"  [{tag}] {task.get('status_code')} {task.get('status_message')} "
          f"cost=${cost:.4f}  running=${SPENT:.4f}")
    return d


def total_count(d):
    task = (d.get("tasks") or [{}])[0]
    res = (task.get("result") or [{}])[0] or {}
    return res.get("total_count"), res.get("count"), (res.get("items") or [])
