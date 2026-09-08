/**
 * SaveGameService.ts
 * 負責 LocalStorage 每 10 秒自動存檔、匯出/匯入 JSON，
 * SaveGameV1 至 SaveGameV2 平滑遷移，以及 24 小時離線掛機抽樣結算 (含 🛡️ TPM 零故障豁免)
 */

import {
  SaveGameV1,
  SaveGameV2,
  MachineData,
  StaffData,
  OrderData
} from '../types';
import { MaintenanceEngine } from '../engine/MaintenanceEngine';
import { AchievementEngine } from '../engine/AchievementEngine';

export interface OfflineReport {
  offlineDurationSeconds: number;
  lotsProcessed: number;
  wafersDelivered: number;
  revenueEarned: number;
  salaryPaid: number;
  utilityPaid: number;
  maintenanceExpense: number;
  debtRepaid: number;
  breakdownCount: number;
  explosionCount: number;
  tpmProtectedCount: number;
  netProfit: number;
}

export class SaveGameService {
  public static readonly STORAGE_KEY_V2 = 'SILICON_TYCOON_SAVE_V2';
  public static readonly STORAGE_KEY_V1 = 'SILICON_TYCOON_SAVE_V1';

  /**
   * 取得初始開局預設存檔 (SaveGameV2)
   */
  public static createDefaultSave(companyName = '矽島先進半導體', ceoName = '張創辦人', avatarId = 'avatar_1'): SaveGameV2 {
    const now = Date.now();
    return {
      schemaVersion: 2,
      savedAt: now,
      lastOnlineTimestamp: now,
      player: {
        companyName,
        ceoName,
        avatarId,
        cash: 50_000_000, // 開局資金 NT$ 5,000 萬
        foundryTier: 1,
        popularity: 100,
        unlockedK1: 'BASE',
        unlockedCleanroomClass: 'Class 10000'
      },
      unlockedFeatures: {
        cmp: false,
        agv: false,
        oht: false,
        mesAutoDispatch: false, // 完成新手教學後解鎖
        mixAndMatchLitho: false
      },
      facility: {
        cleanroomPhase: 1, // Phase 1 (8x8)
        bayGridSize: { width: 8, height: 8 }
      },
      machines: [
        {
          id: 'mach_film_1',
          modelId: 'film_furnace',
          name: '熱氧化爐 (Thermal Oxidation)',
          category: 'FILM',
          tier: 1,
          gridX: 2,
          gridY: 2,
          wear: 0,
          status: 'IDLE',
          assignedEngineerId: null
        },
        {
          id: 'mach_track_1',
          modelId: 'track_clean',
          name: '手動旋塗熱板台 (Manual Track)',
          category: 'TRACK',
          tier: 1,
          gridX: 3,
          gridY: 2,
          wear: 0,
          status: 'IDLE',
          assignedEngineerId: null
        },
        {
          id: 'mach_litho_1',
          modelId: 'litho_contact',
          name: '接觸式微影機 (Contact Aligner)',
          category: 'LITHO',
          tier: 1,
          gridX: 4,
          gridY: 2,
          wear: 0,
          status: 'IDLE',
          assignedEngineerId: 'staff_1',
          pairedTrackIds: ['mach_track_1']
        },
        {
          id: 'mach_etch_1',
          modelId: 'etch_plasma',
          name: '電漿乾式蝕刻機 (Dry Plasma Etcher)',
          category: 'ETCH',
          tier: 1,
          gridX: 3,
          gridY: 4,
          wear: 0,
          status: 'IDLE',
          assignedEngineerId: null
        },
        {
          id: 'mach_diff_1',
          modelId: 'diff_furnace',
          name: '擴散退火爐 (Diffusion Furnace)',
          category: 'DIFF',
          tier: 1,
          gridX: 2,
          gridY: 4,
          wear: 0,
          status: 'IDLE',
          assignedEngineerId: null
        }
      ],
      staff: [
        {
          id: 'staff_1',
          name: '林資深',
          rank: 'Skilled Worker',
          moduleSpecialty: 'LITHO',
          fatigue: 10,
          shiftMode: 'THREE_SHIFT',
          assignedMachineId: 'mach_litho_1',
          salary: 60_000
        }
      ],
      activeOrders: [],
      activeLots: [],
      rollingYieldHistory: [],
      clawbackDebt: 0,
      questState: {
        lastDateStr: new Date().toISOString().split('T')[0],
        dailyQuests: [],
        allDailyClaimed: false,
        weeklyCompletedCount: 0,
        weeklyTarget: 15,
        weeklyClaimed: false
      },
      achievements: AchievementEngine.getInitialAchievements(),
      gameTime: 0
    };
  }

