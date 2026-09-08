/**
 * StoreModal.ts
 * 負責機台設備採購中心與廠內機台資產管理：
 * 1. 6 大站點設備分類採購（含獨立解耦之 Track 塗膠顯影分頁，支援並聯突破微影瓶頸）
 * 2. 設備詳細規格、Rayleigh 極限 CD、產能（晶圓/分）與 ℹ️ 科普原理介紹
 * 3. 廠內現有設備檢視、就地大修保養（Overhaul 歸零磨損）與報廢變賣
 */

import { SaveGameV2, MachineCategory, MachineData } from '../types';
import { ASSET_REGISTRY } from '../services/AssetRegistry';
import { SoundEffects } from '../audio/SoundEffects';
import { AchievementEngine } from '../engine/AchievementEngine';
import { FinanceEngine } from '../engine/FinanceEngine';

export interface StoreEquipmentItem {
  modelId: string;
  name: string;
  category: MachineCategory;
  tier: number;
  price: number;
  throughputWpm: number;
  rayleighLimitNm?: number;
  description: string;
  scienceNote: string;
  assetPath: string;
}

export class StoreModal {
  private static activeCategory: MachineCategory | 'FLEET' = 'LITHO';

  // 完整半導體機台採購型錄
  public static readonly STORE_CATALOG: StoreEquipmentItem[] = [
    // 1. LITHO 微影機台 (曝光微影巨獸)
    {
      modelId: 'litho_contact',
      name: 'Contact Aligner (接觸式微影機)',
      category: 'LITHO',
      tier: 1,
      price: 2_500_000,
      throughputWpm: 10,
      rayleighLimitNm: 3007,
      description: '半導體萌芽期主力，光罩物理緊貼晶圓表面進行紫外曝光，維修容易。',
      scienceNote: '利用汞燈紫外混光 (436nm) 貼合曝光。因光罩直接碰觸晶圓表面，容易刮傷光罩與產生落塵，極限線寬約 3µm。',
      assetPath: ASSET_REGISTRY.machines.litho_contact.path
    },
    {
      modelId: 'litho_projection',
      name: '1x Projection Aligner (1:1 投影曝光機)',
      category: 'LITHO',
      tier: 1,
      price: 6_000_000,
      throughputWpm: 15,
      rayleighLimitNm: 1798,
      description: '反射鏡等倍投影微影，光罩懸空不接觸晶圓，徹底終結光罩刮傷磨損。',
      scienceNote: 'Perkin-Elmer 經典反射光學系統，以凹面鏡聚焦達成 1:1 無接觸曝光，大幅提升光罩壽命與開局良率。',
      assetPath: ASSET_REGISTRY.machines.litho_projection.path
    },
    {
      modelId: 'litho_gline',
      name: 'G-Line Stepper (步進縮小曝光機)',
      category: 'LITHO',
      tier: 2,
      price: 18_000_000,
      throughputWpm: 25,
      rayleighLimitNm: 997,
      description: '4:1 縮小投影透鏡，逐區步進曝光（Step-and-Repeat），進入 1µm 時代。',
      scienceNote: '高壓汞燈 g-line (436nm) 搭配數值孔徑 NA=0.35 之複合縮小透鏡，將光罩圖案縮小 4 倍投射，突破微米大關。',
      assetPath: ASSET_REGISTRY.machines.litho_gline.path
    },
    {
      modelId: 'litho_iline',
      name: 'I-Line Stepper (高壓汞燈微影機)',
      category: 'LITHO',
      tier: 3,
      price: 35_000_000,
      throughputWpm: 55,
      rayleighLimitNm: 584,
      description: '次微米時代霸主，波長 365nm，支援精密對準與多層金屬互連製程。',
      scienceNote: '採用更短波長之高強度汞燈 i-line (365nm) 與 NA=0.50 鏡頭，成功壓制繞射效應，可清晰成像至 500nm。',
      assetPath: ASSET_REGISTRY.machines.litho_iline.path
    },
    {
      modelId: 'litho_krf',
      name: 'KrF DUV Scanner (準分子雷射微影機)',
      category: 'LITHO',
      tier: 4,
      price: 85_000_000,
      throughputWpm: 120,
      rayleighLimitNm: 283,
      description: '深紫外光 (DUV) 準分子雷射，邁入動態連續掃描曝光 (Step-and-Scan)。',
      scienceNote: '248nm 氟化氪 (KrF) 準分子雷射光源，必須搭配化學增幅光阻 (CAR) 放大光化學反應，支援 0.25µm 製程。',
      assetPath: ASSET_REGISTRY.machines.litho_krf.path
    },
    {
      modelId: 'litho_arfdry',
      name: 'ArF Dry Scanner (氟化氬乾式微影機)',
      category: 'LITHO',
      tier: 4,
      price: 180_000_000,
      throughputWpm: 120,
      rayleighLimitNm: 182,
      description: '193nm 紫外雷射，將大氣乾式微影發揮至極致，跨越次百奈米門檻。',
      scienceNote: '利用 193nm 氟化氬雷射與高折射石英透鏡群，是半導體製程縮小至 90nm/65nm 的核心關鍵機台。',
      assetPath: ASSET_REGISTRY.machines.litho_arfdry.path
    },
    {
      modelId: 'litho_arfi',
      name: 'ArFi Immersion TWINSCAN (浸潤式微影機)',
      category: 'LITHO',
      tier: 5,
      price: 450_000_000,
      throughputWpm: 260,
      rayleighLimitNm: 114,
      description: '鏡頭與晶圓間注入超純水折射光線，雙工件台磁浮掃描，大氣產速最快！',
      scienceNote: '林本堅博士提出之革命性技術：利用水之折射率 n=1.44 巧妙將等效數值孔徑提升至 NA=1.35，多重曝光下推進至 7nm！',
      assetPath: ASSET_REGISTRY.machines.litho_arfi.path
    },
    {
      modelId: 'litho_euv',
      name: 'EUV Scanner (極紫外光微影巨獸)',
      category: 'LITHO',
      tier: 6,
      price: 2_500_000_000,
      throughputWpm: 180,
      rayleighLimitNm: 33,
      description: '13.5nm 極紫外光，全真空反射鏡系統，單次曝光推進 7nm/5nm/3nm！',
      scienceNote: '以高功率二氧化碳雷射轟擊融熔錫滴激發電漿，產生 13.5nm EUV 光子，全機在超高真空運行，受抽真空限制產能為 180 片/分。',
      assetPath: ASSET_REGISTRY.machines.litho_euv.path
    },
    {
      modelId: 'litho_highna',
      name: 'High-NA EUV (高數值孔徑次世代巨獸)',
      category: 'LITHO',
      tier: 6,
      price: 6_000_000_000,
      throughputWpm: 180,
      rayleighLimitNm: 20,
      description: '0.55 NA 變形數值孔徑透鏡，埃米世代霸主，稱霸矽島之終極神兵。',
      scienceNote: '採用變形鏡頭 (Anamorphic Optics)，X/Y 軸非對稱倍率，單次曝光極限線寬可達 20nm 以下，引領 2nm 埃米時代。',
      assetPath: ASSET_REGISTRY.machines.litho_highna.path
    },

    // 2. TRACK 塗膠顯影機 (解耦獨立，微影站的先天物理瓶頸！)
    {
      modelId: 'track_manual',
      name: '手動旋塗熱板台 (Manual Spin & Bake)',
      category: 'TRACK',
      tier: 1,
      price: 800_000,
      throughputWpm: 6,
      description: '⚠️ 開局先天產能瓶頸！人工滴膠手動離心旋塗與熱板預烤，產能僅 6 片/分。',
      scienceNote: '利用真空吸盤固定晶圓，手動注射光阻後以 3000 RPM 高速旋轉甩出均勻薄膜，再由人員夾入熱板烘烤。',
      assetPath: ASSET_REGISTRY.machines.track_manual.path
    },
    {
      modelId: 'track_single',
      name: '單軌自動塗膠顯影機 (Single Track)',
      category: 'TRACK',
      tier: 2,
      price: 4_500_000,
      throughputWpm: 16,
      description: '初步自動化旋轉塗膠與自動烘烤模組，大幅減少人工操作失誤。',
      scienceNote: '機械手臂自動傳送晶圓至旋塗杯，自動注膠均勻成膜，並整合冷卻板 (Chill Plate) 精確控制膜厚。',
      assetPath: ASSET_REGISTRY.machines.track_single.path
    },
    {
      modelId: 'track_dual',
      name: '雙軌連線 Track (Dual Track)',
      category: 'TRACK',
      tier: 3,
      price: 12_000_000,
      throughputWpm: 35,
      description: '雙獨立機械臂分開處理塗膠與顯影，有效提升次微米連線吞吐量。',
      scienceNote: '將塗膠旋塗單元 (Coater) 與顯影槽 (Developer) 實體隔離，避免顯影鹼液氣體污染光阻，保障微影良率。',
      assetPath: ASSET_REGISTRY.machines.track_dual.path
    },
    {
      modelId: 'track_clean',
      name: '多工位精密 Clean Track',
      category: 'TRACK',
      tier: 4,
      price: 30_000_000,
      throughputWpm: 75,
      description: '多旋塗室並聯，高速熱板陣列，建議為先進微影機配備 2 台以上！',
      scienceNote: '配置多組 Coater/Developer 模組與快速溫控熱板，支援化學增幅光阻嚴苛的曝光後烘烤 (PEB) 溫度控制。',
      assetPath: ASSET_REGISTRY.machines.track_clean.path
    },
    {
      modelId: 'track_advanced',
      name: '先進極限分子級 Track',
      category: 'TRACK',
      tier: 6,
      price: 250_000_000,
      throughputWpm: 160,
      description: '分子級膜厚控制，完美適配 EUV 超薄金屬氧化物光阻 (MOR)。',
      scienceNote: '具備超微量旋塗技術與化學氣相沉積底膜 (Underlayer)，將光阻粗糙度 (LWR) 降至分子級極限。',
      assetPath: ASSET_REGISTRY.machines.track_advanced.path
    },

    // 3. FILM 薄膜生長設備
    {
      modelId: 'film_furnace',
      name: '高溫熱氧化爐管 (Horizontal Furnace)',
      category: 'FILM',
      tier: 1,
      price: 1_800_000,
      throughputWpm: 12,
      description: '利用 1000°C 高溫水汽使矽表面長出堅硬均勻的二氧化矽 (SiO2) 絕緣保護層。',
      scienceNote: '利用高純度氧氣或水蒸氣在高溫下與矽晶圓反應：Si + O2 -> SiO2，生長厚度均勻的高品質絕緣氧化層。',
      assetPath: ASSET_REGISTRY.machines.film_furnace.path
    },
    {
      modelId: 'film_pecvd',
      name: '電漿增強化學氣相沉積機 (PECVD / ALD)',
      category: 'FILM',
      tier: 4,
      price: 25_000_000,
      throughputWpm: 110,
      description: '利用電漿在低溫下快速沉積氮化矽、金屬介電質，並支援原子層沉積 (ALD)。',
      scienceNote: '以射頻電漿解離前驅氣體，可在較低溫度 (300°C) 下沉積薄膜，避免破壞底層已摻雜之電晶體結構。',
      assetPath: ASSET_REGISTRY.machines.film_pecvd.path
    },

    // 4. ETCH 蝕刻製程設備
    {
      modelId: 'etch_wet',
      name: '濕式酸槽清洗台 (Wet Chemical Bench)',
      category: 'ETCH',
      tier: 1,
      price: 1_500_000,
      throughputWpm: 12,
      description: '利用氫氟酸 (HF) 與化學酸液浸泡溶解未受光阻保護之薄膜，等向性腐蝕。',
      scienceNote: '化學濕法腐蝕屬於等向性蝕刻 (Isotropic)，容易產生側向掏空 (Undercut)，適合 3µm 以上粗線寬。',
      assetPath: ASSET_REGISTRY.machines.etch_wet.path
    },
    {
      modelId: 'etch_plasma',
      name: '電漿乾式蝕刻機 (RIE / ICP-RIE)',
      category: 'ETCH',
      tier: 3,
      price: 28_000_000,
      throughputWpm: 50,
      description: '以高能反應離子轟擊進行垂直非等向性蝕刻，線條邊緣垂直銳利！',
      scienceNote: '反應性離子蝕刻 (RIE) 結合物理離子轟擊與化學自由基反應，具備極高垂直各向異性 (Anisotropic)，是次微米微影的關鍵搭檔。',
      assetPath: ASSET_REGISTRY.machines.etch_plasma.path
    },

    // 5. DIFF 擴散與離子植入設備
    {
      modelId: 'diff_furnace',
      name: '熱擴散摻雜爐管 (Thermal Diffusion)',
      category: 'DIFF',
      tier: 1,
      price: 2_000_000,
      throughputWpm: 10,
      description: '將磷或硼蒸氣高溫擴散滲透進矽晶格中，形成 N 型與 P 型半導體通道。',
      scienceNote: '利用高溫晶格熱運動使雜質原子由高濃度向低濃度擴散，控溫容易但橫向擴散量大。',
      assetPath: ASSET_REGISTRY.machines.diff_furnace.path
    },
    {
      modelId: 'diff_implanter',
      name: '大束流離子佈植機 (Ion Implanter)',
      category: 'DIFF',
      tier: 2,
      price: 15_000_000,
      throughputWpm: 20,
      description: '將雜質原子電離成高能離子束，如子彈般精確轟擊打入矽晶圓特定深度。',
      scienceNote: '高壓電場加速磷/砷/硼離子束，可獨立精確控制植入劑量與深度，無橫向擴散失真，是現代電晶體的核心技術。',
      assetPath: ASSET_REGISTRY.machines.diff_implanter.path
    },

    // 6. CMP 化學機械研磨機 (Tier 3 解鎖)
    {
      modelId: 'cmp_polisher',
      name: '化學機械平坦化研磨機 (CMP Polisher)',
      category: 'CMP',
      tier: 3,
      price: 20_000_000,
      throughputWpm: 40,
      description: '化學研磨液搭配高速研磨墊，將晶圓表面磨至分子級平坦，解鎖多層金屬佈線！',
      scienceNote: '利用研磨液 (Slurry) 的化學腐蝕軟化與奈米磨料的機械研磨，實現全晶圓奈米級全域平坦化 (Global Planarization)。',
      assetPath: ASSET_REGISTRY.machines.cmp_polisher.path
    }
  ];

