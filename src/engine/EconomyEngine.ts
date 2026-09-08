/**
 * EconomyEngine.ts
 * 負責合約訂單經濟模型、NRE 光罩預付款、出貨結算、債務保護與薪資水電優先權
 */

import { OrderData, PlayerProfile, StaffData } from '../types';

export interface NodePricingSpec {
  nodeNm: number;
  basePrice: number; // NT$ / 合格晶粒
  baseNRE: number; // NT$ / 層
  minTier: number;
}

export class EconomyEngine {
  // 製程節點基礎單價 (BasePrice) 與光罩款 (BaseNRE) 官方權威表
  public static readonly PRICING_TABLE: NodePricingSpec[] = [
    { nodeNm: 10000, basePrice: 2, baseNRE: 80_000, minTier: 1 },
    { nodeNm: 3000, basePrice: 4, baseNRE: 180_000, minTier: 1 },
    { nodeNm: 1000, basePrice: 6, baseNRE: 400_000, minTier: 2 },
    { nodeNm: 350, basePrice: 10, baseNRE: 900_000, minTier: 3 },
    { nodeNm: 180, basePrice: 18, baseNRE: 2_000_000, minTier: 3 },
    { nodeNm: 90, basePrice: 40, baseNRE: 5_500_000, minTier: 4 },
    { nodeNm: 45, basePrice: 80, baseNRE: 15_000_000, minTier: 4 },
    { nodeNm: 28, basePrice: 200, baseNRE: 45_000_000, minTier: 5 },
    { nodeNm: 7, basePrice: 600, baseNRE: 160_000_000, minTier: 6 },
    { nodeNm: 2, basePrice: 1500, baseNRE: 450_000_000, minTier: 6 }
  ];

  /**
   * 取得指定節點之定價規格
   */
  public static getNodeSpec(nodeNm: number): NodePricingSpec {
    // 尋找小於等於且最接近之節點
    const found = this.PRICING_TABLE.slice().reverse().find(s => nodeNm <= s.nodeNm);
    return found || this.PRICING_TABLE[0];
  }

  /**
   * 計算接單時客戶全額預付的 NRE 光罩款
   * NRE = BaseNRE(nodeNm) * layerCount * urgencyMultiplier
   */
  public static calculateUpfrontNRE(
    nodeNm: number,
    layerCount: number,
    urgencyMultiplier: number = 1.0
  ): number {
    const spec = this.getNodeSpec(nodeNm);
    return Math.round(spec.baseNRE * layerCount * urgencyMultiplier);
  }

  /**
   * 依據 1.9 節規範計算客戶信任乘數 (TrustMultiplier)
   * TrustMultiplier = 0.70 + (RollingYieldIndex * 0.50)
   * 初局無紀錄時為 1.0；最低保底 0.75，理論封頂約 1.20
   */
  public static calculateTrustMultiplier(rollingYieldIndex: number | null): number {
    if (rollingYieldIndex === null || isNaN(rollingYieldIndex)) {
      return 1.0; // 開局初始狀態為 N/A，給予中性 1.0
    }
    const trust = 0.70 + (rollingYieldIndex * 0.50);
    return Math.max(0.75, Math.min(1.25, Number(trust.toFixed(3))));
  }

  /**
   * 計算最終出貨單價 (NT$ / 合格晶粒)
   */
  public static calculateUnitPrice(
    nodeNm: number,
    layerCount: number,
    urgencyMultiplier: number,
    trustMultiplier: number
  ): number {
    const spec = this.getNodeSpec(nodeNm);
    const layerMultiplier = 1.0 + (layerCount - 1) * 0.08; // 每多一層 +8% 價值
    const unitPrice = spec.basePrice * layerMultiplier * urgencyMultiplier * trustMultiplier;
    return Number(unitPrice.toFixed(2));
  }

  /**
   * 訂單完工出貨結算尾款
   * 出貨款 = GoodDieCount * 最終單價 - 逾期違約金
   * 同時處理債務清償（嚴格保證：薪水水電優先於債務抵扣！）
   */
  public static settleOrderPayout(
    order: OrderData,
    goodDieCount: number,
    player: PlayerProfile,
    allStaff: StaffData[],
    overduePenalty: number = 0,
    currentDebt: number = 0
  ): {
    grossPayout: number;
    netPayout: number;
    debtDeducted: number;
    remainingDebt: number;
  } {
    const grossPayout = Math.max(0, Math.round(goodDieCount * order.unitPrice - overduePenalty));
    let debtDeducted = 0;
    let remainingDebt = currentDebt;

    if (remainingDebt > 0 && grossPayout > 0) {
      // 1. 計算下期員工薪資儲備底線（薪水水電絕對優先於債務！）
      const totalStaffSalaries = allStaff.reduce((sum, s) => sum + s.salary, 0);
      const safeReserve = totalStaffSalaries * 1.5; // 確保有 1.5 倍薪資儲備

      const availableCashAfterPayout = player.cash + grossPayout;
      if (availableCashAfterPayout > safeReserve) {
        // 可動用盈餘：超出安全儲備金的金額
        const surplus = availableCashAfterPayout - safeReserve;
        // 最高提撥當筆盈餘的 25% 抵扣債務
        const maxRepay = Math.min(surplus * 0.25, grossPayout * 0.25);
        debtDeducted = Math.min(remainingDebt, Math.round(maxRepay));
        remainingDebt -= debtDeducted;
      }
    }

    const netPayout = grossPayout - debtDeducted;

    return {
      grossPayout,
      netPayout,
      debtDeducted,
      remainingDebt
    };
  }

