// Acepta los formatos más comunes de link de YouTube: youtu.be/<id>,
// youtube.com/watch?v=<id>, youtube.com/embed/<id> y youtube.com/shorts/<id>.
export function getYoutubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    return parsed.pathname.slice(1).split("/")[0] || null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v");
    }
    for (const prefix of ["/embed/", "/shorts/"]) {
      if (parsed.pathname.startsWith(prefix)) {
        return parsed.pathname.slice(prefix.length).split("/")[0] || null;
      }
    }
  }

  return null;
}

export function getYoutubeEmbedUrl(url: string): string | null {
  const id = getYoutubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
