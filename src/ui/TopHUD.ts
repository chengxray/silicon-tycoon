/**
 * TopHUD.ts
 * 負責主畫面頂部儀表板：CEO 資訊、現金、商譽、RollingYieldIndex 信任指標、
 * 工廠負荷百分比 (Workload %) 進度條、🔴 紅色警報驚嘆號與導航功能鍵
 * 
 * 優化重點：
 * 1. 徹底解決下拉式選單每秒因 simulationTick 重繪導致「閃一下就關閉」問題：DOM 結構單次初始化，數值局部精準更新
 * 2. 放大下拉式選單字體與圖示 (text-sm, text-lg emoji)，加寬面板 (w-80)，提高對比度與易讀性
 * 3. 點擊外部自動收合，內部切換開關 (MES/音效) 即時響應不閃退
 */

import { SaveGameV2 } from '../types';
import { ProductionEngine } from '../engine/ProductionEngine';
import { EconomyEngine } from '../engine/EconomyEngine';
import { FinanceEngine } from '../engine/FinanceEngine';
import { TechTreeEngine } from '../engine/TechTreeEngine';
import { SoundEffects } from '../audio/SoundEffects';

export interface TopHUDCallbacks {
  onOpenContracts: () => void;
  onOpenStore: () => void;
  onOpenHR: () => void;
  onOpenQuests: () => void;
  onOpenAchievements: () => void;
  onOpenAdvisory: () => void;
  onToggleMES: (enabled: boolean) => void;
  onOpenSaveModal: () => void;
  onOpenWaferMap?: () => void;
  onOpenTutorial?: () => void;
  onOpenFinance?: () => void;
  onOpenLogin?: () => void;
  onOpenPlanner?: () => void;
  onOpenTechTree?: () => void;
  onOpenFactoryReset?: () => void;
}

export class TopHUD {
  private container: HTMLElement;
  private callbacks: TopHUDCallbacks;
  private isInitialized = false;
  private isDropdownOpen = false;
  private currentState: SaveGameV2 | null = null;

