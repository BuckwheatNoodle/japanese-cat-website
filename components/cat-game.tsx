"use client"

import type React from "react"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { Cat, Clock3, Heart, PawPrint, Play, RotateCcw, ShieldCheck, Sparkles, Star, Target, Timer, Trophy } from "lucide-react"
import { isFiniteNumberRecord, useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"
import { useProgression } from "@/components/progression-provider"
import { useSkin } from "@/components/skin-provider"
import { createEventId } from "@/lib/progression"

type GameState = "idle" | "countdown" | "playing" | "gameOver"
type TargetType = "tabby" | "white" | "black" | "dog" | "poop"
type DifficultyId = "easy" | "normal" | "speed"
type GlobalDifficulty = "gentle" | "standard" | "challenge"

type TargetItem = {
  id: number
  type: TargetType
  x: number
  y: number
  points: number
  image: string
  label: string
  createdAt: number
  lifespan: number
}

type FloatingScore = { id: number; text: string; x: number; y: number; positive: boolean }

const TARGET_RULES = {
  tabby: { points: 10, lifespan: 4600, label: "茶トラ猫" },
  white: { points: 30, lifespan: 3300, label: "白猫" },
  black: { points: 50, lifespan: 2300, label: "黒猫" },
  dog: { points: -20, lifespan: 3800, label: "わんちゃん" },
  poop: { points: 0, lifespan: 3800, label: "うんちになったなおくん" },
} satisfies Record<TargetType, { points: number; lifespan: number; label: string }>

const DIFFICULTIES = [
  { id: "easy", name: "ゆったり", duration: 30, spawn: 900, minSpawn: 520, description: "ゆっくり登場" },
  { id: "normal", name: "ふつう", duration: 20, spawn: 700, minSpawn: 360, description: "コンボを狙おう" },
  { id: "speed", name: "スピード", duration: 15, spawn: 470, minSpawn: 240, description: "どんどん登場" },
] as const

const durationMultiplierFor = (mode: GlobalDifficulty) => mode === "gentle" ? 1.8 : mode === "challenge" ? 0.85 : 1
const paceMultiplierFor = (mode: GlobalDifficulty) => mode === "gentle" ? 1.35 : mode === "challenge" ? 0.82 : 1
const lifespanMultiplierFor = (mode: GlobalDifficulty) => mode === "gentle" ? 2 : mode === "challenge" ? 0.85 : 1
const durationFor = (difficulty: (typeof DIFFICULTIES)[number], mode: GlobalDifficulty) => Math.max(12, Math.round(difficulty.duration * durationMultiplierFor(mode)))
const recordKeyFor = (mode: GlobalDifficulty, difficultyId: DifficultyId) => `${mode}:${difficultyId}`

export function CatGame() {
  const { skin } = useSkin()
  const { state, recordEvent } = useProgression()
  const [gameState, setGameState] = useState<GameState>("idle")
  const [difficultyId, setDifficultyId] = useState<DifficultyId>("normal")
  const [runDifficultyId, setRunDifficultyId] = useState<DifficultyId>("normal")
  const [runGlobalDifficulty, setRunGlobalDifficulty] = useState<GlobalDifficulty>("standard")
  const [countdown, setCountdown] = useState(3)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [rescued, setRescued] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [targets, setTargets] = useState<TargetItem[]>([])
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [highScores, setHighScores] = useLocalStorage<Record<string, number>>("catGameHighScoresV3", {}, isFiniteNumberRecord)
  const [recordSaveFailed, setRecordSaveFailed] = useState(false)

  const targetId = useRef(0)
  const floatingScoreId = useRef(0)
  const scoreRef = useRef(0)
  const rescuedRef = useRef(0)
  const comboRef = useRef(0)
  const gameStateRef = useRef<GameState>("idle")
  const completionEventIdRef = useRef<string | null>(null)
  const claimedTargetIdsRef = useRef(new Set<number>())
  const floatingScoreTimerRefs = useRef(new Set<number>())
  const focusFrameRef = useRef<number | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const keyboardRescueRef = useRef<HTMLButtonElement | null>(null)
  const setupHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const returningToSetupRef = useRef(false)
  const keyboardTargetAvailableRef = useRef(false)
  const [rescueAnnouncement, setRescueAnnouncement] = useState("")
  const difficulty = DIFFICULTIES.find((item) => item.id === difficultyId) ?? DIFFICULTIES[1]
  const playedDifficulty = DIFFICULTIES.find((item) => item.id === runDifficultyId) ?? DIFFICULTIES[1]
  const globalDifficulty = state.settings.difficulty as GlobalDifficulty
  const activeGlobalDifficulty = gameState === "idle" ? globalDifficulty : runGlobalDifficulty
  const activeDifficulty = gameState === "idle" ? difficulty : playedDifficulty
  const paceMultiplier = paceMultiplierFor(activeGlobalDifficulty)
  const lifespanMultiplier = lifespanMultiplierFor(activeGlobalDifficulty)
  const effectiveDuration = durationFor(activeDifficulty, activeGlobalDifficulty)
  const effectiveSpawn = Math.round(activeDifficulty.spawn * paceMultiplier)
  const effectiveMinSpawn = Math.round(activeDifficulty.minSpawn * paceMultiplier)
  const keyboardTarget = targets.find((item) => item.points > 0) ?? null
  const isKeyboardTargetAvailable = keyboardTarget !== null

  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { rescuedRef.current = rescued }, [rescued])

  useEffect(() => {
    if (gameState === "playing") focusFrameRef.current = window.requestAnimationFrame(() => keyboardRescueRef.current?.focus())
    if (gameState === "gameOver") focusFrameRef.current = window.requestAnimationFrame(() => resultHeadingRef.current?.focus())
    if (gameState === "idle" && returningToSetupRef.current) {
      returningToSetupRef.current = false
      focusFrameRef.current = window.requestAnimationFrame(() => setupHeadingRef.current?.focus())
    }
    return () => {
      if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
      focusFrameRef.current = null
    }
  }, [gameState])

  useEffect(() => () => {
    floatingScoreTimerRefs.current.forEach((timer) => window.clearTimeout(timer))
    floatingScoreTimerRefs.current.clear()
  }, [])

  useEffect(() => {
    if (gameState !== "playing") {
      keyboardTargetAvailableRef.current = false
      setRescueAnnouncement("")
      return
    }
    if (keyboardTargetAvailableRef.current === isKeyboardTargetAvailable) return
    keyboardTargetAvailableRef.current = isKeyboardTargetAvailable
    setRescueAnnouncement(isKeyboardTargetAvailable
      ? "猫を固定の救助ボタンで保護できます。"
      : "いま保護できる猫はいません。次の猫を待ってね。")
  }, [gameState, isKeyboardTargetAvailable])

  const prepareGame = () => {
    if (gameStateRef.current !== "idle" && gameStateRef.current !== "gameOver") return
    const nextDuration = durationFor(difficulty, globalDifficulty)
    gameStateRef.current = "countdown"
    completionEventIdRef.current = createEventId("game-rescue")
    claimedTargetIdsRef.current.clear()
    floatingScoreTimerRefs.current.forEach((timer) => window.clearTimeout(timer))
    floatingScoreTimerRefs.current.clear()
    scoreRef.current = 0
    rescuedRef.current = 0
    comboRef.current = 0
    setRunDifficultyId(difficultyId)
    setRunGlobalDifficulty(globalDifficulty)
    setScore(0)
    setCombo(0)
    setBestCombo(0)
    setRescued(0)
    setMistakes(0)
    setTargets([])
    setFloatingScores([])
    setRecordSaveFailed(false)
    setTimeLeft(nextDuration)
    setCountdown(3)
    setGameState("countdown")
  }

  useEffect(() => {
    if (gameState !== "countdown") return
    if (countdown <= 0) {
      gameStateRef.current = "playing"
      setGameState("playing")
      return
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 720)
    return () => window.clearTimeout(timer)
  }, [countdown, gameState])

  const spawnTarget = useCallback(() => {
    const random = Math.random()
    const type: TargetType = random < 0.08 ? "dog" : random < 0.16 ? "poop" : random < 0.23 ? "black" : random < 0.43 ? "white" : "tabby"
    const config = TARGET_RULES[type]
    setTargets((current) => [
      ...current.slice(-7),
      {
        id: targetId.current++,
        type,
        ...config,
        lifespan: Math.round(config.lifespan * lifespanMultiplier),
        image: skin.assets.gameSprites[type],
        x: 15 + Math.random() * 70,
        y: 10 + Math.random() * 72,
        createdAt: Date.now(),
      },
    ])
  }, [lifespanMultiplier, skin.assets.gameSprites])

  useEffect(() => {
    if (gameState !== "playing") return
    let timeoutId = 0
    const schedule = () => {
      const rate = Math.max(effectiveMinSpawn, effectiveSpawn - Math.max(0, scoreRef.current) / 3)
      timeoutId = window.setTimeout(() => { spawnTarget(); schedule() }, rate)
    }
    spawnTarget()
    schedule()
    return () => window.clearTimeout(timeoutId)
  }, [effectiveMinSpawn, effectiveSpawn, gameState, spawnTarget])

  useEffect(() => {
    if (gameState !== "playing") return
    if (timeLeft <= 0) {
      gameStateRef.current = "gameOver"
      const eventId = completionEventIdRef.current
      if (eventId) {
        completionEventIdRef.current = null
        recordEvent({
          type: "game.completed",
          eventId,
          occurredAt: new Date().toISOString(),
          gameId: "rescue",
          score: scoreRef.current,
          won: rescuedRef.current > 0,
        })
      }
      setTargets([])
      floatingScoreTimerRefs.current.forEach((timer) => window.clearTimeout(timer))
      floatingScoreTimerRefs.current.clear()
      setFloatingScores([])
      setGameState("gameOver")
      return
    }
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) gameStateRef.current = "gameOver"
      setTimeLeft((value) => value - 1)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [gameState, recordEvent, timeLeft])

  useEffect(() => {
    if (gameState !== "playing") return
    const timer = window.setInterval(() => {
      const now = Date.now()
      setTargets((current) => current.filter((item) => now < item.createdAt + item.lifespan))
    }, 180)
    return () => window.clearInterval(timer)
  }, [gameState])

  useEffect(() => {
    const recordKey = recordKeyFor(runGlobalDifficulty, runDifficultyId)
    if (gameState === "gameOver" && score > (highScores[recordKey] ?? 0)) {
      setRecordSaveFailed(!setHighScores({ ...highScores, [recordKey]: score }))
    }
  }, [gameState, highScores, runDifficultyId, runGlobalDifficulty, score, setHighScores])

  const hitTarget = (item: TargetItem, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (gameStateRef.current !== "playing" || claimedTargetIdsRef.current.has(item.id)) return
    claimedTargetIdsRef.current.add(item.id)
    const isCat = item.points > 0
    const nextCombo = isCat ? comboRef.current + 1 : 0
    comboRef.current = nextCombo
    const multiplier = isCat ? Math.min(3, 1 + Math.floor(nextCombo / 4)) : 1
    const earned = item.points * multiplier
    const area = stageRef.current?.getBoundingClientRect()
    const target = event?.currentTarget.closest(".rescue-stage") ? event.currentTarget.getBoundingClientRect() : null
    const hasPointerCoordinates = Boolean(event && (event.clientX !== 0 || event.clientY !== 0) && area)

    const nextScore = Math.max(0, scoreRef.current + earned)
    scoreRef.current = nextScore
    setScore(nextScore)
    setTargets((current) => current.filter((target) => target.id !== item.id))
    setCombo(nextCombo)
    setBestCombo((value) => Math.max(value, nextCombo))
    if (isCat) {
      const nextRescued = rescuedRef.current + 1
      rescuedRef.current = nextRescued
      setRescued(nextRescued)
    }
    else setMistakes((value) => value + 1)

    const feedback: FloatingScore = {
      id: floatingScoreId.current++,
      text: `${earned > 0 ? "+" : ""}${earned}${multiplier > 1 ? ` ×${multiplier}` : ""}`,
      positive: earned > 0,
      x: hasPointerCoordinates && event
        ? event.clientX - (area?.left ?? 0)
        : target
          ? target.left + target.width / 2 - (area?.left ?? 0)
          : (area?.width ?? 0) / 2,
      y: hasPointerCoordinates && event
        ? event.clientY - (area?.top ?? 0)
        : target
          ? target.top + target.height / 2 - (area?.top ?? 0)
          : (area?.height ?? 0) / 2,
    }
    setFloatingScores((current) => [...current, feedback])
    const feedbackTimer = window.setTimeout(() => {
      setFloatingScores((current) => current.filter((entry) => entry.id !== feedback.id))
      floatingScoreTimerRefs.current.delete(feedbackTimer)
    }, 850)
    floatingScoreTimerRefs.current.add(feedbackTimer)
  }

  const rating = score >= 650 ? 3 : score >= 320 ? 2 : 1
  const returnToSetup = () => {
    returningToSetupRef.current = true
    gameStateRef.current = "idle"
    setGameState("idle")
  }

  return (
    <GameShell title="保護ねこゲーム" subtitle="猫だけをすばやくタップ。連続成功でコンボ倍率アップ！" icon={PawPrint} tone="coral">
      {gameState === "idle" && (
        <div className="game-start-view">
          <div className="game-intro-mark"><ShieldCheck aria-hidden="true" /></div>
          <h3 ref={setupHeadingRef} tabIndex={-1}>レスキュー隊の準備はいい？</h3>
          <p>茶トラ・白猫・黒猫をタップして保護しよう。わんちゃんはそっと見送り、うんちになったなおくんは応援係として見守ってね。</p>
          <div className="game-difficulty-grid" aria-label="むずかしさを選ぶ">
            {DIFFICULTIES.map((item) => (
              <button key={item.id} type="button" className={difficultyId === item.id ? "is-selected" : ""} onClick={() => setDifficultyId(item.id)} aria-pressed={difficultyId === item.id}>
                <strong>{item.name}</strong><span>{durationFor(item, globalDifficulty)}秒・{item.description}</span><small>ベスト {highScores[recordKeyFor(globalDifficulty, item.id)] ?? 0}点</small>
              </button>
            ))}
          </div>
          <div className="rescue-legend">
            <span><Cat aria-hidden="true" />猫は得点</span><span><Target aria-hidden="true" />4連続で×2</span><span><Heart aria-hidden="true" />なおくんは応援係</span>
          </div>
          <GamePrimaryButton onClick={prepareGame}><Play aria-hidden="true" />このモードで始める</GamePrimaryButton>
        </div>
      )}

      {gameState === "countdown" && (
        <>
          <div className="game-countdown" aria-hidden="true"><span>{countdown || "GO!"}</span><p>猫だけをタップしてね</p></div>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {countdown === 3 ? "3秒後にゲームが始まります。猫だけをタップしてね。" : countdown === 0 ? "ゲームスタート！" : ""}
          </p>
        </>
      )}

      {gameState === "playing" && (
        <div className="rescue-game-view">
          <div className="game-stats-row">
            <GameStat icon={Heart} label="スコア" value={`${score}点`} />
            <GameStat icon={Sparkles} label="コンボ" value={`${combo}回`} />
            <GameStat icon={Timer} label="のこり" value={`${timeLeft}秒`} />
          </div>
          <div className="game-time-track" aria-hidden="true"><span style={{ width: `${(timeLeft / effectiveDuration) * 100}%` }} /></div>
          <div className="rescue-keyboard-control">
            <button
              ref={keyboardRescueRef}
              type="button"
              className="rescue-keyboard-button"
              aria-disabled={!keyboardTarget}
              onClick={() => keyboardTarget && hitTarget(keyboardTarget)}
              aria-describedby="rescue-keyboard-status"
            >
              <ShieldCheck aria-hidden="true" />
              {keyboardTarget ? `${keyboardTarget.label}を固定ボタンで保護` : "猫を待っています"}
            </button>
            <span id="rescue-keyboard-status" className="sr-only" role="status" aria-live="polite" aria-atomic="true">{rescueAnnouncement}</span>
          </div>
          <div ref={stageRef} className="rescue-stage" aria-label="猫を保護するゲームエリア">
            {targets.map((item) => item.type === "poop" ? (
              <span
                key={item.id}
                role="img"
                data-kind={item.type}
                className="rescue-target"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                aria-label={`${item.label}。猫たちの応援係なので、タップせず見守ろう`}
              >
                <Image src={item.image} alt="" width={70} height={70} draggable={false} />
                <small aria-hidden="true">応援</small>
              </span>
            ) : (
              <button
                key={item.id}
                type="button"
                tabIndex={-1}
                data-kind={item.type}
                className="rescue-target"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                onClick={(event) => hitTarget(item, event)}
                aria-label={`${item.label}${item.points > 0 ? `を保護、${item.points}点` : "、タップすると20点減点"}`}
              >
                <Image src={item.image} alt="" width={70} height={70} draggable={false} />
                {item.points >= 30 && <small>{item.points}</small>}
              </button>
            ))}
            <div aria-hidden="true">
              {floatingScores.map((entry) => <span key={entry.id} className={`rescue-feedback ${entry.positive ? "is-positive" : "is-negative"}`} style={{ left: entry.x, top: entry.y }}>{entry.text}</span>)}
            </div>
            <div className="rescue-stage-hint" aria-hidden="true">猫をタップ！</div>
          </div>
        </div>
      )}

      {gameState === "gameOver" && (
        <div className="game-result-view">
          <Trophy className="game-result-trophy" aria-hidden="true" />
          <p className="game-result-kicker">レスキュー完了！</p>
          <h3 ref={resultHeadingRef} tabIndex={-1}>{score}点</h3>
          <div className="game-result-stars" aria-label={`${rating}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= rating ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{rescued}匹を保護・ベストコンボ{bestCombo}回{mistakes > 0 ? `・見送りミス${mistakes}回` : "・ノーミス！"}</p>
          <div className="game-result-record"><Clock3 aria-hidden="true" /><span>{recordSaveFailed ? "保存ずみのベスト" : `${playedDifficulty.name}のベスト`}</span><strong>{recordSaveFailed ? (highScores[recordKeyFor(runGlobalDifficulty, runDifficultyId)] ?? 0) : Math.max(score, highScores[recordKeyFor(runGlobalDifficulty, runDifficultyId)] ?? 0)}点</strong></div>
          {recordSaveFailed ? <p role="status">今回の新記録は端末に保存できませんでした。</p> : null}
          <GamePrimaryButton onClick={prepareGame}><RotateCcw aria-hidden="true" />もう一度遊ぶ</GamePrimaryButton>
          <button type="button" className="game-secondary-button" onClick={returnToSetup}>むずかしさを変える</button>
        </div>
      )}
    </GameShell>
  )
}
