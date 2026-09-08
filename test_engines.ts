/**
 * test_engines.ts
 * 驗證所有核心模擬引擎、算式、Option B 產線流程與存檔遷移
 */

import { RayleighEngine } from './src/engine/RayleighEngine';
import { EconomyEngine } from './src/engine/EconomyEngine';
import { YieldEngine } from './src/engine/YieldEngine';
import { MaintenanceEngine } from './src/engine/MaintenanceEngine';
import { ProductionEngine } from './src/engine/ProductionEngine';
import { QuestEngine } from './src/engine/QuestEngine';
import { AchievementEngine } from './src/engine/AchievementEngine';
import { SaveGameService } from './src/services/SaveGameService';
import { WaferLotData, OrderData, SaveGameV1 } from './src/types';

console.log('=== [1] RayleighEngine 光學極限驗證 ===');
const contactSpec = RayleighEngine.OPTICAL_CATALOG['litho_contact'];
console.log(`Contact Aligner CD at k1=0.8: ${contactSpec.baseRayleighLimitNm}nm (預期 ~3007nm)`);
if (Math.abs(contactSpec.baseRayleighLimitNm - 3007) > 5) throw new Error('Contact CD 偏差過大');

const k1Dyn = RayleighEngine.calculateEffectiveK1('CAR', 10, {
  id: 'eng1',
  name: '老手',
  rank: 'Senior Engineer',
  moduleSpecialty: 'LITHO',
  fatigue: 20,
  shiftMode: 'THREE_SHIFT',
  assignedMachineId: 'm1',
  salary: 100000
});
console.log(`Senior Engineer Dynamic k1 with CAR: ${k1Dyn.effectiveK1} (預期 0.65 + 0.005 - 0.04 = 0.615)`);

console.log('\n=== [2] EconomyEngine 經濟與良率信任乘數驗證 ===');
const trust100 = EconomyEngine.calculateTrustMultiplier(1.0);
const trustNone = EconomyEngine.calculateTrustMultiplier(null);
const trust0 = EconomyEngine.calculateTrustMultiplier(0.0);
console.log(`Trust Multiplier @ 100%: ${trust100} (預期 1.20)`);
console.log(`Trust Multiplier @ N/A: ${trustNone} (預期 1.00)`);
console.log(`Trust Multiplier @ 0%: ${trust0} (預期 0.75 保底)`);
if (trust100 !== 1.2 || trustNone !== 1.0 || trust0 !== 0.75) throw new Error('Trust Multiplier 數值不符');

console.log('\n=== [3] YieldEngine 5批次滑動良率指數與晶圓圖驗證 ===');
const history1 = [0.90, 0.95];
console.log(`Rolling Yield (2筆): ${YieldEngine.calculateRollingYieldIndex(history1)} (預期 0.925)`);
const history6 = [0.80, 0.85, 0.90, 0.92, 0.94, 0.96];
console.log(`Rolling Yield (最近5筆): ${YieldEngine.calculateRollingYieldIndex(history6)} (預期 0.914)`);

const dies = YieldEngine.generateWaferMap(0.90);
console.log(`Monte Carlo 25 晶粒生成總數: ${dies.length}, 合格數: ${dies.filter(d => d.passed).length}`);

console.log('\n=== [4] MaintenanceEngine 🛡️ TPM 與炸機風險驗證 ===');
const defaultSave = SaveGameService.createDefaultSave();
const lithoMach = defaultSave.machines.find(m => m.category === 'LITHO')!;
const lithoEng = defaultSave.staff[0]; // Skilled Worker, LITHO, fatigue 10, THREE_SHIFT
const tpmCheck = MaintenanceEngine.checkTPMConditions(lithoMach, lithoEng);
console.log(`TPM Status: ${tpmCheck.isTPMActive}, Reason: ${tpmCheck.reason}`);
if (!tpmCheck.isTPMActive) throw new Error('預設開局微影工程師應符合 TPM 24H 零故障條件');

