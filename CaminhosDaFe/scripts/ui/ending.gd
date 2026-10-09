extends Control
## Tela final: pontuação, consequências das escolhas e resumo do que foi aprendido.

@onready var column: VBoxContainer = %Column


func _ready() -> void:
	var chapter: Dictionary = GameManager.chapter
	var cid := GameManager.chapter_id
	if chapter.is_empty():
		GameManager.goto("map")
		return
	var top := GameManager.safe_top_margin(self)
	if top > 0:
		%Margin.add_theme_constant_override("margin_top", 64 + top)
	var progress := ProgressManager.chapter(cid)
	var ending: Dictionary = chapter.ending

	var star := UiKit.icon_rect("star", 88, GameManager.COLORS.gold)
	star.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	column.add_child(star)
	var title := UiKit.label(ending.title, "TitleLabel")
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	column.add_child(title)

	# Números da jornada
	var stats := HBoxContainer.new()
	stats.add_theme_constant_override("separation", 12)
	var correct := 0
	for q in progress.questions.values():
		if q.correct:
			correct += 1
	var max_points := Scoring.max_points(chapter.questions.size(), chapter.challenges.size())
	stats.add_child(_stat(tr("ENDING_SCORE"), "%d / %d" % [ProgressManager.score(cid), max_points]))
	stats.add_child(_stat(tr("ENDING_CHALLENGES"), "%d / %d" % [progress.challenges.size(), chapter.challenges.size()]))
	stats.add_child(_stat(tr("ENDING_ANSWERS"), "%d / %d" % [correct, chapter.questions.size()]))
	column.add_child(stats)

	# Consequências das escolhas
	column.add_child(UiKit.label(tr("ENDING_CHOICES"), "HeadingLabel"))
	column.add_child(UiKit.label(ending.intro))
	for choice_id in chapter.choices:
		var picked = progress.choices.get(choice_id)
		for opt in chapter.choices[choice_id].options:
			if opt.id == picked:
				var soft := PanelContainer.new()
				soft.theme_type_variation = "SoftPanel"
				soft.add_child(UiKit.label(opt.ending))
				column.add_child(soft)

	# O que foi aprendido
	column.add_child(UiKit.label(tr("ENDING_LESSONS"), "HeadingLabel"))
	for lesson in ending.lessons:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 12)
		var ic := UiKit.icon_rect("check", 36, GameManager.COLORS.green)
		ic.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
		row.add_child(ic)
		var l := UiKit.label(lesson)
		l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(l)
		column.add_child(row)
	column.add_child(UiKit.label(ending.closing, "MutedLabel"))

	var diary := UiKit.button(tr("ENDING_DIARY"), "SecondaryButton", "book")
	diary.add_theme_color_override("icon_normal_color", GameManager.COLORS.ink)
	diary.pressed.connect(func(): DiaryView.open(self, chapter, progress.diary))
	column.add_child(diary)
	var map := UiKit.button(tr("ENDING_MAP"), "", "map")
	map.pressed.connect(func(): GameManager.goto("map"))
	column.add_child(map)
	var restart := UiKit.button(tr("RESTART_CHAPTER"), "GhostButton")
	restart.pressed.connect(func():
		UiKit.confirm(self, tr("CONFIRM_RESTART"), tr("CONFIRM_YES_RESTART"), func():
			ProgressManager.reset_chapter(cid)
			GameManager.goto("exploration")))
	column.add_child(restart)
	map.grab_focus.call_deferred()


func _stat(caption: String, value: String) -> Control:
	var p := PanelContainer.new()
	p.theme_type_variation = "SoftPanel"
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var col := VBoxContainer.new()
	var v := UiKit.label(value, "HeadingLabel", false)
	v.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var c := UiKit.label(caption, "MutedLabel")
	c.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(v)
	col.add_child(c)
	p.add_child(col)
	return p
