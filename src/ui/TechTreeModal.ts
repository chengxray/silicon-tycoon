/**
 * TechTreeModal.ts
 * 負責半導體製程世代科技樹 (Technology Roadmap) 視覺化互動中心：
 * 1. 6 大半導體歷史演進世代天梯 (Tier 1 微米 ~ Tier 6 埃米 High-NA EUV)
 * 2. 三維晉升指標即時進度條：
 *    - 📜 代工訂單交付數 (Total Orders Fulfilled)
 *    - 💿 晶圓產出總量 (Total Wafers Delivered)
 *    - 💰 研發資金注資額 (R&D Capital Invested)
 * 3. 研發資金注資控制項 (+5M, +20M, +100M, 全額補足 Max)
 * 4. 次世代解鎖機台與製程規格預覽 (Min CD, Cleanroom Class, MES, CMP, SAQP)
 * 5. 🚀 突破世代晉升按鈕 (Advance Foundry Tier)
 */

import { SaveGameV2 } from '../types';
import { TechTreeEngine } from '../engine/TechTreeEngine';
import { StoreModal } from './StoreModal';
import { SoundEffects } from '../audio/SoundEffects';

export class TechTreeModal {
  private static selectedViewTier: number | null = null;

  public static show(state: SaveGameV2, onUpdate: () => void): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    // 預設檢視下一個研發目標世代 (若已攻頂則檢視 Tier 6)
    const currentTier = state.player.foundryTier || 1;
    this.selectedViewTier = Math.min(TechTreeEngine.MAX_TIER, currentTier + 1);

