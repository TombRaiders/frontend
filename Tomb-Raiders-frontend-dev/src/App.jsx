import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';

import CommissionPage from './pages/Commission/CommissionPage';
import OrderManagementPage from './pages/Commission/OrderManagementPage';
import CommissionDetail from './pages/Commission/CheckCommissionDetailPage.jsx';
import CommissionListPage from './pages/Commission/CheckCommissionPage.jsx';
import CheckAssetPage from './pages/Asset/CheckAssetPage.jsx';
import HomePage from './pages/Home/HomePage';
import SignupPage from './pages/Signup/SignupPage';
import CheckEmailPage from './pages/Signup/WaitingPage.jsx';
import LoginPage from './pages/Login/LoginPage';
import PasswordChangePage from './pages/Password/PasswordChangePage';

import PaymentPage from './pages/Payment/PaymentPage';
import PaymentSuccessPage from './pages/Payment/PaymentSuccessPage';
import PaymentFailPage from './pages/Payment/PaymentFailPage';

import MemberPage from './pages/Member/MemberPage';
import EditProfilePage from './pages/Member/EditProfilePage';
import ShippingManagementPage from './pages/Member/ShippingManagementPage';
import BulletinBoard from './pages/BulletinBoard/BulletinBoard';
import ImageResultPage from './pages/Commission/ImageResultPage';
import SuccessPage from './pages/Commission/SuccessPage';
import OrderDetailPage from './pages/Payment/OrderDetailPage';
import EstimateDetailPage from './pages/Commission/EstimateDetailPage';
import OrderListPage from './pages/OrderList/OrderListPage';

import PartnerRequestPage from './pages/partner/PartnerRequestPage';
import PartnerAcceptedPage from './pages/partner/PartnerAcceptedPage';

import AdminPage from './pages/Admin/AdminPage';
import BusinessManager from './pages/Managers/BusinessManager';
import OrderManager from './pages/Managers/OrderManager';
import BusinessMember from './pages/Managers/BusinessMember';
import OrderIndex from './pages/Managers/OrderIndex';
import StatisticsPage from './pages/Managers/StatisticsPage';
import ReportManagerPage from './pages/Managers/ReportManagerPage';

import GuidePage from './pages/Guide/GuidePage';
import OrderPrintingPage from './pages/OrderPrinting/OrderPrintingPage'; // 💡 신규 임포트

import CustomAlertModal from './components/Common/CustomAlertModal';

import { useRouterFunctions } from './router.js';
import { getUserRoleFromToken, getToken, getLoginId } from './utils/authUtils.js';
import { get } from './api/apiClient';
import { extractCurrentUserProfile, saveCurrentUserProfile } from './utils/currentUserProfile';

function HomeWithRouter() {
  const {
    goToSignup,
    goToLogin,
    goToCommission,
    goToCommissionCheck,
    goToMember,
    goToBulletinBoard,
    goToAdmin,
    goToPartner,
    goToGuide,
    goToOrderPrinting, // 💡 props 전달용 추출
  } = useRouterFunctions();
  return (
    <HomePage
      goToSignup={goToSignup}
      goToLogin={goToLogin}
      goToCommission={goToCommission}
      goToCommissionCheck={goToCommissionCheck}
      goToMember={goToMember}
      goToBulletinBoard={goToBulletinBoard}
      goToAdmin={goToAdmin}
      goToPartner={goToPartner}
      goToGuide={goToGuide}
      goToOrderPrinting={goToOrderPrinting} // 💡 하위 컴포넌트로 전달
    />
  );
}

function GuideWithRouter() {
  const {
    goToSignup,
    goToLogin,
    goToCommissionCheck,
    goToMember,
    goToBulletinBoard,
    goToAdmin,
    goToPartner,
    goToGuide,
  } = useRouterFunctions();

  return (
    <GuidePage
      goToSignup={goToSignup}
      goToLogin={goToLogin}
      goToCommissionCheck={goToCommissionCheck}
      goToMember={goToMember}
      goToBulletinBoard={goToBulletinBoard}
      goToAdmin={goToAdmin}
      goToPartner={goToPartner}
      goToGuide={goToGuide}
    />
  );
}

