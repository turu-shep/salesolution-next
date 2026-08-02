#!/usr/bin/env python3
"""Shared signal vocabulary for S3 catalog qualification.

Two questions, one vocabulary:

  * does this dealer sell online (platform + cart + prices), and
  * how deep is the catalogue (product URLs in the sitemap).

Everything here is pattern-matching over HTML we already paid to fetch. It is
free, it is repeatable, and it is *evidence*, not proof. The build plan's rule
holds: absence of detection never disqualifies a dealer, it only tiers them.
A JS-rendered catalogue, a login-walled portal or a 403 all look identical to
a brochure site from the outside, so those land in `unknown`, not `brochure`.
"""
import re

# --------------------------------------------------------------- platforms
# Ordered: the first match wins, so put the unambiguous fingerprints first.
# Every pattern must be something a *hosting* site emits, never something a
# link to a vendor could produce (e.g. bare "magento" in body copy is out --
# distributors write about the platforms they integrate with).
PLATFORMS = [
    ("shopify", re.compile(
        r"cdn\.shopify\.com|Shopify\.theme|myshopify\.com|shopify-section|"
        r"window\.Shopify|shopify-features", re.I)),
    ("bigcommerce", re.compile(
        r"cdn\d*\.bigcommerce\.com|bigcommerce\.com/s-|stencil-utils|"
        r"\bBCData\b|bigcommerce\.com/stencil", re.I)),
    ("magento", re.compile(
        r"x-magento-init|Magento_[A-Z]|\bmage/(?:cookies|translate|apply|url)|"
        r"/pub/static/version|data-mage-init|catalog/product/view|"
        r"static/frontend/[A-Za-z]+/[A-Za-z]+/[a-z_]+/Magento", re.I)),
    ("woocommerce", re.compile(
        r"wp-content/plugins/woocommerce|\bwc-ajax\b|woocommerce-page|"
        r"woocommerce-Price-amount|wc-block|woocommerce_params", re.I)),
    ("shopware", re.compile(
        r"shopware/|/widgets/checkout|shopware\.min\.js|data-offcanvas-cart", re.I)),
    ("orocommerce", re.compile(
        r"oro(?:commerce|platform)|/build/oro|oroui/js", re.I)),
    ("salesforce_b2b", re.compile(
        r"demandware\.static|/on/demandware\.store|dwstatic|"
        r"cc-out-of-stock|demandware\.edgesuite", re.I)),
    ("sap_commerce", re.compile(
        r"/_ui/responsive/|hybris|/yacceleratorstorefront|smartedit", re.I)),
    ("znode", re.compile(r"znode|/Znode", re.I)),
    # Long tail worth naming because it changes the sales conversation.
    ("netsuite_sca", re.compile(
        r"/c\.\d+/sca-dev|shopping\.ssp|checkout\.netsuite\.com|"
        r"NS\.Configuration|shopping\.environment", re.I)),
    ("volusion", re.compile(r"volusion\.com|/v/vspfiles/", re.I)),
    ("prestashop", re.compile(r"prestashop|/modules/ps_", re.I)),
    ("opencart", re.compile(r"index\.php\?route=(?:product|common)", re.I)),
    ("unilog_cimm2", re.compile(r"unilogcorp|\bcimm2\b", re.I)),
    ("insite_optimizely", re.compile(
        r"insitecommerce|InsiteCommerce|optimizely\.com/b2b", re.I)),
    ("nopcommerce", re.compile(r"nopCommerce|nop\.customer|/Plugins/[A-Za-z.]*Nop", re.I)),
    # `ecommerce.ecwid.script` is boilerplate in a shared CMS template and fires
    # on 57 domains that have no store. Require a real store handle instead.
    ("ecwid", re.compile(
        r"app\.ecwid\.com/script\.js|ecwid_html_id|ecwid-shopping-cart|"
        r"window\.ec\s*=|ecwid_script", re.I)),
    # Plain SQUARESPACE_CONTEXT only proves Squarespace. Require the commerce
    # surface; a FontAwesome `.fa-squarespace` glyph was matching before.
    ("squarespace_commerce", re.compile(
        r"sqs-add-to-cart-button|/api/commerce/|squarespace-commerce|"
        r"\"commerceEnabled\"\s*:\s*true", re.I)),
    ("wix_stores", re.compile(
        r"wixstores|wix-stores|ecom-platform-cart|ecom-platform-store", re.I)),
]

# Platforms whose mere presence proves a cart exists somewhere on the site.
CART_BEARING = {
    "shopify", "bigcommerce", "magento", "shopware", "orocommerce",
    "salesforce_b2b", "sap_commerce", "znode", "netsuite_sca", "volusion",
    "prestashop", "opencart", "nopcommerce", "ecwid",
}

