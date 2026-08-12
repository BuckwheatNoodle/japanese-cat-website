import assert from "node:assert/strict"
import { createHash, webcrypto } from "node:crypto"
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import ts from "typescript"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const workspaceRequire = createRequire(path.join(projectRoot, "package.json"))

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8")
}

function transpile(source, fileName, jsx = false) {
  return ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      ...(jsx ? { jsx: ts.JsxEmit.ReactJSX } : {}),
    },
    fileName,
  }).outputText
}

function executeCommonJs(source, fileName, requireModule = () => ({}), extraGlobals = {}) {
  const loadedModule = { exports: {} }
  vm.runInNewContext(source, {
    module: loadedModule,
    exports: loadedModule.exports,
    require: requireModule,
    console,
    Date,
    Intl,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Set,
    Map,
    TextEncoder,
    Uint8Array,
    crypto: webcrypto,
    ...extraGlobals,
  }, { filename: fileName })
  return loadedModule.exports
}

const parentAccessPath = path.join(projectRoot, "lib", "parent-access.ts")
const parentAccessSource = await readFile(parentAccessPath, "utf8")
const parentAccess = executeCommonJs(transpile(parentAccessSource, parentAccessPath), parentAccessPath)

assert.equal(parentAccess.PARENT_PIN_KEY, "miyuki-parent-editor-pin-v1", "既存PINキーを変更してはいけません")
assert.equal(parentAccess.cleanParentPin("a1-2 345"), "1234")
assert.equal(parentAccess.isValidParentPin("1234"), true)
assert.equal(parentAccess.isValidParentPin("123"), false)

const legacyHash = createHash("sha256").update("miyuki-parent-editor:1234").digest("hex")
assert.equal(await parentAccess.hashParentPin("1234", webcrypto), legacyHash, "既存PINハッシュ形式を変更してはいけません")

class MemoryStorage {
  constructor(entries = []) {
    this.values = new Map(entries)
  }
  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null
  }
}

const legacyStorage = new MemoryStorage([[parentAccess.PARENT_PIN_KEY, legacyHash]])
assert.deepEqual({ ...(await parentAccess.verifyParentPin(legacyStorage, "1234", webcrypto)) }, { ok: true })
assert.equal((await parentAccess.verifyParentPin(legacyStorage, "9999", webcrypto)).reason, "mismatch")
assert.equal((await parentAccess.verifyParentPin(new MemoryStorage(), "1234", webcrypto)).reason, "not-configured")
assert.equal((await parentAccess.verifyParentPin(legacyStorage, "12", webcrypto)).reason, "invalid-format")
assert.equal((await parentAccess.verifyParentPin({ getItem() { throw new Error("blocked") } }, "1234", webcrypto)).reason, "unavailable")

const diaryDataPath = path.join(projectRoot, "lib", "diary.ts")
const diaryDataSource = await readFile(diaryDataPath, "utf8")
const diaryData = executeCommonJs(transpile(diaryDataSource, diaryDataPath), diaryDataPath)
const contentOverridesPath = path.join(projectRoot, "lib", "content-overrides.ts")
const contentOverridesSource = await readFile(contentOverridesPath, "utf8")
const contentOverrides = executeCommonJs(
  transpile(contentOverridesSource, contentOverridesPath),
  contentOverridesPath,
  (id) => id === "@/lib/diary" ? diaryData : workspaceRequire(id),
)
const progressionPath = path.join(projectRoot, "lib", "progression.ts")
const progressionSource = await readFile(progressionPath, "utf8")
const progression = executeCommonJs(
  transpile(progressionSource, progressionPath),
  progressionPath,
  workspaceRequire,
  { BigInt, Math, Symbol, structuredClone },
)

assert.deepEqual(
  Array.from(contentOverrides.DIARY_OVERRIDE_TRANSFORMATION_FORMS),
  ["none", ...Array.from(diaryData.DIARY_COLLECTION_IDS)],
  "親編集室の変身候補は正規図鑑IDだけにします",
)
assert.deepEqual(
  Array.from(contentOverrides.DIARY_OVERRIDE_CAT_IDS),
  Array.from(diaryData.DIARY_CAT_IDS),
  "親編集室の猫候補は正規猫IDだけにします",
)

