import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { DailyAttempt, DailyQuestionPackPublic, Circle } from '../../types/game.ts';
import { APP_CONFIG } from '../../config/appConfig.ts';
import { Flame, Play, Users, Plus, ArrowRight, ShieldCheck, Trophy, Sparkles, Clock, Gamepad2 } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (tab: 'daily' | 'play' | 'circles' | 'rankings' | 'profile') => void;
  onJoinRoomClick: () => void;
  onCreateRoomClick: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onJoinRoomClick,
  onCreateRoomClick,
}) => {
  const { user } = useAuth();
  const [dailyPack, setDailyPack] = useState<DailyQuestionPackPublic | null>(null);
  const [dailyAttempt, setDailyAttempt] = useState<DailyAttempt | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const packRes = await api.getDailyPack();
        if (isMounted) setDailyPack(packRes.pack);

        if (user) {
          const [attemptRes, circlesRes] = await Promise.all([
            api.getDailyAttempt(user.userId, packRes.pack.dateId),
            api.getUserCircles(user.userId),
          ]);
          if (isMounted) {
            setDailyAttempt(attemptRes.attempt);
            setCircles(circlesRes.circles);
          }
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const hasPlayedDaily = dailyAttempt?.completed;
  const inProgressDaily = dailyAttempt && !dailyAttempt.completed;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1E252D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F4F6F8]">
            Welcome back, <span className="text-[#C6F36A]">{user?.nickname || 'Scholar'}</span>
          </h1>
          <p className="text-xs text-[#A7B0BA] mt-0.5">
            {user?.department ? `${user.department} • ${user.level || '300L'}` : APP_CONFIG.defaultInstitution.name}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191F26] border border-[#2B333D] text-xs font-bold text-[#C6F36A]">
            <Flame className="w-3.5 h-3.5 fill-[#C6F36A]" />
            <span>{user?.streak || 0} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#12161B] border border-[#2B333D] text-xs font-semibold text-[#A7B0BA]">
            <Trophy className="w-3.5 h-3.5 text-[#F4C56A]" />
            <span>{user?.totalPoints || 0} pts</span>
          </div>
        </div>
      </div>

      {/* Hero: Daily Showdown Priority Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2B333D] bg-gradient-to-br from-[#191F26] via-[#12161B] to-[#0B0D10] p-6 shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C6F36A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6F36A] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#C6F36A]">
              Today's Common Challenge
            </span>
          </div>
          <span className="text-xs font-mono text-[#727D89]">
            {dailyPack?.dateId || 'Today'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#F4F6F8] tracking-tight">
          Daily Showdown
        </h2>
        <p className="text-xs sm:text-sm text-[#A7B0BA] mt-1 max-w-xl">
          One 2-minute challenge for every student. 3 fast stages: Campus Quickfire, Real or Fake Course, and Campus Read.
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[#727D89]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#A7B0BA]" />
            <span>About 2 minutes</span>
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#74D7A1]" />
            <span>Authoritative Nigerian campus scoring</span>
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F4C56A]" />
            <span>30 Maximum Points</span>
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          {hasPlayedDaily ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0B0D10]/80 border border-[#2B333D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#C6F36A]/10 border border-[#C6F36A]/30 flex items-center justify-center font-black text-[#C6F36A]">
                  {dailyAttempt.totalScore}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F4F6F8]">Challenge Completed!</div>
                  <div className="text-[11px] text-[#A7B0BA]">
                    You scored {dailyAttempt.totalScore} / {dailyAttempt.maxScore} pts today.
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('daily')}
                className="px-4 py-2 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-xs font-bold text-[#F4F6F8] transition-all flex items-center justify-center gap-1.5"
              >
                <span>View Result & Share Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('daily')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C6F36A] hover:bg-[#B4E74F] text-black font-black text-sm shadow-lg shadow-[#C6F36A]/20 transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{inProgressDaily ? 'Resume Today’s Challenge' : 'Play Today’s Challenge (2 min)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Live Multiplayer Launch Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Create Room */}
        <div className="p-5 rounded-2xl border border-[#2B333D] bg-[#12161B] hover:border-[#78A9FF]/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#78A9FF]/10 text-[#78A9FF] flex items-center justify-center mb-3">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F4F6F8]">Play With Friends</h3>
            <p className="text-xs text-[#A7B0BA] mt-1">
              Create a private room for Undercover, Who Said That?, or Most Likely To. Share link on WhatsApp.
            </p>
          </div>
          <button
            onClick={onCreateRoomClick}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-xs font-bold text-[#F4F6F8] flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 text-[#C6F36A]" />
            <span>Create Live Room</span>
          </button>
        </div>

        {/* Join With Code */}
        <div className="p-5 rounded-2xl border border-[#2B333D] bg-[#12161B] hover:border-[#C6F36A]/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#C6F36A]/10 text-[#C6F36A] flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F4F6F8]">Join A Game</h3>
            <p className="text-xs text-[#A7B0BA] mt-1">
              Have a 5-letter room code from your WhatsApp group or coursemates? Jump straight in.
            </p>
          </div>
          <button
            onClick={onJoinRoomClick}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-xs font-bold text-[#C6F36A] flex items-center justify-center gap-2 transition-all"
          >
            <span>Enter Room Code</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Private Circles Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F4F6F8]">Your Circles</h3>
            <p className="text-xs text-[#727D89]">
              Compete privately with your hostel roommates, department, or friend group.
            </p>
          </div>
          <button
            onClick={() => onNavigate('circles')}
            className="text-xs font-semibold text-[#C6F36A] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {circles.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-[#2B333D] bg-[#12161B]/50 text-center space-y-3">
            <p className="text-xs text-[#A7B0BA]">
              No circles yet. Circles allow a small group of friends or one class to have their own private daily leaderboard immediately!
            </p>
            <button
              onClick={() => onNavigate('circles')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs font-bold text-[#F4F6F8] hover:bg-[#222A33]"
            >
              <Plus className="w-3.5 h-3.5 text-[#C6F36A]" />
              <span>Create or Join a Circle</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {circles.slice(0, 2).map((circle) => (
              <div
                key={circle.id}
                onClick={() => onNavigate('circles')}
                className="p-4 rounded-xl border border-[#2B333D] bg-[#12161B] hover:bg-[#191F26] cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-[#F4F6F8]">{circle.name}</div>
                  <div className="text-xs text-[#727D89] mt-0.5">
                    {circle.memberCount} {circle.memberCount === 1 ? 'member' : 'members'} • Code: {circle.inviteCode}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#727D89]" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
