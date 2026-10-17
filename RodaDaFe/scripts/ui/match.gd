extends Control
## A partida: roda → pergunta → explicação → (coroa) → ... até 6 medalhas ou 0 vidas.

const REVIVE_COINS := 150

## Os testes ligam isto: a roda para na hora e não há contagem de tempo.
static var fast_mode := false
## Os testes podem fixar a semente do sorteio.
static var seed_override := 0

var state: MatchState
var rng := RandomNumberGenerator.new()

var lives_box: HBoxContainer
var medals_box: HBoxContainer
var streak_label: Label
var wheel: Wheel
var spin_button: Button
var stage: Control ## onde entram a pergunta / escolha da coroa / explicação

var question: Dictionary = {}
var question_category := ""
var is_crown_question := false
var order: Array[int] = [] ## ordem embaralhada das alternativas na tela
var option_buttons: Array[Button] = []
var time_left := 0.0
var time_bar: ProgressBar
var answered := false
var hint_buttons := {}
var paused := false
var finished := false ## depois de _finish nada mais responde a toques


func _ready() -> void:
	state = MatchState.new(Content.category_ids(), seed_override)
	rng.seed = state.rng.seed + 7
	Game.background(self)
	_build()
	_refresh_status()


func _build() -> void:
	var v := UiKit.page(self, 18)
	var top := TopBar.make()
	var quit := UiKit.button("Sair", "GhostButton")
	quit.custom_minimum_size = Vector2(130, 72)
	quit.pressed.connect(_confirm_quit)
	top.add_child(quit)
	top.move_child(quit, 0)
	v.add_child(top)

	var status := HBoxContainer.new()
	status.add_theme_constant_override("separation", 10)
	v.add_child(status)
	lives_box = HBoxContainer.new()
	lives_box.add_theme_constant_override("separation", 6)
	status.add_child(lives_box)
	var fill := Control.new()
	fill.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	status.add_child(fill)
	streak_label = UiKit.label("", "LightMuted", false)
	streak_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	status.add_child(streak_label)

	medals_box = HBoxContainer.new()
	medals_box.alignment = BoxContainer.ALIGNMENT_CENTER
	medals_box.add_theme_constant_override("separation", 12)
	v.add_child(medals_box)

	var center := CenterContainer.new()
	v.add_child(center)
	wheel = Wheel.new()
	center.add_child(wheel)
	wheel.set_segments(state.wheel_segments())

	spin_button = UiKit.button("Girar a roda", "PrimaryButton")
	spin_button.name = "SpinButton"
	spin_button.custom_minimum_size.y = 104
	spin_button.add_theme_font_size_override("font_size", 34)
	spin_button.pressed.connect(_on_spin)
	v.add_child(spin_button)

	stage = Control.new()
	stage.set_anchors_preset(Control.PRESET_FULL_RECT)
	stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(stage)


func _refresh_status() -> void:
	for c in lives_box.get_children():
		c.queue_free()
	for i in QuizRules.LIVES:
		lives_box.add_child(CategoryIcon.make("heart", Game.COLORS.wrong if i < state.lives else Color(1, 1, 1, 0.18), 40))
	for c in medals_box.get_children():
		c.queue_free()
	for id in state.categories:
		var won := state.medals.has(id)
		var holder := PanelContainer.new()
		var box := StyleBoxFlat.new()
		box.bg_color = Content.color(id) if won else Color(1, 1, 1, 0.08)
		box.set_corner_radius_all(40)
		box.set_content_margin_all(12)
		box.border_color = Game.COLORS.gold if won else Color(1, 1, 1, 0.2)
		box.set_border_width_all(3)
		holder.add_theme_stylebox_override("panel", box)
		holder.add_child(CategoryIcon.make(str(Content.category(id).symbol), Color.WHITE if won else Color(1, 1, 1, 0.35), 44))
		holder.tooltip_text = Content.category(id).name
		medals_box.add_child(holder)
	streak_label.text = "Sequência: %d/%d" % [state.streak, QuizRules.STREAK_FOR_CROWN]


# ---------- roda ----------

func _on_spin() -> void:
	if finished or wheel.spinning or not stage_is_empty():
		return
	spin_button.disabled = true
	var segment := state.spin()
	await wheel.spin_to(segment, fast_mode)
	spin_button.disabled = false
	if segment == QuizRules.CROWN_SEGMENT:
		state.grant_crown()
		_show_crown_choice()
	else:
		_show_question(segment, false)


func stage_is_empty() -> bool:
	return stage.get_child_count() == 0


func _clear_stage() -> void:
	for c in stage.get_children():
		c.queue_free()
	if is_inside_tree():
		await get_tree().process_frame


# ---------- pergunta ----------

