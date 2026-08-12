import { z } from "zod"
import { DIARY_CAT_IDS, DIARY_COLLECTION_IDS } from "@/lib/diary"

export const CONTENT_OVERRIDE_VERSION = 1 as const
export const CONTENT_OVERRIDE_KIND = "miyuki-cat-content-overrides" as const
export const CONTENT_OVERRIDE_DRAFT_KEY = "miyuki-cat-content-draft-v1"
export const CONTENT_OVERRIDE_APPLIED_KEY = "miyuki-cat-content-applied-v1"
export const MAX_CONTENT_OVERRIDE_CHARACTERS = 500_000
export const FUTURE_CONTENT_OVERRIDE_MESSAGE = "このデータは、このサイトより新しい保存形式です。内容を守るため、対応する更新版で開くまで編集・反映・読み込み・削除はできません。"
const STORED_FUTURE_CONTENT_OVERRIDE_MESSAGE = "この端末には、このサイトより新しい形式の編集内容が保存されています。内容を守るため、対応する更新版で開くまで編集・反映・読み込み・削除はできません。"

export const DIARY_OVERRIDE_TRANSFORMATION_FORMS = ["none", ...DIARY_COLLECTION_IDS] as const
export const DIARY_OVERRIDE_CAT_IDS = DIARY_CAT_IDS
export type DiaryOverrideTransformationForm = (typeof DIARY_OVERRIDE_TRANSFORMATION_FORMS)[number]
export type DiaryOverrideCatId = (typeof DIARY_OVERRIDE_CAT_IDS)[number]

const plainText = (label: string, max: number) => z
  .string()
  .trim()
  .min(1, `${label}を入力してください。`)
  .max(max, `${label}は${max}文字以内にしてください。`)
  .refine((value) => !/[<>]/.test(value), `${label}にHTMLは使えません。`)

const optionalPlainText = (label: string, max: number) => z
  .string()
  .trim()
  .max(max, `${label}は${max}文字以内にしてください。`)
  .refine((value) => !/[<>]/.test(value), `${label}にHTMLは使えません。`)

const validDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付は年-月-日の形にしてください。").refine((value) => {
  const [year, month, day] = value.split("-").map(Number)
  const parsed = new Date(year, month - 1, day, 12)
  return !Number.isNaN(parsed.getTime())
    && parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day
}, "正しい日付を入力してください。")

