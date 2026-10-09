extends PanelContainer
## Cartão de evidência: uma pista (papel) ou um depoimento (azul).
## Uso: var card = ClueCardScene.instantiate(); card.setup(item); card.pressed.connect(...)
## item: {"id", "kind": "clue"|"statement"|"unknown", "title", "text", "icon"?, "character"?}

signal pressed(item_id: String)

const KIND_ICON := {"statement": "chat", "unknown": "lock"}

var item: Dictionary = {}
var selected := false
var compact := false


func setup(data: Dictionary, small := false) -> void:
	item = data
	compact = small
	if is_node_ready():
		_apply()


func _ready() -> void:
	gui_input.connect(_on_input)
	_apply()


func _apply() -> void:
	var kind: String = item.get("kind", "clue")
	var fs := GameManager.base_font_size()
	if kind == "statement":
		theme_type_variation = ""
		%Title.theme_type_variation = "StrongLabel"
		%Summary.theme_type_variation = "Label"
		%Summary.text = "“%s”" % item.get("text", "")
		%Kicker.text = item.get("title", "").to_upper()
		%Title.visible = false
		%Icon.modulate = GameManager.C.gold
	elif kind == "unknown":
		theme_type_variation = ""
		%Title.theme_type_variation = "MutedLabel"
		%Title.text = item.get("title", "?")
		%Summary.visible = false
		%Kicker.visible = false
		%Icon.modulate = GameManager.C.muted
		mouse_filter = Control.MOUSE_FILTER_IGNORE
	else:
		%Kicker.visible = false
		%Title.text = item.get("title", "")
		%Summary.text = item.get("text", "")
		%Icon.modulate = GameManager.C.wine
	%Icon.texture = UiKit.icon(KIND_ICON.get(kind, item.get("icon", "document")))
	if compact:
		%Summary.add_theme_font_size_override("font_size", int(fs * 0.8))
		%Icon.custom_minimum_size = Vector2(40, 40)
		custom_minimum_size.y = 0
	_paint()


func set_selected(on: bool) -> void:
	selected = on
	_paint()


func _paint() -> void:
	var base: StyleBox = get_theme_stylebox("panel")
	if base == null:
		return
	var sb: StyleBoxFlat = base.duplicate()
	if selected:
		sb.border_color = GameManager.C.gold
		sb.set_border_width_all(5)
	add_theme_stylebox_override("panel", sb)


func _on_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		accept_event()
		pressed.emit(item.get("id", ""))
