import type { Metadata, Viewport } from "next";
import "./globals.css";

const name = process.env.NEXT_PUBLIC_APP_NAME || "Movimenta";

export const metadata: Metadata = {
  title: { default: `${name} — treinos e nutrição para mulheres`, template: `%s · ${name}` },
  description: "Treinos em vídeo, cardápios e desafios para você cuidar do corpo no seu ritmo.",
};

export const viewport: Viewport = { themeColor: "#d9466f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
