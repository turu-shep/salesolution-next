#!/usr/bin/env python3
"""S1 raw acquisition — AD member locator, denser-grid probe (fill-in points).

Rationale (`ad [UNDERWORKED]/01-prompt.md` step 2): AD's constraint is a fixed
50-mile search radius, so the 150 population-ranked metros are 150 circles and
the residue is geographic. The flattening measured in `01-build-plan.md` §5b was
measured on MORE metros (151+ by population), not on CLOSER points — fill-in
points between existing circles are unmeasured. This probe measures them.

Selection: candidate regional centers scored by distance to the nearest of the
150 swept metro centers; keep those >= MIN_GAP_MI (their circle is mostly
un-swept ground); pick largest gaps first with >= SPACING_MI between picks, so
probe circles do not overlap each other.

Swept-center coordinates are validated against the cached responses: every
returned member carries lat/lng and its distance to the query center, so a bad
center coordinate shows up as a systematic distance error and is replaced by a
least-squares estimate from the members themselves.

Decision rule, fixed before the run: if net-new distinct companies per query
beats 1.0 after the 40-point probe, extend to 100 fill-in points; below that,
close AD for good. Batch limits: 120 queries, one possible extension to 300
hard ceiling. Nothing is billed — polite GETs at >= 3s/host, single worker,
cache-first, hard stop on 403 (ad_full_sweep.fetch, reused verbatim).

ICP divisions only (BPT, PVF, ISD). DBP and ISC are server-side 404 — excluded.

RAW ACQUISITION ONLY. S2 owns normalize/dedupe.
"""
import csv
import importlib.util
import json
import math
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location(
    "ad_full_sweep", os.path.join(HERE, "ad_full_sweep.py"))
ad = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ad)

CAPTURED = "2026-08-03"
ad.CAPTURED = CAPTURED  # parse() stamps records from the module global
RAW = ad.RAW
CACHE = ad.CACHE

PROBE_POINTS = 40
EXTENSION_POINTS = 60          # only if net-new/query > 1.0 after the probe
MIN_GAP_MI = 60                # candidate must sit this far from every swept center
SPACING_MI = 80                # and this far from every other picked point
DECISION_NET_NEW_PER_QUERY = 1.0

DIVISIONS = {
    "BPT": "Bearings & Power Transmission",
    "PVF": "Pipe, Valves & Fittings",
    "ISD": "Industrial, Safety and Construction",
}