  public static show(state: SaveGameV2, onUpdate: () => void): void {
    const container = document.getElementById('modal-container');
    if (!container) return;

    this.render(container, state, onUpdate);
  }

  private static render(
    container: HTMLElement,
    state: SaveGameV2,
    onUpdate: () => void
  ): void {
    const categories: { key: MachineCategory | 'FLEET'; label: string; icon: string }[] = [
      { key: 'LITHO', label: 'LITHO 微影機', icon: '🔦' },
      { key: 'TRACK', label: 'TRACK 塗膠顯影 (瓶頸)', icon: '🌀' },
      { key: 'FILM', label: 'FILM 薄膜成長', icon: '✨' },
      { key: 'ETCH', label: 'ETCH 蝕刻製程', icon: '⚡' },
      { key: 'DIFF', label: 'DIFF 擴散植入', icon: '🎯' },
      { key: 'CMP', label: 'CMP 平坦研磨', icon: '💿' },
      { key: 'FLEET', label: '廠內現役機台 (' + state.machines.length + ')', icon: '🏭' }
    ];

    container.innerHTML = `
      <div id="modal-backdrop-store" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-5xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl flex-shrink-0">
                🏭
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>半導體設備採購與廠務商城</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                    目前資金: NT$ ${Math.round(state.player.cash).toLocaleString()}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  購置先進製程設備，並聯 Track 消除微影瓶頸，持續大修維持在線妥善率！
                </p>
              </div>
            </div>

            <button id="btn-close-store" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉商城">
              ✕
            </button>
          </div>

          <!-- Category Nav Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/40 px-6 pt-2 overflow-x-auto gap-1 flex-shrink-0">
            ${categories.map(cat => {
              const isActive = this.activeCategory === cat.key;
              const isCmpLocked = cat.key === 'CMP' && !state.unlockedFeatures.cmp;
              return `
                <button
                  class="btn-store-tab px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                  } ${isCmpLocked ? 'opacity-50' : ''}"
                  data-cat="${cat.key}"
                >
                  <span>${cat.icon}</span>
                  <span>${cat.label}</span>
                  ${isCmpLocked ? '<span class="text-[10px] text-amber-500 font-mono">(Tier 3解鎖)</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Body Content -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.activeCategory === 'FLEET'
              ? this.renderFleetTab(state)
              : this.renderCatalogTab(state)
            }
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-store" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, state, onUpdate);
  }

