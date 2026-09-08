/**
 * YieldEngine.ts
 * 負責層良率連乘、1.9 節權威 5 筆滑動窗口 RollingYieldIndex 追蹤與蒙地卡羅同心圓缺陷晶圓圖生成
 */

import { WaferLotData } from '../types';

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
