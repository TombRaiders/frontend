import React, { useState, useEffect } from 'react';
import { vw } from '../../utils/style';
import { get, post } from '../../api/apiClient';
import CustomAlertModal from '../../components/Common/CustomAlertModal';
import Sidebar from '../../components/Admin/Sidebar';

// 새로 분리한 컴포넌트들 Import
import ReportTable from '../../components/Admin/Report/ReportTable';
import BannedUserTable from '../../components/Admin/Report/BannedUserTable';
import BanModal from '../../components/Admin/Report/BanModal';
import UnbanModal from '../../components/Admin/Report/UnbanModal';

function ReportManagerPage() {
  const [activeTab, setActiveTab] = useState('REPORTS'); // 'REPORTS' | 'BANNED'
  const [reports, setReports] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [alertInfo, setAlertInfo] = useState({ isOpen: false, icon: '', title: '', message: '' });

  const [banModal, setBanModal] = useState({
    isOpen: false,
    searchLoginId: '',
    memberId: '',
    reason: '',
    day: '',
  });

  const [unbanModal, setUnbanModal] = useState({
    isOpen: false,
    searchLoginId: '',
    memberId: '',
  });

  const showAlert = (icon, title, message) => {
    setAlertInfo({ isOpen: true, icon, title, message });
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await get('/admin/v1/bulletin-boards/reports');
      if (res?.data?.isSuccess) {
        setReports(res.data.data.content || []);
      }
    } catch (error) {
      console.error('신고 내역 조회 실패:', error);
      showAlert('🚨', '조회 실패', '신고 내역을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBannedUsers = async () => {
    setIsLoading(true);
    try {
      const res = await get('/v1/admin/members/banned');
      if (res?.data?.isSuccess) {
        setBannedUsers(res.data.data || []);
      }
    } catch (error) {
      console.error('차단 회원 조회 실패:', error);
      showAlert('🚨', '조회 실패', '차단된 회원 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'REPORTS') fetchReports();
    else fetchBannedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSearchMemberId = async () => {
    if (!banModal.searchLoginId) {
      showAlert('🚨', '입력 오류', '검색할 로그인 ID를 입력해주세요.');
      return;
    }
    try {
      const res = await get(`/admin/v1/members/search?loginId=${banModal.searchLoginId}`);
      if (res?.data?.isSuccess && res.data.data) {
        const foundMemberId = res.data.data.memberId || res.data.data.id;
        setBanModal((prev) => ({ ...prev, memberId: foundMemberId }));
        showAlert('✅', '조회 성공', `회원 ID(${foundMemberId})가 자동으로 입력되었습니다.`);
      } else {
        showAlert('🚨', '조회 실패', '해당 로그인 ID를 가진 회원이 존재하지 않습니다.');
      }
    } catch (error) {
      console.error('회원 검색 실패:', error);
      showAlert('🚨', '조회 실패', '회원 조회 중 오류가 발생했습니다.');
    }
  };

  const handleSearchMemberIdForUnban = async () => {
    if (!unbanModal.searchLoginId) {
      showAlert('🚨', '입력 오류', '검색할 로그인 ID를 입력해주세요.');
      return;
    }
    try {
      const res = await get(`/admin/v1/members/search?loginId=${unbanModal.searchLoginId}`);
      if (res?.data?.isSuccess && res.data.data) {
        const foundMemberId = res.data.data.memberId || res.data.data.id;
        setUnbanModal((prev) => ({ ...prev, memberId: foundMemberId }));
        showAlert('✅', '조회 성공', `회원 ID(${foundMemberId})가 자동으로 입력되었습니다.`);
      } else {
        showAlert('🚨', '조회 실패', '해당 로그인 ID를 가진 회원이 존재하지 않습니다.');
      }
    } catch (error) {
      console.error('회원 검색 실패:', error);
      showAlert('🚨', '조회 실패', '회원 조회 중 오류가 발생했습니다.');
    }
  };

  const handleBanSubmit = async () => {
    if (!banModal.memberId || !banModal.reason) {
      showAlert('🚨', '입력 오류', '차단할 회원 ID와 사유를 모두 입력해주세요.');
      return;
    }

    try {
      const payload = {
        reason: banModal.reason,
        day: banModal.day ? Number(banModal.day) : null,
      };

      const res = await post(`/v1/admin/members/${banModal.memberId}/ban`, payload);
      if (res?.data?.isSuccess) {
        showAlert('✅', '차단 완료', '해당 회원이 성공적으로 차단되었습니다.');
        setBanModal({ isOpen: false, searchLoginId: '', memberId: '', reason: '', day: '' });
        if (activeTab === 'REPORTS') fetchReports();
        else fetchBannedUsers();
      }
    } catch (error) {
      console.error('회원 차단 실패:', error);
      showAlert(
        '🚨',
        '차단 실패',
        error.response?.data?.errorDetail?.message || '처리 중 오류가 발생했습니다.',
      );
    }
  };

  const handleManualUnbanSubmit = async () => {
    if (!unbanModal.memberId) {
      showAlert('🚨', '입력 오류', '차단 해제할 회원의 ID를 입력해주세요.');
      return;
    }

    try {
      const res = await post(`/v1/admin/members/${unbanModal.memberId}/unban`);
      if (res?.data?.isSuccess) {
        showAlert('✅', '해제 완료', '해당 회원의 차단이 성공적으로 해제되었습니다.');
        setUnbanModal({ isOpen: false, searchLoginId: '', memberId: '' });
        if (activeTab === 'BANNED') fetchBannedUsers();
      }
    } catch (error) {
      console.error('차단 해제 실패:', error);
      showAlert(
        '🚨',
        '해제 실패',
        '오류가 발생했습니다. 존재하지 않는 ID이거나 이미 해제된 회원입니다.',
      );
    }
  };

  const handleUnban = async (memberId) => {
    if (!globalThis.confirm(`정말 차단을 해제하시겠습니까?`)) return;

    try {
      const res = await post(`/v1/admin/members/${memberId}/unban`);
      if (res?.data?.isSuccess) {
        showAlert('✅', '해제 완료', '차단이 해제되었습니다.');
        fetchBannedUsers();
      }
    } catch (error) {
      console.error('차단 해제 실패:', error);
      showAlert('🚨', '해제 실패', '오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: vw(40),
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: vw(30),
          }}
        >
          <h2 style={{ fontSize: vw(26), fontWeight: 'bold', color: '#0F172A', margin: 0 }}>
            신고 및 제재 관리
          </h2>

          <div style={{ display: 'flex', gap: vw(10) }}>
            <button
              onClick={() => setUnbanModal({ ...unbanModal, isOpen: true })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: vw(8),
                padding: `${vw(12)} ${vw(24)}`,
                backgroundColor: '#10B981',
                color: '#FFF',
                borderRadius: vw(8),
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: vw(15),
                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
              }}
            >
              <span>🔓</span> 수동 차단 해제
            </button>
            <button
              onClick={() => setBanModal({ ...banModal, isOpen: true })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: vw(8),
                padding: `${vw(12)} ${vw(24)}`,
                backgroundColor: '#EF4444',
                color: '#FFF',
                borderRadius: vw(8),
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: vw(15),
                boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
              }}
            >
              <span>🚨</span> 수동 회원 차단
            </button>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: vw(12),
            padding: vw(30),
            flex: 1,
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
          }}
        >
          {/* 탭 버튼 */}
          <div
            style={{
              display: 'flex',
              gap: vw(20),
              borderBottom: `${vw(1)} solid #E2E8F0`,
              marginBottom: vw(25),
            }}
          >
            <button
              onClick={() => setActiveTab('REPORTS')}
              style={{
                padding: `0 0 ${vw(15)} 0`,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom:
                  activeTab === 'REPORTS' ? `${vw(3)} solid #2C9753` : `${vw(3)} solid transparent`,
                fontWeight: activeTab === 'REPORTS' ? 'bold' : '600',
                color: activeTab === 'REPORTS' ? '#2C9753' : '#94A3B8',
                fontSize: vw(16),
                cursor: 'pointer',
              }}
            >
              신고 접수 내역
            </button>
            <button
              onClick={() => setActiveTab('BANNED')}
              style={{
                padding: `0 0 ${vw(15)} 0`,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom:
                  activeTab === 'BANNED' ? `${vw(3)} solid #2C9753` : `${vw(3)} solid transparent`,
                fontWeight: activeTab === 'BANNED' ? 'bold' : '600',
                color: activeTab === 'BANNED' ? '#2C9753' : '#94A3B8',
                fontSize: vw(16),
                cursor: 'pointer',
              }}
            >
              차단된 회원 목록
            </button>
          </div>

          {/* 분리된 테이블 컴포넌트 렌더링 */}
          {activeTab === 'REPORTS' ? (
            <ReportTable reports={reports} isLoading={isLoading} />
          ) : (
            <BannedUserTable
              bannedUsers={bannedUsers}
              isLoading={isLoading}
              onUnban={handleUnban}
            />
          )}
        </div>
      </main>

      {/* 분리된 모달 컴포넌트 렌더링 */}
      <BanModal
        modalData={banModal}
        setModalData={setBanModal}
        onSearch={handleSearchMemberId}
        onSubmit={handleBanSubmit}
        onClose={() =>
          setBanModal({ isOpen: false, searchLoginId: '', memberId: '', reason: '', day: '' })
        }
      />

      <UnbanModal
        modalData={unbanModal}
        setModalData={setUnbanModal}
        onSearch={handleSearchMemberIdForUnban}
        onSubmit={handleManualUnbanSubmit}
        onClose={() => setUnbanModal({ isOpen: false, searchLoginId: '', memberId: '' })}
      />

      {/* 알럿 모달 */}
      <CustomAlertModal
        isOpen={alertInfo.isOpen}
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
        icon={alertInfo.icon}
        title={alertInfo.title}
        description={alertInfo.message}
        leftBtnText="확인"
      />
    </div>
  );
}

export default ReportManagerPage;
