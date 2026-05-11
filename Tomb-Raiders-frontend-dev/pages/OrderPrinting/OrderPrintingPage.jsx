import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommissionHeader from '../../components/Commission/CommissionHeader';
import ModelPreview from '../../components/OrderPrinting/ModelPreview';
import CustomAlertModal from '../../components/Common/CustomAlertModal';
import { addressService } from '../../api/addressService';
import { orderapi } from '../../api/orderapi';
import { vw } from '../../utils/style';

const normalizeData = (payload) => payload?.data || payload || null;

const normalizeList = (payload) => {
  const data = normalizeData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

const resolveManufacturingMethod = (printType) => {
  if (printType === '레진') return 'SLA';
  if (String(printType || '').startsWith('FDM')) return 'FDM';
  return 'UNKNOWN';
};

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.errorDetail?.message || error?.message || fallbackMessage;

function OrderPrintingPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [printType, setPrintType] = useState('FDM(플라스틱)');
  const [description, setDescription] = useState('');
  const [uploadedAsset, setUploadedAsset] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isAddressAlertOpen, setIsAddressAlertOpen] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadedAsset(null);
      setUploadStatus('');
    }
  };

  const uploadSelectedAsset = async () => {
    setIsUploading(true);
    setUploadStatus('파일 전송 중...');

    try {
      const uploadResult = await orderapi.uploadAsset(selectedFile);
      const asset = normalizeData(uploadResult);

      if (!asset?.assetId) {
        throw new Error('업로드 결과에서 에셋 ID를 찾을 수 없습니다.');
      }

      setUploadedAsset(asset);
      setUploadStatus('파일 전송 완료');
      return asset;
    } catch (error) {
      setUploadedAsset(null);
      setUploadStatus('파일 전송 실패');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (isCreatingOrder || isUploading) return;

    if (!selectedFile) {
      globalThis.alert('파일을 먼저 선택해 주세요.');
      return;
    }

    setIsCreatingOrder(true);
    let asset = uploadedAsset;

    try {
      if (!asset?.assetId) {
        asset = await uploadSelectedAsset();
      }

      const addressesResult = await addressService.getAddresses();
      const addresses = normalizeList(addressesResult);
      const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];

      if (!defaultAddress?.addressId) {
        setIsAddressAlertOpen(true);
        return;
      }

      await orderapi.createOrder({
        assetId: asset.assetId,
        addressId: defaultAddress.addressId,
        manufacturingMethod: resolveManufacturingMethod(printType),
        quantity: 1,
        requirements: description.trim(),
      });

      globalThis.alert('주문 생성이 완료되었습니다.');
      navigate('/asset');
    } catch (error) {
      const fallbackMessage = asset?.assetId
        ? '주문 생성에 실패했습니다.'
        : '파일 전송에 실패했습니다.';
      globalThis.alert(getErrorMessage(error, fallbackMessage));
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const isOrderButtonDisabled = !selectedFile || isUploading || isCreatingOrder;

  const handleMoveToAddressManagement = () => {
    setIsAddressAlertOpen(false);
    navigate('/member/edit', { state: { activeMenu: '배송지 관리' } });
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#F7F7F7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <CommissionHeader title="모델 파일 선택" />

      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          marginTop: vw(72),
          padding: `0 ${vw(20)} ${vw(100)}`,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: vw(1100),
            padding: `${vw(40)} ${vw(50)}`,
            borderRadius: vw(16),
            border: '1px solid #EAEAEA',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            boxSizing: 'border-box',
          }}
        >
          <section style={{ marginBottom: vw(40) }}>
            <h3
              style={{
                fontSize: vw(18),
                fontWeight: 'bold',
                marginBottom: vw(15),
                textAlign: 'left',
              }}
            >
              파일 업로드
            </h3>
            <div
              style={{
                border: `${vw(1)} solid #333`,
                padding: vw(30),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: vw(20),
              }}
            >
              <p style={{ fontSize: vw(14), color: '#333', margin: 0 }}>
                3D 모델링 파일을 업로드해 주세요. STL, STEP, STP, 3MF 파일을 전송할 수 있습니다.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".stl,.step,.stp,.3mf"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  style={{
                    backgroundColor: '#EAEAEA',
                    cursor: 'pointer',
                    padding: `${vw(5)} ${vw(15)}`,
                    fontSize: vw(12),
                    border: `${vw(1)} solid #B4B4B4`,
                  }}
                >
                  파일 선택
                </label>
                <span style={{ fontSize: vw(12), color: '#666' }}>
                  {selectedFile ? selectedFile.name : '선택된 파일 없음'}
                </span>
              </div>
              {uploadStatus ? (
                <p style={{ margin: 0, fontSize: vw(12), color: '#2C9753' }}>{uploadStatus}</p>
              ) : null}
              {selectedFile ? <ModelPreview file={selectedFile} /> : null}
            </div>
          </section>

          <section style={{ marginBottom: vw(30), textAlign: 'left' }}>
            <h3 style={{ fontSize: vw(18), fontWeight: 'bold', marginBottom: vw(15) }}>
              출력 종류 선택
            </h3>
            <select
              value={printType}
              onChange={(e) => setPrintType(e.target.value)}
              style={{
                width: '100%',
                padding: vw(15),
                fontSize: vw(16),
                border: `${vw(2)} solid #333`,
                borderRadius: vw(10),
              }}
            >
              <option value="FDM(플라스틱)">FDM(플라스틱)</option>
              <option value="레진">레진</option>
            </select>
          </section>

          <textarea
            placeholder="색상 및 수량을 입력해 주세요. 내부 채움, 벽 수 등 세부 사양이 있으시면 함께 작성해 주시고, 미입력 시 기본값으로 진행됩니다."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              height: vw(200),
              padding: vw(15),
              fontSize: vw(14),
              border: `${vw(2)} solid #333`,
              borderRadius: vw(10),
              resize: 'none',
              marginBottom: vw(40),
              boxSizing: 'border-box',
            }}
          />

          <button
            type="button"
            disabled={isOrderButtonDisabled}
            onClick={handleCreateOrder}
            style={{
              width: '100%',
              backgroundColor: isOrderButtonDisabled ? '#B7B7B7' : '#2C9753',
              color: 'white',
              fontWeight: 'bold',
              padding: vw(15),
              borderRadius: vw(10),
              fontSize: vw(18),
              cursor: isOrderButtonDisabled ? 'default' : 'pointer',
              border: 'none',
            }}
          >
            {isCreatingOrder ? '주문 생성 중...' : '주문 생성하기'}
          </button>
        </div>
      </main>

      <CustomAlertModal
        isOpen={isAddressAlertOpen}
        onClose={() => setIsAddressAlertOpen(false)}
        icon="🚨"
        title="알림"
        description="기본 배송지를 먼저 등록해 주세요."
        leftBtnText="닫기"
        rightBtnText="이동하기"
        onRightBtnClick={handleMoveToAddressManagement}
      />
    </div>
  );
}

export default OrderPrintingPage;
