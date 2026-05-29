import treinamentoImg from "@/assets/treinamento.jpg";
import { GraduationCap, Building2, Globe2, Calendar, ArrowRight } from "lucide-react";

const upcoming = [
  {
    flag: "🇨🇴",
    title: "Turma Colômbia",
    location: "Bogotá — internacional",
    date: "2026 — datas em definição",
  },
  {
    flag: "🇧🇷",
    title: "Turma São Paulo",
    location: "Sede Comex10",
    date: "Próxima turma — consulte vagas",
  },
];

export function Trainings() {
  return (
    <section id="treinamentos" className="py-16 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="relative rounded-2xl overflow-hidden order-2 lg:order-1">
            <img
              src={treinamentoImg}
              alt="Treinamento técnico em mangueiras hidráulicas na Comex10"
              loading="lazy"
              width={1280}
              height={800}
              className="w-full h-full object-cover aspect-[5/4]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-primary/20" />
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">
              Treinamentos
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
              Capacitação técnica certificada.
            </h2>
            <p className="text-base text-muted-foreground mb-8">
              Treinamentos para reduzir falhas, aumentar a vida útil dos componentes
              e elevar a segurança da operação — na Comex10 ou na sua empresa.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-xl border border-border bg-surface">
                <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-3">
                  <GraduationCap size={20} />
                </div>
                <h3 className="font-display text-base font-semibold mb-1">Na Comex10</h3>
                <p className="text-sm text-muted-foreground">
                  Conteúdo aprofundado sobre montagem, manutenção e especificação.
                </p>
              </div>
              <div className="p-5 rounded-xl border border-border bg-surface">
                <div className="w-10 h-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center mb-3">
                  <Building2 size={20} />
                </div>
                <h3 className="font-display text-base font-semibold mb-1">In company</h3>
                <p className="text-sm text-muted-foreground">
                  Customizado para seu setor, realizado na sua planta.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <Globe2 size={18} className="text-primary" />
                <h3 className="font-display text-lg font-semibold">Próximas turmas</h3>
              </div>
              <ul className="space-y-3">
                {upcoming.map((u) => (
                  <li
                    key={u.title}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border"
                  >
                    <span className="text-2xl leading-none" aria-hidden>
                      {u.flag}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{u.title}</div>
                      <div className="text-xs text-muted-foreground">{u.location}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                      <Calendar size={12} /> {u.date}
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/5511914900404?text=Tenho%20interesse%20em%20uma%20turma%20de%20treinamento%20da%20Comex10."
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Solicite agora sua vaga <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
