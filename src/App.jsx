import { Route, Routes } from 'react-router-dom';
import Start from './pages/Start';
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import UserRideHistory from './pages/UserRideHistory';
import Home from './pages/Home';
import UserProtectWrapper from './pages/UserProtectWrapper';
import UserLogout from './pages/UserLogout';
import Captainlogin from './pages/Captainlogin';
import CaptainSignup from './pages/CaptainSignup';
import CaptainHome from './pages/CaptainHome';
import CaptainProtectWrapper from './pages/CaptainProtectWrapper';
import CaptainLogout from './pages/CaptainLogout';
import CaptainRiding from './pages/CaptainRiding';
import CaptainEarnings from './pages/CaptainEarnings';
import CaptainRidesHistory from './pages/CaptainRidesHistory'
import VerifyEmailOTP from './pages/VerifyEmailOTP';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import 'remixicon/fonts/remixicon.css';
import ContactPage from './pages/ContactPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import UserTransactions from './pages/UserTransactions';
const App = () => {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/captain-login" element={<Captainlogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route path="/verify-email-otp" element={<VerifyEmailOTP />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/forgot-password" element={<ForgotPassword userType="user" />} />
<Route path="/captain-forgot-password" element={<ForgotPassword userType="captain" />} />
<Route path="/reset-password" element={<ResetPassword />} />
        {/* User Protected Routes */}
        <Route
          path="/home"
          element={
              <Home />
          }
        />
        <Route
          path="/mytransactions-all"
          element={
            <UserProtectWrapper>
              <UserTransactions />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/user/logout"
          element={
            <UserProtectWrapper>
              <UserLogout />
            </UserProtectWrapper>
          }
        />
        
        <Route
          path="/user/history"
          element={
            <UserProtectWrapper>
              <UserRideHistory />
            </UserProtectWrapper>
          }
        />

        {/* Captain Protected Routes */}
        <Route
          path="/captain-home"
          element={
            <CaptainProtectWrapper>
              <CaptainHome />
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/captain/logout"
          element={
            <CaptainProtectWrapper>
              <CaptainLogout />
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/captain-riding"
          element={
            <CaptainProtectWrapper>
              <CaptainRiding />
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/myearings"
          element={
            <CaptainProtectWrapper>
              <CaptainEarnings />
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/captainrideshistory"
          element={
            <CaptainProtectWrapper>
              <CaptainRidesHistory />
            </CaptainProtectWrapper>
          }
        />

        {/* Fallback Route for 404 and wrong requests */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