    this.render(container, state, onUpdate);
  }

  private static render(container: HTMLElement, state: SaveGameV2, onUpdate: () => void): void {
    const status = TechTreeEngine.getProgressionStatus(state);
    const curConfig = TechTreeEngine.getTierConfig(status.currentTier);
    const viewTier = this.selectedViewTier || Math.min(TechTreeEngine.MAX_TIER, status.currentTier + 1);
    const viewConfig = TechTreeEngine.getTierConfig(viewTier);

    container.innerHTML = `
      <div id="modal-backdrop-techtree" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-5xl max-h-[92vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-scaleUp">
          
          <!-- 1. Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex-shrink-0">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-inner text-cyan-300">
                🔬
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <h3 class="text-base font-bold text-white tracking-wide">
                    半導體製程世代科技樹 (Technology Roadmap)
                  </h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono border border-cyan-500/40">
                    目前水準: Tier ${status.currentTier}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>當前掌握：<strong class="text-amber-300">${curConfig.name}</strong> (${curConfig.subtitle})</span>
                  <span>|</span>
                  <span>廠房可用資金: <strong class="text-emerald-400 font-mono">NT$ ${Math.round(state.player.cash).toLocaleString()}</strong></span>
                </p>
              </div>
            </div>

            <button id="btn-close-techtree" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉科技樹">
              ✕
            </button>
          </div>

          <!-- 2. 六大半導體世代橫向演進路線圖 (Horizontal Roadmap) -->
          <div class="px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 overflow-x-auto flex-shrink-0">
            <div class="flex items-center justify-between min-w-[720px] gap-2 relative">
              
              <!-- 串聯連線 -->
              <div class="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0 rounded-full"></div>
              
              ${Array.from({ length: TechTreeEngine.MAX_TIER }, (_, i) => i + 1).map(tier => {
                const conf = TechTreeEngine.getTierConfig(tier);
                const isPassed = tier < status.currentTier;
                const isCurrent = tier === status.currentTier;
                const isNext = tier === status.currentTier + 1;
                const isSelected = tier === viewTier;

                let ringClass = 'border-slate-700 bg-slate-900 text-slate-500';
                let tagText = '未解鎖';
                let tagColor = 'bg-slate-800 text-slate-500 border-slate-700';

                if (isPassed) {
                  ringClass = 'border-emerald-500/80 bg-emerald-950/60 text-emerald-400 shadow-lg shadow-emerald-950/50';
                  tagText = '已突破';
                  tagColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
                } else if (isCurrent) {
                  ringClass = 'border-cyan-400 bg-cyan-950/80 text-cyan-300 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-950/60';
                  tagText = '當前世代';
                  tagColor = 'bg-cyan-900/80 text-cyan-200 border-cyan-400/50';
                } else if (isNext) {
                  ringClass = 'border-amber-400/90 bg-amber-950/70 text-amber-300 ring-2 ring-amber-500/30 pulse-alert';
                  tagText = `研發中 ${status.overallPct}%`;
                  tagColor = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
                }

                return `
                  <button
                    class="btn-tier-node z-10 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer group ${isSelected ? 'scale-105 bg-slate-800/80 ring-2 ring-cyan-400' : 'hover:bg-slate-900/50'}"
                    data-tier="${tier}"
                    title="點擊檢視 Tier ${tier} ${conf.name} 詳細製程規格"
                  >
                    <div class="w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-sm transition-transform ${ringClass} group-hover:scale-110">
                      ${isPassed ? '✓' : `T${tier}`}
                    </div>
                    <div class="text-center">
                      <div class="text-[11px] font-bold text-slate-200 truncate max-w-[105px]">${conf.name.slice(0, 7)}</div>
                      <span class="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono border ${tagColor}">
                        ${tagText}
                      </span>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 3. 主內容區：檢視世代詳情 + 研發進度三大指標與注資 -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-6">

            <!-- 世代總覽標頭卡片 -->
            <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    Tier ${viewConfig.tier} • ${viewConfig.eraCode}
                  </span>
                  ${viewConfig.tier === status.currentTier ? '<span class="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">★ 現役工廠世代</span>' : ''}
                  ${viewConfig.tier === status.currentTier + 1 ? '<span class="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">🎯 次世代微縮目標</span>' : ''}
                </div>
                <h4 class="text-lg font-bold text-white tracking-wide">
                  ${viewConfig.name} <span class="text-sm font-normal text-slate-400 font-sans">(${viewConfig.subtitle})</span>
                </h4>
                <p class="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  ${viewConfig.description}
                </p>
                <div class="mt-2 text-[11px] text-amber-300/90 flex items-start gap-1.5 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                  <span>💡</span>
                  <span><strong>物理科技史：</strong>${viewConfig.scienceHistory}</span>
                </div>
              </div>

              <!-- 關鍵參數摘要 -->
              <div class="flex md:flex-col gap-3 min-w-[180px] bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span class="text-[10px] text-slate-400 block font-sans">極限線寬 (Min CD)</span>
                  <span class="text-sm font-bold text-cyan-400">${viewConfig.minCDNm >= 1000 ? (viewConfig.minCDNm / 1000).toFixed(1) + ' µm' : viewConfig.minCDNm + ' nm'}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block font-sans">要求潔淨室標準</span>
                  <span class="text-sm font-bold text-emerald-400">${viewConfig.unlockedCleanroomClass}</span>
                </div>
              </div>
            </div>

            <!-- 研發進度三大指標 (若檢視的是次世代目標) -->
            ${!status.isMaxTier && viewConfig.tier === status.currentTier + 1 ? `
              <div class="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl space-y-5">
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🎯</span>
                    <h4 class="text-sm font-bold text-white tracking-wide">
                      次世代製程微縮突破條件 (研發完成度：<span class="text-amber-400 font-mono">${status.overallPct}%</span>)
                    </h4>
                  </div>
                  <span class="text-xs text-slate-400">
                    滿足下列三項代工實績與資本指標即可正式晉升！
                  </span>
                </div>

                <!-- 三大進度條 -->
                <div class="space-y-4">
                  <!-- 1. 訂單交付 -->
                  <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div class="flex justify-between items-center text-xs mb-1.5">
                      <span class="text-slate-300 flex items-center gap-1.5 font-medium">
                        <span>📜</span>
                        <span>代工訂單累積交付</span>
                        <span class="font-mono text-slate-400">(${status.ordersCompleted} / ${status.ordersTarget} 筆)</span>
                      </span>
                      <span class="font-mono font-bold ${status.ordersMet ? 'text-emerald-400' : 'text-amber-400'}">
                        ${status.ordersMet ? '✅ 已達標' : `還差 ${status.ordersTarget - status.ordersCompleted} 筆訂單`} (${status.ordersPct}%)
                      </span>
                    </div>
                    <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                      <div class="h-full transition-all duration-500 ${status.ordersMet ? 'bg-emerald-500' : 'bg-cyan-500'}" style="width: ${status.ordersPct}%;"></div>
                    </div>
                  </div>

                  <!-- 2. 晶圓產出總量 -->
                  <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div class="flex justify-between items-center text-xs mb-1.5">
                      <span class="text-slate-300 flex items-center gap-1.5 font-medium">
                        <span>💿</span>
                        <span>晶圓良品累積量產</span>
                        <span class="font-mono text-slate-400">(${status.wafersDelivered} / ${status.wafersTarget} 片)</span>
                      </span>
                      <span class="font-mono font-bold ${status.wafersMet ? 'text-emerald-400' : 'text-amber-400'}">
                        ${status.wafersMet ? '✅ 已達標' : `還差 ${status.wafersTarget - status.wafersDelivered} 片晶圓`} (${status.wafersPct}%)
                      </span>
                    </div>
                    <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                      <div class="h-full transition-all duration-500 ${status.wafersMet ? 'bg-emerald-500' : 'bg-cyan-500'}" style="width: ${status.wafersPct}%;"></div>
                    </div>
                  </div>

                  <!-- 3. 研發注資進度與操作按鈕 -->
                  <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-slate-300 flex items-center gap-1.5 font-medium">
                        <span>💰</span>
                        <span>次世代製程研發資金注資</span>
                        <span class="font-mono text-slate-400">(NT$ ${(status.fundsInvested / 1_000_000).toFixed(1)}M / ${(status.fundsTarget / 1_000_000).toFixed(1)}M)</span>
                      </span>
                      <span class="font-mono font-bold ${status.fundsMet ? 'text-emerald-400' : 'text-amber-400'}">
                        ${status.fundsMet ? '✅ 研發資金已募足' : `尚缺 NT$ ${(status.fundsTarget - status.fundsInvested).toLocaleString()}`} (${status.fundsPct}%)
                      </span>
                    </div>

                    <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                      <div class="h-full transition-all duration-500 ${status.fundsMet ? 'bg-emerald-500' : 'bg-amber-500'}" style="width: ${status.fundsPct}%;"></div>
                    </div>

                    <!-- 注資操作按鈕群 -->
                    ${!status.fundsMet ? `
                      <div class="flex flex-wrap items-center gap-2 pt-1">
                        <span class="text-xs text-slate-400 font-medium">撥款注資研發：</span>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-amber-950/40 border-amber-500/40 text-amber-300 hover:text-white" data-amount="5000000" ${state.player.cash < 5_000_000 ? 'disabled' : ''}>
                          + NT$ 500 萬
                        </button>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-amber-950/40 border-amber-500/40 text-amber-300 hover:text-white" data-amount="20000000" ${state.player.cash < 20_000_000 ? 'disabled' : ''}>
                          + NT$ 2,000 萬
                        </button>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-amber-950/40 border-amber-500/40 text-amber-300 hover:text-white" data-amount="100000000" ${state.player.cash < 100_000_000 ? 'disabled' : ''}>
                          + NT$ 1 億
                        </button>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:text-white ml-auto" data-amount="999999999999" ${state.player.cash <= 0 ? 'disabled' : ''}>
                          ⚡ 一鍵全額注資 (Max)
                        </button>
                      </div>
                    ` : `
                      <div class="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                        <span>✨</span>
                        <span>該世代所有所需研發資金已 100% 注資到位！</span>
                      </div>
                    `}
                  </div>
                </div>

                <!-- 世代晉升大按鈕 -->
                <div class="pt-2">
                  <button
                    id="btn-advance-tier"
                    class="w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                      status.canAdvance
                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white cursor-pointer border-2 border-emerald-300 ring-4 ring-emerald-500/30 pulse-alert'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed'
                    }"
                    ${!status.canAdvance ? 'disabled' : ''}
                  >
                    ${status.canAdvance
                      ? `🚀 達成三大研發條件！立即突破晉升【Tier ${status.nextTierConfig?.tier} ${status.nextTierConfig?.name}】！`
                      : `🔒 尚未達成晉升條件 (完成度 ${status.overallPct}%)`}
                  </button>
                </div>

              </div>
            ` : ''}

            <!-- 攻頂祝賀卡片 (若已達 Tier 6) -->
            ${status.isMaxTier ? `
              <div class="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border-2 border-amber-400 text-center space-y-2 shadow-2xl">
                <div class="text-3xl">🏆</div>
                <h4 class="text-base font-bold text-amber-300">
                  榮登全球半導體霸權之巔！
                </h4>
                <p class="text-xs text-slate-300 max-w-xl mx-auto">
                  恭喜創辦人！您的晶圓廠已完全掌握 2nm 埃米 High-NA EUV 極致微影神技，傲視全球！請持續維持優良良率與滿載稼動，締造矽島不朽傳奇！
                </p>
              </div>
            ` : ''}

            <!-- 該世代解鎖機台與特色預覽 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>🔓</span>
                  <span>Tier ${viewConfig.tier} 專屬解鎖先進機台與製程特色</span>
                </h4>
                <span class="text-[11px] text-slate-400 font-mono">共 ${viewConfig.unlockedModelIds.length} 台次世代設備</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                ${viewConfig.unlockedModelIds.map(modelId => {
                  const item = StoreModal.STORE_CATALOG.find(eq => eq.modelId === modelId);
                  if (!item) return '';

                  return `
                    <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors">
                      <div class="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 flex-shrink-0">
                        <img src="${item.assetPath}" alt="${item.name}" class="w-full h-full object-contain" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-bold text-white truncate">${item.name}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${item.category} • 產能 ${item.throughputWpm} wpm</div>
                        <div class="text-xs font-mono font-bold text-amber-400 mt-1">NT$ ${item.price.toLocaleString()}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

          </div>

          <!-- 4. Footer -->
          <div class="modal-footer p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <span class="text-xs text-slate-400">
              💡 達成訂單與生產目標，注資研發金，解鎖高階機台與高毛利大單！
            </span>
            <button id="btn-back-techtree" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, state, onUpdate);
  }

  private static bindEvents(container: HTMLElement, state: SaveGameV2, onUpdate: () => void): void {
    const backdrop = container.querySelector('#modal-backdrop-techtree');
    const closeBtn = container.querySelector('#btn-close-techtree');
    const backBtn = container.querySelector('#btn-back-techtree');

    const closeModal = () => {
      SoundEffects.playClick();
      container.innerHTML = '';
      onUpdate();
    };

    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
    closeBtn?.addEventListener('click', closeModal);
    backBtn?.addEventListener('click', closeModal);

    // 點選世代天梯節點切換檢視
    container.querySelectorAll('.btn-tier-node').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tier = Number((e.currentTarget as HTMLElement).getAttribute('data-tier'));
        if (tier >= 1 && tier <= TechTreeEngine.MAX_TIER) {
          SoundEffects.playClick();
          this.selectedViewTier = tier;
          this.render(container, state, onUpdate);
        }
      });
    });

    // 撥款注資研發資金按鈕
    container.querySelectorAll('.btn-invest-funds').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const amount = Number((e.currentTarget as HTMLElement).getAttribute('data-amount'));
        const res = TechTreeEngine.investRDCapital(state, amount);
        if (res.success) {
          SoundEffects.playDing();
        } else {
          SoundEffects.playAlarm();
        }
        onUpdate();
        this.render(container, state, onUpdate);
      });
    });

    // 突破晉升世代按鈕
    const advanceBtn = container.querySelector('#btn-advance-tier');
    advanceBtn?.addEventListener('click', () => {
      const res = TechTreeEngine.advanceFoundryTier(state);
      if (res.success) {
        SoundEffects.playFanfare();
        this.selectedViewTier = Math.min(TechTreeEngine.MAX_TIER, res.newTier + 1);
        onUpdate();
        this.render(container, state, onUpdate);
      } else {
        SoundEffects.playAlarm();
        alert(res.message);
      }
    });
  }
}
