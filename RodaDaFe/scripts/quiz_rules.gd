class_name QuizRules
extends RefCounted
## Todas as regras numéricas do jogo num lugar só (fácil de ajustar e testar).

const LIVES := 3
const STREAK_FOR_CROWN := 3 ## acertos seguidos que liberam a pergunta da coroa
const MEDALS_TO_WIN := 6 ## uma medalha por categoria
const SECONDS_PER_QUESTION := 25.0
const EXTRA_TIME_SECONDS := 10.0

const COINS_PER_CORRECT := 10
const COINS_FAST_BONUS := 5 ## respondeu certo em até FAST_SECONDS
const FAST_SECONDS := 8.0
const COINS_PER_MEDAL := 25
const COINS_WIN_BONUS := 100

const HINT_COSTS := {"eliminar_duas": 40, "mais_tempo": 25}

## A roda tem uma fatia para cada categoria e uma fatia "Coroa".
const CROWN_SEGMENT := "coroa"


## Moedas ganhas por uma resposta certa, conforme o tempo gasto.
static func coins_for_answer(correct: bool, seconds_used: float) -> int:
	if not correct:
		return 0
	return COINS_PER_CORRECT + (COINS_FAST_BONUS if seconds_used <= FAST_SECONDS else 0)


## Índices de duas alternativas erradas para a dica "eliminar duas".
static func options_to_eliminate(option_count: int, answer: int, rng: RandomNumberGenerator) -> Array[int]:
	var wrong: Array[int] = []
	for i in option_count:
		if i != answer:
			wrong.append(i)
	for i in range(wrong.size() - 1, 0, -1):
		var j := rng.randi_range(0, i)
		var tmp := wrong[i]
		wrong[i] = wrong[j]
		wrong[j] = tmp
	return wrong.slice(0, mini(2, wrong.size()))
