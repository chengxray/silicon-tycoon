/**
 * HRModal.ts
 * 負責半導體人才招募與人資管理中心：
 * 1. 招募三大職類與四大職級工程師（初級、熟練、資深主管、研發大師 Fellow）
 * 2. 嚴格分離【製程整合 PIE】（全廠訂單統籌，不進駐機台）與【模組/機台工程師】（進駐機台調校與保養）
 * 3. 廠務排班機制（週休二日制 / 四班二輪做二休二 / 三班制 24H 零故障 / 兩班制節流）
 * 4. 明確疲勞消除方式（週休強制排休、一鍵全員排休、撥發舒壓福利、個人帶薪休假、排休高速消疲勞）
 * 5. 6 名額人才招募市場（獨立倒數時效、60 秒逐位補滿、付費高階獵人頭刷新）
 */

import { SaveGameV2, StaffData, ShiftMode, WorkShift } from '../types';
import { SoundEffects } from '../audio/SoundEffects';
import { AchievementEngine } from '../engine/AchievementEngine';
import { MaintenanceEngine } from '../engine/MaintenanceEngine';
import { FinanceEngine } from '../engine/FinanceEngine';
import { HREngine } from '../engine/HREngine';
import { QuestEngine } from '../engine/QuestEngine';
import { SaveGameService } from '../services/SaveGameService';
import { CashFXManager } from './CashFXManager';

export class HRModal {
  private static activeTab: 'STAFF' | 'SCHEDULE' | 'MARKET' = 'STAFF';
  private static timerId: number | null = null;

  public static show(state: SaveGameV2, onUpdate: () => void): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    // 確保市場候選人池存在並檢驗時效
    HREngine.checkMarketCandidatesExpiry(state);

    // 清除既有計時器
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    // 啟動 1 秒倒數與時效同步定時器
    this.timerId = window.setInterval(() => {
      if (!document.getElementById('modal-backdrop-hr')) {
        if (HRModal.timerId) {
          clearInterval(HRModal.timerId);
          HRModal.timerId = null;
        }
        return;
      }

      const hadChanges = HREngine.checkMarketCandidatesExpiry(state);
      if (HRModal.activeTab === 'MARKET') {
        if (hadChanges) {
          onUpdate();
          HRModal.render(container, state, onUpdate);
        } else {
          HRModal.updateMarketTimers(state);
        }
      }
    }, 1000);

