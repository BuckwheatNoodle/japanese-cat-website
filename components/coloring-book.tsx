"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Undo2, Redo2, Download, Pipette, Eraser, RotateCcw } from "lucide-react"

// 塗り絵用のSVGデータ
const COLORING_PAGES = [
  {
    id: "simple_cat",
    title: "かんたん：ねこちゃん",
    svg: `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' style='background: white;'>
        <rect x='10' y='10' width='280' height='180' rx='15' fill='white' stroke='#8A6E59' strokeWidth='2'/>
        <circle data-name='かお' cx='150' cy='80' r='35' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <path data-name='みぎみみ' d='M125 50l-15 20 25-5z' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <path data-name='ひだりみみ' d='M175 50l15 20-25-5z' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <circle cx='135' cy='75' r='3' fill='#8A6E59'/>
        <circle cx='165' cy='75' r='3' fill='#8A6E59'/>
        <circle cx='150' cy='85' r='2' fill='#8A6E59'/>
        <path d='M140 95c5 5 15 5 20 0' stroke='#8A6E59' strokeWidth='2' fill='none'/>
        <ellipse data-name='からだ' cx='150' cy='140' rx='45' ry='35' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <circle data-name='にくきゅう' cx='220' cy='120' r='15' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <circle cx='210' cy='110' r='4' fill='white' stroke='#8A6E59' strokeWidth='2'/>
        <circle cx='220' cy='105' r='4' fill='white' stroke='#8A6E59' strokeWidth='2'/>
        <circle cx='230' cy='110' r='4' fill='white' stroke='#8A6E59' strokeWidth='2'/>
      </svg>
    `,
  },
  {
    id: "cat_with_fish",
    title: "ふつう：ねこと魚",
    svg: `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220' style='background: white;'>
        <rect x='10' y='10' width='300' height='200' rx='15' fill='white' stroke='#8A6E59' strokeWidth='2'/>
        <circle data-name='かお' cx='120' cy='80' r='30' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <path data-name='みぎみみ' d='M100 55l-12 18 20-4z' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <path data-name='ひだりみみ' d='M140 55l12 18-20-4z' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <circle cx='110' cy='75' r='2' fill='#8A6E59'/>
        <circle cx='130' cy='75' r='2' fill='#8A6E59'/>
        <circle cx='120' cy='82' r='1.5' fill='#8A6E59'/>
        <path d='M112 90c4 4 12 4 16 0' stroke='#8A6E59' strokeWidth='2' fill='none'/>
        <ellipse data-name='からだ' cx='120' cy='130' rx='35' ry='28' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <ellipse data-name='さかな' cx='220' cy='100' rx='25' ry='15' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <path data-name='さかなのしっぽ' d='M245 100l15-8 0 16z' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <circle cx='210' cy='95' r='2' fill='#8A6E59'/>
        <path data-name='ひれ' d='M220 85l0-8 8 4z' fill='white' stroke='#8A6E59' strokeWidth='2'/>
        <path data-name='ひれ' d='M220 115l0 8 8-4z' fill='white' stroke='#8A6E59' strokeWidth='2'/>
      </svg>
    `,
  },
  {
    id: "cat_garden",
    title: "むずかしい：お花畑のねこ",
    svg: `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 340 240' style='background: white;'>
        <rect x='10' y='10' width='320' height='220' rx='15' fill='white' stroke='#8A6E59' strokeWidth='2'/>
        <circle data-name='かお' cx='170' cy='90' r='32' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <path data-name='みぎみみ' d='M148 65l-15 22 28-6z' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <path data-name='ひだりみみ' d='M192 65l15 22-28-6z' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <circle cx='158' cy='85' r='3' fill='#8A6E59'/>
        <circle cx='182' cy='85' r='3' fill='#8A6E59'/>
        <circle cx='170' cy='95' r='2' fill='#8A6E59'/>
        <path d='M160 105c6 6 14 6 20 0' stroke='#8A6E59' strokeWidth='2' fill='none'/>
        <ellipse data-name='からだ' cx='170' cy='150' rx='40' ry='32' fill='white' stroke='#8A6E59' strokeWidth='3'/>
        <g transform='translate(60,160)'>
          <circle data-name='はな1' cx='15' cy='15' r='8' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <circle cx='8' cy='8' r='5' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <circle cx='22' cy='8' r='5' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <circle cx='8' cy='22' r='5' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <circle cx='22' cy='22' r='5' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <circle cx='15' cy='15' r='3' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <path data-name='くき' d='M15 23v25' stroke='#8A6E59' strokeWidth='2'/>
        </g>
        <g transform='translate(250,170)'>
          <circle data-name='はな2' cx='12' cy='12' r='6' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <circle cx='7' cy='7' r='4' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <circle cx='17' cy='7' r='4' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <circle cx='7' cy='17' r='4' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <circle cx='17' cy='17' r='4' fill='white' stroke='#8A6E59' strokeWidth='2'/>
          <path data-name='くき' d='M12 18v20' stroke='#8A6E59' strokeWidth='2'/>
        </g>
        <path data-name='しっぽ' d='M210 150c15 0 25 5 25 15s-10 15-25 15' fill='white' stroke='#8A6E59' strokeWidth='3'/>
      </svg>
    `,
  },
]

