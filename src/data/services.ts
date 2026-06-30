import type { ContentIconName } from '../components/ContentIcon'

export type Service = {
  id: string
  title: string
  shortDescription: string
  description: string
  features: string[]
  icon: ContentIconName
  available: boolean
  creditCost: number
}

export const services: Service[] = [
  {
    id: 'auto-blog',
    title: 'Auto Blog Creation',
    shortDescription:
      'Generate high-quality blog posts automatically using your own AI API keys.',
    description:
      'Connect your OpenAI, Anthropic, or other AI provider keys and let Content AI handle the rest. We craft SEO-friendly blog posts tailored to your niche, tone, and audience — without storing or sharing your credentials.',
    features: [
      'Bring your own AI API keys — full control over cost and provider',
      'Topic research, outlines, and full draft generation in one flow',
      'Custom tone, length, and keyword targeting',
      'Intelligent internal links to your existing posts',
      'SEO optimization pass with score, fixes, and JSON-LD schema',
      'Export-ready markdown or HTML for any CMS',
      'Batch generation for content calendars',
    ],
    icon: 'blog',
    available: true,
    creditCost: 1,
  },
  {
    id: 'social-content',
    title: 'Social Media Content',
    shortDescription: 'Turn ideas into posts for every major platform.',
    description:
      'Repurpose blog topics into platform-native posts for LinkedIn, X, Instagram, and more — matched to your brand voice and audience.',
    features: [
      'Posts tailored for each social platform',
      'Hashtag and hook suggestions included',
      'Batch create a week of social content at once',
    ],
    icon: 'social',
    available: true,
    creditCost: 1,
  },
  {
    id: 'seo-optimization',
    title: 'SEO Optimization',
    shortDescription: 'Built into Auto Blog — scoring, fixes, and schema on every draft.',
    description:
      'Every blog generation includes on-page SEO scoring, metadata optimization, search intent mapping, secondary keywords, and BlogPosting JSON-LD — no extra credits required.',
    features: [
      'Auto SEO score out of 100 on every generated post',
      'Meta title, description, and keyword optimization pass',
      'Search intent + secondary keyword suggestions',
      'BlogPosting JSON-LD schema export',
      'Included with Auto Blog generation',
    ],
    icon: 'seo',
    available: true,
    creditCost: 0,
  },
  {
    id: 'content-repurpose',
    title: 'Content Repurposing',
    shortDescription: 'Transform one piece of content into many formats.',
    description:
      'Turn a single blog post into newsletters, social threads, summaries, and snippets — without starting from scratch every time.',
    features: [
      'Blog-to-social and blog-to-email workflows',
      'Multiple formats from one source draft',
      'Consistent messaging across channels',
    ],
    icon: 'repurpose',
    available: false,
    creditCost: 1,
  },
  {
    id: 'email-newsletters',
    title: 'Email Newsletters',
    shortDescription: 'Draft engaging newsletters from your content library.',
    description:
      'Generate newsletter editions from your existing content library with subject lines, sections, and CTAs ready to send.',
    features: [
      'Subject line and preview text suggestions',
      'Section-based newsletter layouts',
      'Pull from your generated blog library',
    ],
    icon: 'newsletter',
    available: true,
    creditCost: 1,
  },
  {
    id: 'content-scheduling',
    title: 'Content Scheduling',
    shortDescription: 'Plan and schedule publishing across channels.',
    description:
      'Organize your content calendar, plan publish dates, and keep your blog and social pipeline on track from one place.',
    features: [
      'Visual content calendar planning',
      'Schedule blogs and social posts',
      'Team workflow and approval ready',
    ],
    icon: 'schedule',
    available: false,
    creditCost: 1,
  },
]

export function getServiceById(id: string): Service | undefined {
  return services.find((service) => service.id === id)
}

/** Services hidden from marketing pages and account service pickers (still in catalog for routing/admin). */
export const FRONTEND_HIDDEN_SERVICE_IDS = new Set(['seo-optimization'])

export function isFrontendPublicService(service: Pick<Service, 'id' | 'available'>): boolean {
  if (!service.available) return false
  if (FRONTEND_HIDDEN_SERVICE_IDS.has(service.id)) return false
  return true
}

/** Services that are live on the product (excludes coming-soon placeholders and front-hidden items). */
export const liveServices = services.filter(isFrontendPublicService)

export const servicesStats = [
  { value: String(liveServices.length), label: 'Content tools' },
  { value: String(liveServices.length), label: 'Live today' },
  { value: '100%', label: 'Your API keys' },
  { value: 'SEO', label: 'Ready output' },
]

export function getServiceInitials(title: string): string {
  const parts = title.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  if (parts[0] && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return title.slice(0, 2).toUpperCase()
}

export function getServiceAccountPath(id: string): string {
  if (id === 'seo-optimization') {
    return '/account/services/auto-blog?tab=settings'
  }
  return `/account/services/${id}`
}
