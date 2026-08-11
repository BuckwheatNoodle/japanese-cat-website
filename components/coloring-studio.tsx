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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" role="img" aria-label="${label}" style="background:#fffdf8" stroke="#5c3a21" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="8" width="344" height="244" rx="24" fill="white"/>
    ${content}
  </svg>`

const NAOKUN_COLORING_PAGES: ColoringPage[] = [
  {
    id: "naokun-cloud-parade",
    title: "なおくん雲と猫行列",
    difficulty: "normal",
    difficultyLabel: "標準",
    description: "うんち雲なおくんと、日かげを追う猫たちの配色を設計",
    svg: naokunColoringFrame(`
      <path data-name="空" d="M9 9h342v154H9Z" fill="white"/>
      <path data-name="草原" d="M9 160c72-20 117 14 176-3s106 13 166-2v96H9Z" fill="white"/>
      <circle data-name="太陽" cx="304" cy="48" r="24" fill="white"/>
      <path data-name="なおくん雲" d="M91 91c-22-4-29-33-9-45 11-7 23-4 31 4 8-23 43-26 55-4 20-9 43 6 40 28 23 5 25 38 3 48H94c-22-2-25-27-3-31Z" fill="white"/>
      <path data-name="雲の帽子" d="M121 48c7-24 42-32 59-10l-9 20-42 4Z" fill="white"/>
      <circle cx="128" cy="86" r="4" fill="#5c3a21" stroke="none"/><circle cx="166" cy="86" r="4" fill="#5c3a21" stroke="none"/>
      <path d="m141 99 7 4 7-4m-7 4c0 9-11 11-16 5m16-5c0 9 11 11 16 5" fill="none"/>
      <path data-name="虹" d="M91 122c21 55 96 56 120 0h-20c-19 30-61 30-80 0Z" fill="white"/>
      <circle data-name="左の猫の顔" cx="92" cy="190" r="27" fill="white"/><path data-name="左の猫の耳" d="m70 174 3-24 18 17 19-17 3 25Z" fill="white"/>
      <ellipse data-name="左の猫の体" cx="92" cy="224" rx="32" ry="24" fill="white"/>
      <circle data-name="右の猫の顔" cx="243" cy="190" r="27" fill="white"/><path data-name="右の猫の耳" d="m221 174 3-24 18 17 19-17 3 25Z" fill="white"/>
      <ellipse data-name="右の猫の体" cx="243" cy="224" rx="32" ry="24" fill="white"/>
      <path data-name="行列の旗" d="M292 150v82m0-76 42 12-42 16Z" fill="white"/>
      <circle cx="84" cy="189" r="3" fill="#5c3a21" stroke="none"/><circle cx="100" cy="189" r="3" fill="#5c3a21" stroke="none"/>
      <circle cx="235" cy="189" r="3" fill="#5c3a21" stroke="none"/><circle cx="251" cy="189" r="3" fill="#5c3a21" stroke="none"/>
    `, "魔法のうんち雲なおくんと二匹の猫の行列のぬりえ"),
  },
  {
    id: "naokun-cat-concert",
    title: "うんち指揮者の猫バンド",
    difficulty: "challenge",
    difficultyLabel: "上級",
    description: "指揮者なおくん、猫の鈴、音符いっぱいのフィナーレを仕上げよう",
    svg: naokunColoringFrame(`
      <path data-name="舞台" d="M9 9h342v242H9Z" fill="white"/>
      <path data-name="左のカーテン" d="M9 9h76c-3 44 10 76-18 116 24 38 8 86 18 126H9Z" fill="white"/>
      <path data-name="右のカーテン" d="M275 9h76v242h-76c10-40-6-88 18-126-28-40-15-72-18-116Z" fill="white"/>
      <path data-name="指揮者なおくん" d="M137 190c-24-12-19-47 4-54-17-19-4-48 20-49-4-25 31-39 47-18 17 20 4 42-9 48 25 6 30 38 10 54 17 19 2 50-26 50-24 0-42-10-46-31Z" fill="white"/>
      <path data-name="指揮者の帽子" d="M147 83h70l-8 25h-54Z" fill="white"/><rect data-name="帽子の帯" x="153" y="91" width="58" height="9" rx="4" fill="white"/>
      <path data-name="指揮棒" d="m210 127 58-57 8 8-59 56Z" fill="white"/>
      <circle cx="169" cy="144" r="4" fill="#5c3a21" stroke="none"/><circle cx="194" cy="144" r="4" fill="#5c3a21" stroke="none"/><path d="m177 157 6 3 6-3m-6 3c0 7-9 9-13 4m13-4c0 7 9 9 13 4" fill="none"/>
      <circle data-name="左の猫の顔" cx="103" cy="191" r="29" fill="white"/><path data-name="左の猫の耳" d="m80 176 3-27 20 18 20-18 3 28Z" fill="white"/>
      <circle data-name="右の猫の顔" cx="265" cy="191" r="29" fill="white"/><path data-name="右の猫の耳" d="m242 176 3-27 20 18 20-18 3 28Z" fill="white"/>
      <path data-name="左の鈴" d="M89 218h28l-4 19H93Z" fill="white"/><circle data-name="左の鈴の玉" cx="103" cy="239" r="5" fill="white"/>
      <path data-name="右の鈴" d="M251 218h28l-4 19h-20Z" fill="white"/><circle data-name="右の鈴の玉" cx="265" cy="239" r="5" fill="white"/>
      <path data-name="左の音符" d="M104 62v38c0 10-18 12-18 1s18-13 18-1V70l27-7v29c0 10-18 12-18 1s18-13 18-1V57Z" fill="white"/>
      <circle data-name="右の音符" cx="246" cy="88" r="12" fill="white"/><path d="M258 88V45l28 8" fill="none" stroke-width="6"/>
      <path data-name="舞台の星" d="m42 220 7 13 15 2-11 10 3 6H28l3-6-11-10 15-2Zm274 0 7 13 15 2-11 10 3 6h-28l3-6-11-10 15-2Z" fill="white"/>
    `, "うんち指揮者なおくんと鈴を持つ二匹の猫のコンサートぬりえ"),
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

function renderSvg(page: ColoringPage, fills: FillMap): string {
  const withInteractiveRegions = page.svg.replace(/<([a-z]+)([^>]*\sdata-name=(?:"([^"]+)"|'([^']+)')[^>]*)>/gi, (full, tag: string, attributes: string, doubleName: string, singleName: string) => {
    if (!PAINTABLE_TAGS.has(tag.toLowerCase())) return full
    const name = doubleName ?? singleName
    const color = fills[name]
    let safeTag = full
    if (color && SAFE_HEX.test(color)) {
      safeTag = /\sfill=(?:"[^"]*"|'[^']*')/i.test(safeTag)
        ? safeTag.replace(/\sfill=(?:"[^"]*"|'[^']*')/i, ` fill="${color}"`)
        : safeTag.replace(/>$/, ` fill="${color}">`)
    }
    return safeTag.replace(/>$/, ` tabindex="0" role="button" aria-label="${page.title}の${name}をぬる">`)
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