  /**
   * 逾期階梯式 NRE 追討與債務保護機制
   */
  public static calculateOverdueClawback(
    order: OrderData,
    gameTime: number,
    isFinalStationAndNearComplete: boolean = false
  ): {
    clawbackRatio: number;
    clawbackAmount: number;
    isCancelled: boolean;
  } {
    const overdueSeconds = gameTime - order.deadlineGameTime;
    if (overdueSeconds <= 0) {
      return { clawbackRatio: 0, clawbackAmount: 0, isCancelled: false };
    }

    // 末站完成度 > 80% 之 24 小時寬限期保護
    if (isFinalStationAndNearComplete && overdueSeconds <= 86400) {
      // 寬限期內僅套用小額違約金，不觸發全額沒收
      return {
        clawbackRatio: 0.10,
        clawbackAmount: Math.round(order.nrePaid * 0.10),
        isCancelled: false
      };
    }

    // 1~8 遊戲小時 (1h = 3600s, 8h = 28800s): 追討 30%
    if (overdueSeconds <= 28800) {
      return {
        clawbackRatio: 0.30,
        clawbackAmount: Math.round(order.nrePaid * 0.30),
        isCancelled: false
      };
    }

    // 8~24 遊戲小時 (24h = 86400s): 追討 70%
    if (overdueSeconds <= 86400) {
      return {
        clawbackRatio: 0.70,
        clawbackAmount: Math.round(order.nrePaid * 0.70),
        isCancelled: false
      };
    }

    // 逾期 > 24 遊戲小時：訂單作廢，追討 100%
    return {
      clawbackRatio: 1.0,
      clawbackAmount: order.nrePaid,
      isCancelled: true
    };
  }

  /**
   * 生成適合當前 FoundryTier 的 6 張合約訂單池
   */
  public static generateContractBoard(
    foundryTier: number,
    rollingYieldIndex: number | null,
    currentGameTime: number
  ): OrderData[] {
    const orders: OrderData[] = [];
    const clientNames = [
      '聯發通訊', '蘋果核心', '輝達智能', '高通晶創',
      '超微運算', '台積晶心', '瑞昱音訊', '博通網通'
    ];

    // 依據玩家世代篩選可承接之製程節點
    const availableSpecs = this.PRICING_TABLE.filter(s => s.minTier <= foundryTier);
    const trustMultiplier = this.calculateTrustMultiplier(rollingYieldIndex);

    for (let i = 0; i < 6; i++) {
      const spec = availableSpecs[Math.floor(Math.random() * availableSpecs.length)];
      const client = clientNames[(i + Math.floor(Math.random() * 5)) % clientNames.length];
      
      // 層數：低階 3~5 層，高階 10~25 層
      const minLayers = spec.minTier <= 2 ? 3 : 5;
      const maxLayers = spec.minTier <= 2 ? 5 : (spec.minTier <= 4 ? 12 : 24);
      const layerCount = Math.floor(Math.random() * (maxLayers - minLayers + 1)) + minLayers;

      // 晶粒總數與晶圓片數
      const waferCount = [3, 5, 10, 25][Math.floor(Math.random() * 4)];
      const diesPerWafer = spec.nodeNm >= 1000 ? 500 : 2000;
      const totalDies = waferCount * diesPerWafer;

      // 急迫度 (1.0 常規, 1.2 急件, 1.5 SHR 超急件)
      const urgencyPool = [1.0, 1.0, 1.0, 1.2, 1.5];
      const urgencyMultiplier = urgencyPool[Math.floor(Math.random() * urgencyPool.length)];

      const nrePaid = this.calculateUpfrontNRE(spec.nodeNm, layerCount, urgencyMultiplier);
      const unitPrice = this.calculateUnitPrice(spec.nodeNm, layerCount, urgencyMultiplier, trustMultiplier);
      
      // 截止時間：依層數與急迫度計算
      const secondsPerLayer = 30; // 基礎每層 30 秒
      const allowedTime = Math.round((layerCount * secondsPerLayer * waferCount * 0.8) / urgencyMultiplier + 180);
      const deadlineGameTime = currentGameTime + allowedTime;

      orders.push({
        id: `ORD-${Date.now().toString(36).toUpperCase()}-${i}`,
        clientName: client,
        nodeNm: spec.nodeNm,
        layerCount,
        totalDies,
        goodDiesDelivered: 0,
        nrePaid,
        unitPrice,
        urgencyMultiplier,
        deadlineGameTime,
        status: 'ACTIVE'
      });
    }

    return orders;
  }
}
