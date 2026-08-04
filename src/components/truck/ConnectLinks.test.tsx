import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { ConnectLinks } from "./ConnectLinks";

describe("ConnectLinks", () => {
  it("renders nothing when no social fields are populated", () => {
    const { container } = render(<ConnectLinks truck={makeTruck()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders only the populated fields, each opening safely in a new tab", () => {
    const truck = makeTruck({
      website: "https://smokywheelsbbq.example.com",
      instagram_url: "https://instagram.com/smokywheelsbbq",
      facebook_url: null,
      tiktok_url: null,
    });
    render(<ConnectLinks truck={truck} />);

    expect(screen.getByText("Connect")).toBeInTheDocument();

    const website = screen.getByRole("link", { name: "Website" });
    expect(website).toHaveAttribute("href", "https://smokywheelsbbq.example.com");
    expect(website).toHaveAttribute("target", "_blank");
    expect(website).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(website).toHaveAttribute("rel", expect.stringContaining("noreferrer"));

    const instagram = screen.getByRole("link", { name: "Instagram" });
    expect(instagram).toHaveAttribute("href", "https://instagram.com/smokywheelsbbq");

    expect(screen.queryByRole("link", { name: "Facebook" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "TikTok" })).not.toBeInTheDocument();
  });

  it("renders links in a fixed, predictable order", () => {
    const truck = makeTruck({
      tiktok_url: "https://www.tiktok.com/@x",
      website: "https://x.example.com",
      instagram_url: "https://instagram.com/x",
      facebook_url: "https://facebook.com/x",
    });
    render(<ConnectLinks truck={truck} />);

    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("aria-label"))).toEqual(["Website", "Facebook", "Instagram", "TikTok"]);
  });

  it("normalizes a bare handle for an unambiguous single-platform field", () => {
    const truck = makeTruck({ facebook_url: "@SmokyWheelsBBQ" });
    render(<ConnectLinks truck={truck} />);

    expect(screen.getByRole("link", { name: "Facebook" })).toHaveAttribute(
      "href",
      "https://facebook.com/SmokyWheelsBBQ"
    );
  });
});
