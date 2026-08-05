import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { StatusBar } from "./StatusBar";

const NOW = new Date("2026-08-04T12:00:00.000Z");

afterEach(() => {
  vi.useRealTimers();
});

describe("StatusBar freshness text", () => {
  // Regression test: el-taco-rico (and any other truck with a real
  // last_live_updated_at) must show the actual "Last live ..." text, not
  // the neutral fallback.
  it("shows the real last-live time when last_live_updated_at is set", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    const truck = makeTruck({
      is_open: false,
      last_live_updated_at: "2026-08-04T09:00:00.000Z", // 3 hours before NOW
    });
    render(<StatusBar truck={truck} />);

    expect(screen.getByText("Not live right now")).toBeInTheDocument();
    expect(screen.getByText("Last live 3 hours ago")).toBeInTheDocument();
  });

  // Regression test: this is the el-taco-rico bug. `last_live_updated_at`
  // is null at the source (confirmed against the production row and the
  // truck_live_events audit log, which isn't reachable from the public
  // anon-key client) — the page must not claim the truck "hasn't shared a
  // live status yet," since that's a specific, false claim the app has no
  // basis for. It must use the neutral fallback instead.
  it("falls back to a neutral message (not a false 'never live' claim) when there is no last-live timestamp", () => {
    const truck = makeTruck({ is_open: false, last_live_updated_at: null });
    render(<StatusBar truck={truck} />);

    expect(screen.getByText("Not live right now")).toBeInTheDocument();
    expect(screen.getByText("LIVE status not recently updated.")).toBeInTheDocument();
    expect(screen.queryByText(/hasn't shared a live status/)).not.toBeInTheDocument();
    expect(screen.queryByText(/never/i)).not.toBeInTheDocument();
  });

  it("appends the upcoming-stops hint to the neutral fallback when the truck has upcoming stops", () => {
    const truck = makeTruck({
      is_open: false,
      last_live_updated_at: null,
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
    render(<StatusBar truck={truck} />);

    expect(
      screen.getByText("LIVE status not recently updated — check their upcoming stops below.")
    ).toBeInTheDocument();
  });

  it("shows 'Live now' and the went-live freshness text when currently live", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    const truck = makeTruck({
      is_open: true,
      live_started_at: "2026-08-04T11:30:00.000Z", // 30 minutes before NOW
      live_expires_at: "2026-08-04T18:00:00.000Z", // still in the future
    });
    render(<StatusBar truck={truck} />);

    expect(screen.getByText("Live now")).toBeInTheDocument();
    expect(screen.getByText("Went live 30 minutes ago")).toBeInTheDocument();
  });
});

describe("StatusBar location wording", () => {
  // Regression test: production data shows `locations` (the source of
  // `truck.currentLocation`) gets upserted to wherever a truck last went
  // LIVE — it can be a different city than `service_area` for the same
  // truck (confirmed: El Taco Rico's service_area says "Morton, IL" while
  // its locations row says "Tremont, IL"). "Usually serving"/"View usual
  // location" both claimed a stability the data doesn't have.
  it("labels the owner-entered service area as 'Based near', not 'Usually serving', and reduces it to city/state", () => {
    const truck = makeTruck({ is_open: false, service_area: "1850, Ring Road, Elizabethtown, Kentucky" });
    render(<StatusBar truck={truck} />);

    // Never the raw street address — see location.test.ts for the formatter's own coverage.
    expect(screen.getByText("Based near: Elizabethtown, KY")).toBeInTheDocument();
    expect(screen.queryByText(/Ring Road/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Usually serving/)).not.toBeInTheDocument();
  });

  it("omits the Based near line entirely when service_area can't be safely reduced to city/state", () => {
    const truck = makeTruck({ is_open: false, service_area: "PO Box 42" });
    render(<StatusBar truck={truck} />);

    expect(screen.queryByText(/Based near/)).not.toBeInTheDocument();
  });

  it("shows the exact current location and 'Get Directions' while actually LIVE", () => {
    const truck = makeTruck({
      is_open: true,
      live_started_at: "2026-08-04T11:30:00.000Z",
      live_expires_at: "2099-01-01T00:00:00.000Z",
      currentLocation: { label: "Farmers Market", latitude: 1, longitude: 2 },
    });
    render(<StatusBar truck={truck} />);

    expect(screen.getByText("Farmers Market")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get Directions" })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=1,2"
    );
  });

  // Privacy follow-up: currentLocation is a last-known "went LIVE from
  // here" coordinate, which offline can be a commissary, home base, or
  // test address rather than anywhere the owner intends to publicize right
  // now. Once the truck is offline, none of that — label, link, or the
  // raw lat/long — may reach the page in any form.
  it("exposes no last-known-location text, link, or coordinates once the truck is offline", () => {
    const truck = makeTruck({
      is_open: false,
      currentLocation: { label: "1251, Ring Road, Elizabethtown, Kentucky", latitude: 37.7228032, longitude: -85.8952234 },
    });
    const { container } = render(<StatusBar truck={truck} />);

    expect(screen.queryByText(/Ring Road/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /last known location/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Get Directions" })).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("37.7228032");
    expect(container.innerHTML).not.toContain("-85.8952234");
  });

  it("still shows the sanitized 'Based near' city/state when the truck is offline with a stored currentLocation", () => {
    const truck = makeTruck({
      is_open: false,
      service_area: "1850, Ring Road, Elizabethtown, Kentucky",
      currentLocation: { label: "1251, Ring Road, Elizabethtown, Kentucky", latitude: 37.7228032, longitude: -85.8952234 },
    });
    render(<StatusBar truck={truck} />);

    expect(screen.getByText("Based near: Elizabethtown, KY")).toBeInTheDocument();
  });

  it("falls back to Call when offline and there is no safe location CTA", () => {
    const truck = makeTruck({
      is_open: false,
      currentLocation: { label: "Home base", latitude: 1, longitude: 2 },
      phone: "555-123-4567",
      website: "https://example.com",
    });
    render(<StatusBar truck={truck} />);

    expect(screen.getByRole("link", { name: "Call Test Truck" })).toHaveAttribute("href", "tel:555-123-4567");
    expect(screen.queryByRole("link", { name: "Visit Website" })).not.toBeInTheDocument();
  });

  it("falls back to Website when offline, there is no safe location CTA, and no phone", () => {
    const truck = makeTruck({
      is_open: false,
      currentLocation: { label: "Home base", latitude: 1, longitude: 2 },
      phone: null,
      website: "https://example.com",
    });
    render(<StatusBar truck={truck} />);

    expect(screen.getByRole("link", { name: "Visit Website" })).toHaveAttribute("href", "https://example.com");
  });

  it("renders no primary-action button shell when offline with no location, phone, or website", () => {
    const truck = makeTruck({
      is_open: false,
      currentLocation: { label: "Home base", latitude: 1, longitude: 2 },
      phone: null,
      website: null,
    });
    render(<StatusBar truck={truck} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