// 💡 신규 페이지 래퍼 구성
function OrderPrintingWithRouter() {
  const routerFuncs = useRouterFunctions();
  return <OrderPrintingPage {...routerFuncs} />;
}

function LegacyCommissionResultRedirect() {
  const location = useLocation();
  const commissionId = location.state?.item?.id;

  if (!commissionId) {
    return <Navigate to="/commissions" replace />;
  }

  return <Navigate to={`/commissions/result/${commissionId}`} replace state={location.state} />;
}

function LegacyEstimateDetailRedirect() {
  const location = useLocation();
  const orderId = location.state?.order?.orderId ?? location.state?.order?.id;

  if (!orderId) {
    return <Navigate to="/orders/manage" replace />;
  }

  return <Navigate to={`/orders/estimate-detail/${orderId}`} replace state={location.state} />;
}

function LegacyOrderDetailRedirect() {
  const location = useLocation();
  const orderId = location.state?.order?.orderId ?? location.state?.order?.id;

  if (!orderId) {
    return <Navigate to="/payments/history" replace />;
  }

  return <Navigate to={`/payments/${orderId}`} replace state={location.state} />;
}

function LegacyCommissionDetailRedirect() {
  const { commissionId } = useParams();
  return <Navigate to={`/commissions/check/${commissionId}`} replace />;
}

function LegacyOrderDetailParamRedirect() {
  const { id } = useParams();
  const location = useLocation();
  return <Navigate to={`/payments/${id}`} replace state={location.state} />;
}

function ProtectedRouteWrapper({ isAllowed, fallbackPath, alertIcon, alertTitle, alertMessage }) {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(!isAllowed);

  if (isAllowed) return <Outlet />;

  return (
    <CustomAlertModal
      isOpen={showAlert}
      onClose={() => {
        setShowAlert(false);
        navigate(fallbackPath, { replace: true });
      }}
      icon={alertIcon}
      title={alertTitle}
      description={alertMessage}
      leftBtnText="확인"
    />
  );
}

ProtectedRouteWrapper.propTypes = {
  isAllowed: PropTypes.bool.isRequired,
  fallbackPath: PropTypes.string.isRequired,
  alertIcon: PropTypes.string.isRequired,
  alertTitle: PropTypes.string.isRequired,
  alertMessage: PropTypes.string.isRequired,
};

function AuthProtectedRoute() {
  const token = getToken();
  const isAllowed = token && token !== 'null' && token !== 'undefined';
  return (
    <ProtectedRouteWrapper
      isAllowed={isAllowed}
      fallbackPath="/login"
      alertIcon="🔒"
      alertTitle="로그인 필요"
      alertMessage="로그인이 필요한 서비스입니다."
    />
  );
}

function AdminProtectedRoute() {
  const userRole = getUserRoleFromToken();
  const isAllowed = userRole === 'ADMIN' || userRole === 'BULLETINBOARD_ADMIN';
  return (
    <ProtectedRouteWrapper
      isAllowed={isAllowed}
      fallbackPath="/"
      alertIcon="🚫"
      alertTitle="접근 권한 없음"
      alertMessage="관리자 권한이 필요한 페이지입니다."
    />
  );
}

function PartnerProtectedRoute() {
  const userRole = getUserRoleFromToken();
  const isAllowed = userRole === 'PARTNER' || userRole === 'ADMIN';
  return (
    <ProtectedRouteWrapper
      isAllowed={isAllowed}
      fallbackPath="/"
      alertIcon="🤝"
      alertTitle="파트너 전용"
      alertMessage="파트너 권한이 필요한 페이지입니다."
    />
  );
}

