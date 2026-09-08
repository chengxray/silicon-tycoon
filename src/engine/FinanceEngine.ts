/**
 * FinanceEngine.ts
 * 負責半導體工廠 日、周、月 週期財務收支分析：
 * 1. 日收支分析 (Daily)：當日與近 14 天歷史走勢
 * 2. 周收支分析 (Weekly)：當周與近 8 周歷史走勢
 * 3. 月收支分析 (Monthly)：當月與近 6 個月歷史走勢
 * 4. 營業收入 (晶圓出貨、NRE、補助)、營業成本 (折舊、維修、水電、報廢)、費用 (薪資)、資本支出 (機台採購)
 * 5. 毛利率 (TSMC 53% 標竿指標)、淨利率與財務長 (CFO) 營運健檢評語
 */

import { SaveGameV2, FinancialState, FinancialRecord } from '../types';

export class FinanceEngine {
  public static readonly DAY_SECONDS = 30; // 30 遊戲秒 = 1 遊戲日
  public static readonly DAYS_PER_WEEK = 7; // 7 遊戲日 = 1 遊戲周 (210 秒)
  public static readonly DAYS_PER_MONTH = 28; // 28 遊戲日 = 1 遊戲月 (840 秒)

  /**
   * 建立空白週期紀錄
   */
  public static createEmptyRecord(
    periodType: 'DAY' | 'WEEK' | 'MONTH',
    periodIndex: number,
    label: string,
    initialCash: number = 50_000_000,
    initialNetWorth: number = 70_000_000
  ): FinancialRecord {
    return {
      periodType,
      periodIndex,
      label,
      timestamp: Date.now(),
      revenue: {
        waferSales: 0,
        nreFees: 0,
        subsidies: 0,
        totalRevenue: 0
      },
      expenses: {
        depreciation: 0,
        maintenance: 0,
        utilities: 0,
        payroll: 0,
        scraps: 0,
        capex: 0,
        totalExpenses: 0
      },
      grossProfit: 0,
      grossMarginPct: 0,
      netProfit: 0,
      netMarginPct: 0,
      endingCash: initialCash,
      endingNetWorth: initialNetWorth
    };
  }

  /**
   * 初始化財務狀態
   */
  public static initFinancialState(initialCash: number = 50_000_000, initialNetWorth: number = 70_000_000): FinancialState {
    return {
      daySeconds: 0,
      currentDay: 1,
      currentWeek: 1,
      currentMonth: 1,
      today: this.createEmptyRecord('DAY', 1, '第 1 天 (Day 1)', initialCash, initialNetWorth),
      thisWeek: this.createEmptyRecord('WEEK', 1, '第 1 周 (Week 1)', initialCash, initialNetWorth),
      thisMonth: this.createEmptyRecord('MONTH', 1, '第 1 個月 (Month 1)', initialCash, initialNetWorth),
      dailyHistory: [],
      weeklyHistory: [],
      monthlyHistory: [],
      allTimeRevenue: 0,
      allTimeExpenses: 0,
      allTimeProfit: 0
    };
  }

  /**
   * 計算公司總淨值 (Total Net Worth)
   * 總淨值 = 現金 + 機台重置估值 + 無塵室廠房估值 - 追討欠款負債
   */
  public static calculateCompanyNetWorth(state: SaveGameV2): number {
    const cash = state.player.cash;
    const machineValue = state.machines.reduce((sum, m) => {
      const baseEstimate = m.tier * 15_000_000;
      const wearDiscount = Math.max(0.2, (100 - m.wear) / 100);
      return sum + Math.round(baseEstimate * wearDiscount);
    }, 0);

    const facilityValue = state.facility.cleanroomPhase * 25_000_000;
    const debt = state.clawbackDebt || 0;

    return Math.max(0, cash + machineValue + facilityValue - debt);
  }

  /**
   * 記錄晶圓出貨收入
   */
  public static recordWaferSales(state: SaveGameV2, amount: number): void {
    const fin = this.ensureFinancialState(state);
    fin.today.revenue.waferSales += amount;
    fin.thisWeek.revenue.waferSales += amount;
    fin.thisMonth.revenue.waferSales += amount;
    fin.allTimeRevenue += amount;
    this.updateRecordTotals(fin.today, state);
    this.updateRecordTotals(fin.thisWeek, state);
    this.updateRecordTotals(fin.thisMonth, state);
  }

