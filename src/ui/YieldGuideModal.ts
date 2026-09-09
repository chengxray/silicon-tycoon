/**
 * YieldGuideModal.ts
 * 半導體晶圓良率實戰診斷與挽救指南 (Yield Troubleshooting & Action Guide)
 * 針對遊戲內 100% 真實起效的 7 大核心物理機制提供實時遙測診斷、數值影響與一鍵快速操作
 */

import { SaveGameV2 } from '../types';
import { SoundEffects } from '../audio/SoundEffects';
import { RayleighEngine } from '../engine/RayleighEngine';

export interface YieldGuideCallbacks {
  onOpenPlanner?: () => void;
  onOpenContracts?: () => void;
  onOpenHR?: () => void;
  onOpenStore?: (category?: any) => void;
  onClose?: () => void;
}

export class YieldGuideModal {
  public static show(state: SaveGameV2, callbacks: YieldGuideCallbacks = {}): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    // 1. 檢測全廠當前狀態與遙測指標
    // A. 黃光區白光污染檢測
    const yellowTiles = state.facility.yellowRoomTiles || [];
    const isTileYellow = (x: number, y: number) => yellowTiles.some(t => t.x === x && t.y === y);
    const lithoAndTracks = state.machines.filter(m => (m.category === 'LITHO' || m.category === 'TRACK') && m.status !== 'EXPLODED');
    const violatingMachines = lithoAndTracks.filter(m => !isTileYellow(m.gridX, m.gridY));
    const hasYellowViolation = violatingMachines.length > 0;

    // B. 在製訂單 PIE 守護檢測
    const ongoingOrders = state.activeOrders.filter(o => o.status === 'ACTIVE' || o.status === 'PENDING');
    const ordersWithoutPie = ongoingOrders.filter(o => !o.assignedPieId);
    const pieStaff = state.staff.filter(s => s.moduleSpecialty === 'PIE');

    // C. 機台精密 PM 腔體調校檢測
    const activeMachines = state.machines.filter(m => m.status !== 'EXPLODED');
    const pmCount = activeMachines.filter(m => m.hasPmTuneUpBonus).length;

    // D. 全廠機台平均磨損檢測
    const avgWear = activeMachines.length > 0
      ? Math.round(activeMachines.reduce((sum, m) => sum + m.wear, 0) / activeMachines.length)
      : 0;
    const wearPenaltyPct = ((avgWear / 100) * 6.0).toFixed(1);

    // E. 微影 Scanner 光學 k1 視窗檢測
    const scanner = state.machines.find(m => m.category === 'LITHO' && m.status !== 'EXPLODED');
    const scannerEngineer = scanner?.assignedEngineerId ? state.staff.find(s => s.id === scanner.assignedEngineerId) : null;
    let effectiveK1 = 0.50;
    let opticalPenaltyPct = '0.0';
    if (scanner) {
      const k1Info = RayleighEngine.calculateEffectiveK1(
        state.unlockedFeatures.cmp ? 'CAR' : 'BASE',
        scanner.wear,
        scannerEngineer
      );
      effectiveK1 = k1Info.effectiveK1;
      opticalPenaltyPct = (RayleighEngine.getProcessWindowPenalty(effectiveK1) * 100).toFixed(1);
    }

    // F. 工程師過勞失誤檢測
    const workingStaff = state.staff.filter(s => s.workShift !== 'OFF');
    const exhaustedStaff = workingStaff.filter(s => s.fatigue >= 80);

    // G. 無塵室潔淨等級
    const cleanroomClass = state.player.unlockedCleanroomClass || 'Class 10,000';

    // 近期良率
    const recent5 = state.rollingYieldHistory.slice(-5);
    const rollingYieldStr = recent5.length > 0
      ? (recent5.reduce((a, b) => a + b, 0) / recent5.length * 100).toFixed(1) + '%'
      : 'N/A';

    const closeModal = () => {
      SoundEffects.playClick();
      container.innerHTML = '';
      window.removeEventListener('keydown', onKeyDown);
      callbacks.onClose?.();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKeyDown);

