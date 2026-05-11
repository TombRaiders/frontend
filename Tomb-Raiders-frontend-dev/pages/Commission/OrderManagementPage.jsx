import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderListItem from '../../components/Commission/OrderListItem';
import CreateAssetCard from '../../components/Commission/CreateAssetCard';
import { commissionapi } from '../../api/commissionapi';
import { getCookie, setCookie, getMemberId } from '../../utils/authUtils';
import CommissionHeader from '../../components/Commission/CommissionHeader';

const getVw = (size) => {
  const width = globalThis.innerWidth || 1920;
  return (size / 1920) * width;
};

function OrderManagementPage() {
  const [commissions, setCommissions] = useState([]);
  const navigate = useNavigate();
  const vw = (size) => `${getVw(size)}px`;

  const loadCommissions = async () => {
    try {
      const savedOrders = getCookie('myOrders');
      const rawLocal = Array.isArray(savedOrders) ? savedOrders : [];
      const localOrders = rawLocal.map((order) => ({
        ...order,
        id: String(order.id), // ID를 문자열로 통일 (타입 충돌 방지)
        status: order.status || 'PENDING',
      }));

      const dummyServerData = [
        {
          id: `TEMP-QUOTED-${Date.now()}`, // 👈 매번 새로운 ID 생성 (중복 방지)
          commissionId: 999,
          title: '도착한 견적서 (테스트용)',
          img: 'https://picsum.photos/id/237/200/200',
          status: 'QUOTED', // 👈 statusConfig의 'QUOTED'와 매칭
          date: new Date().toLocaleDateString(),
        },
      ];

      let serverData = [];

      try {
        // 💡 실서버 스키마에 맞게 options 객체를 매개변수로 올바르게 전달합니다.
        const result = await commissionapi.getCommissions({ page: 0, size: 100 });

        // 💡 실서버 페이지네이션 표준에 맞춰 result.data.content 혹은 result.data에서 배열을 확보합니다.
        const contentList = result?.data?.content || result?.data || [];
        const safeList = Array.isArray(contentList) ? contentList : [];

        if (safeList.length > 0) {
          serverData = safeList.map((item) => ({
            ...item,
            id: String(item.commissionId),
            title: item.title || `의뢰 건 #${item.commissionId}`,
            // 💡 표준 실서버 이미지 프로퍼티명 매핑 연동
            img:
              item.aiImageUrl ||
              item.imageUrl ||
              item.inputImageUrl ||
              'https://via.placeholder.com/150',
            status: item.status || 'PENDING',
          }));
        } else {
          // 📍 데이터가 빈 배열([])로 오면 테스트를 위해 더미 노출
          console.log('서버 데이터가 비어있어 더미를 사용합니다.');
          serverData = dummyServerData;
        }
      } catch (error) {
        console.warn('API 에러 발생 -> 더미 데이터 사용', error);
        serverData = dummyServerData;
      }
      const combined = [...localOrders, ...serverData];
      const uniqueOrders = combined.filter(
        (item, index, self) => index === self.findIndex((t) => String(t.id) === String(item.id)),
      );

      setCommissions(uniqueOrders);
    } catch (error) {
      console.error('의뢰 목록 로직 에러:', error);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, []);

  const handleDelete = async (id) => {
    if (globalThis.confirm('정말 이 의뢰를 삭제하시겠습니까?')) {
      try {
        setCommissions((prev) => prev.filter((item) => String(item.id) !== String(id)));

        const savedOrders = getCookie('myOrders');
        const ordersArray = Array.isArray(savedOrders) ? savedOrders : [];
        const updatedOrders = ordersArray.filter((order) => String(order.id) !== String(id));
        setCookie('myOrders', updatedOrders);

        alert('삭제되었습니다.');
      } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const containerStyle = {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    paddingBottom: vw(100),
  };

  const contentWrapper = {
    maxWidth: vw(800),
    margin: `${vw(110)} auto 0`,
    display: 'flex',
    flexDirection: 'column',
  };

  const createCardWrapperStyle = {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    marginBottom: vw(20),
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      <CommissionHeader title="의뢰 관리" />

      <div style={contentWrapper}>
        <button onClick={() => navigate('/commission')} style={createCardWrapperStyle}>
          <CreateAssetCard vw={vw} />
        </button>
        <h3
          style={{
            fontSize: vw(28),
            fontWeight: 'bold',
            marginBottom: vw(30),
            textAlign: 'left',
          }}
        >
          의뢰 내역
        </h3>
        {commissions.map((item) => (
          <OrderListItem
            key={item.id}
            item={item}
            vw={vw}
            onDelete={handleDelete}
            onDetail={() => navigate(`/payments/${item.id}`, { state: { order: item } })}
            onQuoteCheck={() => navigate(`/estimate-detail`, { state: { order: item } })}
            onOrderSubmit={() =>
              navigate(`/payments/${item.id}`, {
                state: { order: item, autoOpenOrder: true },
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

export default OrderManagementPage;
