import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWizard } from '../../context/WizardContext';
import { SavedMaterial } from '../../types';
import { getSavedMaterials, deleteSavedMaterial, duplicateSavedMaterial, logUsageEvent } from '../../services/dataService';
import { FolderHeart, BookOpen, Calendar, Trash2, Copy as CopyIcon, FileText, Eye, Edit3, ArrowRight } from 'lucide-react';
import { BridgeMotif } from '../common/BridgeMotif';

interface MyMaterialsViewProps {
  onShowToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  onNavigateToWizard: () => void;
  onOpenMaterialResult: () => void;
}

export const MyMaterialsView: React.FC<MyMaterialsViewProps> = ({
  onShowToast,
  onNavigateToWizard,
  onOpenMaterialResult
}) => {
  const { user } = useAuth();
  const { loadSavedMaterial } = useWizard();

  const [materials, setMaterials] = useState<SavedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<SavedMaterial | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  useEffect(() => {
    fetchMaterials();
  }, [user]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await getSavedMaterials(user?.uid || 'demo-teacher-01');
      setMaterials(data);
      if (data.length > 0 && !selectedMaterial) {
        setSelectedMaterial(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (material: SavedMaterial) => {
    loadSavedMaterial(material);
    onShowToast('info', '학습자료 열기 완료', `'${material.title}' 자료가 불러와졌습니다.`);
    onOpenMaterialResult();
  };

  const handleDuplicate = async (material: SavedMaterial) => {
    try {
      const dup = await duplicateSavedMaterial(material);
      setMaterials(prev => [dup, ...prev]);
      setSelectedMaterial(dup);
      onShowToast('success', '자료 복제 완료', `'${dup.title}' 사본이 생성되었습니다.`);
    } catch (e) {
      onShowToast('error', '복제 실패', '오류가 발생했습니다.');
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm('이 저장된 학습자료를 삭제하시겠습니까?')) return;
    try {
      await deleteSavedMaterial(materialId);
      const updated = materials.filter(m => m.id !== materialId);
      setMaterials(updated);
      if (selectedMaterial?.id === materialId) {
        setSelectedMaterial(updated[0] || null);
      }
      onShowToast('success', '삭제 완료', '학습자료가 삭제되었습니다.');
    } catch (e) {
      onShowToast('error', '삭제 실패', '오류가 발생했습니다.');
    }
  };

  const filteredMaterials = materials.filter(m => {
    if (filterLevel === 'all') return true;
    return m.schoolLevel === filterLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
            <FolderHeart className="w-7 h-7 text-sage-600" />
            내 학습자료 보관함
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            특수교육 교수적 수정이 완료된 학생용 학습자료를 확인, 열기, 직접 수정 및 복제할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface p-1.5 rounded-lg border border-border">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filterLevel === 'all' ? 'bg-forest-600 text-white' : 'text-charcoal-500 hover:text-charcoal'
            }`}
          >
            전체 ({materials.length})
          </button>
          <button
            onClick={() => setFilterLevel('elementary')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filterLevel === 'elementary' ? 'bg-forest-600 text-white' : 'text-charcoal-500 hover:text-charcoal'
            }`}
          >
            초등
          </button>
          <button
            onClick={() => setFilterLevel('middle')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filterLevel === 'middle' ? 'bg-forest-600 text-white' : 'text-charcoal-500 hover:text-charcoal'
            }`}
          >
            중등
          </button>
          <button
            onClick={() => setFilterLevel('high')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filterLevel === 'high' ? 'bg-forest-600 text-white' : 'text-charcoal-500 hover:text-charcoal'
            }`}
          >
            고등
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-charcoal-400">저장된 학습자료 목록을 불러오는 중입니다...</div>
      ) : filteredMaterials.length === 0 ? (
        <div className="py-20 text-center rounded-xl bg-surface border border-border p-8 space-y-4 texture-paper">
          <FolderHeart className="w-12 h-12 text-charcoal-300 mx-auto" />
          <h3 className="text-lg font-semibold text-charcoal-600">저장된 학습자료가 없습니다</h3>
          <p className="text-sm text-charcoal-400">수업자료를 업로드하고 학생 맞춤형 학습자료를 만들어보세요.</p>
          <BridgeMotif className="w-32 h-3.5 mx-auto text-sage-300" />
          <button
            onClick={onNavigateToWizard}
            className="btn-primary px-4 py-2.5 text-sm"
          >
            새 학습자료 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Cards List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredMaterials.map(mat => {
              const isSelected = selectedMaterial?.id === mat.id;
              return (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-forest-400 shadow-sm'
                      : 'bg-surface hover:bg-white border-border hover:border-charcoal-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-forest-50 text-forest-700 border border-forest-100 text-[11px] font-bold">
                        {mat.schoolLevel === 'elementary' ? '초등' : mat.schoolLevel === 'middle' ? '중등' : '고등'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sage-100 text-sage-800 border border-sage-300 text-[11px] font-bold">
                        {mat.subject}
                      </span>
                    </div>
                    <span className="text-[10px] text-charcoal-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {mat.createdAt}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-charcoal line-clamp-1">{mat.title}</h3>

                  <div className="flex items-center justify-between text-xs text-charcoal-500 pt-1 border-t border-border">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      글 L{mat.textModificationLevel} · 시각 L{mat.visualModificationLevel}
                    </span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpen(mat)}
                        className="px-2.5 py-1 rounded bg-forest-600 hover:bg-forest-700 text-white text-[11px] font-bold"
                      >
                        열기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          {selectedMaterial && (
            <div className="lg:col-span-7 card p-6 space-y-6 shadow-sm sticky top-24">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-bold text-charcoal">{selectedMaterial.title}</h2>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    저장일시: {selectedMaterial.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpen(selectedMaterial)}
                    className="btn-primary px-3.5 py-2 text-xs font-extrabold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>열기 / 수정</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(selectedMaterial)}
                    title="복제"
                    className="btn-secondary p-2"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(selectedMaterial.id)}
                    title="삭제"
                    className="btn-danger-ghost p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Material Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-oat-50 border border-border text-xs">
                <div>
                  <span className="text-charcoal-400 block">원본 파일명</span>
                  <span className="font-semibold text-charcoal-600 truncate block">
                    {selectedMaterial.fileName || '업로드 자료'}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-400 block">글 수정 강도</span>
                  <span className="font-semibold text-forest-700">Level {selectedMaterial.textModificationLevel}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block">시각 수정 강도</span>
                  <span className="font-semibold text-sage-800">Level {selectedMaterial.visualModificationLevel}</span>
                </div>
              </div>

              {/* Generated Content Preview Card */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-charcoal-600 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sage-700" />
                  학생용 완성 자료 내용 미리보기
                </label>
                <div className="p-4 rounded-lg bg-oat-50 text-xs text-charcoal-500 max-h-[340px] overflow-y-auto leading-relaxed border border-border space-y-3 font-sans">
                  <h4 className="font-bold text-charcoal text-sm">{selectedMaterial.generatedContent?.title}</h4>
                  <div className="p-3 rounded-lg bg-white text-charcoal-600 whitespace-pre-wrap border border-border">
                    {selectedMaterial.generatedContent?.simplifiedContent}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
