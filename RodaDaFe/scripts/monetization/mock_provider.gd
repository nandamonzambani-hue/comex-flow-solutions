class_name MockProvider
extends RefCounted
## Provedor simulado: usado no computador, no editor e nos testes.
## Mostra uma tela "Anúncio de teste" / "Compra de teste" para o fluxo ficar
## visível, sem cobrar nada e sem internet.

var owner: Node


func _init(monetization: Node) -> void:
	owner = monetization


func purchase(product: Dictionary) -> void:
	if owner.test_mode:
		owner._on_purchase_result(product.id, true, "Compra de teste")
		return
	var ok: bool = await _dialog("Compra de teste", "%s — %s\n\nNo celular, aqui abre a tela de pagamento do Google Play / App Store." % [product.title, product.get("price_brl", "")], "Simular compra")
	owner._on_purchase_result(product.id, ok, "Compra de teste" if ok else "Compra cancelada")


func restore() -> void:
	owner.purchase_finished.emit("", true, "Nada a restaurar no modo de teste.")


func price_for(_id: String) -> String:
	return ""


func show_interstitial() -> void:
	if owner.test_mode:
		return
	await _dialog("Anúncio de teste", "Aqui aparece um anúncio entre as partidas.\nCompre \"Sem anúncios\" na loja para tirar.", "Fechar")


func show_rewarded(placement: String) -> void:
	if owner.test_mode:
		owner._on_rewarded_result(placement, true)
		return
	var ok: bool = await _dialog("Anúncio premiado de teste", "Assista até o fim para ganhar a recompensa.", "Assisti até o fim")
	owner._on_rewarded_result(placement, ok)


func _dialog(title: String, body: String, confirm: String) -> bool:
	var tree := owner.get_tree()
	var layer := CanvasLayer.new()
	layer.layer = 90
	tree.root.add_child(layer)
	var box := UiKit.overlay(layer, 560.0)
	box.add_child(UiKit.label(title, "TitleLabel"))
	box.add_child(UiKit.label(body))
	var ok_button := UiKit.button(confirm, "PrimaryButton")
	var cancel := UiKit.button("Cancelar", "GhostButton")
	box.add_child(ok_button)
	box.add_child(cancel)
	var result := [false]
	var done := [false]
	ok_button.pressed.connect(func(): result[0] = true; done[0] = true)
	cancel.pressed.connect(func(): done[0] = true)
	while not done[0]:
		await tree.process_frame
	layer.queue_free()
	return result[0]
