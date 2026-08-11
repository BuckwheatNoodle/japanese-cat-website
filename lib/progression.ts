import { z } from "zod"

// Keep the original key for an in-place v1/v2 -> v3 migration. The embedded
// version prevents an older writer from treating the compact v3 ledger as v1.
export const PROGRESSION_STORAGE_KEY = "miyuki-cat-progress-v1"
export const PROGRESSION_VERSION = 3 as const
export const DAILY_MISSION_ALGORITHM_VERSION = 1 as const
export const PROGRESSION_BACKUP_KIND = "miyuki-cat-cafe-backup" as const
export const MAX_BACKUP_CHARACTERS = 2_000_000
export const PROGRESSION_QUARANTINE_KEY = "miyuki-cat-progress-quarantine-v1"

const LEDGER_ACTIVE_LIMIT = 10_000
const LEDGER_EXACT_ARCHIVE_LIMIT = 10_000
const LEDGER_TOTAL_LIMIT = LEDGER_ACTIVE_LIMIT + LEDGER_EXACT_ARCHIVE_LIMIT
const LEDGER_TOKEN_HEX_LENGTH = 16
const LEDGER_ARCHIVE_ENTRY_LENGTH = 1 + (LEDGER_TOKEN_HEX_LENGTH * 2)
const LEDGER_EXACT_ARCHIVE_MAX_LENGTH = LEDGER_EXACT_ARCHIVE_LIMIT * LEDGER_ARCHIVE_ENTRY_LENGTH
const LEDGER_TOKEN_PREFIX = "d1:"
const LEDGER_TOKEN_PATTERN = /^d1:[0-9a-f]{32}$/
const LEGACY_LEDGER_TOKEN_PATTERN = /^(?:f1:|l1:)[0-9a-f]{16}$/
const LEDGER_HASH_OFFSET = BigInt("0xcbf29ce484222325")
const LEDGER_HASH_OFFSET_SECONDARY = BigInt("0x84222325cbf29ce4")
const LEDGER_HASH_PRIME = BigInt("0x100000001b3")
const LEDGER_HASH_MASK = BigInt("0xffffffffffffffff")

export type FontSize = "small" | "normal" | "large"
export type GameDifficulty = "gentle" | "standard" | "challenge"
export type CollectionKind = "cat" | "naokun-form"
export type RoomSlotId =
  | "wall"
  | "window"
  | "shelf"
  | "table"
  | "floorLeft"
  | "floorCenter"
  | "floorRight"

export type DailyMissionId =
  | "play-game"
  | "read-diary"
  | "draw-fortune"
  | "finish-coloring"

export type AccessibilitySettings = {
  fontSize: FontSize
  furigana: boolean
  readAloud: boolean
  reducedMotion: boolean
  highContrast: boolean
  soundEnabled: boolean
  bgmVolume: number
  sfxVolume: number
  difficulty: GameDifficulty
  skinId: string
}

export type CollectionUnlock = {
  unlockedAt: string
  sourceId?: string
}

export type AppStateV1 = {
  version: typeof PROGRESSION_VERSION
  savedAt: string
  wallet: {
    nyanCoins: number
    totalEarned: number
    totalSpent: number
  }
  stats: {
    gamesPlayed: number
    gamesWon: number
    coloringsCompleted: number
    fortunesDrawn: number
    diariesRead: number
    storyNodesCompleted: number
    gameHighScores: Record<string, number>
    completedColoringPageIds: string[]
    readDiaryDates: string[]
  }
  daily: {
    date: string
    algorithmVersion: typeof DAILY_MISSION_ALGORITHM_VERSION
    progress: Partial<Record<DailyMissionId, number>>
    claimedMissionIds: DailyMissionId[]
  }
  collections: {
    cats: Record<string, CollectionUnlock>
    naokunForms: Record<string, CollectionUnlock>
  }
  inventory: {
    ownedItemIds: string[]
  }
  room: {
    equipped: Partial<Record<RoomSlotId, string>>
  }
  story: {
    unlockedChapterIds: string[]
    completedNodeIds: string[]
    choices: Record<string, string>
  }
  settings: AccessibilitySettings
  ledger: {
    processedEventIds: string[]
    rewardIds: string[]
    processedEventArchive: string
    rewardArchive: string
  }
}

type EventMeta = {
  eventId: string
  occurredAt: string
}

export type DomainEvent =
  | (EventMeta & {
      type: "game.completed"
      gameId: string
      score: number
      won?: boolean
    })
  | (EventMeta & {
      type: "coloring.completed"
      pageId: string
    })
  | (EventMeta & {
      type: "fortune.drawn"
      fortuneId: string
    })
  | (EventMeta & {
      type: "diary.read"
      diaryDate: string
      catIds?: string[]
      naokunFormId?: string
    })
  | (EventMeta & {
      type: "collection.unlocked"
      collectionKind: CollectionKind
      collectionId: string
      sourceId?: string
    })
  | (EventMeta & {
      type: "mission.claimed"
      missionId: DailyMissionId
      missionDate: string
    })
  | (EventMeta & {
      type: "room.itemPurchased"
      itemId: string
    })
  | (EventMeta & {
      type: "room.itemEquipped"
      itemId: string
    })
  | (EventMeta & {
      type: "room.itemRemoved"
      slot: RoomSlotId
    })
  | (EventMeta & {
      type: "story.nodeCompleted"
      nodeId: string
      choiceId?: string
    })
  | (EventMeta & {
      type: "settings.updated"
      patch: Partial<AccessibilitySettings>
    })
  | (EventMeta & {
      type: "day.changed"
      date: string
    })

export type DailyMissionDefinition = {
  id: DailyMissionId
  title: string
  description: string
  goal: number
  reward: number
}

export type DailyMissionStatus = DailyMissionDefinition & {
  progress: number
  completed: boolean
  claimed: boolean
}

export type RoomItemDefinition = {
  id: string
  name: string
  description: string
  slot: RoomSlotId
  price: number
  assetKey: string
  starter?: boolean
}

export type StoryChoiceDefinition = {
  id: string
  label: string
}

export type StoryNodeDefinition = {
  id: string
  chapterId: string
  title: string
  summary: string
  reward: number
  choices?: StoryChoiceDefinition[]
  unlockChapterId?: string
}

export type StoryChapterDefinition = {
  id: string
  title: string
  description: string
  nodeIds: string[]
}

export type ProgressionBackupV1 = {
  kind: typeof PROGRESSION_BACKUP_KIND
  formatVersion: typeof PROGRESSION_VERSION
  exportedAt: string
  state: AppStateV1
}

export type StateHydrationResult = {
  state: AppStateV1
  source: "empty" | "current" | "legacy" | "recovered" | "future" | "protected"
  persistence: "write" | "read-only"
  warnings: string[]
}

export type BackupImportResult =
  | { ok: true; state: AppStateV1; warnings: string[] }
  | { ok: false; errors: string[] }

export type ActionCheck =
  | { ok: true }
  | { ok: false; reason: "already-owned" | "not-enough-coins" | "not-found" | "locked" | "not-complete" | "already-claimed" | "wrong-day" | "storage-capacity" | "read-only" }

const DAILY_MISSION_POOL: readonly DailyMissionDefinition[] = [
  {
    id: "play-game",
    title: "ゲームであそぼう",
    description: "好きなゲームを1回さいごまで遊ぼう",
    goal: 1,
    reward: 18,
  },
  {
    id: "read-diary",
    title: "日記をよもう",
    description: "美雪となおくんの日記を1つ読もう",
    goal: 1,
    reward: 12,
  },
  {
    id: "draw-fortune",
    title: "ねこみくじ",
    description: "今日のねこみくじを引こう",
    goal: 1,
    reward: 12,
  },
  {
    id: "finish-coloring",
    title: "ぬりえタイム",
    description: "ぬりえを1まい完成させよう",
    goal: 1,
    reward: 18,
  },
] as const

