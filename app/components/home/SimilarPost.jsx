"use client";
import React, { useRef, useState } from "react";
import gsap from "gsap";
// import MagneticButton from "./Common/MagneticButton";
import "../../styles/similarPost.css";
import TextAnimation from "./TextAnimation";

function SimilarPost() {
  const cardRefs = useRef([]);
  const mobileContentRef = useRef(null);
  const mobileAnimating = useRef(false);
  const [mobileIndex, setMobileIndex] = useState(0);

  const reviews = [
    {
      id: 1,
      name: "The Future of Digital Experiences",
      content:
        "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
      date: "Aug 12, 2025",
      image: "/img2.png",
    },
    {
      id: 2,
      name: "The Future of Digital Experiences",
      content:
        "The 3D interactions he built are mind-blowing. Truly a next-level developer who understands the intersection of design and tech.",
      date: "Jul 28, 2025",
      image: "/cr1.png",
    },
    {
      id: 3,
      name: "The Future of Digital Experiences",
      content:
        "Professional, efficient, and incredibly skilled. A joy to work with on our rebranding and frontend architecture.",
      date: "Jun 15, 2025",
      image: "/cr2.jpg",
    },
    {
      id: 4,
      name: "The Future of Digital Experiences",
      content:
        "His mastery of GSAP and motion design sets him apart. Our user engagement tripled after implementing his designs.",
      date: "May 02, 2025",
      image: "/img16.png",
    },
  ];

  const handleMouseEnter = (index) => {
    const card = cardRefs.current[index];
    const liftY = window.innerWidth <= 1620 ? -100 : -170;
    gsap.killTweensOf(card);
    gsap.set(card, { zIndex: 50 });
    gsap.to(card, {
      y: liftY,
      x: 10,
      scale: 1.05,
      rotation: 0,
      boxShadow: "0 30px 60px rgba(0, 0, 0, 0.3)",
      duration: 0.45,
      ease: "power3.out",
    });
  };

  const handleMouseLeave = (index) => {
    const originalRotation =
      index === 0 ? -3 : index === 1 ? 5 : index === 2 ? -7 : 4;
    const card = cardRefs.current[index];
    gsap.killTweensOf(card);
    gsap.set(card, { zIndex: index });
    gsap.to(card, {
      y: 0,
      x: 0,
      scale: 1,
      rotation: originalRotation,
      boxShadow: "0 15px 45px rgba(0, 0, 0, 0.1)",
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const slideTo = (nextIndex, direction) => {
    const el = mobileContentRef.current;
    if (!el || mobileAnimating.current) return;
    mobileAnimating.current = true;

    // direction: 1 = next (content exits left, enters from right)
    //           -1 = prev (content exits right, enters from left)
    gsap.to(el, {
      x: direction * -40,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setMobileIndex(nextIndex);
        gsap.set(el, { x: direction * 40 });
        gsap.to(el, {
          x: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            mobileAnimating.current = false;
          },
        });
      },
    });
  };

  const goToPrev = () => {
    const nextIndex = mobileIndex === 0 ? reviews.length - 1 : mobileIndex - 1;
    slideTo(nextIndex, -1);
  };

  const goToNext = () => {
    const nextIndex = mobileIndex === reviews.length - 1 ? 0 : mobileIndex + 1;
    slideTo(nextIndex, 1);
  };

  const activeReview = reviews[mobileIndex];

  return (
    <section className="review-section">
      <div className="review-cards-container">
        {reviews.map((review, index) => {
          const originalRotation =
            index === 0 ? -3 : index === 1 ? 5 : index === 2 ? -7 : 4;
          return (
            <div
              key={review.id}
              ref={(el) => (cardRefs.current[index] = el)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
              className={`review-card 
    ${index === reviews.length - 1 ? "last" : index === reviews.length - 4 ? "first" : ""} 
    ${index % 2 === 0 ? "dark" : "light"}
  `}
              style={{
                transform: `rotate(${originalRotation}deg)`,
                zIndex: index,
              }}
            >
              <div className="review-card-content">
                <div>
                  <h3 className="review-card-name">{review.name}</h3>
                </div>
                {/* <span className="review-card-role">{review.role}</span> */}
                <div>
                  <p className="review-card-description">{review.content}</p>
                  <div className="review-card-meta">
                    <span>5 min read</span>
                    <span>•</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>
              <div className="review-card-image">
                <img src={review.image} alt={review.name} />
              </div>
            </div>
          );
        })}

        <div className="reviews-label">
          <span>•</span>
          <h2>BLOGS</h2>
          <span>•</span>
        </div>
      </div>

      <div className="review-mobile-card">
        <div className="review-mobile-content" ref={mobileContentRef}>
          <h3 className="review-mobile-name">
                            <TextAnimation animateOnScroll={true} delay={0.3}>
          
              <span>{activeReview.name}</span>
            </TextAnimation>
          </h3>
          <p className="review-mobile-description">
                             <TextAnimation animateOnScroll={true} delay={0.3}>
           
              <span>{activeReview.content}</span>
            </TextAnimation>
          </p>
          <div className="review-mobile-meta">
            <span>5 min read</span>
            <span>•</span>
            <span>{activeReview.date}</span>
          </div>
          <div className="review-mobile-image">
            <img src={activeReview.image} alt={activeReview.name} />
          </div>
        </div>
        <div className="review-mobile-nav">
          <button
            type="button"
            className="review-mobile-nav-btn"
            onClick={goToPrev}
            aria-label="Previous"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M11 14L6 9L11 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="review-mobile-nav-btn"
            onClick={goToNext}
            aria-label="Next"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M7 4L12 9L7 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="review-mobile-label">
        <span>•</span>
        <h2>VIEW ALL BLOGS</h2>
        <span>•</span>
      </div>
    </section>
  );
}

export default SimilarPost;
