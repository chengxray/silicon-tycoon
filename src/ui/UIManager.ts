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
import { SaveGameService } from '../services/SaveGameService';
import { SoundEffects } from '../audio/SoundEffects';
import { OrderData, WaferLotData } from '../types';

export class UIManager {
  private topHUD: TopHUD;
  private state: SaveGameV2;
  private onStateUpdated: () => void;

  constructor(
    state: SaveGameV2,
    onSpeedChange: (speed: number) => void,
    onStateUpdated: () => void
  ) {
    this.state = state;
    this.onStateUpdated = onStateUpdated;

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
      onOpenTutorial: () => this.openTutorial()
    });

    // 初始化 Dev Console 監聽器
    DevConsole.init(state, onSpeedChange, onStateUpdated);

    // 檢查是否需要跳出創立儀式或新手引導
    if (!state.player.companyName || state.player.companyName === '矽島先進半導體') {
      // 提供玩家自訂創立機會
      FoundrySetupModal.show(state, () => {
        this.render();
        this.onStateUpdated();
        if (!TutorialOverlay.isCompleted()) {
          this.openTutorial();
        }
      });
    }

    this.render();
  }

  public render(): void {
    this.topHUD.render(this.state);
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

  public openTutorial(step?: number): void {
    TutorialOverlay.show(this.state, () => {
      this.render();
      this.onStateUpdated();
    }, step);
  }

  public openSaveModal(): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-lg text-slate-100">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-700">
            <h3 class="text-base font-bold flex items-center gap-2">
              <span>💾</span>
              <span>存檔備份與 JSON 匯出/匯入</span>
            </h3>
            <button id="btn-close-save-modal" class="text-slate-400 hover:text-white font-mono text-lg">✕</button>
          </div>

          <div class="space-y-3 text-xs text-slate-300">
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
        </div>
      </div>
    `;

    document.getElementById('btn-close-save-modal')?.addEventListener('click', () => {
      SoundEffects.playClick();
      container.innerHTML = '';
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
}
