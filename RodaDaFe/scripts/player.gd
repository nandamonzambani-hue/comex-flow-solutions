extends Node
## Perfil do jogador: moedas, compras, estatísticas e configurações.
## Fica só no aparelho (SaveManager); nada vai para a internet.

signal coins_changed(total: int)
signal purchases_changed

const DEFAULTS := {
	"coins": 100,
	"owned": [], ## ids de produtos não consumíveis comprados
	"matches": 0,
	"wins": 0,
	"best_streak": 0,
	"medals_total": 0,
	"answered": 0,
	"correct": 0,
	"per_category": {},
	"seen_questions": [],
	"matches_since_ad": 0,
	"rewarded_day": "",
	"rewarded_today": 0,
	"settings": {"sound": true, "vibration": true},
}

var data: Dictionary = {}


func _ready() -> void:
	load_profile()


func load_profile() -> void:
	data = DEFAULTS.duplicate(true)
	var saved := SaveManager.load_data()
	for key in saved:
		if data.has(key):
			data[key] = saved[key]


func save() -> void:
	SaveManager.save_data(data)


func reset() -> void:
	SaveManager.delete_save()
	load_profile()
	coins_changed.emit(coins())
	purchases_changed.emit()


# ---------- moedas ----------

func coins() -> int:
	return int(data.coins)


func add_coins(amount: int) -> void:
	data.coins = coins() + amount
	save()
	coins_changed.emit(coins())


func spend_coins(amount: int) -> bool:
	if coins() < amount:
		return false
	data.coins = coins() - amount
	save()
	coins_changed.emit(coins())
	return true


# ---------- compras ----------

func owns(product_id: String) -> bool:
	return data.owned.has(product_id)


func grant_product(product: Dictionary) -> void:
	if product.get("type", "") == "consumable":
		add_coins(int(product.get("coins", 0)))
		return
	if not owns(product.id):
		data.owned.append(product.id)
		save()
		purchases_changed.emit()


func ads_removed() -> bool:
	return owns("remover_anuncios")


func owned_packs() -> Array:
	var packs := []
	for p in Content.shop.get("products", []):
		if p.has("unlocks_pack") and owns(p.id):
			packs.append(p.unlocks_pack)
	return packs


# ---------- anúncio premiado (moedas grátis) ----------

func rewarded_left_today() -> int:
	var today := Time.get_date_string_from_system()
	if data.rewarded_day != today:
		return int(Content.shop.get("rewarded", {}).get("max_per_day", 3))
	return maxi(0, int(Content.shop.get("rewarded", {}).get("max_per_day", 3)) - int(data.rewarded_today))


func register_rewarded_coins() -> int:
	var today := Time.get_date_string_from_system()
	if data.rewarded_day != today:
		data.rewarded_day = today
		data.rewarded_today = 0
	data.rewarded_today = int(data.rewarded_today) + 1
	var amount := int(Content.shop.get("rewarded", {}).get("coins", 50))
	add_coins(amount)
	return amount


# ---------- estatísticas ----------

func record_match(match: MatchState) -> void:
	data.matches = int(data.matches) + 1
	if match.is_won():
		data.wins = int(data.wins) + 1
	data.best_streak = maxi(int(data.best_streak), match.best_streak)
	data.medals_total = int(data.medals_total) + match.medals.size()
	data.answered = int(data.answered) + match.answered
	data.correct = int(data.correct) + match.correct
	for cat in match.per_category:
		var entry: Dictionary = data.per_category.get(cat, {"answered": 0, "correct": 0})
		entry.answered = int(entry.answered) + int(match.per_category[cat].answered)
		entry.correct = int(entry.correct) + int(match.per_category[cat].correct)
		data.per_category[cat] = entry
	data.matches_since_ad = int(data.matches_since_ad) + 1
	data.coins = coins() + match.coins_earned
	save()
	coins_changed.emit(coins())


func remember_questions(ids: Array) -> void:
	# Guarda as últimas perguntas vistas para não repetir logo na partida seguinte.
	var seen: Array = data.seen_questions
	for id in ids:
		if not seen.has(id):
			seen.append(id)
	while seen.size() > 120:
		seen.pop_front()
	data.seen_questions = seen
	save()


func setting(key: String) -> Variant:
	return data.settings.get(key, DEFAULTS.settings.get(key))


func set_setting(key: String, value: Variant) -> void:
	data.settings[key] = value
	save()
