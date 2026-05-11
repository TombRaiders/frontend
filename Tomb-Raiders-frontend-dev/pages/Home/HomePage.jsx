import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import HeaderSection from '../../components/HomePage/HeaderSection';
import Footer from '../../components/Common/Footer';
import { get } from '../../api/apiClient';
import { convertToSafeImage } from '../../utils/imageUtils';

const RAIL_IMAGE_LOADING_TEXT = '이미지 로딩 중';

const heroSlides = [
  {
    id: 'hero-1',
    title: '나만의 굿즈를 만들기 ',
    desc: '자신만의 사진으로 굿즈를 만들자!',
    img: '/image94.png',
  },
  {
    id: 'hero-2',
    title: '출력 의뢰하기',
    desc: '3D 모델링 파일을 갖고계신가요? \n 다양한 소재로 제작을 맡겨보세요!',
    img: '/Frame296.png',
  },
  {
    id: 'hero-3',
    title: '커뮤니티',
    desc: '다양한 후기와 이야기를 작성해주세요 ',
    img: '/image98.png',
  },
  {
    id: 'hero-4',
    title: '다양한 굿즈를 제작의뢰 해보세요',
    desc: '원하는 모든 것을 굿즈로 만들어보세요!',
    img: '/image96.png',
  },
];

const fallbackReviews = Array.from({ length: 4 }, (_, i) => ({
  boardId: null,
  id: `fallback-review-${i}`,
  imageUrl: '',
  title: '나만 없어 고양이',
  authorNickname: '유저 닉네임',
  authorProfileImageUrl: '',
}));
const fallbackCommunityPosts = Array.from({ length: 4 }, (_, i) => ({
  boardId: null,
  id: `fallback-community-${i}`,
  imageUrl: '',
  title: '키링 제작 완료!',
  authorNickname: '제작마스터',
  authorProfileImageUrl: '',
}));
const fallbackMarqueeImages = Array.from({ length: 10 }, (_, i) => ({
  id: `fallback-main-image-${i}`,
  imageUrl: '',
  title: `메인 이미지 ${i + 1}`,
}));

const fallbackNotices = [
  {
    id: 'fb-1',
    badge: '필독',
    title: 'MAKERCTION 2026년 신규 가입 이벤트 안내',
    date: '2026-04-23',
    isRequired: true,
    author: '관리자',
  },
  {
    id: 'fb-2',
    badge: '공지사항',
    title: '제작 의뢰 전 주의사항 필독',
    date: '2026-04-23',
    isRequired: false,
    author: '관리자',
  },
  {
    id: 'fb-3',
    badge: '공지',
    title: '배송 지연에 따른 보상 절차 안내',
    date: '2026-04-22',
    isRequired: false,
    author: '관리자',
  },
  {
    id: 'fb-4',
    badge: '공지',
    title: '개인정보 처리방침 변경 사전 안내',
    date: '2026-04-20',
    isRequired: false,
    author: '관리자',
  },
];

const formatNoticeDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? String(dateString).slice(0, 10)
    : date.toISOString().slice(0, 10);
};

const getPostImageUrl = (post) => {
  const imageUrl =
    post.imageUrl ||
    post.thumbnailUrl ||
    post.assetUrl ||
    post.images?.[0]?.imageUrl ||
    post.images?.[0]?.url ||
    '';

  return convertToSafeImage(imageUrl);
};

const toBoardPreview = (post, index, prefix, fallbackTitle) => {
  const boardId = post.boardId || post.bulletinBoardId;

  return {
    boardId,
    id: boardId || `${prefix}-${index}`,
    imageUrl: getPostImageUrl(post),
    title: post.title || fallbackTitle,
    authorNickname: post.authorNickname || post.nickname || post.loginId || '글 작성자',
    authorProfileImageUrl: convertToSafeImage(
      post.authorProfileImageUrl || post.profileImageUrl || '',
    ),
  };
};

const createMarqueeItems = (images, prefix) =>
  Array.from({ length: 20 }, (_, index) => {
    const image = images[index % images.length];
    return {
      ...image,
      id: `${prefix}-${image.id || image.imageId || image.mainImageId || index}-${index}`,
    };
  });

