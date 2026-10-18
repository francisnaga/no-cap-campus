/**
 * Pure game rules, scoring algorithms, and role distribution mechanics.
 */

export interface UndercoverRoleAssignment {
  playerId: string;
  role: 'civilian' | 'undercover';
  secretWord: string;
}

export interface UndercoverWinResult {
  isOver: boolean;
  winner?: 'civilians' | 'undercover' | 'draw';
  reason?: string;
}

/**
 * Assigns roles for Undercover party game.
 * Rules:
 *  - Under 6 players: 1 Undercover, rest Civilians
 *  - 6 to 9 players: 2 Undercovers, rest Civilians
 *  - 10+ players: 3 Undercovers, rest Civilians
 */
export function assignUndercoverRoles(
  playerIds: string[],
  civilianWord: string,
  undercoverWord: string,
  randomFn: () => number = Math.random
): UndercoverRoleAssignment[] {
  if (playerIds.length < 3) {
    throw new Error('Undercover requires at least 3 players');
  }

  const count = playerIds.length;
  let undercoverCount = 1;
  if (count >= 6 && count <= 9) {
    undercoverCount = 2;
  } else if (count >= 10) {
    undercoverCount = 3;
  }

  // Shuffle player IDs deterministically or with injected randomFn
  const shuffled = [...playerIds].sort(() => randomFn() - 0.5);
  const undercoverPlayerIds = new Set(shuffled.slice(0, undercoverCount));

  return playerIds.map((id) => {
    const isUndercover = undercoverPlayerIds.has(id);
    return {
      playerId: id,
      role: isUndercover ? 'undercover' : 'civilian',
      secretWord: isUndercover ? undercoverWord : civilianWord,
    };
  });
}

/**
 * Evaluates Undercover game win condition based on surviving players.
 */
export function checkUndercoverWinCondition(
  activePlayers: { playerId: string; role: 'civilian' | 'undercover' }[]
): UndercoverWinResult {
  const civilians = activePlayers.filter((p) => p.role === 'civilian');
  const undercovers = activePlayers.filter((p) => p.role === 'undercover');

  // If all undercovers eliminated, civilians win
  if (undercovers.length === 0) {
    return {
      isOver: true,
      winner: 'civilians',
      reason: 'All Undercovers were eliminated! Civilians win!',
    };
  }

  // If undercover count >= civilian count, undercovers win (they take over the vote)
  if (undercovers.length >= civilians.length) {
    return {
      isOver: true,
      winner: 'undercover',
      reason: 'Undercover count equals or exceeds Civilians! Undercovers win!',
    };
  }

  return { isOver: false };
}

/**
 * Tallies votes and resolves elimination.
 * In case of a tie for top votes, no one is eliminated (or handle tie per rule).
 */
export function resolveVoteElimination(
  votes: Record<string, string>, // voterId -> targetId
  eligibleTargetIds: string[]
): {
  eliminatedPlayerId: string | null;
  tally: Record<string, number>;
  isTie: boolean;
} {
  const tally: Record<string, number> = {};
  for (const targetId of eligibleTargetIds) {
    tally[targetId] = 0;
  }

  for (const [, targetId] of Object.entries(votes)) {
    if (eligibleTargetIds.includes(targetId)) {
      tally[targetId] = (tally[targetId] || 0) + 1;
    }
  }

  let highestVotes = -1;
  let topCandidates: string[] = [];

  for (const [targetId, count] of Object.entries(tally)) {
    if (count > highestVotes) {
      highestVotes = count;
      topCandidates = [targetId];
    } else if (count === highestVotes && count > 0) {
      topCandidates.push(targetId);
    }
  }

  if (highestVotes <= 0 || topCandidates.length > 1) {
    return {
      eliminatedPlayerId: null,
      tally,
      isTie: topCandidates.length > 1,
    };
  }

  return {
    eliminatedPlayerId: topCandidates[0],
    tally,
    isTie: false,
  };
}

/**
 * Scores Who Said That? round:
 * - 10 pts to each player who guessed the real author correctly.
 * - 5 pts to the author for each other player who guessed incorrectly (fooled).
 */
export function scoreWhoSaidThatAnswer(
  authorPlayerId: string,
  guesses: Record<string, string>, // voterId -> guessedAuthorPlayerId
  allPlayerIds: string[]
): {
  playerScores: Record<string, number>;
  correctGuessers: string[];
  fooledCount: number;
} {
  const scores: Record<string, number> = {};
  allPlayerIds.forEach((id) => (scores[id] = 0));

  const correctGuessers: string[] = [];
  let fooledCount = 0;

  for (const [voterId, guessedAuthor] of Object.entries(guesses)) {
    if (voterId === authorPlayerId) continue; // author cannot guess own answer

    if (guessedAuthor === authorPlayerId) {
      scores[voterId] = (scores[voterId] || 0) + 10;
      correctGuessers.push(voterId);
    } else {
      fooledCount += 1;
    }
  }

  // Bonus for author fooling players
  scores[authorPlayerId] = (scores[authorPlayerId] || 0) + fooledCount * 5;

  return {
    playerScores: scores,
    correctGuessers,
    fooledCount,
  };
}

/**
 * Daily Showdown authoritative stage scoring.
 * Stage 1: 10 points for correct answer, 0 otherwise
 * Stage 2: 10 points for correct answer, 0 otherwise
 * Stage 3: 10 points for correct answer, 0 otherwise
 * Max total: 30 points
 */
export function calculateDailyStageScore(
  selectedOptionIndex: number,
  correctOptionIndex: number
): { points: number; isCorrect: boolean } {
  const isCorrect = selectedOptionIndex === correctOptionIndex;
  return {
    isCorrect,
    points: isCorrect ? 10 : 0,
  };
}
