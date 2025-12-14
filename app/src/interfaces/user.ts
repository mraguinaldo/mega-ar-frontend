export type Papel = "CLIENTE" | "FUNCIONARIO" | "ADMIN" | "FORNECEDOR";

export interface User {
  id: string;
  nomeCompleto: string;
  email: string;
  papel: Papel;
  contacto?: string;
  endereco?: string | null;
  activo?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
