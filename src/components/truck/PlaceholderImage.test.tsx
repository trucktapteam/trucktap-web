import { describe, expect, it } from "vitest";
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

  it("falls back to the gradient placeholder if the real image fails to load", () => {
    render(<PlaceholderImage seed={REAL_URL} label="Truck hero photo" />);

    const img = screen.getByAltText("Truck hero photo");
    fireEvent(img, new Event("error"));

    // The broken <img> is replaced by the decorative placeholder, not left broken.
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Truck hero photo" })).toBeInTheDocument();
  });
});
