/**
 * AchievementEngine.ts
 * 負責 16 項半導體晶圓成就監聽、條件判定、獎勵領取與 HUD 釘選追蹤
 */

import { AchievementItem, SaveGameV2 } from '../types';
import { MaintenanceEngine } from './MaintenanceEngine';

export class AchievementEngine {
  /**
   * 16 項核心半導體成就預設清單
   */
  public static readonly INITIAL_ACHIEVEMENTS: AchievementItem[] = [
    // 1. 新手入門
    {
      id: 'first_silicon',
      category: 'onboarding',
      title: '矽島啟航 (First Silicon)',
      description: '成功在廠房內完成並產出第一批晶圓。',
      rewardCash: 50_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'step_into_yellow',
      category: 'onboarding',
      title: '邁入黃光密室 (Yellow Room Entry)',
      description: '首次完成微影站塗膠、曝光與顯影連線作業。',
      rewardCash: 80_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'first_cash',
      category: 'onboarding',
      title: '首桶金進帳 (First Cash Delivery)',
      description: '成功履約第一張客戶製造合約並取得全額尾款。',
      rewardCash: 100_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'mes_mastery',
      category: 'onboarding',
      title: '智慧製造大師 (MES Mastery)',
      description: '完成新手教學，解鎖並啟用 MES 智慧自動派工系統。',
      rewardCash: 150_000,
      unlocked: false,
      claimed: false
    },

    // 2. 製程突破
    {
      id: 'submicron_explorer',
      category: 'process',
      title: '突破次微米壁壘 (Sub-micron Explorer)',
      description: '成功承接並交付線寬 <= 350nm 之高階次微米訂單。',
      rewardCash: 500_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'copper_cmp_era',
      category: 'process',
      title: '銅導線與平坦化時代 (CMP Era)',
      description: '解鎖並在廠房內運作 CMP 化學機械平坦化拋光設備。',
      rewardCash: 1_000_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'immersion_wave',
      category: 'process',
      title: '水中折射奇蹟 (Immersion Wave)',
      description: '購買並安裝 Tier 5 ArFi 浸潤微影雙工件台設備 (TWINSCAN)。',
      rewardCash: 5_000_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'euv_domination',
      category: 'process',
      title: '極紫外神之光 (EUV Domination)',
      description: '購買並啟用極紫外光微影巨獸 (EUV Scanner)。',
      rewardCash: 20_000_000,
      unlocked: false,
      claimed: false
    },

    // 3. 廠務卓越
    {
      id: 'tpm_zero_defect',
      category: 'operation',
      title: '零非計畫停機殿堂 (TPM Zero-Defect)',
      description: '同時維持 3 台以上機台處於 🛡️ TPM 24H 零故障在線維護保障狀態。',
      rewardCash: 2_000_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'inline_cluster_master',
      category: 'operation',
      title: '雙軌並聯突破極限 (Inline Cluster Master)',
      description: '為微影機台並聯配套綁定 2 台以上 Track 塗膠顯影設備，消除產能瓶頸。',
      rewardCash: 1_500_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'gigafab_expansion',
      category: 'operation',
      title: 'GigaFab 超級晶圓廠 (GigaFab Expansion)',
      description: '將潔淨室無塵廠房拓建至 Phase 4 (24x24 巨型潔淨室)。',
      rewardCash: 10_000_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'automation_highway',
      category: 'operation',
      title: '自動化天軌物流 (Automation Highway)',
      description: '同時解鎖地面 AGV 自走車與天花板 OHT 懸吊天軌系統。',
      rewardCash: 3_000_000,
      unlocked: false,
      claimed: false
    },

    // 4. 品質良率
    {
      id: 'flawless_wafer',
      category: 'yield',
      title: '神級黃金良率 (Flawless Wafer 99%+)',
      description: '成功生產交付一批最終良率達 99% 以上的頂級晶圓。',
      rewardCash: 1_000_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'pie_guardian',
      category: 'yield',
      title: '製程整合守護神 (PIE Yield Guardian)',
      description: '為在製訂單指派專任製程整合工程師 (PIE)，並成功交付出廠一批晶圓。',
      rewardCash: 500_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'five_star_foundry',
      category: 'yield',
      title: '五星品質金字招牌 (Five-Star Foundry)',
      description: '累積至少 5 批出貨紀錄，且 RollingYieldIndex 滾動良率指數突破 95%！',
      rewardCash: 8_000_000,
      unlocked: false,
      claimed: false
    },
    {
      id: 'trillion_chip_dynasty',
      category: 'yield',
      title: '稱霸全球矽島霸權 (Silicon Hegemony)',
      description: '總現金累積突破 NT$ 100,000,000，建立無可撼動的半導體傳奇帝國。',
      rewardCash: 50_000_000,
      unlocked: false,
      claimed: false
    }
  ];

  /**
   * 取得初始成就清單
   */
  public static getInitialAchievements(): AchievementItem[] {
    return JSON.parse(JSON.stringify(this.INITIAL_ACHIEVEMENTS));
  }

