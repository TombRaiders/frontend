import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Admin/Sidebar';
import { get } from '../../api/apiClient';
import { vw } from '../../utils/style';
import OrderFilter from '../../components/Admin/Business/OrderFilter';
import OrderTable from '../../components/Admin/Business/OrderTable';

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Swagger: GET /api/v1/commissions 의뢰 목록 조회
        const response = await get('/commissions');
        setOrders(response.data);
      } catch (error) {
        console.error('의뢰 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <main
        className="flex-1 flex flex-col items-center"
        style={{ padding: `${vw(40)} ${vw(50)}` }}
      >
        <div className="w-full max-w-[1400px]">
          <h2 className="font-bold text-left mb-6" style={{ fontSize: vw(20) }}>
            의뢰 관리
          </h2>
          <OrderFilter />
          {loading ? <div className="py-10">로딩 중...</div> : <OrderTable data={orders} />}
        </div>
      </main>
    </div>
  );
}

export default OrderManager;
