#!/usr/bin/env python3
"""S3 Task 2 -- resolve identity for the SERP domains that have none.

Why. S2 v2 seated 3,789 companies, of which 1,276 are SERP self-identification
records: a real website and a real brand claim, but no verified company name, no
address and no phone (`needs_identity_resolution: true`). They can be researched;
they cannot be mailed. Build-plan S3 resolves them.

Where from. The dealer's OWN site, never a third party. In order:

  1. the homepage -- usually already on disk from the line-card run, so it costs
     the origin nothing
  2. the best contact-ish link found in the homepage anchors
     (/contact, /contact-us, /about, /locations, /about-us, /our-locations)
  3. the second-best, or a guessed conventional path if the nav yielded nothing

What counts as identity, in confidence order:

  * schema.org JSON-LD `Organization` / `LocalBusiness` (and subtypes). Highest
    confidence -- the site is telling a machine who it is, in a typed field.
  * microdata (`itemprop="streetAddress"` ...), same shape, older markup
  * the visible page: a footer copyright name, `og:site_name`, a US postal
    address, a tel: link or a printed phone number

Nothing is invented. A field that is not on the page stays null, and the flag
only clears when a NAME **and** (an ADDRESS **or** a PHONE) were all read off
the dealer's own pages. Everything else keeps the flag and records what WAS
found, so S4 knows the difference between "no website" and "site says nothing".

Compliance -- these are small businesses, and the prior pass set the standard:
  * >= 3s between requests to the same host; concurrency is across DISTINCT
    hosts only, so no origin sees two of our requests at once
  * <= 3 NETWORK requests per domain (a cache read is not a request)
  * one honest desktop Chrome UA, never rotated, no fingerprint spoofing
  * ANY 403 -> recorded, domain abandoned. No retry, no bypass, ever.
  * 429 -> one exponential back-off, then the domain is left alone
  * every response cached, so re-runs cost the origin nothing

Reads (never writes) the line-card run's cache at emails/data/enrichment/_cache;
that pass fetched 2,185 homepages successfully and re-fetching them would be
both rude and slow. New responses go to emails/data/s3/_cache in the same format.
"""
import argparse
import csv
import gzip
import hashlib
import io
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
S3_DIR = os.path.join(ROOT, "data", "s3")
CACHE = os.path.join(S3_DIR, "_cache")
# Read-only. Owned by the parallel enrichment agent; we never write here.
FOREIGN_CACHES = [os.path.join(ROOT, "data", "enrichment", "_cache")]

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HOST_DELAY = 3.0
TIMEOUT = 12
MAX_BYTES = 4_000_000
MAX_NETWORK = 3          # network GETs per domain; cache reads are free

# ------------------------------------------------------------------ link intent
LINK_PATTERNS = [
    (100, re.compile(r"\bcontact[\s\-_]?us\b", re.I)),
    (95, re.compile(r"\bcontact\b", re.I)),
    (85, re.compile(r"\blocations?\b", re.I)),
    (80, re.compile(r"\bbranches?\b", re.I)),
    (75, re.compile(r"\babout[\s\-_]?us\b", re.I)),
    (70, re.compile(r"\babout\b", re.I)),
    (60, re.compile(r"\bfind[\s\-_]us\b", re.I)),
    (55, re.compile(r"\bour[\s\-_]compan(?:y|ies)\b", re.I)),
]
GUESS_PATHS = ["/contact", "/contact-us", "/about", "/about-us", "/locations"]

A_RX = re.compile(r"<a\b([^>]*)>(.*?)</a>", re.I | re.S)
HREF_RX = re.compile(r"""href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""", re.I)
TAG_RX = re.compile(r"<(script|style|noscript|svg|template)[^>]*>.*?</\1>", re.S | re.I)
LD_RX = re.compile(
    r"""<script[^>]+type\s*=\s*["']application/ld\+json["'][^>]*>(.*?)</script>""",
    re.I | re.S)
TITLE_RX = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
META_RX = re.compile(r"""<meta\b([^>]*)>""", re.I)
ATTR_RX = re.compile(
    r"""(\w[\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""")
