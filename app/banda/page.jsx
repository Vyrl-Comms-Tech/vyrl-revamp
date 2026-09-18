import React from 'react'
import CaseStudyInner from '../components/caseStudy/CaseStudyInner'

export const metadata = {
  title: "Banda Case Study",
  description:
    "How Vyrl Communications built the brand and website for Banda, a luxury real estate investment and development firm inspired by East African heritage.",
  alternates: { canonical: "/banda" },
}

const page = () => {
  return (
    <div>
      <CaseStudyInner slug="banda" />
    </div>
  )
}

export default page
