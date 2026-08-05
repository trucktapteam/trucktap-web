import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import type { UpcomingStop } from "@/lib/types";
import * as formatModule from "@/lib/format";
import { UpcomingStopsSection } from "./UpcomingStopsSection";

// Matches the fake NEXT_PUBLIC_SUPABASE_URL set in vitest.setup.ts.
const FLYER_A = "https://test-project.supabase.co/storage/v1/object/public/upcoming-stop-images/abc/flyer-a.png";
const FLYER_B = "https://test-project.supabase.co/storage/v1/object/public/upcoming-stop-images/abc/flyer-b.png";

function makeStop(overrides: Partial<UpcomingStop> = {}): UpcomingStop {
  return {
    id: "s1",
    starts_at: "2026-08-10T00:00:00.000Z",
    ends_at: "2026-08-10T04:00:00.000Z",
    location_text: "Farmers Market",
    status: "scheduled",
    ...overrides,
  };
}

describe("UpcomingStopsSection flyer viewer", () => {
  // Regression test: the flyer thumbnail previously rendered as inert
  // PlaceholderImage markup with no button/onClick at all — clicking it
  // did nothing. It must now open a working full-size viewer.
  it("opens a full-size dialog from a stop's flyer image", () => {
    const truck = makeTruck({ upcomingStops: [makeStop({ flyer_image: FLYER_A })] });
    render(<UpcomingStopsSection truck={truck} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open event flyer for Farmers Market" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    // Single-image viewer: no prev/next controls.
    expect(screen.queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();
  });

  // Regression test: same page-flow-trapping bug as GallerySection (see
  // its test for the full explanation) — a <Reveal> ancestor's
  // translate-y-* utility creates a containing block for `position:
  // fixed`. Portaling to document.body fixes it for flyers too.
  it("renders the flyer lightbox as a direct child of document.body (portal)", () => {
    const truck = makeTruck({ upcomingStops: [makeStop({ flyer_image: FLYER_A })] });
    render(<UpcomingStopsSection truck={truck} />);
    fireEvent.click(screen.getByRole("button", { name: "Open event flyer for Farmers Market" }));

    expect(screen.getByRole("dialog").parentElement).toBe(document.body);
  });

  it("closes with Escape and returns focus to the flyer thumbnail", () => {
    const truck = makeTruck({ upcomingStops: [makeStop({ flyer_image: FLYER_A })] });
    render(<UpcomingStopsSection truck={truck} />);

    const trigger = screen.getByRole("button", { name: "Open event flyer for Farmers Market" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("shows the date chip (not a button) for a stop with no flyer", () => {
    const truck = makeTruck({ upcomingStops: [makeStop({ flyer_image: undefined })] });
    render(<UpcomingStopsSection truck={truck} />);

    expect(screen.queryByRole("button", { name: /Open event flyer/ })).not.toBeInTheDocument();
  });

  // Image-source isolation: each stop's viewer must show only its own
  // flyer, never a different stop's (or another section's) photo array.
  it("keeps each stop's flyer viewer isolated from other stops", () => {
    const truck = makeTruck({
      upcomingStops: [
        makeStop({ id: "s1", location_text: "Farmers Market", flyer_image: FLYER_A }),
        makeStop({ id: "s2", location_text: "Harbor Freight", flyer_image: FLYER_B }),
      ],
    });
    render(<UpcomingStopsSection truck={truck} />);

    fireEvent.click(screen.getByRole("button", { name: "Open event flyer for Farmers Market" }));
    let img = screen.getByAltText("Photo 1 of Test Truck");
    expect(img.getAttribute("src")).toContain(encodeURIComponent(FLYER_A));
    expect(img.getAttribute("src")).not.toContain(encodeURIComponent(FLYER_B));

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open event flyer for Harbor Freight" }));
    img = screen.getByAltText("Photo 1 of Test Truck");
    expect(img.getAttribute("src")).toContain(encodeURIComponent(FLYER_B));
    expect(img.getAttribute("src")).not.toContain(encodeURIComponent(FLYER_A));
  });
});

describe("UpcomingStopsSection stop-time hydration safety", () => {
  // Regression test for a real production hydration bug (React error
  // #418): this is a Client Component, so Next renders it once on the
  // server and again in the browser during hydration. Formatting the stop
  // time with the runtime's ambient time zone made those two renders
  // disagree whenever the server's zone (Vercel: UTC) differed from the
  // visitor's browser zone — confirmed live: production served "3:00 PM"
  // but hydrated to "11:00 AM" for the same instant. The fix is
  // useSyncExternalStore's server/client snapshot split: force UTC
  // (deterministic, matches the server) for the actual SSR pass, then
  // upgrade to the ambient zone once mounted on the client.
  //
  // useSyncExternalStore's getServerSnapshot only runs under genuine SSR
  // (renderToString/hydrateRoot) — a plain client render() never calls
  // it, so RTL alone can't observe the pre-mount pass. This exercises the
  // real server API directly instead: renderToString must produce the
  // UTC text, and RTL's (client-only) render must produce the ambient-zone
  // text — the same two values a real hydration diffs against each other.
  it("SSRs the stop time in UTC and client-renders it in the ambient zone (the hydration-safe split)", async () => {
    const { renderToString } = await import("react-dom/server");
    const truck = makeTruck({ upcomingStops: [makeStop({ starts_at: "2026-08-05T15:00:00.000Z" })] });

    const ssrHtml = renderToString(<UpcomingStopsSection truck={truck} />);
    expect(ssrHtml).toContain(formatModule.formatDateTime("2026-08-05T15:00:00.000Z", "UTC"));

    render(<UpcomingStopsSection truck={truck} />);
    expect(screen.getByText(formatModule.formatDateTime("2026-08-05T15:00:00.000Z"))).toBeInTheDocument();
  });
});
