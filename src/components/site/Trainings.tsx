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
              <div className="flex items-center gap-2 mb-1">
                <Globe2 size={20} className="text-primary" />
                <h3 className="font-display text-xl font-bold text-neutral-900">
                  Agenda de cursos — 1º semestre
                </h3>
              </div>
              <p className="text-sm text-neutral-600 mb-5">
                Datas confirmadas das próximas turmas internacionais.
              </p>
              <ul className="space-y-4">
                {schedule.map((c) => (
                  <li
                    key={c.country}
                    className="p-4 rounded-lg bg-neutral-50 border border-neutral-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl leading-none" aria-hidden>
                        {c.flag}
                      </span>
                      <div className="font-display font-bold text-base text-neutral-900">
                        {c.country}
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {c.sessions.map((s) => (
                        <li
                          key={`${c.country}-${s.date}-${s.language}`}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                            <Calendar size={14} /> {s.date}
                          </span>
                          <span className="text-neutral-700">{s.language}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/5511914900404?text=Tenho%20interesse%20em%20uma%20turma%20de%20treinamento%20da%20Comex10."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Reservar minha vaga <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
