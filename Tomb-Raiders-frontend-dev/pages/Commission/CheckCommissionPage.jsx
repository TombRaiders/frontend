import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  commissionapi,
  hasCommissionQuotationArrived,
  isCommissionFailed,
  isCommissionInProgress,
} from '../../api/commissionapi';
import { convertToSafeImage } from '../../utils/imageUtils';
import { useCommission } from './useCommission';
import CommissionHeader from '../../components/Commission/CommissionHeader';
import CheckListActions from '../../components/Commission/CheckListActions';
import CheckListContent from '../../components/Commission/CheckListContent';
import {
  createCheckListStyles,
  getCommissionPreviewImage,
  getCommissionStatus,
  getCommissionTitle,
  getVisiblePageNumbers,
  getVw,
  isPaymentCompleted,
  normalizeStatusValue,
} from '../../components/Commission/checkListShared';

const ASSET_CREATING_STATUS = 'ASSET_CREATING';
const ASSET_CREATED_STATUS = 'ASSET_CREATED';

const isAssetCreating = (status) => normalizeStatusValue(status) === ASSET_CREATING_STATUS;

const isAssetCreated = (status) => normalizeStatusValue(status) === ASSET_CREATED_STATUS;

const isAiImageGenerating = (status) => isCommissionInProgress(normalizeStatusValue(status));

const shouldOpenEstimateOrderPage = (status) => {
  const upperStatus = normalizeStatusValue(status);
  return upperStatus === 'ORDER_QUOTING' || hasCommissionQuotationArrived(upperStatus);
};

const buildEstimateOrderPath = (item, commissionId) => {
  if (item.orderId) return `/orders/estimate-detail/${item.orderId}`;
  return `/orders/estimate-detail?commissionId=${encodeURIComponent(commissionId)}`;
};

const buildPaymentCompletedOrderPath = (item, commissionId) =>
  `/payments/${encodeURIComponent(item.orderId || commissionId)}`;

const buildPaymentCompletedOrderState = (item, commissionId) => {
  if (!item.orderId) return { commissionId };

  return {
    commissionId,
    order: buildEstimateOrderState(item),
  };
};

const getCommissionCardStatus = (status) => {
  const upperStatus = normalizeStatusValue(status);

  if (upperStatus === ASSET_CREATED_STATUS)
    return { label: '에셋 생성 완료', color: '#1890FF', bgColor: '#E6F7FF' };
  if (upperStatus === ASSET_CREATING_STATUS)
    return { label: '에셋 생성 중', color: '#F59E0B', bgColor: '#FEF3C7' };

  return getCommissionStatus(status);
};

const buildEstimateOrderState = (item) => ({
  orderId: item.orderId,
  id: item.orderId,
  commissionId: item.commissionId,
  title: getCommissionTitle(item),
  style: item.style,
  img: item.aiImageUrl || item.imageUrl || item.inputImageUrl,
  quantity: item.quantity || 1,
  status: item.status,
  quotations: item.quotations,
});

