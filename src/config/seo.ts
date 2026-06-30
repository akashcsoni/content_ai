import { absoluteUrl, siteConfig } from './site'

export type PageSeo = {
  title: string
  description: string
  path: string
  keywords: string[]
}

/** Document title for `<title>` / OG — avoids duplicating the site name. */
export function formatSeoDocumentTitle(title: string, brand = siteConfig.name): string {
  const trimmed = title.trim()
  if (!trimmed) return brand
  if (trimmed.toLowerCase().includes(brand.toLowerCase())) return trimmed
  return `${trimmed} — ${brand}`
}

function clampMetaDescription(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length >= 150 && trimmed.length <= 160) return trimmed
  if (trimmed.length > 160) return `${trimmed.slice(0, 157).replace(/\s+\S*$/, '')}.`
  return `${trimmed} Manage drafts, settings, and exports in your Content AI workspace dashboard.`.slice(
    0,
    160,
  )
}

export type PageSeoKey = keyof typeof pageSeo

export const pageSeo = {
  home: {
    title: 'Content AI — AI Blog & Content Creation with Your API Keys',
    description:
      'Create SEO-friendly blogs and content using your own OpenAI or Anthropic API keys. Content AI automates drafting while you control cost, privacy, and quality.',
    path: '/',
    keywords: [
      'AI blog generator',
      'auto blog creation',
      'bring your own API key',
      'OpenAI blog writer',
      'AI content platform',
      'SEO blog generator',
    ],
  },
  services: {
    title: 'AI Content Services — Blog Writing, Social & Email',
    description:
      'Explore six AI content services: auto blog, social posts, SEO optimization, repurposing, newsletters, and scheduling with your own OpenAI or Anthropic API keys.',
    path: '/services',
    keywords: [
      'AI content services',
      'automated blog writing',
      'AI social media content',
      'content repurposing tool',
      'AI newsletter generator',
    ],
  },
  about: {
    title: 'About Content AI — Your API Keys, Your Brand Voice',
    description:
      'Learn how Content AI helps creators and teams generate marketing content with OpenAI or Anthropic while keeping control of API keys, budget, and brand voice.',
    path: '/about',
    keywords: [
      'about Content AI',
      'AI writing platform',
      'BYOK AI content',
      'content automation company',
    ],
  },
  pricing: {
    title: 'Pricing — Free Content Credit and Pay-as-you-go Billing',
    description:
      'Start with one free content credit on signup. Top up at $1 per credit — one credit creates one content piece. No monthly subscription. Use your own AI API keys.',
    path: '/pricing',
    keywords: [
      'Content AI pricing',
      'AI content credits',
      'pay as you go blog generator',
      'free AI blog trial',
      'content creation credits',
    ],
  },
  contact: {
    title: 'Contact Content AI — Support, Sales & Partnerships',
    description:
      'Contact Content AI for help with credits, API keys, pricing, partnerships, or technical support. We respond within one to two business days by email, promptly.',
    path: '/contact',
    keywords: [
      'contact Content AI',
      'Content AI support',
      'AI content help',
      'blog generator contact',
      'Content AI sales',
    ],
  },
  faq: {
    title: 'FAQ & Help Center — Content AI Credits, API Keys & Services',
    description:
      'Find answers about Content AI pricing credits, free plan, API keys, auto blog creation, exports, and support. Search the help center or browse by topic.',
    path: '/faq',
    keywords: [
      'Content AI FAQ',
      'AI content credits help',
      'API keys blog generator',
      'free content credit',
      'Content AI help center',
    ],
  },
  signUp: {
    title: 'Sign Up Free — Create Your Content AI Account Today',
    description:
      'Create a free Content AI account with email verification and password. Get one free content credit and connect your OpenAI or Anthropic API keys today.',
    path: '/signup',
    keywords: ['Content AI sign up', 'create Content AI account', 'AI content registration'],
  },
  signIn: {
    title: 'Sign In — Log In to Your Content AI Account Securely',
    description:
      'Sign in to Content AI with email and password or a one-time verification code. Access your dashboard, credits, auto blog workspace, and social content tools.',
    path: '/signin',
    keywords: ['Content AI sign in', 'Content AI login', 'AI content account'],
  },
  account: {
    title: 'My Account Dashboard — Credits, Profile & Settings',
    description:
      'Manage your Content AI account dashboard. View credit balance, profile details, connected services, and quick links to billing, usage, and workspace settings.',
    path: '/account',
    keywords: ['Content AI account', 'content credits dashboard'],
  },
  billing: {
    title: 'Billing — Buy Content Credits and View Purchase History',
    description:
      'Top up your Content AI account with pay-as-you-go credits. One dollar per credit, one credit creates one content piece. View invoices and purchase history.',
    path: '/account/billing',
    keywords: ['buy content credits', 'Content AI billing', 'top up credits'],
  },
  usage: {
    title: 'Usage Dashboard — Track Your Content Credits & Activity',
    description:
      'Track content credits used, AI generation activity, and daily usage charts across your Content AI account. Export usage data and monitor spend over time.',
    path: '/account/usage',
    keywords: ['Content AI usage', 'content credits used', 'AI content activity'],
  },
  settings: {
    title: 'Account Settings — Update Profile, Password & Security',
    description:
      'Update your Content AI profile name and email, change your password, and manage account security settings from one place in your authenticated dashboard.',
    path: '/account/settings',
    keywords: ['Content AI account settings', 'change password', 'profile settings'],
  },
  blog: {
    title: 'Content AI Blog — AI Writing Tips, Guides & SEO News',
    description:
      'Read SEO-friendly articles on AI content creation, blog automation, social media workflows, and marketing tips from the Content AI team every week here.',
    path: '/blog',
    keywords: [
      'Content AI blog',
      'AI content tips',
      'SEO blog guides',
      'AI writing articles',
      'content marketing blog',
    ],
  },
  support: {
    title: 'Support Center — Help, Billing Assistance & Tickets',
    description:
      'Create and track support tickets for billing, credits, technical issues, and account help. Content AI support responds from your authenticated dashboard.',
    path: '/account/support',
    keywords: ['Content AI support', 'help ticket', 'billing support', 'account help'],
  },
  careers: {
    title: 'Careers at Content AI — Join Our Remote Product Team',
    description:
      'Explore careers at Content AI. We build AI content tools that put creators in control of API keys, budget, and brand voice. Remote-friendly async team.',
    path: '/careers',
    keywords: ['Content AI careers', 'AI startup jobs', 'remote content AI jobs'],
  },
  partnerships: {
    title: 'Partnerships — Agencies, Integrations & Affiliates',
    description:
      'Partner with Content AI for agency workflows, technology integrations, affiliate programs, and education. BYOK architecture fits resellers and platform teams.',
    path: '/partnerships',
    keywords: ['Content AI partnerships', 'AI content reseller', 'agency AI integration'],
  },
  guides: {
    title: 'Content Guides — AI Writing, Auto Blog & Publishing Tips',
    description:
      'Learn how to use Content AI with guides on API keys, auto blog creation, SEO exports, credits, publishing workflows, and social content best practices.',
    path: '/guides',
    keywords: ['AI content guides', 'auto blog tutorial', 'Content AI help resources'],
  },
  status: {
    title: 'Platform Status — Content AI Service Health & Uptime',
    description:
      'Check real-time operational status for the Content AI website, authentication, content generation, billing, payments, and support ticket systems in one place.',
    path: '/status',
    keywords: ['Content AI status', 'platform uptime', 'service health'],
  },
  privacy: {
    title: 'Privacy Policy — How Content AI Protects Your Account Data',
    description:
      'Read how Content AI collects, uses, stores, and protects your account data, API keys, and generated content. Learn about retention, sharing, and choices.',
    path: '/privacy',
    keywords: ['Content AI privacy policy', 'data protection', 'API key privacy'],
  },
  terms: {
    title: 'Terms of Service — Content AI Usage & Billing Rules',
    description:
      'Terms governing your use of Content AI, including credits, acceptable use, content ownership, billing, refunds, and responsibilities for AI-generated content.',
    path: '/terms',
    keywords: ['Content AI terms of service', 'user agreement', 'content AI legal'],
  },
  cookies: {
    title: 'Cookie Policy — How Content AI Uses Cookies on Our Site',
    description:
      'How Content AI uses essential, preference, and analytics cookies on our website and application. Learn what each cookie type does and how to manage preferences.',
    path: '/cookies',
    keywords: ['Content AI cookie policy', 'website cookies', 'tracking preferences'],
  },
  security: {
    title: 'Security Overview — How Content AI Protects Your Data',
    description:
      'Learn about encryption, API key handling, access controls, incident response, and how to report security issues at Content AI for BYOK content workflows.',
    path: '/security',
    keywords: ['Content AI security', 'API key encryption', 'data security'],
  },
} satisfies Record<string, PageSeo>

