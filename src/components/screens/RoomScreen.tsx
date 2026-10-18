import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { Room, RoomPlayer, UndercoverPublicState, WhoSaidThatPublicState, MostLikelyToPublicState, CampusQuizPublicState } from '../../types/game.ts';
import { APP_CONFIG } from '../../config/appConfig.ts';
import { sounds } from '../../lib/audio.ts';
import {
  Copy,
  Check,
  Share2,
  Users,
  Crown,
  Play,
  Eye,
  EyeOff,
  Send,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  LogOut,
  Trophy,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface RoomScreenProps {
  roomCode: string;
  onLeaveRoom: () => void;
}

export const RoomScreen: React.FC<RoomScreenProps> = ({ roomCode, onLeaveRoom }) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [privateState, setPrivateState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Private word card hide/show toggle
  const [showSecretWord, setShowSecretWord] = useState(false);

  // Active inputs
  const [clueInput, setClueInput] = useState('');
  const [submittingClue, setSubmittingClue] = useState(false);
  const [selectedVoteTarget, setSelectedVoteTarget] = useState<string | null>(null);

  // Who said that inputs
  const [whoSaidThatAnswerInput, setWhoSaidThatAnswerInput] = useState('');
  const [hasSubmittedWhoSaidThat, setHasSubmittedWhoSaidThat] = useState(false);
  const [selectedAuthorGuess, setSelectedAuthorGuess] = useState<string | null>(null);

  // Campus quiz inputs
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Load room and private state
  const fetchRoomData = async () => {
    if (!user) return;
    try {
      const res = await api.getRoom(roomCode);
      setRoom(res.room);

      if (res.room.status === 'active') {
        const privRes = await api.getMyRoomPrivateState(res.room.id, user.userId);
        setPrivateState(privRes.privateState);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load room');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();

    // Setup polling interval fallback (every 2.5s) to guarantee real-time sync across all devices
    const interval = setInterval(() => {
      fetchRoomData();
    }, 2500);

    return () => clearInterval(interval);
  }, [roomCode, user]);

  // Connect SSE stream for instant push updates
  useEffect(() => {
    if (!room?.id) return;

    try {
      const sse = new EventSource(`/api/rooms/${room.id}/events`);
      eventSourceRef.current = sse;

      sse.onmessage = (event) => {
        try {
          const updatedRoom: Room = JSON.parse(event.data);
          setRoom(updatedRoom);
          if (user && updatedRoom.status === 'active') {
            api.getMyRoomPrivateState(updatedRoom.id, user.userId).then((res) => {
              setPrivateState(res.privateState);
            });
          }
        } catch {
          // Ignore parse errors
        }
      };

      return () => {
        sse.close();
      };
    } catch {
      // SSE unsupported or blocked, fallback polling handles it
    }
  }, [room?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#727D89] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#C6F36A]" />
        <p className="text-xs">Connecting to room lobby...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="p-6 rounded-2xl bg-[#12161B] border border-[#2B333D] text-center space-y-3 max-w-md mx-auto">
        <AlertCircle className="w-8 h-8 text-[#FF7777] mx-auto" />
        <p className="text-sm font-bold text-[#F4F6F8]">Room Error</p>
        <p className="text-xs text-[#A7B0BA]">{error || 'Could not find this room.'}</p>
        <button
          onClick={onLeaveRoom}
          className="px-4 py-2 rounded-xl bg-[#191F26] text-xs font-bold text-[#C6F36A]"
        >
          Back to Games
        </button>
      </div>
    );
  }

  const isHost = room.hostId === user?.userId;
  const playersList: RoomPlayer[] = Object.values(room.players);
  const myPlayer = user ? room.players[user.userId] : undefined;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const inviteUrl = `${window.location.origin}?joinRoom=${room.code}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppInvite = () => {
    const text = `🎮 Join my NO CAP game room for ${room.gameType.toUpperCase()}!
Room Code: ${room.code}
Join directly: ${inviteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleToggleReady = async () => {
    if (!user || !myPlayer) return;
    try {
      const res = await api.setReady(room.id, user.userId, !myPlayer.isReady);
      setRoom(res.room);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStartGame = async () => {
    if (!user || !isHost) return;
    try {
      const res = await api.startRoom(room.id, user.userId);
      setRoom(res.room);
      const privRes = await api.getMyRoomPrivateState(res.room.id, user.userId);
      setPrivateState(privRes.privateState);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    try {
      await api.leaveRoom(room.id, user.userId);
    } catch {
      // Ignored
    } finally {
      onLeaveRoom();
    }
  };

  // ==========================================
  // LOBBY VIEW
  // ==========================================
  if (room.status === 'lobby') {
    const minPlayersNeeded = room.gameType === 'undercover' ? 3 : 2;
    const canStart = playersList.length >= minPlayersNeeded;

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Lobby Header Card */}
        <div className="p-6 rounded-2xl border border-[#2B333D] bg-gradient-to-b from-[#191F26] to-[#12161B] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C6F36A]">
              Game Lobby &bull; {room.gameType.toUpperCase()}
            </span>
            <button
              onClick={handleLeave}
              className="text-xs font-semibold text-[#727D89] hover:text-[#FF7777] flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          </div>

          <div className="text-center py-2">
            <p className="text-xs text-[#A7B0BA] uppercase font-semibold tracking-widest">
              Room Code
            </p>
            <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-[#F4F6F8] my-1">
              {room.code}
            </div>
            <p className="text-xs text-[#727D89]">
              Share this code with your WhatsApp group or friends
            </p>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleWhatsAppInvite}
              className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="py-2.5 px-3 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-[#F4F6F8] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#C6F36A]" /> : <Copy className="w-3.5 h-3.5 text-[#A7B0BA]" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-[#F4F6F8] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#C6F36A]" /> : <Share2 className="w-3.5 h-3.5 text-[#A7B0BA]" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="p-5 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#78A9FF]" />
              <h3 className="text-sm font-bold text-[#F4F6F8]">
                Players ({playersList.length} / {room.settings.maxPlayers})
              </h3>
            </div>
            <span className="text-xs text-[#727D89]">
              {minPlayersNeeded}+ required to start
            </span>
          </div>

          <div className="divide-y divide-[#1E252D]">
            {playersList.map((player) => {
              const avatar = APP_CONFIG.avatars.find((a) => a.id === player.avatarKey);
              return (
                <div key={player.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{avatar?.emoji || '⚓'}</span>
                    <span className="font-semibold text-[#F4F6F8]">{player.nickname}</span>
                    {player.isHost && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F4C56A]/10 text-[#F4C56A] font-bold text-[10px]">
                        <Crown className="w-3 h-3" /> Host
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    player.isReady
                      ? 'bg-[#74D7A1]/10 text-[#74D7A1]'
                      : 'bg-[#191F26] text-[#727D89]'
                  }`}>
                    {player.isReady ? 'Ready' : 'Waiting'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Lobby Actions */}
          <div className="pt-2 border-t border-[#1E252D] space-y-2">
            {/* AI Bot Fill for low liquidity / testing */}
            {isHost && playersList.length < minPlayersNeeded && (
              <button
                type="button"
                onClick={async () => {
                  sounds.playTap();
                  const botNames = ['Bode (AI)', 'Zainab (AI)', 'Emeka (AI)', 'Tari (AI)'];
                  const name = botNames[playersList.length % botNames.length];
                  const botId = `bot_${Date.now()}`;
                  try {
                    await api.authGuest({ userId: botId, nickname: name, avatarKey: 'scholar' });
                    const res = await api.joinRoom({ userId: botId, code: room.code });
                    setRoom(res.room);
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#78A9FF]/40 text-xs font-semibold text-[#78A9FF] flex items-center justify-center gap-1.5 transition-all"
              >
                <span>+ Add AI Classmate Bot (Instant Solo/Duo Play)</span>
              </button>
            )}

            {!isHost && (
              <button
                onClick={handleToggleReady}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                  myPlayer?.isReady
                    ? 'bg-[#191F26] border border-[#2B333D] text-[#A7B0BA]'
                    : 'bg-[#78A9FF] hover:bg-[#6698ee] text-black'
                }`}
              >
                {myPlayer?.isReady ? 'Cancel Ready' : 'I Am Ready'}
              </button>
            )}

            {isHost && (
              <div className="space-y-2">
                <button
                  onClick={handleStartGame}
                  disabled={!canStart}
                  className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                    canStart
                      ? 'bg-[#C6F36A] hover:bg-[#B4E74F] text-black shadow-lg shadow-[#C6F36A]/20 active:scale-[0.98]'
                      : 'bg-[#191F26] border border-[#2B333D] text-[#727D89] cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{canStart ? 'Start Game Now' : `Need ${minPlayersNeeded - playersList.length} more player(s) to start`}</span>
                </button>
                {!canStart && (
                  <p className="text-[11px] text-[#727D89] text-center">
                    Share the room code or link above, or tap "+ Add AI Classmate Bot" to play immediately.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE GAME VIEW
  // ==========================================
  const state = room.publicGameState;
  if (!state) return null;

  // --- 1. UNDERCOVER GAME MODE ---
  if (state.type === 'undercover') {
    const ucState = state as UndercoverPublicState;
    const isMyTurn = ucState.activeTurnPlayerId === user?.userId;
    const myRole = privateState?.role;
    const mySecretWord = privateState?.secretWord;
    const isEliminated = ucState.eliminatedPlayers.some((e) => e.playerId === user?.userId);

    const handleClueSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !clueInput.trim() || submittingClue) return;
      try {
        setSubmittingClue(true);
        const res = await api.submitRoomAction(room.id, user.userId, 'submit_clue', {
          text: clueInput.trim(),
        });
        setRoom(res.room);
        setClueInput('');
      } catch (err: any) {
        alert(err.message);
      } finally {
        setSubmittingClue(false);
      }
    };

    const handleVoteSubmit = async () => {
      if (!user || !selectedVoteTarget) return;
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'submit_vote', {
          targetPlayerId: selectedVoteTarget,
        });
        setRoom(res.room);
        setSelectedVoteTarget(null);
      } catch (err: any) {
        alert(err.message);
      }
    };

    const handleStartClues = async () => {
      if (!user) return;
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'start_clues', {});
        setRoom(res.room);
      } catch (err: any) {
        alert(err.message);
      }
    };

    const handleNextRound = async () => {
      if (!user) return;
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'next_round', {});
        setRoom(res.room);
      } catch (err: any) {
        alert(err.message);
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Game Header */}
        <div className="flex items-center justify-between border-b border-[#1E252D] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C6F36A]">
              Undercover &bull; Round {ucState.roundNumber}
            </span>
            <span className="text-[#727D89]">&bull;</span>
            <span className="text-xs text-[#A7B0BA]">
              {ucState.civilianCountRemaining} Civilians, {ucState.undercoverCountRemaining} Undercover
            </span>
          </div>
          <button onClick={handleLeave} className="text-xs text-[#727D89] hover:text-[#FF7777]">
            Exit
          </button>
        </div>

        {/* Private Role & Secret Word Card with Hold-To-Peek */}
        <div className="p-5 rounded-2xl border border-[#2B333D] bg-gradient-to-b from-[#191F26] to-[#12161B] space-y-3 shadow-lg select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78A9FF]">
              Your Secret Identity (Private)
            </span>
            <button
              onMouseDown={() => { sounds.playTap(); setShowSecretWord(true); }}
              onMouseUp={() => setShowSecretWord(false)}
              onMouseLeave={() => setShowSecretWord(false)}
              onTouchStart={() => { sounds.playTap(); setShowSecretWord(true); }}
              onTouchEnd={() => setShowSecretWord(false)}
              onClick={() => setShowSecretWord(!showSecretWord)}
              className="px-3 py-1.5 rounded-lg bg-[#222A33] text-xs font-semibold text-[#A7B0BA] hover:text-[#F4F6F8] flex items-center gap-1 active:bg-[#C6F36A] active:text-black transition-all cursor-pointer"
            >
              {showSecretWord ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showSecretWord ? 'Release to Hide' : 'Hold to Peek'}</span>
            </button>
          </div>

          <div
            onMouseDown={() => { sounds.playTap(); setShowSecretWord(true); }}
            onMouseUp={() => setShowSecretWord(false)}
            onMouseLeave={() => setShowSecretWord(false)}
            onTouchStart={() => { sounds.playTap(); setShowSecretWord(true); }}
            onTouchEnd={() => setShowSecretWord(false)}
            className="p-4 rounded-xl bg-[#0B0D10] border border-[#2B333D] text-center cursor-pointer active:border-[#C6F36A] transition-colors"
          >
            {showSecretWord ? (
              <div className="space-y-1 animate-in zoom-in-95 duration-200">
                <div className="text-2xl font-black tracking-tight text-[#C6F36A]">
                  "{mySecretWord || 'Loading...'}"
                </div>
                <div className="text-[11px] font-bold text-[#A7B0BA] uppercase">
                  Role: {myRole === 'undercover' ? '🕵️ Undercover' : '🧑‍🎓 Civilian'}
                </div>
              </div>
            ) : (
              <div className="py-2 text-xs text-[#727D89] font-medium flex items-center justify-center gap-1.5">
                <span>Hold mouse or finger here to peek your secret word</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className="p-3.5 rounded-xl bg-[#12161B] border border-[#2B333D] text-center text-xs font-semibold text-[#F4F6F8]">
          {ucState.statusMessage}
        </div>

        {/* Briefing Phase: Host Starts Clues */}
        {ucState.phase === 'briefing' && (
          <div className="text-center p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-3">
            <p className="text-xs text-[#A7B0BA]">
              Everyone make sure you've memorized your secret word! Once ready, start the clue round.
            </p>
            {isHost ? (
              <button
                onClick={handleStartClues}
                className="px-6 py-3 rounded-xl bg-[#C6F36A] hover:bg-[#B4E74F] text-black font-black text-xs shadow-md"
              >
                Start Clue Round
              </button>
            ) : (
              <p className="text-xs font-semibold text-[#727D89]">Waiting for host to begin clue round...</p>
            )}
          </div>
        )}

        {/* Clue Round Phase */}
        {ucState.phase === 'clue_round' && (
          <div className="space-y-4">
            {/* Clue Stream */}
            <div className="p-4 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A7B0BA]">
                Clues This Round
              </h3>
              {ucState.clues.length === 0 ? (
                <p className="text-xs text-[#727D89] italic">No clues given yet.</p>
              ) : (
                <div className="space-y-2">
                  {ucState.clues.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#191F26] border border-[#2B333D]/60 text-xs">
                      <span className="font-bold text-[#C6F36A]">{c.nickname}: </span>
                      <span className="text-[#F4F6F8]">"{c.text}"</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Turn Clue Form */}
            {isMyTurn && !isEliminated && (
              <form onSubmit={handleClueSubmit} className="p-4 rounded-2xl border border-[#C6F36A] bg-[#12161B] space-y-3">
                <div className="text-xs font-bold text-[#C6F36A]">
                  👉 It's your turn! Give one short clue describing your word:
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clueInput}
                    onChange={(e) => setClueInput(e.target.value)}
                    placeholder="e.g. You eat it after a stressful lecture..."
                    maxLength={100}
                    className="flex-1 p-3 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs text-[#F4F6F8] focus:border-[#C6F36A] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!clueInput.trim() || submittingClue}
                    className="px-4 py-3 rounded-xl bg-[#C6F36A] text-black font-bold text-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Voting Phase */}
        {ucState.phase === 'voting' && !isEliminated && (
          <div className="p-5 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF7777]">
              Vote To Eliminate
            </h3>
            <p className="text-xs text-[#A7B0BA]">
              Select who you suspect is the Undercover impostor:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {playersList
                .filter((p) => !ucState.eliminatedPlayers.some((e) => e.playerId === p.id) && p.id !== user?.userId)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedVoteTarget(p.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      selectedVoteTarget === p.id
                        ? 'bg-[#FF7777]/20 border-[#FF7777] text-[#FF7777]'
                        : 'bg-[#191F26] border-[#2B333D] text-[#F4F6F8] hover:border-[#FF7777]/50'
                    }`}
                  >
                    <span>{p.nickname}</span>
                    {selectedVoteTarget === p.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
            </div>

            <button
              onClick={handleVoteSubmit}
              disabled={!selectedVoteTarget}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                selectedVoteTarget
                  ? 'bg-[#FF7777] hover:bg-[#ff6161] text-black'
                  : 'bg-[#191F26] border border-[#2B333D] text-[#727D89] cursor-not-allowed'
              }`}
            >
              Confirm Vote
            </button>
          </div>
        )}

        {/* Elimination Phase */}
        {ucState.phase === 'elimination' && (
          <div className="p-5 rounded-2xl border border-[#2B333D] bg-[#12161B] text-center space-y-4">
            <h3 className="text-sm font-bold text-[#F4F6F8]">Elimination Results</h3>
            {isHost && (
              <button
                onClick={handleNextRound}
                className="px-6 py-3 rounded-xl bg-[#C6F36A] hover:bg-[#B4E74F] text-black font-black text-xs shadow-md"
              >
                Proceed to Round {ucState.roundNumber + 1}
              </button>
            )}
          </div>
        )}

        {/* Game Over Screen */}
        {ucState.phase === 'game_over' && (
          <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] text-center space-y-4 shadow-2xl">
            <Trophy className="w-10 h-10 text-[#C6F36A] mx-auto" />
            <h2 className="text-2xl font-black text-[#F4F6F8]">
              {ucState.winner === 'civilians' ? 'Civilians Win!' : 'Undercovers Win!'}
            </h2>
            <p className="text-xs text-[#A7B0BA]">
              {ucState.statusMessage}
            </p>

            <button
              onClick={handleLeave}
              className="px-6 py-3 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-xs font-bold text-[#F4F6F8]"
            >
              Return to Game Lobby
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- 2. WHO SAID THAT? GAME MODE ---
  if (state.type === 'who_said_that') {
    const wstState = state as WhoSaidThatPublicState;

    const handleSubmitAnswer = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !whoSaidThatAnswerInput.trim()) return;
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'submit_answer', {
          text: whoSaidThatAnswerInput.trim(),
        });
        setRoom(res.room);
        setHasSubmittedWhoSaidThat(true);
      } catch (err: any) {
        alert(err.message);
      }
    };

    const handleGuessAuthor = async () => {
      if (!user || !selectedAuthorGuess) return;
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'submit_guess', {
          guessedAuthorPlayerId: selectedAuthorGuess,
        });
        setRoom(res.room);
        setSelectedAuthorGuess(null);
      } catch (err: any) {
        alert(err.message);
      }
    };

    const handleNextAnswer = async () => {
      if (!user) return;
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'next_answer', {});
        setRoom(res.room);
      } catch (err: any) {
        alert(err.message);
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-[#1E252D] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78A9FF]">
            Who Said That?
          </span>
          <button onClick={handleLeave} className="text-xs text-[#727D89] hover:text-[#FF7777]">
            Exit
          </button>
        </div>

        {/* Prompt Card */}
        <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A7B0BA]">Prompt</div>
          <h2 className="text-lg sm:text-xl font-bold text-[#F4F6F8]">
            "{wstState.prompt}"
          </h2>
        </div>

        {/* Phase 1: Submitting answers */}
        {wstState.phase === 'submitting' && (
          <div className="p-5 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-4">
            {hasSubmittedWhoSaidThat ? (
              <div className="text-center py-4 space-y-2">
                <Check className="w-8 h-8 text-[#74D7A1] mx-auto" />
                <p className="text-xs font-bold text-[#F4F6F8]">Your answer is locked in!</p>
                <p className="text-xs text-[#727D89]">
                  Waiting for other players ({wstState.submissionsCount}/{playersList.length})...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAnswer} className="space-y-3">
                <label className="block text-xs font-semibold text-[#A7B0BA]">
                  Write your private, anonymous answer:
                </label>
                <textarea
                  rows={3}
                  value={whoSaidThatAnswerInput}
                  onChange={(e) => setWhoSaidThatAnswerInput(e.target.value)}
                  placeholder="Keep it funny and clever..."
                  maxLength={140}
                  className="w-full p-3 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs text-[#F4F6F8] focus:border-[#78A9FF] outline-none"
                />
                <button
                  type="submit"
                  disabled={!whoSaidThatAnswerInput.trim()}
                  className="w-full py-3 rounded-xl bg-[#78A9FF] hover:bg-[#6698ee] text-black font-bold text-xs"
                >
                  Lock In Secret Answer
                </button>
              </form>
            )}
          </div>
        )}

        {/* Phase 2: Guessing Author */}
        {wstState.phase === 'guessing' && wstState.revealedAnswers[wstState.currentAnswerIndex] && (
          <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-5">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase font-bold text-[#78A9FF]">
                Answer {wstState.currentAnswerIndex + 1} of {wstState.revealedAnswers.length}
              </span>
              <div className="text-xl font-bold text-[#F4F6F8] p-4 rounded-xl bg-[#0B0D10] border border-[#2B333D]">
                "{wstState.revealedAnswers[wstState.currentAnswerIndex].text}"
              </div>
              <p className="text-xs text-[#A7B0BA]">Who in the room wrote this answer?</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {playersList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedAuthorGuess(p.id)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    selectedAuthorGuess === p.id
                      ? 'bg-[#78A9FF]/20 border-[#78A9FF] text-[#78A9FF]'
                      : 'bg-[#191F26] border-[#2B333D] text-[#F4F6F8]'
                  }`}
                >
                  {p.nickname}
                </button>
              ))}
            </div>

            <button
              onClick={handleGuessAuthor}
              disabled={!selectedAuthorGuess}
              className="w-full py-3 rounded-xl bg-[#78A9FF] text-black font-bold text-xs disabled:opacity-50"
            >
              Lock in Guess
            </button>
          </div>
        )}

        {/* Phase 3: Reveal */}
        {wstState.phase === 'reveal' && (
          <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] text-center space-y-4">
            <span className="text-xs font-bold uppercase text-[#74D7A1]">Author Revealed!</span>
            <div className="text-lg font-bold text-[#F4F6F8]">
              {wstState.statusMessage}
            </div>

            {isHost && (
              <button
                onClick={handleNextAnswer}
                className="px-6 py-3 rounded-xl bg-[#C6F36A] text-black font-bold text-xs"
              >
                Next Answer
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- 3. MOST LIKELY TO GAME MODE ---
  if (state.type === 'most_likely_to') {
    const mltState = state as MostLikelyToPublicState;

    const handleVote = async (targetId: string) => {
      if (!user) return;
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'submit_vote', {
          targetPlayerId: targetId,
        });
        setRoom(res.room);
      } catch (err: any) {
        alert(err.message);
      }
    };

    const handleNextPrompt = async () => {
      if (!user) return;
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'next_prompt', {});
        setRoom(res.room);
      } catch (err: any) {
        alert(err.message);
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-[#1E252D] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F4C56A]">
            Most Likely To &bull; Round {mltState.promptIndex} of {mltState.totalPrompts}
          </span>
          <button onClick={handleLeave} className="text-xs text-[#727D89] hover:text-[#FF7777]">
            Exit
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] text-center space-y-2">
          <h2 className="text-xl font-bold text-[#F4F6F8]">"{mltState.prompt}"</h2>
        </div>

        {mltState.phase === 'voting' ? (
          <div className="p-5 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-4">
            <h3 className="text-xs font-bold text-[#A7B0BA] uppercase">Cast Your Vote</h3>
            <div className="grid grid-cols-2 gap-2">
              {playersList.map((p) => {
                const hasVotedThis = mltState.votes[user?.userId || ''] === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleVote(p.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      hasVotedThis
                        ? 'bg-[#F4C56A]/20 border-[#F4C56A] text-[#F4C56A]'
                        : 'bg-[#191F26] border-[#2B333D] text-[#F4F6F8]'
                    }`}
                  >
                    <span>{p.nickname}</span>
                    {hasVotedThis && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] text-center space-y-4">
            <div className="text-lg font-bold text-[#F4C56A]">{mltState.statusMessage}</div>
            {isHost && (
              <button
                onClick={handleNextPrompt}
                className="px-6 py-3 rounded-xl bg-[#C6F36A] text-black font-bold text-xs"
              >
                Next Round
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- 4. CAMPUS QUIZ GAME MODE ---
  if (state.type === 'campus_quiz') {
    const cqState = state as CampusQuizPublicState;

    const handleAnswerQuiz = async (idx: number) => {
      if (!user) return;
      setSelectedQuizOption(idx);
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'submit_answer', {
          optionIndex: idx,
        });
        setRoom(res.room);
      } catch (err: any) {
        alert(err.message);
      }
    };

    const handleNextQuizQuestion = async () => {
      if (!user) return;
      setSelectedQuizOption(null);
      try {
        const res = await api.submitRoomAction(room.id, user.userId, 'next_question', {});
        setRoom(res.room);
      } catch (err: any) {
        alert(err.message);
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-[#1E252D] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#74D7A1]">
            Campus Quiz &bull; Question {cqState.currentQuestionIndex + 1} of {cqState.totalQuestions}
          </span>
          <button onClick={handleLeave} className="text-xs text-[#727D89] hover:text-[#FF7777]">
            Exit
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-4">
          <div className="text-xs font-bold text-[#74D7A1] uppercase">{cqState.question.category}</div>
          <h2 className="text-lg font-bold text-[#F4F6F8]">{cqState.question.prompt}</h2>

          <div className="space-y-2">
            {cqState.question.options.map((opt, i) => {
              const isSelected = selectedQuizOption === i;
              return (
                <button
                  key={i}
                  disabled={cqState.phase === 'reveal'}
                  onClick={() => handleAnswerQuiz(i)}
                  className={`w-full p-3.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    isSelected
                      ? 'bg-[#74D7A1]/20 border-[#74D7A1] text-[#74D7A1]'
                      : 'bg-[#191F26] border-[#2B333D] text-[#F4F6F8]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {cqState.phase === 'reveal' && (
            <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#2B333D] space-y-3">
              <div className="text-xs text-[#74D7A1] font-semibold">
                Explanation: {cqState.revealData?.explanation}
              </div>
              {isHost && (
                <button
                  onClick={handleNextQuizQuestion}
                  className="w-full py-3 rounded-xl bg-[#C6F36A] text-black font-bold text-xs"
                >
                  Continue
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