  /**
   * 記錄接單預付 NRE 光罩費
   */
  public static recordNREFee(state: SaveGameV2, amount: number): void {
    const fin = this.ensureFinancialState(state);
    fin.today.revenue.nreFees += amount;
    fin.thisWeek.revenue.nreFees += amount;
    fin.thisMonth.revenue.nreFees += amount;
    fin.allTimeRevenue += amount;
    this.updateRecordTotals(fin.today, state);
    this.updateRecordTotals(fin.thisWeek, state);
    this.updateRecordTotals(fin.thisMonth, state);
  }

  /**
   * 記錄任務或成就獎勵補助款
   */
  public static recordSubsidy(state: SaveGameV2, amount: number): void {
    const fin = this.ensureFinancialState(state);
    fin.today.revenue.subsidies += amount;
    fin.thisWeek.revenue.subsidies += amount;
    fin.thisMonth.revenue.subsidies += amount;
    fin.allTimeRevenue += amount;
    this.updateRecordTotals(fin.today, state);
    this.updateRecordTotals(fin.thisWeek, state);
    this.updateRecordTotals(fin.thisMonth, state);
  }

  /**
   * 記錄機台維修保養支出
   */
  public static recordMaintenance(state: SaveGameV2, amount: number): void {
    const fin = this.ensureFinancialState(state);
    fin.today.expenses.maintenance += amount;
    fin.thisWeek.expenses.maintenance += amount;
    fin.thisMonth.expenses.maintenance += amount;
    fin.allTimeExpenses += amount;
    this.updateRecordTotals(fin.today, state);
    this.updateRecordTotals(fin.thisWeek, state);
    this.updateRecordTotals(fin.thisMonth, state);
  }

  /**
   * 記錄購買設備資本支出 (CapEx)
   */
  public static recordCapEx(state: SaveGameV2, amount: number): void {
    const fin = this.ensureFinancialState(state);
    fin.today.expenses.capex += amount;
    fin.thisWeek.expenses.capex += amount;
    fin.thisMonth.expenses.capex += amount;
    fin.allTimeExpenses += amount;
    this.updateRecordTotals(fin.today, state);
    this.updateRecordTotals(fin.thisWeek, state);
    this.updateRecordTotals(fin.thisMonth, state);
  }

  /**
   * 記錄招聘簽約金
   */
  public static recordSigningBonus(state: SaveGameV2, amount: number): void {
    const fin = this.ensureFinancialState(state);
    fin.today.expenses.payroll += amount;
    fin.thisWeek.expenses.payroll += amount;
    fin.thisMonth.expenses.payroll += amount;
    fin.allTimeExpenses += amount;
    this.updateRecordTotals(fin.today, state);
    this.updateRecordTotals(fin.thisWeek, state);
    this.updateRecordTotals(fin.thisMonth, state);
  }

  /**
   * 記錄晶圓報廢或重洗損失
   */
  public static recordScrapLoss(state: SaveGameV2, amount: number): void {
    const fin = this.ensureFinancialState(state);
    fin.today.expenses.scraps += amount;
    fin.thisWeek.expenses.scraps += amount;
    fin.thisMonth.expenses.scraps += amount;
    fin.allTimeExpenses += amount;
    this.updateRecordTotals(fin.today, state);
    this.updateRecordTotals(fin.thisWeek, state);
    this.updateRecordTotals(fin.thisMonth, state);
  }

