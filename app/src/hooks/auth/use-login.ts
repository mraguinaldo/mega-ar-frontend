/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/auth/use-login.ts
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import api from "../../services/data";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  senha: z.string().min(4, { message: "Senha muito curta" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export const useLogin = () => {
  const { login } = useAuthStore();
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      const { access_token, usuario } = data;
      login(usuario, access_token);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Credenciais inválidas. Tente novamente.";
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
