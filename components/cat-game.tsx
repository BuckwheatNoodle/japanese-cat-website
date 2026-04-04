"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { assetPath } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, Heart, Play, RotateCcw, Timer, Trophy } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

// ゲームの状態
type GameState = "idle" | "playing" | "gameOver"

// ターゲットのキャラクター情報
type TargetType = "tabby" | "white" | "black" | "dog" | "poop"
type Target = {
  id: number
  type: TargetType
  x: number
  y: number
  points: number
  image: string
  createdAt: number
  lifespan: number
}

// フローティングスコアの表示用
type FloatingScore = {
  id: number
  points: number
  x: number
  y: number
}

const GAME_DURATION = 20

const TARGET_CONFIG = {
  tabby: { points: 10, image: assetPath("/cute-tabby-sitting.png"), lifespan: 5000 },
  white: { points: 30, image: assetPath("/white-cat.png"), lifespan: 3500 },
  black: { points: 50, image: assetPath("/black-cat.png"), lifespan: 2500 },
  dog: { points: -20, image: assetPath("/dog.png"), lifespan: 4000 },
  poop: { points: -50, image: assetPath("/poop-icon.png"), lifespan: 4000 },
}

const TARGET_SIZE = 64

export function CatGame() {
  const [gameState, setGameState] = useState<GameState>("idle")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [targets, setTargets] = useState<Target[]>([])
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [highScore, setHighScore] = useLocalStorage("catGameHighScore", 0)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const targetIdCounter = useRef(0)
  const scoreRef = useRef(score)
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  // ゲーム開始
  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setTargets([])
    setFloatingScores([])
  }

  const spawnTarget = useCallback(() => {
    if (!gameAreaRef.current) return
    const rand = Math.random()
    let type: TargetType
    if (rand < 0.1)
      type = "dog" // 10%
    else if (rand < 0.2)
      type = "poop" // 10%
    else if (rand < 0.25)
      type = "black" // 5%
    else if (rand < 0.45)
      type = "white" // 20%
    else type = "tabby" // 55%

    const config = TARGET_CONFIG[type]
    const newTarget: Target = {
      id: targetIdCounter.current++,
      type,
      ...config,
      x: Math.random() * (gameAreaRef.current.offsetWidth - TARGET_SIZE),
      y: Math.random() * (gameAreaRef.current.offsetHeight - TARGET_SIZE),
      createdAt: Date.now(),
    }
    setTargets((prev) => [...prev, newTarget])
  }, [])

  // ターゲットクリック時の処理
  const handleTargetClick = (target: Target, e: React.MouseEvent) => {
    setScore((prev) => prev + target.points)
    setTargets((prev) => prev.filter((t) => t.id !== target.id))

    // フローティングスコア表示
    const newFloatingScore: FloatingScore = {
      id: Date.now(),
      points: target.points,
      x: e.clientX - (gameAreaRef.current?.getBoundingClientRect().left || 0),
      y: e.clientY - (gameAreaRef.current?.getBoundingClientRect().top || 0),
    }
    setFloatingScores((prev) => [...prev, newFloatingScore])
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((fs) => fs.id !== newFloatingScore.id))
    }, 1000)
  }

  // ゲームの制限時間タイマー
  useEffect(() => {
    if (gameState !== "playing") return
    if (timeLeft <= 0) {
      setGameState("gameOver")
      return
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [gameState, timeLeft])

  // ターゲットの出現を管理するタイマー
  useEffect(() => {
    if (gameState !== "playing") return

    let timeoutId: NodeJS.Timeout
    const scheduleSpawn = () => {
      const spawnRate = 1000 - scoreRef.current / 10
      timeoutId = setTimeout(
        () => {
          spawnTarget()
          scheduleSpawn()
        },
        Math.max(spawnRate, 300),
      )
    }

    scheduleSpawn()

    return () => clearTimeout(timeoutId)
  }, [gameState, spawnTarget])

  // ターゲットの寿命を管理するタイマー
  useEffect(() => {
    if (gameState !== "playing") return
    const interval = setInterval(() => {
      const now = Date.now()
      setTargets((prevTargets) => prevTargets.filter((t) => now < t.createdAt + t.lifespan))
    }, 200)
    return () => clearInterval(interval)
  }, [gameState])

  useEffect(() => {
    if (gameState === "gameOver" && score > highScore) {
      setHighScore(score)
    }
  }, [gameState, score, highScore, setHighScore])

  const renderGameContent = () => {
    switch (gameState) {
      case "gameOver":
        return (
          <div className="text-center space-y-4 flex flex-col items-center">
            <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
            <h3 className="text-xl md:text-2xl font-bold">ゲームオーバー！</h3>
            <p className="text-3xl md:text-4xl font-bold">{score}点</p>
            <p className="text-lg">ハイスコア: {highScore}点</p>
            <Button onClick={startGame} className="bg-[#D4A57A] hover:bg-[#C7946A] text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              もう一度プレイ
            </Button>
          </div>
        )
      case "playing":
        return (
          <div className="w-full flex flex-col items-center space-y-2">
            <div className="flex items-center justify-between w-full px-2 md:px-4 text-base md:text-lg font-bold">
              <div className="flex items-center space-x-2">
                <Heart className="text-red-500" />
                <span>{score}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="text-blue-500" />
                <span>{timeLeft}</span>
              </div>
            </div>
            <div
              ref={gameAreaRef}
              className="w-full h-80 md:h-96 bg-[#FDEEDC]/50 rounded-lg relative overflow-hidden border-2 border-[#EAD8C0] cursor-pointer"
            >
              {targets.map((target) => (
                <button
                  key={target.id}
                  onClick={(e) => handleTargetClick(target, e)}
                  className="absolute transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none animate-fade-in"
                  style={{ top: `${target.y}px`, left: `${target.x}px` }}
                >
                  <Image
                    src={target.image || assetPath("/placeholder.svg")}
                    alt={target.type}
                    width={TARGET_SIZE}
                    height={TARGET_SIZE}
                    className="rounded-full object-cover"
                  />
                </button>
              ))}
              {floatingScores.map((fs) => (
                <div
                  key={fs.id}
                  className={`absolute font-bold text-xl md:text-2xl pointer-events-none animate-float-up ${
                    fs.points > 0 ? "text-green-500" : "text-red-500"
                  }`}
                  style={{ top: `${fs.y}px`, left: `${fs.x}px` }}
                >
                  {fs.points > 0 ? `+${fs.points}` : fs.points}
                </div>
              ))}
            </div>
          </div>
        )
      case "idle":
      default:
        return (
          <div className="text-center space-y-4">
            <h3 className="text-lg md:text-xl font-bold">にゃんこレスキュー！</h3>
            <p className="text-sm md:text-base">
              20秒以内にできるだけ多くの猫を保護しよう！
              <br />
              犬やうんちには気をつけて！
            </p>
            <p className="font-bold">ハイスコア: {highScore}点</p>
            <Button onClick={startGame} className="bg-[#D4A57A] hover:bg-[#C7946A] text-white">
              <Play className="w-4 h-4 mr-2" />
              ゲーム開始
            </Button>
          </div>
        )
    }
  }

  return (
    <section className="w-full">
      <Card className="bg-white/80 border-2 border-dashed border-[#EAD8C0]/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardHeader className="bg-[#FDEEDC]/60 rounded-t-lg">
          <CardTitle className="flex items-center justify-center text-xl md:text-2xl space-x-2">
            <PawPrint className="w-5 h-5 md:w-6 md:h-6" />
            <span>保護ねこゲーム</span>
            <PawPrint className="w-5 h-5 md:w-6 md:h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[28rem] md:min-h-[32rem] p-2 md:p-6">
          {renderGameContent()}
        </CardContent>
      </Card>
    </section>
  )
}
