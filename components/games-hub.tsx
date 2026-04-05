"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { PawPrint, BrainCircuit, Camera, Layers, Lightbulb, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const CatGame = dynamic(() => import("@/components/cat-game").then((m) => m.CatGame))
const CatQuiz = dynamic(() => import("@/components/cat-quiz").then((m) => m.CatQuiz))
const CatBreedQuiz = dynamic(() => import("@/components/cat-breed-quiz").then((m) => m.CatBreedQuiz))
const CatMemoryGame = dynamic(() => import("@/components/cat-memory-game").then((m) => m.CatMemoryGame))
const CatSimonGame = dynamic(() => import("@/components/cat-simon-game").then((m) => m.CatSimonGame))

type GameDef = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  component: React.ComponentType
}

const GAMES: GameDef[] = [
  {
    id: "rescue",
    title: "保護ねこゲーム",
    description: "20秒で猫を保護しよう！",
    icon: PawPrint,
    color: "from-pink-100 to-pink-50",
    component: CatGame,
  },
  {
    id: "quiz",
    title: "にゃんこクイズ",
    description: "猫の豆知識4択クイズ",
    icon: BrainCircuit,
    color: "from-blue-100 to-blue-50",
    component: CatQuiz,
  },
  {
    id: "breed",
    title: "ねこ品種クイズ",
    description: "写真から品種を当てよう",
    icon: Camera,
    color: "from-green-100 to-green-50",
    component: CatBreedQuiz,
  },
  {
    id: "memory",
    title: "にゃんこ神経衰弱",
    description: "猫の絵柄ペアを見つけよう",
    icon: Layers,
    color: "from-purple-100 to-purple-50",
    component: CatMemoryGame,
  },
  {
    id: "simon",
    title: "記憶力チャレンジ",
    description: "光る順番を覚えて再現",
    icon: Lightbulb,
    color: "from-yellow-100 to-yellow-50",
    component: CatSimonGame,
  },
]

export function GamesHub() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  if (selectedGame) {
    const game = GAMES.find((g) => g.id === selectedGame)!
    const GameComponent = game.component
    return (
      <div data-testid="game-expanded" className="w-full">
        <Button
          data-testid="game-back-button"
          onClick={() => setSelectedGame(null)}
          variant="outline"
          className="mb-4 bg-white hover:bg-[#FDEEDC] border-[#EAD8C0] text-[#8A6E59]"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          ゲーム一覧に戻る
        </Button>
        <GameComponent />
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-bold text-[#8A6E59] text-center">ゲームで遊ぼう！</h2>
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((game, index) => {
          const Icon = game.icon
          const isLastOdd = index === GAMES.length - 1 && GAMES.length % 2 === 1
          return (
            <button
              key={game.id}
              data-testid="game-card"
              onClick={() => setSelectedGame(game.id)}
              className={`bg-gradient-to-br ${game.color} rounded-2xl p-4 border-2 border-white/80 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all text-left ${
                isLastOdd ? "col-span-2" : ""
              }`}
            >
              <div className={isLastOdd ? "flex items-center gap-3" : ""}>
                <Icon className={`text-[#D4A57A] ${isLastOdd ? "w-8 h-8" : "w-8 h-8 mb-2"}`} />
                <div>
                  <h3 className="font-bold text-sm text-[#5C3A21] leading-tight">{game.title}</h3>
                  <p className="text-[11px] text-[#8A6E59] mt-1 leading-snug">{game.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
