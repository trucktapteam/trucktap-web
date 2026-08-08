import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows normal public crawling and points crawlers at the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://gettrucktap.com/sitemap.xml",
    });
  });
});
