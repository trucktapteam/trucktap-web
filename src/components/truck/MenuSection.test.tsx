import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { MenuSection } from "./MenuSection";

describe("MenuSection board + structured items", () => {
  it("shows the menu board above structured items when both exist", () => {
    const truck = makeTruck({
      menu_images: ["board-1"],
      menu_items: [{ id: "i1", name: "Brisket Plate", price: 16, category: "Plates" }],
    });
    render(<MenuSection truck={truck} />);

    const board = screen.getByLabelText("Menu board 1");
    const itemName = screen.getByText("Brisket Plate");
    // DOCUMENT_POSITION_FOLLOWING means `itemName` comes after `board` in
    // the DOM — i.e. the board is rendered first.
    expect(board.compareDocumentPosition(itemName) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders only the board when there are no structured items", () => {
    const truck = makeTruck({ menu_images: ["board-1", "board-2"] });
    render(<MenuSection truck={truck} />);

    expect(screen.getByLabelText("Menu board 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Menu board 2")).toBeInTheDocument();
    // No structured-item rows (e.g. a price element) present.
    expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument();
  });

  it("renders structured items normally when there is no menu board", () => {
    const truck = makeTruck({
      menu_items: [{ id: "i1", name: "Brisket Plate", price: 16, category: "Plates" }],
    });
    render(<MenuSection truck={truck} />);

    expect(screen.getByText("Brisket Plate")).toBeInTheDocument();
    expect(screen.getByText("$16.00")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Open menu board/ })).not.toBeInTheDocument();
  });

  it("never renders an empty Menu section", () => {
    const { container } = render(<MenuSection truck={makeTruck()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("opens the shared lightbox from a menu board photo and supports navigation", () => {
    const truck = makeTruck({ menu_images: ["board-1", "board-2"] });
    render(<MenuSection truck={truck} />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu board 1 of 2" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // Regression test: same page-flow-trapping bug as GallerySection (see
  // its test for the full explanation) — a <Reveal> ancestor's
  // translate-y-* utility creates a containing block for `position:
  // fixed`. Portaling to document.body fixes it for every lightbox
  // instance, board photos included.
  it("renders the board-photo lightbox as a direct child of document.body (portal)", () => {
    const truck = makeTruck({ menu_images: ["board-1"] });
    render(<MenuSection truck={truck} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu board 1 of 1" }));

    expect(screen.getByRole("dialog").parentElement).toBe(document.body);
  });

  it("returns focus to the originating board thumbnail on close", () => {
    const truck = makeTruck({ menu_images: ["board-1"] });
    render(<MenuSection truck={truck} />);

    const trigger = screen.getByRole("button", { name: "Open menu board 1 of 1" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveFocus();
  });
});
