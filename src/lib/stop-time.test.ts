import { afterEach, describe, expect, it } from "vitest";
import { formatStopTime, isValidTimeZone } from "./stop-time";

const NOW = new Date("2026-11-02T01:00:00.000Z");
const NY = "America/New_York";

const originalTz = process.env.TZ;
afterEach(() => {
  process.env.TZ = originalTz;
});

function whenLabel(starts_at: string, ends_at: string | null, timezone: string, now: Date = NOW) {
  return formatStopTime({ starts_at, ends_at, timezone }, now)?.whenLabel;
}

describe("formatStopTime", () => {
  // The production bug: this stop was published as "Thu, Nov 5, 9:00 PM",
  // which is its UTC clock time with no label. Real row values.
  it("shows F-Bomb's Flywheel stop as 4:00 PM EST, not 9:00 PM", () => {
    const label = whenLabel("2026-11-05T21:00:00+00:00", "2026-11-06T00:00:00+00:00", NY);
    expect(label).toBe("Thu, Nov 5, 4:00 PM EST – 7:00 PM EST");
    expect(label).not.toContain("9:00 PM");
  });

  it("shows F-Bomb's other real stops in local time", () => {
    expect(whenLabel("2026-11-07T15:00:00+00:00", "2026-11-07T19:00:00+00:00", NY)).toBe(
      "Sat, Nov 7, 10:00 AM EST – 2:00 PM EST"
    );
    expect(whenLabel("2026-11-22T15:00:00+00:00", "2026-11-22T20:00:00+00:00", NY)).toBe(
      "Sun, Nov 22, 10:00 AM EST – 3:00 PM EST"
    );
  });

  it.each([
    ["America/New_York", "Thu, Nov 5, 4:00 PM EST – 7:00 PM EST"],
    ["America/Chicago", "Thu, Nov 5, 3:00 PM CST – 6:00 PM CST"],
    ["America/Denver", "Thu, Nov 5, 2:00 PM MST – 5:00 PM MST"],
    ["America/Phoenix", "Thu, Nov 5, 2:00 PM MST – 5:00 PM MST"],
    ["America/Los_Angeles", "Thu, Nov 5, 1:00 PM PST – 4:00 PM PST"],
    ["America/Anchorage", "Thu, Nov 5, 12:00 PM AKST – 3:00 PM AKST"],
    ["Pacific/Honolulu", "Thu, Nov 5, 11:00 AM HST – 2:00 PM HST"],
  ])("labels a stop saved in %s with that zone's abbreviation", (timezone, expected) => {
    expect(whenLabel("2026-11-05T21:00:00Z", "2026-11-06T00:00:00Z", timezone)).toBe(expected);
  });

  describe("daylight saving", () => {
    it("uses EDT and CDT before the November change", () => {
      expect(whenLabel("2026-10-29T20:00:00Z", "2026-10-29T23:00:00Z", NY)).toBe(
        "Thu, Oct 29, 4:00 PM EDT – 7:00 PM EDT"
      );
      expect(whenLabel("2026-10-29T20:00:00Z", "2026-10-29T23:00:00Z", "America/Chicago")).toBe(
        "Thu, Oct 29, 3:00 PM CDT – 6:00 PM CDT"
      );
    });

    it("labels each side of the fall-back hour, when 1:30 AM happens twice", () => {
      expect(whenLabel("2026-11-01T05:30:00Z", "2026-11-01T06:30:00Z", NY)).toBe(
        "Sun, Nov 1, 1:30 AM EDT – 1:30 AM EST"
      );
    });

    it("labels each side of the spring-forward jump", () => {
      expect(whenLabel("2026-03-08T06:30:00Z", "2026-03-08T07:30:00Z", NY, new Date("2026-03-01T00:00:00Z"))).toBe(
        "Sun, Mar 8, 1:30 AM EST – 3:30 AM EDT"
      );
    });

    it("never applies daylight saving in a zone that doesn't use it", () => {
      expect(whenLabel("2026-07-15T21:00:00Z", "2026-07-16T00:00:00Z", "America/Phoenix")).toBe(
        "Wed, Jul 15, 2:00 PM MST – 5:00 PM MST"
      );
    });
  });

  describe("dates near midnight", () => {
    // 8:00 PM Eastern is already the next day in UTC: the old code would
    // have shown this Thursday stop as Friday.
    it("keeps an evening stop on its local date", () => {
      const labels = formatStopTime(
        { starts_at: "2026-11-06T01:00:00Z", ends_at: "2026-11-06T03:00:00Z", timezone: NY },
        NOW
      );
      expect(labels).toEqual({
        whenLabel: "Thu, Nov 5, 8:00 PM EST – 10:00 PM EST",
        monthLabel: "Nov",
        dayLabel: "5",
      });
    });

    it("keeps the date chip on the local month across a month boundary", () => {
      const labels = formatStopTime(
        { starts_at: "2026-12-01T01:00:00Z", ends_at: "2026-12-01T03:00:00Z", timezone: NY },
        NOW
      );
      expect(labels).toMatchObject({ monthLabel: "Nov", dayLabel: "30" });
    });

    it("repeats the date when a stop ends on the next local day", () => {
      expect(whenLabel("2026-11-07T03:00:00Z", "2026-11-07T06:00:00Z", NY)).toBe(
        "Fri, Nov 6, 10:00 PM EST – Sat, Nov 7, 1:00 AM EST"
      );
    });

    it("doesn't repeat the date when a stop ends at 11:59 PM local", () => {
      expect(whenLabel("2026-11-06T23:00:00Z", "2026-11-07T04:59:00Z", NY)).toBe(
        "Fri, Nov 6, 6:00 PM EST – 11:59 PM EST"
      );
    });
  });

  describe("visitors and servers in other timezones", () => {
    it.each(["UTC", "America/New_York", "America/Los_Angeles", "Asia/Tokyo", "Pacific/Kiritimati"])(
      "gives identical text when the runtime is in %s",
      (runtimeZone) => {
        process.env.TZ = runtimeZone;
        expect(whenLabel("2026-11-06T01:00:00Z", "2026-11-06T03:00:00Z", NY)).toBe(
          "Thu, Nov 5, 8:00 PM EST – 10:00 PM EST"
        );
      }
    );

    it("really does change the runtime zone in this test environment", () => {
      process.env.TZ = "Asia/Tokyo";
      const tokyoHour = new Date("2026-11-06T01:00:00Z").getHours();
      process.env.TZ = "America/Los_Angeles";
      const losAngelesHour = new Date("2026-11-06T01:00:00Z").getHours();
      expect(tokyoHour).not.toBe(losAngelesHour);
    });

    it("uses plain spaces only, so server and browser engines can't differ", () => {
      const label = whenLabel("2026-11-05T21:00:00Z", "2026-11-06T00:00:00Z", NY);
      expect(label).not.toMatch(/[  ]/);
    });
  });

  describe("years", () => {
    it("shows the year for a stop that isn't this year", () => {
      expect(whenLabel("2029-08-28T15:00:00Z", "2029-08-28T18:00:00Z", "America/Chicago")).toBe(
        "Tue, Aug 28, 2029, 10:00 AM CDT – 1:00 PM CDT"
      );
    });

    it("judges 'this year' where the stop is, not in UTC", () => {
      // Dec 31 at 9:00 PM in New York, already Jan 1 in UTC.
      const newYearsEve = new Date("2027-01-01T02:00:00Z");
      expect(whenLabel("2027-01-01T03:00:00Z", "2027-01-01T04:00:00Z", NY, newYearsEve)).toBe(
        "Thu, Dec 31, 10:00 PM EST – 11:00 PM EST"
      );
    });
  });

  describe("missing or unusable data", () => {
    it("shows only the start when the end is missing, not after the start, or invalid", () => {
      const start = "2026-11-05T21:00:00Z";
      expect(whenLabel(start, null, NY)).toBe("Thu, Nov 5, 4:00 PM EST");
      expect(whenLabel(start, start, NY)).toBe("Thu, Nov 5, 4:00 PM EST");
      expect(whenLabel(start, "2026-11-05T20:00:00Z", NY)).toBe("Thu, Nov 5, 4:00 PM EST");
      expect(whenLabel(start, "not-a-date", NY)).toBe("Thu, Nov 5, 4:00 PM EST");
    });

    it.each([[null], [undefined], [""], ["Not/AZone"]])("returns null rather than guess for timezone %s", (timezone) => {
      expect(formatStopTime({ starts_at: "2026-11-05T21:00:00Z", timezone }, NOW)).toBeNull();
    });

    it("returns null when the start isn't a real date", () => {
      expect(formatStopTime({ starts_at: "not-a-date", timezone: NY }, NOW)).toBeNull();
    });
  });
});

describe("isValidTimeZone", () => {
  it("accepts real zones and rejects everything else", () => {
    expect(isValidTimeZone(NY)).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone(null)).toBe(false);
  });
});
