"use client";

import api from "@/app/src/services/data";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Printer } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";

// Tipagem exata do seu backend
interface Movimento {
  id: string;
  catalogoId: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  motivo: string;
  notaAquisicaoId: string | null;
  criadoPorId: string;
  dataMovimento: string;
  catalogo: {
    nome: string;
    marca: string;
    modelo: string;
  };
  criadoPor: {
    nomeCompleto: string;
  };
  notaAquisicao: {
    cliente?: {
      nomeCompleto: string;
    };
  } | null;
}

export default function MovimentosPage() {
  const {
    data: movimentos = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Movimento[]>({
    queryKey: ["movimentos"],
    queryFn: async () => {
      const { data } = await api.get("/catalogo/stock/movimentos");
      return data;
    },
  });

  const tableRef = useRef<HTMLTableElement>(null);

  // Função para exportar Excel
  const exportToExcel = () => {
    const dadosParaExcel = movimentos.map((m) => ({
      Data: format(new Date(m.dataMovimento), "dd/MM/yyyy HH:mm"),
      Produto: `${m.catalogo.nome} - ${m.catalogo.marca} ${m.catalogo.modelo}`,
      Tipo: m.tipo,
      Quantidade: m.tipo === "ENTRADA" ? m.quantidade : -m.quantidade,
      "Qtd Absoluta": m.quantidade,
      Usuário: m.criadoPor.nomeCompleto,
      Motivo: m.motivo,
      Cliente: m.notaAquisicao?.cliente?.nomeCompleto || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dadosParaExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimentos");
    XLSX.utils.sheet_add_aoa(ws, [["Relatório de Movimentos de Estoque"]], {
      origin: "A1",
    });
    ws["!cols"] = [
      { wch: 18 },
      { wch: 40 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 25 },
      { wch: 50 },
      { wch: 25 },
    ];

    XLSX.writeFile(
      wb,
      `movimentos_estoque_${format(new Date(), "dd-MM-yyyy_HHmm")}.xlsx`
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-8 bg-red-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-red-800 mb-4">
          Erro ao carregar movimentos
        </h2>
        <button
          onClick={() => refetch()}
          className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6">
      {/* Cabeçalho com botões */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Relatório de Movimentos de Estoque
        </h1>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
          >
            <Download size={20} />
            Exportar Excel
          </button>
        </div>
      </div>

      {movimentos.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
          Nenhum movimento registrado ainda.
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table
              ref={tableRef}
              className="min-w-full divide-y divide-gray-200"
            >
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                    Qtd
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Cliente
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentos.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {format(new Date(m.dataMovimento), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {m.catalogo.nome}{" "}
                      <span className="text-gray-500">
                        - {m.catalogo.marca} {m.catalogo.modelo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                          m.tipo === "ENTRADA"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {m.tipo}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold text-center ${
                        m.tipo === "ENTRADA" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {m.tipo === "ENTRADA" ? "+" : "-"}
                      {m.quantidade}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {m.criadoPor.nomeCompleto}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-600 max-w-md truncate"
                      title={m.motivo}
                    >
                      {m.motivo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {m.notaAquisicao?.cliente?.nomeCompleto || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totalizador (opcional, mas fica bonito no relatório) */}
      {movimentos.length > 0 && (
        <div className="mt-6 text-right text-lg font-semibold text-gray-700">
          Total de registros:{" "}
          <span className="text-blue-600">{movimentos.length}</span>
        </div>
      )}
    </div>
  );
}
