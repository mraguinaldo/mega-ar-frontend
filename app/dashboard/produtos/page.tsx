/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/app/src/services/data";
import {
  MoreVertical,
  PackagePlus,
  PackageMinus,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  descricao: string;
  preco: number;
  tipo: string;
  ativo: boolean;
  imagens: string[];
  stockAtual: number;
}

export default function ProdutosPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    type: "ativar" | "desativar" | "entrada" | "saida";
    produto: Produto | null;
  } | null>(null);
  const [quantidade, setQuantidade] = useState<number>(1);

  const { data: produtos = [], isLoading } = useQuery<Produto[]>({
    queryKey: ["produtos"],
    queryFn: async () => {
      const res = await api.get("/catalogo");
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({
      endpoint,
      body,
    }: {
      endpoint: string;
      body?: any;
    }) => {
      return body ? api.post(endpoint, body) : api.patch(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      setModal(null);
      setDropdownOpen(null);
      setQuantidade(1);
    },
  });

  const handleStock = (tipo: "entrada" | "saida", produto: Produto) => {
    setModal({ type: tipo, produto });
    setQuantidade(1);
  };

  const confirmStock = () => {
    if (!modal?.produto) return;

    const endpoint =
      modal.type === "entrada"
        ? "/catalogo/stock/entrada"
        : "/catalogo/stock/saida";

    const body =
      modal.type === "entrada"
        ? {
            catalogoId: modal.produto.id,
            quantidade,
            motivo: "Entrada manual via admin",
          }
        : { catalogoId: modal.produto.id, quantidade, notaAquisicaoId: null };

    mutation.mutate({ endpoint, body });
  };

  const toggleAtivo = (produto: Produto) => {
    const endpoint = produto.ativo
      ? `/catalogo/${produto.id}/desativar`
      : `/catalogo/${produto.id}/ativar`;
    mutation.mutate({ endpoint });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Produtos ({produtos.length})
        </h1>
        <button
          onClick={() => router.push("/dashboard/produtos/criar")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-md flex items-center gap-2"
        >
          + Criar Produto
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">Carregando produtos...</p>
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-xl text-gray-600">
            Nenhum produto cadastrado ainda.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imagem
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {produto.imagens[0] ? (
                        <img
                          src={`http://localhost:3008${produto.imagens[0]}`}
                          alt={produto.nome}
                          className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center">
                          <span className="text-xs text-gray-400">
                            Sem foto
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {produto.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          {produto.marca} • {produto.modelo}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {produto.preco.toLocaleString("pt-AO")} Kz
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          produto.stockAtual > 0
                            ? produto.stockAtual < 5
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {produto.stockAtual} unid.
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          produto.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === produto.id ? null : produto.id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Dropdown de Detalhes */}
                      {dropdownOpen === produto.id && (
                        <div className="absolute right-4 top-12 z-10 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                          <button
                            onClick={() => {
                              router.push(`/dashboard/produtos/${produto.id}`);
                              setDropdownOpen(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                          >
                            <Eye className="w-4 h-4" /> Ver Detalhes
                          </button>
                          <hr className="my-2 border-gray-200" />

                          <button
                            onClick={() => handleStock("entrada", produto)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-green-700"
                          >
                            <PackagePlus className="w-4 h-4" /> Entrada de Stock
                          </button>

                          <hr className="my-2 border-gray-200" />

                          <button
                            onClick={() => {
                              toggleAtivo(produto);
                              setDropdownOpen(null);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 ${
                              produto.ativo ? "text-red-700" : "text-green-700"
                            }`}
                          >
                            {produto.ativo ? (
                              <>
                                <ToggleLeft className="w-4 h-4" /> Desativar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4" /> Ativar
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Entrada/Saída de Stock */}
      {modal && modal.produto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {modal.type === "entrada" ? "Entrada" : "Saída"} de Stock
            </h2>
            <p className="text-gray-600 mb-6">
              Produto: <strong>{modal.produto.nome}</strong>
              <br />
              Stock atual: <strong>{modal.produto.stockAtual}</strong>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) =>
                  setQuantidade(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={mutation.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={confirmStock}
                disabled={mutation.isPending}
                className={`px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2 ${
                  modal.type === "entrada"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {mutation.isPending ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
