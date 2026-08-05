import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { GallerySection } from "./GallerySection";
import { MenuSection } from "./MenuSection";
import { UpcomingStopsSection } from "./UpcomingStopsSection";

// Matches the fake NEXT_PUBLIC_SUPABASE_URL set in vitest.setup.ts. Each
// source gets its own distinct URL so a leaked array/index is detectable
// by which photo actually renders in the dialog, not just dialog presence.
const HOST = "https://test-project.supabase.co/storage/v1/object/public";
const GALLERY_URL = `${HOST}/truck-images/abc/gallery-1.jpg`;
const BOARD_URL = `${HOST}/truck-images/abc/menu-board-1.jpg`;
const ITEM_URL = `${HOST}/truck-images/abc/menu-item-1.jpg`;
const FLYER_URL = `${HOST}/upcoming-stop-images/abc/flyer-1.png`;

/**
 * Renders every photo-bearing section side by side, the way they actually
 * sit on the truck profile page, so a real leak (one viewer accidentally
 * reading another section's array/index) would show up the same way it
 * would in production — not just in each component's own isolated test.
 */
function renderAllSections() {
  const truck = makeTruck({
    name: "Smoky Wheels BBQ",
    gallery_images: [GALLERY_URL],
    menu_images: [BOARD_URL],
    menu_items: [{ id: "item-1", name: "Brisket Plate", price: 16, image: ITEM_URL }],
    upcomingStops: [
      {
        id: "stop-1",
        starts_at: "2026-08-10T00:00:00.000Z",
        ends_at: "2026-08-10T04:00:00.000Z",
        location_text: "Farmers Market",
        status: "scheduled",
        flyer_image: FLYER_URL,
      },
    ],
  });

  render(
    <>
      <UpcomingStopsSection truck={truck} />
      <GallerySection truck={truck} />
      <MenuSection truck={truck} />
    </>
  );
}

function expectOnlyDialogImageToBe(url: string, ...excludedUrls: string[]) {
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  const dialogImg = screen.getByRole("dialog").querySelector("img");
  expect(dialogImg).not.toBeNull();
  expect(dialogImg!.getAttribute("src")).toContain(encodeURIComponent(url));
  for (const excluded of excludedUrls) {
    expect(dialogImg!.getAttribute("src")).not.toContain(encodeURIComponent(excluded));
  }
}

describe("Image-source isolation across viewers", () => {
  it("gallery viewer shows only the gallery photo", () => {
    renderAllSections();
    fireEvent.click(screen.getByRole("button", { name: "Open photo 1 of 1" }));
    expectOnlyDialogImageToBe(GALLERY_URL, BOARD_URL, ITEM_URL, FLYER_URL);
    fireEvent.keyDown(document, { key: "Escape" });
  });

  it("menu board viewer shows only the board photo", () => {
    renderAllSections();
    fireEvent.click(screen.getByRole("button", { name: "Open menu board 1 of 1" }));
    expectOnlyDialogImageToBe(BOARD_URL, GALLERY_URL, ITEM_URL, FLYER_URL);
    fireEvent.keyDown(document, { key: "Escape" });
  });

  it("menu item viewer shows only that item's photo", () => {
    renderAllSections();
    fireEvent.click(screen.getByRole("button", { name: "View photo of Brisket Plate" }));
    expectOnlyDialogImageToBe(ITEM_URL, GALLERY_URL, BOARD_URL, FLYER_URL);
    fireEvent.keyDown(document, { key: "Escape" });
  });

  it("upcoming-stop flyer viewer shows only that stop's flyer", () => {
    renderAllSections();
    fireEvent.click(screen.getByRole("button", { name: "Open event flyer for Farmers Market" }));
    expectOnlyDialogImageToBe(FLYER_URL, GALLERY_URL, BOARD_URL, ITEM_URL);
    fireEvent.keyDown(document, { key: "Escape" });
  });

  it("switching between viewers in sequence never carries over a stale image or count", () => {
    renderAllSections();

    fireEvent.click(screen.getByRole("button", { name: "Open photo 1 of 1" }));
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expectOnlyDialogImageToBe(GALLERY_URL, BOARD_URL, ITEM_URL, FLYER_URL);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open event flyer for Farmers Market" }));
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expectOnlyDialogImageToBe(FLYER_URL, GALLERY_URL, BOARD_URL, ITEM_URL);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open menu board 1 of 1" }));
    expectOnlyDialogImageToBe(BOARD_URL, GALLERY_URL, ITEM_URL, FLYER_URL);
    fireEvent.keyDown(document, { key: "Escape" });
  });
});
