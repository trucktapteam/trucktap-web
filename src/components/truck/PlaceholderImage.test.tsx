import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  describe('fit="cover-panoramic" (hero crop)', () => {
    function fireLoadWithAspectRatio(img: HTMLImageElement, width: number, height: number) {
      Object.defineProperty(img, "naturalWidth", { value: width, configurable: true });
      Object.defineProperty(img, "naturalHeight", { value: height, configurable: true });
      fireEvent.load(img);
    }

    // Regression test: TestTruck 7/25's hero photo is an 8:1 stitched
    // panorama. Center-cropped by a fixed ~3:1 container like any ordinary
    // photo, that crops away most of the frame and can cut out the truck
    // entirely. Once the real (extreme) aspect ratio is known, the crop
    // must switch to "contain" so nothing gets cropped away.
    //
    // next/image defers the user-facing onLoad until after img.decode()
    // resolves (see next/dist/client/image-component.js), so the class
    // change lands a microtask after fireEvent.load — hence `await waitFor`.
    it("switches to object-contain once an extreme-aspect-ratio image loads", async () => {
      render(<PlaceholderImage seed={REAL_URL} label="Hero photo" fit="cover-panoramic" />);
      const img = screen.getByAltText("Hero photo") as HTMLImageElement;

      expect(img.className).toContain("object-cover");
      fireLoadWithAspectRatio(img, 6500, 800); // ~8:1 panorama

      await waitFor(() => expect(img.className).toContain("object-contain"));
      expect(img.className).not.toContain("object-cover");
      // The letterbox bars get a solid backdrop instead of being left blank.
      expect(img.parentElement?.className).toContain("bg-ink");
    });

    it("keeps object-cover for an ordinary truck-photo aspect ratio", async () => {
      render(<PlaceholderImage seed={REAL_URL} label="Hero photo" fit="cover-panoramic" />);
      const img = screen.getByAltText("Hero photo") as HTMLImageElement;

      fireLoadWithAspectRatio(img, 1600, 900); // ~1.78:1, an ordinary wide photo
      // next/image marks the load handled via a JS property (not an HTML
      // attribute), so flush the pending decode()-then microtask/macrotask
      // queue with a real tick instead of asserting on that property.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(img.className).toContain("object-cover");
      expect(img.className).not.toContain("object-contain");
      expect(img.parentElement?.className).not.toContain("bg-ink");
    });

    it("also catches an extreme tall (portrait panorama) aspect ratio", async () => {
      render(<PlaceholderImage seed={REAL_URL} label="Hero photo" fit="cover-panoramic" />);
      const img = screen.getByAltText("Hero photo") as HTMLImageElement;

      fireLoadWithAspectRatio(img, 800, 6500); // ~1:8 portrait panorama

      await waitFor(() => expect(img.className).toContain("object-contain"));
    });

    it('does not affect plain fit="cover" (the default) even for an extreme-aspect image', async () => {
      render(<PlaceholderImage seed={REAL_URL} label="Hero photo" />);
      const img = screen.getByAltText("Hero photo") as HTMLImageElement;

      fireLoadWithAspectRatio(img, 6500, 800);
      // next/image marks the load handled via a JS property (not an HTML
      // attribute), so flush the pending decode()-then microtask/macrotask
      // queue with a real tick instead of asserting on that property.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(img.className).toContain("object-cover");
      expect(img.className).not.toContain("object-contain");
    });
  });
});
