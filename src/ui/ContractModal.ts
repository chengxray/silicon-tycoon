/**
 * ContractModal.ts
 * 負責合約看板與在製訂單追蹤：
 * 1. 承接 IC 設計公司市場代工訂單，即刻領取 NRE 光罩研發預付款，投入產線排程
 * 2. 訂單持久化儲存於 SaveGameV2.marketOrders，開啟/關閉視窗不隨意重洗
 * 3. 每接一筆訂單啟動 60 秒冷卻逐筆補齊，或付費派遣商業獵單顧問一鍵刷新
 * 4. 監控在製晶圓批次 (Wafer Lots) 之加工站點、Q-Time 死線與出貨結算
 */

import { SaveGameV2, WaferLotData } from '../types';
import { EconomyEngine } from '../engine/EconomyEngine';
import { ProductionEngine } from '../engine/ProductionEngine';
import { SoundEffects } from '../audio/SoundEffects';
import { RayleighEngine } from '../engine/RayleighEngine';
import { AchievementEngine } from '../engine/AchievementEngine';
import { FinanceEngine } from '../engine/FinanceEngine';
import { SaveGameService } from '../services/SaveGameService';
import { WaferMapModal } from './WaferMapModal';
import { LayerAllocationModal } from './LayerAllocationModal';

export class ContractModal {
  private static currentTab: 'MARKET' | 'ACTIVE' = 'MARKET';
  private static countdownIntervalId: number | null = null;

  public static show(state: SaveGameV2, onUpdate: () => void): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    // 確保市場訂單池已持久化存在，不隨意在開關彈窗時刷新
    EconomyEngine.ensureMarketOrders(state);

