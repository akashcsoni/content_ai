import ManagedPageContent from '../components/ManagedPageContent'
import StaticPageLayout from '../components/StaticPageLayout'
import { useSitePageSeo } from '../context/SiteSeoContext'
import { staticPages, type StaticPageKey } from '../data/staticPages'

type StaticContentPageProps = {
  pageKey: StaticPageKey
}

export default function StaticContentPage({ pageKey }: StaticContentPageProps) {
  const fallbackPage = staticPages[pageKey]
  const managed = useSitePageSeo(pageKey)
  const breadcrumbName =
    managed?.contentBlocks?.find((block) => block.type === 'hero')?.breadcrumb ?? fallbackPage.breadcrumb
  const breadcrumbPath = managed?.path ?? fallbackPage.path

  return (
    <ManagedPageContent
      pageKey={pageKey}
      breadcrumbItems={[
        { name: 'Home', path: '/' },
        { name: String(breadcrumbName), path: breadcrumbPath },
      ]}
      replace
    >
      <StaticPageLayout page={fallbackPage} pageKey={pageKey} includeSeo={false} />
    </ManagedPageContent>
  )
}
