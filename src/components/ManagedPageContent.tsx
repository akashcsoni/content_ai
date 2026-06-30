import type { ReactNode } from 'react'
import ManagedSEO from './ManagedSEO'
import PageBlocksRouter from './blocks/PageBlocksRouter'
import { useSitePageSeo } from '../context/SiteSeoContext'
import type { PageSeoKey } from '../config/seo'
import type { SitePageBlock } from '../lib/sitePageBlocks'

type JsonLd = Record<string, unknown> | Record<string, unknown>[]

type ManagedPageContentProps = {
  pageKey: PageSeoKey
  breadcrumbItems?: { name: string; path: string }[]
  jsonLd?: JsonLd
  noindex?: boolean
  replace?: boolean
  children: ReactNode
}

export default function ManagedPageContent({
  pageKey,
  breadcrumbItems,
  jsonLd,
  noindex,
  replace = false,
  children,
}: ManagedPageContentProps) {
  const managed = useSitePageSeo(pageKey)
  const blocks =
    managed?.contentActive && managed.contentBlocks && managed.contentBlocks.length > 0
      ? (managed.contentBlocks as SitePageBlock[])
      : null

  return (
    <>
      <ManagedSEO
        pageKey={pageKey}
        breadcrumbItems={breadcrumbItems}
        jsonLd={jsonLd}
        noindex={noindex}
      />
      {blocks ? <PageBlocksRouter pageKey={pageKey} blocks={blocks} /> : null}
      {!blocks || !replace ? children : null}
    </>
  )
}
