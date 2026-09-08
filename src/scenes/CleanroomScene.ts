/**
 * CleanroomScene.ts
 * 負責 Phaser 3 2.5D 等角潔淨室場景渲染：
 * 地板格柵、黃光區濾光光暈、機台 2.5D Sprite 深度排序 (Depth Sorting)、
 * 狀態 LED 呼吸燈、🛡️ TPM 零故障盾牌徽章、無塵室技術員巡檢與天花板 OHT 天車懸吊軌道
 */

import type * as PhaserTypes from 'phaser';
declare const Phaser: typeof PhaserTypes;
import { SaveGameV2, MachineData, StaffData } from '../types';
import { MaintenanceEngine } from '../engine/MaintenanceEngine';
import { ASSET_REGISTRY } from '../services/AssetRegistry';
import { SoundEffects } from '../audio/SoundEffects';

export class CleanroomScene extends Phaser.Scene {
  public static readonly KEY = 'CleanroomScene';

  private saveGame!: SaveGameV2;
  private tileWidth = 140;
  private tileHeight = 70;

  // 容器與物件快取
  private floorGraphics!: Phaser.GameObjects.Graphics;
  private railGraphics!: Phaser.GameObjects.Graphics;
  private machineMap: Map<
    string,
    {
      container: Phaser.GameObjects.Container;
      ledArc: Phaser.GameObjects.Arc;
      label: Phaser.GameObjects.Text;
      tpmText?: Phaser.GameObjects.Text;
      processingText?: Phaser.GameObjects.Text;
      sprite?: Phaser.GameObjects.Image;
      fallback?: Phaser.GameObjects.Graphics;
    }
  > = new Map();

  private technicians: {
    container: Phaser.GameObjects.Container;
    targetX: number;
    targetY: number;
    speed: number;
  }[] = [];

  private ohtShuttles: {
    container: Phaser.GameObjects.Container;
    progress: number;
    speed: number;
  }[] = [];

  private agvCarriers: {
    container: Phaser.GameObjects.Container;
    targetX: number;
    targetY: number;
    speed: number;
  }[] = [];

  // 互動狀態
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private totalDragDistance = 0;
  private readonly dragThreshold = 6;
  private onMachineClickCallback?: (machine: MachineData) => void;

  constructor() {
    super({ key: CleanroomScene.KEY });
  }

  public init(data: { saveGame: SaveGameV2; onMachineClick?: (machine: MachineData) => void }): void {
    this.saveGame = data.saveGame;
    this.onMachineClickCallback = data.onMachineClick;
  }

  public preload(): void {
    // 監聽載入完成，若機台貼圖稍晚下載完畢即刻升級畫面
    this.load.on('complete', () => {
      this.refreshMachineSprites();
    });
    this.load.on('loaderror', (fileObj: any) => {
      console.warn('⚠️ 貼圖載入失敗:', fileObj?.key, fileObj?.url);
    });

    // 預先載入所有機台貼圖
    for (const [key, item] of Object.entries(ASSET_REGISTRY.machines)) {
      if (!this.textures.exists(key)) {
        this.load.image(key, item.path);
      }
    }

    // 預先載入角色與搬運載具 Sprite
    for (const [key, item] of Object.entries(ASSET_REGISTRY.characters)) {
      if (!this.textures.exists(key) && (item as any).path) {
        this.load.image(key, (item as any).path);
      }
    }
  }

  /**
   * 當貼圖資源載入完成時，無縫將所有備援幾何體升級為 2.5D 精美 Sprite
   */
  public refreshMachineSprites(): void {
    for (const machine of this.saveGame.machines) {
      const entry = this.machineMap.get(machine.id);
      if (entry && !entry.sprite && this.textures.exists(machine.modelId)) {
        if (entry.fallback) {
          entry.fallback.destroy();
          entry.fallback = undefined;
        }
        const sprite = this.add.image(0, -35, machine.modelId);
        const targetSize = this.tileWidth * 0.95;
        sprite.setDisplaySize(targetSize, targetSize);
        entry.container.addAt(sprite, 1);
        entry.sprite = sprite;
      }
    }
  }

