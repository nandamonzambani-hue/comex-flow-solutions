import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import TranslateButton from "@/components/site/TranslateButton";
import { fetchPostBySlug, formatDate, type WPPost } from "@/lib/wordpress";

const SITE_URL = "https://comex10.com.br";

export const Route = createFileRoute("/blog_/$slug")({
  head: ({ params }) => {
    const url = `${SITE_URL}/blog/${params.slug}`;
    const fallbackTitle = `${params.slug.replace(/-/g, " ")} — Blog Comex10`;
    return {
      meta: [
        { title: fallbackTitle },
        {
          name: "description",
          content:
            "Artigo do blog Comex10 do Brasil sobre cadeia de fluidos, mangueiras hidráulicas, equipamentos e treinamentos.",
        },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Comex10 do Brasil" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<WPPost | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setPost(undefined);
    fetchPostBySlug(slug)
      .then((p) => {
        if (!cancelled) setPost(p);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, reloadKey]);

  useEffect(() => {
    if (post) document.title = `${post.title} — Blog Comex10`;
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

          {error && (
            <div className="mt-8 rounded-xl border border-border bg-muted/40 p-8 text-center">
              <h1 className="text-2xl font-semibold">Não foi possível carregar o post</h1>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!error && post === undefined && (
            <div className="mt-8 space-y-4 animate-pulse">
              <div className="h-3 w-32 bg-muted rounded" />
              <div className="h-10 w-3/4 bg-muted rounded" />
              <div className="aspect-[16/9] bg-muted rounded-2xl mt-6" />
              <div className="space-y-2 mt-6">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
                <div className="h-4 w-4/6 bg-muted rounded" />
              </div>
            </div>
          )}

          {!error && post === null && (
            <div className="mt-8 rounded-xl border border-border bg-muted/40 p-8 text-center">
              <h1 className="text-2xl font-semibold">Post não encontrado</h1>
              <p className="mt-2 text-muted-foreground">
                Esse artigo pode ter sido movido ou removido.
              </p>
            </div>
          )}

          {!error && post && (
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
                className="blog-content"
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
