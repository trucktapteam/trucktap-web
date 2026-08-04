"use client";

import { useState } from "react";
import type { Truck } from "@/lib/types";

// Shared with ConnectLinks so every chip on the sidebar (call, share, and
// the social/website links) stays visually consistent — min-h-11 (44px)
// keeps every chip at a comfortable touch size regardless of how the
// padding rounds.
export const ACTION_CHIP_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-xs font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand-dark hover:shadow-md active:translate-y-0 active:scale-[0.97]";

export function QuickActions({ truck }: { truck: Truck }) {
  const actions: Array<{ label: string; href: string; icon: React.ReactNode }> = [];

  if (truck.phone) {
    actions.push({ label: "Call", href: `tel:${truck.phone}`, icon: <PhoneIcon /> });
  }

  // Website/Facebook/Instagram/TikTok live in ConnectLinks now, with real
  // platform icons and a dedicated "Connect" grouping — kept out of here
  // so the same links aren't duplicated across two sidebar rows.

  // Nothing to show at all — no phone.
  if (actions.length === 0) {
    return <ShareButton truck={truck} />;
  }

  return (
    <section className="flex flex-wrap items-center gap-2.5">
      {actions.map((action) => (
        <a
          key={action.label}
          href={action.href}
          target={action.href.startsWith("tel:") ? undefined : "_blank"}
          rel={action.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
          className={ACTION_CHIP_CLASS}
        >
          {action.icon}
          {action.label}
        </a>
      ))}
      <ShareButton truck={truck} />
    </section>
  );
}

function ShareButton({ truck }: { truck: Truck }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: truck.name, text: `Check out ${truck.name} on TruckTap`, url };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard copy
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button type="button" onClick={handleShare} className={ACTION_CHIP_CLASS}>
      <ShareIcon />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-.826 1.677L4.6 8.6a11.043 11.043 0 0 0 6.8 6.8l.526-1.403a1.5 1.5 0 0 1 1.677-.826l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-7.18 0-13-5.82-13-13V3.5Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.732 3.367a2.5 2.5 0 1 1-.671 1.341l-6.732-3.367a2.5 2.5 0 1 1 0-3.475l6.732-3.366A2.52 2.52 0 0 1 13 4.5Z" />
    </svg>
  );
}
