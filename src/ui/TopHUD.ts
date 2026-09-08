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

    this.container.innerHTML = `
      <!-- 左側：創辦人與公司資訊 (附帶 PvZ 1 經典使用者登入切換與現實日曆同步) -->
      <div class="flex items-center gap-2.5">
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
      <div class="flex items-center gap-5">
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
          <div class="text-[11px] text-slate-400 font-medium">產業商譽</div>
          <div class="text-sm font-bold text-cyan-400 font-mono">
            ★ ${p.popularity}
          </div>
        </div>

        <!-- 3. 滾動良率指數 (RollingYieldIndex) - 未生產時凍結顯示 -->
        <button id="btn-hud-yield" class="text-center relative group cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30" title="點擊檢視 25 晶粒蒙地卡羅良率晶圓圖 (Wafer Map)">
          <div class="text-[11px] text-slate-400 font-medium flex items-center gap-1 justify-center">
            <span>品質良率</span>
            <span class="text-[10px] text-cyan-400">🔍</span>
          </div>
          <div class="text-sm font-bold font-mono ${isProducing ? (rollingYield && rollingYield >= 0.9 ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-400'}">
            ${rollingYield !== null ? `${(rollingYield * 100).toFixed(1)}%` : 'N/A'}
            <span class="text-[10px] ${isProducing ? 'text-slate-400 font-normal' : 'text-amber-400/90 font-medium'}">
              ${isProducing ? `(${trustMult.toFixed(2)}x)` : '(待命暫停)'}
            </span>
          </div>
        </button>

        <!-- 4. 工廠負荷量 Workload % 與 🔴 紅色警報驚嘆號 -->
        <div class="flex items-center gap-2.5">
          <div>
            <div class="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
              <span>產線負荷 (Workload)</span>
              <span class="font-mono text-slate-200">${workloadInfo.workloadPercent}%</span>
            </div>
            <div class="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div style="width: ${Math.min(100, workloadInfo.workloadPercent)}%; background-color: ${workloadBarColor};" class="h-full transition-all duration-300"></div>
            </div>
          </div>

          ${
            workloadInfo.workloadPercent > 85
              ? `<button id="btn-advisory-alert" class="w-8 h-8 rounded-full bg-red-600/90 text-white font-black text-sm flex items-center justify-center border-2 border-red-400 pulse-alert shadow-lg cursor-pointer hover:bg-red-500" title="產線超載嚴重！點擊查看瓶頸診斷">
                  !
                </button>`
              : ''
          }
        </div>
      </div>

      <!-- 右側：功能導航按鈕群 -->
      <div class="flex items-center gap-1.5">
        <!-- 財報 (日周月收支分析) -->
        <button id="btn-finance" class="btn-sci-fi text-xs bg-cyan-950/40 border-cyan-500/50 text-cyan-300 hover:text-white" title="開啟日、周、月收支財務分析">
          📊 財報
        </button>

        <!-- 科技樹研發突破 (次世代機台解鎖) -->
        <button id="btn-techtree" class="btn-sci-fi relative text-xs bg-cyan-950/50 border-cyan-500/60 text-cyan-300 hover:text-white ${techStatus.canAdvance ? 'border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40 animate-pulse' : ''}" title="檢視半導體製程科技樹 (目前: Tier ${p.foundryTier})">
          🔬 研發 (T${p.foundryTier})
          ${techStatus.canAdvance ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>' : ''}
        </button>

        <!-- MES 自動派工開關 -->
        <button id="btn-toggle-mes" class="btn-sci-fi text-xs ${state.unlockedFeatures.mesAutoDispatch ? 'border-emerald-500/80 text-emerald-300' : 'opacity-60'}">
          ${state.unlockedFeatures.mesAutoDispatch ? '🤖 MES' : '⏸️ MES'}
        </button>

        <!-- 合約板 -->
        <button id="btn-contracts" class="btn-sci-fi text-xs">
          📜 合約
        </button>

        <!-- 商城 -->
        <button id="btn-store" class="btn-sci-fi text-xs">
          🏬 商城
        </button>

        <!-- 人資 -->
        <button id="btn-hr" class="btn-sci-fi text-xs">
          👥 人資
        </button>

        <!-- 廠房規劃 -->
        <button id="btn-planner" class="btn-sci-fi text-xs bg-amber-950/40 border-amber-500/50 text-amber-300 hover:text-white" title="規劃機台擺放與劃設黃光微影專區">
          🏗️ 廠房規劃
        </button>

        <!-- 每日任務 -->
        <button id="btn-quests" class="btn-sci-fi relative text-xs">
          📋 任務
          ${state.questState.dailyQuests.some(q => q.completed && !q.claimed) ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400"></span>' : ''}
        </button>

        <!-- 成就 -->
        <button id="btn-achievements" class="btn-sci-fi relative text-xs">
          🏆 成就
          ${state.achievements.some(a => a.unlocked && !a.claimed) ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>' : ''}
        </button>

        <!-- 切換玩家存檔 (PvZ 1 登入) -->
        <button id="btn-login-user" class="btn-sci-fi px-2.5 text-xs" title="切換玩家與存檔管理 (Who are you?)">
          👤 登入
        </button>

        <!-- 新手教學引導 -->
        <button id="btn-tutorial" class="btn-sci-fi px-2" title="新手入門指引與半導體製程教學">
          ❓
        </button>

        <!-- 靜音開關 -->
        <button id="btn-sound" class="btn-sci-fi px-2" title="音效切換">
          ${isMuted ? '🔇' : '🔊'}
        </button>

        <!-- 存檔 -->
        <button id="btn-save" class="btn-sci-fi px-2" title="存檔與匯出">
          💾
        </button>
      </div>
    `;

    // 綁定按鈕事件 (全數呼叫 stopPropagation，杜絕穿透)
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

    document.getElementById('btn-hr')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenHR();
    });

    document.getElementById('btn-planner')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenPlanner?.();
    });

    document.getElementById('btn-quests')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenQuests();
    });

    document.getElementById('btn-achievements')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenAchievements();
    });

    document.getElementById('btn-advisory-alert')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenAdvisory();
    });

    // 科技樹按鈕
    document.getElementById('btn-techtree')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenTechTree?.();
    });

    // 財報按鈕與資金卡片點擊
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

    document.getElementById('btn-login-user')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenLogin?.();
    });

    document.getElementById('btn-toggle-mes')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      const next = !state.unlockedFeatures.mesAutoDispatch;
      state.unlockedFeatures.mesAutoDispatch = next;
      this.callbacks.onToggleMES(next);
      this.render(state);
    });

    document.getElementById('btn-hud-yield')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenWaferMap?.();
    });

    document.getElementById('btn-tutorial')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenTutorial?.();
    });

    document.getElementById('btn-sound')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.toggleMute();
      SoundEffects.playClick();
      this.render(state);
    });

    document.getElementById('btn-save')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundEffects.playClick();
      this.callbacks.onOpenSaveModal();
    });
  }
}
