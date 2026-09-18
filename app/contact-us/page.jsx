import React from 'react'
import ContactHero from '../components/contact-us/ContactHero'
import { getBreadcrumbJsonLd } from '../lib/breadcrumbJsonLd'

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Vyrl Communications, a Dubai-based creative and growth agency. Email grow@vyrl.ae or visit us at International Business Tower, Business Bay, Dubai, UAE.",
  alternates: { canonical: "/contact-us" },
}

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbJsonLd([{ name: "Contact Us", path: "/contact-us" }])),
        }}
      />
      <ContactHero />
    </div>
  )
}

export default page