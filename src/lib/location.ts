/**
 * Reduces an owner-entered `service_area` value down to "City, ST" for the
 * public profile's permanent/base "Based near" line.
 *
 * `service_area` is free text an owner typed into a form field, and
 * production data shows most of them typed a full street address rather
 * than a city/region (e.g. "300, Sewer Plant Rd, Hodgenville, Kentucky") —
 * which, rendered verbatim, publishes exactly the kind of detail that can
 * point back to a truck owner's home. This never renders anything more
 * precise than city + state.
 *
 * Deterministic, not a geocoder: it recognizes the two shapes production
 * data actually has —
 *   1. comma-separated address parts, where the last two are always
 *      "City, State" (any street number/name before them is discarded
 *      outright, regardless of its content)
 *   2. a single "City ST" / "City State" segment with no commas at all
 * — and fails closed (returns `null`, so the caller renders nothing) for
 * anything it can't confidently reduce to just a city and a recognized US
 * state, rather than risk leaking a street-level value it doesn't
 * recognize the shape of.
 */
export function formatBasedNearLocation(serviceArea: string | null | undefined): string | null {
  if (!serviceArea) return null;

  let value = serviceArea.trim();
  if (!value) return null;

  // A trailing ZIP/ZIP+4 is never safe to show and would otherwise block
  // state-matching below (it's not part of any recognized state token).
  value = value.replace(/\s+\d{5}(-\d{4})?$/, "").trim();
  if (!value) return null;

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const city = parts[parts.length - 2];
    const state = resolveState(parts[parts.length - 1]);
    return state && city && !looksLikeStreetFragment(city) ? `${city}, ${state}` : null;
  }

  // No commas at all — try "City ST" / "City State Name", preferring a
  // two-word state name (e.g. "New York") over a one-word match so it
  // isn't mistaken for a one-word city plus the first word of a longer
  // state name.
  const words = value.split(/\s+/);
  for (const stateWordCount of [2, 1]) {
    if (words.length <= stateWordCount) continue;
    const state = resolveState(words.slice(-stateWordCount).join(" "));
    if (!state) continue;
    const city = words.slice(0, -stateWordCount).join(" ");
    return !looksLikeStreetFragment(city) ? `${city}, ${state}` : null;
  }

  return null;
}

const STREET_SUFFIXES = new Set([
  "st", "street", "rd", "road", "ave", "avenue", "blvd", "boulevard", "dr", "drive",
  "ln", "lane", "way", "hwy", "highway", "pkwy", "parkway", "cir", "circle",
  "pl", "place", "ter", "terr", "terrace", "trl", "trail", "loop", "sq", "square",
  "cv", "cove", "xing", "crossing", "byp", "bypass", "pike", "aly", "alley", "run", "path",
]);

/** Disqualifies a candidate "city" that's actually still street text: a digit anywhere, or a street-suffix as its last word. */
function looksLikeStreetFragment(text: string): boolean {
  if (/\d/.test(text)) return true;
  const words = text.trim().split(/\s+/);
  const lastWord = words[words.length - 1]?.toLowerCase().replace(/[.,]+$/, "");
  return lastWord ? STREET_SUFFIXES.has(lastWord) : false;
}

function resolveState(token: string): string | null {
  const cleaned = token.trim().replace(/\.$/, "");
  if (!cleaned) return null;
  const upper = cleaned.toUpperCase();
  if (STATE_ABBREVIATIONS.has(upper)) return upper;
  return STATE_NAME_TO_ABBREVIATION[cleaned.toLowerCase()] ?? null;
}

const STATE_NAME_TO_ABBREVIATION: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY", "district of columbia": "DC",
};

const STATE_ABBREVIATIONS = new Set(Object.values(STATE_NAME_TO_ABBREVIATION));