func _show_question(category: String, crown: bool) -> void:
	await _clear_stage()
	question = Content.pick(category, Player.owned_packs(), _exclude(), rng, crown)
	if question.is_empty():
		return
	state.asked_ids[question.id] = true
	question_category = category
	is_crown_question = crown
	answered = false
	time_left = QuizRules.SECONDS_PER_QUESTION
	order = [0, 1, 2, 3]
	for i in range(order.size() - 1, 0, -1):
		var j := rng.randi_range(0, i)
		var tmp := order[i]
		order[i] = order[j]
		order[j] = tmp

	var dim := ColorRect.new()
	dim.color = Color(Game.COLORS.night, 0.96)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	stage.add_child(dim)
	var v := UiKit.page(dim, 18)
	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	v.add_child(head)
	head.add_child(CategoryIcon.make(str(Content.category(category).symbol), Content.color(category).lightened(0.25), 48))
	head.add_child(UiKit.badge(("Coroa · " if crown else "") + str(Content.category(category).name), Content.color(category)))

	time_bar = ProgressBar.new()
	time_bar.max_value = QuizRules.SECONDS_PER_QUESTION
	time_bar.value = time_left
	time_bar.show_percentage = false
	time_bar.custom_minimum_size.y = 14
	v.add_child(time_bar)

	var card := UiKit.card(v, 18)
	var q_label := UiKit.label(str(question.question), "QuestionLabel")
	q_label.name = "QuestionText"
	card.add_child(q_label)

	option_buttons.clear()
	for pos in order.size():
		var b := UiKit.button(str(question.options[order[pos]]), "CardButton")
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		var original := order[pos]
		b.pressed.connect(func(): _on_answer(original))
		card.add_child(b)
		option_buttons.append(b)

	var hints := HBoxContainer.new()
	hints.add_theme_constant_override("separation", 12)
	v.add_child(hints)
	hint_buttons.clear()
	for key in ["eliminar_duas", "mais_tempo"]:
		var label: String = "Eliminar 2  (%d moedas)" if key == "eliminar_duas" else "+10 s  (%d moedas)"
		var hb := UiKit.button(label % QuizRules.HINT_COSTS[key], "GhostButton")
		hb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hb.add_theme_font_size_override("font_size", 22)
		var k: String = key
		hb.pressed.connect(func(): _use_hint(k))
		hints.add_child(hb)
		hint_buttons[key] = hb
	_update_hint_buttons()


func _exclude() -> Dictionary:
	var ex := state.asked_ids.duplicate()
	for id in Player.data.seen_questions:
		ex[id] = true
	return ex


func _process(delta: float) -> void:
	if fast_mode or paused or answered or question.is_empty() or not is_instance_valid(time_bar):
		return
	time_left -= delta
	time_bar.value = time_left
	if time_left <= 0.0:
		_on_answer(-1)


func _use_hint(key: String) -> void:
	if answered or not Player.spend_coins(QuizRules.HINT_COSTS[key]):
		return
	if key == "eliminar_duas":
		for idx in QuizRules.options_to_eliminate(4, int(question.answer), rng):
			option_buttons[order.find(idx)].disabled = true
		hint_buttons[key].disabled = true
	else:
		time_left += QuizRules.EXTRA_TIME_SECONDS
		time_bar.max_value = maxf(time_bar.max_value, time_left)
	_update_hint_buttons()


func _update_hint_buttons() -> void:
	for key in hint_buttons:
		if hint_buttons[key].disabled and key == "eliminar_duas":
			continue
		hint_buttons[key].disabled = Player.coins() < QuizRules.HINT_COSTS[key]


## Responde com a alternativa de índice ORIGINAL (do JSON). -1 = tempo esgotado.
func _on_answer(original_index: int) -> void:
	if answered or finished:
		return
	answered = true
	var correct_index := int(question.answer)
	var is_correct := original_index == correct_index
	var used := QuizRules.SECONDS_PER_QUESTION - time_left
	var result := state.answer_crown(question_category, is_correct, used) if is_crown_question else state.answer(question_category, is_correct, used)
	for pos in option_buttons.size():
		var b := option_buttons[pos]
		b.disabled = true
		if order[pos] == correct_index:
			_tint(b, Game.COLORS.right)
		elif order[pos] == original_index:
			_tint(b, Game.COLORS.wrong)
	for hb in hint_buttons.values():
		hb.disabled = true
	if not is_correct and Player.setting("vibration"):
		Input.vibrate_handheld(120)
	_show_feedback(is_correct, original_index == -1, result)
	_refresh_status()


func _tint(b: Button, color: Color) -> void:
	var box := StyleBoxFlat.new()
	box.bg_color = color
	box.set_corner_radius_all(22)
	box.content_margin_left = 24
	box.content_margin_right = 24
	box.content_margin_top = 18
	box.content_margin_bottom = 18
	for s in ["disabled", "normal"]:
		b.add_theme_stylebox_override(s, box)
	b.add_theme_color_override("font_disabled_color", Color.WHITE)


