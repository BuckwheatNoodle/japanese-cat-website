"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Cat, EyeOff, X } from "lucide-react"
import { assetPath } from "@/lib/utils"

const MEOW_SOUNDS = [
  "にゃーん♪",
  "みゃー！",
  "にゃにゃ〜",
  "みゃお〜",
  "にゃっ！",
  "みゃーみゃー",
  "にゃんにゃん",
  "みゃーお",
  "にゃ〜ん",
  "みゃうみゃう",
  "にゃおん♪",
  "みゃっ！",
]

const GUIDE_MESSAGES = [
  // 基本的な挨拶・案内
  "こんにちは〜♪",
  "一緒に遊ぼう！",
  "ゲームはどう？",
  "クイズに挑戦してみて！",
  "ぬりえも楽しいよ〜",
  "占いしてみる？",
  "絵日記も見てね♪",
  "美雪のページへようこそ！",
  "猫のこと、もっと知りたい？",
  "今日も良い日だね〜",
  "BGMも聞いてね〜♪",
  "音楽と一緒に楽しもう！",

  // 美雪について
  "美雪ちゃんは猫が大好きなんだって！",
  "美雪ちゃんが作ったこのページ、素敵でしょ？",
  "美雪ちゃんの猫愛は本物だよ〜",
  "美雪ちゃんみたいに猫好きになってね♪",
  "美雪ちゃんのプロフィール、読んだ？",
  "美雪ちゃんはとっても優しい人なの！",
  "美雪ちゃんと一緒に猫について学ぼう〜",

  // なおくんについて
  "なおくんって知ってる？絵日記に出てくるよ！",
  "なおくんは美雪のお兄ちゃん。うんち役が大好き♪",
  "絵日記のなおくん、とってもかわいいでしょ？",
  "なおくんと美雪ちゃんの日常が見れるよ〜",
  "なおくんはお昼寝が得意なんだって！",
  "なおくんみたいにのんびりしたいな〜",
  "絵日記でなおくんの成長を見守ろう！",

  // ゲーム関連
  "保護ねこゲーム、やってみた？",
  "猫クイズで猫博士になろう！",
  "品種クイズは難しいけど勉強になるよ〜",
  "ハイスコア目指してがんばって！",
  "ゲームで遊んで猫のことを覚えよう♪",

  // ぬりえ・占い関連
  "ぬりえで自分だけの猫を作ろう！",
  "今日の猫占い、もうやった？",
  "占いの結果、当たってる？",
  "きれいな色で猫を塗ってね〜",

  // 励まし・応援
  "君も猫好きになったかな？",
  "猫のことがもっと好きになるよ〜",
  "このページで猫の魅力を感じて♪",
  "猫と一緒にいると癒されるよね〜",
  "君の笑顔が一番だよ！",
  "今日もお疲れさま〜",
  "また遊びに来てね♪",

  // 季節・時間関連
  "今日はいい天気だね〜",
  "お疲れさま、休憩しよう♪",
  "猫と一緒にのんびりしない？",
  "暖かい日は猫も気持ちよさそう〜",

  // 猫の豆知識風
  "猫は1日16時間も寝るんだって！",
  "猫の鳴き声は人間にだけ特別なの♪",
  "猫のひげは大切なセンサーなんだよ〜",
  "猫のしっぽで気持ちがわかるよ！",
  "猫の肉球はとってもやわらかいの♪",

  // 感謝・愛情表現
  "遊んでくれてありがとう♪",
  "君がいると楽しいよ〜",
  "一緒にいてくれて嬉しいな！",
  "君も猫ファミリーの一員だね♪",
  "大好き〜！",
]

// 効果音ファイルのパス
const SOUND_FILES = [
  assetPath("/sounds/cute-cat.mp3"),
  assetPath("/sounds/cat-meow.mp3"),
  assetPath("/sounds/cat-hit.mp3"),
]

