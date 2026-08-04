import type { Truck } from "@/lib/types";
import { getSocialLinks, type SocialPlatform } from "@/lib/social-links";
import { ACTION_CHIP_CLASS } from "./QuickActions";

/**
 * Compact "Connect" group for website/Facebook/Instagram/TikTok — only
 * the fields public_trucks actually exposes, and only the ones this
 * specific truck has filled in. Lives in the same sticky sidebar as
 * QuickActions (right below it) rather than duplicating these links
 * there, since real platform icons + a dedicated "Connect" label read
 * more clearly than folding them into the generic action-chip row.
 */
export function ConnectLinks({ truck }: { truck: Truck }) {
  const links = getSocialLinks(truck);
  if (links.length === 0) return null;

  return (
    <section aria-label="Connect">
      <p className="mb-2 text-xs font-bold tracking-widest text-muted uppercase">Connect</p>
      <div className="flex flex-wrap items-center gap-2.5">
        {links.map((link) => (
          <a
            key={link.platform}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            aria-label={link.label}
            className={ACTION_CHIP_CLASS}
          >
            <PlatformIcon platform={link.platform} />
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case "website":
      return <WebsiteIcon />;
    case "facebook":
      return <FacebookIcon />;
    case "instagram":
      return <InstagramIcon />;
    case "tiktok":
      return <TikTokIcon />;
  }
}

function WebsiteIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.5 3.653a6.505 6.505 0 0 0-3.44 3.44c.32.079.665.132 1.031.161A15.71 15.71 0 0 1 8.5 3.653Zm2 0a15.71 15.71 0 0 1 2.409 3.601c.366-.029.711-.082 1.031-.161a6.505 6.505 0 0 0-3.44-3.44ZM12 10c0-1.061-.093-2.079-.264-3.017a17.19 17.19 0 0 1-3.472 0A15.31 15.31 0 0 0 8 10c0 1.061.093 2.079.264 3.017a17.19 17.19 0 0 1 3.472 0C11.907 12.079 12 11.061 12 10Zm-.075 4.652c.366-.029.711-.082 1.031-.161a6.505 6.505 0 0 1-3.44 3.44 15.71 15.71 0 0 0 2.409-3.279Zm-3.85 0a15.71 15.71 0 0 0 2.409 3.279 6.505 6.505 0 0 1-3.44-3.44c.32.079.665.132 1.031.161ZM4.06 8.653c-.196.813-.196 1.881 0 2.694a12.198 12.198 0 0 0 0-2.694Zm11.88 0a12.198 12.198 0 0 0 0 2.694c.196-.813.196-1.881 0-2.694Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M11.5 4.5h1.5V2.1C12.7 2.03 11.85 2 10.87 2 8.83 2 7.5 3.24 7.5 5.6V7.5H5.25v2.7H7.5V18h2.85v-7.8h2.36l.38-2.7h-2.74V5.9c0-.78.21-1.4 1.15-1.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="4" />
      <circle cx="10" cy="10" r="3.25" />
      <circle cx="14" cy="6" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M13.5 2.5c.4 1.7 1.6 2.9 3.3 3.1v2.3c-1.2 0-2.3-.4-3.3-1.1v5.4a4.3 4.3 0 1 1-4.3-4.3c.2 0 .4 0 .6.03v2.4a1.9 1.9 0 1 0 1.5 1.9V2.5h2.2Z" />
    </svg>
  );
}
