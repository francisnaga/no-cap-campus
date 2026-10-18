import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';
import {
  Flame,
  Home,
  Gamepad2,
  Users,
  Trophy,
  User,
  ShieldAlert,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

export type NavTab = 'home' | 'play' | 'daily' | 'circles' | 'rankings' | 'profile' | 'admin';

interface ShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeRoomCode?: string | null;
  onOpenRoom?: (code: string) => void;
  toastMessage?: string | null;
  onClearToast?: () => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  currentTab,
  onSelectTab,
  activeRoomCode,
  onOpenRoom,
  toastMessage,
  onClearToast,
  children,
}) => {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Offensive content');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'daily', label: 'Daily', icon: Flame },
    { id: 'play', label: 'Play Live', icon: Gamepad2 },
    { id: 'circles', label: 'Circles', icon: Users },
  ];

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportDetails('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F4F6F8] flex flex-col selection:bg-[#C6F36A] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#191F26] border border-[#C6F36A]/50 text-xs font-semibold text-[#F4F6F8] shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-[#C6F36A] animate-ping" />
            <span>{toastMessage}</span>
            {onClearToast && (
              <button onClick={onClearToast} className="ml-1 text-[#727D89] hover:text-[#F4F6F8]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1E252D] bg-[#0B0D10]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo & Brand: Clean single-line zone */}
          <button
            onClick={() => onSelectTab('daily')}
            className="flex items-center gap-2 group text-left cursor-pointer shrink-0"
            aria-label="NO CAP Home"
          >
            <BrandLogo />
          </button>

          {/* Center: Active Room Quick Resume (if in room) */}
          {activeRoomCode && (
            <button
              onClick={() => onOpenRoom?.(activeRoomCode)}
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6F36A]/10 border border-[#C6F36A]/30 text-xs text-[#C6F36A] hover:bg-[#C6F36A]/20 transition-all animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-[#C6F36A]" />
              <span>In Room <strong>{activeRoomCode}</strong></span>
            </button>
          )}

          {/* Right: User Snapshot & Report */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowReportModal(true)}
              aria-label="Report issue or prompt"
              className="hidden sm:flex p-2 rounded-xl text-[#727D89] hover:text-[#FF7777] hover:bg-[#191F26] transition-colors"
              title="Report an issue or prompt"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full bg-[#12161B] border border-[#2B333D] hover:border-[#C6F36A] active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-base leading-none">
                {APP_CONFIG.avatars.find((a) => a.id === user?.avatarKey)?.emoji || '⚓'}
              </span>
              <span className="text-xs font-semibold text-[#F4F6F8] max-w-[90px] sm:max-w-[130px] truncate">
                {user?.nickname || 'Guest'}
              </span>
              {user && user.streak > 0 && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#C6F36A] bg-[#C6F36A]/10 px-1.5 py-0.5 rounded-full">
                  🔥{user.streak}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 mb-20 md:mb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Minimalist 3-Tab Architecture) */}
      <nav
        aria-label="Primary mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#1E252D] bg-[#0B0D10]/95 backdrop-blur-lg px-4 py-2"
      >
        <div className="grid grid-cols-3 max-w-sm mx-auto gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#191F26] text-[#C6F36A] font-bold border border-[#2B333D]'
                    : 'text-[#727D89] hover:text-[#A7B0BA]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[11px] tracking-tight mt-1 font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Floating/Sticky Footer Links */}
      <footer className="hidden md:block border-t border-[#1E252D] py-4 bg-[#0B0D10] text-xs text-[#727D89]">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#A7B0BA]">{APP_CONFIG.name}</span>
            <span>&bull;</span>
            <span>{APP_CONFIG.tagline}</span>
            <span>&bull;</span>
            <span>Default: {APP_CONFIG.defaultInstitution.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onSelectTab('admin')} className="hover:text-[#F4F6F8]">
              Diagnostics & Admin
            </button>
            <button onClick={() => setShowReportModal(true)} className="hover:text-[#FF7777]">
              Safety & Reports
            </button>
          </div>
        </div>
      </footer>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#2B333D] bg-[#12161B] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B333D]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#FF7777]">
                <ShieldAlert className="w-4 h-4" />
                <span>Report Content or User</span>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-[#727D89] hover:text-[#F4F6F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <Check className="w-8 h-8 text-[#74D7A1] mx-auto" />
                <p className="text-sm font-bold text-[#F4F6F8]">Report Received</p>
                <p className="text-xs text-[#A7B0BA]">Thank you for keeping campus games safe and respectful.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BA] mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs text-[#F4F6F8] focus:border-[#C6F36A] outline-none"
                  >
                    <option value="Offensive content">Inappropriate / Offensive prompt</option>
                    <option value="Targeting real student or staff">Names or targets real student / lecturer</option>
                    <option value="Harassment or abuse">Harassment or room abuse</option>
                    <option value="Inappropriate nickname">Inappropriate nickname</option>
                    <option value="Other">Other safety concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BA] mb-1">
                    Additional details (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Briefly describe what happened..."
                    className="w-full p-2.5 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs text-[#F4F6F8] focus:border-[#C6F36A] outline-none placeholder:text-[#727D89]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#191F26] text-xs font-semibold text-[#A7B0BA] hover:bg-[#222A33]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#FF7777] text-xs font-bold text-black hover:opacity-90"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
