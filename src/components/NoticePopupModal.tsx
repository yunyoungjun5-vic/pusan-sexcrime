import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * ============================================================================
 * [팝업 전체 설정 영역] POPUP CONFIGURATION
 * 1차 팝업 (할인/상담 포스터 팝업) 및 2차 팝업 (대표원장 방송·강연 아카이브 포스터 팝업)
 * ============================================================================
 */
export const POPUP_CONFIG = {
  // 1차 팝업 활성화 여부
  POPUP_1_ENABLED: true,

  // 1차 팝업 포스터 이미지 URL
  POPUP_1_IMAGE_URL: "https://res.cloudinary.com/dxjz9ksjg/image/upload/v1792028859/29%EB%A7%8C%EC%9B%90_39%EB%A7%8C%EC%9B%90_%EC%B5%9C%EC%A2%85_%ED%95%A0%EC%9D%B8_%ED%8F%AC%EC%8A%A4%ED%84%B0_v91ibb.png",
  POPUP_1_IMAGE_LINK: "",

  // 1차 팝업 상담 신청 버튼 문구 및 이동 URL
  CONSULTATION_BUTTON_TEXT: "상담 신청하기",
  CONSULTATION_URL: "https://map.naver.com/p/search/%EB%B6%80%EC%82%B0%20%EC%84%B1%EB%B2%94%EC%A3%84%20%EC%8B%AC%EB%A6%AC%EC%83%81%EB%8B%B4/place/2050622926?searchType=place&lng=129.0357115&lat=35.1045449&placePath=%2Fticket%3FbookingRedirectUrl%3Dhttps%3A%2F%2Fm.booking.naver.com%2Fbooking%2F13%2Fbizes%2F1643592%26theme%3Dplace%26entry%3Dpll%26lang%3Dko%26entry%3Dpll%26service-target%3Dmap-pc%26pcmap%3D1%26from%3Dmap%26fromPanelNum%3D2%26timestamp%3D202608180537%26locale%3Dko%26svcName%3Dmap_pcv5%26searchText%3D%EB%B6%80%EC%82%B0%20%EC%84%B1%EB%B2%94%EC%A3%84%20%EC%8B%AC%EB%A6%AC%EC%83%81%EB%8B%B4&entry=pll&lang=ko&service-target=map-pc&pcmap=1&area=pll&c=15.00,0,0,0,dh",

  // 2차 팝업 (대표원장 방송·강연 아카이브) 활성화 여부 및 이미지 URL
  POPUP_2_ENABLED: true,
  POPUP_2_IMAGE_URL: "https://res.cloudinary.com/dxjz9ksjg/image/upload/v1792029306/%EC%9E%AC%EB%B2%94%EB%B0%A9%EC%A7%80_%EA%B5%90%EC%9C%A1_%EA%B0%95%EC%A1%B0_%ED%8F%AC%EC%8A%A4%ED%84%B0_vqekac.png",
  POPUP_2_BUTTON_TEXT: "방송 출연 · 강연 기록 보기",
  POPUP_2_BUTTON_URL: "/media/appearance", // 방송 출연·강연 기록 보기 클릭 시 이동 경로

  // "오늘 하루 보지 않기" 기능 사용 여부
  ENABLE_HIDE_TODAY: true,

  // 데스크톱 기준 팝업 최대 가로 너비 (단위: px, 첫 번째 팝업과 동일)
  POPUP_DESKTOP_WIDTH: 520,
};

// 로컬 스토리지 키
const HIDE_TODAY_STORAGE_KEY_POPUP_1 = 'popup_hide_today_date';
const HIDE_TODAY_STORAGE_KEY_POPUP_2 = 'popup_hide_today_date_archive';

