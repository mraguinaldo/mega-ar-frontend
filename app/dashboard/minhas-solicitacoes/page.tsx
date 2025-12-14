/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// app/minhas-solicitacoes/page.tsx

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { pt, ptBR, se } from "date-fns/locale";
import {
  Download,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import api from "@/app/src/services/data";
import { set } from "zod";

interface NotaAquisicao {
  id: string;
  dataCriacao: string;
  quantidade: number;
  estado: "EM_ANALISE" | "AGUARDANDO_STOCK" | "APROVADA" | "RECUSADA";
  catalogo: {
    nome: string;
    marca: string;
    modelo: string;
    imagens: string[];
    preco: number;
  };
  oficio: {
    pdfAnexo: string | null;
  };
  pagamentos?: Array<{
    valor: number;
    tipoPagamento: string;
    dataPagamento: string;
  }>;
}

const tipoEquipamentoColors: Record<string, string> = {
  SPLIT: "bg-blue-100 text-blue-800",
  CASSETE: "bg-purple-100 text-purple-800",
  MULTI_SPLIT: "bg-green-100 text-green-800",
  PORTATIL: "bg-yellow-100 text-yellow-800",
  JANELA: "bg-pink-100 text-pink-800",
  INVERTER: "bg-indigo-100 text-indigo-800",
  CENTRAL: "bg-red-100 text-red-800",
};

export default function MinhasSolicitacoes() {
  const [notas, setNotas] = useState<NotaAquisicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [motivoAberto, setMotivoAberto] = useState<string | null>(null);
  const [titleModal, setTitleModal] = useState<string | null>(null);

  const fetchNotas = async () => {
    try {
      const res = await api.get("/oficio/meus");
      setNotas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  const podeEditarOuExcluir = (estado: string) => {
    return estado === "EM_ANALISE";
  };

  const excluirNota = async (id: string) => {
    if (!confirm("Tem certeza que quer excluir esta solicitação?")) return;

    setDeletingId(id);
    try {
      await api.delete(`/nota-aquisicao/${id}`);
      setNotas((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert("Erro ao excluir. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusConfig = (estado?: string | null) => {
    switch (estado) {
      case "EM_ANALISE":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
          label: "Em Análise",
        };
      case "AGUARDANDO_STOCK":
        return {
          color: "bg-orange-100 text-orange-800",
          icon: Package,
          label: "Sem Stock",
        };
      case "APROVADA":
        return {
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          label: "Aprovada",
        };
      case "RECUSADA":
        return {
          color: "bg-red-100 text-red-800",
          icon: XCircle,
          label: "Recusada",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-600",
          icon: AlertCircle,
          label: "Não Enviado",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Minhas Solicitações
          </h1>
          <p className="text-xl text-gray-600 mt-3">
            Gerencie suas aquisições enquanto ainda não foram analisadas
          </p>
        </div>

        {notas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800">
              Nenhuma solicitação
            </h3>
            <p className="text-gray-600 mt-3">
              Vá ao catálogo e solicite os equipamentos que precisa.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Lista de Ofícios Enviados
            </h2>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qtd
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Local
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Justificativa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                        Motivo de rejeição
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Anexo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notas.map((oficio: any) => (
                      <tr
                        key={oficio.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(
                            new Date(oficio.dataEnvio),
                            "dd/MM/yyyy HH:mm",
                            { locale: ptBR }
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {oficio.descricao ? (
                            <button
                              onClick={() => {
                                setMotivoAberto(oficio.descricao);
                                setTitleModal("Descrição");
                              }}
                              className="text-red-600 hover:text-red-800 underline text-sm cursor-pointer"
                            >
                              Ver Descrição
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              tipoEquipamentoColors[oficio.tipoEquipamento] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {oficio.tipoEquipamento}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                          {oficio.quantidade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {oficio.localInstalacao}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {oficio.justificativa ? (
                            <button
                              onClick={() => {
                                setMotivoAberto(oficio.justificativa);
                                setTitleModal("Justificativa");
                              }}
                              className="text-red-600 hover:text-red-800 underline text-sm cursor-pointer"
                            >
                              Ver Justificativa
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {(() => {
                            const estado = oficio.notaAquisicao?.estado || null;
                            const status = getStatusConfig(estado);
                            const Icon = status.icon;

                            return (
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
                              >
                                <Icon className="w-4 h-4" />
                                {status.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {oficio.notaAquisicao?.motivoRecusa ? (
                            <button
                              onClick={() => {
                                setMotivoAberto(
                                  oficio.notaAquisicao.motivoRecusa
                                );
                                setTitleModal("Motivo de Rejeição");
                              }}
                              className="text-red-600 hover:text-red-800 underline text-sm cursor-pointer"
                            >
                              Ver motivo
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {oficio.pdfAnexo ? (
                            <>
                              <a
                                href={`http://localhost:3008${oficio.pdfAnexo}`}
                                rel="noopener noreferrer"
                                download={`http://localhost:3008${oficio.pdfAnexo}`}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <FileText className="w-5 h-5" />
                              </a>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {motivoAberto && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {titleModal}
                    </h3>

                    <p className="text-gray-700 whitespace-pre-line">
                      {motivoAberto}
                    </p>

                    <button
                      onClick={() => setMotivoAberto(null)}
                      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {notas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum ofício encontrado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
