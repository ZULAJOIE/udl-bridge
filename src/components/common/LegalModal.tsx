import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, ExternalLink, ArrowUp } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowScrollTop(scrollRef.current.scrollTop > 200);
    }
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-900/60 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#F8F6F0] border border-border rounded-3xl p-4 sm:p-6 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF2EC] border border-[#C5DDCB] flex items-center justify-center text-[#2D5A3F] shrink-0">
              {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A3323] tracking-tight">
                {activeTab === 'terms' ? 'udl·bridge 이용약관' : 'udl·bridge 개인정보처리방침'}
              </h2>
              <p className="text-xs text-charcoal-600">
                교육부 교사 개발 학습지원 소프트웨어 표준 지침 준수 문서 (시행일: 2026. 03. 01)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Tab Selector */}
            <div className="flex items-center p-1 bg-white border border-border rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('terms');
                  scrollToTop();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'terms'
                    ? 'bg-[#2D5A3F] text-white shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal'
                }`}
              >
                이용약관
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('privacy');
                  scrollToTop();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'privacy'
                    ? 'bg-[#2D5A3F] text-white shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal'
                }`}
              >
                개인정보처리방침
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-100 text-charcoal-500 hover:text-charcoal transition-colors border border-border shrink-0"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto my-4 p-4 sm:p-6 bg-white rounded-2xl border border-border space-y-6 text-sm text-charcoal-800 leading-relaxed relative scroll-smooth"
        >
          {activeTab === 'terms' ? (
            <div className="space-y-5">
              <div className="bg-[#EAF2EC] border border-[#C5DDCB] p-4 rounded-xl text-xs text-[#1A3323] space-y-1">
                <p className="font-bold">📌 서비스 이용약관 안내</p>
                <p>본 약관은 앱뜰(App-Tteul) 및 교사 개발 학습지원 소프트웨어 표준 이용약관을 바탕으로 작성되었습니다.</p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제1조 (목적)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  이 약관은 udl·bridge(이하 '본 서비스')가 제공하는 무료 교육용 웹 애플리케이션 서비스(이하 '서비스')를 이용함에 있어 서비스 제공자와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제2조 (정의)</h3>
                <ul className="list-disc list-inside text-xs sm:text-sm text-charcoal-700 space-y-1 pl-1">
                  <li><strong>'서비스'</strong>란 본 플랫폼에서 제공하는 특수교육 맞춤형 교수적 수정 학습자료 생성 웹 애플리케이션을 말합니다.</li>
                  <li><strong>'이용자'</strong>란 본 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                  <li><strong>'회원'</strong>이란 본 서비스에 회원등록을 한 자로서, 서비스를 이용할 수 있는 자를 말합니다.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제3조 (약관의 명시와 개정)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  ① 본 서비스는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면 및 하단(Footer)에 게시합니다.<br />
                  ② 본 서비스는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.<br />
                  ③ 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 내에 그 적용일자 7일 이전부터 공지합니다.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제4조 (서비스의 제공)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  ① 본 서비스는 교육 목적의 무료 웹 애플리케이션을 제공합니다. 서비스의 이용은 무료이며, 별도의 유료 결제가 필요하지 않습니다.<br />
                  ② 본 서비스는 교육 활동 지원을 목적으로 하며, 상업적 목적으로 운영되지 않습니다.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제5조 (서비스의 중단)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  ① 본 서비스는 시스템 점검, 교체 및 고장, 통신 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.<br />
                  ② 본 서비스는 무료로 제공되는 교육용 서비스이므로, 서비스 중단으로 인한 별도의 보상은 제공되지 않습니다.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제6조 (회원가입)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  ① 이용자는 서비스가 정한 가입 양식(Google OAuth 인증 등)에 따라 회원정보를 기입한 후 이 약관에 동의함으로써 회원가입을 신청합니다.<br />
                  ② 만 14세 미만의 아동은 학교 가정통신문 등을 통해 보호자(법정대리인)의 동의를 받은 후 서비스를 이용할 수 있습니다.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제7조 (회원 탈퇴)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  회원은 본 서비스에 언제든지 탈퇴를 요청할 수 있으며, 서비스는 즉시 회원탈퇴를 처리합니다.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제8조 (이용자의 의무)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700 mb-1">이용자는 다음 행위를 하여서는 안 됩니다.</p>
                <ol className="list-decimal list-inside text-xs sm:text-sm text-charcoal-700 space-y-1 pl-1">
                  <li>허위 내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>서비스에 게시된 정보의 무단 변경</li>
                  <li>서비스의 운영을 방해하는 행위</li>
                  <li>타인의 명예를 손상시키거나 불이익을 주는 행위</li>
                  <li>공서양속에 반하는 정보를 게시하는 행위</li>
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제9조 (저작권)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  ① 본 서비스가 작성한 저작물에 대한 저작권은 서비스 제공자에게 귀속합니다.<br />
                  ② 이용자는 서비스를 이용하여 얻은 정보를 서비스 제공자의 사전 승낙 없이 복제, 송신, 출판, 배포하여서는 안 됩니다. <strong>(단, 본인이 수업 목적으로 제작한 학생용 학습지는 자유롭게 다운로드 및 인쇄하여 활용할 수 있습니다.)</strong>
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제10조 (면책조항)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  ① 본 서비스는 무료로 제공되는 교육용 서비스로서, 서비스 이용 중 발생하는 기술적 문제나 오류에 대해 제한적 책임을 집니다.<br />
                  ② 본 서비스가 연결하는 외부 웹 애플리케이션 및 외부 AI 모델의 내용에 대해서는 해당 애플리케이션 제공자가 책임을 집니다.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제11조 (분쟁해결)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  본 서비스와 이용자 간에 발생한 분쟁에 관하여는 대한민국 법을 적용하며, 소송이 제기되는 경우 서비스 제공자의 소재지를 관할하는 법원을 관할법원으로 합니다.
                </p>
              </section>

              <div className="pt-3 border-t border-border text-xs text-charcoal-500 font-semibold">
                부칙: 이 약관은 2026년 3월 1일부터 시행됩니다.
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-[#EAF2EC] border border-[#C5DDCB] p-4 rounded-xl text-xs text-[#1A3323] space-y-1">
                <p className="font-bold">🔒 개인정보처리방침 (표준안 반영)</p>
                <p>udl·bridge는 「개인정보 보호법」 제30조에 따라 이용자의 개인정보 및 외부 AI/클라우드 처리 방침을 공개합니다.</p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제1조 (개인정보의 처리 목적)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  본 서비스는 다음 목적을 위해 최소한의 개인정보를 처리합니다.
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-charcoal-700 space-y-1 pl-1">
                  <li><strong>교사 회원 가입 및 관리</strong>: Google OAuth 계정 식별, 교사 구분 관리</li>
                  <li><strong>서비스 제공</strong>: 특수교육 UDL 학습지 생성, Google Imagen 3 시각자료 생성, 학습지 보관/수정, DOCX/PDF 내보내기, AI 1:1 대조 점검</li>
                  <li><strong>학생 정보 보호</strong>: 학생 개별 식별정보(주민번호, 실명 등)는 일절 수집하지 않음</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제2조 (개인정보의 처리 및 보유기간)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  - <strong>보유 기간</strong>: 해당 학년도 종료 시(익년 2월 말) 또는 교사 회원 탈퇴/직접 삭제 시까지<br />
                  - <strong>파기 시점</strong>: 보유 기간 종료 후 지체 없이(5일 이내) 파기, 또는 교사가 [내 자료]에서 삭제 요청 시 즉시 파기
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제3조 (처리하는 개인정보 항목)</h3>
                <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
                  <p><strong>수집 항목</strong>: Google UID, 이메일, 이름/닉네임, 교사 분류, 수업 주제, 교사 추가 지침, 업로드 문학/설명 텍스트</p>
                  <p className="text-amber-900 font-semibold">❌ 수집하지 않는 항목: 주민등록번호, 주소, 학생 실명, 학생 전화번호 등 민감 정보</p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제4조 (만 14세 미만 아동의 개인정보 처리)</h3>
                <p className="text-xs sm:text-sm text-charcoal-700">
                  ① 만 14세 미만 아동은 학교 가정통신문(개인정보 수집·이용 동의서)을 통하여 법정대리인의 동의를 받은 후 서비스를 이용할 수 있습니다.<br />
                  ② 법정대리인이 동의하지 않는 경우 서비스 이용이 제한될 수 있습니다.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제5조 (개인정보의 안전성 확보조치)</h3>
                <ul className="list-disc list-inside text-xs sm:text-sm text-charcoal-700 space-y-1 pl-1">
                  <li><strong>인증 암호화</strong>: Google OAuth 2.0 및 암호화 토큰 기반 인증</li>
                  <li><strong>보안 통신</strong>: 전 구간 HTTPS 보안 전송 및 전문 클라우드 기반 운영</li>
                  <li><strong>접근 최소화</strong>: 개인정보 처리 담당자 개발 교사 1인 지정 관리</li>
                </ul>
              </section>

              {/* External AI & Cloud Services Table */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제6조 (외부 AI 및 클라우드 위탁 / 국외 이전)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-charcoal-700 border-collapse border border-border">
                    <thead>
                      <tr className="bg-[#EAF2EC] text-[#1A3323]">
                        <th className="border border-border p-2">수탁업체</th>
                        <th className="border border-border p-2">위탁 업무 내용</th>
                        <th className="border border-border p-2">전송 항목</th>
                        <th className="border border-border p-2">이전 국가</th>
                        <th className="border border-border p-2">보유 및 이용기간</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-2 font-bold">Google LLC</td>
                        <td className="border border-border p-2">Google Gemini 2.0 Flash (UDL 변환/검증),<br />Google Imagen 3 (시각자료 생성)</td>
                        <td className="border border-border p-2">수업 주제, 교사 지침,<br />업로드 문학 텍스트</td>
                        <td className="border border-border p-2">미국 (Google Cloud)</td>
                        <td className="border border-border p-2">생성 완료 후 실시간 파기<br />(AI 학습 불활용)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-bold">Google Cloud Platform</td>
                        <td className="border border-border p-2">Firebase Auth (인증),<br />Cloud Firestore (학습지 보관)</td>
                        <td className="border border-border p-2">구글 계정 프로필,<br />생성 학습지 데이터</td>
                        <td className="border border-border p-2">미국 (Google Cloud)</td>
                        <td className="border border-border p-2">회원 탈퇴 또는 학년도 종료 시까지</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Privacy Officer Section with Unconfirmed Highlights */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-[#1A3323] border-b border-border/60 pb-1">제7조 (개인정보 보호책임자)</h3>
                <div className="bg-[#F8F6F0] p-4 rounded-xl border border-border text-xs space-y-1.5">
                  <p>본 서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고 있습니다.</p>
                  <ul className="space-y-1 pl-1">
                    <li className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-700 min-w-[80px]">성명:</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        [확인 필요: 교사 성명] (개발자)
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-700 min-w-[80px]">소속:</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        [확인 필요: 소속 학교명]
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-700 min-w-[80px]">직위:</span>
                      <span>교사</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-700 min-w-[80px]">연락처:</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        [확인 필요: 교무실 내선 번호]
                      </span>
                      <span className="text-charcoal-500 text-[11px]">(※ 교사의 개인 휴대전화 번호는 기재하지 않습니다)</span>
                    </li>
                  </ul>
                </div>
              </section>

              <div className="pt-3 border-t border-border text-xs text-charcoal-500 font-semibold">
                부칙: 이 개인정보 처리방침은 2026년 3월 1일부터 적용됩니다.
              </div>
            </div>
          )}

          {/* Scroll to Top Floating Button inside Modal */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="sticky bottom-2 left-full p-2.5 bg-[#2D5A3F] text-white rounded-full shadow-lg hover:bg-[#234731] transition-all transform hover:scale-105"
              title="맨 위로 이동"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-600 shrink-0">
          <span className="text-charcoal-500">
            © 2026 udl·bridge. All rights reserved.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-[#2D5A3F] hover:bg-[#234731] text-white font-bold px-6 py-2 rounded-xl transition-colors text-xs shadow-xs"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