  /**
   * 每秒週期性模擬：折舊、水電化學耗損、薪資與 日/周/月 換日換周換月推進
   */
  public static tickSimulation(state: SaveGameV2, deltaSeconds: number = 1): void {
    const fin = this.ensureFinancialState(state);

    // 1. 機台折舊攤提 (每秒約 1,000 ~ 4,000 NT$)
    const machineDepr = state.machines.reduce((sum, m) => sum + m.tier * 1_200, 0) * deltaSeconds;
    fin.today.expenses.depreciation += Math.round(machineDepr);
    fin.thisWeek.expenses.depreciation += Math.round(machineDepr);
    fin.thisMonth.expenses.depreciation += Math.round(machineDepr);

    // 2. 無塵室能源與化學耗損 (水電 + 運轉耗材)
    const activeMachinesCount = state.machines.filter(m => m.status === 'PROCESSING').length;
    const utilityPerSec = state.facility.cleanroomPhase * 800 + activeMachinesCount * 600;
    const utilitiesTotal = utilityPerSec * deltaSeconds;
    fin.today.expenses.utilities += Math.round(utilitiesTotal);
    fin.thisWeek.expenses.utilities += Math.round(utilitiesTotal);
    fin.thisMonth.expenses.utilities += Math.round(utilitiesTotal);

    // 3. 員工薪資秒級攤提
    const monthlyPayroll = state.staff.reduce((sum, s) => sum + s.salary, 0);
    const payrollPerSec = monthlyPayroll / 300; // 300秒相當於工廠一個月流速
    const payrollTotal = payrollPerSec * deltaSeconds;
    fin.today.expenses.payroll += Math.round(payrollTotal);
    fin.thisWeek.expenses.payroll += Math.round(payrollTotal);
    fin.thisMonth.expenses.payroll += Math.round(payrollTotal);

    // 更新各週期總額
    this.updateRecordTotals(fin.today, state);
    this.updateRecordTotals(fin.thisWeek, state);
    this.updateRecordTotals(fin.thisMonth, state);

    // 4. 推進每日計時
    fin.daySeconds += deltaSeconds;
    if (fin.daySeconds >= this.DAY_SECONDS) {
      this.closeDay(state);
    }
  }

  /**
   * 換日結算 (Close Day)
   */
  public static closeDay(state: SaveGameV2): void {
    const fin = this.ensureFinancialState(state);
    this.updateRecordTotals(fin.today, state);

    // 存入日報歷史 (保留近 14 天)
    fin.dailyHistory.unshift(JSON.parse(JSON.stringify(fin.today)));
    if (fin.dailyHistory.length > 14) {
      fin.dailyHistory.pop();
    }

    fin.daySeconds = 0;
    fin.currentDay += 1;

    // 開啟全新的一日
    const nextDay = fin.currentDay;
    fin.today = this.createEmptyRecord(
      'DAY',
      nextDay,
      `第 ${nextDay} 天 (Day ${nextDay})`,
      state.player.cash,
      this.calculateCompanyNetWorth(state)
    );

    // 檢查是否跨周 (每 7 天換周)
    if (nextDay % this.DAYS_PER_WEEK === 1 && nextDay > 1) {
      this.closeWeek(state);
    }

    // 檢查是否跨月 (每 28 天換月)
    if (nextDay % this.DAYS_PER_MONTH === 1 && nextDay > 1) {
      this.closeMonth(state);
    }
  }

  /**
   * 換周結算 (Close Week)
   */
  public static closeWeek(state: SaveGameV2): void {
    const fin = this.ensureFinancialState(state);
    this.updateRecordTotals(fin.thisWeek, state);

    // 存入周報歷史 (保留近 8 周)
    fin.weeklyHistory.unshift(JSON.parse(JSON.stringify(fin.thisWeek)));
    if (fin.weeklyHistory.length > 8) {
      fin.weeklyHistory.pop();
    }

    fin.currentWeek += 1;
    const nextWeek = fin.currentWeek;
    fin.thisWeek = this.createEmptyRecord(
      'WEEK',
      nextWeek,
      `第 ${nextWeek} 周 (Week ${nextWeek})`,
      state.player.cash,
      this.calculateCompanyNetWorth(state)
    );
  }

  /**
   * 換月結算 (Close Month)
   */
  public static closeMonth(state: SaveGameV2): void {
    const fin = this.ensureFinancialState(state);
    this.updateRecordTotals(fin.thisMonth, state);

    // 存入月報歷史 (保留近 6 個月)
    fin.monthlyHistory.unshift(JSON.parse(JSON.stringify(fin.thisMonth)));
    if (fin.monthlyHistory.length > 6) {
      fin.monthlyHistory.pop();
    }

    fin.currentMonth += 1;
    const nextMonth = fin.currentMonth;
    fin.thisMonth = this.createEmptyRecord(
      'MONTH',
      nextMonth,
      `第 ${nextMonth} 個月 (Month ${nextMonth})`,
      state.player.cash,
      this.calculateCompanyNetWorth(state)
    );
  }

