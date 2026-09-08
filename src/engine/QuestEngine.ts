/**
 * QuestEngine.ts
 * 負責每日 3 項適應世代任務生成、進度即時監聽、每日全勤特獎 (3/3) 與每週 15 任務大獎結算
 */

import { DailyQuest, QuestState, PlayerProfile, UnlockedFeatures } from '../types';

export class QuestEngine {
  /**
   * 初始化或刷新每日任務 (根據當前真實日期字串與玩家 FoundryTier 自適應生成)
   */
  public static refreshDailyQuests(
    currentState: QuestState,
    player: PlayerProfile,
    features: UnlockedFeatures,
    currentDateStr: string
  ): QuestState {
    // 若當天已生成過，直接保留現狀
    if (currentState.lastDateStr === currentDateStr && currentState.dailyQuests.length === 3) {
      return currentState;
    }

    const tier = player.foundryTier;
    const baseRewardCash = [0, 60_000, 180_000, 450_000, 1_200_000, 3_500_000, 12_000_000][tier] ?? 60_000;

    // 任務庫 pool 根據 tier 篩選
    const quests: DailyQuest[] = [];

    // Quest 1: 生產出貨類
    const targetWafers = tier === 1 ? 5 : tier === 2 ? 15 : tier === 3 ? 30 : tier === 4 ? 60 : 100;
    quests.push({
      id: `quest_produce_${currentDateStr}`,
      title: '穩定投片交付產出',
      description: `完成出貨累計 ${targetWafers} 片合格晶圓至客戶端。`,
      tier,
      currentValue: 0,
      targetValue: targetWafers,
      rewardCash: baseRewardCash,
      rewardPopularity: 3,
      completed: false,
      claimed: false
    });

    // Quest 2: 品質良率與維修類
    if (tier >= 3 && features.cmp) {
      quests.push({
        id: `quest_cmp_operation_${currentDateStr}`,
        title: '平坦化製程精進',
        description: '成功執行 5 次 CMP 化學機械平坦化拋光研磨。',
        tier,
        currentValue: 0,
        targetValue: 5,
        rewardCash: Math.round(baseRewardCash * 1.2),
        rewardPopularity: 4,
        completed: false,
        claimed: false
      });
    } else {
      quests.push({
        id: `quest_maintain_fab_${currentDateStr}`,
        title: '廠務設備巡檢維護',
        description: '指派工程師對機台進行保養或維持機台健康度在 90% 以上。',
        tier,
        currentValue: 0,
        targetValue: 2,
        rewardCash: baseRewardCash,
        rewardPopularity: 3,
        completed: false,
        claimed: false
      });
    }

    // Quest 3: 營收合約類
    const targetOrders = tier <= 2 ? 2 : 3;
    quests.push({
      id: `quest_order_fulfill_${currentDateStr}`,
      title: '光罩合約履約達成',
      description: `順利交貨並履約 ${targetOrders} 筆晶圓製造合約，取得全額尾款。`,
      tier,
      currentValue: 0,
      targetValue: targetOrders,
      rewardCash: Math.round(baseRewardCash * 1.5),
      rewardPopularity: 5,
      completed: false,
      claimed: false
    });

    return {
      lastDateStr: currentDateStr,
      dailyQuests: quests,
      allDailyClaimed: false,
      weeklyCompletedCount: currentState.weeklyCompletedCount ?? 0,
      weeklyTarget: 15,
      weeklyClaimed: currentState.weeklyClaimed ?? false
    };
  }

  /**
   * 推進出貨晶圓片數進度
   */
  public static onWaferDelivered(state: QuestState, deliveredCount: number): void {
    for (const q of state.dailyQuests) {
      if (q.id.startsWith('quest_produce') && !q.completed) {
        q.currentValue += deliveredCount;
        if (q.currentValue >= q.targetValue) {
          q.currentValue = q.targetValue;
          q.completed = true;
        }
      }
    }
  }

  /**
   * 推進訂單履約進度
   */
  public static onOrderFulfilled(state: QuestState): void {
    for (const q of state.dailyQuests) {
      if (q.id.startsWith('quest_order_fulfill') && !q.completed) {
        q.currentValue += 1;
        if (q.currentValue >= q.targetValue) {
          q.currentValue = q.targetValue;
          q.completed = true;
        }
      }
    }
  }

