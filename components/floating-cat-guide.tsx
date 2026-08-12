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
  "本日の調査、どこから始める？",
  "ベスト記録はゲーム攻略室で確認できます。",
  "5問スプリントと10問検定、どちらで挑む？",
  "品種クイズは耳・顔・毛並みの順で見ると推理しやすい。",
  "神経衰弱は速さより、同じ場所を二度開かない作戦が重要。",
  "ぬりえ工房では配色を自動保存しています。",
  "絵日記は日付ごとの事件ファイルです。",
  "猫クラブで今日のミッションを確認できます。",
  "トラちゃんは遊び、キキは観察、フワはお昼寝が得意。",
  "美雪のツッコミより先にオチが分かったら、かなり鋭い。",
  "キキはだいたい真顔。その分、採点が厳しい。",
  "トラちゃんは元気ですが、店の状況もよく見ています。",
  "猫のひげは周囲を感じ取る大切な感覚器官です。",
  "猫のしっぽを見ると、気分を推測できることがあります。",
  "占いは名前を変えると結果を比較できます。",
  "難易度を上げる前に、自分のベストを覚えておくと面白い。",
  "フワの休憩作戦は完璧。三匹で確認済みです。",
  "全エリアを調査すると、活動ログが完成します。",
  "少し休むのも作戦のうち。猫はその作戦をよく使います。",
  "音が不要なときは設定で切り替えられます。",
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
