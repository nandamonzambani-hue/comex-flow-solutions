import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createId, SEGMENTS, type Client, type Segment } from "@/lib/work-management/types";

function emptyDraft() {
  return {
    name: "",
    company: "",
    segment: SEGMENTS[0] as Segment,
    phone: "",
    lastContact: new Date().toISOString().slice(0, 10),
  };
}

export function ClientsPanel({
  clients,
  setClients,
}: {
  clients: Client[];
  setClients: (updater: (prev: Client[]) => Client[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  function addClient() {
    if (!draft.name.trim() || !draft.company.trim()) return;
    setClients((prev) => [
      ...prev,
      {
        id: createId(),
        name: draft.name.trim(),
        company: draft.company.trim(),
        segment: draft.segment,
        phone: draft.phone.trim(),
        lastContact: draft.lastContact,
      },
    ]);
    setDraft(emptyDraft());
    setOpen(false);
  }

  function removeClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus />
              Novo cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="c-name">Nome</Label>
                  <Input
                    id="c-name"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-company">Empresa</Label>
                  <Input
                    id="c-company"
                    value={draft.company}
                    onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                  />
                </div>
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
                  <Label htmlFor="c-phone">Telefone</Label>
                  <Input
                    id="c-phone"
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    placeholder="(11) 90000-0000"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-contact">Último contato</Label>
                <Input
                  id="c-contact"
                  type="date"
                  value={draft.lastContact}
                  onChange={(e) => setDraft({ ...draft, lastContact: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addClient}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Último contato</TableHead>
              <TableHead className="w-9" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  Nenhum cliente cadastrado
                </TableCell>
              </TableRow>
            )}
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.company}</TableCell>
                <TableCell>
                  <Badge variant="outline">{c.segment}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.phone || "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {c.lastContact
                    ? new Date(c.lastContact + "T00:00:00").toLocaleDateString("pt-BR")
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeClient(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
