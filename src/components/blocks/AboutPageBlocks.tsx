import { Link } from 'react-router-dom'
import ContentIcon, { type ContentIconName } from '../ContentIcon'
import { isContentIconName } from '../BlogListingSection'
import { siteConfig } from '../../config/site'
import {
  aboutAudiences,
  aboutMilestones,
  aboutStats,
  aboutValues,
} from '../../data/about'
import { getBlockCtaLink, getHeroButton } from '../../lib/blockHelpers'
import type { SitePageBlock } from '../../lib/sitePageBlocks'
import '../../styles/about.css'

type ValueItem = {
  icon: ContentIconName
  title: string
  description: string
}

type AudienceItem = {
  title: string
  description: string
  points: string[]
}

type MilestoneItem = {
  year: string
  title: string
  description: string
}

function getHeroFacts(panelBlock?: SitePageBlock): string[] {
  if (panelBlock && Array.isArray(panelBlock.facts)) {
    return panelBlock.facts as string[]
  }
  return [
    'Bring your own OpenAI & Anthropic keys',
    'No hidden token markup on AI usage',
    'SEO-friendly blog generation live today',
    'Social posts and HTML email newsletters included',
  ]
}

function getHeroStats(panelBlock?: SitePageBlock) {
  if (panelBlock && Array.isArray(panelBlock.stats)) {
    return panelBlock.stats as { value: string; label: string }[]
  }
  return aboutStats
}

function getValues(block: SitePageBlock): ValueItem[] {
  if (Array.isArray(block.items) && block.items.length > 0) {
    return (block.items as { icon?: string; title: string; description: string }[]).map((item) => ({
      icon: item.icon && isContentIconName(item.icon) ? item.icon : 'platform',
      title: item.title,
      description: item.description,
    }))
  }
  return aboutValues
}

function getAudiences(block: SitePageBlock): AudienceItem[] {
  if (Array.isArray(block.items) && block.items.length > 0) {
    return block.items as AudienceItem[]
  }
  return aboutAudiences
}

function getMilestones(block: SitePageBlock): MilestoneItem[] {
  if (Array.isArray(block.items) && block.items.length > 0) {
    return block.items as MilestoneItem[]
  }
  return aboutMilestones
}

