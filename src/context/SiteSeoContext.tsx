import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { siteSeoApi, type SitePageSeoRecord } from '../lib/api'

type SiteSeoContextValue = {
  pagesByKey: Record<string, SitePageSeoRecord>
  pagesByPath: Record<string, SitePageSeoRecord>
  loading: boolean
  error: string
  refresh: () => Promise<void>
}

const SiteSeoContext = createContext<SiteSeoContextValue | null>(null)

export function SiteSeoProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<SitePageSeoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const response = await siteSeoApi.listPages()
      setPages(response.pages)
    } catch (err) {
      setPages([])
      setError(err instanceof Error ? err.message : 'Failed to load page SEO data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const pagesByKey = useMemo(
    () => Object.fromEntries(pages.map((page) => [page.pageKey, page])),
    [pages],
  )

  const pagesByPath = useMemo(
    () => Object.fromEntries(pages.map((page) => [page.path, page])),
    [pages],
  )

  return (
    <SiteSeoContext.Provider value={{ pagesByKey, pagesByPath, loading, error, refresh }}>
      {children}
    </SiteSeoContext.Provider>
  )
}

export function useSiteSeoContext() {
  return useContext(SiteSeoContext)
}

export function useSitePageSeo(pageKey: string): SitePageSeoRecord | null {
  const context = useSiteSeoContext()
  return context?.pagesByKey[pageKey] ?? null
}