function App() {
  const [user, setUser] = useState({
    email: getLoginId() || '',
    nickname: Cookies.get('nickname') || '',
    introduce: '',
    profileImageUrl: '',
  });
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchMyProfile = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const response = await get('/v1/member/me');
        if (response.data?.isSuccess) {
          const myInfo = response.data.data || {};
          const { email, introduce } = myInfo;
          const currentProfile = extractCurrentUserProfile(myInfo);
          setUser({
            email: email || getLoginId(),
            nickname: currentProfile.nickname || Cookies.get('nickname') || '',
            introduce: introduce || '',
            profileImageUrl: currentProfile.profileImageUrl,
          });
          saveCurrentUserProfile(currentProfile);
          if (currentProfile.nickname)
            Cookies.set('nickname', currentProfile.nickname, { path: '/' });
        }
      } catch (error) {
        console.error('내 정보 불러오기 실패:', error);
      }
    };
    fetchMyProfile();
  }, []);

  return (
    <Router>
      <div style={{ minHeight: '100vh', textAlign: 'center' }}>
        <Routes>
          <Route path="/" element={<HomeWithRouter />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/bulletinboard" element={<BulletinBoard />} />
          <Route path="/password-reset" element={<PasswordChangePage />} />

          <Route path="/guide" element={<GuideWithRouter />} />

          {/* 💡 신규: 출력 의뢰 페이지 등록 */}
          <Route path="/order-printing" element={<OrderPrintingWithRouter />} />

          <Route element={<AuthProtectedRoute />}>
            <Route path="/commissions" element={<CommissionListPage />} />
            <Route path="/asset" element={<CheckAssetPage />} />
            <Route path="/commissions/new" element={<CommissionPage />} />
            <Route path="/commissions/check/:commissionId" element={<CommissionDetail />} />
            <Route path="/commissions/result/:commissionId" element={<ImageResultPage />} />

            <Route path="/orders/manage" element={<OrderManagementPage />} />
            <Route path="/payments/history" element={<OrderListPage />} />
            <Route path="/payments/:id" element={<OrderDetailPage />} />
            <Route path="/orders/estimate-detail" element={<EstimateDetailPage />} />
            <Route path="/orders/estimate-detail/:orderId" element={<EstimateDetailPage />} />

            <Route path="/commission" element={<Navigate to="/commissions/new" replace />} />
            <Route path="/check" element={<Navigate to="/orders/manage" replace />} />
            <Route path="/check/:commissionId" element={<LegacyCommissionDetailRedirect />} />
            <Route path="/result" element={<LegacyCommissionResultRedirect />} />
            <Route path="/orders/history" element={<Navigate to="/payments/history" replace />} />
            <Route path="/orders/:id" element={<LegacyOrderDetailParamRedirect />} />
            <Route path="/order-list" element={<Navigate to="/payments/history" replace />} />
            <Route path="/order-detail" element={<LegacyOrderDetailRedirect />} />
            <Route path="/order-detail/:id" element={<LegacyOrderDetailParamRedirect />} />
            <Route path="/estimate-detail" element={<LegacyEstimateDetailRedirect />} />

            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-fail" element={<PaymentFailPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/order/:orderId/payment" element={<PaymentPage />} />
            <Route path="/order/:orderId/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/order/:orderId/payment/fail" element={<PaymentFailPage />} />

            <Route path="/member" element={<MemberPage user={user} setUser={setUser} />} />
            <Route
              path="/member/edit"
              element={<EditProfilePage user={user} setUser={setUser} />}
            />
            <Route
              path="/member/address"
              element={<ShippingManagementPage addresses={addresses} setAddresses={setAddresses} />}
            />

            <Route element={<PartnerProtectedRoute />}>
              <Route path="/partner/request" element={<PartnerRequestPage />} />
              <Route path="/partner/accepted" element={<PartnerAcceptedPage />} />
            </Route>

            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/business" element={<BusinessManager />} />
              <Route path="/admin/order" element={<OrderManager />} />
              <Route path="/admin/member" element={<BusinessMember />} />
              <Route path="/admin/order-index" element={<OrderIndex />} />
              <Route path="/admin/statistics" element={<StatisticsPage />} />
              <Route path="/admin/reports" element={<ReportManagerPage />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