export const ROOM_ITEM_DEFINITIONS: readonly RoomItemDefinition[] = [
  { id: "wall-mint", name: "ミントのかべ", description: "クリームソーダ色のやさしい壁紙。", slot: "wall", price: 0, assetKey: "room/wall-mint", starter: true },
  { id: "wall-strawberry", name: "いちごミルクのかべ", description: "春みたいなピンクの壁紙。", slot: "wall", price: 55, assetKey: "room/wall-strawberry" },
  { id: "window-sunny", name: "ひなたのまど", description: "青空が見える明るい窓。", slot: "window", price: 0, assetKey: "room/window-sunny", starter: true },
  { id: "window-starry", name: "星空のまど", description: "きらきらの夜空を楽しめる窓。", slot: "window", price: 65, assetKey: "room/window-starry" },
  { id: "shelf-cups", name: "ねこカップの棚", description: "肉球カップをきれいに並べた棚。", slot: "shelf", price: 30, assetKey: "room/shelf-cups" },
  { id: "shelf-books", name: "ひみつの日記棚", description: "美雪の日記をしまえる本棚。", slot: "shelf", price: 45, assetKey: "room/shelf-books" },
  { id: "table-creamsoda", name: "クリームソーダテーブル", description: "さくらんぼ付きの人気メニュー。", slot: "table", price: 0, assetKey: "room/table-creamsoda", starter: true },
  { id: "table-pancakes", name: "ねこパンケーキ", description: "ねこの顔をしたふわふわパンケーキ。", slot: "table", price: 40, assetKey: "room/table-pancakes" },
  { id: "floor-yarn", name: "毛糸ボール", description: "ねこたちが夢中になる三色セット。", slot: "floorLeft", price: 20, assetKey: "room/floor-yarn" },
  { id: "floor-flowers", name: "お花のバスケット", description: "季節のお花が入ったかご。", slot: "floorLeft", price: 35, assetKey: "room/floor-flowers" },
  { id: "center-cat-tree", name: "ねこタワー", description: "みんなが集まるカフェの遊び場。", slot: "floorCenter", price: 70, assetKey: "room/center-cat-tree" },
  { id: "center-piano", name: "肉球ピアノ", description: "踏むとかわいい音が鳴る小さなピアノ。", slot: "floorCenter", price: 80, assetKey: "room/center-piano" },
  { id: "right-cat-bed", name: "ふかふかベッド", description: "お昼寝にぴったりの雲形ベッド。", slot: "floorRight", price: 25, assetKey: "room/right-cat-bed" },
  { id: "right-treasure", name: "なおくん宝箱", description: "なおくんが集めた変身グッズ入り。", slot: "floorRight", price: 60, assetKey: "room/right-treasure" },
] as const

export const STORY_CHAPTERS: readonly StoryChapterDefinition[] = [
  { id: "cafe-opening", title: "第1話　ねこカフェ開店！", description: "美雪とねこたちの、はじめての一日。", nodeIds: ["cafe-opening-1", "cafe-opening-2"] },
  { id: "lost-star", title: "第2話　なくした星のさくらんぼ", description: "夜のカフェで光る手がかりを探そう。", nodeIds: ["lost-star-1", "lost-star-2"] },
  { id: "festival-night", title: "第3話　にゃんこ夏まつり", description: "なおくんの変身でお祭りを盛り上げよう。", nodeIds: ["festival-night-1", "festival-night-2"] },
] as const

export const STORY_NODES: readonly StoryNodeDefinition[] = [
  { id: "cafe-opening-1", chapterId: "cafe-opening", title: "最初のお客さま", summary: "しましま店長といっしょに、開店の看板を出そう。", reward: 8, choices: [{ id: "kitchen", label: "キッチンを調べる" }, { id: "garden", label: "中庭を調べる" }] },
  { id: "cafe-opening-2", chapterId: "cafe-opening", title: "クリームソーダ大作戦", summary: "なおくんがカップに入り、まさかのクリームソーダうんちに変身！", reward: 100, choices: [{ id: "cherry-king-ending", label: "さくらんぼ王エンド" }, { id: "cat-hero-ending", label: "やさしい猫チームエンド" }], unlockChapterId: "lost-star" },
  { id: "lost-star-1", chapterId: "lost-star", title: "夜の足あと", summary: "くろまめの光る足あとをたどって、星のさくらんぼを探そう。", reward: 10, choices: [{ id: "window", label: "窓辺をさがす" }, { id: "shelf", label: "本棚をさがす" }] },
  { id: "lost-star-2", chapterId: "lost-star", title: "うちゅうへ出発", summary: "うちゅううんちになったなおくんが、さくらんぼを連れて帰る。", reward: 20, choices: [{ id: "moon-ending", label: "月あかりお迎えエンド" }, { id: "comet-ending", label: "ロボット船長エンド" }], unlockChapterId: "festival-night" },
  { id: "festival-night-1", chapterId: "festival-night", title: "屋台のお手伝い", summary: "ねこパンケーキをきれいに並べよう。", reward: 12, choices: [{ id: "cats", label: "ねこ形にならべる" }, { id: "stars", label: "星形にならべる" }] },
  { id: "festival-night-2", chapterId: "festival-night", title: "うんち王のパレード", summary: "王冠をかぶったなおくんと、みんなでフィナーレ！", reward: 25, choices: [{ id: "music-ending", label: "にゃんこ大合奏エンド" }, { id: "art-ending", label: "夜空の音符エンド" }] },
] as const

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const nonNegativeInteger = z.number().finite().int().min(0).max(1_000_000_000)
const safeId = z.string().trim().min(1).max(160)
const safeDateTime = z.string().trim().min(1).max(80)
const dailyMissionIdSchema = z.enum(["play-game", "read-diary", "draw-fortune", "finish-coloring"])
const roomSlotSchema = z.enum(["wall", "window", "shelf", "table", "floorLeft", "floorCenter", "floorRight"])

const settingsSchema = z.object({
  fontSize: z.enum(["small", "normal", "large"]).default("normal"),
  furigana: z.boolean().default(false),
  readAloud: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  soundEnabled: z.boolean().default(true),
  bgmVolume: z.number().finite().min(0).max(1).default(0.35),
  sfxVolume: z.number().finite().min(0).max(1).default(0.7),
  difficulty: z.enum(["gentle", "standard", "challenge"]).default("standard"),
  skinId: z.string().trim().min(1).max(80).default("cream-soda"),
})

const collectionUnlockSchema = z.object({
  unlockedAt: safeDateTime,
  sourceId: safeId.optional(),
})

const ledgerArchiveSchema = z.string()
  .max(LEDGER_EXACT_ARCHIVE_MAX_LENGTH)
  .refine(isLedgerExactArchive, "Invalid compact ledger archive")

const appStateSchema = z.object({
  version: z.literal(PROGRESSION_VERSION),
  savedAt: safeDateTime,
  wallet: z.object({
    nyanCoins: nonNegativeInteger.default(60),
    totalEarned: nonNegativeInteger.default(60),
    totalSpent: nonNegativeInteger.default(0),
  }),
  stats: z.object({
    gamesPlayed: nonNegativeInteger.default(0),
    gamesWon: nonNegativeInteger.default(0),
    coloringsCompleted: nonNegativeInteger.default(0),
    fortunesDrawn: nonNegativeInteger.default(0),
    diariesRead: nonNegativeInteger.default(0),
    storyNodesCompleted: nonNegativeInteger.default(0),
    gameHighScores: z.record(nonNegativeInteger).default({}),
    completedColoringPageIds: z.array(safeId).max(500).default([]),
    readDiaryDates: z.array(dateKeySchema).max(1_000).default([]),
  }),
  daily: z.object({
    date: dateKeySchema,
    algorithmVersion: z.literal(DAILY_MISSION_ALGORITHM_VERSION),
    progress: z.record(dailyMissionIdSchema, nonNegativeInteger).default({}),
    claimedMissionIds: z.array(dailyMissionIdSchema).max(4).default([]),
  }),
  collections: z.object({
    cats: z.record(collectionUnlockSchema).default({}),
    naokunForms: z.record(collectionUnlockSchema).default({}),
  }),
  inventory: z.object({
    ownedItemIds: z.array(safeId).max(500).default([]),
  }),
  room: z.object({
    equipped: z.record(roomSlotSchema, safeId).default({}),
  }),
  story: z.object({
    unlockedChapterIds: z.array(safeId).max(100).default([]),
    completedNodeIds: z.array(safeId).max(500).default([]),
    choices: z.record(safeId).default({}),
  }),
  settings: settingsSchema,
  ledger: z.object({
    processedEventIds: z.array(safeId).max(LEDGER_ACTIVE_LIMIT).default([]),
    rewardIds: z.array(safeId).max(LEDGER_ACTIVE_LIMIT).default([]),
    processedEventArchive: ledgerArchiveSchema.default(""),
    rewardArchive: ledgerArchiveSchema.default(""),
  }),
})

