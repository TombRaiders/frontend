import React, { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CommissionHeader from '../../components/Commission/CommissionHeader';

const PAYMENT_LAST_ENTRY_KEY = 'payment-entry:last';

function PaymentFailPage() {
  const navigate = useNavigate();
  const { orderId: routeOrderId } = useParams();
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code');
  const message = searchParams.get('message') || '결제 처리 중 오류가 발생했습니다.';

  const savedEntry = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(PAYMENT_LAST_ENTRY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Failed to parse latest payment entry:', error);
      return null;
    }
  }, []);

  const resolvedOrderId =
    routeOrderId || savedEntry?.order?.orderId || savedEntry?.estimateData?.orderId || null;

  return (
    <>
      <CommissionHeader title="결제 실패" />
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f7] px-6 text-center">
        <p className="text-[24px] font-bold text-[#d93025]">결제가 취소되었거나 실패했습니다.</p>
        {code ? <p className="text-[15px] text-black">오류 코드: {code}</p> : null}
        <p className="text-[15px] text-black">{message}</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() =>
              navigate('/estimate-detail', {
                state: { orderId: resolvedOrderId },
              })
            }
            className="rounded-[10px] border border-[#2c9753] px-5 py-3 text-[#2c9753]"
          >
            견적서 페이지로
          </button>
          <button
            type="button"
            onClick={() =>
              navigate('/payment', {
                replace: true,
                state: savedEntry || undefined,
              })
            }
            className="rounded-[10px] bg-[#2c9753] px-5 py-3 text-white"
          >
            다시 결제하기
          </button>
        </div>
      </div>
    </>
  );
}

export default PaymentFailPage;