# ------------------------------------------------------------- cart signals
# "Add to quote" is deliberately NOT here. An RFQ button is the *opposite*
# finding: a catalogue with no transaction, which is our sharpest prospect.
CART_SIGNALS = [
    ("add_to_cart", re.compile(
        r"add[-_\s]?to[-_\s]?cart|addtocart|add[-_\s]?to[-_\s]?basket|"
        r"add[-_\s]?to[-_\s]?bag", re.I)),
    ("cart_link", re.compile(
        r"""href=["'][^"']*/(?:cart|checkout|basket|shopping[-_]cart)(?:/|["'?#])""",
        re.I)),
    ("cart_widget", re.compile(
        r"mini[-_]?cart|cart[-_](?:count|icon|total|items|quantity)|"
        r"data-cart|id=[\"']cart|class=[\"'][^\"']*\bcart\b", re.I)),
    ("checkout_flow", re.compile(
        r"/checkout/(?:onepage|cart|index)|proceed[-_\s]to[-_\s]checkout", re.I)),
]

QUOTE_SIGNALS = [
    ("add_to_quote", re.compile(
        r"add[-_\s]?to[-_\s]?(?:quote|rfq)|request[-_\s]?(?:a[-_\s]?)?quote|"
        r"quote[-_\s]?(?:request|cart|list)|rfq", re.I)),
    ("call_for_price", re.compile(
        r"call[-_\s]for[-_\s]pric|log[-_\s]?in[-_\s]?(?:to|for)[-_\s]?(?:see|view)"
        r"[-_\s]?pric|price[-_\s]on[-_\s]request|contact[-_\s]us[-_\s]for[-_\s]pric",
        re.I)),
]

# ------------------------------------------------------------ price signals
PRICE_SIGNALS = [
    ("price_microdata", re.compile(
        r"""itemprop=["'](?:price|lowPrice|highPrice)["']""", re.I)),
    ("price_jsonld", re.compile(
        r'"(?:priceCurrency|lowPrice|highPrice)"\s*:|'
        r'"@type"\s*:\s*"(?:Offer|AggregateOffer)"', re.I)),
    ("price_class", re.compile(
        r"""class=["'][^"']*\b(?:price|product-price|regular-price|"""
        r"""woocommerce-Price-amount|amount)\b""", re.I)),
    # `$0.00` is what an *empty cart widget* renders. Measured on 14 hand-checked
    # domains: 9 of them were classified ecom_full on that string alone.
    ("price_literal", re.compile(r"\$\s?(?!0\.00\b)\d[\d,]*\.\d{2}\b")),
]

# ---------------------------------------------------------- product signals
PRODUCT_SIGNALS = [
    ("product_jsonld", re.compile(r'"@type"\s*:\s*"Product"', re.I)),
    ("product_microdata", re.compile(
        r"""itemtype=["'][^"']*schema\.org/Product""", re.I)),
    ("product_href", re.compile(
        r"""href=["'][^"']*/(?:product|products|item|items|part|parts|"""
        r"""catalog|catalogue|sku|merchandise)/""", re.I)),
    ("short_product_href", re.compile(r"""href=["'][^"']*/p/[A-Za-z0-9]""", re.I)),
    ("shop_href", re.compile(
        r"""href=["'][^"']*/(?:shop|store|online-store|webstore|estore)(?:/|["'?])""",
        re.I)),
    ("product_query", re.compile(
        r"""href=["'][^"']*\?[^"']*(?:product_id|productId|itemno|item_no|"""
        r"""partnum|part_number|sku)=""", re.I)),
    ("product_search", re.compile(
        r"""(?:placeholder|aria-label|title)=["'][^"']*"""
        r"""(?:part\s*(?:#|no|number)|sku|item\s*(?:#|number)|search\s+"""
        r"""(?:products?|catalog|parts))""", re.I)),
    ("category_grid", re.compile(
        r"""class=["'][^"']*\b(?:product-(?:grid|item|list|card|tile)|"""
        r"""products-grid|item-list)\b""", re.I)),
]