  private static renderCatalogTab(state: SaveGameV2): string {
    const items = this.STORE_CATALOG.filter(item => item.category === this.activeCategory);

    return `
      ${this.activeCategory === 'TRACK' ? `
        <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-600/30 text-xs text-amber-200 flex items-start gap-2.5">
          <span class="text-base">💡</span>
          <div>
            <span class="font-bold">物理限制理論 (TOC) 戰略提示：</span>
            每片晶圓在微影站必須進出 Track 兩次 (旋塗光阻 + 曝光後顯影)！單台 Track 的負荷是曝光機的 2 倍。
            建議為 1 台先進微影機並聯配套 2~3 台 Track 機台，徹底釋放產能！
          </div>
        </div>
      ` : ''}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${items.map((item, idx) => {
          const isUnlocked = state.player.foundryTier >= item.tier;
          const canAfford = state.player.cash >= item.price;
          const isCmpLocked = item.category === 'CMP' && !state.unlockedFeatures.cmp;

          return `
            <div class="p-4 rounded-xl bg-slate-900/80 border ${isUnlocked ? 'border-slate-800 hover:border-amber-500/40' : 'border-slate-800/40 opacity-70'} transition-all flex flex-col justify-between space-y-3">
              
              <div class="flex items-start gap-3">
                <div class="store-thumb-box machine-card-thumb w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden relative group">
                  <img src="${item.assetPath}" alt="${item.name}" class="w-full h-full object-contain filter drop-shadow" style="max-width: 56px; max-height: 56px;" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <h4 class="font-bold text-white text-sm truncate">${item.name}</h4>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${isUnlocked ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}">
                      Tier ${item.tier}
                    </span>
                  </div>

                  <div class="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    ${item.description}
                  </div>
                </div>
              </div>

              <!-- Specs Grid -->
              <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <div class="text-[10px] text-slate-400">標準吞吐量</div>
                  <div class="font-mono font-semibold text-cyan-300">${item.throughputWpm} 晶圓/分</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">${item.rayleighLimitNm ? 'Rayleigh 極限 CD' : '設備分類'}</div>
                  <div class="font-mono font-semibold text-emerald-400">${item.rayleighLimitNm ? item.rayleighLimitNm + ' nm' : item.category}</div>
                </div>
                <div class="col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span class="text-[10px] text-slate-400">採購單價</span>
                  <span class="font-mono font-bold text-amber-300 text-sm">NT$ ${item.price.toLocaleString()}</span>
                </div>
              </div>

              <!-- Science Info & Buy Button -->
              <div class="flex items-center gap-2">
                <button
                  class="btn-sci-info px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  data-index="${idx}"
                  title="查看半導體科普原理解析"
                >
                  <span>ℹ️</span>
                  <span>原理</span>
                </button>

                <button
                  class="btn-buy-equipment flex-1 btn-sci-fi justify-center text-xs py-2 ${(!isUnlocked || !canAfford || isCmpLocked) ? 'opacity-50 cursor-not-allowed' : ''}"
                  data-model-id="${item.modelId}"
                  ${(!isUnlocked || !canAfford || isCmpLocked) ? 'disabled' : ''}
                >
                  ${!isUnlocked
                    ? `🔒 需達到 Tier ${item.tier}`
                    : (isCmpLocked
                      ? '🔒 CMP 科技未解鎖'
                      : (!canAfford ? '資金不足' : '🛒 採購並安裝至廠房'))}
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private static renderFleetTab(state: SaveGameV2): string {
    if (state.machines.length === 0) {
      return `
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">🏭</div>
          <p class="text-sm">廠內目前尚未安裝任何機台，請前往各站點選購！</p>
        </div>
      `;
    }

    return `
      <div class="space-y-3">
        ${state.machines.map(m => {
          const spec = this.STORE_CATALOG.find(c => c.modelId === m.modelId);
          const overhaulCost = Math.round((spec ? spec.price : 2_000_000) * 0.15);
          const resellPrice = Math.round((spec ? spec.price : 2_000_000) * 0.40);
          const wearInt = Math.round(m.wear);

          let statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">閒置 (IDLE)</span>`;
          if (m.status === 'PROCESSING') {
            statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">加工中</span>`;
          } else if (m.status === 'MAINTENANCE') {
            statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">🛠️ 維護中</span>`;
          } else if (m.status === 'EXPLODED') {
            statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold animate-bounce">💥 腔體炸毀</span>`;
          }

          return `
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="store-thumb-box machine-card-thumb w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                  <img src="${spec ? spec.assetPath : ASSET_REGISTRY.machines.litho_contact.path}" alt="${m.name}" class="w-full h-full object-contain" style="max-width: 44px; max-height: 44px;" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${m.name}</span>
                    ${statusBadge}
                  </div>
                  <div class="text-xs text-slate-400 font-mono mt-0.5">
                    ID: ${m.id} | 座標: (${m.gridX}, ${m.gridY}) | 站點: ${m.category}
                  </div>
                </div>
              </div>

              <!-- Wear & Status -->
              <div class="w-full md:w-48 space-y-1">
                <div class="flex justify-between text-xs font-mono">
                  <span class="text-slate-400">機台磨損度</span>
                  <span class="${wearInt > 70 ? 'text-red-400 font-bold' : (wearInt > 40 ? 'text-amber-400' : 'text-emerald-400')}">${wearInt}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div class="h-full ${wearInt > 70 ? 'bg-red-500' : (wearInt > 40 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${wearInt}%;"></div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  class="btn-overhaul btn-sci-fi text-xs py-1.5 px-3 bg-cyan-700/80 hover:bg-cyan-600"
                  data-machine-id="${m.id}"
                  data-cost="${overhaulCost}"
                  ${state.player.cash < overhaulCost || m.wear <= 5 ? 'disabled' : ''}
                >
                  🛠️ 就地大修 (NT$ ${overhaulCost.toLocaleString()})
                </button>

                <button
                  class="btn-decommission px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors"
                  data-machine-id="${m.id}"
                  data-refund="${resellPrice}"
                >
                  ♻️ 報廢變賣 (+NT$ ${resellPrice.toLocaleString()})
                </button>
              </div>
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
    document.getElementById('btn-close-store')?.addEventListener('click', closeModal);
    document.getElementById('btn-back-store')?.addEventListener('click', closeModal);

    // 點擊背景關閉
    document.getElementById('modal-backdrop-store')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-backdrop-store')) {
        closeModal();
      }
    });

    // 分頁切換
    container.querySelectorAll('.btn-store-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundEffects.playClick();
        const cat = (e.currentTarget as HTMLElement).getAttribute('data-cat') as any;
        if (cat === 'CMP' && !state.unlockedFeatures.cmp) {
          alert('CMP（化學機械研磨）機台需晉升至 Tier 3 世代後方可解鎖！');
          return;
        }
        this.activeCategory = cat;
        this.render(container, state, onUpdate);
      });
    });

    // 科普彈窗
    container.querySelectorAll('.btn-sci-info').forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundEffects.playClick();
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0', 10);
        const item = this.STORE_CATALOG.filter(i => i.category === this.activeCategory)[idx];
        if (!item) return;

        alert(`👨‍🏫 半導體晶圓教室：【${item.name}】\n\n${item.scienceNote}`);
      });
    });

    // 採購設備
    container.querySelectorAll('.btn-buy-equipment').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modelId = (e.currentTarget as HTMLElement).getAttribute('data-model-id');
        const spec = this.STORE_CATALOG.find(s => s.modelId === modelId);
        if (!spec) return;

        if (state.player.cash < spec.price) {
          alert('資金不足，無法完成設備採購！');
          return;
        }

        // 扣款
        state.player.cash -= spec.price;
        FinanceEngine.recordCapEx(state, spec.price);
        SoundEffects.playCoinChime();

        // 計算下一個可用座標 (避免完全重疊)
        const count = state.machines.length;
        const gridX = (count % 4) * 2;
        const gridY = Math.floor(count / 4) * 2;

        const newMachine: MachineData = {
          id: `MCH-${Date.now().toString(36).toUpperCase().slice(-5)}`,
          modelId: spec.modelId,
          name: spec.name.split(' (')[0],
          category: spec.category,
          tier: spec.tier,
          gridX: Math.min(7, gridX),
          gridY: Math.min(7, gridY),
          wear: 0,
          status: 'IDLE',
          assignedEngineerId: null,
          pairedTrackIds: spec.category === 'LITHO' ? [] : undefined
        };

        state.machines.push(newMachine);

        // 成就檢核
        AchievementEngine.checkAchievements(state);

        onUpdate();
        this.activeCategory = 'FLEET';
        this.render(container, state, onUpdate);
      });
    });

    // 就地大修
    container.querySelectorAll('.btn-overhaul').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const machineId = (e.currentTarget as HTMLElement).getAttribute('data-machine-id');
        const cost = parseInt((e.currentTarget as HTMLElement).getAttribute('data-cost') || '0', 10);
        const machine = state.machines.find(m => m.id === machineId);
        if (!machine) return;

        if (state.player.cash < cost) {
          alert('資金不足，無法支付大修費用！');
          return;
        }

        state.player.cash -= cost;
        FinanceEngine.recordMaintenance(state, cost);
        machine.wear = 0;
        machine.status = 'IDLE';

        SoundEffects.playClick();
        onUpdate();
        this.render(container, state, onUpdate);
      });
    });

    // 報廢變賣
    container.querySelectorAll('.btn-decommission').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const machineId = (e.currentTarget as HTMLElement).getAttribute('data-machine-id');
        const refund = parseInt((e.currentTarget as HTMLElement).getAttribute('data-refund') || '0', 10);
        const machineIndex = state.machines.findIndex(m => m.id === machineId);
        if (machineIndex === -1) return;

        if (!confirm(`確定要報廢並變賣此機台嗎？將回收變賣金 NT$ ${refund.toLocaleString()}`)) {
          return;
        }

        const machine = state.machines[machineIndex];
        // 若有機台指派了工程師，解除指派
        if (machine.assignedEngineerId) {
          const staff = state.staff.find(s => s.id === machine.assignedEngineerId);
          if (staff) staff.assignedMachineId = null;
        }

        state.player.cash += refund;
        state.machines.splice(machineIndex, 1);

        SoundEffects.playCoinChime();
        onUpdate();
        this.render(container, state, onUpdate);
      });
    });
  }
}
