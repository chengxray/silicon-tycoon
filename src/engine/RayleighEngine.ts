/**
 * RayleighEngine.ts
 * 嚴格遵循微影光學物理 Rayleigh 解析度公式與動態 k1 製程因子引擎
 */

import { K1TechLevel, StaffData } from '../types';

export interface OpticalSpec {
  modelId: string;
  name: string;
  wavelengthNm: number; // λ
  numericalAperture: number; // NA
  baseRayleighLimitNm: number; // CD at k1 = 0.80
  unlockTier: number;
  baseCost: number;
  baseMttrSec: number;
}

export class RayleighEngine {
  // 微影機台光學資料庫（Rayleigh 公式 CD = 0.80 * λ / NA 精準對照）
  public static readonly OPTICAL_CATALOG: Record<string, OpticalSpec> = {
    litho_contact: {
      modelId: 'litho_contact',
      name: 'Contact Aligner (接觸式微影機)',
      wavelengthNm: 436,
      numericalAperture: 0.116,
      baseRayleighLimitNm: 3007, // 436 * 0.8 / 0.116 = 3006.89 ~ 3007nm (精準支援 10µm~3µm)
      unlockTier: 1,
      baseCost: 2_500_000,
      baseMttrSec: 10
    },
    litho_projection: {
      modelId: 'litho_projection',
      name: '1x Projection Aligner (1:1 投影微影機)',
      wavelengthNm: 436,
      numericalAperture: 0.194,
      baseRayleighLimitNm: 1798, // 436 * 0.8 / 0.194 = 1797.93 ~ 1798nm (支援 3µm~1.8µm)
      unlockTier: 1,
      baseCost: 6_000_000,
      baseMttrSec: 15
    },
    litho_gline: {
      modelId: 'litho_gline',
      name: 'G-Line Stepper (步進縮小曝光機)',
      wavelengthNm: 436,
      numericalAperture: 0.35,
      baseRayleighLimitNm: 997, // 436 * 0.8 / 0.35 = 996.57 ~ 997nm (支援 1µm)
      unlockTier: 2,
      baseCost: 18_000_000,
      baseMttrSec: 20
    },
    litho_iline: {
      modelId: 'litho_iline',
      name: 'I-Line Stepper (高壓汞燈微影機)',
      wavelengthNm: 365,
      numericalAperture: 0.50,
      baseRayleighLimitNm: 584, // 365 * 0.8 / 0.50 = 584nm
      unlockTier: 3,
      baseCost: 35_000_000,
      baseMttrSec: 30
    },
    litho_krf: {
      modelId: 'litho_krf',
      name: 'KrF DUV Scanner (準分子雷射掃描機)',
      wavelengthNm: 248,
      numericalAperture: 0.70,
      baseRayleighLimitNm: 283, // 248 * 0.8 / 0.70 = 283.4 ~ 283nm
      unlockTier: 4,
      baseCost: 85_000_000,
      baseMttrSec: 40
    },
    litho_arfdry: {
      modelId: 'litho_arfdry',
      name: 'ArF Dry Scanner (氟化氬乾式微影機)',
      wavelengthNm: 193,
      numericalAperture: 0.85,
      baseRayleighLimitNm: 182, // 193 * 0.8 / 0.85 = 181.6 ~ 182nm
      unlockTier: 4,
      baseCost: 180_000_000,
      baseMttrSec: 50
    },
    litho_arfi: {
      modelId: 'litho_arfi',
      name: 'ArFi Immersion TWINSCAN (雙工件台浸潤微影機)',
      wavelengthNm: 193,
      numericalAperture: 1.35,
      baseRayleighLimitNm: 114, // 193 * 0.8 / 1.35 = 114.3 ~ 114nm
      unlockTier: 5,
      baseCost: 450_000_000,
      baseMttrSec: 60
    },
    litho_euv: {
      modelId: 'litho_euv',
      name: 'EUV Scanner (極紫外真空微影機)',
      wavelengthNm: 13.5,
      numericalAperture: 0.33,
      baseRayleighLimitNm: 33, // 13.5 * 0.8 / 0.33 = 32.7 ~ 33nm
      unlockTier: 6,
      baseCost: 2_500_000_000,
      baseMttrSec: 90
    },
    litho_highna: {
      modelId: 'litho_highna',
      name: 'High-NA EUV Scanner (變形高數值孔徑微影機)',
      wavelengthNm: 13.5,
      numericalAperture: 0.55,
      baseRayleighLimitNm: 20, // 13.5 * 0.8 / 0.55 = 19.6 ~ 20nm
      unlockTier: 6,
      baseCost: 6_000_000_000,
      baseMttrSec: 120
    }
  };

