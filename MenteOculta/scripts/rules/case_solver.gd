class_name CaseSolver
extends RefCounted
## "Jogador automático" usado nos testes: explora tudo o que estiver disponível
## (locais, perguntas, comparações) até não haver mais novidade.
## Serve para provar que, com qualquer combinação de decisões, o caso continua solucionável.


## policy: {"d1": "segredo", ...} — opção escolhida em cada decisão.
static func explore(case_data: Dictionary, policy: Dictionary) -> CaseState:
	var state := CaseState.create(case_data.id)
	var rules := InvestigationRules.new(case_data, state)
	var pending: Array = []
	for eff in case_data.get("intro_effects", []):
		_collect(state.apply(eff), pending)
	_resolve(rules, policy, pending)
	var guard := 0
	var progress := true
	while progress and guard < 100:
		guard += 1
		progress = false
		var before := _snapshot(state)
		for loc in rules.available_locations():
			var r := rules.visit(loc.id)
			for res in r.results:
				_collect(res, pending)
			_resolve(rules, policy, pending)
		for sid in rules.suspects():
			rules.open_dialogue(sid)
			for t in rules.available_topics(sid):
				var r := rules.ask(sid, t.id)
				for res in r.results:
					_collect(res, pending)
				_resolve(rules, policy, pending)
		var items := rules.board_items()
		for i in items.size():
			for j in range(i + 1, items.size()):
				rules.compare(items[i].id, items[j].id)
		progress = _snapshot(state) != before
	return state


static func _collect(res: Dictionary, pending: Array) -> void:
	if res.has("decision"):
		pending.append(res.decision)


static func _resolve(rules: InvestigationRules, policy: Dictionary, pending: Array) -> void:
	while not pending.is_empty():
		var did: String = pending.pop_front()
		var opts: Array = rules.data.decisions[did].options
		var pick: String = policy.get(did, opts[0].id)
		var r := rules.decide(did, pick)
		for res in r.results:
			_collect(res, pending)


static func _snapshot(s: CaseState) -> String:
	return JSON.stringify([s.clues.size(), s.statements.size(), s.contradictions.size(), s.flags.size(), s.choices.size(), s.done_entries.size()])


## Todas as combinações possíveis de decisões do caso.
static func all_policies(case_data: Dictionary) -> Array:
	var policies: Array = [{}]
	for did in case_data.decisions:
		var next := []
		for p in policies:
			for opt in case_data.decisions[did].options:
				var q: Dictionary = p.duplicate()
				q[did] = opt.id
				next.append(q)
		policies = next
	return policies
