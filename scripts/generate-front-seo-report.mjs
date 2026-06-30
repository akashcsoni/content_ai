#!/usr/bin/env node
/**
 * Generates front-website-seo-report.csv from source config and page metadata.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const siteUrl = 'https://contentai.example'
const siteName = 'Content AI'

function parsePageSeoFromTs() {
  const content = fs.readFileSync(path.join(root, 'src/config/seo.ts'), 'utf8')
  const start = content.indexOf('export const pageSeo = {')
  const end = content.indexOf('} satisfies Record<string, PageSeo>')
  const pageSeoBlock = content.slice(start, end)
  const titles = {}
  const descriptions = {}
  const blockRegex = /^\s{2}(\w+):\s*\{([\s\S]*?)\n\s{2}\},?\s*$/gm
  let match
  while ((match = blockRegex.exec(pageSeoBlock)) !== null) {
    const [, key, block] = match
    const templateTitle = block.match(/title:\s*`\$\{siteConfig\.name\}\s*—([^`]+)`/)
    const quotedTitle = block.match(/title:\s*'([^']+)'/)
    titles[key] = templateTitle
      ? `${siteName} —${templateTitle[1]}`
      : quotedTitle?.[1] ?? ''
    const descMatch = block.match(/description:\s*\n\s*'([^']+)'/)
    descriptions[key] = descMatch?.[1] ?? ''
  }
  return { titles, descriptions }
}

const { titles: pageSeoTitles, descriptions: pageSeoDescriptions } = parsePageSeoFromTs()

function formatSeoDocumentTitle(title) {
  const trimmed = title.trim()
  if (!trimmed) return siteName
  if (trimmed.toLowerCase().includes(siteName.toLowerCase())) return trimmed
  return `${trimmed} — ${siteName}`
}

function clampMetaDescription(text) {
  const trimmed = text.trim()
  if (trimmed.length >= 150 && trimmed.length <= 160) return trimmed
  if (trimmed.length > 160) return `${trimmed.slice(0, 157).replace(/\s+\S*$/, '')}.`
  return `${trimmed} Manage drafts, settings, and exports in your Content AI workspace dashboard.`.slice(
    0,
    160,
  )
}

const sitemapPaths = new Set(
  [...fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname.replace(/\/$/, '') || '/',
  ),
)

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function csvRow(values) {
  return values.map(csvEscape).join(',')
}

function scoreTitle(len) {
  if (len >= 50 && len <= 60) return { status: 'Good', points: 15 }
  if (len >= 30 && len <= 70) return { status: 'Warning', points: 10 }
  return { status: 'Poor', points: 5 }
}

function scoreDescription(len) {
  if (len >= 150 && len <= 160) return { status: 'Good', points: 15 }
  if (len >= 120 && len <= 170) return { status: 'Warning', points: 10 }
  return { status: 'Poor', points: 5 }
}

function buildIssues(row) {
  const issues = []
  if (row.titleLengthStatus === 'Poor') issues.push('Title length outside 30–70 chars')
  else if (row.titleLengthStatus === 'Warning') issues.push('Title length not in ideal 50–60 range')
  if (row.descriptionLengthStatus === 'Poor') issues.push('Meta description outside 120–170 chars')
  else if (row.descriptionLengthStatus === 'Warning')
    issues.push('Meta description not in ideal 150–160 range')
  if (row.h1Alignment === 'Mismatch') issues.push('H1 does not closely match meta title')
  if (row.ogImage === 'No') issues.push('Missing og:image / twitter:image')
  if (row.inSitemap === 'No' && row.robots === 'index, follow') issues.push('Indexable but missing from sitemap.xml')
  if (row.inSitemap === 'Yes' && row.robots.startsWith('noindex')) issues.push('In sitemap but marked noindex')
  if (row.robots === 'index, follow' && row.pageCategory === 'Auth') issues.push('Auth page is indexable (consider noindex)')
  if (row.robots === 'index, follow' && row.pageCategory === 'Account') issues.push('Account page is indexable (consider noindex)')
  if (!row.jsonLdTypes) issues.push('No JSON-LD structured data')
  if (row.pageType === 'Blog post' && row.ogImage === 'No') issues.push('Blog post missing featured image for social')
  if (row.pageType === 'Blog post' && /Content AI.*Content AI/i.test(row.metaTitle))
    issues.push('Meta title repeats brand (seoTitle already includes | Content AI)')
  return issues.join('; ')
}

function buildRecommendations(row) {
  const recs = []
  if (row.ogImage === 'No') recs.push('Add default OG image in SEO component or per-page image')
  if (row.inSitemap === 'No' && row.pageType === 'Blog post') recs.push('Add blog URLs to sitemap (dynamic sitemap recommended)')
  if (row.h1Alignment === 'Mismatch') recs.push('Align H1 with primary keyword from meta title')
  if (row.robots === 'index, follow' && ['Auth', 'Account'].includes(row.pageCategory))
    recs.push('Set noindex on login/account pages')
  if (row.titleLengthStatus !== 'Good') recs.push('Tune meta title to 50–60 characters')
  if (row.descriptionLengthStatus !== 'Good') recs.push('Tune meta description to 150–160 characters')
  return recs.join('; ')
}

function computeScore(row) {
  let score = 0
  score += row.titleLengthPoints
  score += row.descriptionLengthPoints
  if (row.hasSeoComponent === 'Yes') score += 10
  if (row.h1Present === 'Yes') score += 10
  if (row.h1Alignment === 'Match') score += 5
  else if (row.h1Alignment === 'Partial') score += 3
  if (row.canonical === 'Yes') score += 10
  if (row.ogTags === 'Yes') score += 5
  if (row.ogImage === 'Yes') score += 10
  if (row.twitterTags === 'Yes') score += 5
  if (row.jsonLdTypes) score += 10
  if (row.inSitemap === 'Yes' && row.robots === 'index, follow') score += 5
  if (row.robots.startsWith('noindex') && ['Auth', 'Account'].includes(row.pageCategory)) score += 5
  return Math.min(100, score)
}

function normalizePath(p) {
  return p.startsWith('/') ? p : `/${p}`
}

function inSitemap(pagePath) {
  const normalized = normalizePath(pagePath).replace(/\/$/, '') || '/'
  return sitemapPaths.has(normalized) ? 'Yes' : 'No'
}

function h1Alignment(metaTitle, h1) {
  if (!h1) return 'Missing'
  const strip = (s) =>
    s
      .toLowerCase()
      .replace(/content ai/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  const a = strip(metaTitle)
  const b = strip(h1)
  if (!b) return 'Missing'
  if (a.includes(b) || b.includes(a)) return 'Match'
  const aWords = new Set(a.split(' ').filter((w) => w.length > 3))
  const bWords = b.split(' ').filter((w) => w.length > 3)
  const overlap = bWords.filter((w) => aWords.has(w)).length
  if (overlap >= 2) return 'Partial'
  return 'Mismatch'
}

function makeRow(input) {
  const titleLen = input.metaTitle.length
  const descLen = input.metaDescription.length
  const titleScore = scoreTitle(titleLen)
  const descScore = scoreDescription(descLen)
  const row = {
    pageName: input.pageName,
    url: `${siteUrl}${normalizePath(input.path)}`,
    path: normalizePath(input.path),
    pageCategory: input.pageCategory,
    pageType: input.pageType,
    metaTitle: input.metaTitle,
    titleLength: titleLen,
    titleLengthStatus: titleScore.status,
    titleLengthPoints: titleScore.points,
    metaDescription: input.metaDescription,
    descriptionLength: descLen,
    descriptionLengthStatus: descScore.status,
    descriptionLengthPoints: descScore.points,
    h1: input.h1,
    h1Present: input.h1 ? 'Yes' : 'No',
    h1Alignment: h1Alignment(input.metaTitle, input.h1),
    focusKeyword: input.focusKeyword ?? '',
    keywords: input.keywords ?? '',
    robots: input.robots ?? 'index, follow',
    canonical: 'Yes',
    ogTags: 'Yes',
    ogType: input.ogType ?? 'website',
    ogImage: input.ogImage ?? 'No',
    twitterTags: 'Yes',
    jsonLdTypes: input.jsonLdTypes ?? '',
    inSitemap: inSitemap(input.path),
    hasSeoComponent: input.hasSeoComponent ?? 'Yes',
    bilingual: 'No',
    notes: input.notes ?? '',
  }
  row.seoScore = computeScore(row)
  row.grade =
    row.seoScore >= 85 ? 'A' : row.seoScore >= 75 ? 'B' : row.seoScore >= 65 ? 'C' : row.seoScore >= 50 ? 'D' : 'F'
  row.issues = buildIssues(row)
  row.recommendations = buildRecommendations(row)
  return row
}

// --- Static page H1 overrides (visible H1 vs meta title) ---
const pageH1 = {
  '/': 'Generate blogs with your AI, on your terms',
  '/services': 'AI content tools, one platform',
  '/about': 'AI content tools that put you in control',
  '/pricing': 'Start free, pay only for what you create',
  '/contact': "We're here to help you create",
  '/faq': 'Answers to your top questions',
  '/blog': 'Insights on AI content and SEO',
  '/status': 'Content AI platform health',
  '/signin': 'Sign in to Content AI',
  '/signup': 'Create your Content AI account',
  '/careers': 'Build the future of AI content with us',
  '/partnerships': 'Partner with Content AI',
  '/guides': 'Content guides & learning paths',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/cookies': 'Cookie Policy',
  '/security': 'Security at Content AI',
}

const pageMeta = {
  home: {
    path: '/',
    pageName: 'Home',
    pageCategory: 'Marketing',
    pageType: 'Landing',
    jsonLdTypes: 'Organization; WebSite',
    keywords: 'AI blog generator, auto blog creation, bring your own API key, OpenAI blog writer, AI content platform, SEO blog generator',
  },
  services: {
    path: '/services',
    pageName: 'Services',
    pageCategory: 'Marketing',
    pageType: 'Landing',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'AI content services, automated blog writing, AI social media content, content repurposing tool, AI newsletter generator',
  },
  about: {
    path: '/about',
    pageName: 'About',
    pageCategory: 'Marketing',
    pageType: 'Content',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'about Content AI, AI writing platform, BYOK AI content, content automation company',
  },
  pricing: {
    path: '/pricing',
    pageName: 'Pricing',
    pageCategory: 'Marketing',
    pageType: 'Content',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI pricing, AI content credits, pay as you go blog generator, free AI blog trial, content creation credits',
  },
  contact: {
    path: '/contact',
    pageName: 'Contact',
    pageCategory: 'Marketing',
    pageType: 'Content',
    jsonLdTypes: 'BreadcrumbList; ContactPage',
    keywords: 'contact Content AI, Content AI support, AI content help, blog generator contact, Content AI sales',
  },
  faq: {
    path: '/faq',
    pageName: 'FAQ',
    pageCategory: 'Marketing',
    pageType: 'Content',
    jsonLdTypes: 'BreadcrumbList; FAQPage',
    keywords: 'Content AI FAQ, AI content credits help, API keys blog generator, free content credit, Content AI help center',
  },
  blog: {
    path: '/blog',
    pageName: 'Blog index',
    pageCategory: 'Marketing',
    pageType: 'Blog listing',
    jsonLdTypes: 'BreadcrumbList; Blog',
    keywords: 'Content AI blog, AI content tips, SEO blog guides, AI writing articles, content marketing blog',
  },
  signUp: {
    path: '/signup',
    pageName: 'Sign up',
    pageCategory: 'Auth',
    pageType: 'Auth',
    jsonLdTypes: '',
    keywords: 'Content AI sign up, create Content AI account, AI content registration',
    notes: 'No breadcrumb JSON-LD',
  },
  signIn: {
    path: '/signin',
    pageName: 'Sign in',
    pageCategory: 'Auth',
    pageType: 'Auth',
    jsonLdTypes: '',
    keywords: 'Content AI sign in, Content AI login, AI content account',
    notes: 'No breadcrumb JSON-LD',
  },
  account: {
    path: '/account',
    pageName: 'Account dashboard',
    pageCategory: 'Account',
    pageType: 'App',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI account, content credits dashboard',
    notes: 'Protected route — requires login',
  },
  billing: {
    path: '/account/billing',
    pageName: 'Billing',
    pageCategory: 'Account',
    pageType: 'App',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'buy content credits, Content AI billing, top up credits',
    notes: 'Protected route — requires login',
  },
  usage: {
    path: '/account/usage',
    pageName: 'Usage',
    pageCategory: 'Account',
    pageType: 'App',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI usage, content credits used, AI content activity',
    notes: 'Protected route — requires login',
  },
  settings: {
    path: '/account/settings',
    pageName: 'Account settings',
    pageCategory: 'Account',
    pageType: 'App',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI account settings, change password, profile settings',
    notes: 'Protected route — requires login',
  },
  support: {
    path: '/account/support',
    pageName: 'Support',
    pageCategory: 'Account',
    pageType: 'App',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI support, help ticket, billing support, account help',
    notes: 'Protected route — requires login',
  },
  careers: {
    path: '/careers',
    pageName: 'Careers',
    pageCategory: 'Marketing',
    pageType: 'Static',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI careers, AI startup jobs, remote content AI jobs',
  },
  partnerships: {
    path: '/partnerships',
    pageName: 'Partnerships',
    pageCategory: 'Marketing',
    pageType: 'Static',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI partnerships, AI content reseller, agency AI integration',
  },
  guides: {
    path: '/guides',
    pageName: 'Guides',
    pageCategory: 'Marketing',
    pageType: 'Static',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'AI content guides, auto blog tutorial, Content AI help resources',
  },
  status: {
    path: '/status',
    pageName: 'Status',
    pageCategory: 'Marketing',
    pageType: 'Static',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI status, platform uptime, service health',
  },
  privacy: {
    path: '/privacy',
    pageName: 'Privacy policy',
    pageCategory: 'Legal',
    pageType: 'Static',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI privacy policy, data protection, API key privacy',
  },
  terms: {
    path: '/terms',
    pageName: 'Terms of service',
    pageCategory: 'Legal',
    pageType: 'Static',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI terms of service, user agreement, content AI legal',
  },
  cookies: {
    path: '/cookies',
    pageName: 'Cookie policy',
    pageCategory: 'Legal',
    pageType: 'Static',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI cookie policy, website cookies, tracking preferences',
  },
  security: {
    path: '/security',
    pageName: 'Security',
    pageCategory: 'Legal',
    pageType: 'Static',
    jsonLdTypes: 'BreadcrumbList',
    keywords: 'Content AI security, API key encryption, data security',
  },
}

const rows = []

for (const [key, meta] of Object.entries(pageMeta)) {
  const robots = ['Auth', 'Account'].includes(meta.pageCategory) ? 'noindex, nofollow' : 'index, follow'
  rows.push(
    makeRow({
      ...meta,
      metaTitle: pageSeoTitles[key],
      metaDescription: pageSeoDescriptions[key],
      h1: pageH1[meta.path] ?? '',
      robots,
      ogImage: 'No',
    }),
  )
}

// Account sub-routes
rows.push(
  makeRow({
    pageName: 'Invoice',
    path: '/account/billing/invoice/:purchaseId',
    pageCategory: 'Account',
    pageType: 'App',
    metaTitle: 'Purchase Invoice — View and Download Receipt | Content AI',
    metaDescription:
      'View and download your Content AI purchase invoice with itemized credits, payment details, and billing information from your account billing history page.',
    h1: 'Content AI (company name on invoice)',
    robots: 'noindex, nofollow',
    jsonLdTypes: 'BreadcrumbList',
    ogImage: 'No',
    notes: 'Dynamic route; noindex set in AccountInvoicePage',
  }),
)

const servicePages = [
  { id: 'auto-blog', title: 'Auto Blog Creation' },
  { id: 'social-content', title: 'Social Media Content' },
  { id: 'email-newsletter', title: 'Email Newsletters' },
  { id: 'seo-optimization', title: 'SEO Optimization' },
  { id: 'content-repurpose', title: 'Content Repurposing' },
  { id: 'scheduling', title: 'Content Scheduling' },
]

const serviceDescriptions = {
  'auto-blog':
    'Generate high-quality blog posts automatically using your own AI API keys.',
  'social-content': 'Turn ideas into posts for every major platform.',
  'email-newsletter': 'Create HTML email newsletters with your brand and API keys.',
  'seo-optimization': 'Keyword research and on-page SEO suggestions.',
  'content-repurpose': 'Transform one piece of content into many formats.',
  scheduling: 'Plan and queue content across channels from one workspace.',
}

for (const service of servicePages) {
  const shortDescription = serviceDescriptions[service.id] ?? service.title
  let titleBase = `${service.title} Workspace Dashboard`
  if (formatSeoDocumentTitle(titleBase).length < 50) {
    titleBase = `${service.title} Tool Workspace Dashboard`
  }
  const workspaceTitle = formatSeoDocumentTitle(titleBase)
  rows.push(
    makeRow({
      pageName: `Service workspace — ${service.title}`,
      path: `/account/services/${service.id}`,
      pageCategory: 'Account',
      pageType: 'App',
      metaTitle: workspaceTitle,
      metaDescription: clampMetaDescription(
        `${shortDescription} Manage ${service.title.toLowerCase()} topics, categories, drafts, and settings in your Content AI workspace.`,
      ),
      h1: service.title,
      robots: 'noindex, nofollow',
      jsonLdTypes: 'BreadcrumbList',
      ogImage: 'No',
      notes: 'Protected route; noindex',
    }),
  )
}

rows.push(
  makeRow({
    pageName: 'Support ticket detail',
    path: '/account/support/:ticketId',
    pageCategory: 'Account',
    pageType: 'App',
    metaTitle: pageSeoTitles.support,
    metaDescription: pageSeoDescriptions.support,
    h1: 'Support ticket (dynamic)',
    robots: 'noindex, nofollow',
    jsonLdTypes: 'BreadcrumbList',
    ogImage: 'No',
    notes: 'Protected route; reuses support page SEO config',
  }),
)

// Blog posts from cmsBlogSeed.ts
const seedContent = fs.readFileSync(path.join(root, 'server/src/data/cmsBlogSeed.ts'), 'utf8')
const postBlocks = seedContent.split(/\n  \{\n/).slice(1)
for (const block of postBlocks) {
  const slug = block.match(/slug: '([^']+)'/)?.[1]
  const title = block.match(/title: '([^']+)'/)?.[1]
  const focusKeyword = block.match(/focusKeyword: '([^']+)'/)?.[1] ?? ''
  const metaDescription = block.match(/metaDescription:\s*\n\s*'([^']+)'/)?.[1] ?? ''
  const seoTitle = block.match(/seoTitle: '([^']+)'/)?.[1] ?? title
  const featuredImage = block.match(/featuredImage:\s*\n\s*'([^']+)'/)?.[1] ?? ''
  if (!slug || !title) continue

  const fullMetaTitle = formatSeoDocumentTitle(seoTitle)
  rows.push(
    makeRow({
      pageName: title,
      path: `/blog/${slug}`,
      pageCategory: 'Marketing',
      pageType: 'Blog post',
      metaTitle: fullMetaTitle,
      metaDescription,
      h1: title,
      focusKeyword,
      keywords: focusKeyword,
      robots: 'index, follow',
      ogType: 'article',
      ogImage: featuredImage ? 'Yes' : 'No',
      jsonLdTypes: 'BreadcrumbList; BlogPosting',
      notes: featuredImage ? 'Featured image set for OG' : '',
    }),
  )
}

rows.sort((a, b) => {
  const catOrder = { Marketing: 0, Legal: 1, Auth: 2, Account: 3 }
  const ca = catOrder[a.pageCategory] ?? 9
  const cb = catOrder[b.pageCategory] ?? 9
  if (ca !== cb) return ca - cb
  return a.path.localeCompare(b.path)
})

const headers = [
  'Page Name',
  'URL',
  'Path',
  'Page Category',
  'Page Type',
  'Meta Title',
  'Title Length',
  'Title Length Status',
  'Meta Description',
  'Description Length',
  'Description Length Status',
  'H1',
  'H1 Present',
  'H1 vs Title Alignment',
  'Focus Keyword',
  'Keywords',
  'Robots',
  'Canonical Tag',
  'OG Tags',
  'OG Type',
  'OG Image',
  'Twitter Tags',
  'JSON-LD Types',
  'In Sitemap',
  'SEO Component',
  'SEO Score (/100)',
  'Grade',
  'Issues',
  'Recommendations',
  'Notes',
]

const avgScore = (rows.reduce((s, r) => s + r.seoScore, 0) / rows.length).toFixed(1)

const lines = [
  csvRow(headers),
  ...rows.map((row) =>
    csvRow([
      row.pageName,
      row.url,
      row.path,
      row.pageCategory,
      row.pageType,
      row.metaTitle,
      row.titleLength,
      row.titleLengthStatus,
      row.metaDescription,
      row.descriptionLength,
      row.descriptionLengthStatus,
      row.h1,
      row.h1Present,
      row.h1Alignment,
      row.focusKeyword,
      row.keywords,
      row.robots,
      row.canonical,
      row.ogTags,
      row.ogType,
      row.ogImage,
      row.twitterTags,
      row.jsonLdTypes,
      row.inSitemap,
      row.hasSeoComponent,
      row.seoScore,
      row.grade,
      row.issues,
      row.recommendations,
      row.notes,
    ]),
  ),
  '',
  csvRow([
    'REPORT SUMMARY',
    '',
    '',
    '',
    '',
    `Generated ${new Date().toISOString()}`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    avgScore,
    '',
    `${rows.length} pages audited`,
    '',
    `Site: ${siteUrl}`,
  ]),
]

const outPath = path.join(root, 'front-website-seo-report.csv')
fs.writeFileSync(outPath, lines.join('\n'), 'utf8')

const marketing = rows.filter((r) => r.pageCategory === 'Marketing')
const avgMarketing = marketing.reduce((s, r) => s + r.seoScore, 0) / marketing.length

console.log(`Wrote ${rows.length} pages to ${outPath}`)
console.log(`Overall average score: ${(rows.reduce((s, r) => s + r.seoScore, 0) / rows.length).toFixed(1)}/100`)
console.log(`Marketing pages average: ${avgMarketing.toFixed(1)}/100`)
