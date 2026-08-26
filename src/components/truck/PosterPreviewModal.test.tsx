import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { makeTruck } from "@/lib/test-fixtures";
import { PosterPreviewModal } from "./PosterPreviewModal";

const toPngMock = vi.fn();
vi.mock("html-to-image", () => ({
  toPng: (...args: unknown[]) => toPngMock(...args),
}));

describe("PosterPreviewModal — Download Poster", () => {
  beforeEach(() => {
    toPngMock.mockReset();
  });

  it("rasterizes the poster's own DOM node and downloads it as a PNG named after the truck", async () => {
    toPngMock.mockResolvedValue("data:image/png;base64,xyz");
    let downloadedName = "";
    let downloadedHref = "";
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadedName = this.download;
      downloadedHref = this.href;
    });

    const truck = makeTruck({ name: "Smoky Wheels BBQ" });
    render(<PosterPreviewModal truck={truck} onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Download Poster" }));

    await waitFor(() => expect(clickSpy).toHaveBeenCalled());

    expect(toPngMock).toHaveBeenCalledTimes(1);
    // The node handed to toPng is the poster's own box, not the modal
    // chrome around it — so the export contains only the poster artwork.
    expect((toPngMock.mock.calls[0][0] as HTMLElement).tagName).toBe("DIV");
    expect(downloadedName).toBe("smoky-wheels-bbq-trucktap-poster.png");
    expect(downloadedHref).toContain("data:image/png");

    clickSpy.mockRestore();
  });

  it("surfaces an error message instead of throwing when rasterizing fails", async () => {
    toPngMock.mockRejectedValue(new Error("canvas export failed"));

    const truck = makeTruck({ name: "Smoky Wheels BBQ" });
    render(<PosterPreviewModal truck={truck} onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Download Poster" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't generate the poster image");
  });
});
