import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  commissionapi,
  isCommissionImageReady,
  isCommissionInProgress,
  resolveCommissionTemplateId,
} from '../../api/commissionapi.js';
import { orderapi } from '../../api/orderapi.js';
import { convertToSafeImage } from '../../utils/imageUtils';
import CommissionHeader from '../../components/Commission/CommissionHeader';
import CustomAlertModal from '../../components/Common/CustomAlertModal';

function CommissionDetail() {
  const { commissionId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recreating, setRecreating] = useState(false);
  const [isAssetCreating, setIsAssetCreating] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await commissionapi.getCommissionDetail(commissionId);
      setDetail(response?.data ?? null);
    } catch (error) {
      console.error('Failed to load commission detail:', error);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [commissionId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);
  const isReady = isCommissionImageReady(detail?.status, detail?.aiImageUrl);
  const isAiImageGenerating = isCommissionInProgress(
    String(detail?.status || '')
      .trim()
      .toUpperCase(),
  );

  const handleComplete = async () => {
    if (!detail || isAssetCreating || isAiImageGenerating) return;

    setRecreating(true);
    setIsAssetCreating(true);
    try {
      // 💡 [초안전 API 비동기 격리!] 백엔드 API 실패로 인해 다음 페이지 이동이 가로막히지 않도록, 호출을 백그라운드로 격리하고 예외를 가둡니다.
      try {
        await commissionapi.markCommissionGood(detail.commissionId);
      } catch (apiError) {
        console.warn('Background markCommissionGood failed (navigating anyway):', apiError);
      }

      // 💡 [에셋 생성 연동] 에셋 생성 API를 호출합니다.
      let created = false;
      try {
        const templateId = resolveCommissionTemplateId(detail.style || '지브리');
        await orderapi.createAssetFromCommission({
          commissionId: detail.commissionId,
          templateId,
        });
        created = true;
      } catch (assetError) {
        console.warn('에셋 생성 요청 실패:', assetError);
      }

      if (created) {
        setIsAssetCreating(false);
        setModalConfig({
          isOpen: true,
          icon: '✅',
          title: '에셋 생성 요청 완료',
          description: '에셋 생성이 시작되었습니다.\n의뢰 목록에서 완료 상태를 확인해주세요.',
          leftBtnText: '확인',
          onClose: () => {
            setModalConfig({ isOpen: false });
            navigate('/commissions');
          },
        });
      } else {
        // 생성 실패 시 모달 표시 후 목록으로 이동
        setIsAssetCreating(false);
        setModalConfig({
          isOpen: true,
          icon: '🚨',
          title: '에셋 생성 실패',
          description: '에셋 생성에 실패했습니다.\n의뢰 목록으로 이동합니다.',
          leftBtnText: '확인',
          onClose: () => {
            setModalConfig({ isOpen: false });
            navigate('/commissions');
          },
        });
      }
    } catch (error) {
      console.error('Failed in complete navigation container:', error);
      setIsAssetCreating(false);
    } finally {
      setRecreating(false);
    }
  };

  const handleRecreate = async () => {
    if (!detail || recreating || isAiImageGenerating) return;

    setRecreating(true);
    try {
      await commissionapi.recreateCommission({
        commissionId: detail.commissionId,
        style: detail.style || '지브리',
      });
      await fetchDetail();
    } catch (error) {
      console.error('Failed to recreate commission image:', error);
      setModalConfig({
        isOpen: true,
        icon: '🚨',
        title: '재생성 실패',
        description: '이미지 재생성 요청에 실패했습니다.',
        leftBtnText: '확인',
        onClose: () => setModalConfig({ isOpen: false }),
      });
    } finally {
      setRecreating(false);
    }
  };

  if (loading && !detail) {
    return (
      <div style={S.containerStyle}>
        <CommissionHeader title="이미지 비교" />
        <div style={S.noticeStyle}>데이터를 불러오는 중입니다...</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={S.containerStyle}>
        <CommissionHeader title="이미지 비교" />
        <div style={S.noticeStyle}>해당 의뢰를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div style={S.containerStyle}>
      <CommissionHeader
        title="이미지 비교"
        disableBack={isAssetCreating || recreating || modalConfig.isOpen}
      />

      <div style={S.contentWrapper}>
        <div style={S.cardStyle}>
          {/* 이미지 비교 행 (원본 vs 생성결과) */}
          <div style={S.imagesRow}>
            {/* 원본 이미지 컬럼 */}
            <div style={S.imageColumn}>
              <div style={S.imageTitle}>원본 이미지</div>
              <div style={S.imageBox}>
                {detail.inputImageUrl ? (
                  <img
                    src={convertToSafeImage(detail.inputImageUrl)}
                    alt="Original"
                    style={S.imageTag}
                  />
                ) : (
                  <div style={S.placeholderImg}>이미지 없음</div>
                )}
              </div>
            </div>

            {/* AI 생성 결과 컬럼 */}
            <div style={S.imageColumn}>
              <div style={S.imageTitle}>생성 이미지</div>
              <div style={S.imageBox}>
                {isReady ? (
                  <img
                    src={convertToSafeImage(detail.aiImageUrl)}
                    alt="AI Result"
                    style={S.imageTag}
                  />
                ) : (
                  <div style={S.processingBox}>
                    <div className="spinner" style={S.spinnerStyle} />
                    <p style={S.processingText}>AI 이미지를 생성하는 중입니다...</p>
                    <p style={S.processingSubtext}>잠시만 기다려 주세요. (1~2분 소요)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 이미지 스타일 기입 폼 */}
          <div style={S.styleSelectorWrapper}>
            <div style={S.styleLabel}>이미지 스타일</div>
            <select disabled style={S.selectStyle} value={detail.style || '지브리'}>
              <option value="지브리">지브리</option>
              <option value="픽사">픽사</option>
              <option value="신카이">신카이</option>
              <option value="Anime">Anime</option>
              <option value="Portrait">Portrait</option>
            </select>
          </div>

          {/* 의뢰 제목 */}
          <div style={S.commissionTitle}>{detail.title || `의뢰 #${detail.commissionId}`}</div>

          {/* 초록색 수직 액션 버튼 그룹 */}
          <div style={S.actionGroup}>
            <button
              onClick={handleRecreate}
              disabled={recreating || isAiImageGenerating}
              style={{
                ...S.actionBtn,
                backgroundColor: recreating || isAiImageGenerating ? '#A3D2B3' : '#2C9753',
                cursor: recreating || isAiImageGenerating ? 'not-allowed' : 'pointer',
              }}
            >
              {recreating ? '이미지 재생성 중...' : '이미지 재생성하기'}
            </button>

            <button
              onClick={handleComplete}
              disabled={recreating || isAssetCreating || isAiImageGenerating}
              style={{
                ...S.actionBtn,
                backgroundColor:
                  recreating || isAssetCreating || isAiImageGenerating ? '#A3D2B3' : '#2C9753',
                cursor:
                  recreating || isAssetCreating || isAiImageGenerating ? 'not-allowed' : 'pointer',
              }}
            >
              생성 완료하기
            </button>
          </div>
        </div>
      </div>

      {/* 에셋 생성중 오버레이 모달 */}
      {isAssetCreating && (
        <div style={S.overlayStyle}>
          <div style={S.overlayContent}>
            <div className="spinner" style={S.spinnerStyle} />
            <p style={S.overlayText}>에셋을 생성하는 중입니다...</p>
            <p style={S.overlaySubText}>잠시만 기다려주세요.</p>
          </div>
        </div>
      )}

      {/* 커스텀 알림 모달 */}
      <CustomAlertModal
        isOpen={modalConfig.isOpen}
        onClose={modalConfig.onClose || (() => setModalConfig({ isOpen: false }))}
        icon={modalConfig.icon}
        title={modalConfig.title || ''}
        description={modalConfig.description || ''}
        leftBtnText={modalConfig.leftBtnText || '확인'}
      />
    </div>
  );
}

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

const S = {
  containerStyle: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#F7F7F7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: vw(60),
  },
  contentWrapper: {
    marginTop: vw(120),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: `0 ${vw(20)}`,
    boxSizing: 'border-box',
  },
  cardStyle: {
    width: '100%',
    maxWidth: vw(1100),
    backgroundColor: '#FFF',
    borderRadius: vw(15),
    padding: `${vw(40)} ${vw(50)}`,
    boxSizing: 'border-box',
    border: '1px solid #EBEBEB',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  imagesRow: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    gap: vw(40),
    flexWrap: 'wrap',
    marginBottom: vw(40),
  },
  imageColumn: {
    flex: '1',
    minWidth: vw(350),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: vw(20),
    fontWeight: '600',
    color: '#333',
    marginBottom: vw(15),
    textAlign: 'center',
  },
  imageBox: {
    width: '100%',
    aspectRatio: '3 / 4',
    maxHeight: vw(480),
    backgroundColor: '#FAFAFA',
    borderRadius: vw(12),
    border: '1.5px solid #F0F0F0',
    boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageTag: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  placeholderImg: {
    fontSize: vw(16),
    color: '#999',
    fontWeight: 'bold',
  },
  processingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: vw(20),
  },
  processingText: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: vw(16),
    marginTop: vw(15),
    marginBottom: vw(8),
  },
  processingSubtext: {
    fontSize: vw(13),
    color: '#999',
  },
  styleSelectorWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: vw(30),
  },
  styleLabel: {
    fontSize: vw(14),
    fontWeight: '500',
    color: '#86868B',
    marginBottom: vw(10),
    textAlign: 'center',
  },
  selectStyle: {
    width: vw(350),
    height: vw(54),
    borderRadius: vw(8),
    border: '1px solid #D2D2D7',
    paddingLeft: vw(16),
    fontSize: vw(16),
    color: '#1D1D1F',
    backgroundColor: '#FFFFFF',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231D1D1F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${vw(16)} center`,
    backgroundSize: vw(16),
    cursor: 'not-allowed',
    outline: 'none',
    textAlign: 'center',
  },
  commissionTitle: {
    fontSize: vw(22),
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: vw(30),
    textAlign: 'center',
  },
  actionGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: vw(15),
  },
  actionBtn: {
    width: vw(350),
    height: vw(54),
    color: '#FFFFFF',
    border: 'none',
    borderRadius: vw(8),
    fontSize: vw(18),
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 4px 10px rgba(44, 151, 83, 0.15)',
  },
  noticeStyle: {
    fontSize: vw(18),
    fontWeight: '500',
    color: '#666',
    marginTop: vw(100),
    textAlign: 'center',
  },
  spinnerStyle: {
    width: vw(40),
    height: vw(40),
    border: `4px solid #F3F3F3`,
    borderTop: `4px solid #2C9753`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  overlayStyle: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    backgroundColor: '#FFF',
    padding: vw(40),
    borderRadius: vw(15),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  overlayText: {
    marginTop: vw(20),
    fontSize: vw(18),
    fontWeight: '700',
    color: '#333',
  },
  overlaySubText: {
    marginTop: vw(8),
    fontSize: vw(14),
    color: '#86868B',
  },
};

if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-spinner-style="commission-detail"]');
  if (!existingStyle) {
    const styleTag = document.createElement('style');
    styleTag.dataset.spinnerStyle = 'commission-detail';
    styleTag.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleTag);
  }
}

export default CommissionDetail;
