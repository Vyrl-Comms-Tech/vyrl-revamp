"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import "../../styles/navbar.css";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Lab", href: "#" },
  { label: "Work", href: "/projects" },
  { label: "Contact", href: "/contact-us" },
];

const underlinePaths = [
  "M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999",
  "M5 29.8857C52.3147 26.9322 99.4329 21.6611 146.503 17.1765C151.753 16.6763 157.115 15.9505 162.415 15.6551C163.28 15.6069 165.074 15.4123 164.383 16.4275C161.704 20.3627 157.134 23.7551 153.95 27.4983C153.209 28.3702 148.194 33.4751 150.669 34.6605C153.638 36.0819 163.621 32.6063 165.039 32.2029C178.55 28.3608 191.49 23.5968 204.869 19.5404C231.903 11.3436 259.347 5.83254 288.793 5.12258C294.094 4.99476 299.722 4.82265 305 5.45025",
  "M5 24.2592C26.233 20.2879 47.7083 16.9968 69.135 13.8421C98.0469 9.5853 128.407 4.02322 158.059 5.14674C172.583 5.69708 187.686 8.66104 201.598 11.9696C207.232 13.3093 215.437 14.9471 220.137 18.3619C224.401 21.4596 220.737 25.6575 217.184 27.6168C208.309 32.5097 197.199 34.281 186.698 34.8486C183.159 35.0399 147.197 36.2657 155.105 26.5837C158.11 22.9053 162.993 20.6229 167.764 18.7924C178.386 14.7164 190.115 12.1115 201.624 10.3984C218.367 7.90626 235.528 7.06127 252.521 7.49276C258.455 7.64343 264.389 7.92791 270.295 8.41825C280.321 9.25056 296 10.8932 305 13.0242",
];

const idleMessages = [
  "hey... where you go? 👀",
  "still there? 😭",
  "stop ignoring me bro",
  "bro is AFK 💀",
  "hello??",
  "I miss your cursor 😔",
];

const NavLink = ({ label, href }) => {
  const linkRef = useRef(null);
  const charsRef = useRef([]);
  const pathRef = useRef(null);
  const nextIndexRef = useRef(null);
  const enterTweenRef = useRef(null);
  const leaveTweenRef = useRef(null);

  const handleMouseEnter = () => {
    const chars = charsRef.current;
    gsap.killTweensOf(chars);

    gsap.to(chars, {
      y: -9,
      duration: 0.35,
      ease: "power2.out",
      stagger: 0.03,
    });

    gsap.to(chars, {
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.5)",
      stagger: 0.03,
      delay: 0.12,
    });

    if (nextIndexRef.current === null) {
      nextIndexRef.current = Math.floor(Math.random() * underlinePaths.length);
    }

    const path = pathRef.current;
    if (!path) return;

    if (leaveTweenRef.current && leaveTweenRef.current.isActive()) {
      leaveTweenRef.current.kill();
    }

    path.setAttribute("d", underlinePaths[nextIndexRef.current]);
    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });

    enterTweenRef.current = gsap.to(path, {
      strokeDashoffset: 0,
      duration: 0.5,
      ease: "power2.inOut",
    });

    nextIndexRef.current = (nextIndexRef.current + 1) % underlinePaths.length;
  };

  const handleMouseLeave = () => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();

    const playOut = () => {
      leaveTweenRef.current = gsap.to(path, {
        strokeDashoffset: -length,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(path, { opacity: 0 });
        },
      });
    };

    if (enterTweenRef.current && enterTweenRef.current.isActive()) {
      enterTweenRef.current.eventCallback("onComplete", playOut);
    } else {
      playOut();
    }
  };

  return (
    <Link
      href={href}
      ref={linkRef}
      className="nav-link-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label.split("").map((char, i) => (
        <span
          className="char"
          key={i}
          ref={(el) => {
            charsRef.current[i] = el;
          }}
        >
          {char}
        </span>
      ))}
      <span className="draw-line-box">
        <svg width="310" height="40" viewBox="0 0 310 40" fill="none">
          <path
            ref={pathRef}
            d={underlinePaths[0]}
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0"
          />
        </svg>
      </span>
    </Link>
  );
};

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const isActiveRef = useRef(isActive);
  const pathname = usePathname();

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

  // toggleMenu() flips open/closed; pass forceState to instead drive it
  // to an explicit state (used to force-close on route change below,
  // where we always want "closed" regardless of the current state).
  const toggleMenu = (forceState) => {
    const nextActive = forceState ?? !isActiveRef.current;
    if (nextActive === isActiveRef.current) return;
    isActiveRef.current = nextActive;
    setIsActive(nextActive);

    const opacityDots = opacityDotsRef.current.querySelectorAll(".opacity-an");
    const upEls = upToRef.current;
    const dnEls = dnToRef.current;
    const rightLinks = rightContentLinksRef.current.querySelectorAll("a");
    const cards = gridCardsRef.current.querySelectorAll(".box-1");
    const isMobile = window.innerWidth <= 768;

    const tl = gsap.timeline();

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
          width: nextActive ? "95%" : isMobile ? "80%" : "23%",
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
      const msg =
        idleMessages[Math.floor(Math.random() * idleMessages.length)];
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
      const speed = isIdleRef.current ? 0.04 : 0.12;
      pos.current.x += (mouse.current.x - pos.current.x) * speed;
      pos.current.y += (mouse.current.y - pos.current.y) * speed;

      const dx = mouse.current.x - pos.current.x;
      const rotate = isIdleRef.current ? undefined : dx * 0.5;

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

  return (
    <>
      <div className="cursor-follow" ref={cursorRef} />


      <div className="cursor-popup" ref={popupRef}>
        &#128075; yo!
      </div>

      <nav className="site-nav">
        <div className="menu-dropdown" ref={menuDropdownRef}>
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
              <div className="box-1">
                <p>Highlighted blogs</p>
                <Image src="/img1.jpg" alt="" fill sizes="20vw" />
              </div>
              <div className="box-1">
                <p>Highlighted blogs</p>
                <Image src="/img2.png" alt="" fill sizes="20vw" />
              </div>
            </div>
            <div className="upper-cards">
              <div className="box-1">
                <p>Highlighted blogs</p>
                <Image src="/cr1.png" alt="" fill sizes="20vw" />
              </div>
            </div>
          </div>
        </div>

        <div className="nav-bar" ref={navBarRef}>
          <div className="bgs" ref={bgsRef}>
            <Image src="/bgs.png" alt="" fill sizes="95vw" />
          </div>
          <div className="logo" id="mble-nav-logo">
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
          </div>

          <div className="menu-toggle">
            <div
              className="menu-box"
              onClick={() => toggleMenu()}
              ref={opacityDotsRef}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="24"
                viewBox="0 0 27 24"
                fill="none"
              >
                <circle cx="3" cy="3" r="3" fill="white" />
                <circle className="opacity-an" cx="3" cy="12" r="3" fill="white" />
                <circle cx="3" cy="21" r="3" fill="white" />
                <circle className="opacity-an" cx="13" cy="3" r="3" fill="white" />
                <circle cx="13" cy="12" r="3" fill="white" />
                <circle className="opacity-an" cx="13" cy="21" r="3" fill="white" />
                <circle cx="23" cy="3" r="3" fill="white" />
                <circle className="opacity-an" cx="23" cy="12" r="3" fill="white" />
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
