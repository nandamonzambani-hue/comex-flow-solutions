extends Node
## Coordena o jogo: troca de telas, caso atual, salvamento do progresso, idioma e tema.
## Fica carregado o tempo todo (autoload): qualquer cena pode usar GameManager.

signal state_changed

const SCENES := {
	"menu": "res://scenes/main_menu.tscn",
	"investigation": "res://scenes/investigation.tscn",
	"accusation": "res://scenes/accusation.tscn",
	"ending": "res://scenes/ending.tscn",
}
const UI_STRINGS := "res://data/i18n/ui.json"
const LOCALES := ["pt_BR", "es", "en"]

## Paleta: azul-marinho, vinho, cinza e papel.
const C := {
	"navy": Color("18233a"), "navy2": Color("22314f"), "navy3": Color("2e4066"),
	"wine": Color("7b2d3b"), "wine_dark": Color("5a1f2a"),
	"paper": Color("efe5d0"), "paper_dim": Color("d9ccb0"), "ink": Color("1d1715"),
	"text": Color("ece6d9"), "muted": Color("a3acbd"), "gold": Color("c9a44f"),
	"found": Color("7fb38e"), "wrong": Color("d16a6a"),
}
const TEXT_SIZES := {"normal": 26, "large": 32}

var case_data: Dictionary = {}
var case_entry: Dictionary = {}
var state: CaseState
var rules: InvestigationRules
var load_errors: Array[String] = []
var progress: Dictionary = {}   ## {"cases": {id: estado}, "settings": {...}}

var font_body: Font = preload("res://assets/fonts/source-sans-3-latin-400-normal.woff2")
var font_bold: Font = preload("res://assets/fonts/source-sans-3-latin-700-normal.woff2")
var font_display: Font = preload("res://assets/fonts/spectral-latin-700-normal.woff2")
var font_type: Font = preload("res://assets/fonts/courier-prime-latin-400-normal.woff2")

var _fade: ColorRect
var _busy := false


func _ready() -> void:
	load_progress()
	_register_translations()
	TranslationServer.set_locale(get_setting("locale"))
	apply_theme()
	var layer := CanvasLayer.new()
	layer.layer = 100
	add_child(layer)
	_fade = ColorRect.new()
	_fade.color = C.navy
	_fade.set_anchors_preset(Control.PRESET_FULL_RECT)
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_fade.modulate.a = 0.0
	layer.add_child(_fade)


# ---------- progresso ----------

func load_progress() -> void:
	progress = SaveManager.load_data()
	if typeof(progress.get("cases")) != TYPE_DICTIONARY:
		progress["cases"] = {}
	if typeof(progress.get("settings")) != TYPE_DICTIONARY:
		progress["settings"] = {}


func save() -> void:
	if state:
		progress.cases[state.case_id] = state.to_dict()
	SaveManager.save_data(progress)
	state_changed.emit()


func get_setting(key: String):
	return progress.settings.get(key, {"locale": "pt_BR", "text_size": "normal"}.get(key))


func set_setting(key: String, value) -> void:
	progress.settings[key] = value
	SaveManager.save_data(progress)


func has_progress(case_id: String) -> bool:
	var d: Dictionary = progress.cases.get(case_id, {})
	return not d.is_empty() and not d.get("finished", false)


func best_result(case_id: String) -> Dictionary:
	return progress.get("best", {}).get(case_id, {})


## Abre um caso (novo ou continuando). Retorna false se o arquivo tiver erros.
func open_case(entry: Dictionary, restart := false) -> bool:
	var data := CaseLoader.load_case(entry, TranslationServer.get_locale())
	load_errors = CaseLoader.last_errors.duplicate()
	if data.is_empty():
		return false
	case_data = data
	case_entry = entry
	var saved: Dictionary = progress.cases.get(data.id, {})
	if restart or saved.is_empty() or saved.get("finished", false):
		state = CaseState.create(data.id)
	else:
		state = CaseState.from_dict(saved)
	rules = InvestigationRules.new(case_data, state)
	save()
	return true


