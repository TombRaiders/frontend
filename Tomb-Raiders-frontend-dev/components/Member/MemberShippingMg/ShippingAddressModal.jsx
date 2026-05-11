import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';
import ShippingAddressField from './ShippingAddressField';
import ShippingAddressAction from './ShippingAddressButton';
import ShippingAddressOverlay from './ShippingAddressOverlay';
import { addressService } from '../../../api/addressService';

const initialState = {
  name: '',
  receiver: '',
  postcode: '',
  address: '',
  detailAddress: '',
  phone: '',

  isDefault: false,
};

function ShippingAddressModal({ isOpen, onClose, setAddresses }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (!isOpen) {
      setForm(initialState);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // 입력 제한 로직 (기존 UI 유지)
    let filteredValue = value;

    if (name === 'name' || name === 'receiver') {
      filteredValue = value.replaceAll(/[\d!@#$%^&*(),.?":{}|<>]/g, '');
    }
    if (name === 'postcode' || name === 'phone') {
      filteredValue = value.replaceAll(/\D/g, '');
    }

    if (name === 'detailAddress') {
      filteredValue = value.replaceAll(/[!@#$%^&*(),.?":{}|<>]/g, '');
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : filteredValue,
    }));
  };
  const handleRegister = async () => {
    const { name, receiver, postcode, address, detailAddress, phone, isDefault } = form;

    if (!receiver || !postcode || !address || !phone) {
      alert('주소 정보를 정확히 입력해주세요.');
      return;
    }

    const addressData = {
      addressTitle: name || '기본 배송지',
      recipientName: receiver,
      recipientPhone: phone.replaceAll(/\D/g, ''),
      addressCode: String(postcode),
      address: String(address),
      detailAddress: detailAddress || '',
      isDefault: Boolean(isDefault),
    };

    try {
      const response = await addressService.createAddress(addressData);
      console.log('서버 응답 데이터:', response);

      const isSuccess = response?.isSuccess || response?.data?.isSuccess;

      if (isSuccess === true) {
        alert('배송지가 성공적으로 등록되었습니다.');
        onClose(); // 모달을 닫으면서 부모의 loadAddressList를 실행
      } else {
        // 서버에서 응답은 왔으나 isSuccess가 false인 경우
        const errorMsg = response?.errorDetail?.message || response?.data?.errorDetail?.message;
        alert(errorMsg || '등록에 실패했습니다.');
      }
    } catch (error) {
      // 📍 400, 401, 500 등 HTTP 에러 코드가 왔을 때만 여기로 들어옵니다.
      console.error('네트워크 에러 상세:', error.response);
      const serverErrorMsg = error.response?.data?.errorDetail?.message;
      alert(serverErrorMsg || '서버 통신 중 오류가 발생했습니다.');
    }
  };

  const scrollArea = {
    padding: `${vw(15)} ${vw(25)}`,
    overflowY: 'auto',
    flex: 1,
    WebkitOverflowScrolling: 'touch',
  };

  const footerStyle = {
    padding: `${vw(15)} ${vw(25)} ${vw(20)} ${vw(25)}`,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: vw(20),
    borderTop: `${vw(1)} solid #f5f5f5`,
  };

  return (
    <ShippingAddressOverlay onClose={onClose}>
      <div
        style={{
          width: vw(400),
          height: vw(550),
          backgroundColor: '#fff',
          borderRadius: vw(15),
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: `${vw(20)} ${vw(25)} 0 ${vw(25)}`, flexShrink: 0 }}>
          <h2
            style={{
              fontSize: vw(16),
              fontWeight: 'bold',
              margin: `0 0 ${vw(10)} 0`,
              textAlign: 'left',
            }}
          >
            배송지 주소록 관리
          </h2>
          <div style={{ width: '100%', height: vw(1), background: '#eee' }} />
        </div>

        <div style={scrollArea}>
          <h3
            style={{
              fontSize: vw(13),
              fontWeight: 'bold',
              margin: `0 0 ${vw(12)} 0`,
              textAlign: 'left',
            }}
          >
            배송지 등록
          </h3>

          <ShippingAddressField
            label="배송지 명"
            name="name"
            placeholder="특수문자/숫자 제외"
            value={form.name}
            onChange={handleChange}
          />
          <ShippingAddressField
            label="받는 분"
            name="receiver"
            placeholder="특수문자/숫자 제외"
            value={form.receiver}
            onChange={handleChange}
          />

          <div style={{ marginBottom: vw(15), textAlign: 'left' }}>
            <p style={{ fontSize: vw(10), color: '#333', marginBottom: vw(5) }}>우편 번호</p>
            <div style={{ display: 'flex', gap: vw(10) }}>
              <input
                name="postcode"
                placeholder="숫자만 입력"
                value={form.postcode}
                onChange={handleChange}
                style={{
                  width: vw(260),
                  height: vw(30),
                  border: `${vw(1)} solid #ddd`,
                  borderRadius: vw(10),
                  padding: `0 ${vw(10)}`,
                  boxSizing: 'border-box',
                  outline: 'none',

                  fontSize: vw(10),
                }}
              />
              <ShippingAddressAction text="주소찾기" type="gray" width={80} />
            </div>
          </div>

          <div style={{ marginBottom: vw(10) }}>
            <ShippingAddressField
              label="주소"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginBottom: vw(10) }}>
            <ShippingAddressField
              label="상세 주소"
              name="detailAddress"
              placeholder="특수문자 제외"
              value={form.detailAddress}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginBottom: vw(10) }}>
            <ShippingAddressField
              label="연락처"
              name="phone"
              placeholder="숫자만 입력 (- 제외)"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: vw(8),
              cursor: 'pointer',

              marginTop: vw(5),
            }}
          >
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
              style={{ width: vw(15), height: vw(15) }}
            />
            <span style={{ fontSize: vw(12), color: '#666' }}>기본 배송지로 설정</span>
          </label>
        </div>
        <div style={footerStyle}>
          <ShippingAddressAction text="취소" onClick={onClose} />
          <ShippingAddressAction text="등록" type="orange" onClick={handleRegister} />
        </div>
      </div>
    </ShippingAddressOverlay>
  );
}

ShippingAddressModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setAddresses: PropTypes.func.isRequired,
};

export default ShippingAddressModal;
