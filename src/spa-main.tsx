import { createRoot } from "react-dom/client";
import "./styles.css";
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
      <WhatsAppFloat />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StaticSite />);
