import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { AreaLinksNav } from "./AreaLinksNav";

const LINKS = {
  states: [{ href: "/state/kentucky", label: "Kentucky" }],
  cities: [{ href: "/city/elizabethtown-ky", label: "Elizabethtown, KY" }],
};

describe("AreaLinksNav", () => {
  it("renders nothing when no area pages exist", () => {
    const { container } = render(<AreaLinksNav links={{ states: [], cities: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a link for each state and city", () => {
    render(<AreaLinksNav links={LINKS} />);
    expect(screen.getByRole("link", { name: "Kentucky" })).toHaveAttribute("href", "/state/kentucky");
    expect(screen.getByRole("link", { name: "Elizabethtown, KY" })).toHaveAttribute("href", "/city/elizabethtown-ky");
  });

  it("renders plain anchors in server HTML", () => {
    const html = renderToString(<AreaLinksNav links={LINKS} tone="dark" />);
    expect(html).toContain('href="/state/kentucky"');
    expect(html).toContain('href="/city/elizabethtown-ky"');
  });
});
