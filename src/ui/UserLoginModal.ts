/**
 * UserLoginModal.ts
 * 植物大戰殭屍 1 代 (Plants vs. Zombies 1) 經典使用者選擇與登入系統：
 * 1. 「請選擇使用者 (Who are you?)」視窗
 * 2. 存檔列表展示 (使用者姓名、公司名稱、Foundry Tier、現有資金、最後遊玩時間)
 * 3. ➕ 建立新使用者 (Create New User)
 * 4. ✏️ 重新命名 (Rename User)
 * 5. 🗑️ 刪除存檔 (Delete User)
 * 6. ▶️ 進入遊戲 / 切換存檔 (OK / Play)
 */

import { SaveGameV2 } from '../types';
import { SaveGameService } from '../services/SaveGameService';
import { SoundEffects } from '../audio/SoundEffects';

export class UserLoginModal {
  private static selectedUserId: string | null = null;
  private static isEditingName: boolean = false;
  private static isCreatingUser: boolean = false;

  public static show(
    currentState: SaveGameV2,
    onUserSwitched: (newState: SaveGameV2) => void,
    allowCancel: boolean = true
  ): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    // 預設選中當前活躍使用者
    const active = SaveGameService.getActiveUserProfile();
    this.selectedUserId = active.id;
    this.isEditingName = false;
    this.isCreatingUser = false;

