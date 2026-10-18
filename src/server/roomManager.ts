import { storage } from './storage.ts';
import { Room, GameType, RoomPlayer, PublicGameState, UndercoverPublicState, WhoSaidThatPublicState, MostLikelyToPublicState, CampusQuizPublicState } from '../types/game.ts';
import { assignUndercoverRoles, checkUndercoverWinCondition, resolveVoteElimination, scoreWhoSaidThatAnswer } from '../lib/scoring.ts';
import { UNDERCOVER_WORD_PAIRS, WHO_SAID_THAT_PROMPTS, MOST_LIKELY_TO_PROMPTS, CAMPUS_QUIZ_BANK } from '../lib/contentSeed.ts';
import { Response } from 'express';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Safe chars (no O, 0, I, 1)
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class RoomManager {
  private sseClients: Record<string, Response[]> = {}; // roomId -> SSE response connections

  public subscribeSSE(roomId: string, res: Response) {
    if (!this.sseClients[roomId]) {
      this.sseClients[roomId] = [];
    }
    this.sseClients[roomId].push(res);

    res.on('close', () => {
      this.sseClients[roomId] = (this.sseClients[roomId] || []).filter((client) => client !== res);
    });
  }

  public broadcastRoomUpdate(roomId: string) {
    const clients = this.sseClients[roomId];
    if (!clients || clients.length === 0) return;

    const room = storage.getRoom(roomId);
    if (!room) return;

    const payload = `data: ${JSON.stringify(room)}\n\n`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch (err) {
        // Ignored, client will be removed on close
      }
    }
  }

  public createRoom(
    hostUserId: string,
    params: {
      gameType: GameType;
      circleId?: string;
      maxPlayers?: number;
      roundCount?: number;
    }
  ): Room {
    const hostUser = storage.getUser(hostUserId);
    if (!hostUser) throw new Error('Host user not found');

    let code = generateRoomCode();
    while (storage.getRoomByCode(code)) {
      code = generateRoomCode();
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const inviteToken = `inv_${Math.random().toString(36).slice(2, 10)}`;

    const hostPlayer: RoomPlayer = {
      id: hostUserId,
      nickname: hostUser.nickname,
      avatarKey: hostUser.avatarKey,
      isHost: true,
      isReady: true,
      isConnected: true,
      joinedAt: new Date().toISOString(),
      score: 0,
    };

    const room: Room = {
      id: roomId,
      code,
      inviteToken,
      hostId: hostUserId,
      gameType: params.gameType,
      status: 'lobby',
      circleId: params.circleId,
      settings: {
        maxPlayers: params.maxPlayers || 10,
        roundCount: params.roundCount || 3,
        timeLimitSeconds: 60,
        keepItClean: true,
      },
      players: {
        [hostUserId]: hostPlayer,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveRoom(room);
    storage.savePrivateRoomState(roomId, { privatePlayers: {} });

    return room;
  }

  public joinRoom(userId: string, codeOrToken: string): Room {
    const clean = codeOrToken.trim().toUpperCase();
    let room = storage.getRoomByCode(clean);
    if (!room) {
      // Check if it's an invite token
      const allRooms = Object.values((storage as any).db.rooms as Record<string, Room>);
      room = allRooms.find((r) => r.inviteToken === codeOrToken);
    }

    if (!room) {
      throw new Error('Room not found or invalid code');
    }

    if (room.status === 'closed') {
      throw new Error('This room has been closed');
    }

    const user = storage.getUser(userId);
    if (!user) throw new Error('User not found');

    const currentPlayers = Object.keys(room.players);
    if (!room.players[userId] && currentPlayers.length >= room.settings.maxPlayers) {
      throw new Error('Room is at maximum player capacity');
    }

    if (!room.players[userId]) {
      if (room.status === 'active') {
        throw new Error('Game is already in progress');
      }
      room.players[userId] = {
        id: userId,
        nickname: user.nickname,
        avatarKey: user.avatarKey,
        isHost: false,
        isReady: false,
        isConnected: true,
        joinedAt: new Date().toISOString(),
        score: 0,
      };
    } else {
      room.players[userId].isConnected = true;
    }

    room.updatedAt = new Date().toISOString();
    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }

  public setReady(roomId: string, userId: string, isReady: boolean): Room {
    const room = storage.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    if (!room.players[userId]) throw new Error('Player not in room');

    room.players[userId].isReady = isReady;
    room.updatedAt = new Date().toISOString();
    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }

  public startRoom(roomId: string, hostUserId: string): Room {
    const room = storage.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    if (room.hostId !== hostUserId) throw new Error('Only the host can start the room');

    const playerIds = Object.keys(room.players);
    if (playerIds.length < 2) {
      throw new Error('Need at least 2 players to start a live game');
    }

    room.status = 'active';
    room.updatedAt = new Date().toISOString();

    if (room.gameType === 'undercover') {
      if (playerIds.length < 3) {
        throw new Error('Undercover requires at least 3 players to play');
      }

      // Pick a random word pair
      const pair = UNDERCOVER_WORD_PAIRS[Math.floor(Math.random() * UNDERCOVER_WORD_PAIRS.length)];
      const assignments = assignUndercoverRoles(playerIds, pair.civilian, pair.undercover);

      const privateState = storage.getPrivateRoomState(roomId);
      privateState.privatePlayers = {};
      assignments.forEach((a) => {
        privateState.privatePlayers[a.playerId] = {
          role: a.role,
          secretWord: a.secretWord,
        };
      });
      storage.savePrivateRoomState(roomId, privateState);

      const civilianCount = assignments.filter((a) => a.role === 'civilian').length;
      const undercoverCount = assignments.filter((a) => a.role === 'undercover').length;

      // Public state NEVER reveals who has which word/role!
      const publicState: UndercoverPublicState = {
        type: 'undercover',
        phase: 'briefing',
        roundNumber: 1,
        turnPlayerOrder: [...playerIds].sort(() => Math.random() - 0.5),
        clues: [],
        votes: {},
        eliminatedPlayers: [],
        civilianCountRemaining: civilianCount,
        undercoverCountRemaining: undercoverCount,
        statusMessage: `Roles assigned! Check your secret word. ${civilianCount} Civilians, ${undercoverCount} Undercover.`,
      };
      room.publicGameState = publicState;
    } else if (room.gameType === 'who_said_that') {
      const prompt = WHO_SAID_THAT_PROMPTS[Math.floor(Math.random() * WHO_SAID_THAT_PROMPTS.length)];
      const publicState: WhoSaidThatPublicState = {
        type: 'who_said_that',
        prompt,
        phase: 'submitting',
        currentAnswerIndex: 0,
        submissionsCount: 0,
        revealedAnswers: [],
        scores: {},
        statusMessage: 'Everyone submit your anonymous answer now!',
      };
      playerIds.forEach((id) => (publicState.scores[id] = 0));
      room.publicGameState = publicState;

      const priv = storage.getPrivateRoomState(roomId);
      priv.authorMap = {};
      storage.savePrivateRoomState(roomId, priv);
    } else if (room.gameType === 'most_likely_to') {
      const prompt = MOST_LIKELY_TO_PROMPTS[Math.floor(Math.random() * MOST_LIKELY_TO_PROMPTS.length)];
      const publicState: MostLikelyToPublicState = {
        type: 'most_likely_to',
        prompt,
        promptIndex: 1,
        totalPrompts: 3,
        phase: 'voting',
        votes: {},
        voteCounts: {},
        topPlayerIds: [],
        scores: {},
        statusMessage: 'Vote for who is most likely!',
      };
      playerIds.forEach((id) => (publicState.scores[id] = 0));
      room.publicGameState = publicState;
    } else if (room.gameType === 'campus_quiz') {
      const quiz = CAMPUS_QUIZ_BANK[Math.floor(Math.random() * CAMPUS_QUIZ_BANK.length)];
      const publicState: CampusQuizPublicState = {
        type: 'campus_quiz',
        currentQuestionIndex: 0,
        totalQuestions: 3,
        question: {
          id: quiz.id,
          prompt: quiz.prompt,
          options: quiz.options,
          category: quiz.category,
        },
        phase: 'question',
        timeRemaining: 30,
        answeredPlayerIds: [],
        scores: {},
        statusMessage: 'Read the question and lock in your answer!',
      };
      playerIds.forEach((id) => (publicState.scores[id] = 0));
      room.publicGameState = publicState;

      const priv = storage.getPrivateRoomState(roomId);
      priv.correctAnswers = { [quiz.id]: { correctIndex: quiz.correctIndex, explanation: quiz.explanation } };
      storage.savePrivateRoomState(roomId, priv);
    }

    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }

  public getPlayerPrivateState(roomId: string, userId: string) {
    const priv = storage.getPrivateRoomState(roomId);
    return priv.privatePlayers?.[userId] || null;
  }

  public submitAction(roomId: string, userId: string, actionType: string, payload: any): Room {
    const room = storage.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'active') throw new Error('Room is not currently active');

    const state = room.publicGameState;
    if (!state) throw new Error('No active game state');

    // === Undercover Actions ===
    if (state.type === 'undercover') {
      if (actionType === 'start_clues') {
        state.phase = 'clue_round';
        state.activeTurnPlayerId = state.turnPlayerOrder[0];
        state.statusMessage = `${room.players[state.activeTurnPlayerId]?.nickname}'s turn to give a one-sentence clue!`;
      } else if (actionType === 'submit_clue') {
        const text = String(payload.text || '').trim();
        if (!text) throw new Error('Clue text cannot be empty');

        const player = room.players[userId];
        state.clues.push({
          playerId: userId,
          nickname: player?.nickname || 'Player',
          text,
        });

        const nextIndex = state.clues.length;
        if (nextIndex < state.turnPlayerOrder.length) {
          state.activeTurnPlayerId = state.turnPlayerOrder[nextIndex];
          state.statusMessage = `${room.players[state.activeTurnPlayerId]?.nickname}'s turn to give a clue!`;
        } else {
          // All clues in! Move to discussion & voting
          state.phase = 'voting';
          state.statusMessage = 'All clues submitted! Discuss and vote for who to eliminate.';
          state.votes = {};
        }
      } else if (actionType === 'submit_vote') {
        const targetId = String(payload.targetPlayerId);
        if (!room.players[targetId]) throw new Error('Invalid vote target');

        state.votes[userId] = targetId;

        const activePlayerIds = state.turnPlayerOrder.filter(
          (id) => !state.eliminatedPlayers.some((e) => e.playerId === id)
        );

        // Check if all active players voted
        const votedCount = Object.keys(state.votes).length;
        if (votedCount >= activePlayerIds.length) {
          // Resolve elimination
          const res = resolveVoteElimination(state.votes, activePlayerIds);
          if (res.eliminatedPlayerId) {
            const eliminatedPlayer = room.players[res.eliminatedPlayerId];
            const priv = storage.getPrivateRoomState(roomId);
            const playerPriv = priv.privatePlayers?.[res.eliminatedPlayerId];

            state.eliminatedPlayers.push({
              playerId: res.eliminatedPlayerId,
              nickname: eliminatedPlayer?.nickname || 'Player',
              role: playerPriv?.role,
              word: playerPriv?.secretWord,
            });

            if (playerPriv?.role === 'undercover') {
              state.undercoverCountRemaining -= 1;
            } else {
              state.civilianCountRemaining -= 1;
            }

            // Check win condition
            const surviving = activePlayerIds
              .filter((id) => id !== res.eliminatedPlayerId)
              .map((id) => ({
                playerId: id,
                role: priv.privatePlayers?.[id]?.role as 'civilian' | 'undercover',
              }));

            const winCheck = checkUndercoverWinCondition(surviving);
            if (winCheck.isOver) {
              state.phase = 'game_over';
              state.winner = winCheck.winner;
              state.statusMessage = winCheck.reason || 'Game over!';
              room.status = 'completed';

              // Award points to winners
              surviving.forEach((p) => {
                if (p.role === winCheck.winner || (winCheck.winner === 'civilians' && p.role === 'civilian')) {
                  if (room.players[p.playerId]) {
                    room.players[p.playerId].score += 20;
                  }
                }
              });
            } else {
              state.phase = 'elimination';
              state.statusMessage = `${eliminatedPlayer?.nickname} was eliminated! They were ${playerPriv?.role === 'undercover' ? 'an Undercover!' : 'a Civilian.'}`;
            }
          } else {
            state.phase = 'elimination';
            state.statusMessage = 'Vote was a tie! No one was eliminated this round.';
          }
        }
      } else if (actionType === 'next_round') {
        state.roundNumber += 1;
        state.phase = 'clue_round';
        state.votes = {};
        const activePlayerIds = state.turnPlayerOrder.filter(
          (id) => !state.eliminatedPlayers.some((e) => e.playerId === id)
        );
        state.turnPlayerOrder = activePlayerIds;
        state.activeTurnPlayerId = state.turnPlayerOrder[0];
        state.statusMessage = `Round ${state.roundNumber}: ${room.players[state.activeTurnPlayerId]?.nickname}'s turn to give a clue!`;
      }
    }

    // === Who Said That? Actions ===
    else if (state.type === 'who_said_that') {
      const priv = storage.getPrivateRoomState(roomId);
      if (actionType === 'submit_answer') {
        const text = String(payload.text || '').trim();
        if (!text) throw new Error('Answer cannot be empty');

        const answerId = `ans_${userId}`;
        priv.authorMap = priv.authorMap || {};
        priv.authorMap[answerId] = userId;
        storage.savePrivateRoomState(roomId, priv);

        const existing = state.revealedAnswers.find((a) => a.answerId === answerId);
        if (!existing) {
          state.revealedAnswers.push({
            answerId,
            text,
            guesses: {},
          });
        }
        state.submissionsCount = state.revealedAnswers.length;

        const totalPlayers = Object.keys(room.players).length;
        if (state.submissionsCount >= totalPlayers) {
          // Shuffle answers to remove order bias
          state.revealedAnswers.sort(() => Math.random() - 0.5);
          state.phase = 'guessing';
          state.currentAnswerIndex = 0;
          state.statusMessage = 'Guess who wrote this answer!';
        }
      } else if (actionType === 'submit_guess') {
        const currentAns = state.revealedAnswers[state.currentAnswerIndex];
        if (!currentAns) throw new Error('No answer to guess');

        const guessedAuthorId = String(payload.guessedAuthorPlayerId);
        currentAns.guesses[userId] = guessedAuthorId;

        const totalPlayers = Object.keys(room.players).length;
        // All non-authors voted?
        if (Object.keys(currentAns.guesses).length >= totalPlayers - 1) {
          const authorId = priv.authorMap?.[currentAns.answerId] || '';
          currentAns.actualAuthorId = authorId;
          currentAns.actualAuthorNickname = room.players[authorId]?.nickname || 'Player';

          // Score it
          const scored = scoreWhoSaidThatAnswer(authorId, currentAns.guesses, Object.keys(room.players));
          for (const [pid, pts] of Object.entries(scored.playerScores)) {
            state.scores[pid] = (state.scores[pid] || 0) + pts;
            if (room.players[pid]) {
              room.players[pid].score = state.scores[pid];
            }
          }

          state.phase = 'reveal';
          state.statusMessage = `Answer revealed! Written by ${currentAns.actualAuthorNickname}.`;
        }
      } else if (actionType === 'next_answer') {
        if (state.currentAnswerIndex + 1 < state.revealedAnswers.length) {
          state.currentAnswerIndex += 1;
          state.phase = 'guessing';
          state.statusMessage = 'Guess who wrote this answer!';
        } else {
          state.phase = 'game_over';
          state.statusMessage = 'Game Over! Final scores calculated.';
          room.status = 'completed';
        }
      }
    }

    // === Most Likely To Actions ===
    else if (state.type === 'most_likely_to') {
      if (actionType === 'submit_vote') {
        const targetId = String(payload.targetPlayerId);
        state.votes[userId] = targetId;

        const totalPlayers = Object.keys(room.players).length;
        if (Object.keys(state.votes).length >= totalPlayers) {
          // Tally
          const counts: Record<string, number> = {};
          Object.values(state.votes).forEach((target) => {
            counts[target] = (counts[target] || 0) + 1;
          });
          state.voteCounts = counts;

          let maxVotes = 0;
          let tops: string[] = [];
          for (const [pid, cnt] of Object.entries(counts)) {
            if (cnt > maxVotes) {
              maxVotes = cnt;
              tops = [pid];
            } else if (cnt === maxVotes && cnt > 0) {
              tops.push(pid);
            }
          }
          state.topPlayerIds = tops;
          state.phase = 'reveal';

          const topNames = tops.map((id) => room.players[id]?.nickname || 'Someone').join(', ');
          state.statusMessage = `The group voted: ${topNames} with ${maxVotes} votes!`;
        }
      } else if (actionType === 'next_prompt') {
        const prompt = MOST_LIKELY_TO_PROMPTS[Math.floor(Math.random() * MOST_LIKELY_TO_PROMPTS.length)];
        state.prompt = prompt;
        state.promptIndex += 1;
        state.votes = {};
        state.voteCounts = {};
        state.topPlayerIds = [];
        if (state.promptIndex > state.totalPrompts) {
          state.phase = 'game_over';
          state.statusMessage = 'All rounds completed!';
          room.status = 'completed';
        } else {
          state.phase = 'voting';
          state.statusMessage = 'Vote for who is most likely!';
        }
      }
    }

    // === Campus Quiz Actions ===
    else if (state.type === 'campus_quiz') {
      const priv = storage.getPrivateRoomState(roomId);
      if (actionType === 'submit_answer') {
        const optionIndex = Number(payload.optionIndex);
        if (!state.answeredPlayerIds.includes(userId)) {
          state.answeredPlayerIds.push(userId);
        }

        const qInfo = priv.correctAnswers?.[state.question.id];
        if (qInfo && optionIndex === qInfo.correctIndex) {
          state.scores[userId] = (state.scores[userId] || 0) + 10;
          if (room.players[userId]) {
            room.players[userId].score = state.scores[userId];
          }
        }

        const totalPlayers = Object.keys(room.players).length;
        if (state.answeredPlayerIds.length >= totalPlayers) {
          state.phase = 'reveal';
          state.revealData = {
            correctOptionIndex: qInfo?.correctIndex || 0,
            explanation: qInfo?.explanation || '',
          };
          state.statusMessage = 'Answer revealed!';
        }
      } else if (actionType === 'next_question') {
        state.currentQuestionIndex += 1;
        if (state.currentQuestionIndex >= state.totalQuestions) {
          state.phase = 'game_over';
          state.statusMessage = 'Quiz finished!';
          room.status = 'completed';
        } else {
          const quiz = CAMPUS_QUIZ_BANK[Math.floor(Math.random() * CAMPUS_QUIZ_BANK.length)];
          state.question = {
            id: quiz.id,
            prompt: quiz.prompt,
            options: quiz.options,
            category: quiz.category,
          };
          state.answeredPlayerIds = [];
          state.phase = 'question';
          state.revealData = undefined;
          state.statusMessage = 'Read the question and lock in your answer!';

          priv.correctAnswers = priv.correctAnswers || {};
          priv.correctAnswers[quiz.id] = { correctIndex: quiz.correctIndex, explanation: quiz.explanation };
          storage.savePrivateRoomState(roomId, priv);
        }
      }
    }

    room.updatedAt = new Date().toISOString();
    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }

  public leaveRoom(roomId: string, userId: string): Room | null {
    const room = storage.getRoom(roomId);
    if (!room) return null;

    delete room.players[userId];
    const remainingPlayerIds = Object.keys(room.players);

    if (remainingPlayerIds.length === 0) {
      storage.deleteRoom(roomId);
      return null;
    }

    // Host migration if host left
    if (room.hostId === userId) {
      room.hostId = remainingPlayerIds[0];
      room.players[room.hostId].isHost = true;
    }

    room.updatedAt = new Date().toISOString();
    storage.saveRoom(room);
    this.broadcastRoomUpdate(room.id);
    return room;
  }
}

export const roomManager = new RoomManager();
