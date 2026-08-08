import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeDirectoryTruckCard } from "@/lib/test-fixtures";
import { TruckListingCard } from "./TruckListingCard";

describe("TruckListingCard", () => {
  it("links to the canonical /truck/<slug> route, never the legacy UUID form", () => {
    const truck = makeDirectoryTruckCard({ id: "3f3fd00d-5dcf-4607-a9f2-c7565f60cc9f", slug: "cupcake-caboose" });
    render(<TruckListingCard truck={truck} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/truck/cupcake-caboose");
  });

  it("shows a Live now badge and based-near text for a live truck", () => {
    const truck = makeDirectoryTruckCard({ tier: "live", basedNear: "Louisville, KY" });
    render(<TruckListingCard truck={truck} />);

    expect(screen.getByText("Live now")).toBeInTheDocument();
    expect(screen.getByText("near Louisville, KY")).toBeInTheDocument();
  });

  it("shows the next stop's date and location for an upcoming truck", () => {
    const truck = makeDirectoryTruckCard({
      tier: "upcoming",
      nextStop: { startsAt: "2026-08-10T00:00:00.000Z", whenLabel: "Mon, Aug 10", locationText: "Farmers Market" },
    });
    render(<TruckListingCard truck={truck} />);

    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("Mon, Aug 10 · Farmers Market")).toBeInTheDocument();
  });

  it("shows 'Not live right now' for an ordinary truck, never implying it's as active as a live one", () => {
    const truck = makeDirectoryTruckCard({ tier: "ordinary" });
    render(<TruckListingCard truck={truck} />);

    expect(screen.getByText("Not live right now")).toBeInTheDocument();
    expect(screen.queryByText("Live now")).not.toBeInTheDocument();
  });

  it("appends the last-live freshness label for an ordinary truck when one exists", () => {
    const truck = makeDirectoryTruckCard({ tier: "ordinary", freshnessLabel: "Last live 3 days ago" });
    render(<TruckListingCard truck={truck} />);

    expect(screen.getByText("Not live right now · Last live 3 days ago")).toBeInTheDocument();
  });

  it("shows a Partner badge only when the truck is verified", () => {
    const { rerender } = render(<TruckListingCard truck={makeDirectoryTruckCard({ is_verified: false })} />);
    expect(screen.queryByText("Partner")).not.toBeInTheDocument();

    rerender(<TruckListingCard truck={makeDirectoryTruckCard({ is_verified: true })} />);
    expect(screen.getByText("Partner")).toBeInTheDocument();
  });

  it("shows the cuisine type when present, and omits it when absent", () => {
    const { rerender } = render(<TruckListingCard truck={makeDirectoryTruckCard({ cuisine_type: "BBQ" })} />);
    expect(screen.getByText("BBQ")).toBeInTheDocument();

    rerender(<TruckListingCard truck={makeDirectoryTruckCard({ cuisine_type: null })} />);
    expect(screen.queryByText("BBQ")).not.toBeInTheDocument();
  });
});
