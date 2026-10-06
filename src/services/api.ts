const TOKEN_KEY = 'adminGraphs.accessToken';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function post<T>(url: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
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

export const verifyEmail = (email: string) =>
  post<EmailVerifyResponse>('/pm/auth/email', { email, type: 'web' });

export const login = (email: string, password: string, companyName: string | undefined, token: string) =>
  post<LoginResponse>('/pm/auth/login', { email, password, companyName, type: 'web' }, { Authorization: token });

export const adminGraph = async <T>(graph: string, payload: object): Promise<T> => {
  const token = getToken();
  const data = await post<{ success: boolean; data: T }>(`/dashboard/admin/${graph}`, payload, token ? { Authorization: `Bearer ${token}` } : {});
  return data.data;
};
