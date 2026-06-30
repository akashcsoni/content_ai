import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRotateRight,
  faCircleCheck,
  faClock,
  faHeadset,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import {
  getOverallStatusFromGroups,
  overallStatus,
  resolvedIncidents,
  statusGroups,
  statusHelpLinks,
  statusLabels,
  statusMetrics,
  type ServiceStatus,
  type StatusGroup,
  type StatusIncident,
  type StatusMetric,
} from '../../data/status'
import { getBlockCtaLink } from '../../lib/blockHelpers'
import type { SitePageBlock } from '../../lib/sitePageBlocks'
import '../../styles/status.css'

const statusIcons: Record<ServiceStatus, typeof faCircleCheck> = {
  operational: faCircleCheck,
  degraded: faClock,
  outage: faShieldHalved,
  maintenance: faArrowRotateRight,
}

function formatToday(): string {
  return new Date().toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getBannerFromBlock(bannerBlock?: SitePageBlock) {
  if (bannerBlock && bannerBlock.state) {
    const state = String(bannerBlock.state) as ServiceStatus
    return {
      state,
      label: String(bannerBlock.label ?? statusLabels[state]),
      message: String(bannerBlock.message ?? overallStatus.message),
      lastUpdated: String(bannerBlock.lastUpdated ?? overallStatus.lastUpdated),
    }
  }

  const globalStatus = getOverallStatusFromGroups(statusGroups)
  return globalStatus === 'operational'
    ? overallStatus
    : {
        ...overallStatus,
        state: globalStatus,
        label: statusLabels[globalStatus],
        message: 'Some services may be affected. See details below.',
      }
}

function getMetrics(block?: SitePageBlock): StatusMetric[] {
  if (block && Array.isArray(block.items) && block.items.length > 0) {
    return block.items as StatusMetric[]
  }
  return statusMetrics
}

function getStatusGroups(block?: SitePageBlock): StatusGroup[] {
  if (block && Array.isArray(block.groups) && block.groups.length > 0) {
    return block.groups as StatusGroup[]
  }
  return statusGroups
}

function getIncidents(block?: SitePageBlock): StatusIncident[] {
  if (block && Array.isArray(block.incidents)) {
    return block.incidents as StatusIncident[]
  }
  return resolvedIncidents
}

function getGuideLinks(block: SitePageBlock) {
  if (Array.isArray(block.items) && block.items.length > 0) {
    return block.items as { title: string; description: string; to: string }[]
  }
  return statusHelpLinks
}

export function StatusHeroSection({
  block,
  bannerBlock,
}: {
  block: SitePageBlock
  bannerBlock?: SitePageBlock
}) {
  const banner = getBannerFromBlock(bannerBlock)

  return (
    <section className="status-hero" aria-labelledby="status-heading">
      <div className="status-container">
        <nav className="status-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{String(block.breadcrumb ?? 'Status')}</span>
        </nav>

        <div className="status-hero-grid">
          <div className="status-hero-copy">
            {block.eyebrow ? <p className="status-eyebrow">{String(block.eyebrow)}</p> : null}
            <h1 id="status-heading">{String(block.title ?? '')}</h1>
            {block.lead ? <p className="status-hero-lead">{String(block.lead)}</p> : null}
          </div>

          <div
            className={`status-banner status-banner--${banner.state}`}
            role="status"
            aria-live="polite"
          >
            <span className="status-banner-indicator" aria-hidden="true" />
            <div>
              <strong>{banner.label}</strong>
              <p>{banner.message}</p>
              <time className="status-banner-time" dateTime={new Date().toISOString()}>
                {formatToday()} · {banner.lastUpdated}
              </time>
            </div>
            <FontAwesomeIcon icon={statusIcons[banner.state]} className="status-banner-icon" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function StatusMetricsSection({ block }: { block: SitePageBlock }) {
  const metrics = getMetrics(block)

  return (
    <section className="status-metrics" aria-label="Platform metrics">
      <div className="status-container">
        <div className="status-metrics-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="status-metric-card">
              <span className="status-metric-label">{metric.label}</span>
              <strong className="status-metric-value">{metric.value}</strong>
              <span className="status-metric-detail">{metric.detail}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatusGroupsSection({ block }: { block: SitePageBlock }) {
  const groups = getStatusGroups(block)
  const heading = String(block.heading ?? 'Service status')
  const description = String(
    block.description ?? 'Grouped by product area. Green means the service is fully available.',
  )

  return (
    <section className="status-services" aria-labelledby={`${block.id}-heading`}>
      <div className="status-container">
        <div className="status-section-head">
          <h2 id={`${block.id}-heading`}>{heading}</h2>
          <p>{description}</p>
        </div>

        <div className="status-groups">
          {groups.map((group) => (
            <article key={group.id} className="status-group-card">
              <header className="status-group-header">
                <h3>{group.name}</h3>
                <span className="status-group-count">
                  {group.services.filter((service) => service.status === 'operational').length}/
                  {group.services.length} operational
                </span>
              </header>
              <ul className="status-service-list">
                {group.services.map((service) => (
                  <li key={service.id} className="status-service-row">
                    <div className="status-service-info">
                      <span
                        className={`status-dot status-dot--${service.status}`}
                        aria-hidden="true"
                      />
                      <div>
                        <strong>{service.name}</strong>
                        <span>{service.description}</span>
                      </div>
                    </div>
                    <span className={`status-pill status-pill--${service.status}`}>
                      {statusLabels[service.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatusIncidentsSection({ block }: { block: SitePageBlock }) {
  const incidents = getIncidents(block)
  const heading = String(block.heading ?? 'Incident history')
  const description = String(block.description ?? 'Past incidents and scheduled maintenance windows.')

  return (
    <section className="status-incidents" aria-labelledby={`${block.id}-heading`}>
      <div className="status-container">
        <div className="status-section-head">
          <h2 id={`${block.id}-heading`}>{heading}</h2>
          <p>{description}</p>
        </div>

        {incidents.length === 0 ? (
          <div className="status-empty-incidents">
            <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
            <div>
              <strong>No recent incidents</strong>
              <p>There are no reported outages in the last 90 days.</p>
            </div>
          </div>
        ) : (
          <ul className="status-incident-list">
            {incidents.map((incident) => (
              <li key={incident.id} className="status-incident-card">
                <div className="status-incident-meta">
                  <time dateTime={incident.date}>{incident.date}</time>
                  <span className={`status-incident-badge status-incident-badge--${incident.status}`}>
                    {incident.status}
                  </span>
                </div>
                <h3>{incident.title}</h3>
                <p>{incident.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export function StatusGuideLinksSection({ block }: { block: SitePageBlock }) {
  const links = getGuideLinks(block)
  const heading = String(block.heading ?? 'Experiencing an issue?')
  const description = String(
    block.description ??
      'If something is not working and it is not listed here, contact support with your account email, the service affected, and when the issue started.',
  )
  const primary = getBlockCtaLink(block, 'primary') ?? { label: 'Contact support', to: '/contact' }
  const secondary = getBlockCtaLink(block, 'secondary') ?? { label: 'Visit help center', to: '/faq' }

  return (
    <section className="status-help" aria-labelledby={`${block.id}-heading`}>
      <div className="status-container">
        <div className="status-help-panel">
          <div className="status-help-copy">
            <FontAwesomeIcon icon={faHeadset} className="status-help-icon" aria-hidden="true" />
            <div>
              <h2 id={`${block.id}-heading`}>{heading}</h2>
              <p>{description}</p>
            </div>
          </div>
          <div className="status-help-actions">
            <Link to={primary.to} className="btn btn-primary">
              {primary.label}
            </Link>
            <Link to={secondary.to} className="btn btn-secondary">
              {secondary.label}
            </Link>
          </div>
        </div>

        <div className="status-help-grid">
          {links.map((link) => (
            <Link key={link.title} to={link.to} className="status-help-card">
              <h3>{link.title}</h3>
              <p>{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatusCtaSection({ block }: { block: SitePageBlock }) {
  const primary = getBlockCtaLink(block, 'primary')
  const secondary = getBlockCtaLink(block, 'secondary')

  return (
    <section className="status-help" aria-labelledby={`${block.id}-heading`}>
      <div className="status-container">
        <div className="status-help-panel">
          <div className="status-help-copy">
            <div>
              <h2 id={`${block.id}-heading`}>{String(block.title ?? '')}</h2>
              {block.description ? <p>{String(block.description)}</p> : null}
            </div>
          </div>
          {primary || secondary ? (
            <div className="status-help-actions">
              {primary ? (
                <Link to={primary.to} className="btn btn-primary">
                  {primary.label}
                </Link>
              ) : null}
              {secondary ? (
                <Link to={secondary.to} className="btn btn-secondary">
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
