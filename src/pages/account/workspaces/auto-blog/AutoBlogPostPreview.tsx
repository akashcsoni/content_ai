import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faCheck,
  faChevronDown,
  faChevronUp,
  faCopy,
  faDownload,
  faFileCode,
  faLink,
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import type { AutoBlogPostDetail } from '../../../../lib/api'
import { resolveUploadUrl } from '../../../../lib/uploadUrl'
import { calculateSeoScore, getSeoScoreColor, type SeoFieldScore } from './seoScore'
import { formatBlogDate, formatPostStatus } from './autoBlog.types'
import { downloadWordPressWxR } from './wordpressExport'

type AutoBlogPostPreviewProps = {
  post: AutoBlogPostDetail
  onClose: () => void
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

type CopyKey =
  | 'focusKeyword'
  | 'seoTitle'
  | 'metaDescription'
  | 'seoAll'
  | 'schemaJsonLd'
  | 'html'
  | 'text'
  | 'slug'
  | 'featuredImage'

function stripHtml(html: string): string {
  const element = document.createElement('div')
  element.innerHTML = html
  return element.textContent?.trim() ?? ''
}

function buildSeoBundle(post: AutoBlogPostDetail): string {
  const lines = [
    post.focusKeyword ? `Focus keyword: ${post.focusKeyword}` : '',
    post.seoTitle ? `SEO title: ${post.seoTitle}` : '',
    post.metaDescription ? `Meta description: ${post.metaDescription}` : '',
    post.slug ? `Slug: ${post.slug}` : '',
  ].filter(Boolean)

  return lines.join('\n')
}

function copiedLabel(label: string): string {
  return label.startsWith('Copy ') ? `Copied ${label.slice(5)}` : 'Copied'
}

type CollapsibleSectionProps = {
  expanded: boolean
  onToggle: () => void
  title: ReactNode
  description: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

function CollapsibleSection({
  expanded,
  onToggle,
  title,
  description,
  actions,
  children,
  className = '',
}: CollapsibleSectionProps) {
  return (
    <div
      className={`service-post-collapsible${expanded ? '' : ' service-post-collapsible--collapsed'} ${className}`.trim()}
    >
      <div className="service-post-collapsible-head">
        <button
          type="button"
          className="service-post-collapsible-toggle"
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <span className="service-post-collapsible-toggle-main">
            <h4>{title}</h4>
            <p>{description}</p>
          </span>
          <span className="service-post-collapsible-toggle-action">
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} aria-hidden="true" />
            {expanded ? 'Hide' : 'Show'}
          </span>
        </button>
        {expanded && actions ? (
          <div className="service-post-collapsible-actions">{actions}</div>
        ) : null}
      </div>
      {expanded ? <div className="service-post-collapsible-body">{children}</div> : null}
    </div>
  )
}

export default function AutoBlogPostPreview({
  post,
  onClose,
  expanded,
  onExpandedChange,
}: AutoBlogPostPreviewProps) {
  const [internalExpanded, setInternalExpanded] = useState(true)
  const [topicPlanExpanded, setTopicPlanExpanded] = useState(false)
  const [seoExpanded, setSeoExpanded] = useState(false)
  const [schemaExpanded, setSchemaExpanded] = useState(false)
  const [internalLinksExpanded, setInternalLinksExpanded] = useState(false)
  const [copiedKey, setCopiedKey] = useState<CopyKey | null>(null)
  const isExpanded = expanded ?? internalExpanded

  function setExpanded(next: boolean) {
    if (onExpandedChange) {
      onExpandedChange(next)
      return
    }
    setInternalExpanded(next)
  }

  useEffect(() => {
    if (expanded === undefined) {
      setInternalExpanded(true)
    }
    setTopicPlanExpanded(false)
    setSeoExpanded(false)
    setSchemaExpanded(false)
    setInternalLinksExpanded(false)
  }, [post.id, expanded])
  const computedSeoScore = calculateSeoScore(post)
  const seoScore = post.seoMetadata
    ? {
        ...computedSeoScore,
        totalScore: post.seoMetadata.score,
        grade: post.seoMetadata.grade,
      }
    : computedSeoScore
  const scoreTone = getSeoScoreColor(seoScore.totalScore)
  const featuredImageUrl = resolveUploadUrl(post.featuredImage)
  const schemaJsonLdText = post.seoMetadata?.schemaJsonLd
    ? JSON.stringify(post.seoMetadata.schemaJsonLd, null, 2)
    : ''

  const hasSeo = Boolean(
    post.focusKeyword || post.seoTitle || post.metaDescription || post.slug || post.content,
  )

  async function copyValue(key: CopyKey, value: string) {
    if (!value.trim()) return

    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1800)
    } catch {
      setCopiedKey(null)
    }
  }

  async function downloadFeaturedImage() {
    if (!featuredImageUrl) return

    const baseName = (post.slug || post.title || post.id)
      .trim()
      .replace(/[^\w-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)

    try {
      const response = await fetch(featuredImageUrl)
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const extension = blob.type.includes('png')
        ? 'png'
        : blob.type.includes('webp')
          ? 'webp'
          : blob.type.includes('gif')
            ? 'gif'
            : 'jpg'
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${baseName || 'featured-image'}-featured.${extension}`
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      const link = document.createElement('a')
      link.href = featuredImageUrl
      link.download = `${baseName || 'featured-image'}-featured.jpg`
      link.target = '_blank'
      link.rel = 'noreferrer'
      link.click()
    }
  }

  function renderCopyButton(key: CopyKey, value: string, label: string) {
    const isCopied = copiedKey === key

    return (
      <button
        type="button"
        className={`service-post-copy-btn${isCopied ? ' service-post-copy-btn--copied' : ''}`}
        onClick={() => void copyValue(key, value)}
        disabled={!value.trim()}
        title={isCopied ? copiedLabel(label) : label}
        aria-label={isCopied ? copiedLabel(label) : label}
      >
        <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} aria-hidden="true" />
        {isCopied ? copiedLabel(label) : label}
      </button>
    )
  }

  function renderSeoFieldCard(field: SeoFieldScore) {
    const copyKeyMap: Record<SeoFieldScore['id'], CopyKey | null> = {
      focusKeyword: 'focusKeyword',
      seoTitle: 'seoTitle',
      metaDescription: 'metaDescription',
      slug: 'slug',
      content: null,
      internalLinks: null,
    }

    const copyKey = copyKeyMap[field.id]
    const copyValueText = field.value ?? ''

    return (
      <div
        key={field.id}
        className={`service-post-seo-card service-post-seo-card--${field.status}${
          field.id === 'metaDescription' || field.id === 'content'
            ? ' service-post-seo-card--wide'
            : ''
        }`}
      >
        <div className="service-post-seo-card-top">
          <dt>{field.label}</dt>
          <span className={`service-post-seo-score service-post-seo-score--${field.status}`}>
            {field.score}/{field.maxScore}
          </span>
        </div>
        <div className="service-post-seo-meter" aria-hidden="true">
          <span
            className={`service-post-seo-meter-fill service-post-seo-meter-fill--${field.status}`}
            style={{ width: `${Math.round((field.score / field.maxScore) * 100)}%` }}
          />
        </div>
        <dd>{field.value || 'Not set'}</dd>
        <p className="service-post-seo-detail">{field.detail}</p>
        {copyKey && field.value
          ? renderCopyButton(copyKey, copyValueText, `Copy ${field.label.toLowerCase()}`)
          : null}
      </div>
    )
  }

  return (
    <section
      className={`service-post-preview${isExpanded ? '' : ' service-post-preview--collapsed'}`}
      aria-label="Blog post preview"
    >
      <div className="service-post-preview-head">
        <div className="service-post-preview-head-main">
          <div className="service-post-preview-eyebrow-row">
            <p className="service-post-preview-eyebrow">Generated blog preview</p>
            <button
              type="button"
              className="service-post-preview-toggle"
              aria-expanded={isExpanded}
              onClick={() => setExpanded(!isExpanded)}
            >
              <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} aria-hidden="true" />
              {isExpanded ? 'Hide preview' : 'Show preview'}
            </button>
          </div>
          <h3>{post.title}</h3>
          <div className="service-post-preview-meta">
            <span className={`service-blog-status service-blog-status--${post.status}`}>
              {formatPostStatus(post.status)}
            </span>
            {post.categoryName ? (
              <span className="service-post-preview-chip">{post.categoryName}</span>
            ) : null}
            <span className="service-post-preview-chip">
              Topic: {post.topicLabel || post.keyword}
            </span>
            <span className="service-post-preview-chip">{post.tokensTotal} tokens</span>
            <span className="service-post-preview-chip">{formatBlogDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="service-post-preview-actions">
          {isExpanded ? (
            <>
              <button
                type="button"
                className="service-post-copy-btn service-post-copy-btn--ghost"
                onClick={() => downloadWordPressWxR(post, featuredImageUrl)}
                title="Download WordPress import XML (WXR)"
              >
                <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
                WordPress XML
              </button>
              <button
                type="button"
                className="service-post-copy-btn service-post-copy-btn--ghost"
                onClick={() => void copyValue('html', post.content)}
                title="Copy article HTML"
              >
                <FontAwesomeIcon icon={faFileCode} aria-hidden="true" />
                {copiedKey === 'html' ? 'Copied HTML' : 'Copy HTML'}
              </button>
              <button
                type="button"
                className="service-post-copy-btn service-post-copy-btn--ghost"
                onClick={() => void copyValue('text', stripHtml(post.content))}
                title="Copy article content"
              >
                <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
                {copiedKey === 'text' ? 'Copied Content' : 'Copy Content'}
              </button>
            </>
          ) : null}
          <button type="button" className="service-post-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            Close
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="service-post-preview-body">
      {post.topicBrief ? (
        <CollapsibleSection
          expanded={topicPlanExpanded}
          onToggle={() => setTopicPlanExpanded((current) => !current)}
          title="Topic plan"
          description="AI strategy brief used before writing this article from your queued topic."
          className="service-post-collapsible--soft"
        >
          <dl className="service-post-topic-brief-grid">
            <div>
              <dt>Search intent</dt>
              <dd>{post.topicBrief.searchIntent}</dd>
            </div>
            <div>
              <dt>Audience</dt>
              <dd>{post.topicBrief.targetAudience}</dd>
            </div>
            <div className="service-post-topic-brief-wide">
              <dt>Unique angle</dt>
              <dd>{post.topicBrief.uniqueAngle}</dd>
            </div>
            <div className="service-post-topic-brief-wide">
              <dt>Reader outcome</dt>
              <dd>{post.topicBrief.readerOutcome}</dd>
            </div>
          </dl>
          {post.topicBrief.outline.length > 0 ? (
            <ol className="service-post-topic-brief-outline">
              {post.topicBrief.outline.map((section) => (
                <li key={section.heading}>
                  <strong>{section.heading}</strong>
                  {section.points.length > 0 ? (
                    <ul>
                      {section.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </CollapsibleSection>
      ) : null}

      {featuredImageUrl ? (
        <div className="service-post-featured">
          <div className="service-post-section-head">
            <div>
              <h4>Featured image</h4>
              <p>AI-generated hero image saved with this post.</p>
            </div>
            <div className="service-post-section-actions">
              <button
                type="button"
                className="service-post-copy-btn service-post-copy-btn--icon"
                onClick={() => void downloadFeaturedImage()}
                title="Download featured image"
                aria-label="Download featured image"
              >
                <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
              </button>
              {renderCopyButton('featuredImage', featuredImageUrl, 'Copy image URL')}
            </div>
          </div>
          <figure className="service-post-featured-figure">
            <img src={featuredImageUrl} alt="" loading="lazy" />
          </figure>
        </div>
      ) : post.featuredImageError ? (
        <div className="service-workspace-alert service-workspace-alert--error">
          Featured image was not created: {post.featuredImageError}
        </div>
      ) : null}

      {hasSeo ? (
        <CollapsibleSection
          expanded={seoExpanded}
          onToggle={() => setSeoExpanded((current) => !current)}
          title={
            <>
              <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
              SEO metadata
            </>
          }
          description="Score is calculated out of 100 based on keyword usage, lengths, slug, content, and internal links."
          actions={renderCopyButton('seoAll', buildSeoBundle(post), 'Copy all SEO fields')}
          className="service-post-collapsible--seo"
        >
          <div className={`service-post-seo-summary service-post-seo-summary--${scoreTone}`}>
            <div
              className="service-post-seo-summary-ring"
              style={{ '--seo-score': seoScore.totalScore } as CSSProperties}
              aria-hidden="true"
            >
              <div className="service-post-seo-summary-ring-inner">
                <strong>{seoScore.totalScore}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="service-post-seo-summary-copy">
              <div className="service-post-seo-summary-head">
                <strong>{seoScore.grade}</strong>
                <span className={`service-post-seo-grade-badge service-post-seo-grade-badge--${scoreTone}`}>
                  SEO score
                </span>
              </div>
              <p>
                {seoScore.fields.filter((field) => field.status === 'good').length} of{' '}
                {seoScore.fields.length} checks passed.
                {post.seoMetadata?.optimized ? ' SEO optimization pass applied.' : ''}
              </p>
              {post.seoMetadata?.searchIntent ? (
                <p className="service-post-seo-intent">
                  Search intent: <strong>{post.seoMetadata.searchIntent}</strong>
                  {post.seoMetadata.secondaryKeywords.length > 0
                    ? ` · Secondary keywords: ${post.seoMetadata.secondaryKeywords.join(', ')}`
                    : ''}
                </p>
              ) : null}
              {post.seoMetadata?.recommendationsApplied?.length ? (
                <ul className="service-post-seo-recommendations">
                  {post.seoMetadata.recommendationsApplied.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              <div className="service-post-seo-summary-stats">
                {seoScore.fields.map((field) => (
                  <span
                    key={field.id}
                    className={`service-post-seo-mini-stat service-post-seo-mini-stat--${field.status}`}
                    title={`${field.label}: ${field.score}/${field.maxScore}`}
                  >
                    {field.label} {field.score}/{field.maxScore}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <dl className="service-post-seo-grid">
            {seoScore.fields
              .filter((field) => field.id !== 'content')
              .map((field) => renderSeoFieldCard(field))}
            {seoScore.fields
              .filter((field) => field.id === 'content')
              .map((field) => renderSeoFieldCard(field))}
          </dl>
        </CollapsibleSection>
      ) : null}

      {schemaJsonLdText || post.seoMetadata ? (
        <CollapsibleSection
          expanded={schemaExpanded}
          onToggle={() => setSchemaExpanded((current) => !current)}
          title={
            <>
              <FontAwesomeIcon icon={faFileCode} aria-hidden="true" />
              JSON-LD schema
            </>
          }
          description="BlogPosting structured data for this article. Paste into your site head or CMS schema field."
          actions={
            schemaJsonLdText
              ? renderCopyButton('schemaJsonLd', schemaJsonLdText, 'Copy JSON-LD schema')
              : undefined
          }
          className="service-post-collapsible--schema"
        >
          {schemaJsonLdText ? (
            <pre className="service-post-schema-code">{schemaJsonLdText}</pre>
          ) : (
            <p className="service-post-schema-empty">
              No JSON-LD schema was saved for this post. Turn on SEO optimization in Auto Blog settings
              and regenerate.
            </p>
          )}
        </CollapsibleSection>
      ) : null}

      {post.internalLinks?.length ? (
        <CollapsibleSection
          expanded={internalLinksExpanded}
          onToggle={() => setInternalLinksExpanded((current) => !current)}
          title={
            <>
              <FontAwesomeIcon icon={faLink} aria-hidden="true" />
              Internal links
            </>
          }
          description="Contextual links woven into this article for stronger site SEO and crawl paths."
          actions={
            <span className="service-post-internal-links-count">
              {post.internalLinks.length} link{post.internalLinks.length === 1 ? '' : 's'}
            </span>
          }
          className="service-post-collapsible--links"
        >
          <ul className="service-post-internal-links-list">
            {post.internalLinks.map((link, index) => (
              <li key={`${link.targetPostId}-${link.url}`} className="service-post-internal-links-item">
                <div className="service-post-internal-links-item-index" aria-hidden="true">
                  {index + 1}
                </div>

                <div className="service-post-internal-links-item-body">
                  <div className="service-post-internal-links-item-top">
                    <span className="service-post-internal-links-anchor">{link.anchorText}</span>
                    <span className="service-post-internal-links-arrow" aria-hidden="true">
                      →
                    </span>
                    <span className="service-post-internal-links-target">{link.targetTitle}</span>
                  </div>

                  <a
                    className="service-post-internal-links-url"
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open ${link.targetTitle}`}
                  >
                    <span>{link.url}</span>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      ) : null}

      <div className="service-post-content-wrap">
        <div className="service-post-section-head">
          <div>
            <h4>Article content</h4>
            <p>Preview how the generated HTML will read on your site.</p>
          </div>
          <div className="service-post-content-actions">
            <button
              type="button"
              className="service-post-copy-btn"
              onClick={() => downloadWordPressWxR(post, featuredImageUrl)}
              title="Download WordPress import XML (WXR)"
            >
              <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
              WordPress XML
            </button>
            {renderCopyButton('html', post.content, 'Copy HTML')}
            {renderCopyButton('text', stripHtml(post.content), 'Copy Content')}
          </div>
        </div>

        <article
          className="service-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
        </div>
      ) : null}
    </section>
  )
}
