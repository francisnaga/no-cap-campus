import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assignUndercoverRoles,
  checkUndercoverWinCondition,
  resolveVoteElimination,
  scoreWhoSaidThatAnswer,
  calculateDailyStageScore,
} from './scoring.ts';
import {
  isConsecutiveLagosDay,
  calculateUpdatedStreak,
  getLagosDateId,
} from './dailyTime.ts';

test('Undercover role assignment assigns 1 undercover for small groups', () => {
  const players = ['p1', 'p2', 'p3', 'p4'];
  const assignments = assignUndercoverRoles(players, 'Jollof', 'Fried Rice', () => 0.1);
  assert.equal(assignments.length, 4);
  const undercovers = assignments.filter((a) => a.role === 'undercover');
  const civilians = assignments.filter((a) => a.role === 'civilian');
  assert.equal(undercovers.length, 1);
  assert.equal(civilians.length, 3);
  assert.equal(undercovers[0].secretWord, 'Fried Rice');
  assert.equal(civilians[0].secretWord, 'Jollof');
});

test('Undercover role assignment assigns 2 undercovers for 6-9 players', () => {
  const players = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
  const assignments = assignUndercoverRoles(players, 'Hostel', 'Lodge');
  const undercovers = assignments.filter((a) => a.role === 'undercover');
  assert.equal(undercovers.length, 2);
});

test('Undercover win condition: all undercovers eliminated means civilians win', () => {
  const active = [
    { playerId: 'p1', role: 'civilian' as const },
    { playerId: 'p2', role: 'civilian' as const },
  ];
  const res = checkUndercoverWinCondition(active);
  assert.equal(res.isOver, true);
  assert.equal(res.winner, 'civilians');
});

test('Undercover win condition: undercovers equal civilians means undercover wins', () => {
  const active = [
    { playerId: 'p1', role: 'civilian' as const },
    { playerId: 'p2', role: 'undercover' as const },
  ];
  const res = checkUndercoverWinCondition(active);
  assert.equal(res.isOver, true);
  assert.equal(res.winner, 'undercover');
});

test('Vote elimination resolves highest vote correctly', () => {
  const votes = {
    voter1: 'p2',
    voter2: 'p2',
    voter3: 'p1',
  };
  const res = resolveVoteElimination(votes, ['p1', 'p2', 'p3']);
  assert.equal(res.eliminatedPlayerId, 'p2');
  assert.equal(res.isTie, false);
});

test('Vote elimination handles ties by not eliminating anyone', () => {
  const votes = {
    voter1: 'p1',
    voter2: 'p2',
  };
  const res = resolveVoteElimination(votes, ['p1', 'p2', 'p3']);
  assert.equal(res.eliminatedPlayerId, null);
  assert.equal(res.isTie, true);
});

test('Who Said That scoring awards 10 pts for correct guesses and 5 pts/fooled to author', () => {
  const authorId = 'p1';
  const guesses = {
    p2: 'p1', // p2 guessed correctly (+10 to p2)
    p3: 'p2', // p3 guessed wrongly (fooled! +5 to p1)
    p4: 'p3', // p4 guessed wrongly (fooled! +5 to p1)
  };
  const res = scoreWhoSaidThatAnswer(authorId, guesses, ['p1', 'p2', 'p3', 'p4']);
  assert.equal(res.playerScores['p2'], 10);
  assert.equal(res.playerScores['p1'], 10); // author fooled 2 players -> 10 pts
  assert.equal(res.playerScores['p3'], 0);
  assert.equal(res.playerScores['p4'], 0);
  assert.equal(res.fooledCount, 2);
});

test('Daily Showdown stage scoring gives 10 for correct, 0 for incorrect', () => {
  const correct = calculateDailyStageScore(2, 2);
  assert.equal(correct.isCorrect, true);
  assert.equal(correct.points, 10);

  const incorrect = calculateDailyStageScore(1, 2);
  assert.equal(incorrect.isCorrect, false);
  assert.equal(incorrect.points, 0);
});

test('Lagos calendar streak correctly advances on consecutive days', () => {
  assert.equal(isConsecutiveLagosDay('2026-10-17', '2026-10-18'), true);
  assert.equal(isConsecutiveLagosDay('2026-10-15', '2026-10-18'), false);

  // New player first game
  assert.equal(calculateUpdatedStreak(0, undefined, '2026-10-18'), 1);
  // Replaying on same day maintains streak
  assert.equal(calculateUpdatedStreak(4, '2026-10-18', '2026-10-18'), 4);
  // Consecutive day increments streak
  assert.equal(calculateUpdatedStreak(4, '2026-10-17', '2026-10-18'), 5);
  // Skipped day resets to 1
  assert.equal(calculateUpdatedStreak(4, '2026-10-15', '2026-10-18'), 1);
});

test('Lagos date string is formatted correctly YYYY-MM-DD', () => {
  const fixedDate = new Date('2026-10-18T10:00:00Z');
  const dateId = getLagosDateId(fixedDate);
  assert.match(dateId, /^\d{4}-\d{2}-\d{2}$/);
});
