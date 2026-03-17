import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import HomePage from './pages/Home/HomePage.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
import SignupPage from './pages/Auth/SignupPage.jsx';
import PatientLayout from './pages/Patient/PatientLayout.jsx';
import PatientDashboard from './pages/Patient/PatientDashboard.jsx';
import PatientRecords from './pages/Patient/PatientRecords.jsx';
import PatientTimeline from './pages/Patient/PatientTimeline.jsx';
import PatientShare from './pages/Patient/PatientShare.jsx';
import PatientAppointments from './pages/Patient/PatientAppointments.jsx';
import PatientProfile from './pages/Patient/PatientProfile.jsx';
import DoctorLayout from './pages/Doctor/DoctorLayout.jsx';
import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx';
import DoctorPatients from './pages/Doctor/DoctorPatients.jsx';
import DoctorRecords from './pages/Doctor/DoctorRecords.jsx';
import DoctorAppointments from './pages/Doctor/DoctorAppointments.jsx';
import DoctorProfile from './pages/Doctor/DoctorProfile.jsx';
import AdminLayout from './pages/Admin/AdminLayout.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminUsers from './pages/Admin/AdminUsers.jsx';
import AdminAudit from './pages/Admin/AdminAudit.jsx';
import AdminSystem from './pages/Admin/AdminSystem.jsx';

function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/"       element={<HomePage />} />
      <Route path="/login"  element={user ? <Navigate to={`/${user.role}`} /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={`/${user.role}`} /> : <SignupPage />} />
      <Route path="/patient" element={<Protected role="patient"><PatientLayout /></Protected>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<PatientDashboard />} />
        <Route path="records"      element={<PatientRecords />} />
        <Route path="timeline"     element={<PatientTimeline />} />
        <Route path="share"        element={<PatientShare />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="profile"      element={<PatientProfile />} />
      </Route>
      <Route path="/doctor" element={<Protected role="doctor"><DoctorLayout /></Protected>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<DoctorDashboard />} />
        <Route path="patients"     element={<DoctorPatients />} />
        <Route path="records"      element={<DoctorRecords />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="profile"      element={<DoctorProfile />} />
      </Route>
      {/* <Route path="/admin" element={<Protected role="admin"><AdminLayout /></Protected>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users"     element={<AdminUsers />} />
        <Route path="audit"     element={<AdminAudit />} />
        <Route path="system"    element={<AdminSystem />} />
      </Route> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}