    this.render(container, state, onUpdate);
  }

  private static render(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    const marketOrders = state.marketOrders || [];
    const rollingYield = state.rollingYieldHistory.length > 0
      ? state.rollingYieldHistory.reduce((a, b) => a + b, 0) / state.rollingYieldHistory.length
      : null;
    const trustMultiplier = EconomyEngine.calculateTrustMultiplier(rollingYield);

    // 計算廠內最高解析度之微影機極限 CD (防呆檢查)
    const bestLithoCD = this.getBestLithoCD(state);
    const refreshCost = EconomyEngine.getMarketRefreshCost(state.player.foundryTier);

    container.innerHTML = `
      <div id="modal-backdrop-contract" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl flex-shrink-0">
                📋
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>晶圓代工合約與光罩廠</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    Tier ${state.player.foundryTier}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  承接全球客戶晶片訂單，即刻領取 NRE 光罩研發預付款，投入潔淨室量產！
                </p>
              </div>
            </div>

            <!-- Trust Indicator -->
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <div class="text-[10px] text-slate-400 uppercase tracking-wider">客戶信任溢價</div>
                <div class="text-sm font-mono font-bold ${trustMultiplier >= 1.0 ? 'text-emerald-400' : 'text-amber-400'}">
                  ${trustMultiplier.toFixed(2)}x
                  <span class="text-[10px] text-slate-400">(${rollingYield !== null ? (rollingYield * 100).toFixed(1) + '%' : 'N/A'})</span>
                </div>
              </div>
              <button id="btn-close-contract" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉合約板">
                ✕
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/40 px-6 pt-2 flex-shrink-0">
            <button id="tab-market" class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${this.currentTab === 'MARKET' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'}">
              <span>🌐 承接市場訂單池</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${marketOrders.length}</span>
            </button>
            <button id="tab-active" class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${this.currentTab === 'ACTIVE' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'}">
              <span>⚡ 在製訂單與批次</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">${state.activeOrders.length}</span>
            </button>
            <div class="ml-auto py-1.5 flex items-center">
              ${this.currentTab === 'MARKET' ? `
                <button id="btn-refresh-market" class="btn-sci-fi text-xs py-1.5 px-3 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/60 text-amber-300 font-bold flex items-center gap-1.5 shadow-sm cursor-pointer" title="派遣商業獵單顧問重新招攬合約池 (費用: NT$ ${refreshCost.toLocaleString()})">
                  <span>🔄 商業獵單刷新</span>
                  <span class="font-mono text-amber-200">(NT$ ${refreshCost.toLocaleString()})</span>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.currentTab === 'MARKET'
              ? this.renderMarketOrders(state, bestLithoCD)
              : this.renderActiveOrders(state)
            }
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-contract" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, state, onUpdate);
  }

  private static renderMarketOrders(state: SaveGameV2, bestLithoCD: number): string {
    const marketOrders = state.marketOrders || [];
    const isFull = marketOrders.length >= EconomyEngine.MAX_MARKET_ORDERS;
    const remSec = state.nextOrderRespawnTime ? Math.max(0, Math.ceil((state.nextOrderRespawnTime - Date.now()) / 1000)) : 0;

    let bannerHtml = '';
    if (!isFull) {
      bannerHtml = `
        <div id="contract-respawn-banner" class="mb-4 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-between text-xs text-slate-300 shadow-md">
          <div class="flex items-center gap-2.5">
            <span class="text-base animate-spin">⏳</span>
            <div>
              <span class="font-bold text-cyan-300">新客戶合約洽談中</span>
              <span class="text-slate-400 ml-1.5">(合約池: ${marketOrders.length}/${EconomyEngine.MAX_MARKET_ORDERS} 筆，每筆訂單冷卻 60 秒陸續送達)</span>
            </div>
          </div>
          <div class="font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
            下一筆合約抵達：<span id="contract-respawn-timer" class="text-amber-300 text-sm font-black">${remSec}</span> 秒
          </div>
        </div>
      `;
    }

    if (marketOrders.length === 0) {
      return `
        ${bannerHtml}
        <div class="text-center py-12 text-slate-400 space-y-3">
          <div class="text-5xl mb-2 animate-bounce">📭</div>
          <p class="text-base font-bold text-slate-200">目前合約公告板已全數接單完畢！</p>
          <p class="text-xs text-slate-400">
            新客戶合約將在冷卻倒數結束後自動送達，或可點擊右上角【商業獵單刷新】即刻引進 5 筆全新合約。
          </p>
        </div>
      `;
    }

    return `
      ${bannerHtml}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${marketOrders.map((order, idx) => {
          const isLithoCapable = bestLithoCD <= order.nodeNm;
          const nodeStr = order.nodeNm >= 1000
            ? `${order.nodeNm / 1000} µm`
            : `${order.nodeNm} nm`;

          let urgencyBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">常規件 (1.0x)</span>`;
          if (order.urgencyMultiplier === 1.2) {
            urgencyBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 急件 (1.2x)</span>`;
          } else if (order.urgencyMultiplier >= 1.5) {
            urgencyBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">🔴 SHR 超急件 (1.5x)</span>`;
          }

          const estTotalPayout = order.nrePaid + order.totalDies * order.unitPrice;

          return `
            <div class="p-4 rounded-xl bg-slate-900/80 border ${isLithoCapable ? 'border-slate-800 hover:border-cyan-500/40' : 'border-red-900/40 bg-red-950/10'} transition-all flex flex-col justify-between space-y-3">
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${order.clientName}</span>
                    ${urgencyBadge}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5 font-mono">
                    合約編號: ${order.id}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold font-mono text-cyan-300">${nodeStr}</div>
                  <div class="text-[10px] text-slate-400">${order.layerCount} 道光罩層</div>
                </div>
              </div>

              <!-- Card Specs -->
              <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <div class="text-[10px] text-slate-400">總晶粒需求</div>
                  <div class="font-mono font-semibold text-slate-200">${order.totalDies.toLocaleString()} 顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">出貨單價</div>
                  <div class="font-mono font-semibold text-emerald-400">NT$ ${order.unitPrice.toFixed(2)} /顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">💰 接單即付 NRE</div>
                  <div class="font-mono font-bold text-amber-300">+NT$ ${order.nrePaid.toLocaleString()}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">預估合約總值</div>
                  <div class="font-mono font-semibold text-cyan-300">~NT$ ${Math.round(estTotalPayout).toLocaleString()}</div>
                </div>
              </div>

              <!-- Litho CD warning or ready -->
              ${!isLithoCapable ? `
                <div class="p-2 rounded bg-red-900/20 border border-red-700/30 text-[11px] text-red-300 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>廠內機台極限 CD (${bestLithoCD === 999999 ? '無微影機' : bestLithoCD + 'nm'}) 無法滿足 ${nodeStr} 製程需求！</span>
                </div>
              ` : `
                <div class="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>⏱️ 交付時限:</span>
                  <span class="font-mono text-slate-300">${Math.max(0, order.deadlineGameTime - state.gameTime)} 遊戲秒</span>
                </div>
              `}

              <!-- Action Button -->
              <button
                class="btn-accept-order btn-sci-fi w-full justify-center ${!isLithoCapable ? 'opacity-50 cursor-not-allowed' : ''}"
                data-index="${idx}"
                ${!isLithoCapable ? 'disabled' : ''}
              >
                ✍️ 簽約接單 (即刻領取 NT$ ${order.nrePaid.toLocaleString()})
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private static renderActiveOrders(state: SaveGameV2): string {
    if (state.activeOrders.length === 0) {
      return `
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">⚙️</div>
          <p class="text-sm">目前產線無在製訂單，請前往「承接市場訂單池」簽約接單！</p>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        ${state.activeOrders.map((order) => {
          const remainingSec = Math.max(0, order.deadlineGameTime - state.gameTime);
          const isOverdue = remainingSec === 0;
          const relatedLots = state.activeLots.filter(l => l.orderId === order.id);
          const progressPercent = Math.min(100, Math.round((order.goodDiesDelivered / order.totalDies) * 100));

          return `
            <div class="p-4 rounded-xl bg-slate-900/80 border ${isOverdue ? 'border-red-600/50' : 'border-slate-800'} space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">${order.clientName}</span>
                    <span class="text-xs font-mono text-cyan-300">
                      [${order.nodeNm >= 1000 ? order.nodeNm / 1000 + 'µm' : order.nodeNm + 'nm'}]
                    </span>
                    ${isOverdue ? '<span class="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold animate-pulse">逾期追討中</span>' : ''}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5 font-mono">
                    合約編號: ${order.id} | 光罩層數: ${order.layerCount} 層
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-xs ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}">
                    ${isOverdue ? '已過期 (違約罰金累積中)' : `剩餘交期: ${remainingSec} 秒`}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    出貨單價: NT$ ${order.unitPrice.toFixed(2)} /顆
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-400">出貨進度</span>
                  <span class="font-mono text-cyan-300">${order.goodDiesDelivered.toLocaleString()} / ${order.totalDies.toLocaleString()} 顆 (${progressPercent}%)</span>
                </div>
                <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div class="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300" style="width: ${progressPercent}%"></div>
                </div>
              </div>

              <!-- Lots in Production -->
              <div>
                <div class="text-xs text-slate-400 font-semibold mb-2">在製批次 (Wafer Lots) 狀態：</div>
                ${relatedLots.length === 0 ? `
                  <div class="text-xs text-slate-400 italic">尚無加工批次投入</div>
                ` : `
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${relatedLots.map(lot => {
                      let stationBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">${lot.currentStation}</span>`;
                      if (lot.currentStation === 'LIT') {
                        stationBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">微影 (${lot.litSubStep || 'COAT'})</span>`;
                      } else if (lot.status === 'COMPLETED') {
                        stationBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">已完工</span>`;
                      }

                      // 尋找當前承載此批次的機台
                      const targetMachine = state.machines.find(m => {
                        if (m.status === 'EXPLODED') return false;
                        if (lot.currentStation === 'LIT') {
                          if (lot.litSubStep === 'COAT' || lot.litSubStep === 'DEVELOP') return m.category === 'TRACK';
                          return m.category === 'LITHO';
                        }
                        return m.category === lot.currentStation;
                      });
                      const machineName = targetMachine ? targetMachine.name : '自動分配中';

                      let qTimeNotice = '';
                      if (lot.qTimeDeadline !== null) {
                        const qRem = Math.max(0, lot.qTimeDeadline - state.gameTime);
                        qTimeNotice = `<span class="text-[10px] font-mono ${qRem < 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}">⏳ Q-Time: ${qRem}s</span>`;
                      }

                      return `
                        <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2">
                          <div>
                            <div class="font-mono text-slate-200 font-semibold flex items-center gap-1.5">
                              <span>${lot.lotId}</span>
                              <button class="btn-inspect-lot text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/50 flex items-center gap-0.5 cursor-pointer" data-lot-id="${lot.lotId}" title="點擊檢視蒙地卡羅晶圓圖">
                                <span>🔍</span><span>晶圓圖</span>
                              </button>
                            </div>
                            <div class="text-[10px] text-slate-400 mt-0.5">
                              層數: ${lot.currentLayer}/${lot.totalLayers} | 站點: ${stationBadge}
                            </div>
                            <div class="text-[10px] text-cyan-300/90 font-mono mt-0.5 flex items-center gap-1">
                              <span>🏭 機台:</span>
                              <span class="font-bold truncate max-w-[140px]">${machineName}</span>
                            </div>
                          </div>
                          <div class="text-right flex-shrink-0">
                            <div class="text-[10px] text-emerald-400 font-mono font-bold">良率: ${(lot.yieldMultiplier * 100).toFixed(0)}%</div>
                            ${qTimeNotice}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between gap-2 pt-1">
                <div>
                  ${order.layerCount > 1 ? `
                    <button class="btn-layer-allocation btn-sci-fi text-xs py-1 px-3 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 flex items-center gap-1.5 cursor-pointer" data-order-id="${order.id}" title="自訂先進製程多層微影機台分配">
                      <span>🎛️</span>
                      <span>微影分層配方 (${order.layerAllocations?.length || order.layerCount}層)</span>
                    </button>
                  ` : ''}
                </div>

                <div class="flex items-center gap-2">
                  ${relatedLots.length === 0 || relatedLots.every(l => l.status === 'COMPLETED') ? `
                    <button class="btn-settle-order btn-sci-fi text-xs py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 cursor-pointer" data-order-id="${order.id}">
                      📦 完成出貨結算尾款
                    </button>
                  ` : `
                    <div class="text-[11px] text-slate-400 flex items-center gap-1">
                      <span class="animate-spin">⚙️</span>
                      <span>晶圓加工中，完工後自動出貨...</span>
                    </div>
                  `}
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private static bindEvents(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    const closeModal = () => {
      if (this.countdownIntervalId !== null) {
        clearInterval(this.countdownIntervalId);
        this.countdownIntervalId = null;
      }
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

    // 關閉
    document.getElementById('btn-close-contract')?.addEventListener('click', closeModal);
    document.getElementById('btn-back-contract')?.addEventListener('click', closeModal);

    // 點擊背景關閉
    document.getElementById('modal-backdrop-contract')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-backdrop-contract')) {
        closeModal();
      }
    });

    // 分頁切換
    document.getElementById('tab-market')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.currentTab = 'MARKET';
      this.render(container, state, onUpdate);
    });

    document.getElementById('tab-active')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.currentTab = 'ACTIVE';
      this.render(container, state, onUpdate);
    });

    // 商業獵單付費刷新
    document.getElementById('btn-refresh-market')?.addEventListener('click', () => {
      const refreshCost = EconomyEngine.getMarketRefreshCost(state.player.foundryTier);
      if (state.player.cash < refreshCost) {
        SoundEffects.playClick();
        alert(`❌ 廠房資金不足！派遣商業獵單顧問需要 NT$ ${refreshCost.toLocaleString()}，目前現金僅有 NT$ ${Math.round(state.player.cash).toLocaleString()}`);
        return;
      }

      const confirmed = confirm(
        `【商業獵單刷新確認】\n\n您確定要支付 NT$ ${refreshCost.toLocaleString()} 聘請半導體商業獵單顧問，為合約板重新引入 5 筆全新客戶合約嗎？`
      );
      if (!confirmed) return;

      state.player.cash -= refreshCost;
      FinanceEngine.recordOpEx(state, '商業獵單顧問費', refreshCost);
      EconomyEngine.forceRefreshAllMarketOrders(state);
      SaveGameService.saveToLocalStorage(state);

      SoundEffects.playCoin();
      this.render(container, state, onUpdate);
      onUpdate();
    });

    // 設定定時倒數器更新看板 (不閃爍重刷)
    if (this.countdownIntervalId !== null) {
      clearInterval(this.countdownIntervalId);
    }
    this.countdownIntervalId = window.setInterval(() => {
      if (this.currentTab === 'MARKET') {
        const prevCount = (state.marketOrders || []).length;
        const replenished = EconomyEngine.checkOrderReplenishment(state);
        const currentCount = (state.marketOrders || []).length;
        if (replenished || prevCount !== currentCount) {
          SaveGameService.saveToLocalStorage(state);
          this.render(container, state, onUpdate);
          return;
        }

        const timerEl = document.getElementById('contract-respawn-timer');
        if (timerEl) {
          const remSec = state.nextOrderRespawnTime ? Math.max(0, Math.ceil((state.nextOrderRespawnTime - Date.now()) / 1000)) : 0;
          timerEl.textContent = `${remSec}`;
        }
      }
    }, 1000);

    // 簽約接單
    container.querySelectorAll('.btn-accept-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0', 10);
        const marketOrders = state.marketOrders || [];
        const order = marketOrders[index];
        if (!order) return;

        // 接單音效
        SoundEffects.playCoinChime();

        // 1. 即刻發放 NRE 光罩研發款
        state.player.cash += order.nrePaid;
        FinanceEngine.recordNREFee(state, order.nrePaid);

        // 2. 加入 activeOrders
        state.activeOrders.push(order);

        // 3. 建立對應的 WaferLotData 批次投入產線
        const lotCount = Math.max(1, Math.min(3, Math.ceil(order.totalDies / 1000)));
        for (let i = 0; i < lotCount; i++) {
          const lot: WaferLotData = {
            lotId: `LOT-${Date.now().toString(36).toUpperCase().slice(-4)}-${i + 1}`,
            orderId: order.id,
            waferCount: Math.ceil(order.totalDies / lotCount / (order.nodeNm >= 1000 ? 500 : 2000)),
            currentStation: 'FILM',
            currentLayer: 1,
            totalLayers: order.layerCount,
            qTimeDeadline: null,
            yieldMultiplier: 1.0,
            status: 'PROCESSING',
            stationProgressSeconds: 0,
            stationRequiredSeconds: ProductionEngine.getStationRequiredSeconds('FILM')
          };
          state.activeLots.push(lot);
        }

        // 4. 從市場池移除，啟動冷卻補齊計時器
        marketOrders.splice(index, 1);
        if (marketOrders.length < EconomyEngine.MAX_MARKET_ORDERS && !state.nextOrderRespawnTime) {
          state.nextOrderRespawnTime = Date.now() + EconomyEngine.ORDER_RESPAWN_COOLDOWN_MS;
        }

        // 5. 檢核成就與存檔
        AchievementEngine.checkAchievements(state);
        SaveGameService.saveToLocalStorage(state);

        onUpdate();
        this.currentTab = 'ACTIVE';
        this.render(container, state, onUpdate);
      });
    });

    // 手動交付結算
    container.querySelectorAll('.btn-settle-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orderId = (e.currentTarget as HTMLElement).getAttribute('data-order-id');
        const orderIndex = state.activeOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = state.activeOrders[orderIndex];
        const goodDies = order.goodDiesDelivered > 0 ? order.goodDiesDelivered : order.totalDies * 0.95;

        // 結算尾款與清償債務
        const payout = EconomyEngine.settleOrderPayout(
          order,
          goodDies,
          state.player,
          state.staff,
          0,
          state.clawbackDebt
        );

        state.player.cash += payout.netPayout;
        FinanceEngine.recordWaferSales(state, payout.netPayout);
        state.clawbackDebt = payout.remainingDebt;

        // 累計研發晉升指標：已交付訂單數與晶圓片數
        const orderLots = state.activeLots.filter(l => l.orderId === order.id);
        const orderWafers = orderLots.reduce((sum, l) => sum + (l.waferCount || 25), 0) || 25;
        state.player.totalOrdersFulfilled = (state.player.totalOrdersFulfilled || 0) + 1;
        state.player.totalWafersDelivered = (state.player.totalWafersDelivered || 0) + orderWafers;

        // 移除完工訂單與相關 lots
        state.activeOrders.splice(orderIndex, 1);
        state.activeLots = state.activeLots.filter(l => l.orderId !== order.id);

        SoundEffects.playFanfare();
        AchievementEngine.checkAchievements(state);
        SaveGameService.saveToLocalStorage(state);

        onUpdate();
        this.render(container, state, onUpdate);
      });
    });

    // 點擊檢視單一批次蒙地卡羅晶圓圖
    container.querySelectorAll('.btn-inspect-lot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lotId = (e.currentTarget as HTMLElement).getAttribute('data-lot-id');
        const targetLot = state.activeLots.find(l => l.lotId === lotId);
        SoundEffects.playClick();
        WaferMapModal.show(state, targetLot, () => {
          this.render(container, state, onUpdate);
          onUpdate();
        });
      });
    });

    // 點擊開啟先進多層微影分層配方指派彈窗
    container.querySelectorAll('.btn-layer-allocation').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orderId = (e.currentTarget as HTMLElement).getAttribute('data-order-id');
        const targetOrder = state.activeOrders.find(o => o.id === orderId);
        if (!targetOrder) return;
        SoundEffects.playClick();
        LayerAllocationModal.show(state, targetOrder, () => {
          this.render(container, state, onUpdate);
          onUpdate();
        });
      });
    });
  }

  /**
   * 取得廠內現有機台最高解析度之極限 CD
   */
  private static getBestLithoCD(state: SaveGameV2): number {
    const lithoMachines = state.machines.filter(m => m.category === 'LITHO' && m.status !== 'EXPLODED');
    if (lithoMachines.length === 0) return 999999;

    let minCD = 999999;
    for (const m of lithoMachines) {
      const spec = RayleighEngine.OPTICAL_CATALOG[m.modelId];
      if (spec && spec.baseRayleighLimitNm < minCD) {
        minCD = spec.baseRayleighLimitNm;
      }
    }
    return minCD;
  }
}
