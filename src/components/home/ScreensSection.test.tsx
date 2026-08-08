import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScreensSection } from "./ScreensSection";

describe("ScreensSection", () => {
  // Regression test: this used to point at /truck/smoky-wheels-bbq, a
  // leftover mock-data slug that was never a real production truck and
  // 404'd on the live site.
  it("links 'Preview a sample truck profile' to a real production truck", () => {
    render(<ScreensSection />);

    expect(screen.getByRole("link", { name: /Preview a sample truck profile/ })).toHaveAttribute(
      "href",
      "/truck/everetts-family-sweets-and-more-llc"
    );
  });
});
