import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { storage } from './storage.ts';
import { dailyManager } from './dailyManager.ts';
import { circleManager } from './circleManager.ts';
import { roomManager } from './roomManager.ts';
import { generateDailyCandidatePack } from './geminiService.ts';
import { UserProfile, LeaderboardScope } from '../types/game.ts';
import { getLagosDateId } from '../lib/dailyTime.ts';

dotenv.config();

const app = express();
app.use(express.json());

const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', serverDateId: getLagosDateId(), timestamp: new Date().toISOString() });
});

// === AUTH & PROFILE ===
apiRouter.post('/auth/guest', (req: Request, res: Response) => {
  try {
    const { userId, nickname, avatarKey, department, level } = req.body;
    
    if (userId) {
      const existing = storage.getUser(userId);
      if (existing) {
        if (nickname) existing.nickname = nickname.trim();
        if (avatarKey) existing.avatarKey = avatarKey;
        if (department) existing.department = department;
        if (level) existing.level = level;
        existing.updatedAt = new Date().toISOString();
        storage.saveUser(existing);
        return res.json({ user: existing });
      }
    }

    const newId = userId || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const defaultNick = nickname?.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
    const user: UserProfile = {
      userId: newId,
      nickname: defaultNick,
      avatarKey: avatarKey || 'anchor',
      isGuest: true,
      institutionId: 'nmu',
      department: department || 'Marine Engineering',
      level: level || '300L',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: 0,
      bestStreak: 0,
      totalPoints: 0,
      dailyPlayedCount: 0,
      liveWinsCount: 0,
    };

    storage.saveUser(user);
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to authenticate guest' });
  }
});

apiRouter.get('/profile', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const user = storage.getUser(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

apiRouter.post('/profile/update', (req: Request, res: Response) => {
  const { userId, nickname, avatarKey, department, level } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const user = storage.getUser(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (nickname) user.nickname = nickname.trim();
  if (avatarKey) user.avatarKey = avatarKey;
  if (department !== undefined) user.department = department;
  if (level !== undefined) user.level = level;
  user.updatedAt = new Date().toISOString();

  storage.saveUser(user);
  res.json({ user });
});

// === DAILY SHOWDOWN ===
apiRouter.get('/daily', (req: Request, res: Response) => {
  try {
    const dateId = (req.query.date as string) || getLagosDateId();
    const pack = dailyManager.getPublicDailyPack(dateId);
    res.json({ pack, serverDateId: getLagosDateId() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/daily/attempt', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const dateId = (req.query.date as string) || getLagosDateId();
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const attempt = storage.getDailyAttempt(dateId, userId);
  res.json({ attempt: attempt || null, dateId });
});

apiRouter.post('/daily/attempt/start', (req: Request, res: Response) => {
  const { userId, dateId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const attempt = dailyManager.startOrResumeAttempt(userId, dateId);
    res.json({ attempt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/daily/attempt/submit', async (req: Request, res: Response) => {
  const { userId, stageIndex, selectedOptionIndex, dateId } = req.body;
  if (!userId || stageIndex === undefined || selectedOptionIndex === undefined) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const result = await dailyManager.submitStageAnswer(userId, stageIndex, selectedOptionIndex, dateId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/daily/leaderboard', (req: Request, res: Response) => {
  try {
    const dateId = (req.query.date as string) || getLagosDateId();
    const scope = (req.query.scope as LeaderboardScope) || 'university';
    const scopeId = req.query.scopeId as string | undefined;
    const userId = req.query.userId as string | undefined;

    const leaderboard = dailyManager.getLeaderboard(dateId, scope, scopeId, userId);
    res.json(leaderboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === CIRCLES ===
apiRouter.get('/circles', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const circles = circleManager.getUserCircles(userId);
  res.json({ circles });
});

apiRouter.post('/circles/create', (req: Request, res: Response) => {
  const { userId, name, type, department, level, description } = req.body;
  if (!userId || !name) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const circle = circleManager.createCircle(userId, { name, type: type || 'friends', department, level, description });
    res.json({ circle });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/circles/join', (req: Request, res: Response) => {
  const { userId, inviteCode } = req.body;
  if (!userId || !inviteCode) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const circle = circleManager.joinCircleByCode(userId, inviteCode);
    res.json({ circle });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/circles/:circleId', (req: Request, res: Response) => {
  const circleId = req.params.circleId;
  const summary = circleManager.getCircleSummary(circleId);
  if (!summary) return res.status(404).json({ error: 'Circle not found' });
  res.json(summary);
});

// === ROOMS & MULTIPLAYER ===
apiRouter.post('/rooms/create', (req: Request, res: Response) => {
  const { hostUserId, gameType, circleId, maxPlayers, roundCount } = req.body;
  if (!hostUserId || !gameType) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const room = roomManager.createRoom(hostUserId, { gameType, circleId, maxPlayers, roundCount });
    res.json({ room });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/rooms/join', (req: Request, res: Response) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const room = roomManager.joinRoom(userId, code);
    res.json({ room });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/rooms/:roomCode', (req: Request, res: Response) => {
  const code = req.params.roomCode;
  const room = storage.getRoomByCode(code.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

apiRouter.get('/rooms/:roomId/my-state', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const privateState = roomManager.getPlayerPrivateState(roomId, userId);
  res.json({ privateState });
});

apiRouter.post('/rooms/:roomId/ready', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const { userId, isReady } = req.body;
  try {
    const room = roomManager.setReady(roomId, userId, Boolean(isReady));
    res.json({ room });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/rooms/:roomId/start', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const { userId } = req.body;
  try {
    const room = roomManager.startRoom(roomId, userId);
    res.json({ room });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/rooms/:roomId/action', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const { userId, actionType, payload } = req.body;
  try {
    const room = roomManager.submitAction(roomId, userId, actionType, payload);
    res.json({ room });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/rooms/:roomId/leave', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const { userId } = req.body;
  try {
    const room = roomManager.leaveRoom(roomId, userId);
    res.json({ room });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// SSE endpoint for live multiplayer updates
apiRouter.get('/rooms/:roomId/events', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial room snapshot
  const room = storage.getRoom(roomId);
  if (room) {
    res.write(`data: ${JSON.stringify(room)}\n\n`);
  }

  roomManager.subscribeSSE(roomId, res);
});

// === SAFETY & REPORTS ===
apiRouter.post('/reports', (req: Request, res: Response) => {
  const { reporterId, targetType, targetId, reason, details } = req.body;
  if (!reporterId || !targetType || !targetId || !reason) {
    return res.status(400).json({ error: 'Missing report fields' });
  }
  const report = storage.addReport({ reporterId, targetType, targetId, reason, details });
  res.json({ success: true, report });
});

// === ADMIN & DIAGNOSTICS ===
apiRouter.get('/admin/overview', (req: Request, res: Response) => {
  res.json({
    totalUsers: storage.getAllUsers().length,
    totalCircles: storage.getAllCircles().length,
    reports: storage.getReports(),
    todayDateId: getLagosDateId(),
  });
});

apiRouter.post('/admin/generate-daily', async (req: Request, res: Response) => {
  const { dateId } = req.body;
  const targetDate = dateId || getLagosDateId();
  try {
    const pack = await generateDailyCandidatePack(targetDate);
    if (!pack) {
      return res.status(500).json({ error: 'Could not generate pack with AI; fallback seed pack is in use.' });
    }
    storage.setDailyPack(targetDate, pack);
    res.json({ success: true, pack });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount on both '/api' and '/' so it handles both direct and rewritten paths reliably
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
export { app };
