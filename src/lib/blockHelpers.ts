import type { SitePageBlock } from './sitePageBlocks'

export type BlockCtaLink = { label: string; to: string }

export function getBlockCtaLink(block: SitePageBlock, key: string): BlockCtaLink | undefined {
  const value = block[key]
  if (!value || typeof value !== 'object') return undefined
  const link = value as { label?: string; to?: string }
  if (!link.label || !link.to) return undefined
  return { label: link.label, to: link.to }
}

export function getHeroButton(
  block: SitePageBlock,
  key: 'primary' | 'secondary',
): BlockCtaLink | undefined {
  const modernKey = key === 'primary' ? 'primaryButton' : 'secondaryButton'
  return getBlockCtaLink(block, modernKey) ?? getBlockCtaLink(block, key)
}

export function isMarketingHero(block: SitePageBlock): boolean {
  return block.type === 'hero' && block.layout === 'marketing'
}
