/**
 * ProductionEngine.ts
 * 負責晶圓批次站點流動 (Option B: FILM -> LIT [COAT -> EXPOSE -> DEVELOP] -> ETCH -> DIFF [-> CMP])、
 * Q-Time 物理時效判定、光阻重洗 (Rework)、工廠負荷百分比 (Workload %) 與智能瓶頸診斷歸因
 */

import {
  WaferLotData,
  MachineData,
  StationType,
  LitSubStep,
  OrderData,
  StaffData,
  UnlockedFeatures
} from '../types';
import { RayleighEngine } from './RayleighEngine';

export interface QTimeStatus {
  isOverdue: boolean;
  overdueSeconds: number;
  isFatal: boolean;
  canRework: boolean;
  reworkCost: number;
  penaltyYieldRatio: number;
  urgencyLevel: 'SAFE' | 'WARNING' | 'CRITICAL' | 'EXPIRED';
  remainingSeconds: number;
}

export interface BottleneckDiagnostic {
  category: 'CAPACITY' | 'LOGISTICS' | 'MAINTENANCE' | 'LAYOUT';
  title: string;
  stationName: string;
  description: string;
  recommendation: string;
  workloadPercent: number;
  chokePointThroughput: number;
}

export interface StationThroughputInfo {
  station: StationType | 'TRACK';
  totalCapacity: number;
  machineCount: number;
  isChokePoint: boolean;
}

export class ProductionEngine {
  /**
   * 基礎站點加工時間 (以遊戲秒為單位，常規 1x 下 1 遊戲秒 = 1 現實秒)
   */
  public static readonly BASE_STATION_DURATION_SEC: Record<StationType, number> = {
    FILM: 4,
    LIT: 6, // 內部包含 COAT(2s) -> EXPOSE(2s) -> DEVELOP(2s)
    ETCH: 4,
    DIFF: 5,
    CMP: 5
  };

  /**
   * LIT 站內部各子步驟基礎耗時
   */
  public static readonly LIT_SUBSTEP_DURATION_SEC: Record<LitSubStep, number> = {
    COAT: 2,
    EXPOSE: 2,
    DEVELOP: 2
  };

  /**
   * 各站點在不同機台世代 (Tier 1 ~ 6) 之基礎產能 (單位：晶圓/分)
   */
  public static readonly BASE_THROUGHPUT_BY_TIER: Record<
    StationType | 'TRACK',
    Record<number, number>
  > = {
    LIT: { 1: 10, 2: 25, 3: 55, 4: 120, 5: 260, 6: 180 }, // Tier 6 EUV 真空負載限制 180
    TRACK: { 1: 6, 2: 16, 3: 35, 4: 75, 5: 140, 6: 160 }, // Track 塗膠顯影為先天物理瓶頸
    FILM: { 1: 12, 2: 24, 3: 50, 4: 110, 5: 220, 6: 200 },
    ETCH: { 1: 12, 2: 24, 3: 50, 4: 110, 5: 220, 6: 200 },
    DIFF: { 1: 10, 2: 20, 3: 45, 4: 100, 5: 200, 6: 180 },
    CMP: { 1: 0, 2: 0, 3: 40, 4: 90, 5: 180, 6: 160 }
  };

  /**
   * 取得指定批次在當前世代或配方的有效站點順序 (Option B 規範)
   * Tiers 1-2 (無 CMP): FILM -> LIT -> ETCH -> DIFF
   * Tiers 3-6 (有 CMP): FILM -> LIT -> ETCH -> DIFF -> CMP
   */
  public static getStationSequence(hasCmpUnlocked: boolean): StationType[] {
    if (hasCmpUnlocked) {
      return ['FILM', 'LIT', 'ETCH', 'DIFF', 'CMP'];
    }
    return ['FILM', 'LIT', 'ETCH', 'DIFF'];
  }

