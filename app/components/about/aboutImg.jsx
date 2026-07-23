import React from 'react'
import '../../styles/about-img.css'

const AboutImg = () => {
  return (
    <div className='aboutImg'>
      <video src="/aboutUsHero.mp4" autoPlay loop muted playsInline />
    </div>
  )
}

export default AboutImg
