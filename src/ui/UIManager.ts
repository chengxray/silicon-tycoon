/**
 * UIManager.ts
 * 負責統籌所有 DOM UI 視窗的開啟、關閉、堆疊層級與事件訂閱
 */

import { SaveGameV2 } from '../types';
import { TopHUD } from './TopHUD';
import { FoundrySetupModal } from './FoundrySetupModal';
import { AdvisoryModal } from './AdvisoryModal';
import { QuestModal } from './QuestModal';
import { AchievementModal } from './AchievementModal';
import { ContractModal } from './ContractModal';
import { StoreModal } from './StoreModal';
import { HRModal } from './HRModal';
import { DevConsole } from './DevConsole';
import { WaferMapModal } from './WaferMapModal';
import { LayerAllocationModal } from './LayerAllocationModal';
import { TutorialOverlay } from './TutorialOverlay';
import { FinancialReportModal } from './FinancialReportModal';
import { UserLoginModal } from './UserLoginModal';
import { TechTreeModal } from './TechTreeModal';
import { SaveGameService } from '../services/SaveGameService';
import { SoundEffects } from '../audio/SoundEffects';
import { OrderData, WaferLotData } from '../types';

export class UIManager {
  private topHUD: TopHUD;
  private state: SaveGameV2;
  private onStateUpdated: () => void;
  private onUserSwitched?: (newState: SaveGameV2) => void;
  private onTogglePlanner?: (active: boolean, tool?: 'PAINT_YELLOW' | 'PAINT_WHITE' | 'MOVE_MACHINE' | 'NONE') => void;
  public isPlannerActive = false;
  public currentPlannerTool: 'PAINT_YELLOW' | 'PAINT_WHITE' | 'MOVE_MACHINE' | 'NONE' = 'MOVE_MACHINE';

  constructor(
    state: SaveGameV2,
    onSpeedChange: (speed: number) => void,
    onStateUpdated: () => void,
    onUserSwitched?: (newState: SaveGameV2) => void,
    onTogglePlanner?: (active: boolean, tool?: 'PAINT_YELLOW' | 'PAINT_WHITE' | 'MOVE_MACHINE' | 'NONE') => void
  ) {
    this.state = state;
    this.onStateUpdated = onStateUpdated;
    this.onUserSwitched = onUserSwitched;
    this.onTogglePlanner = onTogglePlanner;

    // 初始化 Top HUD
    this.topHUD = new TopHUD('top-hud', {
      onOpenContracts: () => this.openContracts(),
      onOpenStore: () => this.openStore(),
      onOpenHR: () => this.openHR(),
      onOpenQuests: () => this.openQuests(),
      onOpenAchievements: () => this.openAchievements(),
      onOpenAdvisory: () => this.openAdvisory(),
      onToggleMES: (_enabled) => this.onStateUpdated(),
      onOpenSaveModal: () => this.openSaveModal(),
      onOpenWaferMap: () => this.openWaferMap(),
      onOpenTutorial: () => this.openTutorial(),
      onOpenFinance: () => this.openFinancialReport(),
      onOpenLogin: () => this.openUserLogin(),
      onOpenPlanner: () => this.togglePlannerMode(),
      onOpenTechTree: () => this.openTechTree(),
      onOpenFactoryReset: () => this.openFactoryResetConfirmation()
    });

    // 初始化 Dev Console 監聽器
    DevConsole.init(state, onSpeedChange, onStateUpdated);

    // 檢查是否需要跳出創立儀式或新手引導
    if (!state.player.companyName || state.player.companyName === '矽島先進半導體') {
      // 提供玩家自訂創立機會
      FoundrySetupModal.show(state, () => {
        this.render();
        this.onStateUpdated();
        if (!TutorialOverlay.isCompleted(this.state)) {
          this.openTutorial();
        }
      });
    } else if (!TutorialOverlay.isCompleted(this.state)) {
      setTimeout(() => this.openTutorial(), 400);
    }

    this.render();
  }

