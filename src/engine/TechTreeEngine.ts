/**
 * TechTreeEngine.ts
 * 負責半導體製程科技樹 (Tech Tree) 與晶圓廠世代晉升 (Tier Progression) 核心邏輯：
 * 1. 定義 6 大半導體歷史演進世代 (Tier 1 微米級 ~ Tier 6 埃米 High-NA EUV)
 * 2. 檢驗三維進階門檻：累積出貨訂單數、累計完工晶圓數、研發資本撥款注資
 * 3. 處理研發注資與世代突破升級 (晉升 Foundry Tier、解鎖商城機台與無塵室 Class)
 */

import { SaveGameV2 } from '../types';
import { FinanceEngine } from './FinanceEngine';
import { AchievementEngine } from './AchievementEngine';

export interface TechTierConfig {
  tier: number;
  name: string;
  subtitle: string;
  eraCode: string;
  minCDNm: number;
  unlockedCleanroomClass: string;
  description: string;
  scienceHistory: string;
  reqOrders: number;
  reqWafers: number;
  reqResearchFunds: number;
  unlockedModelIds: string[];
  unlockedFeatureKeys?: ('cmp' | 'mesAutoDispatch' | 'mixAndMatchLitho' | 'agv' | 'oht')[];
}

export interface TierProgressStatus {
  currentTier: number;
  maxTier: number;
  isMaxTier: boolean;
  nextTierConfig: TechTierConfig | null;
  ordersCompleted: number;
  ordersTarget: number;
  ordersMet: boolean;
  ordersPct: number;
  wafersDelivered: number;
  wafersTarget: number;
  wafersMet: boolean;
  wafersPct: number;
  fundsInvested: number;
  fundsTarget: number;
  fundsMet: boolean;
  fundsPct: number;
  canAdvance: boolean;
  overallPct: number;
}

export class TechTreeEngine {
  public static readonly MAX_TIER = 6;