const backupSchema = z.object({
  kind: z.literal(PROGRESSION_BACKUP_KIND),
  formatVersion: z.union([z.literal(1), z.literal(2), z.literal(PROGRESSION_VERSION)]),
  exportedAt: safeDateTime,
  state: z.unknown(),
})

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: "normal",
  furigana: false,
  readAloud: false,
  reducedMotion: false,
  highContrast: false,
  soundEnabled: true,
  bgmVolume: 0.35,
  sfxVolume: 0.7,
  difficulty: "standard",
  skinId: "cream-soda",
}

const STARTER_ITEM_IDS = ROOM_ITEM_DEFINITIONS.filter((item) => item.starter).map((item) => item.id)
const CAT_COLLECTION_IDS = new Set([
  "cat-maron", "cat-yuki", "cat-mike", "cat-kuro", "cat-tora",
  "cat-sora", "cat-kinako", "cat-chibi", "cat-latte", "cat-sakura",
])
const NAOKUN_FORM_IDS = new Set([
  "naokun-poop-classic", "naokun-poop-soda", "naokun-poop-gold", "naokun-poop-rainbow",
  "naokun-poop-chef", "naokun-poop-bakery", "naokun-poop-ninja", "naokun-poop-detective",
  "naokun-poop-pirate", "naokun-poop-space", "naokun-poop-samurai", "naokun-poop-snowman",
  "naokun-poop-sakura", "naokun-poop-pumpkin", "naokun-poop-mermaid", "naokun-poop-princess",
  "naokun-poop-robot", "naokun-poop-music", "naokun-poop-artist", "naokun-poop-cactus",
  "naokun-poop-cake", "naokun-poop-hero", "naokun-poop-ghost", "naokun-poop-cat",
])
const ROOM_ITEM_BY_ID = new Map(ROOM_ITEM_DEFINITIONS.map((item) => [item.id, item]))
const STORY_NODE_BY_ID = new Map(STORY_NODES.map((node) => [node.id, node]))
const SKIN_IDS = new Set(["season-auto", "cream-soda", "spring-strawberry", "summer-soda", "autumn-caramel", "winter-berry"])

function pickKnownUnlocks(
  source: Record<string, CollectionUnlock>,
  knownIds: ReadonlySet<string>,
): Record<string, CollectionUnlock> {
  return Object.fromEntries(Object.entries(source).filter(([id]) => knownIds.has(id)))
}

function sanitizeStateReferences(state: AppStateV1): { state: AppStateV1; changed: boolean } {
  const ownedItemIds = unique([
    ...STARTER_ITEM_IDS,
    ...state.inventory.ownedItemIds.filter((id) => ROOM_ITEM_BY_ID.has(id)),
  ])
  const owned = new Set(ownedItemIds)
  const equipped = Object.fromEntries(Object.entries(state.room.equipped).filter(([slot, itemId]) => {
    const item = typeof itemId === "string" ? ROOM_ITEM_BY_ID.get(itemId) : undefined
    return Boolean(item && item.slot === slot && owned.has(item.id))
  })) as Partial<Record<RoomSlotId, string>>

  const completedNodeIds: string[] = []
  const unlockedChapterIds: string[] = []
  const choices: Record<string, string> = {}
  for (const chapter of STORY_CHAPTERS) {
    if (chapter.id !== "cafe-opening") {
      const previousChapter = STORY_CHAPTERS[STORY_CHAPTERS.indexOf(chapter) - 1]
      const previousFinal = previousChapter?.nodeIds.at(-1)
      if (!previousFinal || !completedNodeIds.includes(previousFinal)) break
    }
    unlockedChapterIds.push(chapter.id)
    for (const nodeId of chapter.nodeIds) {
      if (!state.story.completedNodeIds.includes(nodeId)) break
      const node = STORY_NODE_BY_ID.get(nodeId)
      const nodeChoices = node?.choices ?? []
      if (nodeChoices.length > 0) {
        const choice = state.story.choices[nodeId]
        if (!nodeChoices.some((candidate) => candidate.id === choice)) break
        choices[nodeId] = choice
      }
      completedNodeIds.push(nodeId)
    }
  }

  const next: AppStateV1 = {
    ...state,
    stats: {
      ...state.stats,
      storyNodesCompleted: completedNodeIds.length,
    },
    collections: {
      cats: pickKnownUnlocks(state.collections.cats, CAT_COLLECTION_IDS),
      naokunForms: pickKnownUnlocks(state.collections.naokunForms, NAOKUN_FORM_IDS),
    },
    inventory: { ownedItemIds },
    room: { equipped },
    story: { unlockedChapterIds, completedNodeIds, choices },
    settings: {
      ...state.settings,
      furigana: false,
      skinId: SKIN_IDS.has(state.settings.skinId) ? state.settings.skinId : "cream-soda",
    },
  }
  const before = JSON.stringify({
    collections: state.collections,
    inventory: state.inventory,
    room: state.room,
    story: state.story,
    storyNodesCompleted: state.stats.storyNodesCompleted,
    skinId: state.settings.skinId,
  })
  const after = JSON.stringify({
    collections: next.collections,
    inventory: next.inventory,
    room: next.room,
    story: next.story,
    storyNodesCompleted: next.stats.storyNodesCompleted,
    skinId: next.settings.skinId,
  })
  return { state: next, changed: before !== after }
}

function nowIso() {
  return new Date().toISOString()
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function dateKeyFromDateTime(value: string, fallback: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : getLocalDateKey(date)
}

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isSafeDomainId(value: unknown): value is string {
  return typeof value === "string"
    && value.trim().length > 0
    && value.length <= 160
    && value !== "__proto__"
    && value !== "prototype"
    && value !== "constructor"
}

export function createInitialAppState(dateKey = getLocalDateKey(), timestamp = nowIso()): AppStateV1 {
  const safeDateKey = isDateKey(dateKey) ? dateKey : getLocalDateKey()
  return {
    version: PROGRESSION_VERSION,
    savedAt: timestamp,
    wallet: { nyanCoins: 60, totalEarned: 60, totalSpent: 0 },
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      coloringsCompleted: 0,
      fortunesDrawn: 0,
      diariesRead: 0,
      storyNodesCompleted: 0,
      gameHighScores: {},
      completedColoringPageIds: [],
      readDiaryDates: [],
    },
    daily: {
      date: safeDateKey,
      algorithmVersion: DAILY_MISSION_ALGORITHM_VERSION,
      progress: {},
      claimedMissionIds: [],
    },
    collections: {
      cats: { "cat-maron": { unlockedAt: timestamp, sourceId: "starter" } },
      naokunForms: {},
    },
    inventory: { ownedItemIds: [...STARTER_ITEM_IDS] },
    room: {
      equipped: {
        wall: "wall-mint",
        window: "window-sunny",
        table: "table-creamsoda",
      },
    },
    story: {
      unlockedChapterIds: ["cafe-opening"],
      completedNodeIds: [],
      choices: {},
    },
    settings: { ...DEFAULT_SETTINGS },
    ledger: {
      processedEventIds: [],
      rewardIds: [toLedgerToken("starter-coins")],
      processedEventArchive: "",
      rewardArchive: "",
    },
  }
}

function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)]
}

