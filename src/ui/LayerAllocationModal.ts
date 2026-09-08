/**
 * LayerAllocationModal.ts
 * 負責先進多層訂單之「混合微影分層指派 (Mix-and-Match Lithography)」介面：
 * 逐層選擇光刻機世代、Rayleigh 光學解析度防呆檢驗、一鍵最佳配置按鈕
 */

import { SaveGameV2, OrderData, LayerAllocation } from '../types';
import { RayleighEngine } from '../engine/RayleighEngine';
import { ProductionEngine } from '../engine/ProductionEngine';
import { SoundEffects } from '../audio/SoundEffects';

export class LayerAllocationModal {
  private static currentOrder: OrderData | null = null;
  private static localAllocations: LayerAllocation[] = [];

  public static show(
    state: SaveGameV2,
    order: OrderData,
    onUpdate: () => void
  ): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    this.currentOrder = order;

    // 初始化配置：若訂單已有配置則複製，否則呼叫自動經濟配置生成預設
    if (order.layerAllocations && order.layerAllocations.length === order.layerCount) {
      this.localAllocations = JSON.parse(JSON.stringify(order.layerAllocations));
    } else {
      this.localAllocations = ProductionEngine.autoFillBestEconomyAllocation(order, state.machines);
    }

    this.render(container, state, onUpdate);
  }

  private static render(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    if (!this.currentOrder) return;
    const order = this.currentOrder;
    const lithoMachines = state.machines.filter((m) => m.category === 'LITHO');
    const staffMap = new Map(state.staff.map((s) => [s.id, s]));

    // 計算每台機台的實時動態解析度
    const machineCDMap = new Map<string, number>();
    for (const m of lithoMachines) {
      const eng = m.assignedEngineerId ? staffMap.get(m.assignedEngineerId) : null;
      const cd = RayleighEngine.calculateEffectiveCD(m.modelId, state.player.unlockedK1, m.wear, eng);
      machineCDMap.set(m.modelId, cd);
    }

    // 檢查是否有任何一層解析度違規
    let hasOpticalViolation = false;
    for (const alloc of this.localAllocations) {
      const cd = machineCDMap.get(alloc.assignedMachineModelId) ?? 99999;
      if (cd > alloc.targetCD) {
        hasOpticalViolation = true;
        break;
      }
    }

    const nodeStr = order.nodeNm >= 1000 ? `${order.nodeNm / 1000} µm` : `${order.nodeNm} nm`;

    container.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl text-slate-100 flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-xl shadow-inner">
                🎛️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white tracking-wide">
                    混合微影分層配方指派 (Mix-and-Match Litho)
                  </h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                    先進多層架構
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono">
                  客戶: ${order.clientName} | 目標技術節點: ${nodeStr} | 總層數: ${order.layerCount} 層
                </div>
              </div>
            </div>

            <button id="btn-close-layer-modal" class="text-slate-400 hover:text-white font-mono text-xl p-1">
              ✕
            </button>
          </div>

          <!-- 半導體科普導讀卡片 -->
          <div class="my-3 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-start gap-3 text-xs">
            <span class="text-xl">💡</span>
            <div class="text-slate-300 leading-relaxed">
              <span class="text-indigo-300 font-bold">半導體產業秘密：</span>
              現代晶片並非所有光罩層都需昂貴的頂級機台！底層關鍵閘極 (FEOL Gate) 線寬極窄需先進光刻；而上層金屬導線與銲墊 (Pad) 線寬寬鬆，指派成熟便宜的光刻機能
              <strong class="text-emerald-400">大幅降低晶圓生產成本與昂貴機台磨損</strong>，釋放黃光產能瓶頸！
            </div>
          </div>

          <!-- 配方分層列表清單 (可滾動) -->
          <div class="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
            ${this.localAllocations.map((alloc) => {
              const assignedCD = machineCDMap.get(alloc.assignedMachineModelId) ?? 99999;
              const isViolated = assignedCD > alloc.targetCD;
              const isCritical = alloc.layerIndex <= 3;

              return `
                <div class="p-3 rounded-xl bg-slate-900/80 border ${isViolated ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'} flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
                  
                  <!-- 左側：層級資訊 -->
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${isCritical ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300' : 'bg-slate-800 text-slate-300'}">
                      L${alloc.layerIndex}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-xs text-white">${alloc.layerType}</span>
                        ${isCritical ? '<span class="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">關鍵層</span>' : '<span class="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400">導線層</span>'}
                      </div>
                      <div class="text-[11px] font-mono text-slate-400">
                        目標線寬需求: <span class="text-cyan-300 font-bold">${alloc.targetCD} nm</span>
                      </div>
                    </div>
                  </div>

                  <!-- 中間：機台指派下拉選單 -->
                  <div class="flex-1 max-w-sm">
                    <select data-layer="${alloc.layerIndex}" class="sel-layer-machine w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                      ${lithoMachines.map((m) => {
                        const mCD = machineCDMap.get(m.modelId) ?? 9999;
                        const isSelected = m.modelId === alloc.assignedMachineModelId;
                        return `
                          <option value="${m.modelId}" ${isSelected ? 'selected' : ''}>
                            ${m.name} (實時CD: ${mCD}nm | 磨損: ${Math.round(m.wear)}%)
                          </option>
                        `;
                      }).join('')}
                    </select>
                  </div>

                  <!-- 右側：Rayleigh 解析度檢核徽章 -->
                  <div class="min-w-[140px] text-right">
                    ${isViolated ? `
                      <div class="text-xs font-bold text-red-400 flex items-center md:justify-end gap-1">
                        <span>⚠️</span>
                        <span>解析度不足！</span>
                      </div>
                      <div class="text-[10px] text-red-300/80 font-mono">
                        機台CD ${assignedCD}nm > 需求 ${alloc.targetCD}nm
                      </div>
                    ` : `
                      <div class="text-xs font-bold text-emerald-400 flex items-center md:justify-end gap-1">
                        <span>✅</span>
                        <span>光學合規</span>
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        安全裕度: +${alloc.targetCD - assignedCD} nm
                      </div>
                    `}
                  </div>

                </div>
              `;
            }).join('')}
          </div>

          <!-- 底部控制按鈕列 -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
            <!-- 一鍵自動最佳化 -->
            <button id="btn-auto-fill-alloc" class="btn-sci-fi text-xs py-2 px-3 bg-indigo-900/60 hover:bg-indigo-800 border-indigo-500/60 text-indigo-200 flex items-center gap-1.5">
              <span>⚡</span>
              <span>一鍵最佳經濟配置 (Auto-Fill)</span>
            </button>

            <!-- 確定保存 -->
            <div class="flex items-center gap-2">
              <button id="btn-cancel-layer-alloc" class="btn-sci-fi text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300">
                取消
              </button>
              <button id="btn-save-layer-alloc" class="btn-sci-fi text-xs py-2 px-5 ${hasOpticalViolation ? 'opacity-50 cursor-not-allowed bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'}" ${hasOpticalViolation ? 'disabled' : ''}>
                💾 確認並套用分層配方
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
    onUpdate: () => void
  ): void {
    // 關閉
    const close = () => {
      SoundEffects.playClick();
      container.innerHTML = '';
    };

    document.getElementById('btn-close-layer-modal')?.addEventListener('click', close);
    document.getElementById('btn-cancel-layer-alloc')?.addEventListener('click', close);

    // 下拉選單變更機台指派
    const selects = container.querySelectorAll<HTMLSelectElement>('.sel-layer-machine');
    selects.forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const layerIdx = Number(target.dataset.layer);
        const selectedModel = target.value;

        const alloc = this.localAllocations.find((a) => a.layerIndex === layerIdx);
        if (alloc) {
          alloc.assignedMachineModelId = selectedModel;
          SoundEffects.playClick();
          this.render(container, state, onUpdate);
        }
      });
    });

    // 一鍵最佳經濟配置
    document.getElementById('btn-auto-fill-alloc')?.addEventListener('click', () => {
      if (!this.currentOrder) return;
      SoundEffects.playCoinChime();
      this.localAllocations = ProductionEngine.autoFillBestEconomyAllocation(
        this.currentOrder,
        state.machines
      );
      this.render(container, state, onUpdate);
    });

    // 確定保存配方
    document.getElementById('btn-save-layer-alloc')?.addEventListener('click', () => {
      if (!this.currentOrder) return;

      this.currentOrder.layerAllocations = JSON.parse(JSON.stringify(this.localAllocations));
      SoundEffects.playFanfare();
      container.innerHTML = '';
      onUpdate();
    });
  }
}
