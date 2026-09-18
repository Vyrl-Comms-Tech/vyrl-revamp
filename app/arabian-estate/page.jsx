import React from 'react'
import CaseStudyInner from '../components/caseStudy/CaseStudyInner'
import { getCaseStudyJsonLd } from '../components/caseStudy/caseStudiesData'

export const metadata = {
  title: "Arabian Estates Case Study",
  description:
    "How Vyrl Communications built Arabian Estates' custom real estate platform: a luxury brand identity, React development, and a high-performance property showcase.",
  alternates: { canonical: "/arabian-estate" },
}

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getCaseStudyJsonLd("arabian-estate")) }}
      />
      <CaseStudyInner slug="arabian-estate" />
    </div>
  )
}

export default page