  /**
   * 計算 Q-Time 物理窗口期限
   * @param fromStation 前一站點
   * @param toStation 下一站點
   * @param nodeNm 製程節點奈米數
   * @param cleanroomClass 潔淨室等級
   * @returns 基礎秒數 * 潔淨室加成 * 節點加成
   */
  public static calculateEffectiveQTimeSec(
    fromStation: StationType,
    toStation: StationType,
    nodeNm: number,
    cleanroomClass: string
  ): number {
    let baseWindowSec = 30; // 預設微影至蝕刻 30s
    if (fromStation === 'LIT' && toStation === 'ETCH') {
      baseWindowSec = 30;
    } else if (fromStation === 'ETCH' && toStation === 'DIFF') {
      baseWindowSec = 45;
    } else if (fromStation === 'CMP') {
      baseWindowSec = 35;
    }

    // 潔淨室加成係數
    let cleanroomModifier = 1.0;
    if (cleanroomClass.includes('1000') && !cleanroomClass.includes('10000')) {
      cleanroomModifier = 1.15;
    } else if (cleanroomClass.includes('100') && !cleanroomClass.includes('1000')) {
      cleanroomModifier = 1.3;
    } else if (cleanroomClass.includes('1') && !cleanroomClass.includes('10')) {
      cleanroomModifier = 1.5; // ISO 1 充氮環境延長 50%
    }

    // 製程節點敏銳度係數
    let nodeModifier = 1.0;
    if (nodeNm >= 1000) {
      nodeModifier = 1.5; // 粗線寬容錯高
    } else if (nodeNm <= 28) {
      nodeModifier = 0.8; // 先進節點窗口極限緊縮
    }

    return Math.round(baseWindowSec * cleanroomModifier * nodeModifier);
  }

  /**
   * 檢查並判定批次的 Q-Time 狀態
   */
  public static checkQTimeStatus(
    lot: WaferLotData,
    currentOrder: OrderData,
    currentGameTime: number
  ): QTimeStatus {
    if (!lot.qTimeDeadline) {
      return {
        isOverdue: false,
        overdueSeconds: 0,
        isFatal: false,
        canRework: false,
        reworkCost: 0,
        penaltyYieldRatio: 1.0,
        urgencyLevel: 'SAFE',
        remainingSeconds: 999
      };
    }

    const remainingSec = lot.qTimeDeadline - currentGameTime;

    if (remainingSec >= 0) {
      // 安全或警戒期
      let urgency: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';
      if (remainingSec <= 5) {
        urgency = 'CRITICAL';
      } else if (remainingSec <= 15) {
        urgency = 'WARNING';
      }
      return {
        isOverdue: false,
        overdueSeconds: 0,
        isFatal: false,
        canRework: false,
        reworkCost: 0,
        penaltyYieldRatio: 1.0,
        urgencyLevel: urgency,
        remainingSeconds: remainingSec
      };
    }

    // 逾期處理
    const overdueSec = Math.abs(remainingSec);
    const isLithoToEtch = lot.currentStation === 'ETCH' || (lot.currentStation === 'LIT' && lot.litSubStep === 'DEVELOP');

    // 計算重洗 (Rework) 費用：訂單該層預估單片價值的 5%
    const reworkCost = Math.round(currentOrder.unitPrice * (currentOrder.totalDies / Math.max(1, currentOrder.layerCount)) * 0.05 * (lot.waferCount / 25));

    if (overdueSec <= 15) {
      // 輕微延遲：良率懲罰扣減 35%
      return {
        isOverdue: true,
        overdueSeconds: overdueSec,
        isFatal: false,
        canRework: isLithoToEtch,
        reworkCost,
        penaltyYieldRatio: 0.65,
        urgencyLevel: 'EXPIRED',
        remainingSeconds: 0
      };
    }

    // 嚴重逾時 (> 15s)
    if (isLithoToEtch) {
      // 僅光阻變質，晶圓未受損：可選擇 Rework 或 Scrap
      return {
        isOverdue: true,
        overdueSeconds: overdueSec,
        isFatal: true,
        canRework: true,
        reworkCost,
        penaltyYieldRatio: 0.0,
        urgencyLevel: 'EXPIRED',
        remainingSeconds: 0
      };
    }

    // 蝕刻或擴散後不可逆損壞：強制報廢！
    return {
      isOverdue: true,
      overdueSeconds: overdueSec,
      isFatal: true,
      canRework: false,
      reworkCost: 0,
      penaltyYieldRatio: 0.0,
      urgencyLevel: 'EXPIRED',
      remainingSeconds: 0
    };
  }