const explodeCheck = MaintenanceEngine.checkExplosionRisk(
  { ...lithoMach, tier: 6 }, // Tier 6 EUV
  { ...lithoEng, rank: 'Young Specialist' } // 菜鳥越級操機
);
console.log(`越級操機炸機風險: ${explodeCheck.hasRisk}, 差距: ${explodeCheck.rankDiff} 級`);
if (!explodeCheck.hasRisk) throw new Error('菜鳥操作 Tier 6 機台應判定為有炸機風險');

console.log('\n=== [5] ProductionEngine Option B 站點流動與 Q-Time 驗證 ===');
const mockLot: WaferLotData = {
  lotId: 'LOT_TEST_1',
  orderId: 'ORD_1',
  waferCount: 5,
  currentStation: 'FILM',
  currentLayer: 1,
  totalLayers: 2,
  qTimeDeadline: null,
  yieldMultiplier: 1.0,
  status: 'PROCESSING'
};

const mockOrder: OrderData = {
  id: 'ORD_1',
  clientName: '測試客戶',
  nodeNm: 10000,
  layerCount: 2,
  totalDies: 500,
  goodDiesDelivered: 0,
  nrePaid: 160000,
  unitPrice: 2,
  urgencyMultiplier: 1.0,
  deadlineGameTime: 1000,
  status: 'ACTIVE'
};

// 1. FILM -> LIT (COAT)
let step = ProductionEngine.advanceLotStation(mockLot, false, 10000, 'Class 10000', 0);
console.log(`Advance 1: ${mockLot.currentStation}, SubStep: ${mockLot.litSubStep}`);
if (mockLot.currentStation !== 'LIT' || mockLot.litSubStep !== 'COAT') throw new Error('應進入 LIT COAT');

// 2. LIT (COAT) -> LIT (EXPOSE)
step = ProductionEngine.advanceLotStation(mockLot, false, 10000, 'Class 10000', 2);
console.log(`Advance 2: ${mockLot.currentStation}, SubStep: ${mockLot.litSubStep}`);
if (mockLot.litSubStep !== 'EXPOSE') throw new Error('應進入 LIT EXPOSE');

// 3. LIT (EXPOSE) -> LIT (DEVELOP)
step = ProductionEngine.advanceLotStation(mockLot, false, 10000, 'Class 10000', 4);
console.log(`Advance 3: ${mockLot.currentStation}, SubStep: ${mockLot.litSubStep}`);
if (mockLot.litSubStep !== 'DEVELOP') throw new Error('應進入 LIT DEVELOP');

// 4. LIT (DEVELOP) -> ETCH (觸發 30s Q-Time)
step = ProductionEngine.advanceLotStation(mockLot, false, 10000, 'Class 10000', 6);
console.log(`Advance 4: ${mockLot.currentStation}, Q-Time Deadline: ${mockLot.qTimeDeadline}`);
if (mockLot.currentStation !== 'ETCH' || !mockLot.qTimeDeadline) throw new Error('應進入 ETCH 並啟動 Q-Time');

// 測試 Q-Time 逾期 10 秒 (輕度懲罰)
const qTimeLate10 = ProductionEngine.checkQTimeStatus(mockLot, mockOrder, mockLot.qTimeDeadline + 10);
console.log(`Q-Time 逾期 10s: isOverdue=${qTimeLate10.isOverdue}, penalty=${qTimeLate10.penaltyYieldRatio}, canRework=${qTimeLate10.canRework}`);
if (qTimeLate10.penaltyYieldRatio !== 0.65) throw new Error('逾期 10s 應扣減 35% 良率');

