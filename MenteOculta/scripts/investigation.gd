extends Control
## Tela principal da investigação.
## Abas: Local (examinar a livraria), Suspeitos (interrogar), Pistas (inventário) e Quadro
## (comparar depoimentos). Todo o conteúdo vem do JSON do caso; as regras ficam em
## scripts/rules/. Esta cena só desenha e reage a toques.

const DialogueScene := preload("res://scenes/dialogue.tscn")
const ClueCardScene := preload("res://scenes/clue_card.tscn")
const BG_SIZE := Vector2(720, 1280)
const TABS := [["place", "TAB_PLACE", "map"], ["suspects", "TAB_SUSPECTS", "people"], ["clues", "TAB_CLUES", "clues"], ["board", "TAB_BOARD", "board"]]

var _tab := "place"
var _tab_buttons := {}
var _spots := {}
var _busy := false


func _ready() -> void:
	if GameManager.state == null:
		GameManager.goto("menu")
		return
	%CaseTitle.text = GameManager.case_data.title
	%MenuButton.icon = UiKit.icon("back")
	%MenuButton.tooltip_text = tr("BACK")
	%MenuButton.pressed.connect(func():
		if not _busy:
			GameManager.goto("menu"))
	%HintButton.icon = UiKit.icon("hint")
	%HintButton.tooltip_text = tr("HINT")
	%HintButton.pressed.connect(_open_hint)
	%BoardAccuse.pressed.connect(_accuse)
	%EvidenceBoard.contradiction_found.connect(func(_id): _refresh_all())
	for t in TABS:
		var b := Button.new()
		b.text = tr(t[1])
		b.icon = UiKit.icon(t[2])
		b.theme_type_variation = "TabButton"
		b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		b.vertical_icon_alignment = VERTICAL_ALIGNMENT_TOP
		b.expand_icon = false
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size.y = 96
		b.pressed.connect(show_tab.bind(t[0]))
		%Tabs.add_child(b)
		_tab_buttons[t[0]] = b
	var top := GameManager.safe_top_margin(self)
	if top > 0:
		var sb: StyleBoxFlat = %TopBar.get_theme_stylebox("panel").duplicate()
		sb.content_margin_top += top
		%TopBar.add_theme_stylebox_override("panel", sb)
	_build_spots()
	resized.connect(_layout)
	%TopBar.resized.connect(_layout)
	%BottomNav.resized.connect(_layout)
	show_tab("place")
	await get_tree().process_frame
	_layout()
	if not GameManager.state.is_done("intro"):
		await _play_intro()


# ---------------------------------------------------------------- layout

func _layout() -> void:
	%Pages.offset_top = %TopBar.size.y
	%Pages.offset_bottom = -%BottomNav.size.y
	await get_tree().process_frame
	_place_spots()


func _cover_mode() -> bool:
	var s: Vector2 = %PlacePage.size
	return s.y / maxf(s.x, 1.0) >= BG_SIZE.y / BG_SIZE.x - 0.01


func _bg_rect() -> Rect2:
	var view: Vector2 = %PlacePage.size
	var s := maxf(view.x / BG_SIZE.x, view.y / BG_SIZE.y) if _cover_mode() else minf(view.x / BG_SIZE.x, view.y / BG_SIZE.y)
	var drawn := BG_SIZE * s
	return Rect2((view - drawn) / 2.0, drawn)


func show_tab(id: String) -> void:
	_tab = id
	%PlacePage.visible = id == "place"
	%SuspectsPage.visible = id == "suspects"
	%CluesPage.visible = id == "clues"
	%BoardPage.visible = id == "board"
	for k in _tab_buttons:
		var b: Button = _tab_buttons[k]
		var c: Color = GameManager.C.gold if k == id else GameManager.C.muted
		for s in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color", "icon_normal_color", "icon_hover_color", "icon_pressed_color", "icon_focus_color"]:
			b.add_theme_color_override(s, c)
	_refresh_all()


func _refresh_all() -> void:
	%Objective.text = "%s: %s" % [tr("OBJECTIVE"), GameManager.rules.current_objective().text]
	%HintButton.text = str(GameManager.rules.free_hints_left())
	%BoardAccuse.disabled = false
	match _tab:
		"place":
			_refresh_spots()
		"suspects":
			_build_suspects()
		"clues":
			_build_clues()
		"board":
			%EvidenceBoard.refresh()


# ---------------------------------------------------------------- Local

func _build_spots() -> void:
	for loc in GameManager.case_data.locations:
		var box := VBoxContainer.new()
		box.alignment = BoxContainer.ALIGNMENT_CENTER
		box.add_theme_constant_override("separation", 4)
		var b := Button.new()
		b.custom_minimum_size = Vector2(92, 92)
		b.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		b.icon = UiKit.icon(loc.icon)
		b.expand_icon = true
		b.add_theme_constant_override("icon_max_width", 50)
		b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		b.tooltip_text = loc.name
		b.pressed.connect(_visit.bind(loc.id))
		box.add_child(b)
		var tag := PanelContainer.new()
		tag.theme_type_variation = "NoticePanel"
		tag.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		tag.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var l := UiKit.label(loc.name, "InkStrongLabel", false)
		l.add_theme_font_size_override("font_size", int(GameManager.base_font_size() * 0.72))
		tag.add_child(l)
		box.add_child(tag)
		box.set_meta("loc", loc)
		box.set_meta("button", b)
		%Spots.add_child(box)
		_spots[loc.id] = box