function arraysEqual<T>(left: readonly T[], right: readonly T[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function hashLedgerValue(value: string, offset: bigint): string {
  let hash = offset
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    hash ^= BigInt(codeUnit & 0xff)
    hash = (hash * LEDGER_HASH_PRIME) & LEDGER_HASH_MASK
    hash ^= BigInt(codeUnit >>> 8)
    hash = (hash * LEDGER_HASH_PRIME) & LEDGER_HASH_MASK
  }
  return hash.toString(16).padStart(LEDGER_TOKEN_HEX_LENGTH, "0")
}

function toLedgerToken(value: string): string {
  if (LEDGER_TOKEN_PATTERN.test(value)) return value
  if (LEGACY_LEDGER_TOKEN_PATTERN.test(value)) return `l1:${value.slice(3)}`
  const primary = hashLedgerValue(value, LEDGER_HASH_OFFSET)
  const secondary = hashLedgerValue(value, LEDGER_HASH_OFFSET_SECONDARY)
  return `${LEDGER_TOKEN_PREFIX}${primary}${secondary}`
}

function ledgerLookupTokens(value: string): string[] {
  const token = toLedgerToken(value)
  if (token.startsWith("l1:")) return [token]
  if (LEDGER_TOKEN_PATTERN.test(value)) return [token]
  return [token, `l1:${token.slice(LEDGER_TOKEN_PREFIX.length, LEDGER_TOKEN_PREFIX.length + LEDGER_TOKEN_HEX_LENGTH)}`]
}

function uniqueNewest<T>(items: readonly T[]): T[] {
  const seen = new Set<T>()
  const newestFirst: T[] = []
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const value = items[index]
    if (seen.has(value)) continue
    seen.add(value)
    newestFirst.push(value)
  }
  return newestFirst.reverse()
}

function archiveEntryForToken(value: string): string {
  const token = toLedgerToken(value)
  if (token.startsWith("l1:")) return `l${token.slice(3)}${"0".repeat(LEDGER_TOKEN_HEX_LENGTH)}`
  return `d${token.slice(LEDGER_TOKEN_PREFIX.length)}`
}

function tokenFromArchiveEntry(entry: string): string {
  return entry.startsWith("l")
    ? `l1:${entry.slice(1, 1 + LEDGER_TOKEN_HEX_LENGTH)}`
    : `${LEDGER_TOKEN_PREFIX}${entry.slice(1)}`
}

function isLedgerArchiveShape(value: unknown): value is string {
  if (typeof value !== "string" || value.length % LEDGER_ARCHIVE_ENTRY_LENGTH !== 0) return false
  for (let index = 0; index < value.length; index += LEDGER_ARCHIVE_ENTRY_LENGTH) {
    const entry = value.slice(index, index + LEDGER_ARCHIVE_ENTRY_LENGTH)
    if (/^d[0-9a-f]{32}$/.test(entry)) continue
    if (/^l[0-9a-f]{16}0{16}$/.test(entry)) continue
    return false
  }
  return true
}

function isLedgerExactArchive(value: unknown): value is string {
  return typeof value === "string"
    && value.length <= LEDGER_EXACT_ARCHIVE_MAX_LENGTH
    && isLedgerArchiveShape(value)
}

function exactArchiveTokens(archive: string): string[] {
  return Array.from(
    { length: archive.length / LEDGER_ARCHIVE_ENTRY_LENGTH },
    (_, index) => tokenFromArchiveEntry(archive.slice(
      index * LEDGER_ARCHIVE_ENTRY_LENGTH,
      (index + 1) * LEDGER_ARCHIVE_ENTRY_LENGTH,
    )),
  )
}

const LEDGER_CAPACITY_ERROR = Symbol("progression-ledger-capacity")
type CompactLedger = { ids: string[]; archive: string }

function compactLedger(items: readonly string[], archive: string): CompactLedger {
  const tokens = uniqueNewest([...exactArchiveTokens(archive), ...items.map(toLedgerToken)])
  if (tokens.length > LEDGER_TOTAL_LIMIT) throw LEDGER_CAPACITY_ERROR
  const archiveCount = Math.max(0, tokens.length - LEDGER_ACTIVE_LIMIT)
  return {
    ids: tokens.slice(archiveCount),
    archive: tokens.slice(0, archiveCount).map(archiveEntryForToken).join(""),
  }
}

function ledgerContains(items: readonly string[], archive: string, value: string): boolean {
  const stored = new Set([...items.map(toLedgerToken), ...exactArchiveTokens(archive)])
  return ledgerLookupTokens(value).some((token) => stored.has(token))
}

function appendLedgerValue(items: readonly string[], archive: string, value: string): CompactLedger {
  if (ledgerContains(items, archive, value)) return compactLedger(items, archive)
  return compactLedger([...items, value], archive)
}

function normalizeLedger(state: AppStateV1): AppStateV1 {
  const processed = compactLedger(state.ledger.processedEventIds, state.ledger.processedEventArchive)
  const rewards = compactLedger(state.ledger.rewardIds, state.ledger.rewardArchive)
  if (
    arraysEqual(processed.ids, state.ledger.processedEventIds)
    && arraysEqual(rewards.ids, state.ledger.rewardIds)
    && processed.archive === state.ledger.processedEventArchive
    && rewards.archive === state.ledger.rewardArchive
  ) return state

  return {
    ...state,
    ledger: {
      processedEventIds: processed.ids,
      rewardIds: rewards.ids,
      processedEventArchive: processed.archive,
      rewardArchive: rewards.archive,
    },
  }
}

export function hasProcessedEvent(state: AppStateV1, eventId: string): boolean {
  return ledgerContains(state.ledger.processedEventIds, state.ledger.processedEventArchive, eventId)
}

function ledgerEntryCount(ids: readonly string[], archive: string): number {
  return ids.length + (archive.length / LEDGER_ARCHIVE_ENTRY_LENGTH)
}

export function isProgressionLedgerAtCapacity(state: AppStateV1): boolean {
  return ledgerEntryCount(state.ledger.processedEventIds, state.ledger.processedEventArchive) >= LEDGER_TOTAL_LIMIT
    || ledgerEntryCount(state.ledger.rewardIds, state.ledger.rewardArchive) >= LEDGER_TOTAL_LIMIT
}

export function getProgressionWriteBlockReason(
  state: AppStateV1,
  eventId: string,
  readOnly: boolean,
): "read-only" | "storage-capacity" | null {
  if (readOnly) return "read-only"
  if (!hasProcessedEvent(state, eventId) && isProgressionLedgerAtCapacity(state)) return "storage-capacity"
  return null
}

function includesLedgerHistory(
  candidateIds: readonly string[],
  candidateArchive: string,
  currentIds: readonly string[],
  currentArchive: string,
): boolean {
  const candidateStored = new Set([...candidateIds.map(toLedgerToken), ...exactArchiveTokens(candidateArchive)])
  return [...currentIds, ...exactArchiveTokens(currentArchive)].every((value) => (
    ledgerLookupTokens(value).some((token) => candidateStored.has(token))
  ))
}

export function includesProgressionLedger(candidate: AppStateV1, current: AppStateV1): boolean {
  return includesLedgerHistory(
    candidate.ledger.processedEventIds,
    candidate.ledger.processedEventArchive,
    current.ledger.processedEventIds,
    current.ledger.processedEventArchive,
  ) && includesLedgerHistory(
    candidate.ledger.rewardIds,
    candidate.ledger.rewardArchive,
    current.ledger.rewardIds,
    current.ledger.rewardArchive,
  )
}

function newestTimestamp(previous: string, candidate: string): string {
  const previousTime = new Date(previous).getTime()
  const candidateTime = new Date(candidate).getTime()
  if (Number.isNaN(candidateTime)) return previous
  if (Number.isNaN(previousTime)) return candidate
  return candidateTime >= previousTime ? candidate : previous
}

