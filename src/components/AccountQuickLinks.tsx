import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

export type AccountQuickLinkItem = {
  to: string
  title: string
  description: string
}

type AccountQuickLinksProps = {
  links: AccountQuickLinkItem[]
}

export default function AccountQuickLinks({ links }: AccountQuickLinksProps) {
  return (
    <div className="account-home-quick-links">
      {links.map((link) => (
        <Link key={link.to} to={link.to} className="account-home-quick-link">
          <div className="account-home-quick-link-body">
            <strong>{link.title}</strong>
            <span>{link.description}</span>
          </div>
          <span className="account-home-quick-link-arrow" aria-hidden="true">
            <FontAwesomeIcon icon={faArrowRight} />
          </span>
        </Link>
      ))}
    </div>
  )
}