export const BUILT_IN_DIARY_ASSETS = [
  "/content/diary/2026-08-12.webp",
  "/content/diary/2026-08-11.webp",
  "/content/diary/2026-08-10.webp",
  "/content/diary/2026-08-09.webp",
  "/content/diary/2026-08-08.webp",
  "/content/diary/2026-08-07.webp",
  "/content/diary/2026-08-06.webp",
  "/content/diary/2026-08-05.webp",
  "/content/diary/2026-08-04.webp",
  "/content/diary/2026-08-03.webp",
  "/content/diary/2026-08-02.webp",
  "/content/diary/2026-08-01.webp",
  "/content/diary/2026-07-31.webp",
  "/content/diary/2026-07-30.webp",
  "/content/diary/2026-07-29.webp",
  "/content/diary/2026-07-28.webp",
  "/content/diary/2026-07-27.webp",
  "/content/diary/2026-07-26.webp",
  "/content/diary/2026-07-25.webp",
  "/content/diary/2026-07-24.webp",
  "/content/diary/2026-07-23.webp",
  "/content/diary/2026-07-22.webp",
  "/content/diary/2026-07-21.webp",
  "/content/diary/2026-07-20.webp",
  "/content/diary/2026-07-19.webp",
  "/content/diary/2026-07-18.webp",
  "/content/diary/2026-07-17.webp",
  "/content/diary/2026-07-16.webp",
  "/content/diary/2026-07-15.webp",
  "/content/diary/2026-07-14.webp",
  "/content/diary/2026-07-13.webp",
  "/content/diary/2026-07-12.webp",
  "/content/diary/2026-07-11.webp",
  "/content/diary/2026-07-10.webp",
  "/content/diary/2026-07-09.webp",
  "/content/diary/2026-07-08.webp",
  "/content/diary/2026-07-07.webp",
  "/content/diary/2026-07-06.webp",
  "/content/diary/2026-07-05.webp",
  "/content/diary/2026-07-04.webp",
  "/content/diary/2026-07-03.webp",
  "/content/diary/2026-07-02.webp",
  "/content/diary/2026-07-01.webp",
  "/content/diary/2026-06-30.webp",
  "/content/diary/2026-06-29.webp",
  "/content/diary/2026-06-28.webp",
  "/content/diary/2026-06-27.webp",
  "/content/diary/2026-06-26.webp",
  "/content/diary/2026-06-25.webp",
  "/content/diary/2026-06-24.webp",
  "/content/diary/2026-06-23.webp",
  "/content/diary/2026-06-22.webp",
  "/content/diary/2025-08-31.webp",
  "/content/diary/2025-08-30.webp",
  "/content/diary/2025-08-29.webp",
  "/content/diary/2025-08-17.webp",
  "/content/diary/2025-08-16.webp",
  "/content/diary/2025-08-15.webp",
  "/content/diary/2025-08-14.webp",
  "/content/diary/2025-08-13.webp",
  "/content/diary/2025-08-12.webp",
  "/content/diary/2025-08-11.webp",
  "/content/diary/2025-08-10.webp",
  "/skins/cream-soda/diary/2026-08-11.webp",
  "/skins/cream-soda/diary/2026-08-10.webp",
  "/skins/cream-soda/diary/2026-08-09.webp",
  "/skins/cream-soda/diary/2026-08-08.webp",
  "/skins/cream-soda/diary/2026-08-07.webp",
  "/skins/cream-soda/diary/2026-08-06.webp",
  "/skins/cream-soda/diary/2026-08-05.webp",
  "/skins/cream-soda/diary/2026-08-04.webp",
  "/skins/cream-soda/diary/2026-08-03.webp",
  "/skins/cream-soda/diary/2026-08-02.webp",
  "/skins/cream-soda/diary/2026-08-01.webp",
  "/images/diary-2025-08-31.webp",
  "/images/diary-2025-08-30.webp",
  "/images/diary-2025-08-29.webp",
  "/images/diary-2025-08-17.webp",
  "/images/diary-2025-08-16.webp",
  "/images/diary-2025-08-15.webp",
  "/images/diary-2025-08-14.webp",
  "/images/diary-2025-08-13.webp",
  "/images/diary-2025-08-12.webp",
  "/images/diary-2025-08-11.webp",
  "/images/diary-2025-08-10.webp",
  "/skins/cream-soda/activity-diary.webp",
  "/cute-tabby-sitting.webp",
] as const

const diaryIllustrationSchema = z.preprocess((value) => (
  value === "/cute-tabby-sitting.png"
    ? "/cute-tabby-sitting.webp"
    : typeof value === "string" && /^\/images\/diary-2025-\d{2}-\d{2}\.png$/.test(value)
      ? value.replace(/\.png$/, ".webp")
      : value
), z.enum(BUILT_IN_DIARY_ASSETS))

export const diaryContentOverrideSchema = z.object({
  date: validDate,
  title: plainText("タイトル", 60),
  body: plainText("本文", 1_200),
  miyukiNote: optionalPlainText("美雪のひとこと", 240),
  illustration: diaryIllustrationSchema,
  alt: plainText("画像の説明", 160),
  hidden: z.boolean().default(false),
  transformationForm: z.enum(DIARY_OVERRIDE_TRANSFORMATION_FORMS).optional(),
  catIds: z.array(z.enum(DIARY_OVERRIDE_CAT_IDS))
    .max(DIARY_OVERRIDE_CAT_IDS.length, `猫は${DIARY_OVERRIDE_CAT_IDS.length}匹まで選べます。`)
    .refine((ids) => new Set(ids).size === ids.length, "同じ猫を重ねて選ぶことはできません。")
    .optional(),
})

export const quizContentOverrideSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{2,48}$/i, "IDは英数字とハイフンで3〜49文字にしてください。"),
  question: plainText("もんだい", 160),
  options: z.tuple([
    plainText("こたえ1", 80),
    plainText("こたえ2", 80),
    plainText("こたえ3", 80),
    plainText("こたえ4", 80),
  ]).refine((options) => new Set(options.map((option) => option.trim())).size === options.length, "こたえは4つとも違う内容にしてください。"),
  correctIndex: z.number().int().min(0).max(3),
  explanation: optionalPlainText("せつめい", 240),
  hidden: z.boolean().default(false),
})

