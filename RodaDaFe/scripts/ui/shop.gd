extends Control
## Loja: sem anúncios, pacote de perguntas, moedas e moedas grátis por anúncio.

var status_label: Label
var list: VBoxContainer


func _ready() -> void:
	Game.background(self)
	var v := UiKit.page(self, 20)
	v.add_child(TopBar.make("Loja", "menu"))
	status_label = UiKit.label("", "LightMuted")
	v.add_child(status_label)
	list = VBoxContainer.new()
	list.add_theme_constant_override("separation", 18)
	v.add_child(list)
	var restore := UiKit.button("Restaurar compras", "GhostButton")
	restore.pressed.connect(func():
		status_label.text = "Consultando a loja..."
		Monetization.restore_purchases())
	v.add_child(restore)
	var fine := UiKit.label("Preços em reais, cobrados pela Google Play / App Store. Compras de itens permanentes valem para sempre neste aparelho e podem ser restauradas. Não vendemos nada de caráter religioso: só recursos do jogo.", "LightMuted")
	fine.add_theme_font_size_override("font_size", 18)
	v.add_child(fine)
	Monetization.purchase_finished.connect(_on_purchase)
	Monetization.rewarded_finished.connect(_on_rewarded)
	Player.purchases_changed.connect(_render)
	_render()


func _render() -> void:
	for c in list.get_children():
		c.queue_free()
	# moedas grátis com anúncio premiado (opcional)
	var free := UiKit.card(list, 10)
	free.add_child(UiKit.label("Moedas grátis", "QuestionLabel"))
	var left := Player.rewarded_left_today()
	free.add_child(UiKit.label("Assista a um anúncio curto e ganhe %d moedas. Restam %d hoje." % [int(Content.shop.rewarded.coins), left], "MutedLabel"))
	var watch := UiKit.button("Assistir e ganhar", "PrimaryButton")
	watch.name = "WatchRewarded"
	watch.disabled = left <= 0
	watch.pressed.connect(func(): Monetization.show_rewarded("moedas"))
	free.add_child(watch)

	for p in Content.shop.get("products", []):
		var card := UiKit.card(list, 10)
		card.add_child(UiKit.label(str(p.title), "QuestionLabel"))
		card.add_child(UiKit.label(str(p.description), "MutedLabel"))
		var owned: bool = p.type == "non_consumable" and Player.owns(p.id)
		var buy := UiKit.button("Comprado" if owned else "Comprar  ·  " + Monetization.price_label(p.id), "CardButton" if owned else "PrimaryButton")
		buy.name = "Buy_" + str(p.id)
		buy.disabled = owned
		var id: String = p.id
		buy.pressed.connect(func(): Monetization.purchase(id))
		card.add_child(buy)


func _on_purchase(product_id: String, ok: bool, message: String) -> void:
	if ok and product_id != "":
		status_label.text = "Pronto: %s." % Content.product(product_id).get("title", "")
	else:
		status_label.text = message
	_render()


func _on_rewarded(placement: String, rewarded: bool) -> void:
	if placement != "moedas":
		return
	if rewarded:
		status_label.text = "+%d moedas!" % Player.register_rewarded_coins()
	else:
		status_label.text = "O anúncio foi fechado antes do fim; nenhuma moeda foi adicionada."
	_render()