  public render(): void {
    this.topHUD.render(this.state);
    this.renderOrderStatusWidget();
  }

  private renderOrderStatusWidget(): void {
    const container = document.getElementById('hud-widgets');
    if (!container) return;

    if (this.state.activeOrders.length === 0) {
      container.innerHTML = `
        <div id="hud-order-status-bar" class="hud-order-bar order-empty cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl flex-shrink-0">
              📋
            </div>
            <div>
              <div class="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>【產線待命中】尚未承接晶圓代工訂單</span>
                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30">IDLE</span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">
                廠內機台全數閒置中，立即點擊開啟【合約公告板】承接新晶圓訂單投產！
              </div>
            </div>
          </div>
          <button id="btn-order-cta" class="btn-sci-fi text-xs font-bold py-2 px-4 bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white shadow-lg flex-shrink-0 animate-pulse">
            🚀 立即承接訂單 (Open Contracts)
          </button>
        </div>
      `;

      document.getElementById('hud-order-status-bar')?.addEventListener('click', () => {
        SoundEffects.playClick();
        this.openContracts();
      });
      return;
    }

    const order = this.state.activeOrders[0];
    const orderLots = this.state.activeLots.filter(l => l.orderId === order.id);
    const activeLot = orderLots.find(l => l.status === 'PROCESSING') || orderLots[0];

    const delivered = order.goodDiesDelivered;
    const total = order.totalDies;
    const pct = Math.min(100, Math.round((delivered / Math.max(1, total)) * 100));

    const currentLayer = activeLot ? activeLot.currentLayer : 1;
    const totalLayers = activeLot ? activeLot.totalLayers : (order.layerCount || 10);
    const currentStation = activeLot ? activeLot.currentStation : 'FILM';
    const currentSubStep = activeLot ? activeLot.litSubStep : undefined;

    // 判定當前對應機台
    let targetCategory: string = currentStation;
    if (currentStation === 'LIT') {
      if (currentSubStep === 'COAT' || currentSubStep === 'DEVELOP') {
        targetCategory = 'TRACK';
      } else {
        targetCategory = 'LITHO';
      }
    }
    const currentMachine = this.state.machines.find(m => m.category === targetCategory);

    // Q-Time 倒數指示
    let qTimeHtml = '';
    if (activeLot && activeLot.qTimeDeadline) {
      const qRemaining = Math.max(0, Math.round(activeLot.qTimeDeadline - this.state.gameTime));
      const isUrgent = qRemaining <= 15;
      qTimeHtml = `
        <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold ${isUrgent ? 'bg-red-950 text-red-300 border border-red-500/50 animate-pulse' : 'bg-amber-950 text-amber-300 border border-amber-500/30'}">
          ⏱️ Q-Time: ${qRemaining}s
        </span>
      `;
    }

    // 全機台流程 Pipeline
    const hasCmp = this.state.unlockedFeatures.cmp;
    const pipeline = [
      { key: 'FILM', name: '薄膜沉積', en: 'FILM', icon: '🧪', match: (st: string, _sub?: string) => st === 'FILM' },
      { key: 'TRACK_COAT', name: '光阻塗膠', en: 'TRACK', icon: '🌀', match: (st: string, sub?: string) => st === 'LIT' && sub === 'COAT' },
      { key: 'LITHO', name: '微影曝光', en: 'LITHO', icon: '🔬', match: (st: string, sub?: string) => st === 'LIT' && sub === 'EXPOSE' },
      { key: 'TRACK_DEV', name: '顯影烘烤', en: 'DEVELOP', icon: '♨️', match: (st: string, sub?: string) => st === 'LIT' && sub === 'DEVELOP' },
      { key: 'ETCH', name: '電漿蝕刻', en: 'ETCH', icon: '⚡', match: (st: string, _sub?: string) => st === 'ETCH' },
      { key: 'DIFF', name: '高溫擴散', en: 'DIFF', icon: '🔥', match: (st: string, _sub?: string) => st === 'DIFF' },
    ];
    if (hasCmp) {
      pipeline.push({ key: 'CMP', name: '平坦化研磨', en: 'CMP', icon: '💎', match: (st: string) => st === 'CMP' });
    }

    let activePipelineIdx = -1;
    if (activeLot && activeLot.status === 'PROCESSING') {
      activePipelineIdx = pipeline.findIndex(step => step.match(activeLot.currentStation, activeLot.litSubStep));
    }

    const isAllDone = order.goodDiesDelivered >= order.totalDies || (orderLots.length > 0 && orderLots.every(l => l.status === 'COMPLETED'));

    container.innerHTML = `
      <div id="hud-order-status-bar" class="hud-order-bar cursor-pointer" title="點擊檢視訂單詳情與批次資訊">
        <!-- 上方：訂單資訊、良品產能、機台指派與動作按鈕 -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-lg flex-shrink-0 text-cyan-400">
              ⚙️
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-white text-sm">【${order.clientName}】</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  ${order.nodeNm}nm 工藝
                </span>
                <span class="text-xs text-slate-300 font-mono">
                  第 <strong class="text-cyan-300">${currentLayer}</strong> / ${totalLayers} 層
                </span>
                ${this.state.activeOrders.length > 1 ? `<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">共 ${this.state.activeOrders.length} 筆在製</span>` : ''}
              </div>
              <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono flex-wrap">
                <span>交付進度: <strong class="text-amber-300">${delivered} / ${total} 顆</strong> (${pct}%)</span>
                <span class="text-slate-600">|</span>
                <span>所在機台: <strong class="${currentMachine?.status === 'EXPLODED' ? 'text-red-400 font-bold animate-pulse' : 'text-cyan-300'}">📍 ${currentMachine ? currentMachine.name : '產線調度中'}</strong></span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-cyan-300">
                  ⏱️ 站點進度: <strong>${activeLot ? (activeLot.stationProgressSeconds || 0) : 0}s</strong> / ${activeLot ? (activeLot.stationRequiredSeconds || 10) : 10}s
                </span>
                ${activeLot?.hasYellowRoomViolation ? `
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500/60 animate-pulse">
                    🚨 致命白光污染！微影設備未在黃光區 (良率 0%)
                  </span>
                ` : ''}
                ${qTimeHtml}
              </div>
            </div>
          </div>

          <!-- 右側狀態與按鈕 -->
          <div class="flex items-center gap-2">
            ${isAllDone ? `
              <button id="btn-bar-action" class="btn-sci-fi text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold animate-bounce shadow-md shadow-emerald-500/30">
                📦 晶圓已完工！出貨結算
              </button>
            ` : `
              <button id="btn-bar-action" class="btn-sci-fi text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200">
                📋 訂單與工單詳情
              </button>
            `}
          </div>
        </div>

        <!-- 進度條 -->
        <div class="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div class="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
        </div>

        <!-- 下方：全機台流程 Pipeline -->
        <div class="flex items-center gap-1.5 w-full overflow-x-auto pt-1">
          ${pipeline.map((step, idx) => {
            let statusClass = 'step-waiting';
            let statusText = '待加工';
            let statusColor = 'text-slate-500';

            if (isAllDone) {
              statusClass = 'step-completed';
              statusText = '✓ 完工';
              statusColor = 'text-emerald-400';
            } else if (idx < activePipelineIdx) {
              statusClass = 'step-completed';
              statusText = '✓ 完工';
              statusColor = 'text-emerald-400';
            } else if (idx === activePipelineIdx) {
              const currentSec = activeLot?.stationProgressSeconds || 0;
              const reqSec = activeLot?.stationRequiredSeconds || 10;
              statusClass = 'step-active';
              statusText = `⚡ ${currentSec}/${reqSec}s`;
              statusColor = 'text-cyan-300 font-bold';
            }

            const targetCat = step.key.startsWith('TRACK') ? 'TRACK' : (step.key === 'LITHO' ? 'LITHO' : step.key);
            const m = this.state.machines.find(mach => mach.category === targetCat);
            const isExploded = m?.status === 'EXPLODED';

            return `
              <div class="pipeline-step ${statusClass} ${isExploded ? 'border-red-500/80 bg-red-950/30' : ''}" title="${step.name} (${step.en})${m ? ' - ' + m.name : ''}">
                <div class="flex items-center gap-1 text-xs">
                  <span>${step.icon}</span>
                  <span class="font-bold text-white text-[11px] truncate">${step.name}</span>
                </div>
                <div class="flex items-center justify-between w-full px-1 text-[10px] mt-0.5">
                  <span class="font-mono text-slate-400 text-[9px]">${step.en}</span>
                  <span class="${isExploded ? 'text-red-400 font-bold animate-pulse' : statusColor}">
                    ${isExploded ? '💥故障' : statusText}
                  </span>
                </div>
              </div>
              ${idx < pipeline.length - 1 ? '<span class="text-slate-600 text-xs flex-shrink-0 font-bold">➔</span>' : ''}
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('hud-order-status-bar')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.openContracts();
    });

    document.getElementById('btn-bar-action')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.openContracts();
    });
  }

  public togglePlannerMode(forceState?: boolean): void {
    this.isPlannerActive = forceState !== undefined ? forceState : !this.isPlannerActive;
    if (this.isPlannerActive && this.currentPlannerTool === 'NONE') {
      this.currentPlannerTool = 'MOVE_MACHINE';
    }
    this.onTogglePlanner?.(this.isPlannerActive, this.currentPlannerTool);
    this.renderPlannerToolbar();
  }

  public setPlannerTool(tool: 'PAINT_YELLOW' | 'PAINT_WHITE' | 'MOVE_MACHINE' | 'NONE'): void {
    this.currentPlannerTool = tool;
    this.onTogglePlanner?.(this.isPlannerActive, tool);
    this.renderPlannerToolbar();
  }

  public renderPlannerToolbar(): void {
    let el = document.getElementById('planner-toolbar');
    if (!this.isPlannerActive) {
      if (el) el.remove();
      return;
    }

    if (!el) {
      el = document.createElement('div');
      el.id = 'planner-toolbar';
      document.body.appendChild(el);
    }

    el.className = 'fixed top-18 left-1/2 -translate-x-1/2 z-50 glass-panel p-3 border-2 border-amber-500/70 shadow-2xl rounded-2xl flex flex-wrap items-center gap-3 animate-scaleUp pointer-events-auto bg-slate-950/95';
    el.innerHTML = `
      <div class="flex items-center gap-2 border-r border-slate-700/80 pr-3">
        <span class="text-xl">🏗️</span>
        <div>
          <div class="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <span>廠房機台與黃光區規劃</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40">EDIT</span>
          </div>
          <div class="text-[10px] text-slate-400">微影機 (Scanner) 未在黃光區良率將為 0%！</div>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button id="btn-planner-move" class="btn-sci-fi text-xs py-1.5 px-3 ${this.currentPlannerTool === 'MOVE_MACHINE' ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/40 border-emerald-400 ring-2 ring-emerald-400/50' : 'bg-slate-900 border-emerald-500/40 text-emerald-300 hover:bg-slate-800'}">
          🚜 搬移機台
        </button>
        <button id="btn-planner-yellow" class="btn-sci-fi text-xs py-1.5 px-3 ${this.currentPlannerTool === 'PAINT_YELLOW' ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-500/40 border-amber-400 ring-2 ring-amber-400/50' : 'bg-slate-900 border-amber-500/40 text-amber-300 hover:bg-slate-800'}">
          🟡 劃設黃光區
        </button>
        <button id="btn-planner-white" class="btn-sci-fi text-xs py-1.5 px-3 ${this.currentPlannerTool === 'PAINT_WHITE' ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-500/40 border-cyan-400 ring-2 ring-cyan-400/50' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}">
          🏢 還原潔淨室
        </button>
      </div>

      <div class="border-l border-slate-700/80 pl-2">
        <button id="btn-planner-exit" class="btn-sci-fi text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white border-slate-600">
          💾 完成規劃
        </button>
      </div>
    `;

    document.getElementById('btn-planner-move')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.setPlannerTool('MOVE_MACHINE');
    });

    document.getElementById('btn-planner-yellow')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.setPlannerTool('PAINT_YELLOW');
    });

    document.getElementById('btn-planner-white')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.setPlannerTool('PAINT_WHITE');
    });

    document.getElementById('btn-planner-exit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.togglePlannerMode(false);
      this.onStateUpdated();
    });
  }

  public openContracts(): void {
    ContractModal.show(this.state, () => {
      this.render();
      this.onStateUpdated();
    });
  }

  public openStore(): void {
    StoreModal.show(this.state, () => {
      this.render();
      this.onStateUpdated();
    });
  }

  public openHR(): void {
    HRModal.show(this.state, () => {
      this.render();
      this.onStateUpdated();
    });
  }

  public openQuests(): void {
    QuestModal.show(this.state, () => {
      this.render();
      this.onStateUpdated();
    });
  }

  public openAchievements(): void {
    AchievementModal.show(this.state, () => {
      this.render();
      this.onStateUpdated();
    });
  }

  public openAdvisory(): void {
    AdvisoryModal.show(this.state, () => {
      this.openStore();
    }, () => {
      this.openHR();
    });
  }

  public openWaferMap(lot?: WaferLotData | null): void {
    WaferMapModal.show(this.state, lot, () => {
      this.render();
      this.onStateUpdated();
    });
  }

  public openLayerAllocation(order: OrderData): void {
    LayerAllocationModal.show(this.state, order, () => {
      this.render();
      this.onStateUpdated();
    });
  }

  public updateState(newState: SaveGameV2): void {
    this.state = newState;
    this.topHUD.rebuild();
    this.render();
  }

  public openFinancialReport(): void {
    FinancialReportModal.show(this.state, () => {
      this.render();
      this.onStateUpdated();
    });
  }

  public openTechTree(): void {
    TechTreeModal.show(this.state, () => {
      this.render();
      this.onStateUpdated();
    });
  }

  public openUserLogin(): void {
    UserLoginModal.show(this.state, (newState) => {
      this.state = newState;
      this.onUserSwitched?.(newState);
      this.render();
      this.onStateUpdated();
      if (!TutorialOverlay.isCompleted(newState)) {
        setTimeout(() => this.openTutorial(), 400);
      }
    });
  }

  public openTutorial(step?: number): void {
    TutorialOverlay.show(this.state, () => {
      this.render();
      this.onStateUpdated();
    }, step);
  }

  public openSaveModal(): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        container.innerHTML = '';
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const closeModal = () => {
      SoundEffects.playClick();
      container.innerHTML = '';
      window.removeEventListener('keydown', handleKeyDown);
    };

    container.innerHTML = `
      <div id="modal-backdrop-save" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-lg text-slate-100 flex flex-col max-h-[88vh]">
          <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700 flex-shrink-0">
            <h3 class="text-base font-bold flex items-center gap-2">
              <span>💾</span>
              <span>存檔備份與 JSON 匯出/匯入</span>
            </h3>
            <button id="btn-close-save-modal" class="text-slate-400 hover:text-white font-mono text-lg transition-colors">✕</button>
          </div>

          <div class="modal-body overflow-y-auto flex-1 py-4 space-y-3 text-xs text-slate-300">
            <p>
              遊戲預設每 10 秒自動保存至瀏覽器 LocalStorage。您亦可隨時手動匯出備份檔案。
            </p>

            <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <button id="btn-export-save" class="btn-sci-fi w-full justify-center">
                📥 匯出存檔為 JSON 檔案
              </button>
              <button id="btn-import-save" class="btn-sci-fi w-full justify-center bg-slate-800">
                📤 匯入存檔 JSON
              </button>
              <input type="file" id="file-import-save" accept=".json" class="hidden" />
            </div>
          </div>

          <div class="modal-footer flex items-center justify-between pt-3 border-t border-slate-700 flex-shrink-0">
            <span class="text-xs text-slate-400 font-mono">按 ESC 或點擊外部背景亦可返回</span>
            <button id="btn-return-save" class="btn-sci-fi px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700">
              ◀ 返回無塵室
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-save-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-return-save')?.addEventListener('click', closeModal);

    document.getElementById('modal-backdrop-save')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    });

    document.getElementById('btn-export-save')?.addEventListener('click', () => {
      SoundEffects.playClick();
      const json = SaveGameService.exportSaveToJson(this.state);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `silicon_tycoon_save_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btn-import-save')?.addEventListener('click', () => {
      document.getElementById('file-import-save')?.click();
    });

    document.getElementById('file-import-save')?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const res = SaveGameService.importSaveFromJson(content);
          if (res.success && res.state) {
            SaveGameService.saveToLocalStorage(res.state);
            alert('存檔匯入成功！即將重新載入遊戲。');
            window.location.reload();
          } else {
            alert(`匯入失敗: ${res.error}`);
          }
        };
        reader.readAsText(file);
      }
    });
  }

  public showNotice(msg: string): void {
    const notice = document.createElement('div');
    notice.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium shadow-2xl animate-bounce';
    notice.innerText = msg;
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 2500);
  }

  public openFactoryResetConfirmation(): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    SoundEffects.playClick();

    const closeModal = () => {
      container.innerHTML = '';
      window.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);

    container.innerHTML = `
      <div id="modal-backdrop-reset" class="modal-backdrop">
        <div class="modal-content glass-panel max-w-md border-2 border-red-500/80 bg-slate-950 text-slate-100 p-6 rounded-2xl shadow-2xl shadow-red-950/60 animate-scaleUp">
          <div class="flex items-center gap-3 text-red-400 text-base font-black border-b border-red-500/30 pb-3">
            <span class="text-2xl">⚠️</span>
            <span>高風險操作：整機資料重置確認</span>
          </div>

          <div class="py-4 text-xs text-slate-300 space-y-3 leading-relaxed">
            <p class="text-red-300 font-bold">
              您即將徹底清空本裝置（瀏覽器）上的所有《Silicon Tycoon》遊戲存檔與資料！
            </p>
            <div class="p-3 bg-red-950/30 border border-red-500/40 rounded-xl space-y-1.5 text-[11px] text-slate-300">
              <div>• 💥 徹底刪除所有玩家帳號、執行長身分與歷史成就記錄</div>
              <div>• 🏭 清空所有廠房無塵室機台配置、科技研發與累積資金</div>
              <div>• 🔄 重置新手教學標記，使玩家能從零開始重新體驗完整流程</div>
              <div>• 🚫 此動作不可逆，無法復原未匯出之存檔！</div>
            </div>
            <p class="text-slate-400 text-[11px]">
              若您確認要徹底刪除全部資料重新開始，請點擊下方紅色按鈕。
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button id="btn-cancel-factory-reset" class="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              取消返回
            </button>
            <button id="btn-confirm-factory-reset" class="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-900/50 flex items-center gap-1.5 transition-all cursor-pointer">
              <span>💥</span>
              <span>確定清空全部資料並重置</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-cancel-factory-reset')?.addEventListener('click', closeModal);
    document.getElementById('modal-backdrop-reset')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-backdrop-reset')) closeModal();
    });

    document.getElementById('btn-confirm-factory-reset')?.addEventListener('click', () => {
      SoundEffects.playClick();
      SaveGameService.factoryResetAllData();
      alert('全機資料已全數清空！即將重新整理進入全新遊戲。');
      window.location.reload();
    });
  }
}
