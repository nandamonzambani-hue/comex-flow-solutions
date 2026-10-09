class_name QuestionView
extends Control
## Pergunta de conhecimento com até 2 tentativas.
## Depois de responder, mostra a explicação e as fontes. Emite done(pontos).

signal done(points: int)

var question: Dictionary
var chapter_id: String
var _body: VBoxContainer
var _feedback: VBoxContainer
var _buttons: Array[Button] = []
var _attempts := 0


static func ask(parent: Node, q: Dictionary, chapter: String) -> QuestionView:
	var v := QuestionView.new()
	v.question = q
	v.chapter_id = chapter
	v.set_anchors_preset(Control.PRESET_FULL_RECT)
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(v)
	v._build()
	return v


func _build() -> void:
	_body = UiKit.overlay(self)
	_body.add_child(UiKit.badge(tr("QUESTION")))
	_body.add_child(UiKit.label(question.prompt, "StrongLabel"))
	var options: Array = question.options
	for i in options.size():
		var b := UiKit.button(options[i], "OptionButtonCard")
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.pressed.connect(_on_pick.bind(i))
		_buttons.append(b)
		_body.add_child(b)
	_feedback = VBoxContainer.new()
	_feedback.add_theme_constant_override("separation", 14)
	_body.add_child(_feedback)
	_buttons[0].grab_focus.call_deferred()


func _on_pick(index: int) -> void:
	_attempts += 1
	var correct := index == int(question.answer)
	if correct:
		_paint(_buttons[index], GameManager.COLORS.green)
		_finish(true)
	elif _attempts < Scoring.MAX_QUESTION_ATTEMPTS:
		_paint(_buttons[index], GameManager.COLORS.wrong)
		_buttons[index].disabled = true
		_clear_feedback()
		_feedback.add_child(UiKit.label(tr("TRY_AGAIN"), "StrongLabel"))
	else:
		_paint(_buttons[index], GameManager.COLORS.wrong)
		_paint(_buttons[int(question.answer)], GameManager.COLORS.green)
		_finish(false)


func _finish(correct: bool) -> void:
	for b in _buttons:
		b.disabled = true
	var points: int = ProgressManager.record_question(chapter_id, question.id, _attempts, correct)
	_clear_feedback()
	var head := tr("CORRECT") if correct else tr("ANSWER_WAS") % question.options[int(question.answer)]
	if points > 0:
		head += "  " + tr("POINTS_EARNED") % points
	_feedback.add_child(UiKit.label(head, "HeadingLabel"))
	var soft := PanelContainer.new()
	soft.theme_type_variation = "SoftPanel"
	soft.add_child(UiKit.label(question.explanation))
	_feedback.add_child(soft)
	_feedback.add_child(SourceList.build(question.get("sources", [])))
	var next := UiKit.button(tr("CONTINUE"))
	next.pressed.connect(func():
		UiKit.close_overlay(_body)
		done.emit(points)
		queue_free())
	_feedback.add_child(next)
	next.grab_focus.call_deferred()
	# Rola até a explicação.
	var scroll: ScrollContainer = _body.get_meta("scroll")
	await get_tree().process_frame
	scroll.ensure_control_visible(next)


func _clear_feedback() -> void:
	for c in _feedback.get_children():
		c.queue_free()


func _paint(b: Button, color: Color) -> void:
	for state in ["normal", "disabled", "hover", "pressed"]:
		var sb: StyleBoxFlat = b.get_theme_stylebox(state).duplicate()
		sb.border_color = color
		sb.set_border_width_all(4)
		sb.bg_color = Color(color, 0.12)
		b.add_theme_stylebox_override(state, sb)
	b.add_theme_color_override("font_disabled_color", GameManager.COLORS.ink)
