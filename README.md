import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function YourSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".your-section",   // section that triggers the color change
        start: "top top",          // when section top hits viewport top
        end: "+=100%",             // scroll distance over which it happens
        scrub: 0.5,                // ties animation progress to scroll (smooth)
        // markers: true,          // uncomment while testing to see start/end
      },
    });

    tl.to(".navbar", {
      background: "#0a0a0a",       // whitish -> black
      ease: "power2.inOut",
      duration: 1,
    });

    return () => {
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="your-section" ref={sectionRef}>
      {/* content */}
    </section>
  );
}

export default YourSection;



Stop-Process -Id 22144 -Force -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 500; Get-Process -Id 22144 -ErrorAction SilentlyContinue

taskkill /PID 2728 /F