const legacyDiaryOverride = {
  date: "2026-08-12",
  title: "旧形式の日記",
  body: "変身と猫の指定がなかったころの日記です。",
  miyukiNote: "そのまま読めます。",
  illustration: "/content/diary/2026-08-12.webp",
  alt: "旧形式の日記の絵",
  hidden: false,
}
const parsedLegacyDiary = contentOverrides.diaryContentOverrideSchema.safeParse(legacyDiaryOverride)
assert.equal(parsedLegacyDiary.success, true, "既存v1日記は新しい任意項目なしで読み込めます")
assert.equal(parsedLegacyDiary.data.transformationForm, undefined)
assert.equal(parsedLegacyDiary.data.catIds, undefined)
assert.equal(contentOverrides.diaryContentOverrideSchema.safeParse({ ...legacyDiaryOverride, transformationForm: "none", catIds: [] }).success, true)
assert.equal(contentOverrides.diaryContentOverrideSchema.safeParse({ ...legacyDiaryOverride, transformationForm: "naokun-poop-pirate", catIds: ["cat-maron", "cat-kuro"] }).success, true)
assert.equal(contentOverrides.diaryContentOverrideSchema.safeParse({ ...legacyDiaryOverride, transformationForm: "made-up-form" }).success, false)
assert.equal(contentOverrides.diaryContentOverrideSchema.safeParse({ ...legacyDiaryOverride, catIds: ["cat-made-up"] }).success, false)
assert.equal(contentOverrides.diaryContentOverrideSchema.safeParse({ ...legacyDiaryOverride, catIds: ["cat-maron", "cat-maron"] }).success, false)
assert.equal(contentOverrides.parseContentOverrides({ kind: contentOverrides.CONTENT_OVERRIDE_KIND, formatVersion: 99 }).readOnlyProtected, true)
assert.equal(contentOverrides.importContentOverrides("x".repeat(contentOverrides.MAX_CONTENT_OVERRIDE_CHARACTERS + 1)).ok, false)

const builtInEntries = [
  {
    date: "2026-08-12",
    title: "組み込み日記",
    body: "本文",
    miyukiNote: "ひとこと",
    illustration: "/built-in.webp",
    imagePath: "/built-in.webp",
    alt: "説明",
    collectionId: "naokun-poop-pirate",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "wordplay",
    glossary: [{ term: "船長", reading: "せんちょう", meaning: "船のリーダー" }],
  },
]

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const picturePath = path.join(projectRoot, "components", "picture-diary.tsx")
const pictureSource = await readFile(picturePath, "utf8")
const serviceWorkerSource = await readProjectFile("scripts/generate-service-worker.mjs")
const pictureModule = executeCommonJs(
  transpile(pictureSource, picturePath, true),
  picturePath,
  (id) => {
    if (id === "@/lib/diary") return { DIARY_ENTRIES: builtInEntries }
    if (id === "@/lib/progression") return { createEventId: (prefix) => `${prefix}:test` }
    if (id === "@/lib/utils") return { assetPath: (value) => value, getLocalDateKey: localDateKey }
    if (id === "@/lib/content-overrides") return { CONTENT_OVERRIDE_APPLIED_KEY: "content", readContentOverrides: () => ({ ok: true, value: { diaryEntries: [] } }) }
    if (id === "react") return { useEffect() {}, useMemo: (factory) => factory(), useRef: (value) => ({ current: value }), useState: (value) => [typeof value === "function" ? value() : value, () => {}] }
    if (id === "react/jsx-runtime") return { Fragment: Symbol("Fragment"), jsx: () => null, jsxs: () => null }
    if (id === "next/image") return { __esModule: true, default: () => null }
    if (id === "lucide-react") return new Proxy({}, { get: () => () => null })
    if (id === "@/components/skin-provider") return { useSkin: () => ({ skin: { assets: {} } }) }
    if (id === "@/components/progression-provider") return { useProgression: () => ({}) }
    throw new Error(`Unexpected module in picture diary regression: ${id}`)
  },
)

