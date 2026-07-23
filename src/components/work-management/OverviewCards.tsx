import { Briefcase, CalendarClock, HandCoins, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client, Quote, Task, Training } from "@/lib/work-management/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function OverviewCards({
  tasks,
  quotes,
  clients,
  trainings,
}: {
  tasks: Task[];
  quotes: Quote[];
  clients: Client[];
  trainings: Training[];
}) {
  const pendingTasks = tasks.filter((t) => t.status !== "Concluído").length;
  const openQuoteValue = quotes
    .filter((q) => q.status === "Em Aberto" || q.status === "Enviado")
    .reduce((sum, q) => sum + q.value, 0);
  const scheduledTrainings = trainings.filter((t) => t.status !== "Concluído").length;

  const cards = [
    {
      label: "Tarefas pendentes",
      value: pendingTasks,
      icon: Briefcase,
    },
    {
      label: "Orçamentos em andamento",
      value: currency.format(openQuoteValue),
      icon: HandCoins,
    },
    {
      label: "Treinamentos agendados",
      value: scheduledTrainings,
      icon: CalendarClock,
    },
    {
      label: "Clientes ativos",
      value: clients.length,
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