    container.innerHTML = `
      <div id="modal-backdrop-yield-guide" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl max-h-[92vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl text-amber-300 flex-shrink-0">
                💡
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>晶圓良率實戰診斷與挽救指南 (Yield Optimization Guide)</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    全廠滑動良率: ${rollingYieldStr}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  以下 7 大方法皆為遊戲內核心物理引擎 100% 真實運算因子，立即點擊對應按鈕進行排查挽救！
                </p>
              </div>
            </div>

            <button id="btn-close-yield-guide" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉指南">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
            
            <!-- 1. 黃光專區防護 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${hasYellowViolation ? 'border-red-500/80 bg-red-950/20 shadow-lg shadow-red-950/40' : 'border-slate-800'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🟡</span>
                  <span class="font-bold text-white text-sm">1. 微影與塗膠設備之黃光區防護 (最致命項目)</span>
                  ${hasYellowViolation 
                    ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">🚨 ${violatingMachines.length} 台設備白光污染 (良率 0%)</span>` 
                    : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">✓ 黃光防護合格</span>`}
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  微影機 (Scanner) 與塗膠顯影機 (Track) 上的光阻具高光敏性。若未座落於黃光專區地磚上，受環境可見白光曝曬將破壞光阻化學鍵，**該批次良率將被強制歸零 (0%)！**
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：點擊頂部「🏗️ 廠房規劃」，使用「🟡 劃設黃光區」將設備下方地磚塗為黃色，或使用「🔄 搬移機台」移入黃光區。
                </div>
              </div>
              <button id="btn-guide-goto-planner" class="btn-sci-fi px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold flex-shrink-0">
                🟡 開啟廠房規劃 (修正黃光)
              </button>
            </div>

