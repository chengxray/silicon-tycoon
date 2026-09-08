/**
 * HRModal.ts
 * 負責半導體人才招募與人資管理中心：
 * 1. 招募四大職級工程師（初級、熟練、資深主任、研發大師 Fellow）
 * 2. 指派工程師進駐對應機台，提供動態 k1 調校與良率加成
 * 3. 廠務班別切換（兩班制省錢 vs 三班制解鎖 🛡️ TPM 24H 零故障在線維護）
 */

import { SaveGameV2, StaffData, StaffRank, MachineCategory, ShiftMode } from '../types';
import { SoundEffects } from '../audio/SoundEffects';
import { AchievementEngine } from '../engine/AchievementEngine';
import { MaintenanceEngine } from '../engine/MaintenanceEngine';

interface Candidate {
  id: string;
  name: string;
  rank: StaffRank;
  moduleSpecialty: MachineCategory;
  signingBonus: number;
  salary: number;
  description: string;
}

export class HRModal {
  private static activeTab: 'MARKET' | 'STAFF' = 'STAFF';
  private static candidates: Candidate[] = [];

  public static show(state: SaveGameV2, onUpdate: () => void): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    if (this.candidates.length === 0) {
      this.generateCandidates(state.player.foundryTier);
    }

    this.render(container, state, onUpdate);
  }

  private static generateCandidates(foundryTier: number): void {
    const surnames = ['林', '陳', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '洪', '郭'];
    const givenNames = ['冠宇', '家豪', '博智', '欣宜', '雅婷', '立群', '崇德', '柏翰', '建良', '哲瑋', '俊廷', '文傑'];
    const specialties: MachineCategory[] = ['LITHO', 'TRACK', 'FILM', 'ETCH', 'DIFF', 'CMP'];

    this.candidates = [];

    // 依世代產生合適的職等候選人
    for (let i = 0; i < 4; i++) {
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const given = givenNames[Math.floor(Math.random() * givenNames.length)];
      const spec = specialties[Math.floor(Math.random() * specialties.length)];

      let rank: StaffRank = 'Young Specialist';
      let signingBonus = 20_000;
      let salary = 45_000;
      let description = '專精基礎機台操作，磨損累積 -10%，微影 k1 -0.01。適合操作 Tier 1~2。';

      const roll = Math.random();
      if (foundryTier >= 5 && roll > 0.6) {
        rank = 'Fellow';
        signingBonus = 500_000;
        salary = 350_000;
        description = '頂級半導體物理泰斗，磨損累積 -80%，微影 k1 -0.06，良率 +15%，可抵銷先進製程視窗損失！';
      } else if (foundryTier >= 3 && roll > 0.4) {
        rank = 'Senior Engineer';
        signingBonus = 120_000;
        salary = 150_000;
        description = '多年產線調機權威，磨損累積 -50%，微影 k1 -0.04，良率 +10%。適合操作 Tier 3~5。';
      } else if (foundryTier >= 2 && roll > 0.3) {
        rank = 'Skilled Worker';
        signingBonus = 50_000;
        salary = 75_000;
        description = '熟練製程技師，磨損累積 -25%，微影 k1 -0.02，良率 +5%。適合操作 Tier 1~3。';
      }

      this.candidates.push({
        id: `CAN-${Date.now().toString(36).slice(-4)}-${i}`,
        name: `${surname}${given}`,
        rank,
        moduleSpecialty: spec,
        signingBonus,
        salary,
        description
      });
    }
  }

  private static render(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    const totalPayroll = state.staff.reduce((sum, s) => sum + s.salary, 0);
    const globalShift: ShiftMode = state.staff[0]?.shiftMode || 'THREE_SHIFT';

    container.innerHTML = `
      <div id="modal-backdrop-hr" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl flex-shrink-0">
                👥
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>半導體人才與廠務人資中心</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                    在職員工: ${state.staff.length} 人
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  配置專精工程師進駐機台，三班制維穩解鎖 🛡️ TPM 24H 零故障在線保證！
                </p>
              </div>
            </div>

            <button id="btn-close-hr" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉人資中心">
              ✕
            </button>
          </div>

          <!-- Shift & Payroll Banner -->
          <div class="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs flex-shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-slate-400">廠區輪班機制:</span>
              <button
                id="btn-toggle-shift"
                class="px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  globalShift === 'THREE_SHIFT'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                }"
                title="點擊切換兩班制/三班制"
              >
                <span>${globalShift === 'THREE_SHIFT' ? '🛡️ 三班制 (24H 在線 TPM 零故障)' : '⚡ 兩班制 (節省 33% 薪水，疲勞累積快)'}</span>
                <span class="text-[10px] underline">點擊切換</span>
              </button>
            </div>

            <div class="flex items-center gap-4">
              <div>
                <span class="text-slate-400">每月薪資總額: </span>
                <span class="font-mono font-bold text-amber-300">NT$ ${totalPayroll.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/40 px-6 pt-2 flex-shrink-0">
            <button
              id="tab-staff"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                this.activeTab === 'STAFF' ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }"
            >
              <span>🧑‍🔬 現役廠務工程師</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${state.staff.length}</span>
            </button>
            <button
              id="tab-market"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                this.activeTab === 'MARKET' ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }"
            >
              <span>🤝 人才招募市場</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-purple-400">${this.candidates.length}</span>
            </button>

            ${this.activeTab === 'MARKET' ? `
              <button id="btn-refresh-candidates" class="ml-auto btn-sci-fi text-[11px] py-1 px-3 my-1">
                🔄 刷新履歷池
              </button>
            ` : ''}
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.activeTab === 'STAFF'
              ? this.renderStaffTab(state)
              : this.renderMarketTab(state)
            }
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-hr" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, state, onUpdate);
  }

  private static renderStaffTab(state: SaveGameV2): string {
    if (state.staff.length === 0) {
      return `
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">👥</div>
          <p class="text-sm">廠內目前尚未招募任何工程師，請前往「人才招募市場」進行招聘！</p>
        </div>
      `;
    }

    return `
      <div class="space-y-3">
        ${state.staff.map((staff) => {
          const assignedMachine = state.machines.find(m => m.id === staff.assignedMachineId);
          
          // 檢查 TPM 與炸機風險
          let isTPMActive = false;
          let isExplosionRisk = false;

          if (assignedMachine) {
            isTPMActive = MaintenanceEngine.checkTPMConditions(assignedMachine, staff).isTPMActive;
            isExplosionRisk = MaintenanceEngine.checkExplosionRisk(assignedMachine, staff).hasRisk;
          }

          return `
            <div class="p-4 rounded-xl bg-slate-900/80 border ${isExplosionRisk ? 'border-red-600/60 bg-red-950/10' : (isTPMActive ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800')} flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <!-- Info -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                  🧑‍🔬
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">${staff.name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ${staff.rank}
                    </span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                      專長: ${staff.moduleSpecialty}
                    </span>
                  </div>

                  <div class="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>月薪: NT$ ${staff.salary.toLocaleString()}</span>
                    <span>|</span>
                    <span>疲勞度: ${Math.round(staff.fatigue)}%</span>
                  </div>
                </div>
              </div>

              <!-- Machine Assignment Dropdown -->
              <div class="flex flex-col gap-1 w-full md:w-64">
                <label class="text-[10px] text-slate-400">進駐機台指派:</label>
                <select class="select-machine select-sci-fi text-xs py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200" data-staff-id="${staff.id}">
                  <option value="">-- 未指派機台 (待命休假) --</option>
                  ${state.machines.map(m => `
                    <option value="${m.id}" ${staff.assignedMachineId === m.id ? 'selected' : ''}>
                      ${m.name} (${m.category} Tier ${m.tier})
                    </option>
                  `).join('')}
                </select>

                <!-- Badges -->
                ${isTPMActive ? `
                  <div class="text-[11px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                    <span>🛡️</span>
                    <span>TPM 24H 零故障在線維護保證中！</span>
                  </div>
                ` : ''}
                ${isExplosionRisk ? `
                  <div class="text-[11px] text-red-400 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                    <span>💥</span>
                    <span>越級操作！存在 25% 炸機風險！</span>
                  </div>
                ` : ''}
              </div>

              <!-- Actions -->
              <div>
                <button
                  class="btn-fire-staff px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors"
                  data-staff-id="${staff.id}"
                >
                  解雇資遣
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private static renderMarketTab(state: SaveGameV2): string {
    if (this.candidates.length === 0) {
      return `
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">💼</div>
          <p class="text-sm">目前市場暫無履歷，請點擊右上角「刷新履歷池」！</p>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${this.candidates.map((can, idx) => {
          const canAfford = state.player.cash >= can.signingBonus;

          return `
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl">
                    🧑‍💻
                  </div>
                  <div>
                    <div class="font-bold text-white text-sm">${can.name}</div>
                    <div class="text-[11px] text-purple-300 font-semibold font-mono">${can.rank}</div>
                  </div>
                </div>

                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  模組: ${can.moduleSpecialty}
                </span>
              </div>

              <div class="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                ${can.description}
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <div>
                  <div class="text-[10px] text-slate-400">簽約獎金 (一次性)</div>
                  <div class="font-mono font-bold text-amber-300">NT$ ${can.signingBonus.toLocaleString()}</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] text-slate-400">核定月薪</div>
                  <div class="font-mono font-semibold text-slate-200">NT$ ${can.salary.toLocaleString()} /月</div>
                </div>
              </div>

              <button
                class="btn-hire-candidate btn-sci-fi w-full justify-center text-xs py-2 ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}"
                data-index="${idx}"
                ${!canAfford ? 'disabled' : ''}
              >
                ${canAfford ? `🤝 簽約聘任 (支付 NT$ ${can.signingBonus.toLocaleString()})` : '資金不足以支付簽約金'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private static bindEvents(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
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

    // 關閉
    document.getElementById('btn-close-hr')?.addEventListener('click', closeModal);
    document.getElementById('btn-back-hr')?.addEventListener('click', closeModal);

    // 點擊背景關閉
    document.getElementById('modal-backdrop-hr')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-backdrop-hr')) {
        closeModal();
      }
    });

    // 分頁切換
    document.getElementById('tab-staff')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.activeTab = 'STAFF';
      this.render(container, state, onUpdate);
    });

    document.getElementById('tab-market')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.activeTab = 'MARKET';
      this.render(container, state, onUpdate);
    });

    // 刷新市場履歷
    document.getElementById('btn-refresh-candidates')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.generateCandidates(state.player.foundryTier);
      this.render(container, state, onUpdate);
    });

    // 班別切換 (兩班制 / 三班制)
    document.getElementById('btn-toggle-shift')?.addEventListener('click', () => {
      SoundEffects.playClick();
      const current = state.staff[0]?.shiftMode || 'THREE_SHIFT';
      const target: ShiftMode = current === 'THREE_SHIFT' ? 'TWO_SHIFT' : 'THREE_SHIFT';

      state.staff.forEach(s => {
        s.shiftMode = target;
        if (target === 'TWO_SHIFT') {
          s.salary = Math.round(s.salary * 0.67); // 兩班制省薪資
        } else {
          s.salary = Math.round(s.salary / 0.67); // 恢復全薪
        }
      });

      onUpdate();
      this.render(container, state, onUpdate);
    });

    // 簽約招聘
    container.querySelectorAll('.btn-hire-candidate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0', 10);
        const can = this.candidates[idx];
        if (!can) return;

        if (state.player.cash < can.signingBonus) {
          alert('資金不足，無法支付簽約獎金！');
          return;
        }

        // 扣款與入職員工
        state.player.cash -= can.signingBonus;
        SoundEffects.playCoinChime();

        const currentShift = state.staff[0]?.shiftMode || 'THREE_SHIFT';
        const newStaff: StaffData = {
          id: `STF-${Date.now().toString(36).toUpperCase().slice(-5)}`,
          name: can.name,
          rank: can.rank,
          moduleSpecialty: can.moduleSpecialty,
          fatigue: 20,
          shiftMode: currentShift,
          assignedMachineId: null,
          salary: can.salary
        };

        state.staff.push(newStaff);
        this.candidates.splice(idx, 1);

        // 成就檢核
        AchievementEngine.checkAchievements(state);

        onUpdate();
        this.activeTab = 'STAFF';
        this.render(container, state, onUpdate);
      });
    });

    // 指派機台下拉
    container.querySelectorAll('.select-machine').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const staffId = (e.currentTarget as HTMLElement).getAttribute('data-staff-id');
        const machineId = (e.currentTarget as HTMLSelectElement).value || null;
        const staff = state.staff.find(s => s.id === staffId);
        if (!staff) return;

        // 若該機台已指派其他員工，先行解綁
        if (machineId) {
          const oldStaff = state.staff.find(s => s.assignedMachineId === machineId && s.id !== staffId);
          if (oldStaff) oldStaff.assignedMachineId = null;
        }

        // 更新新指派
        staff.assignedMachineId = machineId;
        
        // 同步更新機台上的 assignedEngineerId
        state.machines.forEach(m => {
          if (m.id === machineId) {
            m.assignedEngineerId = staff.id;
          } else if (m.assignedEngineerId === staff.id) {
            m.assignedEngineerId = null;
          }
        });

        SoundEffects.playClick();
        AchievementEngine.checkAchievements(state);
        onUpdate();
        this.render(container, state, onUpdate);
      });
    });

    // 解雇
    container.querySelectorAll('.btn-fire-staff').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const staffId = (e.currentTarget as HTMLElement).getAttribute('data-staff-id');
        const staffIdx = state.staff.findIndex(s => s.id === staffId);
        if (staffIdx === -1) return;

        const staff = state.staff[staffIdx];
        if (!confirm(`確定要資遣工程師【${staff.name}】嗎？`)) {
          return;
        }

        // 解綁機台
        if (staff.assignedMachineId) {
          const machine = state.machines.find(m => m.id === staff.assignedMachineId);
          if (machine) machine.assignedEngineerId = null;
        }

        state.staff.splice(staffIdx, 1);
        SoundEffects.playClick();
        onUpdate();
        this.render(container, state, onUpdate);
      });
    });
  }
}
