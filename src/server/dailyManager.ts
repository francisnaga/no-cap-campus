import { storage } from './storage.ts';
import { DailyAttempt, DailyQuestionPackPublic, LeaderboardEntry, LeaderboardScope } from '../types/game.ts';
import { getLagosDateId, calculateUpdatedStreak } from '../lib/dailyTime.ts';
import { calculateDailyStageScore } from '../lib/scoring.ts';
import { generateGameVerdict } from './geminiService.ts';
import { APP_CONFIG } from '../config/appConfig.ts';

export class DailyManager {
  /**
   * Retrieves today's published question pack WITHOUT answer key for client play.
   */
  public getPublicDailyPack(dateId?: string): DailyQuestionPackPublic {
    const today = dateId || getLagosDateId();
    const entry = storage.getDailyPack(today);
    return entry.pack;
  }

  /**
   * Starts or resumes today's daily challenge attempt for a user.
   */
  public startOrResumeAttempt(userId: string, dateId?: string): DailyAttempt {
    const today = dateId || getLagosDateId();
    const existing = storage.getDailyAttempt(today, userId);
    if (existing) {
      return existing;
    }

    const pack = this.getPublicDailyPack(today);
    const user = storage.getUser(userId);

    const newAttempt: DailyAttempt = {
      attemptId: `att_${today}_${userId}`,
      userId,
      dateId: today,
      packVersion: pack.version,
      currentStage: 0,
      answers: [],
      totalScore: 0,
      maxScore: pack.maxScore,
      completed: false,
      startedAt: new Date().toISOString(),
      streakAfter: user?.streak || 0,
    };

    storage.saveDailyAttempt(newAttempt);
    return newAttempt;
  }

  /**
   * Authoritatively submits a stage answer.
   */
  public async submitStageAnswer(
    userId: string,
    stageIndex: number,
    selectedOptionIndex: number,
    dateId?: string
  ): Promise<{ attempt: DailyAttempt; verdict?: string }> {
    const today = dateId || getLagosDateId();
    let attempt = storage.getDailyAttempt(today, userId);
    if (!attempt) {
      attempt = this.startOrResumeAttempt(userId, today);
    }

    if (attempt.completed) {
      return { attempt };
    }

    // Idempotent check: if answer already recorded for this stage, return without re-scoring
    const existingAnswer = attempt.answers.find((a) => a.stageIndex === stageIndex);
    if (existingAnswer) {
      return { attempt };
    }

    const packEntry = storage.getDailyPack(today);
    const key = packEntry.answerKey.stageAnswers.find((k) => k.stageIndex === stageIndex);
    const correctOptionIndex = key ? key.correctAnswerIndex : 0;

    const { isCorrect, points } = calculateDailyStageScore(selectedOptionIndex, correctOptionIndex);

    attempt.answers.push({
      stageIndex,
      selectedOptionIndex,
      isCorrect,
      pointsAwarded: points,
      timestamp: new Date().toISOString(),
    });

    attempt.totalScore = attempt.answers.reduce((acc, a) => acc + a.pointsAwarded, 0);
    attempt.currentStage = attempt.answers.length;

    let verdict: string | undefined;

    // Check if all 3 stages completed
    if (attempt.answers.length >= packEntry.pack.stages.length) {
      attempt.completed = true;
      attempt.completedAt = new Date().toISOString();

      // Update user streak & statistics
      const user = storage.getUser(userId);
      if (user) {
        const lastDate = (user as any).lastCompletedDailyDateId;
        const newStreak = calculateUpdatedStreak(user.streak, lastDate, today);
        user.streak = newStreak;
        user.bestStreak = Math.max(user.bestStreak || 0, newStreak);
        user.totalPoints = (user.totalPoints || 0) + attempt.totalScore;
        user.dailyPlayedCount = (user.dailyPlayedCount || 0) + 1;
        (user as any).lastCompletedDailyDateId = today;
        user.updatedAt = new Date().toISOString();
        storage.saveUser(user);
        attempt.streakAfter = newStreak;
      }

      verdict = await generateGameVerdict(attempt.totalScore, attempt.maxScore, attempt.streakAfter);
    }

    storage.saveDailyAttempt(attempt);
    return { attempt, verdict };
  }

  /**
   * Builds leaderboards across scopes with real data and honest sample-size labeling.
   */
  public getLeaderboard(
    dateId: string,
    scope: LeaderboardScope,
    scopeId?: string,
    currentUserId?: string
  ): {
    scope: LeaderboardScope;
    dateId: string;
    totalParticipants: number;
    isProvisional: boolean;
    entries: LeaderboardEntry[];
  } {
    const attempts = storage.getDailyAttemptsForDate(dateId).filter((a) => a.completed);
    let eligibleAttempts = attempts;
    let minParticipants = 1;

    if (scope === 'circle' && scopeId) {
      const circle = storage.getCircle(scopeId);
      if (circle) {
        const memberIds = new Set(Object.keys(circle.members));
        eligibleAttempts = attempts.filter((a) => memberIds.has(a.userId));
        minParticipants = APP_CONFIG.rankingThresholds.circleMinParticipants;
      } else {
        eligibleAttempts = [];
      }
    } else if (scope === 'department' && scopeId) {
      eligibleAttempts = attempts.filter((a) => {
        const u = storage.getUser(a.userId);
        return u?.department === scopeId;
      });
      minParticipants = APP_CONFIG.rankingThresholds.departmentMinParticipants;
    } else if (scope === 'level' && scopeId) {
      eligibleAttempts = attempts.filter((a) => {
        const u = storage.getUser(a.userId);
        return u?.level === scopeId;
      });
      minParticipants = APP_CONFIG.rankingThresholds.departmentMinParticipants;
    } else if (scope === 'university') {
      minParticipants = APP_CONFIG.rankingThresholds.universityMinParticipants;
    }

    // Sort by highest score, then earliest completion time (stable)
    eligibleAttempts.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return (a.completedAt || '').localeCompare(b.completedAt || '');
    });

    const isProvisional = eligibleAttempts.length < minParticipants;

    const entries: LeaderboardEntry[] = eligibleAttempts.map((att, idx) => {
      const u = storage.getUser(att.userId);
      return {
        rank: idx + 1,
        id: att.userId,
        name: u?.nickname || `Student ${att.userId.slice(-4)}`,
        avatarKey: u?.avatarKey || 'anchor',
        score: att.totalScore,
        playedCount: u?.dailyPlayedCount || 1,
        isProvisional,
        department: u?.department,
        level: u?.level,
        streak: u?.streak || 1,
      };
    });

    return {
      scope,
      dateId,
      totalParticipants: eligibleAttempts.length,
      isProvisional,
      entries,
    };
  }
}

export const dailyManager = new DailyManager();
