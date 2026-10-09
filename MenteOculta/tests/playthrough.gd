extends Node
## Teste de ponta a ponta: resolve o caso inteiro pela interface real
## (menu → introdução → locais → interrogatórios → Quadro → acusação → resultado).
##
## Sem janela:   godot --headless --path . res://tests/playthrough.tscn
## Com capturas: godot --path . res://tests/playthrough.tscn -- --shots
## Final errado: godot --headless --path . res://tests/playthrough.tscn -- --wrong

var failures: Array[String] = []
var shots := false
var wrong := false
var policy := {"d1": "contar", "d2": "pedir", "d3": "guardar"}
var _shot_names := {}


func _ready() -> void:
	var args := OS.get_cmdline_user_args()
	shots = "--shots" in args
	wrong = "--wrong" in args
	if wrong:
		policy = {"d1": "segredo", "d2": "revistar", "d3": "contar"}
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
	print("\nCASO RESOLVIDO PELA INTERFACE: %s" % ("OK" if failures.is_empty() else "FALHOU"))
	for f in failures:
		printerr("  - ", f)
	if shots:
		print("Capturas em: ", ProjectSettings.globalize_path("user://shots"))
	tree.quit(0 if failures.is_empty() else 1)


func check(cond: bool, msg: String) -> void:
	if not cond:
		failures.append(msg)


func _run() -> void:
	SaveManager.save_path = "user://playthrough_save.json"
	SaveManager.delete_save()
	GameManager.load_progress()
	GameManager.set_locale("pt_BR")

	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
	await _frames(10)
	await _shot("01_menu")
	get_tree().current_scene.get_node("%PlayButton").pressed.emit()
	await _wait_scene("Investigation")
	var inv := get_tree().current_scene
	await _frames(6)
	await _shot("02_intro")
	# Introdução, mensagem anônima (documento) e decisão D1.
	await _pump(inv, func(): return GameManager.state.choices.has("d1") and not inv._busy, "intro")
	await _shot("03_local")
	var data: Dictionary = GameManager.case_data
	check(GameManager.state.has_clue("p1"), "a mensagem anônima vira a primeira pista")

	# Rodadas de investigação até não haver mais novidade.
	for round in 4:
		for sid in GameManager.rules.suspects():
			inv.show_tab("suspects")
			await _frames(3)
			if round == 0 and sid == "rafael":
				await _shot("04_suspeitos")
			inv._talk(sid)
			await _frames(4)
			var dlg := _find_dialogue(inv)
			check(dlg != null, "diálogo com %s não abriu" % sid)
			if dlg == null:
				return
			for t in GameManager.rules.available_topics(sid):
				if GameManager.state.is_done(t.id):
					continue
				dlg._ask(t.id, t.question)
				await _pump(inv, func(): return not dlg._busy, "pergunta " + t.id)
				if t.id in ["r_noite", "o_trabalho", "b_mensagem"]:
					await _shot("05_dialogo_" + t.id)
			dlg._close()
			await _frames(3)
		inv.show_tab("place")
		await _frames(3)
		for loc in GameManager.rules.available_locations():
			if not GameManager.rules.is_location_new(loc):
				continue
			inv._visit(loc.id)
			await _frames(4)
			if loc.id in ["balcao", "montagem"]:
				await _shot("06_local_" + loc.id)
			await _pump(inv, func(): return not inv._busy, "local " + loc.id)
		# Quadro: compara todos os pares previstos (como o jogador faria).
		inv.show_tab("board")
		await _frames(3)
		var board = inv.get_node("%EvidenceBoard")
		for x in data.contradictions:
			if GameManager.state.has_contradiction(x.id):
				continue
			if GameManager.state.has_clue(x.a) or GameManager.state.has_statement(x.a):
				if GameManager.state.has_clue(x.b) or GameManager.state.has_statement(x.b):
					board._a = x.a
					board._b = x.b
					board._compare()
					await _frames(4)
					if x.id == "x2":
						await _shot("07_quadro_contradicao")
		# Uma comparação errada também precisa responder com explicação.
		if round == 0 and GameManager.state.has_statement("s_bia_caderno") and GameManager.state.has_statement("s_rafael_bia"):
			board._a = "s_bia_caderno"
			board._b = "s_rafael_bia"
			board._compare()
			await _frames(4)
			check(board.get_node("%ResultText").text.contains("pedir"), "o Quadro explica a comparação errada")

	check(GameManager.state.clues.size() == 6, "pistas: %d de 6" % GameManager.state.clues.size())
	check(GameManager.state.contradictions.size() == 4, "contradições: %d de 4" % GameManager.state.contradictions.size())
	inv.show_tab("clues")
	await _frames(4)
	await _shot("08_pistas")

	# Persistência no meio do caso: recarrega o save e confere.
	var saved: Dictionary = SaveManager.load_data().cases.case_001
	check(saved.clues.size() == 6, "pistas gravadas no save")

	inv._accuse()
	await _wait_scene("Accusation")
	var acc := get_tree().current_scene
	await _shot("09_acusacao")
	acc._suspect = "rafael" if wrong else "otavio"
	acc._step_evidence()
	await _frames(4)
	for e in (["p1", "p2", "p5"] if wrong else ["p3", "p5", "p6"]):
		acc._toggle(e)
	await _frames(2)
	await _shot("10_evidencias")
	acc._confirm()
	await _wait_scene("Ending")
	await _frames(6)
	await _shot("11_resultado")
	var st: CaseState = GameManager.state
	if wrong:
		check(not st.accusation.correct, "acusar Rafael leva ao final errado")
		check(st.score(data) == 800, "pontuação no final errado: esperado 800, veio %d" % st.score(data))
	else:
		check(st.accusation.correct, "acusar Otávio leva ao final certo")
		check(st.score(data) == 1150, "pontuação máxima esperada 1150, veio %d" % st.score(data))
	check(not GameManager.has_progress("case_001"), "caso encerrado não aparece como 'continuar'")
	SaveManager.delete_save()