  public static readonly TIER_CONFIGS: Record<number, TechTierConfig> = {
    1: {
      tier: 1,
      name: '微米微影啟蒙時代',
      subtitle: '5µm ~ 3µm 微米成熟製程',
      eraCode: 'ERA_1_MICRON',
      minCDNm: 3000,
      unlockedCleanroomClass: 'Class 10,000',
      description: '半導體萌芽初創期，以接觸式與等倍投影曝光為核心，邁出晶圓製造的第一步。',
      scienceHistory: '使用汞燈紫外光混光與手工旋塗光阻，光罩物理貼合或反射鏡投影，極限線寬約 3 微米。',
      reqOrders: 0,
      reqWafers: 0,
      reqResearchFunds: 0,
      unlockedModelIds: ['litho_contact', 'litho_projection', 'track_manual', 'film_evap', 'film_sputter', 'etch_wet_barrel', 'diff_box', 'diff_tube_manual']
    },
    2: {
      tier: 2,
      name: '亞微米步進縮小時代',
      subtitle: '1.2µm ~ 800nm (G-Line 436nm)',
      eraCode: 'ERA_2_SUBMICRON',
      minCDNm: 800,
      unlockedCleanroomClass: 'Class 1,000',
      description: '引入 4:1 縮小透鏡與步進曝光技術，晶圓製造邁入百萬顆電晶體之 1 微米世代。',
      scienceHistory: '採用高壓汞燈 g-line (436nm) 搭配光學鏡頭群，突破接觸式光罩刮傷瓶頸，全面提升良率。',
      reqOrders: 3,
      reqWafers: 100,
      reqResearchFunds: 15_000_000,
      unlockedModelIds: ['litho_gline', 'track_single', 'film_pecvd', 'etch_rie', 'diff_auto_horiz']
    },
    3: {
      tier: 3,
      name: '次微米紫外深耕時代',
      subtitle: '500nm ~ 350nm (I-Line & CMP)',
      eraCode: 'ERA_3_DEEPUV_STEP',
      minCDNm: 350,
      unlockedCleanroomClass: 'Class 100',
      description: '推進至 i-line 紫外光，雙軌 Track 連線作業，並解鎖化學機械研磨 (CMP) 平坦化神技。',
      scienceHistory: '採用 365nm i-line 高強度紫外光搭配 NA=0.50 鏡頭，CMP 平坦化技術解決多層金屬互連景深問題。',
      reqOrders: 8,
      reqWafers: 350,
      reqResearchFunds: 50_000_000,
      unlockedModelIds: ['litho_iline', 'track_dual', 'film_hdp_cvd', 'etch_merie', 'diff_vertical', 'cmp_manual', 'cmp_standard'],
      unlockedFeatureKeys: ['cmp']
    },
    4: {
      tier: 4,
      name: '深紫外 DUV 跨越時代',
      subtitle: '250nm ~ 90nm (KrF/ArF & MES 自動化)',
      eraCode: 'ERA_4_DUV_EXCIMER',
      minCDNm: 90,
      unlockedCleanroomClass: 'Class 10',
      description: '準分子雷射掃描曝光與化學增幅型光阻 (CAR)，產線導入 MES 智慧派工無人化管理。',
      scienceHistory: '248nm KrF 與 193nm ArF 準分子雷射結合動態掃描 (Step-and-Scan)，大幅擴大曝光視場與精準度。',
      reqOrders: 18,
      reqWafers: 1_000,
      reqResearchFunds: 180_000_000,
      unlockedModelIds: ['litho_krf', 'litho_arfdry', 'track_clean', 'film_ald_thermal', 'etch_icp_advanced', 'diff_lpcvd_rapid', 'cmp_auto'],
      unlockedFeatureKeys: ['mesAutoDispatch']
    },
    5: {
      tier: 5,
      name: '浸潤式微影顛峰時代',
      subtitle: '65nm ~ 7nm (ArFi 193nm 水折射)',
      eraCode: 'ERA_5_IMMERSION_PEAK',
      minCDNm: 7,
      unlockedCleanroomClass: 'Class 1',
      description: '林本堅博士浸潤式水折射微影革命，搭配雙工件台磁浮掃描與多重曝光 (SAQP)，極限微縮至 7nm。',
      scienceHistory: '鏡頭與晶圓間注入超純水 (n=1.44)，將等效 NA 推升至 1.35，打破物理極限，領先全球晶圓代工市場。',
      reqOrders: 35,
      reqWafers: 3_000,
      reqResearchFunds: 600_000_000,
      unlockedModelIds: ['litho_arfi', 'film_ald_plasma', 'etch_ale_atomic', 'diff_rtp_laser', 'cmp_atomic'],
      unlockedFeatureKeys: ['mixAndMatchLitho']
    },
    6: {
      tier: 6,
      name: '埃米 EUV 矽島霸權時代',
      subtitle: '5nm ~ 2nm 以下 (High-NA EUV 埃米時代)',
      eraCode: 'ERA_6_HIGH_NA_EUV',
      minCDNm: 2,
      unlockedCleanroomClass: 'Class 1 (ISO 3)',
      description: '13.5nm 極紫外光與 0.55 NA 變形鏡頭次世代巨獸，單次曝光推進 2nm，傲視全球的半導體科技霸主！',
      scienceHistory: '以二氧化碳雷射高頻擊打錫滴激發電漿產生 13.5nm 極紫外光，全機超高真空運行，登頂世界半導體工業之巔。',
      reqOrders: 60,
      reqWafers: 8_000,
      reqResearchFunds: 2_500_000_000,
      unlockedModelIds: ['litho_euv', 'litho_highna', 'track_advanced']
    }
  };

  /**
   * 取得指定世代詳細配置
   */
  public static getTierConfig(tier: number): TechTierConfig {
    return this.TIER_CONFIGS[tier] || this.TIER_CONFIGS[1];
  }

  /**
   * 取得當前研發突破進度狀態
   */
  public static getProgressionStatus(state: SaveGameV2): TierProgressStatus {
    const currentTier = state.player.foundryTier || 1;
    const isMaxTier = currentTier >= this.MAX_TIER;
    const nextTier = currentTier + 1;
    const nextConfig = isMaxTier ? null : this.getTierConfig(nextTier);

    const ordersCompleted = state.player.totalOrdersFulfilled || 0;
    const wafersDelivered = state.player.totalWafersDelivered || 0;
    const fundsInvested = state.player.rdInvestedCash || 0;

    if (isMaxTier || !nextConfig) {
      return {
        currentTier,
        maxTier: this.MAX_TIER,
        isMaxTier: true,
        nextTierConfig: null,
        ordersCompleted,
        ordersTarget: ordersCompleted,
        ordersMet: true,
        ordersPct: 100,
        wafersDelivered,
        wafersTarget: wafersDelivered,
        wafersMet: true,
        wafersPct: 100,
        fundsInvested,
        fundsTarget: fundsInvested,
        fundsMet: true,
        fundsPct: 100,
        canAdvance: false,
        overallPct: 100
      };
    }

    const ordersTarget = nextConfig.reqOrders;
    const wafersTarget = nextConfig.reqWafers;
    const fundsTarget = nextConfig.reqResearchFunds;

    const ordersMet = ordersCompleted >= ordersTarget;
    const wafersMet = wafersDelivered >= wafersTarget;
    const fundsMet = fundsInvested >= fundsTarget;

    const ordersPct = Math.min(100, Math.round((ordersCompleted / Math.max(1, ordersTarget)) * 100));
    const wafersPct = Math.min(100, Math.round((wafersDelivered / Math.max(1, wafersTarget)) * 100));
    const fundsPct = Math.min(100, Math.round((fundsInvested / Math.max(1, fundsTarget)) * 100));

    const overallPct = Math.round((ordersPct + wafersPct + fundsPct) / 3);
    const canAdvance = ordersMet && wafersMet && fundsMet;

    return {
      currentTier,
      maxTier: this.MAX_TIER,
      isMaxTier: false,
      nextTierConfig: nextConfig,
      ordersCompleted,
      ordersTarget,
      ordersMet,
      ordersPct,
      wafersDelivered,
      wafersTarget,
      wafersMet,
      wafersPct,
      fundsInvested,
      fundsTarget,
      fundsMet,
      fundsPct,
      canAdvance,
      overallPct
    };
  }

