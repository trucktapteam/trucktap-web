"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FACEBOOK_URL } from "@/lib/home-data";

const NAV_LINKS = [
  { href: "/trucks", label: "Find Trucks" },
  { href: "#why", label: "Why" },
  { href: "#how", label: "How it works" },
  { href: "#screens", label: "Screens" },
  { href: "#community", label: "Community" },
  { href: "#owners", label: "Owners" },
  { href: "#download", label: "Download" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-navy/8 bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between gap-6 px-4 sm:min-h-[86px] lg:px-6">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="TruckTap home">
          <Image
            src="/brand/logo.png"
            alt=""
            width={58}
            height={68}
            className="h-11 w-auto drop-shadow-[0_8px_14px_rgba(17,24,39,0.18)] sm:h-13"
            priority
          />
          <span className="text-2xl font-black tracking-tighter text-navy sm:text-[2rem]">
            Truck<span className="text-brand">Tap</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-extrabold text-navy/70 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition duration-200 hover:-translate-y-0.5 hover:text-brand-dark">
              {l.label}
            </a>
          ))}
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-cream-2 px-3.5 py-2.5 text-brand-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-tint hover:shadow-md"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-xs font-black text-white">f</span>
            Truck sightings &amp; memes
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-navy/15 text-navy transition active:scale-95 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-navy/8 px-4 pb-5 lg:hidden" aria-label="Primary">
          <div className="flex flex-col gap-1 pt-3 text-sm font-extrabold text-navy/80">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 transition hover:bg-cream-2 hover:text-brand-dark"
              >
                {l.label}
              </a>
            ))}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-cream-2 px-3 py-2.5 text-brand-ink"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-xs font-black text-white">f</span>
              Truck sightings &amp; memes
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" className="h-5 w-5">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