func restart_case() -> void:
	state = CaseState.create(case_data.id)
	rules = InvestigationRules.new(case_data, state)
	save()


func record_result() -> void:
	var best: Dictionary = progress.get("best", {})
	var score := state.score(case_data)
	var prev: Dictionary = best.get(state.case_id, {})
	if score >= int(prev.get("score", -1)):
		best[state.case_id] = {"score": score, "correct": state.accusation.get("correct", false)}
	progress["best"] = best
	save()


func character(id: String) -> Dictionary:
	if id == "narrator":
		return {"name": tr("NARRATOR"), "portrait": "res://assets/characters/narrador.svg"}
	return case_data.get("characters", {}).get(id, {"name": id, "portrait": ""})


func clue(id: String) -> Dictionary:
	for c in case_data.get("clues", []):
		if c.id == id:
			return c
	return {}


func statement(id: String) -> Dictionary:
	for s in case_data.get("statements", []):
		if s.id == id:
			return s
	return {}


# ---------- navegação ----------

func goto(scene_key: String) -> void:
	if _busy:
		return
	_busy = true
	_fade.mouse_filter = Control.MOUSE_FILTER_STOP
	var t := create_tween()
	t.tween_property(_fade, "modulate:a", 1.0, 0.2)
	await t.finished
	get_tree().change_scene_to_file(SCENES[scene_key])
	await get_tree().process_frame
	var t2 := create_tween()
	t2.tween_property(_fade, "modulate:a", 0.0, 0.25)
	await t2.finished
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_busy = false


## Espaço do entalhe/câmera no topo (em pixels da interface).
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
	set_setting("locale", locale)


func _register_translations() -> void:
	var strings: Dictionary = CaseLoader.read_json(UI_STRINGS).get("strings", {})
	for locale in LOCALES:
		var t := Translation.new()
		t.locale = locale
		for key in strings:
			t.add_message(key, strings[key].get(locale, strings[key].get("pt_BR", key)))
		TranslationServer.add_translation(t)


# ---------- tema visual ----------

func base_font_size() -> int:
	return TEXT_SIZES.get(get_setting("text_size"), 26)


func set_text_size(key: String) -> void:
	set_setting("text_size", key)
	apply_theme()


func apply_theme() -> void:
	get_tree().root.theme = build_theme()


