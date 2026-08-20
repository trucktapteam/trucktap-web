import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TruckProfileTopBar } from "./TruckProfileTopBar";

// A visitor who lands directly on a truck profile from a Google search
// should be able to tell they're on TruckTap without scrolling (the brand
// mark links home) and get back into the rest of the site if they want to
// (the discovery link points at the same /trucks route as everywhere
// else) — this bar is what makes both true above the fold.
describe("TruckProfileTopBar", () => {
  it("shows the TruckTap brand mark linking to the homepage", () => {
    render(<TruckProfileTopBar />);

    const homeLink = screen.getByRole("link", { name: "TruckTap home" });
    expect(homeLink).toHaveAttribute("href", "/");
    expect(homeLink.querySelector("img")).not.toBeNull();
    expect(homeLink).toHaveTextContent("TruckTap");
  });

  it("shows the discovery link pointing at /trucks", () => {
    render(<TruckProfileTopBar />);

    const discoveryLink = screen.getByRole("link", { name: /Find More Food Trucks/ });
    expect(discoveryLink).toHaveAttribute("href", "/trucks");
  });
});
