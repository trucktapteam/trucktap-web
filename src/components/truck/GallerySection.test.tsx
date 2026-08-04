import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { GallerySection } from "./GallerySection";

function renderGallery(photoCount: number) {
  const truck = makeTruck({
    name: "Smoky Wheels BBQ",
    gallery_images: Array.from({ length: photoCount }, (_, i) => `photo-${i + 1}`),
  });
  return render(<GallerySection truck={truck} />);
}

describe("GallerySection lightbox", () => {
  it("opens a full-size dialog from a gallery image", () => {
    renderGallery(3);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open photo 1 of 3" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-label", expect.stringContaining("Photo 1 of 3"));
  });

  it("closes with Escape", () => {
    renderGallery(3);
    fireEvent.click(screen.getByRole("button", { name: "Open photo 1 of 3" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigates with the Previous/Next buttons and the Left/Right arrow keys", () => {
    renderGallery(3);
    fireEvent.click(screen.getByRole("button", { name: "Open photo 1 of 3" }));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("hides Previous/Next controls when there is only one photo", () => {
    renderGallery(1);
    fireEvent.click(screen.getByRole("button", { name: "Open photo 1 of 1" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous photo" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();

    // Arrow keys are still safe no-ops with a single photo.
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });

  it("returns focus to the originating thumbnail on close", () => {
    renderGallery(3);
    const trigger = screen.getByRole("button", { name: "Open photo 2 of 3" });

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close photo viewer" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  // Regression coverage for a release-blocking freeze investigation: the
  // modal's keydown listener and body scroll-lock must stay perfectly
  // balanced no matter how many times it's opened and closed.
  it("keeps document listeners and body scroll-lock balanced across 12 open/close cycles", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    renderGallery(3);

    for (let i = 0; i < 12; i++) {
      fireEvent.click(screen.getByRole("button", { name: "Open photo 1 of 3" }));
      fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
      fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
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

  // The actual fix: onClose passed to GalleryLightbox must be a stable
  // reference (useCallback), not a fresh closure every render — otherwise
  // an unrelated re-render of GallerySection while the modal is open tears
  // down and rebuilds the dialog's keydown listener for no reason. Forces
  // a real re-render here (new `truck` object, same content) while the
  // modal is open and asserts the listener is NOT touched by it.
  it("does not rebuild the modal's keydown listener when the parent re-renders for an unrelated reason", () => {
    const truck = makeTruck({ name: "Smoky Wheels BBQ", gallery_images: ["photo-1", "photo-2"] });
    const { rerender } = render(<GallerySection truck={truck} />);

    fireEvent.click(screen.getByRole("button", { name: "Open photo 1 of 2" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    // Same data, new object identity — a realistic "parent re-rendered for
    // an unrelated reason" case, e.g. a fresh server response.
    rerender(<GallerySection truck={{ ...truck }} />);
    rerender(<GallerySection truck={{ ...truck }} />);
    rerender(<GallerySection truck={{ ...truck }} />);

    expect(addSpy.mock.calls.filter((c) => c[0] === "keydown")).toHaveLength(0);
    expect(removeSpy.mock.calls.filter((c) => c[0] === "keydown")).toHaveLength(0);

    // The dialog is still fully functional after those re-renders.
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
