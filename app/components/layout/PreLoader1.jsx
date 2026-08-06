'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import '../../styles/preloader1.css';

gsap.registerPlugin(MorphSVGPlugin);

/**
 * Preloader
 *
 * Cinematic SVG-draw -> morph -> scale-out intro loader.
 * Fires `onComplete` the instant the GSAP timeline finishes, so the
 * parent can reveal the page / start its own entrance animation.
 *
 * Usage:
 *   const [loaded, setLoaded] = useState(false);
 *   {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
 */
export default function Preloader1({ onComplete }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const counterRef = useRef(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const path = pathRef.current;
    const counterEl = counterRef.current;
    if (!path) return undefined;

    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        // Force the counter to its final value the instant the timeline
        // actually finishes, rather than trusting the interval below to
        // land on 100 by then — setInterval's own timing (browser tick
        // delays, drift at small tickMs) isn't tied to this onComplete
        // firing, so the interval could still be short of 100 (e.g. 92)
        // when the animation is already done and starting its exit fade.
        clearInterval(interval);
        if (counterEl) counterEl.textContent = '100';

        // Short fade before unmount so the reveal doesn't hard-cut
        setIsExiting(true);
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            if (typeof onComplete === 'function') onComplete();
          },
        });
      },
    });

    tl.to(path, { strokeDashoffset: 0, duration: 2.4, ease: 'power4.inOut' })
      .to(path, { fill: '#000000', duration: 1 }, '-=0.1')
      .to(path, { strokeOpacity: 0, duration: 1 })
      .to(path, { x: 0, duration: 2, ease: 'elastic.out' })
      .to(
        '.hide',
        { y: 0, duration: 1.5, opacity: 1, stagger: 0.02, ease: 'elastic.out' },
        '4.8'
      )
      .to(path, {
        transform: 'translateX(35%)',
        duration: 1.1,
        ease: 'power4.inOut',
        onComplete: () => {
          gsap.set('svg', { overflow: 'visible' });
        },
      })
      .to(
        '.hide',
        { y: 350, opacity: 0, duration: 1.4, stagger: 0.05, ease: 'power4.inOut' },
        '6.4'
      )
      .to('.first-path', { morphSVG: '#circleTarget', duration: 0.8, ease: 'power3.inOut' })
      .to('.first-path', {
        scale: 40,
        transformOrigin: 'center center',
        duration: 1,
        ease: 'power4.inOut',
      });

    // Scales every tween's timing uniformly (GSAP timeScale, not
    // per-tween duration edits) so the whole intro plays faster while
    // keeping every step's relative pacing/feel identical.
    const timeScale = 1.35;
    tl.timeScale(timeScale);

    // Counter: 1 -> 100, paced against the timeline's ACTUAL wall-clock
    // playback duration (not a hardcoded guess) so it reaches 100 exactly
    // as the animation finishes instead of running out early and sitting
    // at "100" while the preloader keeps playing underneath it.
    // tl.duration() always returns the UNSCALED total regardless of
    // timeScale — dividing by timeScale converts it back to real
    // wall-clock time, or the counter would run at the old, slower pace
    // while the animation itself plays faster.
    //
    // Driven off actual elapsed time (Date.now()) each tick rather than
    // just counting fixed-size steps: setInterval doesn't fire with
    // perfect precision — the browser can delay/clamp each tick, and at
    // the smaller tickMs values a higher timeScale produces, that drift
    // adds up across ~98 ticks. Counting ticks alone meant real elapsed
    // time could pass totalMs before all 98 ticks had actually fired,
    // landing short of 100 (e.g. 92) even though the animation itself
    // was already done. Recomputing count from elapsed/totalMs instead
    // self-corrects for that drift every tick.
    // Counter is intentionally paced to finish well BEFORE the timeline
    // does (70% of total wall-clock time) rather than racing it to the
    // wire. That leaves real headroom against setInterval drift/clamping,
    // so "reaches 100 early and holds" replaces "might land on 92 right
    // as the animation ends".
    const totalMs = (tl.duration() / timeScale) * 1000;
    const counterMs = totalMs * 0.8;
    const tickMs = counterMs / 99;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const count = Math.min(100, 1 + Math.round((elapsed / counterMs) * 99));
      if (counterEl) counterEl.textContent = String(count);
      if (count >= 100) clearInterval(interval);
    }, tickMs);

    return () => {
      tl.kill();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pre-loader${isExiting ? ' pre-loader--exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Page loading"
    >
      <div className="counters" ref={counterRef}>
        0
      </div>

      <div className="svg-fill-path">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="652"
          height="279"
          viewBox="0 0 652 279"
          fill="none"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            className="first-path"
            d="M231.695 74.2661L239 74.2661V34.4153C202.53 34.4153 208.053 34.9974 194.441 40.2586C175.882 47.4452 159.83 62.4228 150.113 81.7661C148.747 84.5869 142.927 97.4153 137.285 110.445C121.815 145.93 118.815 151.079 112.971 151.079C107.128 151.079 101.688 141.654 77.8668 90.3183C73.5907 81.2959 66.1131 64.9526 61.0534 54.1616L51.9191 34.6168L26.0609 34.2362C11.8668 34.0347 0.202643 33.9452 0.00115054 34.0347C-0.0884017 34.1243 5.06085 45.2959 11.5758 58.8183C17.9788 72.4302 28.0982 93.6317 33.8295 105.878C54.0459 148.841 63.7847 168.206 68.7325 175.102C79.2325 189.99 93.337 197.759 112.098 197.759C130.859 197.759 147.583 188.423 158.285 171.99C160.613 168.475 168.964 151.169 176.844 133.482C184.725 115.885 192.785 98.9601 194.643 95.8481C203.016 82.1467 216.538 74.2661 231.695 74.2661Z"
            fill="black"
          />
          <circle className="centers" id="circleTarget" cx="120" cy="100" r="80" visibility="hidden" />
          <path
            className="hide"
            d="M287.254 210.239L245.657 226.425C245.657 226.425 246.709 230.388 249.978 236.164C262.604 258.418 288.284 274.47 316.761 277.963C325.022 279.037 339.709 278.545 348.351 277.09C383.254 270.866 410.948 245.388 419.702 211.358C423.194 197.746 423.687 187.246 423.687 109.672V34.0224H375.754L376.336 70.4701C376.627 91.4701 376.537 110.724 375.955 115.873C374.5 130.649 368.366 140.948 357.194 147.664C343 156.216 322.47 157 307.313 149.612C300.91 146.388 292.828 138.239 289.918 131.813C285.149 121.403 284.657 116.343 284.657 73.6716V34L238 34.5V94.5597C238 123.731 240.53 138.306 248.209 153.575C255.776 168.642 266.97 179.634 282.91 187.604C296.41 194.41 307.403 196.739 322.761 196.157C342.105 195.373 355.806 189.731 369.328 177.194C372.821 173.791 376.134 171.06 376.515 171.06C377.769 171.06 376.224 197.388 374.567 203.522C369.306 223.47 352.604 235.224 329.746 235.224C311.657 235.224 297.373 227.545 289.112 213.261L287.254 210.239Z"
            fill="black"
          />
          <path
            className="hide"
            d="M624.992 198.09C617.694 196.836 607.194 193.836 600.276 190.343C584.716 182.373 573.836 167.888 568.395 148.254C566.246 140.575 566.157 139.299 565.866 70.1866L565.574 0H611.268L611.56 65.3284L611.828 124.567C611.828 128.664 612.657 132.716 614.179 136.5C619.44 149.53 632.269 157.5 648.007 157.5H651.209V199.299L639.343 199.209C632.739 199.119 626.336 198.291 624.97 198.112L624.992 198.09Z"
            fill="black"
          />
          <path
            className="hide"
            d="M449 154.187C449 107.127 449.582 99.9402 454.552 87.582C462.03 68.8208 476.045 53.6417 494.224 44.5074C505.888 38.5746 522.522 34.9701 538.082 34.9701H546.254V76.5895L535.843 76.9701C523.888 77.4626 516.993 79.5895 510.187 85.0298C504.746 89.3059 499.194 97.7686 496.485 105.739C494.448 111.963 494.336 113.91 493.955 154.836L493.664 197.328H449.045V154.164L449 154.187Z"
            fill="black"
          />
        </svg>
      </div>
    </div>
  );
}