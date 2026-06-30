export const siteConfig = {
  name: 'WBBYWRITER',
  tagline: 'Digital Content & Solutions',
  description:
    'Digital content and AI solutions for creators and teams. Generate blogs and marketing content with your own API keys — full control, zero markup.',
  url: import.meta.env.VITE_SITE_URL ?? 'https://contentai.example',
  locale: 'en_US',
  twitterHandle: '@contentai',
  contactEmail: 'hello@contentai.example',
  themeColor: '#0d0d0d',
} as const

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url.replace(/\/$/, '')}${normalizedPath}`
}