  public create(): void {
    // 建立地圖與圖層容器
    this.floorGraphics = this.add.graphics();
    this.railGraphics = this.add.graphics();

    // 繪製地坪格柵與黃光區
    this.renderFloor();

    // 繪製天花板 OHT 軌道 (Layer 3)
    this.renderOHTRails();

    // 繪製所有機台 (Layer 1，含 2.5D 深度排序)
    this.renderMachines();

    // 生成無塵室巡檢技術員 (Layer 2)
    this.spawnTechnicians();

    // 生成地面 AGV 自走車 (Layer 2)
    this.spawnAGVCarriers();

    // 生成天花板 OHT 晶圓盒天車 (Layer 3)
    this.spawnOHTShuttles();

    // 設定攝影機初始位置與縮放控制
    this.cameras.main.centerOn(0, 200);
    this.cameras.main.setZoom(0.95);

    // 註冊滑鼠平移與滾輪縮放
    this.setupCameraControls();

    // 監聽視窗大小自適應
    this.scale.on('resize', this.onResize, this);
  }

  /**
   * 2.5D 等角座標變換 (Grid to Screen)
   */
  public toScreen(gridX: number, gridY: number): { x: number; y: number } {
    const x = (gridX - gridY) * (this.tileWidth / 2);
    const y = (gridX + gridY) * (this.tileHeight / 2);
    return { x, y };
  }

  /**
   * 繪製潔淨室等角地坪格柵與黃光區光暈 (Floor Grid & Yellow Room Aura)
   */
  private renderFloor(): void {
    this.floorGraphics.clear();
    const size = this.saveGame.facility.bayGridSize;

    for (let gx = 0; gx < size.width; gx++) {
      for (let gy = 0; gy < size.height; gy++) {
        const { x, y } = this.toScreen(gx, gy);

        // 判斷是否為黃光微影專區 (靠近 LITHO 與 TRACK 機台之區域)
        const isYellowArea = gy <= 3 && gx >= 2 && gx <= 5;

        // 地磚菱形四頂點
        const pTop = { x, y: y - this.tileHeight / 2 };
        const pRight = { x: x + this.tileWidth / 2, y };
        const pBottom = { x, y: y + this.tileHeight / 2 };
        const pLeft = { x: x - this.tileWidth / 2, y };

        if (isYellowArea) {
          // 黃光區暖黃濾光地磚
          this.floorGraphics.fillStyle(0x271905, 0.95);
          this.floorGraphics.lineStyle(1.5, 0xf59e0b, 0.45);
        } else {
          // 標準潔淨室深藍防靜電導電地磚
          this.floorGraphics.fillStyle((gx + gy) % 2 === 0 ? 0x091122 : 0x0c162d, 0.95);
          this.floorGraphics.lineStyle(1, 0x1e293b, 0.5);
        }

        this.floorGraphics.beginPath();
        this.floorGraphics.moveTo(pTop.x, pTop.y);
        this.floorGraphics.lineTo(pRight.x, pRight.y);
        this.floorGraphics.lineTo(pBottom.x, pBottom.y);
        this.floorGraphics.lineTo(pLeft.x, pLeft.y);
        this.floorGraphics.closePath();
        this.floorGraphics.fillPath();
        this.floorGraphics.strokePath();
      }
    }

    // 黃光區標籤光暈
    const yellowCenter = this.toScreen(3.5, 1.5);
    const yellowLabel = this.add.text(yellowCenter.x, yellowCenter.y - 40, '🟡 黃光微影作業專區 (LITHO BAY)', {
      fontFamily: 'Noto Sans TC, sans-serif',
      fontSize: '12px',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 3
    });
    yellowLabel.setOrigin(0.5);
    yellowLabel.setDepth(10);
  }

