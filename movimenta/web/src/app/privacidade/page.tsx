import { SiteShell } from "@/components/SiteShell";
import { appName } from "@/lib/labels";

export const metadata = { title: "Privacidade e termos" };

// Modelo inicial — revise com um profissional antes de publicar.
export default function Privacidade() {
  return (
    <SiteShell>
      <div className="container prose" style={{ padding: "16px" }}>
        <h1>Política de privacidade e termos de uso</h1>
        <p className="muted small">Modelo inicial. Revise com assessoria jurídica e preencha os dados da empresa.</p>
        <h2>1. Quem somos</h2>
        <p>{appName} é operado por [RAZÃO SOCIAL], CNPJ [CNPJ], contato [E-MAIL DE CONTATO].</p>
        <h2>2. Dados que coletamos</h2>
        <p>Nome, e-mail, objetivo, nível, altura, medidas corporais e peso que você informar, histórico de treinos,
          favoritos, identificador do dispositivo para notificações e dados técnicos de uso e falhas (Firebase).
          Pagamentos no app são processados pela Apple (App Store) ou pelo Google (Google Play) e, no site, pelo
          Stripe; não armazenamos números de cartão.</p>
        <h2>3. Para que usamos</h2>
        <p>Prestar o serviço, personalizar sugestões de treino, mostrar sua evolução, enviar notificações que você
          autorizou, processar a assinatura e melhorar o app. Medidas corporais são dados sensíveis de saúde e são
          tratadas com base no seu consentimento, que pode ser revogado a qualquer momento.</p>
        <h2>4. Compartilhamento</h2>
        <p>Com operadores necessários ao serviço: Supabase (banco de dados e autenticação), Cloudflare (vídeos),
          Google Firebase (notificações e estatísticas), RevenueCat (validação das assinaturas das lojas),
          Apple e Google (compras no app), Stripe (pagamentos no site) e Vercel (site).</p>
        <h2>5. Seus direitos (LGPD)</h2>
        <p>Você pode acessar, corrigir e excluir seus dados. A exclusão da conta pode ser feita no app (Perfil →
          Excluir minha conta) ou em <a href="/excluir-conta">/excluir-conta</a>.</p>
        <h2>6. Assinatura e cancelamento</h2>
        <p>A assinatura é renovada automaticamente até ser cancelada. Assinaturas feitas no app são gerenciadas e
          canceladas nas configurações da App Store ou do Google Play; as feitas no site, em <a href="/conta">Minha
          conta</a>. O cancelamento vale ao fim do período já pago. Reembolsos de compras no app seguem as regras da
          Apple e do Google. Nas compras pelo site vale o direito de arrependimento de 7 dias (CDC, art. 49).</p>
        <h2>7. Saúde</h2>
        <p>O conteúdo tem caráter informativo e não substitui avaliação médica, nutricional ou de educador físico.
          Consulte um profissional antes de iniciar atividades físicas ou mudanças na alimentação.</p>
      </div>
    </SiteShell>
  );
}
