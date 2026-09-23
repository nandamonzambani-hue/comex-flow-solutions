# Guia de Publicação — App Store e Google Play

Este guia cobre o caminho do código pronto até o app disponível nas lojas.
Etapas marcadas **[VOCÊ]** só podem ser feitas por você (dono das contas);
etapas marcadas **[EU/CLI]** podem ser feitas por mim rodando comandos,
desde que você já tenha as contas e credenciais.

## 1. Contas necessárias

| Conta | Custo | Para quê | Quem cria |
|---|---|---|---|
| Apple Developer Program | US$99/ano | Publicar na App Store | **[VOCÊ]** em https://developer.apple.com |
| Google Play Console | US$25 (único) | Publicar na Play Store | **[VOCÊ]** em https://play.google.com/console |
| Expo (conta EAS) | Grátis (plano pago opcional p/ builds mais rápidos) | Compilar o app na nuvem | **[VOCÊ ou EU]** em https://expo.dev |
| Supabase | Grátis para começar | Backend (banco, auth, storage, funções) | **[VOCÊ ou EU]** |
| Mercado Pago (ou outro gateway) | Grátis, taxa por transação | Receber dízimo/doações via Pix | **[VOCÊ]** — exige CNPJ/CPF da paróquia verificado |
| Apple Push (APNs) | Incluso na Apple Developer | Notificações push no iOS | Gerado automaticamente pelo EAS |
| Firebase Cloud Messaging | Grátis | Notificações push no Android | **[VOCÊ]** cria projeto Firebase (ver abaixo) |

## 2. Preparar identidade do app

**[VOCÊ]** decide e me informa:
- Nome final do app (hoje: "Minha Paróquia" — troque em `app.json` > `expo.name`)
- Bundle ID / Package name únicos, ex: `br.org.paroquiaaparecida.app`
  (troque em `app.json` > `ios.bundleIdentifier` e `android.package`)
- Ícone (1024×1024px, sem transparência, sem cantos arredondados — a loja arredonda)
- Splash screen
- Cor primária/secundária da identidade visual

Os arquivos em `assets/` (`icon.png`, `adaptive-icon.png`, `splash.png`,
`favicon.png`, `notification-icon.png`) hoje são **placeholders sólidos**
gerados automaticamente — substitua pelos arquivos finais antes de
publicar.

## 3. Configurar EAS Build

```bash
npm install -g eas-cli
eas login                      # [VOCÊ] faz login com sua conta Expo
eas build:configure            # gera/atualiza eas.json e o projectId
```

Isso preenche `extra.eas.projectId` em `app.json` automaticamente.

## 4. Notificações push (Android/FCM)

1. **[VOCÊ]** crie um projeto em https://console.firebase.google.com
2. Adicione um app Android com o `package` igual ao `android.package` do `app.json`
3. Baixe o `google-services.json` e coloque na raiz de `parish-app/`
4. Rode:
   ```bash
   eas credentials
   # selecione Android > Push Notifications > upload do FCM Server Key ou use FCM V1 com o google-services.json
   ```

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
   - Política de privacidade: link público (publique `docs/PRIVACY_POLICY.md`, ex. como página no site da paróquia)
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
   - Política de privacidade (link público)
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

- [ ] Testado login/cadastro, dízimo (Pix sandbox), push notification, liturgia do dia
- [ ] `.env` de produção aponta para o projeto Supabase de produção (não o de dev)
- [ ] Ícones e splash finais (não os placeholders)
- [ ] Política de privacidade e termos publicados em URL pública
- [ ] Dados de teste/demo removidos ou claramente marcados como exemplo
