import assert from "node:assert/strict"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import ts from "typescript"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const diaryPath = path.join(projectRoot, "lib", "diary.ts")
const diarySource = await readFile(diaryPath, "utf8")

const transpiledDiary = ts.transpileModule(diarySource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
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
  DIARY_CAT_BY_ID,
  DIARY_CATS,
  DIARY_ENTRIES,
  DIARY_ENTRY_VALIDATION_ISSUES,
  MIYUKI_REFERENCE_ENTRIES,
} = loadedDiary.exports

const expectedEntryCount = 83
assert.equal(DIARY_ENTRIES.length, expectedEntryCount, `日記は${expectedEntryCount}件必要です`)
assert.deepEqual([...DIARY_ENTRY_VALIDATION_ISSUES], [], "日記データの組み込み検証に失敗しました")
assert.equal(
  JSON.stringify(DIARY_CATS.map(({ id, name }) => [id, name])),
  JSON.stringify([["cat-maron", "トラちゃん"], ["cat-kuro", "キキ"], ["cat-yuki", "フワ"]]),
  "登場する猫は正式名の三匹だけにしてください",
)

const dates = new Set()
const bodies = new Set()
let catchphraseCount = 0
let collectionEntryCount = 0

for (const entry of DIARY_ENTRIES) {
  assert.equal(dates.has(entry.date), false, `${entry.date} が重複しています`)
  dates.add(entry.date)
  assert.equal(bodies.has(entry.body), false, `${entry.date} の本文が別の日と重複しています`)
  bodies.add(entry.body)

  const sentences = entry.body.split("。").map((sentence) => sentence.trim()).filter(Boolean)
  assert.ok(sentences.length >= 2 && sentences.length <= 3, `${entry.date} の本文は2〜3文にしてください`)
  assert.ok(entry.body.length >= 25 && entry.body.length <= 105, `${entry.date} の本文は25〜105文字にしてください`)
  assert.ok(entry.body.includes("なおくん"), `${entry.date} の本文になおくんがいません`)
  assert.match(entry.body, /猫|トラちゃん|キキ|フワ/, `${entry.date} の本文に猫の話がありません`)
  assert.doesNotMatch(entry.body, /担当しました|うんち姿|変身しました|大ニュースです|総合優勝/, `${entry.date} に古い説明調の表現が残っています`)
  assert.ok(entry.alt.includes("顔のない"), `${entry.date} の画像説明に顔なしのなおくんが明記されていません`)
  assert.ok(entry.alt.includes("なおくん"), `${entry.date} の画像説明になおくんがいません`)
  assert.ok(entry.catIds.length > 0 && entry.catIds.length <= 3, `${entry.date} の登場猫が不正です`)
  assert.equal(new Set(entry.catIds).size, entry.catIds.length, `${entry.date} の猫IDが重複しています`)

  for (const catId of entry.catIds) {
    const cat = DIARY_CAT_BY_ID[catId]
    assert.ok(cat, `${entry.date} の猫ID ${catId} が正史に存在しません`)
    assert.ok((entry.title + entry.body + entry.alt).includes(cat.name), `${entry.date} の猫ID ${catId} と名前 ${cat.name} が一致しません`)
  }

  const imageFile = path.join(projectRoot, "public", ...entry.imagePath.split("/").filter(Boolean))
  const imageStats = await stat(imageFile)
  assert.ok(imageStats.isFile(), `${entry.date} の絵日記画像がファイルではありません`)
  assert.ok(imageStats.size > 100_000, `${entry.date} の絵日記画像が空か小さすぎます`)

  if (entry.body.includes("そんなことより")) catchphraseCount += 1
  if (entry.collectionId) collectionEntryCount += 1
}

for (const [date, body] of Object.entries(MIYUKI_REFERENCE_ENTRIES)) {
  const entry = DIARY_ENTRIES.find((candidate) => candidate.date === date)
  assert.ok(entry, `${date} の美雪原稿がありません`)
  assert.equal(entry.body, body, `${date} の美雪原稿が変更されています`)
}

assert.ok(catchphraseCount >= 50, "美雪らしい『そんなことより』の切り返しが少なすぎます")
assert.ok(collectionEntryCount / DIARY_ENTRIES.length <= 0.2, "特別な図鑑フォームは日記全体の20%以下にしてください")

console.log(
  `Diary verification passed: ${expectedEntryCount} concise 2-3 sentence entries, ${Object.keys(MIYUKI_REFERENCE_ENTRIES).length} Miyuki originals locked, `
  + `${catchphraseCount} catchphrase entries, 3 canonical cats, and faceless Naokun art directions for every date.`,
)
