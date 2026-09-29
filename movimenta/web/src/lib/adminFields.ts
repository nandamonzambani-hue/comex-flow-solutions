import type { Field } from "@/components/admin/Crud";
import { audienceLabels, goalLabels, levelLabels, mealLabels } from "./labels";

export const workoutFields: Field[] = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "cover_url", label: "Capa", type: "image" },
  { name: "description", label: "Descrição", type: "textarea" },
  { name: "category", label: "Categoria", type: "text", help: "ex.: Pernas e glúteos, HIIT, Alongamento" },
  { name: "goal", label: "Objetivo", type: "select", options: goalLabels },
  { name: "level", label: "Nível", type: "select", options: levelLabels, required: true },
  { name: "duration_minutes", label: "Duração (min)", type: "number" },
  { name: "is_free", label: "Gratuito (liberado para quem não assina)", type: "bool" },
  { name: "published", label: "Publicado (visível no app)", type: "bool" },
];

export const recipeFields: Field[] = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "image_url", label: "Foto", type: "image" },
  { name: "description", label: "Descrição", type: "textarea" },
  { name: "meal_type", label: "Refeição", type: "select", options: mealLabels },
  { name: "prep_minutes", label: "Preparo (min)", type: "number" },
  { name: "servings", label: "Porções", type: "number" },
  { name: "calories", label: "Calorias (kcal por porção)", type: "number" },
  { name: "protein_g", label: "Proteína (g)", type: "number" },
  { name: "carbs_g", label: "Carboidrato (g)", type: "number" },
  { name: "fat_g", label: "Gordura (g)", type: "number" },
  { name: "ingredients", label: "Ingredientes", type: "list" },
  { name: "steps", label: "Modo de preparo", type: "list" },
  { name: "tags", label: "Tags", type: "list", help: "ex.: sem glúten, vegetariana" },
  { name: "is_free", label: "Gratuita (preparo liberado para quem não assina)", type: "bool" },
  { name: "published", label: "Publicada", type: "bool" },
];

export const mealPlanFields: Field[] = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "description", label: "Descrição", type: "textarea" },
  { name: "goal", label: "Objetivo", type: "select", options: goalLabels },
  { name: "daily_calories", label: "Calorias por dia", type: "number" },
  { name: "published", label: "Publicado", type: "bool" },
];

export const challengeFields: Field[] = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "cover_url", label: "Capa", type: "image" },
  { name: "description", label: "Descrição", type: "textarea" },
  { name: "duration_days", label: "Duração (dias)", type: "number", required: true },
  { name: "goal_description", label: "Meta", type: "text", help: "ex.: Treinar 21 dias seguidos" },
  { name: "published", label: "Publicado", type: "bool" },
];

export { audienceLabels };
