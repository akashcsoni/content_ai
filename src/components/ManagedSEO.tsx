import SEO from './SEO'
import { pageSeo, type PageSeoKey, breadcrumbJsonLd } from '../config/seo'
import { useSitePageSeo } from '../context/SiteSeoContext'

type JsonLd = Record<string, unknown> | Record<string, unknown>[]

type ManagedSEOProps = {
  pageKey: PageSeoKey
  jsonLd?: JsonLd
  breadcrumbItems?: { name: string; path: string }[]
  ogType?: 'website' | 'article'
  image?: string
  noindex?: boolean
}

function normalizeJsonLdArray(value: JsonLd | undefined): Record<string, unknown>[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function mergeJsonLd(
  managed: Record<string, unknown>[],
  extra: Record<string, unknown>[],
): Record<string, unknown>[] {
  const merged = [...managed]

  for (const item of extra) {
    const schemaType = item['@type']
    const existingIndex =
      typeof schemaType === 'string'
        ? merged.findIndex((entry) => entry['@type'] === schemaType)
        : -1

    if (existingIndex >= 0) {
      merged[existingIndex] = item
    } else {
      merged.push(item)
    }
  }

  return merged
}

function toJsonLdOutput(schemas: Record<string, unknown>[]): JsonLd | undefined {
  if (schemas.length === 0) return undefined
  return schemas.length === 1 ? schemas[0] : schemas
}

export default function ManagedSEO({
  pageKey,
  jsonLd: jsonLdProp,
  breadcrumbItems,
  ogType,
  image,
  noindex,
}: ManagedSEOProps) {
  const managed = useSitePageSeo(pageKey)
  const fallback = pageSeo[pageKey]

  const title = managed?.metaTitle || fallback.title
  const description = managed?.metaDescription || fallback.description
  const path = managed?.path || fallback.path
  const keywords = managed?.keywords?.length ? managed.keywords : [...fallback.keywords]
  const resolvedOgType = ogType ?? managed?.ogType ?? 'website'
  const resolvedImage = image ?? managed?.ogImage ?? undefined
  const resolvedNoindex = noindex ?? managed?.noindex ?? false

  const managedSchemas = managed?.schemaJson?.length ? managed.schemaJson : []
  const extraSchemas = normalizeJsonLdArray(jsonLdProp)

  let jsonLd: JsonLd | undefined
  if (managedSchemas.length > 0) {
    jsonLd = toJsonLdOutput(mergeJsonLd(managedSchemas, extraSchemas))
  } else if (extraSchemas.length > 0) {
    jsonLd = toJsonLdOutput(extraSchemas)
  } else if (breadcrumbItems && breadcrumbItems.length > 0) {
    jsonLd = breadcrumbJsonLd(breadcrumbItems)
  }

  return (
    <SEO
      title={title}
      description={description}
      path={path}
      keywords={keywords}
      jsonLd={jsonLd}
      noindex={resolvedNoindex}
      ogType={resolvedOgType}
      image={resolvedImage}
    />
  )
}
