# Anúncios e compras no app

O jogo é **gratuito**. A receita vem de:

| Fonte | Como aparece | Onde no código |
|---|---|---|
| Anúncio entre partidas (intersticial) | depois do resultado, a cada 2 partidas | `Monetization.show_interstitial_if_due()` |
| Anúncio premiado (opcional) | "continuar com mais uma vida" e "moedas grátis" (3 por dia) | `Monetization.show_rewarded()` |
| **Sem anúncios** (não consumível) | R$ 9,90 de referência | `data/shop.json` → `remover_anuncios` |
| **Pacote: Santos do Brasil** (não consumível) | R$ 6,90 | `pacote_santos_brasil` (libera 20 perguntas) |
| **Moedas** (consumíveis) | 300 por R$ 4,90 · 1.000 por R$ 12,90 | `moedas_300`, `moedas_1000` |

Os preços do JSON são só referência: na loja de verdade vale o preço
cadastrado na Play Console / App Store Connect, e o app mostra o preço que a
loja devolver.

## Princípios (valem sempre)

- Nunca há anúncio **durante** uma pergunta, explicação ou oração; só entre partidas.
- Anúncio premiado é sempre escolha do jogador.
- Não vendemos nada de caráter religioso (bênçãos, indulgências, "graças"); só recursos do jogo.
- Sem caixas de recompensa aleatórias; preço em reais visível antes de comprar.
- Moedas também se ganham jogando (acertos, medalhas, vitória), então ninguém precisa pagar para jogar.
- Público pode incluir crianças e adolescentes: na Play Console, preencha o público-alvo com cuidado; se incluir menores de 13, o app entra nas **Políticas para Famílias** (só SDKs de anúncio certificados, anúncios não personalizados). No Brasil, observar a LGPD e o ECA Digital (Lei 15.211/2025).

## Como está montado

O jogo só conversa com o autoload `Monetization`. Por baixo há provedores:

- `MockProvider` — computador, editor e testes. Mostra "Anúncio de teste" / "Compra de teste". É o que roda hoje.
- `GooglePlayBillingProvider` — compras reais no Android. Ativa sozinho quando o plugin oficial estiver instalado.
- `AdMobProvider` — anúncios reais. Ponto de ligação pronto; precisa do plugin e da conta AdMob.

Nada disso cobra nem mostra anúncio real até os passos abaixo serem feitos
com as contas da Logos (eu não crio contas nem aceito termos em nome de vocês).

## Passo a passo para ligar de verdade (Android)

### 1. Contas
1. **Google Play Console** (a mesma do Minha Paróquia): criar o app "Roda da Fé", pacote `br.com.logosagenciadigital.rodadafe`.
2. **AdMob** (https://admob.google.com): criar o app e dois blocos de anúncio: *Intersticial* e *Premiado*. Copiar o **ID do app** e os **IDs dos blocos**.
3. Na Play Console → *Monetizar → Produtos → Produtos no app*: criar `remover_anuncios`, `pacote_santos_brasil`, `moedas_300`, `moedas_1000` (mesmos ids de `data/shop.json`).

### 2. Compras (Google Play Billing)
1. Baixe o plugin oficial **GodotGooglePlayBilling** compatível com Godot 4.6 (https://github.com/godot-sdk-integrations/godot-google-play-billing/releases) e copie para `RodaDaFe/addons/` conforme o README do plugin; ative em *Projeto → Configurações → Plugins*.
2. Em *Projeto → Exportar → Android*: marque **Use Gradle Build**, formato **AAB**, `min_sdk` 24 e `target_sdk` exigido pela Play (hoje 35+), e instale o modelo de build (*Projeto → Instalar modelo de build Android*).
3. `GooglePlayBillingProvider` detecta o singleton `GodotGooglePlayBilling` e passa a valer. **Confira os nomes de sinais/métodos da versão instalada** (o código usa os da API 2.x: `connected`, `purchases_updated`, `purchase_error`, `product_details_query_completed`, `query_purchases_response`) e ajuste se mudou.
4. Teste com uma conta de *testador de licença* na Play Console (compras de teste não cobram).

### 3. Anúncios (AdMob)
1. Instale o plugin **Godot AdMob** (Poing Studios), versão para Godot 4.6 (https://github.com/poingstudios/godot-admob-plugin), seguindo o README dele.
2. Ponha o **ID do app AdMob** onde o plugin pede (AndroidManifest / configurações do plugin) e os IDs dos blocos em `data/ads.json` (hoje estão os IDs de **teste** públicos do Google).
3. Em `scripts/monetization/admob_provider.gd`, troque o `return null` por uma ponte com três funções: `show_interstitial()` (carrega e mostra; espera fechar) e `show_rewarded(placement)` (chama `Monetization._on_rewarded_result(placement, true)` só quando o plugin avisar que a recompensa foi ganha; `false` se o jogador fechar antes).
4. Peça consentimento (UMP) para usuários na UE/Reino Unido e configure *anúncios não personalizados* se o público incluir crianças.
5. **Nunca clique nos próprios anúncios reais** (a conta pode ser suspensa). Use os IDs de teste até a publicação.

### 4. iOS
Mesma lógica com StoreKit e AdMob iOS; exige Mac com Xcode e conta Apple Developer.

## Política de privacidade

Com anúncios, a loja exige política de privacidade pública e o formulário
de **Segurança dos dados** (o SDK do AdMob coleta identificador de
publicidade). Dá para reaproveitar o modelo do Minha Paróquia
(`parish-app/docs/PRIVACY_POLICY.md`) acrescentando a seção de anúncios.
