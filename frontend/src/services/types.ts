// User Types
export interface User {
  id?: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

// Product Types
export interface Product {
  id?: string;
  name: string;
  price: number;
  description?: string;
  // Add other product properties as needed
}

// Auth Types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  // Add other registration fields as needed
}
