"use client";

import { useLogin } from "@/app/src/hooks/auth/use-login";
import Link from "next/link";

export default function LoginPage() {
  const { form, handleSubmit } = useLogin();
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
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-5 py-4 rounded-[6px] border-2 border-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition outline-none text-black"
              placeholder="Insira o seu email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
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
              placeholder="Insira a sua senha"
            />
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">
                {errors.senha.message}
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
            className="w-full border-none outline-none bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-[6px] font-bold text-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-70 cursor-pointer"
          >
            Acessar Sistema
          </button>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              <Link
                href="/register"
                className="text-blue-600 font-bold hover:underline"
              >
                Criar uma conta
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
