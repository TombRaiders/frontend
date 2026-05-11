import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { addressService } from '../../api/addressService';
import {
  commissionapi,
  isCommissionImageReady,
  resolveCommissionTemplateId,
} from '../../api/commissionapi';
import { orderapi } from '../../api/orderapi';
import CommissionHeader from '../../components/Commission/CommissionHeader';
import { getCookie, setCookie } from '../../utils/authUtils';

const normalizeData = (payload) => payload?.data || payload || null;

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const ASSET_PAGE_SIZE = 20;
const ASSET_IMAGE_STATUSES = new Set([
  'ASSET_CREATED',
  'ORDER_QUOTING',
  'ORDER_QUOTED',
  'QUOTED',
  'PAYMENT_QUEUED',
  'PAYMENT_PAID',
  'PAYMENT_PAYED',
]);

const formatDate = (dateString) => {
  if (!dateString) return '0000.00.00';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '0000.00.00';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
};

const getAssetImagePath = (source = {}) => {
  const asset = source?.asset || {};

  return (
    source?.asset_image_path ||
    source?.assetImagePath ||
    source?.assetImageUrl ||
    asset?.asset_image_path ||
    asset?.assetImagePath ||
    asset?.assetImageUrl ||
    ''
  );
};

const getAssetCommissionId = (asset = {}) => {
  const commission = asset?.commission || {};

  return asset?.commissionId || asset?.commission_id || commission?.commissionId || commission?.id;
};

const getAssetId = (asset = {}) => asset?.assetId || asset?.asset_id || asset?.id || null;

const shouldFetchAssetImage = (status) =>
  ASSET_IMAGE_STATUSES.has(
    String(status || '')
      .trim()
      .toUpperCase(),
  );

const normalizeCommissionDetail = (detail, fallbackItem = {}) => {
  const normalized = normalizeData(detail) || {};
  const normalizedAsset = normalized.asset || {};
  const fallbackAsset = fallbackItem.asset || {};

  return {
    commissionId: normalized.commissionId || normalized.id || fallbackItem.id || null,
    assetId:
      normalized.assetId ||
      normalized.asset_id ||
      normalizedAsset.assetId ||
      normalizedAsset.asset_id ||
      normalizedAsset.id ||
      fallbackItem.assetId ||
      fallbackItem.asset_id ||
      fallbackAsset.assetId ||
      fallbackAsset.asset_id ||
      fallbackAsset.id ||
      null,
    title:
      normalized.title ||
      fallbackItem.title ||
      `의뢰 #${normalized.commissionId || fallbackItem.id || ''}`,
    style: normalized.style || fallbackItem.style || '지브리',
    status: normalized.status || fallbackItem.status || '',
    inputImageUrl:
      normalized.inputImageUrl ||
      normalized.imageUrl ||
      fallbackItem.img ||
      fallbackItem.inputImageUrl ||
      '',
    aiImageUrl:
      normalized.aiImageUrl ||
      normalized.resultImageUrl ||
      fallbackItem.aiImg ||
      fallbackItem.aiImageUrl ||
      '',
    assetImagePath: getAssetImagePath(normalized) || getAssetImagePath(fallbackItem),
    createdAt: normalized.createdAt || fallbackItem.createdAt || '',
  };
};

const normalizeAssetPage = (payload) => {
  let content = [];

  if (Array.isArray(payload?.content)) {
    content = payload.content;
  } else if (Array.isArray(payload)) {
    content = payload;
  }

  const page = payload?.page || {};
  const number = Number(page.number ?? payload?.number ?? 0);
  const totalPages = Number(page.totalPages ?? payload?.totalPages ?? 1);

  return {
    content,
    number,
    totalPages,
    last: Boolean(payload?.last) || totalPages === 0 || number >= totalPages - 1,
  };
};

