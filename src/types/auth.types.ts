export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: TokenResponse;
}
