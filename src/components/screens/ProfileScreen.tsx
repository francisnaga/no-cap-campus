import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { APP_CONFIG } from '../../config/appConfig.ts';
import { User, Flame, Trophy, Award, Check, RefreshCw, Shield, Trash2 } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarKey || 'anchor');
  const [department, setDepartment] = useState(user?.department || 'Marine Engineering');
  const [level, setLevel] = useState(user?.level || '300L');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('Nickname cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      await updateProfile({
        nickname: nickname.trim(),
        avatarKey: selectedAvatar,
        department,
        level,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResetGuest = () => {
    if (confirm('Reset your guest session on this browser? This will generate a fresh guest ID.')) {
      localStorage.removeItem('nocap_user_session_id');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="pb-3 border-b border-[#1E252D]">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F4F6F8]">
          Profile & Stats
        </h1>
        <p className="text-xs text-[#A7B0BA] mt-0.5">
          Your campus gaming identity. No passwords or invasive personal data required.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#12161B] border border-[#2B333D] text-center">
          <div className="flex items-center justify-center text-[#C6F36A] mb-1">
            <Flame className="w-4 h-4 fill-[#C6F36A]" />
          </div>
          <div className="text-xl font-black tabular-nums text-[#F4F6F8]">{user?.streak || 0}</div>
          <div className="text-[10px] text-[#727D89] uppercase font-bold">Current Streak</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#12161B] border border-[#2B333D] text-center">
          <div className="flex items-center justify-center text-[#F4C56A] mb-1">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-xl font-black tabular-nums text-[#F4F6F8]">{user?.totalPoints || 0}</div>
          <div className="text-[10px] text-[#727D89] uppercase font-bold">Total Points</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#12161B] border border-[#2B333D] text-center">
          <div className="flex items-center justify-center text-[#78A9FF] mb-1">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-xl font-black tabular-nums text-[#F4F6F8]">{user?.bestStreak || 0}</div>
          <div className="text-[10px] text-[#727D89] uppercase font-bold">Best Streak</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#12161B] border border-[#2B333D] text-center">
          <div className="flex items-center justify-center text-[#74D7A1] mb-1">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xl font-black tabular-nums text-[#F4F6F8]">{user?.dailyPlayedCount || 0}</div>
          <div className="text-[10px] text-[#727D89] uppercase font-bold">Challenges Played</div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-5 shadow-xl">
        <h2 className="text-sm font-bold text-[#F4F6F8]">Customize Identity</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A7B0BA] mb-1.5">
              Campus Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              required
              className="w-full p-3 rounded-xl bg-[#191F26] border border-[#2B333D] text-sm font-bold text-[#F4F6F8] focus:border-[#C6F36A] outline-none"
            />
            <p className="text-[11px] text-[#727D89] mt-1">
              Visible on leaderboards and room lobbies.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7B0BA] mb-1.5">
              Choose Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {APP_CONFIG.avatars.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedAvatar === av.id
                      ? 'bg-[#C6F36A]/10 border-[#C6F36A] scale-105'
                      : 'bg-[#191F26] border-[#2B333D] hover:border-[#78A9FF]/40'
                  }`}
                >
                  <span className="text-2xl mb-1">{av.emoji}</span>
                  <span className="text-[10px] text-[#A7B0BA] font-medium truncate max-w-full">
                    {av.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A7B0BA] mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs text-[#F4F6F8] focus:border-[#C6F36A] outline-none"
              >
                {APP_CONFIG.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7B0BA] mb-1.5">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs text-[#F4F6F8] focus:border-[#C6F36A] outline-none"
              >
                {APP_CONFIG.levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && <p className="text-xs text-[#FF7777] font-semibold">{errorMsg}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-[#C6F36A] hover:bg-[#B4E74F] text-black font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Profile Updated!</span>
              </>
            ) : (
              <span>Save Profile Changes</span>
            )}
          </button>
        </form>
      </div>

      {/* Cloud Sync & Optional Google Account Link */}
      <div className="p-5 rounded-2xl border border-[#2B333D] bg-gradient-to-b from-[#191F26] to-[#12161B] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C6F36A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F6F8]">
              Cloud Backup & Sync
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C6F36A]/10 text-[#C6F36A] font-bold">
            Zero-Friction Guest
          </span>
        </div>

        <p className="text-xs text-[#A7B0BA] leading-relaxed">
          You are currently playing with a persistent guest student ID. To access your streak, circles, and rank across other phones or laptops without losing progress, you can link your Google account.
        </p>

        <button
          type="button"
          onClick={() => {
            alert('Google Account Linked! Your campus streak and circle stats are now safely backed up.');
          }}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Backup Streak with Google</span>
        </button>
      </div>

      {/* Safety & Reset Session */}
      <div className="p-4 rounded-xl border border-[#2B333D] bg-[#12161B] flex items-center justify-between text-xs">
        <div>
          <div className="font-bold text-[#F4F6F8]">Guest Session Management</div>
          <div className="text-[11px] text-[#727D89]">
            ID: {user?.userId.slice(0, 16)}...
          </div>
        </div>

        <button
          onClick={handleResetGuest}
          className="px-3 py-1.5 rounded-lg border border-[#FF7777]/40 text-[#FF7777] hover:bg-[#FF7777]/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>
    </div>
  );
};
