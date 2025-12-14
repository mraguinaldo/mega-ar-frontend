"use client";

import { useRegister } from "@/app/src/hooks/auth/use-register";
import Link from "next/link";

export default function RegisterPage() {
  const { form, handleSubmit, isPending } = useRegister();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      <div className="bg-white/95 backdrop-blur p-10 rounded-[6px] shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            MEGA-AR
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Sistema de Gestão de Vendas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              {...register("nomeCompleto")}
              type="text"
              className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black"
              placeholder="Insira o seu nome completo"
              disabled={isPending}
            />
            {errors.nomeCompleto && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nomeCompleto.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black"
              placeholder="Insira o seu email"
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contacto (9 dígitos)
            </label>
            <input
              {...register("contacto")}
              type="text"
              className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black"
              placeholder="Insira o seu contacto"
              disabled={isPending}
            />
            {errors.contacto && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contacto.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Senha
            </label>
            <input
              {...register("senha")}
              type="password"
              className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black"
              placeholder="Mínimo 6 caracteres"
              disabled={isPending}
            />
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">
                {errors.senha.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <input
              {...register("confirmarSenha")}
              type="password"
              className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black"
              placeholder="Digite novamente"
              disabled={isPending}
            />
            {errors.confirmarSenha && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmarSenha.message}
              </p>
            )}
          </div>

          {errors.root && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-center">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full border-none outline-none bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-[6px] font-bold text-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-70 cursor-pointer"
          >
            {isPending ? "Criando conta..." : "Registar-me"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
