import type { Service } from './services'

export type HomeMockupSlide = {
  serviceId: string
  windowTitle: string
  statusText: string
  primaryField: { label: string; value: string }
  secondaryField: { label: string; items: string[] }
  progressLabel: string
  progressPercent: number
}

const mockupPresets: Record<string, Omit<HomeMockupSlide, 'serviceId'>> = {
  'auto-blog': {
    windowTitle: 'Auto Blog',
    statusText: 'OpenAI connected',
    primaryField: { label: 'Topic', value: '10 AI content trends for 2026' },
    secondaryField: {
      label: 'Outline',
      items: ['Introduction & hook', 'Key trends breakdown', 'Actionable takeaways'],
    },
    progressLabel: 'Generating draft…',
    progressPercent: 78,
  },
  'social-content': {
    windowTitle: 'Social Content',
    statusText: '3 platforms selected',
    primaryField: { label: 'Campaign', value: 'Product launch week — hooks & hashtags' },
    secondaryField: {
      label: 'Posts',
      items: ['LinkedIn thought-leadership thread', 'X announcement with CTA', 'Instagram carousel caption'],
    },
    progressLabel: 'Creating social posts…',
    progressPercent: 65,
  },
  'email-newsletters': {
    windowTitle: 'Email Newsletter',
    statusText: 'Anthropic connected',
    primaryField: { label: 'Subject', value: 'Weekly roundup — what shipped this month' },
    secondaryField: {
      label: 'Sections',
      items: ['Intro & personal note', 'Featured blog highlight', 'CTA to latest content'],
    },
    progressLabel: 'Building newsletter…',
    progressPercent: 82,
  },
}

function fallbackSlide(service: Service): Omit<HomeMockupSlide, 'serviceId'> {
  return {
    windowTitle: service.title,
    statusText: 'Ready to generate',
    primaryField: { label: 'Brief', value: service.shortDescription },
    secondaryField: {
      label: 'Includes',
      items: service.features.slice(0, 3),
    },
    progressLabel: 'Preparing output…',
    progressPercent: 55,
  }
}

export function getHomeMockupSlides(services: Service[]): HomeMockupSlide[] {
  return services.slice(0, 3).map((service) => ({
    serviceId: service.id,
    ...(mockupPresets[service.id] ?? fallbackSlide(service)),
  }))
}

export function getHomeMockupTabLabel(service: Service): string {
  if (service.id === 'auto-blog') return 'Auto Blog'
  if (service.id === 'social-content') return 'Social'
  if (service.id === 'email-newsletters') return 'Newsletter'
  return service.title.split(' ')[0] ?? service.title
}
