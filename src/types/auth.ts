export interface User {
  id: number;
  name: string | { ar?: string; en?: string } | any;
  email?: string;
  user_name?: string;
  address?: string;
  role?: string;
  avatar?: string;
}

export interface LoginCredentials {
  name: string;
  password: string;
  guard?: 'branch' | 'cashier_man' | 'admin' | string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
