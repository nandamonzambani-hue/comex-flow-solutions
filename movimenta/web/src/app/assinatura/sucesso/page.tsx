import { SiteShell } from "@/components/SiteShell";

export default function Sucesso() {
  return (
    <SiteShell>
      <div className="narrow center stack">
        <h1>Assinatura confirmada! 🎉</h1>
        <p className="muted">
          Abra o app e entre com o mesmo e-mail. Se ele já estiver aberto, vá em Perfil e puxe a tela para atualizar.
        </p>
      </div>
    </SiteShell>
  );
}
