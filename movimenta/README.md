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
  App Store / Google Play + RevenueCat (assinatura no app)  ·  Stripe (opcional, site)
  Firebase (push, analytics, crashlytics)
```

| Pasta | O que tem |
|---|---|
| `supabase/migrations` | Banco completo com RLS: perfis, assinaturas, vídeos, exercícios, treinos, histórico, medidas, receitas, cardápios, desafios, favoritos, dispositivos e notificações |
| `supabase/functions` | `revenuecat-webhook` e `revenuecat-sync` (compras na App Store e no Google Play); `create-checkout`, `customer-portal` e `stripe-webhook` (Stripe, só no site); `stream-upload`, `stream-token`, `stream-webhook`, `stream-sync` e `stream-delete` (Cloudflare Stream); `send-push` (FCM); `delete-account` |
| `supabase/tests` | Testes das regras de acesso (28 verificações) |
| `supabase/functions/tests` | Testes da sincronização com o RevenueCat |
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

## 3. Stripe (opcional: assinatura pelo site)

As compras no app são configuradas na seção "Compras dentro do app", mais abaixo. O Stripe só é necessário se você também quiser vender pelo site. Se não quiser, deixe `/assinar` sem planos (`NEXT_PUBLIC_PRICE_*` vazios).

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

## Compras dentro do app (App Store e Google Play)

As assinaturas no app são vendidas **pela própria loja**: App Store no iPhone e Google Play no Android. Isso segue as regras de pagamento das duas lojas para conteúdo digital. O **RevenueCat** valida os recibos das duas lojas e avisa o Supabase.

```
App ──compra──► App Store / Google Play ──recibo──► RevenueCat
 │                                                     │ webhook
 └──► revenuecat-sync (acelera)            revenuecat-webhook
                    └──────► store_subscriptions ◄─────┘
                               has_active_subscription() libera treinos, vídeos, cardápios
```

- A aluna é identificada no RevenueCat pelo **mesmo id do Supabase**. Por isso a assinatura vale em qualquer aparelho em que ela entrar com a mesma conta.
- O servidor **não confia no conteúdo do webhook**: a cada evento, busca o estado atual na API do RevenueCat. Isso cobre renovação, cancelamento, reembolso, período de carência, troca de plano e transferência.
- O site continua vendendo pelo Stripe, **opcionalmente** e só na web. O app **nunca** mostra link para o site.
- Quem assinar pelo site também tem acesso no app. Quem já assina pela loja não consegue pagar de novo no site.

### Passo a passo

**1. App Store Connect**
1. Em *Business*, aceite o **Paid Apps Agreement** e preencha os dados bancários e fiscais. Sem isso, as compras não funcionam, nem em teste.
2. No app, abra *Monetization → Subscriptions* e crie um **grupo de assinaturas** (ex.: "Movimenta Premium").
3. Crie os produtos `movimenta_mensal` e `movimenta_anual`, com preço, nome e descrição em português. Se quiser teste grátis, configure uma *Introductory Offer*.
4. Crie uma chave de **In-App Purchase** em *Users and Access → Integrations* (ela vai para o RevenueCat).
5. No Xcode, abra *Runner → Signing & Capabilities* e adicione **In-App Purchase**.

**2. Google Play Console**
1. Crie o app com o pacote `br.com.movimenta.movimenta` e envie uma primeira versão para o teste interno. Os produtos só podem ser criados depois de haver um build com a biblioteca de faturamento.
2. Em *Monetize → Subscriptions*, crie `movimenta_mensal` e `movimenta_anual`, cada um com um *base plan*. O teste grátis é uma *offer*.
3. Em *Monetize → Monetization setup*, abra o pagamento.
4. Crie uma **conta de serviço** no Google Cloud com acesso ao Play Console (ela vai para o RevenueCat). Siga o guia do RevenueCat.

**3. RevenueCat** (app.revenuecat.com)
1. Crie o projeto e adicione os apps **App Store** e **Play Store**, com as chaves dos passos anteriores.
2. Em *Entitlements*, crie o entitlement `premium` e associe os 4 produtos (2 por loja).
3. Em *Offerings*, deixe a oferta `default` como *current*, com os pacotes **$rc_monthly** e **$rc_annual**. O app mostra exatamente o que estiver aqui, então dá para mudar planos e preços sem publicar nova versão.
4. Em *Integrations → Webhooks*:
   - URL: `https://SEU_REF.supabase.co/functions/v1/revenuecat-webhook`
   - *Authorization header*: invente um segredo longo, por exemplo `Bearer 3f9c...`, e use o **mesmo valor** em `REVENUECAT_WEBHOOK_AUTH`.
5. Em *API keys*:
   - as chaves **públicas** (`appl_...` e `goog_...`) vão no `env.json` do app;
   - a chave **secreta** (`sk_...`) vai em `REVENUECAT_SECRET_API_KEY`, nas funções, e nunca no app.

**4. Testes de compra**
- **iPhone:**
  1. Crie *Sandbox testers* no App Store Connect.
  2. No aparelho, entre com o testador em *Ajustes → App Store → Conta sandbox*.
  3. Rode o app pelo Xcode ou pelo TestFlight.
  4. No sandbox, as renovações são aceleradas: 1 mês ≈ 5 minutos.
- **Android:**
  1. Adicione seu e-mail em *License testing* no Play Console.
  2. Instale o app pelo link do **teste interno**. Instalado via `flutter run`, as compras não aparecem.
- Compras de teste também liberam o acesso. Isso é necessário para a equipe de revisão da Apple e do Google.

### Checklist da revisão das lojas (já implementado no app)
- Nome, duração e preço de cada plano, com teste grátis quando houver, na tela de assinatura.
- Texto sobre renovação automática e como cancelar, com links para os **termos de uso** e a **política de privacidade**.
  - Os termos usam o EULA padrão da Apple. Troque por `TERMS_URL` no `env.json` se tiver termos próprios.
  - No App Store Connect, informe a URL da política (`/privacidade`).
- Botão **Restaurar compras**.
- Link **Gerenciar assinatura**, que abre as assinaturas da App Store ou do Google Play.
- **Exclusão de conta** no app e na web. Se houver assinatura da loja ativa, o app avisa que ela precisa ser cancelada na loja, porque a exclusão não interrompe a cobrança da Apple ou do Google.
- Nenhum link ou botão para comprar fora da loja.

## Custos (referência do planejamento)

| Serviço | Início | Quando crescer |
|---|---|---|
| Supabase | Grátis (500 MB de banco, 50 mil usuárias ativas/mês) | Pro: US$ 25/mês |
| Cloudflare Stream | US$ 5 por 1.000 min armazenados + US$ 1 por 1.000 min assistidos | Escala por uso |
| Firebase (FCM, Analytics, Crashlytics) | Grátis | Grátis |
| Vercel | Hobby (grátis) | Pro: US$ 20/mês (obrigatório para uso comercial) |
| Apple / Google (compras no app) | 15% no Small Business Program da Apple (até US$ 1 mi/ano) e 15% em assinaturas no Google Play | 30% na Apple acima de US$ 1 mi/ano |
| RevenueCat | Grátis até US$ 2.500/mês de receita | 1% da receita acima disso |
| Stripe (só vendas pelo site) | 3,99% + R$ 0,39 por cobrança + 0,7% do Billing | — |
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
cd supabase/functions && deno check */index.ts && deno lint && deno test --allow-env --allow-net tests/
# Site/painel
cd web && npm install && npm run build
# Regras de acesso (Postgres local): aplica tests/supabase_stub.sql, migrations e tests/rls_test.sql
```
