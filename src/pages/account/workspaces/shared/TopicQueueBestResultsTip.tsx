import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'

export default function TopicQueueBestResultsTip() {
  return (
    <span className="service-help-tip">
      <button
        type="button"
        className="service-help-trigger"
        aria-label="Best results from your topic queue"
        aria-describedby="topic-queue-best-results-tip"
      >
        <FontAwesomeIcon icon={faCircleQuestion} aria-hidden="true" />
      </button>

      <div
        id="topic-queue-best-results-tip"
        className="service-help-popover"
        role="tooltip"
      >
        <strong>Best results from your topic queue</strong>
        <ul>
          <li>
            <strong>Focus keyword</strong> — the main SEO phrase to rank for (e.g. topic “How to fix
            Core Web Vitals for Shopify” → focus keyword “core web vitals shopify”). Leave blank to
            use the topic text.
          </li>
          <li>
            <strong>Specific topics</strong> — e.g. “How to fix Core Web Vitals for Shopify stores”
            beats “SEO tips”.
          </li>
          <li>
            <strong>Category prompts</strong> — assign categories with tone, audience, and structure
            instructions.
          </li>
          <li>
            <strong>Site niche</strong> — set in Settings → Topics & niche so every post matches your
            brand.
          </li>
          <li>
            <strong>Topic plan</strong> — each post gets an AI brief (intent, outline, angle) before
            the article is written.
          </li>
          <li>
            <strong>SEO + internal links</strong> — enable both in Settings after you have 2+
            published posts.
          </li>
        </ul>
      </div>
    </span>
  )
}
