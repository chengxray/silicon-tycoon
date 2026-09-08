/**
 * TopHUD.ts
 * 負責主畫面頂部儀表板：CEO 資訊、現金、商譽、RollingYieldIndex 信任指標、
 * 工廠負荷百分比 (Workload %) 進度條、🔴 紅色警報驚嘆號與導航功能鍵
 */

import { SaveGameV2 } from '../types';
import { ProductionEngine } from '../engine/ProductionEngine';
import { EconomyEngine } from '../engine/EconomyEngine';
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
    const rollingYield = state.rollingYieldHistory.length > 0
      ? state.rollingYieldHistory.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, state.rollingYieldHistory.length)
      : null;
    const trustMult = EconomyEngine.calculateTrustMultiplier(rollingYield);

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
      <!-- 左側：創辦人與公司資訊 -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full border border-cyan-400/50 bg-slate-800 flex items-center justify-center text-xl shadow-inner">
          👤
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-100 tracking-wide">${p.companyName}</span>
            <span class="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono">
              Tier ${p.foundryTier}
            </span>
          </div>
          <div class="text-xs text-slate-400 flex items-center gap-2">
            <span>CEO: ${p.ceoName}</span>
            <span class="text-slate-600">|</span>
            <span class="text-emerald-400 font-mono text-[11px]">${p.unlockedCleanroomClass}</span>
          </div>
        </div>
      </div>

      <!-- 中間：核心營運三大 KPI 與工廠負荷進度條 -->
      <div class="flex items-center gap-6">
        <!-- 1. 現金 -->
        <div class="text-center">
          <div class="text-[11px] text-slate-400 font-medium">廠房資金 (Cash)</div>
          <div class="text-sm font-bold text-amber-400 font-mono tracking-tight">
            NT$ ${Math.round(p.cash).toLocaleString()}
          </div>
        </div>

        <!-- 2. 商譽 -->
        <div class="text-center">
          <div class="text-[11px] text-slate-400 font-medium">產業商譽</div>
          <div class="text-sm font-bold text-cyan-400 font-mono">
            ★ ${p.popularity}
          </div>
        </div>

        <!-- 3. 滾動良率指數 (RollingYieldIndex) -->
        <button id="btn-hud-yield" class="text-center relative group cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30" title="點擊檢視 25 晶粒蒙地卡羅良率晶圓圖 (Wafer Map)">
          <div class="text-[11px] text-slate-400 font-medium flex items-center gap-1 justify-center">
            <span>品質良率</span>
            <span class="text-[10px] text-cyan-400">🔍</span>
          </div>
          <div class="text-sm font-bold font-mono ${rollingYield && rollingYield >= 0.9 ? 'text-emerald-400' : 'text-amber-400'}">
            ${rollingYield !== null ? `${(rollingYield * 100).toFixed(1)}%` : 'N/A'}
            <span class="text-[10px] text-slate-400 font-normal">(${trustMult.toFixed(2)}x)</span>
          </div>
        </button>

        <!-- 4. 工廠負荷量 Workload % 與 🔴 紅色警報驚嘆號 -->
        <div class="flex items-center gap-2.5">
          <div>
            <div class="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
              <span>產線負荷 (Workload)</span>
              <span class="font-mono text-slate-200">${workloadInfo.workloadPercent}%</span>
            </div>
            <div class="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
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
      <div class="flex items-center gap-2">
        <!-- MES 自動派工開關 -->
        <button id="btn-toggle-mes" class="btn-sci-fi text-xs ${state.unlockedFeatures.mesAutoDispatch ? 'border-emerald-500/80 text-emerald-300' : 'opacity-60'}">
          ${state.unlockedFeatures.mesAutoDispatch ? '🤖 MES自動' : '⏸️ MES關閉'}
        </button>

        <!-- 合約板 -->
        <button id="btn-contracts" class="btn-sci-fi">
          📜 合約
        </button>

        <!-- 商城 -->
        <button id="btn-store" class="btn-sci-fi">
          🏬 商城
        </button>

        <!-- 人資 -->
        <button id="btn-hr" class="btn-sci-fi">
          👥 人資
        </button>

        <!-- 每日任務 -->
        <button id="btn-quests" class="btn-sci-fi relative">
          📋 任務
          ${state.questState.dailyQuests.some(q => q.completed && !q.claimed) ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400"></span>' : ''}
        </button>

        <!-- 成就 -->
        <button id="btn-achievements" class="btn-sci-fi relative">
          🏆 成就
          ${state.achievements.some(a => a.unlocked && !a.claimed) ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>' : ''}
        </button>

        <!-- 新手教學引導 -->
        <button id="btn-tutorial" class="btn-sci-fi px-2.5" title="新手入門指引與半導體製程教學">
          ❓
        </button>

        <!-- 靜音開關 -->
        <button id="btn-sound" class="btn-sci-fi px-2.5" title="音效切換">
          ${isMuted ? '🔇' : '🔊'}
        </button>

        <!-- 存檔 -->
        <button id="btn-save" class="btn-sci-fi px-2.5" title="存檔與匯出">
          💾
        </button>
      </div>
    `;

    // 綁定按鈕事件
    document.getElementById('btn-contracts')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.callbacks.onOpenContracts();
    });

    document.getElementById('btn-store')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.callbacks.onOpenStore();
    });

    document.getElementById('btn-hr')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.callbacks.onOpenHR();
    });

    document.getElementById('btn-quests')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.callbacks.onOpenQuests();
    });

    document.getElementById('btn-achievements')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.callbacks.onOpenAchievements();
    });

    document.getElementById('btn-advisory-alert')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.callbacks.onOpenAdvisory();
    });

    document.getElementById('btn-toggle-mes')?.addEventListener('click', () => {
      SoundEffects.playClick();
      const next = !state.unlockedFeatures.mesAutoDispatch;
      state.unlockedFeatures.mesAutoDispatch = next;
      this.callbacks.onToggleMES(next);
      this.render(state);
    });

    document.getElementById('btn-hud-yield')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.callbacks.onOpenWaferMap?.();
    });

    document.getElementById('btn-tutorial')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.callbacks.onOpenTutorial?.();
    });

    document.getElementById('btn-sound')?.addEventListener('click', () => {
      SoundEffects.toggleMute();
      SoundEffects.playClick();
      this.render(state);
    });

    document.getElementById('btn-save')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.callbacks.onOpenSaveModal();
    });
  }
}