function HomePage({
  goToSignup,
  goToLogin,
  goToCommission,
  goToCommissionCheck,
  goToMember,
  goToBulletinBoard,
  goToAdmin,
  goToPartner,
}) {
  const vw = (px) => `${(px / 1920) * 100}vw`;
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [notices, setNotices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [mainImages, setMainImages] = useState([]);
  const [failedRailImageUrls, setFailedRailImageUrls] = useState(() => new Set());
  const [noticeTab, setNoticeTab] = useState('전체');

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrevSlide = useCallback(
    () => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1)),
    [],
  );
  const handleNextSlide = useCallback(
    () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length),
    [],
  );

  const handleNoticeClick = useCallback(
    (notice) => {
      const params = new URLSearchParams({ type: 'ADMIN_BOARD' });
      if (notice.boardId) params.set('boardId', String(notice.boardId));
      navigate(`/bulletinboard?${params.toString()}`);
    },
    [navigate],
  );

  const handleBoardPostClick = useCallback(
    (boardId, type) => {
      if (!boardId) return;

      const params = new URLSearchParams({ type, boardId: String(boardId) });
      navigate(`/bulletinboard?${params.toString()}`);
    },
    [navigate],
  );

  const handleRailImageError = useCallback((imageUrl) => {
    setFailedRailImageUrls((prev) => {
      if (prev.has(imageUrl)) return prev;

      const next = new Set(prev);
      next.add(imageUrl);
      return next;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchNotices = async () => {
      try {
        const params = new URLSearchParams({
          type: 'ADMIN_BOARD',
          page: '0',
          size: '4',
          sort: 'createdAt,desc',
        });
        const response = await get(`/v1/bulletin-boards?${params.toString()}`);
        if (!isMounted || !response?.data?.isSuccess) return;
        const pageData = response.data.data || {};
        const content = (pageData.content || []).slice(0, 4);
        setNotices(
          content.map((post) => ({
            boardId: post.boardId || post.bulletinBoardId,
            id: post.boardId || post.bulletinBoardId,
            badge: '공지사항',
            title: post.title || '공지사항',
            date: formatNoticeDate(post.createdAt),
            isRequired: false,
            author: '관리자',
          })),
        );
      } catch (error) {
        console.error('Notice fetch error:', error);
        if (isMounted) setNotices([]);
      }
    };
    fetchNotices();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        const response = await get('/v1/main/bulletin-boards');
        if (!isMounted || !response?.data?.isSuccess || !Array.isArray(response.data.data)) return;

        setReviews(
          response.data.data
            .slice(0, 4)
            .map((review, index) => toBoardPreview(review, index, 'main-review', '후기')),
        );
      } catch (error) {
        if (isMounted) setReviews([]);
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCommunityPosts = async () => {
      try {
        const params = new URLSearchParams({
          type: 'FREE_BOARD',
          page: '0',
          size: '4',
          sort: 'createdAt,desc',
        });
        const response = await get(`/v1/bulletin-boards?${params.toString()}`);
        if (!isMounted || !response?.data?.isSuccess) return;

        const pageData = response.data.data || {};
        const content = (pageData.content || []).slice(0, 4);
        setCommunityPosts(
          content.map((post, index) => toBoardPreview(post, index, 'community', '커뮤니티 글')),
        );
      } catch (error) {
        if (isMounted) setCommunityPosts([]);
      }
    };

    fetchCommunityPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchMainImages = async () => {
      try {
        const response = await get('/v1/main/rail-images');
        if (!isMounted || !response?.data?.isSuccess || !Array.isArray(response.data.data)) return;

        setMainImages(
          response.data.data.map((image, index) => ({
            id: image.id || image.imageId || image.mainImageId || index,
            imageUrl: convertToSafeImage(image.imageUrl || image.url || ''),
            title: image.altText || image.title || `메인 이미지 ${index + 1}`,
          })),
        );
      } catch (error) {
        if (isMounted) setMainImages([]);
      }
    };

    fetchMainImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleNotices = notices.length > 0 ? notices : fallbackNotices;
  const visibleReviews = reviews.length > 0 ? reviews : fallbackReviews;
  const visibleCommunityPosts = communityPosts.length > 0 ? communityPosts : fallbackCommunityPosts;
  const visibleMainImages = mainImages.length > 0 ? mainImages : fallbackMarqueeImages;
  const topMarqueeItems = createMarqueeItems(visibleMainImages, 'top-mq');
  const bottomMarqueeItems = createMarqueeItems(visibleMainImages, 'bot-mq');
  const filteredNotices = visibleNotices.filter((n) => {
    if (noticeTab === '전체') return true;
    if (noticeTab === '필독') return n.isRequired || n.badge === '필독';
    if (noticeTab === '일반사항') return !n.isRequired && n.badge !== '필독';
    return true;
  });

  const renderBoardCard = (post, boardType) => (
    <button
      key={post.boardId || post.id}
      type="button"
      className="cursor-pointer group text-left p-0 bg-transparent border-none"
      onClick={() => handleBoardPostClick(post.boardId, boardType)}
      disabled={!post.boardId}
      style={{ cursor: post.boardId ? 'pointer' : 'default' }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1/1',
          backgroundColor: '#F5F5F5',
          borderRadius: vw(12),
          marginBottom: vw(16),
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="group-hover:opacity-80 transition-opacity"
      >
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: '#999', fontSize: vw(15), fontWeight: '700' }}>사진</span>
        )}
      </div>
      <h3 style={{ fontSize: vw(16), fontWeight: '700', marginBottom: vw(10) }}>{post.title}</h3>
      <div className="flex items-center" style={{ gap: vw(8) }}>
        <div
          style={{
            width: vw(24),
            height: vw(24),
            borderRadius: '50%',
            backgroundColor: '#E0E0E0',
            overflow: 'hidden',
          }}
        >
          {post.authorProfileImageUrl && (
            <img
              src={post.authorProfileImageUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        <span style={{ fontSize: vw(13), color: '#666' }}>{post.authorNickname}</span>
      </div>
    </button>
  );

  const renderMarqueeItem = (item) => (
    <div
      key={item.id}
      className="bg-[#F5F5F5] flex-shrink-0 overflow-hidden flex items-center justify-center"
      style={{
        width: vw(280),
        height: vw(210),
        marginRight: vw(20),
        borderRadius: vw(20),
      }}
    >
      {item.imageUrl && !failedRailImageUrls.has(item.imageUrl) ? (
        <img
          src={item.imageUrl}
          alt={item.title || '메인 등록 이미지'}
          onError={() => handleRailImageError(item.imageUrl)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ color: '#999', fontSize: vw(15), fontWeight: '700' }}>
          {item.imageUrl ? RAIL_IMAGE_LOADING_TEXT : '이미지 등록 예정'}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#FFFFFF] flex flex-col items-center font-sans overflow-x-hidden text-[#111]">
      <style>
        {`
          @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .marquee-container { display: flex; width: max-content; animation: scroll-left 50s linear infinite; }
          .marquee-container:hover { animation-play-state: paused; }
        `}
      </style>

      <HeaderSection
        vw={vw}
        goToLogin={goToLogin}
        goToCommission={goToCommission}
        goToCommissionCheck={goToCommissionCheck}
        goToMember={goToMember}
        goToBulletinBoard={goToBulletinBoard}
        goToAdmin={goToAdmin}
        goToPartner={goToPartner}
      />

      <main className="w-full flex flex-col items-center">
        {/* 1. 히어로 섹션 */}
        <section
          className="w-full relative flex items-center justify-center overflow-hidden bg-[#222]"
          style={{ height: vw(750) }}
          aria-label="메인 슬라이드"
        >
          <button
            type="button"
            onClick={handlePrevSlide}
            aria-label="Previous slide"
            style={{
              position: 'absolute',
              left: vw(60),
              zIndex: 10,
              background: 'none',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
              opacity: 0.7,
              padding: vw(20),
            }}
          >
            <svg
              width={vw(50)}
              height={vw(50)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div
            className="relative flex transition-transform duration-500 ease-in-out w-full h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)`, zIndex: 2 }}
          >
            {heroSlides.map((slide) => (
              <div
                key={slide.id}
                className="w-full h-full flex-shrink-0 flex justify-center items-center relative"
                style={{
                  backgroundImage: `url(${slide.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/40" style={{ zIndex: 0 }} />
                <div
                  style={{
                    width: vw(1200),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    zIndex: 1,
                    paddingBottom: vw(50),
                  }}
                >
                  <h1
                    style={{
                      fontSize: vw(64),
                      fontWeight: '800',
                      color: '#FFF',
                      marginBottom: vw(20),
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    {slide.title}
                  </h1>
                  <p
                    style={{
                      fontSize: vw(24),
                      color: '#FFF',
                      marginBottom: vw(50),
                      textShadow: '0 1px 5px rgba(0,0,0,0.3)',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.4',
                      opacity: 0.9,
                    }}
                  >
                    {slide.desc}
                  </p>
                  <button
                    type="button"
                    onClick={goToCommission}
                    style={{
                      backgroundColor: '#32D964',
                      color: '#FFF',
                      fontSize: vw(18),
                      fontWeight: 'bold',
                      padding: `${vw(14)} ${vw(40)}`,
                      borderRadius: vw(8),
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    더 알아보기 &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextSlide}
            aria-label="Next slide"
            style={{
              position: 'absolute',
              right: vw(60),
              zIndex: 10,
              background: 'none',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
              opacity: 0.7,
              padding: vw(20),
            }}
          >
            <svg
              width={vw(50)}
              height={vw(50)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div
            style={{
              position: 'absolute',
              bottom: vw(30),
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: vw(15),
              zIndex: 10,
            }}
          >
            <div className="flex gap-2">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  style={{
                    width: vw(10),
                    height: vw(10),
                    borderRadius: '50%',
                    backgroundColor: currentSlide === idx ? '#32D964' : 'rgba(255,255,255,0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Play slide animation' : 'Pause slide animation'}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFF',
                cursor: 'pointer',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPaused ? (
                <svg width={vw(16)} height={vw(16)} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg width={vw(16)} height={vw(16)} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>
          </div>
        </section>

        {/* 2. MAKERCTION 소개 섹션 */}
        <section
          style={{ width: vw(1200), marginTop: vw(100), marginBottom: vw(100), textAlign: 'left' }}
        >
          <h2
            style={{ fontSize: vw(28), fontWeight: '800', lineHeight: '1.4', marginBottom: vw(40) }}
          >
            <span
              style={{ color: '#32D964', fontSize: vw(16), display: 'block', marginBottom: vw(8) }}
            >
              MAKERCTION소개
            </span>
            세상에 단 하나뿐인 굿즈가 탄생하는 공간,
            <br />
            MAKERCTION을 소개합니다.
          </h2>
          <div className="flex gap-6 w-full">
            {[
              {
                id: 'intro-1',
                title: '상상을 현실로, 사진 한 장이면 충분합니다.',
                desc: '간직하고 싶은 모든 아이디어를 사진 한 장으로 시작하세요. AI가 이미지를 세밀하게 분석하여 3D 모델 제작의 모든 과정을 돕습니다.',
                img: '/image95.png',
              },
              {
                id: 'intro-2',
                title: '장비가 없어도 괜찮습니다.',
                desc: '보유하신 3D 모델링 파일을 전문가의 제작 시스템에 맡겨보세요. 전문가의 깊은 노하우와 검증된 공정으로 원하시는 결과물을 완벽하게 구현합니다.',
                img: '/image95.png',
              },
              {
                id: 'intro-3',
                title: '작업물을 공유하고 함께 성장하는 커뮤니티',
                desc: '완성된 3D 모델링과 굿즈를 공유하고 제작자들과 소통하세요. 다양한 아이디어가 교차하며 새로운 창작의 가능성을 열어가는 커뮤니티 공간입니다.',
                img: '/image95.png',
              },
            ].map((info) => (
              <div key={info.id} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <img
                  src={info.img}
                  alt={info.title}
                  style={{
                    width: '95%',
                    height: vw(220),
                    objectFit: 'cover',
                    borderRadius: vw(12),
                    marginBottom: vw(24),
                    backgroundColor: '#F0F0F0',
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x220?text=No+Image';
                  }}
                />
                <h3
                  style={{
                    fontSize: vw(18),
                    fontWeight: '700',
                    marginBottom: vw(12),
                    color: '#111',
                  }}
                >
                  {info.title}
                </h3>
                <p
                  style={{
                    fontSize: vw(14),
                    color: '#666',
                    lineHeight: '1.6',
                    wordBreak: 'keep-all',
                  }}
                >
                  {info.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 굿즈 생성 과정 섹션 */}
        <section
          className="w-full flex justify-center"
          style={{ backgroundColor: '#F8F9FA', padding: `${vw(80)} 0` }}
        >
          <div
            style={{
              width: vw(1200),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <h2 style={{ fontSize: vw(28), fontWeight: '800', marginBottom: vw(12) }}>
              굿즈가 생성되는 과정
            </h2>
            <p style={{ fontSize: vw(15), color: '#666', marginBottom: vw(50) }}>
              “Makertion은 여러분의 상상을 현실로 만들어드립니다.”
            </p>
            <div
              style={{
                width: '100%',
                backgroundColor: '#FFF',
                borderRadius: vw(20),
                padding: `${vw(60)} ${vw(80)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: vw(177.5),
                  left: vw(185),
                  right: vw(185),
                  height: vw(8),
                  backgroundColor: '#32D964',
                  zIndex: 1,
                }}
              />
              {[
                {
                  id: 'st-1',
                  step: 1,
                  title: 'Ai를 활용한 모델링 만들기',
                  desc: '사진 속 형태와 특징을 AI가 분석하고,\n나만의 3D 모델링을 제작합니다.',
                  img: '/image1.png',
                },
                {
                  id: 'st-2',
                  step: 2,
                  title: '견적 신청하기',
                  desc: '완성된 모델링을 바탕으로\n견적을 빠르게 보내드려요.',
                  img: '/image2.png',
                },
                {
                  id: 'st-3',
                  step: 3,
                  title: '굿즈 완성하기',
                  desc: '세상에 단 하나뿐인\n나만의 굿즈를 만나보세요!',
                  img: '/image3.png',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2,
                    width: vw(250),
                  }}
                >
                  <img
                    src={item.img}
                    alt={`step${item.step}`}
                    style={{
                      width: vw(80),
                      height: vw(80),
                      marginBottom: vw(20),
                      objectFit: 'contain',
                    }}
                  />
                  <div
                    style={{
                      width: vw(35),
                      height: vw(35),
                      backgroundColor: '#FFF',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: vw(20),
                      border: `5px solid #32D964`,
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: vw(18), fontWeight: '700', color: '#000' }}>
                      {item.step}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: vw(18),
                      fontWeight: '700',
                      marginBottom: vw(12),
                      textAlign: 'center',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: vw(14),
                      color: '#666',
                      textAlign: 'center',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.5',
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. 후기 & 커뮤니티 */}
        <section
          style={{
            width: vw(1200),
            paddingTop: vw(100),
            paddingBottom: vw(60),
            display: 'flex',
            flexDirection: 'column',
            gap: vw(80),
          }}
        >
          <section aria-labelledby="review-heading">
            <div className="flex justify-between items-end" style={{ marginBottom: vw(30) }}>
              <h2 id="review-heading" style={{ fontSize: vw(24), fontWeight: '800' }}>
                생생한 후기
              </h2>
              <button
                type="button"
                onClick={() => navigate('/bulletinboard?type=BRAGGING_BOARD')}
                style={{
                  fontSize: vw(14),
                  color: '#888',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                더 많은 후기 보러가기 &gt;
              </button>
            </div>
            <div className="grid grid-cols-4" style={{ gap: vw(24) }}>
              {visibleReviews.map((review) => renderBoardCard(review, 'BRAGGING_BOARD'))}
            </div>
          </section>

          <section aria-labelledby="community-heading">
            <div className="flex justify-between items-end" style={{ marginBottom: vw(30) }}>
              <h2 id="community-heading" style={{ fontSize: vw(24), fontWeight: '800' }}>
                커뮤니티
              </h2>
              <button
                type="button"
                onClick={() => navigate('/bulletinboard?type=FREE_BOARD')}
                style={{
                  fontSize: vw(14),
                  color: '#888',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                커뮤니티 보러가기 &gt;
              </button>
            </div>
            <div className="grid grid-cols-4" style={{ gap: vw(24) }}>
              {visibleCommunityPosts.map((post) => renderBoardCard(post, 'FREE_BOARD'))}
            </div>
          </section>
        </section>

        {/* 5. 안내사항 */}
        <section
          className="w-full flex justify-center"
          style={{ backgroundColor: '#F8F9FA', padding: `${vw(80)} 0` }}
        >
          <div
            style={{
              width: vw(1200),
              backgroundColor: '#FFF',
              borderRadius: vw(20),
              padding: vw(50),
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                borderBottom: '2px solid #111',
                paddingBottom: vw(20),
                marginBottom: vw(10),
              }}
            >
              <h2 style={{ fontSize: vw(24), fontWeight: '800' }}>안내사항</h2>
              <div className="flex items-center" style={{ gap: vw(20) }}>
                {['전체', '필독', '일반사항'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setNoticeTab(tab)}
                    style={{
                      fontSize: vw(15),
                      fontWeight: noticeTab === tab ? '700' : '500',
                      color: noticeTab === tab ? '#111' : '#888',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {tab}
                    {noticeTab === tab && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: vw(-24),
                          left: 0,
                          width: '100%',
                          height: vw(3),
                          backgroundColor: '#111',
                        }}
                      />
                    )}
                  </button>
                ))}
                <span style={{ color: '#E0E0E0' }}>|</span>
                <button
                  type="button"
                  onClick={() => navigate('/bulletinboard?type=ADMIN_BOARD')}
                  style={{
                    fontSize: vw(14),
                    color: '#888',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  더보기 &gt;
                </button>
              </div>
            </div>
            <div className="flex flex-col">
              {filteredNotices.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  onClick={() => handleNoticeClick(notice)}
                  className="flex items-center hover:bg-[#F9F9F9] cursor-pointer transition-colors w-full bg-transparent border-none p-0 border-b border-[#EAEAEA]"
                  style={{ padding: `${vw(20)} 0` }}
                >
                  <div style={{ width: vw(80), textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        border: notice.isRequired ? '1px solid #DC2626' : '1px solid #3B82F6',
                        color: notice.isRequired ? '#DC2626' : '#3B82F6',
                        fontSize: vw(12),
                        fontWeight: 'bold',
                        padding: `${vw(4)} ${vw(10)}`,
                        borderRadius: vw(20),
                      }}
                    >
                      {notice.badge}
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      paddingLeft: vw(20),
                      fontSize: vw(16),
                      color: '#333',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textAlign: 'left',
                    }}
                  >
                    {notice.title}
                  </div>
                  <div
                    style={{ width: vw(100), textAlign: 'center', fontSize: vw(14), color: '#888' }}
                  >
                    {notice.author}
                  </div>
                  <div
                    style={{ width: vw(120), textAlign: 'right', fontSize: vw(14), color: '#888' }}
                  >
                    {notice.date}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 흐르는 그리드 */}
        <section
          className="w-full flex flex-col overflow-hidden"
          style={{ paddingTop: vw(80), paddingBottom: vw(60) }}
        >
          <div className="marquee-container" style={{ marginBottom: vw(20) }}>
            {topMarqueeItems.map(renderMarqueeItem)}
          </div>
          <div className="marquee-container" style={{ animationDirection: 'reverse' }}>
            {bottomMarqueeItems.map(renderMarqueeItem)}
          </div>
        </section>
      </main>
      <Footer vw={vw} />
    </div>
  );
}

HomePage.propTypes = {
  goToSignup: PropTypes.func.isRequired,
  goToLogin: PropTypes.func.isRequired,
  goToCommission: PropTypes.func.isRequired,
  goToCommissionCheck: PropTypes.func.isRequired,
  goToMember: PropTypes.func.isRequired,
  goToBulletinBoard: PropTypes.func.isRequired,
  goToAdmin: PropTypes.func.isRequired,
  goToPartner: PropTypes.func.isRequired,
};

export default HomePage;
