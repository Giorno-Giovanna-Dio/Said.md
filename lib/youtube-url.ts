const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

function firstPathSegment(pathname: string, index: number): string | null {
  const parts = pathname.split("/").filter(Boolean);
  return parts[index] ?? null;
}

export function parseYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (VIDEO_ID_RE.test(trimmed)) return trimmed;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = firstPathSegment(url.pathname, 0);
      return id && VIDEO_ID_RE.test(id) ? id : null;
    }

    const youtubeHosts = new Set([
      "youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtube-nocookie.com",
    ]);

    if (!youtubeHosts.has(host)) return null;

    const fromQuery = url.searchParams.get("v");
    if (fromQuery && VIDEO_ID_RE.test(fromQuery)) return fromQuery;

    const kind = firstPathSegment(url.pathname, 0);
    const maybeId = firstPathSegment(url.pathname, 1);
    if (
      kind &&
      maybeId &&
      ["shorts", "embed", "live", "v", "watch"].includes(kind) &&
      VIDEO_ID_RE.test(maybeId)
    ) {
      return maybeId;
    }

    return null;
  } catch {
    return null;
  }
}

export function canonicalWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
