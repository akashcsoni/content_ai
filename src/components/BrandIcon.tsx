import { siteConfig } from '../config/site'

type BrandIconProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'header'
}

const sizeClass = {
  sm: 'site-logo--sm',
  md: 'site-logo--md',
  lg: 'site-logo--lg',
  header: 'site-logo--header',
} as const

export default function BrandIcon({ className = '', size = 'header' }: BrandIconProps) {
  return (
    <img
      src="/logo.png"
      alt={siteConfig.name}
      className={`site-logo ${sizeClass[size]} ${className}`.trim()}
      decoding="async"
    />
  )
}
