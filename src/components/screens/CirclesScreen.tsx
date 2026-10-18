import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { Circle, CircleMember } from '../../types/game.ts';
import { APP_CONFIG } from '../../config/appConfig.ts';
import { Users, Plus, ArrowRight, Share2, Copy, Check, MessageSquare, Flame, Trophy, X, ShieldCheck } from 'lucide-react';
import { RankingsScreen } from './RankingsScreen.tsx';

interface CirclesScreenProps {
  onStartLiveGameWithCircle?: (circleId: string) => void;
  defaultSubTab?: 'circles' | 'rankings';
}

export const CirclesScreen: React.FC<CirclesScreenProps> = ({ onStartLiveGameWithCircle, defaultSubTab = 'circles' }) => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState<'circles' | 'rankings'>(defaultSubTab);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [circleDetail, setCircleDetail] = useState<{ circle: Circle; todayCompletedCount: number; totalMembers: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleType, setNewCircleType] = useState<'friends' | 'class' | 'level' | 'department'>('friends');
  const [joinCode, setJoinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadCircles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.getUserCircles(user.userId);
      setCircles(res.circles);
      if (res.circles.length > 0 && !selectedCircleId) {
        setSelectedCircleId(res.circles[0].id);
      }
    } catch (err) {
      console.error('Failed to load circles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCircles();
  }, [user]);

  useEffect(() => {
    if (!selectedCircleId) return;
    api.getCircle(selectedCircleId).then((res) => {
      setCircleDetail(res);
    });
  }, [selectedCircleId]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCircleName.trim()) return;

    try {
      setErrorMsg(null);
      const res = await api.createCircle({
        userId: user.userId,
        name: newCircleName.trim(),
        type: newCircleType,
      });
      setShowCreateModal(false);
      setNewCircleName('');
      await loadCircles();
      setSelectedCircleId(res.circle.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create circle');
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode.trim()) return;

    try {
      setErrorMsg(null);
      const res = await api.joinCircle({
        userId: user.userId,
        inviteCode: joinCode.trim(),
      });
      setShowJoinModal(false);
      setJoinCode('');
      await loadCircles();
      setSelectedCircleId(res.circle.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid circle invite code');
    }
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleWhatsAppShare = (circle: Circle) => {
    const text = `🔥 Join our private campus circle "${circle.name}" on NO CAP!
Circle Code: ${circle.inviteCode}
Link: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Segmented Control: Squads vs Campus Rankings */}
      <div className="flex items-center gap-1 p-1 bg-[#12161B] rounded-xl border border-[#2B333D] max-w-sm">
        <button
          onClick={() => setSubTab('circles')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'circles'
              ? 'bg-[#191F26] text-[#C6F36A] shadow-sm border border-[#2B333D]'
              : 'text-[#A7B0BA] hover:text-[#F4F6F8]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Squad Circles</span>
        </button>
        <button
          onClick={() => setSubTab('rankings')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'rankings'
              ? 'bg-[#191F26] text-[#C6F36A] shadow-sm border border-[#2B333D]'
              : 'text-[#A7B0BA] hover:text-[#F4F6F8]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-[#F4C56A]" />
          <span>Campus Rankings</span>
        </button>
      </div>

      {subTab === 'rankings' ? (
        <RankingsScreen />
      ) : (
        <>
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E252D]">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F4F6F8]">
                Private Circles
              </h1>
              <p className="text-xs text-[#A7B0BA] mt-0.5">
                Your immediate squad. Compete on daily challenges and play live games together without waiting for the whole school.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-xs font-bold text-[#F4F6F8]"
              >
                Join with Code
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C6F36A] hover:bg-[#B4E74F] text-black font-black text-xs shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Circle</span>
              </button>
            </div>
          </div>

      {circles.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-[#2B333D] bg-[#12161B]/50 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#C6F36A]/10 text-[#C6F36A] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#F4F6F8]">No Circles Yet</h3>
            <p className="text-xs text-[#A7B0BA] max-w-xs mx-auto">
              Create a circle for your hostel roommates, department coursemates, or close clique to see private daily rankings immediately.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#C6F36A] text-black font-bold text-xs"
            >
              Create First Circle
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs font-bold text-[#F4F6F8]"
            >
              Enter Invite Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Circles List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A7B0BA] px-1">
              Your Circles ({circles.length})
            </h3>
            <div className="space-y-2">
              {circles.map((c) => {
                const isSelected = selectedCircleId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCircleId(c.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#191F26] border-[#C6F36A] shadow-md'
                        : 'bg-[#12161B] border-[#2B333D] hover:border-[#78A9FF]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-[#F4F6F8]">{c.name}</div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#0B0D10] text-[#78A9FF] border border-[#2B333D]">
                        {c.type}
                      </span>
                    </div>
                    <div className="text-xs text-[#727D89] mt-1">
                      {c.memberCount} members &bull; Code: {c.inviteCode}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Circle Overview & Members */}
          {circleDetail && (
            <div className="md:col-span-2 space-y-5">
              <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-[#F4F6F8]">
                      {circleDetail.circle.name}
                    </h2>
                    <p className="text-xs text-[#A7B0BA] mt-0.5">
                      {circleDetail.circle.type.toUpperCase()} CIRCLE &bull; {circleDetail.totalMembers} Members
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleWhatsAppShare(circleDetail.circle)}
                      className="px-3 py-2 rounded-xl bg-[#25D366] text-black font-bold text-xs flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleCopyCode(circleDetail.circle.inviteCode)}
                      className="px-3 py-2 rounded-xl bg-[#191F26] border border-[#2B333D] text-[#F4F6F8] font-bold text-xs flex items-center gap-1.5"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#C6F36A]" /> : <Copy className="w-3.5 h-3.5 text-[#A7B0BA]" />}
                      <span>{copiedCode ? 'Copied' : circleDetail.circle.inviteCode}</span>
                    </button>
                  </div>
                </div>

                {/* Circle Activity Pill */}
                <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#2B333D] flex items-center justify-between text-xs">
                  <span className="text-[#A7B0BA]">
                    Today's Daily Challenge completed:
                  </span>
                  <span className="font-bold text-[#C6F36A]">
                    {circleDetail.todayCompletedCount} of {circleDetail.totalMembers} members
                  </span>
                </div>

                {/* Member Roster */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7B0BA]">
                    Members
                  </h4>
                  <div className="divide-y divide-[#1E252D]">
                    {Object.values(circleDetail.circle.members).map((m) => {
                      const avatar = APP_CONFIG.avatars.find((a) => a.id === m.avatarKey);
                      return (
                        <div key={m.userId} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{avatar?.emoji || '⚓'}</span>
                            <span className="font-semibold text-[#F4F6F8]">{m.nickname}</span>
                            {m.role === 'owner' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C6F36A]/10 text-[#C6F36A] font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#727D89]">
                            {m.department ? `${m.department} (${m.level || '300L'})` : 'Student'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action CTA */}
                {onStartLiveGameWithCircle && (
                  <button
                    onClick={() => onStartLiveGameWithCircle(circleDetail.circle.id)}
                    className="w-full py-3 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-xs font-bold text-[#C6F36A] flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Start Live Game in this Circle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#2B333D] bg-[#12161B] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2B333D]">
              <h3 className="text-base font-bold text-[#F4F6F8]">Create Private Circle</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#727D89] hover:text-[#F4F6F8]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0BA] mb-1">
                  Circle Name
                </label>
                <input
                  type="text"
                  required
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  placeholder="e.g. Block C Room 12 Boys, 300L Marine Eng"
                  maxLength={40}
                  className="w-full p-3 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs text-[#F4F6F8] focus:border-[#C6F36A] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0BA] mb-1">
                  Circle Type
                </label>
                <select
                  value={newCircleType}
                  onChange={(e) => setNewCircleType(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs text-[#F4F6F8] focus:border-[#C6F36A] outline-none"
                >
                  <option value="friends">Friends & Roommates</option>
                  <option value="class">Class / Course Group</option>
                  <option value="department">Department</option>
                  <option value="level">Academic Level</option>
                </select>
              </div>

              {errorMsg && <p className="text-xs text-[#FF7777] font-semibold">{errorMsg}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[#191F26] text-xs font-semibold text-[#A7B0BA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#C6F36A] text-black font-black text-xs"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#2B333D] bg-[#12161B] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2B333D]">
              <h3 className="text-base font-bold text-[#F4F6F8]">Join with Circle Code</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-[#727D89] hover:text-[#F4F6F8]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0BA] mb-1">
                  6-Letter Invite Code
                </label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 7K4MZ9"
                  maxLength={8}
                  className="w-full p-3 rounded-xl bg-[#191F26] border border-[#2B333D] text-sm font-mono uppercase tracking-widest text-[#F4F6F8] focus:border-[#C6F36A] outline-none"
                />
              </div>

              {errorMsg && <p className="text-xs text-[#FF7777] font-semibold">{errorMsg}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[#191F26] text-xs font-semibold text-[#A7B0BA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#C6F36A] text-black font-black text-xs"
                >
                  Join Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
