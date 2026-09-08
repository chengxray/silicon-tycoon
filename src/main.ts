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
      onMachineClick: (machine: MachineData) => this.handleMachineClick(machine)
    });

    // 5. 初始化 DOM UI 模組
    this.uiManager = new UIManager(
      this.state,
      (speed) => {
        console.log(`開發者調整遊戲速度至: ${speed}x`);
      },
      () => {
        this.onStateChanged();
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

      // 2. 推進在製批次 (Wafer Lots)
      const completedOrders: OrderData[] = [];
      for (const lot of this.state.activeLots) {
        if (lot.status === 'PROCESSING') {
          const order = this.state.activeOrders.find((o) => o.id === lot.orderId);
          const nodeNm = order ? order.nodeNm : 10000;

          const adv = ProductionEngine.advanceLotStation(
            lot,
            this.state.unlockedFeatures.cmp,
            nodeNm,
            this.state.player.unlockedCleanroomClass,
            this.state.gameTime
          );

          if (adv.isLotCompleted) {
            lot.status = 'COMPLETED';
            if (order) {
              const lotsForOrder = this.state.activeLots.filter((l) => l.orderId === order.id);
              const diesInLot = Math.round((order.totalDies / Math.max(1, lotsForOrder.length)) * lot.yieldMultiplier);
              order.goodDiesDelivered = Math.min(order.totalDies, order.goodDiesDelivered + diesInLot);

              // 記錄良率歷史 (滑動 5 筆)
              this.state.rollingYieldHistory.push(Number(lot.yieldMultiplier.toFixed(3)));
              if (this.state.rollingYieldHistory.length > 5) {
                this.state.rollingYieldHistory.shift();
              }

              // 推進任務進度
              QuestEngine.onWaferDelivered(this.state.questState, lot.waferCount);

              // 若該訂單所有批次皆已完工
              const allLotsDone = lotsForOrder.every((l) => l.status === 'COMPLETED');
              if (allLotsDone && !completedOrders.includes(order)) {
                completedOrders.push(order);
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
          this.state.clawbackDebt = payout.remainingDebt;
          this.state.player.popularity = Math.min(100, this.state.player.popularity + 1);

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
