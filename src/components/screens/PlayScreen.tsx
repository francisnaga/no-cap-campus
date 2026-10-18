import React, { useState } from 'react';
import { GameType } from '../../types/game.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { Gamepad2, Users, Flame, Plus, ArrowRight, ShieldCheck, Sparkles, Filter, X } from 'lucide-react';
import { GameCardHero } from '../game/GameCardHero.tsx';

interface GameItem {
  id: GameType;
  title: string;
  category: 'bluff' | 'expose' | 'trivia' | 'dilemma';
  categoryLabel: string;
  badge?: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  duration: string;
  isPlayable: boolean;
  accentColor: string;
}

const CATALOGUE: GameItem[] = [
  {
    id: 'undercover',
    title: 'Undercover',
    category: 'bluff',
    categoryLabel: 'Bluff & Betrayal',
    badge: '🔥 #1 HOSTEL PICK',
    description: 'Civilians receive one secret word; Undercovers receive a related but different word. Give subtle clues and vote out the impostor.',
    minPlayers: 3,
    maxPlayers: 12,
    duration: '5–10 mins',
    isPlayable: true,
    accentColor: '#C6F36A',
  },
  {
    id: 'who_said_that',
    title: 'Who Said That?',
    category: 'expose',
    categoryLabel: 'Expose the Group',
    badge: '🤫 TOP BANTER',
    description: 'Everyone submits a hilarious anonymous confession or excuse to a prompt. Guess who wrote what to score points!',
    minPlayers: 3,
    maxPlayers: 12,
    duration: '5–8 mins',
    isPlayable: true,
    accentColor: '#78A9FF',
  },
  {
    id: 'most_likely_to',
    title: 'Most Likely To',
    category: 'expose',
    categoryLabel: 'Expose the Group',
    badge: '🌶️ SPICY',
    description: 'Vote for who in your hostel, department, or circle is most likely to do chaotic campus activities. Reveal the group consensus.',
    minPlayers: 3,
    maxPlayers: 15,
    duration: '3–7 mins',
    isPlayable: true,
    accentColor: '#F4C56A',
  },
  {
    id: 'campus_quiz',
    title: 'Campus & Naija Quiz',
    category: 'trivia',
    categoryLabel: 'Naija & Campus Trivia',
    badge: '🎓 SPEED TRIVIA',
    description: 'Compete in real time on maritime knowledge, Nigerian university grading, campus culture, and general intellect.',
    minPlayers: 2,
    maxPlayers: 12,
    duration: '3–5 mins',
    isPlayable: true,
    accentColor: '#74D7A1',
  },
  {
    id: 'real_or_fake_course',
    title: 'Real or Fake Course?',
    category: 'trivia',
    categoryLabel: 'Campus Trivia',
    badge: '⚡ 2-MIN BLITZ',
    description: 'Decide in seconds whether unusual degree programmes are official accredited disciplines or pure comedy.',
    minPlayers: 2,
    maxPlayers: 10,
    duration: '2–4 mins',
    isPlayable: true,
    accentColor: '#C084FC',
  },
  {
    id: 'would_you_rather',
    title: 'Would You Rather',
    category: 'dilemma',
    categoryLabel: 'Dilemmas',
    badge: '⚖️ DEBATE NIGHT',
    description: 'Impossible campus choices and funny hostel dilemmas. See what percentage of your friends agree with you.',
    minPlayers: 2,
    maxPlayers: 15,
    duration: '3–5 mins',
    isPlayable: true,
    accentColor: '#FF7777',
  },
];

