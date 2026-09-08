/**
 * FoundrySetupModal.ts
 * 晶圓廠創立儀式開場創角彈窗：
 * 公司名稱自訂與隨機擲骰 🎲、CEO 姓名自訂、6 款半導體領袖頭像選取
 */

import { PlayerProfile, SaveGameV2 } from '../types';
import { SoundEffects } from '../audio/SoundEffects';

export class FoundrySetupModal {
  private static readonly RANDOM_COMPANIES = [
    '矽島先進積體電路',
    '台積微系統',
    '聯華微電科技',
    '世界微晶圓',
    '美光矽島半導體',
    '瑞昱微系統',
    '聯詠積體科技',
    '旺宏微晶科技'
  ];

  private static readonly RANDOM_CEOS = [
    '張忠謨',
    '劉德音',
    '魏哲家',
    '曹興成',
    '黃仁勳',
    '蘇姿丰',
    '蔡力行',
    '梁孟松'
  ];

  public static show(
    state: SaveGameV2,
    onComplete: (profile: PlayerProfile) => void
  ): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    let selectedAvatar = 'avatar_1';

    const render = () => {
      container.innerHTML = `
        <div class="modal-backdrop">
          <div class="modal-content glass-panel glass-panel-glow text-slate-100 max-w-xl">
            <!-- 標題 -->
            <div class="text-center mb-6">
              <div class="inline-block px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-xs font-mono mb-2">
                FOUNDRY ESTABLISHMENT PROTOCOL
              </div>
              <h2 class="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-400">
                創立你的半導體晶圓帝國
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                制定企業願景與創辦人身份，開啟從微米到埃米的矽島霸權之路！
              </p>
            </div>

            <!-- 表單內容 -->
            <div class="space-y-4 text-sm">
              <!-- 公司名稱 -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  晶圓製造公司名稱 (Company Name)
                </label>
                <div class="flex gap-2">
                  <input
                    id="setup-company-name"
                    type="text"
                    value="${state.player.companyName}"
                    class="flex-1 px-3 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400 text-sm font-medium"
                    placeholder="輸入你的晶圓廠名稱..."
                  />
                  <button id="btn-random-company" class="btn-sci-fi px-3 text-base" title="隨機擲骰企業名">
                    🎲
                  </button>
                </div>
              </div>

              <!-- 創辦人姓名 -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  創辦人 / CEO 姓名 (CEO Name)
                </label>
                <div class="flex gap-2">
                  <input
                    id="setup-ceo-name"
                    type="text"
                    value="${state.player.ceoName}"
                    class="flex-1 px-3 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400 text-sm font-medium"
                    placeholder="輸入創辦人姓名..."
                  />
                  <button id="btn-random-ceo" class="btn-sci-fi px-3 text-base" title="隨機擲骰CEO名">
                    🎲
                  </button>
                </div>
              </div>

              <!-- CEO 頭像選擇 -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-2">
                  選擇創辦人領袖形象 (Avatar Selection)
                </label>
                <div class="grid grid-cols-6 gap-2">
                  ${[
                    { id: 'avatar_1', icon: '👨‍💼', label: '產業領袖' },
                    { id: 'avatar_2', icon: '👩‍💼', label: '營運長' },
                    { id: 'avatar_3', icon: '👨‍🔬', label: '黃光院士' },
                    { id: 'avatar_4', icon: '👩‍🔬', label: '材料博士' },
                    { id: 'avatar_5', icon: '🧑‍💻', label: '製程先鋒' },
                    { id: 'avatar_6', icon: '🤖', label: 'AI晶片狂' }
                  ]
                    .map(
                      (av) => `
                    <button
                      class="avatar-card p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedAvatar === av.id
                          ? 'border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-500/30 scale-105'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                      }"
                      data-avatar-id="${av.id}"
                    >
                      <span class="text-2xl">${av.icon}</span>
                      <span class="text-[10px] text-slate-300">${av.label}</span>
                    </button>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <!-- 開局資本與無塵室起點 -->
              <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <div>
                  初始啟動資金：<span class="text-amber-400 font-bold font-mono">NT$ 50,000,000</span>
                </div>
                <div>
                  初始潔淨室：<span class="text-emerald-400 font-bold">Class 10000 (Bay 1)</span>
                </div>
              </div>
            </div>

            <!-- 確認按鈕 -->
            <div class="mt-6 flex justify-end">
              <button id="btn-submit-foundry" class="btn-sci-fi px-6 py-2.5 text-sm w-full justify-center bg-cyan-600 hover:bg-cyan-500 font-bold tracking-wider">
                🚀 成立晶圓廠，締造矽島傳奇！
              </button>
            </div>
          </div>
        </div>
      `;

      // 綁定事件
      document.getElementById('btn-random-company')?.addEventListener('click', () => {
        SoundEffects.playClick();
        const rand = this.RANDOM_COMPANIES[Math.floor(Math.random() * this.RANDOM_COMPANIES.length)];
        const input = document.getElementById('setup-company-name') as HTMLInputElement;
        if (input) input.value = rand;
      });

      document.getElementById('btn-random-ceo')?.addEventListener('click', () => {
        SoundEffects.playClick();
        const rand = this.RANDOM_CEOS[Math.floor(Math.random() * this.RANDOM_CEOS.length)];
        const input = document.getElementById('setup-ceo-name') as HTMLInputElement;
        if (input) input.value = rand;
      });

      document.querySelectorAll('.avatar-card').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          SoundEffects.playClick();
          const target = (e.currentTarget as HTMLElement).getAttribute('data-avatar-id');
          if (target) {
            selectedAvatar = target;
            render();
          }
        });
      });

      document.getElementById('btn-submit-foundry')?.addEventListener('click', () => {
        const companyInput = document.getElementById('setup-company-name') as HTMLInputElement;
        const ceoInput = document.getElementById('setup-ceo-name') as HTMLInputElement;

        const companyName = companyInput?.value.trim() || '矽島先進積體電路';
        const ceoName = ceoInput?.value.trim() || '張創辦人';

        state.player.companyName = companyName;
        state.player.ceoName = ceoName;
        state.player.avatarId = selectedAvatar;

        SoundEffects.playSuccess();
        container.innerHTML = '';
        onComplete(state.player);
      });
    };

    render();
  }
}
