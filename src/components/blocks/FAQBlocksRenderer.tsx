import { useState } from 'react'
import type { SitePageBlock } from '../../lib/sitePageBlocks'
import { FAQHeroSection, FAQListSection } from './FAQPageBlocks'
import '../../styles/faq.css'

type FAQBlocksRendererProps = {
  blocks: SitePageBlock[]
}

export default function FAQBlocksRenderer({ blocks }: FAQBlocksRendererProps) {
  const hero = blocks.find((block) => block.type === 'hero')
  const faqList = blocks.find((block) => block.type === 'faqList')
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  function resetFilters() {
    setSearchQuery('')
    setActiveFilter('all')
  }

  return (
    <div className="faq-page">
      {hero ? (
        <FAQHeroSection
          block={hero}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={() => setSearchQuery('')}
        />
      ) : null}
      {faqList ? (
        <FAQListSection
          block={faqList}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onResetFilters={resetFilters}
        />
      ) : null}
    </div>
  )
}