  /**
   * 執行光阻重洗救命程序 (Rework Lot)
   * 耗費化學溶劑洗劑費，退回 LIT 站第一步 COAT 重新塗布曝光，拯救整批晶圓
   */
  public static executeReworkLot(lot: WaferLotData, reworkCost: number): { success: boolean; message: string } {
    lot.currentStation = 'LIT';
    lot.litSubStep = 'COAT';
    lot.qTimeDeadline = null;
    lot.status = 'PROCESSING';
    // 救回後良率保留 90%
    lot.yieldMultiplier = Math.max(0.85, lot.yieldMultiplier * 0.95);
    return {
      success: true,
      message: `成功救回批次 ${lot.lotId}！耗費溶劑費 NT$ ${reworkCost.toLocaleString()}，已退回黃光塗膠站重新加工。`
    };
  }

  /**
   * 推進晶圓批次至下一個製程站點或子步驟 (Option B 流動模型)
   */
  public static advanceLotStation(
    lot: WaferLotData,
    hasCmpUnlocked: boolean,
    nodeNm: number,
    cleanroomClass: string,
    currentGameTime: number
  ): { nextStation: StationType; nextSubStep?: LitSubStep; isLayerCompleted: boolean; isLotCompleted: boolean } {
    const sequence = this.getStationSequence(hasCmpUnlocked);

    // 處理 LIT 站內部三子步驟：COAT -> EXPOSE -> DEVELOP
    if (lot.currentStation === 'LIT') {
      if (!lot.litSubStep || lot.litSubStep === 'COAT') {
        lot.litSubStep = 'EXPOSE';
        lot.qTimeDeadline = null;
        return { nextStation: 'LIT', nextSubStep: 'EXPOSE', isLayerCompleted: false, isLotCompleted: false };
      } else if (lot.litSubStep === 'EXPOSE') {
        lot.litSubStep = 'DEVELOP';
        lot.qTimeDeadline = null;
        return { nextStation: 'LIT', nextSubStep: 'DEVELOP', isLayerCompleted: false, isLotCompleted: false };
      } else if (lot.litSubStep === 'DEVELOP') {
        // DEVELOP 完畢，邁向 ETCH 站！啟動黃金微影 Q-Time 死線倒數！
        lot.currentStation = 'ETCH';
        lot.litSubStep = undefined;
        const qTimeSec = this.calculateEffectiveQTimeSec('LIT', 'ETCH', nodeNm, cleanroomClass);
        lot.qTimeDeadline = currentGameTime + qTimeSec;
        return { nextStation: 'ETCH', isLayerCompleted: false, isLotCompleted: false };
      }
    }

    // 處理其他主站點
    const currentIndex = sequence.indexOf(lot.currentStation);
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      const next = sequence[currentIndex + 1];
      lot.currentStation = next;
      if (next === 'LIT') {
        lot.litSubStep = 'COAT';
      }

      // 檢查是否需要賦予 Q-Time 死線
      if (lot.currentStation === 'DIFF') {
        // ETCH -> DIFF 具備 45s Q-Time
        const qTimeSec = this.calculateEffectiveQTimeSec('ETCH', 'DIFF', nodeNm, cleanroomClass);
        lot.qTimeDeadline = currentGameTime + qTimeSec;
      } else {
        lot.qTimeDeadline = null;
      }

      return { nextStation: next, isLayerCompleted: false, isLotCompleted: false };
    }

    // 已達到該層最後一站 (DIFF 或 CMP)，層數結算
    if (lot.currentLayer < lot.totalLayers) {
      lot.currentLayer += 1;
      lot.currentStation = 'FILM';
      lot.litSubStep = undefined;
      lot.qTimeDeadline = null;
      return { nextStation: 'FILM', isLayerCompleted: true, isLotCompleted: false };
    }

