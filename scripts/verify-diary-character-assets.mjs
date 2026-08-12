import assert from "node:assert/strict"
import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const diarySourcePath = path.join(projectRoot, "lib", "diary.ts")
const diaryImageRoot = path.join(projectRoot, "public", "content", "diary")
const guidePath = path.join(projectRoot, "docs", "diary-character-visual-guide.md")

const canonicalCats = [
  {
    name: "トラちゃん",
    asset: "/content/collections/cats/maron.webp",
    requiredGuideTerms: ["茶トラ", "蝶ネクタイ"],
  },
  {
    name: "キキ",
    asset: "/content/collections/cats/kuro.webp",
    requiredGuideTerms: ["真っ黒", "三日月チャーム"],
  },
  {
    name: "フワ",
    asset: "/content/collections/cats/yuki.webp",
    requiredGuideTerms: ["長毛", "星チャーム"],
  },
]

function readUint24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16)
}

function webpDimensions(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF", "WEBPにRIFFヘッダーがありません")
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP", "WEBPシグネチャがありません")

  let offset = 12
  while (offset + 8 <= buffer.length) {
    const chunk = buffer.toString("ascii", offset, offset + 4)
    const chunkSize = buffer.readUInt32LE(offset + 4)
    const payload = offset + 8

    if (chunk === "VP8X") {
      return {
        width: readUint24LE(buffer, payload + 4) + 1,
        height: readUint24LE(buffer, payload + 7) + 1,
      }
    }

    if (chunk === "VP8 ") {
      assert.equal(buffer.toString("hex", payload + 3, payload + 6), "9d012a", "VP8フレームヘッダーが不正です")
      return {
        width: buffer.readUInt16LE(payload + 6) & 0x3fff,
        height: buffer.readUInt16LE(payload + 8) & 0x3fff,
      }
    }

    if (chunk === "VP8L") {
      assert.equal(buffer[payload], 0x2f, "VP8Lシグネチャが不正です")
      const b1 = buffer[payload + 1]
      const b2 = buffer[payload + 2]
      const b3 = buffer[payload + 3]
      const b4 = buffer[payload + 4]
      return {
        width: 1 + b1 + ((b2 & 0x3f) << 8),
        height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
      }
    }

    offset = payload + chunkSize + (chunkSize % 2)
  }

  throw new Error("WEBPから画像サイズを取得できません")
}

async function verifySquareWebp(filePath, label) {
  const image = await readFile(filePath)
  const { width, height } = webpDimensions(image)
  assert.equal(width, height, `${label} は正方形である必要があります`)
  assert.ok(width >= 1200, `${label} は1200 x 1200以上で保存してください`)
  assert.ok(image.length > 100_000, `${label} のファイルサイズが小さすぎます`)
}

const guide = await readFile(guidePath, "utf8")
for (const cat of canonicalCats) {
  assert.ok(guide.includes(cat.name), `ガイドに${cat.name}がありません`)
  assert.ok(guide.includes(cat.asset), `ガイドに${cat.asset}がありません`)
  for (const term of cat.requiredGuideTerms) {
    assert.ok(guide.includes(term), `ガイドの${cat.name}に識別語「${term}」がありません`)
  }

  const anchorPath = path.join(projectRoot, "public", ...cat.asset.split("/").filter(Boolean))
  const anchorStats = await stat(anchorPath)
  assert.ok(anchorStats.isFile(), `${cat.name}の参照画像がありません`)
  await verifySquareWebp(anchorPath, `${cat.name}の参照画像`)
}

for (const requiredRule of ["ゲスト猫", "公式3匹と誤認しない", "識別アクセサリー", "本文で名前を呼ぶ猫と画像内の役割が一致"]) {
  assert.ok(guide.includes(requiredRule), `ガイドに必須ルール「${requiredRule}」がありません`)
}

const diarySource = await readFile(diarySourcePath, "utf8")
const sourceDates = [...diarySource.matchAll(/date:\s*"(\d{4}-\d{2}-\d{2})"/g)].map((match) => match[1]).sort()
const expectedEntryCount = 83
assert.equal(sourceDates.length, expectedEntryCount, `日記データは${expectedEntryCount}件必要です`)
assert.equal(new Set(sourceDates).size, expectedEntryCount, "日記データの日付が重複しています")

const imageFiles = (await readdir(diaryImageRoot))
  .filter((file) => file.endsWith(".webp"))
  .sort()
assert.equal(imageFiles.length, expectedEntryCount, `日記画像は${expectedEntryCount}枚必要です`)
assert.deepEqual(imageFiles, sourceDates.map((date) => `${date}.webp`), "日記データと画像ファイルの日付が一致しません")

for (const imageFile of imageFiles) {
  await verifySquareWebp(path.join(diaryImageRoot, imageFile), `日記画像 ${imageFile}`)
}

console.log(`Diary character asset check passed: 3 canonical references and ${expectedEntryCount} square diary WEBPs match the visual guide.`)
