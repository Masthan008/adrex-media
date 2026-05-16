'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalRevenue: 0,
    activeCampaigns: 0,
    totalInfluencers: 0,
    chartData: [],
    recentActivity: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('drex_token');
        const res = await fetch('http://localhost:5000/api/stats/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      label: 'Total Expected Revenue', 
      value: `$${statsData.totalRevenue.toLocaleString()}`, 
      change: '+0.0%', 
      isPositive: true, 
      icon: DollarSign 
    },
    { 
      label: 'Active Campaigns', 
      value: `${statsData.activeCampaigns}`, 
      change: '+0.0%', 
      isPositive: true, 
      icon: Target 
    },
    { 
      label: 'Total Influencers', 
      value: `${statsData.totalInfluencers}`, 
      change: '+0.0%', 
      isPositive: true, 
      icon: Users 
    },
    { 
      label: 'Avg. ROI', 
      value: '0%', 
      change: '0%', 
      isPositive: true, 
      icon: TrendingUp 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your agency today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="p-6 rounded-2xl glassmorphism"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-white/5 text-primary">
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium">{stat.label}</h3>
              <p className="text-3xl font-bold mt-1">{loading ? '-' : stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 rounded-2xl glassmorphism"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold">Revenue Analytics</h3>
            <p className="text-sm text-muted-foreground">Revenue vs Ad Spend over time</p>
          </div>
          <div className="h-[300px] w-full">
            {statsData.chartData.length === 0 ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                 No analytics data recorded yet.
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statsData.chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl glassmorphism flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest actions across campaigns</p>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {statsData.recentActivity.length === 0 ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground text-center">
                 No recent activity recorded yet.
               </div>
            ) : statsData.recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex gap-4 items-start pb-4 border-b border-border/50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Target size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
