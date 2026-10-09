extends Control
## Interrogatório: o jogador escolhe perguntas; novas perguntas aparecem conforme
## as condições do caso (pistas encontradas, contradições, decisões).
## Emite closed quando a conversa termina.

signal closed

var character_id := ""
var _busy := false


func setup(id: String) -> void:
	character_id = id


func _ready() -> void:
	var who := GameManager.character(character_id)
	%Name.text = who.name
	%Role.text = who.get("role", "")
	%Portrait.texture = load(who.portrait)
	%EndButton.pressed.connect(_close)
	Fx.pop_in(%Portrait, 0.05, 0.5)
	Fx.breathe(%Portrait, 0.015, 4.0)
	var top := GameManager.safe_top_margin(self)
	if top > 0:
		%Margin.add_theme_constant_override("margin_top", 24 + top)
	GameManager.rules.open_dialogue(character_id)
	GameManager.save()
	_add_line(GameManager.rules.greeting(character_id), "narrator")
	_refresh_topics()


func _refresh_topics() -> void:
	for c in %Topics.get_children():
		c.queue_free()
	for t in GameManager.rules.available_topics(character_id):
		var asked := GameManager.state.is_done(t.id)
		var b := UiKit.button(("✓  " if asked else "") + t.question, "SecondaryButton" if asked else "OptionCard")
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		if asked:
			b.add_theme_color_override("font_color", GameManager.C.muted)
		b.pressed.connect(_ask.bind(t.id, t.question))
		%Topics.add_child(b)


func _ask(topic_id: String, question: String) -> void:
	if _busy:
		return
	_busy = true
	_add_line(question, "you")
	var r := GameManager.rules.ask(character_id, topic_id)
	GameManager.save()
	for line in r.lines:
		await get_tree().create_timer(0.15).timeout
		_add_line(line.text, line.speaker)
	await _handle_results(r.results)
	_refresh_topics()
	_busy = false


func _handle_results(results: Array) -> void:
	for res in results:
		if res.has("new_clue"):
			UiKit.toast(%Overlays, tr("NEW_CLUE") % GameManager.clue(res.new_clue).title)
		elif res.has("new_statement"):
			UiKit.toast(%Overlays, tr("NEW_STATEMENT"))
		elif res.has("decision"):
			var v := DecisionView.present(%Overlays, res.decision)
			var more: Array = await v.done
			await _handle_results(more)


func _add_line(text: String, speaker: String) -> void:
	var bubble := PanelContainer.new()
	var sb := StyleBoxFlat.new()
	sb.set_corner_radius_all(16)
	sb.content_margin_left = 18
	sb.content_margin_right = 18
	sb.content_margin_top = 12
	sb.content_margin_bottom = 12
	var l := UiKit.label(text, "")
	match speaker:
		"you":
			sb.bg_color = GameManager.C.wine
			bubble.size_flags_horizontal = Control.SIZE_SHRINK_END
			l.custom_minimum_size.x = 0
		"narrator":
			sb.bg_color = Color(0, 0, 0, 0)
			l.theme_type_variation = "MutedLabel"
		_:
			sb.bg_color = GameManager.C.navy3
	bubble.add_theme_stylebox_override("panel", sb)
	if speaker == "you":
		# Pergunta à direita, com largura limitada para quebrar linha.
		l.custom_minimum_size.x = minf(480.0, get_viewport_rect().size.x - 140.0)
	bubble.add_child(l)
	%Log.add_child(bubble)
	bubble.modulate.a = 0.0
	bubble.create_tween().tween_property(bubble, "modulate:a", 1.0, 0.2)
	await get_tree().process_frame
	await get_tree().process_frame
	%LogScroll.scroll_vertical = int(%LogScroll.get_v_scroll_bar().max_value)


func _close() -> void:
	if _busy:
		return
	closed.emit()
	queue_free()