# ------------------------------------------------------- sitemap URL shapes
# Ordered most-specific first; a URL is counted once, under its first match.
PRODUCT_URL_PATTERNS = [
    ("path_product", re.compile(r"/(?:products?|produkt)/[^/?#]+", re.I)),
    ("path_item", re.compile(r"/(?:item|items)/[^/?#]+", re.I)),
    ("path_part", re.compile(r"/(?:part|parts)/[^/?#]+", re.I)),
    ("path_sku", re.compile(r"/(?:sku|skus)/[^/?#]+", re.I)),
    ("path_catalog", re.compile(r"/(?:catalog|catalogue)/[^/?#]+/[^/?#]+", re.I)),
    ("path_p", re.compile(r"/p/[A-Za-z0-9][^/?#]*$", re.I)),
    ("path_shop_leaf", re.compile(r"/(?:shop|store)/[^/?#]+/[^/?#]+", re.I)),
    ("query_product", re.compile(
        r"[?&](?:product_id|productId|itemno|item_no|partnum|part_number|sku)=",
        re.I)),
    # `sku_slug` is handled in code, not here -- see `looks_like_sku`. The
    # pattern it replaced required *every* dash-separated token to contain a
    # digit, which rejected `/spirax-sarco-67908` and `/apollo-9a-103-01`,
    # i.e. exactly the URLs it existed to catch.
]

# Extensions a part-number page is commonly served under. Stripping these is
# what lets `/WJ200-001SF.asp` be recognised as a SKU at all.
PAGE_EXT = re.compile(r"\.(?:html?|asp|aspx|php|jsp|jspx|shtml|cfm)$", re.I)
YEAR_ONLY = re.compile(r"^(?:19|20)\d\d$")
# Slugs that carry digits but are never products.
SLUG_STOPWORDS = re.compile(
    r"^(?:page|p|part|chapter|step|top|best|covid|iso|ansi|osha|sae|ul)[-_]?\d+$",
    re.I)

# URL shapes that are emphatically NOT products, checked before the above so a
# blog post with a date slug cannot masquerade as a SKU.
NON_PRODUCT_URL = re.compile(
    r"/(?:blog|news|article|post|posts|category|categories|tag|tags|author|"
    r"page|pages|about|contact|careers|jobs|privacy|terms|sitemap|feed|"
    r"wp-content|wp-json|events?|press|resources?|case-stud|faq|locations?|"
    r"branch|team|our-team|staff|our-staff|leadership|history|mission|"
    r"services?|testimonial|gallery|videos?|20\d\d/\d\d)(?:/|$)",
    re.I)

# Child-sitemap names worth fetching first when the index is large.
PRODUCT_SITEMAP_HINT = re.compile(
    r"product|item|part|sku|catalog|catalogue|shop|store", re.I)
NON_PRODUCT_SITEMAP = re.compile(
    r"post|page|blog|news|category|categor|author|tag|attachment|image|video|"
    r"brand|manufacturer|location|term|taxonom", re.I)


def match_signals(html, signals):
    """Return the names of every signal that fires. Order preserved."""
    return [name for name, rx in signals if rx.search(html)]


def detect_platform(html):
    for name, rx in PLATFORMS:
        if rx.search(html):
            return name
    return None


def looks_like_sku(path):
    """Does the last path segment read like a manufacturer part number?

    Measured against real dealer sitemaps, three shapes cover almost all of it:
      /spirax-sarco-67908      brand words + a numeric part          (digit run)
      /apollo-95alf-203-01     alphanumeric part tokens              (alnum mix)
      /WJ200-001SF.asp         bare part number at the root          (alnum mix)
      /pvg-32/                 short model designator                (hyphen+digits)
    """
    leaf = path.rstrip("/").rsplit("/", 1)[-1]
    leaf = PAGE_EXT.sub("", leaf)
    if len(leaf) < 4 or not any(c.isdigit() for c in leaf):
        return False
    # An all-digit leaf is a CMS row id, not a part number -- it is what put
    # `/our-staff/4949373` in the product count. Real part numbers carry
    # letters or a separator. Undercounting beats inventing SKUs.
    if leaf.isdigit():
        return False
    if YEAR_ONLY.match(leaf) or SLUG_STOPWORDS.match(leaf):
        return False
    if re.search(r"\d{3,}", leaf):
        return True
    if re.search(r"[A-Za-z]\d|\d[A-Za-z]", leaf):
        return True
    return "-" in leaf and bool(re.search(r"\d{2,}", leaf))


def classify_product_url(url):
    """None when the URL is not product-shaped, else the pattern that matched."""
    path = url.split("#", 1)[0]
    if NON_PRODUCT_URL.search(path):
        return None
    for name, rx in PRODUCT_URL_PATTERNS:
        if rx.search(path):
            return name
    # Only consider a bare slug once the explicit shapes have all missed, and
    # only when it is a leaf under the site root or one level down -- deep
    # taxonomy paths with a number in them are categories far more often.
    try:
        after_host = "/" + url.split("://", 1)[-1].split("/", 1)[1]
    except IndexError:
        return None
    depth = len([s for s in after_host.split("?")[0].strip("/").split("/") if s])
    if depth <= 3 and looks_like_sku(after_host.split("?")[0]):
        return "sku_slug"
    return None