    // 全層數完工！
    lot.status = 'COMPLETED';
    lot.qTimeDeadline = null;
    return { nextStation: lot.currentStation, isLayerCompleted: true, isLotCompleted: true };
  }

  /**
   * 計算各站點實效加工產能 (含 Track 瓶頸與機台磨損折損)
   */
  public static calculateStationThroughputs(
    machines: MachineData[],
    staff: StaffData[],
    hasCmpUnlocked: boolean
  ): Record<StationType | 'TRACK', StationThroughputInfo> {
    const stations: (StationType | 'TRACK')[] = ['FILM', 'TRACK', 'LIT', 'ETCH', 'DIFF', 'CMP'];
    const result: Record<StationType | 'TRACK', StationThroughputInfo> = {
      FILM: { station: 'FILM', totalCapacity: 0, machineCount: 0, isChokePoint: false },
      TRACK: { station: 'TRACK', totalCapacity: 0, machineCount: 0, isChokePoint: false },
      LIT: { station: 'LIT', totalCapacity: 0, machineCount: 0, isChokePoint: false },
      ETCH: { station: 'ETCH', totalCapacity: 0, machineCount: 0, isChokePoint: false },
      DIFF: { station: 'DIFF', totalCapacity: 0, machineCount: 0, isChokePoint: false },
      CMP: { station: 'CMP', totalCapacity: 0, machineCount: 0, isChokePoint: false }
    };

    // 建立工程師索引
    const staffMap = new Map<string, StaffData>();
    for (const s of staff) {
      staffMap.set(s.id, s);
    }

    // 逐台計算
    for (const m of machines) {
      if (m.status === 'EXPLODED') continue;

      let key: StationType | 'TRACK' = m.category as any;
      if (m.category === 'LITHO') key = 'LIT';

      const baseCap = this.BASE_THROUGHPUT_BY_TIER[key]?.[m.tier] ?? 10;
      const wearPenalty = 1 - (m.wear / 100) * 0.3; // 磨損最多損耗 30% 速率

      // 檢查進駐工程師加成
      let engineerBonus = 1.0;
      if (m.assignedEngineerId && staffMap.has(m.assignedEngineerId)) {
        const eng = staffMap.get(m.assignedEngineerId)!;
        if (eng.moduleSpecialty === m.category && eng.fatigue < 80) {
          engineerBonus = 1.2; // 專業合格工程師提速 20%
        }
      }

      // 若為微影機且並聯綁定了多台 Track 機組，獲得 Inline Cluster 5% 效率加成
      if (key === 'LIT' && m.pairedTrackIds && m.pairedTrackIds.length >= 2) {
        engineerBonus += 0.05;
      }

      const effectiveCap = baseCap * wearPenalty * engineerBonus;
      result[key].totalCapacity += effectiveCap;
      result[key].machineCount += 1;
    }

    // 找出最低產能的站點作為 Choke Point (瓶頸站)
    let minCap = Infinity;
    let bottleneckStation: StationType | 'TRACK' = 'TRACK';
    for (const st of stations) {
      if (st === 'CMP' && !hasCmpUnlocked) continue;
      if (result[st].totalCapacity < minCap) {
        minCap = result[st].totalCapacity;
        bottleneckStation = st;
      }
    }
    if (minCap < Infinity && bottleneckStation) {
      result[bottleneckStation].isChokePoint = true;
    }

    return result;
  }

  /**
   * 計算工廠物流效率係數 (0.4 ~ 1.25)
   */
  public static calculateLogisticsFactor(
    features: UnlockedFeatures,
    machines: MachineData[],
    activeLotCount: number
  ): number {
    // 物流科技世代
    let techFactor = 0.5; // 人工手持卡匣
    if (features.oht) {
      techFactor = 1.2; // 天花板 OHT 天車
    } else if (features.agv) {
      techFactor = 0.85; // 地面 AGV
    }

    // 佈局距離評估 (計算相鄰站點的平均網格曼哈頓距離)
    let avgDistance = 5;
    if (machines.length >= 2) {
      let totalDist = 0;
      let pairs = 0;
      for (let i = 0; i < machines.length - 1; i++) {
        const d = Math.abs(machines[i].gridX - machines[i + 1].gridX) + Math.abs(machines[i].gridY - machines[i + 1].gridY);
        totalDist += d;
        pairs++;
      }
      avgDistance = pairs > 0 ? totalDist / pairs : 5;
    }
    const layoutEfficiency = Math.max(0.6, Math.min(1.1, 6 / Math.max(2, avgDistance)));

    // 擁擠會車懲罰 (批次過多時折損)
    const congestionPenalty = Math.min(0.2, activeLotCount * 0.02);

    return Number((techFactor * layoutEfficiency * (1 - congestionPenalty)).toFixed(2));
  }

  /**
   * 計算工廠負荷百分比 (Workload %)
   */
  public static calculateFactoryWorkload(
    machines: MachineData[],
    staff: StaffData[],
    activeLots: WaferLotData[],
    features: UnlockedFeatures,
    hasCmpUnlocked: boolean
  ): {
    workloadPercent: number;
    maxCapacityWafersPerMin: number;
    totalDemandWafers: number;
    statusLevel: 'SMOOTH' | 'HEAVY' | 'OVERLOADED';
    throughputs: Record<StationType | 'TRACK', StationThroughputInfo>;
  } {
    const throughputs = this.calculateStationThroughputs(machines, staff, hasCmpUnlocked);
    const logisticsFactor = this.calculateLogisticsFactor(features, machines, activeLots.length);

    // 最大負荷承載量 C_max
    const validStations: (StationType | 'TRACK')[] = ['FILM', 'TRACK', 'LIT', 'ETCH', 'DIFF'];
    if (hasCmpUnlocked) validStations.push('CMP');

    let minStationCap = Infinity;
    for (const st of validStations) {
      const cap = throughputs[st].totalCapacity;
      if (cap < minStationCap) {
        minStationCap = cap;
      }
    }

    const maxCapacity = Math.max(1, minStationCap * logisticsFactor);

    // 在製晶圓總需求
    let totalDemand = 0;
    for (const lot of activeLots) {
      if (lot.status === 'PROCESSING' || lot.status === 'WAITING_QTIME' || lot.status === 'TRANSPORTING') {
        totalDemand += lot.waferCount;
      }
    }

    const workloadPercent = Math.min(150, Math.round((totalDemand / maxCapacity) * 100));

    let statusLevel: 'SMOOTH' | 'HEAVY' | 'OVERLOADED' = 'SMOOTH';
    if (workloadPercent > 85) {
      statusLevel = 'OVERLOADED';
    } else if (workloadPercent >= 70) {
      statusLevel = 'HEAVY';
    }

    return {
      workloadPercent,
      maxCapacityWafersPerMin: Math.round(maxCapacity),
      totalDemandWafers: totalDemand,
      statusLevel,
      throughputs
    };
  }

  /**
   * 🔴 智能瓶頸分析診斷與改良對策逆向歸因系統
   */
  public static diagnoseBottleneck(
    machines: MachineData[],
    staff: StaffData[],
    activeLots: WaferLotData[],
    features: UnlockedFeatures,
    hasCmpUnlocked: boolean
  ): BottleneckDiagnostic {
    const { workloadPercent, throughputs } = this.calculateFactoryWorkload(
      machines,
      staff,
      activeLots,
      features,
      hasCmpUnlocked
    );

    // 1. 檢查嚴重磨損機台 (Maintenance Bottleneck)
    const severeWearMachine = machines.find((m) => m.wear >= 70);
    if (severeWearMachine) {
        const catKey: StationType | 'TRACK' = severeWearMachine.category === 'LITHO' ? 'LIT' : (severeWearMachine.category as StationType | 'TRACK');
        return {
          category: 'MAINTENANCE',
          title: '機台嚴重老化致效能衰退',
          stationName: severeWearMachine.category,
          description: `【${severeWearMachine.name}】磨損度高達 ${severeWearMachine.wear}%，抽真空與加工速率嚴重衰退超過 20%！`,
          recommendation: '請立即指派工程師對該機台執行「就地大修（Overhaul）」或保養，恢復 100% 原始效能。',
          workloadPercent,
          chokePointThroughput: Math.round(throughputs[catKey]?.totalCapacity ?? 10)
        };
    }

    // 2. 檢查 Track 先天產能瓶頸 (Track Bottleneck)
    const trackCap = throughputs.TRACK.totalCapacity;
    const lithoCap = throughputs.LIT.totalCapacity;
    if (trackCap < lithoCap && trackCap < 40) {
      return {
        category: 'CAPACITY',
        title: '塗膠顯影 (Track) 先天物理產能瓶頸',
        stationName: 'TRACK',
        description: `LITHO 曝光機正在空轉等待！【Track 塗膠顯影站】產能僅 ${Math.round(trackCap)} 片/分，是產線最大卡點！`,
        recommendation: '光阻旋塗與烘烤受熱擴散物理限制，建議增購第 2 台 Track 機台或將其並聯綁定至微影機以分流消化產能！',
        workloadPercent,
        chokePointThroughput: Math.round(trackCap)
      };
    }

    // 3. 檢查機台短缺 (Capacity Bottleneck)
    let lowestStation: StationType | 'TRACK' = 'FILM';
    let minCap = Infinity;
    const checkStations: (StationType | 'TRACK')[] = ['FILM', 'TRACK', 'LIT', 'ETCH', 'DIFF'];
    if (hasCmpUnlocked) checkStations.push('CMP');

    for (const st of checkStations) {
      if (throughputs[st].totalCapacity < minCap) {
        minCap = throughputs[st].totalCapacity;
        lowestStation = st;
      }
    }

    if (minCap <= 15) {
      return {
        category: 'CAPACITY',
        title: '關鍵製程站點設備數量不足',
        stationName: lowestStation,
        description: `【${lowestStation} 站】產能僅 ${Math.round(minCap)} 片/分，遠低於其他站點，晶圓在門口嚴重堆積！`,
        recommendation: `建議前往商城增購第 2 台 ${lowestStation} 設備進行分流，或將現有機台升級為更高階型號。`,
        workloadPercent,
        chokePointThroughput: Math.round(minCap)
      };
    }

    // 4. 檢查物流搬運落後 (Logistics Bottleneck)
    if (!features.agv && !features.oht && activeLots.length >= 2) {
      return {
        category: 'LOGISTICS',
        title: '人工手持搬運效率偏低',
        stationName: 'AMHS 物流',
        description: '當前仍為「技術員手持晶圓盒步行搬運」，走動搬運耗時佔據了整個製程週期的 40% 以上！',
        recommendation: '投片量已超越人工負荷極限！強烈建議研發解鎖「地面 AGV 自走車」或「天花板 OHT 天軌」。',
        workloadPercent,
        chokePointThroughput: Math.round(minCap)
      };
    }

    // 5. 佈局動線分散 (Layout Bottleneck)
    return {
      category: 'LAYOUT',
      title: '機台動線規劃待最佳化',
      stationName: '廠房佈局',
      description: '前後站點相隔較遠，搬運載具在走道往返耗時過多，拉長了晶圓整體的傳送等待時間。',
      recommendation: '建議在廠房編輯模式中將相鄰製程機台（如 Track 與 Litho、Etch 與 Diff）就近排列，縮短傳送時間。',
      workloadPercent,
      chokePointThroughput: Math.round(minCap)
    };
  }

  /**
   * 先進多層訂單之「混合微影分層指派 (Mix-and-Match)」自動最佳化經濟配置
   * 自動將關鍵層 (Critical Layer, 如底層閘極) 指派頂級光刻機，非關鍵層配成熟機台
   */
  public static autoFillBestEconomyAllocation(
    order: OrderData,
    availableMachines: MachineData[]
  ): {
    layerIndex: number;
    layerType: string;
    targetCD: number;
    assignedMachineModelId: string;
  }[] {
    const lithoMachines = availableMachines.filter((m) => m.category === 'LITHO');
    if (lithoMachines.length === 0) return [];

    // 排序微影機台（解析度極限由先進到成熟）
    const sortedMachines = [...lithoMachines].sort((a, b) => {
      const specA = RayleighEngine.OPTICAL_CATALOG[a.modelId]?.baseRayleighLimitNm ?? 9999;
      const specB = RayleighEngine.OPTICAL_CATALOG[b.modelId]?.baseRayleighLimitNm ?? 9999;
      return specA - specB;
    });

    const bestMachine = sortedMachines[0]; // 最先進機台
    const matureMachine = sortedMachines[sortedMachines.length - 1]; // 最成熟便宜機台

    const allocations = [];
    for (let layer = 1; layer <= order.layerCount; layer++) {
      let isCritical = layer <= 3; // 底層 1~3 層通常為 FEOL 閘極與接觸窗
      let targetCD = isCritical ? order.nodeNm : Math.max(order.nodeNm * 2.5, 350);
      let assignedModel = isCritical ? bestMachine.modelId : matureMachine.modelId;

      allocations.push({
        layerIndex: layer,
        layerType: isCritical ? '關鍵層 (Critical Layer)' : '繞線層 (Metal Interconnect)',
        targetCD: Math.round(targetCD),
        assignedMachineModelId: assignedModel
      });
    }

    return allocations;
  }
}
