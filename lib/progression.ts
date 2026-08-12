import { z } from "zod"

// Keep the original key for an in-place v1-v3 -> v4 migration. The embedded
// version prevents an older writer from treating the compact v4 ledger as v1.
export const PROGRESSION_STORAGE_KEY = "miyuki-cat-progress-v1"
export const PROGRESSION_VERSION = 4 as const
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

export type CafeMenuCreation = {
  id: string
  base: "soda" | "milk" | "berry"
  scoop: "vanilla" | "strawberry" | "mint"
  topping: "cherry" | "cookie" | "star"
  garnish: "ribbon" | "paw" | "flower"
  createdAt: string
}

export type ActivityLogEntry = {
  type: "game" | "coloring" | "fortune" | "diary" | "room" | "favorite" | "menu" | "request"
  id: string
  occurredAt: string
  value?: number
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
    activityLog: ActivityLogEntry[]
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
    menuCreations: CafeMenuCreation[]
    featuredMenuId?: string
  }
  diary: {
    favoriteDates: string[]
  }
  requests: {
    claimedIds: string[]
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
      type: "diary.favoriteToggled"
      diaryDate: string
    })
  | (EventMeta & {
      type: "room.menuSaved"
      menu: Omit<CafeMenuCreation, "createdAt">
    })
  | (EventMeta & {
      type: "request.claimed"
      requestId: string
      requestDate: string
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

function eventMeaning(event: DomainEvent) {
  const { occurredAt: _occurredAt, ...meaning } = event
  if (meaning.type !== "diary.read") return meaning
  return {
    ...meaning,
    catIds: [...new Set(meaning.catIds ?? [])].sort((left, right) => left.localeCompare(right)),
  }
}

export function domainEventsHaveSameMeaning(left: DomainEvent, right: DomainEvent) {
  if (left.eventId !== right.eventId || left.type !== right.type) return false
  return JSON.stringify(eventMeaning(left)) === JSON.stringify(eventMeaning(right))
}

export type DailyMissionDefinition = {
  id: DailyMissionId
  title: string
  description: string
  goal: number
  reward: number
  character?: string
  completionLine?: string
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
    title: "ゲームを1競技クリア",
    description: "好きなゲームを1回完了し、今回の記録を残す",
    goal: 1,
    reward: 18,
  },
  {
    id: "read-diary",
    title: "事件記録を1件調査",
    description: "美雪の絵日記を1件選び、最後まで確認する",
    goal: 1,
    reward: 12,
  },
  {
    id: "draw-fortune",
    title: "今日の占いを記録",
    description: "名前を入力し、今日のねこ占いを1回確認する",
    goal: 1,
    reward: 12,
  },
  {
    id: "finish-coloring",
    title: "カラー設計を完成",
    description: "ぬりえを1作品、進行度100%まで仕上げる",
    goal: 1,
    reward: 18,
  },
] as const

type DailyMissionFlavor = Pick<DailyMissionDefinition, "title" | "description"> & {
  character: string
  completionLine: string
}

const DAILY_MISSION_FLAVORS: Record<DailyMissionId, readonly DailyMissionFlavor[]> = {
  "play-game": [
    {
      character: "美雪からの指令",
      title: "ゲーム攻略記録を提出",
      description: "好きなゲームを1回完了し、スコアか到達記録を残す。",
      completionLine: "美雪「任務完了！」三匹から肉球スタンプが届きました。",
    },
    {
      character: "トラちゃんのお願い",
      title: "しっぽ応援団へ結果報告",
      description: "好きなゲームを1回完了し、猫たちへ今回の結果を報告する。",
      completionLine: "トラちゃん、キキ、フワのしっぽが一斉にぴん！",
    },
    {
      character: "キキからの挑戦",
      title: "猫審査員へ結果報告",
      description: "好きなゲームを1回完了する。三匹の猫審査員は最前列で採点中。",
      completionLine: "キキが満点の札を上げ、トラちゃんとフワも拍手しました。",
    },
  ],
  "read-diary": [
    {
      character: "キキの事件メモ",
      title: "今日の猫事件簿",
      description: "絵日記を1件選び、猫の行動と最後のオチを確認する。",
      completionLine: "最後まで読んだ印に、キキから肉球しおりが届きました。",
    },
    {
      character: "美雪からの調査依頼",
      title: "笑える日記を調査！",
      description: "絵日記を1件読み、その日の出来事と結末を確認する。",
      completionLine: "美雪と三匹の出来事を、最後まで確認できました。",
    },
    {
      character: "猫読書会のお題",
      title: "猫読書会の事件検討",
      description: "絵日記を1件読み、美雪のツッコミと猫の反応を比較する。",
      completionLine: "猫読書会は三匹そろって大きな拍手で閉会しました。",
    },
  ],
  "draw-fortune": [
    {
      character: "フワの水晶だより",
      title: "今日の運勢を占おう",
      description: "今日のねこみくじを引いて、運勢とアドバイスを確かめよう。",
      completionLine: "フワが水晶の横から、今日のラッキーカラーを知らせました。",
    },
    {
      character: "美雪からのお願い",
      title: "ラッキー項目を確認",
      description: "今日のねこみくじを引き、ラッキーアイテムと色を確認する。",
      completionLine: "美雪が今日のラッキー項目をきちんと記録しました。",
    },
    {
      character: "猫会議の決定",
      title: "大吉を一枚くださいにゃ",
      description: "今日のねこみくじを引いて、猫会議へ結果を届けよう。",
      completionLine: "猫会議は大吉で閉会。三匹が結果を大切に持ち帰りました。",
    },
  ],
  "finish-coloring": [
    {
      character: "トラちゃんの色研究",
      title: "お気に入りの三色を選ぼう",
      description: "ぬりえを1作品完成させ、好きな色の組み合わせを見つける。",
      completionLine: "すてきな一枚が完成！トラちゃんから肉球サインが届きました。",
    },
    {
      character: "美雪アトリエのお題",
      title: "配色作品を1点完成",
      description: "ぬりえを1作品完成させ、色の組み合わせを記録する。",
      completionLine: "トラちゃん、キキ、フワが肉球スタンプで合格を知らせました。",
    },
    {
      character: "猫いろ会議のお願い",
      title: "猫いろ会議へ作品提出",
      description: "ぬりえを1作品完成させる。色数や配色の方針は自分で決める。",
      completionLine: "猫会議で作品賞に決定！三匹が選んだ色も好評でした。",
    },
  ],
}

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
  { id: "right-treasure", name: "三匹の宝箱", description: "トラちゃん、キキ、フワのおもちゃ入り。", slot: "floorRight", price: 60, assetKey: "room/right-treasure" },
] as const

