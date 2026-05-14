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
import TranslateButton from "@/components/site/TranslateButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "COMEX 10 do Brasil — Mangueiras Hidráulicas, Equipamentos e Bombas Industriais",
      },
      {
        name: "description",
        content:
          "Soluções completas em cadeia de fluidos para indústria, agro, mineração e óleo & gás. Mangueiras ZEC, Next Powertech, equipamentos Uniflex, Transfluid, Held e bombas Marzocchi.",
      },
      {
        property: "og:title",
        content:
          "COMEX 10 do Brasil — Mangueiras Hidráulicas e Cadeia de Fluidos",
      },
      {
        property: "og:description",
        content:
          "Equipamentos, mangueiras, bombas e testes certificados. Atendimento técnico e treinamentos para indústria pesada.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <About />
        <Segments />
        <Products />
        <Services />
        <Trainings />
        <Partners />
        <Contact />
      </main>
      <Footer />
      <TranslateButton />
    </div>
  );
}
