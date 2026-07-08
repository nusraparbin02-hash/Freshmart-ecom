import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { TrendingUp, DollarSign, PackageCheck, Percent } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export function AnalyticsDashboard() {
  const { orders, supabaseConnectionStatus } = useStore();
  const [activeCycle, setActiveCycle] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  
  // Filter completed orders to fold sales revenue into charts dynamically
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'Completed'), [orders]);
  const completedRevenue = useMemo(() => completedOrders.reduce((sum, o) => sum + o.subtotal, 0), [completedOrders]);

  // Daily: 7-day array mapping days (Mon–Sun)
  const dailyData = useMemo(() => {
    const base = [
      { timeLabel: 'Mon', revenue: 450, ordersCount: 15 },
      { timeLabel: 'Tue', revenue: 380, ordersCount: 12 },
      { timeLabel: 'Wed', revenue: 520, ordersCount: 18 },
      { timeLabel: 'Thu', revenue: 490, ordersCount: 16 },
      { timeLabel: 'Fri', revenue: 750, ordersCount: 25 },
      { timeLabel: 'Sat', revenue: 980, ordersCount: 32 },
      { timeLabel: 'Sun', revenue: 840, ordersCount: 28 }
    ];
    // Blend active completed orders into the last element (Sunday)
    const copy = [...base];
    copy[6] = {
      ...copy[6],
      revenue: copy[6].revenue + completedRevenue,
      ordersCount: copy[6].ordersCount + completedOrders.length
    };
    return copy;
  }, [completedRevenue, completedOrders]);

  // Weekly: 4-point array mapping week segments (Wk 1–Wk 4)
  const weeklyData = useMemo(() => {
    const base = [
      { timeLabel: 'Wk 1', revenue: 2400, ordersCount: 80 },
      { timeLabel: 'Wk 2', revenue: 2800, ordersCount: 95 },
      { timeLabel: 'Wk 3', revenue: 3100, ordersCount: 104 },
      { timeLabel: 'Wk 4', revenue: 3500, ordersCount: 115 }
    ];
    // Blend active completed orders into the last element (Wk 4)
    const copy = [...base];
    copy[3] = {
      ...copy[3],
      revenue: copy[3].revenue + completedRevenue,
      ordersCount: copy[3].ordersCount + completedOrders.length
    };
    return copy;
  }, [completedRevenue, completedOrders]);

  // Monthly: 6-to-12 point array mapping calendar months (Jan - Dec)
  const monthlyData = useMemo(() => {
    const base = [
      { timeLabel: 'Jan', revenue: 12000, ordersCount: 400 },
      { timeLabel: 'Feb', revenue: 14500, ordersCount: 480 },
      { timeLabel: 'Mar', revenue: 13800, ordersCount: 460 },
      { timeLabel: 'Apr', revenue: 16200, ordersCount: 540 },
      { timeLabel: 'May', revenue: 17500, ordersCount: 580 },
      { timeLabel: 'Jun', revenue: 19100, ordersCount: 630 },
      { timeLabel: 'Jul', revenue: 18400, ordersCount: 610 },
      { timeLabel: 'Aug', revenue: 20100, ordersCount: 670 },
      { timeLabel: 'Sep', revenue: 19500, ordersCount: 650 },
      { timeLabel: 'Oct', revenue: 21200, ordersCount: 700 },
      { timeLabel: 'Nov', revenue: 23500, ordersCount: 780 },
      { timeLabel: 'Dec', revenue: 28900, ordersCount: 960 }
    ];
    // Blend active completed orders into July (index 6, assuming current month is July 2026)
    const copy = [...base];
    copy[6] = {
      ...copy[6],
      revenue: copy[6].revenue + completedRevenue,
      ordersCount: copy[6].ordersCount + completedOrders.length
    };
    return copy;
  }, [completedRevenue, completedOrders]);

  // Yearly: comparative dataset tracking historical trajectories up to 2026
  const yearlyData = useMemo(() => {
    const base = [
      { timeLabel: '2023', revenue: 185000, ordersCount: 6100 },
      { timeLabel: '2024', revenue: 214000, ordersCount: 7100 },
      { timeLabel: '2025', revenue: 242000, ordersCount: 8050 },
      { timeLabel: '2026', revenue: 289000, ordersCount: 9630 }
    ];
    // Blend active completed orders into 2026 (index 3)
    const copy = [...base];
    copy[3] = {
      ...copy[3],
      revenue: copy[3].revenue + completedRevenue,
      ordersCount: copy[3].ordersCount + completedOrders.length
    };
    return copy;
  }, [completedRevenue, completedOrders]);

  const activeChartData = useMemo(() => {
    switch (activeCycle) {
      case 'Daily': return dailyData;
      case 'Weekly': return weeklyData;
      case 'Monthly': return monthlyData;
      case 'Yearly': return yearlyData;
    }
  }, [activeCycle, dailyData, weeklyData, monthlyData, yearlyData]);

  // Calculated Stats
  const totalRevenue = useMemo(() => activeChartData.reduce((sum, d) => sum + d.revenue, 0), [activeChartData]);
  const totalOrders = useMemo(() => activeChartData.reduce((sum, d) => sum + d.ordersCount, 0), [activeChartData]);
  const averageTicket = useMemo(() => (totalOrders > 0 ? totalRevenue / totalOrders : 0), [totalRevenue, totalOrders]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Connection Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-lg font-black text-gray-900">Analytics & Insights</h2>
          <p className="text-xs text-gray-500">Real-time performance metrics and sales trajectories</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm">
          <div className={`h-2.5 w-2.5 rounded-full ${supabaseConnectionStatus === 'connected' ? 'bg-[#16A34A] animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            DB Status: {supabaseConnectionStatus === 'connected' ? (
              <span className="text-[#16A34A]">Live Supabase</span>
            ) : (
              <span className="text-amber-600">Local Fallback</span>
            )}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gross Sales ({activeCycle})</span>
            <h3 className="text-xl font-black text-gray-900">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-green-100 text-[#16A34A] p-2.5 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fulfillment Volume</span>
            <h3 className="text-xl font-black text-gray-900">{totalOrders} Orders</h3>
          </div>
          <div className="bg-green-100 text-[#16A34A] p-2.5 rounded-xl">
            <PackageCheck className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Ticket</span>
            <h3 className="text-xl font-black text-gray-900">${averageTicket.toFixed(2)}</h3>
          </div>
          <div className="bg-green-100 text-[#16A34A] p-2.5 rounded-xl">
            <Percent className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Recharts Canvas Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
        {/* Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="space-y-0.5">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[#16A34A]" />
              <span>Gross Revenue Visuals</span>
            </h2>
            <p className="text-[10px] text-gray-400">Cyclic performance breakdown comparison graphs</p>
          </div>

          {/* Timeframe selector pills matrix */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1 mt-3 sm:mt-0 max-w-max">
            {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setActiveCycle(cycle)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeCycle === cycle
                    ? 'bg-white text-[#16A34A] shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={activeChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
              <XAxis
                dataKey="timeLabel"
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              {/* High-Contrast Light Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  borderColor: '#E5E7EB',
                  fontSize: '11px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                  color: '#1E293B',
                  fontWeight: 'bold'
                }}
                formatter={(val: any) => [`$${val ? Number(val).toLocaleString() : '0'}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#16A34A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
