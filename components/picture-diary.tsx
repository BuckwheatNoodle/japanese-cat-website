"use client"

import type React from "react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { assetPath } from "@/lib/utils"
import { useSkin } from "@/components/skin-provider"

const diaryEntries = [
  { date: "8月10日", image: "/images/diary-2025-08-10.png", title: "今日の猫ちゃん" },
  { date: "8月11日", image: "/images/diary-2025-08-11.png", title: "お昼寝タイム" },
  { date: "8月12日", image: "/images/diary-2025-08-12.png", title: "遊び時間" },
  { date: "8月13日", image: "/images/diary-2025-08-13.png", title: "夏の日の思い出" },
  { date: "8月14日", image: "/images/diary-2025-08-14.png", title: "猫と過ごした日" },
  { date: "8月15日", image: "/images/diary-2025-08-15.png", title: "お気に入りの時間" },
  { date: "8月16日", image: "/images/diary-2025-08-16.png", title: "いっしょにのんびり" },
  { date: "8月17日", image: "/images/diary-2025-08-17.png", title: "今日もなかよし" },
  { date: "8月29日", image: "/images/diary-2025-08-29.png", title: "なおくんとお昼寝" },
  { date: "8月30日", image: "/images/diary-2025-08-30.png", title: "巨大化したなおくん" },
  { date: "8月31日", image: "/images/diary-2025-08-31.png", title: "夏休み最後の日" },
].map((entry) => ({ ...entry, image: assetPath(entry.image) }))

export function PictureDiary() {
  const { skin } = useSkin()
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const currentEntry = diaryEntries[currentIndex]

  const goToPrevious = () => setCurrentIndex((index) => (index - 1 + diaryEntries.length) % diaryEntries.length)
  const goToNext = () => setCurrentIndex((index) => (index + 1) % diaryEntries.length)

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    touchEndX.current = event.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const distance = touchStartX.current - touchEndX.current
    if (distance > 48) goToNext()
    if (distance < -48) goToPrevious()
    touchStartX.current = null
    touchEndX.current = null
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goToPrevious()
      if (event.key === "ArrowRight") goToNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <section className="feature-screen diary-screen" aria-labelledby="diary-title">
      <div className="screen-hero diary-hero">
        <div className="diary-hero-art" aria-hidden="true">
          <Image src={skin.assets.activityDiary} alt="" fill sizes="150px" />
        </div>
        <div>
          <p className="screen-kicker">MIYUKI&apos;S PICTURE DIARY</p>
          <h2 id="diary-title">美雪の絵日記</h2>
          <p>左右にスワイプして、猫との思い出を見てね。</p>
        </div>
      </div>

      <div className="diary-viewer">
        <div className="diary-meta" aria-live="polite">
          <span>{currentEntry.date}</span>
          <h3>{currentEntry.title}</h3>
          <span>{currentIndex + 1} / {diaryEntries.length}</span>
        </div>

        <div
          className="diary-image-stage"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={currentEntry.image}
            alt={`${currentEntry.date}「${currentEntry.title}」の絵日記`}
            width={720}
            height={720}
            sizes="(max-width: 640px) 92vw, 680px"
            priority={currentIndex === 0}
            draggable={false}
          />
          <button type="button" className="diary-arrow is-left" onClick={goToPrevious} aria-label="前の絵日記">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="diary-arrow is-right" onClick={goToNext} aria-label="次の絵日記">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        <div className="diary-thumbnails" aria-label="絵日記を選ぶ">
          {diaryEntries.map((entry, index) => (
            <button
              key={entry.image}
              type="button"
              className={index === currentIndex ? "is-current" : ""}
              onClick={() => setCurrentIndex(index)}
              aria-label={`${entry.date}の絵日記を表示`}
              aria-current={index === currentIndex ? "true" : undefined}
            >
              <Image src={entry.image} alt="" fill sizes="64px" />
              <span>{entry.date.replace("月", "/").replace("日", "")}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
