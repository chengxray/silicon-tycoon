/**
 * Silicon Tycoon: Foundry Master - Type Definitions
 */

export type StationType = 'FILM' | 'LIT' | 'ETCH' | 'DIFF' | 'CMP';

export type MachineCategory = 'FILM' | 'TRACK' | 'LITHO' | 'ETCH' | 'DIFF' | 'CMP';

export type LitSubStep = 'COAT' | 'EXPOSE' | 'DEVELOP';

export type CleanroomPhase = 1 | 2 | 3 | 4;

export type K1TechLevel = 'BASE' | 'CAR' | 'OPC' | 'PSM' | 'SAQP';

export type StaffRank = 'Young Specialist' | 'Skilled Worker' | 'Senior Engineer' | 'Fellow';

export type ShiftMode = 'TWO_SHIFT' | 'THREE_SHIFT';

export type WorkShift = 'DAY' | 'SWING' | 'NIGHT' | 'OFF';

export type MachineStatus = 'IDLE' | 'PROCESSING' | 'MAINTENANCE' | 'EXPLODED';

export type LotStatus = 'PROCESSING' | 'WAITING_QTIME' | 'TRANSPORTING' | 'SCRAPPED' | 'COMPLETED';

export type OrderStatus = 'ACTIVE' | 'FULFILLED' | 'CANCELLED';

export interface PlayerProfile {
  companyName: string;
  ceoName: string;
  avatarId: string;
  cash: number;
  foundryTier: number; // 1 ~ 6
  popularity: number;
  unlockedK1: K1TechLevel;
  unlockedCleanroomClass: string;
  totalOrdersFulfilled?: number;
  totalWafersDelivered?: number;
  rdInvestedCash?: number;
  tutorialCompleted?: boolean;
}

export interface UnlockedFeatures {
  cmp: boolean;
  agv: boolean;
  oht: boolean;
  shrOht?: boolean;
  mesAutoDispatch: boolean;
  mixAndMatchLitho: boolean;
}

export interface FacilityState {
  cleanroomPhase: CleanroomPhase;
  bayGridSize: { width: number; height: number };
  yellowRoomTiles?: { x: number; y: number }[];
}

export interface MachineData {
  id: string;
  modelId: string;
  name: string;
  category: MachineCategory;
  tier: number;
  gridX: number;
  gridY: number;
  wear: number; // 0 ~ 100
  status: MachineStatus;
  assignedEngineerId: string | null;
  pairedTrackIds?: string[]; // Litho machines can bind matching Track units
}

export interface StaffData {
  id: string;
  name: string;
  rank: StaffRank;
  moduleSpecialty: MachineCategory;
  fatigue: number; // 0 ~ 100
  shiftMode: ShiftMode;
  workShift?: WorkShift; // 'DAY' | 'SWING' | 'NIGHT' | 'OFF'
  assignedMachineId: string | null;
  salary: number;
}

export interface LayerAllocation {
  layerIndex: number;
  layerType: string;
  targetCD: number;
  assignedMachineModelId: string;
}

export interface OrderData {
  id: string;
  clientName: string;
  nodeNm: number;
  layerCount: number;
  totalDies: number;
  goodDiesDelivered: number;
  nrePaid: number;
  unitPrice: number;
  urgencyMultiplier: number;
  deadlineGameTime: number;
  status: OrderStatus;
  layerAllocations?: LayerAllocation[];
}

export interface WaferLotData {
  lotId: string;
  orderId: string;
  waferCount: number; // 1 ~ 25
  currentStation: StationType;
  litSubStep?: LitSubStep; // 当处于 LIT 站时：'COAT' -> 'EXPOSE' -> 'DEVELOP'
  currentLayer: number;
  totalLayers: number;
  qTimeDeadline: number | null;
  yieldMultiplier: number;
  status: LotStatus;
  stationProgressSeconds?: number;
  stationRequiredSeconds?: number;
  hasYellowRoomViolation?: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  tier: number;
  currentValue: number;
  targetValue: number;
  rewardCash: number;
  rewardPopularity: number;
  completed: boolean;
  claimed: boolean;
}

export interface QuestState {
  lastDateStr: string;
  dailyQuests: DailyQuest[];
  allDailyClaimed: boolean;
  weeklyCompletedCount: number;
  weeklyTarget: number; // 15
  weeklyClaimed: boolean;
}

export interface AchievementItem {
  id: string;
  category: 'onboarding' | 'process' | 'operation' | 'yield';
  title: string;
  description: string;
  rewardCash: number;
  unlocked: boolean;
  claimed: boolean;
}

export interface UserProfileMeta {
  id: string;
  name: string;
  companyName: string;
  foundryTier: number;
  cash: number;
  createdAt: number;
  lastPlayedAt: number;
  storageKey: string;
}

export interface FinancialRecord {
  periodType: 'DAY' | 'WEEK' | 'MONTH';
  periodIndex: number;
  label: string;
  timestamp: number;
  revenue: {
    waferSales: number;
    nreFees: number;
    subsidies: number;
    totalRevenue: number;
  };
  expenses: {
    depreciation: number;
    maintenance: number;
    utilities: number;
    payroll: number;
    scraps: number;
    capex: number;
    totalExpenses: number;
  };
  grossProfit: number;
  grossMarginPct: number;
  netProfit: number;
  netMarginPct: number;
  endingCash: number;
  endingNetWorth: number;
}

export interface FinancialState {
  daySeconds: number;
  currentDay: number;
  currentWeek: number;
  currentMonth: number;
  currentDateStr?: string; // 現實世界同步日期 (YYYY-MM-DD)
  today: FinancialRecord;
  thisWeek: FinancialRecord;
  thisMonth: FinancialRecord;
  dailyHistory: FinancialRecord[];
  weeklyHistory: FinancialRecord[];
  monthlyHistory: FinancialRecord[];
  allTimeRevenue: number;
  allTimeExpenses: number;
  allTimeProfit: number;
}

export interface SaveGameV1 {
  schemaVersion: 1;
  savedAt: number;
  lastOnlineTimestamp: number;
  player: PlayerProfile;
  unlockedFeatures: Omit<UnlockedFeatures, 'mixAndMatchLitho'>;
  facility: FacilityState;
  machines: Omit<MachineData, 'pairedTrackIds'>[];
  staff: StaffData[];
  activeOrders: Omit<OrderData, 'layerAllocations'>[];
  activeLots: WaferLotData[];
  rollingYieldHistory: number[];
  clawbackDebt: number;
  gameTime: number;
}

export interface SaveGameV2 {
  schemaVersion: 2;
  savedAt: number;
  lastOnlineTimestamp: number;
  userId?: string;
  player: PlayerProfile;
  unlockedFeatures: UnlockedFeatures;
  facility: FacilityState;
  machines: MachineData[];
  staff: StaffData[];
  activeOrders: OrderData[];
  activeLots: WaferLotData[];
  rollingYieldHistory: number[];
  clawbackDebt: number;
  questState: QuestState;
  achievements: AchievementItem[];
  gameTime: number;
  financialState?: FinancialState;
}

