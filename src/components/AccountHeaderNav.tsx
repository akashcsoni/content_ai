import { NavLink, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import {
  accountNavItems,
  isAccountServiceRoute,
  isServiceNavLinkActive,
  type AccountNavItem,
} from '../data/accountNav'

type AccountHeaderNavProps = {
  variant: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export default function AccountHeaderNav({ variant, onNavigate }: AccountHeaderNavProps) {
  const location = useLocation()

  function renderItem(item: AccountNavItem) {
    if (item.type === 'link') {
      const className =
        variant === 'desktop'
          ? ({ isActive }: { isActive: boolean }) =>
              isActive ? 'header-nav-link active' : 'header-nav-link'
          : ({ isActive }: { isActive: boolean }) =>
              isActive ? 'header-mobile-link active' : 'header-mobile-link'

      return (
        <li key={item.to}>
          <NavLink to={item.to} end={item.end} className={className} onClick={onNavigate}>
            {item.label}
          </NavLink>
        </li>
      )
    }

    const servicesActive = isAccountServiceRoute(location.pathname)

    if (variant === 'mobile') {
      return (
        <li key="services" className="header-mobile-nav-group">
          <span className="header-mobile-nav-group-label">{item.label}</span>
          <ul className="header-mobile-nav-sublist">
            {item.items.map((service) => {
              const active = isServiceNavLinkActive(
                location.pathname,
                location.search,
                service.to,
              )
              return (
                <li key={service.to}>
                  <NavLink
                    to={service.to}
                    className={active ? 'header-mobile-link active' : 'header-mobile-link'}
                    onClick={onNavigate}
                  >
                    {service.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </li>
      )
    }

    return (
      <li
        key="services"
        className={`header-nav-item header-nav-item--dropdown${servicesActive ? ' is-active' : ''}`}
      >
        <button
          type="button"
          className={`header-nav-link header-nav-link--trigger${servicesActive ? ' active' : ''}`}
          aria-haspopup="true"
          aria-expanded={servicesActive}
        >
          {item.label}
          <FontAwesomeIcon icon={faChevronDown} className="header-nav-chevron" aria-hidden="true" />
        </button>
        <ul className="header-nav-submenu">
          {item.items.map((service) => {
            const active = isServiceNavLinkActive(location.pathname, location.search, service.to)
            return (
              <li key={service.to}>
                <NavLink
                  to={service.to}
                  className={active ? 'header-nav-submenu-link active' : 'header-nav-submenu-link'}
                  onClick={onNavigate}
                >
                  {service.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </li>
    )
  }

  if (variant === 'mobile') {
    return <ul>{accountNavItems.map(renderItem)}</ul>
  }

  return <ul className="header-nav-list">{accountNavItems.map(renderItem)}</ul>
}
