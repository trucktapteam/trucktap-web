import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { TruckQrPoster } from "./TruckQrPoster";

describe("TruckQrPoster", () => {
  it("desktop/sidebar rendering: hidden on mobile, visible at the lg sticky-sidebar breakpoint", () => {
    render(<TruckQrPoster truck={makeTruck({ name: "Smoky Wheels BBQ" })} variant="sidebar" />);

    const wrapper = screen.getByTestId("qr-poster-sidebar");
    expect(wrapper.className).toContain("hidden");
    expect(wrapper.className).toContain("lg:block");
  });

  it("mobile-flow rendering: visible in normal page flow, hidden once the lg sidebar takes over", () => {
    render(<TruckQrPoster truck={makeTruck({ name: "Smoky Wheels BBQ" })} variant="mobile" />);

    const wrapper = screen.getByTestId("qr-poster-mobile");
    expect(wrapper.className).toContain("lg:hidden");
    expect(wrapper.className).not.toContain("hidden lg:block");
  });

  it("missing-image fallback: still renders name and QR when hero/logo are absent", () => {
    const truck = makeTruck({ name: "Smoky Wheels BBQ", hero_image: null, logo: null });
    render(<TruckQrPoster truck={truck} variant="mobile" />);

    expect(screen.getByText("Smoky Wheels BBQ")).toBeInTheDocument();
    expect(screen.getByText("SCAN TO CONNECT")).toBeInTheDocument();
    // A real QR <svg> still renders — a missing hero/logo never blocks it.
    expect(document.querySelector("svg")).not.toBeNull();
    // Hero + logo both degrade to the decorative gradient placeholder
    // (role="img") instead of a broken image or a crash.
    expect(screen.getByLabelText("Smoky Wheels BBQ hero photo")).toBeInTheDocument();
    expect(screen.getByLabelText("Smoky Wheels BBQ logo")).toBeInTheDocument();
  });

  it("opens the full-size preview when clicked, and returns focus to the poster on close", () => {
    const truck = makeTruck({ name: "Smoky Wheels BBQ" });
    render(<TruckQrPoster truck={truck} variant="mobile" />);

    const trigger = screen.getByRole("button", { name: "View full-size QR poster for Smoky Wheels BBQ" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "QR poster for Smoky Wheels BBQ");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  // Regression test: the sidebar variant's trigger lives inside a
  // <Reveal> mount wrapper, whose translate-y-* utility sets the CSS
  // `translate` property and creates a containing block for `position:
  // fixed` descendants (CSS Transforms Level 2) — trapping an in-place
  // preview modal inside the sidebar's own box instead of the viewport.
  // Portaling to document.body fixes it regardless of which variant
  // triggered it.
  it("renders the poster preview as a direct child of document.body (portal)", () => {
    const truck = makeTruck({ name: "Smoky Wheels BBQ" });
    render(<TruckQrPoster truck={truck} variant="mobile" />);
    fireEvent.click(screen.getByRole("button", { name: "View full-size QR poster for Smoky Wheels BBQ" }));

    expect(screen.getByRole("dialog").parentElement).toBe(document.body);
  });

  // Regression coverage for a release-blocking freeze investigation: the
  // modal's keydown listener and body scroll-lock must stay perfectly
  // balanced no matter how many times it's opened and closed.
  it("keeps document listeners and body scroll-lock balanced across 12 open/close cycles", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const truck = makeTruck({ name: "Smoky Wheels BBQ" });
    render(<TruckQrPoster truck={truck} variant="mobile" />);

    for (let i = 0; i < 12; i++) {
      fireEvent.click(screen.getByRole("button", { name: "View full-size QR poster for Smoky Wheels BBQ" }));
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
    const truck = makeTruck({ name: "Smoky Wheels BBQ" });
    const { rerender } = render(<TruckQrPoster truck={truck} variant="mobile" />);

    fireEvent.click(screen.getByRole("button", { name: "View full-size QR poster for Smoky Wheels BBQ" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    rerender(<TruckQrPoster truck={{ ...truck }} variant="mobile" />);
    rerender(<TruckQrPoster truck={{ ...truck }} variant="mobile" />);

    expect(addSpy.mock.calls.filter((c) => c[0] === "keydown")).toHaveLength(0);
    expect(removeSpy.mock.calls.filter((c) => c[0] === "keydown")).toHaveLength(0);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