export function serviceWorkspaceSeo(serviceTitle: string, shortDescription: string, serviceId: string): PageSeo {
  let titleBase = `${serviceTitle} Workspace Dashboard`
  if (formatSeoDocumentTitle(titleBase).length < 50) {
    titleBase = `${serviceTitle} Tool Workspace Dashboard`
  }
  const title = formatSeoDocumentTitle(titleBase)
  const description = clampMetaDescription(
    `${shortDescription} Manage ${serviceTitle.toLowerCase()} topics, categories, drafts, and settings in your Content AI workspace.`,
  )

  return {
    title,
    description,
    path: `/account/services/${serviceId}`,
    keywords: [serviceTitle, 'Content AI workspace', 'AI content tools'],
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: absoluteUrl('/'),
  description: siteConfig.description,
  email: siteConfig.contactEmail,
  sameAs: [],
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: absoluteUrl('/'),
  description: siteConfig.description,
  inLanguage: 'en-US',
}

export function blogPostingJsonLd(post: {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified: string
  authorName?: string | null
  image?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: absoluteUrl(post.path),
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    ...(post.image?.trim()
      ? { image: [post.image.trim()] }
      : {}),
    author: {
      '@type': 'Person',
      name: post.authorName?.trim() || siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: absoluteUrl('/'),
    },
    mainEntityOfPage: absoluteUrl(post.path),
  }
}

export function blogListJsonLd(posts: { title: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteConfig.name} Blog`,
    url: absoluteUrl('/blog'),
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: absoluteUrl(post.path),
    })),
  }
}
