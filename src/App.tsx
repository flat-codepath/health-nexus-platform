import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import OwnerDashboard from "./pages/dashboard/OwnerDashboard";
import BranchDashboard from "./pages/dashboard/BranchDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import ReceptionDashboard from "./pages/dashboard/ReceptionDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AcceptInvitePage from "./pages/auth/AcceptInvitePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/api/auth/staff/accept-invite/:uid/:token" element={<AcceptInvitePage />} />

          {/* Protected Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="owner" element={<ProtectedRoute allowedRoles={['hospital_owner']}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="branch" element={<ProtectedRoute allowedRoles={['branch_admin']}><BranchDashboard /></ProtectedRoute>} />
            <Route path="doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="reception" element={<ProtectedRoute allowedRoles={['receptionist', 'branch_admin']}><ReceptionDashboard /></ProtectedRoute>} />
            {/* Placeholder routes for sidebar links */}
            <Route path="branches" element={<ProtectedRoute allowedRoles={['hospital_owner']}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="staff" element={<ProtectedRoute allowedRoles={['hospital_owner', 'branch_admin']}><BranchDashboard /></ProtectedRoute>} />
            <Route path="appointments" element={<ProtectedRoute allowedRoles={['branch_admin', 'doctor', 'receptionist']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="patients" element={<ProtectedRoute allowedRoles={['hospital_owner', 'branch_admin', 'doctor', 'receptionist']}><ReceptionDashboard /></ProtectedRoute>} />
            <Route path="beds" element={<ProtectedRoute allowedRoles={['branch_admin']}><BranchDashboard /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['hospital_owner', 'branch_admin']}><div className="text-muted-foreground">Settings page coming soon...</div></ProtectedRoute>} />
            <Route index element={<Navigate to="owner" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
