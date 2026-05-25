import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import TranslateButton from "@/components/site/TranslateButton";
import { getPosts } from "@/lib/wordpress.functions";
import { formatDate, type WPPost } from "@/lib/wordpress";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog COMEX 10 — Conteúdo técnico de cadeia de fluidos" },
      {
        name: "description",
        content:
          "Artigos, novidades e dicas técnicas sobre mangueiras hidráulicas, equipamentos, bombas e treinamentos da COMEX 10 do Brasil.",
      },
      { property: "og:title", content: "Blog COMEX 10 do Brasil" },
      {
        property: "og:description",
        content:
          "Conteúdo técnico em hidráulica industrial: mangueiras, equipamentos, bombas e treinamentos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://comex10.com.br/blog" },
      { property: "og:site_name", content: "COMEX 10 do Brasil" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Blog COMEX 10 do Brasil" },
      {
        name: "twitter:description",
        content:
          "Conteúdo técnico em hidráulica industrial: mangueiras, equipamentos, bombas e treinamentos.",
      },
    ],
    links: [{ rel: "canonical", href: "https://comex10.com.br/blog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog COMEX 10 do Brasil",
          url: "https://comex10.com.br/blog",
          description:
            "Conteúdo técnico em hidráulica industrial: mangueiras, equipamentos, bombas e treinamentos.",
          publisher: {
            "@type": "Organization",
            name: "COMEX 10 do Brasil",
            url: "https://comex10.com.br",
          },
        }),
      },
    ],
  }),
  component: BlogIndex,
});


function BlogIndex() {
  const router = useRouter();
  const fetchPosts = useServerFn(getPosts);
  const [posts, setPosts] = useState<WPPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts({ data: { perPage: 20 } })
      .then(setPosts)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Falha ao carregar posts"),
      );
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-28 md:pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <header className="max-w-3xl mb-10 md:mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              Blog
            </p>
            <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
              Conteúdo técnico em cadeia de fluidos
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Novidades, artigos e dicas sobre mangueiras hidráulicas,
              equipamentos, bombas e treinamentos.
            </p>
          </header>

          {error && (
            <div className="rounded-xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              Não foi possível carregar os posts agora. Tente novamente em
              instantes.
            </div>
          )}

          {!posts && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-muted/40 h-80 animate-pulse"
                />
              ))}
            </div>
          )}

          {posts && posts.length === 0 && (
            <p className="text-muted-foreground">
              Nenhum post publicado ainda.
            </p>
          )}

          {posts && posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map((p) => (
                <Link
                  onClick={() => router.preloadRoute({ to: "/blog/$slug", params: { slug: p.slug } })}
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg"
                >
                  {p.cover ? (
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={p.cover}
                        alt={p.coverAlt}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/15 to-primary/5" />
                  )}
                  <div className="flex flex-col gap-3 p-5 md:p-6 flex-1">
                    <time className="text-xs uppercase tracking-wider text-muted-foreground">
                      {formatDate(p.date)}
                    </time>
                    <h2 className="text-lg md:text-xl font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                      {p.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {p.excerpt}
                    </p>
                    <span className="mt-auto pt-2 text-sm font-medium text-primary">
                      Ler artigo →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <TranslateButton />
    </div>
  );
}
