import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

/**
 * ============================================================================
 * [팝업 설정 영역] POPUP CONFIGURATION
 * 관리자 및 운영자가 팝업의 동작, 이미지, 링크 등을 쉽게 변경할 수 있는 설정 영역입니다.
 * ============================================================================
 */
export const POPUP_CONFIG = {
  // 1. 팝업 전체 활성화 여부 (true: 표시, false: 완전히 숨김)
  POPUP_ENABLED: true,

  // 2. 팝업에 표시할 이미지 URL (외부 클라우드 / CDN 주소)
  POPUP_IMAGE_URL: "https://res.cloudinary.com/dxjz9ksjg/image/upload/v1787031768/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_18%EC%9D%BC_%EC%98%A4%ED%9B%84_02_42_29_jhlpcc.png",

  // 3. 팝업 이미지 클릭 시 이동할 URL (비워두면 클릭 시 동작하지 않음)
  POPUP_IMAGE_LINK: "",

  // 4. 상담 신청하기 버튼 문구
  CONSULTATION_BUTTON_TEXT: "상담 신청하기",

  // 5. 상담 신청 / 예약 버튼 클릭 시 이동할 URL (내부 경로 또는 네이버 예약 등 외부 링크 모두 지원)
  CONSULTATION_URL: "https://map.naver.com/p/search/%EB%B6%80%EC%82%B0%20%EC%84%B1%EB%B2%94%EC%A3%84%20%EC%8B%AC%EB%A6%AC%EC%83%81%EB%8B%B4/place/2050622926?searchType=place&lng=129.0357115&lat=35.1045449&placePath=%2Fticket%3FbookingRedirectUrl%3Dhttps%3A%2F%2Fm.booking.naver.com%2Fbooking%2F13%2Fbizes%2F1643592%26theme%3Dplace%26entry%3Dpll%26lang%3Dko%26entry%3Dpll%26service-target%3Dmap-pc%26pcmap%3D1%26from%3Dmap%26fromPanelNum%3D2%26timestamp%3D202608180537%26locale%3Dko%26svcName%3Dmap_pcv5%26searchText%3D%EB%B6%80%EC%82%B0%20%EC%84%B1%EB%B2%94%EC%A3%84%20%EC%8B%AC%EB%A6%AC%EC%83%81%EB%8B%B4&entry=pll&lang=ko&service-target=map-pc&pcmap=1&area=pll&c=15.00,0,0,0,dh",

  // 6. "오늘 하루 보지 않기" 기능 사용 여부 (true: 활성화, false: 단순 닫기만 제공)
  ENABLE_HIDE_TODAY: true,

  // 7. PC 데스크톱 기준 팝업 최대 가로 너비 (단위: px, 모바일에서는 화면 폭에 맞춰 자동 축소)
  POPUP_DESKTOP_WIDTH: 600,
};

// 로컬 스토리지에 저장되는 오늘 하루 보지 않기 키
const HIDE_TODAY_STORAGE_KEY = 'popup_hide_today_date';

