import type { SitePageBlock } from '../../lib/sitePageBlocks'
import {
  AboutAudienceGridSection,
  AboutCtaSection,
  AboutHeroSection,
  AboutStoryQuoteSection,
  AboutTimelineSection,
  AboutValuesSection,
} from './AboutPageBlocks'
import '../../styles/about.css'

type AboutBlocksRendererProps = {
  blocks: SitePageBlock[]
}

export default function AboutBlocksRenderer({ blocks }: AboutBlocksRendererProps) {
  const hero = blocks.find((block) => block.type === 'hero')
  const heroPanel = blocks.find((block) => block.type === 'heroPanel')
  const storyQuote = blocks.find((block) => block.type === 'storyQuote')
  const featureGrid = blocks.find((block) => block.type === 'featureGrid')
  const audienceGrid = blocks.find((block) => block.type === 'audienceGrid')
  const timeline = blocks.find((block) => block.type === 'timeline')
  const ctaBlocks = blocks.filter((block) => block.type === 'cta')

  return (
    <div className="about-page">
      {hero ? <AboutHeroSection block={hero} panelBlock={heroPanel} /> : null}
      {storyQuote ? <AboutStoryQuoteSection block={storyQuote} /> : null}
      {featureGrid ? <AboutValuesSection block={featureGrid} /> : null}
      {audienceGrid ? <AboutAudienceGridSection block={audienceGrid} /> : null}
      {timeline ? <AboutTimelineSection block={timeline} /> : null}
      {ctaBlocks.map((block) => (
        <AboutCtaSection key={block.id} block={block} />
      ))}
    </div>
  )
}
