# Guia de Publicação — App Store e Google Play

Este guia cobre o caminho do código pronto até o app disponível nas lojas.
Etapas marcadas **[VOCÊ]** só podem ser feitas por você (dono das contas);
etapas marcadas **[EU/CLI]** podem ser feitas por mim rodando comandos,
desde que você já tenha as contas e credenciais.

Este é um app **único que várias paróquias assinam** (não um app por
paróquia) — por isso você só publica/mantém uma listagem em cada loja,
mesmo vendendo para centenas de clientes. Veja `docs/SAAS_MODEL.md` para
entender o modelo multi-paróquia antes de publicar.

## 1. Contas necessárias

| Conta | Custo | Para quê | Quem cria |
|---|---|---|---|
| Apple Developer Program | US$99/ano | Publicar na App Store | **[VOCÊ]** em https://developer.apple.com |
| Google Play Console | US$25 (único) | Publicar na Play Store | **[VOCÊ]** em https://play.google.com/console |
| Expo (conta EAS) | Grátis (plano pago opcional p/ builds mais rápidos) | Compilar o app na nuvem | **[FEITO]** — projeto `logos-agencia-digital/minha-paroquia`, projectId real já no `app.json` |
| Supabase | Grátis para começar | Backend (banco, auth, storage, funções) | **[VOCÊ ou EU]** |
| Mercado Pago (ou outro gateway) | Grátis, taxa por transação | Receber dízimo/doações via Pix | **[FEITO]** — ver `docs/SAAS_MODEL.md`, falta confirmar redirect URI/webhook no painel |
| Apple Push (APNs) | Incluso na Apple Developer | Notificações push no iOS | Gerado automaticamente pelo EAS |
| Firebase Cloud Messaging | Grátis | Notificações push no Android | **[FEITO]** — projeto `minha-paroquia-67a40`, `google-services.json` commitado, chave FCM V1 já nas credenciais do EAS |
| Resend | Grátis até 3.000 e-mails/mês | Envio de e-mail (confirmação de cadastro, recuperação de senha) | **[FEITO]** — ver seção 1.1 abaixo |

### 1.1 E-mail transacional (SMTP) — já configurado

O Supabase, por padrão, usa um servidor de e-mail próprio com limite muito
baixo (poucos e-mails/hora) — inviável em produção. Isso já foi resolvido:

- Conta Resend criada, domínio `mail.logosagencia.com` verificado (SPF/DKIM).
- SMTP customizado configurado no projeto Supabase (Authentication → Emails
  → SMTP Settings): host `smtp.resend.com`, porta `587` (a 465 falha — o
  mailer do Supabase espera STARTTLS, não SSL implícito), usuário `resend`,
  senha = API key do Resend, remetente `naoresponda@mail.logosagencia.com`.
- Limite interno de e-mail do Supabase (`rate_limit_email_sent`, um valor
  separado do SMTP em si, fácil de não perceber) subido de 2/hora (padrão)
  para 100/hora.
- Testado de ponta a ponta: cadastro → e-mail de confirmação → perfil
  criado automaticamente, sem restrição de destinatário.

Se precisar trocar a API key do Resend ou o domínio remetente no futuro,
mexa em Authentication → Emails → SMTP Settings no painel do Supabase (ou
via API de gerenciamento: `PATCH /v1/projects/{ref}/config/auth`).

## 2. Identidade do app — definida (05/10)

- **Nome final**: "Minha Paróquia" (`app.json` > `expo.name`)
- **Bundle ID / Package**: `br.com.logosagenciadigital.minhaparoquia`
  (`app.json` > `ios.bundleIdentifier` e `android.package`)
- Ícone (1024×1024px, sem transparência, sem cantos arredondados — a loja arredonda)
- Splash screen
- Cor primária/secundária da identidade visual

Os arquivos em `assets/` (`icon.png`, `adaptive-icon.png`, `splash.png`,
`favicon.png`, `notification-icon.png`) já têm uma identidade visual real
(cruz dourada sobre bordô) — pronto para publicar como está, ou substitua
pela arte definitiva da paróquia/marca se quiser algo diferente.

## 3. EAS Build — já configurado

