extends Node
## Teste de ponta a ponta pela interface real: menu → partida (acertando
## tudo até as 6 medalhas) → resultado; depois uma partida perdendo, com
## "continuar" pelo anúncio premiado simulado; e uma compra na loja.
##
## Sem janela:   godot --headless --path . res://tests/playthrough.tscn
## Com capturas: godot --path . res://tests/playthrough.tscn -- --shots

const MatchScript := preload("res://scripts/ui/match.gd")

var failures: Array[String] = []
var shots := false
var shot_index := 0
var reached_end := false ## um erro de script interrompe _run; isto impede um falso "OK"


func _ready() -> void:
	shots = "--shots" in OS.get_cmdline_user_args()
	_detach.call_deferred()


func _detach() -> void:
	var tree := get_tree()
	var old := tree.current_scene
	get_parent().remove_child(self)
	tree.root.add_child(self)
	tree.current_scene = null
	if old and old != self:
		old.queue_free()
	await _run()
	check(reached_end, "o roteiro não chegou ao fim (veja o erro de script acima)")
	var ok := failures.is_empty()
	print("\nPARTIDA COMPLETA: %s" % ("OK" if ok else "FALHOU"))
	for f in failures:
		printerr("  - ", f)
	if shots:
		print("Capturas em: ", ProjectSettings.globalize_path("user://shots"))
	tree.quit(0 if ok else 1)


func check(cond: bool, msg: String) -> void:
	if not cond:
		failures.append(msg)


func _run() -> void:
	SaveManager.save_path = "user://playthrough_perfil.json"
	Player.reset()
	Monetization.test_mode = true
	MatchScript.fast_mode = not shots
	MatchScript.seed_override = 2026

	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
	await _frames(8)
	await _shot("01_menu")
	var menu := get_tree().current_scene
	check(menu.name == "MainMenu", "menu não abriu")
	menu.find_child("PlayButton", true, false).pressed.emit()
	await _wait_scene("Match")

	# Partida 1: acerta tudo
	var match_scene: Node = get_tree().current_scene
	var guard := 0
	var first_question_shot := false
	while not match_scene.state.is_over() and guard < 80:
		guard += 1
		if match_scene.stage_is_empty():
			match_scene.find_child("SpinButton", true, false).pressed.emit()
			await _until(func(): return not match_scene.stage_is_empty())
		var crown: Node = match_scene.stage.find_child("CrownChoice", true, false)
		if crown:
			if not first_question_shot:
				await _shot("04_coroa")
			var buttons := _buttons(crown)
			buttons[0].pressed.emit()
			await _until(func(): return not match_scene.question.is_empty())
		if not match_scene.question.is_empty() and not match_scene.answered:
			if not first_question_shot:
				first_question_shot = true
				await _shot("02_pergunta")
			match_scene._on_answer(int(match_scene.question.answer))
			await _frames(2)
			if guard == 1:
				await _shot("03_explicacao")
			var cont: Node = match_scene.stage.find_child("ContinueButton", true, false)
			check(cont != null, "botão Continuar não apareceu")
			if cont:
				cont.pressed.emit()
			await _frames(3)
	check(match_scene.state.is_won(), "partida acertando tudo deveria terminar em vitória (medalhas: %d)" % match_scene.state.medals.size())
	await _wait_scene("Result")
	await _frames(4)
	await _shot("05_resultado")
	check(int(Player.data.wins) == 1, "vitória registrada no perfil")
	check(Player.coins() > 100, "moedas ganhas foram somadas")

	# Partida 2: erra tudo, continua pelo anúncio premiado e perde de novo
	get_tree().current_scene.find_child("PlayAgain", true, false).pressed.emit()
	await _wait_scene("Match")
	match_scene = get_tree().current_scene
	guard = 0
	var revived := false
	while guard < 40:
		guard += 1
		if match_scene.finished:
			break
		var revive: Node = match_scene.stage.find_child("ReviveDialog", true, false)
		if revive:
			if not revived:
				revived = true
				await _shot("06_continuar")
				revive.find_child("ReviveAd", true, false).pressed.emit()
				await _frames(3)
				check(match_scene.state.lives == 1, "continuar devolve 1 vida")
			else:
				revive.find_child("EndMatch", true, false).pressed.emit()
				break
			continue
		if match_scene.stage_is_empty():
			match_scene.find_child("SpinButton", true, false).pressed.emit()
			await _until(func(): return not match_scene.stage_is_empty())
		var crown: Node = match_scene.stage.find_child("CrownChoice", true, false)
		if crown:
			_buttons(crown)[0].pressed.emit()
			await _until(func(): return not match_scene.question.is_empty())
		if not match_scene.question.is_empty() and not match_scene.answered:
			var wrong := (int(match_scene.question.answer) + 1) % 4
			match_scene._on_answer(wrong)
			await _frames(2)
			var cont: Node = match_scene.stage.find_child("ContinueButton", true, false)
			if cont:
				cont.pressed.emit()
			await _frames(3)
	check(revived, "a oferta de continuar não apareceu")
	await _wait_scene("Result")
	check(int(Player.data.matches) == 2, "duas partidas registradas")

	# Loja: comprar "Sem anúncios" (simulado)
	Game.goto("shop")
	await _wait_scene("Shop")
	await _frames(4)
	await _shot("07_loja")
	get_tree().current_scene.find_child("Buy_remover_anuncios", true, false).pressed.emit()
	await _frames(3)
	check(Player.ads_removed(), "compra de Sem anúncios não registrada")
	Game.goto("stats")
	await _wait_scene("Stats")
	await _frames(4)
	await _shot("08_estatisticas")
	reached_end = true


func _buttons(root: Node) -> Array[Button]:
	var out: Array[Button] = []
	for n in root.find_children("*", "Button", true, false):
		if not (n as Button).disabled:
			out.append(n)
	return out


func _wait_scene(name: String) -> void:
	for i in 300:
		var s := get_tree().current_scene
		if s and s.name == name and not Game._busy:
			await _frames(2)
			return
		await get_tree().process_frame
	check(false, "tela %s não abriu" % name)


func _until(cond: Callable) -> void:
	for i in 400:
		if cond.call():
			return
		await get_tree().process_frame


func _frames(n: int) -> void:
	for i in n:
		await get_tree().process_frame


func _shot(name: String) -> void:
	if not shots:
		return
	await RenderingServer.frame_post_draw
	DirAccess.make_dir_recursive_absolute("user://shots")
	shot_index += 1
	get_viewport().get_texture().get_image().save_png("user://shots/%s.png" % name)
