import React from 'react'
import CaseStudyInner from '../components/caseStudy/CaseStudyInner'

export const metadata = {
  title: "Lala Darbar Case Study",
  description:
    "How Vyrl Communications built the brand and website for Lala Darbar, a Pakistani restaurant in Dubai, with custom GSAP animation and scroll-based storytelling.",
  alternates: { canonical: "/lala-darbar" },
}

const page = () => {
  return (
    <div>
      <CaseStudyInner slug="lala-darbar" />
    </div>
  )
}

export default page
