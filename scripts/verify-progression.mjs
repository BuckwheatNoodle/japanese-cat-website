import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import ts from "typescript"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const sourcePath = path.join(projectRoot, "lib", "progression.ts")
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
vm.runInNewContext(transpiled, {
  module: loadedModule,
  exports: loadedModule.exports,
  require: workspaceRequire,
  console,
  Date,
  Math,
  JSON,
  Set,
  Map,
  Object,
  Array,
  String,
  Number,
  Boolean,
  RegExp,
  Symbol,
  BigInt,
  structuredClone,
}, { filename: sourcePath })

const progression = loadedModule.exports
const {
  createInitialAppState,
  domainEventsHaveSameMeaning,
  getDailyMissionDefinitions,
  hasProcessedEvent,
  hydrateProgressionState,
  importProgressionBackup,
  isProgressionLedgerAtCapacity,
  reduceProgression,
  serializeProgressionBackup,
} = progression

const eventAt = (eventId, occurredAt, extra) => ({ eventId, occurredAt, ...extra })

assert.equal(domainEventsHaveSameMeaning(
  eventAt("diary:repeat", "2026-08-12T01:00:00.000Z", {
    type: "diary.read",
    diaryDate: "2026-08-12",
    catIds: ["cat-maron", "cat-kuro", "cat-kuro"],
    naokunFormId: "naokun-poop-pirate",
  }),
  eventAt("diary:repeat", "2026-08-12T09:00:00.000Z", {
    type: "diary.read",
    diaryDate: "2026-08-12",
    catIds: ["cat-kuro", "cat-maron"],
    naokunFormId: "naokun-poop-pirate",
  }),
), true, "再読時刻と猫IDの順序・重複だけが違う日記イベントは同じ意味です")
assert.equal(domainEventsHaveSameMeaning(
  eventAt("diary:repeat", "2026-08-12T01:00:00.000Z", {
    type: "diary.read",
    diaryDate: "2026-08-12",
    catIds: ["cat-kuro"],
    naokunFormId: "naokun-poop-pirate",
  }),
  eventAt("diary:repeat", "2026-08-12T02:00:00.000Z", {
    type: "diary.read",
    diaryDate: "2026-08-12",
    catIds: ["cat-kuro"],
    naokunFormId: "naokun-poop-space",
  }),
), false, "同じIDでも解放フォームが違う日記イベントは衝突です")
assert.equal(domainEventsHaveSameMeaning(
  eventAt("game:repeat", "2026-08-12T01:00:00.000Z", { type: "game.completed", gameId: "rescue", score: 10 }),
  eventAt("game:repeat", "2026-08-12T02:00:00.000Z", { type: "game.completed", gameId: "rescue", score: 11 }),
), false, "同じIDでもスコアが違うゲームイベントは衝突です")

// A duplicate from a previous day must be rejected before daily state changes.
let dailyState = createInitialAppState("2026-08-11", "2026-08-11T01:00:00.000Z")
const completedGame = eventAt("game:duplicate", "2026-08-11T02:00:00.000Z", {
  type: "game.completed",
  gameId: "rescue",
  score: 10,
  won: true,
})
dailyState = reduceProgression(dailyState, completedGame)
dailyState = reduceProgression(dailyState, eventAt("day:12", "2026-08-12T00:00:00.000Z", {
  type: "day.changed",
  date: "2026-08-12",
}))
const afterNewDay = reduceProgression(dailyState, eventAt("game:new-day", "2026-08-12T01:00:00.000Z", {
  type: "game.completed",
  gameId: "rescue",
  score: 5,
  won: false,
}))
const duplicateReplay = reduceProgression(afterNewDay, completedGame)
assert.equal(duplicateReplay.daily.date, "2026-08-12")
assert.equal(JSON.stringify(duplicateReplay.daily.progress), JSON.stringify(afterNewDay.daily.progress))

