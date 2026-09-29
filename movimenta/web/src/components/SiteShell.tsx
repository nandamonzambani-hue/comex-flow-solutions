import Link from "next/link";
import { appName } from "@/lib/labels";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="container row">
          <Link href="/" className="logo">{appName}</Link>
          <span className="spacer" />
          <Link href="/conta">Minha conta</Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container row">
          <span>© {new Date().getFullYear()} {appName}</span>
          <span className="spacer" />
          <Link href="/privacidade">Privacidade e termos</Link>
          <Link href="/excluir-conta">Excluir conta</Link>
        </div>
      </footer>
    </>
  );
}
