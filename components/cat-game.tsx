"use client"

import type React from "react"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { Cat, Clock3, Heart, PawPrint, Play, RotateCcw, ShieldCheck, Sparkles, Star, Target, Timer, Trophy } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"
import { useSkin } from "@/components/skin-provider"

type GameState = "idle" | "countdown" | "playing" | "gameOver"
type TargetType = "tabby" | "white" | "black" | "dog" | "poop"
type DifficultyId = "easy" | "normal" | "speed"

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
  poop: { points: -40, lifespan: 3800, label: "うんち" },
} satisfies Record<TargetType, { points: number; lifespan: number; label: string }>

const DIFFICULTIES = [
  { id: "easy", name: "ゆったり", duration: 30, spawn: 900, minSpawn: 520, description: "30秒・ゆっくり登場" },
  { id: "normal", name: "ふつう", duration: 20, spawn: 700, minSpawn: 360, description: "20秒・コンボを狙おう" },
  { id: "speed", name: "スピード", duration: 15, spawn: 470, minSpawn: 240, description: "15秒・どんどん登場" },
] as const

export function CatGame() {
  const { skin } = useSkin()
  const [gameState, setGameState] = useState<GameState>("idle")
  const [difficultyId, setDifficultyId] = useState<DifficultyId>("normal")
  const [countdown, setCountdown] = useState(3)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [rescued, setRescued] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [targets, setTargets] = useState<TargetItem[]>([])
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [highScores, setHighScores] = useLocalStorage<Record<DifficultyId, number>>("catGameHighScoresV2", { easy: 0, normal: 0, speed: 0 })

  const targetId = useRef(0)
  const scoreRef = useRef(0)
  const difficulty = DIFFICULTIES.find((item) => item.id === difficultyId) ?? DIFFICULTIES[1]

  useEffect(() => { scoreRef.current = score }, [score])

  const prepareGame = () => {
    setScore(0)
    setCombo(0)
    setBestCombo(0)
    setRescued(0)
    setMistakes(0)
    setTargets([])
    setFloatingScores([])
    setTimeLeft(difficulty.duration)
    setCountdown(3)
    setGameState("countdown")
  }

  useEffect(() => {
    if (gameState !== "countdown") return
    if (countdown <= 0) {
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
        image: skin.assets.gameSprites[type],
        x: 4 + Math.random() * 78,
        y: 7 + Math.random() * 70,
        createdAt: Date.now(),
      },
    ])
  }, [skin.assets.gameSprites])

  useEffect(() => {
    if (gameState !== "playing") return
    let timeoutId = 0
    const schedule = () => {
      const rate = Math.max(difficulty.minSpawn, difficulty.spawn - Math.max(0, scoreRef.current) / 3)
      timeoutId = window.setTimeout(() => { spawnTarget(); schedule() }, rate)
    }
    spawnTarget()
    schedule()
    return () => window.clearTimeout(timeoutId)
  }, [difficulty.minSpawn, difficulty.spawn, gameState, spawnTarget])

  useEffect(() => {
    if (gameState !== "playing") return
    if (timeLeft <= 0) {
      setTargets([])
      setGameState("gameOver")
      return
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState !== "playing") return
    const timer = window.setInterval(() => {
      const now = Date.now()
      setTargets((current) => current.filter((item) => now < item.createdAt + item.lifespan))
    }, 180)
    return () => window.clearInterval(timer)
  }, [gameState])

  useEffect(() => {
    if (gameState === "gameOver" && score > (highScores[difficultyId] ?? 0)) {
      setHighScores({ ...highScores, [difficultyId]: score })
    }
  }, [difficultyId, gameState, highScores, score, setHighScores])

  const hitTarget = (item: TargetItem, event: React.PointerEvent<HTMLButtonElement>) => {
    const isCat = item.points > 0
    const nextCombo = isCat ? combo + 1 : 0
    const multiplier = isCat ? Math.min(3, 1 + Math.floor(nextCombo / 4)) : 1
    const earned = item.points * multiplier
    const area = event.currentTarget.parentElement?.getBoundingClientRect()

    setScore((value) => Math.max(0, value + earned))
    setTargets((current) => current.filter((target) => target.id !== item.id))
    setCombo(nextCombo)
    setBestCombo((value) => Math.max(value, nextCombo))
    if (isCat) setRescued((value) => value + 1)
    else setMistakes((value) => value + 1)

    const feedback: FloatingScore = {
      id: Date.now() + item.id,
      text: `${earned > 0 ? "+" : ""}${earned}${multiplier > 1 ? ` ×${multiplier}` : ""}`,
      positive: earned > 0,
      x: event.clientX - (area?.left ?? 0),
      y: event.clientY - (area?.top ?? 0),
    }
    setFloatingScores((current) => [...current, feedback])
    window.setTimeout(() => setFloatingScores((current) => current.filter((entry) => entry.id !== feedback.id)), 850)
  }

  const rating = score >= 650 ? 3 : score >= 320 ? 2 : 1

  return (
    <GameShell title="保護ねこゲーム" subtitle="猫だけをすばやくタップ。連続成功でコンボ倍率アップ！" icon={PawPrint} tone="coral">
      {gameState === "idle" && (
        <div className="game-start-view">
          <div className="game-intro-mark"><ShieldCheck aria-hidden="true" /></div>
          <h3>レスキュー隊の準備はいい？</h3>
          <p>茶トラ・白猫・黒猫をタップして保護しよう。わんちゃんとうんちは、そっと見送ってね。</p>
          <div className="game-difficulty-grid" aria-label="むずかしさを選ぶ">
            {DIFFICULTIES.map((item) => (
              <button key={item.id} type="button" className={difficultyId === item.id ? "is-selected" : ""} onClick={() => setDifficultyId(item.id)} aria-pressed={difficultyId === item.id}>
                <strong>{item.name}</strong><span>{item.description}</span><small>ベスト {highScores[item.id] ?? 0}点</small>
              </button>
            ))}
          </div>
          <div className="rescue-legend">
            <span><Cat aria-hidden="true" />猫は得点</span><span><Target aria-hidden="true" />4連続で×2</span><span><Heart aria-hidden="true" />ミスしても続行</span>
          </div>
          <GamePrimaryButton onClick={prepareGame}><Play aria-hidden="true" />このモードで始める</GamePrimaryButton>
        </div>
      )}

      {gameState === "countdown" && (
        <div className="game-countdown" aria-live="assertive"><span>{countdown || "GO!"}</span><p>猫だけをタップしてね</p></div>
      )}

      {gameState === "playing" && (
        <div className="rescue-game-view">
          <div className="game-stats-row">
            <GameStat icon={Heart} label="スコア" value={`${score}点`} />
            <GameStat icon={Sparkles} label="コンボ" value={`${combo}回`} />
            <GameStat icon={Timer} label="のこり" value={`${timeLeft}秒`} />
          </div>
          <div className="game-time-track" aria-hidden="true"><span style={{ width: `${(timeLeft / difficulty.duration) * 100}%` }} /></div>
          <div className="rescue-stage" aria-label="猫を保護するゲームエリア">
            {targets.map((item) => (
              <button key={item.id} type="button" data-kind={item.type} className="rescue-target" style={{ left: `${item.x}%`, top: `${item.y}%` }} onPointerDown={(event) => hitTarget(item, event)} aria-label={`${item.label}${item.points > 0 ? `、${item.points}点` : "、タップしない"}`}>
                <Image src={item.image} alt="" width={70} height={70} draggable={false} />
                {item.points >= 30 && <small>{item.points}</small>}
              </button>
            ))}
            {floatingScores.map((entry) => <span key={entry.id} className={`rescue-feedback ${entry.positive ? "is-positive" : "is-negative"}`} style={{ left: entry.x, top: entry.y }}>{entry.text}</span>)}
            <div className="rescue-stage-hint">猫をタップ！</div>
          </div>
        </div>
      )}

      {gameState === "gameOver" && (
        <div className="game-result-view">
          <Trophy className="game-result-trophy" aria-hidden="true" />
          <p className="game-result-kicker">レスキュー完了！</p>
          <h3>{score}点</h3>
          <div className="game-result-stars" aria-label={`${rating}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= rating ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{rescued}匹を保護・ベストコンボ{bestCombo}回{mistakes > 0 ? `・見送りミス${mistakes}回` : "・ノーミス！"}</p>
          <div className="game-result-record"><Clock3 aria-hidden="true" /><span>{difficulty.name}のベスト</span><strong>{Math.max(score, highScores[difficultyId] ?? 0)}点</strong></div>
          <GamePrimaryButton onClick={prepareGame}><RotateCcw aria-hidden="true" />もう一度遊ぶ</GamePrimaryButton>
          <button type="button" className="game-secondary-button" onClick={() => setGameState("idle")}>むずかしさを変える</button>
        </div>
      )}
    </GameShell>
  )
}
