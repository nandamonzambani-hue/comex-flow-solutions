extends Control
## Exploração da vila: o jogador toca nos lugares, caminha até eles e vive os "eventos"
## definidos no JSON do capítulo (diálogos, desafios, perguntas, escolhas, diário).
##
## Toda a história vem de data/chapter_00N.json. Para mudar falas ou a ordem dos
## acontecimentos, edite o JSON; este script não precisa mudar.

const ChallengeScene := preload("res://scenes/challenge.tscn")
const BG_SIZE := Vector2(720, 1280)
const WALK_SPEED := 520.0 ## pixels por segundo

@onready var world: Control = %World
@onready var background: TextureRect = %Background
@onready var points_layer: Control = %Points
@onready var player: TextureRect = %Player
@onready var dialogue: PanelContainer = %DialogueBox
@onready var overlays: Control = %Overlays
@onready var score_label: Label = %Score

var chapter: Dictionary
var cid := ""
var _busy := false
var _markers := {}    ## id do ponto -> Control
var _player_point := ""
var _bob: Tween


func _ready() -> void:
	chapter = GameManager.chapter
	cid = GameManager.chapter_id
	if chapter.is_empty():
		GameManager.goto("map")
		return
	background.texture = load(chapter.background)
	%Place.text = chapter.get("place", "")
	%ChapterTitle.text = chapter.title
	%MapButton.icon = UiKit.icon("map")
	%MapButton.add_theme_color_override("icon_normal_color", GameManager.COLORS.blue_dark)
	%MapButton.pressed.connect(func():
		if not _busy:
			GameManager.goto("map"))
	%DiaryButton.icon = UiKit.icon("book")
	%DiaryButton.pressed.connect(_open_diary)
	var top := GameManager.safe_top_margin(self)
	if top > 0:
		var bar_style: StyleBoxFlat = %TopBar.get_theme_stylebox("panel").duplicate()
		bar_style.content_margin_top += top
		%TopBar.add_theme_stylebox_override("panel", bar_style)
	ProgressManager.score_changed.connect(func(_c, _s): _update_score())
	_update_score()
	_build_markers()
	resized.connect(_layout)
	await get_tree().process_frame
	_layout()
	var done: Array = ProgressManager.chapter(cid).points_done
	_player_point = done[-1] if not done.is_empty() else ""
	player.position = _player_spot(_player_point)
	_start_bob()
	_refresh_markers()
	if not ProgressManager.intro_seen(cid):
		_busy = true
		await _run_events(chapter.intro)
		ProgressManager.mark_intro_seen(cid)
		_busy = false
	_refresh_markers()


# ---------------------------------------------------------------- mapa da vila

## Em celulares a vila cobre a tela toda; em telas mais largas (tablets) ela aparece
## inteira, para nenhum lugar ficar escondido atrás das barras.
func _cover_mode() -> bool:
	return world.size.y / maxf(world.size.x, 1.0) >= BG_SIZE.y / BG_SIZE.x - 0.01


func _bg_rect() -> Rect2:
	var view := world.size
	var s := maxf(view.x / BG_SIZE.x, view.y / BG_SIZE.y) if _cover_mode() else minf(view.x / BG_SIZE.x, view.y / BG_SIZE.y)
	var drawn := BG_SIZE * s
	return Rect2((view - drawn) / 2.0, drawn)


func _to_screen(pos: Array) -> Vector2:
	var r := _bg_rect()
	return r.position + Vector2(pos[0], pos[1]) * r.size


func _player_spot(point_id: String) -> Vector2:
	var p := _to_screen([0.5, 0.93])
	for pt in chapter.points:
		if pt.id == point_id:
			p = _to_screen(pt.pos) + Vector2(56, 10)
	return p - Vector2(player.size.x / 2.0, player.size.y)


func _build_markers() -> void:
	for pt in chapter.points:
		var box := VBoxContainer.new()
		box.alignment = BoxContainer.ALIGNMENT_CENTER
		box.add_theme_constant_override("separation", 4)
		var b := Button.new()
		b.custom_minimum_size = Vector2(96, 96)
		b.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		b.icon = UiKit.icon(pt.icon)
		b.expand_icon = true
		b.add_theme_constant_override("icon_max_width", 52)
		b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		b.tooltip_text = pt.name
		b.pressed.connect(_on_point_pressed.bind(pt))
		box.add_child(b)
		var tag := PanelContainer.new()
		tag.theme_type_variation = "BadgePanel"
		tag.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		tag.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var l := UiKit.label(pt.name, "BadgeLabel", false)
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		tag.add_child(l)
		box.add_child(tag)
		box.set_meta("point", pt)
		box.set_meta("button", b)
		points_layer.add_child(box)
		_markers[pt.id] = box


func _layout() -> void:
	background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED if _cover_mode() else TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	for id in _markers:
		var box: Control = _markers[id]
		box.reset_size()
		var s := box.get_combined_minimum_size()
		box.position = _to_screen(box.get_meta("point").pos) - Vector2(s.x / 2.0, 48)
	if not _busy:
		player.position = _player_spot(_player_point)