# The 150 swept metro centers (wave 1 top-50 + expansion 51-150), city-center
# coordinates. Validated against cached member distances before use; a center
# whose members systematically disagree is re-estimated from those members.
SWEPT = {
    "New York, NY": (40.71, -74.01), "Los Angeles, CA": (34.05, -118.24),
    "Chicago, IL": (41.88, -87.63), "Dallas, TX": (32.78, -96.80),
    "Houston, TX": (29.76, -95.37), "Atlanta, GA": (33.75, -84.39),
    "Washington, DC": (38.91, -77.04), "Philadelphia, PA": (39.95, -75.17),
    "Miami, FL": (25.77, -80.19), "Phoenix, AZ": (33.45, -112.07),
    "Boston, MA": (42.36, -71.06), "Riverside, CA": (33.95, -117.40),
    "San Francisco, CA": (37.77, -122.42), "Detroit, MI": (42.33, -83.05),
    "Seattle, WA": (47.61, -122.33), "Minneapolis, MN": (44.98, -93.27),
    "Tampa, FL": (27.95, -82.46), "San Diego, CA": (32.72, -117.16),
    "Denver, CO": (39.74, -104.99), "Baltimore, MD": (39.29, -76.61),
    "Orlando, FL": (28.54, -81.38), "Charlotte, NC": (35.23, -80.84),
    "St. Louis, MO": (38.63, -90.20), "San Antonio, TX": (29.42, -98.49),
    "Portland, OR": (45.52, -122.68), "Austin, TX": (30.27, -97.74),
    "Pittsburgh, PA": (40.44, -80.00), "Sacramento, CA": (38.58, -121.49),
    "Las Vegas, NV": (36.17, -115.14), "Cincinnati, OH": (39.10, -84.51),
    "Kansas City, MO": (39.10, -94.58), "Columbus, OH": (39.96, -83.00),
    "Indianapolis, IN": (39.77, -86.16), "Cleveland, OH": (41.50, -81.69),
    "San Jose, CA": (37.34, -121.89), "Nashville, TN": (36.16, -86.78),
    "Virginia Beach, VA": (36.85, -75.98), "Providence, RI": (41.82, -71.41),
    "Jacksonville, FL": (30.33, -81.66), "Milwaukee, WI": (43.04, -87.91),
    "Oklahoma City, OK": (35.47, -97.52), "Raleigh, NC": (35.78, -78.64),
    "Memphis, TN": (35.15, -90.05), "Richmond, VA": (37.54, -77.44),
    "Louisville, KY": (38.25, -85.76), "New Orleans, LA": (29.95, -90.07),
    "Salt Lake City, UT": (40.76, -111.89), "Hartford, CT": (41.76, -72.67),
    "Buffalo, NY": (42.89, -78.88), "Birmingham, AL": (33.52, -86.80),
    "Rochester, NY": (43.16, -77.61), "Grand Rapids, MI": (42.96, -85.66),
    "Tucson, AZ": (32.22, -110.97), "Honolulu, HI": (21.31, -157.86),
    "Tulsa, OK": (36.15, -95.99), "Fresno, CA": (36.74, -119.79),
    "Worcester, MA": (42.26, -71.80), "Omaha, NE": (41.26, -95.93),
    "Bridgeport, CT": (41.19, -73.20), "Greenville, SC": (34.85, -82.40),
    "Albuquerque, NM": (35.08, -106.65), "Bakersfield, CA": (35.37, -119.02),
    "Albany, NY": (42.65, -73.75), "Knoxville, TN": (35.96, -83.92),
    "McAllen, TX": (26.20, -98.23), "Baton Rouge, LA": (30.45, -91.15),
    "El Paso, TX": (31.76, -106.49), "New Haven, CT": (41.31, -72.92),
    "Allentown, PA": (40.60, -75.47), "Oxnard, CA": (34.20, -119.18),
    "Columbia, SC": (34.00, -81.03), "Sarasota, FL": (27.34, -82.53),
    "Dayton, OH": (39.76, -84.19), "Charleston, SC": (32.78, -79.93),
    "Greensboro, NC": (36.07, -79.79), "Cape Coral, FL": (26.56, -81.95),
    "Little Rock, AR": (34.75, -92.29), "Stockton, CA": (37.96, -121.29),
    "Colorado Springs, CO": (38.83, -104.82), "Boise, ID": (43.62, -116.20),
    "Des Moines, IA": (41.59, -93.62), "Lakeland, FL": (28.04, -81.95),
    "Madison, WI": (43.07, -89.40), "Ogden, UT": (41.22, -111.97),
    "Winston-Salem, NC": (36.10, -80.24), "Deltona, FL": (28.90, -81.26),
    "Syracuse, NY": (43.05, -76.15), "Provo, UT": (40.23, -111.66),
    "Wichita, KS": (37.69, -97.34), "Springfield, MA": (42.10, -72.59),
    "Toledo, OH": (41.65, -83.54), "Durham, NC": (35.99, -78.90),
    "Augusta, GA": (33.47, -81.97), "Palm Bay, FL": (28.03, -80.59),
    "Akron, OH": (41.08, -81.52), "Jackson, MS": (32.30, -90.18),
    "Harrisburg, PA": (40.27, -76.88), "Chattanooga, TN": (35.05, -85.31),
    "Scranton, PA": (41.41, -75.66), "Spokane, WA": (47.66, -117.43),
    "Youngstown, OH": (41.10, -80.65), "Portland, ME": (43.66, -70.26),
    "Lancaster, PA": (40.04, -76.31), "Fayetteville, AR": (36.06, -94.16),
    "Lansing, MI": (42.73, -84.56), "Lexington, KY": (38.04, -84.50),
    "Pensacola, FL": (30.42, -87.22), "Corpus Christi, TX": (27.80, -97.40),
    "Fort Wayne, IN": (41.08, -85.14), "Santa Rosa, CA": (38.44, -122.71),
    "Reno, NV": (39.53, -119.81), "Huntsville, AL": (34.73, -86.59),
    "Port St. Lucie, FL": (27.27, -80.35), "Fayetteville, NC": (35.05, -78.88),
    "Asheville, NC": (35.60, -82.55), "Visalia, CA": (36.33, -119.29),
    "Springfield, MO": (37.22, -93.30), "Killeen, TX": (31.12, -97.73),
    "Vallejo, CA": (38.10, -122.26), "York, PA": (39.96, -76.73),
    "Salinas, CA": (36.68, -121.66), "Savannah, GA": (32.08, -81.09),
    "Rockford, IL": (42.27, -89.09), "Salem, OR": (44.94, -123.04),
    "Mobile, AL": (30.69, -88.04), "Naples, FL": (26.14, -81.79),
    "Peoria, IL": (40.69, -89.59), "Montgomery, AL": (32.37, -86.30),
    "Eugene, OR": (44.05, -123.09), "Shreveport, LA": (32.53, -93.75),
    "Trenton, NJ": (40.22, -74.76), "Tallahassee, FL": (30.44, -84.28),
    "Ann Arbor, MI": (42.28, -83.74), "Hickory, NC": (35.73, -81.34),
    "Green Bay, WI": (44.51, -88.02), "Fort Collins, CO": (40.59, -105.08),
    "Wilmington, NC": (34.23, -77.94), "Evansville, IN": (37.97, -87.57),
    "Kalamazoo, MI": (42.29, -85.59), "Lafayette, LA": (30.22, -92.02),
    "Waco, TX": (31.55, -97.15), "Beaumont, TX": (30.08, -94.13),
    "Ocala, FL": (29.19, -82.14), "Manchester, NH": (42.99, -71.46),
    "Lubbock, TX": (33.58, -101.86), "Anchorage, AK": (61.22, -149.90),
    "South Bend, IN": (41.68, -86.25), "Roanoke, VA": (37.27, -79.94),
    "Gulfport, MS": (30.37, -89.09), "Davenport, IA": (41.52, -90.58),
}

