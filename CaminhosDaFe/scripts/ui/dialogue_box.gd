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
var _talk: Tween


func _ready() -> void:
	hide()
	gui_input.connect(_on_gui_input)


func play(lines: Array) -> void:
	_lines = lines
	_index = 0
	show()
	_slide_in()
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
	_tween.tween_callback(_stop_talking)
	_start_talking()


func advance() -> void:
	if text_label.visible_ratio < 1.0:
		if _tween:
			_tween.kill()
		_stop_talking()
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


## A caixa sobe suavemente da base da tela.
func _slide_in() -> void:
	pivot_offset = Vector2(size.x / 2.0, size.y)
	modulate.a = 0.0
	scale = Vector2(0.96, 0.96)
	var t := create_tween().set_parallel(true)
	t.tween_property(self, "modulate:a", 1.0, 0.18)
	t.tween_property(self, "scale", Vector2.ONE, 0.28).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)


## O retrato "aparece" a cada fala e balança de leve enquanto a pessoa fala.
func _start_talking() -> void:
	portrait.pivot_offset = portrait.size / 2.0
	portrait.scale = Vector2(0.9, 0.9)
	portrait.create_tween().tween_property(portrait, "scale", Vector2.ONE, 0.28) \
		.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	if _talk:
		_talk.kill()
	_talk = create_tween().set_loops()
	_talk.tween_interval(0.3)
	_talk.tween_property(portrait, "rotation", 0.02, 0.16).set_trans(Tween.TRANS_SINE)
	_talk.tween_property(portrait, "rotation", -0.02, 0.16).set_trans(Tween.TRANS_SINE)


func _stop_talking() -> void:
	if _talk:
		_talk.kill()
	portrait.create_tween().tween_property(portrait, "rotation", 0.0, 0.1)
