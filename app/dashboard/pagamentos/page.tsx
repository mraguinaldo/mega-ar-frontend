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
  };
  notaAquisicao: {
    id: string;
    catalogo?: {
      nome: string;
    };
  };
}

export default function PagamentosPage() {
  const { data: pagamentos = [], isLoading } = useQuery<Pagamento[]>({
    queryKey: ["pagamentos"],
    queryFn: async () => {
      const res = await api.get("/pagamento");
      return res.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Pagamentos ({pagamentos.length})
        </h1>
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
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Nota / Produto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
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

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium">{p.cliente.nomeCompleto}</p>
                        {p.cliente.email && (
                          <p className="text-xs text-gray-500">
                            {p.cliente.email}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.notaAquisicao.catalogo?.nome ?? "—"}
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

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(p.dataPagamento).toLocaleDateString("pt-AO")}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Pago
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
