import React, { useEffect, useState } from 'react';
import { AdminStats, UserType, USER_TYPES } from '../../types';
import { getAdminStats } from '../../services/dataService';
import {
  BarChart3, Users, Sparkles, FolderHeart, Calendar, AlertTriangle, TrendingUp, Filter, ShieldCheck, ArrowRight, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '3m' | 'all'>('30d');
  const [selectedUserTypeFilter, setSelectedUserTypeFilter] = useState<string>('all');

  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);

  if (!stats) {
    return <div className="py-20 text-center text-charcoal-400">관리자 집계 데이터를 불러오는 중입니다...</div>;
  }

  // Warm ivory / editorial palette for charts (no purple/navy)
  const COLORS = ['#405646', '#899A82', '#9A806C', '#B4BDA8', '#6E5A4A', '#C5CCBC'];

  // User type aggregated mock breakdown matching user requirement spec
  const userTypeAggregatedData = [
    { typeKey: 'special_class_teacher', label: '일반학교 특수학급 교사', percentage: 52, count: 648 },
    { typeKey: 'special_school_teacher', label: '특수학교 교사', percentage: 24, count: 299 },
    { typeKey: 'inclusive_class_teacher', label: '통합학급을 운영하는 일반교사', percentage: 16, count: 199 },
    { typeKey: 'researcher_admin', label: '특수교육 관련 연구자·관리자', percentage: 6, count: 75 },
    { typeKey: 'other', label: '기타/선택하지 않음', percentage: 2, count: 27 }
  ];

  const userTypePieData = userTypeAggregatedData.map(d => ({
    name: d.label,
    value: d.percentage
  }));

  const schoolLevelPieData = [
    { name: '초등', value: stats.schoolLevelBreakdown.elementary },
    { name: '중등', value: stats.schoolLevelBreakdown.middle },
    { name: '고등', value: stats.schoolLevelBreakdown.high }
  ];

  const textLevelData = Object.entries(stats.textLevelDistribution).map(([lvl, count]) => ({
    level: `Level ${lvl}`,
    count
  }));

  const visualLevelData = Object.entries(stats.visualLevelDistribution).map(([lvl, count]) => ({
    level: `Level ${lvl}`,
    count
  }));

  const udlPieData = [
    { name: '표상 (이해하기 쉽게)', value: stats.udlRatio.representation },
    { name: '행동 및 표현 (답하기 쉽게)', value: stats.udlRatio.actionExpression },
    { name: '참여 (수업에 참여하기 쉽게)', value: stats.udlRatio.engagement }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-brown-600" />
              특수교육 교수적 수정 활용 패턴 집계 대시보드
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brown-50 text-brown-700 border border-brown-300 text-xs font-bold">
              집계 통계 중심
            </span>
          </div>
          <p className="text-sm text-charcoal-500 mt-1">
            사용자 유형별 학습 지원 선택 패턴 및 교수적 수정 전략의 통합 집계 데이터를 확인할 수 있습니다.
          </p>
        </div>

        {/* Filters Bar: User Type Filter & Period Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* User Type Filter (Requirement 7) */}
          <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border">
            <Filter className="w-4 h-4 text-forest-600" />
            <select
              value={selectedUserTypeFilter}
              onChange={(e) => setSelectedUserTypeFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-charcoal-600 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white text-charcoal-600">전체 사용자 (통합)</option>
              <option value="special_school_teacher" className="bg-white text-charcoal-600">특수학교 교사</option>
              <option value="special_class_teacher" className="bg-white text-charcoal-600">일반학교 특수학급 교사</option>
              <option value="inclusive_class_teacher" className="bg-white text-charcoal-600">통합학급을 운영하는 일반교사</option>
              <option value="researcher_admin" className="bg-white text-charcoal-600">특수교육 관련 연구자·관리자</option>
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
            <Calendar className="w-3.5 h-3.5 text-charcoal-400 ml-2" />
            <button
              onClick={() => setPeriod('7d')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                period === '7d' ? 'bg-forest-600 text-white' : 'text-charcoal-500 hover:text-charcoal'
              }`}
            >
              7일
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                period === '30d' ? 'bg-forest-600 text-white' : 'text-charcoal-500 hover:text-charcoal'
              }`}
            >
              30일
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                period === 'all' ? 'bg-forest-600 text-white' : 'text-charcoal-500 hover:text-charcoal'
              }`}
            >
              전체
            </button>
          </div>
        </div>
      </div>

      {/* User Type Aggregated Pipeline Step Card (Requirement 7) */}
      <div className="card p-4 text-xs text-charcoal-500 space-y-2">
        <span className="font-extrabold text-forest-700 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-brown-600" />
          집계 분석 흐름 (Aggregated Pipeline)
        </span>
        <div className="flex flex-wrap items-center gap-2 font-semibold text-charcoal-600 pt-1">
          <span className="px-2.5 py-1 rounded-lg bg-forest-50 border border-forest-100 text-forest-700">사용자 유형</span>
          <ArrowRight className="w-3.5 h-3.5 text-charcoal-300" />
          <span className="px-2.5 py-1 rounded-lg bg-oat-50 border border-border">학교급</span>
          <ArrowRight className="w-3.5 h-3.5 text-charcoal-300" />
          <span className="px-2.5 py-1 rounded-lg bg-oat-50 border border-border">교과</span>
          <ArrowRight className="w-3.5 h-3.5 text-charcoal-300" />
          <span className="px-2.5 py-1 rounded-lg bg-sage-100 border border-sage-300 text-sage-800">교육적 요구</span>
          <ArrowRight className="w-3.5 h-3.5 text-charcoal-300" />
          <span className="px-2.5 py-1 rounded-lg bg-oat-50 border border-border">선택한 교수적 수정 전략</span>
          <ArrowRight className="w-3.5 h-3.5 text-charcoal-300" />
          <span className="px-2.5 py-1 rounded-lg bg-oat-50 border border-border">글/시각자료 수정 Level</span>
          <ArrowRight className="w-3.5 h-3.5 text-charcoal-300" />
          <span className="px-2.5 py-1 rounded-lg bg-brown-50 border border-brown-300 text-brown-700">자료 생성·저장</span>
        </div>
      </div>

      {/* Section 1: User Type Distribution Stats (Requirement 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
              <Users className="w-5 h-5 text-forest-600" />
              사용자 유형별 분포 (집계 데이터)
            </h2>
            <span className="text-xs text-charcoal-400">총 1,248명 등록</span>
          </div>

          <div className="space-y-3">
            {userTypeAggregatedData.map((d) => (
              <div key={d.typeKey} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-charcoal-600">{d.label}</span>
                  <span className="text-charcoal-400 font-mono">{d.percentage}% ({d.count}명)</span>
                </div>
                <div className="w-full bg-oat-50 h-3 rounded-full overflow-hidden border border-border">
                  <div
                    className="bg-forest-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 card p-6 space-y-4 h-[300px] flex flex-col justify-between">
          <h3 className="text-base font-bold text-charcoal">📊 사용자 유형 비율</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userTypePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {userTypePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-4 space-y-2">
          <span className="text-xs text-charcoal-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-forest-600" /> 전체 집계 교사 수
          </span>
          <p className="text-2xl font-extrabold text-charcoal">{stats.totalTeachers.toLocaleString()}명</p>
          <span className="text-[11px] text-forest-700 font-semibold">월간 활성 교사 {stats.activeUsers}명</span>
        </div>

        <div className="card p-4 space-y-2">
          <span className="text-xs text-charcoal-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sage-700" /> 교수적 수정 자료 생성
          </span>
          <p className="text-2xl font-extrabold text-sage-800">{stats.materialsGenerated.toLocaleString()}건</p>
          <span className="text-[11px] text-sage-700 font-semibold">평균 1.5분 완료</span>
        </div>

        <div className="card p-4 space-y-2">
          <span className="text-xs text-charcoal-500 flex items-center gap-1">
            <FolderHeart className="w-3.5 h-3.5 text-forest-600" /> 자료 보관함 저장
          </span>
          <p className="text-2xl font-extrabold text-forest-700">{stats.materialsSaved.toLocaleString()}건</p>
          <span className="text-[11px] text-forest-700 font-semibold">재생성/복제 {stats.materialsReused}건</span>
        </div>

        <div className="card p-4 space-y-2">
          <span className="text-xs text-charcoal-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brown-600" /> 지원 추천 사용 수
          </span>
          <p className="text-2xl font-extrabold text-brown-700">{stats.recommendationsUsed.toLocaleString()}회</p>
          <span className="text-[11px] text-brown-600 font-semibold">이용률 71.3%</span>
        </div>

        <div className="card p-4 space-y-2">
          <span className="text-xs text-charcoal-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-forest-600" /> 추천 최종 채택률
          </span>
          <p className="text-2xl font-extrabold text-forest-700">66.5%</p>
          <span className="text-[11px] text-forest-700 font-semibold">교사 최종 수용 완료</span>
        </div>
      </div>

      {/* TOP 10 Needs */}
      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
          🎯 가장 많이 선택된 교사 발견 교육적 요구 (TOP 10)
        </h2>

        <div className="space-y-3">
          {stats.topEducationalNeeds.map((need, idx) => (
            <div key={need.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-charcoal-600">
                  <strong className="text-forest-700 mr-2">#{idx + 1}</strong>
                  {need.name}
                </span>
                <span className="text-charcoal-400">{need.count}건 ({need.percentage}%)</span>
              </div>
              <div className="w-full bg-oat-50 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sage-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${need.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: School Level & UDL Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold text-charcoal">🏫 학교급별 자료 생성 비율</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={schoolLevelPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {schoolLevelPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold text-charcoal">💡 UDL 3대 영역 활용 비중</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={udlPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name.split(' ')[0]} ${value}%`}
                >
                  {udlPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Level 1~5 Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold text-charcoal">📝 글 교수적 수정 Level 1~5 선택 분포</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={textLevelData}>
                <XAxis dataKey="level" stroke="#8B9086" />
                <YAxis stroke="#8B9086" />
                <Tooltip />
                <Bar dataKey="count" fill="#405646" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold text-charcoal">🖼️ 시각자료 교수적 수정 Level 1~5 선택 분포</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visualLevelData}>
                <XAxis dataKey="level" stroke="#8B9086" />
                <YAxis stroke="#8B9086" />
                <Tooltip />
                <Bar dataKey="count" fill="#899A82" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Privacy Notice Disclaimer */}
      <div className="p-4 rounded-lg bg-oat-50 border border-border text-xs text-charcoal-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0" />
          <span>본 관리자 통계는 UDL-Bridge 서비스 개선 및 교수적 수정 패턴 분석을 위한 집계 수치이며, 개별 교사의 평가 목적으로 사용되지 않습니다.</span>
        </div>
      </div>
    </div>
  );
};
