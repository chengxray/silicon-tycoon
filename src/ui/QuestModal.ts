/**
 * QuestModal.ts
 * 負責每日 3 項適應世代任務、3/3 全勤特獎與每週 15 任務龍頭週大獎檢視與領取
 */

import { SaveGameV2 } from '../types';
import { QuestEngine } from '../engine/QuestEngine';
import { SoundEffects } from '../audio/SoundEffects';

export class QuestModal {
  public static show(state: SaveGameV2, onUpdate: () => void): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const render = () => {
      const qState = state.questState;
      const allDailyDone = QuestEngine.isAllDailyCompleted(qState);

      container.innerHTML = `
        <div id="modal-backdrop-quest" class="modal-backdrop">
          <div class="modal-content glass-panel glass-panel-glow max-w-2xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
            
            <!-- 標題 -->
            <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
              <div class="flex items-center gap-3">
                <span class="text-2xl">📋</span>
                <div>
                  <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
                    每日營運任務與產業龍頭週賞
                    <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono">
                      Tier ${state.player.foundryTier} 專屬適配
                    </span>
                  </h3>
                  <p class="text-xs text-slate-400">
                    每日 00:00 自動刷新任務目標，完成全勤特獎與每週 15 任務領取巨額補助金！
                  </p>
                </div>
              </div>
              <button id="btn-close-quests" class="text-slate-400 hover:text-white text-xl p-1 font-mono" title="關閉">
                ✕
              </button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
              <!-- 每日 3 任務清單 -->
              <div class="space-y-3">
                <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex justify-between">
                  <span>今日指派任務 (3項)：</span>
                  <span class="font-mono text-cyan-400">
                    ${qState.dailyQuests.filter((q) => q.completed).length}/3 已達成
                  </span>
                </div>

                ${qState.dailyQuests
                  .map((q) => {
                    const percent = Math.min(100, Math.round((q.currentValue / q.targetValue) * 100));
                    return `
                      <div class="p-3.5 rounded-xl bg-slate-900/70 border ${
                        q.completed ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-800'
                      } flex items-center justify-between gap-4">
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-slate-100">${q.title}</span>
                            ${
                              q.completed
                                ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300">已達成</span>'
                                : ''
                            }
                          </div>
                          <p class="text-xs text-slate-400 mt-0.5">${q.description}</p>
                          
                          <!-- 進度條 -->
                          <div class="flex items-center gap-2 mt-2">
                            <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div style="width: ${percent}%" class="h-full bg-cyan-400"></div>
                            </div>
                            <span class="text-[11px] font-mono text-slate-300">${q.currentValue}/${q.targetValue}</span>
                          </div>
                        </div>

                        <!-- 獎勵與按鈕 -->
                        <div class="text-right flex flex-col items-end gap-1.5 min-w-[120px]">
                          <div class="text-xs font-bold font-mono text-amber-400">
                            +NT$ ${q.rewardCash.toLocaleString()}
                          </div>
                          <div class="text-[10px] text-cyan-300">
                            商譽 +${q.rewardPopularity}
                          </div>

                          ${
                            q.claimed
                              ? `<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">已領取</span>`
                              : q.completed
                              ? `<button class="btn-claim-quest btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3" data-id="${q.id}">
                                  領取獎勵
                                </button>`
                              : `<button class="btn-sci-fi text-xs py-1 px-3 opacity-50 cursor-not-allowed" disabled>
                                  進行中
                                </button>`
                          }
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>

              <!-- 全勤特獎領取 -->
              <div class="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <span>🌟 今日 3/3 全勤特賞</span>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      巨額獎勵
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 mt-0.5">
                    完成今日全部 3 項任務，領取高額營運特別補助款！
                  </p>
                </div>

                ${
                  qState.allDailyClaimed
                    ? `<span class="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">今日已領</span>`
                    : allDailyDone
                    ? `<button id="btn-claim-all-daily" class="btn-sci-fi bg-amber-600 hover:bg-amber-500 text-xs py-1.5 px-4 font-bold shadow-lg shadow-amber-500/30">
                        領取全勤獎
                      </button>`
                    : `<span class="text-xs text-slate-500 font-mono">需完成 3/3</span>`
                }
              </div>

              <!-- 每週 15 任務大獎 -->
              <div class="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/40 flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <span>🏆 每週 15 任務龍頭週大獎</span>
                    <span class="text-xs font-mono text-purple-400">
                      (${qState.weeklyCompletedCount}/${qState.weeklyTarget})
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 mt-0.5">
                    一週內累計完成 15 次營運任務，領取海量現金補助與全廠客戶信任 Buff！
                  </p>
                </div>

                ${
                  qState.weeklyClaimed
                    ? `<span class="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">本週已領</span>`
                    : qState.weeklyCompletedCount >= qState.weeklyTarget
                    ? `<button id="btn-claim-weekly" class="btn-sci-fi bg-purple-600 hover:bg-purple-500 text-xs py-1.5 px-4 font-bold shadow-lg shadow-purple-500/30">
                        領取龍頭大獎
                      </button>`
                    : `<span class="text-xs text-slate-500 font-mono">還需 ${Math.max(0, qState.weeklyTarget - qState.weeklyCompletedCount)} 項</span>`
                }
              </div>
            </div>

            <!-- Footer with Return Button -->
            <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
              <button id="btn-back-quests" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
                ◀ 返回無塵室 (Back to Cleanroom)
              </button>
            </div>

          </div>
        </div>
      `;

      // 綁定事件
      const closeModal = () => {
        SoundEffects.playClick();
        container.innerHTML = '';
        window.removeEventListener('keydown', onKeyDown);
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };
      window.addEventListener('keydown', onKeyDown);

      document.getElementById('btn-close-quests')?.addEventListener('click', closeModal);
      document.getElementById('btn-back-quests')?.addEventListener('click', closeModal);

      document.getElementById('modal-backdrop-quest')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-backdrop-quest')) {
          closeModal();
        }
      });

      document.querySelectorAll('.btn-claim-quest').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
          if (id) {
            const res = QuestEngine.claimSingleQuest(state.questState, id);
            if (res.success) {
              state.player.cash += res.cash;
              state.player.popularity += res.popularity;
              SoundEffects.playCoin();
              render();
              onUpdate();
            }
          }
        });
      });

      document.getElementById('btn-claim-all-daily')?.addEventListener('click', () => {
        const res = QuestEngine.claimDailyAllClear(state.questState, state.player.foundryTier);
        if (res.success) {
          state.player.cash += res.cash;
          state.player.popularity += res.popularity;
          SoundEffects.playSuccess();
          render();
          onUpdate();
        }
      });

      document.getElementById('btn-claim-weekly')?.addEventListener('click', () => {
        const res = QuestEngine.claimWeeklyBounty(state.questState, state.player.foundryTier);
        if (res.success) {
          state.player.cash += res.cash;
          state.player.popularity += res.popularity;
          SoundEffects.playSuccess();
          render();
          onUpdate();
        }
      });
    };

    render();
  }
}
