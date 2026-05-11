import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';
import ShippingAddressModal from './ShippingAddressModal';
import { addressService } from '../../../api/addressService';

function ShippingContent({ addresses = [], setAddresses }) {
  const [checkedList, setCheckedList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. 목록 불러오기 (오타 수정 및 로직 완성)
  const loadAddressList = useCallback(async () => {
    try {
      const response = await addressService.getAddresses();
      const validData = response.data?.data || response.data || response || [];

      if (Array.isArray(validData)) {
        setAddresses(validData);
      } else if (validData.data && Array.isArray(validData.data)) {
        setAddresses(validData.data);
      }
    } catch (error) {
      console.error('로드 실패:', error);
      setAddresses([]);
    }
  }, [setAddresses]);

  useEffect(() => {
    loadAddressList();
  }, [loadAddressList]);

  const handleDeleteSelected = async () => {
    if (checkedList.length === 0) return alert('삭제할 대상을 선택해주세요.');
    if (!globalThis.confirm('선택한 배송지를 삭제하시겠습니까?')) return;

    try {
      // API 호출
      await Promise.all(checkedList.map((addressId) => addressService.deleteAddress(addressId)));
      alert('삭제되었습니다.');

      // 상태 초기화 및 목록 갱신
      setCheckedList([]);
      loadAddressList();
    } catch (error) {
      console.error('삭제 에러:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 2. 체크박스 로직 (사용자님 기존 코드 유지)
  const handleAllCheck = (e) => {
    if (e.target.checked) setCheckedList(addresses.map((item) => item.addressId));
    else setCheckedList([]);
  };

  const handleSingleCheck = (checked, addressId) => {
    if (checked) setCheckedList((prev) => [...prev, addressId]);
    else setCheckedList((prev) => prev.filter((el) => el !== addressId));
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 타이틀 영역 (유지) */}
      <div style={{ width: '100%' }}>
        <h2
          style={{
            fontSize: vw(15),
            fontWeight: 'bold',
            textAlign: 'left',

            margin: `0 0 ${vw(15)} 0`,
          }}
        >
          배송지 주소록 관리
        </h2>
        <div
          style={{
            width: `calc(100% + ${vw(80)})`,
            marginLeft: vw(-40),
            height: vw(1),
            background: '#eee',
            marginBottom: vw(20),
          }}
        />
      </div>

      {/* 테이블 영역 (유지) */}

      <div
        style={{
          width: vw(580),
          height: vw(185),
          border: `${vw(1)} solid #E0E0E0`,
          borderRadius: vw(10),
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: vw(11),
          }}
        >
          <thead
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 1,
            }}
          >
            <tr style={{ borderBottom: `${vw(1)} solid #eee` }}>
              <th style={{ padding: vw(10), width: vw(30) }}>
                <input
                  type="checkbox"
                  onChange={handleAllCheck}
                  checked={addresses.length > 0 && checkedList.length === addresses.length}
                />
              </th>
              <th style={{ padding: vw(10) }}>고정</th>
              <th style={{ padding: vw(10) }}>배송지명</th>
              <th style={{ padding: vw(10) }}>수령인</th>
              <th style={{ padding: vw(10) }}>주소</th>
              <th style={{ padding: vw(10) }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {addresses.length > 0 ? (
              addresses.map((item, index) => (
                <tr
                  key={item.addressId || `addr-${index}`}
                  style={{ borderBottom: `${vw(1)} solid #f9f9f9` }}
                >
                  <td style={{ textAlign: 'center', padding: vw(10) }}>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSingleCheck(e.target.checked, item.addressId)}
                      checked={checkedList.includes(item.addressId)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {item.isDefault && (
                      <span
                        style={{
                          color: '#2C9753',
                          border: `${vw(1)} solid #2C9753`,
                          padding: '1px 3px',
                          borderRadius: '4px',
                          fontSize: vw(9),
                        }}
                      >
                        기본
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.addressTitle}</td>
                  <td style={{ textAlign: 'center' }}>{item.recipientName}</td>
                  <td style={{ textAlign: 'center', color: '#888' }}>
                    {item.address} {item.detailAddress}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button style={actionBtnStyle(vw, '#2C9753')}>적용</button>
                    <button style={actionBtnStyle(vw, '#ccc')}>수정</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: 'center',
                    padding: vw(40),
                    color: '#bbb',
                  }}
                >
                  등록된 배송지가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 버튼 (수정: onClick 연결) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: vw(15),
          marginTop: vw(40),
        }}
      >
        <button onClick={handleDeleteSelected} style={whiteBtnStyle(vw)}>
          선택 배송지 삭제
        </button>
        <button onClick={() => setIsModalOpen(true)} style={orangeBtnStyle(vw)}>
          배송지 등록
        </button>
      </div>

      <ShippingAddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadAddressList(); // 등록 후 갱신
        }}
        setAddresses={setAddresses}
      />
    </div>
  );
}

ShippingContent.propTypes = {
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      addressId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      isDefault: PropTypes.bool,
      addressTitle: PropTypes.string,
      recipientName: PropTypes.string,
      address: PropTypes.string,
      detailAddress: PropTypes.string,
      addressCode: PropTypes.string,
    }),
  ),
  setAddresses: PropTypes.func.isRequired,
};

const actionBtnStyle = (vw, color) => ({
  color,
  background: 'none',
  border: `${vw(1)} solid ${color}`,
  borderRadius: '4px',
  fontSize: vw(9),
  marginRight: vw(3),
  padding: '2px 4px',
  cursor: 'pointer',
});
const whiteBtnStyle = (vw) => ({
  width: vw(130),
  height: vw(35),
  borderRadius: vw(20),
  border: `${vw(1)} solid #ddd`,
  background: '#fff',
  color: '#888',
  fontSize: vw(10),
  fontWeight: 'bold',
  cursor: 'pointer',
});
const orangeBtnStyle = (vw) => ({
  width: vw(130),
  height: vw(35),
  borderRadius: vw(20),
  border: 'none',
  background: '#2C9753',
  color: '#fff',
  fontSize: vw(10),
  fontWeight: 'bold',
  cursor: 'pointer',
});

export default ShippingContent;
