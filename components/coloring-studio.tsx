"use client"

import NextImage from "next/image"
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react"
import {
  Check,
  Download,
  Eraser,
  Maximize2,
  Paintbrush,
  Pipette,
  Redo2,
  RotateCcw,
  Sparkles,
  Undo2,
  WandSparkles,
} from "lucide-react"
import { useSkin } from "@/components/skin-provider"
import { useProgression } from "@/components/progression-provider"
import { COLORING_PAGES, COLOR_PALETTE, type ColoringPage } from "@/lib/coloring-pages"

type Tool = "paint" | "eyedropper" | "eraser"
type FillMap = Record<string, string>
type ColoringDocumentV3 = { version: 3; pages: Record<string, FillMap> }
type HistoryState = Record<string, { undo: FillMap[]; redo: FillMap[] }>
type SaveState = "loading" | "saved" | "failed"
type ColoringCompletionTracker = Readonly<Record<string, number>>

const STORAGE_KEY = "miyukiColoringStudioV3"
const LEGACY_STORAGE_KEY = "miyukiColoringStudioV2"
const PAINTABLE_TAGS = new Set(["circle", "ellipse", "path", "rect", "polygon"])
const SAFE_HEX = /^#[0-9a-f]{6}$/i
const EMPTY_DOCUMENT: ColoringDocumentV3 = { version: 3, pages: {} }

export function advanceColoringCompletionTracker(
  tracker: ColoringCompletionTracker,
  pageId: string,
  nextPercent: number,
) {
  const previousPercent = tracker[pageId]
  return {
    tracker: { ...tracker, [pageId]: nextPercent },
    completed: previousPercent !== undefined && previousPercent < 100 && nextPercent === 100,
  }
}

