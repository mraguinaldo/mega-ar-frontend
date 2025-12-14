/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/app/src/services/data";
import { TipoEquipamento } from "../../solicitar/page";
import { useRouter } from "next/navigation";

interface FormValues {
  nome: string;
  marca: string;
  modelo: string;
  descricao: string;
  preco: number;
  tipo: TipoEquipamento;
  imagens: File[];
}

const tiposEquipamento: TipoEquipamento[] = [
  "SPLIT",
  "CASSETE",
  "MULTI_SPLIT",
  "PORTATIL",
  "JANELA",
  "INVERTER",
  "CENTRAL",
];

export default function CriarCatalogo() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      imagens: [],
    },
  });

  const [previews, setPreviews] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Observa as imagens atuais
  const currentImages = watch("imagens") || [];

  // useMutation compatível com TanStack Query v5
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData();
      formData.append("nome", data.nome);
      formData.append("marca", data.marca);
      formData.append("modelo", data.modelo);
      formData.append("descricao", data.descricao);
      formData.append("preco", data.preco.toString());
      formData.append("tipo", data.tipo);

      data.imagens.forEach((file) => {
        formData.append("imagens", file);
      });

      return api.post("/catalogo", formData);
    },
    onSuccess: () => {
      toast.success("Produto cadastrado com sucesso!");

      // Limpa tudo
      reset();
      setPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      setValue("imagens", []);

      // Atualiza a lista de produtos automaticamente
      queryClient.invalidateQueries({ queryKey: ["catalogo"] });
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      router.push("/dashboard/produtos");
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Erro ao cadastrar o produto"
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    const updatedFiles = [...currentImages, ...newFiles];

    // Atualiza no form
    setValue("imagens", updatedFiles);

    // Gera novos previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Limpa o input (permite selecionar os mesmos arquivos de novo)
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const updatedFiles = currentImages.filter(
      (_: File, i: number) => i !== index
    );
    setValue("imagens", updatedFiles);

    // Revoga URL para evitar memory leak
    URL.revokeObjectURL(previews[index]);

    setPreviews((prev) => prev.filter((_: string, i: number) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-xl my-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Adicionar Novo Produto ao Catálogo
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Nome do Produto</label>
            <input
              type="text"
              {...register("nome", { required: "Nome é obrigatório" })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Ar Condicionado Split 18000 BTUs"
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">Marca</label>
            <input
              type="text"
              {...register("marca", { required: "Marca é obrigatória" })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="LG, Samsung, Gree..."
            />
            {errors.marca && (
              <p className="text-red-500 text-sm mt-1">
                {errors.marca.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">Modelo</label>
            <input
              type="text"
              {...register("modelo", { required: "Modelo é obrigatório" })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.modelo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.modelo.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              {...register("preco", {
                required: "Preço é obrigatório",
                min: { value: 0, message: "Preço não pode ser negativo" },
              })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2999.90"
            />
            {errors.preco && (
              <p className="text-red-500 text-sm mt-1">
                {errors.preco.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Descrição</label>
          <textarea
            rows={4}
            {...register("descricao", { required: "Descrição é obrigatória" })}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva as características, voltagem, funções, etc..."
          />
          {errors.descricao && (
            <p className="text-red-500 text-sm mt-1">
              {errors.descricao.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Tipo de Equipamento</label>
          <select
            {...register("tipo", { required: "Selecione o tipo" })}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            {tiposEquipamento.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo.replace("_", " ")}
              </option>
            ))}
          </select>
          {errors.tipo && (
            <p className="text-red-500 text-sm mt-1">{errors.tipo.message}</p>
          )}
        </div>

        {/* Upload de imagens */}
        <div>
          <label className="block font-medium mb-3">
            Imagens do Produto (múltiplas)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-blue-600 font-semibold text-lg">
                Clique aqui ou arraste as imagens
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Você pode adicionar várias fotos de uma vez
              </p>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 font-medium mb-4">
                {previews.length} imagem(ns) selecionada(s)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {previews.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 text-xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-8">
          <button
            type="submit"
            disabled={mutation.isPending || previews.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-5 rounded-xl text-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition shadow-lg"
          >
            {mutation.isPending
              ? "Cadastrando produto..."
              : "Cadastrar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
}
