extends Node
## Coordena o jogo: troca de telas, capítulo atual, idioma e visual (tema).
## Fica carregado o tempo todo (autoload), então qualquer cena pode chamar GameManager.

const SCENES := {
	"menu": "res://scenes/main_menu.tscn",
	"map": "res://scenes/world_map.tscn",
	"exploration": "res://scenes/exploration.tscn",
	"ending": "res://scenes/ending.tscn",
}
const UI_STRINGS := "res://data/i18n/ui.json"
const LOCALES := ["pt_BR", "es", "en"]

## Paleta: azul mariano, ouro de vitral, pergaminho e tinta.
const COLORS := {
	"paper": Color("fbf5e6"),
	"card": Color("fffaf0"),
	"ink": Color("3a2e28"),
	"muted": Color("7a6a5c"),
	"blue": Color("2e4f8f"),
	"blue_dark": Color("223b6c"),
	"gold": Color("d9a03a"),
	"gold_soft": Color("f3dfae"),
	"green": Color("5f8a4a"),
	"line": Color("e6d8bb"),
	"wrong": Color("b4553f"),
}
const TEXT_SIZES := {"normal": 26, "large": 32}

var chapter: Dictionary = {}
var chapter_entry: Dictionary = {}
var chapter_id := ""
var load_errors: Array[String] = []

var _fade: ColorRect
var _busy := false

var font_body: Font = preload("res://assets/fonts/nunito-latin-400-normal.woff2")
var font_bold: Font = preload("res://assets/fonts/nunito-latin-800-normal.woff2")
var font_display: Font = preload("res://assets/fonts/alegreya-latin-800-normal.woff2")


func _ready() -> void:
	_register_translations()
	set_locale(ProgressManager.get_setting("locale"))
	apply_theme()
	var layer := CanvasLayer.new()
	layer.layer = 100
	add_child(layer)
	_fade = ColorRect.new()
	_fade.color = COLORS.paper
	_fade.set_anchors_preset(Control.PRESET_FULL_RECT)
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_fade.modulate.a = 0.0
	layer.add_child(_fade)


# ---------- navegação ----------

func goto(scene_key: String) -> void:
	if _busy:
		return
	_busy = true
	_fade.mouse_filter = Control.MOUSE_FILTER_STOP
	var t := create_tween()
	t.tween_property(_fade, "modulate:a", 1.0, 0.18)
	await t.finished
	get_tree().change_scene_to_file(SCENES[scene_key])
	await get_tree().process_frame
	var t2 := create_tween()
	t2.tween_property(_fade, "modulate:a", 0.0, 0.22)
	await t2.finished
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_busy = false


## Carrega e valida o capítulo. Retorna false (e preenche load_errors) se o conteúdo tiver problemas.
func open_chapter(entry: Dictionary) -> bool:
	var loaded := ContentLoader.load_chapter(entry, TranslationServer.get_locale())
	load_errors = ContentLoader.last_errors.duplicate()
	if loaded.is_empty():
		return false
	chapter = loaded
	chapter_entry = entry
	chapter_id = entry.id
	ProgressManager.start_chapter(chapter_id)
	return true


func character(id: String) -> Dictionary:
	if id == "narrator":
		return {"name": tr("NARRATOR"), "portrait": "res://assets/characters/narrador.svg"}
	if id == "player":
		return {"name": tr("PLAYER_NAME"), "portrait": "res://assets/characters/peregrino.svg"}
	return chapter.get("characters", {}).get(id, {"name": id, "portrait": ""})


func diary_entry(id: String) -> Dictionary:
	for d in chapter.get("diary", []):
		if d.id == id:
			return d
	return {}


## Espaço ocupado pelo entalhe/câmera no topo da tela (em pixels da interface).
func safe_top_margin(node: Control) -> int:
	if not OS.has_feature("mobile"):
		return 0
	var safe := DisplayServer.get_display_safe_area()
	var win := DisplayServer.window_get_size()
	if win.y <= 0:
		return 0
	return int(safe.position.y * node.get_viewport_rect().size.y / win.y)


# ---------- idioma ----------

func set_locale(locale: String) -> void:
	if not locale in LOCALES:
		locale = "pt_BR"
	TranslationServer.set_locale(locale)
	ProgressManager.set_setting("locale", locale)


func _register_translations() -> void:
	var data := ContentLoader.read_json(UI_STRINGS)
	var strings: Dictionary = data.get("strings", {})
	for locale in LOCALES:
		var tr_res := Translation.new()
		tr_res.locale = locale
		for key in strings:
			var text: String = strings[key].get(locale, strings[key].get("pt_BR", key))
			tr_res.add_message(key, text)
		TranslationServer.add_translation(tr_res)


# ---------- visual ----------

func set_text_size(size_key: String) -> void:
	ProgressManager.set_setting("text_size", size_key)
	apply_theme()


func base_font_size() -> int:
	return TEXT_SIZES.get(ProgressManager.get_setting("text_size"), 26)


func apply_theme() -> void:
	get_tree().root.theme = build_theme()


