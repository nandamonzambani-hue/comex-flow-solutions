import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

const features = [
  { title: "Treinos em vídeo", text: "Programas para emagrecer, ganhar força e condicionamento, do iniciante ao avançado." },
  { title: "Nutrição sem complicação", text: "Receitas práticas e cardápios semanais pensados para o seu objetivo." },
  { title: "Evolução visível", text: "Registre peso e medidas e acompanhe sua transformação em gráficos." },
  { title: "Desafios", text: "Metas diárias para criar constância, com check-in a cada dia vencido." },
];

export default function Home() {
  const appStore = process.env.NEXT_PUBLIC_APP_STORE_URL;
  const playStore = process.env.NEXT_PUBLIC_PLAY_STORE_URL;
  return (
    <SiteShell>
      <section className="hero container">
        <h1>Seu corpo, seu ritmo.</h1>
        <p>Treinos, alimentação e desafios num só app, feito para mulheres que querem resultado com leveza.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link href="/assinar" className="btn">Assinar agora</Link>
          {appStore && <a href={appStore} className="btn secondary">App Store</a>}
          {playStore && <a href={playStore} className="btn secondary">Google Play</a>}
        </div>
      </section>
      <section className="features container">
        <div className="grid">
          {features.map((f) => (
            <div key={f.title} className="card feature">
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
