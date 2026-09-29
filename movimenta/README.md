# Movimenta — app de treinos e nutrição para mulheres

A arquitetura foi pensada para **100 mil alunas, mas pagando infraestrutura de 100 no começo**:
nada roda em servidor próprio, tudo é serviço gerenciado com plano gratuito ou cobrança por uso, e
os vídeos **não** passam nem ficam no servidor do app.

```
                ┌──────────────┐         ┌───────────────────────┐
  App Flutter ──┤   Supabase   ├─────────┤ Edge Functions (Deno) │
  (iOS/Android) │ Auth + Postgres (RLS)  │ Stripe · Stream · FCM │
                │ Storage (imagens)      └──────────┬────────────┘
                └──────┬───────┘                    │
                       │                            │ URLs assinadas
  Site + painel ───────┘                  ┌─────────▼──────────┐
  (Next.js na Vercel)                     │ Cloudflare Stream  │◄── upload direto do
                                          │ (vídeos HLS)       │    navegador da admin
                                          └────────────────────┘
  Stripe Billing (assinatura, site)  ·  Firebase (push, analytics, crashlytics)
```

| Pasta | O que tem |
|---|---|
| `supabase/migrations` | Banco completo com RLS: perfis, assinaturas, vídeos, exercícios, treinos, histórico, medidas, receitas, cardápios, desafios, favoritos, dispositivos e notificações |
| `supabase/functions` | `create-checkout`, `customer-portal` e `stripe-webhook` (Stripe); `stream-upload`, `stream-token`, `stream-webhook`, `stream-sync` e `stream-delete` (Cloudflare Stream); `send-push` (FCM); `delete-account` |
| `supabase/tests` | Testes das regras de acesso (21 verificações) |
| `supabase/seed.sql` | Conteúdo de exemplo |
| `app/` | App Flutter: login, cadastro, onboarding, início, treinos com player (séries e descanso), exercícios em vídeo, favoritos, receitas, cardápios, evolução (peso, medidas, gráfico), histórico, desafios, perfil, assinatura e exclusão de conta |
| `web/` | Next.js: site público (landing, `/assinar`, `/conta`, `/redefinir-senha`, `/excluir-conta`, `/privacidade`) e painel `/admin` (alunas, treinos, exercícios, vídeos, receitas, cardápios, desafios, notificações) |

---

## 1. Supabase

1. Crie um projeto em supabase.com, na região São Paulo.
2. Instale a CLI e vincule o projeto:
   ```bash
   cd movimenta
   supabase link --project-ref SEU_REF
   supabase db push                          # aplica as migrations
   psql "$DATABASE_URL" -f supabase/seed.sql # opcional: conteúdo de exemplo
   ```
3. Em **Authentication → URL Configuration**:
   - em Site URL, informe `https://seudominio.com.br`;
   - em Redirect URLs, cadastre `https://seudominio.com.br/**`.
4. **Crie a primeira administradora.** Cadastre-se pelo app ou pelo site e rode no SQL Editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'voce@seudominio.com.br');
   ```
   Pelo app ou pela API ninguém consegue se promover: um gatilho no banco bloqueia.

## 2. Cloudflare Stream (vídeos)

1. Ative o Stream no painel da Cloudflare.
2. Crie um **API Token** com a permissão *Stream: Edit*.
3. Crie a chave de assinatura dos links (uma vez só):
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/stream/keys
   ```
   Guarde `result.id` em `CF_STREAM_KEY_ID` e `result.jwk` em `CF_STREAM_KEY_JWK`.
4. Configure o webhook, que avisa quando o vídeo termina de processar:
   ```bash
   curl -X PUT -H "Authorization: Bearer $TOKEN" \
     https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/stream/webhook \
     --data '{"notificationUrl":"https://SEU_REF.supabase.co/functions/v1/stream-webhook"}'
   ```
   O `result.secret` vai em `CF_STREAM_WEBHOOK_SECRET`.
5. `CF_STREAM_CUSTOMER_CODE` é o trecho `customer-XXXX` que aparece nas URLs dos vídeos.

Todos os vídeos são enviados com `requireSignedURLs`. O app pede um link temporário, válido por 4 horas, e só recebe o link quem tem direito: vídeos de treinos gratuitos, assinantes e administração.

## 3. Stripe (assinatura)

1. Crie o produto e os preços recorrentes, por exemplo mensal e anual, em BRL.
2. Em **Developers → Webhooks**, aponte para `https://SEU_REF.supabase.co/functions/v1/stripe-webhook` com os eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
3. Em **Settings → Billing → Customer portal**, ative o cancelamento e a troca de cartão.

