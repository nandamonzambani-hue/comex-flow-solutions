import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Segments } from "@/components/site/Segments";
import { Products } from "@/components/site/Products";
import { Services } from "@/components/site/Services";
import { Trainings } from "@/components/site/Trainings";
import { Partners } from "@/components/site/Partners";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

const SITE_URL = "https://www.comex10.com.br";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Comex10 do Brasil — Mangueiras Hidráulicas e Equipamentos",
      },
      {
        name: "description",
        content:
          "Distribuidor oficial Uniflex, ZEC, Transfluid, Held, Marzocchi e Next Powertech. Mangueiras hidráulicas, equipamentos, bombas, testes e treinamentos técnicos.",
      },
      {
        property: "og:title",
        content: "Comex10 do Brasil — Mangueiras Hidráulicas e Cadeia de Fluidos",
      },
      {
        property: "og:description",
        content:
          "Equipamentos, mangueiras, bombas e testes certificados. Atendimento técnico e treinamentos para indústria pesada.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:site_name", content: "Comex10 do Brasil" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Comex10 do Brasil — Mangueiras Hidráulicas e Cadeia de Fluidos",
      },
      {
        name: "twitter:description",
        content:
          "Distribuidor oficial das marcas líderes em cadeia de fluidos. Equipamentos, mangueiras, bombas, testes e treinamentos.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      {
        name: "keywords",
        content:
          "mangueiras hidráulicas, prensa de mangueiras, Uniflex, ZEC, Transfluid, Gebr. Held, Marzocchi Pompe, Next Powertech, cadeia de fluidos, treinamento hidráulico",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: "Comex10 do Brasil",
          inLanguage: "pt-BR",
          description:
            "Distribuidor oficial em cadeia de fluidos: mangueiras hidráulicas, equipamentos, bombas, testes e treinamentos técnicos.",
          publisher: { "@id": `${SITE_URL}/#organization` },
        }),
      },
    ],
  }),
  component: Index,
});


function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollReveal />
      <Header />
      <main>
        <Hero />
        <div className="chroma-rail" aria-hidden="true" />
        <About />
        <Segments />
        <Products />
        <Services />
        <Trainings />
        <Partners />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