BAD_HREF_RX = re.compile(
    r"^(?:#|mailto:|tel:|javascript:|data:)|"
    r"\.(?:jpe?g|png|gif|webp|svg|css|js|zip|mp4|ico|pdf)(?:$|\?)", re.I)

csv.field_size_limit(10_000_000)

_host_lock = threading.Lock()
_host_next = {}

# ------------------------------------------------------------------ extraction

STATES = set("""AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT
NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC PR VI GU AS MP""".split())

# "1234 W Industrial Blvd, Suite 5, Akron, OH 44311"
ADDR_RX = re.compile(
    r"(\d{1,6}[A-Za-z]?\s+[A-Za-z0-9.,'&/#\- ]{3,60}?)"
    r"[,\s]+([A-Za-z][A-Za-z.'\- ]{1,28}?)"
    r"[,\s]+([A-Z]{2})[,\s.]+(\d{5})(?:-\d{4})?\b")
PHONE_RX = re.compile(
    r"(?<![\d-])(?:\+?1[\s.\-]*)?\(?([2-9]\d{2})\)?[\s.\-]*([2-9]\d{2})[\s.\-]*(\d{4})(?![\d])")
TEL_RX = re.compile(r"""href\s*=\s*["']tel:([^"']+)["']""", re.I)
COPYRIGHT_RX = re.compile(
    r"(?:©|&copy;|\(c\)|copyright)\s*(?:\d{4}\s*(?:[-–]\s*\d{4})?\s*)?"
    r"(?:by\s+)?([A-Z][A-Za-z0-9&.,'\-]*(?:\s+[A-Za-z0-9&.,'\-]+){0,6})",
    re.I)
STREET_WORD_RX = re.compile(
    r"\b(st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|ct|court|"
    r"cir|circle|pl|place|plz|plaza|pkwy|parkway|hwy|highway|way|ter|terrace|"
    r"trl|trail|sq|square|expy|loop|run|row|pike|route|rte|industrial|park|"
    r"suite|ste|unit|box)\b", re.I)
NAME_NOISE_RX = re.compile(
    r"\b(all rights?|reserved|privacy|terms|sitemap|website|web design|designed by|"
    r"powered by|developed by|inc\.? all|llc all|click here|learn more|"
    r"call (?:us|now|today)|shop|buy|find|search|order)\b", re.I)
NAME_LEAD_RX = re.compile(
    r"^(?:welcome to|home\s*[-|:]|shop at|visit|find|discover|about|contact)\s+", re.I)
NAME_TAIL_RX = re.compile(r"\s+(?:here|now|today|online|homepage|home)$", re.I)
ENTITY_SUB = (("&amp;", "&"), ("&#38;", "&"), ("&quot;", '"'), ("&#39;", "'"),
              ("&apos;", "'"), ("&rsquo;", "'"), ("&lsquo;", "'"),
              ("&ndash;", "-"), ("&mdash;", "-"), ("&nbsp;", " "),
              ("&reg;", ""), ("&trade;", ""), ("&#8217;", "'"))
BARE_DOMAIN_RX = re.compile(
    r"^[a-z0-9.-]+\.(?:com|net|org|biz|us|io|co)$", re.I)
LEGAL_SUFFIX_RX = re.compile(
    r"\b(inc|llc|l\.l\.c|corp|corporation|co|company|ltd|lp|llp|plc|"
    r"incorporated|limited)\b\.?", re.I)

ORG_TYPES = {
    "organization", "localbusiness", "corporation", "store", "hardwarestore",
    "autopartsstore", "homeandconstructionbusiness", "professionalservice",
    "generalcontractor", "wholesalestore", "automotivebusiness", "plumber",
    "electrician", "hvacbusiness", "roofingcontractor", "movingcompany",
    "autorepair", "shoppingcenter", "furniturestore", "officeequipmentstore",
    "electronicsstore", "sportinggoodsstore", "medicalbusiness", "manufacturer",
}


