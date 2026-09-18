import React from 'react'
import CaseStudyInner from '../components/caseStudy/CaseStudyInner'

export const metadata = {
  title: "Jeikor Case Study",
  description:
    "How Vyrl Communications built the digital presence for Jeikor Contracting, a Dubai-based construction and infrastructure firm, with a fully responsive React site and GSAP animation.",
  alternates: { canonical: "/jeikor" },
}

const page = () => {
  return (
    <div>
      <CaseStudyInner slug="jeikor" />
    </div>
  )
}

export default page
