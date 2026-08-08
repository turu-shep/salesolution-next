#!/usr/bin/env python3
"""equipment-dealers — THE SIZE-BAND FILTER, written before any record landed.

This file exists because designing the filter *after* the data arrives is how a
source seats $175M dealer groups into a send list. `strategy/00-sourcing-strategy.md`
§9 gate **ICP-EQ** (SIGNED, Artur, 2026-08-04) makes the pre-design a binding
condition of the signature, not a nicety:

  > the size-band filter is designed BEFORE the sweep; only 1–4 locations are in
  > scope; everything above routes to `pool-above-ceiling` (never deleted, never
  > seated)

Written 2026-08-04, before `bobcat.py` or `caseih.py` fetched a single dealer.

═══════════════════════════════════════════════════════════════════════════════
1. WHAT IS IN SCOPE
═══════════════════════════════════════════════════════════════════════════════
Only the **1–4-location tail**. §8.1a: hard floor $2M · priority tier $10M–$50M ·
soft ceiling $75M, and the ceiling's reason is **decision speed, not
affordability** — above ~$75M the buying is layered into procurement and cold
email converts worse. NAEDA puts the average dealer group at $24.4M/location ×
7.2 locations ≈ **$175M**, i.e. 2.3× the ceiling. So the population average is
out of scope and the tail is the whole point.

Everything at 5+ locations is `above-ceiling` → `pool-above-ceiling`. Per the
no-delete rule it is retained as inventory; it is never seated.

═══════════════════════════════════════════════════════════════════════════════
2. THE DECISION AXIS: location_count
═══════════════════════════════════════════════════════════════════════════════
(a) **Published**, where the locator publishes a group key. Case IH publishes
    `cnhPrimarySAPNumber` (a group-level SAP account) beside `dealerNumber` (a
    per-store id). If that field behaves, distinct store rows per group key is a
    *published* location count and outranks anything derived.
(b) **Derived by address clustering** otherwise. Bobcat publishes no group key.

**Clustering rule — this is the $175M-group catcher.** Dealer groups publish one
row per store, which is exactly how a ≈$175M group arrives disguised as four
small dealers. Rows join one cluster when ANY of these match, checked in this
order (union-find, so the joins are transitive):

    1. same `domain` (apex of the dealer's own website) — strongest signal, and
       the pipeline is domain-keyed end to end anyway
    2. same `phone_10` — branches of one group routinely share a main line
    3. same `norm_company` after stripping a trailing location qualifier
       ("Tri-State Bobcat — Burnsville" → "tri state bobcat")
    4. same source-published group key where one exists

`location_count` = size of the cluster.

⚠ **STATED LIMIT, not discovered afterwards.** A three-metro probe can only see
the stores inside its own circles, so a cluster size measured here is a **LOWER
BOUND** on the group's national footprint. That biases the filter *toward*
calling groups in-band — the optimistic direction. Every band count this module
produces is therefore reported as a lower bound, and the in-band count is an
**upper** bound on the true in-band count. Never quote it as a point estimate.

═══════════════════════════════════════════════════════════════════════════════
3. THE PROXY STACK (§8.1a) — never a single field, never Apollo revenue
═══════════════════════════════════════════════════════════════════════════════
§8.1a: "Score on the proxy stack, never on a single field." In confidence order:

  p1  employee count      — NOT PUBLISHED by either locator. Unavailable at
                            probe time. Recorded as None with a reason, never
                            silently skipped and never imputed.
  p2  branch count        — = `location_count` above. AVAILABLE.
  p3  SKU count on site   — would need a visit to every dealer's own site.
                            Out of scope for a three-metro probe. None.
  p4  line-card breadth   — distinct source-native product / industry / service
                            codes across the cluster. AVAILABLE where the source
                            publishes them (Bobcat does; Case IH TBD).
  p5  group-name signal   — free, source-native: a cluster whose name matches a
                            known consolidator/roll-up shape.

**Apollo's revenue field is excluded by name.** §8.6 / §8.1a already ruled it
unreliable and the pack "can't filter on it".

**How the proxies combine — deterministic and conservative.** The band is the
WORSE of the location verdict and the proxy verdict. An unavailable proxy can
never improve a band, only worsen it. This satisfies "never a single field"
without letting a soft signal promote a group into the send list.

═══════════════════════════════════════════════════════════════════════════════
4. DISPOSITIONS
═══════════════════════════════════════════════════════════════════════════════
  in-band        1 ≤ location_count ≤ 4 AND the cluster was resolvable
  above-ceiling  location_count ≥ 5, or a proxy escalates it
  unknown        no domain, no phone, no group key → the cluster cannot be
                 resolved, so the count is not evidence

**BINDING: `unknown` is NOT `in-band`.** A record whose group size cannot be
established has not been shown to be small. Folding unknowns into in-band is
precisely the flattering-number failure the decision rule warns about, and it is
the single easiest way to make this source look like it passed.

═══════════════════════════════════════════════════════════════════════════════
5. EXPECTED OUTCOME — stated before running, so the filter can be falsified
═══════════════════════════════════════════════════════════════════════════════
**Most of what comes back will be over the ceiling or unknown.** At NAEDA's 7.2
locations per group, the modal dealer row belongs to a group of 5+. If this
filter returns a *majority* in-band, the most likely explanation is not that the
tail is unexpectedly fat — it is that **clustering failed** and every store is
being counted as its own company. That reading is checked explicitly by the
`name_over_domain` inflation ratio, the same tell that showed name joins
overstating net-new by ~3× across every source measured 2026-08-03.
"""
import csv
import math
import os
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _polite import norm_company  # noqa: E402

