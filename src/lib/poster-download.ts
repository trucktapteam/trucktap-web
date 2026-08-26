import { toPng } from "html-to-image";

// Rasterize well above on-screen size so the exported file holds up for
// print and social/video use, not just a screenshot-quality preview.
const TARGET_WIDTH_PX = 2400;
const MIN_PIXEL_RATIO = 2;
const MAX_PIXEL_RATIO = 8;

/**
 * Rasterizes `node` — the poster's own DOM/CSS, exactly as displayed — to a
 * PNG data URL and triggers a browser download. Uses html-to-image rather
 * than redrawing the poster on a canvas by hand, so every visual detail
 * (hero photo, logo, QR, brand styling) stays pixel-for-pixel what's on
 * screen instead of a second implementation that can drift from it.
 */
export async function downloadPosterAsPng(node: HTMLElement, fileName: string): Promise<void> {
  const pixelRatio = Math.min(MAX_PIXEL_RATIO, Math.max(MIN_PIXEL_RATIO, TARGET_WIDTH_PX / node.offsetWidth));

  const dataUrl = await toPng(node, { pixelRatio });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

/** `<truck name slug>-trucktap-poster.png`, safe for every OS's filesystem. */
export function posterFileName(truckName: string): string {
  const slug = truckName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "truck"}-trucktap-poster.png`;
}
