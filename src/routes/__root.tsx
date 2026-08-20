import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { initAnalytics, trackPageView } from "@/lib/analytics";

import appCss from "../styles.css?url";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://www.comex10.com.br";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Comex10 do Brasil",
  alternateName: ["Comex10", "Comex Dez", "Comex10"],
  url: SITE_URL,
  logo: `${SITE_URL}/logo-comex10.png`,
  image: OG_IMAGE,
  description:
    "Parceira técnica em cadeia de fluidos: equipamentos Uniflex, Transfluid e Held, mangueiras ZEC e Next Powertech, bombas Marzocchi, testes e treinamentos certificados.",
  email: "contato@comex10.com.br",
  telephone: "+55-11-91490-0404",
  foundingDate: "1998",
  address: {
    "@type": "PostalAddress",
    streetAddress: "R. Marcelo Müller, 415",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    postalCode: "03223-060",
    addressCountry: "BR",
  },
  sameAs: [
    "https://www.instagram.com/comex10dobrasil/",
    "https://www.linkedin.com/company/comex10-do-brasil/",
    "https://wa.me/5511914900404",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+55-11-91490-0404",
      contactType: "sales",
      areaServed: "BR",
      availableLanguage: ["Portuguese"],
    },
  ],
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#localbusiness`,
  name: "Comex10 do Brasil",
  image: OG_IMAGE,
  url: SITE_URL,
  telephone: "+55-11-91490-0404",
  email: "contato@comex10.com.br",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "R. Marcelo Müller, 415",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    postalCode: "03223-060",
    addressCountry: "BR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:30",
      closes: "17:30",
    },
  ],
  areaServed: { "@type": "Country", name: "Brasil" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Comex10 do Brasil",
  url: SITE_URL,
  inLanguage: "pt-BR",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0099ff" },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "googlebot", content: "index,follow" },
      { name: "format-detection", content: "telephone=no" },
      {
        title:
          "Comex10 — Mangueiras Hidráulicas, Equipamentos Uniflex, Bombas Marzocchi e Treinamentos",
      },
      {
        name: "description",
        content:
          "Comex10 do Brasil: parceira técnica em cadeia de fluidos. Equipamentos Uniflex, Transfluid e Held, mangueiras ZEC e Next Powertech, bombas Marzocchi, testes e treinamentos certificados.",
      },
      {
        name: "keywords",
        content:
          "mangueiras hidráulicas, cadeia de fluidos, Uniflex, Transfluid, Held, ZEC, Next Powertech, Marzocchi, bombas hidráulicas, bancada de teste, Comex10, hidráulica industrial, treinamento hidráulica",
      },
      { name: "author", content: "Comex10 do Brasil" },
      { name: "geo.region", content: "BR-SP" },
      { name: "geo.placename", content: "São Paulo" },
      { property: "og:site_name", content: "Comex10 do Brasil" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:url", content: SITE_URL },
      {
        property: "og:title",
        content: "Comex10 — Cadeia de Fluidos, Mangueiras e Equipamentos Hidráulicos",
      },
      {
        property: "og:description",
        content:
          "Da identificação do problema à solução: equipamentos, mangueiras, bombas, testes e treinamentos certificados das marcas líderes globais.",
      },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Comex10 — Soluções em cadeia de fluidos" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@comex10dobrasil" },
      {
        name: "twitter:title",
        content: "Comex10 — Cadeia de Fluidos, Mangueiras e Equipamentos Hidráulicos",
      },
      {
        name: "twitter:description",
        content:
          "Equipamentos, mangueiras, bombas, testes e treinamentos certificados das marcas líderes globais.",
      },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/logo-comex10.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(websiteJsonLd),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { pathname } = useRouterState({ select: (s) => s.location });

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return (
    <>
      <a
        href="#produtos"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Ir para o conteúdo principal
      </a>
      <Outlet />
    </>
  );
}

