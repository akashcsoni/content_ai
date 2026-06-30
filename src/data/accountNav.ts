import { getServiceAccountPath, liveServices } from './services'

export type AccountNavLink = {
  to: string
  label: string
  end?: boolean
}

export type AccountNavItem =
  | ({ type: 'link' } & AccountNavLink)
  | {
      type: 'services'
      label: string
      items: AccountNavLink[]
    }

export const accountServiceLinks: AccountNavLink[] = liveServices.map((service) => ({
    to: getServiceAccountPath(service.id),
    label: service.title,
  }))

export const accountNavItems: AccountNavItem[] = [
  { type: 'link', to: '/account', label: 'Dashboard', end: true },
  { type: 'services', label: 'Services', items: accountServiceLinks },
  { type: 'link', to: '/account/billing', label: 'Billing' },
  { type: 'link', to: '/account/usage', label: 'Usage' },
  { type: 'link', to: '/account/support', label: 'Support' },
  { type: 'link', to: '/account/settings', label: 'Settings' },
]

export function isAccountServiceRoute(pathname: string): boolean {
  return pathname === '/account/services' || pathname.startsWith('/account/services/')
}

export function isServiceNavLinkActive(pathname: string, search: string, to: string): boolean {
  const [path, query] = to.split('?')
  if (query) {
    return pathname === path && search === `?${query}`
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}
