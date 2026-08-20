import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiscoverTrucksCta } from "./DiscoverTrucksCta";

// The bottom-of-profile counterpart to DiscoverTrucksLink — must not be a
// dead end for a visitor who read the whole profile, and must route into
// the same /trucks discovery experience rather than a separate flow.
describe("DiscoverTrucksCta", () => {
  it("shows the discovery pitch and links to the /trucks route", () => {
    render(<DiscoverTrucksCta />);

    expect(screen.getByText("Hungry for something else?")).toBeInTheDocument();
    expect(screen.getByText(/Find food trucks, trailers, carts, and mobile vendors near you\./)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /Find Trucks Near Me/ });
    expect(link).toHaveAttribute("href", "/trucks");
  });
});
