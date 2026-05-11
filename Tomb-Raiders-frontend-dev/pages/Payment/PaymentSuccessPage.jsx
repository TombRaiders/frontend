import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CommissionHeader from '../../components/Commission/CommissionHeader';
import {
  clearPaymentContext,
  loadConfirmedPayment,
  PAYMENT_CONTEXT_STORAGE_KEY,
  saveConfirmedPayment,
  usePayment,
} from './usePayment';

const confirmRequestCache = new Map();

const getConfirmRequestKey = ({ paymentUid, paymentKey, amount }) =>
  [paymentUid, paymentKey, amount].join(':');

const confirmPaymentOnce = ({ confirmPayment, paymentUid, paymentKey, amount }) => {
  const requestKey = getConfirmRequestKey({ paymentUid, paymentKey, amount });

  if (!confirmRequestCache.has(requestKey)) {
    const request = confirmPayment({
      paymentUid,
      paymentKey,
      amount: Number(amount),
    }).catch((error) => {
      confirmRequestCache.delete(requestKey);
      throw error;
    });

    confirmRequestCache.set(requestKey, request);
  }

  return confirmRequestCache.get(requestKey);
};

const findPaymentContextByUid = (paymentUid) => {
  if (!paymentUid) return null;

  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith(`${PAYMENT_CONTEXT_STORAGE_KEY}:`)) {
      try {
        const value = JSON.parse(sessionStorage.getItem(key) || 'null');
        if (value?.paymentUid === paymentUid) {
          return {
            orderId: key.slice(`${PAYMENT_CONTEXT_STORAGE_KEY}:`.length),
            context: value,
          };
        }
      } catch (error) {
        console.error('Failed to parse payment context:', error);
      }
    }
  }

  return null;
};

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { orderId: routeOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const { confirmPayment } = usePayment();

  const paymentUid = searchParams.get('orderId');
  const paymentKey = searchParams.get('paymentKey');
  const amount = searchParams.get('amount');

  const cachedResult = useMemo(() => loadConfirmedPayment(paymentUid), [paymentUid]);
  const paymentContextRecord = useMemo(() => findPaymentContextByUid(paymentUid), [paymentUid]);
  const resolvedOrderId =
    routeOrderId || paymentContextRecord?.orderId || paymentContextRecord?.context?.orderId || '';

  const [paymentResult, setPaymentResult] = useState(cachedResult);
  const [status, setStatus] = useState(cachedResult ? 'success' : 'idle');
  const [errorMessage, setErrorMessage] = useState('');
  const startedConfirmKeyRef = useRef('');
  const confirmRequestKey = useMemo(
    () =>
      paymentUid && paymentKey && amount
        ? getConfirmRequestKey({ paymentUid, paymentKey, amount })
        : '',
    [amount, paymentKey, paymentUid],
  );

  useEffect(() => {
    if (
      !paymentUid ||
      !paymentKey ||
      !amount ||
      paymentResult ||
      startedConfirmKeyRef.current === confirmRequestKey
    ) {
      return undefined;
    }

    startedConfirmKeyRef.current = confirmRequestKey;
    let cancelled = false;

    const runConfirm = async () => {
      setStatus('loading');
      setErrorMessage('');

      try {
        const result = await confirmPaymentOnce({
          confirmPayment,
          paymentUid,
          paymentKey,
          amount,
        });

        if (cancelled) return;

        saveConfirmedPayment(paymentUid, result);
        if (resolvedOrderId) {
          clearPaymentContext(resolvedOrderId);
        }
        setPaymentResult(result);
        setStatus('success');
      } catch (error) {
        if (cancelled) return;

        console.error('Payment confirm failed:', error);
        setErrorMessage(error?.message || '결제 승인에 실패했습니다.');
        setStatus('failed');
      }
    };

    runConfirm();

    return () => {
      cancelled = true;
      if (startedConfirmKeyRef.current === confirmRequestKey) {
        startedConfirmKeyRef.current = '';
      }
    };
  }, [
    amount,
    confirmPayment,
    confirmRequestKey,
    paymentKey,
    paymentResult,
    paymentUid,
    resolvedOrderId,
  ]);

  if (!paymentUid || !paymentKey || !amount) {
    return (
      <>
        <CommissionHeader title="결제 결과 확인" />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f7] px-6 text-center">
          <p className="text-[18px] text-black">결제 확인에 필요한 정보가 없습니다.</p>
          <button
            type="button"
            onClick={() => navigate('/check')}
            className="rounded-[10px] bg-[#2c9753] px-5 py-3 text-white"
          >
            의뢰 목록으로 돌아가기
          </button>
        </div>
      </>
    );
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <>
        <CommissionHeader title="결제 승인 대기" />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f7] px-6 text-center">
          <p className="text-[18px] text-black">결제를 승인하는 중입니다.</p>
        </div>
      </>
    );
  }

  if (status === 'failed') {
    return (
      <>
        <CommissionHeader title="결제 승인 실패" />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f7] px-6 text-center">
          <p className="text-[20px] font-bold text-[#d93025]">결제 승인에 실패했습니다.</p>
          <p className="text-[16px] text-black">{errorMessage}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/check')}
              className="rounded-[10px] border border-[#2c9753] px-5 py-3 text-[#2c9753]"
            >
              의뢰 목록으로
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-[10px] bg-[#2c9753] px-5 py-3 text-white"
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CommissionHeader title="결제 성공" />
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f7] px-6 text-center">
        <p className="text-[24px] font-bold text-black">결제가 완료되었습니다.</p>
        <p className="text-[16px] text-black">
          결제 금액: {(paymentResult?.amount || Number(amount)).toLocaleString()}원
        </p>
        {paymentContextRecord?.context?.itemName ? (
          <p className="text-[14px] text-black/70">
            주문 상품: {paymentContextRecord.context.itemName}
          </p>
        ) : null}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() =>
              navigate('/estimate-detail', {
                state: {
                  orderId: resolvedOrderId || paymentContextRecord?.context?.orderId || null,
                },
              })
            }
            className="rounded-[10px] border border-[#2c9753] px-5 py-3 text-[#2c9753]"
          >
            견적서 페이지로
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-[10px] bg-[#2c9753] px-5 py-3 text-white"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </>
  );
}

export default PaymentSuccessPage;
