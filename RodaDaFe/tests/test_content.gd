extends RefCounted
## Conteúdo: o banco de perguntas passa no validador e o sorteio funciona.

var runner


func test_conteudo_sem_erros() -> void:
	Content.reload()
	for e in Content.errors:
		runner.check(false, e)
	runner.check_eq(Content.categories.size(), 6, "6 categorias")


func test_pacote_so_aparece_comprado() -> void:
	var free := Content.pool("santos", [])
	var with_pack := Content.pool("santos", ["santos_brasil"])
	runner.check(with_pack.size() > free.size(), "pacote acrescenta perguntas")
	for q in free:
		runner.check(q.pack == "", "pergunta paga vazou para quem não comprou: " + str(q.id))


func test_sorteio_evita_repetidas_e_coroa_prefere_dificeis() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var exclude := {}
	for i in 15:
		var q := Content.pick("biblia", [], exclude, rng)
		runner.check(not exclude.has(q.id), "não repete na mesma partida")
		exclude[q.id] = true
	for i in 10:
		var hard := Content.pick("doutrina", [], {}, rng, true)
		runner.check(int(hard.difficulty) >= 2, "pergunta da coroa é difícil")


func test_validador_pega_erros() -> void:
	var cats := [{"id": "x", "name": "X", "short": "X", "color": "fff", "symbol": "book"}]
	var bad := [{"id": "1", "category": "x", "difficulty": 1, "question": "?", "options": ["a", "a", "b"], "answer": 5, "explanation": "", "source": ""}]
	var errs := ContentValidator.validate(cats, bad)
	runner.check(errs.size() >= 4, "validador encontra alternativas, resposta, fonte e explicação (achou %d)" % errs.size())
