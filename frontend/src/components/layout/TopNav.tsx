'use client';

import { Bell, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const notifications = [
  { id: '1', text: 'Campaign "Summer Glow" approved', time: '2m ago', read: false },
  { id: '2', text: 'New influencer request from @style.sara', time: '15m ago', read: false },
  { id: '3', text: 'Client NovaTech added $10K to budget', time: '1h ago', read: true },
  { id: '4', text: 'Task "Draft contracts" is overdue', time: '3h ago', read: true },
];

export default function TopNav() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-72">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          id="global-search"
          type="text"
          placeholder="Search campaigns, clients..."
          className="w-full pl-9 pr-4 py-2 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            id="notif-btn"
            onClick={() => { setShowNotifs(p => !p); setShowProfile(false); }}
            className="relative p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-0 top-12 w-80 glassmorphism rounded-2xl border border-border/50 shadow-2xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unread > 0 && <span className="text-xs text-primary">{unread} unread</span>}
                </div>
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-border/30 last:border-0 hover:bg-white/5 transition-all ${!n.read ? 'bg-primary/5' : ''}`}>
                    <p className="text-sm">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border/50" />

        {/* Profile */}
        <div className="relative">
          <button
            id="profile-btn"
            onClick={() => { setShowProfile(p => !p); setShowNotifs(false); }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              D
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold leading-none">DREX Admin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Super Admin</p>
            </div>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-0 top-12 w-52 glassmorphism rounded-2xl border border-border/50 shadow-2xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold">DREX Admin</p>
                  <p className="text-xs text-muted-foreground">admin@drexmedia.com</p>
                </div>
                {[
                  { label: 'Profile Settings', href: '/dashboard/settings' },
                  { label: 'Agency Settings', href: '/dashboard/settings' },
                  { label: 'Billing', href: '/dashboard/settings' },
                ].map(item => (
                  <a key={item.label} href={item.href} className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground">
                    {item.label}
                  </a>
                ))}
                <div className="border-t border-border/50">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-all">
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