export const contentOverridesSchema = z.object({
  kind: z.literal(CONTENT_OVERRIDE_KIND),
  formatVersion: z.literal(CONTENT_OVERRIDE_VERSION),
  updatedAt: z.string().datetime(),
  diaryEntries: z.array(diaryContentOverrideSchema).max(120, "日記は120件までです。"),
  quizItems: z.array(quizContentOverrideSchema).max(120, "クイズは120件までです。"),
}).superRefine((value, context) => {
  const diaryDates = new Set<string>()
  value.diaryEntries.forEach((entry, index) => {
    if (diaryDates.has(entry.date)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diaryEntries", index, "date"],
        message: `日記の日付「${entry.date}」が重複しています。`,
      })
    }
    diaryDates.add(entry.date)
  })

  const quizIds = new Set<string>()
  value.quizItems.forEach((entry, index) => {
    if (quizIds.has(entry.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quizItems", index, "id"],
        message: `クイズID「${entry.id}」が重複しています。`,
      })
    }
    quizIds.add(entry.id)
  })
})

export type DiaryContentOverride = z.infer<typeof diaryContentOverrideSchema>
export type QuizContentOverride = z.infer<typeof quizContentOverrideSchema>
export type ContentOverrides = z.infer<typeof contentOverridesSchema>

export type ContentOverrideReadResult =
  | { ok: true; readOnlyProtected: false; value: ContentOverrides }
  | { ok: false; readOnlyProtected: false; errors: string[]; value: ContentOverrides }
  | { ok: false; readOnlyProtected: true; errors: string[]; value: ContentOverrides }

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">

export function getContentOverrideStorage(): Storage | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function nowIso() {
  return new Date().toISOString()
}

export function createEmptyContentOverrides(timestamp = nowIso()): ContentOverrides {
  return {
    kind: CONTENT_OVERRIDE_KIND,
    formatVersion: CONTENT_OVERRIDE_VERSION,
    updatedAt: timestamp,
    diaryEntries: [],
    quizItems: [],
  }
}

function issueMessages(error: z.ZodError) {
  return [...new Set(error.issues.map((issue) => issue.message))]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function futureFormatVersion(input: unknown) {
  if (!isRecord(input) || input.kind !== CONTENT_OVERRIDE_KIND) return null
  const version = input.formatVersion
  return typeof version === "number" && Number.isFinite(version) && version > CONTENT_OVERRIDE_VERSION
    ? version
    : null
}

function protectedContentOverrideResult(version: number, stored = false): ContentOverrideReadResult {
  return {
    ok: false,
    readOnlyProtected: true,
    errors: [`${stored ? STORED_FUTURE_CONTENT_OVERRIDE_MESSAGE : FUTURE_CONTENT_OVERRIDE_MESSAGE}（保存形式 ${version}）`],
    value: createEmptyContentOverrides(),
  }
}

function oversizedStoredContentOverrideResult(): ContentOverrideReadResult {
  return {
    ok: false,
    readOnlyProtected: true,
    errors: ["保存された編集内容が大きすぎるため、元のデータを上書きせず保護しています。"],
    value: createEmptyContentOverrides(),
  }
}

function findStoredContentOverrideProtection(storage: StorageLike) {
  for (const key of [CONTENT_OVERRIDE_DRAFT_KEY, CONTENT_OVERRIDE_APPLIED_KEY]) {
    try {
      const serialized = storage.getItem(key)
      if (!serialized) continue
      if (serialized.length > MAX_CONTENT_OVERRIDE_CHARACTERS) return oversizedStoredContentOverrideResult()
      const version = futureFormatVersion(JSON.parse(serialized) as unknown)
      if (version !== null) return protectedContentOverrideResult(version, true)
    } catch {
      // Invalid or unreadable current-format data is handled by the normal read/write path.
    }
  }
  return null
}

export function parseContentOverrides(input: unknown): ContentOverrideReadResult {
  const version = futureFormatVersion(input)
  if (version !== null) return protectedContentOverrideResult(version)
  const parsed = contentOverridesSchema.safeParse(input)
  if (parsed.success) return { ok: true, readOnlyProtected: false, value: parsed.data }
  return { ok: false, readOnlyProtected: false, errors: issueMessages(parsed.error), value: createEmptyContentOverrides() }
}

export function readContentOverrides(storage: StorageLike, source: "draft" | "applied" = "applied"): ContentOverrideReadResult {
  const key = source === "draft" ? CONTENT_OVERRIDE_DRAFT_KEY : CONTENT_OVERRIDE_APPLIED_KEY
  try {
    const value = storage.getItem(key)
    if (!value) return { ok: true, readOnlyProtected: false, value: createEmptyContentOverrides() }
    if (value.length > MAX_CONTENT_OVERRIDE_CHARACTERS) return oversizedStoredContentOverrideResult()
    const decoded = JSON.parse(value) as unknown
    const version = futureFormatVersion(decoded)
    if (version !== null) return protectedContentOverrideResult(version, true)
    return parseContentOverrides(decoded)
  } catch {
    return { ok: false, readOnlyProtected: false, errors: ["この端末の編集内容を読み取れませんでした。"], value: createEmptyContentOverrides() }
  }
}

export function saveContentOverrideDraft(storage: StorageLike, value: ContentOverrides): ContentOverrideReadResult {
  const protection = findStoredContentOverrideProtection(storage)
  if (protection) return protection
  const candidate = { ...value, updatedAt: nowIso() }
  const parsed = parseContentOverrides(candidate)
  if (!parsed.ok) return parsed
  try {
    storage.setItem(CONTENT_OVERRIDE_DRAFT_KEY, JSON.stringify(parsed.value))
    return parsed
  } catch {
    return { ok: false, readOnlyProtected: false, errors: ["下書きを保存できませんでした。端末の空き容量を確認してください。"], value: parsed.value }
  }
}

export function applyContentOverrideDraft(storage: StorageLike, value: ContentOverrides): ContentOverrideReadResult {
  const parsed = saveContentOverrideDraft(storage, value)
  if (!parsed.ok) return parsed
  try {
    storage.setItem(CONTENT_OVERRIDE_APPLIED_KEY, JSON.stringify(parsed.value))
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("miyuki:content-overrides-applied", { detail: parsed.value }))
    }
    return parsed
  } catch {
    return { ok: false, readOnlyProtected: false, errors: ["編集内容を反映できませんでした。元の内容は変更されていません。"], value: parsed.value }
  }
}

