class_name Conditions
extends RefCounted
## Avalia as condições escritas nos arquivos de caso.
##
## Formatos aceitos (um por objeto):
##   {"clue": "p3"}                 tem a pista
##   {"statement": "s_x"}           ouviu o depoimento
##   {"flag": "talked_bia"}         marcador ligado
##   {"contradiction": "x2"}        contradição encontrada
##   {"choice": ["d1", "segredo"]}  decisão tomada com essa opção
##   {"min_clues": 4}               pelo menos N pistas
##   {"min_contradictions": 2}      pelo menos N contradições
##   {"all": [ ... ]}  {"any": [ ... ]}  {"not": { ... }}  {"always": true}
## Uma condição ausente (null) é sempre verdadeira.

const KEYS := ["clue", "statement", "flag", "contradiction", "choice", "min_clues", "min_contradictions", "all", "any", "not", "always"]


static func check(cond, state: CaseState) -> bool:
	if cond == null:
		return true
	if typeof(cond) != TYPE_DICTIONARY or cond.size() != 1:
		push_error("Condição inválida: %s" % str(cond))
		return false
	var key: String = cond.keys()[0]
	var v = cond[key]
	match key:
		"clue":
			return state.has_clue(v)
		"statement":
			return state.has_statement(v)
		"flag":
			return state.has_flag(v)
		"contradiction":
			return state.has_contradiction(v)
		"choice":
			return state.choice(v[0]) == v[1]
		"min_clues":
			return state.clues.size() >= int(v)
		"min_contradictions":
			return state.contradictions.size() >= int(v)
		"all":
			for c in v:
				if not check(c, state):
					return false
			return true
		"any":
			for c in v:
				if check(c, state):
					return true
			return false
		"not":
			return not check(v, state)
		"always":
			return bool(v)
	return false


## Confere a estrutura e se os ids citados existem. ids: {"clue": [...], "statement": [...], ...}
static func validate(cond, ids: Dictionary, where: String) -> Array[String]:
	var errors: Array[String] = []
	if cond == null:
		return errors
	if typeof(cond) != TYPE_DICTIONARY or cond.size() != 1:
		return ["%s: condição deve ser um objeto com uma única chave" % where]
	var key: String = cond.keys()[0]
	var v = cond[key]
	if not key in KEYS:
		return ["%s: tipo de condição desconhecido '%s' (use um de %s)" % [where, key, KEYS]]
	match key:
		"clue", "statement", "contradiction":
			if not v in ids.get(key, []):
				errors.append("%s: %s desconhecido '%s'" % [where, key, v])
		"choice":
			if typeof(v) != TYPE_ARRAY or v.size() != 2:
				errors.append("%s: 'choice' deve ser [decisão, opção]" % where)
			elif not "%s:%s" % [v[0], v[1]] in ids.get("choice", []):
				errors.append("%s: opção de decisão desconhecida %s" % [where, str(v)])
		"all", "any":
			if typeof(v) != TYPE_ARRAY:
				errors.append("%s: '%s' deve ser uma lista" % [where, key])
			else:
				for i in v.size():
					errors.append_array(validate(v[i], ids, "%s.%s[%d]" % [where, key, i]))
		"not":
			errors.append_array(validate(v, ids, where + ".not"))
	return errors
