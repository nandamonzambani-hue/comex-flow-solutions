export const WORDPRESS_API_BASE = "https://blog.comex10.com.br/?rest_route=/wp/v2";

export type WPPost = {
  id: number;
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string | null;
  coverAlt: string;
};

export type RawPost = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      alt_text?: string;
      media_details?: { sizes?: Record<string, { source_url: string }> };
    }>;
  };
};

export function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8211;|&ndash;/g, "–")
    .trim();
}

export function mapPost(raw: RawPost): WPPost {
  const media = raw._embedded?.["wp:featuredmedia"]?.[0];
  const sizes = media?.media_details?.sizes;
  const cover =
    sizes?.large?.source_url ??
    sizes?.medium_large?.source_url ??
    media?.source_url ??
    null;
  return {
    id: raw.id,
    slug: raw.slug,
    date: raw.date,
    title: stripHtml(raw.title.rendered),
    excerpt: stripHtml(raw.excerpt.rendered),
    content: raw.content.rendered,
    cover,
    coverAlt: media?.alt_text || stripHtml(raw.title.rendered),
  };
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