  constructor(containerId: string, callbacks: TopHUDCallbacks) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`找不到 HUD 容器: #${containerId}`);
    this.container = el;
    this.callbacks = callbacks;

    // 點擊選單外部自動關閉下拉選單 (全域只監聽一次，絕不重複疊加)
    document.addEventListener('click', (e: MouseEvent) => {
      if (!this.isDropdownOpen) return;
      const dropdown = document.getElementById('top-dropdown-menu');
      const moreBtn = document.getElementById('btn-top-more');
      const target = e.target as Node;
      if (dropdown && !dropdown.contains(target) && moreBtn && !moreBtn.contains(target)) {
        this.closeDropdown();
      }
    });
  }

  /**
   * 重置初始化標記，供切換存檔或使用者時完整重新構建骨架
   */
  public rebuild(): void {
    this.isInitialized = false;
    this.isDropdownOpen = false;
  }

  /**
   * 關閉下拉選單
   */
  public closeDropdown(): void {
    this.isDropdownOpen = false;
    const dropdown = document.getElementById('top-dropdown-menu');
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
  }

  /**
   * 切換下拉選單展開/收合
   */
  public toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    const dropdown = document.getElementById('top-dropdown-menu');
    if (dropdown) {
      if (this.isDropdownOpen) {
        dropdown.classList.remove('hidden');
      } else {
        dropdown.classList.add('hidden');
      }
    }
  }

  /**
   * 主要渲染進入點：若骨架已存在則只更新數值，避免摧毀 DOM 導致選單閃退
   */
  public render(state: SaveGameV2): void {
    this.currentState = state;

    if (!this.isInitialized || !this.container.firstElementChild) {
      this.renderInitialStructure();
      this.bindEvents();
      this.isInitialized = true;
    }

    this.updateValues(state);
  }

  /**
   * 建立頂部 HUD 骨架結構 (僅在初次渲染或切換使用者時執行)
   */
  private renderInitialStructure(): void {
    this.container.innerHTML = `
      <!-- 左側：創辦人與公司資訊 (附帶 PvZ 1 經典使用者登入切換與現實日曆同步) -->
      <div class="flex items-center gap-2.5 flex-shrink-0 whitespace-nowrap">
        <div id="btn-hud-profile-avatar" class="w-10 h-10 rounded-full border border-cyan-400/50 bg-slate-800 flex items-center justify-center text-xl shadow-inner cursor-pointer hover:border-amber-400 hover:scale-105 transition-all" title="點擊切換存檔 / 登入使用者 (PvZ 1 Style)">
          👤
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span id="hud-company-name" class="text-sm font-bold text-slate-100 tracking-wide"></span>
            <span id="hud-foundry-tier" class="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono"></span>
            <span id="hud-date-str" class="text-[10px] text-cyan-400/90 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/30" title="遊戲日曆與現實世界完全同步"></span>
          </div>
          <div class="text-xs text-slate-400 flex items-center gap-2">
            <span>CEO: <strong id="hud-ceo-name" class="text-amber-300"></strong></span>
            <button id="btn-hud-switch-user" class="text-[10px] text-cyan-400 hover:text-amber-300 underline font-sans cursor-pointer" title="切換玩家或建立新存檔">
              (不是你？點此登入)
            </button>
          </div>
        </div>
      </div>

      <!-- 中間：核心營運三大 KPI 與工廠負荷進度條 -->
      <div class="flex items-center gap-4 flex-shrink-0 whitespace-nowrap">
        <!-- 1. 現金 (點擊開啟日周月財報) -->
        <button id="btn-hud-cash" class="text-center group cursor-pointer hover:bg-slate-800/80 px-2.5 py-1 rounded-lg transition-colors border border-transparent hover:border-amber-500/40" title="點擊檢視日、周、月收支財報與毛利分析">
          <div class="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
            <span>廠房資金</span>
            <span class="text-[10px] text-amber-400">📊</span>
          </div>
          <div id="hud-cash-value" class="text-sm font-bold text-amber-400 font-mono tracking-tight group-hover:text-amber-300">
            NT$ 0
          </div>
        </button>

        <!-- 2. 商譽 -->
        <div class="text-center">
          <div class="text-[11px] text-slate-400 font-medium whitespace-nowrap">產業商譽</div>
          <div id="hud-pop-value" class="text-sm font-bold text-cyan-400 font-mono whitespace-nowrap">
            ★ 0
          </div>
        </div>

        <!-- 3. 滾動良率指數 (RollingYieldIndex) - 未生產時凍結顯示 -->
        <button id="btn-hud-yield" class="text-center relative group cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30" title="點擊檢視 25 晶粒蒙地卡羅良率晶圓圖 (Wafer Map)">
          <div class="text-[11px] text-slate-400 font-medium flex items-center gap-1 justify-center whitespace-nowrap">
            <span>品質良率</span>
            <span class="text-[10px] text-cyan-400">🔍</span>
          </div>
          <div class="flex items-center gap-1 justify-center">
            <span id="hud-yield-value" class="text-sm font-bold font-mono whitespace-nowrap">N/A</span>
            <span id="hud-yield-sub" class="text-[10px] whitespace-nowrap text-amber-400/90 font-medium">(待命暫停)</span>
          </div>
        </button>

        <!-- 4. 工廠負荷量 Workload % 與 🔴 紅色警報驚嘆號 -->
        <div class="flex items-center gap-2">
          <div>
            <div class="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
              <span>產線負荷</span>
              <span id="hud-workload-pct" class="font-mono text-slate-200">0%</span>
            </div>
            <div class="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div id="hud-workload-bar" style="width: 0%; background-color: #10b981;" class="h-full transition-all duration-300"></div>
            </div>
          </div>

          <button id="btn-advisory-alert" class="hidden w-7 h-7 rounded-full bg-red-600/90 text-white font-black text-xs flex items-center justify-center border-2 border-red-400 pulse-alert shadow-lg cursor-pointer hover:bg-red-500 flex-shrink-0" title="產線超載嚴重！點擊查看瓶頸診斷">
            !
          </button>
        </div>
      </div>

      <!-- 右側：5 大核心按鈕 + ☰ 更多 ▾ 下拉式選單 -->
      <div class="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
        <!-- 1. 合約板 (最常用) -->
        <button id="btn-contracts" class="btn-sci-fi text-xs font-bold py-1.5 px-3 bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 border-amber-500/50 text-amber-200 hover:text-white shadow-sm" title="開啟晶圓代工合約公告板">
          📜 合約
        </button>

        <!-- 2. 商城 (機台與 AMHS 運送設備) -->
        <button id="btn-store" class="btn-sci-fi text-xs font-bold py-1.5 px-3" title="開啟機台採購與廠務運送 (AMHS) 商城">
          🏬 商城
        </button>

        <!-- 3. 科技樹研發突破 (次世代機台解鎖) -->
        <button id="btn-techtree" class="btn-sci-fi relative text-xs font-bold py-1.5 px-3 bg-cyan-950/50 border-cyan-500/60 text-cyan-300 hover:text-white" title="檢視半導體製程科技樹">
          <span id="hud-tech-label">🔬 研發</span>
          <span id="hud-tech-badge" class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
        </button>

        <!-- 4. 廠房規劃 (黃光區劃設與機台搬移) -->
        <button id="btn-planner" class="btn-sci-fi text-xs font-bold py-1.5 px-3 bg-amber-950/40 border-amber-500/50 text-amber-300 hover:text-white" title="規劃機台擺放與劃設黃光微影專區">
          🏗️ 規劃
        </button>

        <!-- 5. 財報 (日周月收支分析) -->
        <button id="btn-finance" class="btn-sci-fi text-xs font-bold py-1.5 px-3 bg-cyan-950/40 border-cyan-500/50 text-cyan-300 hover:text-white" title="開啟日、周、月收支財務分析">
          📊 財報
        </button>

        <!-- 6. ☰ 更多 ▾ 下拉式選單 (加寬至 w-80、加大字體、防止每秒刷新關閉) -->
        <div class="relative inline-block">
          <button id="btn-top-more" class="btn-sci-fi text-xs sm:text-sm font-bold py-1.5 px-3.5 bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-200 hover:text-white flex items-center gap-2 cursor-pointer relative shadow-sm" title="更多系統與管理功能">
            <span>☰ 更多</span>
            <span class="text-xs text-slate-400">▾</span>
            <span id="hud-more-badge" class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse"></span>
          </button>

          <!-- 下拉浮動面板 (大字體、寬裕排版、消除閃退動畫) -->
          <div id="top-dropdown-menu" class="hidden absolute right-0 mt-2 w-80 rounded-2xl glass-panel bg-slate-950/98 border border-slate-700/90 shadow-2xl py-2 z-50 text-sm text-slate-200 backdrop-blur-2xl">
            <!-- 選單標題 -->
            <div class="px-4 py-2.5 mb-1.5 border-b border-slate-800 flex items-center justify-between">
              <span class="text-xs font-bold text-slate-400 tracking-wider">系統與營運管理</span>
              <span class="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">控制中心</span>
            </div>

            <!-- 人資 -->
            <button id="menu-item-hr" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">👥</span>
                <span class="text-sm">人資管理 (HR)</span>
              </span>
              <span id="dropdown-staff-count" class="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">0 人</span>
            </button>

            <!-- 每日任務 -->
            <button id="menu-item-quests" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">📋</span>
                <span class="text-sm">每日任務 (Quests)</span>
              </span>
              <span id="dropdown-quests-badge"></span>
            </button>

            <!-- 成就 -->
            <button id="menu-item-achievements" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">🏆</span>
                <span class="text-sm">產業成就 (Achievements)</span>
              </span>
              <span id="dropdown-achievements-badge"></span>
            </button>

            <!-- MES 自動派工開關 -->
            <button id="menu-item-toggle-mes" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">🤖</span>
                <span class="text-sm">MES 自動派工</span>
              </span>
              <span id="dropdown-mes-status" class="text-xs font-bold font-mono px-2 py-0.5 rounded">⚪ 已停用</span>
            </button>

            <div class="h-px bg-slate-800/80 my-1.5 mx-3"></div>

            <!-- 切換玩家存檔 -->
            <button id="menu-item-switch-user" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">👤</span>
                <span class="text-sm">切換玩家 (Who are you?)</span>
              </span>
              <span class="text-xs text-cyan-400 font-mono">PvZ 1 Style</span>
            </button>

            <!-- 存檔與備份 -->
            <button id="menu-item-save" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">💾</span>
                <span class="text-sm">存檔與備份 (Save & JSON)</span>
              </span>
              <span class="text-xs text-slate-400 font-mono">備份</span>
            </button>

            <!-- 晶圓製程教學導引 -->
            <button id="menu-item-tutorial" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">❓</span>
                <span class="text-sm">晶圓製程教學導引</span>
              </span>
              <span class="text-xs text-cyan-400/80 font-mono">教學</span>
            </button>

            <!-- 音效開關 -->
            <button id="menu-item-sound" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span id="dropdown-sound-icon" class="text-lg">🔊</span>
                <span class="text-sm">遊戲音效開關</span>
              </span>
              <span id="dropdown-sound-text" class="text-xs text-slate-400 font-mono">開啟</span>
            </button>

            <div class="h-px bg-red-900/40 my-1.5 mx-3"></div>

            <!-- 整機重置 -->
            <button id="menu-item-factory-reset" class="w-full px-4 py-2.5 text-left hover:bg-red-950/70 text-red-400 hover:text-red-300 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold">
                <span class="text-lg">💥</span>
                <span class="text-sm">整機資料重置 (Factory Reset)</span>
              </span>
              <span class="text-[11px] font-mono text-red-400/80 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-800/50">危險</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 綁定按鈕事件 (僅執行一次，不隨每秒 tick 重複註冊)
   */
  private bindEvents(): void {
    document.getElementById('btn-contracts')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenContracts();
    });

    document.getElementById('btn-store')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenStore();
    });

    document.getElementById('btn-techtree')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenTechTree?.();
    });

    document.getElementById('btn-planner')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenPlanner?.();
    });

    document.getElementById('btn-finance')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenFinance?.();
    });

    document.getElementById('btn-hud-cash')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenFinance?.();
    });

    document.getElementById('btn-hud-yield')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenWaferMap?.();
    });

    document.getElementById('btn-advisory-alert')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenAdvisory();
    });

    // PvZ 1 登入與玩家切換按鈕
    document.getElementById('btn-hud-profile-avatar')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenLogin?.();
    });

    document.getElementById('btn-hud-switch-user')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenLogin?.();
    });

    // 下拉選單開關按鈕
    document.getElementById('btn-top-more')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.toggleDropdown();
    });

    // 下拉選單項目事件
    document.getElementById('menu-item-hr')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenHR();
    });

    document.getElementById('menu-item-quests')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenQuests();
    });

    document.getElementById('menu-item-achievements')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenAchievements();
    });

    document.getElementById('menu-item-toggle-mes')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      if (!this.currentState) return;
      const next = !this.currentState.unlockedFeatures.mesAutoDispatch;
      this.currentState.unlockedFeatures.mesAutoDispatch = next;
      this.callbacks.onToggleMES(next);
      this.updateValues(this.currentState);
    });

    document.getElementById('menu-item-switch-user')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenLogin?.();
    });

    document.getElementById('menu-item-save')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenSaveModal();
    });

    document.getElementById('menu-item-tutorial')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenTutorial?.();
    });

    document.getElementById('menu-item-sound')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.toggleMute();
      SoundEffects.playClick();
      if (this.currentState) {
        this.updateValues(this.currentState);
      }
    });

    document.getElementById('menu-item-factory-reset')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenFactoryReset?.();
    });
  }

  /**
   * 數值增量更新 (每秒 tick 僅更新文字與類別，不重繪 DOM 樹)
   */
  private updateValues(state: SaveGameV2): void {
    const p = state.player;
    const hasCmp = state.unlockedFeatures.cmp;

    // 1. 公司與創辦人資訊
    const companyEl = document.getElementById('hud-company-name');
    if (companyEl) companyEl.textContent = p.companyName;

    const tierEl = document.getElementById('hud-foundry-tier');
    if (tierEl) tierEl.textContent = `Tier ${p.foundryTier}`;

    const todayStr = state.financialState?.currentDateStr || FinanceEngine.getTodayDateString();
    const dayOfWeekName = ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()];
    const dateEl = document.getElementById('hud-date-str');
    if (dateEl) dateEl.textContent = `📅 ${todayStr} (週${dayOfWeekName})`;

    const ceoEl = document.getElementById('hud-ceo-name');
    if (ceoEl) ceoEl.textContent = p.ceoName;

    // 2. 現金
    const cashEl = document.getElementById('hud-cash-value');
    if (cashEl) cashEl.textContent = `NT$ ${Math.round(p.cash).toLocaleString()}`;

    // 3. 商譽
    const popEl = document.getElementById('hud-pop-value');
    if (popEl) popEl.textContent = `★ ${p.popularity}`;

    // 4. 良率與信任乘數 (非生產狀態時凍結顯示)
    const isProducing = state.activeLots.some(l => l.status === 'PROCESSING') || state.machines.some(m => m.status === 'PROCESSING');
    const rollingYield = state.rollingYieldHistory.length > 0
      ? state.rollingYieldHistory.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, state.rollingYieldHistory.length)
      : null;
    const trustMult = EconomyEngine.calculateTrustMultiplier(rollingYield);

    const yieldValEl = document.getElementById('hud-yield-value');
    const yieldSubEl = document.getElementById('hud-yield-sub');
    if (yieldValEl) {
      yieldValEl.textContent = rollingYield !== null ? `${(rollingYield * 100).toFixed(1)}%` : 'N/A';
      yieldValEl.className = `text-sm font-bold font-mono whitespace-nowrap ${
        isProducing
          ? (rollingYield && rollingYield >= 0.9 ? 'text-emerald-400' : 'text-amber-400')
          : 'text-slate-400'
      }`;
    }
    if (yieldSubEl) {
      yieldSubEl.textContent = isProducing ? `(${trustMult.toFixed(2)}x)` : '(待命暫停)';
      yieldSubEl.className = `text-[10px] ${isProducing ? 'text-slate-400 font-normal' : 'text-amber-400/90 font-medium'}`;
    }

    // 5. 工廠負荷量 Workload %
    const workloadInfo = ProductionEngine.calculateFactoryWorkload(
      state.machines,
      state.staff,
      state.activeLots,
      state.unlockedFeatures,
      hasCmp
    );

    let workloadBarColor = '#10b981';
    if (workloadInfo.workloadPercent > 85) {
      workloadBarColor = '#ef4444';
    } else if (workloadInfo.workloadPercent >= 70) {
      workloadBarColor = '#f59e0b';
    }

    const workloadPctEl = document.getElementById('hud-workload-pct');
    if (workloadPctEl) workloadPctEl.textContent = `${workloadInfo.workloadPercent}%`;

    const workloadBarEl = document.getElementById('hud-workload-bar');
    if (workloadBarEl) {
      workloadBarEl.style.width = `${Math.min(100, workloadInfo.workloadPercent)}%`;
      workloadBarEl.style.backgroundColor = workloadBarColor;
    }

    const alertBtn = document.getElementById('btn-advisory-alert');
    if (alertBtn) {
      if (workloadInfo.workloadPercent > 85) {
        alertBtn.classList.remove('hidden');
      } else {
        alertBtn.classList.add('hidden');
      }
    }

    // 6. 研發科技樹按鈕狀態與進度紅點
    const techStatus = TechTreeEngine.getProgressionStatus(state);
    const techLabel = document.getElementById('hud-tech-label');
    if (techLabel) techLabel.textContent = `🔬 研發 (T${p.foundryTier})`;

    const techBtn = document.getElementById('btn-techtree');
    const techBadge = document.getElementById('hud-tech-badge');
    if (techBadge) {
      if (techStatus.canAdvance) {
        techBadge.classList.remove('hidden');
        techBtn?.classList.add('border-emerald-400', 'text-emerald-300', 'ring-2', 'ring-emerald-500/40', 'animate-pulse');
      } else {
        techBadge.classList.add('hidden');
        techBtn?.classList.remove('border-emerald-400', 'text-emerald-300', 'ring-2', 'ring-emerald-500/40', 'animate-pulse');
      }
    }

    // 7. 下拉式選單內容狀態更新
    const hasUnclaimedQuests = state.questState.dailyQuests.some(q => q.completed && !q.claimed);
    const hasUnclaimedAchievements = state.achievements.some(a => a.unlocked && !a.claimed);
    const hasUnclaimed = hasUnclaimedQuests || hasUnclaimedAchievements;
    const isMuted = SoundEffects.isAudioMuted();

    const moreBadge = document.getElementById('hud-more-badge');
    if (moreBadge) {
      if (hasUnclaimed) {
        moreBadge.classList.remove('hidden');
      } else {
        moreBadge.classList.add('hidden');
      }
    }

    const staffEl = document.getElementById('dropdown-staff-count');
    if (staffEl) staffEl.textContent = `${state.staff.length} 人`;

    const questBadgeEl = document.getElementById('dropdown-quests-badge');
    if (questBadgeEl) {
      questBadgeEl.innerHTML = hasUnclaimedQuests
        ? '<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/30">待領取</span>'
        : '';
    }

    const achBadgeEl = document.getElementById('dropdown-achievements-badge');
    if (achBadgeEl) {
      achBadgeEl.innerHTML = hasUnclaimedAchievements
        ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">可解鎖</span>'
        : '';
    }

    const mesStatusEl = document.getElementById('dropdown-mes-status');
    if (mesStatusEl) {
      mesStatusEl.textContent = state.unlockedFeatures.mesAutoDispatch ? '🟢 已開啟' : '⚪ 已停用';
      mesStatusEl.className = `text-xs font-bold font-mono px-2 py-0.5 rounded ${
        state.unlockedFeatures.mesAutoDispatch
          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
          : 'bg-slate-900 text-slate-400 border border-slate-700'
      }`;
    }

    const soundIconEl = document.getElementById('dropdown-sound-icon');
    if (soundIconEl) soundIconEl.textContent = isMuted ? '🔇' : '🔊';

    const soundTextEl = document.getElementById('dropdown-sound-text');
    if (soundTextEl) soundTextEl.textContent = isMuted ? '靜音' : '開啟';
  }
}
