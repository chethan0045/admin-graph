const AUTH_KEY = 'adminGraphs.auth';
const LM_ENV = import.meta.env.VITE_LM_ENV || 'QA';

export type Mode = 'user' | 'super-admin';

export interface CustomerSession {
  customerId: number;
  name: string;
  token: string;
}

export interface AuthState {
  mode: Mode;
  email?: string;
  token?: string;
  demo?: boolean;
  sessions: CustomerSession[];
  activeCustomerId: number | null;
}

export const loadAuth = (): AuthState | null => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
};

export const saveAuth = (state: AuthState | null) => {
  if (state) localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  else localStorage.removeItem(AUTH_KEY);
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  authorization?: string;
  env?: boolean;
}

async function request<T>(url: string, { method = 'POST', body, authorization, env }: RequestOptions = {}): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
      ...(env ? { env: LM_ENV } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.message || `Request failed (${response.status})`, response.status);
  return data as T;
}

export interface EmailVerifyResponse {
  token: string;
  companies?: { id: number; companyName: string }[];
}

export interface LoginResponse {
  userId: number;
  customerId: number;
  accessToken: string;
  refreshToken: string;
}

export interface Customer {
  id: number;
  companyName?: string;
  cust_name?: string;
}

export const customerName = (customer: Customer) => customer.cust_name || customer.companyName || `Customer ${customer.id}`;

export const verifyEmail = (email: string) =>
  request<EmailVerifyResponse>('/pm/auth/email', { body: { email, type: 'web' } });

export const login = (email: string, password: string, companyName: string | undefined, token: string) =>
  request<LoginResponse>('/pm/auth/login', { body: { email, password, companyName, type: 'web' }, authorization: token });

export const getOwnCustomer = (token: string) =>
  request<Customer>('/pm/customer/0', { method: 'GET', authorization: `Bearer ${token}` });

export const verifySuperAdminEmail = (email: string) =>
  request<{ token: string }>('/lm/auth/email', { body: { email } });

export const superAdminLogin = (email: string, password: string, token: string) =>
  request<{ accessToken: string }>('/lm/auth/login', { body: { email, password }, authorization: `Bearer ${token}` });

export const listCustomers = (token: string) =>
  request<Customer[]>('/lm/customer', { method: 'GET', authorization: `Bearer ${token}`, env: true });

export const adminGraph = async <T>(graph: string, payload: object, token: string): Promise<T> => {
  const data = await request<{ success: boolean; data: T }>(`/dashboard/admin/${graph}`, { body: payload, authorization: `Bearer ${token}` });
  return data.data;
};
