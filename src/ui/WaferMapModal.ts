/**
 * WaferMapModal.ts
 * 負責蒙地卡羅 25 晶粒良率晶圓圖檢視器：
 * 1. 同心圓良率梯度（中心 1.1x / 邊緣 0.7x）與隨機缺陷群聚 (Cluster Defects) 視覺化
 * 2. 晶圓圓盤 (Wafer Disc) 彩虹矽晶圓倒角切口 (Notch)
 * 3. 點選晶粒即時查看缺陷根因（OPTICAL_DEFOCUS / PARTICLE / CLUSTER）與良率統計
 */

import { SaveGameV2, WaferLotData } from '../types';
import { YieldEngine, DieResult } from '../engine/YieldEngine';
import { SoundEffects } from '../audio/SoundEffects';

export class WaferMapModal {
  private static dies: DieResult[] = [];
  private static selectedDie: DieResult | null = null;
  private static currentLot: WaferLotData | null = null;

  public static show(
    state: SaveGameV2,
    lot?: WaferLotData | null,
    onUpdate?: () => void
  ): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    this.currentLot = lot || (state.activeLots.length > 0 ? state.activeLots[0] : null);

    // 計算基礎良率 (若無指定批次，取目前滑動良率或 92%)
    const baseYield = this.currentLot
      ? this.currentLot.yieldMultiplier
      : (state.rollingYieldHistory.length > 0
        ? state.rollingYieldHistory.reduce((a, b) => a + b, 0) / state.rollingYieldHistory.length
        : 0.92);

    // 生成蒙地卡羅 25 晶粒圖
    this.dies = YieldEngine.generateWaferMap(baseYield);
    this.selectedDie = this.dies[12] || this.dies[0]; // 預設選中中心晶粒 (row 2, col 2)