export function importContentOverrides(input: string): ContentOverrideReadResult {
  if (!input.trim()) return { ok: false, readOnlyProtected: false, errors: ["ファイルが空です。"], value: createEmptyContentOverrides() }
  if (input.length > MAX_CONTENT_OVERRIDE_CHARACTERS) {
    return { ok: false, readOnlyProtected: false, errors: ["ファイルが大きすぎます。"], value: createEmptyContentOverrides() }
  }
  try {
    return parseContentOverrides(JSON.parse(input) as unknown)
  } catch {
    return { ok: false, readOnlyProtected: false, errors: ["JSONファイルを読み取れませんでした。"], value: createEmptyContentOverrides() }
  }
}

export function serializeContentOverrides(value: ContentOverrides) {
  const parsed = parseContentOverrides({ ...value, updatedAt: nowIso() })
  if (!parsed.ok) return parsed
  return { ok: true as const, readOnlyProtected: false as const, value: JSON.stringify(parsed.value, null, 2) }
}

export function clearContentOverrideDraft(storage: StorageLike) {
  const protection = findStoredContentOverrideProtection(storage)
  if (protection) return protection
  try {
    storage.removeItem(CONTENT_OVERRIDE_DRAFT_KEY)
    return { ok: true as const, readOnlyProtected: false as const, value: createEmptyContentOverrides() }
  } catch {
    return { ok: false as const, readOnlyProtected: false as const, errors: ["下書きを削除できませんでした。"], value: createEmptyContentOverrides() }
  }
}

export function clearAllContentOverrides(storage: StorageLike) {
  const protection = findStoredContentOverrideProtection(storage)
  if (protection) return protection
  try {
    storage.removeItem(CONTENT_OVERRIDE_DRAFT_KEY)
    storage.removeItem(CONTENT_OVERRIDE_APPLIED_KEY)
    const empty = createEmptyContentOverrides()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("miyuki:content-overrides-applied", { detail: empty }))
    }
    return { ok: true as const, readOnlyProtected: false as const, value: empty }
  } catch {
    return { ok: false as const, readOnlyProtected: false as const, errors: ["編集差分を削除できませんでした。"], value: createEmptyContentOverrides() }
  }
}