const naokunColoringFrame = (content: string, label: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 340" role="img" aria-label="${label}" style="background:#fffdf8" stroke="#533a2d" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="6" width="468" height="328" rx="26" fill="white"/>
    ${content}
  </svg>`

const NAOKUN_COLORING_PAGES: ColoringPage[] = [
  {
    id: "naokun-cloud-parade",
    title: "なおくん雲と猫行列",
    difficulty: "normal",
    difficultyLabel: "標準",
    description: "虹を渡るなおくん雲と、楽器を持った猫パレードを仕上げます",
    svg: naokunColoringFrame(`
      <path data-name="空" d="M8 8h464v204H8Z" fill="white"/>
      <path data-name="遠くの丘" d="M8 181c54-44 103-44 151 0 55-61 110-57 166 4 50-42 98-38 147 3v61H8Z" fill="white"/>
      <path data-name="草原" d="M8 212c78-26 143 18 216-6 83-27 159 18 248-2v128H8Z" fill="white"/>
      <circle data-name="太陽" cx="413" cy="58" r="33" fill="white"/>
      <path data-name="小さな雲" d="M38 79c-9-20 12-36 30-27 8-25 43-22 49 2 23-6 41 19 27 38H51c-13 0-19-5-13-13Z" fill="white"/>
      <path data-name="虹" d="M121 204c20-91 76-139 132-139 59 0 116 52 133 139h-31c-18-70-61-108-102-108-42 0-83 37-101 108Z" fill="white"/>
      <path data-name="虹の内側" d="M153 204c17-67 57-103 100-103 45 0 85 38 101 103h-30c-14-45-42-72-71-72-30 0-57 26-70 72Z" fill="white"/>
      <path data-name="虹の中心" d="M184 204c13-43 40-67 69-67 30 0 58 25 70 67h-30c-9-23-24-36-40-36-17 0-31 13-39 36Z" fill="white"/>
      <path data-name="なおくん雲" d="M189 147c-30-7-35-44-10-58-12-30 21-56 48-40 7-32 51-37 66-9 30-10 56 24 39 49 26 15 18 57-15 61 12 28-11 53-42 46-20 17-53 13-67-8-29 4-43-24-19-41Z" fill="white"/>
      <path data-name="雲の帽子" d="M218 48c10-30 57-39 82-10l-10 29-60 5Z" fill="white"/>
      <path data-name="帽子の星" d="m260 35 7 13 15 2-11 10 3 15-14-8-13 8 2-15-11-10 15-2Z" fill="white"/>
      <path data-name="なおくんのほっぺ" d="M218 124c8-9 18-9 27 0-8 12-18 12-27 0Zm68 0c8-9 18-9 27 0-8 12-18 12-27 0Z" fill="white"/>
      <ellipse cx="242" cy="106" rx="5" ry="7" fill="#533a2d" stroke="none"/><ellipse cx="289" cy="106" rx="5" ry="7" fill="#533a2d" stroke="none"/>
      <path d="m258 127 8 5 8-5m-8 5c-2 12-15 13-21 6m21-6c2 12 15 13 21 6M199 129c-21 4-33 15-39 32m165-32c20 3 34 13 42 29" fill="none"/>
      <path data-name="左の猫の体" d="M45 260c0-42 25-66 60-66 37 0 61 25 61 67l-4 56H49Z" fill="white"/>
      <path data-name="左の猫のしっぽ" d="M56 271c-45-27-55 24-25 39 14 7 29-6 19-17-7-7-16-2-16 6" fill="white"/>
      <path data-name="左の猫の顔" d="M56 205c0-37 21-59 50-59 30 0 52 22 52 59 0 34-19 55-52 55-31 0-50-21-50-55Z" fill="white"/><path data-name="左の猫の耳" d="m60 184 4-45 36 25 36-25 17 46Z" fill="white"/>
      <path data-name="左の猫のスカーフ" d="M70 248c21 9 52 9 73 0l-7 17-29-6-29 7Z" fill="white"/>
      <path data-name="左のたいこ" d="M77 272h62l-6 43H83Z" fill="white"/><path d="M83 276l50 35m0-35-50 35M78 268l-25-31m84 31 24-31" fill="none"/>
      <path data-name="右の猫の体" d="M337 260c0-42 25-66 60-66 37 0 61 25 61 67l-4 56H341Z" fill="white"/>
      <path data-name="右の猫のしっぽ" d="M447 270c35-24 38 27 12 39-11 5-23-5-15-15 6-6 13-2 14 4" fill="white"/>
      <path data-name="右の猫の顔" d="M348 205c0-37 21-59 50-59 30 0 52 22 52 59 0 34-19 55-52 55-31 0-50-21-50-55Z" fill="white"/><path data-name="右の猫の耳" d="m352 184 4-45 36 25 36-25 17 46Z" fill="white"/>
      <path data-name="右の猫のベスト" d="M360 255h76l12 62h-99Z" fill="white"/>
      <path data-name="行列の旗" d="M420 111h47l-8 48 8 43h-47Z" fill="white"/><path d="M420 109v155m10-134h24m-18 13h18" fill="none"/>
      <path data-name="中央の猫の体" d="M196 274c0-35 20-55 48-55 29 0 49 21 49 56l-4 45h-90Z" fill="white"/>
      <path data-name="中央の猫の顔" d="M202 231c0-30 17-48 42-48s42 18 42 48c0 28-16 44-42 44s-42-16-42-44Z" fill="white"/><path data-name="中央の猫の耳" d="m205 215 3-38 30 21 31-21 14 39Z" fill="white"/>
      <path data-name="中央の鈴" d="M225 281h39l-5 28h-29Z" fill="white"/><circle data-name="中央の鈴の玉" cx="244" cy="312" r="7" fill="white"/>
      <ellipse cx="91" cy="206" rx="4" ry="6" fill="#533a2d" stroke="none"/><ellipse cx="122" cy="206" rx="4" ry="6" fill="#533a2d" stroke="none"/><ellipse cx="383" cy="206" rx="4" ry="6" fill="#533a2d" stroke="none"/><ellipse cx="414" cy="206" rx="4" ry="6" fill="#533a2d" stroke="none"/><ellipse cx="232" cy="232" rx="4" ry="5" fill="#533a2d" stroke="none"/><ellipse cx="256" cy="232" rx="4" ry="5" fill="#533a2d" stroke="none"/>
      <path d="m100 222 6 4 6-4m-6 4c-2 8-11 9-16 4m16-4c2 8 11 9 16 4m260-8 6 4 6-4m-6 4c-2 8-11 9-16 4m16-4c2 8 11 9 16 4m-150 22 6 4 6-4m-6 4c-2 7-9 8-13 4m13-4c2 7 9 8 13 4" fill="none"/>
    `, "虹を渡る魔法のうんち雲なおくんと三匹の猫の楽器パレードぬりえ"),
  },
  {
    id: "naokun-cat-concert",
    title: "うんち指揮者の猫バンド",
    difficulty: "challenge",
    difficultyLabel: "上級",
    description: "劇場の照明、正装したなおくん、左右の猫バンドを塗り分けます",
    svg: naokunColoringFrame(`
      <path data-name="舞台" d="M8 8h464v324H8Z" fill="white"/>
      <path data-name="舞台の床" d="M8 247h464v85H8Z" fill="white"/>
      <path data-name="左のスポットライト" d="m101 39 92 216H69Z" fill="white"/><path data-name="右のスポットライト" d="m379 39 32 216H287Z" fill="white"/>
      <path data-name="左のカーテン" d="M8 8h93c-8 60 13 101-20 151 31 44 10 99 20 173H8Z" fill="white"/><path data-name="右のカーテン" d="M379 8h93v324h-93c10-74-11-129 20-173-33-50-12-91-20-151Z" fill="white"/>
      <path data-name="カーテンの飾り" d="M77 152c21 9 36 8 48-2l-18 31-37-1Zm326 0c-21 9-36 8-48-2l18 31 37-1Z" fill="white"/>
      <path data-name="指揮者なおくん" d="M191 221c-31-8-39-48-12-64-18-27 12-59 40-44 0-34 48-47 66-20 29-10 55 24 38 49 27 17 17 57-14 62 11 32-15 59-48 48-22 20-58 12-66-16-23 7-37-7-24-34Z" fill="white"/>
      <path data-name="指揮者の帽子" d="M201 101h105l-12 39h-80Z" fill="white"/><rect data-name="帽子の帯" x="211" y="116" width="86" height="13" rx="6" fill="white"/>
      <path data-name="なおくんの燕尾服" d="M205 202c24 11 66 11 91 0l13 71-42-21-13 33-14-33-42 21Z" fill="white"/>
      <path data-name="なおくんの蝶ネクタイ" d="M226 198c-25-17-29 20-5 18l17-9 17 9c24 2 20-35-5-18l-12 9Z" fill="white"/>
      <path data-name="指揮棒" d="m288 166 85-91 10 9-86 91Z" fill="white"/>
      <ellipse cx="230" cy="170" rx="5" ry="7" fill="#533a2d" stroke="none"/><ellipse cx="273" cy="170" rx="5" ry="7" fill="#533a2d" stroke="none"/><path d="m245 189 7 5 7-5m-7 5c-2 11-14 12-20 5m20-5c2 11 14 12 20 5M196 186c-21 3-35 14-43 31m159-31c20 2 34 12 42 28" fill="none"/>
      <path data-name="左の猫の体" d="M44 248c0-42 23-65 57-65 35 0 59 24 59 66l-3 71H47Z" fill="white"/><path data-name="左の猫のしっぽ" d="M52 267c-43-28-55 21-27 38 14 8 29-4 20-16-6-8-15-3-16 5" fill="white"/>
      <path data-name="左の猫の顔" d="M52 202c0-36 21-58 50-58s50 22 50 58c0 33-19 54-50 54s-50-21-50-54Z" fill="white"/><path data-name="左の猫の耳" d="m56 181 4-44 36 24 36-24 16 45Z" fill="white"/>
      <path data-name="左の鈴" d="M76 264h52l-7 39H83Z" fill="white"/><circle data-name="左の鈴の玉" cx="102" cy="307" r="8" fill="white"/>
      <path data-name="右の猫の体" d="M321 248c0-42 23-65 57-65 35 0 59 24 59 66l-3 71H324Z" fill="white"/><path data-name="右の猫のしっぽ" d="M430 267c41-27 51 23 24 39-13 8-27-4-19-15 6-8 15-3 16 5" fill="white"/>
      <path data-name="右の猫の顔" d="M329 202c0-36 21-58 50-58s50 22 50 58c0 33-19 54-50 54s-50-21-50-54Z" fill="white"/><path data-name="右の猫の耳" d="m333 181 4-44 36 24 36-24 16 45Z" fill="white"/>
      <path data-name="右の鈴" d="M353 264h52l-7 39h-38Z" fill="white"/><circle data-name="右の鈴の玉" cx="379" cy="307" r="8" fill="white"/>
      <path data-name="左の音符" d="M123 68v51c0 14-25 16-25 1s25-17 25-1V80l39-10v40c0 14-25 16-25 1s25-17 25-1V61Z" fill="white"/>
      <circle data-name="右の音符" cx="348" cy="101" r="15" fill="white"/><path d="M363 101V47l36 9" fill="none" stroke-width="7"/>
      <path data-name="舞台の星" d="m122 282 9 17 20 3-15 14 4 16h-36l4-16-15-14 20-3Zm237 0 9 17 20 3-15 14 4 16h-36l4-16-15-14 20-3Z" fill="white"/>
      <ellipse cx="87" cy="204" rx="4" ry="6" fill="#533a2d" stroke="none"/><ellipse cx="117" cy="204" rx="4" ry="6" fill="#533a2d" stroke="none"/><ellipse cx="364" cy="204" rx="4" ry="6" fill="#533a2d" stroke="none"/><ellipse cx="394" cy="204" rx="4" ry="6" fill="#533a2d" stroke="none"/>
      <path d="m96 220 6 4 6-4m-6 4c-2 8-11 9-16 4m16-4c2 8 11 9 16 4m253-8 6 4 6-4m-6 4c-2 8-11 9-16 4m16-4c2 8 11 9 16 4" fill="none"/>
    `, "うんち指揮者なおくんと二匹の猫バンドが演奏する劇場コンサートぬりえ"),
  },
]

const STUDIO_COLORING_PAGES: ColoringPage[] = [...COLORING_PAGES, ...NAOKUN_COLORING_PAGES]

function coloringCompletionCopy(pageId: string) {
  if (pageId === "naokun-cloud-parade") return "完成！ 美雪『空が七色！』猫たちは日かげを追って一列。なおくん雲だけ、自分の虹へ先に拍手しています。"
  if (pageId === "naokun-cat-concert") return "完成！ 猫バンドが『にゃー』と一音。なおくん指揮者はその一音を十秒かけて振り終え、アンコールを要求しました。"
  return "完成！ 猫審査員が肉球スタンプ。なおくんは作品より先に、自分のサインを書く場所を探しています。"
}

function copyFills(fills: FillMap): FillMap {
  return { ...fills }
}

function regionNames(page: ColoringPage): string[] {
  return Array.from(page.svg.matchAll(/\sdata-name=(?:"([^"]+)"|'([^']+)')/g), (match) => match[1] ?? match[2])
}

const PAGE_REGION_NAMES = new Map(STUDIO_COLORING_PAGES.map((page) => [page.id, new Set(regionNames(page))]))

function validateFillMap(pageId: string, candidate: unknown): FillMap {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return {}
  const allowed = PAGE_REGION_NAMES.get(pageId)
  if (!allowed) return {}
  return Object.fromEntries(
    Object.entries(candidate).filter(([name, color]) => allowed.has(name) && typeof color === "string" && SAFE_HEX.test(color)),
  )
}

function validateDocument(candidate: unknown): ColoringDocumentV3 {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return EMPTY_DOCUMENT
  const record = candidate as { version?: unknown; pages?: unknown }
  if (record.version !== 3 || !record.pages || typeof record.pages !== "object" || Array.isArray(record.pages)) return EMPTY_DOCUMENT
  return {
    version: 3,
    pages: Object.fromEntries(
      STUDIO_COLORING_PAGES.map((page) => [page.id, validateFillMap(page.id, (record.pages as Record<string, unknown>)[page.id])]),
    ),
  }
}

function migrateLegacyDocument(candidate: unknown): ColoringDocumentV3 {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return EMPTY_DOCUMENT
  const legacy = candidate as Record<string, { svgContent?: unknown }>
  const pages: Record<string, FillMap> = {}

  STUDIO_COLORING_PAGES.forEach((page) => {
    const svgContent = legacy[page.id]?.svgContent
    if (typeof svgContent !== "string" || svgContent.length > 250_000) return
    const parser = new DOMParser()
    const parsed = parser.parseFromString(svgContent, "image/svg+xml")
    const fills: FillMap = {}
    const allowed = PAGE_REGION_NAMES.get(page.id) ?? new Set<string>()
    parsed.querySelectorAll<SVGElement>("[data-name]").forEach((region) => {
      const name = region.getAttribute("data-name")
      const color = region.getAttribute("fill")
      if (name && allowed.has(name) && color && SAFE_HEX.test(color) && color.toLowerCase() !== "#ffffff") fills[name] = color
    })
    pages[page.id] = fills
  })

  return { version: 3, pages }
}

function getProgress(page: ColoringPage, fills: FillMap) {
  const names = regionNames(page)
  const painted = names.filter((name) => SAFE_HEX.test(fills[name] ?? "") && fills[name].toLowerCase() !== "#ffffff").length
  return { painted, total: names.length, percent: names.length ? Math.round((painted / names.length) * 100) : 0 }
}

function createColoringCompletionBaseline(documentState: ColoringDocumentV3): ColoringCompletionTracker {
  return Object.fromEntries(
    STUDIO_COLORING_PAGES.map((page) => [page.id, getProgress(page, documentState.pages[page.id] ?? {}).percent]),
  )
}

export function renderSvg(page: ColoringPage, fills: FillMap): string {
  const withInteractiveRegions = page.svg.replace(/<([a-z]+)([^>]*\sdata-name=(?:"([^"]+)"|'([^']+)')[^>]*)>/gi, (full, tag: string, attributes: string, doubleName: string, singleName: string) => {
    if (!PAINTABLE_TAGS.has(tag.toLowerCase())) return full
    const name = doubleName ?? singleName
    const color = fills[name]
    let safeTag = full
    if (color && SAFE_HEX.test(color)) {
      safeTag = /\sfill=(?:"[^"]*"|'[^']*')/i.test(safeTag)
        ? safeTag.replace(/\sfill=(?:"[^"]*"|'[^']*')/i, ` fill="${color}"`)
        : safeTag.endsWith("/>")
          ? safeTag.replace(/\/>$/, ` fill="${color}"/>`)
          : safeTag.replace(/>$/, ` fill="${color}">`)
    }
    return safeTag.endsWith("/>")
      ? safeTag.replace(/\/>$/, ` tabindex="0" role="button" aria-label="${page.title}の${name}をぬる"/>`)
      : safeTag.replace(/>$/, ` tabindex="0" role="button" aria-label="${page.title}の${name}をぬる">`)
  })
  return withInteractiveRegions.replace(/\srole=(?:"img"|'img')/i, ' role="group"')
}

export function ColoringBook() {
  const { skin } = useSkin()
  const { state: progression, recordEvent } = useProgression()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].color)
  const [tool, setTool] = useState<Tool>("paint")
  const [zoom, setZoom] = useState(100)
  const [status, setStatus] = useState("色と道具を選び、塗る場所をタップしてください")
  const [documentState, setDocumentState] = useState<ColoringDocumentV3>(EMPTY_DOCUMENT)
  const [history, setHistory] = useState<HistoryState>({})
  const [hydrated, setHydrated] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>("loading")
  const canvasRef = useRef<HTMLDivElement>(null)
  const pageTabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const completionProgressRef = useRef<ColoringCompletionTracker>({})

  const currentPage = STUDIO_COLORING_PAGES[currentPageIndex]
  const currentFills = documentState.pages[currentPage.id] ?? {}
  const currentHistory = history[currentPage.id] ?? { undo: [], redo: [] }
  const progress = getProgress(currentPage, currentFills)
  const renderedSvg = useMemo(() => renderSvg(currentPage, currentFills), [currentFills, currentPage])

  useEffect(() => {
    let restoredDocument = EMPTY_DOCUMENT
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        restoredDocument = validateDocument(JSON.parse(saved))
      } else {
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
        if (legacy) restoredDocument = migrateLegacyDocument(JSON.parse(legacy))
      }
      completionProgressRef.current = createColoringCompletionBaseline(restoredDocument)
      setDocumentState(restoredDocument)
      setSaveState("saved")
    } catch {
      completionProgressRef.current = createColoringCompletionBaseline(EMPTY_DOCUMENT)
      setDocumentState(EMPTY_DOCUMENT)
      setSaveState("failed")
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documentState))
      setSaveState("saved")
    } catch {
      setSaveState("failed")
    }
  }, [documentState, hydrated])

  useEffect(() => {
    if (!hydrated) return
    const transition = advanceColoringCompletionTracker(completionProgressRef.current, currentPage.id, progress.percent)
    completionProgressRef.current = transition.tracker
    if (!transition.completed) return
    setStatus(`${currentPage.title}、完成！ 上の一言劇も読んでね。`)
    recordEvent({
      type: "coloring.completed",
      eventId: `coloring:${progression.daily.date}:${currentPage.id}`,
      occurredAt: new Date().toISOString(),
      pageId: currentPage.id,
    })
  }, [currentPage.id, hydrated, progress.percent, progression.daily.date, recordEvent])

  const commit = (before: FillMap, after: FillMap, message: string) => {
    setHistory((all) => ({
      ...all,
      [currentPage.id]: { undo: [...(all[currentPage.id]?.undo ?? []).slice(-24), copyFills(before)], redo: [] },
    }))
    setDocumentState((current) => ({ version: 3, pages: { ...current.pages, [currentPage.id]: copyFills(after) } }))
    setSaveState("loading")
    setStatus(message)
  }

  const applyToRegion = (target: SVGElement) => {
    const name = target.getAttribute("data-name")
    if (!name || !(PAGE_REGION_NAMES.get(currentPage.id)?.has(name)) || !PAINTABLE_TAGS.has(target.tagName.toLowerCase())) return

    if (tool === "eyedropper") {
      const fill = currentFills[name] ?? target.getAttribute("fill")
      if (fill && SAFE_HEX.test(fill) && fill.toLowerCase() !== "#ffffff") {
        setSelectedColor(fill)
        setTool("paint")
        setStatus("この色をスポイトで取りました")
      } else {
        setStatus("まだ色がついていない場所です")
      }
      return
    }

    const next = { ...currentFills }
    if (tool === "eraser") delete next[name]
    else next[name] = selectedColor
    commit(currentFills, next, tool === "eraser" ? "色を消しました" : "きれいにぬれたよ！")
  }

  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof SVGElement) applyToRegion(event.target)
  }

  const handleCanvasKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === "Enter" || event.key === " ") && event.target instanceof SVGElement && event.target.hasAttribute("data-name")) {
      event.preventDefault()
      applyToRegion(event.target)
    }
  }

  const handleUndo = () => {
    const previous = currentHistory.undo.at(-1)
    if (!previous) return
    setHistory((all) => ({
      ...all,
      [currentPage.id]: { undo: currentHistory.undo.slice(0, -1), redo: [...currentHistory.redo.slice(-24), copyFills(currentFills)] },
    }))
    setDocumentState((current) => ({ version: 3, pages: { ...current.pages, [currentPage.id]: copyFills(previous) } }))
    setStatus("ひとつ前にもどしました")
  }

  const handleRedo = () => {
    const next = currentHistory.redo.at(-1)
    if (!next) return
    setHistory((all) => ({
      ...all,
      [currentPage.id]: { undo: [...currentHistory.undo.slice(-24), copyFills(currentFills)], redo: currentHistory.redo.slice(0, -1) },
    }))
    setDocumentState((current) => ({ version: 3, pages: { ...current.pages, [currentPage.id]: copyFills(next) } }))
    setStatus("ぬり直しをやり直しました")
  }

  const handleReset = () => {
    if (!Object.keys(currentFills).length) return
    commit(currentFills, {}, "白紙の状態へ戻しました。元に戻す操作も利用できます")
  }

  const applyMagicColors = () => {
    const next = Object.fromEntries(regionNames(currentPage).map((name, index) => [
      name,
      COLOR_PALETTE[(index * 5 + currentPageIndex * 3) % COLOR_PALETTE.length].color,
    ]))
    commit(currentFills, next, "自動配色を適用しました。ここから好きな色へ調整できます")
  }

  const downloadImage = () => {
    const svg = canvasRef.current?.querySelector("svg")
    if (!svg) return
    const viewBox = svg.viewBox.baseVal
    const width = viewBox.width || 360
    const height = viewBox.height || 260
    const scale = 3
    const canvas = window.document.createElement("canvas")
    canvas.width = width * scale
    canvas.height = height * scale
    const context = canvas.getContext("2d")
    if (!context) return

    const safeClone = svg.cloneNode(true) as SVGSVGElement
    safeClone.querySelectorAll("[tabindex], [role], [aria-label]").forEach((node) => {
      node.removeAttribute("tabindex")
      node.removeAttribute("role")
      node.removeAttribute("aria-label")
    })
    const blob = new Blob([new XMLSerializer().serializeToString(safeClone)], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      context.fillStyle = "#fffdf8"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const link = window.document.createElement("a")
      link.download = `${currentPage.id}-miyuki-coloring.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      URL.revokeObjectURL(url)
      setStatus("高画質PNGで保存しました")
    }
    image.onerror = () => { URL.revokeObjectURL(url); setStatus("保存に失敗しました。もう一度実行してください") }
    image.src = url
  }

  const selectPage = (index: number) => {
    setCurrentPageIndex(index)
    setZoom(100)
      setStatus(`${STUDIO_COLORING_PAGES[index].title}を選択しました`)
  }

  const handlePageTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null
    if (event.key === "ArrowRight") nextIndex = (index + 1) % STUDIO_COLORING_PAGES.length
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + STUDIO_COLORING_PAGES.length) % STUDIO_COLORING_PAGES.length
    if (event.key === "Home") nextIndex = 0
    if (event.key === "End") nextIndex = STUDIO_COLORING_PAGES.length - 1
    if (nextIndex === null) return

    event.preventDefault()
    selectPage(nextIndex)
    window.requestAnimationFrame(() => pageTabRefs.current[nextIndex]?.focus())
  }

  const saveLabel = saveState === "saved" ? "自動保存ずみ" : saveState === "failed" ? "保存できませんでした" : "保存しています"

  return (
    <section className="feature-screen coloring-screen" aria-labelledby="coloring-title">
      <div className="screen-hero coloring-hero">
        <div>
          <p className="screen-kicker">CAT COLORING STUDIO</p>
          <h2 id="coloring-title">ねこのカラー設計室</h2>
          <p>7作品の配色を自由に設計。スポイト、取り消し、拡大、PNG保存に対応し、作業内容は端末へ自動保存されます。</p>
        </div>
        <div className="coloring-hero-art" aria-hidden="true"><NextImage src={skin.assets.activityColoring} alt="" fill sizes="150px" /></div>
      </div>

      <div className="coloring-studio">
        <div className="coloring-page-tabs" role="tablist" aria-label="ぬりえを選ぶ">
          {STUDIO_COLORING_PAGES.map((page, index) => {
            const pageProgress = getProgress(page, documentState.pages[page.id] ?? {})
            return (
              <button
                key={page.id}
                ref={(node) => { pageTabRefs.current[index] = node }}
                id={`coloring-tab-${page.id}`}
                type="button"
                role="tab"
                aria-selected={currentPageIndex === index}
                aria-label={`${index + 1} ${page.title} ${page.difficultyLabel}・${pageProgress.percent}%`}
                aria-controls="coloring-page-panel"
                tabIndex={currentPageIndex === index ? 0 : -1}
                className="coloring-page-tab"
                data-active={currentPageIndex === index}
                onClick={() => selectPage(index)}
                onKeyDown={(event) => handlePageTabKeyDown(event, index)}
              >
                <span className="coloring-page-number">{pageProgress.percent === 100 ? <Check /> : index + 1}</span>
                <span><strong>{page.title}</strong><small>{page.difficultyLabel}・{pageProgress.percent}%</small></span>
              </button>
            )
          })}
        </div>

        <div
          key={currentPage.id}
          id="coloring-page-panel"
          className="coloring-page-panel"
          role="tabpanel"
          aria-label={`${currentPage.title}のぬりえ作業場`}
        >
          <div className="coloring-progress-card">
            <div><span className="coloring-difficulty" data-level={currentPage.difficulty}>{currentPage.difficultyLabel}</span><h3>{currentPage.title}</h3><p>{currentPage.description}</p></div>
            <div className="coloring-progress-ring" style={{ "--progress": progress.percent } as React.CSSProperties}><strong>{progress.percent}%</strong><span>{progress.painted}/{progress.total}</span></div>
          </div>
          {progress.percent === 100 ? <p className="game-live-message is-preview" role="status">{coloringCompletionCopy(currentPage.id)}</p> : null}

          <div className="coloring-workspace">
            <div className="coloring-canvas-shell">
              <div className="coloring-canvas-topbar">
                <span><Sparkles />タップ・Enterで色ぬり</span>
                <label><Maximize2 aria-hidden="true" /><span className="sr-only">キャンバスの大きさ</span><input type="range" min="80" max="145" step="5" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><small>{zoom}%</small></label>
              </div>
              <div className="coloring-canvas-scroll">
                <div ref={canvasRef} className="coloring-canvas" data-tool={tool} style={{ width: `${zoom}%` }} onClick={handleCanvasClick} onKeyDown={handleCanvasKeyDown} dangerouslySetInnerHTML={{ __html: renderedSvg }} />
              </div>
              <p className="coloring-status">
                <span className="coloring-action-status" role="status" aria-live="polite" aria-atomic="true">{status}</span>
                <span className="coloring-save-state" aria-live="off">・{saveLabel}</span>
                <span className="sr-only" role="status" aria-live="polite">{saveState === "failed" ? "作品を自動保存できませんでした" : ""}</span>
              </p>
            </div>

            <aside className="coloring-tools" aria-label="ぬりえ道具">
            <div className="coloring-tool-section">
              <h3>どうぐ</h3>
              <div className="coloring-tool-switch">
                <button type="button" data-active={tool === "paint"} aria-pressed={tool === "paint"} onClick={() => { setTool("paint"); setStatus("色ぬりモードです") }}><Paintbrush />ぬる</button>
                <button type="button" data-active={tool === "eyedropper"} aria-pressed={tool === "eyedropper"} onClick={() => { setTool("eyedropper"); setStatus("取り込む色をタップしてください") }}><Pipette />スポイト</button>
                <button type="button" data-active={tool === "eraser"} aria-pressed={tool === "eraser"} onClick={() => { setTool("eraser"); setStatus("色を消す場所をタップしてください") }}><Eraser />消す</button>
              </div>
            </div>

            <div className="coloring-tool-section">
              <div className="coloring-section-title"><h3>いろ</h3><span style={{ backgroundColor: selectedColor }} aria-label="今えらんでいる色" /></div>
              <div className="coloring-palette-grid">
                {COLOR_PALETTE.map((swatch) => <button key={swatch.color} type="button" className="coloring-swatch" aria-label={`${swatch.name}を選ぶ`} aria-pressed={selectedColor === swatch.color} data-active={selectedColor === swatch.color} style={{ backgroundColor: swatch.color }} onClick={() => { setSelectedColor(swatch.color); setTool("paint"); setStatus(`${swatch.name}をえらびました`) }} />)}
                <label className="coloring-custom-color" title="好きな色を作る"><input type="color" value={selectedColor} aria-label="好きな色を作る" onChange={(event) => { setSelectedColor(event.target.value); setTool("paint") }} /><span>＋</span></label>
              </div>
            </div>

            <button type="button" className="coloring-magic-button" onClick={applyMagicColors}><WandSparkles />まほうで全部ぬる</button>
            <div className="coloring-actions">
              <button type="button" disabled={!currentHistory.undo.length} onClick={handleUndo}><Undo2 />もどす</button>
              <button type="button" disabled={!currentHistory.redo.length} onClick={handleRedo}><Redo2 />やり直す</button>
              <button type="button" disabled={!Object.keys(currentFills).length} onClick={handleReset}><RotateCcw />まっ白に</button>
              <button type="button" className="coloring-download-button" onClick={downloadImage}><Download />作品を保存</button>
            </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
