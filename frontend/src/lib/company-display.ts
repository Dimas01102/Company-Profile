// Pure helpers shared by the public website and the admin live previews, so
// a preview always shows exactly what the website will render.

/** Non-empty trimmed lines. */
export function splitLines(value: string | null | undefined): string[] {
  return (value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Paragraphs separated by blank lines. */
export function paragraphs(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Mission points: one per line, or separated by semicolons. */
export function splitMission(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\n|;/)
    .map((m) => m.trim())
    .filter(Boolean);
}

export type HoursRow = { day: string; hours: string };

/**
 * Business hours are one text field with one row per line:
 *   "Monday - Friday: 08:00 - 17:00 WIB"   ("Label: value", or "Label | value")
 * A line without a separator is shown as a single label.
 */
export function parseBusinessHours(value: string | null | undefined): HoursRow[] {
  return splitLines(value).map((line) => {
    const pipe = line.indexOf("|");
    if (pipe > 0) {
      return { day: line.slice(0, pipe).trim(), hours: line.slice(pipe + 1).trim() };
    }
    const colon = line.search(/:\s/);
    if (colon > 0) {
      return { day: line.slice(0, colon).trim(), hours: line.slice(colon + 1).trim() };
    }
    return { day: line, hours: "" };
  });
}

export function joinAddress(parts: {
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
}): string {
  const street = [parts.address, parts.city, parts.postalCode].filter(Boolean).join(", ");
  return [street, parts.province].filter(Boolean).join(", ");
}

// --- Google Maps ----------------------------------------------------------

export type MapParse = {
  /** URL for the <iframe src>. Empty when the input has no usable map. */
  embedUrl: string;
  latitude: string;
  longitude: string;
};

const NUM = "(-?\\d{1,3}\\.\\d+)";

function trimNumber(n: number): string {
  return n.toFixed(7).replace(/0+$/, "").replace(/\.$/, "");
}

function validCoords(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  );
}

/** Latitude/longitude found anywhere inside a Google Maps URL or "lat, lng" text. */
export function extractCoordinates(input: string): { latitude: string; longitude: string } | null {
  let text = input;
  try {
    text = decodeURIComponent(input);
  } catch {
    // keep the raw text
  }
  const patterns: [RegExp, number, number][] = [
    [new RegExp(`@${NUM},${NUM}`), 1, 2],
    [new RegExp(`!3d${NUM}!4d${NUM}`), 1, 2],
    [new RegExp(`!2d${NUM}!3d${NUM}`), 2, 1],
    [new RegExp(`[?&](?:q|ll|query|center|destination)=${NUM}\\s*,\\s*${NUM}`), 1, 2],
    [new RegExp(`^\\s*${NUM}\\s*[,;\\s]\\s*${NUM}\\s*$`), 1, 2],
  ];
  for (const [re, a, b] of patterns) {
    const m = re.exec(text);
    if (!m) continue;
    const lat = Number(m[a]);
    const lng = Number(m[b]);
    if (validCoords(lat, lng)) return { latitude: trimNumber(lat), longitude: trimNumber(lng) };
  }
  return null;
}

export function coordinateEmbedUrl(latitude: string, longitude: string): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
}

function isEmbedUrl(url: string): boolean {
  return /google\.[a-z.]+\/maps\/embed/i.test(url) || /[?&]output=embed/i.test(url);
}

/** An <iframe ...src="..."> snippet pasted from Google Maps "Share > Embed a map". */
function srcFromIframe(input: string): string | null {
  const m = /<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i.exec(input);
  return m ? m[1]!.replace(/&amp;/g, "&") : null;
}

/** Hosts whose links can only be expanded by the server (CORS). */
export function isShortMapLink(input: string): boolean {
  return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\b/i.test(input.trim());
}

/**
 * Understand whatever the admin pasted: a normal Google Maps link, an embed
 * link, an <iframe> snippet or plain "lat, lng" text. Returns null when the
 * text holds nothing usable on its own (e.g. a short link that the server has
 * to expand).
 */
export function parseMapInput(raw: string): MapParse | null {
  const input = raw.trim();
  if (!input) return null;

  const fromIframe = srcFromIframe(input);
  const candidate = fromIframe ?? input;

  const coords = extractCoordinates(candidate);
  if (isEmbedUrl(candidate) && /^https?:\/\//i.test(candidate)) {
    return {
      embedUrl: candidate,
      latitude: coords?.latitude ?? "",
      longitude: coords?.longitude ?? "",
    };
  }
  if (coords) {
    return {
      embedUrl: coordinateEmbedUrl(coords.latitude, coords.longitude),
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  }
  return null;
}

/** The <iframe src> to show for the saved values, or "" when there is no map. */
export function mapEmbedFor(mapEmbed: string, latitude: string, longitude: string): string {
  const stored = mapEmbed.trim();
  if (stored && isEmbedUrl(stored) && /^https?:\/\//i.test(stored)) return stored;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (latitude.trim() && longitude.trim() && validCoords(lat, lng)) {
    return coordinateEmbedUrl(latitude.trim(), longitude.trim());
  }
  return "";
}

/** "Open in Google Maps" link: exact coordinates when known, otherwise the address. */
export function mapsLinkFor(latitude: string, longitude: string, address: string): string {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const query =
    latitude.trim() && longitude.trim() && validCoords(lat, lng)
      ? `${latitude.trim()},${longitude.trim()}`
      : address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** "PT Batam Konektra Jaya" -> "Batam Konektra Jaya" (the legal prefix is dropped in logos). */
export function brandLabel(name: string): string {
  return name.replace(/^\s*PT\.?\s+/i, "").trim();
}
