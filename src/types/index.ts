// ============================================================
// Core types for the Hospital Management System (multi-tenant)
// ============================================================

export type UserRole = 'hospital_owner' | 'branch_admin' | 'department_admin' | 'doctor' | 'receptionist' | 'saas_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  tenant_id: string;
  branch_id?: string;
  department_id?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: 'trial' | 'starter' | 'professional' | 'enterprise';
  created_at: string;
}

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  status: 'active' | 'inactive' | 'setup';
  admin?: User;
  total_beds: number;
  occupied_beds: number;
  created_at: string;
}

export interface Department {
  id: string;
  branch_id: string;
  tenant_id: string;
  name: string;
  head?: User;
  staff_count: number;
}

export interface Patient {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group: string;
  address: string;
  emergency_contact: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  branch_id: string;
  department: string;
  date: string;
  time: string;
  status: 'scheduled' | 'checked_in' | 'in_consult' | 'referred' | 'under_testing' | 'completed' | 'cancelled';
  type: 'new' | 'follow_up';
  notes?: string;
}

export interface DashboardStats {
  total_revenue: number;
  revenue_change: number;
  total_patients: number;
  patients_change: number;
  total_doctors: number;
  doctors_change: number;
  active_admissions: number;
  admissions_change: number;
  bed_occupancy: number;
  occupancy_change: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  patients: number;
}

export interface PatientFlowData {
  hour: string;
  checkins: number;
  checkouts: number;
}

export interface BranchStats extends DashboardStats {
  todays_appointments: number;
  available_beds: number;
}

export interface PatientHistory {
  id: string;
  date: string;
  branch_name: string;
  department: string;
  doctor_name: string;
  diagnosis: string;
  prescriptions: string[];
  lab_reports: { name: string; result: string; date: string }[];
  billing: { item: string; amount: number }[];
  notes: string;
}
