import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createId,
  SEGMENTS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Segment,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/work-management/types";

const priorityVariant: Record<TaskPriority, "destructive" | "default" | "secondary"> = {
  Alta: "destructive",
  Média: "default",
  Baixa: "secondary",
};

function emptyDraft() {
  return {
    title: "",
    segment: SEGMENTS[0] as Segment,
    priority: "Média" as TaskPriority,
    dueDate: "",
    notes: "",
  };
}

export function TaskBoard({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  function addTask() {
    if (!draft.title.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: createId(),
        title: draft.title.trim(),
        segment: draft.segment,
        priority: draft.priority,
        status: "A Fazer",
        dueDate: draft.dueDate,
        notes: draft.notes.trim(),
      },
    ]);
    setDraft(emptyDraft());
    setOpen(false);
  }

  function moveTask(id: string, direction: 1 | -1) {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const idx = TASK_STATUSES.indexOf(task.status);
        const nextIdx = idx + direction;
        if (nextIdx < 0 || nextIdx >= TASK_STATUSES.length) return task;
        return { ...task, status: TASK_STATUSES[nextIdx] };
      }),
    );
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus />
              Nova tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova tarefa</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-title">Título</Label>
                <Input
                  id="task-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Ex: Enviar orçamento para cliente X"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Segmento</Label>
                  <Select
                    value={draft.segment}
                    onValueChange={(v: Segment) => setDraft({ ...draft, segment: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={draft.priority}
                    onValueChange={(v: TaskPriority) => setDraft({ ...draft, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-due">Prazo</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-notes">Observações</Label>
                <Textarea
                  id="task-notes"
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="Detalhes opcionais"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addTask}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => {
          const items = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-foreground">{status}</h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Nenhuma tarefa
                  </p>
                )}
                {items.map((task) => (
                  <Card key={task.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium leading-snug">
                        {task.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 pt-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                        <Badge variant="outline">{task.segment}</Badge>
                      </div>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Prazo: {new Date(task.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {task.notes && <p className="text-xs text-muted-foreground">{task.notes}</p>}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={status === TASK_STATUSES[0]}
                            onClick={() => moveTask(task.id, -1)}
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={status === TASK_STATUSES[TASK_STATUSES.length - 1]}
                            onClick={() => moveTask(task.id, 1)}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeTask(task.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