def visible_text(html):
    t = TAG_RX.sub(" ", html)
    t = re.sub(r"<[^>]+>", " ", t)
    for a, b in (("&nbsp;", " "), ("&amp;", "&"), ("&#39;", "'"), ("&quot;", '"'),
                 ("&rsquo;", "'"), ("&lsquo;", "'"), ("&ndash;", "-"),
                 ("&mdash;", "-"), ("&reg;", " "), ("&trade;", " "),
                 ("&#8217;", "'"), ("&copy;", "(c)"), ("&#169;", "(c)")):
        t = t.replace(a, b)
    return re.sub(r"[ \t ]+", " ", t)


def throttle(host):
    while True:
        with _host_lock:
            now = time.monotonic()
            nxt = _host_next.get(host, 0.0)
            if now >= nxt:
                _host_next[host] = now + HOST_DELAY
                return
            wait = nxt - now
        time.sleep(min(wait, 5.0))


def cache_name(url):
    return hashlib.sha1(url.encode()).hexdigest() + ".gz"


def read_cache(url):
    """Our cache first, then the line-card run's (read-only)."""
    name = cache_name(url)
    for d in [CACHE] + FOREIGN_CACHES:
        p = os.path.join(d, name)
        if os.path.exists(p):
            try:
                with gzip.open(p, "rb") as f:
                    blob = json.loads(f.read().decode("utf-8", "ignore"))
                blob["cached"] = True
                blob["cache_dir"] = "s3" if d == CACHE else "linecard"
                return blob
            except (OSError, ValueError):
                return None
    return None


def fetch(url, state):
    """One polite GET, cache-first. `state` carries the per-domain budget."""
    hit = read_cache(url)
    if hit is not None:
        return hit
    if state["net"] >= MAX_NETWORK:
        return {"status": None, "error": "request-budget", "kind": None}

    host = urllib.parse.urlsplit(url).netloc.lower()
    throttle(host)
    state["net"] += 1
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip",
    })
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            raw = r.read(MAX_BYTES)
            if r.headers.get("Content-Encoding") == "gzip":
                try:
                    raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
                except OSError:
                    pass
            ctype = (r.headers.get("Content-Type") or "").lower()
            final, status = r.geturl(), r.status
    except urllib.error.HTTPError as e:
        if e.code == 429 and not state.get("backed_off"):
            state["backed_off"] = True
            time.sleep(10)
            throttle(host)
            if state["net"] < MAX_NETWORK:
                state["net"] += 1
                try:
                    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                        raw = r.read(MAX_BYTES)
                        if r.headers.get("Content-Encoding") == "gzip":
                            try:
                                raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
                            except OSError:
                                pass
                        ctype = (r.headers.get("Content-Type") or "").lower()
                        final, status = r.geturl(), r.status
                except Exception as e2:  # noqa: BLE001
                    return {"status": getattr(e2, "code", None), "kind": None,
                            "refused": True, "error": repr(e2)[:120]}
            else:
                return {"status": 429, "kind": None, "refused": True}
        else:
            # 403 above all: record and walk away. No bypass, ever.
            return {"status": e.code, "kind": None,
                    "refused": e.code in (401, 403, 429, 451),
                    "error": "HTTP %d" % e.code}
    except Exception as e:  # noqa: BLE001
        return {"status": None, "kind": None, "error": repr(e)[:120],
                "conn_failed": True}

    if "html" in ctype or "xml" in ctype or not ctype:
        html = raw.decode("utf-8", "ignore")
        blob = {"status": status, "kind": "html", "final_url": final,
                "text": visible_text(html), "html": html}
    else:
        blob = {"status": status, "kind": "other", "final_url": final,
                "text": "", "html": None, "error": "content-type %s" % ctype[:40]}

    store = dict(blob)
    store["html"] = store["html"][:900_000] if store["html"] else None
    store["text"] = store["text"][:600_000] if store["text"] else ""
    os.makedirs(CACHE, exist_ok=True)
    with gzip.open(os.path.join(CACHE, cache_name(url)), "wb") as f:
        f.write(json.dumps(store).encode())
    blob["cached"] = False
    return blob