  /**
   * 寫入 LocalStorage
   */
  public static saveToLocalStorage(state: SaveGameV2): boolean {
    try {
      state.savedAt = Date.now();
      state.lastOnlineTimestamp = Date.now();
      const json = JSON.stringify(state);
      localStorage.setItem(this.STORAGE_KEY_V2, json);
      return true;
    } catch (err) {
      console.error('LocalStorage 存檔失敗:', err);
      return false;
    }
  }

  /**
   * 從 LocalStorage 載入存檔 (自動檢查 V2 與向後相容 V1 遷移)
   */
  public static loadFromLocalStorage(): SaveGameV2 | null {
    try {
      const rawV2 = localStorage.getItem(this.STORAGE_KEY_V2);
      if (rawV2) {
        const parsed = JSON.parse(rawV2);
        if (parsed.schemaVersion === 2) {
          return parsed as SaveGameV2;
        }
      }

      // 嘗試讀取舊版 V1 存檔並自動遷移
      const rawV1 = localStorage.getItem(this.STORAGE_KEY_V1);
      if (rawV1) {
        const parsedV1 = JSON.parse(rawV1);
        if (parsedV1.schemaVersion === 1) {
          console.warn('偵測到舊版 SaveGameV1 存檔，執行自動升級至 SaveGameV2...');
          const migrated = this.migrateSaveV1toV2(parsedV1 as SaveGameV1);
          this.saveToLocalStorage(migrated);
          return migrated;
        }
      }

      return null;
    } catch (err) {
      console.error('LocalStorage 讀檔失敗:', err);
      return null;
    }
  }

  /**
   * 將 SaveGameV1 完整遷移至 SaveGameV2 (向後相容保證)
   */
  public static migrateSaveV1toV2(v1: SaveGameV1): SaveGameV2 {
    const todayStr = new Date().toISOString().split('T')[0];

    // 補齊機台 pairedTrackIds
    const upgradedMachines: MachineData[] = v1.machines.map((m) => {
      const upgraded: MachineData = {
        ...m,
        pairedTrackIds: m.category === 'LITHO' ? [] : undefined
      };
      return upgraded;
    });

    // 補齊訂單 layerAllocations
    const upgradedOrders: OrderData[] = v1.activeOrders.map((o) => {
      const upgraded: OrderData = {
        ...o,
        urgencyMultiplier: (o as any).urgencyMultiplier ?? 1.0,
        layerAllocations: []
      };
      return upgraded;
    });

    return {
      schemaVersion: 2,
      savedAt: v1.savedAt ?? Date.now(),
      lastOnlineTimestamp: v1.lastOnlineTimestamp ?? Date.now(),
      player: {
        ...v1.player
      },
      unlockedFeatures: {
        cmp: v1.unlockedFeatures.cmp ?? false,
        agv: v1.unlockedFeatures.agv ?? false,
        oht: v1.unlockedFeatures.oht ?? false,
        mesAutoDispatch: v1.unlockedFeatures.mesAutoDispatch ?? false,
        mixAndMatchLitho: false // V2 新增旗標
      },
      facility: {
        cleanroomPhase: v1.facility.cleanroomPhase ?? 1,
        bayGridSize: v1.facility.bayGridSize ?? { width: 8, height: 8 }
      },
      machines: upgradedMachines,
      staff: v1.staff ?? [],
      activeOrders: upgradedOrders,
      activeLots: v1.activeLots ?? [],
      rollingYieldHistory: v1.rollingYieldHistory ?? [],
      clawbackDebt: v1.clawbackDebt ?? 0,
      questState: {
        lastDateStr: todayStr,
        dailyQuests: [],
        allDailyClaimed: false,
        weeklyCompletedCount: 0,
        weeklyTarget: 15,
        weeklyClaimed: false
      },
      achievements: AchievementEngine.getInitialAchievements(),
      gameTime: v1.gameTime ?? 0
    };
  }

  /**
   * 匯出存檔為 JSON 檔案字串
   */
  public static exportSaveToJson(state: SaveGameV2): string {
    return JSON.stringify(state, null, 2);
  }