func _place_spots() -> void:
	%Background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED if _cover_mode() else TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	var r := _bg_rect()
	var area: Vector2 = %PlacePage.size
	for id in _spots:
		var box: Control = _spots[id]
		box.reset_size()
		var s := box.get_combined_minimum_size()
		var p := r.position + Vector2(box.get_meta("loc").pos[0], box.get_meta("loc").pos[1]) * r.size
		p -= Vector2(s.x / 2.0, 46)
		box.position = p.clamp(Vector2(4, 4), area - s - Vector2(4, 4))


func _refresh_spots() -> void:
	var available := []
	for loc in GameManager.rules.available_locations():
		available.append(loc.id)
	for id in _spots:
		var box: Control = _spots[id]
		var loc: Dictionary = box.get_meta("loc")
		var b: Button = box.get_meta("button")
		box.visible = id in available
		var is_new := GameManager.rules.is_location_new(loc)
		for state in ["normal", "hover", "pressed", "focus"]:
			b.add_theme_stylebox_override(state, _circle(GameManager.C.wine if is_new else GameManager.C.navy3, state == "focus"))
		if box.has_meta("pulse"):
			box.get_meta("pulse").kill()
		b.scale = Vector2.ONE
		if is_new and box.visible:
			b.pivot_offset = b.custom_minimum_size / 2.0
			var t := b.create_tween().set_loops()
			t.tween_property(b, "scale", Vector2(1.08, 1.08), 0.7).set_trans(Tween.TRANS_SINE)
			t.tween_property(b, "scale", Vector2.ONE, 0.7).set_trans(Tween.TRANS_SINE)
			box.set_meta("pulse", t)


func _circle(color: Color, focus := false) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = color
	sb.set_corner_radius_all(46)
	sb.border_color = GameManager.C.gold if focus else GameManager.C.paper
	sb.set_border_width_all(5 if focus else 3)
	sb.shadow_color = Color(0, 0, 0, 0.5)
	sb.shadow_size = 8
	return sb


func _visit(location_id: String) -> void:
	if _busy:
		return
	_busy = true
	var loc: Dictionary = _spots[location_id].get_meta("loc")
	var r := GameManager.rules.visit(location_id)
	GameManager.save()
	var body := UiKit.overlay(%Overlays)
	body.add_child(UiKit.label(loc.name, "HeadingLabel"))
	for text in r.texts:
		var paper := PanelContainer.new()
		paper.theme_type_variation = "PaperPanel"
		paper.add_child(UiKit.label(text, "InkLabel"))
		body.add_child(paper)
	var ok := UiKit.button(tr("CONTINUE"))
	body.add_child(ok)
	ok.grab_focus.call_deferred()
	await ok.pressed
	UiKit.close_overlay(body)
	await handle_results(r.results)
	_busy = false
	_refresh_all()


## Mostra o que um efeito produziu: nova pista (abre o documento), depoimento ou decisão.
func handle_results(results: Array) -> void:
	for res in results:
		if res.has("new_clue"):
			await _show_new_clue(res.new_clue)
		elif res.has("new_statement"):
			UiKit.toast(%Overlays, tr("NEW_STATEMENT"))
		elif res.has("decision"):
			var v := DecisionView.present(%Overlays, res.decision)
			var more: Array = await v.done
			await handle_results(more)
	_refresh_all()


func _show_new_clue(id: String) -> void:
	var clue := GameManager.clue(id)
	UiKit.toast(%Overlays, tr("NEW_CLUE") % clue.title)
	DocumentView.open(%Overlays, clue)
	# Espera o documento ser fechado antes de seguir.
	while %Overlays.get_child_count() > 0 and _has_overlay():
		await get_tree().process_frame


func _has_overlay() -> bool:
	for c in %Overlays.get_children():
		if not c.has_meta("toast"):
			return true
	return false


# ---------------------------------------------------------------- Suspeitos

func _build_suspects() -> void:
	for c in %SuspectList.get_children():
		c.queue_free()
	for sid in GameManager.rules.suspects():
		var ch: Dictionary = GameManager.case_data.characters[sid]
		var card := PanelContainer.new()
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 16)
		var pic := TextureRect.new()
		pic.texture = load(ch.portrait)
		pic.custom_minimum_size = Vector2(150, 150)
		pic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		pic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		pic.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
		row.add_child(pic)
		var col := VBoxContainer.new()
		col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		col.add_theme_constant_override("separation", 6)
		col.add_child(UiKit.label(ch.name, "HeadingLabel"))
		col.add_child(UiKit.label(ch.role, "BadgeLabel"))
		col.add_child(UiKit.label(ch.get("bio", ""), "MutedLabel"))
		var talk := UiKit.button(tr("INTERROGATE"), "" if GameManager.rules.has_new_topics(sid) else "SecondaryButton", "chat")
		if GameManager.rules.has_new_topics(sid) and GameManager.state.has_flag("talked_" + sid):
			talk.text = tr("NEW_QUESTIONS")
		talk.pressed.connect(_talk.bind(sid))
		col.add_child(talk)
		row.add_child(col)
		card.add_child(row)
		%SuspectList.add_child(card)
	var accuse := UiKit.button(tr("ACCUSE"), "", "scale")
	accuse.custom_minimum_size.y = 100
	accuse.pressed.connect(_accuse)
	%SuspectList.add_child(accuse)


