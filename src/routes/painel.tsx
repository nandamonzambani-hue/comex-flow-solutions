import { createFileRoute, Link } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { OverviewCards } from "@/components/work-management/OverviewCards";
import { TaskBoard } from "@/components/work-management/TaskBoard";
import { QuotesPanel } from "@/components/work-management/QuotesPanel";
import { ClientsPanel } from "@/components/work-management/ClientsPanel";
import { TrainingsPanel } from "@/components/work-management/TrainingsPanel";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { seedClients, seedQuotes, seedTasks, seedTrainings } from "@/lib/work-management/seed-data";
import type { Client, Quote, Task, Training } from "@/lib/work-management/types";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel de Trabalho — Comex10 do Brasil" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WorkPanel,
});

function WorkPanel() {
  const [tasks, setTasks] = useLocalStorageState<Task[]>("comex10-panel-tasks", seedTasks);
  const [quotes, setQuotes] = useLocalStorageState<Quote[]>("comex10-panel-quotes", seedQuotes);
  const [clients, setClients] = useLocalStorageState<Client[]>(
    "comex10-panel-clients",
    seedClients,
  );
  const [trainings, setTrainings] = useLocalStorageState<Training[]>(
    "comex10-panel-trainings",
    seedTrainings,
  );

  function resetData() {
    if (!window.confirm("Restaurar os dados de exemplo? Isso apaga suas alterações locais.")) {
      return;
    }
    setTasks(() => seedTasks);
    setQuotes(() => seedQuotes);
    setClients(() => seedClients);
    setTrainings(() => seedTrainings);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/" className="text-xs font-medium text-primary hover:underline">
              ← Voltar ao site
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Painel de Trabalho
            </h1>
            <p className="text-sm text-muted-foreground">
              Comex10 do Brasil — tarefas, orçamentos, clientes e treinamentos em um só lugar.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetData} className="self-start">
            <RotateCcw />
            Restaurar exemplo
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <OverviewCards tasks={tasks} quotes={quotes} clients={clients} trainings={trainings} />

        <Tabs defaultValue="tarefas" className="mt-8">
          <TabsList>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="treinamentos">Treinamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="tarefas" className="pt-4">
            <TaskBoard tasks={tasks} setTasks={setTasks} />
          </TabsContent>
          <TabsContent value="orcamentos" className="pt-4">
            <QuotesPanel quotes={quotes} setQuotes={setQuotes} />
          </TabsContent>
          <TabsContent value="clientes" className="pt-4">
            <ClientsPanel clients={clients} setClients={setClients} />
          </TabsContent>
          <TabsContent value="treinamentos" className="pt-4">
            <TrainingsPanel trainings={trainings} setTrainings={setTrainings} />
          </TabsContent>
        </Tabs>

        <p className="mt-8 text-xs text-muted-foreground">
          Os dados deste painel ficam salvos apenas neste navegador (armazenamento local).
        </p>
      </main>
    </div>
  );
}
