import React, { useState } from 'react'; // useState 추가
import { useNavigate } from 'react-router-dom';
import { vw } from '../../utils/style';
import EditTopNav from '../../components/Member/MemberEdit/EditTopNav';
import EditSidebar from '../../components/Member/MemberEdit/EditSidebar';
import ShippingContent from '../../components/Member/MemberShippingMg/ShippingContent';

function ShippingManagementPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#F7F7F7',
      }}
    >
      <EditTopNav vw={vw} onBack={() => navigate('/Member')} />

      <div
        style={{
          position: 'absolute',
          left: vw(535),
          top: vw(120),
          display: 'flex',
          gap: vw(20),
          alignItems: 'flex-start',
        }}
      >
        <EditSidebar vw={vw} activeMenu="배송지관리" />

        <div
          data-testid="content-box"
          style={{
            width: vw(600),
            minHeight: vw(480),
            background: '#ffffff',
            border: `${vw(1)} solid #B4B4B4`,
            borderRadius: vw(12),
            padding: `${vw(30)} ${vw(40)}`,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ShippingContent addresses={addresses} setAddresses={setAddresses} />
        </div>
      </div>
    </div>
  );
}

export default ShippingManagementPage;
