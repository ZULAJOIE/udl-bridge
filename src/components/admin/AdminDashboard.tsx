import React, { useEffect, useState } from 'react';
import { AdminStats, UserProfile, USER_TYPES, SavedMaterial, SchoolLevel } from '../../types';
import { getAdminStats, getAllUserProfiles, updateUserStatus, getAllSavedMaterials } from '../../services/dataService';
import {
  BarChart3, Users, Sparkles, FolderHeart, Calendar, TrendingUp, Filter, ShieldCheck, ArrowRight, Layers, CheckCircle2, XCircle, Clock, Search, Eye, FileText, X, BookOpen, Download
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'materials'>('analytics');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [materials, setMaterials] = useState<SavedMaterial[]>([]);

  // Analytics tab state
  const [period, setPeriod] = useState<'7d' | '30d' | '3m' | 'all'>('30d');
  const [selectedUserTypeFilter, setSelectedUserTypeFilter] = useState<string>('all');

  // Users tab state
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Materials tab state
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [materialLevelFilter, setMaterialLevelFilter] = useState<string>('all');
  const [selectedMaterialForPreview, setSelectedMaterialForPreview] = useState<SavedMaterial | null>(null);

  const loadData = async () => {
    const [s, u, m] = await Promise.all([
      getAdminStats(),
      getAllUserProfiles(),
      getAllSavedMaterials()
    ]);
    setStats(s);
    setUsers(u);
    setMaterials(m);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveUser = async (uid: string) => {
    await updateUserStatus(uid, 'approved');
    await loadData();
  };

  const handleRevokeUser = async (uid: string) => {
    await updateUserStatus(uid, 'pending');
    await loadData();
  };

  if (!stats) {
    return <div className="py-20 text-center text-charcoal-400 font-semibold">관리자 데이터를 불러오는 중입니다...</div>;
  }

  // Color palette for charts
  const COLORS = ['#405646', '#899A82', '#9A806C', '#B4BDA8', '#6E5A4A', '#C5CCBC'];

  // User type aggregated mock breakdown
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

  const pendingUsersCount = users.filter(u => u.status === 'pending' && u.role !== 'admin').length;
  const approvedUsersCount = users.filter(u => u.status === 'approved' || u.role === 'admin').length;

  const filteredUsers = users.filter(u => {
    if (userStatusFilter === 'pending') return u.status === 'pending' && u.role !== 'admin';
    if (userStatusFilter === 'approved') return u.status === 'approved' || u.role === 'admin';
    return true;
  }).filter(u => {
    if (!userSearchTerm) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  const filteredMaterials = materials.filter(m => {
    if (materialLevelFilter !== 'all' && m.schoolLevel !== materialLevelFilter) return false;
    if (!materialSearchTerm) return true;
    const term = materialSearchTerm.toLowerCase();
    return (
      m.title.toLowerCase().includes(term) ||
      (m.subject && m.subject.toLowerCase().includes(term)) ||
      (m.userEmail && m.userEmail.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1A3323] flex items-center gap-2 tracking-tight">
              <ShieldCheck className="w-7 h-7 text-[#2D5A3F]" />
              UDL-Bridge 통합 관리자 대시보드
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2EC] text-[#2D5A3F] border border-[#C5DDCB] text-xs font-bold">
              교사 승인 &amp; 학습자료 분석
            </span>
          </div>
          <p className="text-sm text-charcoal-600 mt-1">
            교사 계정 승인 관리, 선생님들이 생성한 UDL 학습자료 통합 조회, 교수적 수정 통계를 종합 관리합니다.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 bg-white border border-border rounded-2xl shadow-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[#2D5A3F] text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>통계 &amp; 데이터 분석</span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'users'
                ? 'bg-[#2D5A3F] text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>교사 가입 승인</span>
            {pendingUsersCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                {pendingUsersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'materials'
                ? 'bg-[#2D5A3F] text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>교사 작성 자료 조회 ({materials.length})</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: ANALYTICS ==================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-border text-xs">
                <Filter className="w-4 h-4 text-[#2D5A3F]" />
                <select
                  value={selectedUserTypeFilter}
                  onChange={(e) => setSelectedUserTypeFilter(e.target.value)}
                  className="bg-transparent font-bold text-charcoal-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">전체 사용자 (통합)</option>
                  <option value="special_school_teacher">특수학교 교사</option>
                  <option value="special_class_teacher">일반학교 특수학급 교사</option>
                  <option value="inclusive_class_teacher">통합학급 교사</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-border text-xs">
                <Calendar className="w-3.5 h-3.5 text-charcoal-400 ml-2" />
                <button
                  onClick={() => setPeriod('7d')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    period === '7d' ? 'bg-[#2D5A3F] text-white' : 'text-charcoal-500 hover:text-charcoal'
                  }`}
                >
                  7일
                </button>
                <button
                  onClick={() => setPeriod('30d')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    period === '30d' ? 'bg-[#2D5A3F] text-white' : 'text-charcoal-500 hover:text-charcoal'
                  }`}
                >
                  30일
                </button>
                <button
                  onClick={() => setPeriod('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    period === 'all' ? 'bg-[#2D5A3F] text-white' : 'text-charcoal-500 hover:text-charcoal'
                  }`}
                >
                  전체
                </button>
              </div>
            </div>

            <div className="text-xs text-charcoal-500 font-medium">
              최종 데이터 업데이트: <span className="font-bold text-[#1A3323]">오늘 14:50</span>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-2">
              <span className="text-xs text-charcoal-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#2D5A3F]" /> 전체 가입 교사
              </span>
              <p className="text-2xl font-extrabold text-[#1A3323]">{users.length}명</p>
              <span className="text-[11px] text-[#2D5A3F] font-semibold">승인 완료 {approvedUsersCount}명 / 대기 {pendingUsersCount}명</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-2">
              <span className="text-xs text-charcoal-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> 교수적 수정 생성
              </span>
              <p className="text-2xl font-extrabold text-emerald-900">{stats.materialsGenerated.toLocaleString()}건</p>
              <span className="text-[11px] text-emerald-700 font-semibold">평균 1.5분 완료</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-2">
              <span className="text-xs text-charcoal-500 flex items-center gap-1">
                <FolderHeart className="w-3.5 h-3.5 text-[#2D5A3F]" /> 학습지 저장 건수
              </span>
              <p className="text-2xl font-extrabold text-[#2D5A3F]">{stats.materialsSaved.toLocaleString()}건</p>
              <span className="text-[11px] text-[#2D5A3F] font-semibold">재생성/복제 {stats.materialsReused}건</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-2">
              <span className="text-xs text-charcoal-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" /> AI 1:1 검증 이용
              </span>
              <p className="text-2xl font-extrabold text-amber-900">{stats.recommendationsUsed.toLocaleString()}회</p>
              <span className="text-[11px] text-amber-700 font-semibold">이용률 71.3%</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-2">
              <span className="text-xs text-charcoal-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#2D5A3F]" /> 수정 전략 채택률
              </span>
              <p className="text-2xl font-extrabold text-[#2D5A3F]">66.5%</p>
              <span className="text-[11px] text-[#2D5A3F] font-semibold">교사 최종 수정 완료</span>
            </div>
          </div>

          {/* User Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1A3323] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2D5A3F]" />
                  사용자 유형별 분포 (집계 데이터)
                </h2>
                <span className="text-xs text-charcoal-400">총 {users.length}명 등록</span>
              </div>

              <div className="space-y-3">
                {userTypeAggregatedData.map((d) => (
                  <div key={d.typeKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-charcoal-600">{d.label}</span>
                      <span className="text-charcoal-400 font-mono">{d.percentage}% ({d.count}명)</span>
                    </div>
                    <div className="w-full bg-[#F8F6F0] h-3 rounded-full overflow-hidden border border-border">
                      <div
                        className="bg-[#2D5A3F] h-full rounded-full transition-all duration-500"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4 h-[300px] flex flex-col justify-between">
              <h3 className="text-base font-bold text-[#1A3323]">📊 사용자 유형 비율</h3>
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
                      {userTypePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TOP 10 Educational Needs */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-6">
            <h2 className="text-lg font-bold text-[#1A3323] flex items-center gap-2">
              🎯 교사 선택 상위 교육적 요구 (TOP 8)
            </h2>

            <div className="space-y-3">
              {stats.topEducationalNeeds.map((need, idx) => (
                <div key={need.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-charcoal-700">
                      <strong className="text-[#2D5A3F] mr-2">#{idx + 1}</strong>
                      {need.name}
                    </span>
                    <span className="text-charcoal-500">{need.count}건 ({need.percentage}%)</span>
                  </div>
                  <div className="w-full bg-[#F8F6F0] h-2.5 rounded-full overflow-hidden border border-border/60">
                    <div
                      className="bg-[#2D5A3F] h-full rounded-full transition-all duration-500"
                      style={{ width: `${need.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts: Level 1~5 Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#1A3323]">📝 텍스트 난이도 Level 1~5 분포</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={textLevelData}>
                    <XAxis dataKey="level" stroke="#8B9086" />
                    <YAxis stroke="#8B9086" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2D5A3F" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#1A3323]">🖼️ 시각자료 난이도 Level 1~5 분포</h3>
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

        </div>
      )}

      {/* ==================== TAB 2: TEACHER APPROVALS ==================== */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1A3323]">교사 가입 승인 관리</h2>
                <p className="text-xs text-charcoal-500">
                  신규 교사 가입 신청을 확인하고 승인/거절을 처리합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="이름 또는 이메일 검색..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs bg-[#F8F6F0] border border-border rounded-xl focus:outline-none focus:border-[#2D5A3F] w-48 sm:w-64"
                />
              </div>

              <div className="flex items-center p-1 bg-[#F8F6F0] border border-border rounded-xl text-xs font-bold">
                <button
                  onClick={() => setUserStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userStatusFilter === 'all' ? 'bg-[#2D5A3F] text-white' : 'text-charcoal-600'
                  }`}
                >
                  전체 ({users.length})
                </button>
                <button
                  onClick={() => setUserStatusFilter('pending')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userStatusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-charcoal-600'
                  }`}
                >
                  승인 대기중 ({pendingUsersCount})
                </button>
                <button
                  onClick={() => setUserStatusFilter('approved')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userStatusFilter === 'approved' ? 'bg-[#2D5A3F] text-white' : 'text-charcoal-600'
                  }`}
                >
                  승인 완료 ({approvedUsersCount})
                </button>
              </div>
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-white rounded-2xl border border-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-charcoal-700 border-collapse">
                <thead>
                  <tr className="bg-[#EAF2EC] text-[#1A3323] font-bold border-b border-border">
                    <th className="p-3.5">교사명</th>
                    <th className="p-3.5">이메일</th>
                    <th className="p-3.5">교사 구분</th>
                    <th className="p-3.5">권한</th>
                    <th className="p-3.5">신청일</th>
                    <th className="p-3.5">승인 상태</th>
                    <th className="p-3.5 text-right">승인 처리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-charcoal-400 font-semibold">
                        해당하는 교사 계정이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isPending = u.status === 'pending' && u.role !== 'admin';
                      return (
                        <tr key={u.uid} className="hover:bg-[#F8F6F0]/60 transition-colors">
                          <td className="p-3.5 font-bold text-[#1A3323]">
                            {u.displayName || '교사'}
                          </td>
                          <td className="p-3.5 font-mono text-charcoal-600">
                            {u.email || '미등록 이메일'}
                          </td>
                          <td className="p-3.5 font-medium text-charcoal-800">
                            {u.userType ? USER_TYPES[u.userType] : '미지정'}
                          </td>
                          <td className="p-3.5">
                            {u.role === 'admin' ? (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200">
                                관리자
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-semibold text-[11px]">
                                교사
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-charcoal-500 font-mono">
                            {u.createdAt ? u.createdAt.substring(0, 10) : '-'}
                          </td>
                          <td className="p-3.5">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300">
                                <Clock className="w-3 h-3" /> 승인 대기중
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 승인 완료
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            {u.role === 'admin' ? (
                              <span className="text-xs text-charcoal-400 italic">최고 관리자</span>
                            ) : isPending ? (
                              <button
                                onClick={() => handleApproveUser(u.uid)}
                                className="inline-flex items-center gap-1 bg-[#2D5A3F] hover:bg-[#234731] text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs text-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>승인하기</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRevokeUser(u.uid)}
                                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-amber-100 text-charcoal-600 hover:text-amber-900 font-semibold px-3 py-1.5 rounded-xl transition-all border border-border text-xs"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>승인 취소</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 3: TEACHER CREATED MATERIALS ==================== */}
      {activeTab === 'materials' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF2EC] text-[#2D5A3F] flex items-center justify-center border border-[#C5DDCB]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1A3323]">교사 작성 UDL 학습자료 통합 조회</h2>
                <p className="text-xs text-charcoal-500">
                  전체 교사들이 생성하고 저장한 맞춤형 교수적 수정 학습지 및 원본 데이터를 분석합니다.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="제목, 교과, 교사 이메일..."
                  value={materialSearchTerm}
                  onChange={(e) => setMaterialSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs bg-[#F8F6F0] border border-border rounded-xl focus:outline-none focus:border-[#2D5A3F] w-48 sm:w-64"
                />
              </div>

              <select
                value={materialLevelFilter}
                onChange={(e) => setMaterialLevelFilter(e.target.value)}
                className="bg-[#F8F6F0] text-xs font-bold text-charcoal-700 border border-border rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="all">전체 학교급</option>
                <option value="elementary">초등</option>
                <option value="middle">중등</option>
                <option value="high">고등</option>
              </select>
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMaterials.length === 0 ? (
              <div className="col-span-full py-16 text-center text-charcoal-400 bg-white rounded-2xl border border-border">
                <FileText className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">조건에 해당하는 교사 생성 학습지가 없습니다.</p>
              </div>
            ) : (
              filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Tags */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2EC] text-[#2D5A3F] font-bold border border-[#C5DDCB]">
                        {mat.schoolLevel === 'elementary' ? '초등' : mat.schoolLevel === 'middle' ? '중등' : '고등'} • {mat.subject}
                      </span>
                      <span className="text-charcoal-400 font-mono">
                        {mat.createdAt ? mat.createdAt.substring(0, 10) : ''}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-[#1A3323] line-clamp-2 leading-snug">
                      {mat.title}
                    </h3>

                    {/* Teacher Info */}
                    <div className="text-xs text-charcoal-500 bg-[#F8F6F0] p-2.5 rounded-xl border border-border/60 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-charcoal-600">작성 교사:</span>
                        <span className="font-mono text-charcoal-800">{mat.userEmail || '선생님'}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>글 Level {mat.textModificationLevel}</span>
                        <span>시각 Level {mat.visualModificationLevel}</span>
                      </div>
                    </div>

                    {/* Applied Strategies badges */}
                    <div className="flex flex-wrap gap-1">
                      {mat.textStrategies?.slice(0, 2).map((st, idx) => (
                        <span key={idx} className="text-[10px] bg-oat-50 text-charcoal-600 px-2 py-0.5 rounded-md border border-border">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => setSelectedMaterialForPreview(mat)}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-[#2D5A3F] hover:bg-[#234731] text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>교사 작성 내역 상세보기</span>
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ==================== MATERIAL DETAIL MODAL ==================== */}
      {selectedMaterialForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#F8F6F0] border border-border rounded-3xl p-6 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF2EC] text-[#2D5A3F] flex items-center justify-center border border-[#C5DDCB]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A3323]">
                    {selectedMaterialForPreview.title}
                  </h2>
                  <p className="text-xs text-charcoal-500 font-mono">
                    작성 교사: {selectedMaterialForPreview.userEmail} | 등록일: {selectedMaterialForPreview.createdAt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMaterialForPreview(null)}
                className="p-2 rounded-xl bg-white hover:bg-gray-100 border border-border text-charcoal-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto my-4 p-5 bg-white rounded-2xl border border-border space-y-5 text-xs sm:text-sm text-charcoal-800">
              
              {/* Settings Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#EAF2EC] border border-[#C5DDCB] p-4 rounded-xl text-xs">
                <div>
                  <span className="text-charcoal-500 block text-[11px]">학교급 / 교과</span>
                  <span className="font-bold text-[#1A3323]">{selectedMaterialForPreview.schoolLevel} / {selectedMaterialForPreview.subject}</span>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[11px]">글 난이도</span>
                  <span className="font-bold text-[#2D5A3F]">Level {selectedMaterialForPreview.textModificationLevel}</span>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[11px]">시각 난이도</span>
                  <span className="font-bold text-[#2D5A3F]">Level {selectedMaterialForPreview.visualModificationLevel}</span>
                </div>
                <div>
                  <span className="text-charcoal-500 block text-[11px]">교육적 요구</span>
                  <span className="font-bold text-charcoal-800">{selectedMaterialForPreview.educationalNeeds?.join(', ') || '기본'}</span>
                </div>
              </div>

              {/* Teacher Instructions */}
              {selectedMaterialForPreview.teacherRequest && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-amber-900">✍️ 교사 세부 요구사항:</span>
                  <p className="text-amber-950">{selectedMaterialForPreview.teacherRequest}</p>
                </div>
              )}

              {/* Must Keep Text */}
              {selectedMaterialForPreview.mustKeepText && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-blue-900">📌 반드시 유지한 문구/어휘:</span>
                  <p className="text-blue-950">{selectedMaterialForPreview.mustKeepText}</p>
                </div>
              )}

              {/* Simplified Content Preview */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="font-bold text-sm text-[#1A3323]">📄 생성된 UDL 학생용 본문 내용:</h4>
                <div className="p-4 bg-[#F8F6F0] rounded-xl border border-border whitespace-pre-wrap leading-relaxed font-sans text-xs text-charcoal-800">
                  {selectedMaterialForPreview.generatedContent?.simplifiedContent || '본문 내용 없음'}
                </div>
              </div>

              {/* Activities */}
              {selectedMaterialForPreview.generatedContent?.activities && selectedMaterialForPreview.generatedContent.activities.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <h4 className="font-bold text-sm text-[#1A3323]">🧩 구성된 학습 활동 ({selectedMaterialForPreview.generatedContent.activities.length}개):</h4>
                  <div className="space-y-3">
                    {selectedMaterialForPreview.generatedContent.activities.map((act, i) => (
                      <div key={i} className="p-3 bg-white border border-border rounded-xl space-y-1">
                        <span className="font-bold text-xs text-[#2D5A3F]">{act.title}</span>
                        <p className="text-xs text-charcoal-700 whitespace-pre-wrap">{act.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-border flex justify-end shrink-0">
              <button
                onClick={() => setSelectedMaterialForPreview(null)}
                className="bg-[#2D5A3F] hover:bg-[#234731] text-white font-bold px-6 py-2 rounded-xl text-xs"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