# Three metros, then STOP. No national sweep.
METROS = [
    ("houston-tx", 29.7604, -95.3698),
    ("chicago-il", 41.8781, -87.6298),
    ("cleveland-oh", 41.4993, -81.6944),
]
RADIUS_MI = 100  # matches continental.py (2026-08-03) so the share is comparable

DEDUPED = os.path.join(_polite.ROOT, "lists", "deduped-v7.csv")
DEDUPED_EXPECTED_ROWS = 16719

MI_PER_RAD = 3958.7613

# Trailing location qualifiers on a branch label: "Tri-State Bobcat - Burnsville".
_LOC_QUALIFIER = re.compile(
    r"\s*(?:[-–—,]|\bof\b|\bat\b)\s*[a-z .'&]{2,28}$", re.IGNORECASE)

# p5 — roll-up / consolidator name shapes. Recorded as a signal, never as proof.
_GROUP_NAME_HINTS = (
    "titan machinery", "rdo equipment", "bane-welker", "birkey", "ziegler",
    "alta equipment", "united ag", "hutson", "sloan implement", "ag-pro",
    "quality equipment", "atlantic tractor", "arnold motor", "holt ",
    "romco", "mustang cat", "wagner equipment", " group",
    " holdings", " enterprises",
)
# ⚠ "Bobcat of <city>" was in this list and was REMOVED 2026-08-04. It is the
# OEM's standard franchise naming, not a roll-up tell — leaving it in flagged
# every single Bobcat dealer as a group and downgraded the whole source to
# `unknown`. A name pattern that matches everything sorts nothing.


# ── OEM / aggregator domains that are NOT a dealer's own website ─────────────
# Measured 2026-08-04 on Case IH: `dealerWebsite` is an OEM-hosted landing page
# (`www.caseih.com/…/dealer-landing-page.aspx?idDealer=…`), so every row apexed
# to `caseih.com`. Left alone that does two kinds of damage at once: it reports
# a website fill that is real-looking and worthless, and — worse — it collapses
# every dealer in the pull into ONE cluster on the domain join, which turns the
# size-band filter into a single "above-ceiling" verdict for the whole source.
# A domain on this list is never written to `domain` and never used as a join key.
#
# ⚠ The Kubota family is spelled out rather than trusted to the apex, because
# its index publishes THREE OEM-hosted URLs per dealer — `url` (the WordPress
# dealer page on www.kubotausa.com), `k_commerce_url` (a Kubota-hosted parts
# storefront) and sometimes a `website` that points at one of the brand sites.
# `apex()` strips `www.` and nothing else, so subdomains are listed explicitly.
OEM_DOMAINS = {
    "caseih.com", "bobcat.com", "kubotausa.com", "kubota.com", "newholland.com",
    "cnh.com", "cnhindustrial.com", "jlg.com", "deere.com", "johndeere.com",
    "locator.caseih.com", "mycnhstore.com",
    # Kubota family — added 2026-08-04 with kubota.py
    "shop.kubotausa.com", "start.buildmykubota.com", "buildmykubota.com",
    "kubotacreditusa.com", "kubotacore.com", "assets.kubotacore.com",
    "kubotausa.wpenginepowered.com", "landpride.com", "greatplainsmfg.com",
    "kubotaengine.com", "kubotausa.com.au",
}


def dealer_domain(url):
    """Apex of a dealer's OWN site, or None when the URL is an OEM landing page."""
    d = _polite.apex(url)
    if not d or d in OEM_DOMAINS:
        return None
    return d