const buildNormalizedOrder = ({
  order,
  assetId,
  commissionId,
  title,
  style,
  imageUrl,
  quantity,
}) => {
  const normalizedOrder = normalizeData(order) || {};
  const orderId = normalizedOrder.orderId || normalizedOrder.id;

  return {
    ...normalizedOrder,
    id: orderId || assetId,
    orderId: orderId || assetId,
    assetId,
    commissionId,
    title,
    style,
    img: imageUrl,
    quantity,
    status: normalizedOrder.status || 'ORDER_QUOTING',
    createdAt: normalizedOrder.createdAt || new Date().toISOString(),
  };
};

function ImageResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { commissionId: routeCommissionId } = useParams();

  const locationState = location.state;
  const locationItem = useMemo(
    () => locationState?.item || locationState?.detail || {},
    [locationState],
  );
  const fallbackCommissionId =
    routeCommissionId || locationItem.commissionId || locationItem.id || null;

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [itemCount, setItemCount] = useState(1);
  const [detail, setDetail] = useState(() => normalizeCommissionDetail(locationItem, locationItem));
  const [commissionName, setCommissionName] = useState(
    detail.title || `의뢰 #${fallbackCommissionId || ''}`,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(
    !detail.inputImageUrl && !detail.assetImagePath && Boolean(fallbackCommissionId),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCommissionName(detail.title || `의뢰 #${fallbackCommissionId || ''}`);
  }, [detail.title, fallbackCommissionId]);

  useEffect(() => {
    if (!fallbackCommissionId) return undefined;
    if (detail.aiImageUrl && detail.inputImageUrl) return undefined;

    let isMounted = true;

    const fetchCommissionDetail = async () => {
      setIsLoadingDetail(!detail.inputImageUrl && !detail.assetImagePath);

      try {
        const result = await commissionapi.getCommissionDetail(fallbackCommissionId);
        if (!isMounted) return;

        setDetail(normalizeCommissionDetail(result, locationItem));
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load commission detail:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoadingDetail(false);
        }
      }
    };

    fetchCommissionDetail();

    return () => {
      isMounted = false;
    };
  }, [
    detail.aiImageUrl,
    detail.assetImagePath,
    detail.inputImageUrl,
    fallbackCommissionId,
    locationItem,
  ]);

  useEffect(() => {
    if (!detail.assetId || detail.assetImagePath) return undefined;

    let isMounted = true;

    const fetchAssetDetail = async () => {
      try {
        const result = await orderapi.getAssetDetail(detail.assetId);
        if (!isMounted) return;

        const asset = normalizeData(result);
        setDetail((prevDetail) =>
          normalizeCommissionDetail(
            {
              ...prevDetail,
              asset,
              ...asset,
            },
            prevDetail,
          ),
        );
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load asset detail:', error);
        }
      }
    };

    fetchAssetDetail();

    return () => {
      isMounted = false;
    };
  }, [detail.assetId, detail.assetImagePath]);

  useEffect(() => {
    const commissionId = detail.commissionId || fallbackCommissionId;
    if (!commissionId || detail.assetId || !shouldFetchAssetImage(detail.status)) {
      return undefined;
    }

    let isMounted = true;

    const fetchAssetByCommissionId = async () => {
      let page = 0;
      let shouldContinue = true;

      while (shouldContinue) {
        const result = await orderapi.getAssets({
          page,
          size: ASSET_PAGE_SIZE,
          sort: ['createdAt,desc'],
          commission: true,
        });

        if (!result?.isSuccess) {
          throw new Error(result?.errorDetail?.message || 'Failed to load assets.');
        }

        if (!isMounted) return;

        const assetPage = normalizeAssetPage(result.data);
        const matchedAsset = assetPage.content.find(
          (asset) => String(getAssetCommissionId(asset) || '') === String(commissionId),
        );

        if (matchedAsset) {
          setDetail((prevDetail) =>
            normalizeCommissionDetail(
              {
                ...prevDetail,
                asset: matchedAsset,
                assetId: getAssetId(matchedAsset),
                ...matchedAsset,
              },
              prevDetail,
            ),
          );
          return;
        }

        shouldContinue = !assetPage.last;
        page = assetPage.number + 1;
      }
    };

    fetchAssetByCommissionId().catch((error) => {
      if (isMounted) {
        console.error('Failed to load asset by commission id:', error);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    detail.assetId,
    detail.assetImagePath,
    detail.commissionId,
    detail.status,
    fallbackCommissionId,
  ]);

  const resolvedCommissionId = detail.commissionId || fallbackCommissionId;
  const originalImage = detail.inputImageUrl;
  const isGeneratedImageReady = isCommissionImageReady(detail.status, detail.aiImageUrl);
  const currentAiImage = detail.aiImageUrl || '';
  const displayGeneratedImage = detail.assetImagePath || detail.aiImageUrl || originalImage;
  const orderTitle = commissionName || detail.title || `의뢰 #${resolvedCommissionId || ''}`;

  // 💡 [초안전 수퍼 패치!]
  // 1. 기존 isGeneratedImageReady 가 참이거나,
  // 2. detail.aiImageUrl (생성 완료된 이미지 URL) 이 실재하기만 하거나,
  // 3. status가 완료 계열(DONE, AI_IMAGE_DONE 등) 중 하나이기만 해도 무조건 주문 생성을 활성화하여 철벽 가드합니다.
  const canCreateOrder =
    isGeneratedImageReady ||
    Boolean(detail.aiImageUrl) ||
    ['DONE', 'AI_IMAGE_DONE', 'ASSET_CREATED', 'ORDER_QUOTING', 'ORDER_QUOTED', 'QUOTED'].includes(
      String(detail.status || '').toUpperCase(),
    );

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;

    if (!resolvedCommissionId) {
      globalThis.alert?.('주문을 생성할 의뢰 정보가 없습니다.');
      return;
    }

    if (!canCreateOrder) {
      globalThis.alert?.('AI 이미지가 준비된 뒤에 견적 요청을 진행할 수 있습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const addressesResult = await addressService.getAddresses();
      const addresses = normalizeList(addressesResult);
      const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];

      if (!defaultAddress?.addressId) {
        globalThis.alert?.('기본 배송지를 먼저 등록해주세요.');
        navigate('/member/address');
        return;
      }

      let assetId = detail.assetId ? Number(detail.assetId) : null;

      if (!assetId) {
        try {
          const templateId = resolveCommissionTemplateId(detail.style || '지브리');
          const assetResult = await orderapi.createAssetFromCommission({
            commissionId: Number(resolvedCommissionId),
            templateId,
          });
          const asset = normalizeData(assetResult);
          assetId = asset?.assetId;
        } catch (assetError) {
          console.error('Asset creation failed before creating order:', assetError);
          throw assetError;
        }
      }

      if (!assetId) {
        throw new Error('에셋 생성에 실패했습니다.');
      }

      const orderResult = await orderapi.createOrder({
        assetId,
        addressId: defaultAddress.addressId,
        manufacturingMethod: 'FDM',
        quantity: itemCount,
        requirements: orderTitle,
      });

      const createdOrder = normalizeData(orderResult);
      const createdOrderId = createdOrder?.orderId || createdOrder?.id;

      let restoredOrder = createdOrder;

      if (createdOrderId) {
        try {
          const orderDetailResult = await orderapi.getOrderDetail(createdOrderId);
          restoredOrder = normalizeData(orderDetailResult) || createdOrder;
        } catch (error) {
          console.error('Failed to reload created order detail:', error);
        }
      }

      const normalizedOrder = buildNormalizedOrder({
        order: restoredOrder,
        assetId,
        commissionId: Number(resolvedCommissionId),
        title: orderTitle,
        style: detail.style || '지브리',
        imageUrl: currentAiImage || originalImage,
        quantity: itemCount,
      });

      const savedOrders = getCookie('myOrders');
      const savedOrderList = Array.isArray(savedOrders) ? savedOrders : [];
      setCookie('myOrders', [
        normalizedOrder,
        ...savedOrderList.filter(
          (order) => String(order?.orderId || order?.id || '') !== String(normalizedOrder.orderId),
        ),
      ]);

      globalThis.alert?.('견적 요청이 완료되었습니다.');
      navigate('/success');
    } catch (error) {
      console.error('Failed to create order from commission:', error);
      globalThis.alert?.(
        error?.response?.data?.errorDetail?.message ||
          error?.message ||
          '견적 요청 처리에 실패했습니다.',
      );
    } finally {
      setIsSubmitting(false);
      setIsOverlayOpen(false);
    }
  };

  return (
    <div style={S.containerStyle}>
      {/* 💡 [시안 매칭 1] 깔끔한 상단 헤더 컴포넌트 장착 */}
      <CommissionHeader title="" onBack={() => navigate('/commissions')} />

      <div style={S.centerWrapper}>
        {/* 💡 [시안 매칭 2] 수정 가능한 의뢰 이름 입력 폼 */}
        <div style={S.titleWrapper}>
          <input
            type="text"
            value={commissionName}
            onChange={(e) => setCommissionName(e.target.value)}
            placeholder="의뢰 이름을 입력해주세요"
            style={S.titleInput}
            title="의뢰 이름 수정"
          />
        </div>

        {/* 💡 [시안 매칭 3] 가로 vw(550) 비율의 프리미엄 화이트 카드 */}
        <div style={S.contentBox}>
          {isLoadingDetail ? (
            <div style={S.loadingState}>결과 이미지를 불러오는 중입니다...</div>
          ) : (
            <>
              <div style={S.cardHeaderTitle}>의뢰 페이지</div>

              {/* 생성 완료된 메인 이미지 프레임 */}
              <div style={S.imageWrapper}>
                <img
                  src={displayGeneratedImage || 'safe-image-url'}
                  alt="AI Generated Result"
                  style={S.resultImage}
                />
              </div>

              {/* 하단 상세 명세 테이블 정보 */}
              <div style={S.infoTable}>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>생성일</span>
                  <span style={S.infoValue}>{formatDate(detail.createdAt)}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>의뢰명</span>
                  <span style={S.infoValue}>{commissionName}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>이미지 스타일</span>
                  <span style={S.infoValue}>{detail.style || '지브리'}</span>
                </div>
              </div>

              {/* 수직 배열된 액션 버튼 그룹 */}
              <div style={S.buttonGroup}>
                <button style={S.secondaryBtn} onClick={() => navigate('/commissions')}>
                  의뢰 목록으로
                </button>
                <button
                  style={S.primaryBtn}
                  onClick={() => {
                    if (!canCreateOrder) {
                      globalThis.alert?.('AI 이미지가 생성 완료된 후 주문을 넣을 수 있습니다.');
                      return;
                    }
                    setIsOverlayOpen(true);
                  }}
                >
                  주문 넣기
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 💡 [시안 매칭 4] 주문 수량 조절 팝업 모달 */}
      {isOverlayOpen && !isSubmitting && (
        <div style={S.modalOverlay}>
          <div style={S.modalCard}>
            <div style={S.modalTitle}>주문을 넣으시겠습니까?</div>

            <div style={S.quantityRow}>
              <span style={S.quantityLabel}>제작 수량</span>
              <div style={S.quantityInputWrapper}>
                <input
                  type="number"
                  min="1"
                  value={itemCount}
                  onChange={(e) => setItemCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={S.quantityInput}
                />
                <span style={S.quantityUnit}>개</span>
              </div>
            </div>

            <div style={S.modalActionRow}>
              <button style={S.modalCancelBtn} onClick={() => setIsOverlayOpen(false)}>
                취소
              </button>
              <button style={S.modalConfirmBtn} onClick={handleFinalSubmit}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💡 [시안 매칭 5] 주문 요청 중 로딩 오버레이 */}
      {isSubmitting && (
        <div style={S.modalOverlay}>
          <div style={S.loadingOverlayCard}>
            <div style={S.loadingText}>주문 넣는중...</div>
          </div>
        </div>
      )}
    </div>
  );
}

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

const S = {
  vw,

  containerStyle: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#F7F7F7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: vw(80),
  },
  centerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: vw(30),
  },
  titleWrapper: {
    marginBottom: vw(30),
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  titleInput: {
    border: 'none',
    borderBottom: `2px dashed rgba(44, 151, 83, 0.3)`,
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: vw(22),
    fontWeight: '700',
    color: '#333',
    padding: `${vw(5)} ${vw(15)}`,
    width: vw(500),
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
  },
  contentBox: {
    width: vw(550),
    backgroundColor: '#FFF',
    borderRadius: vw(20),
    padding: `${vw(40)} ${vw(45)}`,
    border: '1px solid #EAEAEA',
    boxShadow: '0 15px 35px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: vw(16),
    color: '#666',
    fontWeight: '600',
    marginBottom: vw(25),
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '3 / 4',
    maxHeight: vw(480),
    borderRadius: vw(12),
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
    border: '1px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vw(30),
  },
  resultImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoTable: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: vw(18),
    marginBottom: vw(40),
    padding: `0 ${vw(10)}`,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: vw(14),
    borderBottom: '1px solid #FAFAFA',
    paddingBottom: vw(12),
  },
  infoLabel: {
    color: '#333',
    fontWeight: '700',
  },
  infoValue: {
    color: '#666',
    fontWeight: '500',
  },
  buttonGroup: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: vw(12),
  },
  primaryBtn: {
    width: '100%',
    height: vw(50),
    backgroundColor: '#2C9753',
    color: '#FFF',
    border: 'none',
    borderRadius: vw(10),
    fontSize: vw(15),
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(44, 151, 83, 0.15)',
  },
  secondaryBtn: {
    width: '100%',
    height: vw(50),
    backgroundColor: '#2C9753',
    color: '#FFF',
    border: 'none',
    borderRadius: vw(10),
    fontSize: vw(15),
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(44, 151, 83, 0.15)',
  },
  loadingState: {
    minHeight: vw(400),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: vw(16),
    color: '#777',
    fontWeight: '500',
  },

  // 모달 팝업 세련된 스타일
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalCard: {
    width: vw(380),
    backgroundColor: '#FFF',
    borderRadius: vw(16),
    padding: `${vw(35)} ${vw(30)}`,
    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: vw(18),
    fontWeight: '700',
    color: '#222',
    marginBottom: vw(30),
    textAlign: 'center',
  },
  quantityRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: vw(35),
    padding: `0 ${vw(10)}`,
  },
  quantityLabel: {
    fontSize: vw(14),
    fontWeight: '600',
    color: '#333',
  },
  quantityInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #CCC',
    borderRadius: vw(4),
    padding: `${vw(4)} ${vw(10)}`,
    backgroundColor: '#FFF',
  },
  quantityInput: {
    width: vw(50),
    border: 'none',
    textAlign: 'right',
    fontSize: vw(15),
    fontWeight: '600',
    color: '#333',
    outline: 'none',
    marginRight: vw(5),
    appearance: 'none',
  },
  quantityUnit: {
    fontSize: vw(14),
    fontWeight: '500',
    color: '#333',
  },
  modalActionRow: {
    display: 'flex',
    width: '100%',
    gap: vw(12),
  },
  modalCancelBtn: {
    flex: 1,
    height: vw(40),
    backgroundColor: '#FFF',
    color: '#333',
    border: '1px solid #DDD',
    borderRadius: vw(6),
    fontSize: vw(14),
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtn: {
    flex: 1,
    height: vw(40),
    backgroundColor: '#2C9753',
    color: '#FFF',
    border: 'none',
    borderRadius: vw(6),
    fontSize: vw(14),
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 주문 넣는 중 로딩 오버레이용 카드
  loadingOverlayCard: {
    width: vw(280),
    backgroundColor: '#FFF',
    borderRadius: vw(12),
    padding: `${vw(40)} ${vw(30)}`,
    boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: vw(16),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
};

export default ImageResultPage;
