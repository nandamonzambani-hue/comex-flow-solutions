extends Control
## Tela de desafio. Monta a interface certa para cada tipo:
##   assignment   → Mutirão (cooperação)
##   distribution → Cestas (generosidade)
##   pipes        → Canal (serviço)
## Emite completed(pontos) quando o jogador conclui.

signal completed(points: int)

const PipeBoard := preload("res://scripts/ui/pipe_board.gd")
const VIRTUE_ICON := {"assignment": "person", "distribution": "heart", "pipes": "sprout"}

@onready var puzzle_box: VBoxContainer = %Puzzle
@onready var feedback: Label = %Feedback
@onready var hint_button: Button = %HintButton
@onready var check_button: Button = %CheckButton

var challenge_id := ""
var chapter_id := ""
var def: Dictionary = {}
var hints_used := 0
var _done := false

# estado de cada tipo de desafio
var _assignment: AssignmentPuzzle
var _choices := {}          # pessoa -> tarefa
var _person_labels := {}
var _distribution: DistributionPuzzle
var _baskets := {}          # casa -> {item: qtd}
var _count_labels := {}     # "casa/item" -> Label
var _stock_labels := {}
var _house_titles := {}
var _pipes: PipesPuzzle
var _board: Control


func setup(id: String, definition: Dictionary, chapter: String) -> void:
	challenge_id = id
	def = definition
	chapter_id = chapter


func _ready() -> void:
	%Virtue.text = "%s · %s" % [tr("CHALLENGE").to_upper(), String(def.virtue).to_upper()]
	%Icon.texture = UiKit.icon(VIRTUE_ICON.get(def.type, "puzzle"))
	%Title.text = def.title
	%Intro.text = def.intro
	hint_button.icon = UiKit.icon("hint")
	hint_button.pressed.connect(_on_hint)
	check_button.pressed.connect(_on_check)
	match def.type:
		"assignment":
			_build_assignment()
		"distribution":
			_build_distribution()
		"pipes":
			_build_pipes()
	_apply_safe_area()


func _apply_safe_area() -> void:
	var top := GameManager.safe_top_margin(self)
	if top > 0:
		%Margin.add_theme_constant_override("margin_top", 32 + top)


# ---------------------------------------------------------------- cooperação

func _build_assignment() -> void:
	_assignment = AssignmentPuzzle.from_data(def.data)
	var clues := PanelContainer.new()
	clues.theme_type_variation = "SoftPanel"
	var col := VBoxContainer.new()
	col.add_child(UiKit.label(tr("CLUES"), "BadgeLabel"))
	for clue in _assignment.clues:
		col.add_child(UiKit.label("• " + clue))
	clues.add_child(col)
	puzzle_box.add_child(clues)

	for person in _assignment.people:
		var card := PanelContainer.new()
		var row := VBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		var name_label := UiKit.label(person.name, "StrongLabel", false)
		_person_labels[person.id] = name_label
		row.add_child(name_label)
		var flow := GridContainer.new()
		flow.columns = 2
		flow.add_theme_constant_override("h_separation", 8)
		flow.add_theme_constant_override("v_separation", 8)
		var group := ButtonGroup.new()
		for task in _assignment.tasks:
			var chip := UiKit.button(task.get("short", task.name), "OptionButtonCard")
			chip.custom_minimum_size = Vector2(0, 76)
			chip.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			chip.autowrap_mode = TextServer.AUTOWRAP_OFF
			chip.clip_text = true
			chip.toggle_mode = true
			chip.button_group = group
			chip.tooltip_text = task.name
			chip.toggled.connect(func(on):
				if on:
					_choices[person.id] = task.id
					_reset_assignment_marks()
				_style_chip(chip, on))
			flow.add_child(chip)
		row.add_child(flow)
		card.add_child(row)
		puzzle_box.add_child(card)

	var legend := VBoxContainer.new()
	for task in _assignment.tasks:
		legend.add_child(UiKit.label("%s: %s" % [task.get("short", task.name), task.name], "MutedLabel"))
	puzzle_box.add_child(legend)


func _style_chip(chip: Button, on: bool) -> void:
	if on:
		var sb: StyleBoxFlat = chip.get_theme_stylebox("pressed").duplicate()
		sb.bg_color = GameManager.COLORS.blue
		chip.add_theme_stylebox_override("pressed", sb)
		chip.add_theme_stylebox_override("hover_pressed", sb)
		chip.add_theme_color_override("font_pressed_color", Color.WHITE)
		chip.add_theme_color_override("font_hover_pressed_color", Color.WHITE)
	else:
		for s in ["pressed", "hover_pressed"]:
			chip.remove_theme_stylebox_override(s)


func _reset_assignment_marks() -> void:
	feedback.text = ""
	for pid in _person_labels:
		_person_labels[pid].remove_theme_color_override("font_color")


func _check_assignment() -> bool:
	if _choices.size() < _assignment.people.size():
		feedback.text = tr("ASSIGN_INCOMPLETE")
		return false
	var bad := _assignment.conflicts(_choices)
	for pid in _person_labels:
		if pid in bad:
			_person_labels[pid].add_theme_color_override("font_color", GameManager.COLORS.wrong)
	if bad.is_empty():
		return true
	feedback.text = tr("ASSIGN_CONFLICT")
	return false


# ---------------------------------------------------------------- generosidade

