/**
 * HREngine.ts
 * 負責半導體人才招募市場、媒合時效倒數、候選人逐筆冷卻補齊、
 * 全廠排班機制 (週休二日 / 四班二輪 / 兩班制 / 三班制) 與疲勞恢復核算
 */

import { Candidate, SaveGameV2, StaffRank, StaffSpecialty, ShiftMode, WorkShift } from '../types';

export class HREngine {
  public static readonly MAX_MARKET_CANDIDATES = 6;
  public static readonly REPLENISH_COOLDOWN_MS = 60_000;

  private static readonly FIRST_NAMES = [
    'Alex', 'David', 'Sarah', 'Kevin', 'Emily', 'Michael', 'Jessica', 'James',
    'Daniel', 'Rachel', 'Robert', 'Brian', 'Olivia', 'William', 'Sophia', 'Thomas',
    'Emma', 'Chris', 'Grace', 'Eric', 'Lucas', 'Chloe', 'Nathan', 'Hannah',
    'Marcus', 'Elena', 'Jason', 'Amber', 'Tyler', 'Mia', 'Austin', 'Zoe'
  ];

  private static readonly LAST_NAMES = [
    'Miller', 'Chen', 'Smith', 'Williams', 'Johnson', 'Taylor', 'Davis', 'Wilson',
    'Anderson', 'White', 'Harris', 'Martin', 'Clark', 'Lewis', 'Walker', 'Hall',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
    'Lin', 'Huang', 'Chang', 'Wu', 'Baker', 'Nelson', 'Adams', 'Campbell'
  ];

  /**
   * 生成單一位半導體工程師候選人
   */
  public static generateSingleCandidate(foundryTier: number, index = 0): Candidate {
    const specialties: StaffSpecialty[] = ['PIE', 'LITHO', 'TRACK', 'FILM', 'ETCH', 'DIFF', 'CMP'];
    const first = this.FIRST_NAMES[Math.floor(Math.random() * this.FIRST_NAMES.length)];
    const last = this.LAST_NAMES[Math.floor(Math.random() * this.LAST_NAMES.length)];
    const spec = specialties[Math.floor(Math.random() * specialties.length)];

    let rank: StaffRank = 'Young Specialist';
    let signingBonus = 20_000;
    let salary = 45_000;
    let waitingSec = 180; // 候選人媒合等待 180 秒
    let description = spec === 'PIE'
      ? '跨站點製程整合專才，指派訂單可加速工步 +8%，保障交貨良率 +3%'
      : '專精基礎機台操作，磨損累積 -10%，微影 k1 -0.01。適合操作 Tier 1~2。';

    const roll = Math.random();
    if (foundryTier >= 5 && roll > 0.65) {
      rank = 'Fellow';
      signingBonus = 500_000;
      salary = 350_000;
      waitingSec = 90; // 頂尖權威媒合搶手，僅等待 90 秒
      description = spec === 'PIE'
        ? '世界級晶圓製程整合權威泰斗，指派訂單可加速工步 +40%，保障交貨良率 +16%！'
        : '頂級半導體物理泰斗，磨損累積 -80%，微影 k1 -0.06，良率 +15%，可抵銷先進製程視窗損失！';
    } else if (foundryTier >= 3 && roll > 0.45) {
      rank = 'Senior Engineer';
      signingBonus = 120_000;
      salary = 150_000;
      waitingSec = 120; // 120 秒
      description = spec === 'PIE'
        ? '多年製程整合資深主管，指派訂單可加速工步 +25%，保障交貨良率 +10%'
        : '多年產線調機權威，磨損累積 -50%，微影 k1 -0.04，良率 +10%。適合操作 Tier 3~5。';
    } else if (foundryTier >= 2 && roll > 0.3) {
      rank = 'Skilled Worker';
      signingBonus = 50_000;
      salary = 75_000;
      waitingSec = 150; // 150 秒
      description = spec === 'PIE'
        ? '專任製程整合工程師，指派訂單可加速工步 +15%，保障交貨良率 +6%'
        : '熟練製程技師，磨損累積 -25%，微影 k1 -0.02，良率 +5%。適合操作 Tier 1~3。';
    }

    return {
      id: `CAN-${Date.now().toString(36).slice(-4)}-${index}-${Math.floor(Math.random() * 999)}`,
      name: `${first} ${last}`,
      rank,
      moduleSpecialty: spec,
      signingBonus,
      salary,
      description,
      marketExpiresAt: Date.now() + waitingSec * 1000
    };
  }

