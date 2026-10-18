import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { LeaderboardEntry, LeaderboardScope, Circle } from '../../types/game.ts';
import { APP_CONFIG } from '../../config/appConfig.ts';
import { Trophy, Users, ShieldAlert, RefreshCw, Flame, Award } from 'lucide-react';

export const RankingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [scope, setScope] = useState<LeaderboardScope>('university');
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [isProvisional, setIsProvisional] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user circles for the circle scope filter
  useEffect(() => {
    if (!user) return;
    api.getUserCircles(user.userId).then((res) => {
      setCircles(res.circles);
      if (res.circles.length > 0) {
        setSelectedCircleId(res.circles[0].id);
      }
    });
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      let scopeId: string | undefined = undefined;

      if (scope === 'circle') {
        scopeId = selectedCircleId;
      } else if (scope === 'department') {
        scopeId = user?.department || 'Marine Engineering';
      } else if (scope === 'level') {
        scopeId = user?.level || '300L';
      }

      const res = await api.getLeaderboard(scope, scopeId, undefined, user?.userId);
      setEntries(res.entries);
      setTotalParticipants(res.totalParticipants);
      setIsProvisional(res.isProvisional);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [scope, selectedCircleId, user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="pb-3 border-b border-[#1E252D]">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F4F6F8]">
          Campus Rankings
        </h1>
        <p className="text-xs text-[#A7B0BA] mt-0.5">
          Authoritative scoring with accurate sample sizes. No fake bots or fabricated leaderboard counts.
        </p>
      </div>

      {/* Scope Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'university', label: 'University-Wide' },
          { id: 'circle', label: 'My Circle' },
          { id: 'department', label: `Dept (${user?.department ? user.department.slice(0, 14) : 'Dept'})` },
          { id: 'level', label: `Level (${user?.level || '300L'})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setScope(tab.id as LeaderboardScope)}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              scope === tab.id
                ? 'bg-[#C6F36A] text-black shadow-md'
                : 'bg-[#12161B] border border-[#2B333D] text-[#A7B0BA] hover:text-[#F4F6F8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Circle selector if scope is circle */}
      {scope === 'circle' && (
        <div className="p-3 rounded-xl bg-[#12161B] border border-[#2B333D] flex items-center justify-between text-xs">
          <span className="text-[#A7B0BA] font-semibold">Selected Circle:</span>
          {circles.length > 0 ? (
            <select
              value={selectedCircleId}
              onChange={(e) => setSelectedCircleId(e.target.value)}
              className="bg-[#191F26] border border-[#2B333D] text-xs text-[#F4F6F8] px-2 py-1 rounded-lg outline-none"
            >
              {circles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[#FF7777]">Join or create a circle first</span>
          )}
        </div>
      )}

      {/* Leaderboard Context Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#12161B] border border-[#2B333D] text-xs">
        <div>
          <span className="text-[#727D89]">Total Participants Today: </span>
          <span className="font-bold text-[#F4F6F8]">{totalParticipants}</span>
        </div>

        {isProvisional && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4C56A]/10 text-[#F4C56A] font-semibold text-[11px] self-start sm:self-auto border border-[#F4C56A]/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Provisional Ranking (Cohort forming)</span>
          </div>
        )}
      </div>

      {/* Leaderboard Entries List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-[#727D89] space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#C6F36A]" />
          <p className="text-xs">Loading campus rankings...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-[#2B333D] bg-[#12161B]/50 text-center space-y-2">
          <p className="text-sm font-bold text-[#F4F6F8]">No entries yet for this scope today</p>
          <p className="text-xs text-[#A7B0BA] max-w-sm mx-auto">
            Be the first student to play today's challenge and claim #1 on this leaderboard!
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-[#2B333D] bg-[#12161B] divide-y divide-[#1E252D]">
          {entries.map((entry) => {
            const isMe = entry.id === user?.userId;
            const avatar = APP_CONFIG.avatars.find((a) => a.id === entry.avatarKey);
            return (
              <div
                key={entry.id}
                className={`py-3 px-2 flex items-center justify-between text-xs transition-colors rounded-xl ${
                  isMe ? 'bg-[#C6F36A]/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                    entry.rank === 1
                      ? 'bg-[#F4C56A] text-black shadow-md'
                      : entry.rank === 2
                      ? 'bg-[#A7B0BA] text-black'
                      : entry.rank === 3
                      ? 'bg-[#B47B49] text-black'
                      : 'bg-[#191F26] text-[#727D89]'
                  }`}>
                    {entry.rank}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base">{avatar?.emoji || '⚓'}</span>
                    <div>
                      <div className="font-bold text-[#F4F6F8] flex items-center gap-1.5">
                        <span>{entry.name}</span>
                        {isMe && (
                          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-[#C6F36A] text-black">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#727D89]">
                        {entry.department || 'Student'} {entry.level ? `• ${entry.level}` : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  {entry.streak && entry.streak > 1 && (
                    <span className="hidden sm:inline-flex items-center gap-0.5 text-[#C6F36A] text-[11px] font-bold">
                      <Flame className="w-3.5 h-3.5 fill-[#C6F36A]" />
                      <span>{entry.streak}d</span>
                    </span>
                  )}

                  <div className="font-black text-sm tabular-nums text-[#F4F6F8]">
                    {entry.score} <span className="text-[10px] text-[#727D89]">pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
