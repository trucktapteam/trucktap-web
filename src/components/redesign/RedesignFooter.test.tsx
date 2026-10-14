import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RedesignFooter } from "./RedesignFooter";

describe("RedesignFooter", () => {
  it("links Privacy to the in-app /privacy route", () => {
    render(<RedesignFooter />);

    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });

  it("links the official TruckTap Facebook page in a new tab with an accessible name", () => {
    render(<RedesignFooter />);

    const facebookLink = screen.getByRole("link", { name: /TruckTap on Facebook/ });
    expect(facebookLink).toHaveAttribute("href", "https://www.facebook.com/TruckTap/");
    expect(facebookLink).toHaveAttribute("target", "_blank");
    expect(facebookLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
