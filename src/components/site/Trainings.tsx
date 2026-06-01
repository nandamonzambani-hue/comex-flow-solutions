import treinamentoImg from "@/assets/treinamento.jpg";
import { GraduationCap, Building2, Globe2, Calendar, ArrowRight } from "lucide-react";

type Session = { date: string; language: string };
type CountrySchedule = { flag: string; country: string; sessions: Session[] };

const schedule: CountrySchedule[] = [
  {
    flag: "🇩🇪",
    country: "Alemanha",
    sessions: [
      { date: "22 e 23/04", language: "Alemão" },
      { date: "10 e 11/06", language: "Tcheco" },
      { date: "24 e 25/06", language: "Inglês" },
    ],
  },
  {
    flag: "🇧🇷",
    country: "Brasil",
    sessions: [{ date: "11 e 12/06", language: "Português" }],
  },
  {
    flag: "🇨🇴",
    country: "Colômbia",
    sessions: [{ date: "23 e 24/06", language: "Espanhol" }],
  },
];

export function Trainings() {
  return (
    <section id="treinamentos" className="scroll-mt-24 py-16 md:py-28">
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

            <div className="p-6 rounded-xl border border-primary/40 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Globe2 size={20} className="text-primary" />
                <h3 className="font-display text-xl font-bold text-neutral-900">Próximas turmas</h3>
              </div>
              <ul className="space-y-3">
                {upcoming.map((u) => (
                  <li
                    key={u.title}
                    className="flex items-center gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200 hover:border-primary/40 transition-colors"
                  >
                    <span className="text-3xl leading-none flex-shrink-0" aria-hidden>
                      {u.flag}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-base text-neutral-900">{u.title}</div>
                      <div className="text-sm text-neutral-600">{u.location}</div>
                      <div className="flex items-center gap-1.5 text-sm text-primary font-semibold mt-1">
                        <Calendar size={14} /> {u.date}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/5511914900404?text=Tenho%20interesse%20em%20uma%20turma%20de%20treinamento%20da%20Comex10."
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
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