export default function NoticePopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const location = useLocation();

  // 오늘 날짜 문자열 계산 (YYYY-MM-DD 형식, 사용자 로컬 시간대 기준)
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // 팝업이 비활성화되어 있거나 메인 랜딩페이지('/')가 아닌 경우 표시하지 않음
    if (!POPUP_CONFIG.POPUP_ENABLED || location.pathname !== '/') {
      setIsOpen(false);
      return;
    }

    // 오늘 하루 보지 않기 체크
    if (POPUP_CONFIG.ENABLE_HIDE_TODAY) {
      try {
        const savedDate = localStorage.getItem(HIDE_TODAY_STORAGE_KEY);
        const todayStr = getTodayDateString();
        if (savedDate === todayStr) {
          // 오늘 이미 "오늘 하루 보지 않기"를 누른 경우
          setIsOpen(false);
          return;
        }
      } catch {
        // localStorage 접근 제한 환경 예외 처리
      }
    }

    // 150ms 후 부드럽게 팝업 오픈
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // 배경 스크롤 방지 및 복원 처리
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // ESC 키로 팝업 닫기 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 단순 닫기
  const handleClose = () => {
    setIsOpen(false);
  };

  // 오늘 하루 보지 않기
  const handleHideToday = () => {
    try {
      const todayStr = getTodayDateString();
      localStorage.setItem(HIDE_TODAY_STORAGE_KEY, todayStr);
    } catch {
      // localStorage 오류 방어
    }
    setIsOpen(false);
  };

  // 상담 신청 링크 이동 처리
  const handleConsultationClick = () => {
    const url = POPUP_CONFIG.CONSULTATION_URL;
    if (!url) return;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };

  // 이미지 클릭 처리
  const handleImageClick = () => {
    const link = POPUP_CONFIG.POPUP_IMAGE_LINK;
    if (!link) return;

    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link;
    }
  };

  if (!POPUP_CONFIG.POPUP_ENABLED || !isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="custom-notice-popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="상담 안내 팝업"
          onClick={handleClose}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 select-none overflow-y-auto"
        >
          {/* 팝업 컨테이너 (내부 클릭 시 이벤트 버블링 차단) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: `min(${POPUP_CONFIG.POPUP_DESKTOP_WIDTH}px, calc(100vw - 30px))`,
              width: '100%',
            }}
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-100 max-h-[92vh]"
          >
            {/* 우측 상단 닫기 (X) 버튼 */}
            <button
              id="popup-close-x-button"
              type="button"
              onClick={handleClose}
              aria-label="팝업 닫기"
              className="absolute top-2.5 right-2.5 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* 팝업 내부 스크롤 가능 영역 (모바일 긴 이미지 대응) */}
            <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col">
              {/* 1. 팝업 이미지 영역 */}
              <div
                className={`relative w-full bg-slate-100 flex items-center justify-center ${
                  POPUP_CONFIG.POPUP_IMAGE_LINK ? 'cursor-pointer' : ''
                }`}
                onClick={POPUP_CONFIG.POPUP_IMAGE_LINK ? handleImageClick : undefined}
              >
                {!imageError ? (
                  <img
                    id="notice-popup-image"
                    src={POPUP_CONFIG.POPUP_IMAGE_URL}
                    alt="상담 안내"
                    className="w-full h-auto object-contain block transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500 py-16">
                    <p className="text-sm font-medium">이미지를 불러오는 중입니다.</p>
                  </div>
                )}
              </div>

              {/* 2. 상담 신청하기 버튼 영역 */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
                <button
                  id="popup-consultation-button"
                  type="button"
                  onClick={handleConsultationClick}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-[#1b365d] hover:bg-[#142846] active:bg-[#0e1c31] text-white font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1b365d] focus:ring-offset-2 [word-break:keep-all]"
                >
                  <span>{POPUP_CONFIG.CONSULTATION_BUTTON_TEXT}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* 3. 하단 기능 버튼 영역 (오늘 하루 보지 않기 | 닫기) */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium select-none">
                {POPUP_CONFIG.ENABLE_HIDE_TODAY ? (
                  <button
                    id="popup-hide-today-button"
                    type="button"
                    onClick={handleHideToday}
                    className="py-1.5 px-2 hover:text-slate-900 transition-colors cursor-pointer focus:outline-none hover:underline [word-break:keep-all]"
                  >
                    오늘 하루 보지 않기
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  {POPUP_CONFIG.ENABLE_HIDE_TODAY && (
                    <span className="text-slate-300 select-none">|</span>
                  )}
                  <button
                    id="popup-bottom-close-button"
                    type="button"
                    onClick={handleClose}
                    className="py-1.5 px-2 hover:text-slate-900 font-semibold transition-colors cursor-pointer focus:outline-none hover:underline [word-break:keep-all]"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
