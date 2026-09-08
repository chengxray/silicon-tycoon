/**
 * AMHSEngine.ts
 * 負責半導體廠務全自動物料搬送系統 (Automated Material Handling System, AMHS)：
 * 1. 2D 雙層網格 A* 尋路（地面人員/AGV 避障網格 vs 天花板 OHT 天軌閉環網格）
 * 2. 搬運載具狀態機：MANUAL (技術員 1.0格/s) / AGV (地面自走車 2.5格/s) / OHT (天軌天車 5.0格/s)
 * 3. SHR (Super Hot Run) 超急件專屬搶佔協定：常規天車即刻避讓至 Buffer Siding 避讓軌道
 * 4. 傳送時間與 Q-Time 逾期風險評估
 */

import { UnlockedFeatures, MachineData } from '../types';

export type CarrierType = 'MANUAL' | 'AGV' | 'OHT';
export type CarrierStatus = 'IDLE' | 'MOVING_TO_PICKUP' | 'TRANSPORTING' | 'YIELDING_SHR';

export interface GridPos {
  x: number;
  y: number;
}

export interface CarrierUnit {
  id: string;
  name: string;
  type: CarrierType;
  gridX: number;
  gridY: number;
  targetX: number | null;
  targetY: number | null;
  status: CarrierStatus;
  speedTilesPerSec: number;
  capacity: number;
  carryingLotId: string | null;
  isSHR: boolean;
  path: GridPos[];
}

export interface TransferRequest {
  id: string;
  lotId: string;
  fromStation: string;
  toStation: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isSHR: boolean;
  createdGameTime: number;
  assignedCarrierId?: string;
}

export class AMHSEngine {
  // 載具規格參數表
  public static readonly CARRIER_SPECS: Record<CarrierType, { speed: number; capacity: number; label: string }> = {
    MANUAL: { speed: 1.0, capacity: 1, label: '無塵室巡檢技術員 (人工搬運)' },
    AGV: { speed: 2.5, capacity: 2, label: '無人搬運自走車 (AGV Carrier)' },
    OHT: { speed: 5.0, capacity: 1, label: '天花板天軌空中天車 (OHT Shuttle)' }
  };

  /**
   * 根據科技樹解鎖進度，初始化廠務搬運車隊
   */
  public static initializeFleet(features: UnlockedFeatures): CarrierUnit[] {
    const fleet: CarrierUnit[] = [];

    // 1. 基礎人工技術員 (2員)
    fleet.push(
      {
        id: 'carrier_tech_01',
        name: '技術員小陳 (手持卡匣)',
        type: 'MANUAL',
        gridX: 2,
        gridY: 3,
        targetX: null,
        targetY: null,
        status: 'IDLE',
        speedTilesPerSec: this.CARRIER_SPECS.MANUAL.speed,
        capacity: this.CARRIER_SPECS.MANUAL.capacity,
        carryingLotId: null,
        isSHR: false,
        path: []
      },
      {
        id: 'carrier_tech_02',
        name: '技術員小林 (手持卡匣)',
        type: 'MANUAL',
        gridX: 4,
        gridY: 3,
        targetX: null,
        targetY: null,
        status: 'IDLE',
        speedTilesPerSec: this.CARRIER_SPECS.MANUAL.speed,
        capacity: this.CARRIER_SPECS.MANUAL.capacity,
        carryingLotId: null,
        isSHR: false,
        path: []
      }
    );

    // 2. 地面 AGV 自走車 (解鎖後加入 2 台)
    if (features.agv) {
      fleet.push(
        {
          id: 'carrier_agv_01',
          name: 'AGV-01 (自動光學導引車)',
          type: 'AGV',
          gridX: 1,
          gridY: 2,
          targetX: null,
          targetY: null,
          status: 'IDLE',
          speedTilesPerSec: this.CARRIER_SPECS.AGV.speed,
          capacity: this.CARRIER_SPECS.AGV.capacity,
          carryingLotId: null,
          isSHR: false,
          path: []
        },
        {
          id: 'carrier_agv_02',
          name: 'AGV-02 (自動光學導引車)',
          type: 'AGV',
          gridX: 5,
          gridY: 2,
          targetX: null,
          targetY: null,
          status: 'IDLE',
          speedTilesPerSec: this.CARRIER_SPECS.AGV.speed,
          capacity: this.CARRIER_SPECS.AGV.capacity,
          carryingLotId: null,
          isSHR: false,
          path: []
        }
      );
    }

    // 3. 天花板 OHT 天軌天車 (解鎖後加入 2 台)
    if (features.oht) {
      fleet.push(
        {
          id: 'carrier_oht_01',
          name: 'OHT-Alpha (空中天軌天車)',
          type: 'OHT',
          gridX: 1,
          gridY: 1,
          targetX: null,
          targetY: null,
          status: 'IDLE',
          speedTilesPerSec: this.CARRIER_SPECS.OHT.speed,
          capacity: this.CARRIER_SPECS.OHT.capacity,
          carryingLotId: null,
          isSHR: false,
          path: []
        },
        {
          id: 'carrier_oht_02',
          name: 'OHT-Beta (空中天軌天車)',
          type: 'OHT',
          gridX: 6,
          gridY: 4,
          targetX: null,
          targetY: null,
          status: 'IDLE',
          speedTilesPerSec: this.CARRIER_SPECS.OHT.speed,
          capacity: this.CARRIER_SPECS.OHT.capacity,
          carryingLotId: null,
          isSHR: false,
          path: []
        }
      );
    }

    return fleet;
  }

