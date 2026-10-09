extends Control
## Acusação final em duas etapas: escolher o suspeito e escolher as evidências.

const ClueCardScene := preload("res://scenes/clue_card.tscn")

var _suspect := ""
var _evidence: Array = []
var _cards := {}


func _ready() -> void:
	if GameManager.state == null:
		GameManager.goto("menu")
		return
	var top := GameManager.safe_top_margin(self)
	if top > 0:
		%Margin.add_theme_constant_override("margin_top", 40 + top)
	_step_suspect()


func _clear() -> void:
	for c in %Column.get_children():
		c.queue_free()


func _header(title: String) -> void:
	var back := UiKit.button(tr("BACK"), "GhostButton", "back")
	back.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	back.autowrap_mode = TextServer.AUTOWRAP_OFF
	back.pressed.connect(func():
		if _suspect == "" or %Column.get_child_count() == 0:
			GameManager.goto("investigation")
		else:
			_suspect = ""
			_step_suspect())
	%Column.add_child(back)
	%Column.add_child(UiKit.badge(tr("ACCUSE")))
	%Column.add_child(UiKit.label(title, "TitleLabel" if title.length() < 30 else "HeadingLabel"))


func _step_suspect() -> void:
	_clear()
	_suspect = ""
	var acc: Dictionary = GameManager.case_data.accusation
	_header(acc.get("prompt", tr("ACCUSE")))
	for sid in GameManager.rules.suspects():
		var ch: Dictionary = GameManager.case_data.characters[sid]
		var b := UiKit.button(ch.name, "OptionCard")
		b.icon = load(ch.portrait)
		b.expand_icon = true
		b.add_theme_constant_override("icon_max_width", 110)
		b.custom_minimum_size.y = 140
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.pressed.connect(func():
			_suspect = sid
			_step_evidence())
		%Column.add_child(b)


func _step_evidence() -> void:
	_clear()
	_evidence.clear()
	_cards.clear()
	var acc: Dictionary = GameManager.case_data.accusation
	var name: String = GameManager.case_data.characters[_suspect].name
	_header(name)
	%Column.add_child(UiKit.label(tr("ACCUSE_EVIDENCE") % int(acc.max_evidence), "MutedLabel"))
	for id in GameManager.state.clues:
		var clue := GameManager.clue(id)
		var card := ClueCardScene.instantiate()
		card.setup({"id": id, "kind": "clue", "title": clue.title, "text": clue.summary, "icon": clue.icon}, true)
		card.pressed.connect(_toggle)
		%Column.add_child(card)
		_cards[id] = card
	var go := UiKit.button(tr("ACCUSE"), "", "scale")
	go.custom_minimum_size.y = 100
	go.pressed.connect(func():
		if _evidence.is_empty():
			UiKit.toast(self, tr("ACCUSE_NEED_EVIDENCE"))
			return
		UiKit.confirm(self, tr("ACCUSE_CONFIRM") % name, tr("ACCUSE_YES"), _confirm))
	%Column.add_child(go)


func _toggle(id: String) -> void:
	var max_n := int(GameManager.case_data.accusation.max_evidence)
	if id in _evidence:
		_evidence.erase(id)
	elif _evidence.size() < max_n:
		_evidence.append(id)
	else:
		_evidence.pop_front()
		_evidence.append(id)
	for k in _cards:
		_cards[k].set_selected(k in _evidence)


func _confirm() -> void:
	GameManager.rules.accuse(_suspect, _evidence)
	GameManager.record_result()
	GameManager.goto("ending")
