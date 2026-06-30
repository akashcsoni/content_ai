export type AccountQuickLinkItem = {
  to: string
  title: string
  description: string
}

export type AccountAction = {
  id: string
  title: string
  description: string
  link: string
  label: string
  primary?: boolean
}

export type AccountStep = {
  id: string
  title: string
  description: string
  done?: boolean
}

export const accountDashboardQuickLinks: AccountQuickLinkItem[] = [
  {
    to: '/account/billing',
    title: 'Billing & credits',
    description: 'Buy credits or review payment history',
  },
  {
    to: '/account/usage',
    title: 'Usage',
    description: 'See credits used and generation activity',
  },
  {
    to: '/account/settings',
    title: 'Account settings',
    description: 'Update profile and change password',
  },
  {
    to: '/account/support',
    title: 'Support',
    description: 'Get help or open a support ticket',
  },
]

export const accountSettingsQuickLinks: AccountQuickLinkItem[] = [
  {
    to: '/account',
    title: 'Dashboard',
    description: 'Credits, usage, and services overview',
  },
  {
    to: '/account/usage',
    title: 'Usage',
    description: 'Requests, tokens, and activity history',
  },
  {
    to: '/account/billing',
    title: 'Billing',
    description: 'Purchase credits and view payment history',
  },
]

export const accountSupportQuickLinks: AccountQuickLinkItem[] = [
  {
    to: '/account/billing',
    title: 'Billing & credits',
    description: 'Buy credits or review payment history',
  },
  {
    to: '/faq',
    title: 'FAQ',
    description: 'Answers to common platform questions',
  },
  {
    to: '/account/usage',
    title: 'Usage',
    description: 'See credits used and generation activity',
  },
]

export const accountActions: AccountAction[] = [
  {
    id: 'create',
    title: 'Create content',
    description: 'Generate blog posts, social copy, and more with your API keys.',
    link: '/services',
    label: 'Go to services',
    primary: true,
  },
  {
    id: 'credits',
    title: 'Add credits',
    description: '$1 per credit. One credit creates one content piece.',
    link: '/account/billing',
    label: 'Buy credits',
  },
  {
    id: 'faq',
    title: 'How credits work',
    description: 'Learn about free signup credit, top-ups, and BYOK setup.',
    link: '/faq',
    label: 'Read FAQ',
  },
]

export const gettingStartedSteps: AccountStep[] = [
  {
    id: 'account',
    title: 'Account created',
    description: 'Your email is verified and your profile is ready.',
    done: true,
  },
  {
    id: 'credits',
    title: 'Use your free credit',
    description: 'You received 1 free content credit when you signed up.',
  },
  {
    id: 'keys',
    title: 'Add your API keys',
    description: 'Connect OpenAI, Anthropic, or other providers when creating content.',
  },
]
