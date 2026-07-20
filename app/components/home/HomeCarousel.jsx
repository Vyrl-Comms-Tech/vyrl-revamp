"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "../../styles/home-carousel.css";
import "swiper/css/effect-coverflow";
import ChangeTextAnimation from "../layout/ChangeTextAnimation";
import CtaButton from "../layout/cta";

const slides = [
  {
    image: "/cr1.avif",
    title: "Creative Direction",
    tabs: ["SPLINE", "THREE.JS", "3D"],
    desc: "A curated collection of projects that showcase our approach to design, storytelling, and innovation—each crafted to elevate brands and create lasting impressions.",
  },
  {
    image: "/cr2.avif",
    title: "Brand Identity",
    tabs: ["LOGO", "TYPOGRAPHY"],
    desc: "Distinct visual systems built to give brands a voice that's instantly recognizable, memorable, and consistent across every touchpoint.",
  },
  {
    image: "/cr1.avif",
    title: "Motion & Animation",
    tabs: ["GSAP", "WEBGL", "3D", "MOTION"],
    desc: "Fluid, expressive motion design that brings interfaces to life—turning static ideas into experiences people want to keep exploring.",
  },
  {
    image: "/cr2.avif",
    title: "Web Experience",
    tabs: ["NEXT.JS", "REACT"],
    desc: "Performance-driven websites engineered for speed and scale, without ever compromising on the craft of the design.",
  },
  {
    image: "/img1.jpg",
    title: "Product Design",
    tabs: ["UI/UX", "PROTOTYPING", "RESEARCH"],
    desc: "End-to-end product thinking that turns complex problems into interfaces that feel simple, intuitive, and effortless to use.",
  },
];

const HomeCarousel = () => {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Tags shown lag one animation cycle behind activeIndex: on change, the
  // currently-displayed tags (still showing tagsIndex's set) shrink out
  // first, then tagsIndex catches up to activeIndex and the new tags pop
  // in — same shrink/pop choreography as Services3d, just staged around
  // a state update instead of an in-place textContent swap, since slides
  // here have varying tag counts (Services3d's sections all have exactly
  // 3, so it can reuse fixed DOM elements).
  const [tagsIndex, setTagsIndex] = useState(0);
  const tagsRef = useRef(null);
  const activeSlide = slides[activeIndex];
  const displayedTagsSlide = slides[tagsIndex];

  useEffect(() => {
    if (tagsIndex === activeIndex) return;
    const tagEls = tagsRef.current?.querySelectorAll(".h2-tab");
    if (!tagEls || tagEls.length === 0) {
      setTagsIndex(activeIndex);
      return;
    }

    gsap.killTweensOf(tagEls);
    gsap.to(tagEls, {
      scale: 0,
      opacity: 0,
      duration: 0.25,
      stagger: 0.04,
      overwrite: true,
      onComplete: () => setTagsIndex(activeIndex),
    });
  }, [activeIndex, tagsIndex]);

  const isFirstTagsRender = useRef(true);
  useEffect(() => {
    if (isFirstTagsRender.current) {
      // Skip the pop-in on initial mount — the first slide's tags
      // should just be there already, not animate in on page load.
      isFirstTagsRender.current = false;
      return;
    }
    const tagEls = tagsRef.current?.querySelectorAll(".h2-tab");
    if (!tagEls || tagEls.length === 0) return;
    gsap.fromTo(
      tagEls,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        stagger: 0.04,
        ease: "back.out(1.7)",
      },
    );
  }, [tagsIndex]);

  return (
    <section className="h2-section">
      {/* Title + Tabs */}
      <div className="h2-top">
        <ChangeTextAnimation key={`title-${activeIndex}`} animateOnScroll={false}>
          <h2 className="h2-title">{activeSlide.title}</h2>
        </ChangeTextAnimation>
        <div className="h2-tabs" key={`tabs-${tagsIndex}`} ref={tagsRef}>
          {displayedTagsSlide.tabs.map((tab) => (
            <span className="h2-tab" key={tab}>
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="h2-slider-wrapper">
        <Swiper
          effect="coverflow"
          centeredSlides={true}
          loop={true}
          slidesPerView={"auto"}
          grabCursor={true}
          spaceBetween={-75}
          modules={[EffectCoverflow]}
          coverflowEffect={{
            rotate: -25,
            stretch: 0,
            depth: 0,
            modifier: 1,
            scale: 0.75,
          }}
          breakpoints={{
            0: {
              spaceBetween: -20,
            },
            769: {
              spaceBetween: -75,
            },
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="simple-swiper"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i} className="custom-slide">
              <div className="slider-card">
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 90vw, 500px"
                  className="slider-image"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Footer */}
      <div className="h2-footer">
        {/* Left: See All Work + Counter */}
        <div className="h2-footer-left">
          <CtaButton label="See All Work" videoSrc="/bg-v-compressed.mp4" href="/work" className="cta-button-carousel" />

          <div className="h2-counter">
            <div className="h2-counter-nums">
              <span className="h2-counter-num">
                {String(slides.length).padStart(2, "0")}
              </span>
              <span className="h2-counter-num">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="h2-counter-track">
              <div
                className="h2-counter-fill"
                style={{
                  width: `${((activeIndex + 1) / slides.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Center: Description + Nav arrows */}
        <div className="h2-footer-center">
          <ChangeTextAnimation
            key={`desc-${activeIndex}`}
            animateOnScroll={false}
          >
            <p className="h2-description">{activeSlide.desc}</p>
          </ChangeTextAnimation>
          <div className="h2-nav">
            <button
              className="h2-nav-btn"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <svg width="27" height="32"  viewBox="0 0 18 18" fill="none">
                <path
                  d="M11 14L6 9L11 4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="h2-nav-btn"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <svg width="27" height="32" viewBox="0 0 18 18" fill="none">
                <path
                  d="M7 4L12 9L7 14"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Right spacer to balance layout */}
        <div className="h2-footer-right" />
      </div>
    </section>
  );
};

export default HomeCarousel;