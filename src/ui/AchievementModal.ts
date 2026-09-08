/**
 * AchievementModal.ts
 * 負責 16 項晶圓廠里程碑成就檢視、分類瀏覽、獎勵領取與 HUD 目標釘選
 */

import { SaveGameV2, AchievementItem } from '../types';
import { AchievementEngine } from '../engine/AchievementEngine';
import { SoundEffects } from '../audio/SoundEffects';
import { FinanceEngine } from '../engine/FinanceEngine';

export class AchievementModal {
  private static activeCategory: AchievementItem['category'] = 'onboarding';

  public static show(state: SaveGameV2, onUpdate: () => void): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    // 先跑一次即時狀態檢核，自動解鎖滿足條件的成就
    AchievementEngine.checkAchievements(state);

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

    const render = () => {
      const achievements = state.achievements;
      const filtered = achievements.filter((a) => a.category === this.activeCategory);

      const totalUnlocked = achievements.filter((a) => a.unlocked).length;
      const categories: { key: AchievementItem['category']; label: string; icon: string }[] = [
        { key: 'onboarding', label: '新手入門', icon: '🚀' },
        { key: 'process', label: '製程突破', icon: '🔬' },
        { key: 'operation', label: '廠務卓越', icon: '🛡️' },
        { key: 'yield', label: '品質良率', icon: '💎' }
      ];

      container.innerHTML = `
        <div id="modal-backdrop-achievements" class="modal-backdrop">
          <div class="modal-content glass-panel glass-panel-glow max-w-3xl text-slate-100 flex flex-col max-h-[88vh]">
            <!-- 頂部標題 -->
            <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700/60 flex-shrink-0">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏆</span>
                <div>
                  <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                    半導體傳奇成就榮譽榜
                    <span class="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 font-mono">
                      ${totalUnlocked}/16 已達成
                    </span>
                  </h3>
                  <p class="text-xs text-slate-400">
                    見證從微米接觸式微影到埃米 High-NA EUV 的矽島稱霸歷史！
                  </p>
                </div>
              </div>
              <button id="btn-close-achievements" class="text-slate-400 hover:text-white text-xl p-1 font-mono transition-colors">
                ✕
              </button>
            </div>

            <!-- Modal 可滾動主體 -->
            <div class="modal-body overflow-y-auto flex-1 py-4 pr-1 space-y-4">
              <!-- 分類標籤頁 (Tabs) -->
              <div class="flex gap-2">
                ${categories
                  .map(
                    (c) => `
                  <button
                    class="btn-tab px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      this.activeCategory === c.key
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }"
                    data-cat="${c.key}"
                  >
                    <span>${c.icon}</span>
                    <span>${c.label}</span>
                    <span class="text-[10px] font-mono opacity-80">
                      (${achievements.filter((a) => a.category === c.key && a.unlocked).length}/${
                        achievements.filter((a) => a.category === c.key).length
                      })
                    </span>
                  </button>
                `
                  )
                  .join('')}
              </div>

              <!-- 成就清單 -->
              <div class="space-y-3">
                ${filtered
                  .map(
                    (ach) => `
                  <div class="p-4 rounded-xl bg-slate-900/70 border ${
                    ach.unlocked
                      ? 'border-cyan-500/50 bg-cyan-950/20 shadow-md shadow-cyan-500/10'
                      : 'border-slate-800/80 opacity-65'
                  } flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3.5">
                      <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${
                        ach.unlocked
                          ? 'bg-cyan-950/80 border-cyan-400/60 shadow-inner'
                          : 'bg-slate-800/60 border-slate-700 text-slate-600'
                      }">
                        ${ach.unlocked ? '🎖️' : '🔒'}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold ${ach.unlocked ? 'text-slate-100' : 'text-slate-400'}">
                            ${ach.title}
                          </span>
                          ${
                            ach.unlocked
                              ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">已達成</span>'
                              : ''
                          }
                        </div>
                        <p class="text-xs text-slate-400 mt-1">${ach.description}</p>
                      </div>
                    </div>

                    <!-- 獎勵金與領取按鈕 -->
                    <div class="text-right flex flex-col items-end gap-1.5 min-w-[130px]">
                      <div class="text-xs font-bold font-mono text-amber-400">
                        +NT$ ${ach.rewardCash.toLocaleString()}
                      </div>
                      ${
                        ach.claimed
                          ? `<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">獎勵已領</span>`
                          : ach.unlocked
                          ? `<button class="btn-claim-ach btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3 font-bold" data-id="${ach.id}">
                              領取獎勵金
                            </button>`
                          : `<span class="text-xs text-slate-500 font-mono">條件未滿足</span>`
                      }
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- 底部固定操作欄 -->
            <div class="modal-footer flex items-center justify-between pt-3 border-t border-slate-700/60 flex-shrink-0">
              <span class="text-xs text-slate-400 font-mono">按 ESC 或點擊外部背景亦可返回</span>
              <button id="btn-return-achievements" class="btn-sci-fi px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700">
                ◀ 返回無塵室
              </button>
            </div>
          </div>
        </div>
      `;

      // 綁定事件
      document.getElementById('btn-close-achievements')?.addEventListener('click', closeModal);
      document.getElementById('btn-return-achievements')?.addEventListener('click', closeModal);

      document.getElementById('modal-backdrop-achievements')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      });

      document.querySelectorAll('.btn-tab').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          SoundEffects.playClick();
          const cat = (e.currentTarget as HTMLElement).getAttribute('data-cat') as AchievementItem['category'];
          if (cat) {
            this.activeCategory = cat;
            render();
          }
        });
      });

      document.querySelectorAll('.btn-claim-ach').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
          if (id) {
            const res = AchievementEngine.claimReward(state.achievements, id);
            if (res.success) {
              state.player.cash += res.cash;
              FinanceEngine.recordSubsidy(state, res.cash);
              SoundEffects.playCoin();
              render();
              onUpdate();
            }
          }
        });
      });
    };

    render();
  }
}
