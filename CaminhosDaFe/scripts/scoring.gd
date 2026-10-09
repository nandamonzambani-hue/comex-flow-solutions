class_name Scoring
extends RefCounted
## Regras de pontuação, num só lugar.
## Os pontos medem a aventura (desafios e conhecimento). As escolhas morais
## mudam a história, mas NUNCA a pontuação: o jogo não julga a fé de ninguém.

const QUESTION_FIRST_TRY := 100
const QUESTION_SECOND_TRY := 50
const CHALLENGE_DONE := 150
const CHALLENGE_NO_HINT_BONUS := 50
const MAX_QUESTION_ATTEMPTS := 2


static func question_points(attempts_used: int, correct: bool) -> int:
	if not correct:
		return 0
	return QUESTION_FIRST_TRY if attempts_used <= 1 else QUESTION_SECOND_TRY


static func challenge_points(hints_used: int) -> int:
	return CHALLENGE_DONE + (CHALLENGE_NO_HINT_BONUS if hints_used == 0 else 0)


static func max_points(question_count: int, challenge_count: int) -> int:
	return question_count * QUESTION_FIRST_TRY + challenge_count * (CHALLENGE_DONE + CHALLENGE_NO_HINT_BONUS)
