extends Control
## Tela de resultado: final narrativo, pontuação, avaliação das evidências
## apresentadas e a explicação de como as pistas se conectam.

@onready var column: VBoxContainer = %Column


func _ready() -> void:
	var data: Dictionary = GameManager.case_data
	var st: CaseState = GameManager.state
	if st == null or st.accusation.is_empty():
		GameManager.goto("menu")
		return
	var top := GameManager.safe_top_margin(self)
	if top > 0:
		%Margin.add_theme_constant_override("margin_top", 56 + top)
	var correct: bool = st.accusation.correct
	var ending: Dictionary = data.endings.correct if correct else data.endings.wrong

	column.add_child(UiKit.badge(tr("RESULT")))
	column.add_child(UiKit.label(ending.title, "TitleLabel"))
	var story := PanelContainer.new()
	story.theme_type_variation = "PaperPanel"
	var story_col := VBoxContainer.new()
	story_col.add_theme_constant_override("separation", 12)
	story_col.add_child(UiKit.label(ending.text, "InkLabel"))
	for did in ending.get("epilogue", {}):
		var pick := st.choice(did)
		var text: String = ending.epilogue[did].get(pick, "")
		if text != "":
			story_col.add_child(UiKit.label(text, "InkLabel"))
	story.add_child(story_col)
	column.add_child(story)

	# Pontuação
	var sc: Dictionary = data.scoring
	var total := st.score(data)
	var max_total := CaseState.max_score(data)
	var rank := "RANK_1" if correct and total >= max_total * 0.75 else ("RANK_2" if correct else "RANK_3")
	column.add_child(UiKit.label(tr(rank), "HeadingLabel"))
	column.add_child(UiKit.label(tr("SCORE_TOTAL") % [total, max_total], "StrongLabel"))
	var relevant: Array = data.accusation.relevant_evidence
	var good := 0
	for e in st.accusation.evidence:
		if e in relevant:
			good += 1
	var rows := [
		[tr("SCORE_CLUES"), "%d/%d" % [st.clues.size(), data.clues.size()], st.clues.size() * int(sc.clue)],
		[tr("SCORE_CONTRADICTIONS"), "%d/%d" % [st.contradictions.size(), data.contradictions.size()], st.contradictions.size() * int(sc.contradiction)],
		[tr("SCORE_ACCUSATION"), tr("RIGHT") if correct else tr("WRONG"), int(sc.correct) if correct else 0],
		[tr("SCORE_EVIDENCE"), "%d/%d" % [good, int(data.accusation.max_evidence)], good * int(sc.evidence)],
	]
	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 16)
	grid.add_theme_constant_override("v_separation", 6)
	for r in rows:
		var name := UiKit.label(r[0], "MutedLabel", false)
		name.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		grid.add_child(name)
		grid.add_child(UiKit.label(r[1], "StrongLabel", false))
		var pts := UiKit.label("+%d" % r[2], "BadgeLabel", false)
		pts.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		grid.add_child(pts)
	var score_panel := PanelContainer.new()
	score_panel.add_child(grid)
	column.add_child(score_panel)

	# Evidências apresentadas
	column.add_child(UiKit.label(tr("YOUR_EVIDENCE"), "HeadingLabel"))
	var reasons: Dictionary = data.accusation.get("evidence_reasons", {})
	for e in st.accusation.evidence:
		var ok: bool = e in relevant
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		var ic := UiKit.icon_rect("check" if ok else "close", 30, GameManager.C.found if ok else GameManager.C.wrong)
		ic.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
		row.add_child(ic)
		var l := UiKit.label("%s: %s" % [GameManager.clue(e).title, reasons.get(e, "")])
		l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(l)
		column.add_child(row)

	# Como as pistas se conectam
	column.add_child(UiKit.label(tr("HOW_IT_CONNECTS"), "HeadingLabel"))
	var n := 0
	for step in data.explanation:
		n += 1
		var card := PanelContainer.new()
		var col := VBoxContainer.new()
		col.add_theme_constant_override("separation", 6)
		var titles := []
		for cid in step.get("clues", []):
			titles.append(GameManager.clue(cid).title + ("" if st.has_clue(cid) else " ✗"))
		col.add_child(UiKit.label("%d · %s" % [n, " + ".join(titles)], "BadgeLabel"))
		col.add_child(UiKit.label(step.text))
		card.add_child(col)
		column.add_child(card)

	var again := UiKit.button(tr("PLAY_AGAIN"))
	again.pressed.connect(func():
		GameManager.restart_case()
		GameManager.goto("investigation"))
	column.add_child(again)
	var menu := UiKit.button(tr("MENU"), "SecondaryButton")
	menu.pressed.connect(func(): GameManager.goto("menu"))
	column.add_child(menu)
	again.grab_focus.call_deferred()
	Fx.ambient(self, "dust")
	Fx.stagger(column.get_children(), 0.07, 0.1)
