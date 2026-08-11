"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import "../../styles/draggable-marquee.css";

gsap.registerPlugin(Draggable, InertiaPlugin);

// No real team roster exists yet in this project (see TeamProfie.jsx,
// which uses the same "/team.jpg" + placeholder text pattern) — swap
// these in once real photos/names/roles are available.
const TEAM = [
  {
    name: "Arsalan",
    designation: "Performance Head",
    image:
      "https://res.cloudinary.com/drwzstxy2/image/upload/v1785318699/team2_bb0rwa.jpg",
  },
  {
    name: "Zain",
    designation: "3D & AI Specialist",
    image:
      "https://res.cloudinary.com/drwzstxy2/image/upload/v1785318700/team6_xvot0o.jpg",
  },
  {
    name: "Haris",
    designation: "Sr. Full Stack Developer",
    image:
      "https://res.cloudinary.com/drwzstxy2/image/upload/v1785318699/team5_kebi7v.jpg",
  },

  {
    name: "Saqib",
    designation: "Sr. Front End Developer",
    image:
      "https://res.cloudinary.com/drwzstxy2/image/upload/v1785318699/team10_dvdwyi.jpg",
  },
  {
    name: "Maaz",
    designation: "Jr. Frontend Developer",
    image: "/team/Maaz1.avif",
  },
  {
    name: "Adeel",
    designation: "Jr. Full Stack Developer",
    image: "/team/adeel.avif",
  },
  {
    name: "Fuad",
    designation: "Sr. Graphic Designer",
    image:
      "https://res.cloudinary.com/drwzstxy2/image/upload/v1785397361/WhatsApp_Image_2026-07-30_at_12.20.17_PM_mzq8rn.jpg",
  },
  {
    name: "Mohsin",
    designation: "UI/UX & Design Lead",
    image: "/team/mohsin.avif",
  },
  {
    name: "Fatima",
    designation: "Jr. Designer",
    image: "/team/fatima.avif",
  },
  {
    name: "Amna",
    designation: "Account Manager",
    image:
      "https://res.cloudinary.com/drwzstxy2/image/upload/v1785318700/team7_ahjr4k.jpg",
  },

  {
    name: "Daniyal",
    designation: "Project Manager",
    image: "/team/daniyal.avif",
  },
];

