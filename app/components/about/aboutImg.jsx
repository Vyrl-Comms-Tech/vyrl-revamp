// import React from 'react'
// import UnicornEmbed from "../layout/UnicornEmbed";
// import '../../styles/about-img.css'

// const AboutImg = () => {
//   return (
//     <div className='aboutImg'>
//       <UnicornEmbed projectId="49J5vr4fHwsoSv3oeJcM" className="aboutImg-embed" />
//     </div>
//   )
// }

// export default AboutImg
import React from 'react'
import UnicornEmbed from "../layout/UnicornEmbed";
import '../../styles/about-img.css'

const AboutImg = () => {
  return (
    <div className='aboutImg'>
      <UnicornEmbed filePath="/about-us-hero.json" className="aboutImg-embed" />
    </div>
  )
}

export default AboutImg
