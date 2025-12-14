/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import Cookies from "js-cookie";
import { User } from "../interfaces/user";
import api from "../services/data";

interface AuthState {
  user: User | null;
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user: User, token: string) => {
    Cookies.set("token", token, {
      expires: 7,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    Cookies.set("userId", user?.id, {
      expires: 7,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    set({
      user,
      token,
      userId: user?.id,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("userId", { path: "/" });

    set({
      user: null,
      token: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeAuth: async () => {
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");

    if (!token || !userId) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      set({ isLoading: true });

      const res = await api.get(`/usuario/${userId}`);
      const userData: User = res.data;

      set({
        user: userData,
        token,
        userId,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Sessão inválida ou expirada", error);
      get().logout();
    }
  },

  fetchUser: async () => {
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");

    if (!token || !userId) {
      get().logout();
      return;
    }

    try {
      set({ isLoading: true });
      const res = await api.get(`/usuario/${userId}`);
      const updatedUser: User = res.data;

      set({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário", error);
      get().logout();
    }
  },
}));
