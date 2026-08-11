"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Cat, Fish, Heart, Lightbulb, PawPrint, Play, RotateCcw, Sparkles, Star, Trophy, Volume2, VolumeX } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"

type SimonState = "idle" | "showing" | "input" | "success" | "retry" | "gameover"
type SpeedId = "calm" | "normal" | "fast"

const PADS = [
  { id: 0, icon: Heart, label: "あか", tone: "coral", frequency: 392 },
  { id: 1, icon: Cat, label: "あお", tone: "soda", frequency: 494 },
  { id: 2, icon: PawPrint, label: "きいろ", tone: "butter", frequency: 587 },
  { id: 3, icon: Fish, label: "みどり", tone: "mint", frequency: 659 },
] as const

const SPEEDS = [
  { id: "calm", name: "ゆっくり", show: 720, pause: 360, description: "光る時間が長め" },
  { id: "normal", name: "ふつう", show: 520, pause: 260, description: "おすすめ速度" },
  { id: "fast", name: "はやい", show: 340, pause: 170, description: "反射神経も勝負" },
] as const

export function CatSimonGame() {
  const [gameState, setGameState] = useState<SimonState>("idle")
  const [speedId, setSpeedId] = useState<SpeedId>("normal")
  const [sequence, setSequence] = useState<number[]>([])
  const [inputIndex, setInputIndex] = useState(0)
  const [activePad, setActivePad] = useState<number | null>(null)
  const [level, setLevel] = useState(0)
  const [lives, setLives] = useState(2)
  const [soundOn, setSoundOn] = useState(true)
  const [highScores, setHighScores] = useLocalStorage<Record<SpeedId, number>>("catSimonHighScoresV2", { calm: 0, normal: 0, fast: 0 })
  const timeoutRef = useRef<number | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const speed = SPEEDS.find((item) => item.id === speedId) ?? SPEEDS[1]

  const clearTimer = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  const playTone = useCallback((padId: number, duration = 0.16) => {
    if (!soundOn) return
    try {
      audioRef.current ??= new AudioContext()
      const context = audioRef.current
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = PADS[padId].frequency
      oscillator.type = "sine"
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + duration + 0.02)
    } catch {
      // Visual feedback remains available when Web Audio is unavailable.
    }
  }, [soundOn])

  const showSequence = useCallback((nextSequence: number[]) => {
    clearTimer()
    setGameState("showing")
    setActivePad(null)
    let index = 0
    const showNext = () => {
      if (index >= nextSequence.length) {
        timeoutRef.current = window.setTimeout(() => { setInputIndex(0); setGameState("input") }, speed.pause)
        return
      }
      const padId = nextSequence[index]
      setActivePad(padId)
      playTone(padId, Math.min(0.22, speed.show / 1800))
      timeoutRef.current = window.setTimeout(() => {
        setActivePad(null)
        timeoutRef.current = window.setTimeout(() => { index += 1; showNext() }, speed.pause)
      }, speed.show)
    }
    timeoutRef.current = window.setTimeout(showNext, 520)
  }, [playTone, speed.pause, speed.show])

  const startGame = () => {
    clearTimer()
    const first = Math.floor(Math.random() * PADS.length)
    const nextSequence = [first]
    setSequence(nextSequence)
    setLevel(1)
    setLives(2)
    setInputIndex(0)
    showSequence(nextSequence)
  }

  const advanceLevel = useCallback(() => {
    setGameState("success")
    const nextSequence = [...sequence, Math.floor(Math.random() * PADS.length)]
    timeoutRef.current = window.setTimeout(() => {
      setSequence(nextSequence)
      setLevel(nextSequence.length)
      setInputIndex(0)
      showSequence(nextSequence)
    }, 760)
  }, [sequence, showSequence])

  const pressPad = (padId: number) => {
    if (gameState !== "input") return
    setActivePad(padId)
    playTone(padId)
    window.setTimeout(() => setActivePad(null), 180)

    if (padId === sequence[inputIndex]) {
      const nextIndex = inputIndex + 1
      if (nextIndex === sequence.length) advanceLevel()
      else setInputIndex(nextIndex)
      return
    }

    if (lives > 1) {
      setLives((value) => value - 1)
      setGameState("retry")
      timeoutRef.current = window.setTimeout(() => showSequence(sequence), 900)
    } else {
      setLives(0)
      setGameState("gameover")
      if (level > (highScores[speedId] ?? 0)) setHighScores({ ...highScores, [speedId]: level })
    }
  }

  useEffect(() => () => {
    clearTimer()
    audioRef.current?.close().catch(() => undefined)
  }, [])

  const stars = level >= 10 ? 3 : level >= 6 ? 2 : 1

  return (
    <GameShell title="にゃんこ記憶力チャレンジ" subtitle="光と音の順番を覚えて、同じパッドをタップしよう。" icon={Lightbulb} tone="blush">
      {gameState === "idle" && (
        <div className="game-start-view">
          <div className="game-intro-mark"><Lightbulb aria-hidden="true" /></div>
          <h3>どこまで覚えられるかな？</h3>
          <p>毎レベルひとつずつ順番が増えるよ。まちがえても一度だけ見直せる安心ルールです。</p>
          <div className="game-difficulty-grid">
            {SPEEDS.map((item) => <button key={item.id} type="button" className={speedId === item.id ? "is-selected" : ""} onClick={() => setSpeedId(item.id)} aria-pressed={speedId === item.id}>
              <strong>{item.name}</strong><span>{item.description}</span><small>ベスト Lv.{highScores[item.id] ?? 0}</small>
            </button>)}
          </div>
          <button type="button" className="game-sound-toggle" onClick={() => setSoundOn((value) => !value)} aria-pressed={soundOn}>
            {soundOn ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}音 {soundOn ? "あり" : "なし"}
          </button>
          <GamePrimaryButton onClick={startGame}><Play aria-hidden="true" />チャレンジ開始</GamePrimaryButton>
        </div>
      )}

      {gameState !== "idle" && gameState !== "gameover" && (
        <div className="simon-game-view">
          <div className="game-stats-row">
            <GameStat icon={Sparkles} label="レベル" value={level} />
            <GameStat icon={Heart} label="チャンス" value={`${lives}こ`} />
            <GameStat icon={PawPrint} label="入力" value={`${Math.min(inputIndex + 1, sequence.length)} / ${sequence.length}`} />
          </div>
          <p className="game-live-message" aria-live="assertive">
            {gameState === "showing" ? "よく見て、音も聞いてね" : gameState === "input" ? "同じ順番でタップ！" : gameState === "success" ? "正解！ひとつ増えるよ" : "おしい！もう一度見てね"}
          </p>
          <div className="simon-grid">
            {PADS.map((pad) => {
              const Icon = pad.icon
              return <button key={pad.id} type="button" data-tone={pad.tone} className={activePad === pad.id ? "is-active" : ""} onClick={() => pressPad(pad.id)} disabled={gameState !== "input"} aria-label={`${pad.label}のパッド`}>
                <Icon aria-hidden="true" /><span>{pad.label}</span>
              </button>
            })}
          </div>
          <div className="simon-sequence-progress" aria-label={`${sequence.length}個中${inputIndex}個入力済み`}>
            {sequence.map((_, index) => <i key={index} className={index < inputIndex ? "is-done" : index === inputIndex && gameState === "input" ? "is-current" : ""} />)}
          </div>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="game-result-view">
          <Trophy className="game-result-trophy" aria-hidden="true" />
          <p className="game-result-kicker">記憶力チャレンジ終了</p>
          <h3>レベル {level}</h3>
          <div className="game-result-stars" aria-label={`${stars}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= stars ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{sequence.length}個の順番まで覚えられたよ。次はもうひとつ先を目指そう！</p>
          <div className="game-result-record"><Trophy aria-hidden="true" /><span>{speed.name}のベスト</span><strong>Lv.{Math.max(level, highScores[speedId] ?? 0)}</strong></div>
          <GamePrimaryButton onClick={startGame}><RotateCcw aria-hidden="true" />もう一度遊ぶ</GamePrimaryButton>
          <button type="button" className="game-secondary-button" onClick={() => setGameState("idle")}>速さを変える</button>
        </div>
      )}
    </GameShell>
  )
}