  /**
   * 繪製天花板 OHT 懸吊天軌 (Overhead Hoist Transport Rails)
   */
  private renderOHTRails(): void {
    this.railGraphics.clear();
    const size = this.saveGame.facility.bayGridSize;
    const railHeight = -160; // 懸浮於天花板之高度

    this.railGraphics.lineStyle(2.5, 0x06b6d4, 0.35);

    // 繪製環廠天軌回路
    const p1 = this.toScreen(1, 1);
    const p2 = this.toScreen(size.width - 2, 1);
    const p3 = this.toScreen(size.width - 2, size.height - 2);
    const p4 = this.toScreen(1, size.height - 2);

    this.railGraphics.beginPath();
    this.railGraphics.moveTo(p1.x, p1.y + railHeight);
    this.railGraphics.lineTo(p2.x, p2.y + railHeight);
    this.railGraphics.lineTo(p3.x, p3.y + railHeight);
    this.railGraphics.lineTo(p4.x, p4.y + railHeight);
    this.railGraphics.closePath();
    this.railGraphics.strokePath();
  }

  /**
   * 渲染全廠機台 (含等角深度排序 Depth Sorting 與互動點擊)
   */
  public renderMachines(): void {
    // 建立工程師索引
    const staffMap = new Map<string, StaffData>(this.saveGame.staff.map((s) => [s.id, s]));

    for (const machine of this.saveGame.machines) {
      const { x, y } = this.toScreen(machine.gridX, machine.gridY);
      const depth = (machine.gridX + machine.gridY) * 10 + 50;

      let entry = this.machineMap.get(machine.id);
      if (!entry) {
        const container = this.add.container(x, y);
        container.setDepth(depth);

        // 1. 機台基座投影倒影陰影
        const shadow = this.add.ellipse(0, 10, this.tileWidth * 0.7, this.tileHeight * 0.5, 0x000000, 0.4);
        container.add(shadow);

        // 2. 機台 Sprite 或程序化高科技立方體貼圖
        let sprite: Phaser.GameObjects.Image | undefined;
        let fallback: Phaser.GameObjects.Graphics | undefined;
        if (this.textures.exists(machine.modelId)) {
          sprite = this.add.image(0, -35, machine.modelId);
          const targetSize = this.tileWidth * 0.95;
          sprite.setDisplaySize(targetSize, targetSize);
          container.add(sprite);
        } else {
          // 備援：精緻 2.5D 高科技機台立方體
          fallback = this.createFallbackMachineGraphic(machine);
          container.add(fallback);
        }

        // 3. 狀態指示 LED 呼吸燈 (綠: 正常, 藍: 運作中, 黃閃: 維修, 紅閃: 故障炸機)
        const ledColor = this.getLEDColor(machine.status);
        const ledArc = this.add.circle(0, -90, 6, ledColor);
        container.add(ledArc);

        // 4. 機台名稱與磨損率文字
        const label = this.add.text(0, 15, `${machine.name} (${Math.round(machine.wear)}%)`, {
          fontFamily: 'Noto Sans TC, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#f8fafc',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: { x: 6, y: 3 }
        });
        label.setOrigin(0.5);
        container.add(label);

        // 5. 🛡️ TPM 24H 零故障在線維護盾牌徽章
        const assignedEng = machine.assignedEngineerId ? staffMap.get(machine.assignedEngineerId) : null;
        const tpmCheck = MaintenanceEngine.checkTPMConditions(machine, assignedEng);

        let tpmText: Phaser.GameObjects.Text | undefined;
        if (tpmCheck.isTPMActive) {
          tpmText = this.add.text(0, -110, '🛡️ TPM 零故障', {
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#10b981',
            backgroundColor: 'rgba(6, 78, 59, 0.9)',
            padding: { x: 5, y: 2 }
          });
          tpmText.setOrigin(0.5);
          container.add(tpmText);
        }

        // 6. ⚡ 加工中 (PROCESSING) 即時徽章
        let processingText: Phaser.GameObjects.Text | undefined;
        if (machine.status === 'PROCESSING') {
          processingText = this.add.text(0, -110, '⚡ 加工中', {
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#38bdf8',
            backgroundColor: 'rgba(8, 47, 73, 0.95)',
            padding: { x: 5, y: 2 }
          });
          processingText.setOrigin(0.5);
          container.add(processingText);
        }

        // 7. 互動點擊事件
        container.setSize(this.tileWidth * 0.85, this.tileHeight * 1.8);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
          const currentEntry = this.machineMap.get(machine.id);
          if (currentEntry?.sprite) currentEntry.sprite.setTint(0x38bdf8);
        });
        container.on('pointerout', () => {
          const currentEntry = this.machineMap.get(machine.id);
          if (currentEntry?.sprite) currentEntry.sprite.clearTint();
        });
        container.on('pointerup', (_pointer: Phaser.Input.Pointer) => {
          // 只有在非拖曳 (位移 <= 閾值) 狀況下才視為點擊機台，防止拖曳鏡頭時誤開面板
          if (this.totalDragDistance <= this.dragThreshold) {
            SoundEffects.playClick();
            if (this.onMachineClickCallback) {
              this.onMachineClickCallback(machine);
            }
          }
        });

        this.machineMap.set(machine.id, { container, ledArc, label, tpmText, processingText, sprite, fallback });
      } else {
        // 更新現有機台狀態與 LED
        // 如果之前是 fallback，但現在貼圖已就緒，即刻升級為 2.5D 精美 Sprite
        if (!entry.sprite && this.textures.exists(machine.modelId)) {
          if (entry.fallback) {
            entry.fallback.destroy();
            entry.fallback = undefined;
          }
          const sprite = this.add.image(0, -35, machine.modelId);
          const targetSize = this.tileWidth * 0.95;
          sprite.setDisplaySize(targetSize, targetSize);
          entry.container.addAt(sprite, 1);
          entry.sprite = sprite;
        }

        entry.ledArc.setFillStyle(this.getLEDColor(machine.status));
        entry.label.setText(`${machine.name} (${Math.round(machine.wear)}%)`);

        // 更新加工中徽章
        if (machine.status === 'PROCESSING') {
          if (!entry.processingText) {
            const pText = this.add.text(0, -110, '⚡ 加工中', {
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: '10px',
              fontStyle: 'bold',
              color: '#38bdf8',
              backgroundColor: 'rgba(8, 47, 73, 0.95)',
              padding: { x: 5, y: 2 }
            });
            pText.setOrigin(0.5);
            entry.container.add(pText);
            entry.processingText = pText;
          }
        } else if (entry.processingText) {
          entry.processingText.destroy();
          entry.processingText = undefined;
        }

        const assignedEng = machine.assignedEngineerId ? staffMap.get(machine.assignedEngineerId) : null;
        const tpmCheck = MaintenanceEngine.checkTPMConditions(machine, assignedEng);

        if (tpmCheck.isTPMActive && !entry.tpmText) {
          const tpmText = this.add.text(0, -125, '🛡️ TPM 零故障', {
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#10b981',
            backgroundColor: 'rgba(6, 78, 59, 0.9)',
            padding: { x: 5, y: 2 }
          });
          tpmText.setOrigin(0.5);
          entry.container.add(tpmText);
          entry.tpmText = tpmText;
        } else if (!tpmCheck.isTPMActive && entry.tpmText) {
          entry.tpmText.destroy();
          entry.tpmText = undefined;
        }
      }
    }
  }

  /**
   * 建立備用 2.5D 高科技等角機台幾何體 (當圖片載入未就緒時之平滑過渡)
   */
  private createFallbackMachineGraphic(machine: MachineData): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    const w = 60;
    const h = 50;

    // 顏色對應站點
    let color = 0x3b82f6; // 藍
    if (machine.category === 'LITHO') color = 0xf59e0b;
    if (machine.category === 'TRACK') color = 0x10b981;
    if (machine.category === 'ETCH') color = 0x8b5cf6;
    if (machine.category === 'DIFF') color = 0xec4899;
    if (machine.category === 'CMP') color = 0x06b6d4;

    // 頂面
    g.fillStyle(color, 0.9);
    g.beginPath();
    g.moveTo(0, -h - 20);
    g.lineTo(w / 2, -h - 10);
    g.lineTo(0, -h);
    g.lineTo(-w / 2, -h - 10);
    g.closePath();
    g.fillPath();

    // 左側面
    g.fillStyle(color, 0.7);
    g.beginPath();
    g.moveTo(-w / 2, -h - 10);
    g.lineTo(0, -h);
    g.lineTo(0, 0);
    g.lineTo(-w / 2, -10);
    g.closePath();
    g.fillPath();

    // 右側面
    g.fillStyle(color, 0.5);
    g.beginPath();
    g.moveTo(0, -h);
    g.lineTo(w / 2, -h - 10);
    g.lineTo(w / 2, -10);
    g.lineTo(0, 0);
    g.closePath();
    g.fillPath();

    return g;
  }

  private getLEDColor(status: MachineData['status']): number {
    switch (status) {
      case 'IDLE':
        return 0x10b981; // 綠
      case 'PROCESSING':
        return 0x06b6d4; // 藍呼吸
      case 'MAINTENANCE':
        return 0xf59e0b; // 黃閃
      case 'EXPLODED':
        return 0xef4444; // 紅警報
    }
  }

  /**
   * 生成穿著無塵衣的巡檢技術員 (Cleanroom Technicians)
   */
  private spawnTechnicians(): void {
    const techCount = Math.min(6, Math.max(2, this.saveGame.staff.length));
    for (let i = 0; i < techCount; i++) {
      const container = this.add.container(0, 0);
      container.setDepth(200);

      // 地面陰影
      const shadow = this.add.ellipse(0, 4, 18, 9, 0x000000, 0.35);
      container.add(shadow);

      if (this.textures.exists('tech_cleanroom')) {
        // 2.5D 卡通透明 Sprite
        const techSprite = this.add.image(0, -18, 'tech_cleanroom');
        techSprite.setDisplaySize(48, 48);
        container.add(techSprite);
      } else {
        // 無塵衣人形向量佔位
        const suit = this.add.circle(0, -12, 8, 0xf8fafc);
        const mask = this.add.rectangle(0, -12, 8, 4, 0x38bdf8);
        const body = this.add.rectangle(0, -4, 12, 12, 0xe2e8f0);
        container.add([body, suit, mask]);
      }

      const start = this.toScreen(2 + i, 3);
      container.setPosition(start.x, start.y);

      this.technicians.push({
        container,
        targetX: start.x,
        targetY: start.y,
        speed: 0.6 + Math.random() * 0.4
      });
    }
  }

  /**
   * 生成地面 AGV 無人搬運自走車 (AGV Wafer Carrier)
   */
  private spawnAGVCarriers(): void {
    if (!this.saveGame.unlockedFeatures.agv) return;
    for (let i = 0; i < 2; i++) {
      const container = this.add.container(0, 0);
      container.setDepth(205);

      const shadow = this.add.ellipse(0, 4, 24, 12, 0x000000, 0.4);
      container.add(shadow);

      if (this.textures.exists('agv_carrier')) {
        const agvSprite = this.add.image(0, -14, 'agv_carrier');
        agvSprite.setDisplaySize(54, 40);
        container.add(agvSprite);
      } else {
        const body = this.add.rectangle(0, -8, 28, 16, 0x0284c7);
        const foup = this.add.rectangle(0, -18, 16, 12, 0x10b981);
        const lidar = this.add.circle(10, -8, 3, 0xef4444);
        container.add([body, foup, lidar]);
      }

      const start = this.toScreen(1 + i * 3, 2);
      container.setPosition(start.x, start.y);

      this.agvCarriers.push({
        container,
        targetX: start.x,
        targetY: start.y,
        speed: 1.1 + i * 0.2
      });
    }
  }

  /**
   * 生成天花板 OHT 懸吊天車 (Overhead Hoist Transport Shuttle)
   */
  private spawnOHTShuttles(): void {
    const shuttle = this.add.container(0, -160);
    shuttle.setDepth(500);

    if (this.textures.exists('oht_shuttle')) {
      const ohtSprite = this.add.image(0, 16, 'oht_shuttle');
      ohtSprite.setDisplaySize(56, 42);
      shuttle.add(ohtSprite);
    } else {
      const railHanger = this.add.rectangle(0, 0, 8, 12, 0x475569);
      const body = this.add.rectangle(0, 10, 32, 18, 0x0ea5e9);
      const foup = this.add.rectangle(0, 22, 20, 16, 0x10b981);
      const led = this.add.circle(12, 10, 3, 0x22c55e);
      shuttle.add([railHanger, body, foup, led]);
    }

    const p1 = this.toScreen(1, 1);
    shuttle.setPosition(p1.x, p1.y - 160);

    this.ohtShuttles.push({
      container: shuttle,
      progress: 0,
      speed: 0.002
    });
  }

  /**
   * 每幀動畫更新：技術員走動與 OHT 天車沿天軌滑行
   */
  public update(_time: number, delta: number): void {
    // 1. OHT 天車滑行動畫
    const size = this.saveGame.facility.bayGridSize;
    const waypoints = [
      this.toScreen(1, 1),
      this.toScreen(size.width - 2, 1),
      this.toScreen(size.width - 2, size.height - 2),
      this.toScreen(1, size.height - 2)
    ];

    for (const oht of this.ohtShuttles) {
      oht.progress = (oht.progress + oht.speed * (delta / 16)) % 1;
      const totalPoints = waypoints.length;
      const segment = Math.floor(oht.progress * totalPoints);
      const nextSegment = (segment + 1) % totalPoints;
      const t = (oht.progress * totalPoints) % 1;

      const pA = waypoints[segment];
      const pB = waypoints[nextSegment];

      const curX = pA.x + (pB.x - pA.x) * t;
      const curY = pA.y + (pB.y - pA.y) * t - 160;

      oht.container.setPosition(curX, curY);
    }

    // 2. 技術員隨機走動巡檢
    for (const tech of this.technicians) {
      const dx = tech.targetX - tech.container.x;
      const dy = tech.targetY - tech.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 4) {
        // 到達目標，隨機選取新格點
        const randX = Math.floor(Math.random() * (size.width - 2)) + 1;
        const randY = Math.floor(Math.random() * (size.height - 2)) + 1;
        const nextPos = this.toScreen(randX, randY);
        tech.targetX = nextPos.x;
        tech.targetY = nextPos.y;
      } else {
        tech.container.x += (dx / dist) * tech.speed * (delta / 16);
        tech.container.y += (dy / dist) * tech.speed * (delta / 16);
      }
    }

    // 3. AGV 自走車地面巡檢穿梭
    for (const agv of this.agvCarriers) {
      const dx = agv.targetX - agv.container.x;
      const dy = agv.targetY - agv.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 4) {
        const randX = Math.floor(Math.random() * (size.width - 2)) + 1;
        const randY = Math.floor(Math.random() * (size.height - 2)) + 1;
        const nextPos = this.toScreen(randX, randY);
        agv.targetX = nextPos.x;
        agv.targetY = nextPos.y;
      } else {
        agv.container.x += (dx / dist) * agv.speed * (delta / 16);
        agv.container.y += (dy / dist) * agv.speed * (delta / 16);
      }
    }
  }

  /**
   * 滑鼠拖曳平移與滾輪縮放 (含拖曳死區與游標防呆)
   */
  private setupCameraControls(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.totalDragDistance = 0;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        if (!pointer.isDown || !pointer.leftButtonDown()) {
          this.isDragging = false;
          return;
        }

        const dx = pointer.x - this.dragStartX;
        const dy = pointer.y - this.dragStartY;
        this.totalDragDistance += Math.hypot(dx, dy);

        // 超過 deadzone 閾值才平移視角，避免點擊機台時微震動引發鏡頭飄移
        if (this.totalDragDistance > this.dragThreshold) {
          const damp = 0.85; // 阻尼係數，防止滑鼠移動過度敏感
          this.cameras.main.scrollX -= (dx * damp) / this.cameras.main.zoom;
          this.cameras.main.scrollY -= (dy * damp) / this.cameras.main.zoom;
        }

        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // 全域防呆：游標在 DOM 元素放開或焦點移出視窗時，強制清空拖曳狀態，絕不讓畫面吸附跟隨滑鼠
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    window.addEventListener('blur', () => {
      this.isDragging = false;
    });

    this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
      const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom - deltaY * 0.001, 0.5, 2.2);
      this.cameras.main.setZoom(newZoom);
    });
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    this.cameras.main.setSize(gameSize.width, gameSize.height);
  }

  /**
   * 刷新存檔資料 (由外部 GameSimulation 呼叫)
   */
  public updateState(state: SaveGameV2): void {
    this.saveGame = state;
    this.renderMachines();
    if (this.saveGame.unlockedFeatures.agv && this.agvCarriers.length === 0) {
      this.spawnAGVCarriers();
    }
  }
}
