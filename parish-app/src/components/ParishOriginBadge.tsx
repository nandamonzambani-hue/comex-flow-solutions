import { useTranslation } from "react-i18next";
import { useParishContext } from "@/context/ParishContext";
import { Badge } from "@/components/ui";

/**
 * Para fiéis de uma comunidade: marca o que veio da Matriz ("Matriz"), já
 * que as listagens misturam conteúdo da comunidade com o compartilhado pela
 * Matriz. Não renderiza nada para conteúdo da própria paróquia.
 */
export function ParishOriginBadge({ parishId }: { parishId: string }) {
  const { t } = useTranslation();
  const { parish, parentParish } = useParishContext();
  if (!parentParish || parishId === parish?.id) return null;
  return <Badge label={t("hierarchy.fromMatriz")} />;
}
