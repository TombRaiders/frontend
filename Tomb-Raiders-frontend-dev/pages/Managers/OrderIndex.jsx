import React, { useState } from 'react';
import Sidebar from '../../components/Admin/Sidebar';
import { vw } from '../../utils/style';
import DeliveryFilter from '../../components/Admin/Business/DeliveryFilter';
import DeliveryTable from '../../components/Admin/Business/DeliveryTable';

function DeliveryManager() {
  // 샘플 배송 데이터
  const [data] = useState([
    {
      id: '00000000',
      status: '배송 완료',
      date: '2026-01-01-15:00:00',
      seller: '비지니스 멤 1',
      product: '사장님 피규어 만들어주세요',
      count: 1,
      price: '0,000',
      deliveryFee: '3,000',
      totalPrice: '3,000',
      paymentMethod: '토스페이',
      paymentDate: '2026-01-01-16:41:05',
      deliveryCompany: '어느 택배사1',
      readyDate: '2026-01-01-16:41:05',
      completeDate: '2026-01-01-16:41:05',
    },
  ]);

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <main
        className="flex-1 flex flex-col items-center"
        style={{ padding: `${vw(40)} ${vw(50)}` }}
      >
        <div className="w-full max-w-[1800px]">
          {' '}
          {/* 배송관리는 컬럼이 많아 너비를 넓게 잡습니다 */}
          <div className="flex justify-end mb-4 mr-4">
            <span className="text-red-500 font-bold" style={{ fontSize: vw(18) }}>
              언젠가 넣을것 엑셀 다운
            </span>
          </div>
          {/* 배송 전용 필터 */}
          <DeliveryFilter />
          {/* 배송 목록 테이블 */}
          <DeliveryTable data={data} />
        </div>
      </main>
    </div>
  );
}

export default DeliveryManager;
