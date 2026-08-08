import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./HeroSection";

describe("HeroSection", () => {
  it("links the 'Find Food Trucks' CTA to the /trucks discovery page", () => {
    render(<HeroSection />);

    expect(screen.getByRole("link", { name: /Find Food Trucks/ })).toHaveAttribute("href", "/trucks");
  });
});
