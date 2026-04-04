"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Play, RotateCcw, Trophy, Timer } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type MemoryGameState = "idle" | "playing" | "finished"

type MemoryCard = {
  id: number
  emoji: string
  label: string
  isFlipped: boolean
  isMatched: boolean
}

const CAT_PAIRS = [
  { emoji: "🐱", label: "ねこ" },
  { emoji: "🐈", label: "あるくねこ" },
  { emoji: "🐈‍⬛", label: "くろねこ" },
  { emoji: "😺", label: "にっこりねこ" },
  { emoji: "😻", label: "ハートねこ" },
  { emoji: "🙀", label: "びっくりねこ" },
  { emoji: "😸", label: "えがおねこ" },
  { emoji: "😹", label: "なみだねこ" },
  { emoji: "😽", label: "キスねこ" },
  { emoji: "😼", label: "にやりねこ" },
  { emoji: "🐾", label: "にくきゅう" },
  { emoji: "🐟", label: "おさかな" },
]

type Difficulty = { name: string; pairs: number; cols: string }
const DIFFICULTIES: Difficulty[] = [
  { name: "かんたん", pairs: 6, cols: "grid-cols-4" },
  { name: "ふつう", pairs: 8, cols: "grid-cols-4" },
  { name: "むずかしい", pairs: 12, cols: "grid-cols-6" },
]

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function CatMemoryGame() {
  const [gameState, setGameState] = useState<MemoryGameState>("idle")
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0])
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matchedCount, setMatchedCount] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [bestScores, setBestScores] = useLocalStorage<Record<string, number>>("catMemoryBestScores", {})
  const lockRef = useRef(false)

  const bestScore = bestScores[difficulty.name] ?? Infinity

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff)
    const selected = shuffleArray(CAT_PAIRS).slice(0, diff.pairs)
    const doubled = selected.flatMap((p, i) => [
      { id: i * 2, emoji: p.emoji, label: p.label, isFlipped: false, isMatched: false },
      { id: i * 2 + 1, emoji: p.emoji, label: p.label, isFlipped: false, isMatched: false },
    ])
    setCards(shuffleArray(doubled))
    setFlippedIds([])
    setMoves(0)
    setMatchedCount(0)
    setElapsedTime(0)
    setGameState("playing")
    lockRef.current = false
  }

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return
    const interval = setInterval(() => setElapsedTime((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [gameState])

  const handleCardClick = (id: number) => {
    if (lockRef.current) return
    if (gameState !== "playing") return

    const card = cards.find((c) => c.id === id)
    if (!card || card.isFlipped || card.isMatched) return

    const newFlipped = [...flippedIds, id]
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)))
    setFlippedIds(newFlipped)

    if (newFlipped.length === 2) {
      lockRef.current = true
      setMoves((m) => m + 1)
      const [firstId, secondId] = newFlipped
      const first = cards.find((c) => c.id === firstId)!
      const second = cards.find((c) => c.id === secondId)!

      if (first.emoji === second.emoji) {
        // Match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)),
          )
          setFlippedIds([])
          setMatchedCount((mc) => {
            const next = mc + 1
            if (next === cards.length / 2) {
              // game complete - will be handled by effect
            }
            return next
          })
          lockRef.current = false
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c)),
          )
          setFlippedIds([])
          lockRef.current = false
        }, 800)
      }
    }
  }

  // Check for game completion
  useEffect(() => {
    if (gameState === "playing" && cards.length > 0 && matchedCount === cards.length / 2) {
      setGameState("finished")
      if (moves < bestScore) {
        setBestScores({ ...bestScores, [difficulty.name]: moves })
      }
    }
  }, [matchedCount, cards.length, gameState, moves, bestScore, bestScores, setBestScores, difficulty.name])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  const renderContent = () => {
    if (gameState === "finished") {
      return (
        <div className="text-center space-y-4 flex flex-col items-center">
          <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
          <h3 className="text-xl md:text-2xl font-bold">クリア！</h3>
          <p className="text-2xl font-bold">{moves}手 / {formatTime(elapsedTime)}</p>
          <p className="text-lg">
            ベストスコア（{difficulty.name}）: {bestScores[difficulty.name] ?? "-"}手
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button onClick={() => startGame(difficulty)} className="bg-[#D4A57A] hover:bg-[#C7946A] text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              もう一度
            </Button>
            <Button
              onClick={() => setGameState("idle")}
              variant="outline"
              className="bg-white hover:bg-[#FDEEDC] border-[#EAD8C0]"
            >
              難易度を変える
            </Button>
          </div>
        </div>
      )
    }

    if (gameState === "playing") {
      return (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between px-2 font-bold text-base md:text-lg">
            <span>手数: {moves}</span>
            <span className="flex items-center gap-1">
              <Timer className="w-4 h-4 text-blue-500" />
              {formatTime(elapsedTime)}
            </span>
            <span>残り: {cards.length / 2 - matchedCount}組</span>
          </div>
          <div className={`grid ${difficulty.cols} gap-2 md:gap-3 mx-auto max-w-lg`}>
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-xl text-3xl md:text-4xl flex items-center justify-center transition-all duration-300 transform ${
                  card.isMatched
                    ? "bg-green-100 border-2 border-green-300 scale-95 opacity-70"
                    : card.isFlipped
                      ? "bg-white border-2 border-[#D4A57A] scale-105 shadow-md"
                      : "bg-[#D4A57A] border-2 border-[#C7946A] hover:scale-105 hover:shadow-md cursor-pointer"
                }`}
                disabled={card.isFlipped || card.isMatched}
              >
                {card.isFlipped || card.isMatched ? (
                  <span className="animate-fade-in">{card.emoji}</span>
                ) : (
                  <span className="text-white text-2xl">?</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )
    }

    // idle
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg md:text-xl font-bold">にゃんこ神経衰弱</h3>
        <p className="text-sm md:text-base">
          カードをめくって同じ猫の絵柄ペアを見つけよう！
          <br />
          少ない手数でクリアを目指そう。
        </p>
        <div className="flex flex-col gap-3 items-center">
          {DIFFICULTIES.map((diff) => (
            <Button
              key={diff.name}
              onClick={() => startGame(diff)}
              className="w-48 bg-[#D4A57A] hover:bg-[#C7946A] text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {diff.name}（{diff.pairs}組）
              {bestScores[diff.name] != null && (
                <span className="ml-2 text-xs opacity-80">Best: {bestScores[diff.name]}手</span>
              )}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="w-full">
      <Card className="bg-white/80 border-2 border-dashed border-[#EAD8C0]/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardHeader className="bg-[#FDEEDC]/60 rounded-t-lg">
          <CardTitle className="flex items-center justify-center text-xl md:text-2xl space-x-2">
            <Layers className="w-5 h-5 md:w-6 md:h-6" />
            <span>にゃんこ神経衰弱</span>
            <Layers className="w-5 h-5 md:w-6 md:h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[28rem] md:min-h-[32rem] p-4 md:p-6">
          {renderContent()}
        </CardContent>
      </Card>
    </section>
  )
}