func build_theme() -> Theme:
	var fs := base_font_size()
	var th := Theme.new()
	th.default_font = font_body
	th.default_font_size = fs
	th.set_color("font_color", "Label", C.text)
	th.set_color("default_color", "RichTextLabel", C.text)
	th.set_constant("line_separation", "Label", 3)

	_label(th, "TitleLabel", font_display, int(fs * 2.3), C.paper)
	_label(th, "HeadingLabel", font_display, int(fs * 1.35), C.paper)
	_label(th, "StrongLabel", font_bold, fs, C.text)
	_label(th, "MutedLabel", font_body, int(fs * 0.85), C.muted)
	_label(th, "BadgeLabel", font_bold, int(fs * 0.7), C.gold)
	_label(th, "InkLabel", font_body, fs, C.ink)
	_label(th, "InkStrongLabel", font_bold, fs, C.ink)
	_label(th, "TypeLabel", font_type, int(fs * 0.9), C.ink)
	_label(th, "InkHeadingLabel", font_display, int(fs * 1.2), C.wine_dark)

	th.set_font("font", "Button", font_bold)
	th.set_font_size("font_size", "Button", fs)
	_buttons(th, "Button", C.wine, C.wine_dark, C.paper)
	th.set_type_variation("SecondaryButton", "Button")
	_buttons(th, "SecondaryButton", C.navy3, C.navy2, C.text)
	th.set_type_variation("GhostButton", "Button")
	_buttons(th, "GhostButton", Color(0, 0, 0, 0), Color(1, 1, 1, 0.08), C.text)
	th.set_type_variation("OptionCard", "Button")
	_buttons(th, "OptionCard", C.navy2, C.navy3, C.text, C.navy3)
	th.set_type_variation("TabButton", "Button")
	_buttons(th, "TabButton", Color(0, 0, 0, 0), Color(1, 1, 1, 0.06), C.muted)
	th.set_font_size("font_size", "TabButton", int(fs * 0.75))
	th.set_constant("h_separation", "Button", 12)
	th.set_constant("icon_max_width", "Button", int(fs * 1.4))

	th.set_stylebox("panel", "PanelContainer", _box(C.navy2, 18, C.navy3, 2, 22, true))
	th.set_type_variation("PaperPanel", "PanelContainer")
	th.set_stylebox("panel", "PaperPanel", _box(C.paper, 6, C.paper_dim, 2, 22, true))
	th.set_type_variation("BarPanel", "PanelContainer")
	th.set_stylebox("panel", "BarPanel", _box(Color(C.navy, 0.96), 0, C.navy3, 0, 12))
	th.set_type_variation("BadgePanel", "PanelContainer")
	th.set_stylebox("panel", "BadgePanel", _box(Color(C.gold, 0.16), 30, Color(0, 0, 0, 0), 0, 6))
	th.set_type_variation("NoticePanel", "PanelContainer")
	th.set_stylebox("panel", "NoticePanel", _box(C.paper, 30, C.gold, 2, 10, true))
	th.set_stylebox("scroll", "VScrollBar", _box(Color(1, 1, 1, 0.06), 6, Color(0, 0, 0, 0), 0, 3))
	for s in ["grabber", "grabber_highlight", "grabber_pressed"]:
		th.set_stylebox(s, "VScrollBar", _box(C.gold, 6, Color(0, 0, 0, 0), 0, 3))
	return th


func _label(th: Theme, name: String, font: Font, size: int, color: Color) -> void:
	th.set_type_variation(name, "Label")
	th.set_font("font", name, font)
	th.set_font_size("font_size", name, size)
	th.set_color("font_color", name, color)


func _buttons(th: Theme, type: String, bg: Color, bg_pressed: Color, fg: Color, border := Color(0, 0, 0, 0)) -> void:
	var bw := 2 if border.a > 0 else 0
	th.set_stylebox("normal", type, _box(bg, 16, border, bw, 16))
	th.set_stylebox("hover", type, _box(bg.lerp(bg_pressed, 0.4), 16, border, bw, 16))
	th.set_stylebox("pressed", type, _box(bg_pressed, 16, C.gold if bw else border, bw, 16))
	th.set_stylebox("disabled", type, _box(Color(bg, 0.4), 16, border, bw, 16))
	var focus := _box(Color(0, 0, 0, 0), 18, C.gold, 3, 16)
	focus.draw_center = false
	th.set_stylebox("focus", type, focus)
	for s in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color", "font_hover_pressed_color"]:
		th.set_color(s, type, fg)
	th.set_color("font_disabled_color", type, Color(fg, 0.5))
	for s in ["icon_normal_color", "icon_hover_color", "icon_pressed_color", "icon_focus_color"]:
		th.set_color(s, type, fg)


func _box(bg: Color, radius: int, border: Color, bw: int, pad: int, shadow := false) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.set_corner_radius_all(radius)
	sb.border_color = border
	sb.set_border_width_all(bw)
	sb.content_margin_left = pad + 4
	sb.content_margin_right = pad + 4
	sb.content_margin_top = pad
	sb.content_margin_bottom = pad
	if shadow:
		sb.shadow_color = Color(0, 0, 0, 0.35)
		sb.shadow_size = 10
		sb.shadow_offset = Vector2(0, 4)
	return sb
