import type { SitePageBlock } from '../../lib/sitePageBlocks'
import {
  StatusCtaSection,
  StatusGroupsSection,
  StatusGuideLinksSection,
  StatusHeroSection,
  StatusIncidentsSection,
  StatusMetricsSection,
} from './StatusPageBlocks'
import '../../styles/status.css'

type StatusBlocksRendererProps = {
  blocks: SitePageBlock[]
}

export default function StatusBlocksRenderer({ blocks }: StatusBlocksRendererProps) {
  const hero = blocks.find((block) => block.type === 'hero')
  const statusBanner = blocks.find((block) => block.type === 'statusBanner')
  const statusMetricsBlock = blocks.find((block) => block.type === 'statusMetrics')
  const statusGroupsBlock = blocks.find((block) => block.type === 'statusGroups')
  const statusIncidentsBlock = blocks.find((block) => block.type === 'statusIncidents')
  const guideLinks = blocks.find((block) => block.type === 'guideLinks')
  const ctaBlocks = blocks.filter((block) => block.type === 'cta')

  return (
    <div className="status-page">
      {hero ? <StatusHeroSection block={hero} bannerBlock={statusBanner} /> : null}
      {statusMetricsBlock ? <StatusMetricsSection block={statusMetricsBlock} /> : null}
      {statusGroupsBlock ? <StatusGroupsSection block={statusGroupsBlock} /> : null}
      {statusIncidentsBlock ? <StatusIncidentsSection block={statusIncidentsBlock} /> : null}
      {guideLinks ? <StatusGuideLinksSection block={guideLinks} /> : null}
      {ctaBlocks.map((block) => (
        <StatusCtaSection key={block.id} block={block} />
      ))}
    </div>
  )
}
