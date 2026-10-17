extends RefCounted
## Loja e anúncios no modo simulado (sem loja real).

var runner


func before_each() -> void:
	SaveManager.save_path = "user://test_perfil.json"
	Player.reset()
	Monetization.test_mode = true


func test_comprar_moedas_soma_saldo() -> void:
	var before := Player.coins()
	Monetization.purchase("moedas_300")
	runner.check_eq(Player.coins(), before + 300, "300 moedas creditadas")


func test_sem_anuncios_remove_intersticial() -> void:
	Player.data.matches_since_ad = 5
	runner.check(Monetization.should_show_interstitial(), "anúncio entre partidas aparece sem a compra")
	Monetization.purchase("remover_anuncios")
	runner.check(Player.ads_removed(), "compra registrada")
	runner.check(not Monetization.should_show_interstitial(), "não aparece depois de comprar")


func test_intersticial_respeita_frequencia() -> void:
	Player.data.matches_since_ad = Monetization.INTERSTITIAL_EVERY - 1
	runner.check(not Monetization.should_show_interstitial(), "não aparece antes de %d partidas" % Monetization.INTERSTITIAL_EVERY)


func test_pacote_libera_perguntas() -> void:
	runner.check(not Player.owned_packs().has("santos_brasil"), "pacote começa bloqueado")
	Monetization.purchase("pacote_santos_brasil")
	runner.check(Player.owned_packs().has("santos_brasil"), "pacote liberado depois da compra")


func test_moedas_gratis_tem_limite_diario() -> void:
	var limit := int(Content.shop.rewarded.max_per_day)
	for i in limit:
		Player.register_rewarded_coins()
	runner.check_eq(Player.rewarded_left_today(), 0, "limite diário de anúncios premiados")


func test_dica_gasta_moedas() -> void:
	Player.data.coins = 30
	runner.check(not Player.spend_coins(40), "não gasta sem saldo")
	runner.check(Player.spend_coins(25), "gasta com saldo")
	runner.check_eq(Player.coins(), 5, "saldo atualizado")
