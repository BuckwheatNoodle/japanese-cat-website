import assert from "node:assert/strict"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import ts from "typescript"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const diaryPath = path.join(projectRoot, "lib", "diary.ts")
const catalogPath = path.join(projectRoot, "components", "collection-book.tsx")
const diarySource = await readFile(diaryPath, "utf8")
const catalogSource = await readFile(catalogPath, "utf8")

const transpiledDiary = ts.transpileModule(diarySource, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
  },
  fileName: diaryPath,
}).outputText

const loadedDiary = { exports: {} }
vm.runInNewContext(transpiledDiary, {
  module: loadedDiary,
  exports: loadedDiary.exports,
  console,
  Object,
  Array,
  String,
  Number,
  Boolean,
  RegExp,
  Set,
  Map,
}, { filename: diaryPath })

const {
  DIARY_COLLECTION_BY_DATE,
  DIARY_COLLECTION_IDS,
  DIARY_ENTRIES,
  DIARY_ENTRY_VALIDATION_ISSUES,
  DIARY_SAFE_TRANSFORMATION_CUES,
} = loadedDiary.exports

assert.equal(DIARY_ENTRIES.length, 63, "日記は63件必要です")
assert.equal(Object.keys(DIARY_COLLECTION_BY_DATE).length, 63, "図鑑対応表は63件必要です")
assert.deepEqual([...DIARY_ENTRY_VALIDATION_ISSUES], [], "日記データの組み込み検証に失敗しました")

const transformationCueCounts = new Map(DIARY_SAFE_TRANSFORMATION_CUES.map((cue) => [cue, 0]))
for (const entry of DIARY_ENTRIES) {
  const matchedCues = DIARY_SAFE_TRANSFORMATION_CUES.filter((cue) => entry.body.includes(cue))
  assert.equal(matchedCues.length, 1, `${entry.date} の本文には許可済みの変身演出を1種類だけ含めてください`)

  const transformationSentence = entry.body
    .split("。")
    .find((sentence) => sentence.includes("変身") && /うんち[^。]{0,40}(?:に|へ)変身/.test(sentence))
  assert.ok(transformationSentence, `${entry.date} になおくんのうんち姿への明示的な変身がありません`)
  assert.equal(
    transformationSentence.includes(matchedCues[0]),
    true,
    `${entry.date} の変身演出とうんち姿への変身は同じ文にしてください`,
  )
  assert.equal(/におい|汚れ|清潔|あんしん/.test(entry.body), false, `${entry.date} に否定的な衛生説明が残っています`)
  transformationCueCounts.set(matchedCues[0], transformationCueCounts.get(matchedCues[0]) + 1)
}

const usedTransformationCues = [...transformationCueCounts.entries()].filter(([, count]) => count > 0)
const mostUsedTransformationCue = usedTransformationCues.reduce(
  (mostUsed, current) => current[1] > mostUsed[1] ? current : mostUsed,
  ["", 0],
)
assert.ok(usedTransformationCues.length >= 8, "日記の変身演出は8種類以上必要です")
assert.ok(
  mostUsedTransformationCue[1] / DIARY_ENTRIES.length <= 0.25,
  `最多の変身演出「${mostUsedTransformationCue[0]}」が全体の25%を超えています`,
)

const slipperHotelEntry = DIARY_ENTRIES.find((entry) => entry.date === "2026-08-10")
assert.ok(slipperHotelEntry, "2026-08-10 のスリッパホテル日記がありません")
assert.equal(DIARY_ENTRIES.some((entry) => entry.body.includes("12号室")), false, "画像にない12号室の札が本文に残っています")
assert.equal(slipperHotelEntry.body.includes("青い肉球マーク"), true, "スリッパホテル本文が青い肉球札と一致しません")
assert.equal(slipperHotelEntry.alt.includes("同じ青い肉球札"), true, "スリッパホテルの画像説明が青い肉球札と一致しません")

