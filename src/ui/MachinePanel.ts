/**
 * MachinePanel.ts
 * 負責單一機台深度控制面板：
 * 1. 機台健康度、磨損度與 🛡️ TPM 在線保養狀態
 * 2. Option B 核心機制：微影機台專屬之「配套 Track 塗膠顯影並聯綁定」與 TOC 產能匹配診斷
 * 3. 駐機工程師即時指派、越級炸機風險防呆
 * 4. 就地大修 (Overhaul) 歸零磨損與報廢除役變賣
 */

import { SaveGameV2, MachineData } from '../types';
import { ASSET_REGISTRY } from '../services/AssetRegistry';
import { SoundEffects } from '../audio/SoundEffects';
import { MaintenanceEngine } from '../engine/MaintenanceEngine';
import { ProductionEngine } from '../engine/ProductionEngine';
import { RayleighEngine } from '../engine/RayleighEngine';
import { FinanceEngine } from '../engine/FinanceEngine';
import { StoreModal } from './StoreModal';

export class MachinePanel {
  public static show(
    machine: MachineData,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    this.render(container, machine, state, onUpdate);
  }

  private static render(
    container: HTMLElement,
    machine: MachineData,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    const asset = (ASSET_REGISTRY.machines as any)[machine.modelId];
    const assetPath = asset?.path || './assets/machines/litho_contact.png';
    const spec = StoreModal.STORE_CATALOG.find(c => c.modelId === machine.modelId);

    const overhaulCost = spec ? Math.round(spec.price * 0.15) : 300_000;
    const resellPrice = spec ? Math.round(spec.price * 0.40) : 800_000;
    const wearInt = Math.round(machine.wear);

    // 取得進駐工程師
    const assignedStaff = state.staff.find(s => s.id === machine.assignedEngineerId);
    let isTPMActive = false;
    let isExplosionRisk = false;

    if (assignedStaff) {
      isTPMActive = MaintenanceEngine.checkTPMConditions(machine, assignedStaff).isTPMActive;
      isExplosionRisk = MaintenanceEngine.checkExplosionRisk(machine, assignedStaff).hasRisk;
    }

    // 計算微影機動態 k1 (若為微影機)
    let k1Report: { effectiveK1: number; formula: string } | null = null;
    let opticalCD: number | null = null;
    if (machine.category === 'LITHO') {
      const optSpec = RayleighEngine.OPTICAL_CATALOG[machine.modelId];
      if (optSpec) {
        const k1Res = RayleighEngine.calculateEffectiveK1(
          state.player.unlockedK1,
          machine.wear,
          assignedStaff || null
        );
        k1Report = {
          effectiveK1: k1Res.effectiveK1,
          formula: `Base(${k1Res.k1Tech.toFixed(2)}) + 磨損(+${k1Res.deltaWear.toFixed(3)}) - 調校(-${k1Res.deltaEngineer.toFixed(2)}) + 疲勞(+${k1Res.deltaFatigue.toFixed(2)})`
        };
        opticalCD = Math.round(k1Res.effectiveK1 * (optSpec.wavelengthNm / optSpec.numericalAperture));
      }
    }

    // 計算 Track 並聯產能 (Option B 關鍵機制)
    const isLitho = machine.category === 'LITHO';
    const installedTracks = state.machines.filter(m => m.category === 'TRACK' && m.status !== 'EXPLODED');
    const pairedTrackIds = machine.pairedTrackIds || [];

    // LITHO 產能 vs 配套 Track 總產能
    const lithoBaseCap = ProductionEngine.BASE_THROUGHPUT_BY_TIER.LIT[machine.tier] || 10;
    let pairedTrackTotalCap = 0;
    for (const tid of pairedTrackIds) {
      const tm = state.machines.find(m => m.id === tid);
      if (tm) {
        pairedTrackTotalCap += (ProductionEngine.BASE_THROUGHPUT_BY_TIER.TRACK[tm.tier] || 6);
      }
    }

    const isTrackChokePoint = isLitho && (pairedTrackIds.length === 0 || pairedTrackTotalCap < lithoBaseCap);

    // 尋找當前正在該機台站點加工的在製批次
    const activeLotsAtStation = state.activeLots.filter(l => {
      if (l.status !== 'PROCESSING') return false;
      if (machine.category === 'TRACK') {
        return l.currentStation === 'LIT' && (l.litSubStep === 'COAT' || l.litSubStep === 'DEVELOP');
      }
      if (machine.category === 'LITHO') {
        return l.currentStation === 'LIT' && l.litSubStep === 'EXPOSE';
      }
      return l.currentStation === machine.category;
    });

    const isProcessingNow = activeLotsAtStation.length > 0;

    container.innerHTML = `
      <div id="modal-backdrop-machine" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="machine-panel-thumb w-14 h-14 rounded-xl bg-slate-950 border border-cyan-500/50 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="${assetPath}" alt="${machine.name}" class="w-full h-full object-contain filter drop-shadow" style="max-width: 52px; max-height: 52px;" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white tracking-wide">${machine.name}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Tier ${machine.tier}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono ${
                    isProcessingNow || machine.status === 'PROCESSING' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse' :
                    (machine.status === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    (machine.status === 'EXPLODED' ? 'bg-red-600 text-white font-bold animate-bounce' : 'bg-slate-800 text-slate-300'))
                  }">
                    ${isProcessingNow ? '⚡ 加工中 (PROCESSING)' : machine.status}
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5">
                  ID: ${machine.id} | 格線座標: (${machine.gridX}, ${machine.gridY}) | 站點類別: ${machine.category}
                </div>
              </div>
            </div>

            <button id="btn-close-machine-panel" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉面板">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4 text-xs">

            <!-- 1. Equipment Description & Science Principles (半導體科普與機台說明) -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div class="text-xs text-slate-200 font-medium leading-relaxed">
                ${spec?.description || '廠內現役半導體晶圓製造專用設備。'}
              </div>
              ${spec?.scienceNote ? `
                <div class="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200/90 leading-relaxed">
                  <span class="font-bold text-cyan-300">ℹ️ 半導體物理原理：</span>
                  ${spec.scienceNote}
                </div>
              ` : ''}
              <div class="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span class="text-slate-400">標準吞吐產能:</span>
                  <span class="text-cyan-300 font-bold">${spec?.throughputWpm || 10} 晶圓/分</span>
                </div>
                <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span class="text-slate-400">${machine.category === 'LITHO' ? 'Rayleigh 極限 CD:' : '製程站點:'}</span>
                  <span class="text-emerald-400 font-bold">${spec?.rayleighLimitNm ? spec.rayleighLimitNm + ' nm' : machine.category}</span>
                </div>
              </div>
            </div>

            <!-- 2. Live Production Job Status (即時生產在製狀態) -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border ${isProcessingNow ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-slate-800'} space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-1.5">
                  <span>⚙️</span>
                  <span>生產加工狀態 (Production Status)</span>
                </span>
                <span class="font-mono text-xs ${isProcessingNow ? 'text-cyan-300 font-bold animate-pulse' : 'text-slate-400'}">
                  ${isProcessingNow ? '⚡ 正在加工批次' : '待命中 (Ready / IDLE)'}
                </span>
              </div>
              ${isProcessingNow ? `
                <div class="space-y-1.5 pt-1 font-mono text-xs">
                  ${activeLotsAtStation.map(lot => `
                    <div class="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
                      <div>
                        <span class="text-cyan-300 font-bold">${lot.lotId}</span>
                        <span class="text-[11px] text-slate-400 ml-2">第 ${lot.currentLayer}/${lot.totalLayers} 層 [${lot.currentStation}${lot.litSubStep ? ' - ' + lot.litSubStep : ''}]</span>
                      </div>
                      <div class="text-emerald-400 font-bold">
                        良率 ${(lot.yieldMultiplier * 100).toFixed(0)}%
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="text-[11px] text-slate-400 py-1">
                  目前無正在加工的晶圓批次，機台妥善待命中。請至「合約」承接訂單投片！
                </div>
              `}
            </div>

            <!-- 3. Wear & Health Bar -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between font-mono">
                <span class="text-slate-400 flex items-center gap-1.5">
                  <span>🛠️</span>
                  <span>機台磨損與在線健康度</span>
                </span>
                <span class="font-bold ${wearInt > 70 ? 'text-red-400' : (wearInt > 40 ? 'text-amber-400' : 'text-emerald-400')}">
                  磨損: ${wearInt}% (健康度 ${100 - wearInt}%)
                </span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div class="h-full transition-all duration-300 ${wearInt > 70 ? 'bg-red-500' : (wearInt > 40 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${wearInt}%;"></div>
              </div>

              <!-- Status Alert Badges -->
              ${isTPMActive ? `
                <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                  <span class="text-base">🛡️</span>
                  <div>
                    <span class="font-bold">TPM 24H 零故障在線維護中：</span>
                    工程師在線微調，磨損鎖死在 5% 以下，故障率保證為 0%！
                  </div>
                </div>
              ` : ''}

              ${isExplosionRisk ? `
                <div class="p-2 rounded-lg bg-red-950/40 border border-red-600/50 text-red-300 flex items-center gap-2 animate-pulse">
                  <span class="text-base">💥</span>
                  <div>
                    <span class="font-bold">越級操作極度危險！</span>
                    工程師職等落後機台 2 級以上，每次投片皆有 25% 炸機破壞風險！
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- 4. Litho Specific Optical Rayleigh Details -->
            ${isLitho && k1Report ? `
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div class="flex items-center justify-between font-mono">
                  <span class="text-cyan-300 font-bold flex items-center gap-1.5">
                    <span>🔬</span>
                    <span>Rayleigh 微影光學解析度實時調校</span>
                  </span>
                  <span class="text-emerald-400 font-bold">極限 CD: ~${opticalCD} nm</span>
                </div>
                <div class="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 font-mono text-[11px]">
                  <div class="flex justify-between">
                    <span class="text-slate-400">當前實效 k1 因子:</span>
                    <span class="text-cyan-300 font-bold">${k1Report.effectiveK1.toFixed(3)}</span>
                  </div>
                  <div class="text-[10px] text-slate-500">
                    計算分解: ${k1Report.formula}
                  </div>
                  ${k1Report.effectiveK1 < 0.38 ? `
                    <div class="text-[10px] text-amber-400 pt-1">
                      ⚠️ 逼近物理極限 (k1 < 0.38)，聚焦景深裕度狹窄，產生製程窗良率折損！
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}

            <!-- 5. Option B: Paired Track Selection -->
            ${isLitho ? `
              <div class="p-3.5 rounded-xl bg-slate-900/80 border ${isTrackChokePoint ? 'border-amber-500/40' : 'border-slate-800'} space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white flex items-center gap-1.5">
                    <span>🌀</span>
                    <span>連線機組 Track 塗膠顯影機配套綁定 (Option B)</span>
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    微影 ${lithoBaseCap} 片/分 vs Track ${pairedTrackTotalCap} 片/分
                  </span>
                </div>

                <p class="text-[11px] text-slate-400">
                  半導體黃光區晶圓每層必須進出 Track 兩次 (塗膠 + 顯影)！可勾選並聯多台 Track 機台分流吞吐：
                </p>

                ${installedTracks.length === 0 ? `
                  <div class="p-2.5 rounded bg-red-950/20 border border-red-800/30 text-red-300 text-[11px]">
                    ⚠️ 廠內尚未安裝任何 Track 塗膠顯影機！微影機無法單獨運作，請前往商城採購！
                  </div>
                ` : `
                  <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    ${installedTracks.map(track => {
                      const isChecked = pairedTrackIds.includes(track.id);
                      const trackCap = ProductionEngine.BASE_THROUGHPUT_BY_TIER.TRACK[track.tier] || 6;
                      return `
                        <label class="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border ${isChecked ? 'border-cyan-500/40 bg-cyan-950/10' : 'border-slate-800'} cursor-pointer hover:border-slate-700">
                          <div class="flex items-center gap-2">
                            <input
                              type="checkbox"
                              class="chk-paired-track rounded border-slate-700 text-cyan-500 focus:ring-0"
                              data-track-id="${track.id}"
                              ${isChecked ? 'checked' : ''}
                            />
                            <span class="font-semibold text-slate-200 text-xs">${track.name}</span>
                            <span class="text-[10px] text-slate-400 font-mono">(Tier ${track.tier})</span>
                          </div>
                          <span class="font-mono text-[11px] text-cyan-300">+${trackCap} 晶圓/分</span>
                        </label>
                      `;
                    }).join('')}
                  </div>
                `}

                ${isTrackChokePoint ? `
                  <div class="p-2 rounded bg-amber-950/30 border border-amber-600/40 text-amber-200 text-[11px] flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Track 吞吐量不足！微影機正在降速等待，請並聯勾選第二台 Track 或至商城增購！</span>
                  </div>
                ` : `
                  <div class="p-2 rounded bg-emerald-950/30 border border-emerald-600/40 text-emerald-300 text-[11px] flex items-center gap-2">
                    <span>✨</span>
                    <span>完美並聯！消除微影瓶頸，享有連線機組加成 (內部傳送時間減少 60%)！</span>
                  </div>
                `}
              </div>
            ` : ''}

            <!-- 6. Station Engineer Assignment -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-1.5">
                  <span>🧑‍🔬</span>
                  <span>駐機製程工程師配置</span>
                </span>
                ${assignedStaff ? `
                  <span class="text-[10px] font-mono text-purple-300">
                    ${assignedStaff.rank} (${assignedStaff.moduleSpecialty})
                  </span>
                ` : '<span class="text-[10px] text-slate-500">無工程師</span>'}
              </div>

              <select id="select-station-engineer" class="select-sci-fi w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs">
                <option value="">-- 未指派 (無調校加成，磨損正常累積) --</option>
                ${state.staff.map(staff => `
                  <option value="${staff.id}" ${machine.assignedEngineerId === staff.id ? 'selected' : ''}>
                    ${staff.name} - ${staff.rank} [專長: ${staff.moduleSpecialty}] (疲勞: ${Math.round(staff.fatigue)}%)
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- 7. Machine Maintenance Actions -->
            <div class="flex items-center gap-3 pt-2">
              <button
                id="btn-machine-overhaul"
                class="flex-1 btn-sci-fi justify-center py-2.5 text-xs bg-cyan-700/80 hover:bg-cyan-600 ${state.player.cash < overhaulCost || machine.wear <= 5 ? 'opacity-50 cursor-not-allowed' : ''}"
                ${state.player.cash < overhaulCost || machine.wear <= 5 ? 'disabled' : ''}
              >
                🛠️ 就地大修保養 (NT$ ${overhaulCost.toLocaleString()})
              </button>

              <button
                id="btn-machine-decommission"
                class="px-4 py-2.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors"
              >
                ♻️ 報廢變賣 (+NT$ ${resellPrice.toLocaleString()})
              </button>
            </div>

          </div>

          <!-- Footer: Clear Return / Back Button -->
          <div class="modal-footer p-4 border-t border-slate-700/80 bg-slate-900/90 flex items-center gap-3">
            <button id="btn-back-machine" class="btn-sci-fi w-full justify-center py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-lg">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, machine, state, onUpdate);
  }

  private static bindEvents(
    container: HTMLElement,
    machine: MachineData,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
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

    // 關閉按鈕
    document.getElementById('btn-close-machine-panel')?.addEventListener('click', closeModal);

    // 底部返回按鈕
    document.getElementById('btn-back-machine')?.addEventListener('click', closeModal);

    // 點擊背景空白處關閉
    document.getElementById('modal-backdrop-machine')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-backdrop-machine')) {
        closeModal();
      }
    });