// GSAP's official horizontalLoop helper (https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop/)
// — makes a group of elements animate along the x-axis in a seamless,
// responsive, draggable loop. Unmodified apart from being wrapped as a
// local function instead of a global <script> helper.
function horizontalLoop(items, config) {
  let timeline;
  items = gsap.utils.toArray(items);
  config = config || {};
  gsap.context(() => {
    let onChange = config.onChange,
      lastIndex = 0,
      tl = gsap.timeline({
        repeat: config.repeat,
        onUpdate:
          onChange &&
          function () {
            let i = tl.closestIndex();
            if (lastIndex !== i) {
              lastIndex = i;
              onChange(items[i], i);
            }
          },
        paused: config.paused,
        defaults: { ease: "none" },
        onReverseComplete: () =>
          tl.totalTime(tl.rawTime() + tl.duration() * 100),
      }),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      spaceBefore = [],
      xPercents = [],
      curIndex = 0,
      indexIsDirty = false,
      center = config.center,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap =
        config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1),
      timeOffset = 0,
      container =
        center === true
          ? items[0].parentNode
          : gsap.utils.toArray(center)[0] || items[0].parentNode,
      totalWidth,
      getTotalWidth = () =>
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        spaceBefore[0] +
        items[length - 1].offsetWidth *
          gsap.getProperty(items[length - 1], "scaleX") +
        (parseFloat(config.paddingRight) || 0),
      populateWidths = () => {
        let b1 = container.getBoundingClientRect(),
          b2;
        items.forEach((el, i) => {
          widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
          xPercents[i] = snap(
            (parseFloat(gsap.getProperty(el, "x", "px")) / widths[i]) * 100 +
              gsap.getProperty(el, "xPercent"),
          );
          b2 = el.getBoundingClientRect();
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
          b1 = b2;
        });
        gsap.set(items, {
          xPercent: (i) => xPercents[i],
        });
        totalWidth = getTotalWidth();
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center
          ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
          : 0;
        center &&
          times.forEach((t, i) => {
            times[i] = timeWrap(
              tl.labels["label" + i] +
                (tl.duration() * widths[i]) / 2 / totalWidth -
                timeOffset,
            );
          });
      },
      getClosest = (values, value, wrap) => {
        let i = values.length,
          closest = 1e10,
          index = 0,
          d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap / 2) {
            d = wrap - d;
          }
          if (d < closest) {
            closest = d;
            index = i;
          }
        }
        return index;
      },
      populateTimeline = () => {
        let i, item, curX, distanceToStart, distanceToLoop;
        tl.clear();
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = (xPercents[i] / 100) * widths[i];
          distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
          distanceToLoop =
            distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
          tl.to(
            item,
            {
              xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
              duration: distanceToLoop / pixelsPerSecond,
            },
            0,
          )
            .fromTo(
              item,
              {
                xPercent: snap(
                  ((curX - distanceToLoop + totalWidth) / widths[i]) * 100,
                ),
              },
              {
                xPercent: xPercents[i],
                duration:
                  (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false,
              },
              distanceToLoop / pixelsPerSecond,
            )
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsap.utils.wrap(0, tl.duration());
      },
      refresh = (deep) => {
        let progress = tl.progress();
        tl.progress(0, true);
        populateWidths();
        deep && populateTimeline();
        populateOffsets();
        deep && tl.draggable
          ? tl.time(times[curIndex], true)
          : tl.progress(progress, true);
      },
      onResize = () => refresh(true),
      proxy;
    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener("resize", onResize);
    function toIndex(index, vars) {
      vars = vars || {};
      Math.abs(index - curIndex) > length / 2 &&
        (index += index > curIndex ? -length : length);
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = { time: timeWrap };
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      return vars.duration === 0
        ? tl.time(timeWrap(time))
        : tl.tweenTo(time, vars);
    }
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = (setCurrent) => {
      let index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
    tl.next = (vars) => toIndex(tl.current() + 1, vars);
    tl.previous = (vars) => toIndex(tl.current() - 1, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true);
    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }
    if (config.draggable && typeof Draggable === "function") {
      proxy = document.createElement("div");
      let wrap = gsap.utils.wrap(0, 1),
        ratio,
        startProgress,
        draggableInstance,
        pressCount = 0,
        initChangeX,
        lastSnap,
        align = () =>
          tl.progress(
            wrap(
              startProgress +
                (draggableInstance.startX - draggableInstance.x) * ratio,
            ),
          ),
        syncIndex = () => tl.closestIndex(true);
      draggableInstance = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: "x",
        onPressInit() {
          let x = this.x;
          gsap.killTweensOf(tl);
          // Not "was it playing before THIS press" — a phantom press (see
          // below) can start while an earlier phantom press's pause is
          // still in effect, which would read tl.paused() === true and
          // wrongly conclude the marquee was never playing to begin with,
          // permanently losing the resume signal for that whole gesture.
          // The marquee should always resume once nothing is holding it
          // down, so this only needs to track "is at least one press
          // currently active," not the timeline's paused state.
          pressCount++;
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        snap(value) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) {
            return lastSnap + initChangeX;
          }
          let time = -(value * ratio) * tl.duration(),
            wrappedTime = timeWrap(time),
            snapTime = times[getClosest(times, wrappedTime, tl.duration())],
            dif = snapTime - wrappedTime;
          Math.abs(dif) > tl.duration() / 2 &&
            (dif += dif < 0 ? tl.duration() : -tl.duration());
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          syncIndex();
          draggableInstance.isThrowing && (indexIsDirty = true);
          pressCount = Math.max(0, pressCount - 1);
          // If this "press" never actually turned into an inertia throw
          // (e.g. a scroll/tap gesture — trackpad two-finger scroll can
          // briefly register as a touch/pointer press on the trigger
          // element rather than a real drag), inertia's onThrowComplete
          // below never fires — onPressInit had already paused the
          // timeline by that point, so without this the marquee stayed
          // frozen forever after any such gesture.
          if (!draggableInstance.isThrowing && pressCount === 0) {
            tl.play();
          }
        },
        onThrowComplete: () => {
          syncIndex();
          if (pressCount === 0) tl.play();
        },
      })[0];
      tl.draggable = draggableInstance;
    }
    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    timeline = tl;
    return () => window.removeEventListener("resize", onResize);
  });
  return timeline;
}

