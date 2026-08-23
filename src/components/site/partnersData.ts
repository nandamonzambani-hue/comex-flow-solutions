import uniflexColor from "@/assets/logos/uniflex-color.png.asset.json";
import transfluidOficial from "@/assets/logos/transfluid-oficial.png.asset.json";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeldAsset from "@/assets/logos/held-color.png.asset.json";
import logoNextAsset from "@/assets/logos/next-powertech-color.png.asset.json";


export type PartnerBrand = {
  name: string;
  country: string;
  code: string;
  /** Descrição técnica correta da especialidade da marca. */
  tagline: string;
  logo: string;
  href: string;
  /** Altura do logo dentro do tile branco (todas visualmente equivalentes). */
  h: string;
  /** Fundo do tile: branco por padrão; cor da marca quando o logo é branco. */
  tileBg: string;
  official?: boolean;
  /** Cor da marca usada como acento harmônico na UI. */
  accent: string;
};

/** Logos sempre em CORES ORIGINAIS, sobre tile branco, sem filtros monocolores. */
export const partnerBrands: PartnerBrand[] = [
  {
    name: "Uniflex",
    accent: "var(--brand-uniflex)",
    country: "Alemanha",
    code: "DE",
    tagline:
      "Líder mundial em máquinas de crimpagem, corte e limpeza de mangueiras hidráulicas.",
    logo: uniflexColor.url,
    href: "https://www.uniflex.de/",
    h: "h-12 md:h-14 w-auto",
    tileBg: "transparent",
    official: true,
  },
  {
    name: "ZEC",
    accent: "var(--brand-zec)",
    country: "Itália",
    code: "IT",
    tagline:
      "Especialista em mangueiras termoplásticas e de alta pressão — thermoplastic tubing and hoses.",
    logo: logoZec,
    href: "https://zecspa.com/",
    h: "h-11 md:h-12 w-auto",
    tileBg: "transparent",
    official: true,
  },
  {
    name: "Next Powertech",
    accent: "var(--brand-next)",
    country: "Itália",
    code: "IT",
    tagline: "Mangueiras industriais high-tech para reposição e montagem técnica.",
    logo: logoNextAsset.url,
    href: "https://www.powertechhoses.com/our-products",
    h: "h-10 md:h-12 w-auto",
    tileBg: "transparent",
    official: true,
  },
  {
    name: "Marzocchi Pompe",
    accent: "var(--brand-marzocchi)",
    country: "Itália",
    code: "IT",
    tagline: "Bombas e motores de engrenagens de alta performance e eficiência.",
    logo: logoMarzocchi,
    href: "https://www.marzocchipompe.com/en/",
    h: "h-10 md:h-12 w-auto",
    tileBg: "transparent",
    official: true,
  },
  {
    name: "Transfluid",
    accent: "var(--brand-transfluid)",
    country: "Alemanha",
    code: "DE",
    tagline:
      "Fabricante de dobradores de tubos de alta precisão — tbend, tform, tcut e tmotion.",
    logo: transfluidOficial.url,
    href: "https://www.transfluid.de/",
    h: "h-12 md:h-14 w-auto",
    tileBg: "transparent",
    official: true,
  },
  {
    name: "Gebr. Held",
    accent: "var(--brand-held)",
    country: "Alemanha",
    code: "DE",
    tagline:
      "Bancadas de teste de impulso e ferramentas HFW para fundição de alta precisão.",
    logo: logoHeldAsset.url,
    href: "https://held-test-stands.de/downloads.htm",
    h: "h-14 md:h-16 w-auto",
    tileBg: "transparent",
    official: true,
  },
];