Projeto criado em `@logos-agencia-digital/minha-paroquia`
(https://expo.dev/accounts/logos-agencia-digital/projects/minha-paroquia),
`owner` e `extra.eas.projectId` já preenchidos no `app.json` (via
`eas init`). Se precisar reconfigurar no futuro:

```bash
eas login                      # [VOCÊ] faz login com sua conta Expo
eas build:configure
```

## 4. Notificações push (Android/FCM) — chave FCM V1 já configurada

Projeto Firebase `minha-paroquia-67a40` criado e a chave de conta de
serviço (FCM V1) já está nas credenciais do EAS (verificável com
`eas credentials` > Android > production > Google Service Account >
Push Notifications) — isso não depende do package e não precisa repetir.

**Pendente**: o `android.package` final (`br.com.logosagenciadigital.minhaparoquia`,
definido em 05/10) ainda não tem um app Android registrado nesse
projeto Firebase — o `google-services.json` atual no repo é do package
antigo (placeholder) e precisa ser trocado por um novo, gerado
registrando um app Android com o package final no mesmo projeto
Firebase (Configurações do projeto > Geral > Adicionar app). Sem isso,
o Firebase recusa inicializar no build final ("No matching client
found for package name").

No iOS, o EAS gera e gerencia o certificado APNs automaticamente durante o build.

## 5. Build de produção

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

O build do iOS pede sua Apple ID e time (Apple Team ID) — preencha em
`eas.json` > `submit.production.ios` antes, ou informe quando solicitado.

## 6. Enviar para as lojas

### Google Play

1. **[VOCÊ]** crie o app no Google Play Console, preencha a ficha da loja:
   - Categoria: Estilo de vida ou Comunicação
   - Classificação de conteúdo (questionário do próprio Play Console)
   - Política de privacidade: link público — já publicada em
     https://claude.ai/artifact/LwN3X8Psko77uSWRNjsY4v#privacidade
     (lembre de deixar o link compartilhável no menu Share da página)
   - Screenshots (mín. 2, recomendo 4-8) em pelo menos um tamanho de tela
2. Gere uma **conta de serviço** (Service Account) no Google Cloud e baixe o JSON:
   `parish-app/secrets/google-play-service-account.json` (caminho já referenciado em `eas.json`)
3. **[EU/CLI]**:
   ```bash
   eas submit --platform android --profile production
   ```
   Primeiro envio costuma precisar ser manual (upload do `.aab`) pois a
   Play Store exige pelo menos uma versão publicada manualmente antes de
   aceitar submissões automatizadas.

### App Store

1. **[VOCÊ]** crie o app em https://appstoreconnect.apple.com:
   - Nome, categoria (Estilo de vida), classificação etária
   - Política de privacidade (link público) — mesma URL acima:
     https://claude.ai/artifact/LwN3X8Psko77uSWRNjsY4v#privacidade
   - Screenshots para iPhone (obrigatório) — várias resoluções
   - Descrição, palavras-chave, textos promocionais
   - **Formulário de privacidade (App Privacy)**: declare coleta de nome,
     e-mail, dados financeiros (doações) e localização (se usar endereço)
2. **[EU/CLI]**:
   ```bash
   eas submit --platform ios --profile production
   ```
3. A Apple faz revisão manual (1-3 dias úteis geralmente). Pontos que costumam gerar rejeição num app de doações:
   - **Apple exige** que doações/contribuições religiosas usem gateway de
     pagamento externo (Pix, cartão via Mercado Pago) — isso é permitido
     desde que enquadrado como "doação de caridade", não "compra de
     conteúdo digital" (que exigiria In-App Purchase). Deixe claro no
     texto do app que são doações voluntárias à paróquia.
   - Conta de teste: inclua usuário/senha de demonstração nas notas para o revisor.

## 7. Depois de aprovado

- Configure `eas update` (OTA updates) para publicar correções de JS sem
  esperar nova revisão da loja, para mudanças que não mexam em código nativo.
- Monitore crashes com Sentry ou o próprio painel do EAS.
- Repita `eas build` + `eas submit` a cada nova versão (`app.json` >
  `expo.version` incrementado, `eas.json` já tem `autoIncrement: true`
  para o build number).

## Idiomas na ficha da loja

O app em si já roda em português, inglês, espanhol, italiano e francês
(ver seção "Idiomas e tradução" do `README.md`). Isso é diferente de
**localizar a ficha da loja** (nome, descrição, screenshots) — ambas as
lojas permitem cadastrar essas informações em vários idiomas:

- **App Store Connect**: em "App Information", clique em "+" ao lado dos
  idiomas para adicionar cada localização da ficha (nome, subtítulo,
  descrição, palavras-chave, screenshots por idioma).
- **Google Play Console**: em "Presença na loja > Localizações", adicione
  cada idioma com seus textos e imagens.

Você não precisa localizar a ficha em todos os 5 idiomas do app — comece
com português (e inglês, se a paróquia tiver membros internacionais) e
adicione mais conforme a demanda.

## Checklist rápido antes de qualquer submissão

- [x] Cadastro/confirmação de e-mail/criação de perfil testados de ponta a ponta (SMTP Resend)
- [x] Bíblia (73 livros, Figueiredo), banners e quiz aplicados no banco de produção
- [x] Liturgia diária automática (Edge Function corrigida + cron semanal via pg_cron, horizonte de 60 dias sempre à frente)
- [x] Mercado Pago Connect por paróquia implementado e configurado em
      produção (schema, Edge Functions, UI em Admin > Financeiro,
      `MERCADOPAGO_ACCESS_TOKEN`/`CLIENT_ID`/`CLIENT_SECRET` já setados) —
      falta só cada paróquia conectar sua própria conta em Admin > Financeiro
- [x] Projeto EAS (`logos-agencia-digital/minha-paroquia`) e Firebase
      (`minha-paroquia-67a40`, FCM V1) configurados — push notification
      só pode ser testado de verdade num build real em dispositivo físico
- [ ] Testado login, dízimo (Pix — agora desbloqueado, falta uma paróquia de
      teste conectar o Mercado Pago em Admin > Financeiro e fazer uma doação
      de teste), push notification (precisa de um build EAS instalado num
      aparelho — não dá em simulador)
- [x] `.env` de produção aponta para o projeto Supabase de produção (não o de dev)
- [x] Rebuild + redeploy do site (Cloudflare Pages) — publicado em
      https://paroquia-app-preview.pages.dev com tudo em dia (avisos,
      Mercado Pago Connect, banners, quiz, ícones)
- [x] Ícones e splash finais (cruz dourada sobre bordô, não mais placeholders)
- [x] Política de privacidade e termos publicados em URL pública —
      https://claude.ai/artifact/LwN3X8Psko77uSWRNjsY4v (lembre de compartilhar publicamente)
- [ ] Dados de teste/demo removidos ou claramente marcados como exemplo
