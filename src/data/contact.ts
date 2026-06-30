import { siteConfig } from '../config/site'

export const contactSubjects = [
  { value: 'general', label: 'General inquiry' },
  { value: 'sales', label: 'Sales & pricing' },
  { value: 'support', label: 'Technical support' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'waitlist', label: 'Waitlist for new services' },
] as const

export type ContactSubject = (typeof contactSubjects)[number]['value']

export const contactMethods = [
  {
    title: 'Email us',
    description: 'Best for detailed questions, billing, and account help.',
    value: siteConfig.contactEmail,
    href: `mailto:${siteConfig.contactEmail}`,
    icon: 'email' as const,
  },
  {
    title: 'Response time',
    description: 'We reply to every message within 1–2 business days.',
    value: 'Mon – Fri, 9am – 6pm EST',
    icon: 'clock' as const,
  },
  {
    title: 'Help center',
    description: 'Instant answers about credits, API keys, and services.',
    value: 'Browse FAQ',
    href: '/faq',
    icon: 'help' as const,
  },
]

export const contactReasons = [
  'Questions about free plan & credits',
  'Help connecting OpenAI or Anthropic keys',
  'Early access to upcoming services',
  'Partnerships & agency inquiries',
]

export type ContactMethod = (typeof contactMethods)[number]

export const contactSidebarDefaults = {
  methods: contactMethods,
  reasons: contactReasons,
  reasonsHeading: 'What can we help with?',
  accentTitle: 'Need a faster answer?',
  accentDescription: 'Check our FAQ for instant answers about pricing credits, API keys, and blog creation.',
  accentButtonLabel: 'Visit help center',
  accentButtonLink: '/faq',
  officeNote: 'Remote-first team · Serving creators worldwide',
} as const

export function resolveContactSidebarContent(block: Record<string, unknown>) {
  const methods =
    Array.isArray(block.methods) && block.methods.length > 0
      ? (block.methods as ContactMethod[])
      : contactSidebarDefaults.methods

  const reasons =
    Array.isArray(block.reasons) && block.reasons.length > 0
      ? (block.reasons as string[])
      : contactSidebarDefaults.reasons

  return {
    methods,
    reasons,
    reasonsHeading: String(block.reasonsHeading ?? contactSidebarDefaults.reasonsHeading),
    accentTitle: String(block.accentTitle ?? contactSidebarDefaults.accentTitle),
    accentDescription: String(block.accentDescription ?? contactSidebarDefaults.accentDescription),
    accentButtonLabel: String(block.accentButtonLabel ?? contactSidebarDefaults.accentButtonLabel),
    accentButtonLink: String(block.accentButtonLink ?? contactSidebarDefaults.accentButtonLink),
    officeNote: String(block.officeNote ?? contactSidebarDefaults.officeNote),
  }
}
