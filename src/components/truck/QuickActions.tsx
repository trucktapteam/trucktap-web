"use client";

import { useState } from "react";
import type { Truck } from "@/lib/types";

export function QuickActions({ truck }: { truck: Truck }) {
  const actions: Array<{ label: string; href: string; icon: React.ReactNode }> = [];

  if (truck.phone) {
    actions.push({ label: "Call", href: `tel:${truck.phone}`, icon: <PhoneIcon /> });
  }
  if (truck.website) {
    actions.push({ label: "Website", href: truck.website, icon: <GlobeIcon /> });
  }
  if (truck.facebook_url) {
    actions.push({ label: "Facebook", href: truck.facebook_url, icon: <TextBadge text="f" /> });
  }
  if (truck.instagram_url) {
    actions.push({ label: "Instagram", href: truck.instagram_url, icon: <TextBadge text="IG" /> });
  }
  if (truck.tiktok_url) {
    actions.push({ label: "TikTok", href: truck.tiktok_url, icon: <TextBadge text="TT" /> });
  }

  // Nothing to show at all — no phone, no website, no socials.
  if (actions.length === 0) {
    return <ShareButton truck={truck} />;
  }

  return (
    <section className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <a
          key={action.label}
          href={action.href}
          target={action.href.startsWith("tel:") ? undefined : "_blank"}
          rel={action.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand-dark hover:shadow-md active:translate-y-0 active:scale-[0.97]"
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
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand-dark hover:shadow-md active:translate-y-0 active:scale-[0.97]"
    >
      <ShareIcon />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

function TextBadge({ text }: { text: string }) {
  return (
    <span className="flex h-3.5 w-3.5 items-center justify-center text-[9px] font-bold leading-none">
      {text}
    </span>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-.826 1.677L4.6 8.6a11.043 11.043 0 0 0 6.8 6.8l.526-1.403a1.5 1.5 0 0 1 1.677-.826l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-7.18 0-13-5.82-13-13V3.5Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.5 3.653a6.505 6.505 0 0 0-3.44 3.44c.32.079.665.132 1.031.161A15.71 15.71 0 0 1 8.5 3.653Zm2 0a15.71 15.71 0 0 1 2.409 3.601c.366-.029.711-.082 1.031-.161a6.505 6.505 0 0 0-3.44-3.44ZM12 10c0-1.061-.093-2.079-.264-3.017a17.19 17.19 0 0 1-3.472 0A15.31 15.31 0 0 0 8 10c0 1.061.093 2.079.264 3.017a17.19 17.19 0 0 1 3.472 0C11.907 12.079 12 11.061 12 10Zm-.075 4.652c.366-.029.711-.082 1.031-.161a6.505 6.505 0 0 1-3.44 3.44 15.71 15.71 0 0 0 2.409-3.279Zm-3.85 0a15.71 15.71 0 0 0 2.409 3.279 6.505 6.505 0 0 1-3.44-3.44c.32.079.665.132 1.031.161ZM4.06 8.653c-.196.813-.196 1.881 0 2.694a12.198 12.198 0 0 0 0-2.694Zm11.88 0a12.198 12.198 0 0 0 0 2.694c.196-.813.196-1.881 0-2.694Z"
        clipRule="evenodd"
      />
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
