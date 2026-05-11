import React from 'react';
import Sidebar from '../../components/Admin/Sidebar';
import { vw } from '../../utils/style';
import StatusCard from '../../components/Admin/Business/StatusCard';
import ManagementSection from '../../components/Admin/Business/ManagementSection';
import EmptySection from '../../components/Admin/Business/EmptySection';

function BusinessManager() {
  // 상태 변화가 없다면 상수로 관리
  const statusData = [
    { id: 's1', label: '신규견적', count: 0 },
    { id: 's2', label: '결제완료', count: 0 },
    { id: 's3', label: '작업대기', count: 0 },
    { id: 's4', label: '배송중', count: 0 },
    { id: 's5', label: '구매확정', count: 0 },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <main
        className="flex-1 flex flex-col items-center"
        style={{ padding: `${vw(40)} ${vw(50)}` }}
      >
        <div className="w-full max-w-[1400px]">
          <section
            className="bg-white rounded-[4px] shadow-sm mb-[2vw]"
            style={{ padding: vw(30) }}
          >
            <h2 className="font-bold text-black mb-10" style={{ fontSize: vw(20) }}>
              판매 관리
            </h2>
            <div className="flex justify-between items-center px-[2vw]">
              {statusData.map((item) => (
                <StatusCard key={item.id} label={item.label} count={item.count} />
              ))}
            </div>
          </section>
          <ManagementSection />
          <EmptySection />
        </div>
      </main>
    </div>
  );
}

export default BusinessManager;
