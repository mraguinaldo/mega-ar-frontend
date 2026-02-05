/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarPagamento } from "@/app/dashboard/pagamentos/data";

interface Props {
  notaId: string;
  open: boolean;
  onClose: () => void;
}

export function PagamentoModal({ notaId, open, onClose }: Props) {
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"IMEDIATO" | "PRESTACAO">("IMEDIATO");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: criarPagamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
      onClose();
    },
  });

  function handleSubmit() {
    mutation.mutate({
      notaId,
      valor: Number(valor),
      tipo,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Efetuar Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Valor a pagar"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMEDIATO">Pagamento imediato</SelectItem>
              <SelectItem value="PRESTACAO">Prestação</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            Confirmar Pagamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
