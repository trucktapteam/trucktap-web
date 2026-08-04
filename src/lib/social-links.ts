import type { Truck } from "./types";

export type SocialPlatform = "website" | "facebook" | "instagram" | "tiktok";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  website: "Website",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
};

const HAS_SCHEME = /^https?:\/\//i;

/** Strips a leading "@" some owners type into a handle field by habit. */
function stripHandlePrefix(value: string): string {
  return value.replace(/^@/, "");
}

/**
 * The app's own editor (edit-profile.tsx's normalizeProfileUrl) already
 * saves these fields as full https:// URLs before they ever reach
 * Supabase, so in practice this is a defensive no-op for current data —
 * but legacy rows or a future non-app data-entry path could still land a
 * bare domain/handle here, so the web app normalizes independently rather
 * than trusting the upstream guarantee blindly. A value that's already a
 * full URL is returned completely unchanged.
 */
function normalizeUrlValue(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Only safe because the field is Facebook-specific — the platform is unambiguous. */
function normalizeFacebookValue(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (HAS_SCHEME.test(trimmed)) return trimmed;
  return `https://facebook.com/${stripHandlePrefix(trimmed)}`;
}

function normalizeInstagramValue(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (HAS_SCHEME.test(trimmed)) return trimmed;
  return `https://instagram.com/${stripHandlePrefix(trimmed)}`;
}

function normalizeTikTokValue(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (HAS_SCHEME.test(trimmed)) return trimmed;
  return `https://www.tiktok.com/@${stripHandlePrefix(trimmed)}`;
}

/**
 * The full "Connect" list for a truck — only fields that are actually
 * populated, in a fixed, predictable order. Every field here already
 * comes through the public_trucks view (website, facebook_url,
 * instagram_url, tiktok_url); there is currently no youtube_url or public
 * contact-email field anywhere in the underlying app/database to include.
 */
export function getSocialLinks(
  truck: Pick<Truck, "website" | "facebook_url" | "instagram_url" | "tiktok_url">
): SocialLink[] {
  const links: SocialLink[] = [];

  const website = normalizeUrlValue(truck.website);
  if (website) links.push({ platform: "website", label: SOCIAL_LABELS.website, href: website });

  const facebook = normalizeFacebookValue(truck.facebook_url);
  if (facebook) links.push({ platform: "facebook", label: SOCIAL_LABELS.facebook, href: facebook });

  const instagram = normalizeInstagramValue(truck.instagram_url);
  if (instagram) links.push({ platform: "instagram", label: SOCIAL_LABELS.instagram, href: instagram });

  const tiktok = normalizeTikTokValue(truck.tiktok_url);
  if (tiktok) links.push({ platform: "tiktok", label: SOCIAL_LABELS.tiktok, href: tiktok });

  return links;
}
