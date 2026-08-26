import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BRANDS,
  createId,
  TRAINING_STATUSES,
  type Brand,
  type Training,
  type TrainingStatus,
} from "@/lib/work-management/types";

const statusVariant: Record<TrainingStatus, "secondary" | "default" | "outline"> = {
  Agendado: "secondary",
  Confirmado: "default",
  Concluído: "outline",
};

function emptyDraft() {
  return {
    title: "",
    brand: BRANDS[0] as Brand,
    client: "",
    date: new Date().toISOString().slice(0, 10),
    location: "",
  };
}

export function TrainingsPanel({
  trainings,
  setTrainings,
}: {
  trainings: Training[];
  setTrainings: (updater: (prev: Training[]) => Training[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  function addTraining() {
    if (!draft.title.trim() || !draft.client.trim()) return;
    setTrainings((prev) => [
      ...prev,
      {
        id: createId(),
        title: draft.title.trim(),
        brand: draft.brand,
        client: draft.client.trim(),
        date: draft.date,
        location: draft.location.trim(),
        status: "Agendado",
      },
    ]);
    setDraft(emptyDraft());
    setOpen(false);
  }

  function updateStatus(id: string, status: TrainingStatus) {
    setTrainings((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function removeTraining(id: string) {
    setTrainings((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus />
              Novo treinamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo treinamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tr-title">Título</Label>
                <Input
                  id="tr-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Marca</Label>
                  <Select
                    value={draft.brand}
                    onValueChange={(v: Brand) => setDraft({ ...draft, brand: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANDS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tr-client">Cliente</Label>
                  <Input
                    id="tr-client"
                    value={draft.client}
                    onChange={(e) => setDraft({ ...draft, client: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tr-date">Data</Label>
                  <Input
                    id="tr-date"
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tr-location">Local</Label>
                  <Input
                    id="tr-location"
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    placeholder="Cidade — UF"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addTraining}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {trainings.length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhum treinamento cadastrado
          </p>
        )}
        {trainings.map((t) => (
          <Card key={t.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-medium leading-snug">{t.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeTraining(t.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline">{t.brand}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Cliente: {t.client}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(t.date + "T00:00:00").toLocaleDateString("pt-BR")}
              </p>
              {t.location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {t.location}
                </p>
              )}
              <Select value={t.status} onValueChange={(v: TrainingStatus) => updateStatus(t.id, v)}>
                <SelectTrigger className="mt-1 h-8 w-full">
                  <SelectValue>
                    <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
