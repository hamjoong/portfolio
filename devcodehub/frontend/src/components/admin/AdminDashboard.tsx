import React, { useEffect, useState } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import api from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatsData {
  summary: {
    totalUsers: number;
    todaySignups: number;
    totalPosts: number;
    totalReviews: number;
    totalRevenue: number;
  };
  dailySignups: { date: string; count: number }[];
  dailyPosts: { date: string; count: number }[];
  dailyReviews: { date: string; count: number }[];
  dailyRevenue: { date: string; amount: number }[];
  userRoleDistribution: Record<string, number>;
  aiModelDistribution: Record<string, number>;
  boardTypeDistribution: Record<string, number>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats?days=30');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) return <div className="text-center py-20">통계 데이터 로딩 중</div>;

  const signupChartData = {
    labels: stats.dailySignups.map(d => d.date),
    datasets: [
      {
        label: '신규 가입자',
        data: stats.dailySignups.map(d => d.count),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const revenueChartData = {
    labels: stats.dailyRevenue.map(d => d.date),
    datasets: [
      {
        label: '매출 (Credits)',
        data: stats.dailyRevenue.map(d => d.amount),
        backgroundColor: '#10b981',
        borderRadius: 8,
      }
    ]
  };

  const modelPieData = {
    labels: Object.keys(stats.aiModelDistribution),
    datasets: [
      {
        data: Object.values(stats.aiModelDistribution),
        backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '전체 회원', value: stats.summary.totalUsers.toLocaleString(), sub: `오늘 +${stats.summary.todaySignups}`, color: 'blue' },
          { label: '누적 매출', value: `${stats.summary.totalRevenue.toLocaleString()} C`, sub: '전체 충전액', color: 'green' },
          { label: '전체 게시글', value: stats.summary.totalPosts.toLocaleString(), sub: 'SKILL + AI', color: 'purple' },
          { label: 'AI 리뷰 수', value: stats.summary.totalReviews.toLocaleString(), sub: '누적 요청건', color: 'orange' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{card.label}</p>
            <h4 className={`text-3xl font-black mb-1 text-slate-900`}>{card.value}</h4>
            <p className="text-xs text-slate-500 font-bold">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8">가입자 추이 (최근 30일)</h3>
          <div className="h-80">
            <Line data={signupChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8">일별 매출 현황</h3>
          <div className="h-80">
            <Bar data={revenueChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 text-center">AI 모델 점유율</h3>
          <div className="h-64">
            <Pie data={modelPieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm md:col-span-2">
          <h3 className="text-lg font-black text-slate-900 mb-8">게시판 활성도</h3>
          <div className="space-y-6">
            {Object.entries(stats.boardTypeDistribution).map(([type, count]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-600">{type}</span>
                  <span className="text-slate-900">{count}개</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-1000" 
                    style={{ width: `${(count / stats.summary.totalPosts) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