function hashText(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededOrder<T extends { id: string }>(items: readonly T[], seed: string): T[] {
  return [...items].sort((left, right) => {
    const leftHash = hashText(`${seed}:${left.id}`)
    const rightHash = hashText(`${seed}:${right.id}`)
    return leftHash - rightHash || left.id.localeCompare(right.id)
  })
}

export function getDailyMissionDefinitions(dateKey: string): DailyMissionDefinition[] {
  const safeDateKey = isDateKey(dateKey) ? dateKey : getLocalDateKey()
  return seededOrder(DAILY_MISSION_POOL, `${safeDateKey}:v${DAILY_MISSION_ALGORITHM_VERSION}`).slice(0, 3)
}

export function getDailyMissionStatuses(state: AppStateV1, dateKey = state.daily.date): DailyMissionStatus[] {
  const isCurrentStateDay = state.daily.date === dateKey
  return getDailyMissionDefinitions(dateKey).map((mission) => {
    const progress = isCurrentStateDay ? Math.min(mission.goal, state.daily.progress[mission.id] ?? 0) : 0
    return {
      ...mission,
      progress,
      completed: progress >= mission.goal,
      claimed: isCurrentStateDay && state.daily.claimedMissionIds.includes(mission.id),
    }
  })
}

export function ensureDailyState(state: AppStateV1, dateKey: string): AppStateV1 {
  if (!isDateKey(dateKey) || dateKey <= state.daily.date) return state
  return {
    ...state,
    daily: {
      date: dateKey,
      algorithmVersion: DAILY_MISSION_ALGORITHM_VERSION,
      progress: {},
      claimedMissionIds: [],
    },
  }
}

function incrementMission(state: AppStateV1, missionId: DailyMissionId): AppStateV1 {
  const mission = getDailyMissionDefinitions(state.daily.date).find((item) => item.id === missionId)
  if (!mission) return state
  const current = state.daily.progress[missionId] ?? 0
  if (current >= mission.goal) return state
  return {
    ...state,
    daily: {
      ...state.daily,
      progress: { ...state.daily.progress, [missionId]: Math.min(mission.goal, current + 1) },
    },
  }
}

function applyReward(state: AppStateV1, rewardId: string, amount: number): AppStateV1 {
  if (amount <= 0 || ledgerContains(state.ledger.rewardIds, state.ledger.rewardArchive, rewardId)) return state
  const rewards = appendLedgerValue(state.ledger.rewardIds, state.ledger.rewardArchive, rewardId)
  return {
    ...state,
    wallet: {
      ...state.wallet,
      nyanCoins: state.wallet.nyanCoins + amount,
      totalEarned: state.wallet.totalEarned + amount,
    },
    ledger: {
      ...state.ledger,
      rewardIds: rewards.ids,
      rewardArchive: rewards.archive,
    },
  }
}

function unlockCollection(
  state: AppStateV1,
  kind: CollectionKind,
  collectionId: string,
  unlockedAt: string,
  sourceId?: string,
): AppStateV1 {
  const key = kind === "cat" ? "cats" : "naokunForms"
  if (!isSafeDomainId(collectionId)) return state
  if (state.collections[key][collectionId]) return state
  const next = {
    ...state,
    collections: {
      ...state.collections,
      [key]: {
        ...state.collections[key],
        [collectionId]: { unlockedAt, ...(isSafeDomainId(sourceId) ? { sourceId } : {}) },
      },
    },
  }
  return applyReward(next, `collection:${kind}:${collectionId}`, 4)
}

function unlockMilestoneCollections(
  current: AppStateV1,
  event: DomainEvent,
  unlockedAt: string,
): AppStateV1 {
  let state = unlockCollection(current, "cat", "cat-maron", unlockedAt, "starter")
  const unlockCat = (id: string, source: string) => {
    state = unlockCollection(state, "cat", id, unlockedAt, source)
  }
  const unlockNaokun = (id: string, source: string) => {
    state = unlockCollection(state, "naokun-form", id, unlockedAt, source)
  }

  const distinctDiaryCount = state.stats.readDiaryDates.length
  const gameIds = Object.keys(state.stats.gameHighScores)
  const equippedItemIds = Object.values(state.room.equipped)
  const claimedMissionCount = state.daily.claimedMissionIds.length

  if (state.stats.fortunesDrawn >= 1) {
    unlockCat("cat-yuki", "fortune")
    unlockNaokun("naokun-poop-soda", "fortune")
  }
  if (distinctDiaryCount >= 1) unlockNaokun("naokun-poop-classic", "diary-1")
  if (distinctDiaryCount >= 3) unlockCat("cat-mike", "diary-3")
  if (distinctDiaryCount >= 5) unlockNaokun("naokun-poop-bakery", "diary-5")
  if (distinctDiaryCount >= 10) unlockNaokun("naokun-poop-cake", "diary-10")

  if (gameIds.includes("memory")) {
    unlockCat("cat-kuro", "game-memory")
    unlockNaokun("naokun-poop-ninja", "game-memory")
  }
  if (state.stats.gamesWon >= 1) unlockCat("cat-tora", "game-win")
  if (state.stats.gamesPlayed >= 5) unlockNaokun("naokun-poop-rainbow", "games-5")
  if ((state.stats.gameHighScores.quiz ?? 0) >= 5_000) unlockNaokun("naokun-poop-detective", "quiz-score")
  if ((state.stats.gameHighScores.rescue ?? 0) >= 10) unlockNaokun("naokun-poop-samurai", "rescue-score")
  if ((state.stats.gameHighScores.simon ?? 0) >= 6) unlockNaokun("naokun-poop-space", "simon-level")
  if (gameIds.length >= 3) unlockNaokun("naokun-poop-robot", "games-3-kinds")
  if (state.stats.gamesPlayed >= 2 && state.settings.soundEnabled) unlockNaokun("naokun-poop-music", "games-with-sound")

  if (state.stats.coloringsCompleted >= 1) {
    unlockCat("cat-kinako", "coloring-1")
    unlockNaokun("naokun-poop-mermaid", "coloring-1")
  }
  if (state.stats.coloringsCompleted >= 3) unlockNaokun("naokun-poop-artist", "coloring-3")

  if (equippedItemIds.length >= 4) unlockCat("cat-sora", "room-4-slots")
  if (equippedItemIds.includes("floor-flowers")) unlockNaokun("naokun-poop-cactus", "room-flowers")
  if (state.wallet.totalSpent >= 60) unlockCat("cat-sakura", "room-special")
  if (event.type === "room.itemEquipped") {
    const item = ROOM_ITEM_DEFINITIONS.find((candidate) => candidate.id === event.itemId)
    if (item?.slot === "table") unlockNaokun("naokun-poop-chef", "room-table")
  }

  if (claimedMissionCount >= 1) unlockNaokun("naokun-poop-gold", "mission-claim")
  if (claimedMissionCount >= 2) unlockCat("cat-latte", "missions-2")

  if (state.stats.storyNodesCompleted >= 1) unlockCat("cat-chibi", "story-1")
  if (state.story.choices["cafe-opening-2"] === "cherry-king-ending") unlockNaokun("naokun-poop-gold", "story-cherry-king")
  if (state.story.choices["cafe-opening-2"] === "cat-hero-ending") unlockNaokun("naokun-poop-hero", "story-cat-hero")
  if (state.story.choices["lost-star-2"] === "moon-ending") unlockNaokun("naokun-poop-space", "story-moon-ending")
  if (state.story.choices["lost-star-2"] === "comet-ending") unlockNaokun("naokun-poop-robot", "story-comet-ending")
  if (state.story.choices["festival-night-2"] === "music-ending") unlockNaokun("naokun-poop-music", "story-music-ending")
  if (state.story.choices["festival-night-2"] === "art-ending") unlockNaokun("naokun-poop-artist", "story-art-ending")

  if (state.settings.skinId === "spring-strawberry") unlockNaokun("naokun-poop-sakura", "skin-spring")
  if (state.settings.skinId === "autumn-caramel") unlockNaokun("naokun-poop-pumpkin", "skin-autumn")
  if (state.settings.skinId === "winter-berry") unlockNaokun("naokun-poop-snowman", "skin-winter")

  const discoveredCount = Object.keys(state.collections.cats).length + Object.keys(state.collections.naokunForms).length
  if (discoveredCount >= 10) unlockNaokun("naokun-poop-princess", "collections-10")
  if (Object.keys(state.collections.cats).length >= 10) unlockNaokun("naokun-poop-cat", "all-cats")

  return state
}

function markEventProcessed(state: AppStateV1, eventId: string, occurredAt: string): AppStateV1 {
  const processed = appendLedgerValue(state.ledger.processedEventIds, state.ledger.processedEventArchive, eventId)
  return {
    ...state,
    savedAt: newestTimestamp(state.savedAt, occurredAt),
    ledger: {
      ...state.ledger,
      processedEventIds: processed.ids,
      processedEventArchive: processed.archive,
    },
  }
}

function normalizedSettingsPatch(patch: Partial<AccessibilitySettings>): Partial<AccessibilitySettings> {
  const candidate = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...patch })
  if (!candidate.success) return {}
  const safe = candidate.data
  const keys = Object.keys(patch) as (keyof AccessibilitySettings)[]
  return Object.fromEntries(keys.map((key) => [key, safe[key]])) as Partial<AccessibilitySettings>
}