    this.render(container, currentState, onUserSwitched, allowCancel);
  }

  private static render(
    container: HTMLElement,
    currentState: SaveGameV2,
    onUserSwitched: (newState: SaveGameV2) => void,
    allowCancel: boolean
  ): void {
    const profiles = SaveGameService.getUserProfiles();
    if (!this.selectedUserId && profiles.length > 0) {
      this.selectedUserId = profiles[0].id;
    }

    const selectedProfile = profiles.find(p => p.id === this.selectedUserId) || profiles[0];

    container.innerHTML = `
      <div id="modal-backdrop-login" class="modal-backdrop">
        <div class="modal-content pvz-dialog max-w-lg border-2 border-amber-500/70 bg-slate-950/95 shadow-2xl shadow-amber-900/40 rounded-2xl overflow-hidden animate-scaleUp">
          
          <!-- PvZ Style Header -->
          <div class="modal-header bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/40 p-4 text-center relative flex-shrink-0">
            <div class="text-xl font-black text-amber-300 tracking-wider flex items-center justify-center gap-2 drop-shadow">
              <span>👤</span>
              <span>請選擇使用者 (Who are you?)</span>
            </div>
            <p class="text-xs text-amber-200/70 mt-1 font-sans">
              歡迎回到《矽島霸權》！請點選您的執行長存檔，或建立新玩家身分。
            </p>
            ${allowCancel ? `
              <button id="btn-close-login" class="absolute right-4 top-4 w-7 h-7 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center text-xs font-bold border border-slate-700">
                ✕
              </button>
            ` : ''}
          </div>

          <!-- Body -->
          <div class="modal-body p-5 space-y-4 overflow-y-auto max-h-[60vh]">
            
            <!-- 使用者存檔列表 (PvZ 捲軸清單) -->
            <div class="space-y-2.5 bg-slate-900/80 p-3 rounded-xl border border-amber-500/30 max-h-56 overflow-y-auto">
              ${profiles.map(p => {
                const isSelected = p.id === this.selectedUserId;
                const dateStr = new Date(p.lastPlayedAt).toLocaleDateString() + ' ' + new Date(p.lastPlayedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return `
                  <div
                    class="user-profile-item p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-400 shadow-md shadow-amber-500/20 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-amber-500/40 text-slate-300'
                    }"
                    data-user-id="${p.id}"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-8 h-8 rounded-full border ${isSelected ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-400'} flex items-center justify-center font-bold text-sm flex-shrink-0">
                        ${isSelected ? '★' : '👤'}
                      </div>
                      <div class="min-w-0">
                        <div class="font-bold text-sm truncate ${isSelected ? 'text-amber-300' : 'text-slate-200'}">
                          ${p.name}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono truncate">
                          ${p.companyName}
                        </div>
                      </div>
                    </div>

                    <div class="text-right flex-shrink-0 font-mono text-xs">
                      <div class="text-cyan-400 font-bold">Tier ${p.foundryTier}</div>
                      <div class="text-amber-300/90 text-[10px]">NT$ ${Math.round(p.cash).toLocaleString()}</div>
                      <div class="text-slate-500 text-[9px]">${dateStr}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- 創建新使用者輸入欄 (點擊「建立新使用者」時展開) -->
            <div id="create-user-section" class="${this.isCreatingUser ? 'block' : 'hidden'} p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2.5 animate-fadeIn">
              <div class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>➕</span>
                <span>建立新執行長存檔：</span>
              </div>
              <div class="space-y-2">
                <input
                  id="input-new-username"
                  type="text"
                  maxlength="16"
                  placeholder="輸入執行長姓名 (例如: 張忠謀 / Alex)"
                  class="w-full px-3 py-2 text-xs bg-slate-950 border border-amber-500/40 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  id="input-new-company"
                  type="text"
                  maxlength="20"
                  placeholder="公司名稱 (預設: 執行長名 + 半導體)"
                  class="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div class="flex justify-end gap-2 pt-1">
                <button id="btn-cancel-create" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                  取消
                </button>
                <button id="btn-confirm-create" class="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md">
                  確認建立
                </button>
              </div>
            </div>

            <!-- 重新命名輸入欄 (點擊「重新命名」時展開) -->
            <div id="rename-user-section" class="${this.isEditingName ? 'block' : 'hidden'} p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/40 space-y-2.5 animate-fadeIn">
              <div class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <span>✏️</span>
                <span>修改目前選中存檔姓名：</span>
              </div>
              <input
                id="input-rename-username"
                type="text"
                maxlength="16"
                value="${selectedProfile ? selectedProfile.name : ''}"
                placeholder="輸入新名稱"
                class="w-full px-3 py-2 text-xs bg-slate-950 border border-cyan-500/40 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
              <div class="flex justify-end gap-2 pt-1">
                <button id="btn-cancel-rename" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                  取消
                </button>
                <button id="btn-confirm-rename" class="px-3.5 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md">
                  儲存新名稱
                </button>
              </div>
            </div>

            <!-- 操作按鈕列 (建立、重命名、刪除) -->
            <div class="grid grid-cols-3 gap-2 text-xs">
              <button id="btn-create-user-toggle" class="btn-sci-fi justify-center py-2 bg-amber-900/30 hover:bg-amber-800/40 border-amber-500/40 text-amber-200">
                ➕ 建立新玩家
              </button>
              <button id="btn-rename-user-toggle" class="btn-sci-fi justify-center py-2 bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200">
                ✏️ 重新命名
              </button>
              <button id="btn-delete-user" class="btn-sci-fi justify-center py-2 bg-red-950/40 hover:bg-red-900/60 border-red-800/40 text-red-300">
                🗑️ 刪除存檔
              </button>
            </div>

            <!-- 整機重置 (全部刪除) -->
            <div class="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <button id="btn-factory-reset-login" class="text-[11px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1.5 transition-colors cursor-pointer" title="清除本裝置所有玩家存檔與紀錄，從零開始體驗">
                <span>💥</span>
                <span>整機資料重置 (清除全部資料與教學，重新開始)</span>
              </button>
            </div>

          </div>

          <!-- PvZ Footer: OK (進入遊戲) / Cancel -->
          <div class="modal-footer p-3.5 border-t border-amber-500/30 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <div class="text-xs text-slate-400 font-mono">
              目前選取: <strong class="text-amber-300">${selectedProfile ? selectedProfile.name : '未選擇'}</strong>
            </div>

            <div class="flex items-center gap-3">
              ${allowCancel ? `
                <button id="btn-cancel-login" class="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                  取消
                </button>
              ` : ''}
              <button id="btn-confirm-play" class="btn-sci-fi px-6 py-2 text-xs font-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-600/30 border-amber-400">
                ▶️ 進入遊戲 (OK)
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, currentState, onUserSwitched, allowCancel);
  }

  private static bindEvents(
    container: HTMLElement,
    currentState: SaveGameV2,
    onUserSwitched: (newState: SaveGameV2) => void,
    allowCancel: boolean
  ): void {
    const closeModal = () => {
      SoundEffects.playClick();
      container.innerHTML = '';
      window.removeEventListener('keydown', onKeyDown);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && allowCancel) {
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    if (allowCancel) {
      document.getElementById('btn-close-login')?.addEventListener('click', closeModal);
      document.getElementById('btn-cancel-login')?.addEventListener('click', closeModal);
      document.getElementById('modal-backdrop-login')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-backdrop-login')) {
          closeModal();
        }
      });
    }

    // 選取使用者存檔
    container.querySelectorAll('.user-profile-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const userId = (e.currentTarget as HTMLElement).getAttribute('data-user-id');
        if (userId) {
          SoundEffects.playClick();
          this.selectedUserId = userId;
          this.isEditingName = false;
          this.isCreatingUser = false;
          this.render(container, currentState, onUserSwitched, allowCancel);
        }
      });
    });

    // 切換展開建立使用者
    document.getElementById('btn-create-user-toggle')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.isCreatingUser = !this.isCreatingUser;
      this.isEditingName = false;
      this.render(container, currentState, onUserSwitched, allowCancel);
    });

    // 取消建立
    document.getElementById('btn-cancel-create')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.isCreatingUser = false;
      this.render(container, currentState, onUserSwitched, allowCancel);
    });

    // 確認建立新玩家
    document.getElementById('btn-confirm-create')?.addEventListener('click', () => {
      const nameInput = document.getElementById('input-new-username') as HTMLInputElement;
      const companyInput = document.getElementById('input-new-company') as HTMLInputElement;
      const name = nameInput?.value.trim() || '';
      const company = companyInput?.value.trim() || undefined;

      if (!name) {
        alert('請輸入執行長姓名！');
        return;
      }

      SoundEffects.playCoinChime();
      const newProfile = SaveGameService.createUser(name, company);
      this.selectedUserId = newProfile.id;
      this.isCreatingUser = false;
      this.render(container, currentState, onUserSwitched, allowCancel);
    });

    // 切換展開重新命名
    document.getElementById('btn-rename-user-toggle')?.addEventListener('click', () => {
      if (!this.selectedUserId) return;
      SoundEffects.playClick();
      this.isEditingName = !this.isEditingName;
      this.isCreatingUser = false;
      this.render(container, currentState, onUserSwitched, allowCancel);
    });

    // 取消重命名
    document.getElementById('btn-cancel-rename')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.isEditingName = false;
      this.render(container, currentState, onUserSwitched, allowCancel);
    });

    // 確認重命名
    document.getElementById('btn-confirm-rename')?.addEventListener('click', () => {
      if (!this.selectedUserId) return;
      const input = document.getElementById('input-rename-username') as HTMLInputElement;
      const newName = input?.value.trim();

      if (!newName) {
        alert('名稱不能為空！');
        return;
      }

      SoundEffects.playClick();
      SaveGameService.renameUser(this.selectedUserId, newName);
      this.isEditingName = false;
      this.render(container, currentState, onUserSwitched, allowCancel);
    });

    // 刪除存檔
    document.getElementById('btn-delete-user')?.addEventListener('click', () => {
      if (!this.selectedUserId) return;
      const profiles = SaveGameService.getUserProfiles();
      const profile = profiles.find(p => p.id === this.selectedUserId);
      if (!profile) return;

      if (profiles.length <= 1) {
        alert('這是唯一的玩家存檔，無法刪除！');
        return;
      }

      if (!confirm(`確定要徹底刪除玩家【${profile.name}】（${profile.companyName}）的存檔嗎？此動作不可逆！`)) {
        return;
      }

      SoundEffects.playClick();
      const res = SaveGameService.deleteUser(this.selectedUserId);
      if (!res.success) {
        alert(res.message || '刪除失敗');
        return;
      }

      // 重設選擇為活躍使用者
      this.selectedUserId = SaveGameService.getActiveUserProfile().id;
      this.render(container, currentState, onUserSwitched, allowCancel);
    });

    // 整機重置按鈕
    document.getElementById('btn-factory-reset-login')?.addEventListener('click', () => {
      SoundEffects.playClick();
      if (confirm('⚠️ 警告：整機資料重置將徹底清除本裝置上的所有玩家帳號、廠房進度、財務紀錄與暫存設定，無法復原！\n\n確定要刪除裝置全部資料使玩家能從零開始重新體驗嗎？')) {
        SaveGameService.factoryResetAllData();
        alert('整機資料已全數清除！即將重新啟動遊戲。');
        window.location.reload();
      }
    });

    // 進入遊戲 (OK / Play)
    document.getElementById('btn-confirm-play')?.addEventListener('click', () => {
      if (!this.selectedUserId) return;

      SoundEffects.playCoinChime();
      const loadedSave = SaveGameService.switchActiveUser(this.selectedUserId);
      if (!loadedSave) {
        alert('載入該存檔失敗，將進入預設存檔！');
        return;
      }

      closeModal();
      onUserSwitched(loadedSave);
    });
  }
}