## 4. Firebase (push, analytics, crashlytics)

1. Crie o projeto no Firebase e adicione os apps Android (`br.com.movimenta.movimenta`) e iOS.
2. No app, rode `flutterfire configure`.
3. No iOS, envie a chave APNs em *Project settings → Cloud Messaging* e ative *Push Notifications* e *Background Modes → Remote notifications* no Xcode.
4. Gere uma conta de serviço (*Project settings → Service accounts*) e converta: `base64 -w0 conta.json`. O resultado vai em `FIREBASE_SERVICE_ACCOUNT_BASE64`.

## 5. Segredos e deploy das funções

```bash
cp supabase/functions/.env.example supabase/functions/.env   # preencha
supabase secrets set --env-file supabase/functions/.env
supabase functions deploy
```

## 6. Site e painel (Vercel)

1. Importe o repositório na Vercel com **Root Directory** = `movimenta/web`.
2. Cadastre as variáveis de `web/.env.example`.
3. Aponte o domínio do Registro.br para a Vercel.
4. Use o mesmo domínio em `SITE_URL` (funções) e no app (`env.json`).

O painel fica em `https://seudominio.com.br/admin`.

## 7. App

Veja `app/README.md`. O resumo:
- `cp env.example.json env.json`
- `flutter run --dart-define-from-file=env.json`

---

## ⚠️ Regras das lojas sobre a venda da assinatura

- **Apple (App Store).** Conteúdo digital vendido *dentro* do app precisa usar a compra da Apple (IAP, diretriz 3.1.1). Este projeto vende a assinatura **no site, com Stripe**. No iOS o app **não mostra botão nem link de compra** (`AppConfig.showExternalPurchaseLink`), apenas libera o acesso de quem já assinou.
  - A diretriz 3.1.3(b), para serviços multiplataforma, prevê que o conteúdo também esteja disponível por IAP. Por isso há risco de rejeição na revisão.
  - O caminho mais seguro é adicionar a assinatura via IAP no iOS, por exemplo com RevenueCat gravando na mesma tabela `subscriptions`. A outra opção é confirmar as regras vigentes para o Brasil antes de enviar.
- **Google Play.** Assinaturas digitais usam o Google Play Billing, salvo programas de faturamento alternativo, que variam por país. O link de compra externo no Android vem **desligado** (`ANDROID_EXTERNAL_PURCHASE=false`).
- **Exclusão de conta.** Já está implementada no app (Perfil → Excluir minha conta) e na web (`/excluir-conta`), atendendo à Apple, ao Google Play e à LGPD.

## Custos (referência do planejamento)

| Serviço | Início | Quando crescer |
|---|---|---|
| Supabase | Grátis (500 MB de banco, 50 mil usuárias ativas/mês) | Pro: US$ 25/mês |
| Cloudflare Stream | US$ 5 por 1.000 min armazenados + US$ 1 por 1.000 min assistidos | Escala por uso |
| Firebase (FCM, Analytics, Crashlytics) | Grátis | Grátis |
| Vercel | Hobby (grátis) | Pro: US$ 20/mês (obrigatório para uso comercial) |
| Stripe | 3,99% + R$ 0,39 por cobrança + 0,7% do Billing | — |
| Lojas | Apple US$ 99/ano · Google US$ 25 (uma vez) | — |

Confira os preços nos sites oficiais antes de lançar: eles mudam com frequência.

## Por que aguenta 100 mil alunas

- **Vídeo.** O vídeo sai direto da CDN da Cloudflare (HLS adaptativo). O Supabase só entrega textos e JSON pequenos.
- **Segurança no banco.** O acesso é controlado por RLS e funções `security definer`, então não existe um servidor de API para escalar.
- **Consultas.** São paginadas (painel de alunas, listas) e indexadas por `user_id`/data.
- **Push em massa.** "Todas" usa tópico do FCM, que é uma chamada só, qualquer que seja o número de alunas.
- **Imagens.** Ficam no Storage com cache de 1 ano e são carregadas com cache no app (`cached_network_image`).

## Testes

```bash
# App
cd app && flutter analyze && flutter test
# Funções
cd supabase/functions && deno check */index.ts && deno lint
# Site/painel
cd web && npm install && npm run build
# Regras de acesso (Postgres local): aplica tests/supabase_stub.sql, migrations e tests/rls_test.sql
```
