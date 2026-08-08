#!/usr/bin/env python3
"""Submit PTDA's public Find-a-Distributor locator and report what comes back."""
import re, urllib.parse, urllib.request, http.cookiejar, html, sys

URL = "https://www.ptda.org/PTDA/Members/Member-Lists/Locators/Find-a-Distributor.aspx"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")
ZIP = sys.argv[1] if len(sys.argv) > 1 else "60602"
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [("User-Agent", UA), ("Accept", "text/html")]
s = op.open(URL, timeout=30).read().decode("utf-8", "ignore")

fields = {}
for m in re.finditer(r"<input\b[^>]*>", s, re.I):
    tag = m.group(0)
    n = re.search(r'name="([^"]+)"', tag); v = re.search(r'value="([^"]*)"', tag)
    ty = re.search(r'type="([^"]+)"', tag)
    if not n: continue
    if ty and ty.group(1).lower() in ("submit", "button", "image", "checkbox", "radio"): continue
    fields[n.group(1)] = html.unescape(v.group(1)) if v else ""

P = "ctl01$TemplateBody$WebPartManager1$gwpciNewQueryMenuCommon$ciNewQueryMenuCommon$ResultsGrid$Sheet0$"
fields[P + "Input0$TextBox1"] = ZIP          # zip
fields[P + "Input1$DropDown1"] = "1"          # country = United States
fields[P + "Input2$TextBox1"] = ""            # company name
fields[P + "Input3$DropDown1"] = "100"        # proximity 100 miles
fields[P + "SubmitButton"] = "Find"
fields["IsControlPostBack"] = "1"

data = urllib.parse.urlencode(fields).encode()
req = urllib.request.Request(URL, data=data, headers={
    "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded",
    "Referer": URL, "Accept": "text/html"})
r = op.open(req, timeout=60)
out = r.read().decode("utf-8", "ignore")
print("POST status:", r.status, "bytes:", len(out))

# results table rows
rows = re.findall(r"<tr[^>]*>(.*?)</tr>", out, re.S | re.I)
print("TABLE ROWS:", len(rows))
recs = []
for row in rows:
    cells = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", c))).strip()
             for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", row, re.S | re.I)]
    links = re.findall(r'href="(https?://[^"]+)"', row)
    ext = [l for l in links if "ptda.org" not in l]
    if len([c for c in cells if c]) >= 2:
        recs.append((cells[:6], ext[:2]))
print("PARSED RECORDS:", len(recs))
for c, e in recs[:12]:
    print("  ", c, "| WEB:", e)
