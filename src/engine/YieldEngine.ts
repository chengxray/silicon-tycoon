/**
 * YieldEngine.ts
 * 負責層良率連乘、1.9 節權威 5 筆滑動窗口 RollingYieldIndex 追蹤與蒙地卡羅同心圓缺陷晶圓圖生成
 */

import { WaferLotData, SaveGameV2, OrderData, StaffData } from '../types';
import { RayleighEngine } from './RayleighEngine';

export interface DieResult {
  index: number;
  row: number;
  col: number;
  distanceFromCenter: number;
  passed: boolean;
  defectType?: 'PARTICLE' | 'OPTICAL_DEFOCUS' | 'SCRATCH' | 'CLUSTER';
}

export class YieldEngine {
  /**
   * 取得指定製程整合工程師 (PIE) 之速度加速與良率守護加成
   */
  public static getPieBonus(pieStaff: StaffData | null | undefined): { speedBonus: number; yieldBonus: number } {
    if (!pieStaff || pieStaff.workShift === 'OFF') {
      return { speedBonus: 0, yieldBonus: 0 };
    }
    let speedBonus = 0;
    let yieldBonus = 0;
    if (pieStaff.rank === 'Young Specialist') {
      speedBonus = 0.08;
      yieldBonus = 0.03;
    } else if (pieStaff.rank === 'Skilled Worker') {
      speedBonus = 0.15;
      yieldBonus = 0.06;
    } else if (pieStaff.rank === 'Senior Engineer') {
      speedBonus = 0.25;
      yieldBonus = 0.10;
    } else if (pieStaff.rank === 'Fellow') {
      speedBonus = 0.40;
      yieldBonus = 0.16;
    }

    if (pieStaff.moduleSpecialty === 'PIE') {
      yieldBonus += 0.02; // PIE 專精加成
      speedBonus += 0.05; // 專精額外加速
    }

    if (pieStaff.fatigue >= 80) {
      speedBonus *= 0.6;
      yieldBonus *= 0.6;
    }

    return {
      speedBonus: Number(speedBonus.toFixed(3)),
      yieldBonus: Number(yieldBonus.toFixed(3))
    };
  }

  /**
   * 計算 1.9 節權威 RollingYieldIndex（5 筆滑動窗口）
   * - 歷史空：回傳 null (UI 顯示為 N/A，TrustMultiplier 強制為 1.0)
   * - < 5 筆：所有筆數的算術平均
   * - >= 5 筆：取最近 5 筆做算術平均
   * 注意：Q-Time > 15s 強制報廢批次必須將 0.0 寫入歷史！
   */
  public static calculateRollingYieldIndex(history: number[]): number | null {
    if (!history || history.length === 0) {
      return null;
    }

    const window = history.slice(-5);
    const sum = window.reduce((acc, val) => acc + val, 0);
    const average = sum / window.length;

    return Number(average.toFixed(4));
  }

  /**
   * 計算單層基礎良率 (0.0 ~ 1.0)
   */
  public static calculateLayerYield(
    cleanroomModifier: number = 1.0,
    processWindowLoss: number = 0,
    engineerYieldBonus: number = 0
  ): number {
    // 基準單層良率 98.5%
    let yieldVal = 0.985 * cleanroomModifier * (1 - processWindowLoss) + engineerYieldBonus;
    return Math.max(0.70, Math.min(0.999, yieldVal));
  }

  /**
   * 計算批次最終綜合良率
   */
  public static calculateFinalLotYield(lot: WaferLotData, processWindowLoss: number = 0): number {
    if (lot.status === 'SCRAPPED') {
      return 0.0; // 強制報廢記 0%
    }

    // 逐層連乘
    let cumulativeYield = 1.0;
    for (let i = 0; i < lot.totalLayers; i++) {
      cumulativeYield *= this.calculateLayerYield(1.0, processWindowLoss, 0);
    }

    // 套用 Q-Time 違規扣減係數 (若有輕微逾時則 yieldMultiplier = 0.65)
    cumulativeYield *= (lot.yieldMultiplier || 1.0);

    return Number(Math.max(0, Math.min(1.0, cumulativeYield)).toFixed(4));
  }

