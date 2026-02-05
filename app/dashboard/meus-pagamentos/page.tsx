/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/app/src/services/data";

interface Pagamento {
  id: string;
  valor: number;
  tipoPagamento: "IMEDIATO" | "PRESTACAO";
  dataPagamento: string;
  cliente: {
    nomeCompleto: string;
    email?: string;
    creditoAcumulado: number;
  };
  notaAquisicao: {
    id: string;
    estado: string;
    valorEmFalta?: number;
  };
  catalogo?: {
    id: string;
    nome: string;
    imagens?: string[];
  };
}

export default function MeusPagamentosPage() {
  const { data: pagamentos = [], isLoading } = useQuery<Pagamento[]>({
    queryKey: ["meusPagamentos"],
    queryFn: async () => {
      const res = await api.get("/pagamento/meus");
      return res.data;
    },
  });

  const credito = pagamentos[0]?.cliente?.creditoAcumulado ?? 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Meus Pagamentos ({pagamentos.length})
        </h1>
        <div className="text-right">
          <p className="text-gray-600 text-sm">Crédito acumulado:</p>
          <p className="text-xl font-semibold text-green-700">
            {new Intl.NumberFormat("pt-AO", {
              style: "currency",
              currency: "AOA",
            }).format(credito)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">Carregando pagamentos...</p>
        </div>
      ) : pagamentos.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-xl text-gray-600">Nenhum pagamento registrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor em falta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {pagamentos.map((p) => {
                  const imediato = p.tipoPagamento === "IMEDIATO";
                  const imagem = p.catalogo?.imagens?.[0];

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {imagem && (
                          <img
                            src={`http://localhost:3008${imagem}`}
                            alt={p.catalogo?.nome}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        )}
                        <span className="text-sm text-gray-700">
                          {p.catalogo?.nome ?? "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            imediato
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {imediato ? "Imediato" : "Prestação"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold">
                        {new Intl.NumberFormat("pt-AO", {
                          style: "currency",
                          currency: "AOA",
                        }).format(p.valor)}
                      </td>

                      <td className="px-6 py-4 font-bold text-red-600">
                        {p.notaAquisicao.valorEmFalta
                          ? new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                            }).format(p.notaAquisicao.valorEmFalta)
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(p.dataPagamento).toLocaleDateString("pt-AO")}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            p.notaAquisicao.estado === "CONCLUIDA"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {p.notaAquisicao.estado === "CONCLUIDA"
                            ? "Pago"
                            : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
