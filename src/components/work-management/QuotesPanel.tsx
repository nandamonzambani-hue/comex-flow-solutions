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
import {
  BRANDS,
  createId,
  QUOTE_STATUSES,
  SEGMENTS,
  type Brand,
  type Quote,
  type QuoteStatus,
  type Segment,
} from "@/lib/work-management/types";

const statusVariant: Record<QuoteStatus, "secondary" | "default" | "destructive" | "outline"> = {
  "Em Aberto": "secondary",
  Enviado: "outline",
  Aprovado: "default",
  Perdido: "destructive",
};

function emptyDraft() {
  return {
    client: "",
    company: "",
    brand: BRANDS[0] as Brand,
    segment: SEGMENTS[0] as Segment,
    value: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function QuotesPanel({
  quotes,
  setQuotes,
}: {
  quotes: Quote[];
  setQuotes: (updater: (prev: Quote[]) => Quote[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  function addQuote() {
    if (!draft.client.trim() || !draft.company.trim()) return;
    setQuotes((prev) => [
      ...prev,
      {
        id: createId(),
        client: draft.client.trim(),
        company: draft.company.trim(),
        brand: draft.brand,
        segment: draft.segment,
        value: Number(draft.value) || 0,
        status: "Em Aberto",
        date: draft.date,
      },
    ]);
    setDraft(emptyDraft());
    setOpen(false);
  }

  function updateStatus(id: string, status: QuoteStatus) {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  }

  function removeQuote(id: string) {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }

  const openTotal = quotes
    .filter((q) => q.status === "Em Aberto" || q.status === "Enviado")
    .reduce((sum, q) => sum + q.value, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Em aberto/enviados:{" "}
          <span className="font-medium text-foreground">{currency.format(openTotal)}</span>
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus />
              Novo orçamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo orçamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="q-client">Cliente</Label>
                  <Input
                    id="q-client"
                    value={draft.client}
                    onChange={(e) => setDraft({ ...draft, client: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="q-company">Empresa</Label>
                  <Input
                    id="q-company"
                    value={draft.company}
                    onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                  />
                </div>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="q-value">Valor (R$)</Label>
                  <Input
                    id="q-value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.value}
                    onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="q-date">Data</Label>
                  <Input
                    id="q-date"
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addQuote}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-9" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                  Nenhum orçamento cadastrado
                </TableCell>
              </TableRow>
            )}
            {quotes.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.client}</TableCell>
                <TableCell className="text-muted-foreground">{q.company}</TableCell>
                <TableCell>
                  <Badge variant="outline">{q.brand}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{q.segment}</TableCell>
                <TableCell>{currency.format(q.value)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(q.date + "T00:00:00").toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <Select
                    value={q.status}
                    onValueChange={(v: QuoteStatus) => updateStatus(q.id, v)}
                  >
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue>
                        <Badge variant={statusVariant[q.status]}>{q.status}</Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {QUOTE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeQuote(q.id)}
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
