'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, Star, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Influencer {
  id: string;
  name: string;
  niche: string | null;
  platform: string; // derived from youtube/tiktok/instagram mostly
  followers: string; // we'll use rating for now, or just mock string
  rating: number;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newInf, setNewInf] = useState({ name: '', niche: '', platform: 'Instagram', followers: '100K', rating: 5, instagram: '', tiktok: '', youtube: '' });

  const fetchInfluencers = async () => {
    try {
      const token = localStorage.getItem('drex_token');
      const res = await fetch('http://localhost:5000/api/influencers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInfluencers(data);
      }
    } catch (error) {
      console.error('Failed to fetch influencers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInf.name) return;

    try {
      const token = localStorage.getItem('drex_token');
      const payload = {
        name: newInf.name,
        niche: newInf.niche,
        instagram: newInf.platform === 'Instagram' ? newInf.followers : '',
        tiktok: newInf.platform === 'TikTok' ? newInf.followers : '',
        youtube: newInf.platform === 'YouTube' ? newInf.followers : '',
        rating: newInf.rating
      };

      const res = await fetch('http://localhost:5000/api/influencers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const created = await res.json();
        setInfluencers(prev => [created, ...prev]);
        setNewInf({ name: '', niche: '', platform: 'Instagram', followers: '100K', rating: 5, instagram: '', tiktok: '', youtube: '' });
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to create influencer', error);
    }
  };

  const getPlatform = (inf: Influencer) => {
    if (inf.youtube) return { name: 'YouTube', followers: inf.youtube };
    if (inf.tiktok) return { name: 'TikTok', followers: inf.tiktok };
    if (inf.instagram) return { name: 'Instagram', followers: inf.instagram };
    return { name: 'Other', followers: 'N/A' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Influencer CRM</h1>
          <p className="text-muted-foreground mt-1">Manage your roster of content creators.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <Plus size={18} />
          <span>Add Influencer</span>
        </button>
      </div>

      <div className="glassmorphism rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, niche, or platform..." 
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Niche</th>
                <th className="pb-3 font-medium">Primary Platform</th>
                <th className="pb-3 font-medium">Followers</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground animate-pulse">Loading influencers...</td></tr>
              ) : influencers.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No influencers found. Add one above.</td></tr>
              ) : influencers.map((inf) => {
                const plat = getPlatform(inf);
                return (
                  <tr key={inf.id} className="border-b border-border/10 hover:bg-white/5 transition-colors group">
                    <td className="py-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-primary font-bold text-xs">
                        {inf.name.charAt(0).toUpperCase()}
                      </div>
                      {inf.name}
                    </td>
                    <td className="py-4 text-muted-foreground">{inf.niche || 'N/A'}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                        {plat.name}
                      </span>
                    </td>
                    <td className="py-4 font-medium">{plat.followers}</td>
                    <td className="py-4">
                      <div className="flex gap-1 text-yellow-500">
                        {[...Array(inf.rating || 0)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <button className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div className="relative z-10 w-full max-w-md glassmorphism rounded-2xl p-8"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add Influencer</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
              </div>
              <form className="space-y-4" onSubmit={handleCreate}>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name</label>
                  <input value={newInf.name} onChange={e => setNewInf(p => ({ ...p, name: e.target.value }))}
                    type="text" placeholder="e.g. Sarah Chen" required
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Niche</label>
                    <input value={newInf.niche} onChange={e => setNewInf(p => ({ ...p, niche: e.target.value }))}
                      type="text" placeholder="e.g. Tech, Beauty" 
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Rating (1-5)</label>
                    <input value={newInf.rating} onChange={e => setNewInf(p => ({ ...p, rating: parseInt(e.target.value) || 0 }))}
                      type="number" min={1} max={5}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Platform</label>
                    <select value={newInf.platform} onChange={e => setNewInf(p => ({ ...p, platform: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all">
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Followers</label>
                    <input value={newInf.followers} onChange={e => setNewInf(p => ({ ...p, followers: e.target.value }))}
                      type="text" placeholder="e.g. 150K" 
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] mt-4">
                  Add Influencer
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
