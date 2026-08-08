import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./HeroSection";

describe("HeroSection", () => {
  it("links the primary 'See food trucks live now' CTA to the /trucks discovery page", () => {
    render(<HeroSection />);

    expect(screen.getByRole("link", { name: "See food trucks live now" })).toHaveAttribute("href", "/trucks");
  });

  it("shows the supporting line under the primary CTA", () => {
    render(<HeroSection />);

    expect(
      screen.getByText("Live locations, upcoming stops & truck profiles — right here on the web.")
    ).toBeInTheDocument();
  });

  it("keeps the App Store and Google Play links", () => {
    render(<HeroSection />);

    expect(screen.getByRole("link", { name: /Download TruckTap on the App Store/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Get TruckTap on Google Play/ })).toBeInTheDocument();
  });

  it("keeps the secondary 'See the app' and 'For truck owners' in-page links", () => {
    render(<HeroSection />);

    expect(screen.getByRole("link", { name: "See the app" })).toHaveAttribute("href", "#screens");
    expect(screen.getByRole("link", { name: "For truck owners" })).toHaveAttribute("href", "#owners");
  });
});
