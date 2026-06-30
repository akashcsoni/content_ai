import { Link } from 'react-router-dom'
import ContentIcon from '../ContentIcon'
import { liveServices, servicesStats } from '../../data/services'
import { getBlockCtaLink, getHeroButton } from '../../lib/blockHelpers'
import type { SitePageBlock } from '../../lib/sitePageBlocks'
import '../../styles/services.css'

function getStatsItems(statsBlock?: SitePageBlock) {
  if (statsBlock && Array.isArray(statsBlock.items)) {
    return statsBlock.items as { value: string; label: string }[]
  }
  return servicesStats
}

export function ServicesHeroSection({
  block,
  statsBlock,
}: {
  block: SitePageBlock
  statsBlock?: SitePageBlock
}) {
  const stats = getStatsItems(statsBlock)
  const primary = getHeroButton(block, 'primary')
  const secondary = getHeroButton(block, 'secondary')

  return (
    <section className="services-hero" aria-labelledby="services-heading">
      <div className="services-container">
        <nav className="services-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{String(block.breadcrumb ?? 'Services')}</span>
        </nav>

        <div className="services-hero-grid">
          <div className="services-hero-copy">
            {block.eyebrow ? <p className="services-eyebrow">{String(block.eyebrow)}</p> : null}
            <h1 id="services-heading">{String(block.title ?? '')}</h1>
            {block.lead ? <p className="services-hero-lead">{String(block.lead)}</p> : null}
            {primary || secondary ? (
              <div className="services-hero-actions">
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

          <div className="services-hero-stats" aria-label="Services overview">
            {stats.map((stat) => (
              <article key={stat.label} className="services-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ServicesOverviewSection({ block }: { block: SitePageBlock }) {
  const liveCount = liveServices.length
  const heading = String(block.heading ?? 'Browse all services')
  const description = String(
    block.description ?? `${liveCount} live service${liveCount === 1 ? '' : 's'} available now`,
  )

  return (
    <section className="services-overview" aria-labelledby="overview-heading">
      <div className="services-container">
        <div className="services-section-head">
          <h2 id="overview-heading">{heading}</h2>
          <p>{description}</p>
        </div>

        <nav className="services-jump-nav" aria-label="Jump to service">
          {liveServices.map((service) => (
            <a key={service.id} href={`#${service.id}`} className="services-jump-link">
              <ContentIcon name={service.icon} className="services-jump-icon" />
              <span>{service.title}</span>
            </a>
          ))}
        </nav>

        <div className="services-overview-grid">
          {liveServices.map((service) => (
            <a
              key={service.id}
              href={`#${service.id}`}
              className="services-overview-card services-overview-card--live"
            >
              <ContentIcon name={service.icon} />
              <h3>{service.title}</h3>
              <p>{service.shortDescription}</p>
              <span className="services-overview-status">Available now</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ServicesDetailsSection({ block: _block }: { block: SitePageBlock }) {
  return (
    <section className="services-details" aria-label="Service details">
      <div className="services-container services-details-list">
        {liveServices.map((service, index) => (
          <article
            key={service.id}
            id={service.id}
            className={`services-detail ${index % 2 === 1 ? 'services-detail--reverse' : ''} services-detail--live`}
            aria-labelledby={`${service.id}-title`}
          >
            <div className="services-detail-copy">
              <div className="services-detail-top">
                <ContentIcon name={service.icon} />
                <span className="services-status-badge services-status-badge--live">Live now</span>
              </div>
              <h2 id={`${service.id}-title`}>{service.title}</h2>
              <p className="services-detail-lead">{service.description}</p>
              <ul className="feature-list services-feature-list">
                {service.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link to="/contact" className="btn btn-primary">
                Get started with {service.title}
              </Link>
            </div>

            <div className="services-detail-visual">
              <div className="services-preview">
                <span className="services-preview-label">Workflow preview</span>
                <div className="services-preview-steps">
                  <div className="services-preview-step">
                    <span>1</span>
                    <p>Connect OpenAI or Anthropic API key</p>
                  </div>
                  <div className="services-preview-step">
                    <span>2</span>
                    <p>Set topic, tone, keywords & length</p>
                  </div>
                  <div className="services-preview-step">
                    <span>3</span>
                    <p>Export SEO-ready Markdown or HTML</p>
                  </div>
                </div>
                <div className="services-preview-tags">
                  <span>BYOK</span>
                  <span>SEO optimized</span>
                  <span>Any CMS</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function ServicesCtaSection({ block }: { block: SitePageBlock }) {
  const primary = getBlockCtaLink(block, 'primary')
  const secondary = getBlockCtaLink(block, 'secondary')

  return (
    <section className="services-cta" aria-labelledby={`${block.id}-heading`}>
      <div className="services-container services-cta-inner">
        <div>
          <h2 id={`${block.id}-heading`}>{String(block.title ?? '')}</h2>
          {block.description ? <p>{String(block.description)}</p> : null}
        </div>
        {primary || secondary ? (
          <div className="services-cta-actions">
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
