/**
 * Drop-in JSON-LD renderer. Use directly in any RSC:
 *
 *   <JsonLd data={globalGraph()} />
 *
 * Avoid `dangerouslySetInnerHTML` outside this component — centralize it here
 * so escaping stays in one place.
 *
 * Inside a <script> element the content is raw text, so HTML entities are NOT
 * decoded — a `</script>` or `<!--` in any CMS-sourced field would otherwise
 * break out of the tag and silently void all structured data on the page. We
 * unicode-escape `<`, `>`, and `&`, which keeps the payload valid JSON while
 * making a tag-close sequence impossible. (HTML-entity escaping would corrupt
 * the JSON here; unicode escaping is the correct fix for JSON-LD.)
 */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  )
}
