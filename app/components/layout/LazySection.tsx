"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

type LazySectionProps = {
  children: ReactNode;
  /** Pixels before the section enters the viewport to start rendering it. */
  rootMargin?: string;
  /** Element to render in place of the section until it's near-viewport. */
  placeholder?: ReactNode;
};

// Defers mounting (and therefore all network requests: images, videos,
// GSAP setup) of a below-the-fold section until it's about to scroll into
// view, instead of every section on a page loading all at once on first
// paint.
export default function LazySection({
  children,
  rootMargin = "600px 0px",
  placeholder = null,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (isNear) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isNear, rootMargin]);

  if (isNear) return <>{children}</>;

  return <div ref={ref}>{placeholder}</div>;
}
