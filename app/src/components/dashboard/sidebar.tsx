"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Package,
  FileText,
  Truck,
  DollarSign,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/auth-store";

const menuItems = {
  CLIENTE: [
    { href: "/dashboard", label: "Início", icon: Home },
    {
      href: "/dashboard/minhas-solicitacoes",
      label: "Minhas Solicitações",
      icon: FileText,
    },
    {
      href: "/dashboard/solicitar",
      label: "Solicitar Equipamento",
      icon: FileText,
    },
  ],
  FUNCIONARIO: [
    { href: "/dashboard", label: "Início", icon: Home },
    {
      href: "/dashboard/notas-aquisicao",
      label: "Notas de aquisição",
      icon: FileText,
    },
    { href: "/dashboard/produtos", label: "Estoque", icon: Package },
    { href: "/dashboard/pagamentos", label: "Pagamentos", icon: DollarSign },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Início", icon: Home },
    {
      href: "/dashboard/notas-aquisicao",
      label: "Notas de aquisição",
      icon: FileText,
    },
    { href: "/dashboard/produtos", label: "Estoque", icon: Package },
    { href: "/dashboard/relatorios", label: "Relatórios", icon: DollarSign },
    { href: "/dashboard/usuarios", label: "Usuários", icon: Users },
  ],
  FORNECEDOR: [
    { href: "/dashboard", label: "Início", icon: Home },
    {
      href: "/dashboard/minhas-encomendas",
      label: "Minhas Encomendas",
      icon: Truck,
    },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = menuItems[user?.papel || "CLIENTE"];

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-100">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-100 w-72 bg-gradient-to-b from-blue-900 to-blue-950 text-white transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent w-full text-start">
            MEGA-AR
          </h1>
        </div>

        <nav className="mt-10 px-4">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? "bg-white/20 shadow-lg font-semibold"
                    : "hover:bg-white/10"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 transition-all w-full"
          >
            <LogOut size={20} />
            <span
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Sair
            </span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
