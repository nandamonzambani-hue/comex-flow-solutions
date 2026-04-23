import { Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="font-display text-2xl font-bold mb-3">
              COMEX<span className="text-primary">10</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Consultoria especializada em cadeia de fluidos: equipamentos, mangueiras,
              bombas, testes e treinamentos.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/comex10dobrasil/"
                target="_blank"
                rel="noopener"
                aria-label="Instagram da COMEX 10"
                className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-background border border-border hover:border-primary hover:text-primary transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/company/comex10-do-brasil/"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn da COMEX 10"
                className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-background border border-border hover:border-primary hover:text-primary transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Navegação
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="#produtos" className="hover:text-primary transition-colors">Produtos</a></li>
              <li><a href="#segmentos" className="hover:text-primary transition-colors">Segmentos</a></li>
              <li><a href="#servicos" className="hover:text-primary transition-colors">Serviços</a></li>
              <li><a href="#treinamentos" className="hover:text-primary transition-colors">Treinamentos</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Catálogos
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="/catalogos/Catalogo_Uniflex.pdf" target="_blank" rel="noopener" className="hover:text-primary transition-colors">Uniflex</a></li>
              <li><a href="/catalogos/ZEC_Catalogo_America_Latina.pdf" target="_blank" rel="noopener" className="hover:text-primary transition-colors">ZEC</a></li>
              <li><a href="/catalogos/Company_Profile_Marzocchi.pdf" target="_blank" rel="noopener" className="hover:text-primary transition-colors">Marzocchi</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} COMEX 10 do Brasil. Todos os direitos reservados.
          </div>
          <div className="text-xs text-muted-foreground">
            Cadeia de fluidos • Mangueiras • Equipamentos • Treinamentos
          </div>
        </div>
      </div>
    </footer>
  );
}