    this.render(container, state, onUpdate);
  }

  /**
   * 即時更新市場候選人倒數秒數標籤，避免整頁重新渲染抖動
   */
  private static updateMarketTimers(state: SaveGameV2): void {
    const candidates = state.marketCandidates || [];
    const now = Date.now();

    candidates.forEach((can, idx) => {
      const el = document.getElementById(`candidate-timer-${idx}`);
      if (el) {
        const remainingSec = Math.max(0, Math.ceil(((can.marketExpiresAt || 0) - now) / 1000));
        el.textContent = remainingSec > 0 ? `⏳ 剩餘考慮: ${remainingSec}s` : '⌛ 即將換人';
      }
    });

    const nextRespawnEl = document.getElementById('market-respawn-countdown');
    if (nextRespawnEl && state.nextCandidateRespawnTime) {
      const respawnSec = Math.max(0, Math.ceil((state.nextCandidateRespawnTime - now) / 1000));
      nextRespawnEl.textContent = respawnSec > 0 ? `${respawnSec}s` : '即將抵達';
    }
  }

  private static render(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    const totalPayroll = state.staff.reduce((sum, s) => sum + s.salary, 0);
    const globalShift: ShiftMode = state.staff[0]?.shiftMode || 'WEEKEND_REST';
    const marketCandidates = state.marketCandidates || [];

    container.innerHTML = `
      <div id="modal-backdrop-hr" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-5xl max-h-[92vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl flex-shrink-0">
                👥
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>半導體人才與廠務人資中心</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                    在職員工: ${state.staff.length} 人
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  嚴格分離【製程整合 PIE】全廠訂單統籌與【模組設備工程師】機台駐守維修，靈活排班消除疲勞！
                </p>
              </div>
            </div>

            <button id="btn-close-hr" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉人資中心">
              ✕
            </button>
          </div>

          <!-- Shift & Payroll Banner -->
          <div class="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs flex-shrink-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-slate-400 font-semibold">廠區現行輪班制度:</span>
              <span class="px-2.5 py-1 rounded-lg font-bold font-mono border ${
                globalShift === 'WEEKEND_REST'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : globalShift === 'TWO_ON_TWO_OFF'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : globalShift === 'THREE_SHIFT'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }">
                ${
                  globalShift === 'WEEKEND_REST'
                    ? '🏖️ 週休二日制 (六日全員自動排休消疲勞)'
                    : globalShift === 'TWO_ON_TWO_OFF'
                    ? '🔄 四班二輪 (做二休二，台積電高彈性常態)'
                    : globalShift === 'THREE_SHIFT'
                    ? '🛡️ 三班制 (24H 在線 TPM 零故障防護)'
                    : '⚡ 兩班制 (節省 33% 薪水，疲勞累積快)'
                }
              </span>
            </div>

            <div class="flex items-center gap-4">
              <div>
                <span class="text-slate-400">每月人事薪資總額: </span>
                <span class="font-mono font-bold text-amber-300">NT$ ${totalPayroll.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="flex items-center border-b border-slate-700/60 bg-slate-900/40 px-6 pt-2 flex-shrink-0">
            <button
              id="tab-staff"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                this.activeTab === 'STAFF' ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }"
            >
              <span>🧑‍🔬 全部員工職務</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${state.staff.length}</span>
            </button>
            <button
              id="tab-schedule"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                this.activeTab === 'SCHEDULE' ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }"
            >
              <span>📅 廠務排班與休假</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">${state.staff.length}人排班</span>
            </button>
            <button
              id="tab-market"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                this.activeTab === 'MARKET' ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }"
            >
              <span>🤝 人才招募市場</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-purple-400">${marketCandidates.length} / 6</span>
            </button>

            ${this.activeTab === 'MARKET' ? `
              <button id="btn-headhunter-refresh" class="ml-auto btn-sci-fi text-[11px] py-1 px-3 my-1 bg-purple-900/50 hover:bg-purple-800/60 border-purple-500/40 text-purple-200 font-bold" title="花費 NT$ 50,000 立即更換全批 6 位候選人">
                👔 派遣高階獵人頭顧問 (付費換批 NT$ 50,000)
              </button>
            ` : ''}
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${
              this.activeTab === 'STAFF'
                ? this.renderStaffTab(state)
                : this.activeTab === 'SCHEDULE'
                ? this.renderScheduleTab(state)
                : this.renderMarketTab(state)
            }
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <div class="text-[11px] text-slate-400">
              💡 提示：排休狀態 (OFF) 之員工疲勞消退速率高達 <strong class="text-emerald-300 font-mono">-2.0%/s</strong>，約 40 秒即可由全滿降至 0%！
            </div>
            <button id="btn-back-hr" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, state, onUpdate);
  }

  private static renderScheduleTab(state: SaveGameV2): string {
    if (state.staff.length === 0) {
      return `
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">📅</div>
          <p class="text-sm">廠內目前尚未招募任何員工，無法進行排班！請先前往「人才招募市場」進行招聘。</p>
        </div>
      `;
    }

    const globalShift: ShiftMode = state.staff[0]?.shiftMode || 'WEEKEND_REST';
    const isWeekend = HREngine.isWeekend();

    const dayCount = state.staff.filter(s => (s.workShift || 'DAY') === 'DAY').length;
    const swingCount = state.staff.filter(s => s.workShift === 'SWING').length;
    const nightCount = state.staff.filter(s => s.workShift === 'NIGHT').length;
    const offCount = state.staff.filter(s => s.workShift === 'OFF').length;

    const has24HCoverage = dayCount > 0 && swingCount > 0 && nightCount > 0;

    return `
      <div class="space-y-4">
        <!-- 輪班機制切換卡片 (4 大排班制度) -->
        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-bold text-slate-300">選擇晶圓廠輪班體系 (套用至全廠同仁)：</span>
            <span class="text-[11px] text-slate-400">系統即時判定排班與體力消耗規則</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <!-- 1. 週休二日制 -->
            <button
              class="btn-select-shift-mode p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                globalShift === 'WEEKEND_REST'
                  ? 'bg-emerald-950/60 border-emerald-500/70 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }"
              data-mode="WEEKEND_REST"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold ${globalShift === 'WEEKEND_REST' ? 'text-emerald-300' : 'text-slate-200'}">🏖️ 週休二日制</span>
                  ${globalShift === 'WEEKEND_REST' ? '<span class="text-[10px] text-emerald-400 font-bold">現行</span>' : ''}
                </div>
                <div class="text-[11px] text-slate-400 mt-1">
                  週六與週日全廠強制排休，疲勞以 <strong class="text-emerald-300">-2.0%/s</strong> 歸零恢復！平日正常三班均衡值勤。
                </div>
              </div>
              <div class="text-[10px] text-emerald-400/80 font-mono mt-2 pt-1 border-t border-slate-800/80">
                勞基法首選・疲勞自癒防炸機
              </div>
            </button>

            <!-- 2. 四班二輪制 -->
            <button
              class="btn-select-shift-mode p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                globalShift === 'TWO_ON_TWO_OFF'
                  ? 'bg-sky-950/60 border-sky-500/70 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }"
              data-mode="TWO_ON_TWO_OFF"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold ${globalShift === 'TWO_ON_TWO_OFF' ? 'text-sky-300' : 'text-slate-200'}">🔄 四班二輪制</span>
                  ${globalShift === 'TWO_ON_TWO_OFF' ? '<span class="text-[10px] text-sky-400 font-bold">現行</span>' : ''}
                </div>
                <div class="text-[11px] text-slate-400 mt-1">
                  做二休二日夜輪替，兩組人員常態交換休假與值班，兼顧 24H 連續運轉與規律消疲勞。
                </div>
              </div>
              <div class="text-[10px] text-sky-400/80 font-mono mt-2 pt-1 border-t border-slate-800/80">
                半導體標竿・台積電常態輪調
              </div>
            </button>

            <!-- 3. 三班制 24H 在線 -->
            <button
              class="btn-select-shift-mode p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                globalShift === 'THREE_SHIFT'
                  ? 'bg-purple-950/60 border-purple-500/70 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }"
              data-mode="THREE_SHIFT"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold ${globalShift === 'THREE_SHIFT' ? 'text-purple-300' : 'text-slate-200'}">🛡️ 三班制 24H</span>
                  ${globalShift === 'THREE_SHIFT' ? '<span class="text-[10px] text-purple-400 font-bold">現行</span>' : ''}
                </div>
                <div class="text-[11px] text-slate-400 mt-1">
                  早中夜三班完整無縫覆蓋，只要駐廠工程師職級符合且疲勞 &lt; 50%，達成在線 TPM 零故障！
                </div>
              </div>
              <div class="text-[10px] text-purple-400/80 font-mono mt-2 pt-1 border-t border-slate-800/80">
                產能極致・需足夠人手輪替
              </div>
            </button>

            <!-- 4. 兩班制 節流 -->
            <button
              class="btn-select-shift-mode p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                globalShift === 'TWO_SHIFT'
                  ? 'bg-amber-950/60 border-amber-500/70 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }"
              data-mode="TWO_SHIFT"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold ${globalShift === 'TWO_SHIFT' ? 'text-amber-300' : 'text-slate-200'}">⚡ 兩班制 (省 33%)</span>
                  ${globalShift === 'TWO_SHIFT' ? '<span class="text-[10px] text-amber-400 font-bold">現行</span>' : ''}
                </div>
                <div class="text-[11px] text-slate-400 mt-1">
                  節省 33% 員工薪資支出，僅值早班與中班，大夜班無人看管，疲勞累積較快。
                </div>
              </div>
              <div class="text-[10px] text-amber-400/80 font-mono mt-2 pt-1 border-t border-slate-800/80">
                草創省錢・注意機台磨損
              </div>
            </button>
          </div>
        </div>

        <!-- 週末休假與 24H 覆蓋狀態橫幅 -->
        ${
          globalShift === 'WEEKEND_REST' && isWeekend
            ? `
              <div class="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/70 flex items-center justify-between gap-3 text-xs text-emerald-200 animate-pulse">
                <div class="flex items-center gap-2.5">
                  <span class="text-2xl">🏖️</span>
                  <div>
                    <span class="font-bold text-sm text-emerald-300">【週末公休日】週休二日制生效中！</span>
                    <div class="text-[11px] text-emerald-300/80 mt-0.5">全體同仁自動進入強制休假狀態，疲勞正以極速 <strong class="text-white font-mono">-2.0%/s</strong> 消除回血中。</div>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded bg-emerald-900 border border-emerald-400 text-xs font-mono font-bold text-white flex-shrink-0">
                  週六 / 週日公休中
                </span>
              </div>
            `
            : ''
        }

        <div class="p-4 rounded-xl bg-slate-900/90 border ${has24HCoverage ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-amber-500/40 bg-amber-950/10'} flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base">${has24HCoverage ? '🛡️' : '⚠️'}</span>
              <span class="text-sm font-bold ${has24HCoverage ? 'text-emerald-300' : 'text-amber-300'}">
                ${has24HCoverage ? '全廠 24H 輪班完整覆蓋 (維持 TPM 零故障在線保證)' : '全廠 24H 輪班存在時段空窗 (缺乏工程師在線看管)'}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              ${has24HCoverage 
                ? '早班、中班與大夜班均有人員駐守，只要機台專長職等符合且疲勞 < 50%，即可維持 0% 故障率！' 
                : '注意：若某班別缺少駐廠工程師，該時段機台將無法享受在線預防保養，磨損率將正常累積！'}
            </p>
          </div>

          <!-- 各班人數統計膠囊 -->
          <div class="flex items-center gap-2 text-xs font-mono flex-wrap">
            <span class="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-500/30">
              ☀️ 早班: ${dayCount}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/30">
              🌆 中班: ${swingCount}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30">
              🌙 夜班: ${nightCount}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              🏖️ 排休: ${offCount}
            </span>
          </div>
        </div>

        <!-- 快捷一鍵排班與舒壓福利操作欄 -->
        <div class="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
          <span class="text-slate-400 font-medium">全廠快捷排班與疲勞消除輔助：</span>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="btn-preset-balanced" class="btn-sci-fi text-xs py-1 px-3 bg-cyan-900/50 hover:bg-cyan-800/60 border-cyan-500/40">
              🔄 一鍵均衡三班
            </button>
            <button id="btn-preset-day-only" class="btn-sci-fi text-xs py-1 px-3 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300">
              ☀️ 一鍵集中早班
            </button>
            <button id="btn-preset-tpm-opt" class="btn-sci-fi text-xs py-1 px-3 bg-emerald-900/50 hover:bg-emerald-800/60 border-emerald-500/40 text-emerald-200 font-bold">
              🛡️ TPM 最佳化排班
            </button>
            <button id="btn-all-off" class="btn-sci-fi text-xs py-1 px-3 bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60 text-emerald-300 font-bold" title="將全體員工排定為排休狀態，迅速消除疲勞">
              🏖️ 一鍵全員排休
            </button>
            <button id="btn-company-wellness" class="btn-sci-fi text-xs py-1 px-3 bg-amber-950/80 hover:bg-amber-900 border-amber-500/60 text-amber-200 font-bold" title="撥發全員紓壓津貼 (NT$ 2,000/人)，立即消除全員 25% 疲勞度">
              💆 撥發全員舒壓福利 (NT$ ${(state.staff.length * 2000).toLocaleString()})
            </button>
          </div>
        </div>

        <!-- 全體員工手動班表矩陣 (修正 flex-wrap 確保排休按鈕永不被遮蔽) -->
        <div class="space-y-2.5">
          ${state.staff.map((staff) => {
            const currentShift = staff.workShift || 'DAY';
            const assignedMachine = state.machines.find(m => m.id === staff.assignedMachineId);

            return `
              <div class="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                    🧑‍🔬
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-white text-sm">${staff.name}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        ${staff.rank}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono ${staff.moduleSpecialty === 'PIE' ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold' : 'bg-cyan-500/20 text-cyan-300'}">
                        ${staff.moduleSpecialty === 'PIE' ? '👨‍💼 製程整合 PIE' : staff.moduleSpecialty}
                      </span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono flex-wrap">
                      <span>崗位: <strong class="text-slate-200">${staff.moduleSpecialty === 'PIE' ? '全廠合約訂單' : (assignedMachine ? assignedMachine.name : '待命未指派')}</strong></span>
                      <span>|</span>
                      <span>疲勞度: <strong class="${staff.fatigue >= 60 ? 'text-red-400 font-bold animate-pulse' : (staff.fatigue >= 30 ? 'text-amber-400' : 'text-emerald-400')}">${Math.round(staff.fatigue)}%</strong></span>
                      ${staff.fatigue >= 60 ? '<span class="text-[10px] text-red-400 font-bold">⚠️ 極度疲倦！建議安排休假</span>' : ''}
                    </div>
                  </div>
                </div>

                <!-- 手動班別與帶薪休假按鈕組 (含 flex-wrap 與個別休假消疲勞) -->
                <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-start md:justify-end">
                  <button
                    class="btn-paid-leave px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 transition-all cursor-pointer flex items-center gap-1"
                    data-staff-id="${staff.id}"
                    title="支付 NT$ 3,000 帶薪休假津貼，立即消除 40% 疲勞並轉入排休狀態"
                  >
                    <span>☕ 帶薪休假 (-40% 疲勞 / NT$ 3,000)</span>
                  </button>

                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentShift === 'DAY'
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30 border border-sky-400'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }"
                    data-staff-id="${staff.id}"
                    data-shift="DAY"
                    title="早班: 07:00 ~ 15:00 (常規疲勞速率)"
                  >
                    ☀️ 早班 (07-15)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentShift === 'SWING'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30 border border-amber-400'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }"
                    data-staff-id="${staff.id}"
                    data-shift="SWING"
                    title="中班: 15:00 ~ 23:00 (常規疲勞速率)"
                  >
                    🌆 中班 (15-23)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentShift === 'NIGHT'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }"
                    data-staff-id="${staff.id}"
                    data-shift="NIGHT"
                    title="夜班: 23:00 ~ 07:00 (大夜班需充足輪調)"
                  >
                    🌙 夜班 (23-07)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentShift === 'OFF'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-400 font-bold'
                        : 'bg-slate-950 text-emerald-400 hover:text-white border border-slate-800'
                    }"
                    data-staff-id="${staff.id}"
                    data-shift="OFF"
                    title="排休: 暫停進駐機台，快速恢復體力 (-2.0%/s) 歸零疲勞"
                  >
                    🏖️ 排休 (OFF)
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private static renderStaffTab(state: SaveGameV2): string {
    if (state.staff.length === 0) {
      return `
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">👥</div>
          <p class="text-sm">廠內目前尚未招募任何工程師，請前往「人才招募市場」進行招聘！</p>
        </div>
      `;
    }

    return `
      <div class="space-y-3">
        ${state.staff.map((staff) => {
          const isPie = staff.moduleSpecialty === 'PIE';
          const assignedMachine = state.machines.find(m => m.id === staff.assignedMachineId);
          
          // 檢查 TPM 與炸機風險 (僅限機台工程師)
          let isTPMActive = false;
          let isExplosionRisk = false;

          if (!isPie && assignedMachine) {
            isTPMActive = MaintenanceEngine.checkTPMConditions(assignedMachine, staff).isTPMActive;
            isExplosionRisk = MaintenanceEngine.checkExplosionRisk(assignedMachine, staff).hasRisk;
          }

          return `
            <div class="p-4 rounded-xl bg-slate-900/80 border ${isExplosionRisk ? 'border-red-600/60 bg-red-950/10' : (isTPMActive ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800')} flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <!-- Info -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                  🧑‍🔬
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-white">${staff.name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ${staff.rank}
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${isPie ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}">
                      ${isPie ? '👨‍💼 製程整合 PIE' : '模組專長: ' + staff.moduleSpecialty}
                    </span>
                  </div>

                  <div class="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>核定月薪: NT$ ${staff.salary.toLocaleString()}</span>
                    <span>|</span>
                    <span>疲勞度: <strong class="${staff.fatigue >= 60 ? 'text-red-400' : 'text-emerald-400'}">${Math.round(staff.fatigue)}%</strong></span>
                    <span>|</span>
                    <span>班別: <strong class="text-slate-200">${staff.workShift || 'DAY'}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Machine Assignment Dropdown OR PIE Badge (徹底分離) -->
              <div class="flex flex-col gap-1 w-full md:w-72">
                ${
                  isPie
                    ? `
                      <label class="text-[10px] text-indigo-400 font-bold">職責崗位 (全廠跨站點整合):</label>
                      <div class="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 flex items-start gap-2">
                        <span class="text-base flex-shrink-0">👨‍💼</span>
                        <div>
                          <div class="font-bold text-indigo-300">製程整合 (PIE) 全廠統籌</div>
                          <div class="text-[10px] text-slate-300 mt-0.5">
                            專責全廠工藝良率與進度提升，請至【訂單中心】指派此工程師。不進駐單一機台。
                          </div>
                        </div>
                      </div>
                    `
                    : `
                      <label class="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>進駐機台指派 (模組維護調校):</span>
                        <span class="text-[10px] text-cyan-400/90 font-mono">支援交換崗位</span>
                      </label>
                      <select class="select-machine select-sci-fi text-xs py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200" data-staff-id="${staff.id}">
                        <option value="">-- 未指派機台 (待命/休假) --</option>
                        ${state.machines.map(m => {
                          const isSpecialtyMatch = m.category === staff.moduleSpecialty;
                          const isCurrentlyAssigned = staff.assignedMachineId === m.id;
                          const otherStaff = m.assignedEngineerId && m.assignedEngineerId !== staff.id
                            ? state.staff.find(s => s.id === m.assignedEngineerId)
                            : null;

                          let statusPrefix = '🟢 [機台空置]';
                          let statusSuffix = '';
                          if (isCurrentlyAssigned) {
                            statusPrefix = '🔵 [目前進駐]';
                          } else if (otherStaff) {
                            statusPrefix = `🔄 [已由 ${otherStaff.name} 進駐]`;
                            statusSuffix = ' ➔ 選取將交換崗位';
                          }

                          return `
                            <option value="${m.id}" ${isCurrentlyAssigned ? 'selected' : ''}>
                              ${statusPrefix} ${m.name} (${m.category} T${m.tier}) ${isSpecialtyMatch ? '★專長吻合' : ''}${statusSuffix}
                            </option>
                          `;
                        }).join('')}
                      </select>

                      ${isTPMActive ? `
                        <div class="text-[11px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                          <span>🛡️</span>
                          <span>TPM 24H 零故障在線維護保證中！</span>
                        </div>
                      ` : ''}
                      ${isExplosionRisk ? `
                        <div class="text-[11px] text-red-400 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                          <span>💥</span>
                          <span>越級操作！存在 25% 炸機風險！</span>
                        </div>
                      ` : ''}
                    `
                }
              </div>

              <!-- Actions -->
              <div>
                <button
                  class="btn-fire-staff px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors"
                  data-staff-id="${staff.id}"
                >
                  解雇資遣
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private static renderMarketTab(state: SaveGameV2): string {
    const candidates = state.marketCandidates || [];

    return `
      <div class="space-y-4">
        <!-- 人才市場機制資訊欄 -->
        <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-slate-300 font-bold">🤝 晶圓人才招募看板</span>
            <span class="text-slate-400">| 當前求職市場公開候選人: <strong class="text-purple-300 font-mono">${candidates.length} / 6</strong> 位</span>
            ${
              candidates.length < 6 && state.nextCandidateRespawnTime
                ? `
                  <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono">
                    ⏳ 下位求職者抵達倒數: <strong id="market-respawn-countdown">${Math.max(0, Math.ceil((state.nextCandidateRespawnTime - Date.now()) / 1000))}s</strong>
                  </span>
                `
                : ''
            }
          </div>
          <div class="text-[11px] text-slate-400">
            每位候選人皆有個人考慮倒數時效，逾期將轉赴其他半導體大廠！
          </div>
        </div>

        <!-- 6 名額人才候選人卡片網格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${candidates.map((can, idx) => {
            const canAfford = state.player.cash >= can.signingBonus;
            const remainingSec = Math.max(0, Math.ceil(((can.marketExpiresAt || 0) - Date.now()) / 1000));
            const isPie = can.moduleSpecialty === 'PIE';

            return `
              <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3">
                
                <!-- 標題與時效 -->
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                        🧑‍💻
                      </div>
                      <div>
                        <div class="font-bold text-white text-sm">${can.name}</div>
                        <div class="text-[11px] text-purple-300 font-semibold font-mono">${can.rank}</div>
                      </div>
                    </div>

                    <span class="px-2 py-0.5 rounded text-[10px] font-mono flex-shrink-0 ${isPie ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}">
                      ${isPie ? '👨‍💼 製程整合 PIE' : '模組: ' + can.moduleSpecialty}
                    </span>
                  </div>

                  <!-- 倒數時效標籤 -->
                  <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
                    <span id="candidate-timer-${idx}" class="market-timer-badge px-2 py-0.5 rounded font-mono bg-slate-950 text-amber-300 border border-amber-500/30">
                      ${remainingSec > 0 ? `⏳ 剩餘考慮: ${remainingSec}s` : '⌛ 即將換人'}
                    </span>
                    <span class="text-slate-400 font-mono">${isPie ? '全廠跨站點整合' : '機台駐守調機維護'}</span>
                  </div>
                </div>

                <!-- 描述 -->
                <div class="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 min-h-[50px] flex items-center">
                  ${can.description}
                </div>

                <!-- 薪資條件 -->
                <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <div>
                    <div class="text-[10px] text-slate-400">簽約獎金 (一次性)</div>
                    <div class="font-mono font-bold text-amber-300">NT$ ${can.signingBonus.toLocaleString()}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-[10px] text-slate-400">核定月薪</div>
                    <div class="font-mono font-semibold text-slate-200">NT$ ${can.salary.toLocaleString()} /月</div>
                  </div>
                </div>

                <!-- 聘任按鈕 -->
                <button
                  class="btn-hire-candidate btn-sci-fi w-full justify-center text-xs py-2 ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}"
                  data-index="${idx}"
                  ${!canAfford ? 'disabled' : ''}
                >
                  ${canAfford ? `🤝 簽約聘任 (支付 NT$ ${can.signingBonus.toLocaleString()})` : '資金不足以支付簽約金'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private static bindEvents(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    const closeModal = () => {
      SoundEffects.playClick();
      if (HRModal.timerId) {
        clearInterval(HRModal.timerId);
        HRModal.timerId = null;
      }
      container.innerHTML = '';
      window.removeEventListener('keydown', onKeyDown);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // 關閉
    document.getElementById('btn-close-hr')?.addEventListener('click', closeModal);
    document.getElementById('btn-back-hr')?.addEventListener('click', closeModal);

    // 點擊背景關閉
    document.getElementById('modal-backdrop-hr')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-backdrop-hr')) {
        closeModal();
      }
    });

    // 分頁切換
    document.getElementById('tab-staff')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.activeTab = 'STAFF';
      this.render(container, state, onUpdate);
    });

    document.getElementById('tab-schedule')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.activeTab = 'SCHEDULE';
      this.render(container, state, onUpdate);
    });

    document.getElementById('tab-market')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.activeTab = 'MARKET';
      this.render(container, state, onUpdate);
    });

    // 廠務排班體系切換 (4 大模式)
    container.querySelectorAll('.btn-select-shift-mode').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = (e.currentTarget as HTMLElement).getAttribute('data-mode') as ShiftMode;
        if (!mode) return;

        SoundEffects.playClick();
        HREngine.applyShiftMode(state, mode);
        onUpdate();
        this.render(container, state, onUpdate);
      });
    });

    // 快捷排班工具：均衡三班
    document.getElementById('btn-preset-balanced')?.addEventListener('click', () => {
      SoundEffects.playClick();
      const shifts: WorkShift[] = ['DAY', 'SWING', 'NIGHT'];
      state.staff.forEach((s, idx) => {
        s.workShift = shifts[idx % 3];
      });
      onUpdate();
      this.render(container, state, onUpdate);
    });

    // 快捷排班工具：集中早班
    document.getElementById('btn-preset-day-only')?.addEventListener('click', () => {
      SoundEffects.playClick();
      state.staff.forEach((s) => {
        s.workShift = 'DAY';
      });
      onUpdate();
      this.render(container, state, onUpdate);
    });

    // 快捷排班工具：TPM 最佳化
    document.getElementById('btn-preset-tpm-opt')?.addEventListener('click', () => {
      SoundEffects.playClick();
      const shifts: WorkShift[] = ['DAY', 'SWING', 'NIGHT'];
      let activeIdx = 0;
      state.staff.forEach((s) => {
        if (s.fatigue >= 60) {
          s.workShift = 'OFF';
        } else {
          s.workShift = shifts[activeIdx % 3];
          activeIdx++;
        }
      });
      onUpdate();
      this.render(container, state, onUpdate);
    });

    // 快捷排班工具：一鍵全員排休 (OFF)
    document.getElementById('btn-all-off')?.addEventListener('click', () => {
      SoundEffects.playClick();
      state.staff.forEach(s => {
        s.workShift = 'OFF';
      });
      onUpdate();
      this.render(container, state, onUpdate);
    });

    // 快捷福利工具：撥發全員舒壓福利
    document.getElementById('btn-company-wellness')?.addEventListener('click', (e) => {
      if (state.staff.length === 0) return;
      const costPerStaff = 2000;
      const totalCost = state.staff.length * costPerStaff;

      if (state.player.cash < totalCost) {
        alert(`資金不足！撥發全員舒壓福利需 NT$ ${totalCost.toLocaleString()}`);
        return;
      }

      state.player.cash -= totalCost;
      FinanceEngine.recordLaborCost(state, totalCost);
      CashFXManager.trigger(-totalCost, e.currentTarget as HTMLElement);
      SoundEffects.playCoinChime();

      state.staff.forEach(s => {
        s.fatigue = Math.max(0, s.fatigue - 25);
      });

      onUpdate();
      this.render(container, state, onUpdate);
    });

    // 個別員工帶薪休假 (-40% 疲勞 / NT$ 3,000)
    container.querySelectorAll('.btn-paid-leave').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const staffId = (e.currentTarget as HTMLElement).getAttribute('data-staff-id');
        const staff = state.staff.find(s => s.id === staffId);
        if (!staff) return;

        const COST = 3000;
        if (state.player.cash < COST) {
          alert('資金不足，無法支付個人帶薪休假津貼 (需 NT$ 3,000)！');
          return;
        }

        state.player.cash -= COST;
        FinanceEngine.recordLaborCost(state, COST);
        CashFXManager.trigger(-COST, e.currentTarget as HTMLElement);
        SoundEffects.playCoinChime();

        staff.fatigue = Math.max(0, staff.fatigue - 40);
        staff.workShift = 'OFF';

        onUpdate();
        this.render(container, state, onUpdate);
      });
    });

    // 手動班別按鈕切換
    container.querySelectorAll('.btn-shift-select').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const staffId = target.getAttribute('data-staff-id');
        const shift = target.getAttribute('data-shift') as WorkShift;
        const staff = state.staff.find(s => s.id === staffId);
        if (!staff || !shift) return;

        staff.workShift = shift;
        SoundEffects.playClick();
        onUpdate();
        this.render(container, state, onUpdate);
      });
    });

    // 高階獵人頭顧問刷新全部 6 位候選人
    document.getElementById('btn-headhunter-refresh')?.addEventListener('click', (e) => {
      const COST = 50000;
      if (state.player.cash < COST) {
        alert(`資金不足！派遣高階獵人頭顧問需 NT$ ${COST.toLocaleString()}`);
        return;
      }

      state.player.cash -= COST;
      FinanceEngine.recordLaborCost(state, COST);
      CashFXManager.trigger(-COST, e.currentTarget as HTMLElement);
      SoundEffects.playCoinChime();

      HREngine.forceRefreshAllCandidates(state);
      onUpdate();
      this.render(container, state, onUpdate);
    });

    // 簽約招聘
    container.querySelectorAll('.btn-hire-candidate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0', 10);
        const candidates = state.marketCandidates || [];
        const can = candidates[idx];
        if (!can) return;

        if (state.player.cash < can.signingBonus) {
          alert('資金不足，無法支付簽約獎金！');
          return;
        }

        // 扣款與入職員工
        state.player.cash -= can.signingBonus;
        FinanceEngine.recordSigningBonus(state, can.signingBonus);
        CashFXManager.trigger(-can.signingBonus, e.currentTarget as HTMLElement);
        SoundEffects.playCoinChime();

        const currentShift = state.staff[0]?.shiftMode || 'WEEKEND_REST';
        const newStaff: StaffData = {
          id: `STF-${Date.now().toString(36).toUpperCase().slice(-5)}`,
          name: can.name,
          rank: can.rank,
          moduleSpecialty: can.moduleSpecialty,
          fatigue: 15,
          shiftMode: currentShift,
          workShift: 'DAY',
          assignedMachineId: null,
          salary: can.salary
        };

        state.staff.push(newStaff);
        // 從候選人池移除
        candidates.splice(idx, 1);
        if (!state.nextCandidateRespawnTime) {
          state.nextCandidateRespawnTime = Date.now() + HREngine.REPLENISH_COOLDOWN_MS;
        }

        // 成就檢核
        AchievementEngine.checkAchievements(state);

        onUpdate();
        this.activeTab = 'STAFF';
        this.render(container, state, onUpdate);
      });
    });

    // 指派機台下拉 (僅模組工程師，支援雙向「交換崗位」)
    container.querySelectorAll('.select-machine').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const staffId = (e.currentTarget as HTMLElement).getAttribute('data-staff-id');
        const machineId = (e.currentTarget as HTMLSelectElement).value || null;
        const staff = state.staff.find(s => s.id === staffId);
        if (!staff) return;

        const prevMachineId = staff.assignedMachineId;
        const prevMachine = prevMachineId ? state.machines.find(m => m.id === prevMachineId) : null;

        if (!machineId) {
          // 取消指派
          staff.assignedMachineId = null;
          if (prevMachine && prevMachine.assignedEngineerId === staff.id) {
            prevMachine.assignedEngineerId = null;
          }
        } else {
          const targetMachine = state.machines.find(m => m.id === machineId);
          if (targetMachine) {
            const oldStaff = state.staff.find(s => s.assignedMachineId === machineId && s.id !== staffId);
            if (oldStaff && prevMachine && prevMachine.id !== targetMachine.id) {
              // 雙向交換崗位：原駐站 oldStaff 交換至 staff 原本的 prevMachine
              oldStaff.assignedMachineId = prevMachine.id;
              prevMachine.assignedEngineerId = oldStaff.id;
            } else if (oldStaff) {
              // 若 staff 原本沒有進駐機台，oldStaff 變為待命
              oldStaff.assignedMachineId = null;
            } else if (prevMachine && prevMachine.id !== targetMachine.id) {
              // 若 targetMachine 原本無人，清空 prevMachine 原指派
              prevMachine.assignedEngineerId = null;
            }

            staff.assignedMachineId = targetMachine.id;
            targetMachine.assignedEngineerId = staff.id;
            QuestEngine.onMachineMaintained(state.questState);
          }
        }

        SoundEffects.playClick();
        AchievementEngine.checkAchievements(state);
        SaveGameService.saveToLocalStorage(state);
        onUpdate();
        this.render(container, state, onUpdate);
      });
    });

    // 解雇資遣
    container.querySelectorAll('.btn-fire-staff').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const staffId = (e.currentTarget as HTMLElement).getAttribute('data-staff-id');
        const staffIdx = state.staff.findIndex(s => s.id === staffId);
        if (staffIdx === -1) return;

        const staff = state.staff[staffIdx];
        if (!confirm(`確定要資遣工程師【${staff.name}】嗎？`)) {
          return;
        }

        // 解綁機台
        if (staff.assignedMachineId) {
          const machine = state.machines.find(m => m.id === staff.assignedMachineId);
          if (machine) machine.assignedEngineerId = null;
        }

        state.staff.splice(staffIdx, 1);
        SoundEffects.playClick();
        onUpdate();
        this.render(container, state, onUpdate);
      });
    });
  }
}