const COLOR_PALETTE = [
  "#FFB6C1",
  "#FFC0CB",
  "#FFD1DC",
  "#FFCCCB",
  "#F0E68C",
  "#98FB98",
  "#87CEEB",
  "#DDA0DD",
  "#F5DEB3",
  "#D2B48C",
  "#8A6E59",
  "#5C3A21",
]

// 各絵の状態を管理する型
type ColoringState = {
  [pageId: string]: {
    svgContent: string
    undoStack: string[]
    redoStack: string[]
  }
}

export function ColoringBook() {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0])
  const [tool, setTool] = useState<"paint" | "eyedropper" | "eraser">("paint")
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [coloringStates, setColoringStates] = useState<ColoringState>({})

  const currentPage = COLORING_PAGES[currentPageIndex]
  const currentState = coloringStates[currentPage.id]

  // 現在のページの状態を初期化または取得
  const initializePageState = (pageId: string, svgContent: string) => {
    if (!coloringStates[pageId]) {
      setColoringStates((prev) => ({
        ...prev,
        [pageId]: {
          svgContent,
          undoStack: [],
          redoStack: [],
        },
      }))
    }
  }

  // SVGを初期化
  useEffect(() => {
    const container = svgContainerRef.current
    if (!container) return

    const pageId = currentPage.id
    const currentState = coloringStates[pageId]

    // 保存された状態があればそれを使用、なければ初期SVGを使用
    const svgContent = currentState?.svgContent || currentPage.svg
    container.innerHTML = svgContent

    // 状態が存在しない場合は初期化
    if (!currentState) {
      initializePageState(pageId, currentPage.svg)
    }

    const handleClick = (e: Event) => {
      const target = e.target as Element
      if (!(target instanceof SVGElement)) return

      const tagName = target.tagName.toLowerCase()
      if (!["circle", "ellipse", "path", "rect", "polygon"].includes(tagName)) return
      if (!target.hasAttribute("data-name")) return

      saveToUndo()

      if (tool === "eyedropper") {
        const fill = target.getAttribute("fill")
        if (fill && fill !== "none" && fill !== "white") {
          setSelectedColor(fill)
        }
        return
      }

      if (tool === "eraser") {
        target.setAttribute("fill", "white")
      } else {
        target.setAttribute("fill", selectedColor)
      }

      // 変更を状態に保存
      saveCurrentState()
    }

    container.addEventListener("click", handleClick)
    return () => container.removeEventListener("click", handleClick)
  }, [currentPageIndex, tool, selectedColor, coloringStates])

  const saveCurrentState = () => {
    const container = svgContainerRef.current
    if (!container) return

    const svg = container.querySelector("svg")
    if (!svg) return

    const currentSvgContent = svg.outerHTML
    const pageId = currentPage.id

    setColoringStates((prev) => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        svgContent: currentSvgContent,
      },
    }))
  }

  const saveToUndo = () => {
    const container = svgContainerRef.current
    if (!container) return

    const svg = container.querySelector("svg")
    if (!svg) return

    const currentSvgContent = svg.outerHTML
    const pageId = currentPage.id

    setColoringStates((prev) => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        undoStack: [...(prev[pageId]?.undoStack || []).slice(-19), currentSvgContent],
        redoStack: [],
      },
    }))
  }

  const handleUndo = () => {
    const pageId = currentPage.id
    const state = coloringStates[pageId]
    if (!state || state.undoStack.length === 0) return

    const container = svgContainerRef.current
    if (!container) return

    const svg = container.querySelector("svg")
    if (!svg) return

    const currentSvgContent = svg.outerHTML
    const previousState = state.undoStack[state.undoStack.length - 1]

    setColoringStates((prev) => ({
      ...prev,
      [pageId]: {
        ...state,
        svgContent: previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack.slice(-19), currentSvgContent],
      },
    }))

    container.innerHTML = previousState
  }

  const handleRedo = () => {
    const pageId = currentPage.id
    const state = coloringStates[pageId]
    if (!state || state.redoStack.length === 0) return

    const container = svgContainerRef.current
    if (!container) return

    const svg = container.querySelector("svg")
    if (!svg) return

    const currentSvgContent = svg.outerHTML
    const nextState = state.redoStack[state.redoStack.length - 1]

    setColoringStates((prev) => ({
      ...prev,
      [pageId]: {
        ...state,
        svgContent: nextState,
        undoStack: [...state.undoStack.slice(-19), currentSvgContent],
        redoStack: state.redoStack.slice(0, -1),
      },
    }))

    container.innerHTML = nextState
  }

  const handleReset = () => {
    const pageId = currentPage.id
    const container = svgContainerRef.current
    if (!container) return

    // 現在の状態をアンドゥスタックに保存
    saveToUndo()

    // 初期状態にリセット
    container.innerHTML = currentPage.svg
    setColoringStates((prev) => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        svgContent: currentPage.svg,
        redoStack: [],
      },
    }))
  }

  const downloadImage = async () => {
    const container = svgContainerRef.current
    if (!container) return

    const svg = container.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    canvas.width = 800
    canvas.height = 600

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const link = document.createElement("a")
      link.download = `${currentPage.id}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  return (
    <section className="w-full">
      <Card className="bg-white/80 border-2 border-dashed border-[#EAD8C0]/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardHeader className="bg-[#FDEEDC]/60 rounded-t-lg">
          <CardTitle className="flex items-center justify-center text-xl md:text-2xl space-x-2">
            <Palette className="w-5 h-5 md:w-6 md:h-6" />
            <span>ぬりえ</span>
            <Palette className="w-5 h-5 md:w-6 md:h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {/* ページ選択 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {COLORING_PAGES.map((page, index) => (
              <Button
                key={page.id}
                onClick={() => setCurrentPageIndex(index)}
                variant={index === currentPageIndex ? "default" : "outline"}
                className={`text-sm ${
                  index === currentPageIndex
                    ? "bg-[#D4A57A] hover:bg-[#C7946A] text-white"
                    : "bg-white hover:bg-[#FDEEDC]"
                }`}
              >
                {page.title}
                {coloringStates[page.id] && <span className="ml-1 text-xs opacity-70">●</span>}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {/* ツールパネル */}
            <div className="space-y-4">
              {/* カラーパレット */}
              <div>
                <h3 className="font-semibold mb-2 text-[#8A6E59]">いろ</h3>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        selectedColor === color ? "border-[#8A6E59] scale-110" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* ツール */}
              <div>
                <h3 className="font-semibold mb-2 text-[#8A6E59]">どうぐ</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => setTool("paint")}
                    variant={tool === "paint" ? "default" : "outline"}
                    className={`w-full justify-start ${
                      tool === "paint" ? "bg-[#D4A57A] hover:bg-[#C7946A] text-white" : "bg-white hover:bg-[#FDEEDC]"
                    }`}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    ぬる
                  </Button>
                  <Button
                    onClick={() => setTool("eyedropper")}
                    variant={tool === "eyedropper" ? "default" : "outline"}
                    className={`w-full justify-start ${
                      tool === "eyedropper"
                        ? "bg-[#D4A57A] hover:bg-[#C7946A] text-white"
                        : "bg-white hover:bg-[#FDEEDC]"
                    }`}
                  >
                    <Pipette className="w-4 h-4 mr-2" />
                    スポイト
                  </Button>
                  <Button
                    onClick={() => setTool("eraser")}
                    variant={tool === "eraser" ? "default" : "outline"}
                    className={`w-full justify-start ${
                      tool === "eraser" ? "bg-[#D4A57A] hover:bg-[#C7946A] text-white" : "bg-white hover:bg-[#FDEEDC]"
                    }`}
                  >
                    <Eraser className="w-4 h-4 mr-2" />
                    けしごむ
                  </Button>
                </div>
              </div>

              {/* アクション */}
              <div>
                <h3 className="font-semibold mb-2 text-[#8A6E59]">アクション</h3>
                <div className="space-y-2">
                  <Button
                    onClick={handleUndo}
                    disabled={!currentState || currentState.undoStack.length === 0}
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-[#FDEEDC]"
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    もどす
                  </Button>
                  <Button
                    onClick={handleRedo}
                    disabled={!currentState || currentState.redoStack.length === 0}
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-[#FDEEDC]"
                  >
                    <Redo2 className="w-4 h-4 mr-2" />
                    やりなおす
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-[#FDEEDC]"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    リセット
                  </Button>
                  <Button
                    onClick={downloadImage}
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-[#FDEEDC]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ほぞん
                  </Button>
                </div>
              </div>
            </div>

            {/* キャンバス */}
            <div className="md:col-span-3">
              <div className="bg-[#FDEEDC]/30 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                <div ref={svgContainerRef} className="w-full max-w-md mx-auto cursor-pointer" />
              </div>
              <p className="text-sm text-[#8A6E59] mt-2 text-center">
                ぬりたいところをクリックしてね！
                {currentState && <span className="block text-xs opacity-70">※ 塗った状態は自動で保存されます</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