// Same-day fortunes use the name-scoped event identity, while daily progress and
// rewards remain capped. Replaying an identical event must be a strict no-op.
const fortuneDate = "2026-08-12"
const fortuneEvent = (name) => {
  const fortuneId = `${fortuneDate}:${encodeURIComponent(name)}`
  return eventAt(`fortune:${fortuneId}`, `${fortuneDate}T12:00:00.000Z`, {
    type: "fortune.drawn",
    fortuneId,
  })
}
const miyukiFortune = fortuneEvent("美雪")
const naokunFortune = fortuneEvent("なおくん")
let fortuneState = createInitialAppState(fortuneDate, `${fortuneDate}T00:00:00.000Z`)
const afterMiyukiFortune = reduceProgression(fortuneState, miyukiFortune)
const afterTwoNames = reduceProgression(afterMiyukiFortune, naokunFortune)
assert.equal(hasProcessedEvent(afterTwoNames, miyukiFortune.eventId), true)
assert.equal(hasProcessedEvent(afterTwoNames, naokunFortune.eventId), true)
assert.equal(afterTwoNames.stats.fortunesDrawn, 2)
assert.equal(afterTwoNames.daily.progress["draw-fortune"], 1)
assert.equal(afterMiyukiFortune.wallet.nyanCoins, fortuneState.wallet.nyanCoins + 14)
assert.equal(afterTwoNames.wallet.nyanCoins, afterMiyukiFortune.wallet.nyanCoins)
const duplicateFortuneReplay = reduceProgression(afterTwoNames, miyukiFortune)
assert.equal(duplicateFortuneReplay, afterTwoNames)

// Backup import hydrates the compact event ledger exactly, so an already-seen
// fortune remains a strict no-op after a serialize/import round trip.
const fortuneBackup = serializeProgressionBackup(afterTwoNames, `${fortuneDate}T13:00:00.000Z`)
const importedFortuneBackup = importProgressionBackup(fortuneBackup, fortuneDate, `${fortuneDate}T14:00:00.000Z`)
assert.equal(importedFortuneBackup.ok, true)
if (!importedFortuneBackup.ok) throw new Error("Fortune backup import unexpectedly failed")
assert.equal(hasProcessedEvent(importedFortuneBackup.state, miyukiFortune.eventId), true)
assert.equal(hasProcessedEvent(importedFortuneBackup.state, naokunFortune.eventId), true)
const replayAfterImport = reduceProgression(importedFortuneBackup.state, miyukiFortune)
assert.equal(replayAfterImport, importedFortuneBackup.state)

// Copy variants may change by date, but the v1 selection order, goals, and
// rewards are persisted gameplay contracts and must remain compatible.
const missionCompatibilityCases = {
  "2026-08-12": [["draw-fortune", 1, 12], ["finish-coloring", 1, 18], ["play-game", 1, 18]],
  "2026-01-01": [["finish-coloring", 1, 18], ["read-diary", 1, 12], ["play-game", 1, 18]],
  "2026-04-01": [["draw-fortune", 1, 12], ["play-game", 1, 18], ["finish-coloring", 1, 18]],
}
for (const [dateKey, expected] of Object.entries(missionCompatibilityCases)) {
  const actual = getDailyMissionDefinitions(dateKey).map(({ id, goal, reward }) => [id, goal, reward])
  assert.equal(JSON.stringify(actual), JSON.stringify(expected))
}

// All three story chapters must accept only their progression graph order.
let storyState = createInitialAppState("2026-08-12", "2026-08-12T00:00:00.000Z")
const storyEvents = [
  ["cafe-opening-1", "kitchen"],
  ["cafe-opening-2", "cherry-king-ending"],
  ["lost-star-1", "window"],
  ["lost-star-2", "moon-ending"],
  ["festival-night-1", "cats"],
  ["festival-night-2", "music-ending"],
]
for (const [nodeId, choiceId] of storyEvents) {
  storyState = reduceProgression(storyState, eventAt(`story:test:${nodeId}`, "2026-08-12T02:00:00.000Z", {
    type: "story.nodeCompleted",
    nodeId,
    ...(choiceId ? { choiceId } : {}),
  }))
}
assert.equal(JSON.stringify(storyState.story.unlockedChapterIds), JSON.stringify(["cafe-opening", "lost-star", "festival-night"]))
assert.equal(JSON.stringify(storyState.story.completedNodeIds), JSON.stringify(storyEvents.map(([nodeId]) => nodeId)))
assert.ok(storyState.collections.naokunForms["naokun-poop-gold"])
assert.ok(storyState.collections.naokunForms["naokun-poop-space"])
assert.ok(storyState.collections.naokunForms["naokun-poop-music"])

