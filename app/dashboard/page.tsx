/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../src/services/data";
import { Dialog } from "@headlessui/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../src/store/auth-store";

interface Produto {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  descricao: string;
  preco: number;
  imagens: string[];
  tipo: string;
  stockAtual: number;
}

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { data: produtos = [], isLoading } = useQuery<Produto[]>({
    queryKey: ["catalogo-publico"],
    queryFn: async () => {
      const res = await api.get("/catalogo/public");
      return res.data;
    },
  });

  const router = useRouter();

  // Estado do modal de imagens
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openGallery = (produto: Produto) => {
    setSelectedProduto(produto);
    setCurrentImageIndex(0);
  };

  const closeGallery = () => {
    setSelectedProduto(null);
    setCurrentImageIndex(0);
  };

  const goToPrevious = () => {
    if (selectedProduto) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduto.imagens.length - 1 : prev - 1,
      );
    }
  };

  const goToNext = () => {
    if (selectedProduto) {
      setCurrentImageIndex((prev) =>
        prev === selectedProduto.imagens.length - 1 ? 0 : prev + 1,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-7xl">
          <div className="text-start mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Nosso Catálogo
            </h1>
            <p className="text-xl text-gray-600">
              Equipamentos de ar condicionado de alta qualidade
            </p>
          </div>

          {produtos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow">
              <p className="text-2xl text-gray-500">
                Nenhum produto disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 duration-300"
                >
                  {/* Imagem principal + botão de galeria */}
                  <div className="relative h-64 bg-gray-100 rounded-t-xl overflow-hidden">
                    {produto.imagens && produto.imagens.length > 0 ? (
                      <>
                        <img
                          src={`http://localhost:3008${produto.imagens[0]}`}
                          alt={produto.nome}
                          className="object-cover w-full h-full"
                        />

                        {/* Botão clicável para abrir galeria */}
                        {produto.imagens.length > 1 && (
                          <button
                            onClick={() => openGallery(produto)}
                            className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/80 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2 transition backdrop-blur-sm cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2H7v-2h8zm-3-2v2H7v-2h5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Ver {produto.imagens.length} fotos
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-200 border-2 border-dashed border-gray-300">
                        <span className="text-gray-500 font-medium">
                          Sem imagem
                        </span>
                      </div>
                    )}

                    {produto.stockAtual === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold tracking-wider">
                          Indisponível
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo do card */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 truncate">
                      {produto.nome}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {produto.marca} • {produto.modelo}
                    </p>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {produto.descricao}
                    </p>

                    <div className="mt-4">
                      <span className="text-3xl font-bold text-blue-600">
                        {produto.preco.toLocaleString("pt-AO", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        Kz
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {produto.tipo.replace("_", " ")}
                      </span>
                      {produto.stockAtual > 0 && (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Em Stock
                        </span>
                      )}

                      {produto.stockAtual > 0 && user?.papel === "CLIENTE" && (
                        <div className="mt-4 ">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/solicitar?tipo=${produto.tipo}`,
                              )
                            }
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-1 rounded-lg font-bold text-[12px] hover:shadow-lg transition px-4 cursor-pointer"
                          >
                            Solicitar este equipamento
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Galeria de Imagens */}
      {selectedProduto && selectedProduto.imagens.length > 0 && (
        <Dialog
          open={!!selectedProduto}
          onClose={closeGallery}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/90" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="relative max-w-5xl w-full bg-black rounded-2xl overflow-hidden">
              {/* Botão fechar */}
              <button
                onClick={closeGallery}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Imagem principal */}
              <div className="relative h-screen max-h-screen flex items-center justify-center">
                <img
                  src={`http://localhost:3008${selectedProduto.imagens[currentImageIndex]}`}
                  alt={`${selectedProduto.nome} - ${currentImageIndex + 1}`}
                  className="object-contain w-full h-full"
                />

                {/* Contador */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                  {currentImageIndex + 1} / {selectedProduto.imagens.length}
                </div>

                {/* Setas de navegação */}
                {selectedProduto.imagens.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-4 rounded-full backdrop-blur-sm transition"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-4 rounded-full backdrop-blur-sm transition"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>

              {selectedProduto.imagens.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex gap-3 justify-center overflow-x-auto pb-2">
                    {selectedProduto.imagens.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-4 transition ${
                          i === currentImageIndex
                            ? "border-white"
                            : "border-white/30"
                        }`}
                      >
                        <img
                          src={`http://localhost:3008${img}`}
                          alt={`Miniatura ${i + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}
