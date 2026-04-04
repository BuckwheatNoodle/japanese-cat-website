"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"

const diaryEntries = [
  {
    image: "/images/diary-2025-08-10.png",
    alt: "2025年8月10日の絵日記",
    title: "今日の猫ちゃん",
  },
  {
    image: "/images/diary-2025-08-11.png",
    alt: "2025年8月11日の絵日記",
    title: "お昼寝タイム",
  },
  {
    image: "/images/diary-2025-08-12.png",
    alt: "2025年8月12日の絵日記",
    title: "遊び時間",
  },
  {
    image: "/images/diary-2025-08-29.png",
    alt: "2025年8月29日の絵日記",
    title: "なおくんとお昼寝",
  },
  {
    image: "/images/diary-2025-08-30.png",
    alt: "2025年8月30日の絵日記",
    title: "巨大化したなおくん",
  },
  {
    image: "/images/diary-2025-08-31.png",
    alt: "2025年8月31日の絵日記",
    title: "夏休み最後の日",
  },
]

export function PictureDiary() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + diaryEntries.length) % diaryEntries.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % diaryEntries.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // タッチイベントハンドラー
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }

    // リセット
    touchStartX.current = null
    touchEndX.current = null
  }

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <section className="w-full">
      <Card className="bg-white/80 border-2 border-dashed border-[#EAD8C0]/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardHeader className="bg-[#FDEEDC]/60 rounded-t-lg">
          <CardTitle className="flex items-center justify-center text-xl md:text-2xl space-x-2">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
            <span>絵日記</span>
            <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            {/* メインの絵日記表示エリア */}
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-lg bg-[#FDEEDC]/50 p-4 md:p-6 touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                <div className="text-center space-y-4">
                  <h3 className="text-lg md:text-xl font-bold text-[#8A6E59]">{diaryEntries[currentIndex].title}</h3>
                  <div className="relative">
                    <Image
                      src={diaryEntries[currentIndex].image || "/placeholder.svg"}
                      alt={diaryEntries[currentIndex].alt}
                      width={350}
                      height={350}
                      className="rounded-md shadow-md border-2 border-white mx-auto transition-all duration-500 hover:scale-105 select-none"
                      priority={currentIndex === 0}
                      draggable={false}
                    />
                  </div>
                </div>
              </div>

              {/* 左右の矢印ボタン */}
              <Button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#8A6E59] rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                size="sm"
                aria-label="前の絵日記"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#8A6E59] rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                size="sm"
                aria-label="次の絵日記"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* インジケーター（ドット） */}
            <div className="flex justify-center space-x-2 mt-4">
              {diaryEntries.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex ? "bg-[#D4A57A] scale-125" : "bg-[#EAD8C0] hover:bg-[#D4A57A]/60"
                  }`}
                  aria-label={`絵日記 ${index + 1} を表示`}
                />
              ))}
            </div>

            {/* 進行状況バー */}
            <div className="mt-3 text-center text-sm text-[#8A6E59]">
              {currentIndex + 1} / {diaryEntries.length}
            </div>

            {/* スワイプヒント（モバイルのみ表示） */}
            <div className="mt-2 text-center text-xs text-[#8A6E59]/70 md:hidden">← スワイプで切り替え →</div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
