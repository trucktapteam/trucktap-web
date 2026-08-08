import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { makeDirectoryTruckCard } from "@/lib/test-fixtures";
import { TrucksDirectory } from "./TrucksDirectory";

const TRUCKS = [
  makeDirectoryTruckCard({ id: "1", slug: "papa-pasta", name: "Papa Pasta", cuisine_type: "Italian", tier: "live" }),
  makeDirectoryTruckCard({ id: "2", slug: "el-taco-rico", name: "El Taco Rico", cuisine_type: "Mexican" }),
  makeDirectoryTruckCard({ id: "3", slug: "smoky-wheels", name: "Smoky Wheels BBQ", cuisine_type: "BBQ" }),
];

function search(value: string) {
  fireEvent.change(screen.getByLabelText("Search trucks by name or cuisine"), { target: { value } });
}

describe("TrucksDirectory", () => {
  it("renders every truck, in the order it was given, when the search field is empty", () => {
    render(<TrucksDirectory trucks={TRUCKS} />);
    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(3);
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/truck/papa-pasta",
      "/truck/el-taco-rico",
      "/truck/smoky-wheels",
    ]);
  });

  it("filters by truck name, case-insensitively", () => {
    render(<TrucksDirectory trucks={TRUCKS} />);
    search("taco");

    expect(screen.getByRole("link")).toHaveAttribute("href", "/truck/el-taco-rico");
  });

  it("filters by cuisine, case-insensitively", () => {
    render(<TrucksDirectory trucks={TRUCKS} />);
    search("bbq");

    expect(screen.getByRole("link")).toHaveAttribute("href", "/truck/smoky-wheels");
  });

  it("preserves ranking order within the filtered results", () => {
    const trucks = [
      makeDirectoryTruckCard({ id: "1", slug: "a", name: "A Tacos", cuisine_type: "Mexican", tier: "ordinary" }),
      makeDirectoryTruckCard({ id: "2", slug: "b", name: "B Tacos", cuisine_type: "Mexican", tier: "live" }),
    ];
    render(<TrucksDirectory trucks={trucks} />);
    search("tacos");

    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/truck/a", "/truck/b"]);
  });

  it("shows a clear empty state, not a blank list, when nothing matches", () => {
    render(<TrucksDirectory trucks={TRUCKS} />);
    search("nonexistent cuisine xyz");

    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText(/No trucks match/)).toBeInTheDocument();
  });
});
