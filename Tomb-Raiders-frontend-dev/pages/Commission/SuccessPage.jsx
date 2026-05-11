import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          backgroundColor: '#FFF',
          padding: vw(60),
          borderRadius: vw(20),
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ fontSize: vw(60) }}>🎉</div>
        <h1 style={{ fontSize: vw(32), margin: `${vw(20)} 0` }}>의뢰 신청 완료!</h1>
        <p style={{ color: '#888', marginBottom: vw(40), fontSize: vw(18) }}>
          결제가 정상적으로 처리되었습니다.
        </p>

        <div style={{ display: 'flex', gap: vw(20), justifyContent: 'center' }}>
          <button
            onClick={() => {
              if (order) {
                navigate(`/payments/${order.id}`, { state: { order } });
              } else {
                console.error('데이터가 없어서 상세페이지로 못 가요!');
                navigate('/payments/history');
              }
            }}
            style={{
              width: vw(240),
              height: vw(60),
              backgroundColor: '#fff',
              color: '#2C9753',
              border: '1px solid #2C9753',
              borderRadius: vw(10),
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: vw(18),
            }}
          >
            주문 상세 내역 보기
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              width: vw(200),
              height: vw(60),
              backgroundColor: '#2C9753',
              color: '#FFF',
              border: 'none',
              borderRadius: vw(10),
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: vw(18),
            }}
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
