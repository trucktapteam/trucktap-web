"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades + slides children up as they scroll into view. Content is always
 * present in the server-rendered HTML (SSR/SEO unaffected) — this only
 * withholds the visual reveal until JS decides it's time. The global
 * prefers-reduced-motion override (globals.css) collapses the transition
 * to near-instant, so reduced-motion users still get the reveal, just
 * without the animated motion.
 */
export function Reveal({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Wrapped sections render null when a truck has no data for them (e.g.
  // MenuSection with no items/photos) — collapse to nothing ourselves so
  // we don't leave an empty div eating a flex gap and creating a blank gap.
  if (children == null) return null;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
