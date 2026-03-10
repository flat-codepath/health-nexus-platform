import apiClient from './interceptors';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  meta?: { timestamp: string; requestId: string };
  errors?: Record<string, string[]>;
}

export interface PatientSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  mrn: string;
  gender: string;
}

export interface DoctorData {
  id: string;
  first_name: string;
  last_name: string;
  department_id: string;
}

export interface WalkInPayload {
  patient_id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  doctor_id: string;
  department_id: string;
  visit_type: 'fresh' | 'follow_up';
  chief_complaint: string;
  address?: string;
}

export interface WalkInResponse {
  id: string;
  patient_name: string;
  status: string;
  visit_type: string;
  invoice_id: string;
  invoice_status: string;
}

export interface VisitRecord {
  id: string;
  patient_name: string;
  phone: string;
  department: string;
  doctor: string;
  visit_type: 'fresh' | 'follow_up';
  chief_complaint: string;
  status: string;
  created_at: string;
}

export const clinicalApi = {
  searchPatients: async (query: string): Promise<ApiResponse<PatientSearchResult[]>> => {
    const response = await apiClient.get<ApiResponse<PatientSearchResult[]>>('/clinical/patients/', {
      params: { search: query },
    });
    return response.data;
  },

  getDoctorsByDepartment: async (departmentId: string): Promise<ApiResponse<DoctorData[]>> => {
    const response = await apiClient.get<ApiResponse<DoctorData[]>>(`/organization/departments/${departmentId}/doctors`);
    return response.data;
  },

  getDoctors: async (): Promise<ApiResponse<DoctorData[]>> => {
    const response = await apiClient.get<ApiResponse<DoctorData[]>>('/organization/doctors/');
    return response.data;
  },

  createWalkIn: async (data: WalkInPayload): Promise<ApiResponse<WalkInResponse>> => {
    const response = await apiClient.post<ApiResponse<WalkInResponse>>('/clinical/visits/walk-in/', data);
    return response.data;
  },

  getVisits: async (params: Record<string, string>): Promise<ApiResponse<VisitRecord[]>> => {
    const response = await apiClient.get<ApiResponse<VisitRecord[]>>('/clinical/visit/', { params });
    return response.data;
  },
};