# Candidate fill-in points: real regional trade centers the locator can geocode.
# Chosen for being plausible industrial geography; the gap scoring below decides
# which ones run. Excluded on purpose: island/ocean-circle points (Key West,
# outer HI islands, Juneau) where the 50-mile circle is mostly water.
CANDIDATES = {
    # Northern plains / mountain
    "Billings, MT": (45.79, -108.50), "Missoula, MT": (46.87, -114.00),
    "Great Falls, MT": (47.50, -111.30), "Bozeman, MT": (45.68, -111.04),
    "Helena, MT": (46.59, -112.04), "Butte, MT": (46.00, -112.53),
    "Kalispell, MT": (48.20, -114.31), "Bismarck, ND": (46.81, -100.78),
    "Fargo, ND": (46.88, -96.79), "Minot, ND": (48.23, -101.29),
    "Grand Forks, ND": (47.93, -97.03), "Williston, ND": (48.15, -103.62),
    "Dickinson, ND": (46.88, -102.79), "Sioux Falls, SD": (43.55, -96.70),
    "Rapid City, SD": (44.08, -103.23), "Aberdeen, SD": (45.46, -98.49),
    "Pierre, SD": (44.37, -100.35), "Casper, WY": (42.87, -106.31),
    "Cheyenne, WY": (41.14, -104.82), "Gillette, WY": (44.29, -105.50),
    "Rock Springs, WY": (41.59, -109.20), "Sheridan, WY": (44.80, -106.96),
    # Nebraska / Kansas
    "Scottsbluff, NE": (41.87, -103.66), "North Platte, NE": (41.12, -100.77),
    "Grand Island, NE": (40.93, -98.34), "Norfolk, NE": (42.03, -97.42),
    "Kearney, NE": (40.70, -99.08), "Hays, KS": (38.88, -99.33),
    "Salina, KS": (38.84, -97.61), "Garden City, KS": (37.97, -100.87),
    "Dodge City, KS": (37.75, -100.02), "Liberal, KS": (37.04, -100.92),
    # Interior west
    "Twin Falls, ID": (42.56, -114.46), "Idaho Falls, ID": (43.49, -112.04),
    "Pocatello, ID": (42.87, -112.45), "Lewiston, ID": (46.42, -117.02),
    "Elko, NV": (40.83, -115.76), "Winnemucca, NV": (40.97, -117.74),
    "Ely, NV": (39.25, -114.89), "St. George, UT": (37.10, -113.58),
    "Cedar City, UT": (37.68, -113.06), "Vernal, UT": (40.46, -109.53),
    "Grand Junction, CO": (39.06, -108.55), "Durango, CO": (37.28, -107.88),
    "Montrose, CO": (38.48, -107.88), "Flagstaff, AZ": (35.20, -111.65),
    "Yuma, AZ": (32.69, -114.63), "Kingman, AZ": (35.19, -114.05),
    "Prescott, AZ": (34.54, -112.47), "Sierra Vista, AZ": (31.55, -110.30),
    "Show Low, AZ": (34.25, -110.03),
    # New Mexico / West Texas
    "Santa Fe, NM": (35.69, -105.94), "Farmington, NM": (36.73, -108.22),
    "Gallup, NM": (35.53, -108.74), "Roswell, NM": (33.39, -104.52),
    "Hobbs, NM": (32.71, -103.14), "Carlsbad, NM": (32.42, -104.23),
    "Clovis, NM": (34.40, -103.21), "Alamogordo, NM": (32.90, -105.96),
    "Amarillo, TX": (35.19, -101.83), "Midland, TX": (32.00, -102.08),
    "Odessa, TX": (31.85, -102.37), "San Angelo, TX": (31.46, -100.44),
    "Abilene, TX": (32.45, -99.73), "Wichita Falls, TX": (33.91, -98.49),
    "Big Spring, TX": (32.25, -101.48), "Del Rio, TX": (29.36, -100.90),
    "Laredo, TX": (27.51, -99.51), "Victoria, TX": (28.81, -97.00),
    "Brownsville, TX": (25.90, -97.50), "Bryan, TX": (30.67, -96.37),
    "Tyler, TX": (32.35, -95.30), "Longview, TX": (32.50, -94.74),
    "Lufkin, TX": (31.34, -94.73), "Texarkana, TX": (33.44, -94.04),
    "Paris, TX": (33.66, -95.55), "Brownwood, TX": (31.71, -98.99),
    # Ozarks / Mississippi valley
    "Fort Smith, AR": (35.39, -94.40), "Jonesboro, AR": (35.84, -90.70),
    "El Dorado, AR": (33.21, -92.66), "Harrison, AR": (36.23, -93.11),
    "Joplin, MO": (37.08, -94.51), "Columbia, MO": (38.95, -92.33),
    "Kirksville, MO": (40.19, -92.58), "Cape Girardeau, MO": (37.31, -89.55),
    "Quincy, IL": (39.94, -91.41), "Monroe, LA": (32.51, -92.12),
    "Alexandria, LA": (31.31, -92.45), "Lake Charles, LA": (30.23, -93.22),
    "Meridian, MS": (32.36, -88.70), "Tupelo, MS": (34.26, -88.70),
    "Hattiesburg, MS": (31.33, -89.29), "Greenville, MS": (33.41, -91.06),
    # Southeast
    "Dothan, AL": (31.22, -85.39), "Florence, AL": (34.80, -87.68),
    "Columbus, GA": (32.46, -84.99), "Macon, GA": (32.84, -83.63),
    "Albany, GA": (31.58, -84.16), "Valdosta, GA": (30.83, -83.28),
    "Brunswick, GA": (31.15, -81.49), "Gainesville, FL": (29.65, -82.32),
    "Panama City, FL": (30.16, -85.66),
    # Appalachia / mid-Atlantic
    "Kingsport, TN": (36.55, -82.56), "Cookeville, TN": (36.16, -85.50),
    "Bowling Green, KY": (36.99, -86.44), "Owensboro, KY": (37.77, -87.11),
    "Paducah, KY": (37.08, -88.60), "London, KY": (37.13, -84.08),
    "Charleston, WV": (38.35, -81.63), "Morgantown, WV": (39.63, -79.95),
    "Parkersburg, WV": (39.27, -81.56), "Beckley, WV": (37.78, -81.19),
    "Cumberland, MD": (39.65, -78.76), "Altoona, PA": (40.52, -78.39),
    "Williamsport, PA": (41.24, -77.00), "State College, PA": (40.79, -77.86),
    "Bradford, PA": (41.96, -78.64), "Salisbury, MD": (38.36, -75.60),
    "Danville, VA": (36.59, -79.39), "Lynchburg, VA": (37.41, -79.14),
    "Harrisonburg, VA": (38.45, -78.87),
    # Great Lakes / north
    "Marquette, MI": (46.54, -87.40), "Escanaba, MI": (45.75, -87.06),
    "Sault Ste. Marie, MI": (46.50, -84.35), "Traverse City, MI": (44.76, -85.62),
    "Alpena, MI": (45.06, -83.43), "Gaylord, MI": (45.03, -84.67),
    "Saginaw, MI": (43.42, -83.95), "Wausau, WI": (44.96, -89.63),
    "Eau Claire, WI": (44.81, -91.50), "La Crosse, WI": (43.80, -91.24),
    "Rhinelander, WI": (45.64, -89.41), "Duluth, MN": (46.79, -92.10),
    "Bemidji, MN": (47.47, -94.88), "Brainerd, MN": (46.36, -94.20),
    "St. Cloud, MN": (45.56, -94.16), "Mankato, MN": (44.16, -94.00),
    "Rochester, MN": (44.02, -92.47), "Marshall, MN": (44.45, -95.79),
    "Thief River Falls, MN": (48.12, -96.18),
    # Iowa / Illinois interior
    "Sioux City, IA": (42.50, -96.40), "Waterloo, IA": (42.49, -92.34),
    "Dubuque, IA": (42.50, -90.66), "Mason City, IA": (43.15, -93.20),
    "Fort Dodge, IA": (42.50, -94.17), "Ottumwa, IA": (41.02, -92.41),
    "Burlington, IA": (40.81, -91.10), "Champaign, IL": (40.11, -88.24),
    "Springfield, IL": (39.80, -89.65), "Decatur, IL": (39.84, -88.95),
    "Bloomington, IL": (40.48, -88.99), "Effingham, IL": (39.12, -88.54),
    "Galesburg, IL": (40.95, -90.37), "Marion, IL": (37.73, -88.93),
    # Indiana / Ohio interior
    "Terre Haute, IN": (39.47, -87.41), "Bloomington, IN": (39.17, -86.53),
    "Muncie, IN": (40.19, -85.39), "Lafayette, IN": (40.42, -86.89),
    "Kokomo, IN": (40.49, -86.13), "Columbus, IN": (39.20, -85.92),
    "Findlay, OH": (41.04, -83.65), "Lima, OH": (40.74, -84.11),
    "Mansfield, OH": (40.76, -82.52), "Zanesville, OH": (39.94, -82.01),
    "Chillicothe, OH": (39.33, -82.98), "Marietta, OH": (39.42, -81.45),
    # New York / New England north
    "Utica, NY": (43.10, -75.23), "Watertown, NY": (43.97, -75.91),
    "Plattsburgh, NY": (44.70, -73.45), "Binghamton, NY": (42.10, -75.91),
    "Elmira, NY": (42.09, -76.81), "Jamestown, NY": (42.10, -79.24),
    "Oneonta, NY": (42.45, -75.06), "Burlington, VT": (44.48, -73.21),
    "Rutland, VT": (43.61, -72.97), "Bangor, ME": (44.80, -68.77),
    "Augusta, ME": (44.31, -69.78), "Presque Isle, ME": (46.68, -68.02),
    "Lebanon, NH": (43.64, -72.25), "Berlin, NH": (44.47, -71.19),
    "Keene, NH": (42.93, -72.28),
    # Pacific
    "Redding, CA": (40.59, -122.39), "Chico, CA": (39.73, -121.84),
    "Eureka, CA": (40.80, -124.16), "San Luis Obispo, CA": (35.28, -120.66),
    "Palm Springs, CA": (33.83, -116.55), "El Centro, CA": (32.79, -115.56),
    "Bishop, CA": (37.36, -118.40), "Medford, OR": (42.33, -122.88),
    "Bend, OR": (44.06, -121.31), "Klamath Falls, OR": (42.22, -121.78),
    "Pendleton, OR": (45.67, -118.79), "Ontario, OR": (44.03, -116.96),
    "Coos Bay, OR": (43.37, -124.22), "Astoria, OR": (46.19, -123.83),
    "Yakima, WA": (46.60, -120.51), "Wenatchee, WA": (47.42, -120.31),
    "Kennewick, WA": (46.21, -119.14), "Bellingham, WA": (48.75, -122.48),
    "Port Angeles, WA": (48.12, -123.43), "Aberdeen, WA": (46.98, -123.82),
    # Alaska
    "Fairbanks, AK": (64.84, -147.72),
}


