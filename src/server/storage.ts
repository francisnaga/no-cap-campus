import fs from 'fs';
import path from 'path';
import { UserProfile, DailyAttempt, Circle, Room, LeaderboardEntry } from '../types/game.ts';
import { SeedPackEntry, getSeedPackForDate } from '../lib/contentSeed.ts';
import { getLagosDateId } from '../lib/dailyTime.ts';

export interface DatabaseSchema {
  users: Record<string, UserProfile>;
  dailyAttempts: Record<string, DailyAttempt>; // key: `${dateId}_${userId}`
  dailyPacks: Record<string, SeedPackEntry>;
  circles: Record<string, Circle>;
  circleInvites: Record<string, string>; // inviteCode -> circleId
  roomCodes: Record<string, string>; // roomCode -> roomId
  rooms: Record<string, Room>;
  privateRoomState: Record<string, {
    privatePlayers: Record<string, any>;
    secretAssignments?: any;
    authorMap?: Record<string, string>; // answerId -> authorPlayerId
    correctAnswers?: any;
  }>;
  reports: Array<{
    id: string;
    reporterId: string;
    targetType: string;
    targetId: string;
    reason: string;
    details?: string;
    createdAt: string;
  }>;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const SEED_DATA_DIR = path.resolve('.data');
const SEED_DB_FILE = path.join(SEED_DATA_DIR, 'db.json');
const DATA_DIR = isServerless ? path.join('/tmp', '.data') : SEED_DATA_DIR;
const DB_FILE = isServerless ? path.join('/tmp', '.data', 'db.json') : SEED_DB_FILE;

class StorageManager {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.db = this.loadDatabase();
    this.initializeDefaults();
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('Could not create data directory, using in-memory store:', err);
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse db.json, creating clean store:', err);
      }
    }
    if (isServerless && fs.existsSync(SEED_DB_FILE)) {
      try {
        const raw = fs.readFileSync(SEED_DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse seed db.json:', err);
      }
    }
    return {
      users: {},
      dailyAttempts: {},
      dailyPacks: {},
      circles: {},
      circleInvites: {},
      roomCodes: {},
      rooms: {},
      privateRoomState: {},
      reports: [],
    };
  }

  public save() {
    try {
      this.ensureDirectory();
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.warn('Error saving db.json (using in-memory store):', err);
    }
  }

  private initializeDefaults() {
    const today = getLagosDateId();
    if (!this.db.dailyPacks[today]) {
      this.db.dailyPacks[today] = getSeedPackForDate(today);
      this.save();
    }
  }

  // --- Users ---
  public getUser(userId: string): UserProfile | undefined {
    return this.db.users[userId];
  }

  public saveUser(user: UserProfile) {
    this.db.users[user.userId] = user;
    this.save();
  }

  public getAllUsers(): UserProfile[] {
    return Object.values(this.db.users);
  }

  // --- Daily Packs & Attempts ---
  public getDailyPack(dateId: string): SeedPackEntry {
    if (!this.db.dailyPacks[dateId]) {
      this.db.dailyPacks[dateId] = getSeedPackForDate(dateId);
      this.save();
    }
    return this.db.dailyPacks[dateId];
  }

  public setDailyPack(dateId: string, packEntry: SeedPackEntry) {
    this.db.dailyPacks[dateId] = packEntry;
    this.save();
  }

  public getDailyAttempt(dateId: string, userId: string): DailyAttempt | undefined {
    return this.db.dailyAttempts[`${dateId}_${userId}`];
  }

  public saveDailyAttempt(attempt: DailyAttempt) {
    this.db.dailyAttempts[`${attempt.dateId}_${attempt.userId}`] = attempt;
    this.save();
  }

  public getDailyAttemptsForDate(dateId: string): DailyAttempt[] {
    return Object.values(this.db.dailyAttempts).filter((a) => a.dateId === dateId);
  }

  // --- Circles ---
  public getCircle(circleId: string): Circle | undefined {
    return this.db.circles[circleId];
  }

  public getCircleByCode(code: string): Circle | undefined {
    const circleId = this.db.circleInvites[code.toUpperCase()];
    if (!circleId) return undefined;
    return this.db.circles[circleId];
  }

  public saveCircle(circle: Circle) {
    this.db.circles[circle.id] = circle;
    this.db.circleInvites[circle.inviteCode.toUpperCase()] = circle.id;
    this.save();
  }

  public getAllCircles(): Circle[] {
    return Object.values(this.db.circles);
  }

  // --- Rooms ---
  public getRoom(roomId: string): Room | undefined {
    return this.db.rooms[roomId];
  }

  public getRoomByCode(code: string): Room | undefined {
    const roomId = this.db.roomCodes[code.toUpperCase()];
    if (!roomId) return undefined;
    return this.db.rooms[roomId];
  }

  public saveRoom(room: Room) {
    this.db.rooms[room.id] = room;
    this.db.roomCodes[room.code.toUpperCase()] = room.id;
    this.save();
  }

  public deleteRoom(roomId: string) {
    const room = this.db.rooms[roomId];
    if (room) {
      delete this.db.roomCodes[room.code.toUpperCase()];
      delete this.db.rooms[roomId];
      delete this.db.privateRoomState[roomId];
      this.save();
    }
  }

  public getPrivateRoomState(roomId: string) {
    if (!this.db.privateRoomState[roomId]) {
      this.db.privateRoomState[roomId] = { privatePlayers: {} };
    }
    return this.db.privateRoomState[roomId];
  }

  public savePrivateRoomState(roomId: string, state: any) {
    this.db.privateRoomState[roomId] = state;
    this.save();
  }

  // --- Reports ---
  public addReport(report: {
    reporterId: string;
    targetType: string;
    targetId: string;
    reason: string;
    details?: string;
  }) {
    const item = {
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...report,
      createdAt: new Date().toISOString(),
    };
    this.db.reports.unshift(item);
    this.save();
    return item;
  }

  public getReports() {
    return this.db.reports;
  }
}

export const storage = new StorageManager();