export function AboutHeroSection({
  block,
  panelBlock,
}: {
  block: SitePageBlock
  panelBlock?: SitePageBlock
}) {
  const facts = getHeroFacts(panelBlock)
  const stats = getHeroStats(panelBlock)
  const primary = getHeroButton(block, 'primary')
  const secondary = getHeroButton(block, 'secondary')
  const panelLabel = String(panelBlock?.label ?? 'At a glance')

  return (
    <section className="about-hero" aria-labelledby="about-heading">
      <div className="about-container">
        <nav className="about-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{String(block.breadcrumb ?? 'About')}</span>
        </nav>

        <div className="about-hero-grid">
          <div className="about-hero-copy">
            {block.eyebrow ? <p className="about-eyebrow">{String(block.eyebrow)}</p> : null}
            <h1 id="about-heading">{String(block.title ?? '')}</h1>
            {block.lead ? <p className="about-hero-lead">{String(block.lead)}</p> : null}
            {primary || secondary ? (
              <div className="about-hero-actions">
                {primary ? (
                  <Link to={primary.to} className="btn btn-primary btn-lg">
                    {primary.label}
                  </Link>
                ) : null}
                {secondary ? (
                  <Link to={secondary.to} className="btn btn-secondary btn-lg">
                    {secondary.label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="about-hero-panel">
            <p className="about-hero-panel-label">{panelLabel}</p>
            <ul className="about-hero-facts">
              {facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <div className="about-hero-stats">
              {stats.map((stat) => (
                <article key={stat.label} className="about-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AboutStoryQuoteSection({ block }: { block: SitePageBlock }) {
  const eyebrow = String(block.eyebrow ?? 'Our story')
  const heading = String(block.heading ?? 'Why we built Content AI')
  const paragraphs = Array.isArray(block.paragraphs)
    ? (block.paragraphs as string[])
    : [
        'Most AI writing platforms lock you into their subscriptions, their models, and their markup. We saw creators paying twice — once for a SaaS tool and again for tokens they could buy directly from OpenAI or Anthropic.',
        'Content AI takes a different approach. You connect your own API keys, choose your models, and use our workflows to generate blogs and content faster. We focus on prompts, structure, and export — the parts that save you time — while you stay in full control of cost and data.',
      ]
  const quote = String(
    block.quote ??
      'AI should amplify your creativity, not replace it — and you should always own your keys, your content, and your spend.',
  )
  const quoteAttribution = String(block.quoteAttribution ?? `— The ${siteConfig.name} team`)

  return (
    <section className="about-story" aria-labelledby={`${block.id}-heading`}>
      <div className="about-container about-story-grid">
        <div className="about-story-copy">
          <p className="about-eyebrow about-eyebrow--plain">{eyebrow}</p>
          <h2 id={`${block.id}-heading`}>{heading}</h2>
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        <blockquote className="about-quote">
          <p>&ldquo;{quote}&rdquo;</p>
          <footer>{quoteAttribution}</footer>
        </blockquote>
      </div>
    </section>
  )
}

export function AboutValuesSection({ block }: { block: SitePageBlock }) {
  const values = getValues(block)
  const eyebrow = String(block.eyebrow ?? 'Our values')
  const heading = String(block.heading ?? 'What we stand for')
  const description = String(block.description ?? 'Principles that guide every feature we ship.')

  return (
    <section className="about-section about-section--soft" aria-labelledby={`${block.id}-heading`}>
      <div className="about-container">
        <div className="about-section-head">
          <p className="about-eyebrow about-eyebrow--plain">{eyebrow}</p>
          <h2 id={`${block.id}-heading`}>{heading}</h2>
          <p>{description}</p>
        </div>
        <div className="about-values-grid">
          {values.map((value) => (
            <article key={value.title} className="about-value-card">
              <ContentIcon name={value.icon} />
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutAudienceGridSection({ block }: { block: SitePageBlock }) {
  const audiences = getAudiences(block)
  const eyebrow = String(block.eyebrow ?? 'Who we serve')
  const heading = String(block.heading ?? 'Built for every content workflow')
  const description = String(block.description ?? 'From solo bloggers to agencies — Content AI scales with you.')

  return (
    <section className="about-section" aria-labelledby={`${block.id}-heading`}>
      <div className="about-container">
        <div className="about-section-head">
          <p className="about-eyebrow about-eyebrow--plain">{eyebrow}</p>
          <h2 id={`${block.id}-heading`}>{heading}</h2>
          <p>{description}</p>
        </div>
        <div className="about-audience-grid">
          {audiences.map((audience) => (
            <article key={audience.title} className="about-audience-card">
              <h3>{audience.title}</h3>
              <p className="about-audience-desc">{audience.description}</p>
              <ul className="feature-list">
                {audience.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutTimelineSection({ block }: { block: SitePageBlock }) {
  const milestones = getMilestones(block)
  const eyebrow = String(block.eyebrow ?? 'Our journey')
  const heading = String(block.heading ?? 'Where we are today')

  return (
    <section className="about-section about-section--soft" aria-labelledby={`${block.id}-heading`}>
      <div className="about-container">
        <div className="about-section-head">
          <p className="about-eyebrow about-eyebrow--plain">{eyebrow}</p>
          <h2 id={`${block.id}-heading`}>{heading}</h2>
        </div>
        <ol className="about-timeline">
          {milestones.map((milestone) => (
            <li key={milestone.title} className="about-timeline-item">
              <span className="about-timeline-year">{milestone.year}</span>
              <div>
                <h3>{milestone.title}</h3>
                <p>{milestone.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function AboutCtaSection({ block }: { block: SitePageBlock }) {
  const primary = getBlockCtaLink(block, 'primary')
  const secondary = getBlockCtaLink(block, 'secondary')

  return (
    <section className="about-cta" aria-labelledby={`${block.id}-heading`}>
      <div className="about-container about-cta-inner">
        <div>
          <h2 id={`${block.id}-heading`}>{String(block.title ?? '')}</h2>
          {block.description ? <p>{String(block.description)}</p> : null}
        </div>
        {primary || secondary ? (
          <div className="about-cta-actions">
            {primary ? (
              <Link to={primary.to} className="btn btn-primary btn-lg">
                {primary.label}
              </Link>
            ) : null}
            {secondary ? (
              <Link to={secondary.to} className="btn btn-ghost btn-lg">
                {secondary.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
