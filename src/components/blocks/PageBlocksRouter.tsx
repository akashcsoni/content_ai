import type { SitePageBlock } from '../../lib/sitePageBlocks'
import type { PageSeoKey } from '../../config/seo'
import HomeBlocksRenderer from '../HomeBlocksRenderer'
import SitePageBlocksRenderer from '../SitePageBlocksRenderer'
import AboutBlocksRenderer from './AboutBlocksRenderer'
import ContactBlocksRenderer from './ContactBlocksRenderer'
import FAQBlocksRenderer from './FAQBlocksRenderer'
import PricingBlocksRenderer from './PricingBlocksRenderer'
import ServicesBlocksRenderer from './ServicesBlocksRenderer'
import StatusBlocksRenderer from './StatusBlocksRenderer'

type PageBlocksRouterProps = {
  pageKey: PageSeoKey | string
  blocks: SitePageBlock[]
}

export default function PageBlocksRouter({ pageKey, blocks }: PageBlocksRouterProps) {
  switch (pageKey) {
    case 'home':
      return <HomeBlocksRenderer blocks={blocks} />
    case 'contact':
      return <ContactBlocksRenderer blocks={blocks} />
    case 'services':
      return <ServicesBlocksRenderer blocks={blocks} />
    case 'pricing':
      return <PricingBlocksRenderer blocks={blocks} />
    case 'about':
      return <AboutBlocksRenderer blocks={blocks} />
    case 'faq':
      return <FAQBlocksRenderer blocks={blocks} />
    case 'status':
      return <StatusBlocksRenderer blocks={blocks} />
    default:
      return <SitePageBlocksRenderer blocks={blocks} pageKey={pageKey} />
  }
}
