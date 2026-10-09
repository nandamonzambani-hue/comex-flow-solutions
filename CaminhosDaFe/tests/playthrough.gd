extends Node
## Teste de ponta a ponta: joga o capítulo 1 inteiro pela interface real
## (menu → mapa → vila → desafios → perguntas → escolhas → final).
##
## Sem janela:   godot --headless --path . res://tests/playthrough.tscn
## Com capturas: godot --path . res://tests/playthrough.tscn -- --shots
##   (as imagens vão para user://shots/; o caminho aparece no fim)

var failures: Array[String] = []
var shots := false
var shot_index := 0


func _ready() -> void:
	shots = "--shots" in OS.get_cmdline_user_args()
	_detach.call_deferred()


func _detach() -> void:
	# Sai da cena atual para continuar vivo enquanto as telas do jogo trocam.
	var tree := get_tree()
	var old := tree.current_scene
	get_parent().remove_child(self)
	tree.root.add_child(self)
	tree.current_scene = null
	if old and old != self:
		old.queue_free()
	await _run()
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
	SaveManager.save_path = "user://playthrough_save.json"
	SaveManager.delete_save()
	ProgressManager.load_progress()
	GameManager.set_locale("pt_BR")

	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
	await _frames(10)
	await _shot("01_menu")
	var menu := get_tree().current_scene
	check(menu.name == "MainMenu", "menu inicial não abriu")
	menu.get_node("%PlayButton").pressed.emit()
	await _wait_scene("WorldMap")
	await _frames(6)
	await _shot("02_mapa")

	var map := get_tree().current_scene
	var entry: Dictionary = ContentLoader.chapter_index()[0]
	map._open_card(entry)
	await _frames(4)
	await _shot("03_cartao_capitulo")
	var start := _find_button(map, tr("START_CHAPTER"))
	check(start != null, "botão Começar não encontrado")
	if start == null:
		return
	start.pressed.emit()
	await _wait_scene("Exploration")
	await _frames(8)
	var expl := get_tree().current_scene
	await _shot("04_intro")
	await _pump(expl, func(): return not expl._busy, "intro")
	await _shot("05_vila")

	var chapter: Dictionary = GameManager.chapter
	var locked_before: bool = not expl._is_unlocked(chapter.points[1])
	check(locked_before, "a padaria deveria começar bloqueada")
	for pt in chapter.points:
		if not is_instance_valid(expl) or get_tree().current_scene != expl:
			break
		check(expl._is_unlocked(pt), "ponto %s deveria estar liberado nesta ordem" % pt.id)
		expl._on_point_pressed(pt)
		await _pump(expl, func():
			return get_tree().current_scene != expl or (not expl._busy and ProgressManager.is_point_done(GameManager.chapter_id, pt.id)), pt.id)

	await _wait_scene("Ending")
	await _frames(10)
	await _shot("20_final")
	var cid := GameManager.chapter_id
	check(ProgressManager.is_completed(cid), "capítulo não foi marcado como concluído")
	# 4 perguntas de primeira (400) + 1 na segunda tentativa (50) + 3 desafios (1 com dica: 150 + 2×200)
	check(ProgressManager.score(cid) == 1000, "pontuação final esperada 1000, veio %d" % ProgressManager.score(cid))
	check(ProgressManager.chapter(cid).diary.size() == chapter.diary.size(), "todos os registros do diário deveriam estar liberados")
	var ending := get_tree().current_scene
	DiaryView.open(ending, chapter, ProgressManager.chapter(cid).diary)
	await _frames(6)
	await _shot("21_diario")

	# O progresso sobrevive a um "reinício do app".
	ProgressManager.load_progress()
	check(ProgressManager.is_completed(cid), "conclusão não persistiu no save")
	SaveManager.delete_save()


## Responde automaticamente ao que estiver aberto (diálogo, pergunta, escolha, desafio)
## até a condição ser verdadeira.
func _pump(expl: Node, done: Callable, label: String) -> void:
	var guard := 0
	var shot_taken := {}
	while not done.call():
		guard += 1
		if guard > 4000:
			failures.append("travou em '%s'" % label)
			return
		await _frames(2)
		if not is_instance_valid(expl) or get_tree().current_scene != expl:
			return
		var dlg = expl.dialogue
		if dlg.visible:
			if not shot_taken.has("dlg") and label in ["capela", "salinha"]:
				shot_taken["dlg"] = true
				dlg.advance()
				await _frames(3)
				await _shot("06_dialogo_" + label)
			dlg.advance()
			continue
		for child in expl.overlays.get_children():
			if child is QuestionView:
				await _answer(child, label)
			elif child is ChoiceView:
				await _choose(child, label)
			elif child.has_signal("completed"):
				await _solve(child, label)


func _answer(view: QuestionView, label: String) -> void:
	var right := int(view.question.answer)
	await _frames(3)
	if view.question.id == "q_virtudes":
		# Erra de propósito na primeira tentativa para testar a segunda chance.
		view._on_pick((right + 1) % view.question.options.size())
		await _frames(2)
	view._on_pick(right)
	await _frames(4)
	if view.question.id in ["q_virtudes", "q_vicente"]:
		await _shot("07_pergunta_" + view.question.id)
	var next := _find_button(view, tr("CONTINUE"))
	check(next != null, "sem botão Continuar na pergunta " + view.question.id)
	if next:
		next.pressed.emit()
	await _frames(2)


func _choose(view: ChoiceView, label: String) -> void:
	await _frames(3)
	if view.choice_id == "macas":
		await _shot("08_escolha")
	view._on_pick(view.choice.options[0])
	await _frames(3)
	var next := _find_button(view, tr("CONTINUE"))
	if next:
		next.pressed.emit()
	await _frames(2)


func _solve(ch: Node, label: String) -> void:
	await _frames(4)
	await _shot("10_desafio_%s_inicio" % ch.challenge_id)
	match ch.def.type:
		"assignment":
			ch._on_hint()  # usa uma dica para testar a pontuação com dica
			ch._choices = {"ana": "telhado", "davi": "agua", "rita": "carregar", "caio": "escada"}
		"distribution":
			ch._baskets = ch._distribution.solution()
			ch._refresh_distribution()
		"pipes":
			var target := PipesPuzzle._parse_rotations(ch.def.data.solution)
			for r in ch._pipes.rows:
				for c in ch._pipes.cols:
					while ch._pipes.rotations[r][c] != target[r][c] and not ch._done:
						ch._board.tap(r, c)
	if not ch._done:
		ch._on_check()
	check(ch._done, "desafio %s não foi concluído" % ch.challenge_id)
	await _frames(6)
	await _shot("11_desafio_%s_fim" % ch.challenge_id)
	ch.check_button.pressed.emit()
	await _frames(2)


func _wait_scene(scene_name: String) -> void:
	for i in 300:
		await get_tree().process_frame
		var cs := get_tree().current_scene
		if cs and cs.name == scene_name:
			await _frames(30)  # espera a transição terminar
			return
	failures.append("a tela %s não abriu" % scene_name)


func _frames(n: int) -> void:
	for i in n:
		await get_tree().process_frame


func _find_button(root: Node, text: String) -> Button:
	for n in root.find_children("*", "Button", true, false):
		if n.text == text and n.is_visible_in_tree():
			return n
	return null


func _shot(name: String) -> void:
	if not shots:
		return
	await RenderingServer.frame_post_draw
	DirAccess.make_dir_recursive_absolute("user://shots")
	var img := get_viewport().get_texture().get_image()
	shot_index += 1
	img.save_png("user://shots/%s.png" % name)