// The removed story feature stays represented only as opaque IDs so older
// backups can be read without shipping its copy, artwork, or active rewards.
const LEGACY_STORY_GRAPH = [
  { id: "cafe-opening", nodes: [{ id: "cafe-opening-1", choices: ["kitchen", "garden"] }, { id: "cafe-opening-2", choices: ["cherry-king-ending", "cat-hero-ending"] }] },
  { id: "lost-star", nodes: [{ id: "lost-star-1", choices: ["window", "shelf"] }, { id: "lost-star-2", choices: ["moon-ending", "comet-ending"] }] },
  { id: "festival-night", nodes: [{ id: "festival-night-1", choices: ["cats", "stars"] }, { id: "festival-night-2", choices: ["music-ending", "art-ending"] }] },
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

const activityLogEntrySchema = z.object({
  type: z.enum(["game", "coloring", "fortune", "diary", "room", "favorite", "menu", "request"]),
  id: safeId,
  occurredAt: safeDateTime,
  value: nonNegativeInteger.optional(),
})

const cafeMenuCreationSchema = z.object({
  id: safeId,
  base: z.enum(["soda", "milk", "berry"]),
  scoop: z.enum(["vanilla", "strawberry", "mint"]),
  topping: z.enum(["cherry", "cookie", "star"]),
  garnish: z.enum(["ribbon", "paw", "flower"]),
  createdAt: safeDateTime,
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
    activityLog: z.array(activityLogEntrySchema).max(200).default([]),
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
    menuCreations: z.array(cafeMenuCreationSchema).max(24).default([]),
    featuredMenuId: safeId.optional(),
  }),
  diary: z.object({
    favoriteDates: z.array(dateKeySchema).max(1_000).default([]),
  }),
  requests: z.object({
    claimedIds: z.array(safeId).max(1_000).default([]),
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
  formatVersion: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(PROGRESSION_VERSION)]),
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
const LEGACY_STORY_NODE_BY_ID: ReadonlyMap<string, { id: string; choices: readonly string[]; chapterId: string }> = new Map(LEGACY_STORY_GRAPH.flatMap((chapter) => (
  chapter.nodes.map((node) => [node.id, { ...node, chapterId: chapter.id }] as const)
)))
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
  const hasLegacyStoryProgress = state.story.unlockedChapterIds.includes("cafe-opening")
    || state.story.completedNodeIds.some((nodeId) => LEGACY_STORY_NODE_BY_ID.has(nodeId))
  if (hasLegacyStoryProgress) {
    for (const chapter of LEGACY_STORY_GRAPH) {
      if (chapter.id !== "cafe-opening") {
        const previousChapter = LEGACY_STORY_GRAPH[LEGACY_STORY_GRAPH.indexOf(chapter) - 1]
        const previousFinal = previousChapter?.nodes.at(-1)?.id
        if (!previousFinal || !completedNodeIds.includes(previousFinal)) break
      }
      unlockedChapterIds.push(chapter.id)
      for (const legacyNode of chapter.nodes) {
        const nodeId = legacyNode.id
        if (!state.story.completedNodeIds.includes(nodeId)) break
        const node = LEGACY_STORY_NODE_BY_ID.get(nodeId)
        const nodeChoices = node?.choices ?? []
        if (nodeChoices.length > 0) {
          const choice = state.story.choices[nodeId]
          if (!nodeChoices.some((candidate) => candidate === choice)) break
          choices[nodeId] = choice
        }
        completedNodeIds.push(nodeId)
      }
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
    room: {
      equipped,
      menuCreations: state.room.menuCreations,
      ...(state.room.featuredMenuId ? { featuredMenuId: state.room.featuredMenuId } : {}),
    },
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
      activityLog: [],
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
      menuCreations: [],
    },
    diary: { favoriteDates: [] },
    requests: { claimedIds: [] },
    story: {
      unlockedChapterIds: [],
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
  return seededOrder(DAILY_MISSION_POOL, `${safeDateKey}:v${DAILY_MISSION_ALGORITHM_VERSION}`)
    .slice(0, 3)
    .map((mission) => {
      const flavors = DAILY_MISSION_FLAVORS[mission.id]
      const flavor = flavors[hashText(`${safeDateKey}:${mission.id}:copy`) % flavors.length]
      return { ...mission, ...flavor }
    })
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

function appendActivity(
  state: AppStateV1,
  activity: ActivityLogEntry,
): AppStateV1 {
  const activityLog = [...state.stats.activityLog.filter((entry) => !(entry.type === activity.type && entry.id === activity.id)), activity]
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
    .slice(-200)
  return { ...state, stats: { ...state.stats, activityLog } }
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
  const gameIds = Object.keys(state.stats.gameHighScores)

  if (state.stats.fortunesDrawn >= 1) {
    unlockCat("cat-yuki", "fortune")
  }

  if (gameIds.includes("memory")) {
    unlockCat("cat-kuro", "game-memory")
  }

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
      state = appendActivity(state, { type: "game", id: event.gameId, occurredAt, value: score })
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
      state = appendActivity(state, { type: "coloring", id: event.pageId, occurredAt })
      break
    }
    case "fortune.drawn": {
      state = {
        ...state,
        stats: { ...state.stats, fortunesDrawn: state.stats.fortunesDrawn + 1 },
      }
      state = incrementCurrentMission(state, "draw-fortune")
      state = applyReward(state, `fortune:${requestedEventDate}`, 6)
      state = appendActivity(state, { type: "fortune", id: event.fortuneId, occurredAt })
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
      state = appendActivity(state, { type: "diary", id: event.diaryDate, occurredAt })
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
        room: { ...state.room, equipped: { ...state.room.equipped, [item.slot]: item.id } },
      }
      state = appendActivity(state, { type: "room", id: item.id, occurredAt })
      break
    }
    case "room.itemRemoved": {
      const equipped = { ...state.room.equipped }
      delete equipped[event.slot]
      state = { ...state, room: { ...state.room, equipped } }
      break
    }
    case "diary.favoriteToggled": {
      if (!isDateKey(event.diaryDate)) break
      const isFavorite = state.diary.favoriteDates.includes(event.diaryDate)
      state = {
        ...state,
        diary: {
          favoriteDates: isFavorite
            ? state.diary.favoriteDates.filter((date) => date !== event.diaryDate)
            : [...state.diary.favoriteDates, event.diaryDate],
        },
      }
      state = appendActivity(state, { type: "favorite", id: event.diaryDate, occurredAt })
      break
    }
    case "room.menuSaved": {
      const parsedMenu = cafeMenuCreationSchema.omit({ createdAt: true }).safeParse(event.menu)
      if (!parsedMenu.success) break
      const menu: CafeMenuCreation = { ...parsedMenu.data, createdAt: occurredAt }
      state = {
        ...state,
        room: {
          ...state.room,
          menuCreations: [...state.room.menuCreations.filter((item) => item.id !== menu.id), menu].slice(-24),
          featuredMenuId: menu.id,
        },
      }
      state = appendActivity(state, { type: "menu", id: menu.id, occurredAt })
      break
    }
    case "request.claimed": {
      const request = getCatRequests(state, event.requestDate).find((candidate) => candidate.id === event.requestId)
      if (!isDateKey(event.requestDate) || event.requestDate !== state.daily.date || !isSafeDomainId(event.requestId) || !request?.completed || request.claimed) break
      state = { ...state, requests: { claimedIds: [...state.requests.claimedIds, event.requestId] } }
      state = appendActivity(state, { type: "request", id: event.requestId, occurredAt })
      break
    }
    case "story.nodeCompleted": {
      return previousState
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

export type CatRequestDefinition = {
  id: string
  catId: "cat-maron" | "cat-kuro" | "cat-yuki"
  catName: "トラちゃん" | "キキ" | "フワ"
  title: string
  description: string
  completed: boolean
  claimed: boolean
  reward: "肉球スタンプ"
}

export function getCatRequests(state: AppStateV1, dateKey = state.daily.date): CatRequestDefinition[] {
  const key = isDateKey(dateKey) ? dateKey : state.daily.date
  const happenedOn = (type: ActivityLogEntry["type"]) => state.stats.activityLog.some((entry) => {
    const occurredAt = new Date(entry.occurredAt)
    return entry.type === type && !Number.isNaN(occurredAt.getTime()) && getLocalDateKey(occurredAt) === key
  })
  const definitions = [
    {
      id: `${key}:tora-game`, catId: "cat-maron" as const, catName: "トラちゃん" as const,
      title: "ゲームの記録を見せて", description: "好きなゲームを1回遊んで、トラちゃんへ結果を報告します。",
      completed: happenedOn("game"),
    },
    {
      id: `${key}:kiki-diary`, catId: "cat-kuro" as const, catName: "キキ" as const,
      title: "今日の事件を選んで", description: "日記を1件読み、お気に入りのオチを1つ保存します。",
      completed: state.diary.favoriteDates.length > 0 && happenedOn("favorite"),
    },
    {
      id: `${key}:fuwa-menu`, catId: "cat-yuki" as const, catName: "フワ" as const,
      title: "ふわふわメニューを作って", description: "メニュー工房で新しい一皿を完成させます。",
      completed: happenedOn("menu"),
    },
  ]
  return definitions.map((request) => ({
    ...request,
    claimed: state.requests.claimedIds.includes(request.id),
    reward: "肉球スタンプ",
  }))
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
  const diary = asRecord(raw.diary)
  const requests = asRecord(raw.requests)
  const story = asRecord(raw.story)
  const settings = asRecord(raw.settings)
  const ledger = asRecord(raw.ledger)
  const mergedLedger = raw.version === PROGRESSION_VERSION || raw.version === 3
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
    room: {
      ...initial.room,
      ...(room ?? {}),
      equipped: { ...initial.room.equipped, ...(asRecord(room?.equipped) ?? {}) },
      menuCreations: Array.isArray(room?.menuCreations) ? room.menuCreations : initial.room.menuCreations,
    },
    diary: { ...initial.diary, ...(diary ?? {}) },
    requests: { ...initial.requests, ...(requests ?? {}) },
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
