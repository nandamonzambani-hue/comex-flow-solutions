import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import TranslateButton from "@/components/site/TranslateButton";
import { fetchPostBySlug, formatDate } from "@/lib/wordpress";

const SITE_URL = "https://comex10.com.br";

export const Route = createFileRoute("/blog_/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    const url = `${SITE_URL}/blog/${params.slug}`;
    if (!post) {
      const fallbackTitle = `${params.slug.replace(/-/g, " ")} — Blog COMEX 10`;
      return {
        meta: [
          { title: fallbackTitle },
          {
            name: "description",
            content:
              "Artigo do blog COMEX 10 do Brasil sobre cadeia de fluidos, mangueiras hidráulicas, equipamentos e treinamentos.",
          },
          { property: "og:url", content: url },
          { property: "og:type", content: "article" },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }

    const description =
      post.excerpt?.slice(0, 160) ||
      "Artigo do blog COMEX 10 do Brasil sobre cadeia de fluidos, mangueiras hidráulicas, equipamentos e treinamentos.";
    const title = `${post.title} — Blog COMEX 10`;

    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: post.title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "COMEX 10 do Brasil" },
      { property: "article:published_time", content: post.date },
      { name: "twitter:card", content: post.cover ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: post.title },
      { name: "twitter:description", content: description },
    ];
    if (post.cover) {
      meta.push(
        { property: "og:image", content: post.cover },
        { property: "og:image:alt", content: post.coverAlt },
        { name: "twitter:image", content: post.cover },
      );
    }

    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description,
            datePublished: post.date,
            ...(post.cover ? { image: [post.cover] } : {}),
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            publisher: {
              "@type": "Organization",
              name: "COMEX 10 do Brasil",
              url: SITE_URL,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-28 md:pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="rounded-xl border border-border bg-muted/40 p-8 text-center">
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
        </div>
      </main>
      <Footer />
      <TranslateButton />
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-28 md:pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="rounded-xl border border-border bg-muted/40 p-8 text-center">
            <h1 className="text-2xl font-semibold">Não foi possível carregar o post</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <TranslateButton />
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();

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
        </article>
      </main>
      <Footer />
      <TranslateButton />
    </div>
  );
}
