"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import PageTransitionLink from "./PageTransitionLink";
import AnimatedFooterWordmark from "./AnimatedFooterWordmark";
import VyrlCtaButton from "./VyrlCtaButton";

gsap.registerPlugin(SplitText);

export default function FooterContent() {
  const footerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVisible = useRef(false);
  const userPaused = useRef(false);
  const modalOpen = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      let revealed = false;
      const animations: gsap.core.Tween[] = [];
      const elements = footer.querySelectorAll<HTMLElement>(
        "h2, h3, p, .footer-reference-contact, .footer-reference-email, .footer-reference-links a",
      );
      const splits = Array.from(elements, (element, index) => SplitText.create(element, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (split) => {
          const animation = gsap.fromTo(split.lines, { yPercent: 110 }, {
            yPercent: 0,
            duration: 1.15,
            stagger: 0.07,
            delay: Math.min(index * 0.035, 0.45),
            ease: "power4.out",
            paused: !revealed,
          });
          if (revealed) animation.progress(1);
          animations.push(animation);
          return animation;
        },
      }));
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio < 0.3 || revealed) return;
        revealed = true;
        animations.forEach((animation) => animation.play());
        observer.disconnect();
      }, { threshold: 0.3 });
      observer.observe(footer);
      // Keyboard navigation must never land on unrevealed link text.
      const revealOnFocus = () => {
        revealed = true;
        animations.forEach((animation) => animation.progress(1));
      };
      footer.addEventListener("focusin", revealOnFocus);
      return () => {
        observer.disconnect();
        footer.removeEventListener("focusin", revealOnFocus);
        splits.forEach((split) => split.revert());
      };
    });
    return () => media.revert();
  }, []);

  const syncPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (
      !isVisible.current ||
      document.hidden ||
      userPaused.current ||
      modalOpen.current
    ) {
      video.pause();
      return;
    }
    // Defer the video request until the footer first enters the viewport.
    if (!video.getAttribute("src")) video.src = "/shoreel.mp4";
    void video.play().catch(() => {
      // If autoplay is blocked, leave the play button available.
    });
  };

  useEffect(() => {
    const footer = footerRef.current;
    const video = videoRef.current;
    if (!footer || !video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0 },
    );
    observer.observe(footer);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      isVisible.current = false;
      video.pause();
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    userPaused.current = !video.paused;
    syncPlayback();
  };

  const openModal = () => {
    modalOpen.current = true;
    videoRef.current?.pause();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    modalVideoRef.current?.pause();
    dialogRef.current?.close();
    modalOpen.current = false;
    setIsModalOpen(false);
    syncPlayback();
    modalTriggerRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!isModalOpen) return;
    dialogRef.current?.showModal();
    const lenis = (
      window as unknown as {
        lenis?: { stop: () => void; start: () => void };
      }
    ).lenis;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [isModalOpen]);

  return (
    <div className="footer-reference" ref={footerRef}>
      <div className="footer-reference-top">
        <h2>
          Let’s build
          <br />
          something remarkable.
        </h2>
        <VyrlCtaButton
          label="Contact us"
          href="/contact-us"
          className="vyrl-cta--invert"
        />
      </div>
      <div className="footer-reference-middle">
        <div className="footer-reference-intro">
          <p>
            Stay updated with the latest news, insights, and updates{" "}
            <span>from Vyrl delivered straight to your inbox.</span>
          </p>
          <a className="footer-reference-email" href="mailto:grow@vyrl.ae">
          grow@vyrl.ae
          </a>
          <div className="footer-reference-socials">
            <a
              href="https://www.linkedin.com/company/vyrl-communications/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9h4v12H3zm6 0h4v1.6C14 9.3 15.2 9 16.5 9c3.3 0 4.5 2 4.5 5v7h-4v-6c0-1.5-.3-2.7-1.9-2.7S13 13.6 13 15v6H9z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/vyrl.ae/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4C17.4 1.2 16.3 1 15 1c-3 0-5 1.8-5 5v3H7v4h3v9z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/vyrl.ae/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
          </div>
        </div>
        <nav className="footer-reference-nav" aria-label="Footer">
          <div>
            <h3>Links</h3>
            <div className="footer-reference-links">
              {[
                ["Home", "/"],
                ["About", "/about"],
                ["Services", "/services"],
                ["Work", "/projects"],
                // ["Lab", "/blogs"],
                ["Contact", "/contact-us"],
              ].map(([label, href]) => (
                <PageTransitionLink key={label} href={href}>
                  {label}
                </PageTransitionLink>
              ))}
            </div>
          </div>
          <div>
            <h3>Info</h3>
            <div className="footer-reference-links">
              <PageTransitionLink href="/privacy-policy">
                Privacy Policy
              </PageTransitionLink>
              <PageTransitionLink href="/terms-and-condition">
                Terms Of Service
              </PageTransitionLink>
            </div>
          </div>
          <div>
            <h3>Contact</h3>
            <div className="footer-reference-links">
              <a
                href="https://wa.me/971585134999"
                target="_blank"
                rel="noopener noreferrer"
              >
                +971 58 513 4999
              </a>
              <a
                href="https://wa.me/971585355134"
                target="_blank"
                rel="noopener noreferrer"
              >
                +971 58 535 5134
              </a>
            </div>
          </div>
          <div>
            <h3>Address</h3>
            <div className="footer-reference-links">
              <a
                className="footer-reference-address"
                href="https://www.google.com/maps/search/?api=1&query=International+Business+Tower+Business+Bay+Dubai"
                target="_blank"
                rel="noopener noreferrer"
              >
                International Business Tower,
                <br />
                Business Bay, Dubai, UAE
              </a>
            </div>
          </div>
        </nav>
      </div>
      <div className="footer-reference-bottom">
        <div className="footer-reference-wordmark">
          <AnimatedFooterWordmark />
        </div>
        <p className="footer-reference-copyright">
          © 2026 VYRL. All rights
          <br />
          reserved.
        </p>
        <div className="footer-reference-video">
          <button
            ref={modalTriggerRef}
            className="footer-reference-open"
            type="button"
            onClick={openModal}
            aria-label="Open Vyrl show reel"
            aria-haspopup="dialog"
          >
            <video
              ref={videoRef}
              poster="/shoreel.png"
              muted
              loop
              playsInline
              onPlay={() => {
                if (
                  !isVisible.current ||
                  document.hidden ||
                  userPaused.current ||
                  modalOpen.current
                ) {
                  videoRef.current?.pause();
                  return;
                }
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
              preload="none"
              aria-hidden="true"
            />
            <svg
              className="footer-reference-fullscreen"
              width="44"
              height="44"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5H5v7M20 5h7v7M27 20v7h-7M12 27H5v-7" />
            </svg>
          </button>
          <button
            className="footer-reference-play"
            type="button"
            onClick={togglePlayback}
            aria-label={
              isPlaying ? "Pause Vyrl show reel" : "Play Vyrl show reel"
            }
          >
            {isPlaying ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="white"
                aria-hidden="true"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <Image src="/play.png" alt="" width={24} height={24} />
            )}
          </button>
        </div>
      </div>
      {isModalOpen &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="footer-reel-dialog"
            aria-label="Vyrl show reel"
            onCancel={(event) => {
              event.preventDefault();
              closeModal();
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <div className="footer-reel-content">
              <button
                type="button"
                className="reel-modal-close"
                aria-label="Close show reel"
                onClick={closeModal}
                autoFocus
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1L17 17M17 1L1 17"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <video
                ref={modalVideoRef}
                className="reel-modal-video"
                src="/shoreel.mp4"
                autoPlay
                controls
                playsInline
              />
            </div>
          </dialog>,
          document.body,
        )}
    </div>
  );
}
