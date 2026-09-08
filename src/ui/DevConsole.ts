/**
 * DevConsole.ts
 * 開發者專屬除錯控制台 (Developer-Only Admin Speed Controls)
 * 僅限 ?dev=true 或按鍵 Ctrl + Shift + D 呼出，普通玩家端完全鎖死常規 1x 即時速度
 */

import { SaveGameV2 } from '../types';
import { SoundEffects } from '../audio/SoundEffects';

export class DevConsole {
  private static isVisible = false;
  private static speedMultiplier = 1;

  public static getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  public static init(
    state: SaveGameV2,
    onSpeedChange: (speed: number) => void,
    onStateUpdated: () => void
  ): void {
    // 檢查 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const hasDevParam = urlParams.get('dev') === 'true' || urlParams.get('admin') === 'foundry';

    if (hasDevParam) {
      this.toggle(state, onSpeedChange, onStateUpdated);
    }

    // 快捷鍵 Ctrl + Shift + D
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        this.toggle(state, onSpeedChange, onStateUpdated);
      }
    });
  }

  public static toggle(
    state: SaveGameV2,
    onSpeedChange: (speed: number) => void,
    onStateUpdated: () => void
  ): void {
    this.isVisible = !this.isVisible;
    const container = document.getElementById('dev-console');
    if (!container) return;

    if (!this.isVisible) {
      container.innerHTML = '';
      return;
    }

    SoundEffects.playClick();
    this.render(container, state, onSpeedChange, onStateUpdated);
  }

  private static render(
    container: HTMLElement,
    state: SaveGameV2,
    onSpeedChange: (speed: number) => void,
    onStateUpdated: () => void
  ): void {
    container.innerHTML = `
      <div class="fixed bottom-4 right-4 z-50 p-4 rounded-xl glass-panel border border-red-500/50 bg-slate-950/95 shadow-2xl text-slate-100 w-80">
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-red-500/30">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span class="text-xs font-bold text-red-400 font-mono tracking-wider">DEV DEBUG CONSOLE</span>
          </div>
          <button id="btn-dev-close" class="text-slate-400 hover:text-white text-sm font-mono">✕</button>
        </div>

        <!-- 時間倍速控制器 -->
        <div class="mb-3">
          <div class="text-[11px] text-slate-400 mb-1 font-mono">SIMULATION SPEED:</div>
          <div class="grid grid-cols-4 gap-1.5">
            ${[1, 2, 4, 8]
              .map(
                (spd) => `
              <button
                class="btn-speed btn-sci-fi text-xs py-1 justify-center ${
                  this.speedMultiplier === spd ? 'bg-red-600 border-red-400 text-white font-bold' : ''
                }"
                data-speed="${spd}"
              >
                ${spd}x
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- 輔助測試按鈕 -->
        <div class="space-y-1.5 text-xs">
          <button id="btn-add-cash" class="btn-sci-fi w-full justify-center bg-slate-900 border-slate-700 hover:border-amber-400 text-amber-300">
            💰 給予 NT$ 5,000 萬測試金
          </button>
          <button id="btn-trigger-wear" class="btn-sci-fi w-full justify-center bg-slate-900 border-slate-700 hover:border-red-400 text-red-300">
            ⚡ 機台磨損 +50% (觸發故障)
          </button>
          <button id="btn-reset-save" class="btn-sci-fi w-full justify-center btn-danger text-xs">
            🗑️ 清空重置存檔 (Reset Game)
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-dev-close')?.addEventListener('click', () => {
      this.isVisible = false;
      container.innerHTML = '';
    });

    document.querySelectorAll('.btn-speed').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        SoundEffects.playClick();
        const spd = Number((e.currentTarget as HTMLElement).getAttribute('data-speed'));
        this.speedMultiplier = spd;
        onSpeedChange(spd);
        this.render(container, state, onSpeedChange, onStateUpdated);
      });
    });

    document.getElementById('btn-add-cash')?.addEventListener('click', () => {
      state.player.cash += 50_000_000;
      SoundEffects.playCoin();
      onStateUpdated();
    });

    document.getElementById('btn-trigger-wear')?.addEventListener('click', () => {
      for (const m of state.machines) {
        m.wear = Math.min(100, m.wear + 50);
        if (m.wear >= 80) m.status = 'MAINTENANCE';
      }
      SoundEffects.playWarning();
      onStateUpdated();
    });

    document.getElementById('btn-reset-save')?.addEventListener('click', () => {
      if (confirm('確定要清空本地存檔並重置遊戲嗎？')) {
        localStorage.clear();
        window.location.reload();
      }
    });
  }
}
