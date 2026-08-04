import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { QuickActions } from "./QuickActions";

describe("QuickActions", () => {
  it("shows Call when a phone number exists", () => {
    render(<QuickActions truck={makeTruck({ phone: "(555) 123-4567" })} />);
    expect(screen.getByRole("link", { name: /Call/ })).toHaveAttribute("href", "tel:(555) 123-4567");
  });

  it("always renders Share, even with no phone", () => {
    render(<QuickActions truck={makeTruck()} />);
    expect(screen.getByRole("button", { name: /Share/ })).toBeInTheDocument();
  });

  // Website/Facebook/Instagram/TikTok moved to the dedicated ConnectLinks
  // group — they must not also appear here, or the sidebar would show the
  // same links twice.
  it("does not duplicate website or social links — those live in ConnectLinks now", () => {
    const truck = makeTruck({
      website: "https://example.com",
      facebook_url: "https://facebook.com/example",
      instagram_url: "https://instagram.com/example",
      tiktok_url: "https://www.tiktok.com/@example",
    });
    render(<QuickActions truck={truck} />);

    expect(screen.queryByRole("link", { name: "Website" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Facebook" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Instagram" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "TikTok" })).not.toBeInTheDocument();
  });
});
