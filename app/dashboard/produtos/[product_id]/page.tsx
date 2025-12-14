/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/app/src/services/data";
import { X, Upload, Trash2, Pencil } from "lucide-react";
import { useParams } from "next/navigation";

interface Product {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  descricao: string;
  preco: number;
  imagens: string[];
  tipo: string;
  stockAtual: number;
  ativo: boolean;
}

interface FormValues {
  nome: string;
  marca: string;
  modelo: string;
  descricao: string;
  preco: number;
  tipo: string;
  stockAtual: number;
  ativo: boolean;
  imagens: File[];
}

const tiposEquipamento = [
  "SPLIT",
  "CASSETE",
  "MULTI_SPLIT",
  "PORTATIL",
  "JANELA",
  "INVERTER",
  "CENTRAL",
] as const;

type TipoEquipamento = (typeof tiposEquipamento)[number];

const baseUrl = "http://localhost:3008";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.product_id as string;
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [existingPreviews, setExistingPreviews] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await api.get(`/catalogo/${productId}`);
      return res.data;
    },
    enabled: !!productId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const currentNewImages = watch("imagens") || [];

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData();
      formData.append("nome", data.nome);
      formData.append("marca", data.marca);
      formData.append("modelo", data.modelo);
      formData.append("descricao", data.descricao);
      formData.append("preco", data.preco.toString());
      formData.append("tipo", data.tipo);
      formData.append("stockAtual", data.stockAtual.toString());
      formData.append("ativo", data.ativo.toString());

      data.imagens.forEach((file) => {
        formData.append("imagens", file);
      });

      return api.patch(`/catalogo/${productId}`, formData);
    },
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["catalogo"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Erro ao atualizar produto");
    },
  });

  const openModal = () => {
    if (!product) return;

    reset({
      nome: product.nome,
      marca: product.marca,
      modelo: product.modelo,
      descricao: product.descricao,
      preco: product.preco,
      tipo: product.tipo as TipoEquipamento,
      stockAtual: product.stockAtual,
      ativo: product.ativo,
      imagens: [],
    });

    setExistingPreviews(product.imagens.map((img: any) => `${baseUrl}${img}`));
    setNewPreviews([]);
    setValue("imagens", []);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    newPreviews.forEach(URL.revokeObjectURL);
    setNewPreviews([]);
    setExistingPreviews([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const updated = [...currentNewImages, ...files];
    setValue("imagens", updated);

    const previews = files.map((file) => URL.createObjectURL(file));
    setNewPreviews((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    const updated = currentNewImages.filter((_, i) => i !== index);
    setValue("imagens", updated);
    URL.revokeObjectURL(newPreviews[index]);
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div className="text-center py-20">Carregando...</div>;
  if (!product)
    return (
      <div className="text-center py-20 text-red-600">
        Produto não encontrado
      </div>
    );

  return (
    <>
      {/* Página de detalhes (simplificada) */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{product.nome}</h1>
          {/* Botão Editar - só para admins (você pode adicionar verificação real de papel) */}
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <Pencil className="w-5 h-5" />
            Editar Produto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Galeria */}
          <div className="space-y-4">
            {/* Imagem Principal */}
            <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-lg">
              <img
                src={`${baseUrl}${product.imagens[selectedImage]}`}
                alt={product.nome}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Miniaturas */}
            {product.imagens.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.imagens.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-600 shadow-md"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={`${baseUrl}${img}`}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-6">
            <div>
              <p className="text-2xl text-gray-600">
                {product.marca} • {product.modelo}
              </p>
              <p className="text-5xl font-bold text-blue-600 mt-4">
                {new Intl.NumberFormat("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                }).format(product.preco)}
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-3">Descrição</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {product.descricao}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-lg">
              <div>
                <span className="text-gray-600">Tipo:</span>{" "}
                <strong>{product.tipo}</strong>
              </div>
              <div>
                <span className="text-gray-600">Estoque:</span>{" "}
                <strong
                  className={
                    product.stockAtual > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {product.stockAtual} unid.
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição - 100% igual ao de criação */}
      {isEditModalOpen && (
        <div className="fixed w-full  inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl h-[90dvh] w-full ml-72">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-8 space-y-8 bg-white rounded-2xl "
            >
              <h2 className="text-3xl font-bold">Editar Produto</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-1">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    {...register("nome", { required: "Obrigatório" })}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.nome && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.nome.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1">Marca</label>
                  <input
                    type="text"
                    {...register("marca", { required: "Obrigatório" })}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Modelo</label>
                  <input
                    type="text"
                    {...register("modelo", { required: "Obrigatório" })}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("preco", { required: "Obrigatório", min: 0 })}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Estoque</label>
                  <input
                    type="number"
                    {...register("stockAtual", {
                      required: "Obrigatório",
                      min: 0,
                    })}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Tipo</label>
                  <select
                    {...register("tipo", { required: "Obrigatório" })}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {tiposEquipamento.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Descrição</label>
                <textarea
                  rows={4}
                  {...register("descricao", { required: "Obrigatório" })}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("ativo")}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Produto ativo</span>
                </label>
              </div>

              {/* Imagens existentes */}
              {existingPreviews.length > 0 && (
                <div>
                  <p className="font-medium mb-3">
                    Imagens atuais (serão mantidas):
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {existingPreviews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Atual"
                        className="w-full h-32 object-cover rounded-lg border shadow"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Novas imagens */}
              <div>
                <label className="block font-medium mb-3">
                  Adicionar novas imagens
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="edit-file"
                  />
                  <label htmlFor="edit-file" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                    <p className="text-blue-600 font-semibold">
                      Clique ou arraste novas imagens
                    </p>
                  </label>
                </div>

                {newPreviews.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 font-medium mb-4">
                      {newPreviews.length} nova(s) imagem(ns)
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {newPreviews.map((src, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={src}
                            alt="Nova"
                            className="w-full h-32 object-cover rounded-lg border shadow"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-5 rounded-xl text-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 transition shadow-lg"
                >
                  {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-5 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