func _is_unlocked(pt: Dictionary) -> bool:
	for req in pt.get("requires", []):
		if not ProgressManager.is_point_done(cid, req):
			return false
	return true


func _refresh_markers() -> void:
	for id in _markers:
		var box: Control = _markers[id]
		var pt: Dictionary = box.get_meta("point")
		var b: Button = box.get_meta("button")
		var done := ProgressManager.is_point_done(cid, id)
		var open := _is_unlocked(pt)
		var color: Color = GameManager.COLORS.green if done else (GameManager.COLORS.blue if open else Color("a8987e"))
		for state in ["normal", "hover", "pressed", "focus"]:
			b.add_theme_stylebox_override(state, _circle(color, state == "focus"))
		b.icon = UiKit.icon("check" if done else (pt.icon if open else "lock"))
		box.modulate.a = 1.0 if open else 0.8
		if box.has_meta("pulse"):
			box.get_meta("pulse").kill()
			box.remove_meta("pulse")
		b.scale = Vector2.ONE
		if open and not done and not _busy:
			b.pivot_offset = b.custom_minimum_size / 2.0
			var t := b.create_tween().set_loops()
			t.tween_property(b, "scale", Vector2(1.08, 1.08), 0.6).set_trans(Tween.TRANS_SINE)
			t.tween_property(b, "scale", Vector2.ONE, 0.6).set_trans(Tween.TRANS_SINE)
			box.set_meta("pulse", t)


func _circle(color: Color, focus := false) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = color
	sb.set_corner_radius_all(48)
	sb.border_color = GameManager.COLORS.gold if focus else Color.WHITE
	sb.set_border_width_all(6 if focus else 4)
	sb.shadow_color = Color(0.2, 0.15, 0.1, 0.3)
	sb.shadow_size = 6
	sb.shadow_offset = Vector2(0, 3)
	return sb


func _update_score() -> void:
	score_label.text = tr("SCORE") % ProgressManager.score(cid)


func _start_bob() -> void:
	if _bob:
		_bob.kill()
	player.pivot_offset = Vector2(player.size.x / 2.0, player.size.y)
	_bob = player.create_tween().set_loops()
	_bob.tween_property(player, "scale", Vector2(1.0, 1.03), 0.9).set_trans(Tween.TRANS_SINE)
	_bob.tween_property(player, "scale", Vector2.ONE, 0.9).set_trans(Tween.TRANS_SINE)


# ---------------------------------------------------------------- ações

func _on_point_pressed(pt: Dictionary) -> void:
	if _busy:
		return
	if not _is_unlocked(pt):
		UiKit.toast(overlays, tr("LOCKED_POINT"))
		var b: Button = _markers[pt.id].get_meta("button")
		var t := b.create_tween()
		for dx in [10, -10, 6, 0]:
			t.tween_property(b, "position:x", b.position.x + dx, 0.05)
		return
	_busy = true
	_refresh_markers()
	await _walk_to(pt.id)
	if ProgressManager.is_point_done(cid, pt.id):
		await dialogue.play(pt.get("revisit", [{"speaker": "narrator", "text": "…"}]))
	else:
		var finished := await _run_events(pt.events)
		if finished:
			return
		ProgressManager.mark_point_done(cid, pt.id)
	_busy = false
	_refresh_markers()


func _walk_to(point_id: String) -> void:
	var target := _player_spot(point_id)
	var dist := player.position.distance_to(target)
	player.flip_h = target.x < player.position.x
	var t := create_tween()
	t.tween_property(player, "position", target, clampf(dist / WALK_SPEED, 0.2, 1.4)).set_trans(Tween.TRANS_SINE)
	await t.finished
	_player_point = point_id


## Executa os eventos em ordem. Retorna true se o capítulo terminou.
func _run_events(events: Array) -> bool:
	for ev in events:
		if ProgressManager.is_event_done(cid, ev):
			continue  # pergunta/desafio/escolha já feitos (ex.: o app fechou no meio)
		match ev.type:
			"dialogue":
				await dialogue.play(ev.lines)
			"diary":
				if ProgressManager.unlock_diary(cid, ev.id):
					UiKit.toast(overlays, tr("NEW_DIARY") % GameManager.diary_entry(ev.id).get("title", ""))
			"question":
				var view := QuestionView.ask(overlays, chapter.questions[ev.id], cid)
				await view.done
			"choice":
				var view := ChoiceView.present(overlays, ev.id, chapter.choices[ev.id], cid)
				await view.done
			"challenge":
				var ch := ChallengeScene.instantiate()
				ch.setup(ev.id, chapter.challenges[ev.id], cid)
				overlays.add_child(ch)
				await ch.completed
				ch.queue_free()
			"finish":
				_finish()
				return true
	return false


func _finish() -> void:
	for pt in chapter.points:
		for ev in pt.events:
			if ev.type == "finish":
				ProgressManager.mark_point_done(cid, pt.id)
	ProgressManager.complete_chapter(cid)
	GameManager.goto("ending")


func _open_diary() -> void:
	DiaryView.open(overlays, chapter, ProgressManager.chapter(cid).diary)
