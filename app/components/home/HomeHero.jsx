import React from 'react'
import Image from 'next/image'
import '../../styles/home-hero.css'

const HomeHero = () => {
  return (
    <div className='homehero'>
      <Image
        src="/hero.png"
        alt=""
        fill
        preload
        fetchPriority="high"
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}

export default HomeHero
