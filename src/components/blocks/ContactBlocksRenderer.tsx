import type { SitePageBlock } from '../../lib/sitePageBlocks'
import {
  ContactCtaSection,
  ContactFormBlock,
  ContactHeroSection,
  ContactMainSection,
  ContactSidebarBlock,
} from './ContactPageBlocks'
import '../../styles/contact.css'

type ContactBlocksRendererProps = {
  blocks: SitePageBlock[]
}

export default function ContactBlocksRenderer({ blocks }: ContactBlocksRendererProps) {
  const hero = blocks.find((block) => block.type === 'hero')
  const formBlock = blocks.find((block) => block.type === 'contactForm')
  const sidebarBlock = blocks.find((block) => block.type === 'contactSidebar')
  const ctaBlocks = blocks.filter((block) => block.type === 'cta')

  return (
    <div className="contact-page">
      {hero ? <ContactHeroSection block={hero} /> : null}

      {formBlock && sidebarBlock ? (
        <ContactMainSection formBlock={formBlock} sidebarBlock={sidebarBlock} />
      ) : (
        <>
          {formBlock ? (
            <section className="contact-main" aria-label="Contact form">
              <div className="contact-container">
                <ContactFormBlock block={formBlock} />
              </div>
            </section>
          ) : null}
          {sidebarBlock ? (
            <section className="contact-main" aria-label="Contact information">
              <div className="contact-container">
                <ContactSidebarBlock block={sidebarBlock} />
              </div>
            </section>
          ) : null}
        </>
      )}

      {ctaBlocks.map((block) => (
        <ContactCtaSection key={block.id} block={block} />
      ))}
    </div>
  )
}
