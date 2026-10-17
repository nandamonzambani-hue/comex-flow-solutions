extends Node
## Anúncios e compras no app, atrás de uma interface única.
##
## O jogo só fala com este autoload. Por baixo há um "provedor":
##   - MockProvider: computador, editor e testes. Simula anúncio e compra
##     (com um aviso na tela), para dar para jogar e testar tudo sem conta.
##   - GooglePlayBillingProvider: Android, quando o plugin oficial de
##     faturamento do Google Play estiver instalado (ver docs/monetizacao.md).
##   - Anúncios reais (AdMob) entram pelo mesmo caminho — ver docs.
##
## Regras de bom senso (docs/monetizacao.md):
##   - nunca há anúncio no meio de uma pergunta ou de uma explicação;
##   - o anúncio "entre partidas" aparece no máximo a cada INTERSTITIAL_EVERY partidas;
##   - "Sem anúncios" remove esse anúncio para sempre;
##   - anúncios premiados são sempre opcionais (o jogador escolhe assistir).

signal purchase_finished(product_id: String, ok: bool, message: String)
signal rewarded_finished(placement: String, rewarded: bool)

const INTERSTITIAL_EVERY := 2

var billing: Object ## provedor de compras
var ads: Object ## provedor de anúncios
var test_mode := false ## os testes ligam isto para o mock responder na hora


func _ready() -> void:
	_ensure_providers()


## Também chamado sob demanda: nos testes (godot -s) o autoload pode ser usado antes do _ready.
func _ensure_providers() -> void:
	if billing != null:
		return
	billing = GooglePlayBillingProvider.create_if_available(self)
	if billing == null:
		billing = MockProvider.new(self)
	ads = AdMobProvider.create_if_available(self)
	if ads == null:
		ads = billing if billing is MockProvider else MockProvider.new(self)


func is_simulated() -> bool:
	_ensure_providers()
	return billing is MockProvider


# ---------- compras ----------

func purchase(product_id: String) -> void:
	_ensure_providers()
	var product := Content.product(product_id)
	if product.is_empty():
		purchase_finished.emit(product_id, false, "Produto não encontrado.")
		return
	if product.type == "non_consumable" and Player.owns(product_id):
		purchase_finished.emit(product_id, true, "Você já tem este item.")
		return
	billing.purchase(product)


func restore_purchases() -> void:
	_ensure_providers()
	billing.restore()


## Chamado pelos provedores quando a loja confirma (ou recusa) a compra.
func _on_purchase_result(product_id: String, ok: bool, message := "") -> void:
	if ok:
		Player.grant_product(Content.product(product_id))
	purchase_finished.emit(product_id, ok, message)


func price_label(product_id: String) -> String:
	_ensure_providers()
	var store_price: String = billing.price_for(product_id) if billing.has_method("price_for") else ""
	return store_price if store_price != "" else str(Content.product(product_id).get("price_brl", ""))


# ---------- anúncios ----------

## Deve aparecer um anúncio entre partidas agora?
func should_show_interstitial() -> bool:
	return not Player.ads_removed() and int(Player.data.matches_since_ad) >= INTERSTITIAL_EVERY


## Mostra o anúncio entre partidas (se for a hora) e espera ele fechar.
func show_interstitial_if_due() -> void:
	if not should_show_interstitial():
		return
	_ensure_providers()
	Player.data.matches_since_ad = 0
	Player.save()
	await ads.show_interstitial()


## Anúncio premiado opcional: "continuar", "moedas", "dica".
func show_rewarded(placement: String) -> void:
	_ensure_providers()
	ads.show_rewarded(placement)


func _on_rewarded_result(placement: String, rewarded: bool) -> void:
	rewarded_finished.emit(placement, rewarded)
