/**
 * main.ts
 * Silicon Tycoon: Foundry Master（矽島霸權）主程式入口
 * 統籌 Phaser 3 2.5D 潔淨室、DOM 科幻 UI、科學模擬引擎群與 10s 自動存檔定時器
 */

import type * as PhaserTypes from 'phaser';
declare const Phaser: typeof PhaserTypes;
import { CleanroomScene } from './scenes/CleanroomScene';
import { SaveGameService } from './services/SaveGameService';
import { UIManager } from './ui/UIManager';
import { QuestEngine } from './engine/QuestEngine';
import { AchievementEngine } from './engine/AchievementEngine';
import { MaintenanceEngine } from './engine/MaintenanceEngine';
import { ProductionEngine } from './engine/ProductionEngine';
import { EconomyEngine } from './engine/EconomyEngine';
import { FinanceEngine } from './engine/FinanceEngine';
import { YieldEngine } from './engine/YieldEngine';
import { DevConsole } from './ui/DevConsole';
import { MachinePanel } from './ui/MachinePanel';
import { MachineData, OrderData } from './types';

class FoundryGame {
  private state = SaveGameService.loadFromLocalStorage() || SaveGameService.createDefaultSave();
  private phaserGame: Phaser.Game;
  private cleanroomScene!: CleanroomScene;
  private uiManager: UIManager;
  private autoSaveTimer = 0;