  /**
   * 檢核存檔狀態，觸發成就解鎖
   */
  public static checkAchievements(save: SaveGameV2): { newlyUnlocked: AchievementItem[] } {
    const newlyUnlocked: AchievementItem[] = [];

    // 建立快取索引
    const achMap = new Map<string, AchievementItem>();
    for (const ach of save.achievements) {
      achMap.set(ach.id, ach);
    }

    const unlock = (id: string) => {
      const item = achMap.get(id);
      if (item && !item.unlocked) {
        item.unlocked = true;
        newlyUnlocked.push(item);
      }
    };

    // 1. first_silicon
    if (save.rollingYieldHistory.length >= 1) {
      unlock('first_silicon');
    }

    // 2. step_into_yellow
    const hasEnteredYellow = save.activeLots.some((l) => l.currentStation === 'LIT' || l.currentStation === 'ETCH' || l.currentStation === 'DIFF');
    if (hasEnteredYellow || save.rollingYieldHistory.length >= 1) {
      unlock('step_into_yellow');
    }

    // 3. first_cash
    const fulfilledOrders = save.activeOrders.filter((o) => o.status === 'FULFILLED');
    if (fulfilledOrders.length >= 1) {
      unlock('first_cash');
    }

    // 4. mes_mastery
    if (save.unlockedFeatures.mesAutoDispatch) {
      unlock('mes_mastery');
    }

    // 5. submicron_explorer
    if (fulfilledOrders.some((o) => o.nodeNm <= 350)) {
      unlock('submicron_explorer');
    }

    // 6. copper_cmp_era
    if (save.unlockedFeatures.cmp && save.machines.some((m) => m.category === 'CMP')) {
      unlock('copper_cmp_era');
    }

    // 7. immersion_wave
    if (save.machines.some((m) => m.modelId === 'litho_arfi')) {
      unlock('immersion_wave');
    }

    // 8. euv_domination
    if (save.machines.some((m) => m.modelId === 'litho_euv' || m.modelId === 'litho_highna')) {
      unlock('euv_domination');
    }

    // 9. tpm_zero_defect (至少 3 台處於 TPM 活躍)
    const staffMap = new Map(save.staff.map((s) => [s.id, s]));
    let tpmCount = 0;
    for (const m of save.machines) {
      const eng = m.assignedEngineerId ? staffMap.get(m.assignedEngineerId) : null;
      const tpmRes = MaintenanceEngine.checkTPMConditions(m, eng);
      if (tpmRes.isTPMActive) {
        tpmCount++;
      }
    }
    if (tpmCount >= 3) {
      unlock('tpm_zero_defect');
    }

    // 10. inline_cluster_master
    if (save.machines.some((m) => m.category === 'LITHO' && (m.pairedTrackIds?.length ?? 0) >= 2)) {
      unlock('inline_cluster_master');
    }

    // 11. gigafab_expansion
    if (save.facility.cleanroomPhase >= 4) {
      unlock('gigafab_expansion');
    }

    // 12. automation_highway
    if (save.unlockedFeatures.agv && save.unlockedFeatures.oht) {
      unlock('automation_highway');
    }

    // 13. flawless_wafer
    if (save.rollingYieldHistory.some((y) => y >= 0.99)) {
      unlock('flawless_wafer');
    }

    // 14. pie_guardian (成功交付至少一批有 PIE 指派的訂單)
    if (fulfilledOrders.some((o) => !!o.assignedPieId)) {
      unlock('pie_guardian');
    }

    // 15. five_star_foundry
    if (save.rollingYieldHistory.length >= 5) {
      const recent5 = save.rollingYieldHistory.slice(-5);
      const avg = recent5.reduce((sum, v) => sum + v, 0) / recent5.length;
      if (avg >= 0.95) {
        unlock('five_star_foundry');
      }
    }

    // 16. trillion_chip_dynasty
    if (save.player.cash >= 100_000_000) {
      unlock('trillion_chip_dynasty');
    }

    return { newlyUnlocked };
  }

  /**
   * 觸發特定動作解鎖成就 (如光阻重洗)
   */
  public static triggerManualUnlock(achievements: AchievementItem[], achievementId: string): boolean {
    const ach = achievements.find((a) => a.id === achievementId);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      return true;
    }
    return false;
  }

  /**
   * 領取成就獎勵
   */
  public static claimReward(
    achievements: AchievementItem[],
    achievementId: string
  ): { success: boolean; cash: number; message: string } {
    const ach = achievements.find((a) => a.id === achievementId);
    if (!ach) {
      return { success: false, cash: 0, message: '找不到該成就' };
    }
    if (!ach.unlocked) {
      return { success: false, cash: 0, message: '尚未達成該成就解鎖條件' };
    }
    if (ach.claimed) {
      return { success: false, cash: 0, message: '該成就獎勵已領取' };
    }

    ach.claimed = true;
    return {
      success: true,
      cash: ach.rewardCash,
      message: `🏆 成功領取成就【${ach.title}】獎勵！獲得獎勵金 NT$ ${ach.rewardCash.toLocaleString()}！`
    };
  }
}