            <!-- 2. 製程整合工程師 (PIE) 指派 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${ordersWithoutPie.length > 0 ? 'border-indigo-500/80 bg-indigo-950/20' : 'border-slate-800'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">👨‍💼</span>
                  <span class="font-bold text-white text-sm">2. 指派專任製程整合工程師 (PIE) 守護訂單</span>
                  ${ordersWithoutPie.length > 0
                    ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">⚠️ ${ordersWithoutPie.length} 筆在製訂單未指派 PIE</span>`
                    : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">✓ 在製訂單皆有 PIE 守護</span>`}
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  未指派 PIE 之訂單良率無額外守護；指派 PIE 可直接為該訂單提供 **+3.0% ~ +18.0% 的全廠良率守護** 與最高 **+45% 的工步提速**！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  廠內現有 PIE: ${pieStaff.length} 位 | 實戰解法：前往合約看板，在訂單下拉式選單指派 PIE；若無 PIE 請至人資市場招募。
                </div>
              </div>
              <button id="btn-guide-goto-contracts" class="btn-sci-fi px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex-shrink-0">
                📋 前往合約指派 PIE
              </button>
            </div>

            <!-- 3. 機台精密預防保養 (PM) -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${pmCount === 0 ? 'border-cyan-500/50' : 'border-slate-800'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🔍</span>
                  <span class="font-bold text-white text-sm">3. 執行駐站工程師精密預防保養 (PM 調校)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono ${pmCount > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}">
                    ${pmCount} / ${activeMachines.length} 台享有 PM 調校加成
                  </span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  點選機台由駐站工程師執行「精密預防保養 (PM)」，清潔腔體真空並光學校準。磨損立即歸零，且下一輪加工晶圓享有 **+3.0% 精密調校良率加成**！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：進入無塵室點擊任一機台，在整合卡片點選「🔍 工程師精密預防保養 (PM)」。
                </div>
              </div>
              <div class="text-[11px] font-mono text-cyan-300 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                點擊任一機台 ➔ 執行 PM
              </div>
            </div>

            <!-- 4. 機台磨損度過高 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${avgWear >= 40 ? 'border-amber-500/60 bg-amber-950/10' : 'border-slate-800'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🛠️</span>
                  <span class="font-bold text-white text-sm">4. 消除機台平均磨損 (防止顆粒污染)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${avgWear >= 40 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'}">
                    全廠平均磨損: ${avgWear}% (良率折損: -${wearPenaltyPct}%)
                  </span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  機台運轉將累積磨損，老化噴嘴與腔體刮傷會散播微粒污染。全廠平均磨損每增加 10% 即產生 0.6% 的良率懲罰，最高扣減 6.0%！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：點擊機台執行「🛠️ 原廠專案深度大修 (Overhaul)」或「🔍 工程師 PM 保養」將磨損歸零至 0%。
                </div>
              </div>
              <div class="text-[11px] font-mono text-amber-300 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                機台大修 / PM ➔ 磨損歸零
              </div>
            </div>

            <!-- 5. 微影 k1 光學製程視窗調校 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${Number(opticalPenaltyPct) > 0 ? 'border-purple-500/60 bg-purple-950/10' : 'border-slate-800'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🔬</span>
                  <span class="font-bold text-white text-sm">5. 微影 k1 因子與光學極限製程視窗調校</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${Number(opticalPenaltyPct) > 0 ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'}">
                    k1: ${effectiveK1.toFixed(3)} (光學折損: -${opticalPenaltyPct}%)
                  </span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  依據 Rayleigh 微影物理公式，當 $k_1 < 0.38$ 時，光學景深急遽萎縮，產生邊緣光學離焦與線寬失真，**最高可造成高達 -25.0% 的製程視窗良率懲罰！**
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：為微影曝光機 (Scanner) 指派專精微影的工程師 (k1 可降低 0.02~0.06)，或升級高階微影設備與研發 CAR 化學增幅光阻。
                </div>
              </div>
              <div class="text-[11px] font-mono text-purple-300 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                微影機駐站 ➔ 調降 k1
              </div>
            </div>

            <!-- 6. 工程師過勞失誤控制 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${exhaustedStaff.length > 0 ? 'border-red-500/60 bg-red-950/10' : 'border-slate-800'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">☕</span>
                  <span class="font-bold text-white text-sm">6. 控制工程師疲勞度 (防止過勞人為操作失誤)</span>
                  ${exhaustedStaff.length > 0
                    ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40 animate-pulse">⚠️ ${exhaustedStaff.length} 位同仁過勞 (疲勞≥80%)</span>`
                    : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">✓ 全員體力充沛</span>`}
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  在職員工疲勞 $\ge 80\%$ 時，每次批次投片產生每人 **-1.5% 過勞失誤懲罰**，且責任 PIE 加成效果折減 40%！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：前往「人資排班」，切換為「🏖️ 週休二日制」自然消退、發放「☕ 帶薪休假 (-40% 疲勞)」或「💆 撥發全員舒壓福利 (-25% 疲勞)」。
                </div>
              </div>
              <button id="btn-guide-goto-hr" class="btn-sci-fi px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold flex-shrink-0">
                👥 前往人資排休回血
              </button>
            </div>

            <!-- 7. 無塵室潔淨等級升級 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🏭</span>
                  <span class="font-bold text-white text-sm">7. 升級無塵室潔淨等級 (消除空氣落塵污染)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    現行無塵等級: ${cleanroomClass}
                  </span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  初期 Class 10,000 單層基準良率僅 91.5%，累積 6~12 層後總良率自然落在 56%~65%（半導體真實學習曲線）。升級至 **Class 1,000 (95.5%)** 或 **Class 100 (97.5%)**，總良率將大幅躍升至 **85% ~ 95%**！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：前往商城或廠房升級模組，升級無塵室階段以突破潔淨等級。
                </div>
              </div>
              <button id="btn-guide-goto-store" class="btn-sci-fi px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex-shrink-0">
                🛒 前往商城升級無塵室
              </button>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <div class="text-[11px] text-slate-400">
              💡 診斷小結：只要**黃光防護正確 + 指派 PIE + 執行機台 PM + 無過勞同仁**，良率即可穩步突破 85% 以上！
            </div>
            <button id="btn-back-yield-guide" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回檢視
            </button>
          </div>

        </div>
      </div>
    `;

    // 綁定事件
    document.getElementById('btn-close-yield-guide')?.addEventListener('click', closeModal);
    document.getElementById('btn-back-yield-guide')?.addEventListener('click', closeModal);

    document.getElementById('modal-backdrop-yield-guide')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-backdrop-yield-guide')) {
        closeModal();
      }
    });

    document.getElementById('btn-guide-goto-planner')?.addEventListener('click', () => {
      closeModal();
      callbacks.onOpenPlanner?.();
    });

    document.getElementById('btn-guide-goto-contracts')?.addEventListener('click', () => {
      closeModal();
      callbacks.onOpenContracts?.();
    });

    document.getElementById('btn-guide-goto-hr')?.addEventListener('click', () => {
      closeModal();
      callbacks.onOpenHR?.();
    });

    document.getElementById('btn-guide-goto-store')?.addEventListener('click', () => {
      closeModal();
      callbacks.onOpenStore?.('FACILITY');
    });
  }
}
