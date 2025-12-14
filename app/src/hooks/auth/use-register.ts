/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import api from "../../services/data";

const registerSchema = z
  .object({
    nomeCompleto: z.string().min(3, "Nome muito curto"),
    email: z.string().email("Email inválido"),
    contacto: z
      .string()
      .min(9, "Contacto deve ter 9 dígitos")
      .max(9, "Contacto deve ter 9 dígitos")
      .regex(/^\d+$/, "Apenas números"),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export const useRegister = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nomeCompleto: "",
      email: "",
      contacto: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await api.post("/usuario", {
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        contacto: data.contacto,
        senha: data.senha,
      });
      return res.data;
    },
    onSuccess: (data) => {
      const { access_token, usuario } = data;
      login(usuario, access_token);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      console.log(error);
      const message =
        error.response?.data?.message ||
        "Erro ao criar conta. Tente novamente.";
      form.setError("root", { message });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return {
    form,
    handleSubmit,
    isPending: mutation.isPending,
  };
};
