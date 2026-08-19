"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "../../styles/chatbot.css";
import Link from "next/link";
import Image from "next/image";

const QUESTIONS = [
  "Walk me through this",
  "Could you do this for us?",
  "What went into this?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [videoSrc, setVideoSrc] = useState("/chat1.mp4");
  const isActiveRef = useRef(false);
  const panelRef = useRef(null);
  const panelBodyRef = useRef(null);
  const toggleRef = useRef(null);
  const timelineRef = useRef(null);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const switchVideoTimeoutRef = useRef(null);
  const revertVideoTimeoutRef = useRef(null);

  // Fades the video to black, swaps its source underneath while hidden,
  // then fades back in — so the chat1<->chat2 swap reads as a soft
  // crossfade instead of an instant, jarring cut.
  const switchVideo = (nextSrc) => {
    const video = videoRef.current;
    if (!video) {
      setVideoSrc(nextSrc);
      return;
    }
    gsap.to(video, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setVideoSrc(nextSrc);
        gsap.to(video, {
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
        });
      },
    });
  };

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (switchVideoTimeoutRef.current) {
      clearTimeout(switchVideoTimeoutRef.current);
    }
    if (revertVideoTimeoutRef.current) {
      clearTimeout(revertVideoTimeoutRef.current);
    }
    switchVideoTimeoutRef.current = setTimeout(() => {
      switchVideo("/chat2.mp4");
      switchVideoTimeoutRef.current = null;
      revertVideoTimeoutRef.current = setTimeout(() => {
        switchVideo("/chat1.mp4");
        revertVideoTimeoutRef.current = null;
      }, 3000);
    }, 1000);

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, from: "user", text: trimmed },
    ]);
    setInputValue("");
    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, from: "bot", text: "yeah , sure i can do that for you" },
      ]);
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (switchVideoTimeoutRef.current) {
        clearTimeout(switchVideoTimeoutRef.current);
      }
      if (revertVideoTimeoutRef.current) {
        clearTimeout(revertVideoTimeoutRef.current);
      }
    };
  }, []);

  const handleInputSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  const toggle = (forceState) => {
    const nextActive = forceState ?? !isActiveRef.current;
    if (nextActive === isActiveRef.current) return;
    isActiveRef.current = nextActive;
    setIsOpen(nextActive);

    if (timelineRef.current) timelineRef.current.kill();

    const panel = panelRef.current;
    const body = panelBodyRef.current;
    const isMobile = window.innerWidth <= 520;
    // .chatbot is anchored with right: 10% on mobile (see chatbot.css),
    // so the open width has to leave that same 10% clear on the left
    // too, or the panel overshoots past the left edge while the right
    // side keeps its 10% gap — that's the "left side cut" bug.
    const width = isMobile ? "calc(100vw - 100%)" : "450px";
    // Leave room above and below the panel on phones instead of expanding
    // it to almost the entire viewport. `innerHeight` also follows the
    // browser's currently visible viewport more reliably than `100vh`.
    const height = isMobile
      ? Math.min(620, Math.max(360, window.innerHeight - 160))
      : 672;
    const closedWidth = toggleRef.current?.offsetWidth ?? 220;
    // Must match .chatbot-panel's resting height in chatbot.css (52px)
    // — this was 62px, 10px taller than the plain-CSS height the
    // trailing clearProps below snaps back to once the close tween
    // finishes. That mismatch is what read as "shrinks, then shrinks
    // again": the panel tweened down to 62px, then instantly jumped to
    // 52px the moment clearProps applied, instead of the tween's final
    // frame already matching the resting CSS value.
    const closedHeight = 52;

    const tl = gsap.timeline({
      onComplete: () => {
        if (timelineRef.current === tl) timelineRef.current = null;
      },
    });
    timelineRef.current = tl;

    if (nextActive) {
      gsap.set(body, { pointerEvents: "auto" });
      tl.to(panel, {
        width,
        borderRadius: 24,
        duration: 0.6,
        ease: "power4.inOut",
      }).to(
        panel,
        {
          height,
          duration: 0.6,
          ease: "power3.inOut",
        },
        "-=0.15",
      );
      tl.to(
        body,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2",
      );
    } else {
      tl.to(body, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      })
        .to(
          panel,
          {
            height: closedHeight,
            duration: 0.5,
            ease: "power3.inOut",
          },
          "-=0.05",
        )
        .to(
          panel,
          {
            width: closedWidth,
            borderRadius: 999,
            duration: 0.55,
            ease: "power4.inOut",
            onComplete: () => {
             
              gsap.set(panel, { clearProps: "width,height,borderRadius" });
           
              gsap.set(body, { pointerEvents: "none" });
            },
          },
          "-=0.15",
        );
    }
  };

  return (
    <div className={`chatbot ${isOpen ? "chatbot--open" : ""}`}>
      <div className="chatbot-panel" ref={panelRef}>
        <button
          type="button"
          className="chatbot-toggle"
          ref={toggleRef}
          onClick={() => toggle(true)}
          aria-label="Open chat"
        >
          <Image
            className="chatbot-star"
            src="/chatbot-star.png"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
          <span className="chatbot-toggle-text">Let&apos;s work together</span>
        </button>

        <div className="chatbot-body" ref={panelBodyRef}>
          <div className="chatbot-tabs">
            <button type="button" className="chatbot-tab chatbot-tab--active">
              Chat
            </button>
            <Link href="/contact-us" className="chatbot-tab">
              Contact
            </Link>
          </div>

          <button
            type="button"
            className="chatbot-close"
            onClick={() => toggle(false)}
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="chatbot-media">
            <video
              className="chatbot-video"
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
            />
          </div>

          <div className="chatbot-content">
            <span className="chatbot-name">Remi</span>
            <h3 className="chatbot-heading">Checking out Control Tower.</h3>
            <p className="chatbot-text">
              I can walk you through what happened here.
            </p>

            {messages.length === 0 ? (
              <div className="chatbot-questions">
                {QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="chatbot-question"
                    onClick={() => sendMessage(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            ) : (
            
              <div className="chatbot-messages" data-lenis-prevent>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chatbot-message chatbot-message--${message.from}`}
                  >
                    {message.text}
                  </div>
                ))}

                {isBotTyping && (
                  <div className="chatbot-message chatbot-message--bot chatbot-message--typing">
                    <span />
                    <span />
                    <span />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form className="chatbot-inputRow" onSubmit={handleInputSubmit}>
            <Image
              className="chatbot-star chatbot-star--small"
              src="/star.png"
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
            />
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