const initialEntries = pictureModule.mergeDiaryEntries([])
assert.equal(initialEntries[0].collectionId, "naokun-poop-pirate", "変更のない組み込み日記は従来の図鑑IDを保ちます")
assert.deepEqual(Array.from(initialEntries[0].catIds), ["cat-maron", "cat-kuro"], "変更のない組み込み日記は従来の猫IDを保ちます")

const builtInOverride = {
  date: "2026-08-12",
  title: "編集した日記",
  body: "編集本文",
  miyukiNote: "編集ひとこと",
  illustration: "/override.webp",
  alt: "編集説明",
  hidden: false,
}
const overriddenEntry = pictureModule.mergeDiaryEntries([builtInOverride])[0]
assert.equal(overriddenEntry.collectionId, undefined, "未指定のoverride日記は変身ステッカー・図鑑解放を持ちません")
assert.deepEqual(Array.from(overriddenEntry.catIds), [], "本文を変更した日記は組み込みの猫解放を継承しません")
assert.deepEqual(Array.from(overriddenEntry.glossary), [], "本文を変更した日記は古い本文のことばヒントを継承しません")

const customEntry = pictureModule.mergeDiaryEntries([{ ...builtInOverride, date: "2026-09-01" }]).find((entry) => entry.date === "2026-09-01")
assert.equal(customEntry.collectionId, undefined)
assert.deepEqual(Array.from(customEntry.catIds), [])
const explicitNoneEntry = pictureModule.mergeDiaryEntries([{ ...builtInOverride, transformationForm: "none", catIds: [] }])[0]
assert.equal(explicitNoneEntry.collectionId, undefined, "none指定は変身なしとして扱います")
const selectedMetadataEntry = pictureModule.mergeDiaryEntries([{
  ...builtInOverride,
  transformationForm: "naokun-poop-pirate",
  catIds: ["cat-maron", "cat-kuro"],
}])[0]
assert.equal(selectedMetadataEntry.collectionId, "naokun-poop-pirate", "親が明示した正規フォームだけを反映します")
assert.deepEqual(Array.from(selectedMetadataEntry.catIds), ["cat-maron", "cat-kuro"], "親が明示した正規猫だけを反映します")
assert.equal(pictureModule.mergeDiaryEntries([{ ...builtInOverride, hidden: true }]).length, 0, "非表示overrideは従来どおり組み込み日記を隠します")

const beforeMidnight = new Date(2026, 7, 12, 23, 59, 30, 0)
const afterMidnight = new Date(2026, 7, 13, 0, 0, 30, 0)
const actionEntry = { date: "2026-08-12", catIds: [] }
const beforeEvent = pictureModule.createDiaryReadEvent(actionEntry, beforeMidnight)
const afterEvent = pictureModule.createDiaryReadEvent(actionEntry, afterMidnight)
assert.equal(beforeEvent.eventId, "diary:2026-08-12:2026-08-12:none--no-cats")
assert.equal(afterEvent.eventId, "diary:2026-08-13:2026-08-12:none--no-cats")
assert.equal(beforeEvent.occurredAt, beforeMidnight.toISOString(), "日付キーとoccurredAtは同じactionNowから作ります")
assert.equal(afterEvent.occurredAt, afterMidnight.toISOString(), "日跨ぎ後も同じactionNowを使います")
assert.equal(
  pictureModule.createDiaryReadEvent(actionEntry, new Date(2026, 7, 12, 12)).eventId,
  beforeEvent.eventId,
  "同じ日に再描画・二重実行されても同じイベントIDで一日一回になります",
)
assert.deepEqual(Array.from(beforeEvent.catIds), [], "override hydration後のイベントでも猫を誤解放しません")
assert.equal("naokunFormId" in beforeEvent, false, "変身なしの日記はフォーム解放イベントを送りません")
const selectedMetadataEvent = pictureModule.createDiaryReadEvent(selectedMetadataEntry, beforeMidnight)
assert.equal(selectedMetadataEvent.naokunFormId, "naokun-poop-pirate")
assert.deepEqual(Array.from(selectedMetadataEvent.catIds), ["cat-maron", "cat-kuro"])
assert.equal(
  selectedMetadataEvent.eventId,
  "diary:2026-08-12:2026-08-12:naokun-poop-pirate--cat-kuro.cat-maron",
  "変身と猫は正規化した安全な署名としてイベントIDに含めます",
)
const reorderedMetadataEntry = {
  ...selectedMetadataEntry,
  catIds: ["cat-kuro", "cat-maron", "cat-kuro"],
}
assert.equal(
  pictureModule.createDiaryReadEvent(reorderedMetadataEntry, beforeMidnight).eventId,
  selectedMetadataEvent.eventId,
  "猫の選択順と重複は同じメタデータ署名に正規化します",
)

