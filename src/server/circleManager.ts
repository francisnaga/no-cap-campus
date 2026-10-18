import { storage } from './storage.ts';
import { Circle, CircleMember } from '../types/game.ts';
import { getLagosDateId } from '../lib/dailyTime.ts';

function generateCircleInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class CircleManager {
  public createCircle(
    userId: string,
    params: {
      name: string;
      type: 'friends' | 'class' | 'level' | 'department' | 'custom';
      institutionId?: string;
      department?: string;
      level?: string;
      description?: string;
    }
  ): Circle {
    const user = storage.getUser(userId);
    if (!user) throw new Error('User not found');

    let inviteCode = generateCircleInviteCode();
    // Ensure uniqueness
    while (storage.getCircleByCode(inviteCode)) {
      inviteCode = generateCircleInviteCode();
    }

    const circleId = `circ_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const ownerMember: CircleMember = {
      userId,
      nickname: user.nickname,
      avatarKey: user.avatarKey,
      role: 'owner',
      joinedAt: new Date().toISOString(),
      department: user.department,
      level: user.level,
    };

    const circle: Circle = {
      id: circleId,
      name: params.name.trim(),
      type: params.type,
      inviteCode,
      ownerId: userId,
      institutionId: params.institutionId || user.institutionId,
      department: params.department || user.department,
      level: params.level || user.level,
      description: params.description?.trim(),
      createdAt: new Date().toISOString(),
      memberCount: 1,
      members: {
        [userId]: ownerMember,
      },
    };

    storage.saveCircle(circle);
    return circle;
  }

  public joinCircleByCode(userId: string, inviteCode: string): Circle {
    const circle = storage.getCircleByCode(inviteCode.trim().toUpperCase());
    if (!circle) {
      throw new Error('Invalid circle invite code');
    }

    const user = storage.getUser(userId);
    if (!user) throw new Error('User not found');

    if (!circle.members[userId]) {
      circle.members[userId] = {
        userId,
        nickname: user.nickname,
        avatarKey: user.avatarKey,
        role: 'member',
        joinedAt: new Date().toISOString(),
        department: user.department,
        level: user.level,
      };
      circle.memberCount = Object.keys(circle.members).length;
      storage.saveCircle(circle);
    }

    return circle;
  }

  public getUserCircles(userId: string): Circle[] {
    return storage.getAllCircles().filter((c) => c.members && !!c.members[userId]);
  }

  public getCircleSummary(circleId: string) {
    const circle = storage.getCircle(circleId);
    if (!circle) return null;

    const today = getLagosDateId();
    const attempts = storage.getDailyAttemptsForDate(today);
    const memberIds = new Set(Object.keys(circle.members));

    const todayMembersCompleted = attempts.filter((a) => a.completed && memberIds.has(a.userId));

    return {
      circle,
      todayCompletedCount: todayMembersCompleted.length,
      totalMembers: Object.keys(circle.members).length,
    };
  }
}

export const circleManager = new CircleManager();
