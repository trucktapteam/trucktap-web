/**
 * The homepage's dark, layered-radial-gradient panel backgrounds — lifted
 * from gettrucktap.com's visual identity. Kept as plain CSS strings (used
 * via inline `style`) rather than Tailwind arbitrary classes because the
 * multi-stop gradients are long enough that a class string would be
 * unreadable and error-prone to hand-edit. Shared across the sections that
 * reuse the same look so the recipe only lives in one place.
 */

/** Hero, "Already Rolling", and "TruckTap Anthem" panels. */
export const heroPanelGradient =
  "radial-gradient(circle at 88% 10%, rgba(255,107,0,0.45), transparent 28%), " +
  "radial-gradient(circle at 6% 92%, rgba(250,204,21,0.24), transparent 26%), " +
  "linear-gradient(135deg, #090d16 0%, #111827 55%, #1f2937 100%)";

export const rollingPanelGradient =
  "radial-gradient(circle at 12% 18%, rgba(255,107,0,0.44), transparent 28%), " +
  "radial-gradient(circle at 86% 74%, rgba(250,204,21,0.18), transparent 25%), " +
  "linear-gradient(135deg, #080b12 0%, #111827 56%, #301508 100%)";

export const anthemPanelGradient =
  "radial-gradient(circle at 16% 20%, rgba(255,107,0,0.42), transparent 30%), " +
  "radial-gradient(circle at 90% 88%, rgba(250,204,21,0.16), transparent 26%), " +
  "linear-gradient(135deg, #080b12 0%, #111827 58%, #2b1509 100%)";

/** "For food truck owners" panel — warmer, browner diagonal. */
export const ownerPanelGradient =
  "radial-gradient(circle at 20% 20%, rgba(255,107,0,0.48), transparent 30%), " +
  "radial-gradient(circle at 92% 78%, rgba(250,204,21,0.22), transparent 26%), " +
  "linear-gradient(135deg, #090d16 0%, #111827 58%, #3b1c0c 100%)";

export const ownerVisualGradient =
  "radial-gradient(circle at 50% 32%, rgba(255,107,0,0.5), transparent 34%), " +
  "linear-gradient(145deg, #050505, #111827 64%, #431407)";

/** Faint grid-line overlay used inside the dark panels above. */
export const panelGridOverlay =
  "linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px), " +
  "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)";
