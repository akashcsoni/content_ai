export type SitePageBlockType =
  | 'hero'
  | 'section'
  | 'statusList'
  | 'guideLinks'
  | 'cta'
  | 'stats'
  | 'featureGrid'
  | 'steps'
  | 'faqList'
  | 'pricingPlans'
  | 'serviceCards'
  | 'blogListing'
  | 'trustBand'
  | 'featuredSpotlight'
  | 'contactForm'
  | 'contactSidebar'
  | 'serviceOverview'
  | 'serviceDetails'
  | 'creditExamples'
  | 'heroPanel'
  | 'storyQuote'
  | 'audienceGrid'
  | 'timeline'
  | 'statusBanner'
  | 'statusMetrics'
  | 'statusGroups'
  | 'statusIncidents'

export type SitePageCtaLink = { label: string; to: string }

export type SitePageBlock = {
  id: string
  type: SitePageBlockType
  [key: string]: unknown
}

export const SITE_PAGE_BLOCK_TYPES: { value: SitePageBlockType; label: string }[] = [
  { value: 'hero', label: 'Hero' },
  { value: 'section', label: 'Section' },
  { value: 'stats', label: 'Stats row' },
  { value: 'trustBand', label: 'Trust band' },
  { value: 'featureGrid', label: 'Feature grid' },
  { value: 'steps', label: 'Steps' },
  { value: 'serviceCards', label: 'Service cards' },
  { value: 'serviceOverview', label: 'Service overview' },
  { value: 'serviceDetails', label: 'Service details' },
  { value: 'featuredSpotlight', label: 'Featured spotlight' },
  { value: 'pricingPlans', label: 'Pricing plans' },
  { value: 'creditExamples', label: 'Credit examples' },
  { value: 'faqList', label: 'FAQ list' },
  { value: 'contactForm', label: 'Contact form' },
  { value: 'contactSidebar', label: 'Contact sidebar' },
  { value: 'heroPanel', label: 'Hero side panel' },
  { value: 'storyQuote', label: 'Story + quote' },
  { value: 'audienceGrid', label: 'Audience grid' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'statusBanner', label: 'Status banner' },
  { value: 'statusMetrics', label: 'Status metrics' },
  { value: 'statusGroups', label: 'Status groups' },
  { value: 'statusIncidents', label: 'Status incidents' },
  { value: 'guideLinks', label: 'Guide links' },
  { value: 'statusList', label: 'Status list' },
  { value: 'blogListing', label: 'Blog listing' },
  { value: 'cta', label: 'Call to action' },
]

export function createEmptyBlock(type: SitePageBlockType, pageKey: string, index: number): SitePageBlock {
  const id = `${pageKey}-${type}-${Date.now()}-${index}`

  switch (type) {
    case 'hero':
      return {
        id,
        type,
        layout: 'marketing',
        eyebrow: 'Eyebrow',
        title: 'Page title',
        lead: 'Introduction text.',
        primaryButton: { label: 'Get started', to: '/contact' },
      }
    case 'section':
      return { id, type, heading: 'Section heading', paragraphs: ['Paragraph text.'] }
    case 'stats':
      return { id, type, items: [{ value: '100%', label: 'Your API keys' }] }
    case 'featureGrid':
      return { id, type, heading: 'Features', items: [{ title: 'Feature', description: 'Description' }] }
    case 'steps':
      return { id, type, heading: 'How it works', items: [{ number: '01', title: 'Step one', description: 'Details' }] }
    case 'serviceCards':
      return {
        id,
        type,
        items: [{ id: 'service', title: 'Service', shortDescription: 'Short', description: 'Long', features: [], icon: 'blog', available: true }],
      }
    case 'pricingPlans':
      return {
        id,
        type,
        plans: [{
          id: 'free',
          name: 'Free',
          price: '$0',
          period: 'forever',
          description: 'Try Content AI',
          credits: '1 credit',
          highlighted: false,
          cta: 'Start free',
          ctaLink: '/contact',
          features: ['One free content piece'],
        }],
      }
    case 'faqList':
      return { id, type, categories: [{ id: 'general', title: 'General', faqs: [{ question: 'Question?', answer: 'Answer.' }] }] }
    case 'guideLinks':
      return { id, type, items: [{ title: 'Guide', description: 'Description', to: '/faq' }] }
    case 'statusList':
      return { id, type, items: [{ name: 'Website', status: 'operational' }] }
    case 'blogListing':
      return { id, type, heading: 'Latest articles', description: 'Fresh guides and product updates.' }
    case 'trustBand':
      return { id, type, label: 'Trusted by teams worldwide', items: ['OpenAI', 'Anthropic'] }
    case 'featuredSpotlight':
      return {
        id,
        type,
        eyebrow: 'Featured',
        title: 'Spotlight title',
        description: 'Spotlight description.',
        features: ['Feature one', 'Feature two'],
        cta: { label: 'Learn more', to: '/services' },
      }
    case 'cta':
      return {
        id,
        type,
        title: 'Call to action',
        description: 'Supporting text.',
        primary: { label: 'Get started', to: '/contact' },
      }
  }
}
