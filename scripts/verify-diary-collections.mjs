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
  DIARY_CAT_BY_ID,
  DIARY_CATS,
  DIARY_ENTRIES,
  DIARY_ENTRY_VALIDATION_ISSUES,
  DIARY_SAFE_TRANSFORMATION_CUES,
} = loadedDiary.exports

assert.equal(DIARY_ENTRIES.length, 63, "日記は63件必要です")
assert.equal(Object.keys(DIARY_COLLECTION_BY_DATE).length, 63, "日記対応表は63件必要です")
assert.deepEqual([...DIARY_ENTRY_VALIDATION_ISSUES], [], "日記データの組み込み検証に失敗しました")
assert.equal(
  JSON.stringify(DIARY_CATS.map(({ id, name }) => [id, name])),
  JSON.stringify([["cat-maron", "トラちゃん"], ["cat-kuro", "キキ"], ["cat-yuki", "フワ"]]),
  "登場する猫は正式名の三匹だけにしてください",
)

const legacyCatNamePattern = /マロン|ユキ|ミケ|クロ|トラまる/
let transformationEntryCount = 0
const dates = new Set()

for (const entry of DIARY_ENTRIES) {
  assert.equal(dates.has(entry.date), false, `${entry.date} が重複しています`)
  dates.add(entry.date)

  const visibleCopy = entry.title + entry.body + entry.alt
  assert.equal(legacyCatNamePattern.test(visibleCopy), false, `${entry.date} に旧猫名が残っています`)
  assert.ok(entry.catIds.length > 0, `${entry.date} に登場猫がいません`)
  assert.ok(entry.catIds.length <= 3, `${entry.date} の登場猫が三匹を超えています`)
  assert.equal(new Set(entry.catIds).size, entry.catIds.length, `${entry.date} の猫IDが重複しています`)

  const sentences = entry.body.split("。").map((sentence) => sentence.trim()).filter(Boolean)
  assert.ok(sentences.length <= 3, `${entry.date} の本文は最大3文にしてください`)
  assert.ok(entry.body.length <= 210, `${entry.date} の本文が長すぎます`)

  const matchedCues = DIARY_SAFE_TRANSFORMATION_CUES.filter((cue) => entry.body.includes(cue))
  const transformationSentence = sentences.find((sentence) => sentence.includes("変身") && /うんち[^。]{0,40}(?:に|へ)変身/.test(sentence))
  if (entry.collectionId) {
    transformationEntryCount += 1
    assert.equal(matchedCues.length, 1, `${entry.date} の専用変身回には許可済みの演出を1種類だけ含めてください`)
    assert.ok(transformationSentence, `${entry.date} の専用フォーム回に明示的な変身がありません`)
  } else {
    assert.equal(matchedCues.length, 0, `${entry.date} の日常回に定型の魔法演出が残っています`)
    assert.equal(transformationSentence, undefined, `${entry.date} の日常回にうんち変身が残っています`)
  }

  for (const catId of entry.catIds) {
    const cat = DIARY_CAT_BY_ID[catId]
    assert.ok(cat, `${entry.date} の猫ID ${catId} が正史に存在しません`)
    assert.equal(visibleCopy.includes(cat.name), true, `${entry.date} の猫ID ${catId} と名前 ${cat.name} が一致しません`)
  }
  for (const cat of DIARY_CATS) {
    if (visibleCopy.includes(cat.name)) {
      assert.equal(entry.catIds.includes(cat.id), true, `${entry.date} の登場猫 ${cat.name} にID ${cat.id} がありません`)
    }
  }

  const imageFile = path.join(projectRoot, "public", ...entry.imagePath.split("/").filter(Boolean))
  const imageStats = await stat(imageFile)
  assert.equal(imageStats.isFile(), true, `${entry.date} の絵日記画像がファイルではありません`)
  assert.ok(imageStats.size > 100_000, `${entry.date} の絵日記画像が空か小さすぎます`)
}

assert.ok(transformationEntryCount >= 5, "専用フォームを見せる特別回が少なすぎます")
assert.ok(transformationEntryCount / DIARY_ENTRIES.length <= 0.2, "なおくんの変身回は日記全体の20%以下にしてください")

console.log(
  `Diary verification passed: 63 entries, 3 canonical cats, max 3 sentences, `
  + `${transformationEntryCount}/63 dedicated transformation stories.`,
)
