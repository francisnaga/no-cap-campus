export type InstitutionId = string;

export interface UserProfile {
  userId: string;
  nickname: string;
  avatarKey: string;
  isGuest: boolean;
  institutionId?: string;
  faculty?: string;
  department?: string;
  level?: string;
  createdAt: string;
  updatedAt: string;
  streak: number;
  bestStreak: number;
  totalPoints: number;
  dailyPlayedCount: number;
  liveWinsCount: number;
}

export type StageType = 'quickfire' | 'real_or_fake' | 'campus_read';

export interface DailyStageQuestion {
  id: string;
  type: StageType;
  title: string;
  prompt: string;
  context?: string;
  options: string[];
  // Note: correctAnswerIndex is NEVER sent to client in public pack!
}

export interface DailyQuestionPackPublic {
  dateId: string; // e.g. "2026-10-18" in Africa/Lagos
  version: number;
  stages: DailyStageQuestion[];
  timeLimitSeconds: number;
  maxScore: number;
}

export interface DailyAnswerKey {
  dateId: string;
  stageAnswers: {
    stageIndex: number;
    correctAnswerIndex: number; // or for majority/read, the verified criterion
    explanation: string;
  }[];
}

export interface DailyAttempt {
  attemptId: string;
  userId: string;
  dateId: string;
  packVersion: number;
  currentStage: number; // 0, 1, 2, or 3 (completed)
  answers: {
    stageIndex: number;
    selectedOptionIndex: number;
    isCorrect: boolean;
    pointsAwarded: number;
    timestamp: string;
  }[];
  totalScore: number;
  maxScore: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  streakAfter: number;
}

export interface Circle {
  id: string;
  name: string;
  type: 'friends' | 'class' | 'level' | 'department' | 'custom';
  inviteCode: string;
  ownerId: string;
  institutionId?: string;
  department?: string;
  level?: string;
  description?: string;
  createdAt: string;
  memberCount: number;
  members: Record<string, CircleMember>;
}

export interface CircleMember {
  userId: string;
  nickname: string;
  avatarKey: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: string;
  department?: string;
  level?: string;
}

export type GameType = 
  | 'undercover'
  | 'who_said_that'
  | 'most_likely_to'
  | 'campus_quiz'
  | 'real_or_fake_course'
  | 'would_you_rather';

export type RoomStatus = 'lobby' | 'starting' | 'active' | 'completed' | 'closed';

export interface RoomPlayer {
  id: string;
  nickname: string;
  avatarKey: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  joinedAt: string;
  score: number;
}

// Discriminative game-specific public and private states
export interface UndercoverPublicState {
  type: 'undercover';
  phase: 'briefing' | 'clue_round' | 'discussion' | 'voting' | 'elimination' | 'game_over';
  roundNumber: number;
  turnPlayerOrder: string[];
  activeTurnPlayerId?: string;
  clues: { playerId: string; nickname: string; text: string }[];
  votes: Record<string, string>; // voterId -> targetPlayerId
  eliminatedPlayers: { playerId: string; nickname: string; role?: string; word?: string }[];
  winner?: 'civilians' | 'undercover' | 'draw';
  statusMessage: string;
  civilianCountRemaining: number;
  undercoverCountRemaining: number;
}

export interface UndercoverPrivateState {
  role: 'civilian' | 'undercover';
  secretWord: string;
  hints?: string;
}

export interface WhoSaidThatPublicState {
  type: 'who_said_that';
  prompt: string;
  phase: 'submitting' | 'guessing' | 'reveal' | 'game_over';
  currentAnswerIndex: number;
  submissionsCount: number;
  revealedAnswers: {
    answerId: string;
    text: string;
    guesses: Record<string, string>; // voterId -> guessedAuthorPlayerId
    actualAuthorId?: string;
    actualAuthorNickname?: string;
  }[];
  scores: Record<string, number>;
  statusMessage: string;
}

export interface WhoSaidThatPrivateState {
  mySubmissionText?: string;
  hasSubmitted: boolean;
}

export interface MostLikelyToPublicState {
  type: 'most_likely_to';
  prompt: string;
  promptIndex: number;
  totalPrompts: number;
  phase: 'voting' | 'reveal' | 'game_over';
  votes: Record<string, string>; // voterId -> targetPlayerId
  voteCounts: Record<string, number>; // targetPlayerId -> count
  topPlayerIds: string[];
  scores: Record<string, number>;
  statusMessage: string;
}

export interface CampusQuizPublicState {
  type: 'campus_quiz';
  currentQuestionIndex: number;
  totalQuestions: number;
  question: {
    id: string;
    prompt: string;
    options: string[];
    category: string;
  };
  phase: 'question' | 'reveal' | 'game_over';
  timeRemaining: number;
  answeredPlayerIds: string[];
  scores: Record<string, number>;
  revealData?: {
    correctOptionIndex: number;
    explanation: string;
  };
  statusMessage: string;
}

export type PublicGameState = 
  | UndercoverPublicState 
  | WhoSaidThatPublicState 
  | MostLikelyToPublicState 
  | CampusQuizPublicState;

export interface Room {
  id: string;
  code: string;
  inviteToken: string;
  hostId: string;
  gameType: GameType;
  status: RoomStatus;
  circleId?: string;
  settings: {
    maxPlayers: number;
    roundCount: number;
    timeLimitSeconds: number;
    keepItClean: boolean;
  };
  players: Record<string, RoomPlayer>;
  publicGameState?: PublicGameState;
  createdAt: string;
  updatedAt: string;
}

export type LeaderboardScope = 'personal' | 'circle' | 'level' | 'department' | 'university';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatarKey: string;
  score: number;
  playedCount: number;
  isProvisional: boolean;
  department?: string;
  level?: string;
  streak?: number;
}
