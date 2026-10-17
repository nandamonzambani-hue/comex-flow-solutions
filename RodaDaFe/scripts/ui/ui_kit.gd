class_name UiKit
extends RefCounted
## Pequenas funções para montar a interface com o mesmo visual em todas as telas.

const MIN_TOUCH := 88 ## altura mínima de um botão (px no tamanho base 720×1280)


static func button(text: String, variation := "") -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size.y = MIN_TOUCH
	b.focus_mode = Control.FOCUS_ALL
	b.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	if variation != "":
		b.theme_type_variation = variation
	b.button_down.connect(func(): b.pivot_offset = b.size / 2.0; b.scale = Vector2(0.97, 0.97))
	b.button_up.connect(func(): b.scale = Vector2.ONE)
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


static func badge(text: String, color := Color("f2c94c")) -> PanelContainer:
	var p := PanelContainer.new()
	p.theme_type_variation = "BadgePanel"
	var box: StyleBoxFlat = p.get_theme_stylebox("panel", "BadgePanel").duplicate() if p.has_theme_stylebox("panel", "BadgePanel") else StyleBoxFlat.new()
	box.bg_color = color
	box.set_corner_radius_all(14)
	box.content_margin_left = 14
	box.content_margin_right = 14
	box.content_margin_top = 4
	box.content_margin_bottom = 4
	p.add_theme_stylebox_override("panel", box)
	p.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	var l := label(text.to_upper(), "BadgeLabel", false)
	l.add_theme_color_override("font_color", Color.WHITE if color.get_luminance() < 0.6 else Color("2a1f33"))
	p.add_child(l)
	return p


static func spacer(height: int) -> Control:
	var c := Control.new()
	c.custom_minimum_size.y = height
	return c


## Coluna central com margens laterais, dentro de uma rolagem vertical.
static func page(parent: Control, separation := 22) -> VBoxContainer:
	var scroll := ScrollContainer.new()
	scroll.set_anchors_preset(Control.PRESET_FULL_RECT)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	parent.add_child(scroll)
	var margin := MarginContainer.new()
	margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	margin.size_flags_vertical = Control.SIZE_EXPAND_FILL
	for side in ["left", "right"]:
		margin.add_theme_constant_override("margin_" + side, 36)
	margin.add_theme_constant_override("margin_top", 48)
	margin.add_theme_constant_override("margin_bottom", 48)
	scroll.add_child(margin)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", separation)
	v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	margin.add_child(v)
	return v


static func card(parent: Node, separation := 16) -> VBoxContainer:
	var p := PanelContainer.new()
	p.theme_type_variation = "CardPanel"
	parent.add_child(p)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", separation)
	p.add_child(v)
	return v


## Janela sobreposta com fundo escurecido. Retorna o VBox do conteúdo.
static func overlay(parent: Node, max_width := 640.0) -> VBoxContainer:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	parent.add_child(root)
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.6)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_child(dim)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_child(center)
	var p := PanelContainer.new()
	p.theme_type_variation = "CardPanel"
	p.custom_minimum_size.x = max_width
	center.add_child(p)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 18)
	p.add_child(v)
	v.set_meta("overlay", root)
	return v
