/**
 * AdvisoryModal.ts
 * 智能瓶頸分析診斷與改良對策面板 (Smart Advisory)
 * 當產線負荷超過 85% 或點擊 🔴 紅色警報驚嘆號時彈出，精準逆向歸因四大瓶頸
 */

import { SaveGameV2 } from '../types';
import { ProductionEngine, BottleneckDiagnostic } from '../engine/ProductionEngine';
import { SoundEffects } from '../audio/SoundEffects';

export class AdvisoryModal {
  public static show(
    state: SaveGameV2,
    onNavigateStore?: () => void,
    onNavigateHR?: () => void
  ): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const hasCmp = state.unlockedFeatures.cmp;
    const diagnostic: BottleneckDiagnostic = ProductionEngine.diagnoseBottleneck(
      state.machines,
      state.staff,
      state.activeLots,
      state.unlockedFeatures,
      hasCmp
    );

    const { workloadPercent, throughputs } = ProductionEngine.calculateFactoryWorkload(
      state.machines,
      state.staff,
      state.activeLots,
      state.unlockedFeatures,
      hasCmp
    );

    // 依據瓶頸類別定義圖示與標籤
    let badgeColor = 'bg-red-950 text-red-400 border-red-500/50';
    let icon = '⚠️';
    if (diagnostic.category === 'MAINTENANCE') {
      badgeColor = 'bg-amber-950 text-amber-400 border-amber-500/50';
      icon = '🔧';
    } else if (diagnostic.category === 'LOGISTICS') {
      badgeColor = 'bg-cyan-950 text-cyan-400 border-cyan-500/50';
      icon = '🚛';
    } else if (diagnostic.category === 'LAYOUT') {
      badgeColor = 'bg-purple-950 text-purple-400 border-purple-500/50';
      icon = '📐';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        container.innerHTML = '';
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const close = () => {
      SoundEffects.playClick();
      container.innerHTML = '';
      window.removeEventListener('keydown', handleKeyDown);
    };

    container.innerHTML = `
      <div id="modal-backdrop-advisory" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl text-slate-100 flex flex-col max-h-[88vh]">
          <!-- 頂部標題與關閉鈕 -->
          <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700/60 flex-shrink-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${icon}</span>
              <div>
                <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                  智能瓶頸診斷與產線優化顧問
                  <span class="text-xs px-2 py-0.5 rounded-full border ${badgeColor} font-mono">
                    ${diagnostic.category}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  全廠即時在製排隊、機台處理速度與 Q-Time 逾期風險評估
                </p>
              </div>
            </div>
            <button id="btn-close-advisory" class="text-slate-400 hover:text-white text-xl p-1 font-mono transition-colors">
              ✕
            </button>
          </div>

          <!-- 可滾動主體 -->
          <div class="modal-body overflow-y-auto flex-1 py-4 pr-1 space-y-4">
            <!-- 當前產線負荷健康狀態 -->
            <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
              <div>
                <div class="text-xs text-slate-400 font-medium">當前產線負荷百分比 (Workload)</div>
                <div class="text-2xl font-black font-mono ${workloadPercent > 85 ? 'text-red-400' : 'text-amber-400'}">
                  ${workloadPercent}%
                  <span class="text-xs font-normal text-slate-400">
                    ${workloadPercent > 85 ? '(嚴重超載塞車中，排隊即將突破 Q-Time 容許上限！)' : '(負載偏高)'}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-slate-400">最大有效承載量 (瓶頸站)</div>
                <div class="text-sm font-bold font-mono text-cyan-300">
                  ${diagnostic.chokePointThroughput} 片晶圓 / 分鐘
                </div>
              </div>
            </div>

            <!-- 核心診斷結果 (大白話分析) -->
            <div class="p-4 rounded-xl bg-red-950/30 border border-red-500/40">
              <div class="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>● 診斷出之致命卡點：</span>
                <span>${diagnostic.title}</span>
              </div>
              <p class="text-sm text-slate-200 leading-relaxed">
                ${diagnostic.description}
              </p>
            </div>

            <!-- 系統改良建議對策 -->
            <div class="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
              <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                💡 系統精確改良對策：
              </div>
              <p class="text-sm text-slate-200 font-medium leading-relaxed">
                ${diagnostic.recommendation}
              </p>
            </div>

            <!-- 各站點產能即時分佈對比 -->
            <div>
              <div class="text-xs font-bold text-slate-300 mb-2">全廠六大站點實效產能對比 (晶圓/分)：</div>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                ${Object.values(throughputs)
                  .map(
                    (st) => `
                  <div class="p-2 rounded-lg bg-slate-900/60 border ${
                    st.isChokePoint ? 'border-red-500/80 bg-red-950/20' : 'border-slate-800'
                  } text-center">
                    <div class="text-[11px] font-bold ${st.isChokePoint ? 'text-red-400' : 'text-slate-300'}">
                      ${st.station} ${st.isChokePoint ? '⚠️' : ''}
                    </div>
                    <div class="text-xs font-mono font-bold text-slate-100 mt-1">
                      ${Math.round(st.totalCapacity)} 片/分
                    </div>
                    <div class="text-[10px] text-slate-400">
                      ${st.machineCount} 台設備
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <!-- 底部固定操作欄 -->
          <div class="modal-footer flex items-center justify-between pt-3 border-t border-slate-700/60 flex-shrink-0">
            <span class="text-xs text-slate-400 font-mono">按 ESC 或點擊外部背景亦可返回</span>
            <div class="flex items-center gap-2">
              ${
                diagnostic.category === 'CAPACITY' && onNavigateStore
                  ? `<button id="btn-advisory-store" class="btn-sci-fi bg-cyan-600 hover:bg-cyan-500 font-bold px-3 py-1.5 text-xs">
                      🛒 前往商城增購設備分流
                    </button>`
                  : ''
              }
              ${
                diagnostic.category === 'MAINTENANCE' && onNavigateHR
                  ? `<button id="btn-advisory-hr" class="btn-sci-fi bg-amber-600 hover:bg-amber-500 font-bold px-3 py-1.5 text-xs">
                      🔧 前往人資指派維修保養
                    </button>`
                  : ''
              }
              <button id="btn-advisory-ok" class="btn-sci-fi px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700">
                ◀ 返回無塵室
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 綁定事件
    document.getElementById('btn-close-advisory')?.addEventListener('click', close);
    document.getElementById('btn-advisory-ok')?.addEventListener('click', close);

    document.getElementById('modal-backdrop-advisory')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        close();
      }
    });

    document.getElementById('btn-advisory-store')?.addEventListener('click', () => {
      close();
      if (onNavigateStore) onNavigateStore();
    });

    document.getElementById('btn-advisory-hr')?.addEventListener('click', () => {
      close();
      if (onNavigateHR) onNavigateHR();
    });
  }
}
