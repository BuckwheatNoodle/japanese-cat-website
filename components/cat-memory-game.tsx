"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, Cat, Cherry, Clock3, Eye, Fish, Footprints, Heart, Layers, Leaf, Moon, PawPrint, Play, RotateCcw, Smile, Sparkles, Star, Sun, Timer, Trophy } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"

type MemoryGameState = "idle" | "preview" | "playing" | "finished"
type MemoryCard = { id: number; icon: React.ElementType; label: string; isFlipped: boolean; isMatched: boolean }
type Difficulty = { id: "easy" | "normal" | "hard"; name: string; pairs: number; description: string }
type BestRecord = { moves: number; time: number }

const CAT_PAIRS = [
  { icon: Cat, label: "ねこ" }, { icon: PawPrint, label: "にくきゅう" }, { icon: Fish, label: "おさかな" },
  { icon: Heart, label: "ハート" }, { icon: Smile, label: "にっこり" }, { icon: Eye, label: "きらきら目" },
  { icon: Star, label: "おほしさま" }, { icon: Moon, label: "おつきさま" }, { icon: Sun, label: "おひさま" },
  { icon: Bell, label: "すず" }, { icon: Leaf, label: "はっぱ" }, { icon: Cherry, label: "さくらんぼ" },
]

const DIFFICULTIES: Difficulty[] = [
  { id: "easy", name: "かんたん", pairs: 6, description: "12枚・最初に2秒見える" },
  { id: "normal", name: "ふつう", pairs: 8, description: "16枚・記憶力アップ" },
  { id: "hard", name: "むずかしい", pairs: 12, description: "24枚・全力チャレンジ" },
]

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

