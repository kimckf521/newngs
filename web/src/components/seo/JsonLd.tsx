/**
 * Renders one or more schema.org JSON-LD blocks as <script type="application/ld+json">.
 * Server-rendered so search-engine crawlers see the structured data without
 * executing JavaScript. Accepts a single node or an array (e.g. WebPage +
 * BreadcrumbList from `pageJsonLd`).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const nodes = Array.isArray(data) ? data : [data];
  return (
    <>
      {nodes.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify output is safe to inline; escape `<` to be defensive
          // against a stray "</script>" inside any string field.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
