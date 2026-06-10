import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import BoardingList from '@/pages/BoardingList';
import BoardingNew from '@/pages/BoardingNew';
import BoardingPricing from '@/pages/BoardingPricing';
import FeedingList from '@/pages/FeedingList';
import FeedingSchedule from '@/pages/FeedingSchedule';
import FeedingNew from '@/pages/FeedingNew';
import StaffList from '@/pages/StaffList';
import Salary from '@/pages/Salary';
import Pets from '@/pages/Pets';
import Customers from '@/pages/Customers';
import Settings from '@/pages/Settings';
import MembershipDiscounts from '@/pages/MembershipDiscounts';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/boarding" element={<BoardingList />} />
        <Route path="/boarding/new" element={<BoardingNew />} />
        <Route path="/boarding/pricing" element={<BoardingPricing />} />
        <Route path="/feeding" element={<FeedingList />} />
        <Route path="/feeding/new" element={<FeedingNew />} />
        <Route path="/feeding/schedule" element={<FeedingSchedule />} />
        <Route path="/staff" element={<StaffList />} />
        <Route path="/staff/salary" element={<Salary />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/membership-discounts" element={<MembershipDiscounts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
