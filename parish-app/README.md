# Minha Paróquia — App para Paróquias e Comunidades Católicas

App mobile (iOS + Android) no estilo InChurch, para gestão completa de uma
paróquia: membros, grupos/pastorais, eventos, dízimo e campanhas, conteúdo
em vídeo/texto, downloads, Bíblia, liturgia diária e notificações push.

Construído com **Expo (React Native) + Supabase**. Pensado para ser
white-label: troque cores, nome e dados da paróquia em `parishes` e o app
serve para qualquer paróquia — permitindo vender o mesmo produto para
várias comunidades.

## Stack

- **App**: Expo SDK 52, TypeScript, expo-router (navegação por arquivos)
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions + RLS)
- **Pagamentos**: Mercado Pago (Pix) — trocável por outro gateway
- **Push**: Expo Push Notifications (APNs/FCM por baixo)

## Estrutura

```
parish-app/
  app/                    # telas (expo-router)
    (auth)/                 login, cadastro
    (tabs)/                  início, eventos, grupos, dízimo, mais
      more/                   mídia, downloads, notícias, bíblia, liturgia, perfil
    admin/                   painel administrativo (staff/admin/pastor)
  src/
    lib/                    supabase client, notificações
    context/                AuthContext
    components/             UI compartilhada
    types/                  tipos do banco
    theme/                  cores
  supabase/
    migrations/             schema SQL completo + RLS
    seed.sql                dados de exemplo
    functions/               Edge Functions (push, liturgia, bíblia, pagamento)
  docs/                    guias de publicação, privacidade, conteúdo
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
     ```
   - Configure os segredos das funções:
     ```bash
     supabase secrets set MERCADOPAGO_ACCESS_TOKEN=xxx
     supabase secrets set LITURGY_API_URL=https://sua-fonte-de-liturgia
     supabase secrets set BIBLE_API_URL=https://sua-fonte-biblica BIBLE_API_KEY=xxx
     ```

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

## Papéis de usuário

| Papel | Pode |
|---|---|
| `member` | Ver conteúdo, participar de grupos/eventos, doar, ver seu próprio histórico |
| `group_leader` | Tudo do member + gerenciar seu grupo, criar eventos/conteúdo do grupo |
| `staff` | Tudo + gestão de membros, financeiro, conteúdo geral, notificações |
| `admin` | Tudo do staff + configurações da paróquia |
| `pastor` | Mesmo nível de acesso do admin |

Segurança de dados (quem vê o quê) é garantida por Row Level Security no
Postgres (`supabase/migrations/0002_rls_policies.sql**`), não apenas na
interface — mesmo que alguém chame a API diretamente, as regras valem.