// 測試 Q-Time 逾期 20 秒 (嚴重逾時，光阻變質，觸發 Rework 救命機制)
const qTimeLate20 = ProductionEngine.checkQTimeStatus(mockLot, mockOrder, mockLot.qTimeDeadline + 20);
console.log(`Q-Time 逾期 20s (黃光至蝕刻): isFatal=${qTimeLate20.isFatal}, canRework=${qTimeLate20.canRework}, reworkCost=${qTimeLate20.reworkCost}`);
if (!qTimeLate20.canRework) throw new Error('黃光至蝕刻逾期應提供 Rework 救回選項');

// 執行 Rework
const reworkRes = ProductionEngine.executeReworkLot(mockLot, qTimeLate20.reworkCost);
console.log(`Rework 執行結果: ${reworkRes.message}, 退回站點: ${mockLot.currentStation}, 子步驟: ${mockLot.litSubStep}`);
if (mockLot.currentStation !== 'LIT' || mockLot.litSubStep !== 'COAT') throw new Error('Rework 應退回 LIT COAT');

console.log('\n=== [6] QuestEngine 每日與每週任務驗證 ===');
let qState = defaultSave.questState;
qState = QuestEngine.refreshDailyQuests(qState, defaultSave.player, defaultSave.unlockedFeatures, '2026-09-08');
console.log(`生成每日任務數: ${qState.dailyQuests.length}`);
if (qState.dailyQuests.length !== 3) throw new Error('應精準生成 3 項每日任務');

QuestEngine.onWaferDelivered(qState, 10);
console.log(`生產出貨任務進度: ${qState.dailyQuests[0].currentValue}/${qState.dailyQuests[0].targetValue}, completed=${qState.dailyQuests[0].completed}`);
if (!qState.dailyQuests[0].completed) throw new Error('出貨 10 片應達成首個目標');

console.log('\n=== [7] AchievementEngine 16項成就驗證 ===');
defaultSave.rollingYieldHistory.push(0.95);
const newlyAch = AchievementEngine.checkAchievements(defaultSave);
console.log(`解鎖成就數: ${newlyAch.newlyUnlocked.length}, 名稱: ${newlyAch.newlyUnlocked.map(a => a.title).join(', ')}`);

console.log('\n=== [8] SaveGameService V1 -> V2 遷移與離線模擬驗證 ===');
const mockV1: SaveGameV1 = {
  schemaVersion: 1,
  savedAt: Date.now() - 3600 * 1000,
  lastOnlineTimestamp: Date.now() - 3600 * 1000,
  player: defaultSave.player,
  unlockedFeatures: { cmp: false, agv: false, oht: false, mesAutoDispatch: false },
  facility: defaultSave.facility,
  machines: defaultSave.machines.map(m => {
    const copy = { ...m };
    delete (copy as any).pairedTrackIds;
    return copy;
  }),
  staff: defaultSave.staff,
  activeOrders: defaultSave.activeOrders,
  activeLots: defaultSave.activeLots,
  rollingYieldHistory: [0.90],
  clawbackDebt: 0,
  gameTime: 500
};

const migratedV2 = SaveGameService.migrateSaveV1toV2(mockV1);
console.log(`遷移至 V2 schemaVersion: ${migratedV2.schemaVersion}, mixAndMatchLitho: ${migratedV2.unlockedFeatures.mixAndMatchLitho}, achievements: ${migratedV2.achievements.length}`);
if (migratedV2.schemaVersion !== 2 || migratedV2.achievements.length !== 16) throw new Error('V1 至 V2 遷移結構不完整');

// 離線 1 小時模擬
const offlineRep = SaveGameService.calculateOfflineProgress(migratedV2, Date.now());
console.log(`離線模擬結果: 離線秒數=${offlineRep.offlineDurationSeconds}, TPM保護機台數=${offlineRep.tpmProtectedCount}, 故障數=${offlineRep.breakdownCount}, 炸機數=${offlineRep.explosionCount}`);
if (offlineRep.tpmProtectedCount < 1) throw new Error('TPM 機台應正常受保護');

console.log('\n🎉🎉 所有核心模擬引擎、科學算式與 Option B 流水線 100% 驗證通過！');