  constructor() {
    console.log('🚀 正在啟動 Silicon Tycoon: Foundry Master 矽島霸權...');

    // 1. 離線掛機模擬結算
    const now = Date.now();
    if (this.state.lastOnlineTimestamp && now - this.state.lastOnlineTimestamp > 60 * 1000) {
      const report = SaveGameService.calculateOfflineProgress(this.state, now);
      console.log('離線營運結算戰報:', report);
    }

    // 2. 每日任務自適應刷新
    const todayStr = new Date().toISOString().split('T')[0];
    this.state.questState = QuestEngine.refreshDailyQuests(
      this.state.questState,
      this.state.player,
      this.state.unlockedFeatures,
      todayStr
    );

    // 3. 成就條件檢查
    AchievementEngine.checkAchievements(this.state);

    // 4. 初始化 Phaser 3 2.5D Canvas
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#070b14',
      render: {
        antialias: true,
        pixelArt: false
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    this.phaserGame = new Phaser.Game(config);

    // 建立並啟動 CleanroomScene
    this.cleanroomScene = new CleanroomScene();
    this.phaserGame.scene.add(CleanroomScene.KEY, this.cleanroomScene, true, {
      saveGame: this.state,
      onMachineClick: (machine: MachineData) => this.handleMachineClick(machine),
      onStateUpdate: () => this.onStateChanged()
    });

    // 5. 初始化 DOM UI 模組
    this.uiManager = new UIManager(
      this.state,
      (speed) => {
        console.log(`開發者調整遊戲速度至: ${speed}x`);
      },
      () => {
        this.onStateChanged();
      },
      (newState) => {
        this.state = newState;
        this.cleanroomScene.updateState(this.state);
        this.uiManager.updateState(this.state);
        this.onStateChanged();
      },
      (active, tool) => {
        this.cleanroomScene.setPlannerMode(active, tool);
      }
    );

    // 6. 啟動主物理/化學/經濟模擬循環 (1 遊戲秒定時器)
    setInterval(() => this.simulationTick(), 1000);
  }

  /**
   * 1 遊戲秒週期性物理與經濟模擬
   */
  private simulationTick(): void {
    const speed = DevConsole.getSpeedMultiplier();

    for (let step = 0; step < speed; step++) {
      this.state.gameTime += 1;

      // 0. 財務收支模擬 (折舊、水電化學耗損、薪資與日/周/月推進)
      FinanceEngine.tickSimulation(this.state, 1);

      // 0.1 合約市場訂單補齊檢查 (接單後冷卻補充新訂單)
      EconomyEngine.checkOrderReplenishment(this.state);

      // 1. 維護機台磨損與 🛡️ TPM 在線保養檢核
      const staffMap = new Map(this.state.staff.map((s) => [s.id, s]));
      for (const machine of this.state.machines) {
        if (machine.status === 'EXPLODED') continue;
        const engineer = machine.assignedEngineerId ? staffMap.get(machine.assignedEngineerId) : null;
        const result = MaintenanceEngine.updateMachineHealth(machine, engineer, 1);
        machine.wear = result.newWear;

        if (result.breakdownOccurred) {
          machine.status = result.isExploded ? 'EXPLODED' : 'MAINTENANCE';
        }
      }

      // 1.1 員工疲勞度動態更新 (休假恢復 vs 上班累積)
      for (const staff of this.state.staff) {
        if (staff.workShift === 'OFF') {
          // 排休中：迅速恢復疲勞
          staff.fatigue = Math.max(0, staff.fatigue - 0.25);
        } else {
          // 出勤中：依兩班/三班與夜班乘數累積疲勞
          const baseRate = staff.shiftMode === 'TWO_SHIFT' ? 0.05 : 0.02;
          const shiftMultiplier = staff.workShift === 'NIGHT' ? 1.5 : 1.0;
          staff.fatigue = Math.min(100, staff.fatigue + baseRate * shiftMultiplier);
        }
      }

      // 動態判定哪些站點正在加工，即時更新 machine.status (IDLE vs PROCESSING)
      const activeStations = new Set<string>();
      for (const lot of this.state.activeLots) {
        if (lot.status === 'PROCESSING') {
          if (lot.currentStation === 'LIT') {
            if (lot.litSubStep === 'COAT' || lot.litSubStep === 'DEVELOP') {
              activeStations.add('TRACK');
            } else {
              activeStations.add('LITHO');
            }
          } else {
            activeStations.add(lot.currentStation);
          }
        }
      }

      for (const machine of this.state.machines) {
        if (machine.status === 'EXPLODED' || machine.status === 'MAINTENANCE') continue;
        if (activeStations.has(machine.category)) {
          machine.status = 'PROCESSING';
        } else {
          machine.status = 'IDLE';
        }
      }

      // 2. 推進在製批次 (Wafer Lots) - 依據各機台現實物理/化學加工時間精準放慢進度
      const completedOrders: OrderData[] = [];
      for (const lot of this.state.activeLots) {
        if (lot.status === 'PROCESSING') {
          // 初始化站點加工計時
          if (lot.stationProgressSeconds === undefined) {
            lot.stationProgressSeconds = 0;
          }
          if (!lot.stationRequiredSeconds) {
            lot.stationRequiredSeconds = ProductionEngine.getStationRequiredSeconds(
              lot.currentStation,
              lot.litSubStep
            );
          }

          lot.stationProgressSeconds += 1;

          // 僅當累積時間達到該站點物理/化學加工所需秒數時，才推進至下一站點
          if (lot.stationProgressSeconds >= lot.stationRequiredSeconds) {
            lot.stationProgressSeconds = 0;

            const order = this.state.activeOrders.find((o) => o.id === lot.orderId);
            const nodeNm = order ? order.nodeNm : 10000;

            const adv = ProductionEngine.advanceLotStation(
              lot,
              this.state.unlockedFeatures.cmp,
              nodeNm,
              this.state.player.unlockedCleanroomClass,
              this.state.gameTime,
              this.state.machines,
              this.state.facility.yellowRoomTiles
            );

            // 更新下一站點所需時間
            lot.stationRequiredSeconds = ProductionEngine.getStationRequiredSeconds(
              lot.currentStation,
              lot.litSubStep
            );

            if (adv.isLotCompleted) {
              lot.status = 'COMPLETED';
              if (order) {
                const lotsForOrder = this.state.activeLots.filter((l) => l.orderId === order.id);
                // 若遭受黃光區違規或白光污染，良率已被強制歸零 (0.0)；否則依據無塵室潔淨度、機台磨損與工程師資歷動態計算真實良率
                if (!lot.hasYellowRoomViolation && lot.yieldMultiplier !== 0.0) {
                  lot.yieldMultiplier = YieldEngine.calculateLotYield(lot, this.state, order);
                }
                const diesInLot = Math.round((order.totalDies / Math.max(1, lotsForOrder.length)) * lot.yieldMultiplier);
                order.goodDiesDelivered = Math.min(order.totalDies, order.goodDiesDelivered + diesInLot);

                // 記錄良率歷史 (滑動 5 筆)
                this.state.rollingYieldHistory.push(Number(lot.yieldMultiplier.toFixed(3)));
                if (this.state.rollingYieldHistory.length > 5) {
                  this.state.rollingYieldHistory.shift();
                }

                // 推進任務進度 (若有產出良品晶圓)
                QuestEngine.onWaferDelivered(this.state.questState, diesInLot > 0 ? lot.waferCount : 0);

                // 若該訂單所有批次皆已完工
                const allLotsDone = lotsForOrder.every((l) => l.status === 'COMPLETED');
                if (allLotsDone && !completedOrders.includes(order)) {
                  completedOrders.push(order);
                }
              }
            }
          }
        }
      }

      // 3. MES 自動派工與出貨結算 (若啟用)
      if (this.state.unlockedFeatures.mesAutoDispatch && completedOrders.length > 0) {
        for (const order of completedOrders) {
          const payout = EconomyEngine.settleOrderPayout(
            order,
            order.goodDiesDelivered,
            this.state.player,
            this.state.staff,
            0,
            this.state.clawbackDebt
          );
          this.state.player.cash += payout.netPayout;
          FinanceEngine.recordWaferSales(this.state, payout.netPayout);
          this.state.clawbackDebt = payout.remainingDebt;
          this.state.player.popularity = Math.min(100, this.state.player.popularity + 1);

          // 累計研發晉升指標：已交付訂單數與晶圓片數
          const orderLots = this.state.activeLots.filter((l) => l.orderId === order.id);
          const orderWafers = orderLots.reduce((sum, l) => sum + (l.waferCount || 25), 0) || 25;
          this.state.player.totalOrdersFulfilled = (this.state.player.totalOrdersFulfilled || 0) + 1;
          this.state.player.totalWafersDelivered = (this.state.player.totalWafersDelivered || 0) + orderWafers;

          QuestEngine.onOrderFulfilled(this.state.questState);

          // 移除已出貨訂單與批次
          this.state.activeOrders = this.state.activeOrders.filter((o) => o.id !== order.id);
          this.state.activeLots = this.state.activeLots.filter((l) => l.orderId !== order.id);
        }
      }
    }

    // 3. 成就即時檢核
    const achResult = AchievementEngine.checkAchievements(this.state);
    if (achResult.newlyUnlocked.length > 0) {
      this.uiManager.render();
    }

    // 4. 每 10 秒自動存檔
    this.autoSaveTimer += 1;
    if (this.autoSaveTimer >= 10) {
      this.autoSaveTimer = 0;
      SaveGameService.saveToLocalStorage(this.state);
    }

    // 5. 刷新 UI 與場景
    this.uiManager.render();
    this.cleanroomScene.updateState(this.state);
  }

  private handleMachineClick(machine: MachineData): void {
    MachinePanel.show(machine, this.state, () => this.onStateChanged());
  }

  private onStateChanged(): void {
    SaveGameService.saveToLocalStorage(this.state);
    this.cleanroomScene.updateState(this.state);
    this.uiManager.render();
  }
}

// 瀏覽器 DOM 載入完畢後自動啟動遊戲實例
window.addEventListener('DOMContentLoaded', () => {
  new FoundryGame();
});
