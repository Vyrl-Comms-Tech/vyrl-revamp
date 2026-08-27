"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import axios from "axios";
import "../../styles/chatbot.css";
import Image from "next/image";

const QUESTIONS = [
  { text: "What does Vyrl do?", action: "chat" },
  { text: "How does Vyrl's process work?", action: "chat" },
  { text: "What services do you offer?", action: "chat" },
  { text: "Can I see all your projects?", action: "chat" },
  { text: "I'd like to work with you", action: "contact" },
];

const CHATBOT_API_URL = `${process.env.NEXT_PUBLIC_API}/chat/assistant`;

const CHAT_MESSAGES_KEY = "chat_messages";
const CHAT_HISTORY_KEY = "chat_history";

const CONTACT_INITIAL_FORM = {
  fullName: "",
  email: "",
  phoneNumber: "",
  country: "",
  message: "",
};

const WORD_REVEAL_MS = 220;

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const PROJECT_LIST_REGEX =
  /([A-Z][A-Za-z]+(?:\s+[A-Za-z]+)*?):?\s*https?:\/\/\s*vyrl\s*revamp\.netlify\.app\s*\/\s*([a-z0-9-]+)((?:\s+[a-z][a-z0-9-]*)*)/g;

const parseProjectLinks = (text) => {
  const projects = [];
  let match;
  PROJECT_LIST_REGEX.lastIndex = 0;
  while ((match = PROJECT_LIST_REGEX.exec(text))) {
    const label = match[1].replace(/^.*?project:?\s*/i, "").trim();
    const trailingWords = match[3].trim();
    const slug = trailingWords
      ? `${match[2]}-${trailingWords.split(/\s+/).join("-")}`
      : match[2];
    projects.push({ label, url: `https://vyrlrevamp.netlify.app/${slug}` });
  }
  return projects;
};

const normalizeBrokenUrls = (text) =>
  text.replace(
    /https?:\/\/\s*vyrl\s*revamp\.netlify\.app\s*\/\s*([a-z0-9-]+)/gi,
    (match, slug) => `https://vyrlrevamp.netlify.app/${slug}`
  );


const MIN_PROJECTS_FOR_LIST = 2;
const GENERIC_LINK_LABEL_REGEX =
  /^(see|visit|check|view|full|our|contact|the)\b/i;

