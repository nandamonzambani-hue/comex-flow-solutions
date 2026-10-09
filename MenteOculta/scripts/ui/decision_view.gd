class_name DecisionView
extends Control
## Decisão importante: mostra as opções e, depois da escolha, o feedback.
## Emite done(resultados) — os resultados podem trazer novas pistas.

signal done(results: Array)

var decision_id := ""
var _body: VBoxContainer


static func present(parent: Node, id: String) -> DecisionView:
	var v := DecisionView.new()
	v.decision_id = id
	v.set_anchors_preset(Control.PRESET_FULL_RECT)
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(v)
	v._build()
	return v


func _build() -> void:
	var dec: Dictionary = GameManager.case_data.decisions[decision_id]
	_body = UiKit.overlay(self)
	_body.add_child(UiKit.badge(tr("DECISION")))
	var who := GameManager.character(dec.get("speaker", "narrator"))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 14)
	var pic := TextureRect.new()
	pic.texture = load(who.portrait) if ResourceLoader.exists(who.get("portrait", "")) else null
	pic.custom_minimum_size = Vector2(96, 96)
	pic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	pic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	row.add_child(pic)
	var prompt := UiKit.label(dec.prompt, "StrongLabel")
	prompt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(prompt)
	_body.add_child(row)
	var first: Button
	for opt in dec.options:
		var b := UiKit.button(opt.text, "OptionCard")
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.pressed.connect(_pick.bind(opt.id))
		_body.add_child(b)
		if first == null:
			first = b
	_body.add_child(UiKit.label(tr("DECISION_NOTE"), "MutedLabel"))
	first.grab_focus.call_deferred()


func _pick(option_id: String) -> void:
	var r := GameManager.rules.decide(decision_id, option_id)
	GameManager.save()
	UiKit.close_overlay(_body)
	_body = UiKit.overlay(self)
	_body.add_child(UiKit.badge(tr("DECISION")))
	var paper := PanelContainer.new()
	paper.theme_type_variation = "PaperPanel"
	paper.add_child(UiKit.label(r.feedback, "InkLabel"))
	_body.add_child(paper)
	var next := UiKit.button(tr("CONTINUE"))
	next.pressed.connect(func():
		UiKit.close_overlay(_body)
		done.emit(r.results)
		queue_free())
	_body.add_child(next)
	next.grab_focus.call_deferred()