## Fecha automaticamente janelas de introdução, documentos, locais e decisões.
func _pump(inv: Node, done: Callable, label: String) -> void:
	var guard := 0
	while not done.call():
		guard += 1
		if guard > 3000:
			failures.append("travou em '%s'" % label)
			return
		await _frames(2)
		var overlays: Node = inv.get_node("%Overlays")
		var dlg := _find_dialogue(inv)
		if dlg:
			overlays = dlg.get_node("%Overlays")
		var decision := _find(overlays, DecisionView)
		if decision and decision.has_method("_pick") and not decision.is_queued_for_deletion():
			if not GameManager.state.choices.has(decision.decision_id):
				await _shot("decisao_" + decision.decision_id)
				decision._pick(policy.get(decision.decision_id, ""))
				await _frames(3)
				continue
		for text in [tr("CONTINUE"), tr("CLOSE")]:
			var b := _find_button(overlays, text)
			if b:
				if label == "intro" and text == tr("CLOSE"):
					await _shot("02b_documento")
				b.pressed.emit()
				break


func _find_dialogue(inv: Node) -> Node:
	for c in inv.get_node("%Overlays").get_children():
		if c.has_signal("closed") and not c.is_queued_for_deletion():
			return c
	return null


func _find(root: Node, type) -> Node:
	for c in root.get_children():
		if is_instance_of(c, type):
			return c
	return null


func _find_button(root: Node, text: String) -> Button:
	for n in root.find_children("*", "Button", true, false):
		if n.text == text and n.is_visible_in_tree() and not n.is_queued_for_deletion():
			var p: Node = n
			var dying := false
			while p and p != root:
				if p.is_queued_for_deletion():
					dying = true
				p = p.get_parent()
			if not dying:
				return n
	return null


func _wait_scene(scene_name: String) -> void:
	# Espera por tempo (não por quadros): em máquinas rápidas os quadros passam antes da transição acabar.
	var t0 := Time.get_ticks_msec()
	while Time.get_ticks_msec() - t0 < 10000:
		await get_tree().process_frame
		var cs := get_tree().current_scene
		if cs and cs.name == scene_name:
			while GameManager._busy and Time.get_ticks_msec() - t0 < 10000:
				await get_tree().process_frame
			await _frames(30)
			return
	failures.append("a tela %s não abriu" % scene_name)


func _frames(n: int) -> void:
	for i in n:
		await get_tree().process_frame


func _shot(name: String) -> void:
	if not shots or _shot_names.has(name):
		return
	_shot_names[name] = true
	await RenderingServer.frame_post_draw
	DirAccess.make_dir_recursive_absolute("user://shots")
	get_viewport().get_texture().get_image().save_png("user://shots/%s.png" % name)
