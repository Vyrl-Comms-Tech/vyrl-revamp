"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/orbit-gallery.css";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { caseStudies } from "../caseStudy/caseStudiesData";
import PageTransitionLink from "../layout/PageTransitionLink";
// import { isKnownRoute } from
import "../../styles/footer.css";
import Link from "next/link";
import { isKnownRoute } from "../layout/knownRoutes";
import VyrlCtaButton from "../layout/VyrlCtaButton";
// import PageTransitionLink from "./PageTransitionLink";

const CASE_STUDY_PATHS = Object.values(caseStudies).map((c) => c.href);
const NO_FOOTER_PATHS = [...CASE_STUDY_PATHS, "/contact-us"];

// Renders the real PageTransitionLink normally, or a disabled, non-
// clickable version (dimmed via .footer-nav-link--disabled, no
// navigation) when the current page is already that link's
// destination. matchPaths lets "Work" and "Case Studies" both
// disable together on /projects since they share that one href.
function FooterNavLink({ href, pathname, className, matchPaths, children }) {
  const isActive = (matchPaths ?? [href]).includes(pathname);

  if (isActive) {
    return (
      <span
        className={`${className ?? ""} footer-nav-link--disabled`.trim()}
        aria-disabled="true"
        aria-current="page"
      >
        {children}
      </span>
    );
  }

  return (
    <PageTransitionLink href={href} className={className}>
      {children}
    </PageTransitionLink>
  );
}

gsap.registerPlugin(ScrollTrigger);
// orbit(1).avif
const DEFAULT_IMAGES = [
  { src: "orbit(1).avif", alt: "Collective member 1" },
  { src: "orbit(2).avif", alt: "Collective member 2" },
  { src: "orbit(4).avif", alt: "Collective member 4" },
  { src: "orbit(5).avif", alt: "Collective member 5" },
  { src: "orbit(18).avif", alt: "Collective member 3" },
  { src: "orbit(6).avif", alt: "Collective member 6" },
  { src: "orbit(7).avif", alt: "Collective member 7" },
  { src: "orbit(10).avif", alt: "Collective member 8" },
  //   { src: "banda4.avif", alt: "Collective member 9" },
  { src: "orbit(11).avif", alt: "Collective member 10" },
  { src: "orbit(12).avif", alt: "Collective member 11" },
  { src: "orbit(13).avif", alt: "Collective member 12" },
  //   { src: "jeikor4.avif", alt: "Collective member 13" },
  { src: "orbit(14).avif", alt: "Collective member 14" },
  { src: "orbit(15).avif", alt: "Collective member 15" },
  { src: "orbit(16).avif", alt: "Collective member 16" },
  { src: "orbit(17).avif", alt: "Collective member 17" },
];

const MOBILE_BREAKPOINT = 800;
// Desktop's 540/320 orbit radius reads oversized on laptop-range
// screens (the ring pushes cards close to/past the viewport edge at
// narrower widths still above the mobile breakpoint) — this tier scales
// it down, roughly the midpoint between mobile's 220/190 and desktop's
// 540/320, same "laptop gets its own smaller-than-desktop step" pattern
// Testimonials.jsx's counterOffsetX uses at the same 1500px cutoff.
const LAPTOP_BREAKPOINT = 1500;
const COMPACT_LAPTOP_BREAKPOINT = 1300;
const VELOCITY_TO_RADIANS = 0.00003;

