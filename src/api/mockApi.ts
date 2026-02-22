import type {
  User, Tenant, Branch, DashboardStats, RevenueData,
  PatientFlowData, BranchStats, Appointment, PatientHistory,
} from '@/types';

// Simulate network delay
const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms + Math.random() * 400));

// ── Mock Data ──────────────────────────────────────────────

const MOCK_TENANT: Tenant = {
  id: 'tenant_001',
  name: 'Apollo Healthcare Group',
  slug: 'apollo-healthcare',
  plan: 'professional',
  created_at: '2024-01-15',
};

const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'owner@apollo.com': {
    password: 'password',
    user: {
      id: 'usr_001', name: 'Dr. Rajesh Kumar', email: 'owner@apollo.com',
      phone: '+1-555-0101', role: 'hospital_owner', tenant_id: 'tenant_001',
    },
  },
  'admin@apollo.com': {
    password: 'password',
    user: {
      id: 'usr_002', name: 'Sarah Johnson', email: 'admin@apollo.com',
      phone: '+1-555-0102', role: 'branch_admin', tenant_id: 'tenant_001', branch_id: 'branch_001',
    },
  },
  'doctor@apollo.com': {
    password: 'password',
    user: {
      id: 'usr_003', name: 'Dr. Emily Chen', email: 'doctor@apollo.com',
      phone: '+1-555-0103', role: 'doctor', tenant_id: 'tenant_001',
      branch_id: 'branch_001', department_id: 'dept_001',
    },
  },
  'receptionist@apollo.com': {
    password: 'password',
    user: {
      id: 'usr_004', name: 'Maria Garcia', email: 'receptionist@apollo.com',
      phone: '+1-555-0104', role: 'receptionist', tenant_id: 'tenant_001', branch_id: 'branch_001',
    },
  },
};

const MOCK_BRANCHES: Branch[] = [
  { id: 'branch_001', tenant_id: 'tenant_001', name: 'Downtown Medical Center', address: '123 Main St', city: 'New York', phone: '+1-555-1001', status: 'active', total_beds: 200, occupied_beds: 156, created_at: '2024-01-20' },
  { id: 'branch_002', tenant_id: 'tenant_001', name: 'Westside Hospital', address: '456 West Ave', city: 'New York', phone: '+1-555-1002', status: 'active', total_beds: 150, occupied_beds: 98, created_at: '2024-03-10' },
  { id: 'branch_003', tenant_id: 'tenant_001', name: 'Northgate Clinic', address: '789 North Blvd', city: 'Brooklyn', phone: '+1-555-1003', status: 'setup', total_beds: 80, occupied_beds: 0, created_at: '2025-01-05' },
];

const MOCK_OWNER_STATS: DashboardStats = {
  total_revenue: 2450000, revenue_change: 12.5,
  total_patients: 15420, patients_change: 8.3,
  total_doctors: 124, doctors_change: 3.2,
  active_admissions: 254, admissions_change: -2.1,
  bed_occupancy: 78.5, occupancy_change: 1.8,
};

const MOCK_REVENUE_DATA: RevenueData[] = [
  { month: 'Jul', revenue: 180000, patients: 1200 },
  { month: 'Aug', revenue: 195000, patients: 1350 },
  { month: 'Sep', revenue: 210000, patients: 1420 },
  { month: 'Oct', revenue: 225000, patients: 1500 },
  { month: 'Nov', revenue: 240000, patients: 1580 },
  { month: 'Dec', revenue: 220000, patients: 1450 },
  { month: 'Jan', revenue: 260000, patients: 1650 },
  { month: 'Feb', revenue: 275000, patients: 1720 },
];