  /**
   * 推進機台保養進度
   */
  public static onMachineMaintained(state: QuestState): void {
    for (const q of state.dailyQuests) {
      if (q.id.startsWith('quest_maintain_fab') && !q.completed) {
        q.currentValue += 1;
        if (q.currentValue >= q.targetValue) {
          q.currentValue = q.targetValue;
          q.completed = true;
        }
      }
    }
  }

  /**
   * 推進 CMP 加工進度
   */
  public static onCmpProcessed(state: QuestState): void {
    for (const q of state.dailyQuests) {
      if (q.id.startsWith('quest_cmp_operation') && !q.completed) {
        q.currentValue += 1;
        if (q.currentValue >= q.targetValue) {
          q.currentValue = q.targetValue;
          q.completed = true;
        }
      }
    }
  }

  /**
   * 檢查當日 3 個任務是否皆已達成 (3/3 全勤)
   */
  public static isAllDailyCompleted(state: QuestState): boolean {
    if (state.dailyQuests.length !== 3) return false;
    return state.dailyQuests.every((q) => q.completed);
  }

  /**
   * 領取單項每日任務獎勵
   */
  public static claimSingleQuest(
    state: QuestState,
    questId: string
  ): { success: boolean; cash: number; popularity: number; message: string } {
    const quest = state.dailyQuests.find((q) => q.id === questId);
    if (!quest) {
      return { success: false, cash: 0, popularity: 0, message: '找不到該任務' };
    }
    if (!quest.completed) {
      return { success: false, cash: 0, popularity: 0, message: '該任務尚未達成目標' };
    }
    if (quest.claimed) {
      return { success: false, cash: 0, popularity: 0, message: '該任務獎勵已領取' };
    }

    quest.claimed = true;
    return {
      success: true,
      cash: quest.rewardCash,
      popularity: quest.rewardPopularity,
      message: `領取成功！獲得獎勵金 NT$ ${quest.rewardCash.toLocaleString()} 與商譽 +${quest.rewardPopularity}！`
    };
  }

  /**
   * 領取每日全勤特獎 (3/3 全勤大禮包)
   * 每週計數器 +3，發放豐厚全勤津貼
   */
  public static claimDailyAllClear(
    state: QuestState,
    tier: number
  ): { success: boolean; cash: number; popularity: number; message: string } {
    if (!this.isAllDailyCompleted(state)) {
      return { success: false, cash: 0, popularity: 0, message: '尚有每日任務未完成，無法領取全勤特獎' };
    }
    if (state.allDailyClaimed) {
      return { success: false, cash: 0, popularity: 0, message: '今日全勤特獎已經領取過囉' };
    }

    state.allDailyClaimed = true;
    state.weeklyCompletedCount = Math.min(21, (state.weeklyCompletedCount ?? 0) + 3);

    const bonusCash = [0, 150_000, 450_000, 1_200_000, 3_000_000, 8_000_000, 25_000_000][tier] ?? 150_000;
    const bonusPopularity = 10;

    return {
      success: true,
      cash: bonusCash,
      popularity: bonusPopularity,
      message: `🎉 達成今日 3/3 全勤！獲得全勤特獎 NT$ ${bonusCash.toLocaleString()}、商譽 +${bonusPopularity}，每週任務進度累計 +3！`
    };
  }

  /**
   * 領取每週 15 任務龍頭週大獎 (Weekly Mega Bounty)
   */
  public static claimWeeklyBounty(
    state: QuestState,
    tier: number
  ): { success: boolean; cash: number; popularity: number; message: string } {
    if (state.weeklyCompletedCount < state.weeklyTarget) {
      return {
        success: false,
        cash: 0,
        popularity: 0,
        message: `每週任務尚未達標！目前進度 ${state.weeklyCompletedCount}/${state.weeklyTarget}`
      };
    }
    if (state.weeklyClaimed) {
      return { success: false, cash: 0, popularity: 0, message: '本週龍頭週大獎已領取過囉' };
    }

    state.weeklyClaimed = true;
    const megaCash = [0, 1_000_000, 3_000_000, 8_000_000, 20_000_000, 60_000_000, 200_000_000][tier] ?? 1_000_000;
    const megaPopularity = 30;

    return {
      success: true,
      cash: megaCash,
      popularity: megaPopularity,
      message: `🏆 榮膺半導體龍頭週大獎！領取巨額扶持金 NT$ ${megaCash.toLocaleString()} 與商譽 +${megaPopularity}！全廠客戶信任度提升！`
    };
  }
}
