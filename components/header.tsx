"use client"

import Image from "next/image"
import { Cherry, CircleDollarSign, Music2, Settings, VolumeX } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { assetPath } from "@/lib/utils"
import { useSkin } from "@/components/skin-provider"
import { useProgression } from "@/components/progression-provider"
import { useToast } from "@/hooks/use-toast"

type HeaderProps = {
  coins: number
  onOpenClub: () => void
  onOpenSettings: () => void
}

export function Header({ coins, onOpenClub, onOpenSettings }: HeaderProps) {
  const { skin } = useSkin()
  const { state, updateSettings } = useProgression()
  const { toast } = useToast()
  const [isMusicEnabled, setIsMusicEnabled] = useState(false)
  const [isMusicPending, setIsMusicPending] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mountedRef = useRef(true)
  const musicTransitionRef = useRef(false)
  const playRequestRef = useRef(0)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      playRequestRef.current += 1
      audioRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = state.settings.bgmVolume
    audio.loop = true
  }, [state.settings.bgmVolume])

  useEffect(() => {
    if (state.settings.soundEnabled) return
    playRequestRef.current += 1
    musicTransitionRef.current = false
    audioRef.current?.pause()
    setIsMusicEnabled(false)
    setIsMusicPending(false)
  }, [state.settings.soundEnabled])

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio || musicTransitionRef.current) return

    if (isMusicEnabled) {
      playRequestRef.current += 1
      audio.pause()
      setIsMusicEnabled(false)
      return
    }

    musicTransitionRef.current = true
    const requestId = ++playRequestRef.current
    setIsMusicPending(true)
    try {
      if (!state.settings.soundEnabled) {
        const settingResult = updateSettings({ soundEnabled: true })
        if (!settingResult.ok) {
          toast({
            title: "BGMをオンにできませんでした",
            description: "音の設定を保存できません。設定画面の案内を確認してください。",
          })
          return
        }
      }
      await audio.play()
      if (!mountedRef.current || playRequestRef.current !== requestId) return
      setIsMusicEnabled(true)
    } catch {
      if (mountedRef.current && playRequestRef.current === requestId) {
        setIsMusicEnabled(false)
        toast({
          title: "BGMを再生できませんでした",
          description: "ブラウザの音声設定を確認して、もう一度試してください。",
        })
      }
    } finally {
      if (mountedRef.current && playRequestRef.current === requestId) {
        musicTransitionRef.current = false
        setIsMusicPending(false)
      }
    }
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata">
        <source src={assetPath("/sounds/bgm.mp3")} type="audio/mpeg" />
      </audio>

      <header className="site-header">
        <div className="header-inner">
          <button type="button" className="header-coin-button" onClick={onOpenClub} aria-label={`猫クラブを開く。${coins}にゃんコイン`}>
            <CircleDollarSign aria-hidden="true" /><span>{coins.toLocaleString("ja-JP")}</span>
          </button>
          <h1>美雪の猫ページ</h1>
          <div className="header-actions">
            <button
              type="button"
              className="music-button"
              disabled={isMusicPending}
              onClick={toggleMusic}
              aria-busy={isMusicPending}
              aria-label={isMusicPending ? "BGMを準備中" : isMusicEnabled ? "BGMを止める" : "BGMを流す"}
              aria-pressed={isMusicEnabled}
            >
              <Cherry className="music-cherry" aria-hidden="true" />
              {isMusicEnabled ? <Music2 className="music-status" aria-hidden="true" /> : <VolumeX className="music-status" aria-hidden="true" />}
            </button>
            <button type="button" className="settings-button" onClick={onOpenSettings} aria-label="見やすさと設定を開く">
              <Settings aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="awning" aria-hidden="true">
          <Image src={skin.assets.awning} alt="" fill sizes="100vw" priority />
        </div>
      </header>
    </>
  )
}
