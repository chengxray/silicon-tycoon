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
  OrderData,
  UserProfileMeta
} from '../types';
import { MaintenanceEngine } from '../engine/MaintenanceEngine';
import { AchievementEngine } from '../engine/AchievementEngine';
import { ProductionEngine } from '../engine/ProductionEngine';
import { FinanceEngine } from '../engine/FinanceEngine';
import { EconomyEngine } from '../engine/EconomyEngine';

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
    const defaultSave: SaveGameV2 = {
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
        unlockedCleanroomClass: 'Class 10000',
        totalOrdersFulfilled: 0,
        totalWafersDelivered: 0,
        rdInvestedCash: 0,
        tutorialCompleted: false
      },
      unlockedFeatures: {
        cmp: false,
        agv: false,
        oht: false,
        shrOht: false,
        mesAutoDispatch: false, // 完成新手教學後解鎖
        mixAndMatchLitho: false
      },
      facility: {
        cleanroomPhase: 1, // Phase 1 (10x10)
        bayGridSize: { width: 10, height: 10 },
        yellowRoomTiles: [
          { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 },
          { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 },
          { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }
        ]
      },
      machines: [
        {
          id: 'mach_film_1',
          modelId: 'film_furnace',
          name: '熱氧化爐 (Thermal Oxidation)',
          category: 'FILM',
          tier: 1,
          gridX: 1,
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
          gridX: 4,
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
          gridX: 6,
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
          gridX: 6,
          gridY: 6,
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
          gridY: 6,
          wear: 0,
          status: 'IDLE',
          assignedEngineerId: null
        }
      ],
      staff: [
        {
          id: 'staff_1',
          name: 'Alex Miller',
          rank: 'Skilled Worker',
          moduleSpecialty: 'LITHO',
          fatigue: 10,
          shiftMode: 'THREE_SHIFT',
          workShift: 'DAY',
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
      gameTime: 0,
      financialState: FinanceEngine.initFinancialState(50_000_000, 70_000_000),
      marketOrders: EconomyEngine.generateContractBoard(1, null, 0),
      nextOrderRespawnTime: 0
    };

    ProductionEngine.updateMachineNames(defaultSave.machines);
    return defaultSave;
  }

  public static readonly REGISTRY_KEY = 'SILICON_TYCOON_USERS_REGISTRY';
  public static readonly ACTIVE_USER_ID_KEY = 'SILICON_TYCOON_ACTIVE_USER_ID';

  /**
   * 取得所有使用者存檔列表 (若不存在則從現有存檔或預設創立並遷移)
   */
  public static getUserProfiles(): UserProfileMeta[] {
    try {
      const raw = localStorage.getItem(this.REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('讀取使用者目錄失敗:', e);
    }

    return this.initializeDefaultProfile();
  }

  /**
   * 初始化第一個預設玩家存檔
   */
  private static initializeDefaultProfile(): UserProfileMeta[] {
    const rawV2 = localStorage.getItem(this.STORAGE_KEY_V2);
    let ceoName = '張創辦人';
    let companyName = '矽島先進半導體';
    let tier = 1;
    let cash = 50_000_000;
    let createdAt = Date.now();

    if (rawV2) {
      try {
        const parsed = JSON.parse(rawV2);
        if (parsed.player) {
          ceoName = parsed.player.ceoName || ceoName;
          companyName = parsed.player.companyName || companyName;
          tier = parsed.player.foundryTier || tier;
          cash = parsed.player.cash || cash;
          createdAt = parsed.savedAt || createdAt;
        }
      } catch (_) {}
    }

    const defaultProfile: UserProfileMeta = {
      id: 'usr_default',
      name: ceoName,
      companyName: companyName,
      foundryTier: tier,
      cash: cash,
      createdAt: createdAt,
      lastPlayedAt: Date.now(),
      storageKey: this.STORAGE_KEY_V2
    };

    const list = [defaultProfile];
    try {
      localStorage.setItem(this.REGISTRY_KEY, JSON.stringify(list));
      localStorage.setItem(this.ACTIVE_USER_ID_KEY, defaultProfile.id);
    } catch (_) {}

    return list;
  }

  /**
   * 取得當前活躍使用者
   */
  public static getActiveUserProfile(): UserProfileMeta {
    const profiles = this.getUserProfiles();
    const activeId = localStorage.getItem(this.ACTIVE_USER_ID_KEY);
    const found = profiles.find(p => p.id === activeId);
    if (found) return found;

    const first = profiles[0] || this.initializeDefaultProfile()[0];
    localStorage.setItem(this.ACTIVE_USER_ID_KEY, first.id);
    return first;
  }

  /**
   * 創建新使用者 (Plants vs. Zombies 1 風格)
   */
  public static createUser(name: string, companyName?: string): UserProfileMeta {
    const cleanName = name.trim() || `執行長 ${Math.floor(Math.random() * 900 + 100)}`;
    const cleanCompany = companyName?.trim() || `${cleanName}半導體`;
    const newId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const storageKey = `SILICON_TYCOON_SAVE_${newId}`;

    const newProfile: UserProfileMeta = {
      id: newId,
      name: cleanName,
      companyName: cleanCompany,
      foundryTier: 1,
      cash: 50_000_000,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      storageKey: storageKey
    };

    // 建立全新開局存檔並寫入其專屬 storageKey
    const newSave = this.createDefaultSave(cleanCompany, cleanName);
    newSave.userId = newId;
    localStorage.setItem(storageKey, JSON.stringify(newSave));

    // 更新註冊表
    const profiles = this.getUserProfiles();
    profiles.push(newProfile);
    localStorage.setItem(this.REGISTRY_KEY, JSON.stringify(profiles));
    localStorage.setItem(this.ACTIVE_USER_ID_KEY, newId);

    return newProfile;
  }

  /**
   * 重新命名使用者
   */
  public static renameUser(userId: string, newName: string): boolean {
    const cleanName = newName.trim();
    if (!cleanName) return false;

    const profiles = this.getUserProfiles();
    const profile = profiles.find(p => p.id === userId);
    if (!profile) return false;

    profile.name = cleanName;
    localStorage.setItem(this.REGISTRY_KEY, JSON.stringify(profiles));

    // 同步修改存檔內的 ceoName
    const saveRaw = localStorage.getItem(profile.storageKey);
    if (saveRaw) {
      try {
        const parsed = JSON.parse(saveRaw);
        if (parsed.player) {
          parsed.player.ceoName = cleanName;
          localStorage.setItem(profile.storageKey, JSON.stringify(parsed));
        }
      } catch (_) {}
    }

    return true;
  }

  /**
   * 刪除使用者存檔
   */
  public static deleteUser(userId: string): { success: boolean; message?: string } {
    const profiles = this.getUserProfiles();
    if (profiles.length <= 1) {
      return { success: false, message: '至少需要保留一個玩家存檔，無法全部刪除！' };
    }

    const idx = profiles.findIndex(p => p.id === userId);
    if (idx === -1) return { success: false, message: '找不到該玩家存檔！' };

    const target = profiles[idx];
    localStorage.removeItem(target.storageKey);
    profiles.splice(idx, 1);
    localStorage.setItem(this.REGISTRY_KEY, JSON.stringify(profiles));

    // 若刪除的是當前玩家，切換至剩餘的第一位
    const activeId = localStorage.getItem(this.ACTIVE_USER_ID_KEY);
    if (activeId === userId) {
      localStorage.setItem(this.ACTIVE_USER_ID_KEY, profiles[0].id);
    }

    return { success: true };
  }

  /**
   * 切換活躍使用者並載入該存檔
   */
  public static switchActiveUser(userId: string): SaveGameV2 | null {
    const profiles = this.getUserProfiles();
    const profile = profiles.find(p => p.id === userId);
    if (!profile) return null;

    localStorage.setItem(this.ACTIVE_USER_ID_KEY, userId);
    return this.loadFromLocalStorage();
  }

  /**
   * 整機重置：徹底清除本裝置上的所有玩家帳號、存檔、教學進度與快取
   */
  public static factoryResetAllData(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.toLowerCase().startsWith('silicon_tycoon'))) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('清空存檔時發生例外:', e);
      localStorage.clear();
    }
  }

  /**
   * 寫入 LocalStorage (支援多玩家獨立存檔空間)
   */
  public static saveToLocalStorage(state: SaveGameV2): boolean {
    try {
      state.savedAt = Date.now();
      state.lastOnlineTimestamp = Date.now();
      const activeUser = this.getActiveUserProfile();
      const key = (state.userId && state.userId === activeUser.id)
        ? activeUser.storageKey
        : (activeUser.storageKey || this.STORAGE_KEY_V2);

      const json = JSON.stringify(state);
      localStorage.setItem(key, json);

      // 同步更新註冊表中的基本資訊
      const profiles = this.getUserProfiles();
      const p = profiles.find(pr => pr.id === activeUser.id);
      if (p) {
        p.cash = state.player.cash;
        p.foundryTier = state.player.foundryTier;
        p.companyName = state.player.companyName;
        p.name = state.player.ceoName;
        p.lastPlayedAt = Date.now();
        localStorage.setItem(this.REGISTRY_KEY, JSON.stringify(profiles));
      }

      return true;
    } catch (err) {
      console.error('LocalStorage 存檔失敗:', err);
      return false;
    }
  }

  /**
   * 從 LocalStorage 載入當前活躍使用者的存檔 (自動檢查 V2 與向後相容 V1 遷移)
   */
  public static loadFromLocalStorage(): SaveGameV2 | null {
    try {
      const activeUser = this.getActiveUserProfile();
      let raw = localStorage.getItem(activeUser.storageKey);

      // 若 activeUser.storageKey 未讀到且 activeUser 是 default，退回 STORAGE_KEY_V2
      if (!raw && activeUser.id === 'usr_default') {
        raw = localStorage.getItem(this.STORAGE_KEY_V2);
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.schemaVersion === 2) {
          if (parsed.staff) {
            parsed.staff = this.normalizeStaffData(parsed.staff);
          }
          if (!parsed.facility) {
            parsed.facility = { cleanroomPhase: 1, bayGridSize: { width: 10, height: 10 } };
          }
          if (!parsed.facility.yellowRoomTiles || parsed.facility.yellowRoomTiles.length === 0) {
            parsed.facility.yellowRoomTiles = [
              { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 },
              { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 },
              { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }
            ];
          }
          if (!parsed.facility.bayGridSize || parsed.facility.bayGridSize.width < 10) {
            parsed.facility.bayGridSize = { width: 10, height: 10 };
          }
          parsed.userId = activeUser.id;
          parsed.financialState = FinanceEngine.ensureFinancialState(parsed);
          if (parsed.player) {
            if (parsed.player.totalOrdersFulfilled === undefined) parsed.player.totalOrdersFulfilled = 0;
            if (parsed.player.totalWafersDelivered === undefined) parsed.player.totalWafersDelivered = 0;
            if (parsed.player.rdInvestedCash === undefined) parsed.player.rdInvestedCash = 0;
          }
          if (parsed.machines) {
            ProductionEngine.updateMachineNames(parsed.machines);
          }
          if (parsed.rollingYieldHistory && parsed.rollingYieldHistory.length > 0) {
            // 若先前的存檔歷史卡在全是 1.0 (受先前未結算良率 bug 影響)，重置為逼真動態良率
            if (parsed.rollingYieldHistory.every((y: number) => y >= 0.999)) {
              parsed.rollingYieldHistory = [0.918, 0.935, 0.902, 0.927, 0.921];
            }
          }
          if (parsed.marketOrders) {
            const now = Date.now();
            for (const ord of parsed.marketOrders) {
              if (!ord.allowedDurationSec) {
                ord.allowedDurationSec = EconomyEngine.getAllowedDurationSec(ord);
              }
              if (!ord.marketExpiresAt || ord.marketExpiresAt <= now) {
                const waitMs = (ord.urgencyMultiplier || 1.0) >= 1.5 ? 45_000 : ((ord.urgencyMultiplier || 1.0) >= 1.2 ? 70_000 : 100_000);
                ord.marketExpiresAt = now + waitMs;
              }
            }
          }
          if (parsed.activeOrders) {
            for (const ord of parsed.activeOrders) {
              if (!ord.allowedDurationSec) {
                ord.allowedDurationSec = EconomyEngine.getAllowedDurationSec(ord);
              }
              // 若曾因 0 秒 bug 導致在製訂單 deadlineGameTime 過期且尚未交付完畢，自動給予合理補償時限
              if (ord.deadlineGameTime <= (parsed.gameTime || 0) && ord.goodDiesDelivered < ord.totalDies) {
                ord.deadlineGameTime = (parsed.gameTime || 0) + ord.allowedDurationSec;
              }
            }
          }
          EconomyEngine.ensureMarketOrders(parsed as SaveGameV2);
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
          migrated.userId = activeUser.id;
          migrated.financialState = FinanceEngine.ensureFinancialState(migrated);
          this.saveToLocalStorage(migrated);
          return migrated;
        }
      }

      // 若沒有任何存檔，建立初始預設存檔
      const initialSave = this.createDefaultSave(activeUser.companyName, activeUser.name);
      initialSave.userId = activeUser.id;
      this.saveToLocalStorage(initialSave);
      return initialSave;
    } catch (err) {
      console.error('LocalStorage 讀檔失敗:', err);
      return null;
    }
  }

  private static readonly ENGLISH_FIRST_NAMES = [
    'Alex', 'David', 'Sarah', 'Kevin', 'Emily', 'Michael', 'Jessica', 'James', 
    'Daniel', 'Rachel', 'Robert', 'Brian', 'Olivia', 'William', 'Sophia', 'Thomas'
  ];
  private static readonly ENGLISH_LAST_NAMES = [
    'Miller', 'Chen', 'Smith', 'Williams', 'Johnson', 'Taylor', 'Davis', 'Wilson',
    'Anderson', 'White', 'Harris', 'Martin', 'Clark', 'Lewis', 'Walker', 'Hall'
  ];

  /**
   * 確保員工姓名為國際通用英文名，並自動補齊預設輪班班別
   */
  public static normalizeStaffData(staffList: StaffData[]): StaffData[] {
    return staffList.map((s, idx) => {
      const hasChinese = /[\u4e00-\u9fa5]/.test(s.name);
      let name = s.name;
      if (hasChinese || !name) {
        const first = this.ENGLISH_FIRST_NAMES[idx % this.ENGLISH_FIRST_NAMES.length];
        const last = this.ENGLISH_LAST_NAMES[idx % this.ENGLISH_LAST_NAMES.length];
        name = `${first} ${last}`;
      }
      return {
        ...s,
        name,
        workShift: s.workShift || (idx % 3 === 0 ? 'DAY' : idx % 3 === 1 ? 'SWING' : 'NIGHT')
      };
    });
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
        cleanroomPhase: v1.facility?.cleanroomPhase ?? 1,
        bayGridSize: { width: 10, height: 10 },
        yellowRoomTiles: [
          { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 },
          { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 },
          { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }
        ]
      },
      machines: upgradedMachines,
      staff: this.normalizeStaffData(v1.staff ?? []),
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