export function reduceProgression(previousState: AppStateV1, event: DomainEvent): AppStateV1 {
  if (!isSafeDomainId(event.eventId) || hasProcessedEvent(previousState, event.eventId)) {
    return previousState
  }
  if (isProgressionLedgerAtCapacity(previousState)) return previousState

  try {
    const normalizedPreviousState = normalizeLedger(previousState)
  const fallbackDate = normalizedPreviousState.daily.date
  const occurredAt = Number.isNaN(new Date(event.occurredAt).getTime()) ? normalizedPreviousState.savedAt : event.occurredAt
  const requestedEventDate = event.type === "day.changed" && isDateKey(event.date)
    ? event.date
    : dateKeyFromDateTime(occurredAt, fallbackDate)
  const eventDate = requestedEventDate < normalizedPreviousState.daily.date ? normalizedPreviousState.daily.date : requestedEventDate
  const countsTowardDaily = requestedEventDate >= normalizedPreviousState.daily.date
  let state = ensureDailyState(normalizedPreviousState, eventDate)
  const incrementCurrentMission = (current: AppStateV1, missionId: DailyMissionId) => (
    countsTowardDaily ? incrementMission(current, missionId) : current
  )

  switch (event.type) {
    case "game.completed": {
      if (!isSafeDomainId(event.gameId)) break
      const score = Number.isFinite(event.score) ? Math.max(0, Math.round(event.score)) : 0
      state = {
        ...state,
        stats: {
          ...state.stats,
          gamesPlayed: state.stats.gamesPlayed + 1,
          gamesWon: state.stats.gamesWon + (event.won ? 1 : 0),
          gameHighScores: {
            ...state.stats.gameHighScores,
            [event.gameId]: Math.max(state.stats.gameHighScores[event.gameId] ?? 0, score),
          },
        },
      }
      state = incrementCurrentMission(state, "play-game")
      state = applyReward(state, `activity:${event.eventId}`, event.won ? 8 : 5)
      break
    }
    case "coloring.completed": {
      if (!isSafeDomainId(event.pageId)) break
      const isFirstCompletion = !state.stats.completedColoringPageIds.includes(event.pageId)
      state = {
        ...state,
        stats: {
          ...state.stats,
          coloringsCompleted: state.stats.coloringsCompleted + 1,
          completedColoringPageIds: isFirstCompletion
            ? [...state.stats.completedColoringPageIds, event.pageId]
            : state.stats.completedColoringPageIds,
        },
      }
      state = incrementCurrentMission(state, "finish-coloring")
      state = applyReward(state, `coloring:${event.pageId}`, 12)
      break
    }
    case "fortune.drawn": {
      state = {
        ...state,
        stats: { ...state.stats, fortunesDrawn: state.stats.fortunesDrawn + 1 },
      }
      state = incrementCurrentMission(state, "draw-fortune")
      state = applyReward(state, `fortune:${requestedEventDate}`, 6)
      break
    }
    case "diary.read": {
      if (!isDateKey(event.diaryDate)) break
      const isFirstRead = !state.stats.readDiaryDates.includes(event.diaryDate)
      state = {
        ...state,
        stats: {
          ...state.stats,
          diariesRead: state.stats.diariesRead + 1,
          readDiaryDates: isFirstRead ? [...state.stats.readDiaryDates, event.diaryDate] : state.stats.readDiaryDates,
        },
      }
      state = incrementCurrentMission(state, "read-diary")
      state = applyReward(state, `diary:${event.diaryDate}`, 4)
      for (const catId of unique(event.catIds ?? [])) {
        state = unlockCollection(state, "cat", catId, occurredAt, `diary:${event.diaryDate}`)
      }
      if (event.naokunFormId) {
        state = unlockCollection(state, "naokun-form", event.naokunFormId, occurredAt, `diary:${event.diaryDate}`)
      }
      break
    }
    case "collection.unlocked": {
      state = unlockCollection(state, event.collectionKind, event.collectionId, occurredAt, event.sourceId)
      break
    }
    case "mission.claimed": {
      if (!countsTowardDaily) break
      if (event.missionDate !== state.daily.date) break
      const mission = getDailyMissionStatuses(state).find((item) => item.id === event.missionId)
      if (!mission || !mission.completed || mission.claimed) break
      state = {
        ...state,
        daily: {
          ...state.daily,
          claimedMissionIds: [...state.daily.claimedMissionIds, event.missionId],
        },
      }
      state = applyReward(state, `mission:${event.missionDate}:${event.missionId}`, mission.reward)
      break
    }
    case "room.itemPurchased": {
      const item = ROOM_ITEM_DEFINITIONS.find((candidate) => candidate.id === event.itemId)
      if (!item || state.inventory.ownedItemIds.includes(item.id) || state.wallet.nyanCoins < item.price) break
      state = {
        ...state,
        wallet: {
          ...state.wallet,
          nyanCoins: state.wallet.nyanCoins - item.price,
          totalSpent: state.wallet.totalSpent + item.price,
        },
        inventory: { ownedItemIds: [...state.inventory.ownedItemIds, item.id] },
      }
      break
    }
    case "room.itemEquipped": {
      const item = ROOM_ITEM_DEFINITIONS.find((candidate) => candidate.id === event.itemId)
      if (!item || !state.inventory.ownedItemIds.includes(item.id)) break
      state = {
        ...state,
        room: { equipped: { ...state.room.equipped, [item.slot]: item.id } },
      }
      break
    }
    case "room.itemRemoved": {
      const equipped = { ...state.room.equipped }
      delete equipped[event.slot]
      state = { ...state, room: { equipped } }
      break
    }
    case "story.nodeCompleted": {
      const node = STORY_NODES.find((candidate) => candidate.id === event.nodeId)
      if (!node || !state.story.unlockedChapterIds.includes(node.chapterId) || state.story.completedNodeIds.includes(node.id)) return previousState
      const chapter = STORY_CHAPTERS.find((candidate) => candidate.id === node.chapterId)
      const nodeIndex = chapter?.nodeIds.indexOf(node.id) ?? -1
      if (!chapter || nodeIndex < 0 || chapter.nodeIds.slice(0, nodeIndex).some((nodeId) => !state.story.completedNodeIds.includes(nodeId))) return previousState

      const choices = node.choices ?? []
      const validChoice = choices.length > 0
        ? typeof event.choiceId === "string" && choices.some((choice) => choice.id === event.choiceId)
        : event.choiceId === undefined
      if (!validChoice) return previousState
      state = {
        ...state,
        stats: { ...state.stats, storyNodesCompleted: state.stats.storyNodesCompleted + 1 },
        story: {
          ...state.story,
          completedNodeIds: [...state.story.completedNodeIds, node.id],
          unlockedChapterIds: node.unlockChapterId
            ? unique([...state.story.unlockedChapterIds, node.unlockChapterId])
            : state.story.unlockedChapterIds,
          choices: choices.length > 0 ? { ...state.story.choices, [node.id]: event.choiceId as string } : state.story.choices,
        },
      }
      state = applyReward(state, `story:${node.id}`, node.reward)
      break
    }
    case "settings.updated": {
      state = {
        ...state,
        settings: { ...state.settings, ...normalizedSettingsPatch(event.patch) },
      }
      break
    }
    case "day.changed": {
      break
    }
  }

    state = unlockMilestoneCollections(state, event, occurredAt)
    return markEventProcessed(state, event.eventId, occurredAt)
  } catch (error) {
    if (error === LEDGER_CAPACITY_ERROR) return previousState
    throw error
  }
}

