import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import ts from "typescript"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const sourcePath = path.join(projectRoot, "lib", "content-overrides.ts")
const source = await readFile(sourcePath, "utf8")
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
  },
  fileName: sourcePath,
}).outputText

const loadedModule = { exports: {} }
const workspaceRequire = createRequire(path.join(projectRoot, "package.json"))
const blockedWindow = {}
Object.defineProperty(blockedWindow, "localStorage", { get() { throw new Error("blocked") } })
vm.runInNewContext(transpiled, {
  module: loadedModule,
  exports: loadedModule.exports,
  require: workspaceRequire,
  console,
  Date,
  JSON,
  Set,
  Map,
  Object,
  Array,
  String,
  Number,
  Boolean,
  RegExp,
  window: blockedWindow,
}, { filename: sourcePath })

const content = loadedModule.exports
const {
  CONTENT_OVERRIDE_APPLIED_KEY,
  CONTENT_OVERRIDE_DRAFT_KEY,
  CONTENT_OVERRIDE_KIND,
  MAX_CONTENT_OVERRIDE_CHARACTERS,
  applyContentOverrideDraft,
  clearAllContentOverrides,
  clearContentOverrideDraft,
  createEmptyContentOverrides,
  diaryContentOverrideSchema,
  getContentOverrideStorage,
  parseContentOverrides,
  readContentOverrides,
  saveContentOverrideDraft,
} = content

assert.equal(getContentOverrideStorage(), null)

class MemoryStorage {
  constructor(entries = []) {
    this.values = new Map(entries)
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null
  }

  setItem(key, value) {
    this.values.set(key, String(value))
  }

  removeItem(key) {
    this.values.delete(key)
  }

  snapshot() {
    return JSON.stringify([...this.values.entries()].sort(([a], [b]) => a.localeCompare(b)))
  }
}

const diaryBase = {
  date: "2026-08-12",
  title: "テスト日記",
  body: "猫となおくんの楽しい一日。",
  miyukiNote: "また遊ぼう。",
  alt: "猫となおくんの絵",
  hidden: false,
}

// Removed PNG paths remain valid migration inputs but normalize to optimized WebP assets.
const legacyDiary = diaryContentOverrideSchema.parse({
  ...diaryBase,
  illustration: "/images/diary-2025-08-12.png",
})
assert.equal(legacyDiary.illustration, "/images/diary-2025-08-12.webp")
const legacyCat = diaryContentOverrideSchema.parse({ ...diaryBase, illustration: "/cute-tabby-sitting.png" })
assert.equal(legacyCat.illustration, "/cute-tabby-sitting.webp")
assert.equal(diaryContentOverrideSchema.safeParse({ ...diaryBase, date: "2024-02-29", illustration: "/cute-tabby-sitting.webp" }).success, true)
assert.equal(diaryContentOverrideSchema.safeParse({ ...diaryBase, date: "2026-02-29", illustration: "/cute-tabby-sitting.webp" }).success, false)

// A future-format draft or applied value must make every destructive path a no-op.
const futureRaw = JSON.stringify({
  kind: CONTENT_OVERRIDE_KIND,
  formatVersion: 99,
  updatedAt: "2026-08-12T00:00:00.000Z",
  diaryEntries: [],
  quizItems: [],
})
const storage = new MemoryStorage([
  [CONTENT_OVERRIDE_DRAFT_KEY, futureRaw],
  [CONTENT_OVERRIDE_APPLIED_KEY, futureRaw],
])
const before = storage.snapshot()
const empty = createEmptyContentOverrides("2026-08-12T00:00:00.000Z")
for (const result of [
  readContentOverrides(storage, "draft"),
  saveContentOverrideDraft(storage, empty),
  applyContentOverrideDraft(storage, empty),
  clearContentOverrideDraft(storage),
  clearAllContentOverrides(storage),
  parseContentOverrides(JSON.parse(futureRaw)),
]) {
  assert.equal(result.ok, false)
  assert.equal(result.readOnlyProtected, true)
  assert.equal(storage.snapshot(), before)
}

const quizBase = {
  id: "builtin-cat-001",
  question: "猫のもんだい",
  options: ["こたえ1", "こたえ2", "こたえ3", "こたえ4"],
  correctIndex: 0,
  explanation: "猫のせつめい",
  hidden: false,
}
assert.equal(parseContentOverrides({ ...empty, diaryEntries: [legacyDiary, { ...legacyDiary, title: "重複" }] }).ok, false)
assert.equal(parseContentOverrides({ ...empty, quizItems: [quizBase, { ...quizBase, question: "重複" }] }).ok, false)

// Oversized stored data is protected before JSON parsing and every destructive path stays a no-op.
const oversizedRaw = "x".repeat(MAX_CONTENT_OVERRIDE_CHARACTERS + 1)
const oversizedStorage = new MemoryStorage([[CONTENT_OVERRIDE_APPLIED_KEY, oversizedRaw]])
const oversizedBefore = oversizedStorage.snapshot()
for (const result of [
  readContentOverrides(oversizedStorage, "applied"),
  saveContentOverrideDraft(oversizedStorage, empty),
  applyContentOverrideDraft(oversizedStorage, empty),
  clearContentOverrideDraft(oversizedStorage),
  clearAllContentOverrides(oversizedStorage),
]) {
  assert.equal(result.ok, false)
  assert.equal(result.readOnlyProtected, true)
  assert.equal(oversizedStorage.snapshot(), oversizedBefore)
}

console.log("Content override verification passed: legacy migration, unique identities, and future/oversized write protection.")
