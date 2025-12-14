/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Search, Package, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import api from "@/app/src/services/data";

interface Equipamento {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  preco: number;
  stockAtual: number;
  categoria: string;
  imagem?: string;
}

export default function CatalogoPage() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todos");

  const { data: equipamentos = [], isLoading } = useQuery<Equipamento[]>({
    queryKey: ["catalogo"],
    queryFn: async () => {
      const res = await api.get("/catalogo");
      return res.data;
    },
  });

  const filtered = equipamentos.filter((eq) => {
    const matchSearch =
      eq.nome.toLowerCase().includes(search.toLowerCase()) ||
      eq.marca.toLowerCase().includes(search.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(search.toLowerCase());
    const matchCategoria = categoria === "todos" || eq.categoria === categoria;
    return matchSearch && matchCategoria;
  });

  const categorias = Array.from(new Set(equipamentos.map((e) => e.categoria)));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">
          Catálogo de Equipamentos
        </h1>
        <p className="text-gray-600 mt-2">
          Explore todos os produtos disponíveis
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input
            placeholder="Buscar por nome, marca ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="mr-2" size={16} />
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="bg-gray-200 h-48 rounded-lg" />
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((equipamento) => (
          <Card
            key={equipamento.id}
            className="hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
          >
            <CardHeader className="p-0">
              <div className="bg-gray-200 border-2 border-dashed rounded-t-lg w-full h-48 flex items-center justify-center group-hover:bg-gray-300 transition">
                {equipamento.imagem ? (
                  <img
                    src={equipamento.imagem}
                    alt={equipamento.nome}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <Package size={64} className="text-gray-400" />
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardTitle className="text-lg line-clamp-1">
                {equipamento.nome}
              </CardTitle>
              <CardDescription className="text-sm">
                {equipamento.marca} • {equipamento.modelo}
              </CardDescription>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                    }).format(equipamento.preco)}
                  </p>
                  <Badge
                    variant={
                      equipamento.stockAtual > 10
                        ? "default"
                        : equipamento.stockAtual > 0
                        ? "secondary"
                        : "destructive"
                    }
                    className="mt-2"
                  >
                    {equipamento.stockAtual > 0
                      ? `${equipamento.stockAtual} em stock`
                      : "Esgotado"}
                  </Badge>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                disabled={equipamento.stockAtual === 0}
              >
                Solicitar Orçamento
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600">Nenhum equipamento encontrado</p>
          <p className="text-gray-500">Tente ajustar os filtros ou a busca</p>
        </div>
      )}
    </div>
  );
}