const renderMessageText = (rawText) => {
  const projects = parseProjectLinks(rawText).filter(
    (project) => !GENERIC_LINK_LABEL_REGEX.test(project.label)
  );

  if (projects.length >= MIN_PROJECTS_FOR_LIST) {
    return (
      <div className="chatbot-project-list">
        <span className="chatbot-project-list-title">Projects:</span>
        {projects.map((project, index) => (
          <div className="chatbot-project-item" key={index}>
            <span className="chatbot-project-name">{project.label}</span>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="chatbot-message-link"
            >
              {project.url}
            </a>
          </div>
        ))}
      </div>
    );
  }

  const text = normalizeBrokenUrls(rawText);
  const parts = text.split(URL_REGEX);
  return parts.map((part, index) =>
    part.match(URL_REGEX) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="chatbot-message-link"
      >
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

const getOpenHeight = (isMobile, tab) => {
  const isContact = tab === "contact";

  if (isMobile) {
    const max = isContact ? 480 : 620;
    return Math.min(max, Math.max(360, window.innerHeight - 160));
  }

  if (window.innerWidth <= 1300) return isContact ? "60vh" : "90vh";
  if (window.innerWidth <= 1400) return isContact ? "48vh" : "65vh";
  return isContact ? 480 : 672;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [videoSrc, setVideoSrc] = useState("/chat1.mp4");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [contactForm, setContactForm] = useState(CONTACT_INITIAL_FORM);
  const [contactErrors, setContactErrors] = useState({});
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitError, setContactSubmitError] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const isActiveRef = useRef(false);
  const panelRef = useRef(null);
  const panelBodyRef = useRef(null);
  const toggleRef = useRef(null);
  const timelineRef = useRef(null);
  const messagesRef = useRef(null);
  const videoRef = useRef(null);
  const switchVideoTimeoutRef = useRef(null);
  const revertVideoTimeoutRef = useRef(null);
  const revealTimeoutRef = useRef(null);



  // useEffect(() => {
  //   try {
  //     const savedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
  //     const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);

  //     if (savedMessages) {
  //       setMessages(JSON.parse(savedMessages));
  //     }

  //     if (savedHistory) {
  //       setHistory(JSON.parse(savedHistory));
  //     }
  //   } catch (error) {
  //     console.error("Failed to restore chatbot data:", error);
  //   }
  // }, []);

  // useEffect(() => {
  //   try {
  //     localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  //   } catch (error) {
  //     console.error("Failed to persist chatbot messages:", error);
  //   }
  // }, [messages]);

  // useEffect(() => {
  //   try {
  //     localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  //   } catch (error) {
  //     console.error("Failed to persist chatbot history:", error);
  //   }
  // }, [history]);

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

  const revealWordByWord = (messageId, fullText, { onDone } = {}) => {
    const words = fullText.split(/\s+/).filter(Boolean);
    switchVideo("/chat2.mp4");
    let index = 0;
    const revealNext = () => {
      index += 1;
      const partial = words.slice(0, index).join(" ");
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, text: partial } : message
        )
      );
      if (index < words.length) {
        revealTimeoutRef.current = setTimeout(revealNext, WORD_REVEAL_MS);
      } else {
        revealTimeoutRef.current = null;
        revertVideoTimeoutRef.current = setTimeout(() => {
          switchVideo("/chat1.mp4");
          revertVideoTimeoutRef.current = null;
          onDone?.();
        }, 300);
      }
    };

    revealNext();
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();

    if (!trimmed) return;

    if (switchVideoTimeoutRef.current) {
      clearTimeout(switchVideoTimeoutRef.current);
    }

    if (revertVideoTimeoutRef.current) {
      clearTimeout(revertVideoTimeoutRef.current);
    }

    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }

    // -----------------------------
    // Add user message
    // -----------------------------

    const userMessageId = `u-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        from: "user",
        text: trimmed,
      },
    ]);

    setInputValue("");
    setIsBotTyping(true);

    const currentHistory = history;

    try {
      const res = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: currentHistory,
        }),
      });

      const data = await res.json();
      // console.log("Response Chatbot data", data)

      if (!res.ok || !data.success) {
        throw new Error(
          data?.message || "Chatbot request failed"
        );
      }

      const answer = data.response;

      const showContactForm = data.showContactForm === true;

      const updatedHistory = [
        ...currentHistory,
        {
          role: "user",
          content: trimmed,
        },
        {
          role: "assistant",
          content: answer,
        },
      ];

      setHistory(updatedHistory);
      setIsBotTyping(false);

      const botMessageId = `b-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          from: "bot",
          text: "",
        },
      ]);

      revealWordByWord(botMessageId, answer, {
        onDone: showContactForm
          ? () => setActiveTab("contact")
          : undefined,
      });
    } catch (error) {
      console.error("Chatbot API error:", error);

      setIsBotTyping(false);

      const fallbackText =
        "Sorry, something went wrong. Please try again.";

      const fallbackId = `b-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: fallbackId,
          from: "bot",
          text: fallbackText,
        },
      ]);
    }
  };


  useEffect(() => {
    return () => {
      if (switchVideoTimeoutRef.current) clearTimeout(switchVideoTimeoutRef.current);
      if (revertVideoTimeoutRef.current) clearTimeout(revertVideoTimeoutRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  const handleContactFieldChange = (field) => (e) => {
    const { value } = e.target;
    setContactForm((prev) => ({ ...prev, [field]: value }));
    setContactErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const validateContactForm = () => {
    const nextErrors = {};

    if (!contactForm.fullName.trim()) nextErrors.fullName = "Full name is required";

    if (!contactForm.email.trim()) {
      nextErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!contactForm.phoneNumber.trim())
      nextErrors.phoneNumber = "Phone number is required";

    if (!contactForm.country.trim()) nextErrors.country = "Country is required";

    return nextErrors;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitError("");

    const nextErrors = validateContactForm();
    setContactErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setContactSubmitting(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API}/admin/contact-us`, {
        fullName: contactForm.fullName.trim(),
        email: contactForm.email.trim(),
        phoneNumber: contactForm.phoneNumber.trim(),
        country: contactForm.country.trim(),
        message: contactForm.message.trim(),
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to submit. Please try again.");
      }

      setContactForm(CONTACT_INITIAL_FORM);
      setContactSent(true);
      window.setTimeout(() => setContactSent(false), 3000);
    } catch (err) {
      setContactSubmitError(
        err?.response?.data?.message || err?.message || "Failed to submit. Please try again."
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuestionClick = (question) => {
    if (question.action === "contact") {
      setActiveTab("contact");
      return;
    }
    if (question.action === "projects") {
      window.location.href = "/projects";
      return;
    }
    sendMessage(question.text);
  };

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (!isOpen || !messagesElement) return;

    messagesElement.scrollTo({
      top: messagesElement.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isBotTyping, isOpen]);


  useEffect(() => {
    if (!isActiveRef.current || !panelRef.current) return;
    const isMobile = window.innerWidth <= 520;
    gsap.to(panelRef.current, {
      height: getOpenHeight(isMobile, activeTab),
      duration: 0.4,
      ease: "power3.inOut",
    });
  }, [activeTab]);

  const toggle = (forceState) => {
    const nextActive = forceState ?? !isActiveRef.current;
    if (nextActive === isActiveRef.current) return;
    isActiveRef.current = nextActive;
    setIsOpen(nextActive);

    if (timelineRef.current) timelineRef.current.kill();

    const panel = panelRef.current;
    const body = panelBodyRef.current;
    const isMobile = window.innerWidth <= 520;
    const width = isMobile ? "calc(100vw - 10vw)" : "450px";
    const height = getOpenHeight(isMobile, activeTab);
    const closedWidth = toggleRef.current?.offsetWidth ?? 220;
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

        <div
          className={`chatbot-body ${activeTab === "contact" ? "chatbot-body--contact" : ""}`}
          ref={panelBodyRef}
        >
          <div className="chatbot-tabs">
            <button
              type="button"
              className={`chatbot-tab ${activeTab === "chat" ? "chatbot-tab--active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </button>
            <button
              type="button"
              className={`chatbot-tab ${activeTab === "contact" ? "chatbot-tab--active" : ""}`}
              onClick={() => setActiveTab("contact")}
            >
              Contact
            </button>
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
            {activeTab !== "contact" && (
              <span className="chatbot-name">Remi</span>
            )}
            {activeTab === "contact" ? (
              <>
                <h3 className="chatbot-heading">Let&apos;s get in touch.</h3>
                <p className="chatbot-text">
                  Share a few details and our team will follow up.
                </p>
              </>
            ) : (
              <>
                <h3 className="chatbot-heading">Hey, I&apos;m Remi.</h3>
                <p className="chatbot-text">
                  Ask me anything about Vyrl or what we can build for you.
                </p>
              </>
            )}

            {activeTab === "contact" ? (
              <form
                className="chatbot-contact-form"
                data-lenis-prevent
                onSubmit={handleContactSubmit}
                noValidate
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  value={contactForm.fullName}
                  onChange={handleContactFieldChange("fullName")}
                  className={contactErrors.fullName ? "chatbot-field--error" : ""}
                  aria-invalid={!!contactErrors.fullName}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={contactForm.email}
                  onChange={handleContactFieldChange("email")}
                  className={contactErrors.email ? "chatbot-field--error" : ""}
                  aria-invalid={!!contactErrors.email}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={contactForm.phoneNumber}
                  onChange={handleContactFieldChange("phoneNumber")}
                  className={contactErrors.phoneNumber ? "chatbot-field--error" : ""}
                  aria-invalid={!!contactErrors.phoneNumber}
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={contactForm.country}
                  onChange={handleContactFieldChange("country")}
                  className={contactErrors.country ? "chatbot-field--error" : ""}
                  aria-invalid={!!contactErrors.country}
                />
                <textarea
                  placeholder="Tell us about your project"
                  rows={3}
                  value={contactForm.message}
                  onChange={handleContactFieldChange("message")}
                />

                {contactSubmitError && (
                  <p className="chatbot-contact-formError">{contactSubmitError}</p>
                )}

                <button
                  type="submit"
                  className={`chatbot-contact-submit ${contactSent ? "is-sent" : ""}`}
                  disabled={contactSubmitting}
                >
                  <span className="chatbot-contact-submit-label">
                    {contactSubmitting ? "Sending..." : "Send"}
                  </span>
                  <span className="chatbot-contact-submit-sent">Sent!</span>
                </button>
              </form>
            ) : messages.length === 0 ? (
              <div className="chatbot-questions">
                {QUESTIONS.map((question) => (
                  <button
                    key={question.text}
                    type="button"
                    className="chatbot-question"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question.text}
                  </button>
                ))}
              </div>
            ) : (

              <div
                className="chatbot-messages"
                ref={messagesRef}
                data-lenis-prevent
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chatbot-message chatbot-message--${message.from}`}
                  >
                    {renderMessageText(message.text)}
                  </div>
                ))}

                {isBotTyping && (
                  <div className="chatbot-message chatbot-message--bot chatbot-message--typing">
                    <span />
                    <span />
                    <span />
                  </div>
                )}

              </div>
            )}
          </div>

          {activeTab === "chat" && (
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
              <button
                type="submit"
                className="chatbot-sendBtn"
                aria-label="Send message"
                disabled={!inputValue.trim()}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3.4 20.6L21 12 3.4 3.4 3.4 10 15 12 3.4 14z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
