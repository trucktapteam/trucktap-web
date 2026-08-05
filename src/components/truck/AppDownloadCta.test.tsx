import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/app-links";
import { AppDownloadCta } from "./AppDownloadCta";

// Regression test: this component previously hardcoded
// href="https://apps.apple.com/" / "https://play.google.com/" — the bare
// storefront homepages — instead of the canonical TruckTap listing URLs
// every other download button on the site already used.
describe("AppDownloadCta download links", () => {
  it("links to the canonical App Store listing, not the storefront homepage", () => {
    render(<AppDownloadCta />);

    const link = screen.getByRole("link", { name: /App Store/i });
    expect(link).toHaveAttribute("href", APP_STORE_URL);
    expect(link.getAttribute("href")).not.toBe("https://apps.apple.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links to the canonical Google Play listing, not the storefront homepage", () => {
    render(<AppDownloadCta />);

    const link = screen.getByRole("link", { name: /Google Play/i });
    expect(link).toHaveAttribute("href", GOOGLE_PLAY_URL);
    expect(link.getAttribute("href")).not.toBe("https://play.google.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the same links in compact mode", () => {
    render(<AppDownloadCta compact />);

    expect(screen.getByRole("link", { name: /App Store/i })).toHaveAttribute("href", APP_STORE_URL);
    expect(screen.getByRole("link", { name: /Google Play/i })).toHaveAttribute("href", GOOGLE_PLAY_URL);
  });
});