def haversine_mi(a, b):
    lat1, lng1, lat2, lng2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = (math.sin((lat2 - lat1) / 2) ** 2
         + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2)
    return 3958.8 * 2 * math.asin(math.sqrt(h))


SUFFIX = re.compile(r"\b(inc|llc|corp|co|company|ltd|the)\b")


def loose_norm(name):
    """Lowercase + strip inc/llc/corp-family tokens — the waves' distinct key."""
    if not name:
        return None
    s = re.sub(r"[^a-z0-9]+", " ", name.lower().replace(".", ""))
    s = SUFFIX.sub(" ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s or None


def load_prior():
    """Prior raw rows -> (per-metro member samples, distinct loose-norm names)."""
    members = {}   # metro -> [(lat, lng, dist_mi)]
    names = set()
    for fname in ("ad-2026-08-01.csv", "ad-expansion-2026-08-01.csv"):
        with open(os.path.join(RAW, fname), newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                names.add(loose_norm(row["company"]))
                try:
                    lat, lng = float(row["lat"]), float(row["lng"])
                    dist = float(re.sub(r"[^\d.]", "", row["distance_mi"] or ""))
                except (TypeError, ValueError):
                    continue
                members.setdefault(row["query_metro"], []).append((lat, lng, dist))
    names.discard(None)
    return members, names


def validate_centers(members):
    """Replace any SWEPT coordinate whose members systematically disagree."""
    adjusted = []
    for metro, obs in members.items():
        if metro not in SWEPT or len(obs) < 3:
            continue
        center = SWEPT[metro]
        errs = sorted(abs(haversine_mi(center, (lat, lng)) - dist)
                      for lat, lng, dist in obs)
        med = errs[len(errs) // 2]
        if med <= 12:
            continue
        # Least-squares re-estimate on a small grid around the member centroid.
        clat = sum(o[0] for o in obs) / len(obs)
        clng = sum(o[1] for o in obs) / len(obs)
        best, best_err = (clat, clng), None
        for dlat in [x / 20 for x in range(-20, 21)]:
            for dlng in [x / 20 for x in range(-20, 21)]:
                cand = (clat + dlat, clng + dlng)
                err = sum((haversine_mi(cand, (o[0], o[1])) - o[2]) ** 2 for o in obs)
                if best_err is None or err < best_err:
                    best, best_err = cand, err
        SWEPT[metro] = best
        adjusted.append((metro, round(med, 1)))
    return adjusted


def pick_points(n, exclude):
    """Largest gaps first, MIN_GAP_MI off every swept center, SPACING_MI apart."""
    scored = []
    for name, coord in CANDIDATES.items():
        if name in exclude:
            continue
        gap = min(haversine_mi(coord, c) for c in SWEPT.values())
        if gap >= MIN_GAP_MI:
            scored.append((gap, name, coord))
    scored.sort(reverse=True)
    picked = []
    for gap, name, coord in scored:
        if len(picked) >= n:
            break
        if all(haversine_mi(coord, p[2]) >= SPACING_MI for p in picked):
            picked.append((gap, name, coord))
    return picked


def run_points(points, prior_names, records, stats, seen_new):
    fetched = 0
    t0 = time.time()
    total = len(points) * len(DIVISIONS)
    n = 0
    for gap, metro, _coord in points:
        for div in DIVISIONS:
            n += 1
            body, cached = ad.fetch(div, metro)
            if body is None:
                stats.append({"division": div, "metro": metro, "gap_mi": round(gap),
                              "rows": None, "status": "failed"})
                continue
            recs = ad.parse(body, div, metro)
            for r in recs:
                r["metro_rank_band"] = "gridprobe"
                nn = loose_norm(r["company"])
                if nn and nn not in prior_names:
                    seen_new.add(nn)
            records.extend(recs)
            stats.append({"division": div, "metro": metro, "gap_mi": round(gap),
                          "rows": len(recs), "cached": cached})
            if not cached:
                fetched += 1
                time.sleep(ad.DELAY)
            if n % 15 == 0 or n == total:
                print(f"[{n}/{total}] {div}/{metro} rows={len(recs)} "
                      f"raw={len(records)} net_new={len(seen_new)} "
                      f"fetched={fetched} elapsed={time.time()-t0:.0f}s", flush=True)
    return fetched


def main():
    os.makedirs(CACHE, exist_ok=True)
    members, prior_names = load_prior()
    print(f"prior distinct (loose norm, both waves): {len(prior_names)}")

    adjusted = validate_centers(members)
    print(f"center validation: {len(adjusted)} of {len(SWEPT)} centers re-estimated"
          + (f" -> {adjusted}" if adjusted else ""))

    probe = pick_points(PROBE_POINTS, exclude=set())
    print(f"\nprobe points ({len(probe)}), largest gap first:")
    for gap, name, _ in probe:
        print(f"  {round(gap):>4} mi  {name}")

    records, stats, seen_new = [], [], set()
    fetched = run_points(probe, prior_names, records, stats, seen_new)

    queries = len([s for s in stats if s.get("rows") is not None])
    per_query = len(seen_new) / queries if queries else 0.0
    print(f"\nPROBE RESULT: {len(seen_new)} net-new distinct across {queries} queries "
          f"= {per_query:.2f}/query (decision line {DECISION_NET_NEW_PER_QUERY})")

    extended = False
    if per_query > DECISION_NET_NEW_PER_QUERY:
        extended = True
        print(f"DECISION: extend to {PROBE_POINTS + EXTENSION_POINTS} fill-in points")
        more = pick_points(EXTENSION_POINTS, exclude={p[1] for p in probe})
        print(f"extension points ({len(more)}):")
        for gap, name, _ in more:
            print(f"  {round(gap):>4} mi  {name}")
        fetched += run_points(more, prior_names, records, stats, seen_new)
        probe = probe + more
    else:
        print("DECISION: below the line — close AD for good after this session.")

    os.makedirs(RAW, exist_ok=True)
    payload = {
        "source": "ad",
        "source_name": "Affiliated Distributors member locator — denser-grid probe",
        "captured": CAPTURED,
        "base_url": ad.BASE,
        "divisions": DIVISIONS,
        "points": [{"metro": name, "gap_mi": round(gap), "lat": c[0], "lng": c[1]}
                   for gap, name, c in probe],
        "selection": {"min_gap_mi": MIN_GAP_MI, "spacing_mi": SPACING_MI,
                      "probe_points": PROBE_POINTS,
                      "extension_points": EXTENSION_POINTS if extended else 0,
                      "centers_reestimated": adjusted},
        "decision_rule": f"net-new/query > {DECISION_NET_NEW_PER_QUERY} extends to 100 points",
        "decision": "extended" if extended else "close",
        "net_new_distinct": len(seen_new),
        "net_new_per_query": round(per_query, 3),
        "queries_planned": len(probe) * len(DIVISIONS),
        "queries_completed": len(stats),
        "requests_to_origin": fetched,
        "per_query": stats,
        "records": records,
    }
    with open(os.path.join(RAW, f"ad-gridprobe-{CAPTURED}.json"), "w") as f:
        json.dump(payload, f, indent=1)

    cols = list(records[0].keys()) if records else []
    with open(os.path.join(RAW, f"ad-gridprobe-{CAPTURED}.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(records)
    print(f"\nDONE raw_records={len(records)} queries={len(stats)} "
          f"origin_requests={fetched} net_new={len(seen_new)} "
          f"per_query={per_query:.2f} decision={'extended' if extended else 'close'}")


if __name__ == "__main__":
    try:
        main()
    except ad.Blocked as e:
        print(f"\nBLOCKED: {e}", file=sys.stderr)
        sys.exit(2)
