import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Smartphone, Database, Info, ChevronRight, Trash2, ExternalLink, Moon, Palette, LogOut, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface SettingsRowProps {
  icon: any;
  label: string;
  subLabel?: string;
  trailing?: React.ReactNode;
  destructive?: boolean;
  onClick?: () => void;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon: Icon, label, subLabel, trailing, destructive, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-5 hover:bg-zinc-800 transition-colors cursor-pointer active:bg-zinc-700 first:rounded-t-2xl last:rounded-b-2xl"
  >
    <div className="flex items-center gap-5">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800", destructive ? "text-red-500" : "text-zinc-400 group-hover:text-primary transition-colors")}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={cn("text-base font-bold", destructive ? "text-red-500" : "text-white tracking-tight leading-none")}>{label}</p>
        {subLabel && <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{subLabel}</p>}
      </div>
    </div>
    {trailing}
  </div>
);

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { topics, subjects, deleteTopic, deleteSubject, loading } = useData();
  const [status, setStatus] = useState<'idle' | 'working' | 'done'>('idle');
  const [confirmWipe, setConfirmWipe] = useState(false);

  const wipeAllData = async () => {
    if (status === 'working') return;
    setStatus('working');
    
    try {
      // Delete all topics
      for (const t of topics) {
        await deleteTopic(t.id);
      }
      // Delete all subjects
      for (const s of subjects) {
        await deleteSubject(s.id);
      }
      setStatus('done');
      setConfirmWipe(false);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      alert("Some items could not be deleted. Please check your connection.");
      setStatus('idle');
    }
  };

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto py-6 px-4 space-y-8 pb-32"
    >
      {/* Profile Header */}
      <section className="bento-card p-8 flex flex-col items-center text-center gap-4 bg-zinc-900/50">
        <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary/10 flex items-center justify-center overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-primary" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
            {user?.displayName || 'User Profile'}
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{user?.email}</p>
        </div>
        <button 
          onClick={logout}
          className="mt-2 px-6 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-700"
        >
          Sign Out
        </button>
      </section>

      {/* App Settings */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-4 italic">Device Settings</h2>
        
        <div className="bento-card overflow-hidden divide-y divide-zinc-800/50">
          {/* Sync Status */}
          <div className="p-6 flex items-center justify-between bg-zinc-900/20 opacity-80">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-600 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">Cloud Sync</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Real-time backup active</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 pt-4">
        <h2 className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.3em] px-4 italic">Danger Zone</h2>
        
        <div className="bento-card border-red-500/10 bg-red-500/5 overflow-hidden">
          {!confirmWipe ? (
            <button 
              onClick={() => setConfirmWipe(true)}
              className="w-full p-6 flex flex-col items-center gap-2 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-8 h-8 text-red-500" />
              <div className="text-center">
                <p className="font-bold text-red-500 text-lg">Wipe All Data</p>
                <p className="text-[10px] font-bold text-red-500/50 uppercase tracking-widest leading-none">Delete everything permanently</p>
              </div>
            </button>
          ) : (
            <div className="p-6 space-y-4">
              <p className="text-center text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">This cannot be undone. Are you sure?</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setConfirmWipe(false)}
                  className="py-4 bg-zinc-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                  No, Cancel
                </button>
                <button 
                  onClick={wipeAllData}
                  disabled={status === 'working'}
                  className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                >
                  {status === 'working' ? 'Wiping...' : 'Yes, Wipe All'}
                </button>
              </div>
            </div>
          )}
        </div>
        {status === 'done' && (
          <p className="text-center text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] animate-fade-in">All data cleared successfully.</p>
        )}
      </div>

      <div className="pt-8 text-center space-y-2 opacity-30">
        <p className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Revize Spaced Retrieval</p>
        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">Build 26.04 • v1.0.5</p>
      </div>
    </motion.div>
  );
};
