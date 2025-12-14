/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Papel, User } from "@/app/src/interfaces/user";
import api from "@/app/src/services/data";

interface ModalProps {
  user: User | null;
  onClose: () => void;
  onSave?: (data: Partial<User>) => void;
  onDelete?: (id: string) => void;
}

interface ModalProps {
  user: User | null;
  onClose: () => void;
  onSave?: (data: Partial<User>) => void;
}

const papeis: Papel[] = ["CLIENTE", "FUNCIONARIO", "ADMIN", "FORNECEDOR"];

export function UpdateModal({ user, onClose, onSave }: ModalProps) {
  const [nome, setNome] = useState(user?.nomeCompleto || "");
  const [email, setEmail] = useState(user?.email || "");
  const [papel, setPapel] = useState<Papel>(user?.papel || "CLIENTE");
  const [contacto, setContacto] = useState(user?.contacto || "");
  const [endereco, setEndereco] = useState(user?.endereco || "");
  const [activo, setActivo] = useState(user?.activo ?? true);

  useEffect(() => {
    if (user) {
      setNome(user.nomeCompleto);
      setEmail(user.email);
      setPapel(user.papel);
      setContacto(user.contacto || "");
      setEndereco(user.endereco || "");
      setActivo(user.activo ?? true);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    await onSave?.({
      nomeCompleto: nome,
      papel,
      contacto,
      endereco,
      activo,
    });
    onClose();
  };

  if (!user) return null;

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-lg p-4 flex flex-col pt-24">
      <h2 className="text-xl font-bold mb-4">Atualizar Usuário</h2>

      <label className="block mb-2">
        Nome
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </label>

      <label className="block mb-2">
        Email (não editável)
        <input
          type="email"
          value={email}
          disabled
          className="border p-2 rounded w-full bg-gray-100"
        />
      </label>

      <label className="block mb-2">
        Papel
        <select
          value={papel}
          onChange={(e) => setPapel(e.target.value as Papel)}
          className="border p-2 rounded w-full"
        >
          {papeis.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Contacto
        <input
          type="text"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </label>

      <label className="block mb-2">
        Endereço
        <input
          type="text"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </label>

      <label className="block mb-4">
        Ativo
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => setActivo(e.target.checked)}
          className="ml-2"
        />
      </label>

      <div className="mt-auto flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Salvar
        </button>
        <button
          onClick={onClose}
          className="bg-gray-300 text-black px-4 py-2 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ user, onClose, onDelete }: ModalProps) {
  if (!user) return null;

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Tem certeza que deseja deletar o usuário ${user.nomeCompleto}? Esta ação não pode ser desfeita.`
    );
    if (confirmed) {
      onDelete?.(user.id);
      onClose();
    }
  };

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-lg p-4 flex flex-col pt-24">
      <h2 className="text-xl font-bold mb-4 text-red-600">Deletar Usuário</h2>
      <p className="mb-4">
        Você está prestes a deletar o usuário{" "}
        <strong>{user.nomeCompleto}</strong>.
      </p>
      <div className="mt-auto flex gap-2">
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Deletar
        </button>
        <button
          onClick={onClose}
          className="bg-gray-300 text-black px-4 py-2 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<"update" | "delete" | null>(null);

  const fetchUsuarios = async () => {
    try {
      const res = await api.get("/usuario");
      setUsuarios(res.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const handleUpdate = async (data: Partial<User>) => {
    if (!selectedUser) return;
    try {
      await api.patch(`/usuario/${selectedUser.id}`, data);
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/usuario/${id}`);
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Nome</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Papel</th>
            <th className="border px-2 py-1">Contacto</th>
            <th className="border px-2 py-1">Endereço</th>
            <th className="border px-2 py-1">Ativo</th>
            <th className="border px-2 py-1">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{user.nomeCompleto}</td>
              <td className="border px-2 py-1">{user.email}</td>
              <td className="border px-2 py-1">{user.papel}</td>
              <td className="border px-2 py-1">{user.contacto || "-"}</td>
              <td className="border px-2 py-1">{user.endereco || "-"}</td>
              <td className="border px-2 py-1">
                {user.activo ? "Sim" : "Não"}
              </td>
              <td className="border px-2 py-1 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setModalType("update");
                  }}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Atualizar
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setModalType("delete");
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalType === "update" && selectedUser && (
        <UpdateModal
          user={selectedUser}
          onClose={() => setModalType(null)}
          onSave={handleUpdate}
        />
      )}

      {modalType === "delete" && selectedUser && (
        <DeleteModal
          user={selectedUser}
          onClose={() => setModalType(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