  /**
   * 撥款注資研發資金 (Invest R&D Capital)
   */
  public static investRDCapital(state: SaveGameV2, amount: number): { success: boolean; invested: number; message: string } {
    const status = this.getProgressionStatus(state);
    if (status.isMaxTier || !status.nextTierConfig) {
      return { success: false, invested: 0, message: '晶圓廠已達最高科技世代，無需再注資！' };
    }

    const remainingNeeded = status.fundsTarget - status.fundsInvested;
    if (remainingNeeded <= 0) {
      return { success: false, invested: 0, message: '本世代研發資金已全數募足，請達成代工訂單與晶圓量產目標以晉升！' };
    }

    // 實際可撥款金額（受帳戶現有資金與需求上限限制）
    const actualInvest = Math.max(0, Math.min(amount, remainingNeeded, state.player.cash));
    if (actualInvest <= 0) {
      return { success: false, invested: 0, message: '廠房資金不足，無法撥款注資！' };
    }

    // 扣除現金
    state.player.cash -= actualInvest;
    state.player.rdInvestedCash = (state.player.rdInvestedCash || 0) + actualInvest;

    // 記錄至財務系統 (資本支出/研發費用)
    FinanceEngine.recordCapEx(state, actualInvest);

    return {
      success: true,
      invested: actualInvest,
      message: `成功撥款注資 NT$ ${actualInvest.toLocaleString()} 注入次世代製程研發！`
    };
  }

  /**
   * 突破世代！正式晉升 Foundry Tier
   */
  public static advanceFoundryTier(state: SaveGameV2): { success: boolean; newTier: number; message: string } {
    const status = this.getProgressionStatus(state);
    if (status.isMaxTier || !status.nextTierConfig) {
      return { success: false, newTier: state.player.foundryTier, message: '已達最高科技世代！' };
    }

    if (!status.canAdvance) {
      const missing: string[] = [];
      if (!status.ordersMet) missing.push(`還需交付 ${status.ordersTarget - status.ordersCompleted} 筆訂單`);
      if (!status.wafersMet) missing.push(`還需生產 ${status.wafersTarget - status.wafersDelivered} 片晶圓`);
      if (!status.fundsMet) missing.push(`還需研發注資 NT$ ${(status.fundsTarget - status.fundsInvested).toLocaleString()}`);
      return { success: false, newTier: state.player.foundryTier, message: `尚未達成晉升條件：${missing.join('、')}` };
    }

    const newTier = status.nextTierConfig.tier;
    state.player.foundryTier = newTier;
    state.player.rdInvestedCash = 0; // 重置下一世代的研發注資額
    state.player.popularity = Math.min(100, state.player.popularity + 5);

    // 解鎖特定無塵室等級
    if (status.nextTierConfig.unlockedCleanroomClass) {
      state.player.unlockedCleanroomClass = status.nextTierConfig.unlockedCleanroomClass;
    }

    // 解鎖進階功能
    if (status.nextTierConfig.unlockedFeatureKeys) {
      for (const key of status.nextTierConfig.unlockedFeatureKeys) {
        (state.unlockedFeatures as any)[key] = true;
      }
    }

    // 檢核成就
    AchievementEngine.checkAchievements(state);

    return {
      success: true,
      newTier,
      message: `🎉 狂賀！製程微縮重大突破！晶圓廠成功晉升至【Tier ${newTier} ${status.nextTierConfig.name}】！已解鎖次世代機台採購與合約！`
    };
  }
}
