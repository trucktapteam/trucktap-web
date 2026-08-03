import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// A fake, fixed value — tests must not depend on the real project's env,
// which isn't loaded by Vitest the way Next's dev/build process loads
// .env.local. Anything reading NEXT_PUBLIC_SUPABASE_URL (e.g. the image
// hostname allowlist) sees this consistently in every test run.
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";

afterEach(() => {
  cleanup();
});