    // 勾選並聯 Track (Option B)
    container.querySelectorAll('.chk-paired-track').forEach(chk => {
      chk.addEventListener('change', () => {
        SoundEffects.playClick();
        const selectedTrackIds: string[] = [];
        container.querySelectorAll('.chk-paired-track:checked').forEach(c => {
          const tid = (c as HTMLElement).getAttribute('data-track-id');
          if (tid) selectedTrackIds.push(tid);
        });

        machine.pairedTrackIds = selectedTrackIds;
        onUpdate();
        this.render(container, machine, state, onUpdate);
      });
    });

    // 工程師更換指派
    document.getElementById('select-station-engineer')?.addEventListener('change', (e) => {
      SoundEffects.playClick();
      const staffId = (e.target as HTMLSelectElement).value || null;

      // 解除原工程師指派
      if (machine.assignedEngineerId) {
        const oldStaff = state.staff.find(s => s.id === machine.assignedEngineerId);
        if (oldStaff) oldStaff.assignedMachineId = null;
      }

      // 指派新工程師
      machine.assignedEngineerId = staffId;
      if (staffId) {
        const newStaff = state.staff.find(s => s.id === staffId);
        if (newStaff) {
          // 若新工程師原先在其他機台，解綁其他機台
          if (newStaff.assignedMachineId) {
            const prevMachine = state.machines.find(m => m.id === newStaff.assignedMachineId);
            if (prevMachine) prevMachine.assignedEngineerId = null;
          }
          newStaff.assignedMachineId = machine.id;
        }
      }

      onUpdate();
      this.render(container, machine, state, onUpdate);
    });

