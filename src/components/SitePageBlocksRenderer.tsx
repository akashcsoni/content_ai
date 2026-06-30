import { Link } from 'react-router-dom'
import BlogListingSection, { isContentIconName } from './BlogListingSection'
import ContentIcon, { type ContentIconName } from './ContentIcon'
import ServiceCard from './ServiceCard'
import type { Service } from '../data/services'
import { isFrontendPublicService } from '../data/services'
import type { SitePageBlock } from '../lib/sitePageBlocks'
import type { PageSeoKey } from '../config/seo'
import { getBlockCtaLink, getHeroButton, isMarketingHero } from '../lib/blockHelpers'
import '../styles/static-page.css'
import '../styles/site-blocks.css'

const statusLabels = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
} as const

type SitePageBlocksRendererProps = {
  blocks: SitePageBlock[]
  pageKey?: PageSeoKey | string
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

function renderSectionHeader(block: SitePageBlock, headingId?: string) {
  return (
    <>
      {block.eyebrow ? <p className="site-blocks-eyebrow">{String(block.eyebrow)}</p> : null}
      {block.heading ? (
        <h2 id={headingId}>{String(block.heading)}</h2>
      ) : null}
      {block.description ? <p className="site-blocks-section-lead">{String(block.description)}</p> : null}
    </>
  )
}

export default function SitePageBlocksRenderer({ blocks, pageKey }: SitePageBlocksRendererProps) {
  const hero = blocks.find((block) => block.type === 'hero')
  const contentBlocks = blocks.filter((block) => block.type !== 'hero' && block.type !== 'cta')
  const ctaBlocks = blocks.filter((block) => block.type === 'cta')

  return (
    <div className={`static-page site-blocks-page site-blocks-page--${pageKey ?? 'default'}`}>
      {hero ? (
        <section
          className={isMarketingHero(hero) ? 'site-blocks-marketing-hero' : 'static-hero'}
          aria-labelledby="static-page-heading"
        >
          <div className="static-container">
            {!isMarketingHero(hero) && hero.breadcrumb ? (
              <nav className="static-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span aria-hidden="true">/</span>
                <span>{String(hero.breadcrumb)}</span>
              </nav>
            ) : null}

            {hero.eyebrow ? <p className="static-eyebrow">{String(hero.eyebrow)}</p> : null}
            <h1 id="static-page-heading">{String(hero.title ?? '')}</h1>
            {hero.lead ? <p className="static-hero-lead">{String(hero.lead)}</p> : null}
            {hero.updated ? <p className="static-updated">{String(hero.updated)}</p> : null}

            {Array.isArray(hero.checklist) && hero.checklist.length > 0 ? (
              <ul className="site-blocks-checklist">
                {(hero.checklist as string[]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}

            {getHeroButton(hero, 'primary') || getHeroButton(hero, 'secondary') ? (
              <div className="site-blocks-hero-actions">
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
          </div>
        </section>
      ) : null}

      {contentBlocks.length > 0 ? (
        <section className="static-content" aria-label="Page content">
          <div className="static-container">
            {contentBlocks.map((block) => renderBlock(block))}
          </div>
        </section>
      ) : null}

      {ctaBlocks.map((block) => renderCtaBlock(block))}
    </div>
  )
}

function renderBlock(block: SitePageBlock) {
  switch (block.type) {
    case 'stats': {
      const items = Array.isArray(block.items) ? (block.items as { value: string; label: string }[]) : []
      return (
        <div key={block.id} className="site-blocks-stats">
          {items.map((item) => (
            <article key={`${block.id}-${item.label}`} className="site-blocks-stat">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      )
    }

    case 'featureGrid': {
      const items = Array.isArray(block.items)
        ? (block.items as { icon?: string; title: string; description: string }[])
        : []
      return (
        <div key={block.id} className="site-blocks-feature-section">
          {renderSectionHeader(block, `${block.id}-heading`)}
          <div className="site-blocks-feature-grid">
            {items.map((item) => (
              <article key={`${block.id}-${item.title}`} className="site-blocks-feature-card">
                {item.icon && isContentIconName(item.icon) ? (
                  <ContentIcon name={item.icon as ContentIconName} className="site-blocks-feature-icon" />
                ) : null}
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      )
    }

    case 'steps': {
      const items = Array.isArray(block.items)
        ? (block.items as { number: string; title: string; description: string }[])
        : []
      return (
        <div key={block.id} className="site-blocks-steps-section">
          {renderSectionHeader(block, `${block.id}-heading`)}
          <ol className="site-blocks-steps">
            {items.map((item) => (
              <li key={`${block.id}-${item.number}`}>
                <span className="site-blocks-step-number">{item.number}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
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
        <div key={block.id} className="site-blocks-services">
          {renderSectionHeader(block, `${block.id}-heading`)}
          <div className="site-blocks-service-grid">
            {items.filter(isFrontendPublicService).map((service) => (
              <ServiceCard key={service.id} service={toService(service)} linkTo={`/services#${service.id}`} />
            ))}
          </div>
        </div>
      )
    }

    case 'trustBand': {
      const items = Array.isArray(block.items) ? (block.items as string[]) : []
      return (
        <div key={block.id} className="site-blocks-trust-band">
          {block.label ? <p>{String(block.label)}</p> : null}
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )
    }

    case 'featuredSpotlight': {
      const features = Array.isArray(block.features) ? (block.features as string[]) : []
      const cta = getBlockCtaLink(block, 'cta')
      const panel =
        block.panel && typeof block.panel === 'object'
          ? (block.panel as { label: string; title: string; description: string; tags: string[] })
          : null
      return (
        <article key={block.id} className="site-blocks-featured-spotlight">
          {block.eyebrow ? <p className="site-blocks-eyebrow">{String(block.eyebrow)}</p> : null}
          <h2>{String(block.title ?? '')}</h2>
          {block.description ? <p className="site-blocks-section-lead">{String(block.description)}</p> : null}
          {features.length > 0 ? (
            <ul>
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
          {panel ? (
            <div className="site-blocks-featured-panel">
              <span>{panel.label}</span>
              <h3>{panel.title}</h3>
              <p>{panel.description}</p>
            </div>
          ) : null}
        </article>
      )
    }

    case 'pricingPlans': {
      const plans = Array.isArray(block.plans)
        ? (block.plans as {
            id: string
            name: string
            price: string
            period: string
            description: string
            credits: string
            highlighted: boolean
            cta: string
            ctaLink: string
            features: string[]
          }[])
        : []
      return (
        <div key={block.id} className="site-blocks-pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`site-blocks-pricing-card${plan.highlighted ? ' site-blocks-pricing-card--featured' : ''}`}
            >
              <p className="site-blocks-pricing-label">{plan.name}</p>
              <div className="site-blocks-pricing-amount">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>
              <p>{plan.credits}</p>
              <p className="site-blocks-section-lead">{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link to={plan.ctaLink} className={`btn btn-block ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      )
    }

    case 'faqList': {
      const categories = Array.isArray(block.categories)
        ? (block.categories as {
            id: string
            title: string
            description?: string
            faqs: { question: string; answer: string }[]
          }[])
        : []
      return (
        <div key={block.id} className="site-blocks-faq">
          {renderSectionHeader(block, `${block.id}-heading`)}
          {categories.map((category) => (
            <section key={category.id} className="site-blocks-faq-category">
              <h3>{category.title}</h3>
              {category.description ? <p className="site-blocks-section-lead">{category.description}</p> : null}
              <div className="site-blocks-faq-list">
                {category.faqs.map((faq) => (
                  <details key={faq.question} className="site-blocks-faq-item">
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )
    }

    case 'statusList': {
      const items = Array.isArray(block.items)
        ? (block.items as { name: string; status: 'operational' | 'degraded' | 'outage'; detail?: string }[])
        : []
      return (
        <ul key={block.id} className="static-status-list">
          {items.map((item) => (
            <li key={`${block.id}-${item.name}`} className="static-status-item">
              <div>
                <strong>{item.name}</strong>
                {item.detail ? <span>{item.detail}</span> : null}
              </div>
              <span className={`static-status-badge static-status-badge--${item.status}`}>
                {statusLabels[item.status]}
              </span>
            </li>
          ))}
        </ul>
      )
    }

    case 'guideLinks': {
      const items = Array.isArray(block.items)
        ? (block.items as { title: string; description: string; to: string }[])
        : []
      return (
        <div key={block.id} className="static-guide-grid">
          {items.map((guide) => (
            <Link key={`${block.id}-${guide.title}`} to={guide.to} className="static-guide-card">
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
            </Link>
          ))}
        </div>
      )
    }

    case 'section':
      return (
        <article key={block.id} className="static-section">
          {renderSectionHeader(block)}
          {Array.isArray(block.paragraphs)
            ? (block.paragraphs as string[]).map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))
            : null}
          {Array.isArray(block.list) ? (
            <ul>
              {(block.list as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </article>
      )

    case 'blogListing':
      return (
        <BlogListingSection
          key={block.id}
          heading={block.heading ? String(block.heading) : undefined}
          description={block.description ? String(block.description) : undefined}
        />
      )

    default:
      return null
  }
}

function renderCtaBlock(block: SitePageBlock) {
  const primary = getBlockCtaLink(block, 'primary')
  const secondary = getBlockCtaLink(block, 'secondary')

  return (
    <section key={block.id} className="static-cta site-blocks-cta" aria-labelledby={`${block.id}-heading`}>
      <div className="static-container static-cta-inner">
        <div>
          <h2 id={`${block.id}-heading`}>{String(block.title ?? '')}</h2>
          <p>{String(block.description ?? '')}</p>
        </div>
        <div className="static-cta-actions">
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
      </div>
    </section>
  )
}