export default function NoticePopupModal() {
  // 현재 열려있는 팝업 단계: 0: 없음, 1: 첫 번째 팝업, 2: 두 번째 팝업
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
  const [imageError1, setImageError1] = useState(false);
  const [imageError2, setImageError2] = useState(false);
  const [hideTodayChecked2, setHideTodayChecked2] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // 오늘 날짜 문자열 계산 (YYYY-MM-DD 형식)
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // 메인 랜딩페이지('/')가 아니면 팝업 표시 안 함
    if (location.pathname !== '/') {
      setActiveStep(0);
      return;
    }

    const todayStr = getTodayDateString();

    let popup1Hidden = false;
    let popup2Hidden = false;

    if (POPUP_CONFIG.ENABLE_HIDE_TODAY) {
      try {
        const savedDate1 = localStorage.getItem(HIDE_TODAY_STORAGE_KEY_POPUP_1);
        if (savedDate1 === todayStr) {
          popup1Hidden = true;
        }
        const savedDate2 = localStorage.getItem(HIDE_TODAY_STORAGE_KEY_POPUP_2);
        if (savedDate2 === todayStr) {
          popup2Hidden = true;
        }
      } catch {
        // localStorage 접근 제한 환경 예외 처리
      }
    }

    // 1차 팝업이 노출 가능한 경우 1차 팝업 먼저 오픈
    if (POPUP_CONFIG.POPUP_1_ENABLED && !popup1Hidden) {
      const timer = setTimeout(() => {
        setActiveStep(1);
      }, 150);
      return () => clearTimeout(timer);
    } 
    // 1차 팝업이 오늘 보지 않기로 닫혔거나 비활성화되어 있고, 2차 팝업이 남아있다면 2차 팝업 오픈
    else if (POPUP_CONFIG.POPUP_2_ENABLED && !popup2Hidden) {
      const timer = setTimeout(() => {
        setActiveStep(2);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setActiveStep(0);
    }
  }, [location.pathname]);

  // 배경 스크롤 방지 및 복원 처리
  useEffect(() => {
    if (activeStep !== 0) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeStep]);

  // ESC 키로 팝업 닫기 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeStep !== 0) {
        handleCloseCurrent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep]);

  // 1차 팝업 닫은 후 2차 팝업으로 연계
  const proceedToNextPopup = () => {
    const todayStr = getTodayDateString();
    let popup2Hidden = false;

    if (POPUP_CONFIG.ENABLE_HIDE_TODAY) {
      try {
        const savedDate2 = localStorage.getItem(HIDE_TODAY_STORAGE_KEY_POPUP_2);
        if (savedDate2 === todayStr) {
          popup2Hidden = true;
        }
      } catch {
        // ignore
      }
    }

    if (POPUP_CONFIG.POPUP_2_ENABLED && !popup2Hidden) {
      setTimeout(() => {
        setActiveStep(2);
      }, 150);
    } else {
      setActiveStep(0);
    }
  };

  // 현재 팝업 닫기
  const handleCloseCurrent = () => {
    if (activeStep === 1) {
      setActiveStep(0);
      proceedToNextPopup();
    } else if (activeStep === 2) {
      if (hideTodayChecked2) {
        try {
          const todayStr = getTodayDateString();
          localStorage.setItem(HIDE_TODAY_STORAGE_KEY_POPUP_2, todayStr);
        } catch {
          // ignore
        }
      }
      setActiveStep(0);
    }
  };

  // 1차 팝업 오늘 하루 보지 않기
  const handleHideTodayStep1 = () => {
    try {
      const todayStr = getTodayDateString();
      localStorage.setItem(HIDE_TODAY_STORAGE_KEY_POPUP_1, todayStr);
    } catch {
      // ignore
    }
    setActiveStep(0);
    proceedToNextPopup();
  };

  // 2차 팝업 오늘 하루 보지 않기 직접 실행
  const handleHideTodayStep2Direct = () => {
    try {
      const todayStr = getTodayDateString();
      localStorage.setItem(HIDE_TODAY_STORAGE_KEY_POPUP_2, todayStr);
    } catch {
      // ignore
    }
    setActiveStep(0);
  };

  // 1차 팝업 상담 신청 링크 이동 처리
  const handleConsultationClick = () => {
    const url = POPUP_CONFIG.CONSULTATION_URL;
    if (!url) return;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };

  // 2차 팝업 "방송 출연 · 강연 기록 보기" 클릭 처리
  const handleArchiveClick = () => {
    const url = POPUP_CONFIG.POPUP_2_BUTTON_URL;
    setActiveStep(0);
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  // 1차 팝업 이미지 클릭 처리
  const handleImageClick1 = () => {
    const link = POPUP_CONFIG.POPUP_1_IMAGE_LINK;
    if (!link) return;

    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link;
    }
  };

  if (activeStep === 0) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {/* =========================================================================
          [1차 팝업] 할인 포스터 팝업 모달
          ========================================================================= */}
      {activeStep === 1 && (
        <div
          key="popup-step-1"
          id="custom-notice-popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="상담 안내 팝업"
          onClick={handleCloseCurrent}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 select-none overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: `min(${POPUP_CONFIG.POPUP_DESKTOP_WIDTH}px, calc(100vw - 28px))`,
              width: '100%',
            }}
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-100 max-h-[92vh]"
          >
            {/* 우측 상단 닫기 (X) 버튼 */}
            <button
              id="popup-close-x-button"
              type="button"
              onClick={handleCloseCurrent}
              aria-label="팝업 닫기"
              className="absolute top-2.5 right-2.5 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* 팝업 내부 스크롤 가능 영역 */}
            <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col">
              {/* 이미지 영역 */}
              <div
                className={`relative w-full bg-slate-100 flex items-center justify-center ${
                  POPUP_CONFIG.POPUP_1_IMAGE_LINK ? 'cursor-pointer' : ''
                }`}
                onClick={POPUP_CONFIG.POPUP_1_IMAGE_LINK ? handleImageClick1 : undefined}
              >
                {!imageError1 ? (
                  <img
                    id="notice-popup-image"
                    src={POPUP_CONFIG.POPUP_1_IMAGE_URL}
                    alt="상담 안내 포스터"
                    className="w-full h-auto object-contain block transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError1(true)}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500 py-16">
                    <p className="text-sm font-medium">이미지를 불러오는 중입니다.</p>
                  </div>
                )}
              </div>

              {/* 상담 신청하기 버튼 영역 */}
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

              {/* 하단 기능 버튼 영역 (오늘 하루 보지 않기 | 닫기) */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium select-none">
                {POPUP_CONFIG.ENABLE_HIDE_TODAY ? (
                  <button
                    id="popup-hide-today-button"
                    type="button"
                    onClick={handleHideTodayStep1}
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
                    onClick={handleCloseCurrent}
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

      {/* =========================================================================
          [2차 팝업] 대표원장 방송 · 강연 아카이브 포스터 팝업 모달
          (사용자가 제공한 원본 고해상도 이미지 링크를 직접 적용하여 크기/반응형 최적화)
          ========================================================================= */}
      {activeStep === 2 && (
        <div
          key="popup-step-2"
          id="custom-archive-popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="대표원장 방송 · 강연 아카이브 안내 팝업"
          onClick={handleCloseCurrent}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 select-none overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: `min(${POPUP_CONFIG.POPUP_DESKTOP_WIDTH}px, calc(100vw - 28px))`,
              width: '100%',
            }}
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-100 max-h-[92vh]"
          >
            {/* 우측 상단 닫기 (X) 버튼 */}
            <button
              id="archive-popup-close-x-button"
              type="button"
              onClick={handleCloseCurrent}
              aria-label="팝업 닫기"
              className="absolute top-2.5 right-2.5 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* 팝업 내부 스크롤 가능 영역 (모바일 및 작은 화면에서도 완벽한 스크롤 & 반응형 대응) */}
            <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col">
              {/* 1. 이미지 영역 (클릭 시 방송 아카이브 페이지로 이동) */}
              <div 
                className="relative w-full bg-slate-50 flex items-center justify-center cursor-pointer group"
                onClick={handleArchiveClick}
                title="방송 출연 · 강연 기록 페이지로 이동"
              >
                {!imageError2 ? (
                  <img
                    id="archive-popup-image"
                    src={POPUP_CONFIG.POPUP_2_IMAGE_URL}
                    alt="대표원장 방송 · 강연 아카이브 포스터"
                    className="w-full h-auto object-contain block transition-transform duration-300 group-hover:scale-[1.008]"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError2(true)}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500 py-16">
                    <p className="text-sm font-medium">이미지를 불러오는 중입니다.</p>
                  </div>
                )}
              </div>

              {/* 2. 방송 출연 · 강연 기록 보기 버튼 영역 */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
                <button
                  id="archive-popup-action-button"
                  type="button"
                  onClick={handleArchiveClick}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-[#0d402b] hover:bg-[#093020] active:bg-[#062418] text-white font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0d402b] focus:ring-offset-2 [word-break:keep-all]"
                >
                  <span>{POPUP_CONFIG.POPUP_2_BUTTON_TEXT}</span>
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* 3. 하단 기능 버튼 영역: [체크박스] 오늘 하루 보지 않기 | 닫기 */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium select-none">
                {POPUP_CONFIG.ENABLE_HIDE_TODAY ? (
                  <label 
                    className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors py-1"
                    onClick={() => {
                      const next = !hideTodayChecked2;
                      setHideTodayChecked2(next);
                      if (next) {
                        handleHideTodayStep2Direct();
                      }
                    }}
                  >
                    <div 
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        hideTodayChecked2 
                          ? 'bg-[#0d402b] border-[#0d402b] text-white' 
                          : 'border-slate-400 bg-white'
                      }`}
                    >
                      {hideTodayChecked2 && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="[word-break:keep-all]">오늘 하루 보지 않기</span>
                  </label>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  {POPUP_CONFIG.ENABLE_HIDE_TODAY && (
                    <span className="text-slate-300 select-none">|</span>
                  )}
                  <button
                    id="archive-popup-bottom-close-button"
                    type="button"
                    onClick={handleCloseCurrent}
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
