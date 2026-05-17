import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContractsPage from './pages/ContractsPage';
import OrdersPage from './pages/OrdersPage';
import POSPage from './pages/POSPage';
import ReturnsPage from './pages/ReturnsPage';
import ReportsPage from './pages/ReportsPage';
import MasterDataPage from './pages/MasterDataPage';
import SettingsPage from './pages/SettingsPage';
import GorLocationsPage from './pages/GorLocationsPage';
import CourtsPage from './pages/CourtsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/contracts" element={<PrivateRoute><ContractsPage /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
      <Route path="/pos" element={<PrivateRoute><POSPage /></PrivateRoute>} />
      <Route path="/returns" element={<PrivateRoute><ReturnsPage /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
      <Route path="/gor-locations" element={<PrivateRoute><GorLocationsPage /></PrivateRoute>} />
      <Route path="/courts" element={<PrivateRoute><CourtsPage /></PrivateRoute>} />
      <Route path="/masterdata" element={<PrivateRoute><MasterDataPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
