"use client"

import NextImage from "next/image"
import { useRef, useState, type MouseEvent } from "react"
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
import { useLocalStorage } from "@/hooks/use-local-storage"
import { COLORING_PAGES, COLOR_PALETTE } from "@/lib/coloring-pages"

type Tool = "paint" | "eyedropper" | "eraser"

type PageState = {
  svgContent: string
  undoStack: string[]
  redoStack: string[]
}

type ColoringState = Record<string, PageState>

const PAINTABLE_TAGS = new Set(["circle", "ellipse", "path", "rect", "polygon"])

function getProgress(svgContent: string) {
  const regions = svgContent.match(/<[^>]+\sdata-name=(?:"[^"]+"|'[^']+')[^>]*>/g) ?? []
  const painted = regions.filter((region) => {
    const fill = region.match(/\sfill=(?:"([^"]+)"|'([^']+)')/i)
    const color = (fill?.[1] ?? fill?.[2] ?? "").toLowerCase()
    return color !== "" && color !== "white" && color !== "#fff" && color !== "#ffffff" && color !== "none"
  }).length

  return { painted, total: regions.length, percent: regions.length ? Math.round((painted / regions.length) * 100) : 0 }
}

function getState(states: ColoringState, pageId: string, initialSvg: string): PageState {
  return states[pageId] ?? { svgContent: initialSvg, undoStack: [], redoStack: [] }
}

export function ColoringBook() {
  const { skin } = useSkin()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].color)
  const [tool, setTool] = useState<Tool>("paint")
  const [zoom, setZoom] = useState(100)
  const [status, setStatus] = useState("ぬりたい場所をタップしてね")
  const [coloringStates, setColoringStates] = useLocalStorage<ColoringState>("miyukiColoringStudioV2", {})
  const canvasRef = useRef<HTMLDivElement>(null)

  const currentPage = COLORING_PAGES[currentPageIndex]
  const currentState = getState(coloringStates, currentPage.id, currentPage.svg)
  const progress = getProgress(currentState.svgContent)

  const commit = (before: string, after: string, message: string) => {
    setColoringStates((states) => {
      const state = getState(states, currentPage.id, currentPage.svg)
      return {
        ...states,
        [currentPage.id]: {
          svgContent: after,
          undoStack: [...state.undoStack.slice(-24), before],
          redoStack: [],
        },
      }
    })
    setStatus(message)
  }

  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof SVGElement) || !target.hasAttribute("data-name") || !PAINTABLE_TAGS.has(target.tagName.toLowerCase())) return

    if (tool === "eyedropper") {
      const fill = target.getAttribute("fill")
      if (fill && fill !== "none" && fill !== "white") {
        setSelectedColor(fill)
        setTool("paint")
        setStatus("この色をスポイトで取りました")
      } else {
        setStatus("まだ色がついていない場所です")
      }
      return
    }

    const svg = canvasRef.current?.querySelector("svg")
    if (!svg) return
    const before = svg.outerHTML
    target.setAttribute("fill", tool === "eraser" ? "white" : selectedColor)
    commit(before, svg.outerHTML, tool === "eraser" ? "色を消しました" : "きれいにぬれたよ！")
  }

  const handleUndo = () => {
    setColoringStates((states) => {
      const state = getState(states, currentPage.id, currentPage.svg)
      const previous = state.undoStack.at(-1)
      if (!previous) return states
      return {
        ...states,
        [currentPage.id]: {
          svgContent: previous,
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack.slice(-24), state.svgContent],
        },
      }
    })
    setStatus("ひとつ前にもどしました")
  }

  const handleRedo = () => {
    setColoringStates((states) => {
      const state = getState(states, currentPage.id, currentPage.svg)
      const next = state.redoStack.at(-1)
      if (!next) return states
      return {
        ...states,
        [currentPage.id]: {
          svgContent: next,
          undoStack: [...state.undoStack.slice(-24), state.svgContent],
          redoStack: state.redoStack.slice(0, -1),
        },
      }
    })
    setStatus("ぬり直しをやり直しました")
  }

  const handleReset = () => {
    if (currentState.svgContent === currentPage.svg) return
    commit(currentState.svgContent, currentPage.svg, "まっ白なぬりえにもどしました。元にもどすこともできるよ")
  }

  const applyMagicColors = () => {
    const parser = new DOMParser()
    const documentNode = parser.parseFromString(currentState.svgContent, "image/svg+xml")
    const svg = documentNode.querySelector("svg")
    if (!svg) return
    svg.querySelectorAll<SVGElement>("[data-name]").forEach((region, index) => {
      const paletteIndex = (index * 5 + currentPageIndex * 3) % COLOR_PALETTE.length
      region.setAttribute("fill", COLOR_PALETTE[paletteIndex].color)
    })
    commit(currentState.svgContent, svg.outerHTML, "まほうの配色で完成！好きな色に変えてもいいよ")
  }

  const downloadImage = () => {
    const svg = canvasRef.current?.querySelector("svg")
    if (!svg) return
    const viewBox = svg.viewBox.baseVal
    const width = viewBox.width || 360
    const height = viewBox.height || 260
    const scale = 3
    const canvas = document.createElement("canvas")
    canvas.width = width * scale
    canvas.height = height * scale
    const context = canvas.getContext("2d")
    if (!context) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      context.fillStyle = "#fffdf8"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const link = document.createElement("a")
      link.download = currentPage.id + "-miyuki-coloring.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
      URL.revokeObjectURL(url)
      setStatus("高画質PNGで保存しました")
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      setStatus("保存に失敗しました。もう一度ためしてね")
    }
    image.src = url
  }

  const selectPage = (index: number) => {
    setCurrentPageIndex(index)
    setZoom(100)
    setStatus(COLORING_PAGES[index].title + "をえらびました")
  }

  return (
    <section className="feature-screen coloring-screen" aria-labelledby="coloring-title">
      <div className="screen-hero coloring-hero">
        <div>
          <p className="screen-kicker">CAT COLORING STUDIO</p>
          <h2 id="coloring-title">ねこのぬりえ工房</h2>
          <p>5つのぬりえを自由にデザイン。作品は自動で保存されるよ。</p>
        </div>
        <div className="coloring-hero-art" aria-hidden="true">
          <NextImage src={skin.assets.activityColoring} alt="" fill sizes="150px" />
        </div>
      </div>

      <div className="coloring-studio">
        <div className="coloring-page-tabs" role="tablist" aria-label="ぬりえを選ぶ">
          {COLORING_PAGES.map((page, index) => {
            const pageProgress = getProgress(getState(coloringStates, page.id, page.svg).svgContent)
            return (
              <button
                key={page.id}
                type="button"
                role="tab"
                aria-selected={currentPageIndex === index}
                className="coloring-page-tab"
                data-active={currentPageIndex === index}
                onClick={() => selectPage(index)}
              >
                <span className="coloring-page-number">{pageProgress.percent === 100 ? <Check /> : index + 1}</span>
                <span><strong>{page.title}</strong><small>{page.difficultyLabel}・{pageProgress.percent}%</small></span>
              </button>
            )
          })}
        </div>

        <div className="coloring-progress-card">
          <div>
            <span className="coloring-difficulty" data-level={currentPage.difficulty}>{currentPage.difficultyLabel}</span>
            <h3>{currentPage.title}</h3>
            <p>{currentPage.description}</p>
          </div>
          <div className="coloring-progress-ring" style={{ "--progress": progress.percent } as React.CSSProperties}>
            <strong>{progress.percent}%</strong>
            <span>{progress.painted}/{progress.total}</span>
          </div>
        </div>

        <div className="coloring-workspace">
          <div className="coloring-canvas-shell">
            <div className="coloring-canvas-topbar">
              <span><Sparkles />タップで色ぬり</span>
              <label>
                <Maximize2 aria-hidden="true" />
                <span className="sr-only">キャンバスの大きさ</span>
                <input type="range" min="80" max="145" step="5" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
                <small>{zoom}%</small>
              </label>
            </div>
            <div className="coloring-canvas-scroll">
              <div
                ref={canvasRef}
                className="coloring-canvas"
                data-tool={tool}
                style={{ width: String(zoom) + "%" }}
                onClick={handleCanvasClick}
                dangerouslySetInnerHTML={{ __html: currentState.svgContent }}
              />
            </div>
            <p className="coloring-status" aria-live="polite">{status}<span>・自動保存ずみ</span></p>
          </div>

          <aside className="coloring-tools" aria-label="ぬりえ道具">
            <div className="coloring-tool-section">
              <h3>どうぐ</h3>
              <div className="coloring-tool-switch">
                <button type="button" data-active={tool === "paint"} aria-pressed={tool === "paint"} onClick={() => { setTool("paint"); setStatus("色ぬりモードです") }}><Paintbrush />ぬる</button>
                <button type="button" data-active={tool === "eyedropper"} aria-pressed={tool === "eyedropper"} onClick={() => { setTool("eyedropper"); setStatus("取りたい色をタップしてね") }}><Pipette />スポイト</button>
                <button type="button" data-active={tool === "eraser"} aria-pressed={tool === "eraser"} onClick={() => { setTool("eraser"); setStatus("消したい場所をタップしてね") }}><Eraser />けす</button>
              </div>
            </div>

            <div className="coloring-tool-section">
              <div className="coloring-section-title"><h3>いろ</h3><span style={{ backgroundColor: selectedColor }} aria-label="今えらんでいる色" /></div>
              <div className="coloring-palette-grid">
                {COLOR_PALETTE.map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    className="coloring-swatch"
                    aria-label={swatch.name + "を選ぶ"}
                    aria-pressed={selectedColor === swatch.color}
                    data-active={selectedColor === swatch.color}
                    style={{ backgroundColor: swatch.color }}
                    onClick={() => { setSelectedColor(swatch.color); setTool("paint"); setStatus(swatch.name + "をえらびました") }}
                  />
                ))}
                <label className="coloring-custom-color" title="好きな色を作る">
                  <input type="color" value={selectedColor} aria-label="好きな色を作る" onChange={(event) => { setSelectedColor(event.target.value); setTool("paint") }} />
                  <span>＋</span>
                </label>
              </div>
            </div>

            <button type="button" className="coloring-magic-button" onClick={applyMagicColors}><WandSparkles />まほうで全部ぬる</button>

            <div className="coloring-actions">
              <button type="button" disabled={!currentState.undoStack.length} onClick={handleUndo}><Undo2 />もどす</button>
              <button type="button" disabled={!currentState.redoStack.length} onClick={handleRedo}><Redo2 />やり直す</button>
              <button type="button" disabled={currentState.svgContent === currentPage.svg} onClick={handleReset}><RotateCcw />まっ白に</button>
              <button type="button" className="coloring-download-button" onClick={downloadImage}><Download />作品を保存</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