const dates = new Set()
for (const entry of DIARY_ENTRIES) {
  assert.equal(dates.has(entry.date), false, `${entry.date} が重複しています`)
  dates.add(entry.date)
  const imageFile = path.join(projectRoot, "public", ...entry.imagePath.split("/").filter(Boolean))
  const imageStats = await stat(imageFile)
  assert.equal(imageStats.isFile(), true, `${entry.date} の絵日記画像がファイルではありません`)
  assert.ok(imageStats.size > 100_000, `${entry.date} の絵日記画像が空か小さすぎます`)
  assert.equal(
    entry.collectionId,
    DIARY_COLLECTION_BY_DATE[entry.date],
    `${entry.date} の図鑑IDが監査済みの変身役と一致しません`,
  )
}

const catalogIds = new Set(
  [...catalogSource.matchAll(/id:\s*"(naokun-poop-[^"]+)"/g)].map((match) => match[1]),
)
for (const collectionId of DIARY_COLLECTION_IDS) {
  assert.equal(catalogIds.has(collectionId), true, `${collectionId} が図鑑に存在しません`)
}
for (const entry of DIARY_ENTRIES) {
  assert.equal(catalogIds.has(entry.collectionId), true, `${entry.date} の図鑑IDが図鑑に存在しません`)
}

const naokunCatalogSource = catalogSource.split("const NAOKUN_TRANSFORMATIONS", 2)[1].split("export const COLLECTION_CATALOG", 1)[0]
const catalogHints = new Map(
  [...naokunCatalogSource.matchAll(/id:\s*"(naokun-poop-[^"]+)"[\s\S]*?hint:\s*"([^"]+)"/g)]
    .map((match) => [match[1], match[2]]),
)
const synchronizedHints = {
  "naokun-poop-soda": "猫うらないをしてみよう",
  "naokun-poop-gold": "今日のミッションを達成し、報酬を受け取る",
  "naokun-poop-chef": "お部屋のテーブルに家具を置こう",
  "naokun-poop-bakery": "絵日記を5つ読もう",
  "naokun-poop-ninja": "神経衰弱で遊んでみよう",
  "naokun-poop-detective": "猫クイズで5,000点をめざそう",
  "naokun-poop-pirate": "『段ボール海のうんち船長』を読もう",
  "naokun-poop-samurai": "なおくん救出で10回助けよう",
  "naokun-poop-robot": "3種類のゲームで遊ぼう",
  "naokun-poop-music": "音をONにしてゲームを2回遊ぶか、ものがたり第3話を読もう",
  "naokun-poop-artist": "ぬりえを3枚完成させよう",
  "naokun-poop-hero": "ものがたり第1話で猫チームを選ぶか、『正義のうんちマン』を読もう",
  "naokun-poop-ghost": "『せんぷうきとうんち雲』を読もう",
}
for (const [collectionId, hint] of Object.entries(synchronizedHints)) {
  assert.equal(catalogHints.get(collectionId), hint, `${collectionId} の解放ヒントが実際の条件と一致しません`)
}
const ambiguousDateHints = [...naokunCatalogSource.matchAll(/hint:\s*"([^"]+)"/g)]
  .map((match) => match[1])
  .filter((hint) => /\d{1,2}月\d{1,2}日/.test(hint))
assert.deepEqual(ambiguousDateHints, [], "年のない日付断定が図鑑ヒントに残っています")

const unsafeFoodCoupling = [
  "においではなく",
  "頭にアイスとさくらんぼ",
  "ストローは飾り",
  "クリームといちごで飾られ",
  "パン生地と間違われ",
  "クッキーを自信満々で見せ",
  "宝はかつおぶし",
  "お菓子をください",
  "猫用おやつまで集め",
  "ソーダの海を泳ぐ",
  "桜もちうんち",
  "桜の葉っぱに包まれ",
  "食べものではありません",
].filter((phrase) => naokunCatalogSource.includes(phrase))
assert.deepEqual(unsafeFoodCoupling, [], "図鑑になおくんと食品・においを直接結ぶ旧表現が残っています")

console.log(
  `Diary collection verification passed: 63/63 mappings, ${usedTransformationCues.length} transformation cues, `
  + `max cue ratio ${mostUsedTransformationCue[1]}/63 (${(mostUsedTransformationCue[1] / DIARY_ENTRIES.length * 100).toFixed(1)}%), `
  + "and synchronized catalog hints.",
)
