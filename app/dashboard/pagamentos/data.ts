import api from "@/app/src/services/data";

export type TipoPagamento = "IMEDIATO" | "PRESTACAO";

export interface NotaAquisicao {
  id: string;
  estado: "APROVADA" | string;
  quantidade: number;
  catalogo?: {
    nome: string;
    preco: number;
  };
}

export interface Pagamento {
  id: string;
  valor: number;
  tipoPagamento: TipoPagamento;
  dataPagamento: string;
}

export async function criarPagamento(data: {
  notaId: string;
  valor: number;
  tipo: "IMEDIATO" | "PRESTACAO";
}) {
  const res = await api.post("/pagamento", data);
  return res.data;
}

export async function meusPagamentos() {
  const res = await api.get("/pagamento/meus");
  return res.data;
}

export async function pagamentosPorNota(notaId: string) {
  const res = await api.get(`/pagamento/nota/${notaId}`);
  return res.data;
}