// v1 raw IDs migrate to distinct 128-bit exact tokens, including a known 32-bit collision pair.
const collisionPair = ["event:103v8qo:iy1t0h", "event:v5oiz:167oqgy"]
const v1Base = createInitialAppState("2026-08-12", "2026-08-12T00:00:00.000Z")
const collisionMigration = hydrateProgressionState({
  ...v1Base,
  version: 1,
  ledger: { processedEventIds: collisionPair, rewardIds: ["starter-coins"] },
}, "2026-08-12", "2026-08-12T00:00:00.000Z")
assert.equal(collisionMigration.persistence, "write")
assert.equal(collisionMigration.state.ledger.processedEventIds.length, 2)
assert.ok(collisionPair.every((eventId) => hasProcessedEvent(collisionMigration.state, eventId)))

// At 20,000 entries history remains exact; entry 20,001 is rejected transactionally.
const capacityIds = Array.from({ length: 20_000 }, (_, index) => `capacity-event-${index}`)
const capacityMigration = hydrateProgressionState({
  ...v1Base,
  version: 1,
  ledger: { processedEventIds: capacityIds, rewardIds: capacityIds.map((_, index) => `capacity-reward-${index}`) },
}, "2026-08-12", "2026-08-12T00:00:00.000Z")
assert.equal(capacityMigration.persistence, "write")
assert.ok(isProgressionLedgerAtCapacity(capacityMigration.state))
assert.ok(hasProcessedEvent(capacityMigration.state, capacityIds[0]))
const overCapacity = reduceProgression(capacityMigration.state, eventAt("capacity-event-new", "2026-08-12T03:00:00.000Z", {
  type: "game.completed",
  gameId: "rescue",
  score: 99,
  won: true,
}))
assert.equal(overCapacity, capacityMigration.state)
assert.equal(hasProcessedEvent(overCapacity, "capacity-event-new"), false)
assert.ok(serializeProgressionBackup(capacityMigration.state).length < 2_000_000)

// Future formats and an inexact old Bloom ledger are protected read-only.
const future = hydrateProgressionState({ ...v1Base, version: 999 }, "2026-08-12")
assert.equal(future.persistence, "read-only")
const inexactV2 = hydrateProgressionState({
  ...v1Base,
  version: 2,
  ledger: {
    processedEventIds: [],
    rewardIds: [],
    processedEventArchive: "",
    rewardArchive: "",
    processedEventBloom: "1",
    rewardBloom: "",
  },
}, "2026-08-12")
assert.equal(inexactV2.persistence, "read-only")

// Known-reference repair keeps current data usable without exposing ghost catalog or room entries.
const repairedReferences = hydrateProgressionState({
  ...v1Base,
  collections: {
    cats: { ...v1Base.collections.cats, "cat-from-the-future": { unlockedAt: "2026-08-12T00:00:00.000Z" } },
    naokunForms: { "naokun-poop-unknown": { unlockedAt: "2026-08-12T00:00:00.000Z" } },
  },
  inventory: { ownedItemIds: [...v1Base.inventory.ownedItemIds, "unknown-chair"] },
  room: { equipped: { ...v1Base.room.equipped, shelf: "unknown-chair" } },
  story: { unlockedChapterIds: ["cafe-opening", "future-chapter"], completedNodeIds: ["future-node"], choices: { "future-node": "future-choice" } },
  stats: { ...v1Base.stats, storyNodesCompleted: 99 },
  settings: { ...v1Base.settings, skinId: "future-skin" },
}, "2026-08-12")
assert.equal(repairedReferences.persistence, "write")
assert.equal(repairedReferences.state.collections.cats["cat-from-the-future"], undefined)
assert.equal(repairedReferences.state.collections.naokunForms["naokun-poop-unknown"], undefined)
assert.equal(repairedReferences.state.inventory.ownedItemIds.includes("unknown-chair"), false)
assert.equal(repairedReferences.state.room.equipped.shelf, undefined)
assert.deepEqual([...repairedReferences.state.story.unlockedChapterIds], ["cafe-opening"])
assert.equal(repairedReferences.state.settings.skinId, "cream-soda")
assert.ok(repairedReferences.warnings.some((warning) => warning.includes("安全に整理")))

console.log("Progression verification passed: daily and fortune idempotency, mission compatibility, backup replay protection, 3 story chapters, exact ledger migration/capacity, reference repair, and read-only protection.")
