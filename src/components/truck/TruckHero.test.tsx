import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { TruckHero } from "./TruckHero";

// Matches the fake NEXT_PUBLIC_SUPABASE_URL set in vitest.setup.ts.
const HERO_URL = "https://test-project.supabase.co/storage/v1/object/public/truck-images/abc/hero.jpg";
const LOGO_URL = "https://test-project.supabase.co/storage/v1/object/public/truck-images/abc/logo.jpg";

describe("TruckHero clickable hero image", () => {
  it("opens a full-size viewer for the hero photo", () => {
    const truck = makeTruck({ name: "Smoky Wheels BBQ", hero_image: HERO_URL });
    render(<TruckHero truck={truck} />);

    const trigger = screen.getByRole("button", { name: "Open full-size hero image for Smoky Wheels BBQ" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // Portaled to document.body, not trapped inside the hero's own layout.
    expect(dialog.parentElement).toBe(document.body);

    const img = screen.getByAltText("Photo 1 of Smoky Wheels BBQ hero photo");
    expect(img.getAttribute("src")).toContain(encodeURIComponent(HERO_URL));
  });

  it("closes with Escape and returns focus to the hero trigger", () => {
    const truck = makeTruck({ hero_image: HERO_URL });
    render(<TruckHero truck={truck} />);

    const trigger = screen.getByRole("button", { name: /Open full-size hero image/ });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes on backdrop click", () => {
    const truck = makeTruck({ hero_image: HERO_URL });
    render(<TruckHero truck={truck} />);

    fireEvent.click(screen.getByRole("button", { name: /Open full-size hero image/ }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders no button (and no dead click target) when there is no real hero photo", () => {
    const truck = makeTruck({ hero_image: null });
    render(<TruckHero truck={truck} />);

    expect(screen.queryByRole("button", { name: /Open full-size hero image/ })).not.toBeInTheDocument();
    // Still shows the existing decorative fallback, just non-interactive.
    expect(screen.getByLabelText(`${truck.name} hero photo`)).toBeInTheDocument();
  });

  it("stops being clickable once the real hero photo fails to load", () => {
    const truck = makeTruck({ name: "Smoky Wheels BBQ", hero_image: HERO_URL });
    render(<TruckHero truck={truck} />);

    const trigger = screen.getByRole("button", { name: "Open full-size hero image for Smoky Wheels BBQ" });
    const img = trigger.querySelector("img");
    fireEvent(img as HTMLImageElement, new Event("error"));

    expect(screen.queryByRole("button", { name: /Open full-size hero image/ })).not.toBeInTheDocument();
  });
});

describe("TruckHero clickable logo image", () => {
  it("opens a full-size viewer for the logo", () => {
    const truck = makeTruck({ name: "Smoky Wheels BBQ", logo: LOGO_URL });
    render(<TruckHero truck={truck} />);

    const trigger = screen.getByRole("button", { name: "Open full-size logo image for Smoky Wheels BBQ" });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.parentElement).toBe(document.body);

    const img = screen.getByAltText("Photo 1 of Smoky Wheels BBQ logo");
    expect(img.getAttribute("src")).toContain(encodeURIComponent(LOGO_URL));
  });

  it("closes with Escape and returns focus to the logo trigger", () => {
    const truck = makeTruck({ logo: LOGO_URL });
    render(<TruckHero truck={truck} />);

    const trigger = screen.getByRole("button", { name: /Open full-size logo image/ });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("renders no button when there is no real logo image", () => {
    const truck = makeTruck({ logo: null });
    render(<TruckHero truck={truck} />);

    expect(screen.queryByRole("button", { name: /Open full-size logo image/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText(`${truck.name} logo`)).toBeInTheDocument();
  });

  // Image-source isolation: opening the logo must never show the hero
  // photo (or vice versa) — each trigger owns its own single-image array.
  it("keeps the hero and logo viewers isolated from each other", () => {
    const truck = makeTruck({ name: "Smoky Wheels BBQ", hero_image: HERO_URL, logo: LOGO_URL });
    render(<TruckHero truck={truck} />);

    fireEvent.click(screen.getByRole("button", { name: /Open full-size logo image/ }));
    let img = screen.getByRole("dialog").querySelector("img");
    expect(img?.getAttribute("src")).toContain(encodeURIComponent(LOGO_URL));
    expect(img?.getAttribute("src")).not.toContain(encodeURIComponent(HERO_URL));
    fireEvent.keyDown(document, { key: "Escape" });

    fireEvent.click(screen.getByRole("button", { name: /Open full-size hero image/ }));
    img = screen.getByRole("dialog").querySelector("img");
    expect(img?.getAttribute("src")).toContain(encodeURIComponent(HERO_URL));
    expect(img?.getAttribute("src")).not.toContain(encodeURIComponent(LOGO_URL));
  });
});

// Regression coverage for the final product decision: every truck's hero
// uses the same complete-image treatment now — there is no more per-truck
// mode selection (the old hero-display.ts slug map is gone). This must
// hold regardless of slug, so these tests deliberately don't special-case
// any particular truck.
describe("TruckHero universal complete-image treatment", () => {
  it.each([
    ["sonny-boys-backyard", "Sonny Boys Backyard"],
    ["testtruck-7-25", "TestTruck 7/25"],
    ["cupcake-caboose", "Cupcake Caboose"],
  ])("shows the complete, uncropped image over a blurred backdrop for %s", (slug, name) => {
    const truck = makeTruck({ slug, name, hero_image: HERO_URL });
    render(<TruckHero truck={truck} />);

    // The real, accessible hero image is shown in full — object-contain,
    // nothing cropped away.
    const sharp = screen.getByAltText(`${name} hero photo`) as HTMLImageElement;
    expect(sharp.className).toContain("object-contain");

    // A second, purely decorative copy fills the rest of the band —
    // blurred/darkened, enlarged, hidden from assistive tech, and not the
    // thing a screen reader announces as "the hero photo".
    const images = document.querySelectorAll("img");
    expect(images).toHaveLength(2);
    const backdrop = Array.from(images).find((el) => el !== sharp) as HTMLImageElement;
    expect(backdrop.alt).toBe("");
    expect(backdrop.closest('[aria-hidden="true"]')).not.toBeNull();
    // The blur/darken/scale treatment lands on PlaceholderImage's own
    // wrapping div (a CSS filter there affects everything painted inside
    // it, including the <img>), not on the <img> element's own class list.
    expect(backdrop.parentElement?.className).toContain("blur-2xl");
    expect(backdrop.parentElement?.className).toContain("scale-110");
    expect(backdrop.className).toContain("object-cover");
  });

  it("still opens the same full-size lightbox image (the sharp, uncropped copy)", () => {
    const truck = makeTruck({ slug: "el-taco-rico", name: "El Taco Rico", hero_image: HERO_URL });
    render(<TruckHero truck={truck} />);

    fireEvent.click(screen.getByRole("button", { name: "Open full-size hero image for El Taco Rico" }));

    const dialog = screen.getByRole("dialog");
    const img = dialog.querySelector("img");
    expect(img?.getAttribute("src")).toContain(encodeURIComponent(HERO_URL));
  });

  it("uses one consistent responsive height class regardless of truck", () => {
    const a = makeTruck({ slug: "sonny-boys-backyard", hero_image: HERO_URL });
    const b = makeTruck({ slug: "testtruck-7-25", hero_image: HERO_URL });

    const { container: containerA } = render(<TruckHero truck={a} />);
    const { container: containerB } = render(<TruckHero truck={b} />);

    // Identify the height-bearing band by its other, unique markers (h-60
    // + overflow-hidden together only ever appear on that one div) rather
    // than DOM position, which a wrapper div would make ambiguous.
    const heightClassOf = (container: HTMLElement) =>
      Array.from(container.querySelectorAll("div"))
        .find((el) => el.className.includes("h-60") && el.className.includes("overflow-hidden"))
        ?.className;

    expect(heightClassOf(containerA)).toBe(heightClassOf(containerB));
    expect(heightClassOf(containerA)).toContain("lg:h-[28rem]");
  });
});