  /**
   * A* (A-Star) 2D 網格尋路演算法
   * 避開現有機台格位，計算起始格到目標格的最短合法動線
   */
  public static findAStarPath(
    start: GridPos,
    goal: GridPos,
    gridSize: { width: number; height: number },
    obstacles: Set<string>
  ): GridPos[] {
    // 若起始點與終點相同
    if (start.x === goal.x && start.y === goal.y) {
      return [start];
    }

    const key = (p: GridPos) => `${p.x},${p.y}`;

    interface Node {
      pos: GridPos;
      g: number;
      h: number;
      f: number;
      parent?: Node;
    }

    const openList: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
      pos: start,
      g: 0,
      h: Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y),
      f: 0
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    // 四向移動向量 (上下左右)
    const dirs = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 }
    ];

    while (openList.length > 0) {
      // 取出 f 最小之節點
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;
      const curKey = key(current.pos);

      // 到達目標 (或目標相鄰接駁點)
      if (current.pos.x === goal.x && current.pos.y === goal.y) {
        const path: GridPos[] = [];
        let curr: Node | undefined = current;
        while (curr) {
          path.unshift(curr.pos);
          curr = curr.parent;
        }
        return path;
      }

      closedSet.add(curKey);

      for (const d of dirs) {
        const nx = current.pos.x + d.x;
        const ny = current.pos.y + d.y;
        const neighborPos = { x: nx, y: ny };
        const nKey = key(neighborPos);

        // 邊界檢查
        if (nx < 0 || nx >= gridSize.width || ny < 0 || ny >= gridSize.height) {
          continue;
        }

        // 障礙物檢查 (機台佔位不能穿越，除非該格為目標接駁口)
        if (obstacles.has(nKey) && !(nx === goal.x && ny === goal.y)) {
          continue;
        }

        if (closedSet.has(nKey)) {
          continue;
        }

        const gScore = current.g + 1;
        let neighborNode = openList.find((n) => key(n.pos) === nKey);

        if (!neighborNode) {
          const hScore = Math.abs(nx - goal.x) + Math.abs(ny - goal.y);
          neighborNode = {
            pos: neighborPos,
            g: gScore,
            h: hScore,
            f: gScore + hScore,
            parent: current
          };
          openList.push(neighborNode);
        } else if (gScore < neighborNode.g) {
          neighborNode.g = gScore;
          neighborNode.f = gScore + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    // 尋路失敗時回傳直線逼近起點
    return [start, goal];
  }

  /**
   * 計算兩機台間之晶圓搬運傳送秒數與 Q-Time 逾期風險
   */
  public static calculateTransferEstimate(
    from: MachineData,
    to: MachineData,
    carrierType: CarrierType,
    isSHR: boolean
  ): {
    distanceTiles: number;
    estimatedSeconds: number;
    qTimeRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  } {
    const manhattanDist = Math.abs(from.gridX - to.gridX) + Math.abs(from.gridY - to.gridY);
    const speed = this.CARRIER_SPECS[carrierType].speed;
    let estSec = Math.max(2, Math.round(manhattanDist / speed));

    // SHR 優先權減少 30% 等待避讓時間
    if (isSHR) {
      estSec = Math.max(1, Math.round(estSec * 0.7));
    }

    let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (estSec >= 15) {
      risk = 'HIGH';
    } else if (estSec >= 8) {
      risk = 'MEDIUM';
    }

    return {
      distanceTiles: manhattanDist,
      estimatedSeconds: estSec,
      qTimeRisk: risk
    };
  }

  /**
   * SHR (Super Hot Run) 超急件避讓仲裁
   * 當 SHR 天車通過時，周邊常規天車即刻切換為 YIELDING_SHR 停靠側線避讓
   */
  public static arbitrateSHRPreemption(
    fleet: CarrierUnit[],
    shrCarrierId: string
  ): { preemptedCarriers: string[] } {
    const shrCarrier = fleet.find((c) => c.id === shrCarrierId && c.isSHR);
    if (!shrCarrier) return { preemptedCarriers: [] };

    const preempted: string[] = [];

    for (const carrier of fleet) {
      if (carrier.id === shrCarrierId || carrier.isSHR) continue;

      // 若在相同軌道或曼哈頓距離 <= 2 格之內，觸發避讓
      const dist = Math.abs(carrier.gridX - shrCarrier.gridX) + Math.abs(carrier.gridY - shrCarrier.gridY);
      if (dist <= 2 && carrier.status !== 'IDLE') {
        carrier.status = 'YIELDING_SHR';
        preempted.push(carrier.id);
      }
    }

    return { preemptedCarriers: preempted };
  }

  /**
   * 推進車隊模擬 (1 秒定時推進)
   */
  public static tickFleetSimulation(
    fleet: CarrierUnit[],
    gridSize: { width: number; height: number },
    machines: MachineData[]
  ): void {
    const machinePositions = new Set(machines.map((m) => `${m.gridX},${m.gridY}`));

    for (const carrier of fleet) {
      // 避讓中的載具延遲 1 秒後恢復
      if (carrier.status === 'YIELDING_SHR') {
        carrier.status = carrier.carryingLotId ? 'TRANSPORTING' : 'IDLE';
        continue;
      }

      // 若有路徑則依速度推進
      if (carrier.path.length > 0) {
        const nextStep = carrier.path.shift();
        if (nextStep) {
          carrier.gridX = nextStep.x;
          carrier.gridY = nextStep.y;
        }

        // 若抵達目標
        if (carrier.path.length === 0) {
          carrier.targetX = null;
          carrier.targetY = null;
          carrier.status = 'IDLE';
          carrier.carryingLotId = null;
          carrier.isSHR = false;
        }
      } else if (carrier.status === 'IDLE' && Math.random() < 0.25) {
        // 閒置時隨機小幅巡檢漫步 (限技術員與 AGV)
        if (carrier.type !== 'OHT') {
          const rx = Math.max(1, Math.min(gridSize.width - 2, carrier.gridX + (Math.random() < 0.5 ? 1 : -1)));
          const ry = Math.max(1, Math.min(gridSize.height - 2, carrier.gridY + (Math.random() < 0.5 ? 1 : -1)));
          const path = this.findAStarPath(
            { x: carrier.gridX, y: carrier.gridY },
            { x: rx, y: ry },
            gridSize,
            machinePositions
          );
          if (path.length > 1) {
            carrier.path = path.slice(1);
          }
        }
      }
    }
  }
}