let sameDayState = progression.createInitialAppState("2026-08-12", "2026-08-12T00:00:00.000Z")
sameDayState = progression.reduceProgression(sameDayState, beforeEvent)
const coinsAfterNone = sameDayState.wallet.nyanCoins
assert.equal(sameDayState.stats.diariesRead, 1)
assert.equal(sameDayState.collections.naokunForms["naokun-poop-pirate"], undefined, "変身なしの初読では指定フォームを解放しません")
assert.equal(sameDayState.collections.cats["cat-kuro"], undefined, "猫なしの初読では指定猫を解放しません")

sameDayState = progression.reduceProgression(sameDayState, selectedMetadataEvent)
assert.equal(sameDayState.stats.diariesRead, 2, "同日でもメタデータ変更後のイベントは受理します")
assert.ok(sameDayState.collections.naokunForms["naokun-poop-pirate"], "後から指定したフォームを解放します")
assert.ok(sameDayState.collections.cats["cat-kuro"], "後から指定した猫を解放します")
assert.equal(
  sameDayState.wallet.nyanCoins - coinsAfterNone,
  8,
  "メタデータ変更後は新しい猫・フォーム各4枚だけを加え、日記報酬4枚は日記日単位で再付与しません",
)

const stateAfterSpecified = sameDayState
sameDayState = progression.reduceProgression(
  sameDayState,
  pictureModule.createDiaryReadEvent(selectedMetadataEntry, new Date(2026, 7, 12, 23, 59, 45, 0)),
)
assert.equal(sameDayState, stateAfterSpecified, "同じメタデータの同日再読は同じイベントIDで冪等です")
sameDayState = progression.reduceProgression(
  sameDayState,
  pictureModule.createDiaryReadEvent(reorderedMetadataEntry, new Date(2026, 7, 12, 23, 59, 50, 0)),
)
assert.equal(sameDayState, stateAfterSpecified, "猫の並び順だけが違う同日再読も冪等です")

const diaryReadTokenIndex = pictureSource.indexOf('type: "diary.read"')
const componentStartIndex = pictureSource.indexOf("export function PictureDiary")
assert.ok(diaryReadTokenIndex >= 0 && diaryReadTokenIndex < componentStartIndex, "diary.readは純粋イベント生成関数にだけ置きます")
assert.equal((pictureSource.match(/type:\s*"diary\.read"/g) ?? []).length, 1, "mount/storage用effectへdiary.readを追加してはいけません")
assert.match(pictureSource, /const selectEntry[\s\S]*?recordDiaryRead\(entry\)[\s\S]*?setSelectedDate\(entry\.date\)/, "カレンダーと前後ボタンの明示選択でだけ記録します")

assert.match(pictureSource, /diaryReadMetadataSignature/, "日記イベントIDに正規化したメタデータ署名を使います")

