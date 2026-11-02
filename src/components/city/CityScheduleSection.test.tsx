import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { CityScheduleDay } from "@/lib/city-schedule";
import { CityScheduleSection } from "./CityScheduleSection";

const DAYS: CityScheduleDay[] = [
  {
    key: "2026-11-05",
    label: "Thu, Nov 5",
    stops: [
      {
        id: "s1",
        truckName: "F-Bomb Cajun Poboys",
        truckSlug: "f-bomb-food-trailer-cajun-food",
        timeLabel: "4:00 PM EST – 7:00 PM EST",
        locationText: "Flywheel Brewing, 218 S Mulberry Street, Elizabethtown, Ky",
        note: null,
        status: "scheduled",
      },
    ],
  },
];

describe("CityScheduleSection", () => {
  it("renders nothing at all when there are no stops", () => {
    const { container } = render(<CityScheduleSection cityName="Radcliff" days={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the date, truck, times and location, linked to the truck's profile", () => {
    render(<CityScheduleSection cityName="Elizabethtown" days={DAYS} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Upcoming stops in and near Elizabethtown");
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Thu, Nov 5");
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/truck/f-bomb-food-trailer-cajun-food");
    expect(link).toHaveTextContent("F-Bomb Cajun Poboys");
    expect(link).toHaveTextContent("4:00 PM EST – 7:00 PM EST");
    expect(link).toHaveTextContent("Flywheel Brewing");
  });

  it("is in server-rendered HTML", () => {
    const html = renderToString(<CityScheduleSection cityName="Elizabethtown" days={DAYS} />);
    expect(html).toContain("4:00 PM EST – 7:00 PM EST");
    expect(html).toContain("Flywheel Brewing");
  });

  it("shows delayed and sold-out badges", () => {
    const withStatus: CityScheduleDay[] = [{ ...DAYS[0], stops: [{ ...DAYS[0].stops[0], status: "sold_out" }] }];
    render(<CityScheduleSection cityName="Elizabethtown" days={withStatus} />);
    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });
});