    // 就地大修
    document.getElementById('btn-machine-overhaul')?.addEventListener('click', () => {
      const spec = StoreModal.STORE_CATALOG.find(c => c.modelId === machine.modelId);
      const overhaulCost = spec ? Math.round(spec.price * 0.15) : 300_000;

      if (state.player.cash < overhaulCost) {
        alert('資金不足，無法執行大修！');
        return;
      }

      state.player.cash -= overhaulCost;
      FinanceEngine.recordMaintenance(state, overhaulCost);
      machine.wear = 0;
      machine.status = 'IDLE';

      SoundEffects.playClick();
      onUpdate();
      this.render(container, machine, state, onUpdate);
    });

    // 報廢變賣
    document.getElementById('btn-machine-decommission')?.addEventListener('click', () => {
      const spec = StoreModal.STORE_CATALOG.find(c => c.modelId === machine.modelId);
      const resellPrice = spec ? Math.round(spec.price * 0.40) : 800_000;

      if (!confirm(`確定要將設備【${machine.name}】除役報廢嗎？回收變賣金額 NT$ ${resellPrice.toLocaleString()}`)) {
        return;
      }

      // 解綁工程師
      if (machine.assignedEngineerId) {
        const staff = state.staff.find(s => s.id === machine.assignedEngineerId);
        if (staff) staff.assignedMachineId = null;
      }

      const idx = state.machines.findIndex(m => m.id === machine.id);
      if (idx !== -1) {
        state.machines.splice(idx, 1);
      }

      state.player.cash += resellPrice;
      SoundEffects.playCoinChime();
      container.innerHTML = '';
      onUpdate();
    });
  }
}