func _talk(sid: String) -> void:
	if _busy:
		return
	var d := DialogueScene.instantiate()
	d.setup(sid)
	%Overlays.add_child(d)
	await d.closed
	_refresh_all()


# ---------------------------------------------------------------- Pistas

func _build_clues() -> void:
	for c in %ClueList.get_children():
		c.queue_free()
	var data: Dictionary = GameManager.case_data
	%ClueList.add_child(UiKit.label(tr("CLUES_FOUND") % [GameManager.state.clues.size(), data.clues.size()], "HeadingLabel"))
	for clue in data.clues:
		var card := ClueCardScene.instantiate()
		if GameManager.state.has_clue(clue.id):
			card.setup({"id": clue.id, "kind": "clue", "title": clue.title, "text": clue.summary, "icon": clue.icon})
			card.pressed.connect(func(_id): DocumentView.open(%Overlays, clue))
		else:
			card.setup({"id": clue.id, "kind": "unknown", "title": tr("UNKNOWN_CLUE")})
		%ClueList.add_child(card)
	%ClueList.add_child(UiKit.label(tr("STATEMENTS"), "HeadingLabel"))
	var any := false
	for s in data.statements:
		if GameManager.state.has_statement(s.id):
			any = true
			var card := ClueCardScene.instantiate()
			card.setup({"id": s.id, "kind": "statement", "title": data.characters[s.character].name, "text": s.text})
			%ClueList.add_child(card)
	if not any:
		%ClueList.add_child(UiKit.label(tr("NO_STATEMENTS"), "MutedLabel"))


# ---------------------------------------------------------------- dicas, introdução, acusação

func _open_hint() -> void:
	var body := UiKit.overlay(%Overlays)
	body.add_child(UiKit.label(tr("HINT"), "HeadingLabel"))
	body.add_child(UiKit.label("%s: %s" % [tr("OBJECTIVE"), GameManager.rules.current_objective().text], "StrongLabel"))
	var left := GameManager.rules.free_hints_left()
	if left > 0:
		body.add_child(UiKit.label(tr("HINT_LEFT") % left, "MutedLabel"))
		var use := UiKit.button(tr("USE_HINT"), "", "hint")
		use.pressed.connect(func():
			var text := GameManager.rules.use_hint()
			GameManager.save()
			UiKit.close_overlay(body)
			var b2 := UiKit.overlay(%Overlays)
			b2.add_child(UiKit.label(tr("HINT"), "HeadingLabel"))
			var paper := PanelContainer.new()
			paper.theme_type_variation = "PaperPanel"
			paper.add_child(UiKit.label(text, "InkLabel"))
			b2.add_child(paper)
			var ok := UiKit.button(tr("CLOSE"))
			ok.pressed.connect(func(): UiKit.close_overlay(b2))
			b2.add_child(ok)
			_refresh_all())
		body.add_child(use)
	else:
		# Futuro: aqui pode entrar um anúncio recompensado OPCIONAL para dicas extras.
		body.add_child(UiKit.label(tr("HINT_NONE")))
	var close := UiKit.button(tr("CLOSE"), "GhostButton")
	close.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(close)


func _play_intro() -> void:
	_busy = true
	for line in GameManager.case_data.intro:
		var who := GameManager.character(line.speaker)
		var body := UiKit.overlay(%Overlays)
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 14)
		row.add_child(_portrait(who.portrait, 110))
		var col := VBoxContainer.new()
		col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		col.add_child(UiKit.label(who.name, "HeadingLabel"))
		col.add_child(UiKit.label(line.text))
		row.add_child(col)
		body.add_child(row)
		var next := UiKit.button(tr("CONTINUE"))
		body.add_child(next)
		next.grab_focus.call_deferred()
		await next.pressed
		UiKit.close_overlay(body)
	GameManager.state.mark_done("intro")
	var results := []
	for eff in GameManager.case_data.get("intro_effects", []):
		results.append(GameManager.state.apply(eff))
	GameManager.save()
	await handle_results(results)
	_busy = false
	_refresh_all()


func _portrait(path: String, size: int) -> TextureRect:
	var t := TextureRect.new()
	t.texture = load(path) if ResourceLoader.exists(path) else null
	t.custom_minimum_size = Vector2(size, size)
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	t.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	t.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	return t


func _accuse() -> void:
	if _busy:
		return
	if not GameManager.rules.can_accuse():
		UiKit.toast(%Overlays, GameManager.case_data.accusation.locked_text)
		return
	GameManager.goto("accusation")
