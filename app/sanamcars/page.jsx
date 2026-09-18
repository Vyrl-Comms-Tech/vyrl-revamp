import React from 'react'
import CaseStudyInner from '../components/caseStudy/CaseStudyInner'
import { getCaseStudyJsonLd } from '../components/caseStudy/caseStudiesData'
import { getBreadcrumbJsonLd } from '../lib/breadcrumbJsonLd'

export const metadata = {
  title: "Sanam Cars Case Study",
  description:
    "How Vyrl Communications built Sanam Cars' custom car marketplace: React development, GSAP-powered animations, and a premium automotive brand identity.",
  alternates: { canonical: "/sanamcars" },
}

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getCaseStudyJsonLd("sanam-cars")) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd([
              { name: "Projects", path: "/projects" },
              { name: "Sanam Cars", path: "/sanamcars" },
            ]),
          ),
        }}
      />
      <CaseStudyInner slug="sanam-cars" />
    </div>
  )
}

export default page
