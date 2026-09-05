"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { triggerNavigation, isCaseStudyPath } from "./pageTransition";
import { isKnownRoute } from "./knownRoutes";
import "../../styles/navbar.css";
import PageTransitionLink from "./PageTransitionLink";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  // { label: "Lab", href: "#" },
  { label: "Work", href: "/projects" },
  { label: "Contact", href: "/contact-us" },
];

const idleMessages = [
  "Still with us?",
  "Take your time",
  "We're here when you're ready",
  "Feel free to explore",
];

const NavLink = ({ label, href }) => {
  const linkRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const isActive = href !== "#" && pathname === href;

  const handleClick = (e) => {
    if (href === "#" || href === pathname) return;

    // Entering a case-study page runs its own hand-built transition
    // (heading clone + overlay, still client-side/router.push-based — see
    // CaseStudyInner.jsx) — let that happen normally instead of layering
    // the hard-nav wipe on top of it. See the matching comment in
    // PageTransitionLink.tsx for the full reasoning.
    if (isCaseStudyPath(href)) return;

    e.preventDefault();
    // Real hard navigation (window.location.href), not router.push() —
    // see pageTransition.js's top-of-file comment for why. The wipe
    // covers the screen, then triggerNavigation() itself does the actual
    // reload once fully covered.
    triggerNavigation(href, (destination) => router.push(destination));
  };

  return (
    <Link
      href={href}
      ref={linkRef}
      className={`nav-link-item${isActive ? " nav-link-item--active" : ""}`}
      onClick={handleClick}
    >
      <span className="char">{label}</span>
    </Link>
  );
};

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const isActiveRef = useRef(isActive);
  const pathname = usePathname();
  const isContactPage = pathname === "/contact-us";
  const isGlassNav = pathname === "/projects" || isContactPage;
  const isLegalPage =
    pathname === "/privacy-policy" || pathname === "/terms-and-condition";

  const navBarRef = useRef(null);
  const menuDropdownRef = useRef(null);
  const rightContentLinksRef = useRef(null);
  const gridCardsRef = useRef(null);
  const bgsRef = useRef(null);
  const opacityDotsRef = useRef(null);
  const upToRef = useRef(null);
  const dnToRef = useRef(null);

  const cursorRef = useRef(null);
  const popupRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const isIdleRef = useRef(false);
  const idleTimerRef = useRef(null);
  const idleAnimRef = useRef(null);
  const menuTimelineRef = useRef(null);

  // toggleMenu() flips open/closed; pass forceState to instead drive it
  // to an explicit state (used to force-close on route change below,
  // where we always want "closed" regardless of the current state).
  const toggleMenu = (forceState) => {
    const nextActive = forceState ?? !isActiveRef.current;
    if (nextActive === isActiveRef.current) return;
    isActiveRef.current = nextActive;
    setIsActive(nextActive);

    // A click while the previous open/close timeline was still mid-flight
    // used to just layer a second timeline on top of it, both animating
    // the same width/height/opacity — the two fought each other, so the
    // visible result could look like the click "did nothing," which is
    // what made it feel like it needed 2-3 clicks to register. Killing
    // any timeline still running from the previous toggle first means
    // every click starts a clean, fully deterministic animation.
    if (menuTimelineRef.current) {
      menuTimelineRef.current.kill();
    }

    const opacityDots = opacityDotsRef.current.querySelectorAll(".opacity-an");
    const upEls = upToRef.current;
    const dnEls = dnToRef.current;
    const rightLinks = rightContentLinksRef.current.querySelectorAll("li");
    const cards = gridCardsRef.current.querySelectorAll(".box-1");
    const isMobile = window.innerWidth <= 768;

    const tl = gsap.timeline({
      onComplete: () => {
        if (menuTimelineRef.current === tl) menuTimelineRef.current = null;
      },
    });
    menuTimelineRef.current = tl;

    tl.to(opacityDots, {
      opacity: nextActive ? 0.1 : 1,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.2,
    })
      .to(
        upEls,
        {
          y: nextActive ? -50 : 1,
          duration: 0.6,
          ease: "bounce.out",
          stagger: 0.1,
        },
        "<",
      )
      .to(
        dnEls,
        {
          y: nextActive ? 0 : 100,
          duration: 0.7,
          ease: "bounce.out",
          stagger: 0.1,
        },
        "<",
      )
      .to(
        navBarRef.current,
        {
          width: nextActive ? "95%" : isMobile ? "88%" : "23%",
          duration: 1.5,
          ease: "power4.inOut",
        },
        "<",
      )
      .to(
        menuDropdownRef.current,
        {
          height: nextActive ? (isMobile ? "44vh" : "50vh") : "0vh",
          width: nextActive ? "95%" : "23%",
          duration: 1.5,
          ease: "power3.inOut",
        },
        "<",
      )
      .to(
        rightLinks,
        {
          opacity: nextActive ? 1 : 0,
          y: nextActive ? 0 : 20,
          duration: 0.6,
          display: "block",
          stagger: 0.05,
          ease: "power3.out",
        },
        "-=1",
      )
      .to(
        cards,
        {
          opacity: nextActive ? 1 : 0,
          y: nextActive ? 0 : 40,
          scale: nextActive ? 1 : 0.95,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
        },
        "-=0.5",
      )
      .to(bgsRef.current, {
        opacity: nextActive ? 0 : 1,
        duration: 0.3,
      });
  };

  // Close the menu whenever the route actually changes — without this,
  // clicking a nav link left the dropdown open (and the page underneath
  // it changed), which read as broken/unresponsive rather than like a
  // real navigation. Skips the initial mount (pathname hasn't "changed"
  // yet, and the menu isn't open then anyway) so it only fires on real
  // route transitions.
  const isFirstPathnameRun = useRef(true);
  useEffect(() => {
    if (isFirstPathnameRun.current) {
      isFirstPathnameRun.current = false;
      return;
    }
    toggleMenu(false);
  }, [pathname]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const popup = popupRef.current;
    if (!cursor || !popup) return;

    const hidePopup = () => {
      gsap.to(popup, { opacity: 0, scale: 0.5, duration: 0.2 });
    };

    const showIdleMessage = () => {
      const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
      popup.textContent = msg;

      gsap.fromTo(
        popup,
        {
          x: pos.current.x,
          y: pos.current.y - 40,
          opacity: 0,
          scale: 0.5,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "back.out(2)",
        },
      );
    };

    const startIdleMode = () => {
      isIdleRef.current = true;
      showIdleMessage();

      idleAnimRef.current = gsap.to(cursor, {
        rotate: "+=20",
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    };

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      hidePopup();

      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(startIdleMode, 5000);

      if (isIdleRef.current) {
        isIdleRef.current = false;
        if (idleAnimRef.current) idleAnimRef.current.kill();
        gsap.killTweensOf(cursor);
        gsap.to(cursor, { rotate: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    const handleMouseDown = () => {
      gsap.to(cursor, { scale: 0.6, duration: 0.15, ease: "power2.out" });
    };

    const handleMouseUp = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    const ticker = () => {
      const speed = isIdleRef.current ? 0.04 : 0.65;
      pos.current.x += (mouse.current.x - pos.current.x) * speed;
      pos.current.y += (mouse.current.y - pos.current.y) * speed;

      const dx = mouse.current.x - pos.current.x;
      const rotate = isIdleRef.current ? undefined : dx * 2.2;

      gsap.set(cursor, {
        x: pos.current.x,
        y: pos.current.y,
        ...(rotate !== undefined ? { rotate } : {}),
      });
    };

    gsap.ticker.add(ticker);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      gsap.ticker.remove(ticker);
      clearTimeout(idleTimerRef.current);
      if (idleAnimRef.current) idleAnimRef.current.kill();
    };
  }, []);

  // Every hook above still runs regardless (React's rules-of-hooks
  // forbid an early return before them) — this only gates the actual
  // markup, so the 404 page renders with no navbar at all.
  if (!isKnownRoute(pathname)) return null;

  return (
    <>
      {/* <div className="cursor-follow" ref={cursorRef} /> */}

      <div className="cursor-popup" ref={popupRef}>
        &#128075; yo!
      </div>

      <nav className="site-nav">
        <div
          className={`menu-dropdown${isGlassNav ? " menu-dropdown--glass" : ""}${
            isContactPage ? " menu-dropdown--contact" : ""
          }${isLegalPage ? " menu-dropdown--legal" : ""}`}
          ref={menuDropdownRef}
        >
          <div className="right-content">
            <ul ref={rightContentLinksRef}>
              {navLinks.map(({ label, href }) => (
                <li key={label}>
                  <NavLink label={label} href={href} />
                </li>
              ))}
            </ul>
          </div>
          <div className="grid-cards" ref={gridCardsRef}>
            <div className="upper-cards">
              {/* Clicking these while already on /projects only changes
                  the query string — pathname itself never changes, so
                  the route-change effect below (which force-closes the
                  menu) never fires. Closing it explicitly here covers
                  that same-page case too. */}
              <PageTransitionLink
                href="/projects?category=real-estate"
                className="box-1"
                onClick={() => toggleMenu(false)}
              >
                {/* <p>Real Estate</p> */}
                <Image src="/arab3.avif" alt="" fill sizes="20vw" />
              </PageTransitionLink>
              <PageTransitionLink
                href="/projects?category=restaurant"
                className="box-1"
                onClick={() => toggleMenu(false)}
              >
                {/* <p>Restaurant</p> */}
                <Image src="/lala1.avif" alt="" fill sizes="20vw" />
              </PageTransitionLink>
            </div>
            <div className="upper-cards">
              <PageTransitionLink
                href="/projects?category=automotive"
                className="box-1"
                onClick={() => toggleMenu(false)}
              >
                {/* <p>Automotive</p> */}
                <Image src="/sanam2.avif" alt="" fill sizes="20vw" />
              </PageTransitionLink>
            </div>
          </div>
        </div>

        <div
          className={`nav-bar${isGlassNav ? " nav-bar--glass" : ""}${
            isContactPage ? " nav-bar--contact" : ""
          }${isLegalPage ? " nav-bar--legal" : ""}`}
          ref={navBarRef}
        >
          <div className="bgs" ref={bgsRef}>
            <Image src="/bgs.avif" alt="" fill sizes="95vw" />
          </div>
          <PageTransitionLink
            href="/"
            className="logo"
            id="mble-nav-logo"
            aria-label="Home"
          >
            <svg
              ref={(el) => {
                if (el) upToRef.current = el.querySelectorAll(".up-to");
              }}
              xmlns="http://www.w3.org/2000/svg"
              width="84"
              height="37"
              viewBox="0 0 84 37"
              fill="none"
            >
              <path
                className="up-to"
                d="M35.3708 28.371L37.0909 27.7133L37.3325 28.1062C38.4064 29.9631 40.2633 30.9613 42.6149 30.9613C45.5865 30.9613 47.7577 29.4334 48.4416 26.8401C48.657 26.0427 48.8578 22.62 48.6949 22.62C48.6454 22.62 48.2146 22.9751 47.7606 23.4175C46.0027 25.0473 44.2215 25.7807 41.7069 25.8826C39.7103 25.9583 38.2813 25.6556 36.5263 24.7708C34.454 23.7347 32.9988 22.3057 32.0151 20.3469C31.0168 18.362 30.6879 16.4673 30.6879 12.675V9.98283H30.1204C28.15 9.98283 26.3921 11.0073 25.3036 12.7885C25.062 13.1931 24.0143 15.3934 22.9898 17.681C21.9653 19.9802 20.8797 22.23 20.577 22.6869C19.1858 24.8232 17.0117 26.0369 14.5728 26.0369C12.1338 26.0369 10.3002 25.0269 8.93522 23.0915C8.29201 22.1951 7.02597 19.6775 4.39784 14.0924C3.65276 12.5004 2.33724 9.74418 1.50485 7.97462C0.657911 6.21671 -0.0114922 4.7644 0.00014957 4.75276C0.0263436 4.74112 1.54269 4.75276 3.38791 4.77895L6.74948 4.82843L7.93694 7.36925C8.5947 8.77209 9.56679 10.8967 10.1227 12.0696C13.2194 18.7433 13.9266 19.9686 14.6863 19.9686C15.4459 19.9686 15.8359 19.2992 17.847 14.6861C18.5804 12.9922 19.3372 11.3245 19.5147 10.9578C20.7778 8.44321 22.8646 6.49612 25.2774 5.56186C27.0469 4.87791 27.728 4.80224 32.4691 4.80224H36.7533V9.95955C36.7533 15.5069 36.8173 16.1646 37.4372 17.518C37.8156 18.3533 38.8663 19.4127 39.6987 19.8318C41.669 20.7922 44.3379 20.6904 46.1831 19.5786C47.6354 18.7054 48.4329 17.3666 48.6221 15.4457C48.6978 14.7763 48.7094 12.2734 48.6716 9.54335L48.5959 4.80515H54.8272V14.6395C54.8272 24.7243 54.7631 26.0893 54.3091 27.8588C53.1711 32.2827 49.5709 35.5948 45.0335 36.4039C43.9101 36.5931 42.0008 36.6571 40.9269 36.5174C37.2248 36.0634 33.8865 33.9766 32.245 31.0836C31.8201 30.3327 31.6833 29.8175 31.6833 29.8175"
                fill="white"
              />
              <path
                className="up-to"
                d="M80.2296 25.7516C79.2808 25.5887 77.9158 25.1987 77.0164 24.7446C74.9937 23.7085 73.5792 21.8254 72.872 19.273C72.5926 18.2747 72.5809 18.1088 72.5431 9.12425L72.5052 0H78.4455L78.4833 8.49269L78.5182 16.1937C78.5182 16.7263 78.6259 17.2531 78.8238 17.745C79.5078 19.4389 81.1755 20.475 83.2215 20.475H83.6377V25.9088L82.0952 25.8972C81.2366 25.8855 80.4042 25.7778 80.2267 25.7546L80.2296 25.7516Z"
                fill="white"
              />
              <path
                className="up-to"
                d="M57.3505 20.0442C57.3505 13.9265 57.4262 12.9922 58.0723 11.3857C59.0444 8.94671 60.8663 6.97343 63.2296 5.78596C64.746 5.01469 66.9084 4.54611 68.9312 4.54611H69.9935V9.95663L68.6402 10.0061C67.086 10.0701 66.1896 10.3466 65.3048 11.0539C64.5975 11.6098 63.8757 12.7099 63.5236 13.746C63.2587 14.5551 63.2442 14.8084 63.1947 20.1286L63.1569 25.6527H57.3563V20.0413L57.3505 20.0442Z"
                fill="white"
              />
            </svg>
            <svg
              ref={(el) => {
                if (el) dnToRef.current = el.querySelectorAll(".dn-to");
              }}
              xmlns="http://www.w3.org/2000/svg"
              width="84"
              height="37"
              viewBox="0 0 84 37"
              fill="none"
            >
              <path
                className="dn-to"
                d="M35.3708 28.371L37.0909 27.7133L37.3325 28.1062C38.4064 29.9631 40.2633 30.9613 42.6149 30.9613C45.5865 30.9613 47.7577 29.4334 48.4416 26.8401C48.657 26.0427 48.8578 22.62 48.6949 22.62C48.6454 22.62 48.2146 22.9751 47.7606 23.4175C46.0027 25.0473 44.2215 25.7807 41.7069 25.8826C39.7103 25.9583 38.2813 25.6556 36.5263 24.7708C34.454 23.7347 32.9988 22.3057 32.0151 20.3469C31.0168 18.362 30.6879 16.4673 30.6879 12.675V9.98283H30.1204C28.15 9.98283 26.3921 11.0073 25.3036 12.7885C25.062 13.1931 24.0143 15.3934 22.9898 17.681C21.9653 19.9802 20.8797 22.23 20.577 22.6869C19.1858 24.8232 17.0117 26.0369 14.5728 26.0369C12.1338 26.0369 10.3002 25.0269 8.93522 23.0915C8.29201 22.1951 7.02597 19.6775 4.39784 14.0924C3.65276 12.5004 2.33724 9.74418 1.50485 7.97462C0.657911 6.21671 -0.0114922 4.7644 0.00014957 4.75276C0.0263436 4.74112 1.54269 4.75276 3.38791 4.77895L6.74948 4.82843L7.93694 7.36925C8.5947 8.77209 9.56679 10.8967 10.1227 12.0696C13.2194 18.7433 13.9266 19.9686 14.6863 19.9686C15.4459 19.9686 15.8359 19.2992 17.847 14.6861C18.5804 12.9922 19.3372 11.3245 19.5147 10.9578C20.7778 8.44321 22.8646 6.49612 25.2774 5.56186C27.0469 4.87791 27.728 4.80224 32.4691 4.80224H36.7533V9.95955C36.7533 15.5069 36.8173 16.1646 37.4372 17.518C37.8156 18.3533 38.8663 19.4127 39.6987 19.8318C41.669 20.7922 44.3379 20.6904 46.1831 19.5786C47.6354 18.7054 48.4329 17.3666 48.6221 15.4457C48.6978 14.7763 48.7094 12.2734 48.6716 9.54335L48.5959 4.80515H54.8272V14.6395C54.8272 24.7243 54.7631 26.0893 54.3091 27.8588C53.1711 32.2827 49.5709 35.5948 45.0335 36.4039C43.9101 36.5931 42.0008 36.6571 40.9269 36.5174C37.2248 36.0634 33.8865 33.9766 32.245 31.0836C31.8201 30.3327 31.6833 29.8175 31.6833 29.8175"
                fill="white"
              />
              <path
                className="dn-to"
                d="M80.2296 25.7516C79.2808 25.5887 77.9158 25.1987 77.0164 24.7446C74.9937 23.7085 73.5792 21.8254 72.872 19.273C72.5926 18.2747 72.5809 18.1088 72.5431 9.12425L72.5052 0H78.4455L78.4833 8.49269L78.5182 16.1937C78.5182 16.7263 78.6259 17.2531 78.8238 17.745C79.5078 19.4389 81.1755 20.475 83.2215 20.475H83.6377V25.9088L82.0952 25.8972C81.2366 25.8855 80.4042 25.7778 80.2267 25.7546L80.2296 25.7516Z"
                fill="white"
              />
              <path
                className="dn-to"
                d="M57.3505 20.0442C57.3505 13.9265 57.4262 12.9922 58.0723 11.3857C59.0444 8.94671 60.8663 6.97343 63.2296 5.78596C64.746 5.01469 66.9084 4.54611 68.9312 4.54611H69.9935V9.95663L68.6402 10.0061C67.086 10.0701 66.1896 10.3466 65.3048 11.0539C64.5975 11.6098 63.8757 12.7099 63.5236 13.746C63.2587 14.5551 63.2442 14.8084 63.1947 20.1286L63.1569 25.6527H57.3563V20.0413L57.3505 20.0442Z"
                fill="white"
              />
            </svg>
          </PageTransitionLink>

          <div
            className="menu-toggle"
            onClick={() => toggleMenu()}
            ref={opacityDotsRef}
          >
            <div className="menu-box">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="24"
                viewBox="0 0 27 24"
                fill="none"
              >
                <circle cx="3" cy="3" r="3" fill="white" />
                <circle
                  className="opacity-an"
                  cx="3"
                  cy="12"
                  r="3"
                  fill="white"
                />
                <circle cx="3" cy="21" r="3" fill="white" />
                <circle
                  className="opacity-an"
                  cx="13"
                  cy="3"
                  r="3"
                  fill="white"
                />
                <circle cx="13" cy="12" r="3" fill="white" />
                <circle
                  className="opacity-an"
                  cx="13"
                  cy="21"
                  r="3"
                  fill="white"
                />
                <circle cx="23" cy="3" r="3" fill="white" />
                <circle
                  className="opacity-an"
                  cx="23"
                  cy="12"
                  r="3"
                  fill="white"
                />
                <circle cx="23" cy="21" r="3" fill="white" />
              </svg>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
