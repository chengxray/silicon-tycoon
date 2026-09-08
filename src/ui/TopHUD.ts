/**
 * TopHUD.ts
 * 負責主畫面頂部儀表板：CEO 資訊、現金、商譽、RollingYieldIndex 信任指標、
 * 工廠負荷百分比 (Workload %) 進度條、🔴 紅色警報驚嘆號與導航功能鍵
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

  constructor(containerId: string, callbacks: TopHUDCallbacks) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`找不到 HUD 容器: #${containerId}`);
    this.container = el;
    this.callbacks = callbacks;
  }

  public render(state: SaveGameV2): void {
    const p = state.player;
    const hasCmp = state.unlockedFeatures.cmp;

    // 計算 Rolling Yield 與 Trust Multiplier
    const isProducing = state.activeLots.some(l => l.status === 'PROCESSING') || state.machines.some(m => m.status === 'PROCESSING');
    const rollingYield = state.rollingYieldHistory.length > 0
      ? state.rollingYieldHistory.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, state.rollingYieldHistory.length)
      : null;
    const trustMult = EconomyEngine.calculateTrustMultiplier(rollingYield);

    // 研發進度與晉升檢測
    const techStatus = TechTreeEngine.getProgressionStatus(state);

    // 現實日曆年月日同步
    const todayStr = state.financialState?.currentDateStr || FinanceEngine.getTodayDateString();
    const dayOfWeekName = ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()];

    // 計算工廠負荷量 %
    const workloadInfo = ProductionEngine.calculateFactoryWorkload(
      state.machines,
      state.staff,
      state.activeLots,
      state.unlockedFeatures,
      hasCmp
    );

    // 負荷量進度條色彩
    let workloadBarColor = '#10b981'; // 綠
    if (workloadInfo.workloadPercent > 85) {
      workloadBarColor = '#ef4444'; // 紅
    } else if (workloadInfo.workloadPercent >= 70) {
      workloadBarColor = '#f59e0b'; // 黃
    }

    const isMuted = SoundEffects.isAudioMuted();
    const hasUnclaimedQuests = state.questState.dailyQuests.some(q => q.completed && !q.claimed);
    const hasUnclaimedAchievements = state.achievements.some(a => a.unlocked && !a.claimed);
    const hasUnclaimed = hasUnclaimedQuests || hasUnclaimedAchievements;

    this.container.innerHTML = `
      <!-- 左側：創辦人與公司資訊 (附帶 PvZ 1 經典使用者登入切換與現實日曆同步) -->
      <div class="flex items-center gap-2.5 flex-shrink-0 whitespace-nowrap">
        <div id="btn-hud-profile-avatar" class="w-10 h-10 rounded-full border border-cyan-400/50 bg-slate-800 flex items-center justify-center text-xl shadow-inner cursor-pointer hover:border-amber-400 hover:scale-105 transition-all" title="點擊切換存檔 / 登入使用者 (PvZ 1 Style)">
          👤
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-100 tracking-wide">${p.companyName}</span>
            <span class="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono">
              Tier ${p.foundryTier}
            </span>
            <span class="text-[10px] text-cyan-400/90 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/30" title="遊戲日曆與現實世界完全同步">
              📅 ${todayStr} (週${dayOfWeekName})
            </span>
          </div>
          <div class="text-xs text-slate-400 flex items-center gap-2">
            <span>CEO: <strong class="text-amber-300">${p.ceoName}</strong></span>
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
          <div class="text-sm font-bold text-amber-400 font-mono tracking-tight group-hover:text-amber-300">
            NT$ ${Math.round(p.cash).toLocaleString()}
          </div>
        </button>

        <!-- 2. 商譽 -->
        <div class="text-center">
          <div class="text-[11px] text-slate-400 font-medium whitespace-nowrap">產業商譽</div>
          <div class="text-sm font-bold text-cyan-400 font-mono whitespace-nowrap">
            ★ ${p.popularity}
          </div>
        </div>

        <!-- 3. 滾動良率指數 (RollingYieldIndex) - 未生產時凍結顯示 -->
        <button id="btn-hud-yield" class="text-center relative group cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30" title="點擊檢視 25 晶粒蒙地卡羅良率晶圓圖 (Wafer Map)">
          <div class="text-[11px] text-slate-400 font-medium flex items-center gap-1 justify-center whitespace-nowrap">
            <span>品質良率</span>
            <span class="text-[10px] text-cyan-400">🔍</span>
          </div>
          <div class="text-sm font-bold font-mono whitespace-nowrap ${isProducing ? (rollingYield && rollingYield >= 0.9 ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-400'}">
            ${rollingYield !== null ? `${(rollingYield * 100).toFixed(1)}%` : 'N/A'}
            <span class="text-[10px] ${isProducing ? 'text-slate-400 font-normal' : 'text-amber-400/90 font-medium'}">
              ${isProducing ? `(${trustMult.toFixed(2)}x)` : '(待命暫停)'}
            </span>
          </div>
        </button>

        <!-- 4. 工廠負荷量 Workload % 與 🔴 紅色警報驚嘆號 -->
        <div class="flex items-center gap-2">
          <div>
            <div class="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
              <span>產線負荷</span>
              <span class="font-mono text-slate-200">${workloadInfo.workloadPercent}%</span>
            </div>
            <div class="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div style="width: ${Math.min(100, workloadInfo.workloadPercent)}%; background-color: ${workloadBarColor};" class="h-full transition-all duration-300"></div>
            </div>
          </div>

          ${
            workloadInfo.workloadPercent > 85
              ? `<button id="btn-advisory-alert" class="w-7 h-7 rounded-full bg-red-600/90 text-white font-black text-xs flex items-center justify-center border-2 border-red-400 pulse-alert shadow-lg cursor-pointer hover:bg-red-500 flex-shrink-0" title="產線超載嚴重！點擊查看瓶頸診斷">
                  !
                </button>`
              : ''
          }
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
        <button id="btn-techtree" class="btn-sci-fi relative text-xs font-bold py-1.5 px-3 bg-cyan-950/50 border-cyan-500/60 text-cyan-300 hover:text-white ${techStatus.canAdvance ? 'border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40 animate-pulse' : ''}" title="檢視半導體製程科技樹 (目前: Tier ${p.foundryTier})">
          🔬 研發 (T${p.foundryTier})
          ${techStatus.canAdvance ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>' : ''}
        </button>

        <!-- 4. 廠房規劃 (黃光區劃設與機台搬移) -->
        <button id="btn-planner" class="btn-sci-fi text-xs font-bold py-1.5 px-3 bg-amber-950/40 border-amber-500/50 text-amber-300 hover:text-white" title="規劃機台擺放與劃設黃光微影專區">
          🏗️ 規劃
        </button>

        <!-- 5. 財報 (日周月收支分析) -->
        <button id="btn-finance" class="btn-sci-fi text-xs font-bold py-1.5 px-3 bg-cyan-950/40 border-cyan-500/50 text-cyan-300 hover:text-white" title="開啟日、周、月收支財務分析">
          📊 財報
        </button>

        <!-- 6. ☰ 更多 ▾ 下拉式選單 (收納次要按鈕，徹底消除擁擠) -->
        <div class="relative inline-block">
          <button id="btn-top-more" class="btn-sci-fi text-xs font-bold py-1.5 px-3 bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer relative" title="更多系統與管理功能">
            <span>☰ 更多</span>
            <span class="text-[10px] text-slate-400">▾</span>
            ${hasUnclaimed ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse"></span>' : ''}
          </button>

          <!-- 下拉浮動面板 -->
          <div id="top-dropdown-menu" class="hidden absolute right-0 mt-2 w-64 rounded-xl glass-panel bg-slate-950/98 border border-slate-700 shadow-2xl py-2 z-50 text-xs text-slate-200 backdrop-blur-xl animate-fadeIn">
            <!-- 人資 -->
            <button id="menu-item-hr" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer">
              <span class="flex items-center gap-2.5 font-medium"><span>👥</span><span>人資管理 (HR)</span></span>
              <span class="text-[10px] text-slate-400 font-mono">${state.staff.length} 人</span>
            </button>

            <!-- 每日任務 -->
            <button id="menu-item-quests" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer">
              <span class="flex items-center gap-2.5 font-medium"><span>📋</span><span>每日任務 (Quests)</span></span>
              ${hasUnclaimedQuests ? '<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/30">待領取</span>' : ''}
            </button>

            <!-- 成就 -->
            <button id="menu-item-achievements" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer">
              <span class="flex items-center gap-2.5 font-medium"><span>🏆</span><span>產業成就 (Achievements)</span></span>
              ${hasUnclaimedAchievements ? '<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">可解鎖</span>' : ''}
            </button>

            <!-- MES 自動派工開關 -->
            <button id="menu-item-toggle-mes" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer">
              <span class="flex items-center gap-2.5 font-medium"><span>🤖</span><span>MES 自動派工</span></span>
              <span class="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${state.unlockedFeatures.mesAutoDispatch ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-slate-700'}">
                ${state.unlockedFeatures.mesAutoDispatch ? '🟢 已開啟' : '⚪ 已停用'}
              </span>
            </button>

            <div class="h-px bg-slate-800 my-1.5"></div>

            <!-- 切換玩家存檔 -->
            <button id="menu-item-switch-user" class="w-full px-4 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer">
              <span class="flex items-center gap-2.5"><span>👤</span><span>切換玩家 (Who are you?)</span></span>
            </button>

            <!-- 存檔與匯出 -->
            <button id="menu-item-save" class="w-full px-4 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer">
              <span class="flex items-center gap-2.5"><span>💾</span><span>存檔與備份 (Save & JSON)</span></span>
            </button>

            <!-- 晶圓製程新手教學 -->
            <button id="menu-item-tutorial" class="w-full px-4 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer">
              <span class="flex items-center gap-2.5"><span>❓</span><span>晶圓製程教學導引</span></span>
            </button>

            <!-- 音效開關 -->
            <button id="menu-item-sound" class="w-full px-4 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer">
              <span class="flex items-center gap-2.5"><span>${isMuted ? '🔇' : '🔊'}</span><span>遊戲音效開關</span></span>
              <span class="text-[10px] text-slate-400 font-mono">${isMuted ? '靜音' : '開啟'}</span>
            </button>

            <div class="h-px bg-red-900/40 my-1.5"></div>

            <!-- 整機重置 (危險操作) -->
            <button id="menu-item-factory-reset" class="w-full px-4 py-2 text-left hover:bg-red-950/70 text-red-400 hover:text-red-300 flex items-center gap-2.5 transition-colors cursor-pointer">
              <span>💥</span>
              <span class="font-bold">整機資料重置 (Factory Reset)</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // 綁定主列按鈕事件 (全數呼叫 stopPropagation，杜絕穿透)
    document.getElementById('btn-contracts')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenContracts();
    });

    document.getElementById('btn-store')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenStore();
    });

    document.getElementById('btn-techtree')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenTechTree?.();
    });

    document.getElementById('btn-planner')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenPlanner?.();
    });

    document.getElementById('btn-finance')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenFinance?.();
    });

    document.getElementById('btn-hud-cash')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenFinance?.();
    });

    document.getElementById('btn-hud-yield')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenWaferMap?.();
    });

    document.getElementById('btn-advisory-alert')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenAdvisory();
    });

    // PvZ 1 登入與玩家切換按鈕
    document.getElementById('btn-hud-profile-avatar')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenLogin?.();
    });

    document.getElementById('btn-hud-switch-user')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenLogin?.();
    });

    // 下拉選單展開/收合控制
    const moreBtn = document.getElementById('btn-top-more');
    const dropdown = document.getElementById('top-dropdown-menu');

    moreBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      dropdown?.classList.toggle('hidden');
    });

    const closeDropdown = () => {
      if (dropdown && !dropdown.classList.contains('hidden')) {
        dropdown.classList.add('hidden');
      }
    };

    // 點擊選單外部自動關閉下拉選單
    const outsideClickListener = (e: MouseEvent) => {
      if (dropdown && !dropdown.contains(e.target as Node) && e.target !== moreBtn && !moreBtn?.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('click', outsideClickListener);

    // 下拉選單項目事件
    document.getElementById('menu-item-hr')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenHR();
    });

    document.getElementById('menu-item-quests')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenQuests();
    });

    document.getElementById('menu-item-achievements')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenAchievements();
    });

    document.getElementById('menu-item-toggle-mes')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      const next = !state.unlockedFeatures.mesAutoDispatch;
      state.unlockedFeatures.mesAutoDispatch = next;
      this.callbacks.onToggleMES(next);
      this.render(state);
    });

    document.getElementById('menu-item-switch-user')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenLogin?.();
    });

    document.getElementById('menu-item-save')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenSaveModal();
    });

    document.getElementById('menu-item-tutorial')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenTutorial?.();
    });

    document.getElementById('menu-item-sound')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.toggleMute();
      SoundEffects.playClick();
      this.render(state);
    });

    document.getElementById('menu-item-factory-reset')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      SoundEffects.playClick();
      this.callbacks.onOpenFactoryReset?.();
    });
  }
}
