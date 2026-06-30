import type { SitePageBlock } from '../../lib/sitePageBlocks'
import {
  PricingCreditExamplesSection,
  PricingCtaSection,
  PricingFaqSection,
  PricingHeroSection,
  PricingPlansSection,
  PricingStepsSection,
} from './PricingPageBlocks'
import '../../styles/pricing.css'

type PricingBlocksRendererProps = {
  blocks: SitePageBlock[]
}

export default function PricingBlocksRenderer({ blocks }: PricingBlocksRendererProps) {
  const hero = blocks.find((block) => block.type === 'hero')
  const pricingPlans = blocks.find((block) => block.type === 'pricingPlans')
  const creditExamples = blocks.find((block) => block.type === 'creditExamples')
  const steps = blocks.find((block) => block.type === 'steps')
  const faqList = blocks.find((block) => block.type === 'faqList')
  const ctaBlocks = blocks.filter((block) => block.type === 'cta')

  return (
    <div className="pricing-page">
      {hero ? <PricingHeroSection block={hero} /> : null}
      {pricingPlans ? <PricingPlansSection block={pricingPlans} /> : null}
      {creditExamples ? <PricingCreditExamplesSection block={creditExamples} /> : null}
      {steps ? <PricingStepsSection block={steps} /> : null}
      {faqList ? <PricingFaqSection block={faqList} /> : null}
      {ctaBlocks.map((block) => (
        <PricingCtaSection key={block.id} block={block} />
      ))}
    </div>
  )
}
