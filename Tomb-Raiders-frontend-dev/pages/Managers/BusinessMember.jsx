import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Admin/Sidebar';
import { vw } from '../../utils/style';
import BusinessMemberTable from '../../components/Admin/Business/BusinessMemberTable';
import BusinessRequestTable from '../../components/Admin/Business/BusinessRequestTable';
import { get, patch, del } from '../../api/apiClient';

function BusinessMember() {
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [popupType, setPopupType] = useState(''); // 'member' | 'request'

  const fetchPartnersData = async () => {
    setIsLoading(true);
    try {
      const [membersRes, requestsRes] = await Promise.all([
        get('/admin/v1/partners'),
        get('/admin/v1/partners/pending'),
      ]);

      if (membersRes?.data?.isSuccess) {
        const rawMembers = membersRes.data.data?.content || membersRes.data.data || [];
        const approvedMembers = rawMembers.filter((m) => m.status !== 'PENDING');
        setMembers(approvedMembers);
      }

      if (requestsRes?.data?.isSuccess) {
        const requestData = requestsRes.data.data?.content || requestsRes.data.data || [];
        setRequests(requestData);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnersData();
  }, []);

  const handleApprove = async (partnerId) => {
    if (!globalThis.confirm('해당 회원의 파트너 신청을 수락하시겠습니까?')) return;
    try {
      const response = await patch(`/admin/v1/partners/${partnerId}/approve`);
      if (response?.data?.isSuccess) {
        globalThis.alert('파트너 신청이 수락되었습니다.');
        setSelectedUser(null);
        fetchPartnersData();
      }
    } catch (error) {
      console.error('수락 처리 실패:', error);
    }
  };

  const handleReject = async (partnerId) => {
    if (!globalThis.confirm('이 신청을 거절하시겠습니까?')) return;
    try {
      const response = await del(`/admin/v1/partners/${partnerId}/reject`);
      if (response?.data?.isSuccess) {
        globalThis.alert('파트너 신청이 거절되었습니다.');
        setSelectedUser(null);
        fetchPartnersData();
      }
    } catch (error) {
      console.error('거절 처리 실패:', error);
    }
  };

  const handleDelete = async (partnerId) => {
    if (!globalThis.confirm('정말로 이 파트너의 권한을 해제하시겠습니까?')) return;
    try {
      const response = await del(`/admin/v1/partners/${partnerId}`);
      if (response?.data?.isSuccess) {
        globalThis.alert('파트너 권한이 해제되었습니다.');
        setSelectedUser(null);
        fetchPartnersData();
      }
    } catch (error) {
      console.error('삭제 처리 실패:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F7F7] relative">
      <Sidebar />
      <main
        className="flex-1 flex flex-col items-center relative"
        style={{ padding: `${vw(50)} ${vw(80)}` }}
      >
        <div className="w-full max-w-[1400px]">
          <h2 className="font-bold text-left mb-10" style={{ fontSize: vw(20) }}>
            비지니스 회원 목록
          </h2>
          <section className="mb-16">
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: vw(20) }}>데이터를 불러오는 중...</div>
            ) : (
              <BusinessMemberTable
                data={members}
                onDelete={handleDelete}
                onView={(member) => {
                  setSelectedUser(member);
                  setPopupType('member');
                }}
              />
            )}
          </section>

          <section>
            <h3 className="font-bold text-left mb-6" style={{ fontSize: vw(16) }}>
              신규 비지니스 신청자 목록
            </h3>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: vw(20) }}>데이터를 불러오는 중...</div>
            ) : (
              <BusinessRequestTable
                data={requests}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={(applicant) => {
                  setSelectedUser(applicant);
                  setPopupType('request');
                }}
              />
            )}
          </section>
        </div>
      </main>

      {/* 💡 팝업창 (Modal) 전체를 덮는 어두운 배경 */}
      {selectedUser && (
        <div
          className="fixed top-0 left-0 w-screen h-screen z-[9999] flex justify-center items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(2px)' }}
        >
          {/* 💡 팝업창 본체: 무조건 불투명한 흰색(backgroundColor: '#ffffff')이 깔리도록 강제 적용! */}
          <div
            className="flex flex-col shadow-2xl overflow-hidden"
            style={{
              width: vw(550),
              borderRadius: vw(8),
              border: '1px solid #EEE',
              backgroundColor: '#ffffff',
            }}
          >
            {/* 1. 모달 헤더 (어두운 색) */}
            <div
              className="flex justify-between items-center"
              style={{
                backgroundColor: '#1A1A1A',
                color: '#ffffff',
                padding: `${vw(15)} ${vw(25)}`,
              }}
            >
              <h2 className="font-bold m-0" style={{ fontSize: vw(18) }}>
                {popupType === 'request' ? '신청자 상세 정보' : '비지니스 회원 상세 정보'}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="bg-transparent border-none cursor-pointer transition-colors hover:opacity-80"
                style={{ color: '#ffffff', fontSize: vw(20) }}
              >
                ✕
              </button>
            </div>

            {/* 2. 상세 정보 영역 (흰색 배경 고정) */}
            <div
              className="flex flex-col"
              style={{ backgroundColor: '#ffffff', padding: vw(30), gap: vw(20) }}
            >
              <div className="border-t border-[#EEE]">
                <div className="flex border-b border-[#EEE]" style={{ fontSize: vw(14) }}>
                  <div
                    className="font-bold flex items-center justify-center"
                    style={{
                      backgroundColor: '#F9F9F9',
                      color: '#666666',
                      width: '25%',
                      padding: vw(12),
                    }}
                  >
                    이름
                  </div>
                  <div
                    className="flex items-center"
                    style={{ color: '#333333', width: '75%', padding: vw(12) }}
                  >
                    {selectedUser.name || '-'}
                  </div>
                </div>
                <div className="flex border-b border-[#EEE]" style={{ fontSize: vw(14) }}>
                  <div
                    className="font-bold flex items-center justify-center"
                    style={{
                      backgroundColor: '#F9F9F9',
                      color: '#666666',
                      width: '25%',
                      padding: vw(12),
                    }}
                  >
                    연락처
                  </div>
                  <div
                    className="flex items-center"
                    style={{ color: '#333333', width: '75%', padding: vw(12) }}
                  >
                    {selectedUser.contact || '-'}
                  </div>
                </div>
                <div className="flex border-b border-[#EEE]" style={{ fontSize: vw(14) }}>
                  <div
                    className="font-bold flex items-center justify-center"
                    style={{
                      backgroundColor: '#F9F9F9',
                      color: '#666666',
                      width: '25%',
                      padding: vw(12),
                    }}
                  >
                    활동 지역
                  </div>
                  <div
                    className="flex items-center"
                    style={{ color: '#333333', width: '75%', padding: vw(12) }}
                  >
                    {selectedUser.location || '-'}
                  </div>
                </div>
              </div>

              {/* 3. 소개 및 포트폴리오 */}
              <div>
                <strong
                  className="block font-bold"
                  style={{ color: '#1A1A1A', marginBottom: vw(10), fontSize: vw(14) }}
                >
                  소개 및 포트폴리오
                </strong>
                <div
                  className="border border-[#DDD] overflow-y-auto leading-relaxed"
                  style={{
                    backgroundColor: '#F9F9F9',
                    color: '#333333',
                    padding: vw(15),
                    minHeight: vw(120),
                    maxHeight: vw(250),
                    fontSize: vw(14),
                    borderRadius: vw(4),
                  }}
                >
                  {selectedUser.introduce || '작성된 소개가 없습니다.'}
                </div>
              </div>
            </div>

            {/* 4. 하단 버튼 영역 */}
            <div
              className="border-t border-[#EEE] flex justify-center items-center gap-3"
              style={{ backgroundColor: '#ffffff', padding: `${vw(15)} 0` }}
            >
              {popupType === 'request' && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedUser.partnerId || selectedUser.id)}
                  className="font-bold cursor-pointer transition-colors shadow-sm border-none"
                  style={{
                    backgroundColor: '#2C9753',
                    color: '#ffffff',
                    padding: `${vw(10)} ${vw(40)}`,
                    fontSize: vw(14),
                    borderRadius: vw(4),
                  }}
                >
                  수락하기
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="font-bold cursor-pointer transition-colors border-none shadow-sm"
                style={{
                  backgroundColor: '#202020',
                  color: '#ffffff',
                  padding: `${vw(10)} ${vw(40)}`,
                  fontSize: vw(14),
                  borderRadius: vw(4),
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessMember;
