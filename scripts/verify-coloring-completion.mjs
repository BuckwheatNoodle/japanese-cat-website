import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import ts from "typescript"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const sourcePath = path.join(projectRoot, "components", "coloring-studio.tsx")
const source = await readFile(sourcePath, "utf8")
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
  fileName: sourcePath,
}).outputText

const noop = () => null
const loadedModule = { exports: {} }
const mockRequire = (id) => {
  if (id === "next/image") return { __esModule: true, default: noop }
  if (id === "react") return { useEffect: noop, useMemo: noop, useRef: noop, useState: noop }
  if (id === "react/jsx-runtime") return { Fragment: Symbol("Fragment"), jsx: noop, jsxs: noop }
  if (id === "lucide-react") return new Proxy({}, { get: () => noop })
  if (id === "@/components/skin-provider") return { useSkin: noop }
  if (id === "@/components/progression-provider") return { useProgression: noop }
  if (id === "@/lib/coloring-pages") return { COLORING_PAGES: [], COLOR_PALETTE: [{ color: "#000000" }] }
  throw new Error(`Unexpected dependency while loading coloring completion logic: ${id}`)
}

vm.runInNewContext(transpiled, {
  module: loadedModule,
  exports: loadedModule.exports,
  require: mockRequire,
  console,
  Array,
  Boolean,
  Date,
  JSON,
  Map,
  Math,
  Number,
  Object,
  RegExp,
  Set,
  String,
  Symbol,
}, { filename: sourcePath })

const { advanceColoringCompletionTracker } = loadedModule.exports
assert.equal(typeof advanceColoringCompletionTracker, "function")

const runStep = (tracker, pageId, percent) => advanceColoringCompletionTracker(tracker, pageId, percent)

// A genuinely new work reaches 100% from below during this session.
let result = runStep({ fresh: 92 }, "fresh", 100)
assert.equal(result.completed, true)

// StrictMode/effect replay and ordinary re-renders see 100 -> 100 and stay silent.
result = runStep(result.tracker, "fresh", 100)
assert.equal(result.completed, false)
result = runStep(result.tracker, "fresh", 100)
assert.equal(result.completed, false)

// A saved 100% work is part of the hydration baseline, not a new completion.
result = runStep({ saved: 100 }, "saved", 100)
assert.equal(result.completed, false)

// Switching among completed tabs and returning to the first tab must not complete either page again.
let tabs = { first: 100, second: 100 }
for (const pageId of ["first", "second", "first"]) {
  const tabResult = runStep(tabs, pageId, 100)
  assert.equal(tabResult.completed, false)
  tabs = tabResult.tracker
}

// A date change only re-evaluates the same progress; 100 -> 100 remains silent.
result = runStep(tabs, "first", 100)
assert.equal(result.completed, false)

// An unseen page at 100% is baselined silently, covering remount/hydration ordering.
result = runStep({}, "restored", 100)
assert.equal(result.completed, false)

// Falling below 100% and completing again in the same session is a real new transition.
result = runStep({ edited: 100 }, "edited", 60)
assert.equal(result.completed, false)
result = runStep(result.tracker, "edited", 100)
assert.equal(result.completed, true)

console.log("Coloring completion transition checks passed.")
