import { UserProfile, DailyQuestionPackPublic, DailyAttempt, Circle, Room, LeaderboardEntry, LeaderboardScope, GameType } from '../types/game.ts';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth & Profile
  authGuest: (payload: { userId?: string; nickname?: string; avatarKey?: string; department?: string; level?: string }) =>
    request<{ user: UserProfile }>('/api/auth/guest', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: (userId: string) =>
    request<{ user: UserProfile }>(`/api/profile?userId=${encodeURIComponent(userId)}`),

  updateProfile: (payload: { userId: string; nickname?: string; avatarKey?: string; department?: string; level?: string }) =>
    request<{ user: UserProfile }>('/api/profile/update', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Daily Showdown
  getDailyPack: (dateId?: string) =>
    request<{ pack: DailyQuestionPackPublic; serverDateId: string }>(
      dateId ? `/api/daily?date=${encodeURIComponent(dateId)}` : '/api/daily'
    ),

  getDailyAttempt: (userId: string, dateId?: string) =>
    request<{ attempt: DailyAttempt | null; dateId: string }>(
      `/api/daily/attempt?userId=${encodeURIComponent(userId)}${dateId ? `&date=${encodeURIComponent(dateId)}` : ''}`
    ),

  startDailyAttempt: (userId: string, dateId?: string) =>
    request<{ attempt: DailyAttempt }>('/api/daily/attempt/start', {
      method: 'POST',
      body: JSON.stringify({ userId, dateId }),
    }),

  submitDailyAnswer: (payload: { userId: string; stageIndex: number; selectedOptionIndex: number; dateId?: string }) =>
    request<{ attempt: DailyAttempt; verdict?: string }>('/api/daily/attempt/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getLeaderboard: (scope: LeaderboardScope, scopeId?: string, dateId?: string, userId?: string) => {
    let url = `/api/daily/leaderboard?scope=${encodeURIComponent(scope)}`;
    if (scopeId) url += `&scopeId=${encodeURIComponent(scopeId)}`;
    if (dateId) url += `&date=${encodeURIComponent(dateId)}`;
    if (userId) url += `&userId=${encodeURIComponent(userId)}`;
    return request<{
      scope: LeaderboardScope;
      dateId: string;
      totalParticipants: number;
      isProvisional: boolean;
      entries: LeaderboardEntry[];
    }>(url);
  },

  // Circles
  getUserCircles: (userId: string) =>
    request<{ circles: Circle[] }>(`/api/circles?userId=${encodeURIComponent(userId)}`),

  createCircle: (payload: { userId: string; name: string; type?: string; department?: string; level?: string; description?: string }) =>
    request<{ circle: Circle }>('/api/circles/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  joinCircle: (payload: { userId: string; inviteCode: string }) =>
    request<{ circle: Circle }>('/api/circles/join', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCircle: (circleId: string) =>
    request<{ circle: Circle; todayCompletedCount: number; totalMembers: number }>(`/api/circles/${encodeURIComponent(circleId)}`),

  // Rooms
  createRoom: (payload: { hostUserId: string; gameType: GameType; circleId?: string; maxPlayers?: number; roundCount?: number }) =>
    request<{ room: Room }>('/api/rooms/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  joinRoom: (payload: { userId: string; code: string }) =>
    request<{ room: Room }>('/api/rooms/join', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getRoom: (roomCode: string) =>
    request<{ room: Room }>(`/api/rooms/${encodeURIComponent(roomCode)}`),

  getMyRoomPrivateState: (roomId: string, userId: string) =>
    request<{ privateState: any }>(`/api/rooms/${encodeURIComponent(roomId)}/my-state?userId=${encodeURIComponent(userId)}`),

  setReady: (roomId: string, userId: string, isReady: boolean) =>
    request<{ room: Room }>(`/api/rooms/${encodeURIComponent(roomId)}/ready`, {
      method: 'POST',
      body: JSON.stringify({ userId, isReady }),
    }),

  startRoom: (roomId: string, userId: string) =>
    request<{ room: Room }>(`/api/rooms/${encodeURIComponent(roomId)}/start`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  submitRoomAction: (roomId: string, userId: string, actionType: string, payload: any) =>
    request<{ room: Room }>(`/api/rooms/${encodeURIComponent(roomId)}/action`, {
      method: 'POST',
      body: JSON.stringify({ userId, actionType, payload }),
    }),

  leaveRoom: (roomId: string, userId: string) =>
    request<{ room: Room }>(`/api/rooms/${encodeURIComponent(roomId)}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Reports
  submitReport: (payload: { reporterId: string; targetType: string; targetId: string; reason: string; details?: string }) =>
    request<{ success: boolean }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Admin
  getAdminOverview: () =>
    request<{ totalUsers: number; totalCircles: number; reports: any[]; todayDateId: string }>('/api/admin/overview'),

  generateDailyCandidate: (dateId?: string) =>
    request<{ success: boolean; pack: any }>('/api/admin/generate-daily', {
      method: 'POST',
      body: JSON.stringify({ dateId }),
    }),
};
