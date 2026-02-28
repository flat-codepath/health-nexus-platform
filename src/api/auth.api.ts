import apiClient from './interceptors';

interface RegisterRequest {
  hospital_name: string;
  owner_first_name: string;
  owner_last_name: string;
  email: string;
  phone: string;
  password: string;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  meta?: { timestamp: string; requestId: string };
  errors?: Record<string, string[]>;
}

export const authApi = {
  register: async (data: {
    hospital_name: string;
    owner_name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<ApiResponse<{ email: string }>> => {
    const payload: RegisterRequest = {
      hospital_name: data.hospital_name,
      owner_first_name: data.owner_name,
      owner_last_name: 'last name',
      email: data.email,
      phone: data.phone,
      password: data.password,
    };

    const response = await apiClient.post<ApiResponse<{ email: string }>>(
      '/auth/register/request-otp/',
      payload
    );
    return response.data;
  },
};
