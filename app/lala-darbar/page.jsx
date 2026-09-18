import React from 'react'
import CaseStudyInner from '../components/caseStudy/CaseStudyInner'
import { getCaseStudyJsonLd } from '../components/caseStudy/caseStudiesData'
import { getBreadcrumbJsonLd } from '../lib/breadcrumbJsonLd'

export const metadata = {
  title: "Lala Darbar Case Study",
  description:
    "How Vyrl Communications built the brand and website for Lala Darbar, a Pakistani restaurant in Dubai, with custom GSAP animation and scroll-based storytelling.",
  alternates: { canonical: "/lala-darbar" },
}

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getCaseStudyJsonLd("lala-darbar")) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd([
              { name: "Projects", path: "/projects" },
              { name: "Lala Darbar", path: "/lala-darbar" },
            ]),
          ),
        }}
      />
      <CaseStudyInner slug="lala-darbar" />
    </div>
  )
}

export default page
