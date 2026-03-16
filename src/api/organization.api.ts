import apiClient from './interceptors';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  meta?: { timestamp: string; requestId: string };
  errors?: Record<string, string[]>;
}

export interface BranchPayload {
  name: string;
  address: string;
  city: string;
  phone: string;
  total_beds: number;
}

export interface BranchData {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  status: 'active' | 'inactive' | 'setup';
  total_beds: number;
  created_at: string;
}

export interface DepartmentData {
  id: string;
  name: string;
  branch_id: string;
  branch_name?: string;
}

export interface InviteStaffPayload {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  branch: string;
  department: string;
}

export const organizationApi = {
  getBranches: async (): Promise<ApiResponse<BranchData[]>> => {
    const response = await apiClient.get<ApiResponse<BranchData[]>>('/organization/branches/');
    return response.data;
  },

  createBranch: async (data: BranchPayload): Promise<ApiResponse<BranchData>> => {
    const response = await apiClient.post<ApiResponse<BranchData>>('/organization/branches/', data);
    return response.data;
  },

  getDepartments: async (): Promise<ApiResponse<DepartmentData[]>> => {
    const response = await apiClient.get<ApiResponse<DepartmentData[]>>('/organization/departments/');
    return response.data;
  },

  getBranchDepartments: async (branchId: string): Promise<ApiResponse<DepartmentData[]>> => {
    const response = await apiClient.get<ApiResponse<DepartmentData[]>>(`/organization/branches/${branchId}/departments`);
    return response.data;
  },

  inviteStaff: async (data: InviteStaffPayload): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>('/organization/staff/invite/', data);
    return response.data;
  },
};
