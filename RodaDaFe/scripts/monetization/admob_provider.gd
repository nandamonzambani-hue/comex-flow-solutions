class_name AdMobProvider
extends RefCounted
## Anúncios reais (AdMob) no Android/iOS.
##
## O SDK de anúncios entra como plugin (não vem neste repositório). Enquanto
## ele não estiver instalado e configurado com os IDs de bloco de anúncio da
## SUA conta AdMob, create_if_available() devolve null e o jogo usa o
## MockProvider. Passo a passo e o trecho de código para ligar o plugin em
## docs/monetizacao.md (seção "Anúncios").
##
## IDs de bloco de anúncio: preencha em data/ads.json (os que estão lá são os
## IDs de TESTE públicos do Google, que nunca geram receita).

const CONFIG_PATH := "res://data/ads.json"
const SINGLETON := "PoingGodotAdMob"


static func create_if_available(_monetization: Node) -> AdMobProvider:
	if OS.get_name() not in ["Android", "iOS"] or not Engine.has_singleton(SINGLETON):
		return null
	# A ponte com o plugin é ligada aqui depois da instalação (ver docs).
	push_warning("Plugin de anúncios encontrado, mas a ponte ainda não foi ativada (docs/monetizacao.md).")
	return null
