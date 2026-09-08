/**
 * MaintenanceEngine.ts
 * 負責機台磨損、MTTR、🛡️ TPM 24H 零非計畫性停機在線維護與炸機風險抽樣
 */

import { MachineData, StaffData, StaffRank } from '../types';

export class MaintenanceEngine {
  /**
   * 職級數值化權重
   */
  private static readonly RANK_WEIGHT: Record<StaffRank, number> = {
    'Young Specialist': 1,
    'Skilled Worker': 2,
    'Senior Engineer': 3,
    'Fellow': 4
  };

  /**
   * 取得機台世代最低要求的工程師職階權重
   * Tier 1~2: Young (1)
   * Tier 3~4: Skilled (2)
   * Tier 5: Senior (3)
   * Tier 6: Fellow (4)
   */
  public static getRequiredRankWeight(machineTier: number): number {
    if (machineTier <= 2) return 1;
    if (machineTier <= 4) return 2;
    if (machineTier === 5) return 3;
    return 4; // Tier 6 EUV 強制要求 Fellow
  }

  /**
   * 檢核是否達成「🛡️ TPM 24H 零故障在線維護」三大嚴格條件
   * 1. 專長完全符合 (Specialty Match)
   * 2. 職等資歷合規 (Rank Compliance)
   * 3. 疲勞永續健康 (Fatigue < 50 且採三班制)
   */
  public static checkTPMConditions(
    machine: MachineData,
    engineer?: StaffData | null
  ): {
    isTPMActive: boolean;
    reason: string;
  } {
    if (!engineer) {
      return { isTPMActive: false, reason: '未指派工程師進駐' };
    }

    // 1. 專長比對
    if (engineer.moduleSpecialty !== machine.category) {
      return {
        isTPMActive: false,
        reason: `專長不符！該機台為 ${machine.category}，工程師專精為 ${engineer.moduleSpecialty}`
      };
    }

    // 2. 職等門檻
    const requiredWeight = this.getRequiredRankWeight(machine.tier);
    const actualWeight = this.RANK_WEIGHT[engineer.rank];
    if (actualWeight < requiredWeight) {
      return {
        isTPMActive: false,
        reason: `職等不足！機台需等級 ${requiredWeight}，該工程師為 ${engineer.rank} (等級 ${actualWeight})`
      };
    }

    // 3. 疲勞與排班
    if (engineer.fatigue >= 50) {
      return {
        isTPMActive: false,
        reason: `工程師疲勞度過高 (${engineer.fatigue} >= 50)，在線預防保養中斷`
      };
    }

    if (engineer.shiftMode !== 'THREE_SHIFT') {
      return {
        isTPMActive: false,
        reason: '非三班輪調制（超時兩班制疲勞將持續爬升，無法達成 24H 永久零故障保障）'
      };
    }

    return {
      isTPMActive: true,
      reason: '🛡️ 滿足專長相符、資歷合規、三班輪調低疲勞，享有 24 小時不停機零故障保障！'
    };
  }

  /**
   * 檢核越級操作炸機風險：若指派之工程師職等比機台世代所需落後 >= 2 級，存在 25% 炸機風險
   */
  public static checkExplosionRisk(
    machine: MachineData,
    engineer?: StaffData | null
  ): { hasRisk: boolean; rankDiff: number } {
    if (!engineer) return { hasRisk: false, rankDiff: 0 };
    const requiredWeight = this.getRequiredRankWeight(machine.tier);
    const actualWeight = this.RANK_WEIGHT[engineer.rank];
    const diff = requiredWeight - actualWeight;
    return {
      hasRisk: diff >= 2,
      rankDiff: diff
    };
  }

  /**
   * 實時在線維護更新（每秒或每批晶圓呼叫）
   * 若符合 TPM，健康度鎖定在 95% 以上 (磨損 <= 5%)，故障率為 0%！
   */
  public static updateMachineHealth(
    machine: MachineData,
    engineer?: StaffData | null,
    deltaSeconds: number = 1
  ): {
    newWear: number;
    healthPercent: number;
    isTPMActive: boolean;
    breakdownOccurred: boolean;
    isExploded: boolean;
  } {
    const { isTPMActive } = this.checkTPMConditions(machine, engineer);

    if (isTPMActive) {
      // 🛡️ TPM 在線保養生效：不停機實時微調，磨損鎖死在 <= 5% (健康度 >= 95%)
      const newWear = Math.min(machine.wear, 5.0);
      const healthPercent = 100 - newWear;

      return {
        newWear,
        healthPercent,
        isTPMActive: true,
        breakdownOccurred: false, // 零故障保證！
        isExploded: false
      };
    }

    // 未受 TPM 保護：隨運轉累積磨損
    const wearRatePerSecond = 0.005; // 正常運轉磨損速率
    let newWear = Math.min(100, machine.wear + wearRatePerSecond * deltaSeconds);
    const healthPercent = 100 - newWear;

    // 抽籤判定是否故障
    // P_breakdown = (wear / 100)^2 * 0.05
    const breakdownProb = ((newWear / 100) ** 2) * 0.05 * (deltaSeconds / 60);
    const breakdownOccurred = Math.random() < breakdownProb;

    let isExploded = false;
    if (breakdownOccurred && engineer) {
      // 檢核越級操機炸機風險：若職階落後 >= 2 級，觸發 25% 炸機機率
      const requiredWeight = this.getRequiredRankWeight(machine.tier);
      const actualWeight = this.RANK_WEIGHT[engineer.rank];
      if (requiredWeight - actualWeight >= 2) {
        if (Math.random() < 0.25) {
          isExploded = true;
        }
      }
    }

    return {
      newWear: Number(newWear.toFixed(2)),
      healthPercent: Number(healthPercent.toFixed(2)),
      isTPMActive: false,
      breakdownOccurred,
      isExploded
    };
  }

  /**
   * 執行機台就地大修（Overhaul）
   * 磨損重設為 0%，費用為機台原價的 15%
   */
  public static calculateOverhaulCost(baseCost: number): number {
    return Math.round(baseCost * 0.15);
  }
}
