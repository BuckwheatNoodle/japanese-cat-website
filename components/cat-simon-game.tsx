"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Play, RotateCcw, Trophy } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type SimonGameState = "idle" | "showing" | "input" | "success" | "gameover"

type PadColor = {
  id: number
  color: string
  activeColor: string
  emoji: string
  label: string
}

const PADS: PadColor[] = [
  { id: 0, color: "bg-red-300", activeColor: "bg-red-500", emoji: "😺", label: "あか" },
  { id: 1, color: "bg-blue-300", activeColor: "bg-blue-500", emoji: "😸", label: "あお" },
  { id: 2, color: "bg-yellow-300", activeColor: "bg-yellow-500", emoji: "😻", label: "きいろ" },
  { id: 3, color: "bg-green-300", activeColor: "bg-green-500", emoji: "😽", label: "みどり" },
]

const SHOW_INTERVAL = 600
const SHOW_PAUSE = 300

export function CatSimonGame() {
  const [gameState, setGameState] = useState<SimonGameState>("idle")
  const [sequence, setSequence] = useState<number[]>([])
  const [inputIndex, setInputIndex] = useState(0)
  const [activePad, setActivePad] = useState<number | null>(null)
  const [level, setLevel] = useState(0)
  const [highScore, setHighScore] = useLocalStorage("catSimonHighScore", 0)
  const [flashWrong, setFlashWrong] = useState<number | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const playSequence = useCallback((seq: number[]) => {
    setGameState("showing")
    setActivePad(null)
    let i = 0

    const showNext = () => {
      if (i >= seq.length) {
        setActivePad(null)
        timeoutRef.current = setTimeout(() => {
          setGameState("input")
          setInputIndex(0)
        }, SHOW_PAUSE)
        return
      }

      setActivePad(seq[i])
      timeoutRef.current = setTimeout(() => {
        setActivePad(null)
        timeoutRef.current = setTimeout(() => {
          i++
          showNext()
        }, SHOW_PAUSE)
      }, SHOW_INTERVAL)
    }

    timeoutRef.current = setTimeout(showNext, 500)
  }, [])

  const startGame = () => {
    clearTimeouts()
    const firstPad = Math.floor(Math.random() * 4)
    const newSeq = [firstPad]
    setSequence(newSeq)
    setLevel(1)
    setInputIndex(0)
    setFlashWrong(null)
    playSequence(newSeq)
  }

  const advanceLevel = useCallback(() => {
    setGameState("success")
    const nextPad = Math.floor(Math.random() * 4)
    const newSeq = [...sequence, nextPad]

    timeoutRef.current = setTimeout(() => {
      setSequence(newSeq)
      setLevel((l) => l + 1)
      setInputIndex(0)
      playSequence(newSeq)
    }, 800)
  }, [sequence, playSequence])

  const handlePadClick = (padId: number) => {
    if (gameState !== "input") return

    setActivePad(padId)
    setTimeout(() => setActivePad(null), 200)

    if (padId === sequence[inputIndex]) {
      // Correct
      const nextIndex = inputIndex + 1
      if (nextIndex >= sequence.length) {
        // Completed this level
        advanceLevel()
      } else {
        setInputIndex(nextIndex)
      }
    } else {
      // Wrong
      setFlashWrong(padId)
      setGameState("gameover")
      const finalLevel = sequence.length
      if (finalLevel > highScore) {
        setHighScore(finalLevel)
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeouts()
  }, [])

  const renderContent = () => {
    if (gameState === "gameover") {
      return (
        <div className="text-center space-y-4 flex flex-col items-center">
          <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
          <h3 className="text-xl md:text-2xl font-bold">ゲームオーバー！</h3>
          <p className="text-3xl md:text-4xl font-bold">レベル {sequence.length}</p>
          <p className="text-lg">ハイスコア: レベル {highScore}</p>
          <Button onClick={startGame} className="bg-[#D4A57A] hover:bg-[#C7946A] text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            もう一度プレイ
          </Button>
        </div>
      )
    }

    if (gameState === "idle") {
      return (
        <div className="text-center space-y-4">
          <h3 className="text-lg md:text-xl font-bold">にゃんこ記憶力チャレンジ</h3>
          <p className="text-sm md:text-base">
            猫が光る順番を覚えて、同じ順番でタップしよう！
            <br />
            レベルが上がるごとに1つずつ増えるよ。
            <br />
            どこまで覚えられるかな？
          </p>
          <p className="font-bold">ハイスコア: レベル {highScore}</p>
          <Button onClick={startGame} className="bg-[#D4A57A] hover:bg-[#C7946A] text-white">
            <Play className="w-4 h-4 mr-2" />
            ゲーム開始
          </Button>
        </div>
      )
    }

    // showing / input / success
    return (
      <div className="w-full flex flex-col items-center space-y-4">
        <div className="flex items-center justify-between w-full px-4 font-bold text-base md:text-lg">
          <span>レベル: {level}</span>
          <span className="text-sm md:text-base text-[#8A6E59]">
            {gameState === "showing"
              ? "よく見てね..."
              : gameState === "success"
                ? "すごい！次のレベル！"
                : `${inputIndex + 1} / ${sequence.length}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-xs mx-auto">
          {PADS.map((pad) => {
            const isActive = activePad === pad.id
            const isWrong = flashWrong === pad.id && gameState === "gameover"
            const isDisabled = gameState !== "input"

            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={isDisabled}
                className={`aspect-square rounded-2xl text-4xl md:text-5xl flex flex-col items-center justify-center gap-1 transition-all duration-200 border-4 ${
                  isWrong
                    ? "bg-red-600 border-red-700 scale-95"
                    : isActive
                      ? `${pad.activeColor} border-white scale-105 shadow-lg shadow-current/30`
                      : `${pad.color} border-[#EAD8C0] ${!isDisabled ? "hover:scale-105 hover:shadow-md cursor-pointer active:scale-95" : "opacity-80"}`
                }`}
              >
                <span className={isActive ? "animate-bounce" : ""}>{pad.emoji}</span>
                <span className="text-xs md:text-sm font-bold text-white/80">{pad.label}</span>
              </button>
            )
          })}
        </div>

        {gameState === "showing" && (
          <p className="text-[#8A6E59] animate-pulse text-sm">光る順番を覚えてね...</p>
        )}
        {gameState === "input" && (
          <p className="text-[#8A6E59] text-sm">同じ順番でタップしよう！</p>
        )}
        {gameState === "success" && (
          <p className="text-green-600 font-bold text-sm animate-bounce">正解！次はもう1つ増えるよ！</p>
        )}
      </div>
    )
  }

  return (
    <section className="w-full">
      <Card className="bg-white/80 border-2 border-dashed border-[#EAD8C0]/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardHeader className="bg-[#FDEEDC]/60 rounded-t-lg">
          <CardTitle className="flex items-center justify-center text-xl md:text-2xl space-x-2">
            <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
            <span>にゃんこ記憶力チャレンジ</span>
            <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[28rem] md:min-h-[32rem] p-4 md:p-6">
          {renderContent()}
        </CardContent>
      </Card>
    </section>
  )
}
