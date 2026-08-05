import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { MenuItem } from "@/lib/types";
import { MenuItemGrid } from "./MenuItemGrid";

// Matches the fake NEXT_PUBLIC_SUPABASE_URL set in vitest.setup.ts — the
// same host check every other real-image test in this repo relies on.
const REAL_IMAGE = "https://test-project.supabase.co/storage/v1/object/public/truck-images/abc/menu-1.jpg";

function makeItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return { id: "i1", name: "Brisket Plate", price: 16, ...overrides };
}

describe("MenuItemGrid photos", () => {
  it("shows a clickable thumbnail for an item with a valid image", () => {
    render(<MenuItemGrid items={[makeItem({ image: REAL_IMAGE })]} truckName="Smoky Wheels BBQ" />);

    expect(screen.getByRole("button", { name: "View photo of Brisket Plate" })).toBeInTheDocument();
    // Name/price still render as normal.
    expect(screen.getByText("Brisket Plate")).toBeInTheDocument();
    expect(screen.getByText("$16.00")).toBeInTheDocument();
  });

  it("renders a clean text-only row for an item with no image", () => {
    render(<MenuItemGrid items={[makeItem({ description: "Slow-smoked." })]} truckName="Smoky Wheels BBQ" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Brisket Plate")).toBeInTheDocument();
    expect(screen.getByText("Slow-smoked.")).toBeInTheDocument();
  });

  it("collapses to a text-only row (no gradient placeholder) if the image fails to load", () => {
    render(<MenuItemGrid items={[makeItem({ image: REAL_IMAGE })]} truckName="Smoky Wheels BBQ" />);

    const thumbnail = screen.getByRole("button", { name: "View photo of Brisket Plate" });
    const img = thumbnail.querySelector("img");
    expect(img).not.toBeNull();

    fireEvent(img as HTMLImageElement, new Event("error"));

    expect(screen.queryByRole("button", { name: "View photo of Brisket Plate" })).not.toBeInTheDocument();
    // No decorative gradient placeholder took its place, and the rest of the row survives.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Brisket Plate")).toBeInTheDocument();
  });

  it("opens the shared lightbox from a menu-item photo", () => {
    render(<MenuItemGrid items={[makeItem({ image: REAL_IMAGE })]} truckName="Smoky Wheels BBQ" />);

    fireEvent.click(screen.getByRole("button", { name: "View photo of Brisket Plate" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-label", expect.stringContaining("Photo 1 of 1"));
  });

  // Regression test: same page-flow-trapping bug as GallerySection (see
  // its test for the full explanation) — a <Reveal> ancestor's
  // translate-y-* utility creates a containing block for `position:
  // fixed`. Portaling to document.body fixes it here too.
  it("renders the item-photo lightbox as a direct child of document.body (portal)", () => {
    render(<MenuItemGrid items={[makeItem({ image: REAL_IMAGE })]} truckName="Smoky Wheels BBQ" />);
    fireEvent.click(screen.getByRole("button", { name: "View photo of Brisket Plate" }));

    expect(screen.getByRole("dialog").parentElement).toBe(document.body);
  });

  // Regression coverage for a release-blocking freeze investigation: the
  // modal's keydown listener and body scroll-lock must stay perfectly
  // balanced no matter how many times it's opened and closed.
  it("keeps document listeners and body scroll-lock balanced across 12 open/close cycles", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    render(<MenuItemGrid items={[makeItem({ image: REAL_IMAGE })]} truckName="Smoky Wheels BBQ" />);

    for (let i = 0; i < 12; i++) {
      fireEvent.click(screen.getByRole("button", { name: "View photo of Brisket Plate" }));
      fireEvent.keyDown(document, { key: "Escape" });
    }

    const keydownAdds = addSpy.mock.calls.filter((c) => c[0] === "keydown").length;
    const keydownRemoves = removeSpy.mock.calls.filter((c) => c[0] === "keydown").length;
    expect(keydownAdds).toBe(12);
    expect(keydownRemoves).toBe(12);
    expect(document.body.style.overflow).toBe("");

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("does not rebuild the modal's keydown listener when the parent re-renders for an unrelated reason", () => {
    const items = [makeItem({ image: REAL_IMAGE })];
    const { rerender } = render(<MenuItemGrid items={items} truckName="Smoky Wheels BBQ" />);

    fireEvent.click(screen.getByRole("button", { name: "View photo of Brisket Plate" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    rerender(<MenuItemGrid items={[...items]} truckName="Smoky Wheels BBQ" />);
    rerender(<MenuItemGrid items={[...items]} truckName="Smoky Wheels BBQ" />);

    expect(addSpy.mock.calls.filter((c) => c[0] === "keydown")).toHaveLength(0);
    expect(removeSpy.mock.calls.filter((c) => c[0] === "keydown")).toHaveLength(0);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
