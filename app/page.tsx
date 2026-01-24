"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, FileText, Boxes } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  function goToLogin() {
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-wide">MEAGA AR</h1>

        <button
          onClick={goToLogin}
          className="px-5 py-2 rounded-md bg-white text-slate-900 font-medium hover:bg-slate-200 transition"
        >
          Entrar
        </button>
      </header>

      {/* Hero */}
      <section className="px-10 py-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Controle completo de{" "}
            <span className="text-blue-400">aquisições</span>,{" "}
            <span className="text-blue-400">ofícios</span> e{" "}
            <span className="text-blue-400">stock</span>
          </h2>

          <p className="mt-6 text-white/70 text-lg">
            Uma plataforma centralizada para gerir pedidos, aprovações, entradas
            e saídas de equipamentos de forma segura e organizada.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={goToLogin}
              className="px-6 py-3 rounded-md bg-blue-500 hover:bg-blue-600 transition flex items-center gap-2"
            >
              Acessar o sistema <ArrowRight size={18} />
            </button>

            <button
              onClick={goToLogin}
              className="px-6 py-3 rounded-md border border-white/20 hover:bg-white/10 transition"
            >
              Criar ofício
            </button>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-10 border border-white/10">
          <h3 className="text-xl font-semibold mb-4">O que o sistema faz?</h3>
          <ul className="space-y-4 text-white/80">
            <li>• Submissão e gestão de ofícios</li>
            <li>• Geração e aprovação de notas de aquisição</li>
            <li>• Controlo de stock em tempo real</li>
            <li>• Histórico completo de movimentos</li>
          </ul>
        </div>
      </section>

      {/* Para quem é */}
      <section className="bg-slate-900/50 py-20 px-10">
        <h3 className="text-3xl font-bold text-center mb-12">
          Quem usa o sistema?
        </h3>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <Card
            title="Cliente"
            description="Submete ofícios, acompanha o estado das solicitações e recebe respostas."
            onClick={goToLogin}
          />

          <Card
            title="Funcionário"
            description="Avalia, aprova ou rejeita notas e controla o stock."
            onClick={goToLogin}
          />

          <Card
            title="Administrador"
            description="Gere utilizadores, catálogo, pagamentos e todo o sistema."
            onClick={goToLogin}
          />
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-10 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        <Benefit
          icon={<FileText size={32} />}
          title="Processos organizados"
          text="Todos os pedidos e aprovações ficam registados e rastreáveis."
        />

        <Benefit
          icon={<Boxes size={32} />}
          title="Stock controlado"
          text="Entradas e saídas de equipamentos são registadas automaticamente."
        />

        <Benefit
          icon={<ShieldCheck size={32} />}
          title="Segurança"
          text="Acesso controlado por tipo de utilizador."
        />
      </section>

      {/* Call to Action */}
      <footer className="border-t border-white/10 py-16 text-center">
        <h4 className="text-2xl font-bold mb-6">
          Comece a usar o sistema agora
        </h4>

        <button
          onClick={goToLogin}
          className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-md text-lg font-medium transition"
        >
          Ir para Login
        </button>
      </footer>
    </div>
  );
}

function Card({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
    >
      <h4 className="text-xl font-semibold mb-3">{title}</h4>
      <p className="text-white/70">{description}</p>
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8">
      <div className="text-blue-400 mb-4">{icon}</div>
      <h5 className="text-xl font-semibold mb-2">{title}</h5>
      <p className="text-white/70">{text}</p>
    </div>
  );
}
