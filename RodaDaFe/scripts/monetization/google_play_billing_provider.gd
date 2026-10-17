class_name GooglePlayBillingProvider
extends RefCounted
## Compras reais no Android pelo plugin oficial "GodotGooglePlayBilling".
##
## O plugin não vem neste repositório (é um binário .aar). Instalação em
## docs/monetizacao.md. Sem o plugin, create_if_available() devolve null e o
## jogo usa o MockProvider. Todas as chamadas ao plugin são feitas por nome
## (call/connect), então o projeto compila com ou sem ele.
##
## Escrito para a API 2.x do plugin (sinais connected, purchases_updated,
## purchase_error, product_details_query_completed). Confira os nomes na
## versão instalada antes de publicar.

const SINGLETON := "GodotGooglePlayBilling"

var owner: Node
var plugin: Object
var prices := {}
var _pending := ""


static func create_if_available(monetization: Node) -> GooglePlayBillingProvider:
	if OS.get_name() != "Android" or not Engine.has_singleton(SINGLETON):
		return null
	return GooglePlayBillingProvider.new(monetization, Engine.get_singleton(SINGLETON))


func _init(monetization: Node, singleton: Object) -> void:
	owner = monetization
	plugin = singleton
	plugin.connect("connected", _on_connected)
	plugin.connect("purchases_updated", _on_purchases_updated)
	plugin.connect("purchase_error", _on_purchase_error)
	plugin.connect("product_details_query_completed", _on_details)
	plugin.connect("query_purchases_response", _on_query_purchases)
	plugin.call("startConnection")


func _on_connected() -> void:
	var ids := []
	for p in Content.shop.get("products", []):
		ids.append(p.id)
	plugin.call("queryProductDetails", ids, "inapp")
	plugin.call("queryPurchases", "inapp")


func _on_details(details: Array) -> void:
	for d in details:
		var offer: Dictionary = d.get("one_time_purchase_offer_details", {})
		prices[d.get("product_id", "")] = offer.get("formatted_price", "")


func price_for(id: String) -> String:
	return prices.get(id, "")


func purchase(product: Dictionary) -> void:
	_pending = product.id
	plugin.call("purchase", product.id)


func restore() -> void:
	plugin.call("queryPurchases", "inapp")


func _on_purchases_updated(purchases: Array) -> void:
	for p in purchases:
		_handle_purchase(p)


func _on_query_purchases(result: Dictionary) -> void:
	for p in result.get("purchases", []):
		_handle_purchase(p)
	owner.purchase_finished.emit("", true, "Compras restauradas.")


func _handle_purchase(p: Dictionary) -> void:
	# purchase_state 1 = PURCHASED
	if int(p.get("purchase_state", 0)) != 1:
		return
	var token: String = p.get("purchase_token", "")
	for id in p.get("products", []):
		var product := Content.product(id)
		if product.is_empty():
			continue
		if product.type == "consumable":
			plugin.call("consumePurchase", token)
		elif not p.get("is_acknowledged", false):
			plugin.call("acknowledgePurchase", token)
		owner._on_purchase_result(id, true, "")
	_pending = ""


func _on_purchase_error(code: int, message: String) -> void:
	owner._on_purchase_result(_pending, false, "Compra não concluída (%d): %s" % [code, message])
	_pending = ""
