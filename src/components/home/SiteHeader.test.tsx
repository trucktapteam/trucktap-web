import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("shows a 'Find Trucks' link to /trucks in the desktop nav", () => {
    render(<SiteHeader />);

    const links = screen.getAllByRole("link", { name: "Find Trucks" });
    expect(links[0]).toHaveAttribute("href", "/trucks");
  });

  it("also shows 'Find Trucks' in the mobile nav once opened, and closes the menu on click", () => {
    render(<SiteHeader />);

    fireEvent.click(screen.getByLabelText("Open menu"));
    const links = screen.getAllByRole("link", { name: "Find Trucks" });
    expect(links.length).toBeGreaterThan(1);

    fireEvent.click(links[links.length - 1]);
    expect(screen.getAllByRole("link", { name: "Find Trucks" })).toHaveLength(1);
  });
});