  /**
   * 匯入 JSON 字串轉換為 SaveGameV2
   */
  public static importSaveFromJson(jsonStr: string): { success: boolean; state?: SaveGameV2; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.schemaVersion === 2) {
        return { success: true, state: parsed as SaveGameV2 };
      } else if (parsed.schemaVersion === 1) {
        const migrated = this.migrateSaveV1toV2(parsed as SaveGameV1);
        return { success: true, state: migrated };
      }
      return { success: false, error: '不相容的存檔格式版本！' };
    } catch (err: any) {
      return { success: false, error: `JSON 解析失敗: ${err.message}` };
    }
  }

  /**
   * 離線掛機模擬結算 (最高採計 4 小時，以 5 分鐘步長評估蒙地卡羅風險與 🛡️ TPM 24H 零故障豁免)
   */
  public static calculateOfflineProgress(state: SaveGameV2, currentTimestamp: number): OfflineReport {
    const elapsedSec = Math.max(0, Math.floor((currentTimestamp - state.lastOnlineTimestamp) / 1000));
    // 限制離線最大 4 小時 (14,400 秒)
    const simulatedSec = Math.min(14400, elapsedSec);

    const report: OfflineReport = {
      offlineDurationSeconds: simulatedSec,
      lotsProcessed: 0,
      wafersDelivered: 0,
      revenueEarned: 0,
      salaryPaid: 0,
      utilityPaid: 0,
      maintenanceExpense: 0,
      debtRepaid: 0,
      breakdownCount: 0,
      explosionCount: 0,
      tpmProtectedCount: 0,
      netProfit: 0
    };

    if (simulatedSec < 60) {
      return report;
    }

    const fiveMinSteps = Math.floor(simulatedSec / 300);
    const staffMap = new Map<string, StaffData>(state.staff.map((s) => [s.id, s]));

    // 1. 檢查每台機台的 TPM 與故障機率
    let tpmSafeMachinesCount = 0;
    for (const machine of state.machines) {
      const engineer = machine.assignedEngineerId ? staffMap.get(machine.assignedEngineerId) : null;
      const tpmCheck = MaintenanceEngine.checkTPMConditions(machine, engineer);

      if (tpmCheck.isTPMActive) {
        // 🛡️ TPM 零故障在線維護保障！磨損壓制在 <= 5%，故障率嚴格為 0%！
        tpmSafeMachinesCount++;
        machine.wear = Math.min(5, machine.wear);
        machine.status = 'IDLE';
      } else {
        // 非 TPM 機台：每 5 分鐘累加磨損
        const wearDelta = fiveMinSteps * 0.4;
        machine.wear = Math.min(100, machine.wear + wearDelta);

        // 離線故障抽樣
        if (machine.wear >= 60 && Math.random() < 0.3) {
          report.breakdownCount++;

          // 炸機風險校驗
          const rankCheck = MaintenanceEngine.checkExplosionRisk(machine, engineer);
          if (rankCheck.hasRisk && Math.random() < 0.25) {
            report.explosionCount++;
            report.maintenanceExpense += 200_000 * machine.tier;
            machine.status = 'EXPLODED';
          } else {
            report.maintenanceExpense += 50_000 * machine.tier;
            machine.status = 'MAINTENANCE';
          }
        }
      }
    }
    report.tpmProtectedCount = tpmSafeMachinesCount;

    // 2. 薪資與水電結算 (每小時扣除一次)
    const simulatedHours = simulatedSec / 3600;
    const totalHourlySalary = state.staff.reduce((acc, s) => acc + s.salary, 0) / 720; // 月薪換算為遊戲小時
    const totalHourlyUtility = (state.machines.length * 15_000) / 720;

    report.salaryPaid = Math.round(totalHourlySalary * simulatedHours);
    report.utilityPaid = Math.round(totalHourlyUtility * simulatedHours);

    // 3. 自動派工 (MES) 離線產能出貨結算 (若有開啟 MES 自動派工且產線未炸裂)
    if (state.unlockedFeatures.mesAutoDispatch && state.activeOrders.length > 0) {
      const activeOrder = state.activeOrders.find((o) => o.status === 'ACTIVE');
      if (activeOrder && report.explosionCount === 0) {
        // 每 3 分鐘完成 1 個批次 (25 片)
        const possibleLots = Math.min(Math.floor(simulatedSec / 180), 10);
        if (possibleLots > 0) {
          report.lotsProcessed = possibleLots;
          const deliveredWafers = possibleLots * 5;
          report.wafersDelivered = deliveredWafers;
          const revenue = Math.round(deliveredWafers * 100 * activeOrder.unitPrice);
          report.revenueEarned = revenue;

          // 良率紀錄推入
          for (let i = 0; i < possibleLots; i++) {
            state.rollingYieldHistory.push(0.92);
          }
        }
      }
    }

    // 4. 償債優先權檢核：薪資水電優先保障，剩餘盈餘才提撥 25% 抵扣追討債務
    const grossIncome = report.revenueEarned;
    const fixedExpenses = report.salaryPaid + report.utilityPaid + report.maintenanceExpense;
    const grossSurplus = grossIncome - fixedExpenses;

    if (grossSurplus > 0 && state.clawbackDebt > 0) {
      const maxRepay = Math.min(state.clawbackDebt, Math.round(grossSurplus * 0.25));
      report.debtRepaid = maxRepay;
      state.clawbackDebt -= maxRepay;
    }

    report.netProfit = grossIncome - fixedExpenses - report.debtRepaid;

    // 更新玩家現金與遊戲時間
    state.player.cash = Math.max(0, state.player.cash + report.netProfit);
    state.gameTime += simulatedSec;
    state.lastOnlineTimestamp = currentTimestamp;
    state.savedAt = currentTimestamp;

    return report;
  }
}