# ------------------------------------------------------------------ JSON-LD


def _ld_nodes(obj, out):
    """Flatten a JSON-LD blob to every dict it contains, @graph included."""
    if isinstance(obj, list):
        for x in obj:
            _ld_nodes(x, out)
    elif isinstance(obj, dict):
        out.append(obj)
        for k in ("@graph", "itemListElement", "subOrganization", "department",
                  "location", "parentOrganization", "publisher", "provider"):
            if k in obj:
                _ld_nodes(obj[k], out)


def ld_types(node):
    t = node.get("@type")
    if isinstance(t, str):
        t = [t]
    if not isinstance(t, list):
        return set()
    return set(str(x).split("/")[-1].lower() for x in t)


def _text(v):
    if isinstance(v, str):
        s = v.strip()
        return s or None
    if isinstance(v, list):
        for x in v:
            s = _text(x)
            if s:
                return s
    if isinstance(v, dict):
        for k in ("name", "@value", "value"):
            if k in v:
                return _text(v[k])
    return None


def from_jsonld(html):
    """Highest-confidence extraction: the site's own typed self-description."""
    found = {"name": None, "street": None, "city": None, "state": None,
             "zip5": None, "phone": None, "country": None}
    nodes = []
    for m in LD_RX.finditer(html or ""):
        blob = m.group(1).strip()
        blob = re.sub(r"^\s*//<!\[CDATA\[|\]\]>\s*$", "", blob)
        try:
            nodes_in = json.loads(blob)
        except ValueError:
            continue
        _ld_nodes(nodes_in, nodes)
    org = [n for n in nodes if ld_types(n) & ORG_TYPES]
    if not org:
        return found, False
    # Prefer the node that carries an address -- a bare Organization with only a
    # logo tells us a name and nothing that makes it mailable.
    org.sort(key=lambda n: (0 if n.get("address") else 1,
                            0 if n.get("telephone") else 1))
    for n in org:
        if not found["name"]:
            found["name"] = _text(n.get("legalName")) or _text(n.get("name"))
        if not found["phone"]:
            found["phone"] = _text(n.get("telephone"))
        addr = n.get("address")
        if isinstance(addr, list):
            addr = next((a for a in addr if isinstance(a, dict)), addr[0] if addr else None)
        if isinstance(addr, dict) and not found["street"]:
            found["street"] = _text(addr.get("streetAddress"))
            found["city"] = _text(addr.get("addressLocality"))
            found["state"] = _text(addr.get("addressRegion"))
            found["zip5"] = _text(addr.get("postalCode"))
            found["country"] = _text(addr.get("addressCountry"))
        elif isinstance(addr, str) and not found["street"]:
            m = ADDR_RX.search(addr)
            if m:
                found["street"], found["city"] = m.group(1).strip(), m.group(2).strip()
                found["state"], found["zip5"] = m.group(3), m.group(4)
    return found, True


def from_microdata(html):
    """itemprop markup -- the same shape, older syntax."""
    found = {"name": None, "street": None, "city": None, "state": None,
             "zip5": None, "phone": None, "country": None}
    keys = {"streetaddress": "street", "addresslocality": "city",
            "addressregion": "state", "postalcode": "zip5",
            "telephone": "phone", "legalname": "name",
            "addresscountry": "country"}
    for m in re.finditer(
            r"""<([a-z0-9]+)\b([^>]*\bitemprop\s*=\s*["']([^"']+)["'][^>]*)>(.*?)</\1>""",
            html or "", re.I | re.S):
        prop = m.group(3).strip().lower()
        key = keys.get(prop)
        if not key or found[key]:
            continue
        content = re.search(r"""content\s*=\s*["']([^"']*)["']""", m.group(2), re.I)
        val = content.group(1) if content else re.sub(r"<[^>]+>", " ", m.group(4))
        val = re.sub(r"\s+", " ", val).strip()
        if val:
            found[key] = val
    return found