export default function DraggableMarquee() {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const badgeRef = useRef(null);
  const loopRef = useRef(null);
  const quickToX = useRef(null);
  const quickToY = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let cancelled = false;

    // horizontalLoop measures each card's actual position/gap once, up
    // front, via getBoundingClientRect(). Plain <img> tags have no
    // intrinsic size until their file finishes loading, so any image
    // still loading at that moment shifts the whole row's layout right
    // afterward — the loop's recorded gaps go stale for every card
    // after it, which is what read as "gap missing sometimes." Waiting
    // for every image to finish loading (or fail) before measuring
    // means the layout is already final and correct the one time it's
    // read.
    const images = Array.from(track.querySelectorAll("img"));
    const whenLoaded = (img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          });

    // Same problem as the images above, but for the name/designation
    // text: document.fonts.ready only resolves once whatever custom
    // font this text uses has actually finished loading. Measuring
    // before that swap happens (fallback font in the meantime, per
    // font-display: swap) bakes in whatever width/height the FALLBACK
    // font produced — once the real font swaps in and reflows that
    // text, some cards' info block ends up sized/positioned differently
    // than what the loop recorded, which is what read as a specific
    // card's name/designation sitting outside its own card.
    const fontsReady =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready
        : Promise.resolve();

    let loop;
    Promise.all([...images.map(whenLoaded), fontsReady]).then(() => {
      if (cancelled) return;
      const cards = gsap.utils.toArray(".draggable-marquee-item", track);
      loop = horizontalLoop(cards, {
        repeat: -1,
        draggable: true,
        center: true,
        speed: 0.8,
        // Default snap rounds each card's xPercent to the nearest whole
        // percent — with each card at 690px wide, that's ~6.9px of
        // rounding "slop." Right at the loop's wrap seam specifically
        // (where a card jumps from one end back to the other), that
        // rounding could land the wrapped card's edge a few pixels
        // closer to its neighbor than everywhere else, which is what
        // read as the gap disappearing for an instant once per cycle.
        snap: false,
      });
      loopRef.current = loop;
    });

    return () => {
      cancelled = true;
      loop?.kill?.();
      loop?.draggable?.kill?.();
    };
  }, []);

  useEffect(() => {
    const badge = badgeRef.current;
    if (!badge) return;
    quickToX.current = gsap.quickTo(badge, "x", {
      duration: 0.5,
      ease: "power3",
    });
    quickToY.current = gsap.quickTo(badge, "y", {
      duration: 0.5,
      ease: "power3",
    });
  }, []);

  const handleMouseMove = (e) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    quickToX.current?.(e.clientX - rect.left);
    quickToY.current?.(e.clientY - rect.top);
  };

  return (
    <section
      className="draggable-marquee"
      ref={wrapperRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="draggable-marquee-viewport">
        <div className="draggable-marquee-track" ref={trackRef}>
          {TEAM.map((member, i) => (
            <div className="draggable-marquee-item" key={i}>
              <div className="draggable-marquee-card">
                <div className="draggable-marquee-image">
                  <img src={member.image} alt={member.name} />
                </div>

                <div className="draggable-marquee-info">
                  <h3 className="draggable-marquee-name">{member.name}</h3>

                  <span className="draggable-marquee-designation">
                    {member.designation}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`draggable-marquee-badge${isHovering ? " is-active" : ""}`}
        ref={badgeRef}
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" className="draggable-marquee-badge-ring">
          <defs>
            {/* Same radius as the stroked circle below it, so the text
                sits centered on the band it's meant to print over. */}
            <path
              id="draggable-marquee-arc"
              d="M 100,100 m -74,0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0"
            />
          </defs>
          {/* This stroked (not filled) circle is the only "background" —
              it's just a colored ring exactly as wide as the text sitting
              on top of it, not a solid disc behind the whole badge. That
              band of color is what reads as a circle; everywhere else in
              the badge stays fully transparent. Radius (74) is deliberately
              short of the viewBox's max safe radius (100) by more than
              half the stroke-width (46 / 2 = 23) — otherwise the stroke's
              own outer edge gets clipped by the SVG canvas boundary,
              which is what read as the ring having a flattened/cut edge
              instead of a clean circle. */}
          {/* <circle
            className="draggable-marquee-badge-ring-band"
            cx="100"
            cy="100"
            r="74"
          />
          <text className="draggable-marquee-badge-ring-text">
            <textPath href="#draggable-marquee-arc" startOffset="0%">
              MEET THE TEAM &nbsp; • &nbsp; MEET THE TEAM  &nbsp;•
            </textPath>
          </text> */}
        </svg>
        <div className="draggable-marquee-badge-inner">
          <span className="draggable-marquee-badge-arrow">←</span>
          <span className="draggable-marquee-badge-label">Drag</span>
          <span className="draggable-marquee-badge-arrow">→</span>
        </div>
      </div>
    </section>
  );
}
