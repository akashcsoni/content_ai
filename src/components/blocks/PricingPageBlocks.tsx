import { Link } from 'react-router-dom'
import {
  creditExamples,
  creditSteps,
  pricingFaqs,
  pricingPlans,
} from '../../data/pricing'
import { getBlockCtaLink } from '../../lib/blockHelpers'
import type { SitePageBlock } from '../../lib/sitePageBlocks'
import '../../styles/pricing.css'

type PricingPlan = {
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
}

type CreditExample = {
  amount: number
  credits: number
  label: string
}

type StepItem = {
  number: string
  title: string
  description: string
}

type FaqItem = {
  question: string
  answer: string
}

function getPlans(block: SitePageBlock): PricingPlan[] {
  if (Array.isArray(block.plans) && block.plans.length > 0) {
    return block.plans as PricingPlan[]
  }
  return pricingPlans
}

function getCreditExamples(block: SitePageBlock): CreditExample[] {
  if (Array.isArray(block.examples) && block.examples.length > 0) {
    return block.examples as CreditExample[]
  }
  return creditExamples
}

function getSteps(block: SitePageBlock): StepItem[] {
  if (Array.isArray(block.items) && block.items.length > 0) {
    return block.items as StepItem[]
  }
  return creditSteps
}

function getPricingFaqs(block: SitePageBlock): FaqItem[] {
  const categories = Array.isArray(block.categories)
    ? (block.categories as { faqs: FaqItem[] }[])
    : []
  const fromBlock = categories.flatMap((category) => category.faqs)
  if (fromBlock.length > 0) {
    return fromBlock
  }
  return pricingFaqs
}

export function PricingHeroSection({ block }: { block: SitePageBlock }) {
  return (
    <section className="pricing-hero" aria-labelledby="pricing-heading">
      <div className="pricing-container">
        <nav className="pricing-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{String(block.breadcrumb ?? 'Pricing')}</span>
        </nav>

        <div className="pricing-hero-copy">
          {block.eyebrow ? <p className="pricing-eyebrow">{String(block.eyebrow)}</p> : null}
          <h1 id="pricing-heading">{String(block.title ?? '')}</h1>
          {block.lead ? <p className="pricing-hero-lead">{String(block.lead)}</p> : null}
        </div>
      </div>
    </section>
  )
}

export function PricingPlansSection({ block }: { block: SitePageBlock }) {
  const plans = getPlans(block)

  return (
    <section className="pricing-plans-section" aria-label="Pricing plans">
      <div className="pricing-container">
        <div className="pricing-plans-grid">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`pricing-plan-card ${plan.highlighted ? 'pricing-plan-card--featured' : ''}`}
              aria-labelledby={`plan-${plan.id}`}
            >
              {plan.highlighted ? <span className="badge badge-accent">Recommended</span> : null}
              <p className="pricing-plan-label">{plan.name}</p>
              <div className="pricing-plan-amount">
                <span className="pricing-plan-price">{plan.price}</span>
                <span className="pricing-plan-period">{plan.period}</span>
              </div>
              <p className="pricing-plan-credits">{plan.credits}</p>
              <p className="pricing-plan-desc">{plan.description}</p>
              <ul className="feature-list pricing-plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link
                to={plan.ctaLink}
                className={`btn btn-block ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PricingCreditExamplesSection({ block }: { block: SitePageBlock }) {
  const examples = getCreditExamples(block)
  const eyebrow = String(block.eyebrow ?? 'Credit system')
  const heading = String(block.heading ?? '$1 = 1 credit = 1 content')
  const description = String(
    block.description ??
      'Add money to your account and receive credits instantly. Each content you create uses one credit.',
  )
  const note = String(
    block.note ??
      'Add $20 to your account → get 20 credits → create 20 content pieces. AI API usage is still billed by your provider through your own keys.',
  )

  return (
    <section className="pricing-section pricing-section--soft" aria-labelledby={`${block.id}-heading`}>
      <div className="pricing-container">
        <div className="pricing-section-head">
          <p className="pricing-eyebrow pricing-eyebrow--plain">{eyebrow}</p>
          <h2 id={`${block.id}-heading`}>{heading}</h2>
          <p>{description}</p>
        </div>

        <div className="pricing-credit-grid">
          {examples.map((example) => (
            <article
              key={example.amount}
              className={`pricing-credit-card ${example.amount === 20 ? 'pricing-credit-card--popular' : ''}`}
            >
              {example.amount === 20 ? <span className="badge badge-accent">Example</span> : null}
              <p className="pricing-credit-label">{example.label}</p>
              <div className="pricing-credit-amount">
                <span>${example.amount}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <strong>{example.credits} credits</strong>
              </div>
              <p>{example.credits} content pieces from your account</p>
            </article>
          ))}
        </div>

        <div className="pricing-credit-note">
          <strong>Example:</strong> {note}
        </div>
      </div>
    </section>
  )
}

export function PricingStepsSection({ block }: { block: SitePageBlock }) {
  const steps = getSteps(block)
  const eyebrow = String(block.eyebrow ?? 'How it works')
  const heading = String(block.heading ?? 'From signup to published content')

  return (
    <section className="pricing-section" aria-labelledby={`${block.id}-heading`}>
      <div className="pricing-container">
        <div className="pricing-section-head">
          <p className="pricing-eyebrow pricing-eyebrow--plain">{eyebrow}</p>
          <h2 id={`${block.id}-heading`}>{heading}</h2>
        </div>
        <ol className="pricing-steps">
          {steps.map((step) => (
            <li key={step.number} className="pricing-step">
              <span className="pricing-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function PricingFaqSection({ block }: { block: SitePageBlock }) {
  const faqs = getPricingFaqs(block)
  const eyebrow = String(block.eyebrow ?? 'FAQ')
  const heading = String(block.heading ?? 'Pricing questions')

  return (
    <section className="pricing-section pricing-section--soft" aria-labelledby={`${block.id}-heading`}>
      <div className="pricing-container">
        <div className="pricing-section-head">
          <p className="pricing-eyebrow pricing-eyebrow--plain">{eyebrow}</p>
          <h2 id={`${block.id}-heading`}>{heading}</h2>
        </div>
        <div className="pricing-faq-list">
          {faqs.map((faq) => (
            <details key={faq.question} className="pricing-faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PricingCtaSection({ block }: { block: SitePageBlock }) {
  const primary = getBlockCtaLink(block, 'primary')
  const secondary = getBlockCtaLink(block, 'secondary')

  return (
    <section className="pricing-cta" aria-labelledby={`${block.id}-heading`}>
      <div className="pricing-container pricing-cta-inner">
        <div>
          <h2 id={`${block.id}-heading`}>{String(block.title ?? '')}</h2>
          {block.description ? <p>{String(block.description)}</p> : null}
        </div>
        {primary || secondary ? (
          <div className="pricing-cta-actions">
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
