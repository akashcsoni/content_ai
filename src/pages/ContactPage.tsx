import ManagedPageContent from '../components/ManagedPageContent'
import ContactBlocksRenderer from '../components/blocks/ContactBlocksRenderer'
import { siteConfig } from '../config/site'
import { contactSidebarDefaults } from '../data/contact'
import type { SitePageBlock } from '../lib/sitePageBlocks'

const contactFallbackBlocks: SitePageBlock[] = [
  {
    id: 'contact-hero',
    type: 'hero',
    layout: 'marketing',
    eyebrow: 'Get in touch',
    title: "We're here to help you create",
    lead: 'Questions about credits, API keys, or getting started? Send us a message and our team will get back to you within 1–2 business days.',
  },
  {
    id: 'contact-form',
    type: 'contactForm',
    heading: 'Send us a message',
    description: "Fill out the form and we'll respond as soon as possible.",
  },
  {
    id: 'contact-sidebar',
    type: 'contactSidebar',
    methods: contactSidebarDefaults.methods.map((method) => ({
      ...method,
      value: method.title === 'Email us' ? siteConfig.contactEmail : method.value,
      href: method.title === 'Email us' ? `mailto:${siteConfig.contactEmail}` : method.href,
    })),
    reasons: [...contactSidebarDefaults.reasons],
    reasonsHeading: contactSidebarDefaults.reasonsHeading,
    accentTitle: contactSidebarDefaults.accentTitle,
    accentDescription: contactSidebarDefaults.accentDescription,
    accentButtonLabel: contactSidebarDefaults.accentButtonLabel,
    accentButtonLink: contactSidebarDefaults.accentButtonLink,
    officeNote: contactSidebarDefaults.officeNote,
  },
  {
    id: 'contact-cta',
    type: 'cta',
    title: 'Ready to create your first content?',
    description: 'Start free with 1 content credit. Connect your API keys and generate your first blog draft in minutes.',
    primary: { label: 'View pricing', to: '/pricing' },
  },
]

export default function ContactPage() {
  return (
    <ManagedPageContent pageKey="contact" replace>
      <ContactBlocksRenderer blocks={contactFallbackBlocks} />
    </ManagedPageContent>
  )
}