export function CatMemoryGame() {
  const [gameState, setGameState] = useState<MemoryGameState>("idle")
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0])
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matchedCount, setMatchedCount] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [message, setMessage] = useState("場所を覚えてね！")
  const [bestRecords, setBestRecords] = useLocalStorage<Record<string, BestRecord>>("catMemoryBestRecordsV2", {})
  const lockRef = useRef(false)
  const previewTimerRef = useRef<number | null>(null)

  const startGame = (nextDifficulty = difficulty) => {
    setDifficulty(nextDifficulty)
    const selected = shuffle(CAT_PAIRS).slice(0, nextDifficulty.pairs)
    const deck = shuffle(selected.flatMap((pair, index) => [
      { id: index * 2, ...pair, isFlipped: true, isMatched: false },
      { id: index * 2 + 1, ...pair, isFlipped: true, isMatched: false },
    ]))
    setCards(deck)
    setFlippedIds([])
    setMoves(0)
    setMatchedCount(0)
    setElapsedTime(0)
    setMessage("場所を覚えてね！")
    setGameState("preview")
    lockRef.current = true
    if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current)
    previewTimerRef.current = window.setTimeout(() => {
      setCards((current) => current.map((card) => ({ ...card, isFlipped: false })))
      setMessage("同じ絵を2枚見つけよう")
      setGameState("playing")
      lockRef.current = false
    }, nextDifficulty.id === "easy" ? 2000 : 1500)
  }

  useEffect(() => () => { if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current) }, [])

  useEffect(() => {
    if (gameState !== "playing") return
    const timer = window.setInterval(() => setElapsedTime((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [gameState])

  const flipCard = (id: number) => {
    if (lockRef.current || gameState !== "playing") return
    const card = cards.find((item) => item.id === id)
    if (!card || card.isFlipped || card.isMatched) return

    const nextFlipped = [...flippedIds, id]
    setCards((current) => current.map((item) => item.id === id ? { ...item, isFlipped: true } : item))
    setFlippedIds(nextFlipped)
    if (nextFlipped.length < 2) return

    lockRef.current = true
    setMoves((value) => value + 1)
    const [firstId, secondId] = nextFlipped
    const first = cards.find((item) => item.id === firstId)!
    const second = cards.find((item) => item.id === secondId)!

    if (first.label === second.label) {
      setMessage(`「${first.label}」がそろった！`)
      window.setTimeout(() => {
        setCards((current) => current.map((item) => item.id === firstId || item.id === secondId ? { ...item, isMatched: true } : item))
        setFlippedIds([])
        setMatchedCount((value) => value + 1)
        lockRef.current = false
      }, 460)
    } else {
      setMessage("おしい！場所を覚えておこう")
      window.setTimeout(() => {
        setCards((current) => current.map((item) => item.id === firstId || item.id === secondId ? { ...item, isFlipped: false } : item))
        setFlippedIds([])
        lockRef.current = false
      }, 760)
    }
  }

  useEffect(() => {
    if (gameState !== "playing" || cards.length === 0 || matchedCount !== cards.length / 2) return
    setGameState("finished")
    const currentBest = bestRecords[difficulty.id]
    if (!currentBest || moves < currentBest.moves || (moves === currentBest.moves && elapsedTime < currentBest.time)) {
      setBestRecords({ ...bestRecords, [difficulty.id]: { moves, time: elapsedTime } })
    }
  }, [bestRecords, cards.length, difficulty.id, elapsedTime, gameState, matchedCount, moves, setBestRecords])

  const record = bestRecords[difficulty.id]
  const stars = moves <= difficulty.pairs + 2 ? 3 : moves <= difficulty.pairs + 6 ? 2 : 1

  return (
    <GameShell title="にゃんこ神経衰弱" subtitle="最初のプレビューを覚えて、同じ絵のペアを見つけよう。" icon={Layers} tone="lavender">
      {gameState === "idle" && (
        <div className="game-start-view">
          <div className="game-intro-mark"><Layers aria-hidden="true" /></div>
          <h3>カードの場所を覚えよう</h3>
          <p>ゲーム開始直後に全部のカードが少しだけ見えるよ。少ない手数と短い時間で全ペアをそろえよう。</p>
          <div className="game-difficulty-grid">
            {DIFFICULTIES.map((item) => {
              const best = bestRecords[item.id]
              return <button key={item.id} type="button" onClick={() => startGame(item)}>
                <strong>{item.name}</strong><span>{item.description}</span><small>{best ? `ベスト ${best.moves}手 / ${formatTime(best.time)}` : "記録なし"}</small>
              </button>
            })}
          </div>
        </div>
      )}

      {(gameState === "preview" || gameState === "playing") && (
        <div className="memory-game-view">
          <div className="game-stats-row">
            <GameStat icon={Footprints} label="手数" value={moves} />
            <GameStat icon={Timer} label="時間" value={formatTime(elapsedTime)} />
            <GameStat icon={Sparkles} label="残り" value={`${difficulty.pairs - matchedCount}組`} />
          </div>
          <p className={`game-live-message ${gameState === "preview" ? "is-preview" : ""}`} aria-live="polite">{message}</p>
          <div className="memory-grid" data-pairs={difficulty.pairs}>
            {cards.map((card) => {
              const Icon = card.icon
              const visible = card.isFlipped || card.isMatched
              return (
                <button key={card.id} type="button" data-state={card.isMatched ? "matched" : visible ? "flipped" : "hidden"} onClick={() => flipCard(card.id)} disabled={gameState !== "playing" || visible} aria-label={visible ? card.label : "裏向きのカード"}>
                  <span className="memory-card-inner">
                    <span className="memory-card-back"><PawPrint aria-hidden="true" /></span>
                    <span className="memory-card-front"><Icon aria-hidden="true" /><small>{card.label}</small></span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <div className="game-result-view">
          <Trophy className="game-result-trophy" aria-hidden="true" />
          <p className="game-result-kicker">ぜんぶそろった！</p>
          <h3>{moves}手</h3>
          <div className="game-result-stars" aria-label={`${stars}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= stars ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{difficulty.name}を{formatTime(elapsedTime)}でクリア。最後までよく覚えたね！</p>
          <div className="game-result-record"><Clock3 aria-hidden="true" /><span>ベスト記録</span><strong>{record ? `${record.moves}手 / ${formatTime(record.time)}` : `${moves}手`}</strong></div>
          <GamePrimaryButton onClick={() => startGame()}><RotateCcw aria-hidden="true" />同じむずかしさで遊ぶ</GamePrimaryButton>
          <button type="button" className="game-secondary-button" onClick={() => setGameState("idle")}>むずかしさを変える</button>
        </div>
      )}
    </GameShell>
  )
}
