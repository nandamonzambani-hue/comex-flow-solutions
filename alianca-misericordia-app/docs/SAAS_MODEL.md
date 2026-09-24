# Modelo SaaS multi-paróquia

Este app não é mais "o app de uma paróquia" — é um produto que **várias
paróquias assinam e personalizam**, todas dentro do mesmo app publicado
nas lojas (estilo InChurch). Uma paróquia = um "tenant": tem seus próprios
membros, grupos, eventos, conteúdo e cores, isolados das demais por Row
Level Security no Postgres.

## Por que um app único (e não um app por paróquia)

Decisão tomada: **um único app nas lojas**, com um fluxo de "encontrar ou
cadastrar minha paróquia" no primeiro acesso, em vez de publicar um app
com marca própria para cada cliente. Dois motivos práticos:

1. **Apple proíbe, na prática, publicar vários apps quase idênticos sob a
   mesma conta de desenvolvedor** (App Store Review Guideline 4.3 —
   "Spam"). Fazer isso direito exigiria o programa B2B da Apple (Custom
   App Distribution / Apple Business Manager), que é burocrático e pensado
   para apps internos de empresas, não para vender um produto a centenas
   de clientes.
2. Manutenção: com um app só, uma correção de bug ou uma funcionalidade
   nova chega pra todas as paróquias de uma vez. Com um app por cliente,
   cada atualização é uma nova submissão de revisão em cada loja, por
   cliente.

Se no futuro fizer sentido oferecer "app com minha marca" como um plano
premium para paróquias grandes, isso pode ser adicionado depois (branded
builds via EAS) sem quebrar o modelo atual — o design já foi pensado pra
isso (ver seção "Evoluções possíveis" no fim).

## Papéis (camadas de permissão)

Existem **duas hierarquias independentes**:

| Camada | Tabela/campo | Escopo |
|---|---|---|
| Papel dentro da paróquia | `profiles.role` (member, group_leader, staff, admin, pastor) | Só dentro da paróquia da pessoa (`profiles.parish_id`) |
| Dono da plataforma | `platform_admins` | Todas as paróquias — é você/sua equipe, quem vende e opera o produto |

Uma pessoa pode ser as duas coisas (ex: você mesmo, sendo admin da
paróquia demo E platform admin), mas normalmente são grupos diferentes.

## Onboarding: como uma paróquia entra no app

Depois de criar a conta (nome/e-mail/senha, sem paróquia ainda), a pessoa
cai no hub de onboarding (`app/(auth)/onboarding.tsx`) com duas opções:

### A) Entrar numa paróquia que já existe
- Por **código de convite** (`join_code`, ex: `APARECIDA-7F2K` — gerado
  automaticamente pro admin da paróquia divulgar nos grupos de WhatsApp,
  cartazes etc.)
- Ou por **busca** (nome/cidade)

Isso só funciona para paróquias com `status` em `active` ou `trial`. A
pessoa vira `member` direto (auto-atribuição de qualquer outro papel é
bloqueada no banco — ver `enforce_profile_self_role_guard` na migration
`0006_saas_platform.sql`).

### B) Cadastrar uma paróquia nova (self-service)
A pessoa preenche nome/cidade/telefone da paróquia. Ao enviar:
1. Cria a paróquia com `status = 'pending_approval'` (o banco força isso
   independente do que o app mande — ver `enforce_parish_governance_columns`).
2. A pessoa chama a função `claim_parish_admin()`, que a torna `admin`
   **só daquela paróquia que ela mesma acabou de criar** — o banco
   verifica isso (não dá pra reivindicar a administração de uma paróquia
   de outra pessoa, nem reivindicar duas vezes).
3. A paróquia fica com acesso liberado (é possível usar o app), mas com
   um aviso na tela inicial até você aprovar.

## Aprovação (você, o platform admin)

Em **Mais > Painel da Plataforma > Paróquias**, filtre por "Pendentes",
abra a paróquia e escolha um plano — isso aprova a paróquia (`status`
passa a `trial`) e começa a contagem do período de teste gratuito do
plano escolhido (`subscription_plans.trial_days`).

### Bootstrap do primeiro platform admin

Ninguém consegue virar platform admin pelo próprio app (por design — veja
a policy `platform_admins_manage_platform_admin`). O primeiro precisa ser
criado direto no banco, uma vez, depois que a pessoa já tiver uma conta
normal no app:

```sql
-- rode no SQL Editor do Supabase Studio, com a pessoa já cadastrada no app
insert into platform_admins (profile_id)
values ('COLE_AQUI_O_UUID_DO_PROFILE');
```

Depois disso, essa pessoa já pode promover outras direto pelo painel (ou
por SQL, do mesmo jeito).

## Assinatura recorrente (Mercado Pago)

Cada paróquia assina um plano (`subscription_plans`) via a API de
**Preapproval** do Mercado Pago (cobrança automática recorrente — é
diferente do Pix avulso usado pras doações dos fiéis).

1. Configure o segredo nas Edge Functions:
   ```bash
   supabase secrets set MERCADOPAGO_ACCESS_TOKEN=xxx
   supabase secrets set SUBSCRIPTION_BACK_URL=https://seusite.com/assinatura-confirmada
   ```
2. Deploy:
   ```bash
   supabase functions deploy create-parish-subscription
   supabase functions deploy subscription-webhook
   ```
3. No painel do Mercado Pago, cadastre o webhook para o evento
   `subscription_preapproval` apontando para
   `<SUPABASE_URL>/functions/v1/subscription-webhook`.
4. O admin da paróquia assina em **Admin > Assinatura**: escolhe um
   plano, é levado ao checkout do Mercado Pago (cartão), e quando
   autoriza, o webhook marca `parishes.status = 'active'` automaticamente.

Gerenciar os planos vendidos (nome, preço, dias de teste, limite de
membros) fica em **Painel da Plataforma > Planos**.

## Limitação conhecida (documentada de propósito)

Hoje, se uma paróquia fica **suspensa** ou **cancelada** (deixou de
pagar), os dados dela (eventos, grupos, doações, conteúdo) continuam
tecnicamente acessíveis pra quem já é membro — só a tela inicial mostra
um aviso pro admin. As políticas de RLS ainda não bloqueiam a leitura de
conteúdo com base em `parishes.status`.

Isso foi uma escolha consciente de escopo: implementar "suspender = trava
tudo" direito exige decidir regras de negócio (quanto tempo de carência,
o que acontece com o histórico financeiro, se o admin ainda pode exportar
os dados antes de perder acesso, etc.) que são decisão de produto, não só
código. Quando você definir essas regras, é questão de adicionar
`and exists (select 1 from parishes p where p.id = parish_id and p.status in ('active','trial'))`
nas policies relevantes (`events`, `groups`, `media_content`, etc.).

## Evoluções possíveis (não implementado ainda)

- **App com marca própria por paróquia** (plano premium): usar EAS Build
  com variáveis de ambiente por paróquia (ícone, nome, cores) pra gerar
  builds separados — a infraestrutura de cores/logo por paróquia já
  existe (`parishes.primary_color/secondary_color/logo_url`), falta só a
  automação de build.
- **Limite de membros por plano**: `subscription_plans.max_members` já
  existe no schema, mas nada ainda impede uma paróquia de passar do
  limite — precisa de uma trigger ou verificação no cadastro de membros.
- **E-mail transacional**: hoje a aprovação/rejeição de uma paróquia não
  dispara e-mail nenhum pra quem cadastrou — só aparece no app. Um
  próximo passo natural é integrar Resend/SendGrid nas Edge Functions
  relevantes.
