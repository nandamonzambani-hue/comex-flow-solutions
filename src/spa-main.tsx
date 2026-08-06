import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { initAnalytics } from "@/lib/analytics";
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

function StaticSite() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#produtos"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Ir para o conteúdo principal
      </a>
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
      <WhatsAppFloat />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StaticSite />);
