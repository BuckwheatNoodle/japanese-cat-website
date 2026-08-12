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

const { advanceColoringCompletionTracker, coloringRegionLabel, renderSvg } = loadedModule.exports
assert.equal(typeof advanceColoringCompletionTracker, "function")
assert.equal(typeof coloringRegionLabel, "function")
assert.equal(typeof renderSvg, "function")

const coloringPagesSource = await readFile(path.join(projectRoot, "lib", "coloring-pages.ts"), "utf8")
const englishRegionNames = [...coloringPagesSource.matchAll(/data-name="([A-Za-z][A-Za-z0-9-]*)"/g)].map((match) => match[1])
for (const name of englishRegionNames) {
  assert.doesNotMatch(coloringRegionLabel(name), /^[A-Za-z]/, `${name} needs a Japanese accessible label`)
}
assert.equal(coloringRegionLabel("tail"), "しっぽ")
assert.equal(coloringRegionLabel("left-paw"), "左の前足")
assert.equal(coloringRegionLabel("背景"), "背景")

const renderedSvg = renderSvg({
  id: "render-check",
  title: "描画確認",
  difficulty: "easy",
  difficultyLabel: "入門",
  description: "",
  svg: '<svg role="img"><path data-name="背景" d="M0 0h10v10H0Z" fill="white"/><circle data-name="丸" cx="5" cy="5" r="2" fill="white"/></svg>',
}, { 丸: "#f17469" })

assert.equal((renderedSvg.match(/role="button"/g) ?? []).length, 2)
assert.match(renderedSvg, /<path[^>]*aria-label="描画確認の背景をぬる"\/>/)
assert.match(renderedSvg, /<circle[^>]*fill="#f17469"[^>]*aria-label="描画確認の丸をぬる"\/>/)
assert.match(renderedSvg, /<svg role="group">/)

const englishNamedSvg = renderSvg({
  id: "label-check",
  title: "読み上げ確認",
  difficulty: "easy",
  difficultyLabel: "入門",
  description: "",
  svg: '<svg role="img"><path data-name="tail" d="M0 0h10v10H0Z" fill="white"/><path data-name="left-paw" d="M10 0h10v10H10Z" fill="white"/></svg>',
}, {})
assert.match(englishNamedSvg, /aria-label="読み上げ確認のしっぽをぬる"/)
assert.match(englishNamedSvg, /aria-label="読み上げ確認の左の前足をぬる"/)
assert.doesNotMatch(englishNamedSvg, /aria-label="[^"]*(?:tail|left-paw)/)

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
