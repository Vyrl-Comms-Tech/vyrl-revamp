"use client";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import PageTransitionLink from "./PageTransitionLink";
import "../../styles/cta.css";

// forwardRef so callers that need to move/measure the button as a DOM
// node (CaseStudyInner's GSAP Flip reparents it into a fixed portal on
// scroll) can get a real element ref — pointed at the container div,
// since that's the whole visual unit Flip should animate/reparent as
// one piece.
const CtaButton = forwardRef(function CtaButton(
  {
    label = "SERVICES",
    videoSrc = "/bg-v-compressed.mp4",
    href = "#",
    className = "",
    id,
    external = false,
  },
  forwardedRef,
) {
  const containerRef = useRef(null);
  useImperativeHandle(forwardedRef, () => containerRef.current, []);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldLoad]);

  const arrowIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="18"
      viewBox="0 0 15 18"
      fill="none"
    >
      <path
        d="M10.3213 0.000213146L1.27547e-05 4.4884L0.64805 5.937L8.47908 2.53785L2.7051 17.4253L4.19683 18.0038L9.97081 3.11641L13.462 10.9068L14.9174 10.274L10.3213 0.000213146Z"
        fill="white"
      />
    </svg>
  );

  // Pure-CSS hover (see cta.css): two arrow badges, "before" resting
  // in place near the label and "after" pre-positioned off past the
  // right edge — on hover, "before" slides out to the left while
  // "after" slides in from the right, and the label shifts left to
  // make room. No JS-measured travel distance needed (the previous
  // GSAP version kept landing short of the button's edges depending
  // on padding/text width), since every position here is a fixed CSS
  // transform the browser applies natively.
  const content = (
    <>
      <div className="cta-btn-vid">
        {shouldLoad && (
          <video muted loop autoPlay playsInline preload="none">
            <source src={videoSrc} />
          </video>
        )}
      </div>
      <div className="cta-arrow-box cta-arrow-box--before">{arrowIcon}</div>
      <p className="cta-btn-label">{label}</p>
      <div className="cta-arrow-box cta-arrow-box--after">{arrowIcon}</div>
    </>
  );

  return (
    <div className="cta-btn-container" ref={containerRef}>
      {external ? (
        <a
          className={`cta-btn ${className}`.trim()}
          href={href}
          id={id}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      ) : (
        <PageTransitionLink
          className={`cta-btn ${className}`.trim()}
          href={href}
          id={id}
        >
          {content}
        </PageTransitionLink>
      )}
    </div>
  );
});

export default CtaButton;
