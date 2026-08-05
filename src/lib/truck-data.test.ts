import { describe, expect, it } from "vitest";
import { toMenuImageUrls } from "./truck-data";

const BOARD_URL = "https://test-project.supabase.co/storage/v1/object/public/truck-images/abc/menu-board-1.jpg";
const ITEM_URL = "https://test-project.supabase.co/storage/v1/object/public/truck-images/abc/menu-1.jpg";

describe("toMenuImageUrls", () => {
  // Regression test: the owner app's "photograph the whole board" upload
  // flow stores that entry as `"menu-board:" + url`, not a bare URL. Left
  // unparsed, `new URL("menu-board:https://...")` treats "menu-board:"
  // itself as the protocol, isSupabaseStorageImageUrl rejects it, and
  // MenuSection falls back to the decorative gradient instead of the real
  // photographed board — exactly what TestTruck 7/25 was showing.
  it("strips the menu-board: label prefix so the real URL underneath is used", () => {
    expect(toMenuImageUrls([`menu-board:${BOARD_URL}`])).toEqual([BOARD_URL]);
  });

  it("leaves unlabeled entries (individual menu-item photos) unchanged", () => {
    expect(toMenuImageUrls([ITEM_URL])).toEqual([ITEM_URL]);
  });

  it("handles a mix of labeled and unlabeled entries in one array", () => {
    expect(toMenuImageUrls([`menu-board:${BOARD_URL}`, ITEM_URL])).toEqual([BOARD_URL, ITEM_URL]);
  });

  it("returns an empty array for non-array input", () => {
    expect(toMenuImageUrls(null)).toEqual([]);
    expect(toMenuImageUrls(undefined)).toEqual([]);
  });

  it("filters out non-string entries", () => {
    expect(toMenuImageUrls([ITEM_URL, 42, null, { foo: "bar" }])).toEqual([ITEM_URL]);
  });
});
