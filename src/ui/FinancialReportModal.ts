/**
 * FinancialReportModal.ts
 * 負責半導體工廠「日、周、月」收支分析與財務報表中心：
 * 1. 📅 日收支分析 (Daily Statement) — 當日收支明細與近 14 天每日獲利長條圖
 * 2. 📊 周收支分析 (Weekly Statement) — 當周收支明細與近 8 周走勢圖
 * 3. 📈 月收支分析 (Monthly Statement) — 當月收支明細與近 6 個月宏觀走勢
 * 4. 營業收入 (晶圓出貨、NRE 款、補助)、營業成本 COGS (折舊、維修、水電、報廢)、費用 (薪資)、資本支出 (機台採購 CapEx)
 * 5. 毛利率 (TSMC 53% 標竿指標)、淨利率與財務長 (CFO) 營運診斷評語
 */

import { SaveGameV2, FinancialRecord } from '../types';
import { FinanceEngine } from '../engine/FinanceEngine';
import { SoundEffects } from '../audio/SoundEffects';

export class FinancialReportModal {
  private static activeTab: 'DAY' | 'WEEK' | 'MONTH' = 'DAY';

  public static show(state: SaveGameV2, onUpdate: () => void): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    FinanceEngine.ensureFinancialState(state);
    this.render(container, state, onUpdate);
  }

  private static render(container: HTMLElement, state: SaveGameV2, onUpdate: () => void): void {
    const fin = FinanceEngine.ensureFinancialState(state);

    // 依目前分頁取得對應當期與歷史數據
    let currentRecord: FinancialRecord = fin.today;
    let historyList: FinancialRecord[] = fin.dailyHistory;
    let tabTitle = '日收支分析';
    const todayStr = fin.currentDateStr || FinanceEngine.getTodayDateString();
    let periodDesc = `現實同步: 📅 ${todayStr} (今日進行中)`;

    if (this.activeTab === 'WEEK') {
      currentRecord = fin.thisWeek;
      historyList = fin.weeklyHistory;
      tabTitle = '周收支分析';
      periodDesc = `現實同步: 📅 本周累計 (${FinanceEngine.getWeekString()})`;
    } else if (this.activeTab === 'MONTH') {
      currentRecord = fin.thisMonth;
      historyList = fin.monthlyHistory;
      tabTitle = '月收支分析';
      periodDesc = `現實同步: 📅 本月累計 (${FinanceEngine.getMonthString()})`;
    }

    const cfoAdvice = FinanceEngine.generateCFOAdvisory(currentRecord, state);
    const netWorth = FinanceEngine.calculateCompanyNetWorth(state);

    container.innerHTML = `
      <div id="modal-backdrop-finance" class="modal-backdrop">
        <div class="modal-content max-w-4xl border border-cyan-500/40 bg-slate-950/95 shadow-2xl shadow-cyan-950/50 rounded-2xl flex flex-col max-h-[88vh] overflow-hidden animate-scaleUp">
          
          <!-- Header -->
          <div class="modal-header p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner text-cyan-300">
                📊
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base font-bold text-white tracking-wide">
                    半導體財務報表中心 — ${tabTitle}
                  </h2>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    P&L / Cash Flow
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <span>廠曆進度: <strong class="text-amber-300">${periodDesc}</strong></span>
                  <span>|</span>
                  <span>公司總淨值: <strong class="text-emerald-400">NT$ ${Math.round(netWorth).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            <button id="btn-close-finance" class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold border border-slate-700">
              ✕
            </button>
          </div>

          <!-- Tabs (日、周、月) -->
          <div class="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-2 flex-shrink-0">
            <button
              id="tab-finance-day"
              class="px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                this.activeTab === 'DAY'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }"
            >
              <span>📅 日收支分析 (Daily)</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">Day ${fin.currentDay}</span>
            </button>

            <button
              id="tab-finance-week"
              class="px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                this.activeTab === 'WEEK'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }"
            >
              <span>📊 周收支分析 (Weekly)</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-amber-400">Week ${fin.currentWeek}</span>
            </button>

            <button
              id="tab-finance-month"
              class="px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                this.activeTab === 'MONTH'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }"
            >
              <span>📈 月收支分析 (Monthly)</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-purple-400">Month ${fin.currentMonth}</span>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body p-5 overflow-y-auto flex-1 space-y-4">
            
            <!-- 頂部四大會計核心 KPI 矩陣 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <!-- 總營收 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-[10px] text-slate-400 font-medium">總營業收入 (Total Revenue)</div>
                <div class="text-base font-black font-mono text-cyan-300 mt-1">
                  NT$ ${Math.round(currentRecord.revenue.totalRevenue).toLocaleString()}
                </div>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                  出貨: NT$ ${Math.round(currentRecord.revenue.waferSales).toLocaleString()}
                </div>
              </div>

              <!-- 總營業支出 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-[10px] text-slate-400 font-medium">總營業支出 (Total Expenses)</div>
                <div class="text-base font-black font-mono text-amber-300 mt-1">
                  NT$ ${Math.round(currentRecord.expenses.totalExpenses).toLocaleString()}
                </div>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                  折舊/水電/薪資/維護/資本
                </div>
              </div>

              <!-- 營業毛利與毛利率 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border ${currentRecord.grossMarginPct >= 53.0 ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-800'}">
                <div class="text-[10px] text-slate-400 font-medium flex items-center justify-between">
                  <span>營業毛利率 (Gross Margin)</span>
                  ${currentRecord.grossMarginPct >= 53.0 ? '<span class="text-[9px] text-emerald-400 font-bold">★TSMC標竿</span>' : ''}
                </div>
                <div class="text-base font-black font-mono ${currentRecord.grossMarginPct >= 50.0 ? 'text-emerald-400' : (currentRecord.grossMarginPct >= 30 ? 'text-cyan-300' : 'text-amber-400')} mt-1">
                  ${currentRecord.grossMarginPct}%
                </div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                  毛利: NT$ ${Math.round(currentRecord.grossProfit).toLocaleString()}
                </div>
              </div>

              <!-- 淨利與淨利率 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-[10px] text-slate-400 font-medium">營業淨利潤 (Net Profit)</div>
                <div class="text-base font-black font-mono ${currentRecord.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} mt-1">
                  ${currentRecord.netProfit >= 0 ? '+' : ''}NT$ ${Math.round(currentRecord.netProfit).toLocaleString()}
                </div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                  淨利率: ${currentRecord.netMarginPct}%
                </div>
              </div>
            </div>

            <!-- 收支結構明細表 (Detailed Breakdown Table) -->
            <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📑</span>
                  <span>${currentRecord.label} — 收支會計明細科目</span>
                </span>
                <span class="text-[11px] font-mono text-slate-400">
                  期末留存現金: <strong class="text-amber-300">NT$ ${Math.round(currentRecord.endingCash).toLocaleString()}</strong>
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <!-- 收入欄 -->
                <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div class="text-[11px] font-bold text-cyan-300 border-b border-slate-800 pb-1 flex justify-between">
                    <span>【一、 營業收入科目 (Revenue)】</span>
                    <span>金額 (NT$)</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>晶圓代工出貨尾款 (Wafer Sales)</span>
                    <span class="font-bold text-slate-100">NT$ ${Math.round(currentRecord.revenue.waferSales).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>客戶 NRE 光罩開發款 (Mask Fees)</span>
                    <span class="font-bold text-slate-100">NT$ ${Math.round(currentRecord.revenue.nreFees).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>政府研發補助與成就獎勵 (Subsidies)</span>
                    <span class="font-bold text-slate-100">NT$ ${Math.round(currentRecord.revenue.subsidies).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-cyan-300 font-bold border-t border-slate-800 pt-1.5">
                    <span>營業收入總計 (Total Gross Revenue)</span>
                    <span>NT$ ${Math.round(currentRecord.revenue.totalRevenue).toLocaleString()}</span>
                  </div>
                </div>

                <!-- 支出欄 -->
                <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div class="text-[11px] font-bold text-amber-300 border-b border-slate-800 pb-1 flex justify-between">
                    <span>【二、 營業成本與費用 (Costs & Expenses)】</span>
                    <span>金額 (NT$)</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>機台運轉折舊攤提 (Depreciation)</span>
                    <span class="text-slate-200">NT$ ${Math.round(currentRecord.expenses.depreciation).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>設備日常保養與大修 (Maintenance)</span>
                    <span class="text-slate-200">NT$ ${Math.round(currentRecord.expenses.maintenance).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>超純水、特氣與無塵室電費 (Utilities)</span>
                    <span class="text-slate-200">NT$ ${Math.round(currentRecord.expenses.utilities).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>員工薪資與招募獎金 (Payroll & HR)</span>
                    <span class="text-slate-200">NT$ ${Math.round(currentRecord.expenses.payroll).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>晶圓不良報廢與重洗損失 (Scraps)</span>
                    <span class="text-slate-200">NT$ ${Math.round(currentRecord.expenses.scraps).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>機台設備採購支出 (CapEx)</span>
                    <span class="text-slate-200">NT$ ${Math.round(currentRecord.expenses.capex).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-amber-300 font-bold border-t border-slate-800 pt-1.5">
                    <span>總營業支出總計 (Total Expenses)</span>
                    <span>NT$ ${Math.round(currentRecord.expenses.totalExpenses).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 歷史走勢長條圖 (Historical Bar Chart) -->
            <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📈</span>
                  <span>歷史${tabTitle}獲利趨勢走勢圖 (近 ${historyList.length + 1} 期)</span>
                </span>
                <div class="flex items-center gap-3 text-[10px] font-mono">
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span> 營業收入</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> 營業支出</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> 淨獲利</span>
                </div>
              </div>

              <!-- 長條圖視覺容器 -->
              <div class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-end justify-between gap-2 h-44 overflow-x-auto pt-4">
                ${this.renderHistoryBars([currentRecord, ...historyList].slice(0, 10).reverse())}
              </div>
            </div>

            <!-- 財務長 (CFO) 營運診斷評語 (Executive Advisory) -->
            <div class="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border ${
              cfoAdvice.rating === 'EXCELLENT' ? 'border-emerald-500/60 bg-emerald-950/10' :
              cfoAdvice.rating === 'GOOD' ? 'border-cyan-500/50 bg-cyan-950/10' :
              cfoAdvice.rating === 'WARNING' ? 'border-amber-500/50 bg-amber-950/10' :
              'border-red-500/60 bg-red-950/10'
            } flex items-start gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0 shadow">
                🧑‍💼
              </div>
              <div class="space-y-1 text-xs">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-sm">${cfoAdvice.title}</span>
                  <span class="px-2 py-0.2 rounded text-[10px] font-mono ${
                    cfoAdvice.rating === 'EXCELLENT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                    cfoAdvice.rating === 'GOOD' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' :
                    cfoAdvice.rating === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                    'bg-red-950 text-red-300 border border-red-500/40'
                  }">
                    ${cfoAdvice.rating}
                  </span>
                </div>
                <p class="text-slate-300 leading-relaxed font-sans">
                  ${cfoAdvice.advice}
                </p>
                <div class="text-[11px] text-cyan-400 font-mono pt-0.5">
                  指標分析: ${cfoAdvice.metrics}
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <div class="text-xs text-slate-400 font-mono">
              全生涯累積營收: <strong class="text-cyan-300 font-bold">NT$ ${Math.round(fin.allTimeRevenue).toLocaleString()}</strong>
              <span class="mx-2">|</span>
              全生涯累積淨利: <strong class="${fin.allTimeProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} font-bold">NT$ ${Math.round(fin.allTimeProfit).toLocaleString()}</strong>
            </div>

            <button id="btn-back-finance" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, state, onUpdate);
  }

  /**
   * 渲染歷史走勢柱狀圖
   */
  private static renderHistoryBars(records: FinancialRecord[]): string {
    if (records.length === 0) {
      return `<div class="text-center w-full py-10 text-slate-500 text-xs font-mono">暫無足夠歷史數據，產線持續運轉中...</div>`;
    }

    // 找出最大值作為高度基準
    const maxVal = Math.max(...records.map(r => Math.max(r.revenue.totalRevenue, r.expenses.totalExpenses, Math.abs(r.netProfit))), 100_000);

    return records.map((r, idx) => {
      const isCurrent = idx === records.length - 1;
      const revHeight = Math.min(100, Math.max(4, Math.round((r.revenue.totalRevenue / maxVal) * 100)));
      const expHeight = Math.min(100, Math.max(4, Math.round((r.expenses.totalExpenses / maxVal) * 100)));
      const netHeight = Math.min(100, Math.max(4, Math.round((Math.abs(r.netProfit) / maxVal) * 100)));

      return `
        <div class="flex-1 flex flex-col items-center justify-end h-full min-w-[50px] group relative">
          <!-- Tooltip on hover -->
          <div class="absolute -top-12 bg-slate-900 border border-slate-700 text-[10px] text-white p-1.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
            <div>${r.label}</div>
            <div class="text-cyan-300">營收: NT$ ${Math.round(r.revenue.totalRevenue).toLocaleString()}</div>
            <div class="text-amber-300">支出: NT$ ${Math.round(r.expenses.totalExpenses).toLocaleString()}</div>
            <div class="${r.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}">淨利: NT$ ${Math.round(r.netProfit).toLocaleString()}</div>
          </div>

          <!-- Bar group -->
          <div class="flex items-end gap-1 w-full justify-center h-28 border-b border-slate-700/60 pb-1">
            <!-- 營收柱 -->
            <div
              class="w-2.5 rounded-t bg-cyan-500 group-hover:bg-cyan-400 transition-all shadow-sm"
              style="height: ${revHeight}%;"
              title="營業收入"
            ></div>
            <!-- 支出柱 -->
            <div
              class="w-2.5 rounded-t bg-amber-500 group-hover:bg-amber-400 transition-all shadow-sm"
              style="height: ${expHeight}%;"
              title="營業支出"
            ></div>
            <!-- 淨利柱 -->
            <div
              class="w-2.5 rounded-t ${r.netProfit >= 0 ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-red-500 group-hover:bg-red-400'} transition-all shadow-sm"
              style="height: ${netHeight}%;"
              title="營業淨利"
            ></div>
          </div>

          <!-- Label -->
          <div class="text-[9px] font-mono mt-1 truncate max-w-full ${isCurrent ? 'text-cyan-400 font-bold' : 'text-slate-400'}">
            ${r.periodType === 'DAY' ? `D${r.periodIndex}` : (r.periodType === 'WEEK' ? `W${r.periodIndex}` : `M${r.periodIndex}`)}
            ${isCurrent ? '*' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  private static bindEvents(container: HTMLElement, state: SaveGameV2, onUpdate: () => void): void {
    const closeModal = () => {
      SoundEffects.playClick();
      container.innerHTML = '';
      window.removeEventListener('keydown', onKeyDown);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    document.getElementById('btn-close-finance')?.addEventListener('click', closeModal);
    document.getElementById('btn-back-finance')?.addEventListener('click', closeModal);
    document.getElementById('modal-backdrop-finance')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-backdrop-finance')) {
        closeModal();
      }
    });

    // 分頁切換 (日、周、月)
    document.getElementById('tab-finance-day')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.activeTab = 'DAY';
      this.render(container, state, onUpdate);
    });

    document.getElementById('tab-finance-week')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.activeTab = 'WEEK';
      this.render(container, state, onUpdate);
    });

    document.getElementById('tab-finance-month')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.activeTab = 'MONTH';
      this.render(container, state, onUpdate);
    });
  }
}
