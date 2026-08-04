import { describe, expect, it } from "vitest";
import { getSocialLinks } from "./social-links";

function truck(overrides: Partial<{ website: string | null; facebook_url: string | null; instagram_url: string | null; tiktok_url: string | null }>) {
  return { website: null, facebook_url: null, instagram_url: null, tiktok_url: null, ...overrides };
}

describe("getSocialLinks", () => {
  it("returns an empty list when no social fields are populated", () => {
    expect(getSocialLinks(truck({}))).toEqual([]);
  });

  it("treats an empty string the same as null (real rows store '' for unset website)", () => {
    expect(getSocialLinks(truck({ website: "" }))).toEqual([]);
  });

  it("leaves a full URL completely unchanged", () => {
    const links = getSocialLinks(truck({ website: "https://smokywheelsbbq.example.com" }));
    expect(links).toEqual([{ platform: "website", label: "Website", href: "https://smokywheelsbbq.example.com" }]);
  });

  it("prepends https:// to a bare domain for website", () => {
    const links = getSocialLinks(truck({ website: "smokywheelsbbq.example.com" }));
    expect(links[0].href).toBe("https://smokywheelsbbq.example.com");
  });

  it("converts a bare Facebook handle to a full profile URL", () => {
    const links = getSocialLinks(truck({ facebook_url: "@SmokyWheelsBBQ" }));
    expect(links).toEqual([{ platform: "facebook", label: "Facebook", href: "https://facebook.com/SmokyWheelsBBQ" }]);
  });

  it("converts a bare Instagram handle to a full profile URL", () => {
    const links = getSocialLinks(truck({ instagram_url: "smokywheelsbbq" }));
    expect(links).toEqual([{ platform: "instagram", label: "Instagram", href: "https://instagram.com/smokywheelsbbq" }]);
  });

  it("converts a bare TikTok handle to a full profile URL with the @ TikTok requires", () => {
    const links = getSocialLinks(truck({ tiktok_url: "@smokywheelsbbq" }));
    expect(links).toEqual([{ platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@smokywheelsbbq" }]);
  });

  it("leaves already-full social URLs unchanged", () => {
    const links = getSocialLinks(
      truck({
        facebook_url: "https://www.facebook.com/SmokyWheelsBBQ",
        instagram_url: "https://instagram.com/smokywheelsbbq",
        tiktok_url: "https://www.tiktok.com/@smokywheelsbbq",
      })
    );
    expect(links.map((l) => l.href)).toEqual([
      "https://www.facebook.com/SmokyWheelsBBQ",
      "https://instagram.com/smokywheelsbbq",
      "https://www.tiktok.com/@smokywheelsbbq",
    ]);
  });

  it("returns links in a fixed order: website, Facebook, Instagram, TikTok", () => {
    const links = getSocialLinks(
      truck({
        tiktok_url: "https://www.tiktok.com/@x",
        website: "https://x.example.com",
        instagram_url: "https://instagram.com/x",
        facebook_url: "https://facebook.com/x",
      })
    );
    expect(links.map((l) => l.platform)).toEqual(["website", "facebook", "instagram", "tiktok"]);
  });
});
