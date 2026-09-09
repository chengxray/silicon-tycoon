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
import { QuestEngine } from '../engine/QuestEngine';
import { AchievementEngine } from '../engine/AchievementEngine';
import { SaveGameService } from '../services/SaveGameService';
import { CashFXManager } from './CashFXManager';

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

    // 嚴格分離：機台只能進駐模組/設備工程師，PIE 專責全廠訂單整合
    let assignedStaff = state.staff.find(s => s.id === machine.assignedEngineerId);
    if (assignedStaff && assignedStaff.moduleSpecialty === 'PIE') {
      machine.assignedEngineerId = null;
      assignedStaff = undefined;
    }
    const moduleEngineers = state.staff.filter(s => s.moduleSpecialty !== 'PIE');

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
    const inYellow = ProductionEngine.isMachineInYellowRoom(machine, state.facility.yellowRoomTiles);
    const needsYellow = machine.category === 'LITHO' || machine.category === 'TRACK';

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

            <!-- Yellow Room Safety Warning / Status Banner -->
            ${needsYellow ? (
              !inYellow ? `
                <div class="p-3.5 rounded-xl bg-red-950/70 border border-red-500/80 text-red-200 flex items-start gap-3 animate-pulse shadow-lg shadow-red-950/50">
                  <span class="text-2xl">🚨</span>
                  <div class="space-y-1">
                    <div class="font-bold text-red-300 text-sm flex items-center gap-2">
                      <span>致命白光污染！設備未置於黃光專區</span>
                      <span class="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-extrabold">良率直接歸零 (0%)</span>
                    </div>
                    <div class="text-[11px] text-red-200/90 leading-relaxed">
                      光阻化學分子對環境可見光 (波長小於 500nm 之藍綠白光) 極度敏化。微影掃描機 (LITHO) 與塗膠顯影機 (TRACK) 必須劃設在黃光室 (Yellow Room) 琥珀色地磚內！請點擊頂部導覽列「🏗️ 廠房規劃」劃設黃光區或移動機台。
                    </div>
                  </div>
                </div>
              ` : `
                <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 text-amber-200 flex items-center justify-between font-mono text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🟡</span>
                    <span class="font-bold text-amber-300">黃光專區安全防護中：</span>
                    <span class="text-slate-300">機台受 500nm 以上濾光保護，光阻未受白光污染。</span>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    良率保護正常
                  </span>
                </div>
              `
            ) : ''}

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

            <!-- 6. 整合看板：機台運轉監控與駐站工程師配置 (含雙軌維護機制) -->
            <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5">
              <!-- 設備磨損與健康狀態 -->
              <div>
                <div class="flex items-center justify-between font-mono pb-1.5">
                  <span class="text-white font-bold flex items-center gap-1.5 text-xs">
                    <span>🛠️</span>
                    <span>機台磨損度與在線健康狀態</span>
                  </span>
                  <span class="font-bold ${wearInt > 70 ? 'text-red-400' : (wearInt > 40 ? 'text-amber-400' : 'text-emerald-400')}">
                    磨損: ${wearInt}% (健康度 ${100 - wearInt}%)
                  </span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div class="h-full transition-all duration-300 ${wearInt > 70 ? 'bg-red-500' : (wearInt > 40 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${wearInt}%;"></div>
                </div>

                <!-- Status Badges -->
                <div class="mt-2 space-y-1">
                  ${isTPMActive ? `
                    <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2 text-[11px]">
                      <span class="text-sm">🛡️</span>
                      <div>
                        <span class="font-bold">TPM 24H 零故障在線維護中：</span>
                        駐站工程師在線微調，磨損鎖死在 5% 以下，故障率保證為 0%！
                      </div>
                    </div>
                  ` : ''}
                  ${machine.hasPmTuneUpBonus ? `
                    <div class="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-[11px]">
                      <span class="text-sm">✨</span>
                      <div>
                        <span class="font-bold">腔體精密調校完畢：</span>
                        下一輪加工晶圓批次享有 +3.0% 良率加成！
                      </div>
                    </div>
                  ` : ''}
                  ${isExplosionRisk ? `
                    <div class="p-2 rounded-lg bg-red-950/40 border border-red-600/50 text-red-300 flex items-center gap-2 animate-pulse text-[11px]">
                      <span class="text-sm">💥</span>
                      <div>
                        <span class="font-bold">越級操作極度危險！</span>
                        工程師職等落後機台 2 級以上，每次投片皆有 25% 炸機破壞風險！
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- 駐站模組工程師配置 (嚴格排除 PIE) -->
              <div class="pt-2 border-t border-slate-800/80 space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-xs flex items-center gap-1">
                      <span>🧑‍🔬</span>
                      <span>駐站模組工程師配置</span>
                    </span>
                    <span class="text-[10px] text-slate-500">(PIE 專責全廠訂單整合，不進駐機台)</span>
                  </div>
                  ${assignedStaff ? `
                    <span class="text-[10px] font-mono text-purple-300">
                      ${assignedStaff.rank} (${assignedStaff.moduleSpecialty})
                    </span>
                  ` : '<span class="text-[10px] text-slate-500">無駐站人員</span>'}
                </div>

                <select id="select-station-engineer" class="select-sci-fi w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs">
                  <option value="">-- 未指派駐站工程師 (機台待命，無調校加成) --</option>
                  ${moduleEngineers.map(staff => {
                    const isStationedHere = machine.assignedEngineerId === staff.id;
                    const isSpecialtyMatch = staff.moduleSpecialty === machine.category;
                    const otherMachine = staff.assignedMachineId && staff.assignedMachineId !== machine.id
                      ? state.machines.find(m => m.id === staff.assignedMachineId)
                      : null;
                    
                    let statusPrefix = '🟢 [待命可進駐]';
                    let statusSuffix = '';
                    if (isStationedHere) {
                      statusPrefix = '🔵 [目前駐站本機]';
                    } else if (otherMachine) {
                      statusPrefix = `🔄 [進駐於: ${otherMachine.name}]`;
                      statusSuffix = ' ➔ 選取將交換崗位';
                    }

                    return `
                      <option value="${staff.id}" ${isStationedHere ? 'selected' : ''}>
                        ${statusPrefix} ${staff.name} - ${staff.rank} [${staff.moduleSpecialty}${isSpecialtyMatch ? ' ★專長吻合' : ''}] (疲勞: ${Math.round(staff.fatigue)}%)${statusSuffix}
                      </option>
                    `;
                  }).join('')}
                </select>

                <div class="text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                  ${assignedStaff ? `
                    <span>駐站人員：<strong class="text-slate-200">${assignedStaff.name}</strong> (${assignedStaff.rank} | 專長: ${assignedStaff.moduleSpecialty} | 疲勞: <strong class="${assignedStaff.fatigue >= 80 ? 'text-red-400 font-bold' : 'text-emerald-400'}">${Math.round(assignedStaff.fatigue)}%</strong>)</span>
                  ` : `
                    <span class="text-amber-400/80">💡 指派模組工程師駐站後，可啟動 TPM 零故障保護與執行精密 PM 預防保養！</span>
                  `}
                  <span class="text-[10px] text-cyan-400/90 font-mono">支援選取已派員機台自動「交換崗位」</span>
                </div>
              </div>

              <!-- 雙軌清晰維護操作：工程師精密 PM 保養 vs 原廠專案大修 -->
              <div class="pt-2 border-t border-slate-800/80 space-y-2">
                <div class="text-[11px] font-bold text-slate-300">設備維護與調校作業：</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <!-- 軌道一：工程師精密 PM 預防保養 -->
                  <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2">
                    <div>
                      <div class="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <span>🔍</span>
                        <span>工程師精密預防保養 (PM)</span>
                      </div>
                      <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        由駐站工程師清潔腔體與真空光學校準。消耗 10% 疲勞，磨損立即歸零，並賦予次輪良率 +3.0% 調校加成！
                      </p>
                    </div>
                    <button
                      id="btn-engineer-pm"
                      class="btn-sci-fi w-full justify-center text-xs py-2 bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 font-bold ${!assignedStaff || (assignedStaff && assignedStaff.fatigue >= 90) ? 'opacity-50 cursor-not-allowed' : ''}"
                      ${!assignedStaff || (assignedStaff && assignedStaff.fatigue >= 90) ? 'disabled' : ''}
                      title="由駐站工程師執行腔體深入清潔與精密調校"
                    >
                      ${!assignedStaff ? '⚠️ 需先指派駐站工程師' : (assignedStaff.fatigue >= 90 ? '⚠️ 工程師過勞 (疲勞≥90%)' : '🔍 執行精密 PM 保養 (-10%疲勞)')}
                    </button>
                  </div>

                  <!-- 軌道二：原廠深度大修 -->
                  <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2">
                    <div>
                      <div class="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <span>🛠️</span>
                        <span>原廠專案深度大修 (Overhaul)</span>
                      </div>
                      <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        委請原廠設備商更換耗材零件，花費資金免消耗工程師疲勞。可修復所有磨損並解決故障停機。
                      </p>
                    </div>
                    <button
                      id="btn-machine-overhaul"
                      class="btn-sci-fi w-full justify-center text-xs py-2 bg-cyan-800/80 hover:bg-cyan-700 border border-cyan-500/50 text-white font-bold ${state.player.cash < overhaulCost || (machine.wear <= 5 && machine.status !== 'EXPLODED' && machine.status !== 'MAINTENANCE') ? 'opacity-50 cursor-not-allowed' : ''}"
                      ${state.player.cash < overhaulCost || (machine.wear <= 5 && machine.status !== 'EXPLODED' && machine.status !== 'MAINTENANCE') ? 'disabled' : ''}
                      title="花費資金由原廠設備商執行深度大修"
                    >
                      🛠️ 原廠大修 (NT$ ${overhaulCost.toLocaleString()})
                    </button>
                  </div>
                </div>

                <!-- 報廢變賣按鈕 -->
                <div class="flex justify-end pt-1">
                  <button
                    id="btn-machine-decommission"
                    class="px-3.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors cursor-pointer"
                  >
                    ♻️ 報廢變賣此機台 (+NT$ ${resellPrice.toLocaleString()})
                  </button>
                </div>
              </div>
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

    // 工程師更換指派 (支援真實雙向「交換崗位」機制)
    document.getElementById('select-station-engineer')?.addEventListener('change', (e) => {
      SoundEffects.playClick();
      const staffId = (e.target as HTMLSelectElement).value || null;
      const currentStaff = machine.assignedEngineerId ? state.staff.find(s => s.id === machine.assignedEngineerId) : null;

      if (!staffId) {
        // 取消駐站工程師
        if (currentStaff) currentStaff.assignedMachineId = null;
        machine.assignedEngineerId = null;
      } else {
        const newStaff = state.staff.find(s => s.id === staffId);
        if (newStaff) {
          const prevMachine = newStaff.assignedMachineId
            ? state.machines.find(m => m.id === newStaff.assignedMachineId)
            : null;

          if (prevMachine && currentStaff && prevMachine.id !== machine.id) {
            // 【真實雙向交換崗位 (Position Swap)】
            // newStaff 轉駐當前 machine，原駐站 currentStaff 交換至 prevMachine
            prevMachine.assignedEngineerId = currentStaff.id;
            currentStaff.assignedMachineId = prevMachine.id;
            machine.assignedEngineerId = newStaff.id;
            newStaff.assignedMachineId = machine.id;
          } else {
            // 一般指派：若新工程師原本在其他機台，該機台變為空置
            if (prevMachine) {
              prevMachine.assignedEngineerId = null;
            }
            if (currentStaff) {
              currentStaff.assignedMachineId = null;
            }
            machine.assignedEngineerId = newStaff.id;
            newStaff.assignedMachineId = machine.id;
          }

          // 指派工程師進駐巡檢維護 -> 推進每日任務
          QuestEngine.onMachineMaintained(state.questState);
          AchievementEngine.checkAchievements(state);
          SaveGameService.saveToLocalStorage(state);
        }
      }

      onUpdate();
      this.render(container, machine, state, onUpdate);
    });

    // 執行工程師精密 PM 預防保養 (腔體調校與磨損歸零)
    const handleEngineerPm = () => {
      if (!machine.assignedEngineerId) {
        alert('請先在上方下拉選單指派駐站工程師，方可執行精密 PM 保養！');
        return;
      }

      const staff = state.staff.find(s => s.id === machine.assignedEngineerId);
      if (!staff) return;

      if (staff.fatigue >= 90) {
        alert(`工程師 ${staff.name} 疲勞度過高 (${Math.round(staff.fatigue)}%)，體力不支無法執行調校！請至人資中心安排排休恢復精力！`);
        return;
      }

      SoundEffects.playClick();
      // 磨損立即歸零
      machine.wear = 0;
      // 賦予次輪良率調校加成
      machine.hasPmTuneUpBonus = true;
      // 消耗工程師疲勞 10%
      staff.fatigue = Math.min(100, staff.fatigue + 10);
      // 推進每日任務
      QuestEngine.onMachineMaintained(state.questState);
      AchievementEngine.checkAchievements(state);
      SaveGameService.saveToLocalStorage(state);

      onUpdate();
      this.render(container, machine, state, onUpdate);
    };

    document.getElementById('btn-engineer-pm')?.addEventListener('click', handleEngineerPm);
    document.getElementById('btn-engineer-inspect')?.addEventListener('click', handleEngineerPm);

    // 原廠深度大修
    document.getElementById('btn-machine-overhaul')?.addEventListener('click', (e) => {
      const spec = StoreModal.STORE_CATALOG.find(c => c.modelId === machine.modelId);
      const overhaulCost = spec ? Math.round(spec.price * 0.15) : 300_000;

      if (state.player.cash < overhaulCost) {
        alert('資金不足，無法執行大修！');
        return;
      }

      state.player.cash -= overhaulCost;
      FinanceEngine.recordMaintenance(state, overhaulCost);
      CashFXManager.trigger(-overhaulCost, e.currentTarget as HTMLElement);
      machine.wear = 0;
      machine.status = 'IDLE';

      // 大修亦推進機台保養任務
      QuestEngine.onMachineMaintained(state.questState);
      AchievementEngine.checkAchievements(state);
      SaveGameService.saveToLocalStorage(state);

      SoundEffects.playCoinChime();
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
        ProductionEngine.updateMachineNames(state.machines);
      }

      state.player.cash += resellPrice;
      SoundEffects.playCoinChime();
      container.innerHTML = '';
      onUpdate();
    });
  }
}
