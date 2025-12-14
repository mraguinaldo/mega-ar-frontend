"use client";

import { LogOut } from "lucide-react";
import { useAuthStore } from "../../store/auth-store";
import { User } from "../../interfaces/user";
import { useRouter } from "next/navigation";

export default function Header({ user }: { user: User }) {
  const { logout } = useAuthStore();
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed left-0 top-0 w-full z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="pl-14 lg:pl-72">
          <h2 className="text-2xl font-bold text-gray-800">
            Bem-vindo, {user?.nomeCompleto.split(" ")[0]}
          </h2>
          <p className="text-sm text-gray-600">
            {user?.papel === "CLIENTE" && "Cliente"}
            {user?.papel === "FUNCIONARIO" && "Funcionário"}
            {user?.papel === "ADMIN" && "Administrador"}
            {user?.papel === "FORNECEDOR" && "Fornecedor"}
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </header>
  );
}
