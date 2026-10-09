class_name DistributionPuzzle
extends RefCounted
## Desafio de GENEROSIDADE: montar as cestas para que cada casa receba exatamente
## o que precisa, usando todo o estoque doado pela vila.
## As necessidades não aparecem como números: o jogador deduz pela descrição de cada casa.
##
## Formato dos dados:
## {
##   "items":      [{"id": "pao", "name": "Pão", "icon": "bread"}, ...],
##   "stock":      {"pao": 10, ...},
##   "households": [{"id": "rocha", "name": "Família Rocha", "description": "...", "needs": {"pao": 5}}, ...]
## }

var items: Array = []
var stock: Dictionary = {}
var households: Array = []


static func validate(data: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	for key in ["items", "stock", "households"]:
		if not data.has(key):
			errors.append("falta o campo '%s'" % key)
	if not errors.is_empty():
		return errors
	var item_ids := []
	for item in data.items:
		item_ids.append(item.get("id", ""))
	var totals := {}
	for h in data.households:
		if not h.has("needs") or not h.has("description"):
			errors.append("a casa '%s' precisa de 'needs' e 'description'" % h.get("id", "?"))
			continue
		for iid in h.needs:
			if not iid in item_ids:
				errors.append("a casa '%s' pede o item desconhecido '%s'" % [h.get("id", "?"), iid])
			totals[iid] = int(totals.get(iid, 0)) + int(h.needs[iid])
	for iid in item_ids:
		if int(totals.get(iid, 0)) != int(data.stock.get(iid, -1)):
			errors.append("o estoque de '%s' (%s) deve ser igual à soma das necessidades (%d)" % [iid, data.stock.get(iid, "?"), int(totals.get(iid, 0))])
	return errors


static func from_data(data: Dictionary) -> DistributionPuzzle:
	var p := DistributionPuzzle.new()
	p.items = data.items
	p.stock = data.stock
	p.households = data.households
	return p


## baskets: {household_id: {item_id: quantidade}}
func remaining(baskets: Dictionary, item_id: String) -> int:
	var used := 0
	for hid in baskets:
		used += int(baskets[hid].get(item_id, 0))
	return int(stock.get(item_id, 0)) - used


func can_add(baskets: Dictionary, item_id: String) -> bool:
	return remaining(baskets, item_id) > 0


## Casas cuja cesta ainda não corresponde ao que precisam.
func unmet(baskets: Dictionary) -> Array[String]:
	var result: Array[String] = []
	for h in households:
		var basket: Dictionary = baskets.get(h.id, {})
		for item in items:
			if int(basket.get(item.id, 0)) != int(h.needs.get(item.id, 0)):
				result.append(h.id)
				break
	return result


func is_solved(baskets: Dictionary) -> bool:
	return unmet(baskets).is_empty()


func solution() -> Dictionary:
	var result := {}
	for h in households:
		result[h.id] = h.needs.duplicate()
	return result
