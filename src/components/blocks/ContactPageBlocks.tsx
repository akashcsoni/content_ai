import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock,
  faCircleQuestion,
  faEnvelope,
  faHeadset,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons'
import { contactSubjects, resolveContactSidebarContent } from '../../data/contact'
import type { SitePageBlock } from '../../lib/sitePageBlocks'
import '../../styles/contact.css'

const methodIcons = {
  email: faEnvelope,
  clock: faClock,
  help: faCircleQuestion,
} as const

type ContactFormBlockProps = {
  block: SitePageBlock
}

export function ContactFormBlock({ block }: ContactFormBlockProps) {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  const heading = String(block.heading ?? 'Send us a message')
  const description = String(block.description ?? "Fill out the form and we'll respond as soon as possible.")
  const note = String(block.note ?? 'By submitting, you agree we may use your email to respond to this inquiry.')
  const submitLabel = String(block.submitLabel ?? 'Send message')
  const successTitle = String(block.successTitle ?? 'Message sent successfully')
  const successMessage = String(
    block.successMessage ??
      "Thank you for reaching out. We've received your message and will reply to your email within 1–2 business days.",
  )

  return (
    <div className="contact-form-panel">
      <div className="contact-form-head">
        <h2>{heading}</h2>
        <p>{description}</p>
      </div>

      {submitted ? (
        <div className="contact-success" role="status">
          <div className="contact-success-icon" aria-hidden="true">
            ✓
          </div>
          <h3>{successTitle}</h3>
          <p>{successMessage}</p>
          <button type="button" className="btn btn-secondary" onClick={() => setSubmitted(false)}>
            Send another message
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-row">
            <div className="contact-field">
              <label htmlFor="contact-name">
                Full name <span className="required">*</span>
              </label>
              <input id="contact-name" type="text" name="name" required autoComplete="name" placeholder="John Smith" />
            </div>
            <div className="contact-field">
              <label htmlFor="contact-email">
                Email address <span className="required">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="contact-field">
            <label htmlFor="contact-subject">
              Subject <span className="required">*</span>
            </label>
            <select id="contact-subject" name="subject" required defaultValue="">
              <option value="" disabled>
                Select a topic
              </option>
              {contactSubjects.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message">
              Message <span className="required">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={6}
              placeholder="Tell us how we can help — credits, API setup, partnerships, or anything else..."
            />
          </div>

          <p className="contact-form-note">{note}</p>

          <button type="submit" className="btn btn-primary btn-lg contact-submit">
            {submitLabel}
          </button>
        </form>
      )}
    </div>
  )
}

type ContactSidebarBlockProps = {
  block: SitePageBlock
}

export function ContactSidebarBlock({ block }: ContactSidebarBlockProps) {
  const sidebar = resolveContactSidebarContent(block)

  return (
    <aside className="contact-sidebar">
      <div className="contact-methods">
        {sidebar.methods.map((method) => (
          <article key={method.title} className="contact-method-card">
            <span className="contact-method-icon" aria-hidden="true">
              <FontAwesomeIcon icon={methodIcons[method.icon] ?? faEnvelope} />
            </span>
            <div>
              <h3>{method.title}</h3>
              <p>{method.description}</p>
              {method.href ? (
                method.href.startsWith('mailto:') ? (
                  <a href={method.href}>{method.value}</a>
                ) : (
                  <Link to={method.href}>{method.value}</Link>
                )
              ) : (
                <strong>{method.value}</strong>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="contact-info-card">
        <h3>{sidebar.reasonsHeading}</h3>
        <ul className="contact-reasons">
          {sidebar.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className="contact-info-card contact-info-card--accent">
        <FontAwesomeIcon icon={faHeadset} className="contact-info-card-icon" />
        <h3>{sidebar.accentTitle}</h3>
        <p>{sidebar.accentDescription}</p>
        <Link to={sidebar.accentButtonLink} className="btn btn-secondary btn-block">
          {sidebar.accentButtonLabel}
        </Link>
      </div>

      <div className="contact-office">
        <FontAwesomeIcon icon={faLocationDot} />
        <span>{sidebar.officeNote}</span>
      </div>
    </aside>
  )
}

export function ContactMainSection({ formBlock, sidebarBlock }: { formBlock: SitePageBlock; sidebarBlock: SitePageBlock }) {
  return (
    <section className="contact-main" aria-label="Contact form and information">
      <div className="contact-container contact-main-grid">
        <ContactFormBlock block={formBlock} />
        <ContactSidebarBlock block={sidebarBlock} />
      </div>
    </section>
  )
}

export function ContactHeroSection({ block }: { block: SitePageBlock }) {
  return (
    <section className="contact-hero" aria-labelledby="contact-heading">
      <div className="contact-container">
        <div className="contact-hero-copy">
          {block.eyebrow ? <p className="contact-eyebrow">{String(block.eyebrow)}</p> : null}
          <h1 id="contact-heading">{String(block.title ?? '')}</h1>
          {block.lead ? <p className="contact-hero-lead">{String(block.lead)}</p> : null}
        </div>
      </div>
    </section>
  )
}

export function ContactCtaSection({ block }: { block: SitePageBlock }) {
  const primary = block.primary && typeof block.primary === 'object' ? (block.primary as { label: string; to: string }) : null

  return (
    <section className="contact-cta" aria-labelledby={`${block.id}-heading`}>
      <div className="contact-container contact-cta-inner">
        <div>
          <h2 id={`${block.id}-heading`}>{String(block.title ?? '')}</h2>
          {block.description ? <p>{String(block.description)}</p> : null}
        </div>
        {primary ? (
          <Link to={primary.to} className="btn btn-primary btn-lg">
            {primary.label}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
