// "use client";
// import React, { useRef } from "react";
// import gsap from "gsap";
// import { SplitText } from "gsap/SplitText";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useGSAP } from "@gsap/react";

// gsap.registerPlugin(SplitText, ScrollTrigger);

// export default function TextAnimation({
//   children,
//   animateOnScroll = true,
//   delay = 0,
//   blockColor = "#000",
//   stagger = 0.4,
//   duration = 2,
//   triggerSelector = null,
//   triggerStart = "top 90%",
// }) {
//   const containerRef = useRef(null);
//   const splitRefs = useRef([]);
//   const lines = useRef([]);
//   const blocks = useRef([]);

//   useGSAP(
//     () => {
//       if (!containerRef.current) return;
//       splitRefs.current = [];
//       lines.current = [];
//       blocks.current = [];

//       let elements = [];

//       if (containerRef.current.hasAttribute("data-copy-wrapper")) {
//         elements = Array.from(containerRef.current.children);
//       } else {
//         elements = [containerRef.current];
//       }

//       elements.forEach((element) => {
//         const split = SplitText.create(element, {
//           type: "lines",
//           linesClass: "block-lines++",
//           lineThreshold: 0.1,
//         });
//         splitRefs.current.push(split);
//         split.lines.forEach((line) => {
//           const wrapper = document.createElement("div");
//           wrapper.className = "block-line-wrapper";
//           wrapper.style.position = "relative";
//           wrapper.style.overflow = "hidden";
//           line.parentNode.insertBefore(wrapper, line);
//           wrapper.appendChild(line);

//           const block = document.createElement("div");
//           block.className = "block-revealer";
//           block.style.backgroundColor = blockColor;
//           block.style.position = "absolute";
//           block.style.top = "0";
//           block.style.left = "0";
//           block.style.width = "100%";
//           block.style.height = "100%";
//           wrapper.appendChild(block);

//           lines.current.push(line);
//           blocks.current.push(block);
//         });
//       });

//       gsap.set(lines.current, { opacity: 0 });
//       gsap.set(blocks.current, { xPercent: -100 });

//       const createBlockRevealAnimation = (block, line, index) => {
//         const tl = gsap.timeline({ delay: delay + index * stagger });
//         // Single continuous sweep — block travels from -100% to +100% with no stop.
//         // power3.inOut is symmetric so at the exact midpoint xPercent is 0,
//         // meaning the block fully covers the line — that's when we flip opacity.
//         tl.to(block, { xPercent: 100, duration, ease: "power2.inOut" });
//         tl.call(() => gsap.set(line, { opacity: 1 }), null, duration / 2);

//         return tl;
//       };

//       if (animateOnScroll) {
//         const triggerEl = triggerSelector
//           ? containerRef.current.closest(triggerSelector) ?? containerRef.current
//           : containerRef.current;

//         blocks.current.forEach((block, index) => {
//           const tl = createBlockRevealAnimation(
//             block,
//             lines.current[index],
//             index,
//           );
//           tl.pause();

//           ScrollTrigger.create({
//             trigger: triggerEl,
//             start: triggerStart,
//             once: true,
//             onEnter: () => tl.play(),
//           });
//         });
//       } else {
//         blocks.current.forEach((block, index) => {
//           createBlockRevealAnimation(block, lines.current[index], index);
//         });
//       }

//       return () => {
//         splitRefs.current.forEach((split) => split?.revert());
//         const wrappers = containerRef.current?.querySelectorAll(
//           ".block-line-wrapper",
//         );
//         wrappers?.forEach((wrapper) => {
//           if (wrapper.parentNode && wrapper.firstChild) {
//             wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
//             wrapper.remove();
//           }
//         });
//       };
//     },
//     {
//       scope: containerRef,
//       dependencies: [animateOnScroll, delay, blockColor, stagger, duration, triggerSelector, triggerStart],
//     },
//   );

//   return (
//     <>
//       <div ref={containerRef} data-copy-wrapper="true">
//         {children}
//       </div>
//     </>
//   );
// }

"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function TextAnimation({
  children,
  animateOnScroll = true,
  delay = 0,
}) {
  const containerRef = useRef(null);
  const elementRef = useRef([]);
  const splitRef = useRef([]);
  const lines = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    splitRef.current = [];
    elementRef.current = [];
    lines.current = [];

    let elements = [];
    if (containerRef.current.hasAttribute("data-copy-wrapper")) {
      elements = Array.from(containerRef.current.children);
    } else {
      elements = [containerRef.current];
    }

    elements.forEach((element) => {
      elementRef.current.push(element);

      const split = SplitText.create(element, {
        type: "lines",
        mask: "lines",
        linesClass: "line++",
      });

      splitRef.current.push(split);

      // Preserve text-indent on the first line
      const computedStyle = window.getComputedStyle(element);
      const textIndent = computedStyle.textIndent;
      if (textIndent && textIndent !== "0px") {
        if (split.lines.length > 0) {
          split.lines[0].style.paddingLeft = textIndent;
        }
        element.style.textIndent = "0";
      }

      lines.current.push(...split.lines);
    });

    gsap.set(lines.current, { y: "100%" });

    const animationProps = {
      y: "0%",
      duration: 1,
      stagger: 0.1,
      ease: "power4.out",
      delay,
    };

    if (animateOnScroll) {
      gsap.to(lines.current, {
        ...animationProps,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          once: true,
        },
      });
    } else {
      gsap.to(lines.current, animationProps);
    }

    return () => {
      splitRef.current.forEach((split) => {
        if (split) split.revert();
      });
    };
  }, [animateOnScroll, delay]);

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef });
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}