  /**
   * 即時重新計算單一週期之營收、支出、毛利與淨利指標
   */
  private static updateRecordTotals(r: FinancialRecord, state: SaveGameV2): void {
    r.revenue.totalRevenue = r.revenue.waferSales + r.revenue.nreFees + r.revenue.subsidies;
    r.expenses.totalExpenses = (
      r.expenses.depreciation +
      r.expenses.maintenance +
      r.expenses.utilities +
      r.expenses.payroll +
      r.expenses.scraps +
      r.expenses.capex
    );

    // 營業成本 COGS = 折舊 + 維修 + 水電 + 報廢
    const cogs = r.expenses.depreciation + r.expenses.maintenance + r.expenses.utilities + r.expenses.scraps;
    r.grossProfit = r.revenue.totalRevenue - cogs;
    r.grossMarginPct = r.revenue.totalRevenue > 0
      ? Number(((r.grossProfit / r.revenue.totalRevenue) * 100).toFixed(1))
      : 0;

    // 營業淨利 = 總營收 - (總支出扣除資產購置 Capex)
    const operatingExpenses = cogs + r.expenses.payroll;
    r.netProfit = r.revenue.totalRevenue - operatingExpenses;
    r.netMarginPct = r.revenue.totalRevenue > 0
      ? Number(((r.netProfit / r.revenue.totalRevenue) * 100).toFixed(1))
      : 0;

    r.endingCash = state.player.cash;
    r.endingNetWorth = this.calculateCompanyNetWorth(state);
  }

  /**
   * 確保 state.financialState 存在且向下相容
   */
  public static ensureFinancialState(state: SaveGameV2): FinancialState {
    if (!state.financialState || !state.financialState.today) {
      state.financialState = this.initFinancialState(state.player.cash, this.calculateCompanyNetWorth(state));
    }
    return state.financialState;
  }

  /**
   * 財務長 (CFO) 依據週期提供專業半導體財務診斷
   */
  public static generateCFOAdvisory(record: FinancialRecord, state: SaveGameV2): {
    rating: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
    title: string;
    advice: string;
    metrics: string;
  } {
    const rev = record.revenue.totalRevenue;
    const margin = record.grossMarginPct;
    const cash = state.player.cash;

    if (rev === 0) {
      return {
        rating: 'WARNING',
        title: '💤 產線待命中 — 週期營收缺口警示',
        advice: '本週期尚未認列任何晶圓出貨尾款或 NRE 光罩開發款，但固定水電與工程師薪資持續流出。請立即前往【合約公告板】承接高毛利訂單！',
        metrics: '毛利率: 0.0% | 產能營收: NT$ 0'
      };
    }

    if (cash < 10_000_000) {
      return {
        rating: 'CRITICAL',
        title: '🚨 流動資金偏低 — 嚴控資本開支',
        advice: '現金儲備低於安全水位！建議暫緩購買高價新機台，優先全力推進在製晶圓批次出貨，或檢查機台磨損避免意外炸機造成大修支出！',
        metrics: `流動現金: NT$ ${Math.round(cash).toLocaleString()}（建議最低安全門檻: NT$ 20,000,000）`
      };
    }

    if (margin >= 53.0) {
      return {
        rating: 'EXCELLENT',
        title: '🌟 傳奇毛利率 — 達到台積電 53% 卓越標竿！',
        advice: '恭喜！本週期毛利率高達 ' + margin + '%，超越全球半導體龍頭 53.0% 標竿！製程良率優異且 NRE 溢價充沛。建議積極將獲利轉入 CapEx 擴大產能，搶佔次世代製程領導地位！',
        metrics: `當期毛利率: ${margin}%（超越全球龍頭標竿 53.0% 達成！）`
      };
    }

    if (margin >= 35.0) {
      return {
        rating: 'GOOD',
        title: '⚖️ 獲利穩健 — 符合晶圓代工常態',
        advice: '收支結構健康，毛利率維持在良好的 35% ~ 50% 區間。建議透過 🛡️ TPM 在線保養維持零故障，並優化員工排班減少夜班過勞，進一步釋放產能。',
        metrics: `當期毛利率: ${margin}%（符合產業健康標準 35% ~ 45%）`
      };
    }

    return {
      rating: 'WARNING',
      title: '⚠️ 毛利受壓 — 成本與耗損偏高',
      advice: '本週期毛利率偏低，主要受限於機台維修頻繁、折舊沉重或報廢損失。建議檢查機台配對狀態與工程師職級，減少晶圓報廢，拉升合格晶粒產出比率。',
      metrics: `當期毛利率: ${margin}%（低於產業安全水準 35.0%）`
    };
  }
}
