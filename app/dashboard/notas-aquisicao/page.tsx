/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/app/src/services/data";
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  PackageMinus,
  AlertCircle,
} from "lucide-react";

interface Cliente {
  nomeCompleto: string;
  email: string;
  activo: boolean;
  papel: string;
  creditoAcumulado?: string;
}

interface NotaAquisicao {
  id: string;
  valorEmFalta?: string | number;
  estado:
    | "EM_ANALISE"
    | "AGUARDANDO_STOCK"
    | "APROVADA"
    | "RECUSADA"
    | "PAGAMENTO_PENDENTE"
    | "CONCLUIDA";
}

interface ProdutoCatalogo {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  tipo: string; // <-- importante: tipo do equipamento no catálogo
  stockAtual: number;
}

interface Oficio {
  id: string;
  descricao: string;
  dataEnvio: string;
  tipoEquipamento: string; // este é o tipo que vem do ofício
  quantidade: number;
  localInstalacao: string;
  justificativa: string;
  pdfAnexo?: string;
  cliente: Cliente;
  notaAquisicao: NotaAquisicao;
}

export default function OficiosPage() {
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Modais
  const [rejeitarModal, setRejeitarModal] = useState<{
    aberto: boolean;
    oficio: Oficio | null;
  }>({
    aberto: false,
    oficio: null,
  });

  const [saidaModal, setSaidaModal] = useState<{
    aberto: boolean;
    oficio: Oficio | null;
  }>({ aberto: false, oficio: null });

  const [motivo, setMotivo] = useState("");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>("");
  const [quantidadeSaida, setQuantidadeSaida] = useState<number>(1);

  const [pagamentoModal, setPagamentoModal] = useState<{
    aberto: boolean;
    oficio: Oficio | null;
  }>({
    aberto: false,
    oficio: null,
  });

  const [valorPagamento, setValorPagamento] = useState("");
  const [tipoPagamento, setTipoPagamento] = useState<
    "IMEDIATO" | "PRESTACAO" | "NORMAL"
  >("NORMAL");

  // Queries
  const { data: oficios = [], isLoading: loadingOficios } = useQuery<Oficio[]>({
    queryKey: ["oficios"],
    queryFn: async () => {
      const res = await api.get("/oficio");
      return res.data;
    },
  });

  const { data: todosProdutos = [] } = useQuery<ProdutoCatalogo[]>({
    queryKey: ["catalogo-para-saida"],
    queryFn: async () => {
      const res = await api.get("/catalogo");
      return res.data;
    },
  });

  const pagamentoMutation = useMutation({
    mutationFn: (body: {
      notaId: string;
      valor: number;
      tipo: "IMEDIATO" | "PRESTACAO";
    }) => api.post("/pagamento/normal", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oficios"] });
      setPagamentoModal({ aberto: false, oficio: null });
      setValorPagamento("");
      setTipoPagamento("IMEDIATO");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message);
    },
  });

  const abrirPagamento = (oficio: Oficio) => {
    if (
      oficio.notaAquisicao.estado !== "APROVADA" &&
      oficio.notaAquisicao.estado !== "PAGAMENTO_PENDENTE"
    )
      return;

    setPagamentoModal({ aberto: true, oficio });
    setDropdownOpen(null);
  };

  // Mutations
  const aceitarMutation = useMutation({
    mutationFn: (notaId: string) =>
      api.patch(`/nota-aquisicao/${notaId}/analisar`, { acao: "APROVAR" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["oficios"] }),
  });

  const rejeitarMutation = useMutation({
    mutationFn: ({ notaId, motivo }: { notaId: string; motivo: string }) =>
      api.patch(`/nota-aquisicao/${notaId}/analisar`, {
        acao: "RECUSAR",
        motivoRecusa: motivo,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oficios"] });
      setRejeitarModal({ aberto: false, oficio: null });
      setMotivo("");
    },
  });

  const saidaStockMutation = useMutation({
    mutationFn: (body: {
      catalogoId: string;
      quantidade: number;
      notaAquisicaoId: string;
    }) => api.post("/catalogo/stock/saida", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oficios"] });
      queryClient.invalidateQueries({ queryKey: ["catalogo-para-saida"] });
      setSaidaModal({ aberto: false, oficio: null });
      setProdutoSelecionadoId("");
      setQuantidadeSaida(1);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message);
    },
  });

  const creditoMutation = useMutation({
    mutationFn: (body: { notaId: string }) =>
      api.post("/pagamento/credito", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oficios"] });
      setPagamentoModal({ aberto: false, oficio: null });
      setValorPagamento("");
      setTipoPagamento("NORMAL");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message);
    },
  });

  // Handlers
  const abrirRejeitar = (oficio: Oficio) => {
    setRejeitarModal({ aberto: true, oficio });
    setDropdownOpen(null);
  };

  const abrirSaidaStock = (oficio: Oficio) => {
    if (
      oficio.notaAquisicao.estado !== "APROVADA" &&
      oficio.notaAquisicao.estado !== "AGUARDANDO_STOCK"
    )
      return;
    setSaidaModal({ aberto: true, oficio });
    setQuantidadeSaida(oficio.quantidade);
    setProdutoSelecionadoId("");
    setDropdownOpen(null);
  };

  const confirmarSaida = () => {
    if (!saidaModal.oficio || !produtoSelecionadoId) return;

    const produto = produtosDisponiveis.find(
      (p) => p.id === produtoSelecionadoId,
    );
    if (!produto || produto.stockAtual < quantidadeSaida) return;

    saidaStockMutation.mutate({
      catalogoId: produtoSelecionadoId,
      quantidade: quantidadeSaida,
      notaAquisicaoId: saidaModal.oficio.notaAquisicao.id,
    });
  };

  // Filtra apenas produtos com o mesmo tipoEquipamento do ofício atual
  const produtosDisponiveis = useMemo(() => {
    if (!saidaModal.oficio) return [];
    return todosProdutos.filter(
      (p) =>
        p.tipo.toUpperCase().trim() ===
        saidaModal.oficio!.tipoEquipamento.toUpperCase().trim(),
    );
  }, [todosProdutos, saidaModal.oficio]);

  const produtoSelecionado = produtosDisponiveis.find(
    (p) => p.id === produtoSelecionadoId,
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Ofícios ({oficios.length})
        </h1>
      </div>

      {/* Tabela */}
      {loadingOficios ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">Carregando ofícios...</p>
        </div>
      ) : oficios.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-xl text-gray-600">Nenhum ofício encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Equip.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtd
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    valorEmFalta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PDF
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {oficios.map((oficio) => {
                  const estado = oficio?.notaAquisicao?.estado;
                  const podeAnalisar = estado === "EM_ANALISE";
                  const aprovado = estado === "APROVADA";
                  const aguardarStock = estado === "AGUARDANDO_STOCK";

                  return (
                    <tr key={oficio.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium">
                        {oficio.descricao}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {oficio.tipoEquipamento}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {oficio.quantidade}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {oficio.cliente.nomeCompleto}
                        </p>
                        <p className="text-xs text-gray-500">
                          {oficio.cliente.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex text-center px-3 py-1 rounded-full text-xs font-semibold ${
                            estado === "CONCLUIDA"
                              ? "bg-green-100 text-green-800"
                              : estado === "PAGAMENTO_PENDENTE"
                                ? "bg-yellow-100 text-yellow-800"
                                : estado === "APROVADA"
                                  ? "bg-blue-100 text-blue-800"
                                  : estado === "RECUSADA"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {estado === "EM_ANALISE"
                            ? "Em análise"
                            : estado === "APROVADA"
                              ? "Aprovado"
                              : estado === "AGUARDANDO_STOCK"
                                ? "Aguardando Stock"
                                : estado === "PAGAMENTO_PENDENTE"
                                  ? "Pagamento Pendente"
                                  : estado === "CONCLUIDA"
                                    ? "Concluída"
                                    : "Recusado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {oficio?.notaAquisicao?.valorEmFalta != null
                          ? new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                              minimumFractionDigits: 2,
                            }).format(Number(oficio.notaAquisicao.valorEmFalta))
                          : "---"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(oficio.dataEnvio).toLocaleDateString("pt-AO")}
                      </td>
                      <td className="px-6 py-4">
                        {oficio.pdfAnexo ? (
                          <a
                            href={`http://localhost:3008${oficio.pdfAnexo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" /> PDF
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === oficio.id ? null : oficio.id,
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {dropdownOpen === oficio.id && (
                          <div className="absolute right-4 top-12 z-20 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                            {podeAnalisar && (
                              <>
                                <button
                                  onClick={() => {
                                    aceitarMutation.mutate(
                                      oficio.notaAquisicao.id,
                                    );
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" /> Aceitar
                                </button>
                                <button
                                  onClick={() => abrirRejeitar(oficio)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-700"
                                >
                                  <XCircle className="w-4 h-4" /> Rejeitar
                                </button>
                              </>
                            )}

                            {(oficio?.notaAquisicao?.estado === "APROVADA" ||
                              oficio?.notaAquisicao?.estado ===
                                "PAGAMENTO_PENDENTE") && (
                              <button
                                onClick={() => abrirPagamento(oficio)}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-blue-700"
                              >
                                <FileText className="w-4 h-4" />
                                Registrar Pagamento
                              </button>
                            )}

                            {(aprovado || aguardarStock) && (
                              <button
                                onClick={() => abrirSaidaStock(oficio)}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-orange-700"
                              >
                                <PackageMinus className="w-4 h-4" /> Saída de
                                Estoque
                              </button>
                            )}

                            {oficio.pdfAnexo && (
                              <>
                                <hr className="my-2 border-gray-200" />
                                <a
                                  href={`http://localhost:3008${oficio.pdfAnexo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                                >
                                  <Eye className="w-4 h-4" /> Ver PDF
                                </a>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {saidaModal.aberto && saidaModal.oficio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-2 text-orange-700">
              Saída de Estoque
            </h2>
            <p className="text-gray-600 mb-6">
              <strong>{saidaModal.oficio.descricao}</strong>
              <br />
              <span className="text-sm">
                Tipo: {saidaModal.oficio.tipoEquipamento} • Qtd solicitada:{" "}
                {saidaModal.oficio.quantidade}
              </span>
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione o produto (apenas do tipo
                  {saidaModal.oficio.tipoEquipamento})
                </label>
                <select
                  value={produtoSelecionadoId}
                  onChange={(e) => setProdutoSelecionadoId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Escolha um produto...</option>
                  {produtosDisponiveis.length === 0 ? (
                    <option disabled>
                      Nenhum produto disponível com este tipo
                    </option>
                  ) : (
                    produtosDisponiveis.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} - {p.marca} {p.modelo} → Stock: {p.stockAtual}{" "}
                        unid.
                      </option>
                    ))
                  )}
                </select>
              </div>

              {produtoSelecionado && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">{produtoSelecionado.nome}</p>
                      <p className="text-sm text-gray-700">
                        Stock atual:{" "}
                        <strong>{produtoSelecionado.stockAtual}</strong> unid.
                        {produtoSelecionado.stockAtual < quantidadeSaida && (
                          <span className="text-red-600 ml-2 font-bold">
                            Estoque insuficiente!
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade a retirar (máx: {saidaModal.oficio.quantidade})
                </label>
                <input
                  type="number"
                  min={produtoSelecionado?.stockAtual}
                  disabled
                  max={saidaModal.oficio.quantidade}
                  value={quantidadeSaida}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantidadeSaida(
                      Math.min(val, saidaModal.oficio!.quantidade),
                    );
                  }}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setSaidaModal({ aberto: false, oficio: null });
                  setProdutoSelecionadoId("");
                }}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSaida}
                disabled={
                  !produtoSelecionadoId ||
                  !produtoSelecionado ||
                  produtoSelecionado.stockAtual < quantidadeSaida ||
                  saidaStockMutation.isPending
                }
                className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saidaStockMutation.isPending
                  ? "Processando..."
                  : "Confirmar Saída"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejeitarModal.aberto && rejeitarModal.oficio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Rejeitar Ofício</h2>
            <p className="text-gray-600 mb-4">
              <strong>{rejeitarModal.oficio.descricao}</strong>
            </p>
            <textarea
              rows={5}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo da rejeição..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setRejeitarModal({ aberto: false, oficio: null });
                  setMotivo("");
                }}
                className="px-5 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  rejeitarMutation.mutate({
                    notaId: rejeitarModal.oficio!.notaAquisicao.id,
                    motivo,
                  })
                }
                disabled={!motivo.trim() || rejeitarMutation.isPending}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}

      {pagamentoModal.aberto && pagamentoModal.oficio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-2 text-blue-700">
              Registrar Pagamento
            </h2>

            <p className="text-gray-600 mb-4">
              <strong>{pagamentoModal.oficio.descricao}</strong>
              <br />
              Cliente: {pagamentoModal.oficio.cliente.nomeCompleto}
            </p>

            <p className="text-sm text-gray-600 mb-4">
              Estado da nota:{" "}
              <strong>{pagamentoModal.oficio.notaAquisicao.estado}</strong>
            </p>

            <p className="text-sm text-gray-600 mb-6">
              Crédito especial disponível:{" "}
              <strong>
                {pagamentoModal.oficio.cliente.creditoAcumulado ?? 0}
              </strong>
            </p>

            <div className="space-y-4">
              {/* Seleciona método de pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de pagamento
                </label>
                <select
                  value={tipoPagamento}
                  onChange={(e) => setTipoPagamento(e.target.value as any)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="NORMAL">Pagamento normal</option>
                  <option value="CREDITO">Usar crédito especial</option>
                </select>
              </div>

              {tipoPagamento === "NORMAL" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor do pagamento
                  </label>
                  <input
                    type="number"
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 150000"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setPagamentoModal({ aberto: false, oficio: null });
                  setValorPagamento("");
                  setTipoPagamento("NORMAL");
                }}
                className="px-5 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  if (tipoPagamento === "NORMAL") {
                    pagamentoMutation.mutate({
                      notaId: pagamentoModal.oficio!.notaAquisicao.id,
                      valor: Number(valorPagamento),
                      tipo: "IMEDIATO", // ou PRESTACAO, poderia ter outro select
                    });
                  } else {
                    creditoMutation.mutate({
                      notaId: pagamentoModal.oficio!.notaAquisicao.id,
                    });
                  }
                }}
                disabled={
                  (tipoPagamento === "NORMAL" &&
                    (!valorPagamento || Number(valorPagamento) <= 0)) ||
                  pagamentoMutation.isPending ||
                  creditoMutation.isPending
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {pagamentoMutation.isPending || creditoMutation.isPending
                  ? "Processando..."
                  : tipoPagamento === "NORMAL"
                    ? "Confirmar Pagamento"
                    : "Usar Crédito Especial"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
