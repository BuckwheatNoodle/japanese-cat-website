"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useState } from "react"
import { ArrowLeft, BrainCircuit, Camera, ChevronRight, Layers, Lightbulb, PawPrint, Sparkles, Trophy } from "lucide-react"
import { useSkin } from "@/components/skin-provider"

const CatGame = dynamic(() => import("@/components/cat-game").then((m) => m.CatGame))
const CatQuiz = dynamic(() => import("@/components/cat-quiz").then((m) => m.CatQuiz))
const CatBreedQuiz = dynamic(() => import("@/components/cat-breed-quiz").then((m) => m.CatBreedQuiz))
const CatMemoryGame = dynamic(() => import("@/components/cat-memory-game").then((m) => m.CatMemoryGame))
const CatSimonGame = dynamic(() => import("@/components/cat-simon-game").then((m) => m.CatSimonGame))

type GameDef = {
  id: string
  title: string
  description: string
  detail: string
  icon: React.ElementType
  tone: "coral" | "mint" | "butter" | "lavender" | "blush"
  component: React.ComponentType
  artKey: string
}

const GAMES: GameDef[] = [
  {
    id: "rescue",
    title: "保護ねこゲーム",
    description: "20秒で猫を保護しよう",
    detail: "すばやくタップ",
    icon: PawPrint,
    tone: "coral",
    component: CatGame,
    artKey: "rescue",
  },
  {
    id: "quiz",
    title: "にゃんこクイズ",
    description: "猫の豆知識4択クイズ",
    detail: "全10問",
    icon: BrainCircuit,
    tone: "mint",
    component: CatQuiz,
    artKey: "quiz",
  },
  {
    id: "breed",
    title: "ねこ品種クイズ",
    description: "写真から品種を当てよう",
    detail: "写真で学べる",
    icon: Camera,
    tone: "butter",
    component: CatBreedQuiz,
    artKey: "breed",
  },
  {
    id: "memory",
    title: "にゃんこ神経衰弱",
    description: "同じ猫のペアを探そう",
    detail: "3つのむずかしさ",
    icon: Layers,
    tone: "lavender",
    component: CatMemoryGame,
    artKey: "memory",
  },
  {
    id: "simon",
    title: "記憶力チャレンジ",
    description: "光る順番をまねしよう",
    detail: "どこまで続くかな",
    icon: Lightbulb,
    tone: "blush",
    component: CatSimonGame,
    artKey: "simon",
  },
]

export function GamesHub() {
  const { skin } = useSkin()
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const selectGame = (gameId: string | null) => {
    setSelectedGame(gameId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (selectedGame) {
    const game = GAMES.find((item) => item.id === selectedGame)!
    const GameComponent = game.component
    return (
      <section data-testid="game-expanded" className="game-expanded" aria-label={game.title}>
        <button type="button" data-testid="game-back-button" className="back-button" onClick={() => selectGame(null)}>
          <ArrowLeft aria-hidden="true" />
          ゲーム一覧に戻る
        </button>
        <GameComponent />
      </section>
    )
  }

  return (
    <section className="feature-screen games-screen" aria-labelledby="games-title">
      <div className="screen-hero screen-hero-games">
        <div>
          <p className="screen-kicker">CAT CAFE GAMES</p>
          <h2 id="games-title">ゲームで遊ぼう！</h2>
          <p>気になるゲームを選んでね。いつでも一覧に戻れるよ。</p>
        </div>
        <div className="screen-hero-cat" aria-hidden="true">
          <Image src={skin.assets.gameGuide} alt="" fill sizes="120px" />
        </div>
      </div>

      <div className="game-hub-summary" aria-label="ゲームの特徴">
        <span><Sparkles aria-hidden="true" /><strong>5</strong>つの遊び</span>
        <span><Trophy aria-hidden="true" />ベスト記録を保存</span>
        <span><PawPrint aria-hidden="true" />全部タップで遊べる</span>
      </div>

      <div className="game-list-grid">
        {GAMES.map((game) => {
          const Icon = game.icon
          return (
            <button
              key={game.id}
              type="button"
              data-testid="game-card"
              className="game-choice"
              data-tone={game.tone}
              onClick={() => selectGame(game.id)}
            >
              <span className="game-choice-art" aria-hidden="true">
                <Image src={skin.assets.gameCards[game.artKey]} alt="" fill sizes="(max-width: 559px) 120px, 280px" />
                <span className="game-choice-icon"><Icon /></span>
              </span>
              <span className="game-choice-copy">
                {game.id === "rescue" && <em>おすすめ</em>}
                <strong>{game.title}</strong>
                <span>{game.description}</span>
                <span className="game-choice-detail">{game.detail}</span>
              </span>
              <span className="game-choice-arrow" aria-hidden="true"><ChevronRight /></span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
