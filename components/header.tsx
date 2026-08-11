"use client"

import Image from "next/image"
import { Cat, Cherry, Music2, VolumeX } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { assetPath } from "@/lib/utils"
import { useSkin } from "@/components/skin-provider"

export function Header() {
  const { skin } = useSkin()
  const [isMusicEnabled, setIsMusicEnabled] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.22
    audio.loop = true
  }, [])

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMusicEnabled) {
      audio.pause()
      setIsMusicEnabled(false)
      return
    }

    try {
      await audio.play()
      setIsMusicEnabled(true)
    } catch {
      setIsMusicEnabled(false)
    }
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata">
        <source src={assetPath("/sounds/bgm.mp3")} type="audio/mpeg" />
      </audio>

      <header className="site-header">
        <div className="header-inner">
          <Cat className="header-cat" aria-hidden="true" strokeWidth={2.2} />
          <h1>美雪の猫ページ</h1>
          <button
            type="button"
            className="music-button"
            onClick={toggleMusic}
            aria-label={isMusicEnabled ? "BGMを止める" : "BGMを流す"}
            aria-pressed={isMusicEnabled}
          >
            <Cherry className="music-cherry" aria-hidden="true" />
            {isMusicEnabled ? (
              <Music2 className="music-status" aria-hidden="true" />
            ) : (
              <VolumeX className="music-status" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="awning" aria-hidden="true">
          <Image src={skin.assets.awning} alt="" fill sizes="100vw" priority />
        </div>
      </header>
    </>
  )
}
