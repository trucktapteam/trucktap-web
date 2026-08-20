import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlaceholderImage } from "./PlaceholderImage";

// Matches the fake NEXT_PUBLIC_SUPABASE_URL set in vitest.setup.ts — the
// hostname allowlist only accepts URLs on the configured Supabase Storage
// host, so this can't be an arbitrary example.com URL.
const REAL_URL = "https://test-project.supabase.co/storage/v1/object/public/truck-images/abc/hero.jpg";

describe("PlaceholderImage", () => {
  it("renders a real <img> for a valid http(s) URL seed", () => {
    const { container } = render(<PlaceholderImage seed={REAL_URL} label="Truck hero photo" />);

    const img = screen.getByAltText("Truck hero photo");
    expect(img.tagName).toBe("IMG");
    // next/image rewrites src through its loader — assert the original
    // URL is embedded rather than asserting on img.src verbatim.
    expect(img.getAttribute("src")).toContain(encodeURIComponent(REAL_URL));
    // No decorative gradient placeholder should be present alongside a real photo.
    expect(container.querySelector('[role="img"]')).toBeNull();
  });

  it("falls back to the gradient placeholder for a mock seed (not a URL)", () => {
    render(<PlaceholderImage seed="hero-smoky-wheels" label="Truck hero photo" />);

    expect(screen.queryByRole("img", { name: "Truck hero photo" })).not.toBeNull();
    expect(document.querySelector("img[src]")).toBeNull();
  });

  it("falls back to the gradient placeholder for an empty seed", () => {
    render(<PlaceholderImage seed="" label="Truck hero photo" />);

    expect(screen.getByRole("img", { name: "Truck hero photo" })).toBeInTheDocument();
    expect(document.querySelector("img[src]")).toBeNull();
  });

  it("falls back to the gradient placeholder for an invalid/malformed URL", () => {
    render(<PlaceholderImage seed="not a url at all" label="Truck hero photo" />);

    expect(screen.getByRole("img", { name: "Truck hero photo" })).toBeInTheDocument();
    expect(document.querySelector("img[src]")).toBeNull();
  });

  it("falls back to the gradient placeholder for a valid URL on an unconfigured host", () => {
    // Regression test: next/image throws a render-crashing error for any
    // src whose host isn't in next.config.ts's remotePatterns — a truck
    // row referencing e.g. a stock-photo URL must degrade to the
    // placeholder instead of taking the whole page down.
    render(<PlaceholderImage seed="https://images.unsplash.com/photo-123?w=800" label="Truck hero photo" />);

    expect(screen.getByRole("img", { name: "Truck hero photo" })).toBeInTheDocument();
    expect(document.querySelector("img[src]")).toBeNull();
  });

  // A single transient load failure (a dropped request, a cold cache slot,
  // network contention while a page loads a dozen thumbnails at once) used
  // to permanently commit this component instance to the gradient
  // fallback, even though the exact same URL loads fine moments later —
  // which is exactly what the lightbox demonstrated, since it mounts a
  // fresh instance and gets a clean first try. These tests cover the
  // bounded (exactly one) retry that closes that gap.

  it("retries once instead of immediately falling back on the first load failure", () => {
    const onImageError = vi.fn();
    render(<PlaceholderImage seed={REAL_URL} label="Truck hero photo" onImageError={onImageError} />);

    const img = screen.getByAltText("Truck hero photo");
    fireEvent(img, new Event("error"));

    // Still a real <img>, not the gradient fallback — one failure is a retry, not a verdict.
    const retryImg = screen.getByAltText("Truck hero photo");
    expect(retryImg.tagName).toBe("IMG");
    expect(document.querySelector('[role="img"]')).toBeNull();
    // The parent isn't told anything failed yet — onImageError only fires once retries are exhausted.
    expect(onImageError).not.toHaveBeenCalled();

    // The retry requests a URL the browser/edge cache has never seen for
    // this seed, rather than silently reusing the one that just failed.
    const expectedRetrySrc = `${REAL_URL}?retry=1`;
    expect(retryImg.getAttribute("src")).toContain(encodeURIComponent(expectedRetrySrc));
  });

  it("clears failure state and renders the real image when the retry succeeds", () => {
    const onImageError = vi.fn();
    render(<PlaceholderImage seed={REAL_URL} label="Truck hero photo" onImageError={onImageError} />);

    fireEvent(screen.getByAltText("Truck hero photo"), new Event("error")); // first failure -> retry

    // No second error fires (the retry succeeds) — the real photo stays rendered.
    const img = screen.getByAltText("Truck hero photo");
    expect(img.tagName).toBe("IMG");
    expect(document.querySelector('[role="img"]')).toBeNull();
    expect(screen.queryByText("Photo unavailable")).toBeNull();
    expect(onImageError).not.toHaveBeenCalled();
  });

  it("falls back to the gradient placeholder only after the retry also fails", () => {
    const onImageError = vi.fn();
    render(<PlaceholderImage seed={REAL_URL} label="Truck hero photo" onImageError={onImageError} />);

    fireEvent(screen.getByAltText("Truck hero photo"), new Event("error")); // 1st failure -> retry
    fireEvent(screen.getByAltText("Truck hero photo"), new Event("error")); // 2nd failure -> exhausted

    // The broken <img> is replaced by the decorative placeholder, not left broken.
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Truck hero photo" })).toBeInTheDocument();
    // Only now — after the retry is exhausted — does the parent get told.
    expect(onImageError).toHaveBeenCalledTimes(1);
  });

  it("marks a load failure as distinct from a missing photo (e.g. an undecodable HEIC upload) once the retry is exhausted", () => {
    render(<PlaceholderImage seed={REAL_URL} label="Truck hero photo" />);

    // Before any error, no failure indicator — this could still resolve to a real photo.
    expect(screen.queryByText("Photo unavailable")).toBeNull();

    fireEvent(screen.getByAltText("Truck hero photo"), new Event("error")); // retry, not yet a verdict
    expect(screen.queryByText("Photo unavailable")).toBeNull();

    fireEvent(screen.getByAltText("Truck hero photo"), new Event("error")); // retry also fails

    // After a real photo fails to decode even on retry, the fallback says
    // so instead of silently looking identical to a truck that never
    // uploaded a photo.
    expect(screen.getByText("Photo unavailable")).toBeInTheDocument();
  });

  it('fallback="hide" still collapses to nothing, but only once the retry is exhausted', () => {
    const onImageError = vi.fn();
    const { container } = render(
      <PlaceholderImage seed={REAL_URL} label="Menu item photo" fallback="hide" onImageError={onImageError} />
    );

    fireEvent(screen.getByAltText("Menu item photo"), new Event("error")); // 1st failure -> retry

    // Still rendering the (retrying) real image — must not collapse on the first failure.
    expect(screen.queryByAltText("Menu item photo")).not.toBeNull();
    expect(onImageError).not.toHaveBeenCalled();

    fireEvent(screen.getByAltText("Menu item photo"), new Event("error")); // 2nd failure -> exhausted

    // Now it collapses to nothing (no decorative gradient either) rather
    // than leaving a broken image in a layout that must stay text-only.
    expect(container.innerHTML).toBe("");
    expect(onImageError).toHaveBeenCalledTimes(1);
  });

  it("never retries more than once even if failures keep happening", () => {
    const onImageError = vi.fn();
    render(<PlaceholderImage seed={REAL_URL} label="Truck hero photo" onImageError={onImageError} />);

    fireEvent(screen.getByAltText("Truck hero photo"), new Event("error")); // 1 -> retry
    fireEvent(screen.getByAltText("Truck hero photo"), new Event("error")); // 2 -> exhausted, permanent fallback

    // Once permanently failed there is no <img> left in the DOM at all —
    // structurally, no further error event can trigger another retry.
    expect(document.querySelector("img")).toBeNull();
    // The parent was told exactly once, not once per failed attempt.
    expect(onImageError).toHaveBeenCalledTimes(1);
  });

  it("does not show a failure indicator for a truck that simply has no photo", () => {
    render(<PlaceholderImage seed="" label="Truck hero photo" />);

    expect(screen.queryByText("Photo unavailable")).toBeNull();
  });

  it('fit="contain" renders object-contain directly, no load-time detection needed', () => {
    render(<PlaceholderImage seed={REAL_URL} label="Hero photo" fit="contain" />);
    const img = screen.getByAltText("Hero photo") as HTMLImageElement;

    expect(img.className).toContain("object-contain");
    expect(img.className).not.toContain("object-cover");
  });
});