func _show_feedback(is_correct: bool, timed_out: bool, result: Dictionary) -> void:
	var v: VBoxContainer = stage.get_child(0).get_child(0).get_child(0).get_child(0)
	var card := UiKit.card(v, 10)
	var title := "Certo!" if is_correct else ("O tempo acabou" if timed_out else "Não foi dessa vez")
	if result.get("medal", false):
		title = "Medalha de %s!" % Content.category(question_category).name
	var t := UiKit.label(title, "TitleLabel")
	t.add_theme_color_override("font_color", Game.COLORS.right if is_correct else Game.COLORS.wrong)
	card.add_child(t)
	if int(result.get("coins", 0)) > 0:
		card.add_child(UiKit.label("+%d moedas" % result.coins, "MutedLabel"))
	card.add_child(UiKit.label(str(question.explanation)))
	card.add_child(UiKit.label("Fonte: " + str(question.source), "MutedLabel"))
	var next := UiKit.button("Continuar", "PrimaryButton")
	next.name = "ContinueButton"
	next.pressed.connect(_after_feedback)
	v.add_child(next)
	await get_tree().process_frame
	var scroll: ScrollContainer = stage.get_child(0).get_child(0)
	scroll.ensure_control_visible(next)


func _after_feedback() -> void:
	if finished:
		return
	question = {}
	await _clear_stage()
	if state.is_won():
		_finish()
	elif state.is_lost():
		_offer_revive()
	elif state.crown_pending:
		_show_crown_choice()


# ---------- coroa ----------

func _show_crown_choice() -> void:
	await _clear_stage()
	var v := UiKit.overlay(stage, 640)
	v.get_meta("overlay").name = "CrownChoice"
	var head := HBoxContainer.new()
	head.add_child(CategoryIcon.make("crown", Game.COLORS.gold_dark, 56))
	head.add_child(UiKit.label("Coroa! Escolha a medalha", "TitleLabel"))
	v.add_child(head)
	v.add_child(UiKit.label("Acerte uma pergunta mais difícil da categoria escolhida para ganhar a medalha.", "MutedLabel"))
	for id in state.crown_choices():
		var b := UiKit.button(str(Content.category(id).name), "CardButton")
		b.icon = null
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		var cat: String = id
		b.pressed.connect(func(): _show_question(cat, true))
		v.add_child(b)


# ---------- fim de jogo ----------

func _offer_revive() -> void:
	if state.continue_used:
		_finish()
		return
	await _clear_stage()
	var v := UiKit.overlay(stage, 640)
	v.get_meta("overlay").name = "ReviveDialog"
	v.add_child(UiKit.label("Suas vidas acabaram", "TitleLabel"))
	v.add_child(UiKit.label("Você tem %d medalha(s). Quer continuar com mais uma vida? (Só uma vez por partida.)" % state.medals.size(), "MutedLabel"))
	var ad := UiKit.button("Assistir a um anúncio e continuar", "PrimaryButton")
	ad.name = "ReviveAd"
	ad.pressed.connect(func(): Monetization.show_rewarded("continuar"))
	v.add_child(ad)
	var coins := UiKit.button("Usar %d moedas" % REVIVE_COINS, "CardButton")
	coins.disabled = Player.coins() < REVIVE_COINS
	coins.pressed.connect(func():
		if Player.spend_coins(REVIVE_COINS):
			_revive())
	v.add_child(coins)
	var end := UiKit.button("Encerrar partida", "CardButton")
	end.name = "EndMatch"
	end.pressed.connect(_finish)
	v.add_child(end)
	if not Monetization.rewarded_finished.is_connected(_on_rewarded):
		Monetization.rewarded_finished.connect(_on_rewarded)


func _on_rewarded(placement: String, rewarded: bool) -> void:
	if placement == "continuar" and rewarded:
		_revive()


func _revive() -> void:
	if state.revive():
		await _clear_stage()
		_refresh_status()


func _finish() -> void:
	if finished:
		return
	finished = true
	spin_button.disabled = true
	await _clear_stage()
	set_process(false)
	Player.record_match(state)
	Player.remember_questions(state.asked_ids.keys())
	Game.last_match = state
	# Anúncio entre partidas: só aqui, depois que tudo terminou (nunca durante pergunta).
	await Monetization.show_interstitial_if_due()
	Game.goto("result")


func _confirm_quit() -> void:
	# Fica por cima de tudo, sem apagar a pergunta que estiver aberta; o tempo para.
	paused = true
	var v := UiKit.overlay(self, 600)
	var root: Control = v.get_meta("overlay")
	v.add_child(UiKit.label("Sair da partida?", "TitleLabel"))
	v.add_child(UiKit.label("O progresso desta partida será perdido.", "MutedLabel"))
	var yes := UiKit.button("Sair", "PrimaryButton")
	yes.pressed.connect(func(): Game.goto("menu"))
	v.add_child(yes)
	var no := UiKit.button("Continuar jogando", "CardButton")
	no.pressed.connect(func():
		paused = false
		root.queue_free())
	v.add_child(no)
