"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, BrainCircuit, Camera, ChevronRight, Layers, Lightbulb, PawPrint, Sparkles, Trophy, WandSparkles } from "lucide-react"
import { useSkin } from "@/components/skin-provider"
import { assetPath } from "@/lib/utils"

const CatGame = dynamic(() => import("@/components/cat-game").then((m) => m.CatGame))
const CatQuiz = dynamic(() => import("@/components/cat-quiz").then((m) => m.CatQuiz))
const CatBreedQuiz = dynamic(() => import("@/components/cat-breed-quiz").then((m) => m.CatBreedQuiz))
const CatMemoryGame = dynamic(() => import("@/components/cat-memory-game").then((m) => m.CatMemoryGame))
const CatSimonGame = dynamic(() => import("@/components/cat-simon-game").then((m) => m.CatSimonGame))
const NaokunTransformGame = dynamic(() => import("@/components/naokun-transform-game").then((m) => m.NaokunTransformGame))

type GameDef = {
  id: string
  title: string
  description: string
  detail: string
  icon: React.ElementType
  tone: "coral" | "mint" | "butter" | "lavender" | "blush"
  component: React.ComponentType
  artKey: string
  artSrc?: string
}

const GAMES: GameDef[] = [
  {
    id: "rescue",
    title: "保護ねこゲーム",
    description: "猫だけを見分けて保護。なおくんと犬は見送る",
    detail: "反射神経・コンボ競技",
    icon: PawPrint,
    tone: "coral",
    component: CatGame,
    artKey: "rescue",
  },
  {
    id: "quiz",
    title: "にゃんこクイズ",
    description: "猫の生態を根拠と一緒に確かめる4択",
    detail: "5問・10問検定",
    icon: BrainCircuit,
    tone: "mint",
    component: CatQuiz,
    artKey: "quiz",
  },
  {
    id: "breed",
    title: "ねこ品種クイズ",
    description: "写真の耳・顔・毛並みから品種を推理",
    detail: "観察力テスト",
    icon: Camera,
    tone: "butter",
    component: CatBreedQuiz,
    artKey: "breed",
  },
  {
    id: "memory",
    title: "にゃんこ神経衰弱",
    description: "カードの位置を記憶して最短手を狙う",
    detail: "3段階・タイム記録",
    icon: Layers,
    tone: "lavender",
    component: CatMemoryGame,
    artKey: "memory",
  },
  {
    id: "simon",
    title: "記憶力チャレンジ",
    description: "光る順番を記憶して再現",
    detail: "到達レベルを記録",
    icon: Lightbulb,
    tone: "blush",
    component: CatSimonGame,
    artKey: "simon",
  },
  {
    id: "naokun-transform",
    title: "なおくん変身セレクト",
    description: "条件を読み、12のお題に最適な変身を選択",
    detail: "誤答36通りにも専用オチ",
    icon: WandSparkles,
    tone: "mint",
    component: NaokunTransformGame,
    artKey: "rescue",
    artSrc: "/content/collections/naokun/poop-cloud.webp",
  },
]

export function GamesHub() {
  const { skin } = useSkin()
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const backButtonRef = useRef<HTMLButtonElement | null>(null)
  const gameButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const returnToGameRef = useRef<string | null>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (selectedGame) {
        backButtonRef.current?.focus()
      } else if (returnToGameRef.current) {
        gameButtonRefs.current[returnToGameRef.current]?.focus()
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [selectedGame])

  const selectGame = (gameId: string | null) => {
    if (gameId) returnToGameRef.current = gameId
    setSelectedGame(gameId)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || document.documentElement.dataset.miyukiMotion === "reduced"
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
  }

  if (selectedGame) {
    const game = GAMES.find((item) => item.id === selectedGame)!
    const GameComponent = game.component
    return (
      <section data-testid="game-expanded" className="game-expanded" aria-label={game.title}>
        <button ref={backButtonRef} type="button" data-testid="game-back-button" className="back-button" onClick={() => selectGame(null)}>
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
          <h2 id="games-title">ゲーム攻略室</h2>
          <p>反射神経・知識・観察力・記憶力を競う6種目。<br />難易度と記録を比べて、自分の得意を探せます。</p>
        </div>
        <div className="screen-hero-cat" aria-hidden="true">
          <Image src={skin.assets.gameGuide} alt="" fill sizes="120px" />
        </div>
      </div>

      <div className="game-hub-summary" aria-label="ゲームの特徴">
        <span><Sparkles aria-hidden="true" /><strong>{GAMES.length}</strong>競技</span>
        <span><Trophy aria-hidden="true" />ベスト記録</span>
        <span><PawPrint aria-hidden="true" />3段階の難易度</span>
      </div>

      <div className="game-list-grid">
        {GAMES.map((game) => {
          const Icon = game.icon
          return (
            <button
              key={game.id}
              ref={(node) => { gameButtonRefs.current[game.id] = node }}
              type="button"
              data-testid="game-card"
              className="game-choice"
              data-tone={game.tone}
              onClick={() => selectGame(game.id)}
            >
              <span className="game-choice-art" aria-hidden="true">
                <Image src={game.artSrc ? assetPath(game.artSrc) : skin.assets.gameCards[game.artKey]} alt="" fill sizes="(max-width: 559px) 120px, 280px" />
                <span className="game-choice-icon"><Icon /></span>
              </span>
              <span className="game-choice-copy">
                {game.id === "rescue" && <em>反射神経</em>}
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
