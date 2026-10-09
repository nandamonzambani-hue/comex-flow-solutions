class_name ChoiceView
extends Control
## Escolha narrativa. Não vale pontos: muda a história e o final do capítulo.

signal done(option_id: String)

var choice: Dictionary
var choice_id: String
var chapter_id: String
var _body: VBoxContainer


static func present(parent: Node, id: String, c: Dictionary, chapter: String) -> ChoiceView:
	var v := ChoiceView.new()
	v.choice = c
	v.choice_id = id
	v.chapter_id = chapter
	v.set_anchors_preset(Control.PRESET_FULL_RECT)
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(v)
	v._build()
	return v


func _build() -> void:
	_body = UiKit.overlay(self)
	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	head.add_child(UiKit.icon_rect("heart", 40, GameManager.COLORS.gold))
	head.add_child(UiKit.badge(tr("CHOICE")))
	_body.add_child(head)
	_body.add_child(UiKit.label(choice.prompt, "StrongLabel"))
	var first: Button
	for opt in choice.options:
		var b := UiKit.button(opt.text, "OptionButtonCard")
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.pressed.connect(_on_pick.bind(opt))
		_body.add_child(b)
		if first == null:
			first = b
	_body.add_child(UiKit.label(tr("CHOICE_NOTE"), "MutedLabel"))
	first.grab_focus.call_deferred()


func _on_pick(opt: Dictionary) -> void:
	ProgressManager.record_choice(chapter_id, choice_id, opt.id)
	UiKit.close_overlay(_body)
	_body = UiKit.overlay(self)
	_body.add_child(UiKit.badge(tr("CHOICE")))
	var soft := PanelContainer.new()
	soft.theme_type_variation = "SoftPanel"
	soft.add_child(UiKit.label(opt.response))
	_body.add_child(soft)
	var next := UiKit.button(tr("CONTINUE"))
	next.pressed.connect(func():
		UiKit.close_overlay(_body)
		done.emit(opt.id)
		queue_free())
	_body.add_child(next)
	next.grab_focus.call_deferred()
