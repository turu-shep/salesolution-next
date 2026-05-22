/**
 * Drop-in JSON-LD renderer. Use directly in any RSC:
 *
 *   <JsonLd data={globalGraph()} />
 *
 * Avoid `dangerouslySetInnerHTML` outside this component — centralize it
 * here so we can add escaping rules in one place if needed.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