interface PlayScreenProps {
  onJoinRoom: (code: string) => void;
  onRoomCreated: (code: string) => void;
  showCreateModalInitial?: boolean;
  onCloseCreateModalInitial?: () => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({
  onJoinRoom,
  onRoomCreated,
  showCreateModalInitial = false,
  onCloseCreateModalInitial,
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // Create room modal state
  const [showCreateModal, setShowCreateModal] = useState(showCreateModalInitial);
  const [selectedGame, setSelectedGame] = useState<GameType>('undercover');
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const filteredGames = CATALOGUE.filter((g) => {
    if (selectedCategory === 'all') return true;
    return g.category === selectedCategory;
  });

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      setJoinError('Please enter a room code');
      return;
    }
    if (!user) return;

    try {
      setJoining(true);
      setJoinError(null);
      const res = await api.joinRoom({ userId: user.userId, code });
      onJoinRoom(res.room.code);
    } catch (err: any) {
      setJoinError(err.message || 'Could not find room');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!user) return;
    try {
      setCreating(true);
      setCreateError(null);
      const res = await api.createRoom({
        hostUserId: user.userId,
        gameType: selectedGame,
        maxPlayers,
      });
      setShowCreateModal(false);
      onRoomCreated(res.room.code);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E252D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F4F6F8]">
            Live Multiplayer
          </h1>
          <p className="text-xs text-[#A7B0BA] mt-0.5">
            Party games with synchronized real-time state for roommates, WhatsApp groups, and coursemates.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C6F36A] hover:bg-[#B4E74F] text-black font-black text-xs shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Room</span>
        </button>
      </div>

      {/* Quick Join Lobby Terminal */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#2B333D] bg-gradient-to-r from-[#141920] to-[#0E1217] shadow-xl">
        <div className="text-xs font-bold uppercase tracking-wider text-[#A7B0BA] mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-[#C6F36A]" />
            <span>Join Existing Match</span>
          </div>
          <span className="text-[11px] text-[#727D89]">Enter 5-Letter Code</span>
        </div>
        <form onSubmit={handleJoinSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => {
                setJoinCodeInput(e.target.value.toUpperCase());
                setJoinError(null);
              }}
              placeholder="ENTER ROOM CODE (e.g. 7K4MZ)"
              maxLength={8}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0B0D10] border border-[#2B333D] text-sm font-mono uppercase tracking-widest text-[#F4F6F8] placeholder:text-[#525B66] focus:border-[#C6F36A] outline-none shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={joining}
            className="py-3.5 px-7 rounded-xl bg-[#C6F36A] hover:bg-[#B4E74F] text-black text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-[#C6F36A]/10 cursor-pointer"
          >
            <span>{joining ? 'Connecting...' : 'Join Game'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        {joinError && (
          <p className="text-xs text-[#FF7777] mt-2 font-medium">{joinError}</p>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: 'All Modes' },
          { id: 'bluff', label: 'Bluff & Betrayal' },
          { id: 'expose', label: 'Expose Group' },
          { id: 'trivia', label: 'Campus Trivia' },
          { id: 'dilemma', label: 'Dilemmas' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#F4F6F8] text-black shadow-sm font-bold'
                : 'bg-[#12161B] border border-[#2B333D] text-[#A7B0BA] hover:text-[#F4F6F8]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Game Cards Grid (AAA Studio Grade) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => {
              setSelectedGame(game.id);
              setShowCreateModal(true);
            }}
            className="group relative rounded-2xl border border-[#2B333D] bg-gradient-to-b from-[#141920] to-[#0C0F14] hover:border-[#4B5565] transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between hover:-translate-y-1 cursor-pointer"
          >
            {/* Dedicated Hero Artwork Header */}
            <GameCardHero gameType={game.id} accentColor={game.accentColor} />

            {/* Card Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-[#F4F6F8] tracking-tight group-hover:text-[#C6F36A] transition-colors">
                    {game.title}
                  </h3>

                  {game.badge && (
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#C6F36A]/10 text-[#C6F36A] border border-[#C6F36A]/30 shrink-0">
                      {game.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#A7B0BA] leading-relaxed line-clamp-2">
                  {game.description}
                </p>
              </div>

              {/* Specs and Start Lobby CTA */}
              <div className="pt-3 border-t border-[#1E252D] flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-[#727D89]">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{game.minPlayers}–{game.maxPlayers}</span>
                  </span>
                  <span>&bull;</span>
                  <span>{game.duration}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGame(game.id);
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#191F26] group-hover:bg-[#C6F36A] group-hover:text-black border border-[#2B333D] group-hover:border-[#C6F36A] text-xs font-black text-[#F4F6F8] flex items-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <span>Start Lobby</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C6F36A] group-hover:text-black transition-colors" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#2B333D] bg-[#12161B] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B333D]">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#C6F36A]" />
                <h3 className="text-base font-bold text-[#F4F6F8]">Create Live Game Room</h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  onCloseCreateModalInitial?.();
                }}
                className="text-[#727D89] hover:text-[#F4F6F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0BA] mb-1.5">
                  Select Game Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATALOGUE.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGame(g.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        selectedGame === g.id
                          ? 'bg-[#C6F36A]/10 border-[#C6F36A] text-[#C6F36A]'
                          : 'bg-[#191F26] border-[#2B333D] text-[#A7B0BA] hover:text-[#F4F6F8]'
                      }`}
                    >
                      <div className="font-bold">{g.title}</div>
                      <div className="text-[10px] text-[#727D89] mt-0.5">{g.minPlayers}+ players</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0BA] mb-1.5">
                  Player Capacity ({maxPlayers} players)
                </label>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full accent-[#C6F36A] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#727D89] mt-1">
                  <span>3 Players</span>
                  <span>12 Players</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#2B333D] text-xs text-[#A7B0BA] space-y-1">
                <div className="font-bold text-[#F4F6F8]">Invite link & code ready instantly</div>
                <div>A unique 5-letter code and WhatsApp share link will be created for your room.</div>
              </div>

              {createError && (
                <p className="text-xs text-[#FF7777] font-semibold">{createError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    onCloseCreateModalInitial?.();
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#191F26] text-xs font-semibold text-[#A7B0BA] hover:bg-[#222A33]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={creating}
                  className="flex-1 py-3 rounded-xl bg-[#C6F36A] hover:bg-[#B4E74F] text-black font-black text-xs transition-all shadow-md active:scale-[0.98]"
                >
                  {creating ? 'Starting Lobby...' : 'Launch Room Lobby'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
