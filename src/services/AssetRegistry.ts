/**
 * AssetRegistry.ts
 * 負責全遊戲靜態美術與動畫素材之路徑、規格與中繼資料映射表
 */

export const ASSET_REGISTRY = {
  // 機台高清卡片繪圖 (HD Machine Cards - 2.5D Transparent PNG)
  machines: {
    litho_contact: { path: './assets/machines/litho_contact.png', label: 'Contact Aligner', tier: 1 },
    litho_projection: { path: './assets/machines/litho_projection.png', label: '1x Projection Aligner', tier: 1 },
    litho_gline: { path: './assets/machines/litho_gline.png', label: 'G-Line Stepper', tier: 2 },
    litho_iline: { path: './assets/machines/litho_iline.png', label: 'I-Line Stepper', tier: 3 },
    litho_krf: { path: './assets/machines/litho_krf.png', label: 'KrF DUV Scanner', tier: 4 },
    litho_arfdry: { path: './assets/machines/litho_arfdry.png', label: 'ArF Dry Scanner', tier: 4 },
    litho_arfi: { path: './assets/machines/litho_arfi.png', label: 'ArFi Immersion TWINSCAN', tier: 5 },
    litho_euv: { path: './assets/machines/litho_euv.png', label: 'EUV Scanner (無標誌 2.5D 旗艦)', tier: 6 },
    litho_highna: { path: './assets/machines/litho_highna.png', label: 'High-NA EUV Scanner', tier: 6 },

    track_manual: { path: './assets/machines/track_manual.png', label: '手動旋塗熱板台', tier: 1 },
    track_single: { path: './assets/machines/track_clean.png', label: '單軌自動塗膠顯影機', tier: 2 },
    track_dual: { path: './assets/machines/track_dual.png', label: '雙軌連線 Track', tier: 3 },
    track_clean: { path: './assets/machines/track_clean.png', label: '多工位精密 Clean Track', tier: 4 },
    track_advanced: { path: './assets/machines/track_advanced.png', label: '先進極限分子級 Track', tier: 6 },

    etch_wet: { path: './assets/machines/etch_wet.png', label: '濕式酸槽清洗台', tier: 1 },
    etch_plasma: { path: './assets/machines/etch_plasma.png', label: '電漿乾式蝕刻機 (RIE)', tier: 3 },

    film_furnace: { path: './assets/machines/film_furnace.png', label: '高溫熱氧化爐管', tier: 1 },
    film_pecvd: { path: './assets/machines/film_pecvd.png', label: '電漿化學沉積 / ALD 機', tier: 4 },

    diff_furnace: { path: './assets/machines/diff_furnace.png', label: '熱擴散高溫爐管', tier: 1 },
    diff_implanter: { path: './assets/machines/diff_implanter.png', label: '大束流離子佈植機', tier: 2 },
    cmp_polisher: { path: './assets/machines/cmp_polisher.png', label: '化學機械平坦化研磨機', tier: 3 }
  },

  // 人物與搬運載具 Sprite Sheet 與獨立 2.5D 透明貼圖
  characters: {
    tech_cleanroom: { path: './assets/characters/tech_cleanroom.png', label: 'Cleanroom Technician' },
    agv_carrier: { path: './assets/characters/agv_carrier.png', label: 'AGV Wafer Carrier' },
    oht_shuttle: { path: './assets/characters/oht_shuttle.png', label: 'OHT Sky-Rail Shuttle' }
  },

  // 世代無塵室背景與等角地坪
  backgrounds: {
    tier1: { path: './assets/backgrounds/cleanroom_tier1.svg', name: '1970s Retro Cleanroom' },
    tier2_3: { path: './assets/backgrounds/cleanroom_tier2_3.svg', name: '1990s Sub-micron Cleanroom' },
    tier4_5: { path: './assets/backgrounds/cleanroom_tier4_5.svg', name: '2000s Automated 300mm Cleanroom' },
    tier6: { path: './assets/backgrounds/cleanroom_tier6_gigafab.svg', name: 'GigaFab Super Cleanroom' }
  },

  // EUV 特殊雷射電漿特效圖集
  animations: {
    euv_plasma_sheet: { path: './assets/animations/euv_plasma_sheet.svg', frameWidth: 192, frameHeight: 192, frameCount: 4 },
    euv_laser_burst: { path: './assets/animations/euv_laser_burst.svg', frameWidth: 192, frameHeight: 192, frameCount: 4 }
  },

  // 科普教學專用插畫
  tutorials: {
    wafer_anatomy: { path: './assets/tutorials/wafer_anatomy.svg', title: '晶圓與晶粒微觀構造' },
    lit_cluster_flow: { path: './assets/tutorials/lit_cluster_flow.svg', title: 'LIT 黃光連線機組三部曲' },
    spin_coating: { path: './assets/tutorials/spin_coating.svg', title: '光阻旋塗與烘烤物理' },
    litho_projection: { path: './assets/tutorials/litho_projection.svg', title: '縮小微影光學與極限線寬' },
    plasma_etching: { path: './assets/tutorials/plasma_etching.svg', title: '乾式電漿與濕式蝕刻對比' },
    ion_implantation: { path: './assets/tutorials/ion_implantation.svg', title: '離子佈植摻雜原理' },
    cmp_polishing: { path: './assets/tutorials/cmp_polishing.svg', title: '化學機械平坦化研磨機制' },
    qtime_oxide: { path: './assets/tutorials/qtime_oxide.svg', title: 'Q-Time 表面氧化與胺害' },
    mix_and_match_skyscraper: { path: './assets/tutorials/mix_and_match_skyscraper.svg', title: '混合微影分層匹配摩天大樓' }
  }
};
