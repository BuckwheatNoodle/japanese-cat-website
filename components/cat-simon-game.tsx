"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Cat, Fish, Heart, Lightbulb, PawPrint, Play, RotateCcw, Sparkles, Star, Trophy, Volume2, VolumeX } from "lucide-react"
import { isFiniteNumberRecord, useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"
import { useProgression } from "@/components/progression-provider"
import { createEventId } from "@/lib/progression"

type SimonState = "idle" | "showing" | "input" | "success" | "retry" | "gameover"
type SpeedId = "calm" | "normal" | "fast"
type GlobalDifficulty = "gentle" | "standard" | "challenge"

const PADS = [
  { id: 0, icon: Heart, label: "あか", tone: "coral", frequency: 392 },
  { id: 1, icon: Cat, label: "あお", tone: "soda", frequency: 494 },
  { id: 2, icon: PawPrint, label: "きいろ", tone: "butter", frequency: 587 },
  { id: 3, icon: Fish, label: "みどり", tone: "mint", frequency: 659 },
] as const

const SPEEDS = [
  { id: "calm", name: "ゆっくり", show: 720, pause: 360, description: "光る時間が長め" },
  { id: "normal", name: "標準", show: 520, pause: 260, description: "基本速度" },
  { id: "fast", name: "はやい", show: 340, pause: 170, description: "反射神経も勝負" },
] as const

const presentationMultiplierFor = (mode: GlobalDifficulty) => mode === "gentle" ? 1.8 : mode === "challenge" ? 0.78 : 1
const recordKeyFor = (mode: GlobalDifficulty, speedId: SpeedId) => `${mode}:${speedId}`

const SIMON_SUCCESS_REACTIONS = [
  "美雪『正解！』トラちゃんが優勝パレードを始めました。",
  "キキがしっぽで同じ順番を再現しています。",
  "ぴったり！ フワからやさしい肉球拍手です。",
  "三匹の猫審査員から肉球スタンプが届きました。",
] as const

function simonResultCopy(level: number) {
  if (level >= 10) return "美雪『十個以上！』三匹から大きな拍手です。"
  if (level >= 6) return "三匹『かなり覚えたにゃ』。色の順番をもう一度記録しよう。"
  if (level >= 3) return "美雪『いい記録！』次は一つ長い順番を目指そう。"
  return "三匹はもう一度見せる準備OK。ゆっくり再挑戦しよう！"
}

export function CatSimonGame() {
  const { state, recordEvent, updateSettings } = useProgression()
  const [gameState, setGameState] = useState<SimonState>("idle")
  const [speedId, setSpeedId] = useState<SpeedId>("normal")
  const [sequence, setSequence] = useState<number[]>([])
  const [inputIndex, setInputIndex] = useState(0)
  const [activePad, setActivePad] = useState<number | null>(null)
  const [level, setLevel] = useState(0)
  const [lives, setLives] = useState(2)
  const [soundOn, setSoundOn] = useState(true)
  const [sequenceAnnouncement, setSequenceAnnouncement] = useState("")
  const [sceneMessage, setSceneMessage] = useState("")
  const [runGlobalDifficulty, setRunGlobalDifficulty] = useState<GlobalDifficulty>("standard")
  const [highScores, setHighScores] = useLocalStorage<Record<string, number>>("catSimonHighScoresV3", {}, isFiniteNumberRecord)
  const [recordSaveFailed, setRecordSaveFailed] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const visualTimeoutRefs = useRef(new Set<number>())
  const announcementFrameRef = useRef<number | null>(null)
  const focusFrameRef = useRef<number | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const gameStateRef = useRef<SimonState>("idle")
  const sequenceRef = useRef<number[]>([])
  const inputIndexRef = useRef(0)
  const levelRef = useRef(0)
  const livesRef = useRef(2)
  const completionEventIdRef = useRef<string | null>(null)
  const padRefs = useRef<Array<HTMLButtonElement | null>>([])
  const setupHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const returningToSetupRef = useRef(false)
  const speed = SPEEDS.find((item) => item.id === speedId) ?? SPEEDS[1]
  const globalDifficulty = state.settings.difficulty as GlobalDifficulty
  const activeGlobalDifficulty = gameState === "idle" ? globalDifficulty : runGlobalDifficulty

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  const clearVisualTimers = useCallback(() => {
    visualTimeoutRefs.current.forEach((timer) => window.clearTimeout(timer))
    visualTimeoutRefs.current.clear()
  }, [])

  const playTone = useCallback((padId: number, duration = 0.16) => {
    if (!soundOn || !state.settings.soundEnabled) return
    try {
      audioRef.current ??= new AudioContext()
      const context = audioRef.current
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = PADS[padId].frequency
      oscillator.type = "sine"
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(Math.max(0.01, 0.16 * state.settings.sfxVolume), context.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + duration + 0.02)
    } catch {
      // Visual feedback remains available when Web Audio is unavailable.
    }
  }, [soundOn, state.settings.sfxVolume, state.settings.soundEnabled])

  const showSequence = useCallback((nextSequence: number[], mode = activeGlobalDifficulty) => {
    const multiplier = presentationMultiplierFor(mode)
    const showDuration = Math.max(280, Math.round(speed.show * multiplier))
    const pauseDuration = Math.max(150, Math.round(speed.pause * multiplier))
    clearTimer()
    clearVisualTimers()
    gameStateRef.current = "showing"
    setGameState("showing")
    setActivePad(null)
    if (announcementFrameRef.current !== null) window.cancelAnimationFrame(announcementFrameRef.current)
    setSequenceAnnouncement("")
    announcementFrameRef.current = window.requestAnimationFrame(() => {
      setSequenceAnnouncement(`色の順番は、${nextSequence.map((padId) => PADS[padId].label).join("、")}。`)
      announcementFrameRef.current = null
    })
    let index = 0
    const showNext = () => {
      if (index >= nextSequence.length) {
        timeoutRef.current = window.setTimeout(() => {
          inputIndexRef.current = 0
          gameStateRef.current = "input"
          setInputIndex(0)
          setGameState("input")
        }, pauseDuration)
        return
      }
      const padId = nextSequence[index]
      setActivePad(padId)
      playTone(padId, Math.min(0.3, showDuration / 1800))
      timeoutRef.current = window.setTimeout(() => {
        setActivePad(null)
        timeoutRef.current = window.setTimeout(() => { index += 1; showNext() }, pauseDuration)
      }, showDuration)
    }
    timeoutRef.current = window.setTimeout(showNext, 520)
  }, [activeGlobalDifficulty, clearTimer, clearVisualTimers, playTone, speed.pause, speed.show])

  const startGame = () => {
    if (gameStateRef.current !== "idle" && gameStateRef.current !== "gameover") return
    setRecordSaveFailed(false)
    clearTimer()
    clearVisualTimers()
    completionEventIdRef.current = createEventId("game-simon")
    const first = Math.floor(Math.random() * PADS.length)
    const nextSequence = [first]
    sequenceRef.current = nextSequence
    levelRef.current = 1
    livesRef.current = 2
    inputIndexRef.current = 0
    setSequence(nextSequence)
    setLevel(1)
    setLives(2)
    setInputIndex(0)
    setSceneMessage("")
    setRunGlobalDifficulty(globalDifficulty)
    showSequence(nextSequence, globalDifficulty)
  }

  const advanceLevel = useCallback(() => {
    if (gameStateRef.current !== "input") return
    gameStateRef.current = "success"
    setGameState("success")
    setSceneMessage(SIMON_SUCCESS_REACTIONS[(levelRef.current - 1) % SIMON_SUCCESS_REACTIONS.length])
    const nextSequence = [...sequenceRef.current, Math.floor(Math.random() * PADS.length)]
    timeoutRef.current = window.setTimeout(() => {
      sequenceRef.current = nextSequence
      levelRef.current = nextSequence.length
      inputIndexRef.current = 0
      setSequence(nextSequence)
      setLevel(nextSequence.length)
      setInputIndex(0)
      showSequence(nextSequence)
    }, 760)
  }, [showSequence])

  const pressPad = (padId: number) => {
    if (gameStateRef.current !== "input") return
    clearVisualTimers()
    setActivePad(padId)
    playTone(padId)
    const visualTimer = window.setTimeout(() => {
      setActivePad(null)
      visualTimeoutRefs.current.delete(visualTimer)
    }, 180)
    visualTimeoutRefs.current.add(visualTimer)

    const currentSequence = sequenceRef.current
    if (padId === currentSequence[inputIndexRef.current]) {
      const nextIndex = inputIndexRef.current + 1
      if (nextIndex === currentSequence.length) advanceLevel()
      else {
        inputIndexRef.current = nextIndex
        setInputIndex(nextIndex)
      }
      return
    }

    if (livesRef.current > 1) {
      livesRef.current -= 1
      gameStateRef.current = "retry"
      setLives(livesRef.current)
      setGameState("retry")
      const expected = PADS[currentSequence[inputIndexRef.current]]?.label ?? "正しい色"
      const chosen = PADS[padId]?.label ?? "その色"
      setSceneMessage(`三匹『いまは${expected}にゃ』。選んだ${chosen}の場所も覚えておこう。`)
      timeoutRef.current = window.setTimeout(() => showSequence(sequenceRef.current), 900)
    } else {
      clearVisualTimers()
      setActivePad(null)
      livesRef.current = 0
      gameStateRef.current = "gameover"
      setLives(0)
      setGameState("gameover")
      const eventId = completionEventIdRef.current
      if (eventId) {
        completionEventIdRef.current = null
        recordEvent({
          type: "game.completed",
          eventId,
          occurredAt: new Date().toISOString(),
          gameId: "simon",
          score: levelRef.current,
          won: levelRef.current >= 3,
        })
      }
      const recordKey = recordKeyFor(runGlobalDifficulty, speedId)
      if (levelRef.current > (highScores[recordKey] ?? 0)) setRecordSaveFailed(!setHighScores({ ...highScores, [recordKey]: levelRef.current }))
    }
  }

  useEffect(() => () => {
    clearTimer()
    clearVisualTimers()
    if (announcementFrameRef.current !== null) window.cancelAnimationFrame(announcementFrameRef.current)
    announcementFrameRef.current = null
    if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
    audioRef.current?.close().catch(() => undefined)
  }, [clearTimer, clearVisualTimers])

  useEffect(() => {
    if (!state.settings.soundEnabled) setSoundOn(false)
  }, [state.settings.soundEnabled])

  useEffect(() => {
    if (gameState === "input") focusFrameRef.current = window.requestAnimationFrame(() => padRefs.current[0]?.focus())
    if (gameState === "gameover") focusFrameRef.current = window.requestAnimationFrame(() => resultHeadingRef.current?.focus())
    if (gameState === "idle" && returningToSetupRef.current) {
      returningToSetupRef.current = false
      focusFrameRef.current = window.requestAnimationFrame(() => setupHeadingRef.current?.focus())
    }
    return () => {
      if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
      focusFrameRef.current = null
    }
  }, [gameState])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    if (next && !state.settings.soundEnabled) updateSettings({ soundEnabled: true })
  }

  const stars = level >= 10 ? 3 : level >= 6 ? 2 : 1
  const returnToSetup = () => {
    returningToSetupRef.current = true
    clearTimer()
    clearVisualTimers()
    gameStateRef.current = "idle"
    setGameState("idle")
  }

  return (
    <GameShell title="にゃんこ記憶力チャレンジ" subtitle="光と音の順番を覚えて、同じパッドをタップしよう。" icon={Lightbulb} tone="blush">
      {gameState === "idle" && (
        <div className="game-start-view">
          <div className="game-intro-mark"><Lightbulb aria-hidden="true" /></div>
          <h3 ref={setupHeadingRef} tabIndex={-1}>どこまで覚えられるかな？</h3>
          <p>毎レベルひとつずつ順番が増えるよ。まちがえても一度だけ見直せる安心ルールです。</p>
          <div className="game-difficulty-grid">
            {SPEEDS.map((item) => <button key={item.id} type="button" className={speedId === item.id ? "is-selected" : ""} onClick={() => setSpeedId(item.id)} aria-pressed={speedId === item.id}>
              <strong>{item.name}</strong><span>{item.description}</span><small>ベスト Lv.{highScores[recordKeyFor(globalDifficulty, item.id)] ?? 0}</small>
            </button>)}
          </div>
          <button type="button" className="game-sound-toggle" onClick={toggleSound} aria-pressed={soundOn}>
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
          <p className="game-live-message" aria-live="polite" aria-atomic="true">
            {gameState === "showing"
              ? "よく見て、音も聞いてね"
              : gameState === "input"
                ? "同じ順番でタップ！"
                : gameState === "success"
                  ? "ラウンドクリア！"
                  : "もう一度、順番を見てみよう"}
          </p>
          {sceneMessage ? <p className="game-live-message is-preview">{sceneMessage}</p> : null}
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{sequenceAnnouncement}</p>
          <div className="simon-grid">
            {PADS.map((pad) => {
              const Icon = pad.icon
              return <button key={pad.id} ref={(node) => { padRefs.current[pad.id] = node }} type="button" data-tone={pad.tone} className={activePad === pad.id ? "is-active" : ""} onClick={() => pressPad(pad.id)} disabled={gameState !== "input"} aria-label={`${pad.label}のパッド`}>
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
          <h3 ref={resultHeadingRef} tabIndex={-1}>レベル {level}</h3>
          <div className="game-result-stars" aria-label={`${stars}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= stars ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{sequence.length}個の順番まで覚えられたよ。次はもうひとつ先を目指そう！</p>
          <p>{simonResultCopy(level)}</p>
          <div className="game-result-record"><Trophy aria-hidden="true" /><span>{recordSaveFailed ? "保存ずみのベスト" : `${speed.name}のベスト`}</span><strong>Lv.{recordSaveFailed ? (highScores[recordKeyFor(runGlobalDifficulty, speedId)] ?? 0) : Math.max(level, highScores[recordKeyFor(runGlobalDifficulty, speedId)] ?? 0)}</strong></div>
          {recordSaveFailed ? <p role="status">今回の新記録は端末に保存できませんでした。</p> : null}
          <GamePrimaryButton onClick={startGame}><RotateCcw aria-hidden="true" />もう一度遊ぶ</GamePrimaryButton>
          <button type="button" className="game-secondary-button" onClick={returnToSetup}>速さを変える</button>
        </div>
      )}
    </GameShell>
  )
}
