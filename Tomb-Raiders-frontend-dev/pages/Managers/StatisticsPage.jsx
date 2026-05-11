import React, { useState } from 'react';
import Sidebar from '../../components/Admin/Sidebar';
import { vw } from '../../utils/style';
import StatisticsFilter from '../../components/Admin/Business/StatisticsFilter';
import StatisticsTable from '../../components/Admin/Business/StatisticsTable';

function StatisticsPage() {
  // 샘플 정산 데이터
  const [data] = useState([
    {
      id: 'SET-001',
      date: '2026-01-01',
      seller: '아무개샵',
      totalAmount: '00,000',
      delivery: { est: '', discount: '', final: '' },
      product: { est: '', discount: '', fee: '', final: '' },
      settlementNo: '',
      status: '',
      note: '',
    },
  ]);

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <main
        className="flex-1 flex flex-col items-center"
        style={{ padding: `${vw(40)} ${vw(50)}` }}
      >
        <div className="w-full max-w-[1600px]">
          {/* 정산 내역 전용 필터 */}
          <StatisticsFilter />

          {/* 정산 내역 테이블 */}
          <StatisticsTable data={data} />
        </div>
      </main>
    </div>
  );
}

export default StatisticsPage;
