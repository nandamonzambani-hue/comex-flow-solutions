# Porto Lotado

Quebra-cabeça para celular: organize os contêineres por cor até cada navio levar uma cor só.
Um único código gera o app de **Android** e o de **iOS** (Capacitor). A receita vem de **anúncios** (AdMob) e **compras no app** (RevenueCat).

O jogo vive na pasta `porto-lotado/` deste repositório e é um projeto independente do site: tem seu próprio `package.json`.

## Rodar no computador

Requisito: Node.js 22 ou mais novo.

```bash
cd porto-lotado
npm install
npm run dev      # abre em http://localhost:5173 e mostra um endereço de rede para abrir no celular
npm test         # testes das regras e da geração de níveis
npm run build    # gera a pasta dist/
```

No navegador, os anúncios e a loja são **simulados**: nada é cobrado e nenhum anúncio real aparece.

## Instalar no celular Android sem configurar nada

A cada envio que mexe na pasta `porto-lotado/`, o GitHub Actions compila um APK de teste:

1. No GitHub, abra **Actions → Porto Lotado → a execução mais recente**.
2. Em **Artifacts**, baixe `porto-lotado-debug-apk`.
3. Descompacte, envie o `.apk` para o celular e instale (o Android vai pedir para permitir "fontes desconhecidas").

## Gerar os apps nas suas máquinas

| | Android | iOS |
|---|---|---|
| Ferramenta | Android Studio | Xcode (precisa de um Mac) |
| Comando | `npm run android` | `npm run ios` |

Os dois comandos compilam o jogo, copiam para o projeto nativo (`npx cap sync`) e abrem a IDE.
Sem Mac, dá para compilar o iOS na nuvem com o [Codemagic](https://codemagic.io) ou o Ionic Appflow.

## Como o código está organizado

```
src/
  game/rules.ts       regras, solucionador e gerador de níveis (sem interface, 100% testado)
  game/colors.ts      cores e símbolos dos contêineres
  services/ads.ts     AdMob: consentimento LGPD/GDPR, ATT no iOS, anúncio com recompensa e entre níveis
  services/purchases.ts  RevenueCat: produtos, compra, restauração
  services/device.ts  salvamento, vibração e sons
  config.ts           IDs de anúncio, produtos e economia do jogo (moedas, frequência de anúncios)
  main.ts             interface e fluxo do jogo
android/  ios/        projetos nativos gerados pelo Capacitor
```

Os níveis são gerados por semente: o nível 37 é igual para todo mundo, e cada nível é verificado pelo solucionador antes de ser entregue.

## Monetização

| Onde | Tipo | Configuração |
|---|---|---|
| Dica, +1 navio, mais "desfazer", dobrar moedas | Anúncio com recompensa | `VITE_ADMOB_REWARDED_*` |
| A cada 3 níveis, a partir do 3º | Anúncio entre níveis | `VITE_ADMOB_INTERSTITIAL_*` e `ECONOMY` em `src/config.ts` |
| Remover anúncios | Compra não consumível (`no_ads`) | RevenueCat, direito de acesso `no_ads` |
| Pacote de 500 moedas | Compra consumível (`coins_500`) | RevenueCat |
| Casco dourado | Item comprado com moedas | `ECONOMY.goldHullPrice` |

"Remover anúncios" tira só os anúncios entre níveis. Os anúncios com recompensa continuam, porque o jogador escolhe assistir.

### Ligar os anúncios de verdade (AdMob)

1. Crie uma conta em [admob.google.com](https://admob.google.com) e cadastre dois apps (Android e iOS).
2. Em cada app, crie um bloco **Premiado** e um **Intersticial**.
3. Copie `.env.example` para `.env` e preencha os IDs dos blocos.
4. Troque o **ID do app** (o que tem `~`) em:
   - `android/app/src/main/AndroidManifest.xml` (`com.google.android.gms.ads.APPLICATION_ID`)
   - `ios/App/App/Info.plist` (`GADApplicationIdentifier`)
5. Configure a mensagem de consentimento em **AdMob → Privacidade e mensagens** (exigida para LGPD/GDPR).
6. Ao publicar, use `VITE_ADMOB_TESTING=false`. **Nunca clique em anúncios reais do próprio app**: o Google pode suspender a conta.
7. No iOS, adicione a lista completa de `SKAdNetworkItems` recomendada pelo Google ao `Info.plist`.

### Ligar as compras de verdade (RevenueCat)

1. Crie os produtos `no_ads` (não consumível) e `coins_500` (consumível) no Google Play Console e no App Store Connect.
2. Em [revenuecat.com](https://www.revenuecat.com), crie o projeto, ligue as duas lojas, crie o direito de acesso `no_ads` e uma *offering* atual com os dois pacotes.
3. Coloque as chaves públicas do SDK em `VITE_REVENUECAT_ANDROID` e `VITE_REVENUECAT_IOS`.

Sem chave, o app usa a loja simulada. **Não publique um build sem as chaves**: a loja simulada entrega os itens de graça.

## Antes de publicar

- [ ] Trocar `appId` em `capacitor.config.ts` (ex.: `com.suaempresa.portolotado`). Depois da primeira publicação, ele não muda mais.
- [ ] Ícone e tela de abertura: `npx @capacitor/assets generate` a partir de `assets/icon.png` (1024×1024) e `assets/splash.png`.
- [ ] IDs reais do AdMob e chaves do RevenueCat (seções acima).
- [ ] Política de privacidade publicada num endereço público (rascunho em `docs/privacidade.md`).
- [ ] Classificação etária: público **13+**, não "infantil". Apps para crianças têm regras de anúncio bem mais restritas.
- [ ] Google Play: conta de desenvolvedor (US$ 25, pagamento único), formulário de "Segurança dos dados" e teste fechado com 12 testadores por 14 dias (exigido para contas pessoais novas).
- [ ] App Store: Apple Developer Program (US$ 99/ano), "Rótulos de privacidade" e pedido de rastreamento (ATT) já configurado.
- [ ] Analytics (ex.: Firebase) para medir retenção D1/D7 e receita por usuário antes de investir em divulgação.
