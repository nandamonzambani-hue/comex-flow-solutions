extends Control
## Mapa de progressão: mostra os capítulos (disponíveis e "em breve").

const MAP_SIZE := Vector2(720, 1280)

@onready var markers: Control = %Markers
@onready var background: TextureRect = %Background

var _entries: Array = []


func _ready() -> void:
	%BackButton.icon = UiKit.icon("back")
	%BackButton.add_theme_color_override("icon_normal_color", GameManager.COLORS.blue_dark)
	%BackButton.pressed.connect(func(): GameManager.goto("menu"))
	%BackButton.tooltip_text = tr("BACK")
	_entries = ContentLoader.chapter_index()
	_build_markers()
	resized.connect(_place_markers)
	_place_markers.call_deferred()
	Fx.breathe(background, 0.02, 12.0)
	Fx.ambient(self, "pollen")
	Fx.stagger(markers.get_children(), 0.18, 0.25)


func _build_markers() -> void:
	for entry in _entries:
		var available: bool = entry.status == "available"
		var box := VBoxContainer.new()
		box.alignment = BoxContainer.ALIGNMENT_CENTER
		box.add_theme_constant_override("separation", 6)
		box.set_meta("entry", entry)

		var b := Button.new()
		b.custom_minimum_size = Vector2(124, 124)
		b.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		b.icon = UiKit.icon("star" if ProgressManager.is_completed(entry.id) else ("map" if available else "lock"))
		b.expand_icon = true
		b.add_theme_constant_override("icon_max_width", 64)
		b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		b.theme_type_variation = "" if available else "SecondaryButton"
		b.add_theme_stylebox_override("normal", _circle(GameManager.COLORS.blue if available else Color("c9b48c")))
		b.add_theme_stylebox_override("hover", _circle(GameManager.COLORS.blue_dark if available else Color("b9a47c")))
		b.add_theme_stylebox_override("pressed", _circle(GameManager.COLORS.blue_dark if available else Color("b9a47c")))
		b.tooltip_text = entry.title
		b.pressed.connect(_open_card.bind(entry))
		box.add_child(b)

		var tag := PanelContainer.new()
		tag.theme_type_variation = "BadgePanel"
		tag.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		var l := UiKit.label("%s · %s" % [tr("CHAPTER_N") % int(entry.number), entry.virtue], "BadgeLabel", false)
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		tag.add_child(l)
		box.add_child(tag)
		markers.add_child(box)


func _place_markers() -> void:
	# O fundo usa "cobrir mantendo proporção": calcula onde a imagem foi parar na tela.
	var view := size
	var scale := maxf(view.x / MAP_SIZE.x, view.y / MAP_SIZE.y)
	var drawn := MAP_SIZE * scale
	var offset := (view - drawn) / 2.0
	for box: Control in markers.get_children():
		var entry: Dictionary = box.get_meta("entry")
		var p := offset + Vector2(entry.map_pos[0], entry.map_pos[1]) * drawn
		box.reset_size()
		var s := box.get_combined_minimum_size()
		box.position = p - Vector2(s.x / 2.0, 62)


func _open_card(entry: Dictionary) -> void:
	var body := UiKit.overlay(self)
	body.add_child(UiKit.badge(tr("CHAPTER_N") % int(entry.number)))
	if entry.status != "available":
		body.add_child(UiKit.label(tr("COMING_SOON"), "HeadingLabel"))
		body.add_child(UiKit.label("%s: %s" % [tr("VIRTUE"), entry.virtue], "StrongLabel"))
		body.add_child(UiKit.label(tr("COMING_SOON_TEXT")))
		var ok := UiKit.button(tr("CLOSE"))
		ok.pressed.connect(func(): UiKit.close_overlay(body))
		body.add_child(ok)
		return

	body.add_child(UiKit.label(entry.title, "HeadingLabel"))
	body.add_child(UiKit.label("%s · %s: %s" % [entry.place, tr("VIRTUE"), entry.virtue], "StrongLabel"))
	var progress := ProgressManager.chapter(entry.id)
	if ProgressManager.is_completed(entry.id):
		body.add_child(UiKit.label("%s · %s" % [tr("COMPLETED"), tr("BEST_SCORE") % int(progress.best_score)], "MutedLabel"))
	elif ProgressManager.has_started(entry.id):
		body.add_child(UiKit.label(tr("IN_PROGRESS"), "MutedLabel"))

	var started: bool = ProgressManager.has_started(entry.id) and progress.status == "in_progress"
	var go := UiKit.button(tr("CONTINUE_CHAPTER") if started else tr("START_CHAPTER"), "", "map")
	go.pressed.connect(func():
		if ProgressManager.is_completed(entry.id) and progress.status == "completed":
			ProgressManager.reset_chapter(entry.id)
		_start(entry, body))
	body.add_child(go)
	if started:
		var restart := UiKit.button(tr("RESTART_CHAPTER"), "SecondaryButton")
		restart.pressed.connect(func():
			UiKit.confirm(self, tr("CONFIRM_RESTART"), tr("CONFIRM_YES_RESTART"), func():
				ProgressManager.reset_chapter(entry.id)
				_start(entry, body)))
		body.add_child(restart)
	var close := UiKit.button(tr("CLOSE"), "GhostButton")
	close.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(close)
	go.grab_focus.call_deferred()


func _start(entry: Dictionary, card: Control) -> void:
	if GameManager.open_chapter(entry):
		UiKit.close_overlay(card)
		GameManager.goto("exploration")
		return
	UiKit.close_overlay(card)
	var body := UiKit.overlay(self)
	body.add_child(UiKit.label(tr("CONTENT_ERROR"), "StrongLabel"))
	var text := ""
	for e in GameManager.load_errors.slice(0, 8):
		text += "• " + e + "\n"
	body.add_child(UiKit.label(text, "MutedLabel"))
	var ok := UiKit.button(tr("CLOSE"))
	ok.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(ok)


func _circle(color: Color) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = color
	sb.set_corner_radius_all(62)
	sb.border_color = GameManager.COLORS.gold_soft
	sb.set_border_width_all(6)
	sb.shadow_color = Color(0.25, 0.18, 0.1, 0.25)
	sb.shadow_size = 8
	sb.shadow_offset = Vector2(0, 4)
	return sb
