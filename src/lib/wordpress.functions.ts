import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildPostBySlugUrl, buildPostsUrl, mapPost, type RawPost } from "@/lib/wordpress";

async function fetchWordPress<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`WP error ${response.status}`);
  }

  return (await response.json()) as T;
}

export const getPosts = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        perPage: z.number().int().min(1).max(20).default(12),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const posts = await fetchWordPress<RawPost[]>(buildPostsUrl(data.perPage));
    return posts.map(mapPost);
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ slug: z.string().trim().min(1).max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    const posts = await fetchWordPress<RawPost[]>(buildPostBySlugUrl(data.slug));
    return posts[0] ? mapPost(posts[0]) : null;
  });