  /**
   * 生成滿員 (6 位) 人才市場候選人
   */
  public static generateMarketCandidates(foundryTier: number, count = this.MAX_MARKET_CANDIDATES): Candidate[] {
    const list: Candidate[] = [];
    for (let i = 0; i < count; i++) {
      list.push(this.generateSingleCandidate(foundryTier, i));
    }
    return list;
  }

  /**
   * 檢查人才市場媒合時效與冷卻補齊：
   * 1. 逾期候選人轉往其他晶圓廠，自動更換
   * 2. 空缺名額每 60 秒逐位補滿 6 位
   */
  public static checkMarketCandidatesExpiry(state: SaveGameV2): boolean {
    if (!state.marketCandidates) {
      state.marketCandidates = this.generateMarketCandidates(state.player.foundryTier);
      state.nextCandidateRespawnTime = 0;
      return true;
    }

    const now = Date.now();
    let hasChanges = false;

    // 1. 檢查每位候選人等待時效
    for (let i = 0; i < state.marketCandidates.length; i++) {
      const candidate = state.marketCandidates[i];
      if (!candidate.marketExpiresAt) {
        candidate.marketExpiresAt = now + 120_000;
        continue;
      }

      if (now >= candidate.marketExpiresAt) {
        // 該候選人已被其他企業聘請，替換為全新履歷
        state.marketCandidates[i] = this.generateSingleCandidate(state.player.foundryTier, i);
        hasChanges = true;
      }
    }

    // 2. 逐筆冷卻補齊名額至 6 人
    if (state.marketCandidates.length < this.MAX_MARKET_CANDIDATES) {
      if (!state.nextCandidateRespawnTime || state.nextCandidateRespawnTime <= 0) {
        state.nextCandidateRespawnTime = now + this.REPLENISH_COOLDOWN_MS;
        hasChanges = true;
      } else if (now >= state.nextCandidateRespawnTime) {
        state.marketCandidates.push(this.generateSingleCandidate(state.player.foundryTier, state.marketCandidates.length));
        if (state.marketCandidates.length < this.MAX_MARKET_CANDIDATES) {
          state.nextCandidateRespawnTime = now + this.REPLENISH_COOLDOWN_MS;
        } else {
          state.nextCandidateRespawnTime = 0;
        }
        hasChanges = true;
      }
    }

    return hasChanges;
  }

  /**
   * 付費高階獵人頭顧問刷新全部 6 位候選人
   */
  public static forceRefreshAllCandidates(state: SaveGameV2): void {
    state.marketCandidates = this.generateMarketCandidates(state.player.foundryTier, this.MAX_MARKET_CANDIDATES);
    state.nextCandidateRespawnTime = 0;
  }

  /**
   * 判定當前現實世界或日曆是否為週末 (週六或週日)
   */
  public static isWeekend(): boolean {
    const dayOfWeek = new Date().getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
  }

  /**
   * 套用全廠排班制度
   */
  public static applyShiftMode(state: SaveGameV2, mode: ShiftMode): void {
    for (const s of state.staff) {
      s.shiftMode = mode;
    }

    if (mode === 'WEEKEND_REST') {
      // 若是週末，立刻排休；若平日，按三班均衡分派
      if (this.isWeekend()) {
        for (const s of state.staff) s.workShift = 'OFF';
      } else {
        const shifts: WorkShift[] = ['DAY', 'SWING', 'NIGHT'];
        state.staff.forEach((s, idx) => {
          s.workShift = shifts[idx % 3];
        });
      }
    } else if (mode === 'TWO_ON_TWO_OFF') {
      // 四班二輪：做二休二
      state.staff.forEach((s, idx) => {
        s.workShift = (idx % 2 === 0) ? 'DAY' : 'OFF';
      });
    } else if (mode === 'TWO_SHIFT') {
      state.staff.forEach((s, idx) => {
        s.workShift = (idx % 2 === 0) ? 'DAY' : 'SWING';
      });
    } else if (mode === 'THREE_SHIFT') {
      const shifts: WorkShift[] = ['DAY', 'SWING', 'NIGHT'];
      state.staff.forEach((s, idx) => {
        s.workShift = shifts[idx % 3];
      });
    }
  }
}
