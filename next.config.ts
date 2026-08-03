import type { NextConfig } from "next";
import { getSupabaseStorageHostname } from "./src/lib/allowed-image-hosts";

const supabaseStorageHostname = getSupabaseStorageHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseStorageHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseStorageHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
