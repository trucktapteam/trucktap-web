"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import type { TruckQrPosterInfo } from "@/lib/truck-view-models";
import { getTruckQrPayload } from "@/lib/truck-share";
import { PlaceholderImage } from "./PlaceholderImage";
import { PosterPreviewModal } from "./PosterPreviewModal";

/**
 * One official web poster, closely following the Expo app's own "Bold"
 * poster template (components/posters/BoldPoster.tsx) — same layout,
 * same accent placement, same brand tokens — but composed live from this
 * page's own truck data instead of being a persisted app-generated file.
 * Always renders: every truck has an id/name (a QR can always be built),
 * and hero/logo gracefully degrade via PlaceholderImage's own fallback.
 */
export function TruckQrPoster({ truck, variant }: { truck: TruckQrPosterInfo; variant: "sidebar" | "mobile" }) {
  const qrValue = getTruckQrPayload(truck.id);
  const qrSize = variant === "sidebar" ? 148 : 176;

  const [previewOpen, setPreviewOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Stable across re-renders so PosterPreviewModal's keydown-listener
  // effect isn't torn down and rebuilt on every unrelated re-render of
  // this component while the modal is open.
  const handleClose = useCallback(() => {
    setPreviewOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <div className={variant === "sidebar" ? "hidden lg:block" : "lg:hidden"} data-testid={`qr-poster-${variant}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setPreviewOpen(true)}
        aria-label={`View full-size QR poster for ${truck.name}`}
        className="block w-full rounded-[1.75rem] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <PosterArtwork truck={truck} qrValue={qrValue} qrSize={qrSize} />
      </button>

      {previewOpen && <PosterPreviewModal truck={truck} qrValue={qrValue} onClose={handleClose} />}
    </div>
  );
}

/**
 * The poster's visual content, shared by the compact (sidebar/mobile) and
 * full-size (preview modal) contexts — same markup at any width, so
 * there's exactly one poster design to keep in sync with the app's.
 */
export function PosterArtwork({
  truck,
  qrValue,
  qrSize,
}: {
  truck: TruckQrPosterInfo;
  qrValue: string;
  qrSize: number;
}) {
  return (
    <div className="w-full overflow-hidden rounded-[1.75rem] bg-white shadow-[var(--shadow-pop)]">
      <div className="h-3 w-full bg-brand" />

      <PlaceholderImage
        seed={truck.hero_image ?? truck.id}
        label={`${truck.name} hero photo`}
        className="h-32 w-full sm:h-36"
        sizes="340px"
      />

      <div className="flex flex-col items-center px-5 pt-0 pb-6 text-center">
        <PlaceholderImage
          seed={truck.logo ?? `${truck.id}-logo`}
          label={`${truck.name} logo`}
          className="-mt-9 mb-3 h-[4.5rem] w-[4.5rem] shrink-0 rounded-2xl border-4 border-brand shadow-[var(--shadow-pop)]"
          sizes="72px"
        />

        <p className="text-balance text-xl leading-tight font-black tracking-tight text-ink uppercase">
          {truck.name}
        </p>

        <div className="mt-4 w-full rounded-2xl bg-surface px-4 py-5">
          <span className="mx-auto mb-3 block h-1 w-14 rounded-full bg-brand" />
          <p className="text-sm font-black tracking-widest text-ink">SCAN TO CONNECT</p>
          {/* p-4 white padding is the QR's quiet zone — matches the app
              poster's own qrWrapper padding so both stay reliably scannable. */}
          <div className="mx-auto mt-4 inline-flex rounded-2xl border-4 border-brand bg-white p-4">
            <QRCodeSVG value={qrValue} size={qrSize} level="M" bgColor="#ffffff" fgColor="#111111" />
          </div>
          <p className="mt-3 text-xs font-semibold tracking-wide text-muted uppercase">
            Open your camera and scan the QR code
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <span className="mb-3 block h-1 w-14 rounded-full bg-brand" />
          <Image src="/brand/logo.png" alt="" width={36} height={36} className="mb-1" />
          <p className="text-[10px] font-bold tracking-widest text-muted">POWERED BY</p>
          <p className="text-lg font-black tracking-widest text-brand">TRUCKTAP</p>
        </div>
      </div>
    </div>
  );
}
