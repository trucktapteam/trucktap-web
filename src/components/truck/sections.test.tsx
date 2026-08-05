import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { MenuSection } from "./MenuSection";
import { UpcomingStopsSection } from "./UpcomingStopsSection";
import { GallerySection } from "./GallerySection";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { AboutSection } from "./AboutSection";
import { ReviewsSection } from "./ReviewsSection";
import { TrustFooter } from "./TrustFooter";

const NOW = new Date("2026-08-02T12:00:00.000Z");

/**
 * These tests protect the "never render an empty/placeholder section"
 * rules for the truck profile page: every optional section must render
 * only when there's real data, and hide itself (return null) rather than
 * show a blank heading or empty card shell.
 */

describe("MenuSection", () => {
  it("renders nothing when there are no items and no board photos", () => {
    const { container } = render(<MenuSection truck={makeTruck()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders menu items when present", () => {
    const truck = makeTruck({
      menu_items: [{ id: "i1", name: "Brisket Plate", price: 16, category: "Plates" }],
    });
    render(<MenuSection truck={truck} />);
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByText("Brisket Plate")).toBeInTheDocument();
  });

  it("renders board photos when there are no items but photos exist", () => {
    const truck = makeTruck({ menu_images: ["menu-board-1"] });
    render(<MenuSection truck={truck} />);
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByLabelText("Menu board 1")).toBeInTheDocument();
  });
});

describe("UpcomingStopsSection", () => {
  it("renders nothing when there are no upcoming stops", () => {
    const { container } = render(<UpcomingStopsSection truck={makeTruck()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the only stop has already ended", () => {
    const truck = makeTruck({
      upcomingStops: [
        {
          id: "s1",
          starts_at: "2026-07-30T00:00:00.000Z",
          ends_at: "2026-07-30T04:00:00.000Z",
          location_text: "Old spot",
          status: "scheduled",
        },
      ],
    });
    const { container } = render(<UpcomingStopsSection truck={truck} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a future stop", () => {
    const truck = makeTruck({
      upcomingStops: [
        {
          id: "s1",
          starts_at: "2026-08-10T00:00:00.000Z",
          ends_at: "2026-08-10T04:00:00.000Z",
          location_text: "Farmers Market",
          status: "scheduled",
        },
      ],
    });
    render(<UpcomingStopsSection truck={truck} />);
    expect(screen.getByText("Upcoming Stops")).toBeInTheDocument();
    expect(screen.getByText("Farmers Market")).toBeInTheDocument();
  });

  function makeFutureStops(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `s${i}`,
      starts_at: `2026-08-${String(10 + i).padStart(2, "0")}T00:00:00.000Z`,
      ends_at: `2026-08-${String(10 + i).padStart(2, "0")}T04:00:00.000Z`,
      location_text: `Stop ${i}`,
      status: "scheduled" as const,
    }));
  }

  it("does not show a toggle when there are 5 or fewer stops", () => {
    const truck = makeTruck({ upcomingStops: makeFutureStops(5) });
    render(<UpcomingStopsSection truck={truck} />);
    expect(screen.getAllByText(/Stop \d/)).toHaveLength(5);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows only the first 5 stops with a working 'Show all' / 'Show fewer' toggle when there are more", () => {
    const truck = makeTruck({ upcomingStops: makeFutureStops(8) });
    render(<UpcomingStopsSection truck={truck} />);

    expect(screen.getAllByText(/Stop \d/)).toHaveLength(5);
    const toggle = screen.getByRole("button", { name: "Show all 8 upcoming stops" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(screen.getAllByText(/Stop \d/)).toHaveLength(8);
    expect(screen.getByRole("button", { name: "Show fewer" })).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "Show fewer" }));
    expect(screen.getAllByText(/Stop \d/)).toHaveLength(5);
  });
});

