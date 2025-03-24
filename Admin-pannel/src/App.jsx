import { Route, Routes } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard.jsx';
import Users from './pages/admin/Users';
import Captains from './pages/admin/Captains';
import RideManagement from './pages/admin/RideManagement';
import Payments from './pages/admin/Payments';
import AdminProtectWrapper from './pages/admin/AdminProtectWrapper';
import NotFoundPage from './pages/NotFoundPage';
import 'remixicon/fonts/remixicon.css';
const App = () => {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/admin/login" element={<AdminLogin />} /> 
        
        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectWrapper>
              <Dashboard />
            </AdminProtectWrapper>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectWrapper>
              <Users />
            </AdminProtectWrapper>
          }
        />
        <Route
          path="/admin/captains"
          element={
            <AdminProtectWrapper>
              <Captains />
            </AdminProtectWrapper>
          }
        />
        <Route
          path="/admin/rides"
          element={
            <AdminProtectWrapper>
              <RideManagement />
            </AdminProtectWrapper>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminProtectWrapper>
              <Payments />
            </AdminProtectWrapper>
          }
        />
        
        {/* Fallback Route for 404 and wrong requests */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
