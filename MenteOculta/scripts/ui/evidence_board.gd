extends VBoxContainer
## Quadro de evidências: o jogador coloca duas informações lado a lado e compara.
## Se forem uma contradição prevista no caso, ela é registrada; se não, o jogo explica por quê.

signal contradiction_found(id: String)

const ClueCardScene := preload("res://scenes/clue_card.tscn")

var _a := ""
var _b := ""
var _cards := {}


func _ready() -> void:
	%CompareButton.pressed.connect(_compare)
	%ClearButton.pressed.connect(func():
		_a = ""
		_b = ""
		%Result.hide()
		_refresh_slots())
	refresh()


func refresh() -> void:
	for c in %Items.get_children():
		c.queue_free()
	_cards.clear()
	for item in GameManager.rules.board_items():
		var card := ClueCardScene.instantiate()
		card.setup(item, true)
		card.pressed.connect(_pick)
		%Items.add_child(card)
		_cards[item.id] = card
	for c in %Found.get_children():
		c.queue_free()
	var data: Dictionary = GameManager.case_data
	for x in data.contradictions:
		if GameManager.state.has_contradiction(x.id):
			var row := HBoxContainer.new()
			row.add_theme_constant_override("separation", 8)
			row.add_child(UiKit.icon_rect("check", 28, GameManager.C.found))
			var l := UiKit.label(x.title, "StrongLabel")
			l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			row.add_child(l)
			%Found.add_child(row)
	%Progress.text = tr("CONTRADICTIONS") % [GameManager.state.contradictions.size(), data.contradictions.size()]
	_refresh_slots()


func _pick(id: String) -> void:
	if id == _a or id == _b:
		return
	if _a == "":
		_a = id
	elif _b == "":
		_b = id
	else:
		_a = _b
		_b = id
	%Result.hide()
	_refresh_slots()


func _refresh_slots() -> void:
	%SlotAText.text = _describe(_a)
	%SlotBText.text = _describe(_b)
	%SlotAText.theme_type_variation = "Label" if _a != "" else "MutedLabel"
	%SlotBText.theme_type_variation = "Label" if _b != "" else "MutedLabel"
	%CompareButton.disabled = _a == "" or _b == ""
	for id in _cards:
		_cards[id].set_selected(id == _a or id == _b)


func _describe(id: String) -> String:
	if id == "":
		return tr("SLOT_EMPTY")
	var c := GameManager.clue(id)
	if not c.is_empty():
		return "%s\n%s" % [c.title, c.summary]
	var s := GameManager.statement(id)
	return "%s: “%s”" % [GameManager.character(s.character).name, s.text]


func _compare() -> void:
	var r := GameManager.rules.compare(_a, _b)
	%Result.show()
	if r.found:
		%ResultTitle.text = (tr("CONTRADICTION_FOUND") if r.new else tr("CONTRADICTION_ALREADY")) + "\n" + r.title
		%ResultText.text = r.text
		GameManager.save()
		if r.new:
			contradiction_found.emit(r.id)
			refresh()
			%Result.show()
	else:
		%ResultTitle.text = ""
		%ResultText.text = r.text
	%ResultTitle.visible = %ResultTitle.text != ""
