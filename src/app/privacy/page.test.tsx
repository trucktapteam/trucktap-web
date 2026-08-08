import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage, { metadata } from "./page";

describe("PrivacyPage", () => {
  it("renders the existing policy text verbatim, not a rewritten version", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: "TruckTap Privacy Policy" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "TruckTap collects basic information such as location and contact details to provide core app functionality."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("We do not sell or share your personal data.")).toBeInTheDocument();
    expect(
      screen.getByText("Location data is used only to show nearby food trucks and improve the user experience.")
    ).toBeInTheDocument();
    expect(screen.getByText("Last updated: April 2026")).toBeInTheDocument();
  });

  it("links the contact address as a mailto:", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("link", { name: "TruckTapTeam@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:TruckTapTeam@gmail.com"
    );
  });

  it("sets a canonical URL and metadata for the page", () => {
    expect(metadata.alternates).toEqual({ canonical: "https://gettrucktap.com/privacy" });
    expect(metadata.title).toBe("Privacy Policy");
  });
});
