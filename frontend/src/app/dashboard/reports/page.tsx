'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, DollarSign, Users, Target, Download } from 'lucide-react';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.08 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalAdSpend: 0,
    avgRoi: 0,
    totalReach: 0,
    revenueData: [],
    channelData: [],
    campaignPerf: []
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('drex_token');
        const res = await fetch('http://localhost:5000/api/stats/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const kpis = [
    { label: 'Expected Client MRR',    value: `$${(stats.totalRevenue || 0).toLocaleString()}`,  change: '0.0%', positive: true,  icon: DollarSign },
    { label: 'Total Allocated Budget',   value: `$${(stats.totalAdSpend || 0).toLocaleString()}`,  change: '0.0%', positive: false, icon: Target },
    { label: 'Avg. ROI',         value: `${stats.avgRoi}%`,   change: '0.0%',  positive: true,  icon: TrendingUp },
    { label: 'Total Reach',      value: `${stats.totalReach}`,  change: '0.0%', positive: true,  icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Performance analytics across all campaigns and channels.</p>
        </div>
        <button
          id="export-report-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-white/5 transition-all"
        >
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl glassmorphism">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  kpi.positive ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-slate-400/10'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <p className="text-muted-foreground text-xs mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold">{loading ? '-' : kpi.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Spend Chart */}
        <motion.div className="lg:col-span-2 glassmorphism rounded-2xl p-6"
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="text-lg font-bold mb-1">Revenue vs Ad Spend</h3>
          <p className="text-sm text-muted-foreground mb-6">6-month performance overview</p>
          <div className="h-[260px]">
            {stats.revenueData.length === 0 ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                 No analytics data recorded yet.
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueData}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff40" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis stroke="#ffffff40" axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff15', borderRadius: '10px', fontSize: 12 }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#gradRevenue)" />
                  <Area type="monotone" dataKey="spend" name="Ad Spend" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#gradSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Channel Breakdown Pie */}
        <motion.div className="glassmorphism rounded-2xl p-6"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-lg font-bold mb-1">Channel Breakdown</h3>
          <p className="text-sm text-muted-foreground mb-4">Share of reach by platform</p>
          <div className="h-[200px]">
            {stats.channelData.length === 0 ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl text-center">
                 No channel data
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.channelData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {stats.channelData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff15', borderRadius: '10px', fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {stats.channelData.length > 0 && (
            <div className="space-y-2 mt-4">
              {stats.channelData.map((ch: any) => (
                <div key={ch.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                    <span className="text-muted-foreground">{ch.name}</span>
                  </div>
                  <span className="font-semibold">{ch.value}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Campaign Performance Bar Chart */}
      <motion.div className="glassmorphism rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h3 className="text-lg font-bold mb-1">Campaign Performance</h3>
        <p className="text-sm text-muted-foreground mb-6">Impressions, clicks, and conversions by campaign</p>
        <div className="h-[240px]">
          {stats.campaignPerf.length === 0 ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                 No campaign performance data recorded yet.
               </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.campaignPerf} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#ffffff40" axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}K`} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff15', borderRadius: '10px', fontSize: 12 }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(v: number) => [v.toLocaleString(), '']}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="impressions" name="Impressions" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" name="Clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" name="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </div>
  );
}
