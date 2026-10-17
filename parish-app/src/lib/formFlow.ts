import type { FormOptionPublic, FormQuestion, FormSection } from "@/types/database";

/** Resposta em edição no app, por pergunta. */
export interface DraftAnswer {
  text?: string;
  optionIds?: string[];
  fileUrl?: string;
}

export type NextStep = { kind: "section"; sectionId: string } | { kind: "submit" };

const BRANCHING_TYPES = new Set(["single_choice", "dropdown"]);

/**
 * Decide para onde ir depois de uma seção (lógica "se responder X, ir para
 * a seção Y"), na ordem de prioridade:
 *   1. a última pergunta da seção com opção escolhida que desvia
 *      (go_to_section_id) ou encerra (submit_form);
 *   2. o desvio fixo da seção (submit_after / next_section_id);
 *   3. a próxima seção pela ordem; se não houver, enviar.
 */
export function nextStep(
  sections: FormSection[],
  currentSectionId: string,
  questions: FormQuestion[],
  optionsByQuestion: Record<string, FormOptionPublic[]>,
  answers: Record<string, DraftAnswer>,
): NextStep {
  const ordered = [...sections].sort((a, b) => a.sort_order - b.sort_order);
  const current = ordered.find((s) => s.id === currentSectionId);
  if (!current) return { kind: "submit" };

  let branch: NextStep | null = null;
  const sectionQuestions = questions
    .filter((q) => q.section_id === current.id && BRANCHING_TYPES.has(q.question_type))
    .sort((a, b) => a.sort_order - b.sort_order);
  for (const q of sectionQuestions) {
    const chosenId = answers[q.id]?.optionIds?.[0];
    const option = (optionsByQuestion[q.id] ?? []).find((o) => o.id === chosenId);
    if (!option) continue;
    if (option.submit_form) branch = { kind: "submit" };
    else if (option.go_to_section_id && ordered.some((s) => s.id === option.go_to_section_id)) {
      branch = { kind: "section", sectionId: option.go_to_section_id };
    }
  }
  if (branch) return branch;

  if (current.submit_after) return { kind: "submit" };
  if (current.next_section_id && ordered.some((s) => s.id === current.next_section_id)) {
    return { kind: "section", sectionId: current.next_section_id };
  }
  const idx = ordered.indexOf(current);
  const following = ordered[idx + 1];
  return following ? { kind: "section", sectionId: following.id } : { kind: "submit" };
}

export function isAnswered(question: FormQuestion, answer: DraftAnswer | undefined): boolean {
  if (!answer) return false;
  switch (question.question_type) {
    case "single_choice":
    case "multiple_choice":
    case "dropdown":
      return (answer.optionIds?.length ?? 0) > 0;
    case "image_upload":
    case "file_upload":
      return !!answer.fileUrl;
    default:
      return !!answer.text?.trim();
  }
}

/** Perguntas obrigatórias sem resposta numa seção. */
export function missingRequired(
  sectionId: string,
  questions: FormQuestion[],
  answers: Record<string, DraftAnswer>,
): FormQuestion[] {
  return questions.filter((q) => q.section_id === sectionId && q.is_required && !isAnswered(q, answers[q.id]));
}

/** Monta o payload da RPC submit_form_response só com as seções visitadas. */
export function buildSubmission(
  visitedSectionIds: string[],
  questions: FormQuestion[],
  answers: Record<string, DraftAnswer>,
) {
  const visited = new Set(visitedSectionIds);
  return questions
    .filter((q) => visited.has(q.section_id) && isAnswered(q, answers[q.id]))
    .map((q) => ({
      question_id: q.id,
      text: answers[q.id]?.text?.trim() || null,
      option_ids: answers[q.id]?.optionIds ?? [],
      file_url: answers[q.id]?.fileUrl ?? null,
    }));
}
