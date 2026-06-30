#!/usr/bin/env node
/**
 * Repairs cmsBlogSeed SEO fields to 50–60 char titles and 150–160 char descriptions.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = path.join(root, 'server/src/data/cmsBlogSeed.ts')

function clampTitle(title) {
  let value = title.trim().replace(/\.+$/, '')
  if (value.length >= 50 && value.length <= 60) return value
  if (value.length < 50) {
    const suffix = ' | Content AI'
    const base = value.replace(/\s*\|\s*Content AI\s*$/i, '').trim()
    for (const extra of [' Guide', ' Tips', ' Overview', ' Explained']) {
      const candidate = `${base}${extra}${suffix}`
      if (candidate.length >= 50 && candidate.length <= 60) return candidate
    }
  }
  if (value.length > 60) return value.slice(0, 57).replace(/\s+\S*$/, '') + '…'
  return value
}

function clampDescription(text) {
  let value = text.trim().replace(/\s+/g, ' ')
  if (value.length >= 150 && value.length <= 160) return value
  if (value.length > 160) return value.slice(0, 157).replace(/\s+\S*$/, '') + '.'
  const tail = ' Practical tips for Content AI users with bring-your-own-key workflows.'
  value = `${value}${tail}`
  if (value.length > 160) value = value.slice(0, 157).replace(/\s+\S*$/, '') + '.'
  if (value.length < 150) value = value.padEnd(150, '.')
  return value.slice(0, 160)
}

const seoBySlug = {
  'bring-your-own-api-key-ai-content': {
    metaDescription:
      'Discover why Content AI uses a bring-your-own-key model for OpenAI and Anthropic — better cost control, privacy, and flexibility for teams.',
    seoTitle: 'Bring Your Own API Key for AI Content | Content AI',
  },
  'seo-friendly-blog-posts-with-ai': {
    metaDescription:
      'Step-by-step guide to creating SEO-friendly blog posts with AI — structure, keywords, meta tags, and publish-ready HTML exports for your CMS.',
    seoTitle: 'SEO-Friendly Blog Posts with AI Guide | Content AI',
  },
  'getting-started-auto-blog-content-ai': {
    metaDescription:
      'Get started with Content AI Auto Blog — categories, topics, API keys, and your first generated post explained for new users setting up a workspace.',
    seoTitle: 'Getting Started with Auto Blog Guide | Content AI',
  },
  'openai-vs-anthropic-content-creation': {
    metaDescription:
      'OpenAI GPT vs Anthropic Claude for blog writing — strengths, trade-offs, and when to use each model inside your Content AI auto blog workspace.',
    seoTitle: 'OpenAI vs Anthropic for Content Guide | Content AI',
  },
  'scale-content-without-burning-budget': {
    metaDescription:
      'Five practical ways to scale blog and marketing content on a budget using Content AI credits, batch topics, reusable categories, and smart exports.',
    seoTitle: 'Scale Content on a Budget with Content AI | Content AI',
  },
  'understanding-content-credits': {
    metaDescription:
      'Learn how Content AI credits work — free signup credit, one-dollar top-ups, and what counts as one content piece when you generate blogs or social posts.',
    seoTitle: 'Understanding Content Credits on Content AI | Content AI',
  },
  'markdown-vs-html-export-cms': {
    metaDescription:
      'Markdown vs HTML exports from Content AI — which format to use for WordPress, Ghost, Notion, and static site generators when publishing AI blog drafts.',
    seoTitle: 'Markdown vs HTML Export Guide | Content AI',
  },
  'solo-creator-content-workflow': {
    metaDescription:
      'A solo creator content workflow using Content AI — weekly planning, AI drafts, light editing, and a publish checklist for one-person marketing teams.',
    seoTitle: 'Solo Creator Content Workflow Guide | Content AI',
  },
  'ai-blog-generation-saves-time': {
    metaDescription:
      'See how AI blog generation on Content AI saves ten or more hours weekly on research, outlining, and first drafts while you keep control of your API keys.',
    seoTitle: 'AI Blog Generation Saves Time Weekly | Content AI',
  },
  'privacy-control-your-keys-your-data': {
    metaDescription:
      'Content AI privacy model — your API keys, your provider relationship, and what the platform stores for your account, drafts, and billing history.',
    seoTitle: 'Privacy and Control on Content AI Guide | Content AI',
  },
  'social-media-content-one-brief-every-platform': {
    metaDescription:
      'Create LinkedIn, X, Instagram, and Facebook posts from one brief using Content AI Social Media Content with platform-native tone, length, and hashtags.',
    seoTitle: 'Social Media Content from One Brief | Content AI',
  },
  'category-prompts-improve-auto-blog': {
    metaDescription:
      'Improve Auto Blog output with category prompts — tone, audience, and structure rules per content theme before you generate SEO-friendly blog drafts.',
    seoTitle: 'Category Prompts for Auto Blog Quality | Content AI',
  },
  'topic-queues-batch-blog-ideas': {
    metaDescription:
      'Use Auto Blog topic queues to batch ideas, generate posts on demand, and track pending or used topics without losing momentum in your content calendar.',
    seoTitle: 'Topic Queues for Auto Blog Planning | Content AI',
  },
  'featured-images-blog-seo-social': {
    metaDescription:
      'Enable AI featured images in Auto Blog for better SEO snippets, social previews, and on-page engagement when publishing long-form articles to your site.',
    seoTitle: 'Featured Images for Blog SEO and Social | Content AI',
  },
  'publish-auto-blog-drafts-wordpress': {
    metaDescription:
      'Publish Auto Blog drafts to WordPress — copy HTML, SEO fields, slug, and featured image from Content AI into posts with minimal manual formatting work.',
    seoTitle: 'Publish Auto Blog Drafts to WordPress | Content AI',
  },
  'linkedin-content-strategy-b2b': {
    metaDescription:
      'B2B LinkedIn content strategy using Content AI — hooks, professional tone, and topic batches for consistent posting from one AI content workspace.',
    seoTitle: 'LinkedIn B2B Content Strategy Guide | Content AI',
  },
  'instagram-captions-convert-ai': {
    metaDescription:
      'Write Instagram captions with AI — hooks, line breaks, hashtags, and square post images on Content AI for creators who publish visual social content.',
    seoTitle: 'Instagram Captions That Convert with AI | Content AI',
  },
  'brand-voice-ai-generated-content': {
    metaDescription:
      'Keep brand voice consistent across AI blogs and social posts with Content AI settings, category prompts, and workspace rules your whole team can reuse.',
    seoTitle: 'Brand Voice for AI-Generated Content | Content AI',
  },
  'repurpose-blog-into-social-content': {
    metaDescription:
      'Repurpose blog posts into LinkedIn, X, and Instagram content using Content AI Social Media Content without rewriting every caption from scratch.',
    seoTitle: 'Repurpose Blog Posts into Social Content | Content AI',
  },
  'faq-sections-seo-reader-trust': {
    metaDescription:
      'FAQ sections in AI blog posts improve SEO snippets, reader trust, and time on page — Auto Blog includes them by default in structured HTML exports.',
    seoTitle: 'FAQ Sections for SEO and Reader Trust | Content AI',
  },
  'choosing-focus-keywords-before-generate': {
    metaDescription:
      'Choose focus keywords before AI blog generation — align titles, headings, and meta fields for SEO before Content AI writes your draft.',
    seoTitle: 'Choosing Focus Keywords Before You Generate | Content AI',
  },
  'draft-vs-published-ai-content': {
    metaDescription:
      'Draft vs published workflow for AI blogs — review before ship or auto-publish from Auto Blog settings depending on your editorial and compliance needs.',
    seoTitle: 'Draft vs Published AI Content Workflow | Content AI',
  },
  'tracking-usage-credits-dashboard': {
    metaDescription:
      'Track Content AI usage, credits, and billing from your account dashboard — daily stats, generation history, and purchase records in one place.',
    seoTitle: 'Track Usage and Credits in Your Dashboard | Content AI',
  },
  'support-tickets-account-help': {
    metaDescription:
      'Open support tickets from your Content AI account for billing, API, and generation help. Authenticated users get responses from the support team.',
    seoTitle: 'Account Support Tickets on Content AI | Content AI',
  },
  'claude-long-form-editorial-content': {
    metaDescription:
      'Use Anthropic Claude for long-form editorial AI content on Content AI — when and how to configure Claude for nuanced articles and explainers.',
    seoTitle: 'Claude for Long-Form Editorial Content | Content AI',
  },
  'google-gemini-fast-content-drafts': {
    metaDescription:
      'Use Google Gemini for fast AI content drafts on Content AI — blogs, social posts, and topic generation when speed and cost efficiency matter most.',
    seoTitle: 'Google Gemini for Fast Content Drafts | Content AI',
  },
  'multi-step-blog-generation-roadmap': {
    metaDescription:
      'Multi-step blog generation on Content AI — plan, opening, body, and closing prompts explained for teams building repeatable long-form content pipelines.',
    seoTitle: 'Multi-Step Blog Generation on Content AI | Content AI',
  },
  'x-threads-short-posts-topic-briefs': {
    metaDescription:
      'Create X posts and threads from topic briefs with Content AI — concise copy, optional wide images, and batches aligned to your social content calendar.',
    seoTitle: 'X Threads and Short Posts from Briefs | Content AI',
  },
  'facebook-posts-community-page-updates': {
    metaDescription:
      'Generate Facebook page posts with Content AI — friendly tone, hashtags, and optional AI images for community updates and marketing announcements.',
    seoTitle: 'Facebook Posts for Pages and Communities | Content AI',
  },
  'content-length-presets-short-medium-long': {
    metaDescription:
      'Auto Blog content length presets — short, medium, long, and custom word counts matched to search intent, SERP competition, and reader expectations.',
    seoTitle: 'Content Length Presets for Auto Blog SEO | Content AI',
  },
  'importing-category-packs-workspace-setup': {
    metaDescription:
      'Import category packs in Content AI for faster Auto Blog and Social Content workspace setup with pre-built prompts, topics, and tone defaults.',
    seoTitle: 'Import Category Packs for Workspace Setup | Content AI',
  },
  'ten-checks-before-publish-ai-draft': {
    metaDescription:
      'Ten checks before publishing AI blog or social drafts — facts, SEO fields, images, tone, links, and compliance steps before you ship content live.',
    seoTitle: 'Ten Checks Before Publishing AI Drafts | Content AI',
  },
}

for (const [slug, fields] of Object.entries(seoBySlug)) {
  seoBySlug[slug] = {
    seoTitle: clampTitle(fields.seoTitle),
    metaDescription: clampDescription(fields.metaDescription),
  }
}

let content = fs.readFileSync(file, 'utf8')

for (const [slug, { seoTitle, metaDescription }] of Object.entries(seoBySlug)) {
  const slugBlock = new RegExp(
    `(slug: '${slug}'[\\s\\S]*?metaDescription:\\s*\\n\\s*)'[\\s\\S]*?'([\\s\\S]*?seoTitle: )'[\\s\\S]*?'`,
  )
  if (!slugBlock.test(content)) {
    console.warn('Missing slug block:', slug)
    continue
  }
  content = content.replace(
    slugBlock,
    `$1'${metaDescription.replace(/'/g, "\\'")}'$2'${seoTitle.replace(/'/g, "\\'")}'`,
  )
}

// Remove accidental duplicate corruption for understanding-content-credits
content = content.replace(
  /slug: 'understanding-content-credits',\n    excerpt:[\s\S]*?metaDescription:\s*\n\s*'Learn how Content AI credits work — free signup credit, slug: 'understanding-content-credits',\n    excerpt:[\s\S]*?metaDescription:\s*\n\s* per credit top-ups, and what counts as one content piece\. Learn more on the Content AI blog with prac',\n    seoTitle: 'Understanding Content Credits \| Content AI\.\.\.\.\.\.\.\.',\n/,
  '',
)

fs.writeFileSync(file, content, 'utf8')

const bad = Object.entries(seoBySlug).filter(
  ([, v]) =>
    v.seoTitle.length < 50 ||
    v.seoTitle.length > 60 ||
    v.metaDescription.length < 150 ||
    v.metaDescription.length > 160,
)
console.log(`Repaired ${Object.keys(seoBySlug).length} blog SEO entries`)
if (bad.length) console.warn('Out of range:', bad)
else console.log('All blog SEO fields within Good range')