const MOCK_PATIENT_FLOW: PatientFlowData[] = [
  { hour: '6AM', checkins: 5, checkouts: 2 },
  { hour: '8AM', checkins: 25, checkouts: 8 },
  { hour: '10AM', checkins: 45, checkouts: 15 },
  { hour: '12PM', checkins: 35, checkouts: 22 },
  { hour: '2PM', checkins: 40, checkouts: 30 },
  { hour: '4PM', checkins: 20, checkouts: 35 },
  { hour: '6PM', checkins: 10, checkouts: 25 },
  { hour: '8PM', checkins: 5, checkouts: 15 },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'apt_001', patient_id: 'pat_001', patient_name: 'John Smith', doctor_id: 'usr_003', doctor_name: 'Dr. Emily Chen', branch_id: 'branch_001', department: 'Cardiology', date: '2025-02-22', time: '09:00', status: 'checked_in', type: 'new' },
  { id: 'apt_002', patient_id: 'pat_002', patient_name: 'Alice Brown', doctor_id: 'usr_003', doctor_name: 'Dr. Emily Chen', branch_id: 'branch_001', department: 'Cardiology', date: '2025-02-22', time: '09:30', status: 'in_consult', type: 'follow_up' },
  { id: 'apt_003', patient_id: 'pat_003', patient_name: 'Robert Davis', doctor_id: 'usr_003', doctor_name: 'Dr. Emily Chen', branch_id: 'branch_001', department: 'Cardiology', date: '2025-02-22', time: '10:00', status: 'scheduled', type: 'new' },
  { id: 'apt_004', patient_id: 'pat_004', patient_name: 'Lisa Wilson', doctor_id: 'usr_003', doctor_name: 'Dr. Emily Chen', branch_id: 'branch_001', department: 'Cardiology', date: '2025-02-22', time: '10:30', status: 'under_testing', type: 'follow_up' },
  { id: 'apt_005', patient_id: 'pat_005', patient_name: 'James Taylor', doctor_id: 'usr_003', doctor_name: 'Dr. Emily Chen', branch_id: 'branch_001', department: 'Cardiology', date: '2025-02-22', time: '11:00', status: 'referred', type: 'new' },
  { id: 'apt_006', patient_id: 'pat_006', patient_name: 'Emma Martinez', doctor_id: 'usr_003', doctor_name: 'Dr. Emily Chen', branch_id: 'branch_001', department: 'Cardiology', date: '2025-02-22', time: '11:30', status: 'scheduled', type: 'new' },
];

const MOCK_PATIENT_HISTORY: PatientHistory[] = [
  {
    id: 'hist_001', date: '2025-01-15', branch_name: 'Downtown Medical Center', department: 'Cardiology',
    doctor_name: 'Dr. Emily Chen', diagnosis: 'Mild Hypertension',
    prescriptions: ['Amlodipine 5mg', 'Aspirin 75mg'],
    lab_reports: [{ name: 'Blood Pressure', result: '140/90 mmHg', date: '2025-01-15' }, { name: 'ECG', result: 'Normal sinus rhythm', date: '2025-01-15' }],
    billing: [{ item: 'Consultation', amount: 150 }, { item: 'ECG Test', amount: 75 }],
    notes: 'Patient advised lifestyle modifications. Follow-up in 2 weeks.',
  },
  {
    id: 'hist_002', date: '2024-11-20', branch_name: 'Westside Hospital', department: 'General Medicine',
    doctor_name: 'Dr. Michael Ross', diagnosis: 'Seasonal Flu',
    prescriptions: ['Oseltamivir 75mg', 'Paracetamol 500mg'],
    lab_reports: [{ name: 'CBC', result: 'WBC elevated', date: '2024-11-20' }],
    billing: [{ item: 'Consultation', amount: 100 }, { item: 'CBC Test', amount: 45 }],
    notes: 'Rest and hydration recommended. Symptoms should resolve in 5-7 days.',
  },
];

// ── API Functions ──────────────────────────────────────────

export const mockApi = {
  login: async (email: string, _password: string) => {
    await delay(1200);
    const entry = MOCK_USERS[email];
    if (!entry) throw new Error('Invalid credentials');
    return { user: entry.user, tenant: MOCK_TENANT, token: 'mock_jwt_' + Date.now() };
  },

  register: async (_data: Record<string, string>) => {
    await delay(1500);
    return { success: true, message: 'Registration successful. Please verify your email.' };
  },

  verifyOtp: async (_otp: string) => {
    await delay(1000);
    return { verified: true, user: MOCK_USERS['owner@apollo.com'].user, tenant: MOCK_TENANT, token: 'mock_jwt_' + Date.now() };
  },

  getOwnerDashboard: async () => {
    await delay();
    return { stats: MOCK_OWNER_STATS, revenue_data: MOCK_REVENUE_DATA, patient_flow: MOCK_PATIENT_FLOW };
  },

  getBranches: async () => {
    await delay();
    return MOCK_BRANCHES;
  },

  getBranchStats: async (_branchId: string): Promise<BranchStats> => {
    await delay();
    return {
      ...MOCK_OWNER_STATS,
      total_revenue: 850000, revenue_change: 9.2,
      total_patients: 5200, patients_change: 6.1,
      total_doctors: 42, doctors_change: 2.4,
      active_admissions: 89, admissions_change: -1.5,
      bed_occupancy: 78, occupancy_change: 2.3,
      todays_appointments: 47,
      available_beds: 44,
    };
  },

  getAppointments: async (_branchId: string) => {
    await delay();
    return MOCK_APPOINTMENTS;
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    await delay(400);
    const apt = MOCK_APPOINTMENTS.find((a) => a.id === id);
    if (apt) apt.status = status;
    return { success: true };
  },

  getPatientHistory: async (_patientId: string) => {
    await delay();
    return MOCK_PATIENT_HISTORY;
  },
};
