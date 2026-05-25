import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import TranslateButton from "@/components/site/TranslateButton";
import { fetchPostBySlug, formatDate, type WPPost } from "@/lib/wordpress";

export const Route = createFileRoute("/blog_/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Blog COMEX 10` },
      {
        name: "description",
        content:
          "Artigo do blog COMEX 10 do Brasil sobre cadeia de fluidos, mangueiras hidráulicas, equipamentos e treinamentos.",
      },
    ],
  }),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<WPPost | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setPost(undefined);
    fetchPostBySlug(slug)
      .then((p) => !cancelled && setPost(p))
      .catch(() => !cancelled && setPost(null));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Update document meta after the post loads (client-side only).
  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} — Blog COMEX 10`;
    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector<HTMLMetaElement>(selector);
      if (el) el.setAttribute("content", content);
    };
    const desc = post.excerpt || "Artigo do blog COMEX 10 do Brasil.";
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', post.title);
    setMeta('meta[property="og:description"]', desc);
    if (post.cover) setMeta('meta[property="og:image"]', post.cover);
  }, [post]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-28 md:pt-32 pb-20">
        <article className="mx-auto max-w-3xl px-4 md:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Voltar para o blog
          </Link>

          {post === undefined && (
            <div className="mt-8 space-y-4">
              <div className="h-10 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
              <div className="aspect-[16/9] bg-muted rounded-2xl animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          )}

          {post === null && (
            <div className="mt-10 rounded-xl border border-border bg-muted/40 p-8 text-center">
              <h1 className="text-2xl font-semibold">Post não encontrado</h1>
              <p className="mt-2 text-muted-foreground">
                Esse artigo pode ter sido movido ou removido.
              </p>
              <Link
                to="/blog"
                className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Ver todos os posts
              </Link>
            </div>
          )}

          {post && (
            <>
              <header className="mt-6 mb-8">
                <time className="text-xs uppercase tracking-wider text-muted-foreground">
                  {formatDate(post.date)}
                </time>
                <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                  {post.title}
                </h1>
              </header>

              {post.cover && (
                <img
                  src={post.cover}
                  alt={post.coverAlt}
                  className="w-full rounded-2xl mb-10 object-cover"
                />
              )}

              <div
                className="prose prose-neutral max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </>
          )}
        </article>
      </main>
      <Footer />
      <TranslateButton />
    </div>
  );
}
