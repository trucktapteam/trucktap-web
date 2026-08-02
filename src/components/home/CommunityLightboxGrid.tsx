"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { CommunityPhoto } from "@/lib/home-data";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function CommunityLightboxGrid({ photos }: { photos: CommunityPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? photos[activeIndex] : null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);

  // Focus management: move focus into the dialog on open, trap Tab/Shift+Tab
  // within it while open, and restore focus to whichever grid photo opened
  // it on close — matches what the old site's vanilla-JS lightbox did.
  useEffect(() => {
    if (!active) return;

    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveIndex(null);
        return;
      }
      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("overflow-hidden");
      triggerElRef.current?.focus();
    };
  }, [active]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4" aria-label="Community images seen on TruckTap">
        {photos.map((photo, i) => (
          <button
            key={photo.file}
            type="button"
            onClick={(e) => {
              triggerElRef.current = e.currentTarget;
              setActiveIndex(i);
            }}
            aria-label={`Open ${photo.alt}`}
            className={`group relative min-h-[190px] cursor-zoom-in overflow-hidden rounded-[1.75rem] border-[7px] border-white shadow-[0_14px_34px_rgba(17,24,39,0.1)] transition duration-200 hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_24px_60px_rgba(17,24,39,0.14)] focus-visible:z-10 focus-visible:outline-4 focus-visible:outline-brand/55 focus-visible:outline-offset-4 ${
              photo.feature
                ? "col-span-2 row-span-2 min-h-[400px] rotate-0"
                : i % 2 === 0
                  ? "rotate-1"
                  : "-rotate-[1.2deg]"
            }`}
          >
            <Image
              src={`/home/community/${photo.file}`}
              alt={photo.alt}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes={photo.feature ? "(min-width: 640px) 46vw, 90vw" : "(min-width: 640px) 22vw, 44vw"}
            />
          </button>
        ))}

        <div className="grid min-h-[190px] place-items-center rounded-[1.75rem] border-[3px] border-hardline bg-navy p-6 text-center text-lg leading-tight font-black tracking-tight text-white shadow-[8px_8px_0_var(--color-hardline)]">
          More truck sightings, event moments, and local flavor can drop right here.
        </div>
      </div>

      {active && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 grid place-items-center bg-[#05080d]/84 p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded community image"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveIndex(null);
          }}
        >
          <div className="relative rounded-[1.75rem] bg-white p-2.5 shadow-[0_34px_90px_rgba(0,0,0,0.48)]">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Close image"
              className="absolute -top-3.5 -right-3.5 z-10 grid h-10 w-10 place-items-center rounded-full border-[3px] border-hardline bg-brand text-2xl leading-none font-black text-white shadow-[5px_5px_0_var(--color-hardline)] transition hover:bg-brand-dark"
            >
              &times;
            </button>
            <div className="relative h-[76vh] max-h-[680px] w-[86vw] max-w-[1000px] overflow-hidden rounded-[1.25rem]">
              <Image src={`/home/community/${active.file}`} alt={active.alt} fill className="object-contain" sizes="90vw" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
