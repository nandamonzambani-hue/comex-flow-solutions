import { Mail, Phone, MapPin, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Solicitação de diagnóstico — ${form.nome}${form.empresa ? " / " + form.empresa : ""}`
    );
    const body = encodeURIComponent(
      `Nome: ${form.nome}\nEmpresa: ${form.empresa}\nE-mail: ${form.email}\nTelefone: ${form.telefone}\n\nProblema:\n${form.mensagem}`
    );
    window.location.href = `mailto:contato@comex10.com.br?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section id="contato" className="py-16 md:py-32 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at top right, var(--primary), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">
              Contato
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-6 leading-tight">
              Vamos resolver
              <br />o seu problema técnico.
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Conte para a nossa equipe o desafio da sua operação. Respondemos em até
              um dia útil com um especialista em cadeia de fluidos.
            </p>

            <div className="space-y-5">
              <a
                href="mailto:contato@comex10.com.br"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Mail className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    contato@comex10.com.br
                  </div>
                </div>
              </a>

              <a href="https://wa.me/5511914900404" target="_blank" rel="noopener" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Phone className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    WhatsApp
                  </div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    11 91490-0404
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    2ª a 6ª — 8:30 às 17:30h
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Endereço
                  </div>
                  <div className="font-medium">R. Marcelo Muller, 415</div>
                  <div className="text-sm text-muted-foreground">
                    São Paulo — SP • CEP 03223-060
                  </div>
                </div>
              </div>

              <a
                href="https://www.instagram.com/comex10dobrasil/"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Instagram className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Instagram
                  </div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    @comex10dobrasil
                  </div>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/company/comex10-do-brasil/"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Linkedin className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    LinkedIn
                  </div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    COMEX 10 do Brasil
                  </div>
                </div>
              </a>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-8 rounded-2xl border border-border bg-surface"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            {submitted ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 flex items-center justify-center mb-4">
                  <ArrowRight className="text-primary" size={28} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Mensagem encaminhada</h3>
                <p className="text-muted-foreground">
                  Abrimos seu cliente de e-mail com a mensagem para
                  <br />
                  <strong className="text-foreground">contato@comex10.com.br</strong>.
                  É só clicar em enviar.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm text-primary hover:underline"
                >
                  Enviar nova solicitação
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="font-display text-2xl font-bold mb-1">Solicite um diagnóstico</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Preencha e nossa equipe responde em até um dia útil.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Nome
                    </label>
                    <input
                      required
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      type="text"
                      className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Empresa
                    </label>
                    <input
                      name="empresa"
                      value={form.empresa}
                      onChange={handleChange}
                      type="text"
                      className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      E-mail
                    </label>
                    <input
                      required
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Telefone
                    </label>
                    <input
                      name="telefone"
                      value={form.telefone}
                      onChange={handleChange}
                      type="tel"
                      className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Conte sobre o problema
                  </label>
                  <textarea
                    required
                    name="mensagem"
                    value={form.mensagem}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Ex.: minha mangueira está rompendo na operação..."
                    className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                >
                  Enviar mensagem <ArrowRight size={16} />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
