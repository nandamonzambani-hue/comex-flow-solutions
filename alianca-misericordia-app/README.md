# Minha Paróquia — Plataforma SaaS multi-paróquia

App mobile (iOS + Android) **único**, no estilo InChurch: várias
paróquias assinam e usam o mesmo app, cada uma com seus próprios
membros, grupos/pastorais, eventos, dízimo e campanhas, conteúdo em
vídeo/texto, downloads, Bíblia, liturgia diária, notificações push e
identidade visual (cores/logo) — tudo isolado por paróquia via Row Level
Security. Veja **`docs/SAAS_MODEL.md`** para como o modelo multi-tenant,
a aprovação de novas paróquias e a assinatura recorrente funcionam.

Construído com **Expo (React Native) + Supabase**.

## Stack

- **App**: Expo SDK 52, TypeScript, expo-router (navegação por arquivos)
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions + RLS)
- **Pagamentos**: Mercado Pago — Pix avulso (dízimo/ofertas dos fiéis) e
  assinatura recorrente via Preapproval (cobrança da paróquia pela
  plataforma) — ambos trocáveis por outro gateway
- **Push**: Expo Push Notifications (APNs/FCM por baixo)
- **Idiomas**: i18next/react-i18next — interface em português, inglês,
  espanhol, italiano e francês, com detecção automática do idioma do
  aparelho e troca manual (ver seção **Idiomas e tradução** abaixo)

## Estrutura

```
parish-app/
  app/                    # telas (expo-router)
    (auth)/                 login, cadastro, onboarding (buscar/criar paróquia)
    (tabs)/                  início, eventos, grupos, dízimo, mais
      more/                   mídia, downloads, notícias, bíblia, liturgia, perfil
    admin/                   painel da paróquia (staff/admin/pastor) + assinatura
    platform-admin/          painel do dono da plataforma (aprovar paróquias, planos)
  src/
    lib/                    supabase client, notificações, localização
    context/                AuthContext, ParishContext (tema por paróquia)
    components/             UI compartilhada (inclui LanguagePicker)
    types/                  tipos do banco
    theme/                  cores
    i18n/                   configuração i18next + dicionários de idioma
  supabase/
    migrations/             schema SQL completo + RLS (inclui camada SaaS)
    seed.sql                dados de exemplo
    functions/               Edge Functions (push, liturgia, bíblia, pagamentos, assinatura)
  docs/                    guias de publicação, privacidade, conteúdo, modelo SaaS
```

## Como rodar localmente

1. **Instale dependências**
   ```bash
   npm install
   ```

2. **Suba o backend Supabase**
   - Crie um projeto em https://supabase.com (grátis para começar).
   - Instale a CLI: `npm install -g supabase`
   - `supabase link --project-ref <seu-project-ref>`
   - `supabase db push` (aplica as migrations em `supabase/migrations`)
   - Rode `supabase/seed.sql` no SQL Editor do painel (dados de exemplo).
   - Deploy das Edge Functions:
     ```bash
     supabase functions deploy send-push-notification
     supabase functions deploy create-payment
     supabase functions deploy payment-webhook
     supabase functions deploy daily-liturgy-sync
     supabase functions deploy bible-sync
     supabase functions deploy create-parish-subscription
     supabase functions deploy subscription-webhook
     ```
   - Configure os segredos das funções:
     ```bash
     supabase secrets set MERCADOPAGO_ACCESS_TOKEN=xxx
     supabase secrets set SUBSCRIPTION_BACK_URL=https://seusite.com/assinatura-confirmada
     supabase secrets set LITURGY_API_URL=https://sua-fonte-de-liturgia
     supabase secrets set BIBLE_API_URL=https://sua-fonte-biblica BIBLE_API_KEY=xxx
     ```
   - Torne-se o primeiro **platform admin** (dono da plataforma) — veja o
     passo a passo em `docs/SAAS_MODEL.md#bootstrap-do-primeiro-platform-admin`.

3. **Configure o app**
   ```bash
   cp .env.example .env
   # preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```

4. **Rode o app**
   ```bash
   npx expo start
   ```
   Escaneie o QR code com o app Expo Go (para testar rápido) ou rode num
   emulador Android/iOS.

   Para um preview rápido sem celular/emulador (bom para conferir telas e
   textos, mas alguns módulos nativos como notificações push não
   funcionam no navegador):
   ```bash
   npm run web
   ```

## Testado

Antes de considerar este código pronto, ele passou por validação real, não
só escrita:

- **Banco de dados**: as 5 migrations + `seed.sql` foram aplicadas contra
  um Postgres real (com um stub mínimo de `auth`/`storage` do Supabase) e
  as políticas de RLS foram testadas com usuários de verdade — membro só
  vê o próprio perfil/doações, staff vê tudo da paróquia, `service_role`
  consegue rodar `increment_campaign_amount` e um membro comum não
  consegue. Isso pegou um bug real: as funções auxiliares `auth_role()` /
  `auth_parish_id()` / `is_staff()` causavam recursão infinita ao
  consultar `profiles` sob RLS — corrigido com `security definer` (ver
  `supabase/migrations/0002_rls_policies.sql`).
- **App**: `npm install`, `tsc --noEmit` e `eslint` rodam limpos, e o app
  inteiro foi empacotado de ponta a ponta com o Metro bundler (`expo
  export`) e aberto num navegador headless — login, troca de idioma em
  tempo real e navegação para a tela de cadastro confirmados
  funcionando, sem erros no console. Isso pegou dependências que
  faltavam no `package.json` (`expo-asset`, `expo-font`, `query-string`)
  e um erro de tipos no helper de tradução de conteúdo (`src/lib/localized.ts`).
