import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/paral-image.css";

gsap.registerPlugin(ScrollTrigger);

const WIPE_HIDDEN = "inset(0% 100% 0% 0%)";
const WIPE_FULL = "inset(0% 0% 0% 0%)";

// Wrap any <img> in this. Pass "paral" in className for a vertical
// parallax drift as it crosses the viewport (GSAP port of the old
// ScrollMagic + TimelineMax `.box-img` scene), "fade" for a fade-in
// on scroll (GSAP port of the old `.fadein`/`.visible` scroll handler),
// or "wipe" to clip-path reveal left-to-right (with an image zoom-out)
// every time `src` changes - useful for click-driven slide swaps.
// "wipe" renders a back/front image pair (same technique StaticCards uses
// for its slide transitions) so the previous image stays fully visible
// underneath while the new one loads and reveals, instead of flashing
// blank background while the new image is still downloading.
// All three flags are independent and can be combined on the same image.
export default function ParalImage({
  src,
  alt = "",
  width,
  height,
  className = "",
  wrapperClassName = "",
  offset = 120,
  fadeDuration = 1.4,
  fadeDistance = 70,
}) {
  const wrapRef = useRef(null);
  const parallaxRef = useRef(null);
  const imgRef = useRef(null);
  const backImgRef = useRef(null);
  const frontImgRef = useRef(null);

  const classTokens = className.split(/\s+/).filter(Boolean);
  const hasParallax = classTokens.includes("paral");
  const hasFade = classTokens.includes("fade");
  const hasWipe = classTokens.includes("wipe");
  const imgClassName = classTokens
    .filter((token) => token !== "paral" && token !== "fade" && token !== "wipe")
    .join(" ");

  useEffect(() => {
    const parallaxTarget = hasWipe ? parallaxRef.current : imgRef.current;
    const tweens = [];

    if (hasParallax) {
      tweens.push(
        gsap.fromTo(
          parallaxTarget,
          { y: -offset / 2 },
          {
            y: offset / 2,
            ease: "none",
            scrollTrigger: {
              trigger: wrapRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        )
      );
    }

    if (hasFade) {
      // toggleActions "play none none reverse" mirrors the original
      // jQuery handler: visible once the wrapper's top crosses the
      // viewport bottom, hidden again if scrolled back above it.
      // Scale + blur are layered on top of the plain opacity/translate
      // fade so the reveal reads as a soft, premium "focus pull" rather
      // than a flat fade — start: "top 92%" lets it begin a beat before
      // the element is fully on-screen instead of waiting for the
      // bottom edge, which feels snappier.
      tweens.push(
        gsap.fromTo(
          wrapRef.current,
          { autoAlpha: 0, y: fadeDistance, scale: 0.94, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: fadeDuration,
            ease: "power4.out",
            scrollTrigger: {
              trigger: wrapRef.current,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          }
        )
      );
    }

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, [hasParallax, hasFade, hasWipe, offset, fadeDuration, fadeDistance]);

  // left-to-right clip-path reveal + image zoom-out, replayed on every src swap.
  // Skips the very first run (mount) since back/front already match - nothing to reveal.
  const isFirstWipeRun = useRef(true);
  useEffect(() => {
    if (!hasWipe) return;
    if (isFirstWipeRun.current) {
      isFirstWipeRun.current = false;
      return;
    }
    const front = frontImgRef.current;
    const back = backImgRef.current;
    if (!front || !back) return;

    front.src = src;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.set(front, { clipPath: WIPE_HIDDEN })
      .fromTo(front, { scale: 1.15 }, { scale: 1, clipPath: WIPE_FULL, duration: 1 })
      .call(() => {
        back.src = src;
        gsap.set(front, { clipPath: WIPE_HIDDEN, scale: 1 });
      });

    return () => {
      tl.kill();
    };
  }, [hasWipe, src]);

  if (hasWipe) {
    return (
      <div ref={wrapRef} className={`paral-img-wrap ${wrapperClassName}`}>
        <div
          ref={parallaxRef}
          className="paral-img-parallax"
          style={
            hasParallax
              ? { height: `calc(100% + ${offset}px)`, top: -offset / 2 }
              : undefined
          }
        >
          <img
            ref={backImgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`paral-img ${imgClassName}`}
          />
          <img
            ref={frontImgRef}
            src={src}
            alt=""
            width={width}
            height={height}
            className={`paral-img paral-img-front ${imgClassName}`}
            style={{ clipPath: WIPE_HIDDEN }}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`paral-img-wrap ${wrapperClassName}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`paral-img ${imgClassName}`}
        style={
          hasParallax
            ? { height: `calc(100% + ${offset}px)`, top: -offset / 2 }
            : undefined
        }
      />
    </div>
  );
}