  /**
   * 計算動態 k1 製程因子
   * k1_effective = k1_tech + Δk1_wear - Δk1_engineer + Δk1_fatigue
   */
  public static calculateEffectiveK1(
    techLevel: K1TechLevel,
    wearPercent: number,
    assignedEngineer?: StaffData | null
  ): {
    effectiveK1: number;
    k1Tech: number;
    deltaWear: number;
    deltaEngineer: number;
    deltaFatigue: number;
  } {
    // 1. 研發基準科技底層 k1_tech
    let k1Tech = 0.80;
    switch (techLevel) {
      case 'BASE': k1Tech = 0.80; break;
      case 'CAR': k1Tech = 0.65; break;
      case 'OPC': k1Tech = 0.50; break;
      case 'PSM': k1Tech = 0.38; break;
      case 'SAQP': k1Tech = 0.28; break;
    }

    // 2. 機台老化磨損懲罰 Δk1_wear = (wear / 100) * 0.05
    const clampedWear = Math.max(0, Math.min(100, wearPercent));
    const deltaWear = (clampedWear / 100) * 0.05;

    // 3. 工程師專精調校紅利與疲勞懲罰
    let deltaEngineer = 0;
    let deltaFatigue = 0;

    if (assignedEngineer && assignedEngineer.moduleSpecialty === 'LITHO') {
      if (assignedEngineer.fatigue >= 80) {
        // 過勞時調校加成失效歸零，並施加失誤懲罰
        deltaEngineer = 0;
        deltaFatigue = 0.03;
      } else {
        // 正常調校紅利
        switch (assignedEngineer.rank) {
          case 'Young Specialist': deltaEngineer = 0.01; break;
          case 'Skilled Worker': deltaEngineer = 0.02; break;
          case 'Senior Engineer': deltaEngineer = 0.04; break;
          case 'Fellow': deltaEngineer = 0.06; break;
        }
      }
    }

    // 綜合計算並防呆封頂
    let effectiveK1 = k1Tech + deltaWear - deltaEngineer + deltaFatigue;
    const minK1 = techLevel === 'SAQP' ? 0.15 : 0.25;
    effectiveK1 = Math.max(minK1, Math.min(0.95, effectiveK1));

    return {
      effectiveK1: Number(effectiveK1.toFixed(3)),
      k1Tech,
      deltaWear: Number(deltaWear.toFixed(3)),
      deltaEngineer: Number(deltaEngineer.toFixed(3)),
      deltaFatigue: Number(deltaFatigue.toFixed(3))
    };
  }

  /**
   * 計算即時動態極限線寬 CD (nm)
   * CD = k1_effective * (λ / NA)
   */
  public static calculateEffectiveCD(
    modelId: string,
    techLevel: K1TechLevel,
    wearPercent: number,
    assignedEngineer?: StaffData | null
  ): number {
    const spec = this.OPTICAL_CATALOG[modelId];
    if (!spec) return 999999;

    const { effectiveK1 } = this.calculateEffectiveK1(techLevel, wearPercent, assignedEngineer);
    const cd = effectiveK1 * (spec.wavelengthNm / spec.numericalAperture);
    return Math.round(cd);
  }

  /**
   * 投片前光學極限合規性檢查
   * 若 CD_effective > targetNodeNm 則判定違規無法投片
   */
  public static validateResolution(
    modelId: string,
    targetNodeNm: number,
    techLevel: K1TechLevel,
    wearPercent: number,
    assignedEngineer?: StaffData | null
  ): {
    canResolve: boolean;
    effectiveCD: number;
    effectiveK1: number;
    reason?: string;
  } {
    const spec = this.OPTICAL_CATALOG[modelId];
    if (!spec) {
      return { canResolve: false, effectiveCD: 999999, effectiveK1: 0.8, reason: '未知的微影機台型號' };
    }

    const { effectiveK1 } = this.calculateEffectiveK1(techLevel, wearPercent, assignedEngineer);
    const effectiveCD = this.calculateEffectiveCD(modelId, techLevel, wearPercent, assignedEngineer);

    // 判斷是否能解析目標線寬
    // 容許裕度：目標節點線寬需大於等於極限 CD（或在特殊多重曝光下）
    if (effectiveCD > targetNodeNm) {
      return {
        canResolve: false,
        effectiveCD,
        effectiveK1,
        reason: `光學解析度不足！當前極限 CD 為 ${effectiveCD}nm，無法解析目標 ${targetNodeNm}nm 製程（磨損或人員疲勞導致 k1 劣化至 ${effectiveK1}）。`
      };
    }

    return {
      canResolve: true,
      effectiveCD,
      effectiveK1
    };
  }

  /**
   * 極限製程視窗良率損失 (Process Window DOF Loss)
   * 當 k1 < 0.38 逼近極限時觸發
   */
  public static getProcessWindowPenalty(effectiveK1: number): number {
    if (effectiveK1 >= 0.38) return 0;
    // Loss = (0.38 - k1) * 50%
    const loss = (0.38 - effectiveK1) * 0.50;
    return Math.max(0, Math.min(0.25, loss));
  }
}