describe("GallerySection", () => {
  it("renders nothing when there are no gallery images", () => {
    const { container } = render(<GallerySection truck={makeTruck()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders photos when present", () => {
    render(<GallerySection truck={makeTruck({ gallery_images: ["photo-1"] })} />);
    expect(screen.getByText("Photos")).toBeInTheDocument();
    expect(screen.getByLabelText("Photo 1")).toBeInTheDocument();
  });
});

describe("AnnouncementBanner", () => {
  it("renders nothing when there are no announcements", () => {
    const { container } = render(<AnnouncementBanner truck={makeTruck()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the only announcement has expired", () => {
    const truck = makeTruck({
      announcements: [
        {
          id: "a1",
          message: "expired notice",
          timestamp: NOW.toISOString(),
          expires_at: "2026-08-01T00:00:00.000Z",
        },
      ],
    });
    const { container } = render(<AnnouncementBanner truck={truck} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an active announcement", () => {
    const truck = makeTruck({
      announcements: [
        {
          id: "a1",
          message: "Running low on brisket today",
          timestamp: NOW.toISOString(),
          // Explicit and clearly future-dated (rather than relying on the
          // 7-day-from-timestamp fallback plus the real wall clock still
          // being within that window) — this component reads `Date.now()`
          // internally with no way to inject `now` in a test, so pinning
          // expires_at keeps this test from going stale on its own.
          expires_at: "2099-01-01T00:00:00.000Z",
        },
      ],
    });
    render(<AnnouncementBanner truck={truck} />);
    expect(screen.getByText("Running low on brisket today")).toBeInTheDocument();
  });

  // Regression test for the real Güero's Salsa and More bug: a legacy
  // announcement with no expires_at must not render forever — it falls
  // back to 7 days after `timestamp`, same as the Expo app.
  it("renders nothing when the only announcement has no expires_at and its 7-day fallback window has long passed", () => {
    const truck = makeTruck({
      announcements: [{ id: "a1", message: "grand opening soon!", timestamp: "2020-01-01T00:00:00.000Z" }],
    });
    const { container } = render(<AnnouncementBanner truck={truck} />);
    expect(container).toBeEmptyDOMElement();
  });

  // mapAnnouncements (truck-data.ts) already drops empty-message entries
  // before they ever reach this component — this just confirms the
  // banner itself never renders a message-less item, as a second layer.
  it("never renders an announcement with no message text", () => {
    const truck = makeTruck({
      announcements: [{ id: "a1", message: "", timestamp: "2099-01-01T00:00:00.000Z" }],
    });
    const { container } = render(<AnnouncementBanner truck={truck} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("AboutSection", () => {
  it("renders nothing when there is no bio and no description", () => {
    const { container } = render(<AboutSection truck={makeTruck()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the bio when present", () => {
    render(<AboutSection truck={makeTruck({ bio: "Slow-smoked BBQ." })} />);
    expect(screen.getByText("Slow-smoked BBQ.")).toBeInTheDocument();
  });

  it("falls back to description when there is no bio", () => {
    render(<AboutSection truck={makeTruck({ bio: null, description: "Fusion tacos." })} />);
    expect(screen.getByText("Fusion tacos.")).toBeInTheDocument();
  });
});

describe("ReviewsSection", () => {
  it("shows one intentional empty-state message, never a blank list shell", () => {
    const { container } = render(<ReviewsSection truck={makeTruck()} />);
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText(/No reviews yet/)).toBeInTheDocument();
    expect(container.querySelector("ul")).toBeNull();
  });

  it("renders reviews when present", () => {
    const truck = makeTruck({
      reviews: [
        {
          id: "r1",
          rating: 5,
          text: "Great food.",
          created_at: NOW.toISOString(),
          reviewer_display_name: "Alex P.",
        },
      ],
    });
    render(<ReviewsSection truck={truck} />);
    expect(screen.getByText("Great food.")).toBeInTheDocument();
  });

  it("does not render an owner-reply block when there is no reply", () => {
    const truck = makeTruck({
      reviews: [
        {
          id: "r1",
          rating: 5,
          text: "Great food.",
          created_at: NOW.toISOString(),
          reviewer_display_name: "Alex P.",
        },
      ],
    });
    render(<ReviewsSection truck={truck} />);
    expect(screen.queryByText(/Reply from/)).toBeNull();
  });

  it("renders the owner-reply block when a reply is present", () => {
    const truck = makeTruck({
      name: "Smoky Wheels BBQ",
      reviews: [
        {
          id: "r1",
          rating: 5,
          text: "Great food.",
          created_at: NOW.toISOString(),
          reviewer_display_name: "Alex P.",
          owner_reply: { body: "Thanks Alex!", created_at: NOW.toISOString() },
        },
      ],
    });
    render(<ReviewsSection truck={truck} />);
    expect(screen.getByText("Reply from Smoky Wheels BBQ")).toBeInTheDocument();
    expect(screen.getByText("Thanks Alex!")).toBeInTheDocument();
  });
});

describe("TrustFooter", () => {
  it("hides the badge cluster when there are no trust badges", () => {
    render(<TrustFooter truck={makeTruck()} />);
    expect(screen.queryByText("Veteran-Owned")).toBeNull();
    expect(screen.queryByText("Family-Owned")).toBeNull();
    expect(screen.getByText(/Profile last updated/)).toBeInTheDocument();
  });

  it("renders trust badges when present", () => {
    render(<TrustFooter truck={makeTruck({ trust_badges: ["veteran_owned", "family_owned"] })} />);
    expect(screen.getByText("Veteran-Owned")).toBeInTheDocument();
    expect(screen.getByText("Family-Owned")).toBeInTheDocument();
  });
});
