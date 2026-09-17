export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface LoginCredentials {
  name: string;
  password: string;
  guard?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