const settingsSource = await readProjectFile("components/settings-center.tsx")
const parentEditorSource = await readProjectFile("components/parent-editor.tsx")
const settingsStylesSource = await readProjectFile("components/settings-center.module.css")
assert.match(parentEditorSource, /metadataFieldset/, "親overrideメタデータだけに専用の小画面レイアウトを適用します")
assert.match(settingsStylesSource, /\.metadataFieldset legend,[\s\S]*?font-size:\s*\.8rem/, "small root（15px）でもメタデータのlegend・ラベル・補足・猫状態は12px以上です")
assert.match(settingsStylesSource, /\.metadataCats\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/, "320pxでは猫選択を一列にreflowします")
assert.match(settingsSource, /\{backupUnlocked \? \(/, "バックアップUIはPIN確認後だけ描画します")
assert.match(settingsSource, /autoComplete="current-password"/, "PIN入力はパスワード管理へ用途を伝えます")
assert.match(settingsSource, /ref=\{backupAccessErrorRef\}[\s\S]*?role="alert"[\s\S]*?aria-live="assertive"[\s\S]*?tabIndex=\{-1\}/, "PINエラーを読み上げてフォーカスできるようにします")
assert.match(settingsSource, /ref=\{backupUnlockedHeadingRef\}[\s\S]*?tabIndex=\{-1\}/, "PIN確認後の見出しへフォーカスできるようにします")
assert.match(settingsSource, /if \(!backupUnlocked\) return[\s\S]*?const content = exportBackup/, "書き出し処理にもPINゲートを設けます")
assert.match(settingsSource, /if \(!backupUnlocked \|\| !backupPreview \|\| !confirmRestore\) return/, "復元処理にもPINゲートと確認チェックを残します")
assert.match(settingsSource, /onClick=\{onOpenParentEditor\}/, "PIN未設定時は親編集室への導線を出します")
assert.doesNotMatch(settingsSource, /sessionStorage[\s\S]*backup/i, "PIN確認状態を画面セッション外へ保存してはいけません")
assert.doesNotMatch(parentEditorSource, /miyuki-parent-editor:\$\{pin\}/, "親編集室は共通ハッシュhelperを使います")
assert.match(parentEditorSource, /hashParentPin\(pin\)/)
assert.match(parentEditorSource, /verifyParentPin\(window\.localStorage, pin\)/)
assert.match(parentEditorSource, /autoComplete=\{hasPin \? "current-password" : "new-password"\}/)
assert.match(parentEditorSource, /ref=\{pinErrorRef\}[\s\S]*?aria-live="assertive"[\s\S]*?tabIndex=\{-1\}/)
assert.match(parentEditorSource, /読んだときの変身と猫（任意）/, "変身と猫の設定は親編集室だけで分かりやすく示します")
assert.match(parentEditorSource, /変身なし（ステッカー・図鑑解放なし）/)
assert.match(parentEditorSource, /DIARY_OVERRIDE_CAT_IDS\.map/, "正規猫IDの候補だけを選べるようにします")
assert.match(pictureSource, /selectedEntry\.collectionId\?\.startsWith/, "変身なしの日記ではステッカーを表示しません")
assert.match(pictureSource, /key=\{selectedEntry\.date\}/, "日付変更時は日記画像を新しい要素として描画します")
assert.match(pictureSource, /data-diary-date=\{selectedEntry\.date\}/, "表示中の日付と画像をブラウザ検証できるようにします")
assert.match(serviceWorkerSource, /async function networkFirstImage\(request, networkResponse\)[\s\S]*?return await networkResponse;[\s\S]*?matchNamedCache\(IMAGE_CACHE_NAME, request\)/, "日記画像はオンライン時に最新レスポンスを優先します")
assert.doesNotMatch(serviceWorkerSource, /async function cacheImage[\s\S]*?if \(cached\) return cached/, "古い画像キャッシュをオンライン時に先出ししてはいけません")

console.log("Parent/diary guard verification passed: explicit diary actions, optional canonical metadata, legacy v1/PIN migration, and session-only backup access.")
