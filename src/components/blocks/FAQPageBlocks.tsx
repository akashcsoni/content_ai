import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import ContentIcon, { type ContentIconName } from '../ContentIcon'
import { isContentIconName } from '../BlogListingSection'
import { faqCategories, type FaqCategory } from '../../data/faq'
import type { SitePageBlock } from '../../lib/sitePageBlocks'
import '../../styles/faq.css'

type ActiveFilter = 'all' | string

function getCategories(block: SitePageBlock): FaqCategory[] {
  if (Array.isArray(block.categories) && block.categories.length > 0) {
    return (block.categories as FaqCategory[]).map((category) => ({
      ...category,
      icon:
        category.icon && isContentIconName(category.icon)
          ? (category.icon as ContentIconName)
          : 'platform',
    }))
  }
  return faqCategories
}

export function FAQHeroSection({
  block,
  searchQuery,
  onSearchChange,
  onSearchClear,
}: {
  block: SitePageBlock
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
}) {
  return (
    <section className="faq-hero" aria-labelledby="faq-heading">
      <div className="faq-container">
        <nav className="faq-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{String(block.breadcrumb ?? 'FAQ')}</span>
        </nav>

        <div className="faq-hero-copy">
          {block.eyebrow ? <p className="faq-eyebrow">{String(block.eyebrow)}</p> : null}
          <h1 id="faq-heading">{String(block.title ?? '')}</h1>
          {block.lead ? <p className="faq-hero-lead">{String(block.lead)}</p> : null}
        </div>

        <div className="faq-search" role="search">
          <label className="visually-hidden" htmlFor="faq-search-input">
            Search FAQs
          </label>
          <FontAwesomeIcon icon={faMagnifyingGlass} className="faq-search-icon" />
          <input
            id="faq-search-input"
            type="search"
            placeholder="Search questions… e.g. credits, API keys, export"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {searchQuery ? (
            <button type="button" className="faq-search-clear" onClick={onSearchClear}>
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function FAQListSection({
  block,
  searchQuery,
  activeFilter,
  onFilterChange,
  onResetFilters,
}: {
  block: SitePageBlock
  searchQuery: string
  activeFilter: ActiveFilter
  onFilterChange: (value: ActiveFilter) => void
  onResetFilters: () => void
}) {
  const categories = getCategories(block)
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) => activeFilter === 'all' || category.id === activeFilter)
      .map((category) => ({
        ...category,
        faqs: category.faqs.filter((faq) => {
          if (!normalizedQuery) return true
          return (
            faq.question.toLowerCase().includes(normalizedQuery) ||
            faq.answer.toLowerCase().includes(normalizedQuery)
          )
        }),
      }))
      .filter((category) => category.faqs.length > 0)
  }, [activeFilter, categories, normalizedQuery])

  const totalResults = filteredCategories.reduce(
    (count, category) => count + category.faqs.length,
    0,
  )

  return (
    <section className="faq-body" aria-label="FAQ categories and answers">
      <div className="faq-container">
        <div className="faq-toolbar">
          <div className="faq-filters" role="tablist" aria-label="Filter by category">
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'all'}
              className={`faq-filter ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => onFilterChange('all')}
            >
              All topics
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === category.id}
                className={`faq-filter ${activeFilter === category.id ? 'active' : ''}`}
                onClick={() => onFilterChange(category.id)}
              >
                {category.title}
              </button>
            ))}
          </div>
          <p className="faq-result-count" aria-live="polite">
            {totalResults} {totalResults === 1 ? 'answer' : 'answers'} found
          </p>
        </div>

        {totalResults === 0 ? (
          <div className="faq-empty">
            <h2>No results found</h2>
            <p>Try a different search term or browse all topics.</p>
            <button type="button" className="btn btn-secondary" onClick={onResetFilters}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="faq-categories">
            {filteredCategories.map((category) => (
              <section
                key={category.id}
                className="faq-category-block"
                aria-labelledby={`faq-cat-${category.id}`}
              >
                <div className="faq-category-head">
                  <ContentIcon name={category.icon} className="faq-category-icon" />
                  <div>
                    <h2 id={`faq-cat-${category.id}`}>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>
                </div>

                <div className="faq-accordion">
                  {category.faqs.map((faq) => (
                    <details key={faq.question} className="faq-item">
                      <summary>{faq.question}</summary>
                      <p>{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
