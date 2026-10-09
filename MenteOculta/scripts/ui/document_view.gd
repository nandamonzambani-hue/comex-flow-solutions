class_name DocumentView
extends RefCounted
## Mostra uma pista como documento: mensagem de celular, e-mail, foto, ficha, caderno ou recibo.


static func open(parent: Node, clue: Dictionary) -> void:
	var body := UiKit.overlay(parent, 640)
	var doc: Dictionary = clue.get("doc", {})
	var style: String = doc.get("style", "form")
	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	head.add_child(UiKit.icon_rect(clue.get("icon", "document"), 40, GameManager.C.gold))
	var title := UiKit.label(clue.title, "HeadingLabel", false)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(title)
	body.add_child(head)

	var sheet := PanelContainer.new()
	var on_paper := style != "phone"
	sheet.theme_type_variation = "PaperPanel" if on_paper else ""
	if style == "phone":
		var sb := StyleBoxFlat.new()
		sb.bg_color = Color("0f1626")
		sb.set_corner_radius_all(28)
		sb.border_color = Color("3b4a6b")
		sb.set_border_width_all(4)
		sb.content_margin_left = 26
		sb.content_margin_right = 26
		sb.content_margin_top = 30
		sb.content_margin_bottom = 30
		sheet.add_theme_stylebox_override("panel", sb)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 8)
	var header := UiKit.label(doc.get("header", ""), "TypeLabel" if on_paper else "MutedLabel")
	if style == "receipt":
		header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(header)
	if doc.has("image") and ResourceLoader.exists(doc.image):
		var img := TextureRect.new()
		img.texture = load(doc.image)
		img.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		img.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		img.custom_minimum_size = Vector2(0, 300)
		col.add_child(img)
	for line in doc.get("lines", []):
		if style == "phone":
			var bubble := PanelContainer.new()
			var sb := StyleBoxFlat.new()
			sb.bg_color = Color("2e4066")
			sb.set_corner_radius_all(18)
			sb.content_margin_left = 18
			sb.content_margin_right = 18
			sb.content_margin_top = 12
			sb.content_margin_bottom = 12
			bubble.add_theme_stylebox_override("panel", sb)
			bubble.add_child(UiKit.label(line))
			col.add_child(bubble)
		else:
			col.add_child(UiKit.label(line, "TypeLabel"))
	sheet.add_child(col)
	body.add_child(sheet)
	body.add_child(UiKit.label(clue.summary, "MutedLabel"))
	var close := UiKit.button(TranslationServer.translate("CLOSE"))
	close.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(close)