  /**
   * 實時綜合計算晶圓批次真實良率 (0.0 ~ 1.0)
   * 整合：
   * 1. 白光/黃光區違規判定 (違反直接 0.0)
   * 2. 無塵室潔淨室等級基底單層良率 (Class 10000 ~ ISO 1)
   * 3. 廠內運轉機台平均磨損顆粒折損 (Machine Wear Loss)
   * 4. 在線值勤工程師資歷調校紅利與過勞失誤 (Staff Skill / Fatigue)
   * 5. 製程整合工程師 (PIE) 訂單專案加成與速度優化
   * 6. 微影光學極限製程視窗懲罰 (Rayleigh k1 Process Window Penalty)
   * 7. Q-Time 逾時懲罰
   * 8. 蒙地卡羅物理擾動 (±1.2%)
   */
  public static calculateLotYield(
    lot: WaferLotData,
    state: SaveGameV2,
    order?: OrderData
  ): number {
    if (lot.hasYellowRoomViolation || lot.yieldMultiplier === 0.0) {
      return 0.0;
    }

    const totalLayers = Math.max(1, lot.totalLayers || (order ? order.layerCount : 6));

    // 1. 無塵室潔淨室等級基底單層良率 (Cleanroom Class Layer Yield)
    // Tier 1 (Class 10,000) 基準良率設計為 55% ~ 68%，避免早期良率虛高，體現半導體學習曲線
    let cleanroomLayerFactor = 0.915; // Class 10000 基準
    const crClass = state.player.unlockedCleanroomClass;
    if (crClass === 'Class 1000') cleanroomLayerFactor = 0.955;
    else if (crClass === 'Class 100') cleanroomLayerFactor = 0.975;
    else if (crClass === 'Class 10') cleanroomLayerFactor = 0.988;
    else if (crClass === 'Class 1') cleanroomLayerFactor = 0.995;
    else if (crClass === 'ISO 1') cleanroomLayerFactor = 0.9985;

    // 2. 相關加工機台平均磨損折損 (Machine Wear Defect Loss)
    const activeMachines = state.machines.filter(m => m.status !== 'EXPLODED');
    let avgWear = 0;
    if (activeMachines.length > 0) {
      avgWear = activeMachines.reduce((sum, m) => sum + m.wear, 0) / activeMachines.length;
    }
    const wearPenalty = (avgWear / 100) * 0.06;

    // 3. 在線值勤工程師專長與調校紅利 (Staff Skill & Fatigue)
    let staffBonus = 0;
    const workingStaff = state.staff.filter(s => s.workShift !== 'OFF');
    for (const staff of workingStaff) {
      if (staff.fatigue >= 80) {
        staffBonus -= 0.015; // 過勞失誤
      } else {
        if (staff.rank === 'Young Specialist') staffBonus += 0.005;
        else if (staff.rank === 'Skilled Worker') staffBonus += 0.010;
        else if (staff.rank === 'Senior Engineer') staffBonus += 0.018;
        else if (staff.rank === 'Fellow') staffBonus += 0.025;
      }
    }
    staffBonus = Math.max(-0.05, Math.min(0.06, staffBonus));

    // 4. 製程整合工程師 (PIE) 專案加成
    let pieBonus = 0;
    if (order && order.assignedPieId) {
      const pieStaff = state.staff.find(s => s.id === order.assignedPieId);
      const pie = this.getPieBonus(pieStaff);
      pieBonus = pie.yieldBonus;
    }

    // 5. 微影光學極限製程視窗懲罰 (Rayleigh Optical Process Window)
    let opticalPenalty = 0;
    const lithoMachine = state.machines.find(m => m.category === 'LITHO' && m.status !== 'EXPLODED');
    if (lithoMachine) {
      const engineer = lithoMachine.assignedEngineerId
        ? state.staff.find(s => s.id === lithoMachine.assignedEngineerId)
        : null;
      const { effectiveK1 } = RayleighEngine.calculateEffectiveK1(
        state.unlockedFeatures.cmp ? 'CAR' : 'BASE',
        lithoMachine.wear,
        engineer
      );
      opticalPenalty = RayleighEngine.getProcessWindowPenalty(effectiveK1);
    }

    // 6. 多層微影連乘計算 (Multi-layer Cumulative Yield)
    const effectiveLayerYield = Math.max(0.85, cleanroomLayerFactor - (wearPenalty / totalLayers));
    let baseCumulativeYield = Math.pow(effectiveLayerYield, Math.min(12, totalLayers));

    // 疊加工程師調校紅利、PIE 整合良率紅利與微影視窗折損
    let finalYield = baseCumulativeYield + staffBonus + pieBonus - opticalPenalty;

    // 7. Q-Time 懲罰 (若該批次曾有逾期扣減)
    if (lot.yieldMultiplier < 0.99 && lot.yieldMultiplier > 0.0) {
      finalYield *= lot.yieldMultiplier;
    }

    // 8. 蒙地卡羅物理天然擾動 (Natural Process Fluctuation ±1.2%)
    const noise = (Math.random() - 0.5) * 0.024;
    finalYield += noise;

    // 9. 封頂與保底：合理落於 40% ~ 98.5% 之間
    return Number(Math.max(0.40, Math.min(0.985, finalYield)).toFixed(3));
  }

  /**
   * 蒙地卡羅 25 晶粒圖產生器 (5x5 晶圓同心圓梯度與群聚缺陷)
   * 包含中心 1.1x / 邊緣 0.7x 之真實同心圓缺陷梯度
   */
  public static generateWaferMap(finalYield: number): DieResult[] {
    const dies: DieResult[] = [];
    const size = 5;
    const center = (size - 1) / 2; // 2.0
    const maxDist = Math.sqrt(center * center + center * center); // ~2.828

    // 1. 初始化 25 顆 Die 與同心圓機率矩陣
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const index = r * size + c;
        const dist = Math.sqrt((r - center) ** 2 + (c - center) ** 2);
        const normDist = dist / maxDist; // 0.0 (中心) ~ 1.0 (邊緣)

        // 梯度因子：中心 1.10x，邊緣 0.70x
        const gradientFactor = 1.10 - (normDist * 0.40);
        const basePassProb = Math.min(0.99, finalYield * gradientFactor);

        const passed = Math.random() < basePassProb;

        dies.push({
          index,
          row: r,
          col: c,
          distanceFromCenter: Number(dist.toFixed(2)),
          passed,
          defectType: passed ? undefined : (normDist > 0.6 ? 'OPTICAL_DEFOCUS' : 'PARTICLE')
        });
      }
    }

    // 2. 缺陷群聚 (Cluster Defects) 蒙地卡羅擴散模擬
    for (let i = 0; i < dies.length; i++) {
      if (!dies[i].passed && Math.random() < 0.40) {
        // 40% 機率向相鄰晶粒擴散缺陷
        const neighbors = dies.filter(d => 
          Math.abs(d.row - dies[i].row) <= 1 &&
          Math.abs(d.col - dies[i].col) <= 1 &&
          d.index !== dies[i].index
        );
        if (neighbors.length > 0) {
          const target = neighbors[Math.floor(Math.random() * neighbors.length)];
          target.passed = false;
          target.defectType = 'CLUSTER';
        }
      }
    }

    return dies;
  }
}
