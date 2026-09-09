import { SoundEffects } from '../audio/SoundEffects';

/**
 * 廠房金錢增減動態浮動特效管理器 (Floating Cash FX Manager)
 */
export class CashFXManager {
  private static container: HTMLElement | null = null;

  private static getContainer(): HTMLElement {
    if (!this.container || !document.body.contains(this.container)) {
      let existing = document.getElementById('cash-fx-container');
      if (!existing) {
        existing = document.createElement('div');
        existing.id = 'cash-fx-container';
        existing.className = 'fixed inset-0 pointer-events-none z-[9999] overflow-hidden';
        document.body.appendChild(existing);
      }
      this.container = existing;
    }
    return this.container;
  }

  /**
   * 觸發金錢浮動動態特效
   * @param delta 金額變動數值 (正數為賺錢，負數為花錢)
   * @param source 觸發源元素或座標位置 (預設為頂部 HUD 現金欄位)
   */
  public static trigger(delta: number, source?: HTMLElement | { x: number; y: number } | null): void {
    if (Math.abs(delta) < 1) return;

    const isGain = delta > 0;
    const absVal = Math.round(Math.abs(delta));
    const container = this.getContainer();

    // 計算生成座標
    let spawnX = window.innerWidth / 2;
    let spawnY = 48; // 預設頂部 HUD 下方

    if (source && 'getBoundingClientRect' in source) {
      const rect = (source as HTMLElement).getBoundingClientRect();
      spawnX = rect.left + rect.width / 2;
      spawnY = isGain ? rect.top : rect.bottom;
    } else if (source && typeof (source as any).x === 'number') {
      spawnX = (source as any).x;
      spawnY = (source as any).y;
    } else {
      // 尋找 HUD 現金按鈕
      const hudCashEl = document.getElementById('btn-hud-cash') || document.getElementById('hud-cash-value');
      if (hudCashEl) {
        const rect = hudCashEl.getBoundingClientRect();
        spawnX = rect.left + rect.width / 2;
        spawnY = rect.bottom + 4;
      }
    }

    // 加入微幅隨機位移，防止多重跳動時文字重疊
    const jitterX = (Math.random() - 0.5) * 28;
    const jitterY = (Math.random() - 0.5) * 8;
    spawnX += jitterX;
    spawnY += jitterY;

    // 建立浮動文字 DOM
    const floatEl = document.createElement('div');
    floatEl.className = `absolute pointer-events-none font-mono font-black text-sm sm:text-base flex items-center gap-1.5 select-none ${
      isGain ? 'cash-fx-gain' : 'cash-fx-loss'
    }`;
    floatEl.style.left = `${spawnX}px`;
    floatEl.style.top = `${spawnY}px`;
    floatEl.style.transform = 'translate(-50%, -50%)';

    const icon = isGain ? '💰' : '💸';
    const sign = isGain ? '+' : '-';
    floatEl.innerHTML = `
      <span class="text-xs sm:text-sm drop-shadow">${icon}</span>
      <span>${sign}NT$ ${absVal.toLocaleString()}</span>
    `;

    container.appendChild(floatEl);

    // 觸發 HUD 現金欄位邊框霓虹脈衝動畫
    const hudCashValueEl = document.getElementById('hud-cash-value');
    if (hudCashValueEl) {
      hudCashValueEl.classList.remove('cash-pulse-green', 'cash-pulse-red');
      // 強制 reflow 重新觸發動畫
      void hudCashValueEl.offsetWidth;
      hudCashValueEl.classList.add(isGain ? 'cash-pulse-green' : 'cash-pulse-red');

      setTimeout(() => {
        hudCashValueEl.classList.remove('cash-pulse-green', 'cash-pulse-red');
      }, 650);
    }

    // 播放提示音效
    if (isGain && absVal >= 50_000) {
      SoundEffects.playCoinChime();
    }

    // 動畫完成後銷毀 DOM
    setTimeout(() => {
      floatEl.remove();
    }, 1400);
  }
}