- **Camada SaaS multi-paróquia** (`0006_saas_platform.sql`): testada com
  cenários reais de ataque, não só o caminho feliz — usuário tentando se
  auto-promover a admin (bloqueado), paróquia tentando se auto-aprovar
  (bloqueado), reivindicar a paróquia de outra pessoa (bloqueado),
  platform admin aprovando de verdade (funciona), `service_role`
  confirmando assinatura via webhook (funciona). Isso pegou dois bugs
  reais de segurança antes de qualquer paróquia real usar o produto: (1)
  nada impedia um cadastro/edição de perfil de setar `role=admin` por
  conta própria; (2) as triggers de proteção usavam `current_user`, que
  dentro de uma função `security definer` reflete o *dono* da função, não
  quem está chamando — ou seja, a proteção nunca chegava a barrar
  ninguém. Corrigido usando o claim `role` do JWT (o mesmo mecanismo do
  `auth.role()` do Supabase) em vez de `current_user`.

O que **não** foi testado aqui (exige suas próprias contas/dispositivos):
build nativo real via EAS, push notification de ponta a ponta (APNs/FCM),
cobrança Pix e assinatura recorrente reais via Mercado Pago, e o app
rodando em iOS/Android físico.

## Antes de publicar nas lojas

Veja o passo a passo completo em `docs/PUBLISHING_GUIDE.md`. Resumo do que
você precisa que **só você pode fazer** (contas pessoais/da organização):

- [ ] Conta Apple Developer (US$99/ano) — obrigatório para App Store
- [ ] Conta Google Play Console (US$25 taxa única) — obrigatório para Play Store
- [ ] Conta Expo (EAS) para builds — grátis para começar
- [ ] Substituir os ícones placeholder em `assets/` por arte real da paróquia
- [ ] Gateway de pagamento (Mercado Pago) com conta verificada
- [ ] Definir a fonte de texto bíblico (ver `docs/CONTENT_GUIDE.md` — questão de licenciamento)
- [ ] Revisar `docs/PRIVACY_POLICY.md` e `docs/TERMS_OF_SERVICE.md` e publicar num link público (exigido pelas lojas)

## Idiomas e tradução

O app já vem traduzido para **5 idiomas**: português (padrão), inglês,
espanhol, italiano e francês.

- **Interface (botões, menus, telas)**: 100% traduzida. O idioma é
  detectado automaticamente pelo idioma do aparelho no primeiro acesso, e
  pode ser trocado a qualquer momento pelo seletor 🌐 na tela de login ou
  em **Perfil > Idioma**. A escolha manual fica salva no aparelho
  (`AsyncStorage`) e também no perfil do usuário (`profiles.preferred_locale`),
  então sincroniza ao logar num novo aparelho — sem nunca sobrescrever
  uma escolha manual já feita.
- **Conteúdo (notícias, vídeos/textos, grupos, eventos, campanhas)**: cada
  uma dessas tabelas tem uma coluna `translations` (jsonb) opcional. A
  equipe da paróquia escreve o conteúdo principal em português (como
  sempre) e pode, se quiser, abrir a seção "Traduções (opcional)" na tela
  **Admin > Conteúdo** para preencher título/texto em outro idioma. Se não
  houver tradução para o idioma ativo do usuário, o app mostra o texto
  original automaticamente — nenhum conteúdo fica em branco.
- **Bíblia**: a tabela `bible_versions` já suporta várias versões/idiomas
  (`language` por versão). A tela de Bíblia escolhe automaticamente a
  versão que combina com o idioma ativo do app (com seletor manual se
  houver mais de uma). Ver `docs/CONTENT_GUIDE.md` sobre licenciamento por
  idioma.
- **Liturgia diária**: uma linha por `(data, idioma)` em `daily_liturgy`.
  A tela **Admin > Liturgia Diária** tem abas por idioma; a função
  `daily-liturgy-sync` aceita `?locale=` para sincronizar de fontes
  diferentes por idioma.

**Para adicionar um novo idioma:**
1. Crie `src/i18n/locales/<código>.json` copiando `pt-BR.json` e
   traduzindo os valores (mantenha as chaves idênticas).
2. Registre o idioma em `src/i18n/index.ts` (`SUPPORTED_LOCALES` e
   `resources`).
3. Adicione o locale correspondente do `date-fns` em `src/lib/dateLocale.ts`.
4. Pronto — o seletor de idioma, o fallback de conteúdo e a bíblia/liturgia
   já reconhecem qualquer código presente em `SUPPORTED_LOCALES`.

## Papéis de usuário

| Papel | Pode |
|---|---|
| `member` | Ver conteúdo, participar de grupos/eventos, doar, ver seu próprio histórico |
| `group_leader` | Tudo do member + gerenciar seu grupo, criar eventos/conteúdo do grupo |
| `staff` | Tudo + gestão de membros, financeiro, conteúdo geral, notificações |
| `admin` | Tudo do staff + configurações e assinatura da paróquia |
| `pastor` | Mesmo nível de acesso do admin |
| *platform admin* (`platform_admins`, não é um `role`) | Aprova/suspende paróquias, gerencia planos — vê todas as paróquias, não só a própria |

Segurança de dados (quem vê o quê) é garantida por Row Level Security no
Postgres (`supabase/migrations/0002_rls_policies.sql` e
`0006_saas_platform.sql`), não apenas na interface — mesmo que alguém
chame a API diretamente, as regras valem. Isso inclui proteção a nível de
coluna via triggers (ex: ninguém consegue se auto-promover a admin, e só
platform admin aprova uma paróquia) — ver `docs/SAAS_MODEL.md`.