def haversine_mi(lat1, lng1, lat2, lng2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * MI_PER_RAD * math.asin(math.sqrt(a))


def in_any_metro(lat, lng, radius=RADIUS_MI):
    if lat is None or lng is None:
        return None
    for name, mlat, mlng in METROS:
        if haversine_mi(lat, lng, mlat, mlng) <= radius:
            return name
    return None


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def strip_location_qualifier(name):
    s = norm_company(name)
    if not s:
        return ""
    t = _LOC_QUALIFIER.sub("", s).strip()
    # Never collapse to something uselessly short ("bobcat", "cat").
    return t if len(t) >= 6 else s


# A stripped name that is just the OEM's own brand is not a company name. On a
# single-line franchise network almost every dealer is "<Brand> of <City>", so a
# bare brand token would join the entire network into one cluster.
_BRAND_TOKENS = {
    "bobcat", "kubota", "case ih", "caseih", "new holland", "jlg", "deere",
    "john deere", "equipment", "tractor", "machinery", "rental", "rentals",
}


# ── union-find over the join keys ────────────────────────────────────────────

class _UF:
    def __init__(self):
        self.p = {}

    def find(self, x):
        self.p.setdefault(x, x)
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[rb] = ra


def cluster(records, group_key_field=None):
    """Assign every record a `cluster_id` and a `location_count`.

    **Domain-authoritative, and it has to be.** The first version joined on
    domain OR phone OR stripped-name transitively, and on Bobcat that produced
    one 26-store "group" spanning Texas, Michigan, Ohio and Pennsylvania. Cause:
    franchise naming. `strip_location_qualifier` reduces "Bobcat of Houston",
    "Bobcat of Beaumont" and "Bobcat of Akron" all to `bobcat`, so a single name
    key chained four genuinely separate dealer groups plus several one-store
    independents into one above-ceiling blob — the exact opposite error from the
    Case IH truncation, and it hides real in-band companies rather than seating
    fake ones.

    So the rule is now:

      1. a row WITH a domain clusters on its domain alone — never on a name,
         and never merged with a row carrying a different domain
      2. a row with no domain but a phone joins on phone, then on stripped name
      3. a row with neither joins on stripped name only, and a bare brand token
         is not a name

    That keeps domain — the only axis measured trustworthy — authoritative, and
    demotes the name join to what it is: a last resort for rows that cannot be
    joined any other way.
    """
    uf = _UF()
    for i, r in enumerate(records):
        rid = ("row", i)
        uf.find(rid)
        dom = (r.get("domain") or "").strip().lower() or None
        gk = (str(r.get(group_key_field)).strip()
              if group_key_field and r.get(group_key_field) else None)
        if gk:
            uf.union(("gk", gk), rid)
        if dom:
            # Domain is authoritative. No name join, no phone join — a shared
            # main line across two different domains is two companies.
            uf.union(("dom", dom), rid)
            continue
        if r.get("phone_10"):
            uf.union(("ph", r["phone_10"]), rid)
        nm = strip_location_qualifier(r.get("company"))
        if nm and nm not in _BRAND_TOKENS:
            uf.union(("nm", nm), rid)

    groups, unresolvable = {}, []
    for i, r in enumerate(records):
        resolvable = bool((r.get("domain") or "").strip()
                          or r.get("phone_10")
                          or (group_key_field and r.get(group_key_field)))
        cid = uf.find(("row", i))
        r["cluster_id"] = "|".join(str(x) for x in cid)
        r["cluster_resolvable"] = resolvable
        groups.setdefault(cid, []).append(r)
        if not resolvable:
            unresolvable.append(r)
    for cid, rows in groups.items():
        for r in rows:
            r["location_count"] = len(rows)
    return groups, unresolvable


def _line_card_breadth(rows, code_fields):
    vals = set()
    for r in rows:
        for f in code_fields:
            v = r.get(f)
            if not v:
                continue
            for part in str(v).split("|"):
                part = part.strip()
                if part:
                    vals.add(f"{f}={part}")
    return len(vals)


def apply_size_band(records, code_fields=(), group_key_field=None):
    """Stamp `size_band`, `location_count` and the proxy stack on every record.

    Band = the WORSE of the location verdict and the proxy verdict. An
    unavailable proxy can only worsen a band, never improve one.
    """
    groups, unresolvable = cluster(records, group_key_field)
    breadth_all = []
    for rows in groups.values():
        breadth_all.append(_line_card_breadth(rows, code_fields))
    breadth_all.sort()
    # top-decile breadth is the escalation threshold for p4
    p90 = breadth_all[int(len(breadth_all) * 0.9)] if breadth_all else 0

    for rows in groups.values():
        n = len(rows)
        breadth = _line_card_breadth(rows, code_fields)
        name = strip_location_qualifier(rows[0].get("company"))
        group_name_hit = any(h in (rows[0].get("company") or "").lower()
                             for h in _GROUP_NAME_HINTS)
        resolvable = rows[0].get("cluster_resolvable")

        if not resolvable:
            band = "unknown"
        elif n >= 5:
            band = "above-ceiling"
        else:
            band = "in-band"

        # proxy verdict — can only worsen
        proxy_band = band
        if band == "in-band":
            # p4: top-decile line-card breadth on a 3+ location cluster is the
            # shape of a multi-store group whose other stores are out of frame.
            if breadth and breadth >= p90 and p90 > 0 and n >= 3:
                proxy_band = "above-ceiling"
            # p5: a roll-up name is a signal, not proof — it downgrades to
            # `unknown` (unseated) rather than asserting a size we did not see.
            elif group_name_hit:
                proxy_band = "unknown"

        final = proxy_band
        for r in rows:
            r["location_count"] = n
            r["location_count_is_lower_bound"] = True
            r["size_band"] = final
            r["size_band_by_location_only"] = band
            r["p1_employee_count"] = None
            r["p1_employee_count_unavailable_reason"] = (
                "locator does not publish employee count; not imputed")
            r["p2_branch_count"] = n
            r["p3_sku_count"] = None
            r["p3_sku_count_unavailable_reason"] = (
                "would need a visit to each dealer's own site; out of scope "
                "for a three-metro probe")
            r["p4_line_card_breadth"] = breadth
            r["p5_group_name_signal"] = group_name_hit
            r["proxy_downgraded"] = (final != band)
            r["cluster_name_key"] = name
            r["disposition"] = ("pool-above-ceiling" if final == "above-ceiling"
                                else ("unseated-unknown-size" if final == "unknown"
                                      else "eligible"))
    return groups, unresolvable, {"p90_line_card_breadth": p90,
                                  "unresolvable_records": len(unresolvable)}


# ── measurement against the baseline ─────────────────────────────────────────

def load_deduped():
    with open(DEDUPED, encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    if len(rows) != DEDUPED_EXPECTED_ROWS:
        raise SystemExit(
            f"deduped-v7.csv has {len(rows)} data rows, expected "
            f"{DEDUPED_EXPECTED_ROWS} — the baseline moved; re-agree the "
            "denominator before quoting any net-new")
    return rows


def metro_coverage(deduped, radius=RADIUS_MI):
    """Measured share of the geocoded baseline inside the probe circles.

    This is the projection denominator, and it is a *measured* share of a list we
    already hold rather than a guess at a national dealer count. Two caveats
    that belong in the report, not buried here: it is not the OEM's own
    geography, and deduped-v7 is itself a biased sample — it is what our sources
    happened to find.
    """
    geo = [(num(r.get("lat")), num(r.get("lng"))) for r in deduped]
    geo = [(a, b) for a, b in geo if a is not None and b is not None]
    inside = sum(1 for a, b in geo if in_any_metro(a, b, radius))
    return {
        "baseline_rows": len(deduped),
        "baseline_rows_with_latlng": len(geo),
        f"baseline_rows_within_{radius}mi_of_the_3_metros": inside,
        "share_of_geocoded_baseline": round(inside / len(geo), 5) if geo else None,
    }


def net_new(records, deduped, label=""):
    """Net-new on two axes, reported separately and never averaged.

    **Domain is the only trustworthy axis.** Name joins overstated net-new by
    ~3× on every source measured 2026-08-03, because locators publish branch
    labels as company names, so a name missing from the list usually means a new
    *label*, not a new *company*.
    """
    have_dom = {(r.get("domain") or "").strip().lower()
                for r in deduped if (r.get("domain") or "").strip()}
    have_name = {norm_company(r.get("company")) for r in deduped}
    have_name.discard("")

    us = [r for r in records if r.get("is_us")]
    doms = {(r["domain"] or "").lower() for r in us if r.get("domain")}
    names = {norm_company(r.get("company")) for r in us}
    names.discard("")
    named_with_dom = {norm_company(r.get("company")) for r in us if r.get("domain")}
    named_with_dom.discard("")

    new_doms = sorted(doms - have_dom)
    new_names = sorted(names - have_name)
    n = len(us) or 1
    return {
        "label": label,
        "us_records": len(us),
        "distinct_domains": len(doms),
        "pct_website": round(sum(1 for r in us if r.get("website")) / n * 100, 1),
        "pct_phone": round(sum(1 for r in us if r.get("phone_raw")) / n * 100, 1),
        "pct_email": round(sum(1 for r in us if r.get("email")) / n * 100, 1),
        "distinct_norm_companies": len(names),
        "net_new_by_domain": len(new_doms),
        "net_new_by_norm_company": len(new_names),
        "name_over_domain_inflation": (round(len(names) / len(doms), 2)
                                       if doms else None),
        "companies_with_no_website_on_any_branch": len(names - named_with_dom),
        "net_new_domains_sample": new_doms[:30],
    }
