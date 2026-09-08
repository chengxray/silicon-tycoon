/**
 * TutorialOverlay.ts
 * 負責手把手互動新手教學指引層：
 * 高亮引導遮罩、通俗製程科普卡片、開局 10µm【⏩ 免費跳過生產等待】按鈕，
 * 以及先進製程解鎖時的「混合微影分層教學模式」
 */

import { SaveGameV2 } from '../types';
import { SoundEffects } from '../audio/SoundEffects';
import { WaferMapModal } from './WaferMapModal';
import { ContractModal } from './ContractModal';

export class TutorialOverlay {
  private static currentStep = 0;
  private static totalSteps = 5;

  public static show(
    state: SaveGameV2,
    onUpdate: () => void,
    forceStep?: number
  ): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    if (forceStep !== undefined) {
      this.currentStep = forceStep;
    }

    this.render(container, state, onUpdate);
  }

  public static isCompleted(state?: SaveGameV2): boolean {
    if (state?.player?.tutorialCompleted !== undefined) {
      return state.player.tutorialCompleted;
    }
    if (state?.userId) {
      return localStorage.getItem(`silicon_tycoon_tutorial_completed_${state.userId}`) === 'true';
    }
    return false;
  }

  public static markCompleted(state?: SaveGameV2): void {
    if (state?.player) {
      state.player.tutorialCompleted = true;
    }
    if (state?.userId) {
      localStorage.setItem(`silicon_tycoon_tutorial_completed_${state.userId}`, 'true');
    }
    localStorage.setItem('silicon_tycoon_tutorial_completed', 'true');
  }

  private static render(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    const step = this.currentStep;

    const stepData = [
      {
        stepNum: 1,
        badge: '🚀 歡迎創辦人',
        title: '歡迎來到《Silicon Tycoon: 矽島霸權》',
        icon: '🏭',
        content: `
          <p class="leading-relaxed">
            您已正式就任這座 2.5D 晶圓代工廠的 CEO！半導體晶片是人類精密製造的皇冠，全廠由
            <strong class="text-cyan-400">薄膜 (FILM) → 微影 (LIT) → 蝕刻 (ETCH) → 擴散 (DIFF)</strong>
            等核心製程循環運轉。
          </p>
          <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div class="text-amber-300 font-semibold">💡 創辦人指引：</div>
            <div>• 點擊畫面上任意機台，可進入單機控制面板查看磨損、動態 $k_1$ 光學極限與 Track 並聯綁定。</div>
            <div>• 本教學將一步步引導您承接第一筆訂單、體驗極速跳過生產、檢查晶圓缺陷並自動化出貨！</div>
          </div>
        `,
        btnPrimaryText: '開始第一步：承接訂單 ➡️',
        btnPrimaryAction: 'next'
      },
      {
        stepNum: 2,
        badge: '📜 簽約接單',
        title: '合約看板與 NRE 光罩預付款',
        icon: '📋',
        content: `
          <p class="leading-relaxed">
            晶圓代工的第一步是接單！客戶會提供產品規格與技術節點。
            最棒的是，簽署合約時您將<strong class="text-emerald-400">立刻獲得全額 NRE 光罩開模研發預付款</strong>，充實您的流動現金！
          </p>
          <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div class="flex items-center justify-between text-slate-200 font-mono">
              <span>入門首選：</span>
              <span class="text-cyan-300 font-bold">10µm 經典雙極性電晶體</span>
            </div>
            <div>• 需求機台：Contact Aligner (接觸式微影機)</div>
            <div>• 簽約後，晶圓盒 (Lot) 將自動進入潔淨室開始加工！</div>
          </div>
        `,
        btnPrimaryText: '打開合約看板 📜',
        btnPrimaryAction: 'open_contract'
      },
      {
        stepNum: 3,
        badge: '⚡ 生產加速特權',
        title: '產線加工與【⏩ 免費跳過等待】',
        icon: '⏩',
        content: `
          <p class="leading-relaxed">
            晶圓在無塵室依序經過機台加工。在常規運營下，每道站點需時數秒，並受 Q-Time 嚴格約束（超時會扣良率或需光阻重洗 Rework）。
          </p>
          <div class="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/50 space-y-2 text-center">
            <div class="text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5">
              <span>✨</span>
              <span>新手教學專屬特權：免等待直通完工</span>
              <span>✨</span>
            </div>
            <p class="text-[11px] text-slate-300">
              點擊下方高亮按鈕，系統將運用量子加速直接將當前在製晶圓推向完工並結算良率！
            </p>
            <button id="btn-tutorial-skip-production" class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all">
              <span>⏩</span>
              <span>立即【免費跳過生產等待】直通完工</span>
            </button>
          </div>
        `,
        btnPrimaryText: '跳過等待並前進下一步 ➡️',
        btnPrimaryAction: 'next'
      },
      {
        stepNum: 4,
        badge: '🔍 品質把關',
        title: '蒙地卡羅 25 晶粒良率圖 (Wafer Map)',
        icon: '💿',
        content: `
          <p class="leading-relaxed">
            晶圓加工完畢後，每一顆晶粒 (Die) 的良率皆由蒙地卡羅物理模擬生成！
            受同心圓幾何效應影響，<strong class="text-emerald-400">晶圓中心良率最高 (1.1x)</strong>，邊緣較易出現散焦與缺陷。
          </p>
          <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div class="text-cyan-300 font-semibold">晶圓圖三大檢測指標：</div>
            <div>• <strong class="text-red-400">OPTICAL_DEFOCUS</strong>：微影焦平面像差與邊緣散焦</div>
            <div>• <strong class="text-amber-400">PARTICLE</strong>：潔淨室微塵落塵污染（提升 Class 等級可改善）</div>
            <div>• <strong class="text-purple-400">CLUSTER</strong>：化學蝕刻不均引發之群聚缺陷</div>
          </div>
        `,
        btnPrimaryText: '打開晶圓良率圖 🔍',
        btnPrimaryAction: 'open_wafer_map'
      },
      {
        stepNum: 5,
        badge: '🏆 營運進階',
        title: '出貨收款與 MES 自動化運營',
        icon: '🤖',
        content: `
          <p class="leading-relaxed">
            恭喜您已完整掌握晶圓代工的核心循環！在合約板中結算出貨後，海量尾款將全額入帳，商譽 (Popularity) 亦會同步躍升！
          </p>
          <div class="p-3 rounded-lg bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-300 space-y-2">
            <div class="flex items-center gap-2 text-emerald-300 font-bold">
              <span>🤖</span>
              <span>無人化工廠秘訣：開啟 MES 自動派工</span>
            </div>
            <p>
              點擊頂部導航列的【🤖 MES 自動】開關，日後所有加工完成的晶圓將由製造執行系統自動出貨收款，無需手動點擊結算！
            </p>
          </div>
        `,
        btnPrimaryText: '🎉 完成新手引導，稱霸矽島！',
        btnPrimaryAction: 'finish'
      }
    ];

    const cur = stepData[step] || stepData[0];

    container.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-xl text-slate-100 flex flex-col relative animate-fade-in">
          
          <!-- Close button -->
          <button id="btn-close-tutorial" class="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-lg" title="跳過教學">
            ✕
          </button>

          <!-- Step Badge & Header -->
          <div class="flex items-center gap-3 pb-3 border-b border-slate-700/70">
            <div class="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-inner">
              ${cur.icon}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  ${cur.badge}
                </span>
                <span class="text-xs text-slate-400 font-mono">
                  步驟 ${cur.stepNum} / ${this.totalSteps}
                </span>
              </div>
              <h3 class="text-base font-bold text-white tracking-wide mt-0.5">
                ${cur.title}
              </h3>
            </div>
          </div>

          <!-- Step Progress Dots -->
          <div class="flex items-center justify-center gap-2 py-3">
            ${stepData.map((_, i) => `
              <div class="h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-cyan-400' : (i < step ? 'w-3 bg-emerald-400' : 'w-3 bg-slate-700')}"></div>
            `).join('')}
          </div>

          <!-- Step Content Body -->
          <div class="modal-body text-xs text-slate-300 space-y-3 pb-4 max-h-[60vh] overflow-y-auto pr-1">
            ${cur.content}
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
            <button id="btn-skip-tutorial-all" class="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              跳過全部教學
            </button>

            <div class="flex items-center gap-2">
              ${step > 0 ? `
                <button id="btn-tutorial-prev" class="btn-sci-fi text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300">
                  上一步
                </button>
              ` : ''}

              <button id="btn-tutorial-action" class="btn-sci-fi text-xs py-1.5 px-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-900/40">
                ${cur.btnPrimaryText}
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, state, onUpdate, cur.btnPrimaryAction);
  }

  private static bindEvents(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void,
    action: string
  ): void {
    const close = () => {
      SoundEffects.playClick();
      container.innerHTML = '';
      TutorialOverlay.markCompleted(state);
      onUpdate();
    };

    document.getElementById('btn-close-tutorial')?.addEventListener('click', close);
    document.getElementById('btn-skip-tutorial-all')?.addEventListener('click', close);

    // Backdrop click
    const backdrop = container.querySelector('.modal-backdrop');
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        close();
      }
    });

    // 上一步
    document.getElementById('btn-tutorial-prev')?.addEventListener('click', () => {
      SoundEffects.playClick();
      this.currentStep = Math.max(0, this.currentStep - 1);
      this.render(container, state, onUpdate);
    });

    // 免費跳過生產等待專屬按鈕
    document.getElementById('btn-tutorial-skip-production')?.addEventListener('click', () => {
      SoundEffects.playFanfare();

      // 檢查是否有正在生產的 Lot，將其推進至完工
      if (state.activeLots.length > 0) {
        for (const lot of state.activeLots) {
          lot.currentStation = 'DIFF';
          lot.status = 'COMPLETED';
          lot.yieldMultiplier = 0.96;
        }
      } else {
        // 若玩家尚未投片，自動建立一盒完工晶圓盒供體驗
        const starterOrderId = state.activeOrders.length > 0 ? state.activeOrders[0].id : 'starter_demo';
        state.activeLots.push({
          lotId: `LOT-${Date.now().toString().slice(-4)}`,
          orderId: starterOrderId,
          waferCount: 25,
          currentStation: 'DIFF',
          currentLayer: 3,
          totalLayers: 3,
          qTimeDeadline: null,
          yieldMultiplier: 0.95,
          status: 'COMPLETED'
        });
      }

      onUpdate();

      // 自動推進至晶圓圖步驟
      this.currentStep = 3;
      this.render(container, state, onUpdate);
    });

    // 主行動按鈕
    document.getElementById('btn-tutorial-action')?.addEventListener('click', () => {
      SoundEffects.playClick();

      if (action === 'next') {
        this.currentStep = Math.min(this.totalSteps - 1, this.currentStep + 1);
        this.render(container, state, onUpdate);
      } else if (action === 'open_contract') {
        container.innerHTML = '';
        ContractModal.show(state, () => onUpdate());
      } else if (action === 'open_wafer_map') {
        container.innerHTML = '';
        WaferMapModal.show(state, null, () => onUpdate());
      } else if (action === 'finish') {
        TutorialOverlay.markCompleted(state);
        SoundEffects.playFanfare();
        container.innerHTML = '';
        onUpdate();
      }
    });
  }
}

