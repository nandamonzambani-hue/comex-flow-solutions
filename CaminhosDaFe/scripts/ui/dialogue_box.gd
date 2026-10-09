extends PanelContainer
## Caixa de diálogo na parte de baixo da tela.
## Uso: await dialogue_box.play(lines)   (cada linha: {"speaker": "...", "text": "..."})
## Toque uma vez para mostrar a fala inteira; toque de novo para avançar.

signal finished

const CHARS_PER_SECOND := 55.0

@onready var portrait: TextureRect = %Portrait
@onready var speaker_label: Label = %Speaker
@onready var text_label: Label = %Text
@onready var next_label: Label = %Next

var _lines: Array = []
var _index := 0
var _tween: Tween


func _ready() -> void:
	hide()
	gui_input.connect(_on_gui_input)


func play(lines: Array) -> void:
	_lines = lines
	_index = 0
	show()
	_show_line()
	await finished


func _show_line() -> void:
	var line: Dictionary = _lines[_index]
	var who := GameManager.character(line.speaker)
	speaker_label.text = who.get("name", "")
	var tex_path: String = who.get("portrait", "")
	portrait.texture = load(tex_path) if tex_path != "" and ResourceLoader.exists(tex_path) else null
	text_label.text = line.text
	text_label.visible_ratio = 0.0
	next_label.modulate.a = 0.0
	if _tween:
		_tween.kill()
	_tween = create_tween()
	_tween.tween_property(text_label, "visible_ratio", 1.0, line.text.length() / CHARS_PER_SECOND)
	_tween.tween_property(next_label, "modulate:a", 1.0, 0.2)


func advance() -> void:
	if text_label.visible_ratio < 1.0:
		if _tween:
			_tween.kill()
		text_label.visible_ratio = 1.0
		next_label.modulate.a = 1.0
		return
	_index += 1
	if _index >= _lines.size():
		hide()
		finished.emit()
	else:
		_show_line()


func _on_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		accept_event()
		advance()


func _unhandled_input(event: InputEvent) -> void:
	if visible and event.is_action_pressed("ui_accept"):
		get_viewport().set_input_as_handled()
		advance()