export function canPurchaseRoomItem(state: AppStateV1, itemId: string): ActionCheck {
  const item = ROOM_ITEM_DEFINITIONS.find((candidate) => candidate.id === itemId)
  if (!item) return { ok: false, reason: "not-found" }
  if (state.inventory.ownedItemIds.includes(item.id)) return { ok: false, reason: "already-owned" }
  if (state.wallet.nyanCoins < item.price) return { ok: false, reason: "not-enough-coins" }
  return { ok: true }
}

export function canEquipRoomItem(state: AppStateV1, itemId: string): ActionCheck {
  const item = ROOM_ITEM_DEFINITIONS.find((candidate) => candidate.id === itemId)
  if (!item) return { ok: false, reason: "not-found" }
  if (!state.inventory.ownedItemIds.includes(item.id)) return { ok: false, reason: "locked" }
  return { ok: true }
}

export function canClaimDailyMission(state: AppStateV1, missionId: DailyMissionId, dateKey = state.daily.date): ActionCheck {
  if (state.daily.date !== dateKey) return { ok: false, reason: "wrong-day" }
  const mission = getDailyMissionStatuses(state, dateKey).find((item) => item.id === missionId)
  if (!mission) return { ok: false, reason: "not-found" }
  if (mission.claimed) return { ok: false, reason: "already-claimed" }
  if (!mission.completed) return { ok: false, reason: "not-complete" }
  return { ok: true }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function safeJsonParse(value: string | null): unknown {
  if (!value) return null
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

function compactLedgerForMigration(
  ids: unknown,
  archive: unknown,
): { ids: unknown; archive: unknown } {
  if (!Array.isArray(ids)) return { ids, archive }
  if (ids.every((value): value is string => typeof value === "string") && isLedgerArchiveShape(archive)) {
    return compactLedger(ids, archive)
  }
  return { ids, archive }
}

function migrateV2Archive(value: unknown): unknown {
  if (value === "") return ""
  if (typeof value !== "string" || value.length % LEDGER_TOKEN_HEX_LENGTH !== 0 || !/^[0-9a-f]+$/.test(value)) return value
  return Array.from(
    { length: value.length / LEDGER_TOKEN_HEX_LENGTH },
    (_, index) => `l${value.slice(index * LEDGER_TOKEN_HEX_LENGTH, (index + 1) * LEDGER_TOKEN_HEX_LENGTH)}${"0".repeat(LEDGER_TOKEN_HEX_LENGTH)}`,
  ).join("")
}

function mergeForMigration(raw: Record<string, unknown>, dateKey: string, timestamp: string): Record<string, unknown> {
  const initial = createInitialAppState(dateKey, timestamp)
  const wallet = asRecord(raw.wallet)
  const stats = asRecord(raw.stats)
  const daily = asRecord(raw.daily)
  const collections = asRecord(raw.collections)
  const inventory = asRecord(raw.inventory)
  const room = asRecord(raw.room)
  const story = asRecord(raw.story)
  const settings = asRecord(raw.settings)
  const ledger = asRecord(raw.ledger)
  const mergedLedger = raw.version === PROGRESSION_VERSION
    ? { ...initial.ledger, ...(ledger ?? {}) }
    : raw.version === 2
      ? {
          ...initial.ledger,
          ...(ledger && "processedEventIds" in ledger ? { processedEventIds: ledger.processedEventIds } : {}),
          ...(ledger && "rewardIds" in ledger ? { rewardIds: ledger.rewardIds } : {}),
          ...(ledger && "processedEventArchive" in ledger ? { processedEventArchive: migrateV2Archive(ledger.processedEventArchive) } : {}),
          ...(ledger && "rewardArchive" in ledger ? { rewardArchive: migrateV2Archive(ledger.rewardArchive) } : {}),
        }
      : {
        ...initial.ledger,
        ...(ledger && "processedEventIds" in ledger ? { processedEventIds: ledger.processedEventIds } : {}),
        ...(ledger && "rewardIds" in ledger ? { rewardIds: ledger.rewardIds } : {}),
      }
  const processed = compactLedgerForMigration(
    mergedLedger.processedEventIds,
    mergedLedger.processedEventArchive,
  )
  const rewards = compactLedgerForMigration(
    mergedLedger.rewardIds,
    mergedLedger.rewardArchive,
  )

  return {
    ...initial,
    ...raw,
    version: PROGRESSION_VERSION,
    savedAt: typeof raw.savedAt === "string" ? raw.savedAt : timestamp,
    wallet: { ...initial.wallet, ...(wallet ?? {}), ...(typeof raw.coins === "number" ? { nyanCoins: raw.coins } : {}) },
    stats: { ...initial.stats, ...(stats ?? {}) },
    daily: { ...initial.daily, ...(daily ?? {}), algorithmVersion: DAILY_MISSION_ALGORITHM_VERSION },
    collections: {
      ...initial.collections,
      ...(collections ?? {}),
      cats: { ...initial.collections.cats, ...(asRecord(collections?.cats) ?? {}) },
      naokunForms: { ...initial.collections.naokunForms, ...(asRecord(collections?.naokunForms) ?? {}) },
    },
    inventory: { ...initial.inventory, ...(inventory ?? {}) },
    room: { ...initial.room, ...(room ?? {}), equipped: { ...initial.room.equipped, ...(asRecord(room?.equipped) ?? {}) } },
    story: { ...initial.story, ...(story ?? {}), choices: { ...initial.story.choices, ...(asRecord(story?.choices) ?? {}) } },
    settings: { ...initial.settings, ...(settings ?? {}) },
    ledger: {
      ...mergedLedger,
      processedEventIds: processed.ids,
      processedEventArchive: processed.archive,
      rewardIds: rewards.ids,
      rewardArchive: rewards.archive,
    },
  }
}

export function hydrateProgressionState(raw: unknown, dateKey = getLocalDateKey(), timestamp = nowIso()): StateHydrationResult {
  const initial = createInitialAppState(dateKey, timestamp)
  let parsedRaw = raw
  const warnings: string[] = []

  if (typeof raw === "string") {
    if (raw.length > MAX_BACKUP_CHARACTERS) {
      return {
        state: initial,
        source: "recovered",
        persistence: "read-only",
        warnings: ["保存データが大きすぎるため保護しました。元のデータは上書きしていません。"],
      }
    }
    try {
      parsedRaw = JSON.parse(raw) as unknown
    } catch {
      return {
        state: initial,
        source: "recovered",
        persistence: "read-only",
        warnings: ["保存データを読めなかったため保護しました。元のデータは上書きしていません。"],
      }
    }
  }

  const record = asRecord(parsedRaw)
  if (!record) return { state: initial, source: "empty", persistence: "write", warnings }

  if (typeof record.version === "number" && Number.isFinite(record.version) && record.version > PROGRESSION_VERSION) {
    return {
      state: initial,
      source: "future",
      persistence: "read-only",
      warnings: ["この記録は新しいバージョンで作られています。保護のため、この画面からは上書きしません。"],
    }
  }

  if (record.version === 2) {
    const ledger = asRecord(record.ledger)
    const processedBloom = ledger?.processedEventBloom
    const rewardBloom = ledger?.rewardBloom
    const hasUnknownBloom = (processedBloom !== undefined && processedBloom !== "")
      || (rewardBloom !== undefined && rewardBloom !== "")
    if (hasUnknownBloom) {
      return {
        state: initial,
        source: "protected",
        persistence: "read-only",
        warnings: ["以前の確率圧縮形式に履歴が残っているため、正確性を守るため上書きせず保護しました。"],
      }
    }
  }

  let candidate: Record<string, unknown>
  try {
    candidate = mergeForMigration(record, dateKey, timestamp)
  } catch (error) {
    if (error === LEDGER_CAPACITY_ERROR) {
      return {
        state: initial,
        source: "protected",
        persistence: "read-only",
        warnings: ["保存履歴が安全な上限を超えているため、古い履歴を捨てずに保護しました。"],
      }
    }
    throw error
  }
  const result = appStateSchema.safeParse(candidate)
  if (!result.success) {
    return {
      state: initial,
      source: "recovered",
      persistence: "read-only",
      warnings: ["保存データの一部を検証できなかったため保護しました。元のデータは上書きしていません。"],
    }
  }

  const sanitized = sanitizeStateReferences(result.data)
  let state = sanitized.state
  if (sanitized.changed) warnings.push("保存データ内の現在は使えない項目を安全に整理しました。")
  state = ensureDailyState(state, dateKey)
  state = normalizeLedger(state)
  if (record.version !== PROGRESSION_VERSION) warnings.push("以前の保存形式を最新版に更新しました。")
  return { state, source: "current", persistence: "write", warnings }
}

export type StorageLike = Pick<Storage, "getItem" | "setItem">

function quarantineCurrentState(storage: StorageLike, raw: string): boolean {
  try {
    storage.setItem(PROGRESSION_QUARANTINE_KEY, raw)
    return true
  } catch {
    return false
  }
}

function readLegacyState(storage: StorageLike, dateKey: string, timestamp: string): AppStateV1 | null {
  const initial = createInitialAppState(dateKey, timestamp)
  let foundLegacy = false
  let state = initial

  try {
    const savedSkin = storage.getItem("miyuki-cat-skin")
    if (savedSkin) {
      foundLegacy = true
      state = { ...state, settings: { ...state.settings, skinId: savedSkin.slice(0, 80) } }
    }

    const passport = safeJsonParse(storage.getItem("miyuki-cat-passport-v1"))
    if (Array.isArray(passport)) {
      foundLegacy = true
      const tabs = new Set(passport.filter((value): value is string => typeof value === "string"))
      state = {
        ...state,
        stats: {
          ...state.stats,
          gamesPlayed: tabs.has("games") ? 1 : 0,
          coloringsCompleted: tabs.has("coloring") ? 1 : 0,
          fortunesDrawn: tabs.has("fortune") ? 1 : 0,
          diariesRead: tabs.has("diary") ? 1 : 0,
        },
      }
    }

    const legacyScores: Record<string, number> = {}
    const scoreEntries: [string, unknown][] = [
      ["quiz", safeJsonParse(storage.getItem("catQuizHighScore"))],
      ["breed", safeJsonParse(storage.getItem("catBreedQuizHighScore"))],
      ["rescue", safeJsonParse(storage.getItem("catGameHighScoresV2"))],
      ["memory", safeJsonParse(storage.getItem("catMemoryBestRecordsV2"))],
      ["simon", safeJsonParse(storage.getItem("catSimonHighScoresV2"))],
    ]
    for (const [gameId, value] of scoreEntries) {
      if (typeof value === "number" && Number.isFinite(value)) {
        foundLegacy = true
        legacyScores[gameId] = Math.max(0, Math.round(value))
      } else {
        const record = asRecord(value)
        const numericValues = record ? Object.values(record).filter((item): item is number => typeof item === "number" && Number.isFinite(item)) : []
        if (numericValues.length) {
          foundLegacy = true
          legacyScores[gameId] = Math.max(0, Math.round(Math.max(...numericValues)))
        }
      }
    }
    if (Object.keys(legacyScores).length) {
      state = { ...state, stats: { ...state.stats, gameHighScores: legacyScores } }
    }
  } catch {
    return foundLegacy ? state : null
  }

  return foundLegacy ? state : null
}

export function loadProgressionState(storage: StorageLike, dateKey = getLocalDateKey(), timestamp = nowIso()): StateHydrationResult {
  try {
    const saved = storage.getItem(PROGRESSION_STORAGE_KEY)
    if (saved) {
      const current = hydrateProgressionState(saved, dateKey, timestamp)
      if (current.source === "current" || current.source === "future" || current.source === "protected") return current

      const quarantined = quarantineCurrentState(storage, saved)
      if (!quarantined) {
        return {
          ...current,
          source: "recovered",
          persistence: "read-only",
          warnings: [...current.warnings, "元の記録を退避できなかったため、この画面からは上書きしません。"],
        }
      }

      const legacy = readLegacyState(storage, dateKey, timestamp)
      if (legacy) {
        return {
          state: legacy,
          source: "legacy",
          persistence: "write",
          warnings: [
            ...current.warnings,
            "読み取れなかった現行記録を別領域へ退避し、以前の記録から復旧しました。",
          ],
        }
      }

      return {
        state: current.state,
        source: "recovered",
        persistence: "write",
        warnings: [...current.warnings, "読み取れなかった記録は別領域へ退避しました。"],
      }
    }
    const legacy = readLegacyState(storage, dateKey, timestamp)
    if (legacy) {
      return {
        state: legacy,
        source: "legacy",
        persistence: "write",
        warnings: ["これまでの記録を、新しいコイン・ミッション形式へ引き継ぎました。"],
      }
    }
    return { state: createInitialAppState(dateKey, timestamp), source: "empty", persistence: "write", warnings: [] }
  } catch {
    return {
      state: createInitialAppState(dateKey, timestamp),
      source: "recovered",
      persistence: "read-only",
      warnings: ["端末の保存領域を読めなかったため、元の記録を上書きせず一時状態で表示しています。"],
    }
  }
}

export function saveProgressionState(storage: StorageLike, state: AppStateV1): { ok: true } | { ok: false; error: string } {
  try {
    const normalized = normalizeLedger(state)
    const parsed = appStateSchema.safeParse(normalized)
    if (!parsed.success) {
      return { ok: false, error: "記録の内容を安全に検証できなかったため、保存を中止しました。" }
    }
    const serialized = JSON.stringify(parsed.data)
    if (serialized.length > MAX_BACKUP_CHARACTERS) {
      return { ok: false, error: "記録が大きくなりすぎたため、保存を中止しました。" }
    }
    storage.setItem(PROGRESSION_STORAGE_KEY, serialized)
    return { ok: true }
  } catch {
    return { ok: false, error: "端末に記録を保存できませんでした。空き容量を確認してください。" }
  }
}

export function createProgressionBackup(state: AppStateV1, exportedAt = nowIso()): ProgressionBackupV1 {
  return {
    kind: PROGRESSION_BACKUP_KIND,
    formatVersion: PROGRESSION_VERSION,
    exportedAt,
    state: normalizeLedger(state),
  }
}

export function serializeProgressionBackup(state: AppStateV1, exportedAt = nowIso()): string {
  return JSON.stringify(createProgressionBackup(state, exportedAt))
}

export function importProgressionBackup(input: string, dateKey = getLocalDateKey(), timestamp = nowIso()): BackupImportResult {
  if (!input.trim()) return { ok: false, errors: ["バックアップファイルが空です。"] }
  if (input.length > MAX_BACKUP_CHARACTERS) return { ok: false, errors: ["バックアップファイルが大きすぎます。"] }

  let raw: unknown
  try {
    raw = JSON.parse(input) as unknown
  } catch {
    return { ok: false, errors: ["JSON形式のバックアップを読み取れませんでした。"] }
  }

  const envelope = backupSchema.safeParse(raw)
  if (!envelope.success) {
    return { ok: false, errors: ["このサイトのバックアップ形式ではありません。"] }
  }

  const hydrated = hydrateProgressionState(envelope.data.state, dateKey, timestamp)
  if (hydrated.source !== "current") {
    return { ok: false, errors: ["バックアップ内の記録がこわれているため、復元を中止しました。"] }
  }

  return {
    ok: true,
    state: { ...hydrated.state, savedAt: timestamp },
    warnings: hydrated.warnings,
  }
}

export function createEventId(prefix = "event"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}:${crypto.randomUUID()}`
  }
  return `${prefix}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}`
}