func build_theme() -> Theme:
	var fs := base_font_size()
	var th := Theme.new()
	th.default_font = font_body
	th.default_font_size = fs

	th.set_color("font_color", "Label", COLORS.ink)
	th.set_color("default_color", "RichTextLabel", COLORS.ink)
	th.set_font("bold_font", "RichTextLabel", font_bold)
	th.set_font_size("normal_font_size", "RichTextLabel", fs)
	th.set_font_size("bold_font_size", "RichTextLabel", fs)
	th.set_constant("line_separation", "Label", 4)
	th.set_constant("line_separation", "RichTextLabel", 4)

	# Variações de texto usadas pelas cenas (theme_type_variation).
	_label_variant(th, "TitleLabel", font_display, int(fs * 2.4), COLORS.blue_dark)
	_label_variant(th, "HeadingLabel", font_display, int(fs * 1.45), COLORS.blue_dark)
	_label_variant(th, "StrongLabel", font_bold, fs, COLORS.ink)
	_label_variant(th, "MutedLabel", font_body, int(fs * 0.85), COLORS.muted)
	_label_variant(th, "BadgeLabel", font_bold, int(fs * 0.72), COLORS.blue_dark)

	# Botões: área de toque generosa, cantos arredondados.
	th.set_font("font", "Button", font_bold)
	th.set_font_size("font_size", "Button", fs)
	_button_styles(th, "Button", COLORS.blue, COLORS.blue_dark, Color.WHITE)
	th.set_type_variation("SecondaryButton", "Button")
	_button_styles(th, "SecondaryButton", COLORS.gold_soft, COLORS.gold, COLORS.ink)
	th.set_type_variation("GhostButton", "Button")
	_button_styles(th, "GhostButton", Color(1, 1, 1, 0), Color(COLORS.blue, 0.1), COLORS.blue_dark)
	th.set_type_variation("OptionButtonCard", "Button")
	_button_styles(th, "OptionButtonCard", COLORS.card, COLORS.gold_soft, COLORS.ink, COLORS.line)
	th.set_constant("h_separation", "Button", 12)
	th.set_constant("icon_max_width", "Button", int(fs * 1.4))

	# Cartões e painéis.
	th.set_stylebox("panel", "PanelContainer", _box(COLORS.card, 22, COLORS.line, 2, 26, true))
	th.set_type_variation("SoftPanel", "PanelContainer")
	th.set_stylebox("panel", "SoftPanel", _box(Color(COLORS.gold_soft, 0.55), 18, Color(0, 0, 0, 0), 0, 18))
	th.set_type_variation("BadgePanel", "PanelContainer")
	th.set_stylebox("panel", "BadgePanel", _box(COLORS.gold_soft, 40, Color(0, 0, 0, 0), 0, 8))
	th.set_type_variation("BarPanel", "PanelContainer")
	th.set_stylebox("panel", "BarPanel", _box(Color(COLORS.paper, 0.94), 0, COLORS.line, 0, 14))

	th.set_stylebox("panel", "PopupMenu", _box(COLORS.card, 14, COLORS.line, 2, 10))
	th.set_stylebox("scroll", "VScrollBar", _box(Color(COLORS.line, 0.6), 6, Color(0, 0, 0, 0), 0, 3))
	th.set_stylebox("grabber", "VScrollBar", _box(COLORS.gold, 6, Color(0, 0, 0, 0), 0, 3))
	th.set_stylebox("grabber_highlight", "VScrollBar", _box(COLORS.gold, 6, Color(0, 0, 0, 0), 0, 3))
	th.set_stylebox("grabber_pressed", "VScrollBar", _box(COLORS.gold, 6, Color(0, 0, 0, 0), 0, 3))
	return th


func _label_variant(th: Theme, name: String, font: Font, size: int, color: Color) -> void:
	th.set_type_variation(name, "Label")
	th.set_font("font", name, font)
	th.set_font_size("font_size", name, size)
	th.set_color("font_color", name, color)


func _button_styles(th: Theme, type: String, bg: Color, bg_pressed: Color, fg: Color, border := Color(0, 0, 0, 0)) -> void:
	var bw := 2 if border.a > 0 else 0
	th.set_stylebox("normal", type, _box(bg, 20, border, bw, 18))
	th.set_stylebox("hover", type, _box(bg.lerp(bg_pressed, 0.35), 20, border, bw, 18))
	th.set_stylebox("pressed", type, _box(bg_pressed, 20, border, bw, 18))
	th.set_stylebox("disabled", type, _box(Color(bg, 0.45), 20, border, bw, 18))
	var focus := _box(Color(0, 0, 0, 0), 22, COLORS.gold, 4, 18)
	focus.draw_center = false
	th.set_stylebox("focus", type, focus)
	for state in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color", "font_hover_pressed_color"]:
		th.set_color(state, type, fg)
	th.set_color("font_disabled_color", type, Color(fg, 0.6))
	th.set_color("icon_normal_color", type, fg)
	th.set_color("icon_hover_color", type, fg)
	th.set_color("icon_pressed_color", type, fg)
	th.set_color("icon_focus_color", type, fg)


func _box(bg: Color, radius: int, border: Color, border_w: int, pad: int, shadow := false) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.set_corner_radius_all(radius)
	sb.border_color = border
	sb.set_border_width_all(border_w)
	sb.content_margin_left = pad + 4
	sb.content_margin_right = pad + 4
	sb.content_margin_top = pad
	sb.content_margin_bottom = pad
	if shadow:
		sb.shadow_color = Color(0.25, 0.18, 0.1, 0.12)
		sb.shadow_size = 10
		sb.shadow_offset = Vector2(0, 4)
	return sb
