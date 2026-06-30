import type { SitePageBlock } from '../../lib/sitePageBlocks'
import {
  ServicesCtaSection,
  ServicesDetailsSection,
  ServicesHeroSection,
  ServicesOverviewSection,
} from './ServicesPageBlocks'
import '../../styles/services.css'

type ServicesBlocksRendererProps = {
  blocks: SitePageBlock[]
}

export default function ServicesBlocksRenderer({ blocks }: ServicesBlocksRendererProps) {
  const hero = blocks.find((block) => block.type === 'hero')
  const stats = blocks.find((block) => block.type === 'stats')
  const serviceOverview = blocks.find((block) => block.type === 'serviceOverview')
  const serviceDetails = blocks.find((block) => block.type === 'serviceDetails')
  const ctaBlocks = blocks.filter((block) => block.type === 'cta')

  return (
    <div className="services-page">
      {hero ? <ServicesHeroSection block={hero} statsBlock={stats} /> : null}
      {serviceOverview ? <ServicesOverviewSection block={serviceOverview} /> : null}
      {serviceDetails ? <ServicesDetailsSection block={serviceDetails} /> : null}
      {ctaBlocks.map((block) => (
        <ServicesCtaSection key={block.id} block={block} />
      ))}
    </div>
  )
}
