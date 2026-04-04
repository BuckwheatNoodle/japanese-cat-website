"use client"

import { Cat } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMusicEnabled, setIsMusicEnabled] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.3
    audio.loop = true

    // ユーザーインタラクション後に自動再生を試行
    const handleFirstInteraction = () => {
      if (isMusicEnabled && !audio.paused) return

      if (isMusicEnabled) {
        audio.play().catch(() => {
          console.log("Audio playback failed")
        })
      }

      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("touchstart", handleFirstInteraction)
    }

    if (isMusicEnabled) {
      document.addEventListener("click", handleFirstInteraction)
      document.addEventListener("touchstart", handleFirstInteraction)
    }

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("touchstart", handleFirstInteraction)
    }
  }, [isMusicEnabled])

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isMusicEnabled) {
        audio.pause()
        setIsMusicEnabled(false)
      } else {
        await audio.play()
        setIsMusicEnabled(true)
      }
    } catch (error) {
      console.log("Audio toggle failed:", error)
      setIsMusicEnabled(!isMusicEnabled)
    }
  }

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fat-cat-374614-1v0O6r6qoCY7y4T7VTdCdh7JuxPg2T.mp3" type="audio/mpeg" />
      </audio>

      <header className="sticky top-0 z-50 w-full py-4 md:py-5 bg-[#FDEEDC]/80 border-b-2 border-[#EAD8C0] backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-2 md:space-x-4 flex-1 justify-center">
            <Cat className="w-8 h-8 md:w-10 md:h-10 text-[#D4A57A] transition-transform hover:rotate-12" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-wider text-center">美雪の猫ページ</h1>
            <Cat className="w-8 h-8 md:w-10 md:h-10 text-[#D4A57A] transform -scale-x-100 transition-transform hover:-rotate-12" />
          </div>

          {/* 音楽オンオフボタン */}
          <Button
            onClick={toggleMusic}
            size="sm"
            variant="outline"
            className="bg-white/80 hover:bg-white border-[#EAD8C0] text-[#8A6E59] hover:text-[#5C3A21]"
            aria-label={isMusicEnabled ? "音楽をオフ" : "音楽をオン"}
          >
            {isMusicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </header>
    </>
  )
}
