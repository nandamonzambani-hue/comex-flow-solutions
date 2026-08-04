import type React from "react";
import treinamentoAsset from "@/assets/treinamento-gates.jpg.asset.json";
const treinamentoImg = treinamentoAsset.url;
import { GraduationCap, Building2, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

type Session = { date: string; language: string };
type CountrySchedule = { code: string; country: string; sessions: Session[] };

const schedule: CountrySchedule[] = [
  {
    code: "DE",
    country: "Alemanha",
    sessions: [
      { date: "22 e 23/04", language: "Alemão" },
      { date: "10 e 11/06", language: "Tcheco" },
      { date: "24 e 25/06", language: "Inglês" },
    ],
  },
  {
    code: "BR",
    country: "Brasil",
    sessions: [{ date: "11 e 12/06", language: "Português" }],
  },
  {
    code: "CO",
    country: "Colômbia",
    sessions: [{ date: "23 e 24/06", language: "Espanhol" }],
  },
];

// Inline SVG flags — funcionam em Chrome/Edge sem depender de emoji
function Flag({ code }: { code: string }) {
  const flags: Record<string, React.ReactElement> = {
    DE: (
      <svg viewBox="0 0 3 2" className="w-full h-full">
        <rect width="3" height="2" fill="#000" />
        <rect y="0.667" width="3" height="0.667" fill="#DD0000" />
        <rect y="1.333" width="3" height="0.667" fill="#FFCE00" />
      </svg>
    ),
    BR: (
      <svg viewBox="0 0 720 504" className="w-full h-full">
        <rect width="720" height="504" fill="#009C3B" />
        <polygon points="360,42 678,252 360,462 42,252" fill="#FFDF00" />
        <circle cx="360" cy="252" r="90" fill="#002776" />
      </svg>
    ),
    CO: (
      <svg viewBox="0 0 3 2" className="w-full h-full">
        <rect width="3" height="2" fill="#FCD116" />
        <rect y="1" width="3" height="0.5" fill="#003893" />
        <rect y="1.5" width="3" height="0.5" fill="#CE1126" />
      </svg>
    ),
  };
  return (
    <span className="inline-block w-8 h-5 rounded-sm overflow-hidden ring-1 ring-white/20 shadow-md shrink-0">
      {flags[code]}
    </span>
  );
}

export function Trainings() {
  return (
    <section
      id="treinamentos"
      className="scroll-mt-24 py-20 md:py-28 lg:min-h-screen lg:flex lg:items-center relative overflow-hidden bg-[#020617] text-white"
    >
      {/* Technical background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-1/4 -left-32 w-[520px] h-[520px] bg-blue-600/20 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-cyan-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Image with neon frame */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-30 blur-xl" />
            <div className="relative overflow-hidden border border-white/10">
              <img
                src={treinamentoImg}
                alt="Treinamento técnico em mangueiras hidráulicas na Comex10"
                loading="lazy"
                width={1280}
                height={800}
                className="w-full h-full object-cover aspect-[5/4] grayscale-[20%] contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#020617]/70 via-transparent to-cyan-500/10" />
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-400/70" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-400/70" />
              {/* HUD chip */}
              <div className="absolute bottom-4 left-4 bg-[#020617]/80 backdrop-blur-md border border-cyan-400/40 px-3 py-1.5">
                <span className="text-[10px] font-mono text-cyan-300 tracking-widest">
                  TRAINING_MODULE.LIVE
                </span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center space-x-3 bg-blue-900/30 border border-blue-500/40 px-4 py-1.5 rounded-sm backdrop-blur-md w-fit mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-cyan-300 font-mono">
                Treinamentos
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 leading-[1.05] tracking-tight">
              <span className="text-slate-100">Capacitação técnica </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
                certificada.
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed font-light max-w-xl">
              Treinamentos para reduzir falhas, aumentar a vida útil dos componentes
              e elevar a segurança da operação — na Comex10 ou na sua empresa.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: GraduationCap,
                  tag: "MODALIDADE 01",
                  title: "Na Comex10",
                  desc: "Conteúdo aprofundado sobre montagem, manutenção e especificação.",
                },
                {
                  icon: Building2,
                  tag: "MODALIDADE 02",
                  title: "In company",
                  desc: "Customizado para seu setor, realizado na sua planta.",
                },
              ].map((m) => (
                <div
                  key={m.title}
                  className="relative group p-6 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                    <m.icon size={20} strokeWidth={2.2} />
                  </div>
                  <div className="text-[9px] font-mono tracking-[0.25em] text-cyan-400 mb-1.5">
                    {m.tag}
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2 text-white">
                    {m.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-cyan-400" /> Certificado oficial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-cyan-400" /> Instrutores especialistas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-cyan-400" /> Conteúdo prático
              </span>
            </div>
          </div>
        </div>

        {/* Agenda */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/40 to-blue-600/40 opacity-30 blur-2xl" />
          <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/10 overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-400/60" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-400/60" />

            <div className="p-6 md:p-8 border-b border-white/10 flex flex-wrap items-end justify-between gap-5">
              <div>
                <div className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 mb-2">
                  AGENDA_GLOBAL // 1º SEMESTRE
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">
                  <span className="text-slate-100">Agenda de cursos </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
                    internacionais
                  </span>
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Datas confirmadas das próximas turmas.
                </p>
              </div>
              <a
                href="https://wa.me/5511914900404?text=Tenho%20interesse%20em%20uma%20turma%20de%20treinamento%20da%20Comex10."
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider skew-x-[-12deg] transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] inline-flex items-center gap-2"
              >
                <span className="inline-block skew-x-[12deg] flex items-center gap-2">
                  Reservar minha vaga <ArrowRight size={14} />
                </span>
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.25em] text-cyan-400 font-mono">
                    <th className="text-left px-6 py-4 font-bold w-1/3">País</th>
                    <th className="text-left px-4 py-4 font-bold w-1/3">Data</th>
                    <th className="text-left px-4 py-4 pr-6 font-bold w-1/3">Idioma</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.flatMap((c) =>
                    c.sessions.map((s, i) => {
                      const isBR = c.code === "BR";
                      return (
                      <tr
                        key={`${c.country}-${s.date}`}
                        className={`border-t border-white/5 transition-colors group ${
                          isBR
                            ? "bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent hover:bg-cyan-500/20"
                            : "hover:bg-cyan-500/5"
                        }`}
                      >
                        <td className={`px-6 py-5 align-middle ${isBR ? "border-l-4 border-cyan-400" : ""}`}>
                          {i === 0 ? (
                            <div className="flex items-center gap-3">
                              <Flag code={c.code} />
                              <div className="flex flex-col">
                                <span className={`font-mono text-[10px] tracking-widest ${isBR ? "text-cyan-300" : "text-cyan-400"}`}>
                                  {c.code}
                                </span>
                                <span className={`font-display font-bold text-base ${isBR ? "text-cyan-200 text-lg" : "text-white"}`}>
                                  {c.country}
                                </span>
                                {isBR && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-300 bg-cyan-400/10 border border-cyan-400/40 px-2 py-0.5 rounded-sm w-fit">
                                    ● Turma em português
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="pl-11 text-slate-600 text-xs font-mono">↳</span>
                          )}
                        </td>
                        <td className="px-4 py-5 align-middle">
                          <span className={`inline-flex items-center gap-2 font-semibold ${isBR ? "text-cyan-200" : "text-cyan-300"}`}>
                            <Calendar size={14} /> {s.date}
                          </span>
                        </td>
                        <td className="px-4 py-5 pr-6 align-middle">
                          <span className={`inline-flex items-center gap-2 ${isBR ? "text-cyan-100 font-semibold" : "text-slate-300"}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-shadow" />
                            {s.language}
                          </span>
                        </td>
                      </tr>
                      );
                    }),
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 md:px-8 py-3 border-t border-white/10 flex justify-between items-center text-[9px] font-mono opacity-70">
              <span className="text-cyan-400 tracking-widest">STATUS: VAGAS_ABERTAS</span>
              <span className="text-slate-500 tracking-widest">COMEX10_ACADEMY_V2.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