function CommissionListPage() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  const { commissions = [], fetchCommissions, error, pageInfo = {} } = useCommission();
  const totalPages = Math.max(Number(pageInfo.totalPages || 0), 1);
  const visiblePageNumbers = getVisiblePageNumbers(
    Number(pageInfo.page ?? currentPage),
    totalPages,
  );

  useEffect(() => {
    const loadCommissions = async () => {
      setLoading(true);
      try {
        await fetchCommissions(currentPage, { sort: ['createdAt,desc'] });
      } finally {
        setLoading(false);
      }
    };
    loadCommissions();
  }, [currentPage, fetchCommissions]);

  // 💡 [교정 완료!] 견적 도착 상태 조건에 관계없이 모든 의뢰 건을 테이블에 표출합니다.
  const estimateCommissions = commissions;

  const handleNewCommission = () => navigate('/commissions/new');

  // 💡 [교정 완료!] 오더 ID 이동을 제외하고, 클릭 시 커미션 ID를 기준으로 커미션 체크 상세 페이지(/commissions/check/:commissionId)로 다이렉트 이동합니다.
  const handleOpenCommission = (item) => {
    const resolvedCommissionId = item.commissionId || item.id;

    if (isAssetCreating(item.status)) {
      globalThis.alert?.('에셋을 생성하는 중입니다. 잠시만 기다려주세요.');
      return;
    }

    if (isAiImageGenerating(item.status) || isCommissionFailed(normalizeStatusValue(item.status))) {
      return;
    }

    if (isPaymentCompleted(item.status)) {
      navigate(buildPaymentCompletedOrderPath(item, resolvedCommissionId), {
        state: buildPaymentCompletedOrderState(item, resolvedCommissionId),
      });
      return;
    }

    if (shouldOpenEstimateOrderPage(item.status)) {
      navigate(buildEstimateOrderPath(item, resolvedCommissionId), {
        state: {
          returnTo,
          commissionId: resolvedCommissionId,
          order: buildEstimateOrderState(item),
        },
      });
      return;
    }

    if (isAssetCreated(item.status)) {
      navigate(`/commissions/result/${resolvedCommissionId}`, {
        state: {
          detail: {
            ...item,
            commissionId: resolvedCommissionId,
            status: ASSET_CREATED_STATUS,
          },
        },
      });
      return;
    }

    navigate(`/commissions/check/${resolvedCommissionId}`, {
      state: {
        commissionId: resolvedCommissionId,
        order: buildEstimateOrderState(item),
      },
    });
  };

  const handleDeleteCommission = async (e, item) => {
    e.stopPropagation();
    const shouldDelete = globalThis.confirm?.('이 의뢰를 삭제하시겠습니까?') ?? false;
    if (!shouldDelete) return;

    await commissionapi.deleteCommission(item.commissionId);

    const previousPage =
      currentPage > 0 && commissions.length === 1 ? currentPage - 1 : currentPage;
    if (previousPage !== currentPage) {
      setLoading(true);
      setCurrentPage(previousPage);
      return;
    }

    setLoading(true);
    try {
      await fetchCommissions(currentPage, { sort: ['createdAt,desc'] });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (nextPage) => {
    if (loading || nextPage < 0 || nextPage >= totalPages || nextPage === currentPage) return;
    setLoading(true);
    setCurrentPage(nextPage);
  };

  const isCommissionCardDisabled = (item) =>
    isAiImageGenerating(item.status) || isCommissionFailed(normalizeStatusValue(item.status));

  const getCommissionCardActionStyle = (item, disabled) => ({
    ...S.cardActionBtn,
    cursor: isAssetCreating(item.status) || disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <div style={S.pageStyle}>
      <CommissionHeader
        title=""
        compactTitleSection
        backButtonLeft={S.commissionBackButtonLeft}
        backButtonTop={S.commissionBackButtonTop}
        backButtonTransform="translateX(-100%)"
      />
      <main style={S.mainStyle}>
        <CheckListActions
          styles={S}
          onNewProject={handleNewCommission}
          menuItems={[
            { label: '주문 목록', onClick: () => navigate('/payments/history') },
            { label: 'Assets 목록', onClick: () => navigate('/asset') },
            {
              label: '다른 모델 보러가기',
              description: '(게시판으로 연결)',
              onClick: () => navigate('/bulletinboard'),
            },
          ]}
        />

        <section style={S.listSection}>
          <h2 style={S.listHeaderTitle}>목록 ({estimateCommissions.length})</h2>
          <CheckListContent
            styles={S}
            items={estimateCommissions}
            loading={loading}
            error={error}
            emptyMessage="도착한 의뢰 내역이 없습니다."
            totalPages={totalPages}
            currentPage={currentPage}
            visiblePageNumbers={visiblePageNumbers}
            onPageChange={handlePageChange}
            getKey={(item) => item.commissionId}
            getTitle={getCommissionTitle}
            getStatus={(item) => getCommissionCardStatus(item.status)}
            getImageSrc={(item) => convertToSafeImage(getCommissionPreviewImage(item))}
            isDisabled={isCommissionCardDisabled}
            getCardActionStyle={getCommissionCardActionStyle}
            onOpen={handleOpenCommission}
            onDelete={handleDeleteCommission}
          />
        </section>
      </main>
    </div>
  );
}

// --- 스타일 정의 (회원님이 수정한 디자인 100% 유지) ---
const S = createCheckListStyles({
  commissionBackButtonLeft: `calc((100% - ${getVw(1200)}) / 2 - ${getVw(160)})`,
  commissionBackButtonTop: `calc(100% + ${getVw(28)})`,
});

export default CommissionListPage;