export default function OrbitGallery({
  images = DEFAULT_IMAGES,
  heading = "The Collective Behind Every Experience",
  subheading = "Built by a collective of thinkers, makers, developers, creators, and growth specialists, all working together to turn bold ideas into digital systems that perform",
}) {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  const addCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current;
    if (!section || cards.length === 0) return;

    // Respect reduced-motion preference: render a static ring, no scroll animation.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    // The two pieces of motion here are independent: the orbit cards'
    // continuous scroll-driven rotation (kept on mobile too — it's
    // wanted there), and the pin timeline that reveals .footer over the
    // cards as the section is pinned (skipped on mobile — see the
    // max-width: 800px override in orbit-gallery.css/footer.css that
    // puts .footer in its plain static resting position there instead
    // of the translateY(100%) it starts at for the desktop reveal, so
    // there's nothing left for a pin to animate into place).
    const skipOrbitRotation = prefersReducedMotion;
    const skipPin = prefersReducedMotion || isMobile;

    const ctx = gsap.context(() => {
      let orbitProgress = 0;
      let orbitRadiusX = getRadiusX();
      let orbitRadiusY = getRadiusY();
      const cardCount = cards.length;

      function getRadiusX() {
        if (window.innerWidth < MOBILE_BREAKPOINT) return 220;
        if (window.innerWidth <= COMPACT_LAPTOP_BREAKPOINT) return 460;
        if (window.innerWidth <= LAPTOP_BREAKPOINT) return 550;
        return 540;
      }
      function getRadiusY() {
        if (window.innerWidth < MOBILE_BREAKPOINT) return 190;
        if (window.innerWidth <= COMPACT_LAPTOP_BREAKPOINT) return 230;
        if (window.innerWidth <= LAPTOP_BREAKPOINT) return 245;
        return 320;
      }

      // Driven by the pin timeline below, 1 → 0 as it scrubs through.
      // updateOrbit() folds it into each card's own depth-based
      // scale/opacity/position instead of the pin tweening those same
      // properties on .orbit-card directly with a separate .to() —
      // two GSAP writers touching scale/opacity on the same elements on
      // the same frames is what used to freeze the rotation (the old
      // fix just stopped calling updateOrbit() for the pin's duration,
      // which stopped the rotation outright instead of blending the
      // two). With only one writer, the cards keep orbiting the whole
      // time while visibly shrinking/fading/rising away on top of it.
      const cardExit = { value: 0 };

      function updateOrbit() {
        const exit = cardExit.value;
        cards.forEach((card, index) => {
          const angle = orbitProgress + (index / cardCount) * Math.PI * 2;
          const x = Math.cos(angle) * orbitRadiusX;
          const y = Math.sin(angle) * orbitRadiusY;

          const depth = (Math.sin(angle) + 1) / 2;
          const scale = (0.92 + depth * 0.24) * (1 - exit);
          const opacity = (0.45 + depth * 0.95) * (1 - exit);
          const zIndex = Math.round(depth * 800);

          gsap.set(card, {
            x,
            y: y - exit * orbitRadiusY, // drifts upward as it exits
            xPercent: -50,
            yPercent: -50,
            scale,
            opacity,
            filter: `blur(${exit * 12}px)`,
            zIndex,
          });
        });
      }

      updateOrbit();

      let trigger;
      if (!skipOrbitRotation) {
        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            orbitProgress += velocity * VELOCITY_TO_RADIANS;
            updateOrbit();
          },
        });
      }

      const handleResize = () => {
        orbitRadiusX = getRadiusX();
        orbitRadiusY = getRadiusY();
        updateOrbit();
        // SmoothScroll owns the debounced global refresh after zoom/resize.
        // Refreshing here for every intermediate zoom event could rebuild
        // this section's active pin spacer repeatedly and corrupt its DOM.
      };

      window.addEventListener("resize", handleResize);

      // Pins .image-orbit itself in place for an extra 110% of the
      // viewport height of scroll before releasing, so the section (and
      // the footer riding along inside it, absolutely positioned at its
      // bottom) holds on screen long enough for that overlap to read
      // clearly instead of scrolling straight past. One timeline, one
      // scrollTrigger driving both steps together — the footer rises
      // while the orbit cards shrink/fade/rise away, still actively
      // orbiting the whole time (see cardExit/updateOrbit above).
      // Skipped on mobile — see skipPin above — so the section renders
      // as one normal, unpinned block there (orbit rotation still runs).
      let pinTimeline;
      if (!skipPin) {
        pinTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=110%",
            anticipatePin: 1,
            pin: true,
            scrub: 1,
          },
        });
        pinTimeline
          .to(".footer", {
            y: 0,
            scale: 1,
            "border-top-left-radius": "30px",
            "border-top-right-radius": "30px",
            ease: "none",
          })
          // .heading-before-footer isn't part of the orbit system, so
          // it keeps a plain .to(). The orbit cards themselves are
          // driven by cardExit (see updateOrbit) instead of being
          // tweened directly here, so their rotation never stops.
          .to(
            ".heading-before-footer",
            {
              yPercent: -100,
              scale: 0,
              opacity: 0,
              filter: "blur(12px)",
              ease: "power2.in",
            },
            "<",
          )
          .to(
            cardExit,
            {
              value: 1,
              ease: "power2.in",
              onUpdate: updateOrbit,
            },
            "<",
          );
      }

      // This section sits far down the page, after several other pinned
      // sections (Services3d, Work, Testimonials, ...) whose own
      // pin-spacers can still be settling into their final reserved
      // height at the moment this ScrollTrigger is created — same class
      // of bug Work.jsx and PartnersSection.jsx both document/fix for
      // themselves. Without this, "top top"/"+=110%" above gets measured
      // against a page that hasn't finished growing yet, so the pin can
      // activate at the wrong scroll offset — which is what shows up as
      // .footer already revealed/overlapping the orbit cards on load
      // instead of staying hidden below them until you actually scroll
      // here. One rAF only guarantees a repaint; a second gives every
      // earlier pin-spacer one more full frame to finish settling before
      // this measures anything.
      let cancelled = false;
      requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          ScrollTrigger.refresh();
        });
      });

      return () => {
        cancelled = true;
        window.removeEventListener("resize", handleResize);
        trigger?.kill();
        pinTimeline?.scrollTrigger?.kill();
        pinTimeline?.kill();
      };
    }, section);

    return () => ctx.revert();
  }, [images]);
  const pathname = usePathname();
  const hideFooter =
    NO_FOOTER_PATHS.includes(pathname) || !isKnownRoute(pathname);
  const mascotVideoRef = useRef(null);

  const [time, setTime] = useState({
    uae: "",
    usa: "",
  });

  const [isReelOpen, setIsReelOpen] = useState(false);
  // Drives the actual CSS transition. Kept separate from isReelOpen
  // (which controls mount/unmount) because the modal has to render once
  // in its closed visual state first, then flip to open on the very
  // next frame — flipping the class in the same render that mounts the
  // element means the browser never gets a "before" frame to transition
  // away from, so it would just appear instantly instead of animating in.
  const [isReelVisible, setIsReelVisible] = useState(false);

  const openReel = () => {
    setIsReelOpen(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setIsReelVisible(true)),
    );
  };

  const closeReel = () => {
    // Reverse of opening: drop the "open" class first so the closing
    // transition actually plays, then unmount once it's finished
    // instead of cutting the animation off by unmounting immediately.
    setIsReelVisible(false);
    setTimeout(() => setIsReelOpen(false), 350);
  };

  useEffect(() => {
    const video = mascotVideoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const format = (timeZone) =>
        new Intl.DateTimeFormat("en-US", {
          timeZone,
          hour: "2-digit",
          minute: "2-digit",
          // second: "2-digit",
        }).format(new Date());

      setTime({
        uae: format("Asia/Dubai"),
        usa: format("America/New_York"),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Escape-to-close, and lock page scroll while the modal is open so
  // scrolling the page underneath doesn't fight the modal being open.
  useEffect(() => {
    if (!isReelOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeReel();
    };
    window.addEventListener("keydown", onKeyDown);

    // The site uses Lenis for smooth scrolling (see SmoothScroll.jsx) —
    // it drives scroll itself via its own rAF loop, so plain
    // body { overflow: hidden } alone doesn't stop it (Lenis keeps
    // scrolling the page underneath regardless of native overflow).
    // window.lenis is the same global instance CaseStudyInner.jsx
    // already reaches for; overflow:hidden is kept too as a fallback for
    // the brief moment before Lenis has initialized.
    const lenis = window.lenis;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [isReelOpen]);

  if (hideFooter) return null;
  return (
    <section className="image-orbit" ref={sectionRef}>
      <div className="heading-before-footer">
        <h2>{heading}</h2>
        <p>{subheading}</p>

        <span>
        <VyrlCtaButton label="Explore Services" href="/services" className="vyrl-cta--solid"/>
        </span>

      </div>

      {images.map((image, index) => (
        <div className="orbit-card" ref={addCardRef} key={image.src ?? index}>
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
      <footer id="footer-mble-hide"
        className={`footer${pathname === "/projects" ? " footer--no-radius" : ""}`}
      >
        {/* Row 1 – Logo */}
        {/* <div className="footer-logo-row">
          <UnicornEmbed projectId="eWb7ceke9RYVHKByTGA5" />
        </div> */}

        {/* Row 2 – Let's Connect + Nav Links */}
        <div className="footer-connect-row">
          {/* Left */}
          <div className="footer-connect-left">
            <div className="footer-connect-heading">
              <button
                className="footer-arrow-btn footer-arrow-btn--left"
                aria-label="Connect"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 18"
                  fill="none"
                >
                  <path
                    d="M1.00005 16.9606L13.0528 1.00031M14.9171 11.8065L13.0528 1.00031L2.14891 2.16431"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <h2 className="footer-connect-title"> Let’s Connect</h2>

              <button
                className="footer-arrow-btn footer-arrow-btn--right"
                aria-label="Connect"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 18"
                  fill="none"
                >
                  <path
                    d="M1.00005 16.9606L13.0528 1.00031M14.9171 11.8065L13.0528 1.00031L2.14891 2.16431"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <p className="footer-connect-subtitle">
              Stay updated with our latest work, insights, case <br /> studies,
              and digital ideas straight from Vyrl
            </p>

            <div className="footer-social">
              <Link
                href="https://www.linkedin.com/company/vyrl-communications/?originalSubdomain=ae"
                target="__blank"
              >
                <div className="footer-social-btn" aria-label="LinkedIn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="footer-social-icon"
                    viewBox="0 0 25 23"
                    fill="none"
                  >
                    <path
                      d="M5.24659 2.55669C5.24624 3.23443 4.96953 3.88427 4.47732 4.36327C3.98511 4.84226 3.31772 5.11117 2.62198 5.11083C1.92624 5.11049 1.25914 4.84093 0.767418 4.36146C0.275701 3.88199 -0.000347542 3.23187 3.28386e-07 2.55414C0.000348199 1.8764 0.277064 1.22655 0.769273 0.74756C1.26148 0.268567 1.92887 -0.000338549 2.62461 3.19889e-07C3.32035 0.000339189 3.98746 0.269894 4.47917 0.749367C4.97089 1.22884 5.24694 1.87895 5.24659 2.55669ZM5.32529 7.00311H0.0786991V23H5.32529V7.00311ZM13.6149 7.00311H8.39454V23H13.5624V14.6055C13.5624 9.92906 19.819 9.49464 19.819 14.6055V23H25V12.8678C25 4.98433 15.7398 5.27821 13.5624 9.14966L13.6149 7.00311Z"
                      fill="#E6E6E6"
                    />
                  </svg>
                </div>
              </Link>
              <Link href="https://www.facebook.com/vyrl.ae/" target="__blank">
                <div className="footer-social-btn" aria-label="Facebook">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="footer-social-icon"
                    viewBox="0 0 13 25"
                    fill="none"
                  >
                    <path
                      d="M8.66667 14.375H11.7619L13 9.375H8.66667V6.875C8.66667 5.5875 8.66667 4.375 11.1429 4.375H13V0.175C12.5964 0.12125 11.0723 0 9.46276 0C6.10133 0 3.71429 2.07125 3.71429 5.875V9.375H0V14.375H3.71429V25H8.66667V14.375Z"
                      fill="#E6E6E6"
                    />
                  </svg>
                </div>
              </Link>
              <Link href="https://www.instagram.com/vyrl.ae/" target="__blank">
                <div className="footer-social-btn" aria-label="Instagram">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="footer-social-icon"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M7.25 0H17.75C21.75 0 25 3.25 25 7.25V17.75C25 19.6728 24.2362 21.5169 22.8765 22.8765C21.5169 24.2362 19.6728 25 17.75 25H7.25C3.25 25 0 21.75 0 17.75V7.25C0 5.32718 0.763837 3.48311 2.12348 2.12348C3.48311 0.763837 5.32718 0 7.25 0ZM7 2.5C5.80653 2.5 4.66193 2.97411 3.81802 3.81802C2.97411 4.66193 2.5 5.80653 2.5 7V18C2.5 20.4875 4.5125 22.5 7 22.5H18C19.1935 22.5 20.3381 22.0259 21.182 21.182C22.0259 20.3381 22.5 19.1935 22.5 18V7C22.5 4.5125 20.4875 2.5 18 2.5H7ZM19.0625 4.375C19.4769 4.375 19.8743 4.53962 20.1674 4.83265C20.4604 5.12567 20.625 5.5231 20.625 5.9375C20.625 6.3519 20.4604 6.74933 20.1674 7.04235C19.8743 7.33538 19.4769 7.5 19.0625 7.5C18.6481 7.5 18.2507 7.33538 17.9576 7.04235C17.6646 6.74933 17.5 6.3519 17.5 5.9375C17.5 5.5231 17.6646 5.12567 17.9576 4.83265C18.2507 4.53962 18.6481 4.375 19.0625 4.375ZM12.5 6.25C14.1576 6.25 15.7473 6.90848 16.9194 8.08058C18.0915 9.25268 18.75 10.8424 18.75 12.5C18.75 14.1576 18.0915 15.7473 16.9194 16.9194C15.7473 18.0915 14.1576 18.75 12.5 18.75C10.8424 18.75 9.25268 18.0915 8.08058 16.9194C6.90848 15.7473 6.25 14.1576 6.25 12.5C6.25 10.8424 6.90848 9.25268 8.08058 8.08058C9.25268 6.90848 10.8424 6.25 12.5 6.25ZM12.5 8.75C11.5054 8.75 10.5516 9.14509 9.84835 9.84835C9.14509 10.5516 8.75 11.5054 8.75 12.5C8.75 13.4946 9.14509 14.4484 9.84835 15.1517C10.5516 15.8549 11.5054 16.25 12.5 16.25C13.4946 16.25 14.4484 15.8549 15.1517 15.1517C15.8549 14.4484 16.25 13.4946 16.25 12.5C16.25 11.5054 15.8549 10.5516 15.1517 9.84835C14.4484 9.14509 13.4946 8.75 12.5 8.75Z"
                      fill="#E6E6E6"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Right – Nav columns */}
          <nav className="footer-nav">
            <div className="footer-inner-link-col">
              <div className="footer-nav-col">
                <h4 className="footer-nav-title">Links</h4>
                <FooterNavLink
                  href="/"
                  pathname={pathname}
                  className="footer-nav-link"
                >
                  Home
                </FooterNavLink>
                <FooterNavLink
                  href="/about"
                  pathname={pathname}
                  className="footer-nav-link"
                >
                  About
                </FooterNavLink>
                <FooterNavLink
                  href="/services"
                  pathname={pathname}
                  className="footer-nav-link"
                >
                  Services
                </FooterNavLink>
                <FooterNavLink
                  href="/projects"
                  pathname={pathname}
                  matchPaths={["/projects"]}
                  className="footer-nav-link"
                >
                  Work
                </FooterNavLink>
                <FooterNavLink
                  href="/contact-us"
                  pathname={pathname}
                  className="footer-nav-link"
                >
                  Contact
                </FooterNavLink>
              </div>
              {/* <div className="footer-nav-col">
                <h4 className="footer-nav-title">Other</h4>
                <FooterNavLink
                  href="/projects"
                  pathname={pathname}
                  matchPaths={["/projects"]}
                  className="footer-nav-link"
                >
                  Case Studies
                </FooterNavLink>
              
              </div> */}
              <div className="footer-nav-col">
                <h4 className="footer-nav-title">Info</h4>
                <FooterNavLink
                  href="/privacy-policy"
                  pathname={pathname}
                  className="footer-nav-link"
                >
                  Privacy Policy
                </FooterNavLink>
                <FooterNavLink
                  href="/terms-and-condition"
                  pathname={pathname}
                  className="footer-nav-link"
                >
                  Terms Of Service
                </FooterNavLink>
              </div>
              <div className="footer-nav-col">
                <h4 className="footer-nav-title">Address</h4>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=International+Business+Tower+-+Al+Amal+St+-+Business+Bay+-+Dubai+-+United+Arab+Emirates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-nav-link"
                >
                  International Business Tower, <br /> Business Bay, Dubai, UAE
                </a>
              </div>{" "}
              <div className="footer-nav-col">
                <h4 className="footer-nav-title">Contact us</h4>
                <span className="footer-nav-link">
                  {/* {" "} */}
                  <a
                    href="https://wa.me/971585355134"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {" "}
                    +971 58 535 5134{" "}
                  </a>
                </span>
                <span className="footer-nav-link">
                  <a
                    href="https://wa.me/971585134999"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +971 58 513 4999
                  </a>
                </span>
              </div>
            </div>
          </nav>
        </div>

        {/* Row 3 – Subscribe + Mascot + Info */}

        <div className="footer-bottom-row">
          <div className="footer-subscribe">
            <h3 className="footer-subscribe-title">
              <a href="mailto:vyrlcommstech@gmail.com">Stay In The Loop</a>
            </h3>
            <p className="footer-subscribe-subtitle">
              Stay updated with the latest news, insights, and updates from
              Vyrl—delivered straight to your inbox.
            </p>
            <div className="footer-subscribe-form">
              <input
                type="email"
                placeholder="Subscribe"
                className="footer-subscribe-input"
              />
              <button className="footer-subscribe-btn">Send Now</button>
            </div>
          </div>

          <div className="footer-mascot">
            <video
              className=""
              autoPlay
              muted
              loop
              playsInline
              src="/smiley_compressed.mp4"
            ></video>
          </div>

          <div className="footer-info">
            <div className="footer-time">
              <div className="footer-local-time-container">
                <span className="footer-time-label">Local Time</span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 28 28"
                  fill="none"
                >
                  <path
                    d="M13.4167 3.5C16.3562 3.5 19.1753 4.6677 21.2538 6.74623C23.3323 8.82476 24.5 11.6439 24.5 14.5833C24.5 17.5228 23.3323 20.3419 21.2538 22.4204C19.1753 24.499 16.3562 25.6667 13.4167 25.6667C10.4772 25.6667 7.65813 24.499 5.57961 22.4204C3.50108 20.3419 2.33337 17.5228 2.33337 14.5833C2.33337 11.6439 3.50108 8.82476 5.57961 6.74623C7.65813 4.6677 10.4772 3.5 13.4167 3.5ZM13.4167 4.66667C10.7866 4.66667 8.2643 5.71146 6.40457 7.57119C4.54483 9.43093 3.50004 11.9533 3.50004 14.5833C3.50004 17.2134 4.54483 19.7357 6.40457 21.5955C8.2643 23.4552 10.7866 24.5 13.4167 24.5C14.719 24.5 16.0085 24.2435 17.2117 23.7451C18.4148 23.2468 19.508 22.5163 20.4289 21.5955C21.3497 20.6746 22.0802 19.5814 22.5785 18.3783C23.0769 17.1751 23.3334 15.8856 23.3334 14.5833C23.3334 11.9533 22.2886 9.43093 20.4289 7.57119C18.5691 5.71146 16.0468 4.66667 13.4167 4.66667ZM12.8334 8.16667H14V14.49L19.4834 17.6517L18.9 18.6667L12.8334 15.1667V8.16667Z"
                    fill="#E6E6E6"
                  />
                </svg>
              </div>

              <div className="footer-time-values">
                <span className="footer-time-value">UAE : {time.uae}</span>
                <span className="footer-time-value">USA : {time.usa}</span>
              </div>
            </div>

            <div
              className="footer-next"
              role="button"
              tabIndex={0}
              onClick={openReel}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openReel();
                }
              }}
            >
              <h3 className="footer-next-title">Show Reel</h3>
              <div className="footer-next-bar">
                <div className="footer-next-line" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="19"
                  viewBox="0 0 22 19"
                  fill="none"
                >
                  <path
                    d="M0 9.54443C0 10.0168 0.187948 10.4699 0.522495 10.804C0.857044 11.138 1.31079 11.3257 1.78391 11.3257L15.9125 11.3257L11.2267 16.0044C10.9116 16.3421 10.7401 16.7887 10.7482 17.2502C10.7564 17.7116 10.9436 18.1519 11.2705 18.4783C11.5973 18.8046 12.0383 18.9916 12.5004 18.9997C12.9626 19.0079 13.4098 18.8366 13.748 18.5219L21.4783 10.8032C21.8124 10.4692 22 10.0165 22 9.54443C22 9.0724 21.8124 8.61967 21.4783 8.28568L13.748 0.566932C13.5847 0.391926 13.3877 0.251558 13.1689 0.154202C12.9501 0.0568466 12.7139 0.00449708 12.4743 0.000277214C12.2348 -0.00394265 11.9969 0.0400531 11.7748 0.12964C11.5526 0.219228 11.3509 0.352571 11.1815 0.521716C11.0121 0.69086 10.8785 0.892341 10.7888 1.11414C10.6991 1.33593 10.655 1.5735 10.6592 1.81267C10.6635 2.05184 10.7159 2.28771 10.8134 2.50621C10.9109 2.72471 11.0515 2.92136 11.2267 3.08443L15.9125 7.76318L1.78391 7.76318C0.799192 7.76318 0 8.56118 0 9.54443Z"
                    fill="#E6E6E6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Show Reel modal — mounted only while isReelOpen so the video
            element (and its network request) doesn't exist at all until
            the user actually asks for it. It first renders in its closed
            visual state; isReelVisible flips true a frame later (see
            openReel above) so the browser has a real "before" frame to
            transition away from, which is what makes the open read as a
            smooth fade + scale-in instead of an instant appear. Closing
            reverses that — isReelVisible drops first so the CSS
            transition plays, then isReelOpen unmounts once it's done. */}
        {isReelOpen &&
          createPortal(
          <div
            className={`reel-modal-overlay${isReelVisible ? " reel-modal-overlay--open" : ""}`}
            onClick={closeReel}
          >
            <div
              className={`reel-modal-panel${isReelVisible ? " reel-modal-panel--open" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="reel-modal-close"
                aria-label="Close show reel"
                onClick={closeReel}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    d="M1 1L17 17M17 1L1 17"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <video
                className="reel-modal-video"
                src="/showreel.mp4"
                autoPlay
                controls
                playsInline
              />
            </div>
          </div>,
          document.body,
        )}
      </footer>
    </section>
  );
}