def normalize_phone(raw):
    if not raw:
        return None
    s = str(raw)
    cut = re.search(r"(?:ext(?:ension|n)?|(?<=[\d\s])x)[\s.:#*\-]*\d", s, re.I)
    if cut:
        s = s[:cut.start()]
    d = re.sub(r"\D", "", s)
    if len(d) == 11 and d[0] == "1":
        d = d[1:]
    if len(d) != 10:
        return None
    if not re.match(r"^[2-9]\d{2}[2-9]\d{6}$", d):
        return None
    return d


def normalize_state(raw):
    if not raw:
        return None
    s = str(raw).strip().upper().replace(".", "")
    if s in STATES:
        return s
    full = {"ALABAMA": "AL", "ALASKA": "AK", "ARIZONA": "AZ", "ARKANSAS": "AR",
            "CALIFORNIA": "CA", "COLORADO": "CO", "CONNECTICUT": "CT",
            "DELAWARE": "DE", "FLORIDA": "FL", "GEORGIA": "GA", "HAWAII": "HI",
            "IDAHO": "ID", "ILLINOIS": "IL", "INDIANA": "IN", "IOWA": "IA",
            "KANSAS": "KS", "KENTUCKY": "KY", "LOUISIANA": "LA", "MAINE": "ME",
            "MARYLAND": "MD", "MASSACHUSETTS": "MA", "MICHIGAN": "MI",
            "MINNESOTA": "MN", "MISSISSIPPI": "MS", "MISSOURI": "MO",
            "MONTANA": "MT", "NEBRASKA": "NE", "NEVADA": "NV",
            "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ", "NEW MEXICO": "NM",
            "NEW YORK": "NY", "NORTH CAROLINA": "NC", "NORTH DAKOTA": "ND",
            "OHIO": "OH", "OKLAHOMA": "OK", "OREGON": "OR",
            "PENNSYLVANIA": "PA", "RHODE ISLAND": "RI",
            "SOUTH CAROLINA": "SC", "SOUTH DAKOTA": "SD", "TENNESSEE": "TN",
            "TEXAS": "TX", "UTAH": "UT", "VERMONT": "VT", "VIRGINIA": "VA",
            "WASHINGTON": "WA", "WEST VIRGINIA": "WV", "WISCONSIN": "WI",
            "WYOMING": "WY", "DISTRICT OF COLUMBIA": "DC",
            "PUERTO RICO": "PR"}.get(s)
    return full


def normalize_zip5(raw):
    if not raw:
        return None
    m = re.search(r"\b(\d{5})(?:-?\d{4})?\b", str(raw))
    return m.group(1) if m else None


def squash(s):
    return re.sub(r"[^a-z0-9]", "", str(s or "").lower())


