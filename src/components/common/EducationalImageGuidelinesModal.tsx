import React from 'react';
import { X, ShieldCheck, Sparkles, AlertCircle, Image as ImageIcon, CheckCircle, Info } from 'lucide-react';

interface EducationalImageGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalImageGuidelinesModal: React.FC<EducationalImageGuidelinesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-[#F8F6F0] rounded-3xl max-w-2xl w-full shadow-2xl border border border-border overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF2EC] text-[#2D5A3F] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A3323]">
                교사용 AI 시각자료 교육적 생성 및 안전 지침
              </h2>
              <p className="text-xs text-gray-500">
                특수교육 및 학생용 학습자료에 유관하고 안전한 시각자료를 생성하는 가이드라인
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left text-sm text-gray-700">
          
          {/* Section 1: 안전 필터 및 무관한 인물 차단 */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#2D5A3F] font-bold text-base">
              <CheckCircle className="w-5 h-5 text-[#2D5A3F]" />
              <span>1. 교육적 안전 필터링 (Negative Prompt 적용)</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-600">
              UDL-Bridge는 특수교육 및 수업자료 생성 시 **학습 주제와 무관한 인물(랜덤 여성, 애니메이션 캐릭터, 부적절한 얼굴 등)**이 출력되지 않도록 <span className="font-bold text-emerald-800">엄격한 부정적 프롬프트(Negative Prompt)</span>를 자동으로 가동합니다.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 font-medium">
              ✓ 자동 적용 필터: <span className="underline">인물 초상화 제외, 부적절한 피사체 제거, 교과 내용 피사체 중앙 집중</span>
            </div>
          </div>

          {/* Section 2: 화풍별 추천 활용 가이드 */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-[#1A3323] font-bold text-base">
              <ImageIcon className="w-5 h-5 text-forest-600" />
              <span>2. 화풍 스타일별 수업 활용 추천</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="font-bold text-amber-900 block mb-1">✏️ 간단한 그림 (배경제거)</span>
                <p className="text-amber-800 leading-relaxed">
                  배경이 100% 제거된 깨끗한 선화/아이콘입니다. <strong>낱말 카드, 1:1 어휘 매칭, 돋보기 관찰 카드</strong>에 가장 적합합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">📸 실사 이미지</span>
                <p className="text-blue-800 leading-relaxed">
                  <strong>자연 현상(광합성, 불꽃축제, 동물/식물), 건물 전경, 실물 사물</strong>의 생생한 사진을 학습지에 삽입할 때 좋습니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                <span className="font-bold text-purple-900 block mb-1">🎨 일러스트</span>
                <p className="text-purple-800 leading-relaxed">
                  친근하고 따뜻한 디지털 카툰 스타일입니다. <strong>상황 설명, 또래 협동 활동 예시</strong>에 효과적입니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">📊 단순 도식</span>
                <p className="text-emerald-800 leading-relaxed">
                  <strong>단계별 순서도, 인포그래픽, 화살표 구조도</strong> 등 인지 부담을 줄이는 시각적 구조화에 적합합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: 교사 추가 요청사항 작성 팁 */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-[#1A3323] font-bold text-base">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>3. 교사 추가 요청사항 작성 팁 (원하는 그림 만들기)</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              그림 카드 하단의 <strong>[교사 추가 요청사항]</strong>에 구체적인 요소를 입력한 후 <strong>[요청 반영 재생성]</strong>을 클릭하면 원하는 형태로 정확히 수정됩니다.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2">
                <span className="font-bold text-forest-700 shrink-0">📌 인물 제외 요청:</span>
                <span className="text-gray-700">"사람 없이 불꽃과 밤하늘 도시 건물 전경만 그려주세요."</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2">
                <span className="font-bold text-forest-700 shrink-0">📌 색상/강조 요청:</span>
                <span className="text-gray-700">"식물 잎과 햇빛을 밝은 노란색과 초록색으로 뚜렷하게 강조해주세요."</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2">
                <span className="font-bold text-forest-700 shrink-0">📁 자체 이미지 사용:</span>
                <span className="text-gray-700">AI 그림 대신 교사가 직접 소장한 사진/파일을 [교체] 버튼으로 업로드할 수 있습니다.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-gray-500 font-medium">UDL-Bridge 특수교육 AI 안전 지침 v2.0</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2D5A3F] hover:bg-[#234731] text-white font-bold transition-colors"
          >
            확인했습니다
          </button>
        </div>

      </div>
    </div>
  );
};
