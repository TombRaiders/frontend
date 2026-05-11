import React from 'react';
import { render, screen } from '@testing-library/react';
import EstimateDetailCard from './EstimateDetailCard';

describe('EstimateDetailCard 컴포넌트 테스트', () => {
  const mockCommissionId = 'COMM-12345';

  const mockData = {
    img: 'test-image.jpg',
    title: '멋진 피규어 의뢰',
    style: '실사',
    qty: 2,
    price: 50000,
  };

  test('데이터가 없을 때(null) 가이드 문구가 표시되는가?', () => {
    // 현재 코드 로직상 selectedEst가 falsy일 때 상세 정보가 나옵니다.
    // 만약 "선택해주세요"가 나오게 하려면 selectedEst에 값을 넣어 렌더링합니다.
    render(<EstimateDetailCard selectedEst={null} commissionId={mockCommissionId} />);

    expect(screen.getByText(/확인할 견적서를/i)).toBeInTheDocument();
    expect(screen.getByText(/오른쪽 목록에서 선택/i)).toBeInTheDocument();
  });

  test('데이터가 존재할 때 상세 정보(이미지, 제목, 금액 등)가 표시되는가?', () => {
    // 현재 코드 로직 기준: selectedEst가 null일 때 상세 정보가 렌더링됨
    render(<EstimateDetailCard selectedEst={mockData} commissionId={mockCommissionId} />);
    // 의뢰 번호 확인
    expect(screen.getByText('멋진 피규어 의뢰')).toBeInTheDocument();
    expect(screen.getByText(mockCommissionId)).toBeInTheDocument();

    // 이미지 렌더링 확인 (alt 값으로 확인)
    const img = screen.getByAltText('request');
    expect(img).toHaveAttribute('src', 'test-image.jpg');
  });

  test('금액 데이터에 콤마(,) 포맷팅이 적용되어 표시되는가?', () => {
    render(<EstimateDetailCard selectedEst={mockData} commissionId={mockCommissionId} />);
    // 50000 -> 50,000원 확인
    expect(screen.getByText('50,000원')).toBeInTheDocument();
  });
});