    this.render(container, state, onUpdate);
  }

  private static render(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate?: () => void
  ): void {
    const passedCount = this.dies.filter(d => d.passed).length;
    const failedCount = this.dies.length - passedCount;
    const lotYieldPercent = ((passedCount / this.dies.length) * 100).toFixed(1);

    const clusterCount = this.dies.filter(d => d.defectType === 'CLUSTER').length;
    const particleCount = this.dies.filter(d => d.defectType === 'PARTICLE').length;
    const defocusCount = this.dies.filter(d => d.defectType === 'OPTICAL_DEFOCUS').length;

    const rollingYield = state.rollingYieldHistory.length > 0
      ? (state.rollingYieldHistory.reduce((a, b) => a + b, 0) / state.rollingYieldHistory.length * 100).toFixed(1) + '%'
      : 'N/A';

    container.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-3xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/70">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl">
                🔬
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>蒙地卡羅晶圓良率檢測圖 (Wafer Map Inspector)</span>
                  ${this.currentLot ? `
                    <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                      批次: ${this.currentLot.lotId}
                    </span>
                  ` : ''}
                </h3>
                <p class="text-xs text-slate-400">
                  全晶圓 25 晶粒蒙地卡羅同心圓徑向良率梯度與區域群聚缺陷分析
                </p>
              </div>
            </div>

            <button id="btn-close-wafer-map" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors">
              ✕
            </button>
          </div>

          <!-- Body Grid (Wafer Left, Stats Right) -->
          <div class="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs">
            
            <!-- Left: Circular Wafer Silicon Disc -->
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950 border-4 border-cyan-500/30 shadow-2xl p-6 flex items-center justify-center group">
                
                <!-- Rainbow Silicon Sheen Reflection -->
                <div class="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/5 via-fuchsia-400/5 to-amber-400/5 pointer-events-none"></div>

                <!-- Bottom Notch (晶圓定位缺口) -->
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-slate-950 border-t border-cyan-400/50 rounded-t-sm"></div>

                <!-- 5x5 Die Grid -->
                <div class="grid grid-cols-5 gap-2 w-full h-full relative z-10 p-2">
                  ${this.dies.map(die => {
                    const isSelected = this.selectedDie?.index === die.index;
                    let dieColor = 'bg-emerald-500 hover:bg-emerald-400 border-emerald-300/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
                    let dieLabel = '✓';

                    if (!die.passed) {
                      if (die.defectType === 'CLUSTER') {
                        dieColor = 'bg-red-600 hover:bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]';
                        dieLabel = '✕';
                      } else if (die.defectType === 'OPTICAL_DEFOCUS') {
                        dieColor = 'bg-amber-500 hover:bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
                        dieLabel = '⚠';
                      } else {
                        dieColor = 'bg-purple-600 hover:bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]';
                        dieLabel = '●';
                      }
                    }

                    return `
                      <button
                        class="btn-wafer-die rounded-md border text-xs font-bold text-white transition-all transform hover:scale-110 flex items-center justify-center font-mono ${dieColor} ${isSelected ? 'ring-2 ring-white scale-105' : ''}"
                        data-index="${die.index}"
                        title="Die [${die.row}, ${die.col}] - ${die.passed ? '合格' : '失效: ' + die.defectType}"
                      >
                        ${dieLabel}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <div class="text-[11px] text-slate-400 flex items-center gap-3">
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-emerald-500"></span> 合格晶粒</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-red-600"></span> 群聚缺陷</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-amber-500"></span> 邊緣離焦</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-purple-600"></span> 潔淨落塵</span>
              </div>
            </div>

            <!-- Right: Die Telemetry & Statistics -->
            <div class="space-y-4">
              
              <!-- Metrics Cards -->
              <div class="grid grid-cols-2 gap-2.5 font-mono">
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div class="text-[10px] text-slate-400">當前晶圓良率</div>
                  <div class="text-xl font-bold ${Number(lotYieldPercent) >= 90 ? 'text-emerald-400' : 'text-amber-400'}">
                    ${lotYieldPercent}%
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    合格: ${passedCount} / 失效: ${failedCount}
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div class="text-[10px] text-slate-400">全廠滑動良率指數</div>
                  <div class="text-xl font-bold text-cyan-300">
                    ${rollingYield}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    5 批次滑動窗口
                  </div>
                </div>
              </div>

              <!-- Selected Die Root-Cause Analysis -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div class="font-bold text-white flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <span>🔍</span>
                    <span>選取晶粒分析 (Die Telemetry)</span>
                  </span>
                  ${this.selectedDie ? `
                    <span class="font-mono text-[10px] px-2 py-0.5 rounded ${this.selectedDie.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}">
                      座標: [R${this.selectedDie.row}, C${this.selectedDie.col}]
                    </span>
                  ` : ''}
                </div>

                ${this.selectedDie ? `
                  <div class="space-y-1.5 font-mono text-[11px] p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <div class="flex justify-between">
                      <span class="text-slate-400">距離晶圓圓心:</span>
                      <span class="text-slate-200 font-bold">${this.selectedDie.distanceFromCenter} 格</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">電性檢測狀態:</span>
                      <span class="${this.selectedDie.passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}">
                        ${this.selectedDie.passed ? '✅ PASSED (合格電性通過)' : '❌ FAILED (失效瑕疵品)'}
                      </span>
                    </div>
                    ${!this.selectedDie.passed ? `
                      <div class="pt-1.5 border-t border-slate-800 text-[10px] text-slate-300">
                        <span class="text-amber-300 font-bold">失效原因分析：</span>
                        ${this.selectedDie.defectType === 'CLUSTER'
                          ? '【區域群聚缺陷】微影光阻殘留或化學腐蝕液擴散，波及相鄰相連晶粒！'
                          : (this.selectedDie.defectType === 'OPTICAL_DEFOCUS'
                            ? '【邊緣聚焦離焦】晶圓邊緣物理翹曲與數值孔徑 NA 聚焦裕度不足導致線寬失真！'
                            : '【微影落塵污染】無塵室空氣中微粒穿透光阻，導致金屬互連斷路！')}
                      </div>
                    ` : `
                      <div class="text-[10px] text-emerald-300/80 pt-1">
                        晶體結構完整無畸變，金屬接觸電阻正常。
                      </div>
                    `}
                  </div>
                ` : `
                  <div class="text-slate-500 text-center py-4 italic">點擊左側晶圓晶粒查看詳細光學遙測數據</div>
                `}
              </div>

              <!-- Defect Breakdown -->
              <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px] space-y-1">
                <div class="text-slate-400 text-[10px] font-sans font-bold">瑕疵根因統計：</div>
                <div class="flex justify-between text-red-400">
                  <span>群聚缺陷 (Cluster):</span>
                  <span>${clusterCount} 顆</span>
                </div>
                <div class="flex justify-between text-amber-400">
                  <span>邊緣光學離焦 (Defocus):</span>
                  <span>${defocusCount} 顆</span>
                </div>
                <div class="flex justify-between text-purple-400">
                  <span>落塵雜質 (Particle):</span>
                  <span>${particleCount} 顆</span>
                </div>
              </div>

              <!-- Re-simulate Button -->
              <button id="btn-resim-wafer" class="btn-sci-fi w-full justify-center py-2 text-xs">
                🔄 重新執行蒙地卡羅良率掃描
              </button>

            </div>

          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, state, onUpdate);
  }

  private static bindEvents(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate?: () => void
  ): void {
    // 關閉
    document.getElementById('btn-close-wafer-map')?.addEventListener('click', () => {
      SoundEffects.playClick();
      container.innerHTML = '';
    });

    // 點選晶粒
    container.querySelectorAll('.btn-wafer-die').forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundEffects.playClick();
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0', 10);
        this.selectedDie = this.dies.find(d => d.index === idx) || null;
        this.render(container, state, onUpdate);
      });
    });

    // 重新模擬掃描
    document.getElementById('btn-resim-wafer')?.addEventListener('click', () => {
      SoundEffects.playClick();
      const baseYield = this.currentLot
        ? this.currentLot.yieldMultiplier
        : (state.rollingYieldHistory.length > 0
          ? state.rollingYieldHistory.reduce((a, b) => a + b, 0) / state.rollingYieldHistory.length
          : 0.92);

      this.dies = YieldEngine.generateWaferMap(baseYield);
      this.selectedDie = this.dies[12] || this.dies[0];
      this.render(container, state, onUpdate);
    });
  }
}
