class_name UiKit
extends RefCounted
## Pequenas funções para montar a interface com o mesmo visual em todas as telas.

const ICON_DIR := "res://assets/icons/"
const MIN_TOUCH := 88 ## altura mínima de um botão (px no tamanho base 720×1280)


static func icon(name: String) -> Texture2D:
	var path := ICON_DIR + name + ".svg"
	return load(path) if ResourceLoader.exists(path) else null


static func button(text: String, variation := "", icon_name := "") -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size.y = MIN_TOUCH
	b.focus_mode = Control.FOCUS_ALL
	b.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	if variation != "":
		b.theme_type_variation = variation
	if icon_name != "":
		b.icon = icon(icon_name)
		b.expand_icon = false
	return b


static func label(text: String, variation := "", wrap := true) -> Label:
	var l := Label.new()
	l.text = text
	if variation != "":
		l.theme_type_variation = variation
	if wrap:
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		l.custom_minimum_size.x = 10
	return l


static func rich(bbcode: String) -> RichTextLabel:
	var r := RichTextLabel.new()
	r.bbcode_enabled = true
	r.fit_content = true
	r.scroll_active = false
	r.text = bbcode
	r.custom_minimum_size.x = 10
	return r


static func icon_rect(name: String, size: int, color: Color) -> TextureRect:
	var t := TextureRect.new()
	t.texture = icon(name)
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	t.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	t.custom_minimum_size = Vector2(size, size)
	t.modulate = color
	t.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return t


static func badge(text: String) -> PanelContainer:
	var p := PanelContainer.new()
	p.theme_type_variation = "BadgePanel"
	p.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	p.add_child(label(text.to_upper(), "BadgeLabel", false))
	return p


## Janela sobreposta com fundo escurecido e um cartão rolável.
## Retorna o VBoxContainer onde colocar o conteúdo; o nó raiz é o seu "owner" (use get_meta("overlay")).
static func overlay(parent: Node, max_width := 640.0) -> VBoxContainer:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	var dim := ColorRect.new()
	dim.color = Color(0.03, 0.05, 0.1, 0.72)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_child(dim)
	var margin := MarginContainer.new()
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right"]:
		margin.add_theme_constant_override("margin_" + side, 24)
	margin.add_theme_constant_override("margin_top", 60)
	margin.add_theme_constant_override("margin_bottom", 40)
	root.add_child(margin)
	var center := CenterContainer.new()
	margin.add_child(center)
	var card := PanelContainer.new()
	card.custom_minimum_size.x = max_width
	center.add_child(card)
	var scroll := ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	card.add_child(scroll)
	var body := VBoxContainer.new()
	body.add_theme_constant_override("separation", 18)
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(body)
	body.set_meta("overlay", root)
	body.set_meta("scroll", scroll)
	parent.add_child(root)
	# Ajusta a largura e a altura do cartão à tela (celulares estreitos, tablets).
	var fit := func():
		var vp := root.get_viewport_rect().size
		card.custom_minimum_size.x = min(max_width, vp.x - 48)
		scroll.custom_minimum_size.y = min(body.get_combined_minimum_size().y, vp.y - 180)
	body.resized.connect(fit)
	root.resized.connect(fit)
	fit.call_deferred()
	root.modulate.a = 0.0
	root.create_tween().tween_property(root, "modulate:a", 1.0, 0.16)
	return body


static func close_overlay(body: Control) -> void:
	if is_instance_valid(body) and body.has_meta("overlay"):
		var root: Control = body.get_meta("overlay")
		if is_instance_valid(root):
			root.queue_free()


## Pergunta de confirmação com dois botões. on_yes é chamado só se a pessoa confirmar.
static func confirm(parent: Node, text: String, yes_text: String, on_yes: Callable) -> void:
	var body := overlay(parent, 560)
	body.add_child(label(text, "StrongLabel"))
	var yes := button(yes_text, "")
	var no := button(TranslationServer.translate("CANCEL"), "GhostButton")
	body.add_child(yes)
	body.add_child(no)
	yes.pressed.connect(func():
		close_overlay(body)
		on_yes.call())
	no.pressed.connect(func(): close_overlay(body))
	no.grab_focus.call_deferred()


## Mensagem rápida no rodapé que some sozinha.
static func toast(parent: Node, text: String) -> void:
	for old in parent.get_children():
		if old.has_meta("toast"):
			old.queue_free()
	var holder := MarginContainer.new()
	holder.set_meta("toast", true)
	holder.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	holder.offset_top = -250
	holder.offset_bottom = -170
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	holder.add_theme_constant_override("margin_left", 40)
	holder.add_theme_constant_override("margin_right", 40)
	var panel := PanelContainer.new()
	panel.theme_type_variation = "NoticePanel"
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	var l := label(text, "InkStrongLabel")
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var vp := parent.get_viewport().get_visible_rect().size if parent.is_inside_tree() else Vector2(720, 1280)
	l.custom_minimum_size.x = minf(560.0, vp.x - 120.0)
	panel.add_child(l)
	holder.add_child(panel)
	parent.add_child(holder)
	holder.modulate.a = 0.0
	var t := holder.create_tween()
	t.tween_property(holder, "modulate:a", 1.0, 0.2)
	t.tween_interval(2.4)
	t.tween_property(holder, "modulate:a", 0.0, 0.3)
	t.tween_callback(holder.queue_free)