func _build_distribution() -> void:
	_distribution = DistributionPuzzle.from_data(def.data)
	for h in _distribution.households:
		_baskets[h.id] = {}

	var stock := PanelContainer.new()
	stock.theme_type_variation = "SoftPanel"
	var stock_col := VBoxContainer.new()
	stock_col.add_child(UiKit.label(tr("IN_STOCK"), "BadgeLabel"))
	var grid := GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 20)
	for item in _distribution.items:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		row.add_child(UiKit.icon_rect(item.icon, 36, GameManager.COLORS.gold))
		var l := UiKit.label("", "StrongLabel", false)
		_stock_labels[item.id] = l
		row.add_child(l)
		grid.add_child(row)
	stock_col.add_child(grid)
	stock.add_child(stock_col)
	puzzle_box.add_child(stock)

	for h in _distribution.households:
		var card := PanelContainer.new()
		var col := VBoxContainer.new()
		col.add_theme_constant_override("separation", 8)
		var title := UiKit.label(h.name, "StrongLabel", false)
		_house_titles[h.id] = title
		col.add_child(title)
		col.add_child(UiKit.label(h.description, "MutedLabel"))
		var g := GridContainer.new()
		g.columns = 2
		g.add_theme_constant_override("h_separation", 12)
		g.add_theme_constant_override("v_separation", 8)
		for item in _distribution.items:
			g.add_child(_stepper(h.id, item))
		col.add_child(g)
		card.add_child(col)
		puzzle_box.add_child(card)
	_refresh_distribution()


func _stepper(hid: String, item: Dictionary) -> Control:
	var row := HBoxContainer.new()
	row.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_theme_constant_override("separation", 4)
	var ic := UiKit.icon_rect(item.icon, 34, GameManager.COLORS.blue)
	ic.tooltip_text = item.name
	row.add_child(ic)
	var minus := UiKit.button("", "GhostButton", "minus")
	minus.custom_minimum_size = Vector2(76, 76)
	minus.add_theme_color_override("icon_normal_color", GameManager.COLORS.blue_dark)
	minus.tooltip_text = item.name
	var count := UiKit.label("0", "HeadingLabel", false)
	count.custom_minimum_size.x = 40
	count.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_count_labels[hid + "/" + item.id] = count
	var plus := UiKit.button("", "SecondaryButton", "plus")
	plus.custom_minimum_size = Vector2(76, 76)
	plus.add_theme_color_override("icon_normal_color", GameManager.COLORS.ink)
	plus.tooltip_text = item.name
	minus.pressed.connect(func(): _change(hid, item.id, -1))
	plus.pressed.connect(func(): _change(hid, item.id, 1))
	row.add_child(minus)
	row.add_child(count)
	row.add_child(plus)
	return row


func _change(hid: String, iid: String, delta: int) -> void:
	var basket: Dictionary = _baskets[hid]
	var current := int(basket.get(iid, 0))
	if delta > 0 and not _distribution.can_add(_baskets, iid):
		return
	basket[iid] = max(0, current + delta)
	feedback.text = ""
	for t in _house_titles.values():
		t.remove_theme_color_override("font_color")
	_refresh_distribution()


func _refresh_distribution() -> void:
	for item in _distribution.items:
		_stock_labels[item.id].text = "%s: %d" % [item.name, _distribution.remaining(_baskets, item.id)]
	for key in _count_labels:
		var parts: PackedStringArray = key.split("/")
		_count_labels[key].text = str(int(_baskets[parts[0]].get(parts[1], 0)))


func _check_distribution() -> bool:
	var bad := _distribution.unmet(_baskets)
	for hid in bad:
		_house_titles[hid].add_theme_color_override("font_color", GameManager.COLORS.wrong)
	if bad.is_empty():
		return true
	feedback.text = tr("BASKETS_UNMET")
	return false


# ---------------------------------------------------------------- serviço

func _build_pipes() -> void:
	_pipes = PipesPuzzle.from_data(def.data)
	_board = PipeBoard.new()
	_board.puzzle = _pipes
	_board.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_board.rotated.connect(func():
		feedback.text = ""
		if _pipes.is_solved():
			_succeed())
	puzzle_box.add_child(_board)
	puzzle_box.add_child(UiKit.label(tr("PIPES_TIP"), "MutedLabel"))
	check_button.hide()


# ---------------------------------------------------------------- comum

func _on_hint() -> void:
	hints_used += 1
	feedback.text = def.hint


func _on_check() -> void:
	if _done:
		return
	var ok := false
	match def.type:
		"assignment":
			ok = _check_assignment()
		"distribution":
			ok = _check_distribution()
		"pipes":
			ok = _pipes.is_solved()
			if not ok:
				feedback.text = tr("PIPES_NOT_YET")
	if ok:
		_succeed()


func _succeed() -> void:
	if _done:
		return
	_done = true
	var points := ProgressManager.record_challenge(chapter_id, challenge_id, hints_used)
	feedback.text = "%s %s\n%s" % [tr("CHALLENGE_DONE"), tr("POINTS_EARNED") % points, def.success]
	feedback.add_theme_color_override("font_color", GameManager.COLORS.green)
	hint_button.hide()
	check_button.show()
	check_button.text = tr("CONTINUE")
	check_button.icon = UiKit.icon("check")
	for c in check_button.pressed.get_connections():
		check_button.pressed.disconnect(c.callable)
	check_button.pressed.connect(func(): completed.emit(points))
	check_button.grab_focus()
	var t := create_tween()
	feedback.scale = Vector2(0.9, 0.9)
	feedback.pivot_offset = feedback.size / 2
	t.tween_property(feedback, "scale", Vector2.ONE, 0.25).set_trans(Tween.TRANS_BACK)
	Fx.confetti(self, size / 2.0, 90)