def plausible_name(name, apex):
    """A published name we are willing to put in an email.

    Rejects boilerplate ("All Rights Reserved"), navigation words, and anything
    that neither corroborates the domain nor looks like a company name (a legal
    suffix, or 2-6 capitalised words).
    """
    if not name:
        return None
    s = str(name)
    for a, b in ENTITY_SUB:
        s = s.replace(a, b)
    s = re.sub(r"&[a-z]+;|&#\d+;", " ", s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip(" .,-|–—")
    s = NAME_LEAD_RX.sub("", s).strip()
    # A copyright line often runs on: "Acme Inc - All rights reserved",
    # "Acme Inc 800-555-1212". Cut the run-on rather than reject the name.
    s = PHONE_RX.sub(" ", s)
    s = re.split(r"\s*[|·•]\s*|\s+[-–—]\s+", s)[0].strip(" .,-|–—")
    s = NAME_TAIL_RX.sub("", s).strip()
    if not (2 <= len(s) <= 70):
        return None
    if NAME_NOISE_RX.search(s):
        return None
    if BARE_DOMAIN_RX.match(s):
        return None  # the domain is not a company name; that is the whole problem
    if re.search(r"\d{3,}", s):
        return None
    words = s.split()
    if not (1 <= len(words) <= 8):
        return None
    if s.lower() in ("home", "welcome", "about us", "contact us", "about",
                     "contact", "locations", "our company", "index"):
        return None
    label = squash(apex.split(".")[0])
    q = squash(s)
    if not q:
        return None
    if label and (label.startswith(q) or q.startswith(label) or label in q or q in label):
        return s
    if LEGAL_SUFFIX_RX.search(s):
        return s
    return None


def from_visible(text, html, apex):
    """The page as a person reads it: footer copyright, address, phone."""
    found = {"name": None, "street": None, "city": None, "state": None,
             "zip5": None, "phone": None, "country": None}

    # og:site_name / application-name are published identity, not a guess.
    for m in META_RX.finditer(html or ""):
        attrs = dict()
        for a in ATTR_RX.finditer(m.group(1)):
            attrs[a.group(1).lower()] = a.group(2) or a.group(3) or a.group(4) or ""
        key = (attrs.get("property") or attrs.get("name") or "").lower()
        if key in ("og:site_name", "application-name", "apple-mobile-web-app-title"):
            cand = plausible_name(attrs.get("content"), apex)
            if cand:
                found["name"] = cand
                break

    if not found["name"]:
        for m in COPYRIGHT_RX.finditer(text or ""):
            cand = plausible_name(m.group(1), apex)
            if cand:
                found["name"] = cand
                break

    if not found["name"]:
        tm = TITLE_RX.search(html or "")
        if tm:
            title = re.sub(r"<[^>]+>", " ", tm.group(1))
            title = re.sub(r"\s+", " ", title).strip()
            for seg in re.split(r"\s*[|–—·•]\s*|\s+-\s+", title):
                cand = plausible_name(seg, apex)
                if cand:
                    found["name"] = cand
                    break

    m = TEL_RX.search(html or "")
    if m:
        found["phone"] = normalize_phone(m.group(1))
    if not found["phone"]:
        pm = PHONE_RX.search(text or "")
        if pm:
            found["phone"] = normalize_phone("".join(pm.groups()))

    for am in ADDR_RX.finditer(text or ""):
        street, city, st, zp = (am.group(1).strip(), am.group(2).strip(),
                                am.group(3), am.group(4))
        if st not in STATES:
            continue
        if not STREET_WORD_RX.search(street) and not re.match(r"^\d+\s+\w+\s+\w+", street):
            continue
        if len(city) < 2 or len(city) > 30:
            continue
        cw = city.split()
        # "Airport Rd Sutton" -- the regex cut the street too early. Push any
        # leading street words back onto the street rather than mailing them
        # as a city name.
        while len(cw) > 1 and STREET_WORD_RX.match(cw[0].strip(".,")):
            street = (street + " " + cw.pop(0)).strip()
        city = " ".join(cw)
        found["street"], found["city"], found["state"], found["zip5"] = street, city, st, zp
        found["country"] = "US"
        break
    return found


def score_links(html, base_url, apex):
    out, seen = [], set()
    for m in A_RX.finditer(html or ""):
        hm = HREF_RX.search(m.group(1))
        if not hm:
            continue
        href = (hm.group(1) or hm.group(2) or hm.group(3) or "").strip()
        if not href or BAD_HREF_RX.search(href):
            continue
        text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", m.group(2))).strip()[:120]
        try:
            url = urllib.parse.urljoin(base_url, href)
        except ValueError:
            continue
        parts = urllib.parse.urlsplit(url)
        if parts.scheme not in ("http", "https"):
            continue
        host = parts.netloc.lower().split(":")[0]
        if not (host == apex or host.endswith("." + apex) or host == "www." + apex):
            continue
        url = urllib.parse.urlunsplit((parts.scheme, parts.netloc, parts.path,
                                       parts.query, ""))
        if url in seen:
            continue
        seen.add(url)
        best = 0
        for weight, rx in LINK_PATTERNS:
            if rx.search(text):
                best = max(best, weight)
            if rx.search(urllib.parse.unquote(parts.path)):
                best = max(best, weight - 4)
        if best:
            out.append((best, url, text))
    out.sort(key=lambda r: (-r[0], len(r[1])))
    return out


def merge_found(dest, src, source_label, provenance, url):
    """First writer wins -- callers pass sources in confidence order."""
    for k in ("name", "street", "city", "state", "zip5", "phone", "country"):
        if not dest.get(k) and src.get(k):
            dest[k] = src[k]
            provenance[k] = {"from": source_label, "url": url}


def resolve(target):
    apex = target["domain"]
    rec = {
        "domain": apex,
        "company_display": None,
        "address_1": None, "city": None, "state": None, "zip5": None,
        "phone_e164": None, "country": None,
        "identity_status": "unresolved",
        "identity_found": [],
        "name_from": None, "address_from": None, "phone_from": None,
        "jsonld_present": False,
        "source_url": None,
        "pages": [],
        "refused": False,
        "network_requests": 0,
        "error": None,
        "captured": CAPTURED,
    }
    state = {"net": 0}
    found = {"name": None, "street": None, "city": None, "state": None,
             "zip5": None, "phone": None, "country": None}
    prov = {}

    home = "https://%s/" % apex
    r = fetch(home, state)
    rec["pages"].append({"url": home, "status": r.get("status"),
                         "cached": bool(r.get("cached")), "error": r.get("error")})
    if r.get("conn_failed"):
        alt = "https://www.%s/" % apex
        r2 = fetch(alt, state)
        rec["pages"].append({"url": alt, "status": r2.get("status"),
                             "cached": bool(r2.get("cached")), "error": r2.get("error")})
        if not r2.get("conn_failed"):
            r, home = r2, alt
    if r.get("refused"):
        rec["refused"] = True
        rec["identity_status"] = "refused"
        rec["error"] = r.get("error")
        rec["network_requests"] = state["net"]
        rec["source_url"] = home
        return rec
    if not r.get("html"):
        rec["identity_status"] = "unreachable"
        rec["error"] = r.get("error") or "no-html"
        rec["network_requests"] = state["net"]
        rec["source_url"] = home
        return rec

    base = r.get("final_url") or home
    rec["source_url"] = base

    def absorb(blob, url):
        ld, had_ld = from_jsonld(blob.get("html"))
        if had_ld:
            rec["jsonld_present"] = True
        merge_found(found, ld, "jsonld", prov, url)
        merge_found(found, from_microdata(blob.get("html")), "microdata", prov, url)
        merge_found(found, from_visible(blob.get("text"), blob.get("html"), apex),
                    "page", prov, url)

    absorb(r, base)

    def complete():
        return bool(found["name"]) and bool(found["phone"]) and bool(found["street"])

    if not complete():
        ranked = [u for _, u, _ in score_links(r.get("html"), base, apex)]
        guesses = [urllib.parse.urljoin(base, p) for p in GUESS_PATHS]
        candidates = []
        for u in ranked + guesses:
            if u not in candidates and u.rstrip("/") != base.rstrip("/"):
                candidates.append(u)
        for url in candidates:
            if state["net"] >= MAX_NETWORK and read_cache(url) is None:
                break
            rr = fetch(url, state)
            rec["pages"].append({"url": url, "status": rr.get("status"),
                                 "cached": bool(rr.get("cached")),
                                 "error": rr.get("error")})
            if rr.get("refused"):
                rec["refused"] = True
                break
            if rr.get("status") != 200 or not rr.get("html"):
                continue
            absorb(rr, rr.get("final_url") or url)
            if complete():
                break

    rec["company_display"] = found["name"]
    rec["address_1"] = found["street"]
    rec["city"] = found["city"]
    rec["state"] = normalize_state(found["state"])
    rec["zip5"] = normalize_zip5(found["zip5"])
    rec["country"] = (str(found["country"]).strip().upper()[:24]
                      if found["country"] else None)
    rec["phone_e164"] = normalize_phone(found["phone"])
    rec["name_from"] = (prov.get("name") or {}).get("from")
    rec["address_from"] = (prov.get("street") or {}).get("from")
    rec["phone_from"] = (prov.get("phone") or {}).get("from")
    for k, field in (("name", "company_display"), ("address", "address_1"),
                     ("phone", "phone_e164")):
        if rec[field]:
            rec["identity_found"].append(k)
    # The gate, verbatim from the task: a NAME and (an ADDRESS or a PHONE).
    if rec["company_display"] and (rec["address_1"] or rec["phone_e164"]):
        rec["identity_status"] = "resolved"
    elif rec["identity_found"]:
        rec["identity_status"] = "partial"
    else:
        rec["identity_status"] = "unresolved"
    # The URL the identity was actually read from is the provenance that matters.
    for key in ("name", "street", "phone"):
        p = prov.get(key)
        if p and p.get("url"):
            rec["source_url"] = p["url"]
            break
    rec["network_requests"] = state["net"]
    return rec


def load_targets(path, csv_path):
    if path and os.path.exists(path):
        with open(path) as f:
            return json.load(f)["targets"]
    targets = []
    with open(csv_path, newline="") as f:
        for row in csv.DictReader(f):
            if row.get("needs_identity_resolution") == "true" and row.get("domain"):
                targets.append({"domain": row["domain"],
                                "company": row.get("company"),
                                "company_display": row.get("company_display")})
    return targets


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=24)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--minutes", type=float, default=45.0)
    ap.add_argument("--csv", default=os.path.join(ROOT, "lists", "deduped-v2.csv"))
    args = ap.parse_args()

    os.makedirs(CACHE, exist_ok=True)
    targets = load_targets(os.path.join(S3_DIR, "_identity-targets-%s.json" % CAPTURED),
                           args.csv)
    if args.limit:
        targets = targets[:args.limit]

    out_path = os.path.join(S3_DIR, "identity-%s.json" % CAPTURED)
    done = {}
    if os.path.exists(out_path):
        with open(out_path) as f:
            for r in json.load(f).get("records", []):
                done[r["domain"]] = r
    todo = [t for t in targets if t["domain"] not in done]
    print("targets %d | already done %d | to resolve %d"
          % (len(targets), len(done), len(todo)), flush=True)

    deadline = time.monotonic() + args.minutes * 60
    records, lock, stop = list(done.values()), threading.Lock(), threading.Event()
    n = [0]

    def work(t):
        if stop.is_set() or time.monotonic() > deadline:
            stop.set()
            return None
        try:
            rec = resolve(t)
        except Exception as e:  # noqa: BLE001
            rec = {"domain": t["domain"], "identity_status": "unresolved",
                   "identity_found": [], "error": ("resolve-crash %r" % e)[:160],
                   "source_url": "https://%s/" % t["domain"], "captured": CAPTURED,
                   "refused": False, "pages": [], "network_requests": 0}
        with lock:
            records.append(rec)
            n[0] += 1
            if n[0] % 100 == 0:
                ok = sum(1 for r in records if r.get("identity_status") == "resolved")
                print("  %d/%d | resolved %d" % (n[0], len(todo), ok), flush=True)
                write(out_path, records, targets, partial=True)
        return None

    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        list(ex.map(work, todo))

    write(out_path, records, targets, partial=stop.is_set())
    ok = sum(1 for r in records if r.get("identity_status") == "resolved")
    print("\nwrote %d records (%d resolved) -> %s" % (len(records), ok, out_path))
    if stop.is_set():
        print("TIMEBOX HIT - partial coverage. Re-run to resume from cache.")
    return 0


def write(path, records, targets, partial):
    records = sorted(records, key=lambda r: r["domain"])
    payload = {
        "source": "identity",
        "source_name": "Dealer-published identity (own site: contact/about/locations)",
        "captured": CAPTURED,
        "policy": {
            "host_delay_s": HOST_DELAY,
            "max_network_requests_per_domain": MAX_NETWORK,
            "user_agent": UA,
            "on_403": "recorded, domain abandoned, never bypassed",
            "on_429": "one exponential back-off, then abandoned",
            "cache_reuse": "reads the line-card run's cache read-only",
        },
        "target_count": len(targets),
        "attempted": len(records),
        "partial": partial,
        "records": records,
    }
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(payload, f, indent=1)
    os.replace(tmp, path)


if __name__ == "__main__":
    sys.exit(main())
