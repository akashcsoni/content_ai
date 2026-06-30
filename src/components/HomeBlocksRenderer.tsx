import { Link } from 'react-router-dom'
import ContentIcon, { type ContentIconName } from './ContentIcon'
import ServiceCard from './ServiceCard'
import HomeServiceMockupSlider from './HomeServiceMockupSlider'
import { isContentIconName } from './BlogListingSection'
import type { Service } from '../data/services'
import { isFrontendPublicService } from '../data/services'
import type { SitePageBlock } from '../lib/sitePageBlocks'
import { getBlockCtaLink, getHeroButton } from '../lib/blockHelpers'
import '../styles/home.css'

type HomeBlocksRendererProps = {
  blocks: SitePageBlock[]
}

function toService(item: {
  id: string
  title: string
  shortDescription: string
  description: string
  features: string[]
  icon: string
  available: boolean
}): Service {
  return {
    ...item,
    icon: isContentIconName(item.icon) ? item.icon : 'blog',
    creditCost: 1,
  }
}

export default function HomeBlocksRenderer({ blocks }: HomeBlocksRendererProps) {
  const hero = blocks.find((block) => block.type === 'hero')
  const tailBlocks = blocks.filter((block) => block.type !== 'hero')

  return (
    <div className="home">
      {hero ? (
        <section className="home-hero" aria-labelledby="home-heading">
          <div className="home-container home-hero-grid">
            <div className="home-hero-copy">
              {hero.eyebrow ? (
                <p className="home-eyebrow">
                  <span className="home-eyebrow-dot" aria-hidden="true" />
                  {String(hero.eyebrow)}
                </p>
              ) : null}
              <h1 id="home-heading">{String(hero.title ?? '')}</h1>
              {hero.lead ? <p className="home-hero-lead">{String(hero.lead)}</p> : null}

              {getHeroButton(hero, 'primary') || getHeroButton(hero, 'secondary') ? (
                <div className="home-hero-actions">
                  {getHeroButton(hero, 'primary') ? (
                    <Link to={getHeroButton(hero, 'primary')!.to} className="btn btn-primary btn-lg">
                      {getHeroButton(hero, 'primary')!.label}
                    </Link>
                  ) : null}
                  {getHeroButton(hero, 'secondary') ? (
                    <Link to={getHeroButton(hero, 'secondary')!.to} className="btn btn-secondary btn-lg">
                      {getHeroButton(hero, 'secondary')!.label}
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {Array.isArray(hero.checklist) && hero.checklist.length > 0 ? (
                <ul className="home-hero-checklist" aria-label="Key benefits">
                  {(hero.checklist as string[]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            {hero.showVisual !== false ? <HomeServiceMockupSlider /> : null}
          </div>
        </section>
      ) : null}

      {tailBlocks.map((block) => renderHomeBlock(block))}
    </div>
  )
}

function renderHomeBlock(block: SitePageBlock) {
  switch (block.type) {
    case 'trustBand': {
      const items = Array.isArray(block.items) ? (block.items as string[]) : []
      return (
        <section key={block.id} className="home-trust" aria-label="Supported AI providers">
          <div className="home-container">
            {block.label ? <p>{String(block.label)}</p> : null}
            <ul className="home-trust-list">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )
    }

    case 'stats': {
      const items = Array.isArray(block.items) ? (block.items as { value: string; label: string }[]) : []
      return (
        <section key={block.id} className="home-stats-section" aria-label="Platform highlights">
          <div className="home-container home-stats-grid">
            {items.map((item) => (
              <article key={`${block.id}-${item.label}`} className="home-stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </section>
      )
    }

    case 'steps': {
      const items = Array.isArray(block.items)
        ? (block.items as { number: string; title: string; description: string }[])
        : []
      return (
        <section key={block.id} className="home-section" aria-labelledby={`${block.id}-heading`}>
          <div className="home-container">
            <div className="home-section-header">
              {block.eyebrow ? <p className="home-eyebrow home-eyebrow--plain">{String(block.eyebrow)}</p> : null}
              {block.heading ? <h2 id={`${block.id}-heading`}>{String(block.heading)}</h2> : null}
              {block.description ? <p>{String(block.description)}</p> : null}
            </div>
            <ol className="home-steps">
              {items.map((item) => (
                <li key={`${block.id}-${item.number}`} className="home-step">
                  <span className="home-step-number">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )
    }

    case 'serviceCards': {
      const items = Array.isArray(block.items)
        ? (block.items as {
            id: string
            title: string
            shortDescription: string
            description: string
            features: string[]
            icon: string
            available: boolean
          }[])
        : []
      return (
        <section key={block.id} className="home-section home-section--soft" aria-labelledby={`${block.id}-heading`}>
          <div className="home-container">
            <div className="home-section-header">
              {block.eyebrow ? <p className="home-eyebrow home-eyebrow--plain">{String(block.eyebrow)}</p> : null}
              {block.heading ? <h2 id={`${block.id}-heading`}>{String(block.heading)}</h2> : null}
              {block.description ? <p>{String(block.description)}</p> : null}
            </div>
            <div className="home-service-grid">
              {items.filter(isFrontendPublicService).map((service) => (
                <ServiceCard key={service.id} service={toService(service)} linkTo={`/services#${service.id}`} />
              ))}
            </div>
          </div>
        </section>
      )
    }

    case 'featuredSpotlight': {
      const panel =
        block.panel && typeof block.panel === 'object'
          ? (block.panel as { label: string; title: string; description: string; tags: string[] })
          : null
      const features = Array.isArray(block.features) ? (block.features as string[]) : []
      const cta = getBlockCtaLink(block, 'cta')

      return (
        <section key={block.id} className="home-feature" aria-labelledby={`${block.id}-heading`}>
          <div className="home-container home-feature-grid">
            <div className="home-feature-copy">
              {block.eyebrow ? <p className="home-eyebrow home-eyebrow--plain">{String(block.eyebrow)}</p> : null}
              <h2 id={`${block.id}-heading`}>{String(block.title ?? '')}</h2>
              {block.description ? <p className="home-feature-lead">{String(block.description)}</p> : null}
              {features.length > 0 ? (
                <ul className="feature-list home-feature-list">
                  {features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : null}
              {cta ? (
                <Link to={cta.to} className="btn btn-primary">
                  {cta.label}
                </Link>
              ) : null}
            </div>
            {panel ? (
              <div className="home-feature-panel">
                <div className="home-feature-card">
                  <span className="home-feature-card-label">{panel.label}</span>
                  <h3>{panel.title}</h3>
                  <p>{panel.description}</p>
                  {panel.tags?.length ? (
                    <div className="home-feature-tags">
                      {panel.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )
    }

    case 'featureGrid': {
      const items = Array.isArray(block.items)
        ? (block.items as { icon?: string; title: string; description: string }[])
        : []
      return (
        <section key={block.id} className="home-section" aria-labelledby={`${block.id}-heading`}>
          <div className="home-container">
            <div className="home-section-header">
              {block.eyebrow ? <p className="home-eyebrow home-eyebrow--plain">{String(block.eyebrow)}</p> : null}
              {block.heading ? <h2 id={`${block.id}-heading`}>{String(block.heading)}</h2> : null}
              {block.description ? <p>{String(block.description)}</p> : null}
            </div>
            <div className="home-benefits-grid">
              {items.map((item) => (
                <article key={`${block.id}-${item.title}`} className="home-benefit">
                  {item.icon && isContentIconName(item.icon) ? (
                    <ContentIcon name={item.icon as ContentIconName} />
                  ) : null}
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )
    }

    case 'cta': {
      const primary = getBlockCtaLink(block, 'primary')
      const secondary = getBlockCtaLink(block, 'secondary')
      return (
        <section key={block.id} className="home-cta" aria-labelledby={`${block.id}-heading`}>
          <div className="home-container home-cta-inner">
            <div>
              <h2 id={`${block.id}-heading`}>{String(block.title ?? '')}</h2>
              {block.description ? <p>{String(block.description)}</p> : null}
            </div>
            <div className="home-cta-actions">
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
          </div>
        </section>
      )
    }

    default:
      return null
  }
}