export function FloatingCatGuide() {
  const [renderPos, setRenderPos] = useState({ x: 50, y: 50 })
  const [facingRight, setFacingRight] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [currentMessage, setCurrentMessage] = useState("")
  const [isVisible, setIsVisible] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [tapCount, setTapCount] = useState(0)

  const catRef = useRef<HTMLButtonElement>(null)
  const showButtonRef = useRef<HTMLButtonElement>(null)
  const animationRef = useRef<number | null>(null)
  const messageTimeoutRef = useRef<number | null>(null)
  const rippleTimeoutRefs = useRef(new Set<number>())
  const focusFrameRef = useRef<number | null>(null)
  const focusAfterVisibilityToggleRef = useRef(false)
  const rippleIdRef = useRef(0)
  const tapCountRef = useRef(0)
  const audioRefs = useRef<HTMLAudioElement[]>([])
  const posRef = useRef({ x: 50, y: 50 })
  const velRef = useRef({ x: 1, y: 0.8 })

  // 効果音の初期化
  useEffect(() => {
    // 各効果音ファイルのAudioオブジェクトを作成
    audioRefs.current = SOUND_FILES.map((soundFile) => {
      const audio = new Audio(soundFile)
      audio.preload = "auto"
      audio.volume = 0.6 // 音量を60%に設定
      return audio
    })

    return () => {
      // クリーンアップ
      audioRefs.current.forEach((audio) => {
        audio.pause()
        audio.currentTime = 0
      })
    }
  }, [])

  // ランダムな効果音を再生
  const playRandomSound = () => {
    try {
      const randomIndex = Math.floor(Math.random() * audioRefs.current.length)
      const selectedAudio = audioRefs.current[randomIndex]

      if (selectedAudio) {
        // 前の音声を停止してリセット
        audioRefs.current.forEach((audio) => {
          audio.pause()
          audio.currentTime = 0
        })

        // 新しい音声を再生
        void selectedAudio.play().catch(() => undefined)
      }
    } catch {
      // Audio is optional; browser policy and device state may block playback.
    }
  }

  // 画面サイズに応じた境界を計算
  const getBounds = () => {
    if (typeof window === "undefined") return { width: 400, height: 600 }
    return {
      width: Math.max(80, window.innerWidth - 80),
      height: Math.max(80, window.innerHeight - 200), // ヘッダー + ボトムタブ分を除く
    }
  }

  // ふわふわ浮遊アニメーション（refベースで1つのループだけ走る）
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const root = document.documentElement
    const syncPreference = () => {
      setReduceMotion(media.matches || root.dataset.miyukiMotion === "reduced")
    }
    const observer = new MutationObserver(syncPreference)
    syncPreference()
    media.addEventListener("change", syncPreference)
    observer.observe(root, { attributes: true, attributeFilter: ["data-miyuki-motion"] })
    return () => {
      media.removeEventListener("change", syncPreference)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isVisible || reduceMotion) return
    let frameCount = 0

    const animate = () => {
      const bounds = getBounds()
      const pos = posRef.current
      const vel = velRef.current

      let newX = pos.x + vel.x
      let newY = pos.y + vel.y
      let newVelX = vel.x
      let newVelY = vel.y

      // 境界での反射
      if (newX <= 0 || newX >= bounds.width - 60) {
        newVelX = -newVelX + (Math.random() - 0.5) * 0.3
        newX = Math.max(0, Math.min(bounds.width - 60, newX))
      }
      if (newY <= 0 || newY >= bounds.height - 60) {
        newVelY = -newVelY + (Math.random() - 0.5) * 0.3
        newY = Math.max(0, Math.min(bounds.height - 60, newY))
      }

      // ランダムな変化
      newVelX += (Math.random() - 0.5) * 0.1
      newVelY += (Math.random() - 0.5) * 0.1

      // 速度制限
      const maxSpeed = 2
      const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY)
      if (speed > maxSpeed) {
        newVelX = (newVelX / speed) * maxSpeed
        newVelY = (newVelY / speed) * maxSpeed
      }

      posRef.current = { x: newX, y: newY }
      velRef.current = { x: newVelX, y: newVelY }

      // DOMへの反映は3フレームに1回（パフォーマンス向上）
      frameCount++
      if (frameCount % 3 === 0) {
        setRenderPos({ x: newX, y: newY })
        setFacingRight(newVelX > 0)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
      animationRef.current = null
    }
  }, [isVisible, reduceMotion])

  useEffect(() => () => {
    if (messageTimeoutRef.current !== null) window.clearTimeout(messageTimeoutRef.current)
    rippleTimeoutRefs.current.forEach((timer) => window.clearTimeout(timer))
    rippleTimeoutRefs.current.clear()
    if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
  }, [])

  useEffect(() => {
    if (!isVisible) {
      setShowMessage(false)
      if (messageTimeoutRef.current !== null) {
        window.clearTimeout(messageTimeoutRef.current)
        messageTimeoutRef.current = null
      }
      rippleTimeoutRefs.current.forEach((timer) => window.clearTimeout(timer))
      rippleTimeoutRefs.current.clear()
      setRipples([])
      audioRefs.current.forEach((audio) => {
        audio.pause()
        audio.currentTime = 0
      })
    }
    if (!focusAfterVisibilityToggleRef.current) return
    focusAfterVisibilityToggleRef.current = false
    focusFrameRef.current = window.requestAnimationFrame(() => {
      if (isVisible) catRef.current?.focus()
      else showButtonRef.current?.focus()
      focusFrameRef.current = null
    })
    return () => {
      if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
      focusFrameRef.current = null
    }
  }, [isVisible])

  // 画面リサイズ対応
  useEffect(() => {
    const handleResize = () => {
      const bounds = getBounds()
      posRef.current = {
        x: Math.min(posRef.current.x, bounds.width - 60),
        y: Math.min(posRef.current.y, bounds.height - 60),
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // 猫をタップした時の処理
  const handleCatTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // 効果音を再生
    playRandomSound()

    // タップ回数をカウント
    const nextTapCount = tapCountRef.current + 1
    tapCountRef.current = nextTapCount
    setTapCount(nextTapCount)

    // タップ位置を取得
    const rect = catRef.current?.getBoundingClientRect()
    if (!rect) return

    const clientX = e.clientX || rect.left + rect.width / 2
    const clientY = e.clientY || rect.top + rect.height / 2

    // リップル効果を追加
    const rippleId = rippleIdRef.current++
    const rippleX = clientX - rect.left
    const rippleY = clientY - rect.top

    setRipples((prev) => [...prev, { id: rippleId, x: rippleX, y: rippleY }])

    // リップル効果を削除
    const rippleTimer = window.setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== rippleId))
      rippleTimeoutRefs.current.delete(rippleTimer)
    }, 600)
    rippleTimeoutRefs.current.add(rippleTimer)

    // 鳴き声とメッセージを表示
    const sound = MEOW_SOUNDS[Math.floor(Math.random() * MEOW_SOUNDS.length)]
    let message = GUIDE_MESSAGES[Math.floor(Math.random() * GUIDE_MESSAGES.length)]

    // 特定のタップ回数で特別なメッセージ
    if (nextTapCount === 10) {
      message = "10回もタップしてくれてありがとう♪"
    } else if (nextTapCount === 20) {
      message = "20回！君は本当の猫好きだね〜"
    } else if (nextTapCount === 50) {
      message = "50回！！美雪ちゃんもびっくりするよ〜"
    } else if (nextTapCount % 25 === 0) {
      message = `${nextTapCount}回もタップしてくれて嬉しいな♪`
    }

    setCurrentMessage(`${sound} ${message}`)
    setShowMessage(true)

    // 少し跳ねる動作（タップ回数に応じて跳ね方を変える）
    const jumpIntensity = Math.min(nextTapCount / 10, 5)
    velRef.current = {
      x: velRef.current.x + (Math.random() - 0.5) * (3 + jumpIntensity),
      y: velRef.current.y - Math.random() * (2 + jumpIntensity) - 1,
    }

    // メッセージを自動で隠す
    if (messageTimeoutRef.current !== null) {
      window.clearTimeout(messageTimeoutRef.current)
    }
    messageTimeoutRef.current = window.setTimeout(() => {
      setShowMessage(false)
      messageTimeoutRef.current = null
    }, 3500) // 少し長めに表示

    // バイブレーション（対応デバイスのみ）
    if (navigator.vibrate) {
      // タップ回数に応じてバイブレーションパターンを変える
      if (nextTapCount % 10 === 0) {
        navigator.vibrate([50, 50, 50]) // 特別なパターン
      } else {
        navigator.vibrate(50)
      }
    }
  }

  // メッセージを手動で閉じる
  const handleMessageClose = () => {
    setShowMessage(false)
    if (messageTimeoutRef.current !== null) {
      window.clearTimeout(messageTimeoutRef.current)
      messageTimeoutRef.current = null
    }
    catRef.current?.focus()
  }

  // 猫を一時的に隠す/表示する
  const toggleVisibility = () => {
    focusAfterVisibilityToggleRef.current = true
    setIsVisible((current) => !current)
  }

  if (!isVisible) {
    return (
      <button
        ref={showButtonRef}
        type="button"
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-40 bg-[#D4A57A] hover:bg-[#C7946A] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="猫ガイドを表示"
      >
        <Cat aria-hidden="true" />
      </button>
    )
  }

  return (
    <>
      {/* 浮遊する猫キャラ */}
      <button
        ref={catRef}
        type="button"
        className="fixed z-30 cursor-pointer select-none border-0 bg-transparent p-0"
        style={{
          left: `${renderPos.x}px`,
          top: `${renderPos.y + 80}px`,
          transform: `scaleX(${facingRight ? 1 : -1})`,
          willChange: "left, top",
        }}
        onClick={handleCatTap}
        aria-label="猫ガイド - タップして話しかける"
      >
        {/* 猫の影 */}
        <div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-black/20 rounded-full blur-sm animate-pulse"
          style={{
            animation: reduceMotion ? "none" : "shadow-float 3s ease-in-out infinite",
          }}
        />

        {/* 猫本体 */}
        <div className={`relative ${reduceMotion ? "" : "animate-bounce-gentle"}`}>
          <Image
            src={assetPath("/cute-tabby-waving.webp")}
            alt="浮遊する猫ガイド"
            width={60}
            height={60}
            className="drop-shadow-lg transition-transform duration-200 hover:scale-110"
            draggable={false}
            priority
          />

          {/* タップ回数表示（10回以上で表示） */}
          {tapCount >= 10 && (
            <div className="absolute -top-6 -right-2 bg-[#FFB6C1] text-[#5C3A21] text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              {tapCount}
            </div>
          )}

          {/* タップリップル効果 */}
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute pointer-events-none"
              style={{
                left: ripple.x - 20,
                top: ripple.y - 20,
              }}
            >
              <div className={`w-10 h-10 border-2 border-[#D4A57A] rounded-full opacity-75 ${reduceMotion ? "" : "animate-ping"}`} />
            </div>
          ))}
        </div>

        {/* ふわふわエフェクト */}
        <div className={`absolute -top-2 -right-2 w-3 h-3 bg-[#FFB6C1] rounded-full opacity-60 ${reduceMotion ? "" : "animate-ping"}`} />
        <div
          className={`absolute -top-1 -left-3 w-2 h-2 bg-[#87CEEB] rounded-full opacity-40 ${reduceMotion ? "" : "animate-ping"}`}
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className={`absolute -bottom-1 right-1 w-2 h-2 bg-[#98FB98] rounded-full opacity-50 ${reduceMotion ? "" : "animate-ping"}`}
          style={{ animationDelay: "1s" }}
        />
      </button>

      {/* メッセージ吹き出し */}
      {showMessage && (
        <div
          className="fixed z-40 max-w-xs transition-all duration-300 ease-out animate-slide-in-bottom"
          style={{
            left: `${Math.min(renderPos.x, getBounds().width - 200)}px`,
            top: `${renderPos.y + 80 + 70}px`,
          }}
        >
          <div className="relative bg-white/95 backdrop-blur-sm border-2 border-[#EAD8C0] rounded-2xl p-3 shadow-lg">
            {/* 吹き出しの尻尾 */}
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-r-2 border-b-2 border-[#EAD8C0] transform rotate-45" />

            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-[#5C3A21] font-medium leading-relaxed" role="status" aria-live="polite">{currentMessage}</p>
              <button
                type="button"
                onClick={handleMessageClose}
                className="flex-shrink-0 text-[#8A6E59] hover:text-[#5C3A21] transition-colors p-1"
                aria-label="メッセージを閉じる"
              >
                <X aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 猫を隠すボタン */}
      <button
        type="button"
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-40 bg-[#8A6E59]/80 hover:bg-[#8A6E59] text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 text-xs"
        aria-label="猫ガイドを隠す"
      >
        <EyeOff aria-hidden="true" />
      </button>

      {/* カスタムアニメーション用のスタイル */}
      <style jsx>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shadow-float {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.2; }
          50% { transform: translateX(-50%) scale(1.1); opacity: 0.3; }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 4s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
