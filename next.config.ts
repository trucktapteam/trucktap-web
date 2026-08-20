import type { NextConfig } from "next";
import { getSupabaseStorageHostname } from "./src/lib/allowed-image-hosts";

const supabaseStorageHostname = getSupabaseStorageHostname();

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 2678400,
    // AVIF is the Next.js default alongside WebP, but every browser and
    // crawler that matters here (including Googlebot, since 2020) already
    // supports WebP, and generating both formats for every requested width
    // roughly doubles Image Optimization transformations/cache writes for
    // no visible quality gain on this site's photo content.
    formats: ["image/webp"],
    // Defaults are deviceSizes: 8 entries, imageSizes: 8 entries — up to 16
    // distinct widths (32 with both formats) per source image. Narrowed to
    // the widths this app's layouts actually render: truck hero/lightbox
    // (`fill` + `sizes="100vw"`/`"90vw"`) need a real spread of device
    // breakpoints, while every fixed-box photo (gallery/menu thumbnails,
    // logos, QR poster art) tops out at 340px. See PlaceholderImage call
    // sites across src/components/truck and src/components/trucks.
    deviceSizes: [420, 750, 1080, 1440, 1920],
    imageSizes: [64, 96, 128, 180, 256, 340],
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
