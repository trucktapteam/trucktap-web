import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  // Regression test: this link used to be a hardcoded
  // https://gettrucktap.com/privacy.html, left over from the old GitHub
  // Pages site — once the domain moved to this Next.js app, that path
  // 404'd since no such file exists here. It must point at the real
  // in-app route instead.
  it("links Privacy to the in-app /privacy route, not the old privacy.html path", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });

  it("still opens Facebook in a new tab, since that one is a real external link", () => {
    render(<SiteFooter />);

    const facebookLink = screen.getByRole("link", { name: "Facebook" });
    expect(facebookLink).toHaveAttribute("target", "_blank");
    expect(facebookLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
