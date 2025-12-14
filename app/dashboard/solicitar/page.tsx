/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FileText, Upload, CheckCircle } from "lucide-react";
import api from "@/app/src/services/data";

const TipoEquipamento = [
  "SPLIT",
  "CASSETE",
  "MULTI_SPLIT",
  "PORTATIL",
  "JANELA",
  "INVERTER",
  "CENTRAL",
] as const;

export const tiposEquipamento = [
  {
    type: "SPLIT",
    value: "Split Hi-Wall (o mais comum em residências e escritórios)",
  },
  {
    type: "CASSETE",
    value: "Cassete (embutido no forro, ideal para lojas e salas comerciais)",
  },
  {
    type: "MULTI_SPLIT",
    value: "Multi Split (1 unidade externa para várias internas)",
  },
  {
    type: "PORTATIL",
    value: "Portátil (móvel, não precisa de instalação fixa)",
  },
  {
    type: "JANELA",
    value: "Janela (instalado diretamente na abertura da parede)",
  },
  {
    type: "INVERTER",
    value: "Inverter (tecnologia com economia de energia)",
  },
  {
    type: "CENTRAL",
    value: "Central (para grandes ambientes, condomínios e empresas)",
  },
] as const;

export type TipoEquipamento = (typeof tiposEquipamento)[number]["type"];
const TipoEquipamentoEnum = z.enum(TipoEquipamento);

const oficioSchema = z.object({
  descricao: z.string().min(20, "Mínimo 20 caracteres"),
  tipoEquipamento: TipoEquipamentoEnum,
  quantidade: z
    .string()
    .min(1, "Mínimo 1")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 1;
      },
      { message: "Quantidade deve ser um número maior ou igual a 1" }
    ),
  localInstalacao: z.string().min(5, "Mínimo 5 caracteres"),
  justificativa: z
    .string()
    .min(20, "Justificativa obrigatória (mínimo 20 caracteres)"),
  pdfAnexo: z.any().optional(),
});

type OficioForm = z.infer<typeof oficioSchema>;

export default function SolicitarOficioPage() {
  const [pdfName, setPdfName] = useState("Nenhum arquivo selecionado");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OficioForm>({
    resolver: zodResolver(oficioSchema),
    defaultValues: {},
  });

  const mutation = useMutation({
    mutationFn: async (data: OficioForm) => {
      const formData = new FormData();
      formData.append("descricao", data.descricao);
      formData.append("tipoEquipamento", data.tipoEquipamento);
      formData.append("quantidade", data.quantidade.toString());
      formData.append("localInstalacao", data.localInstalacao);
      formData.append("justificativa", data.justificativa);

      if (pdfFile) {
        formData.append("pdfAnexo", pdfFile);
      }

      const res = await api.post("/oficio", formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meus-oficios"] });
      router.push("/dashboard/minhas-solicitacoes");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfName(file.name);
      setValue("pdfAnexo", file);
    } else if (file) {
      alert("Apenas arquivos PDF são permitidos");
      e.target.value = "";
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 flex items-center justify-center gap-4">
          Novo Ofício de Aquisição
        </h1>
        <p className="text-gray-600 mt-4 text-lg">
          Solicite um equipamento para sua instituição
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-white/95 backdrop-blur p-10 rounded-[6px] shadow-2xl border border-white/20 space-y-7"
      >
        {/* Tipo de Equipamento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tipo de Equipamento *
          </label>
          <select
            {...register("tipoEquipamento")}
            className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black"
          >
            <option value="">Selecione o tipo</option>
            {tiposEquipamento.map(({ type, value }) => (
              <option key={type} value={type}>
                {value.replace("_", "-")} {/* Formata bonito */}
              </option>
            ))}
          </select>
          {errors.tipoEquipamento && (
            <p className="text-red-500 text-sm mt-1">
              {errors.tipoEquipamento.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantidade *
          </label>
          <input
            type="number"
            {...register("quantidade")}
            min="1"
            className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black"
            placeholder="1"
          />
          {errors.quantidade && (
            <p className="text-red-500 text-sm mt-1">
              {errors.quantidade.message}
            </p>
          )}
        </div>

        {/* Local de Instalação */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Local de Instalação *
          </label>
          <input
            {...register("localInstalacao")}
            className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black"
            placeholder="Ex: Sala de Reuniões - 3º andar"
          />
          {errors.localInstalacao && (
            <p className="text-red-500 text-sm mt-1">
              {errors.localInstalacao.message}
            </p>
          )}
        </div>

        {/* Justificativa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Justificativa da Aquisição *
          </label>
          <textarea
            {...register("justificativa")}
            rows={6}
            className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black resize-none"
            placeholder="Explique por que precisa deste equipamento..."
          />
          {errors.justificativa && (
            <p className="text-red-500 text-sm mt-1">
              {errors.justificativa.message}
            </p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descrição Adicional
          </label>
          <textarea
            {...register("descricao")}
            rows={4}
            className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black resize-none"
            placeholder="Marca preferida, potência, etc..."
          />
          {errors.descricao && (
            <p className="text-red-500 text-sm mt-1">
              {errors.descricao.message}
            </p>
          )}
        </div>

        {/* Upload PDF */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Anexo (PDF opcional - máx. 10MB)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg cursor-pointer hover:from-blue-100 hover:to-cyan-100 transition border-2 border-dashed border-blue-300">
              <Upload size={22} className="text-blue-600" />
              <span className="font-medium">Escolher PDF</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-600 truncate max-w-xs">
              {pdfName}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-5 rounded-[6px] font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-70 flex items-center justify-center gap-3"
        >
          {mutation.isPending ? <>Enviando...</> : <>Enviar Ofício</>}
        </button>

        {mutation.isSuccess && (
          <div className="bg-green-50 border-2 border-green-300 text-green-700 p-6 rounded-xl text-center font-bold text-lg">
            Ofício enviado com sucesso!
          </div>
        )}
      </form>
    </div>
  );
}
