"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, Cat, Cherry, Clock3, Eye, Fish, Footprints, Heart, Layers, Leaf, Moon, PawPrint, Play, RotateCcw, Smile, Sparkles, Star, Sun, Timer, Trophy } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"
import { useProgression } from "@/components/progression-provider"
import { createEventId } from "@/lib/progression"

type MemoryGameState = "idle" | "preview" | "playing" | "finished"
type MemoryCard = { id: number; icon: React.ElementType; label: string; isFlipped: boolean; isMatched: boolean }
type Difficulty = { id: "easy" | "normal" | "hard"; name: string; pairs: number; description: string }
type BestRecord = { moves: number; time: number }
type GlobalDifficulty = "gentle" | "standard" | "challenge"

const CAT_PAIRS = [
  { icon: Cat, label: "ねこ" }, { icon: PawPrint, label: "にくきゅう" }, { icon: Fish, label: "おさかな" },
  { icon: Heart, label: "ハート" }, { icon: Smile, label: "にっこり" }, { icon: Eye, label: "きらきら目" },
  { icon: Star, label: "おほしさま" }, { icon: Moon, label: "おつきさま" }, { icon: Sun, label: "おひさま" },
  { icon: Bell, label: "すず" }, { icon: Leaf, label: "はっぱ" }, { icon: Cherry, label: "さくらんぼ" },
]

const PAIR_REACTIONS: Record<string, string> = {
  "ねこ": "猫が二匹そろい、トラちゃんが元気に肉球拍手！",
  "にくきゅう": "肉球がそろうと、キキが本物の肉球を一個追加しました。",
  "おさかな": "魚が二匹そろいました。三匹はもうお皿の前で待っています。",
  "ハート": "ハートが二つ。フワがうれしそうにしっぽを揺らしました。",
  "にっこり": "にっこりがそろい、トラちゃんも満面の笑顔です。",
  "きらきら目": "きらきら目が二組。キキの目も同じくらい輝いています。",
  "おほしさま": "星が二つ。美雪がそっと博士ノートへ記録しました。",
  "おつきさま": "月が二つ並び、フワは夜のお昼寝を始めました。",
  "おひさま": "太陽が二つでぽかぽか。三匹は窓辺で昼寝中です。",
  "すず": "鈴が二つそろい、トラちゃんがしっぽでリズムを取りました。",
  "はっぱ": "葉っぱがそろい、キキが一枚を頭にのせました。",
  "さくらんぼ": "さくらんぼが二つ。フワがきちんと数えています。",
}

const MEMORY_MISS_REACTIONS = [
  "美雪『その二枚は別もの！』場所を覚えて、次にそろえよう。",
  "おしい！ キキが開いた場所をじっと覚えています。",
  "トラちゃんがしっぽを横へ一振り。場所は覚えておこう！",
] as const

function memoryResultCopy(stars: number) {
  if (stars === 3) return "美雪『ほぼ最短！』三匹も大きな肉球拍手！"
  if (stars === 2) return "三匹『よく覚えたにゃ』。次はもっと少ない手数を目指そう。"
  return "全部そろえば大成功！ 開いた場所を少しずつ覚えて再挑戦しよう。"
}

const DIFFICULTIES: Difficulty[] = [
  { id: "easy", name: "入門", pairs: 6, description: "12枚・開始前に2秒確認" },
  { id: "normal", name: "標準", pairs: 8, description: "16枚・手数と時間を記録" },
  { id: "hard", name: "上級", pairs: 12, description: "24枚・最短手に挑戦" },
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
const recordKeyFor = (mode: GlobalDifficulty, difficultyId: Difficulty["id"]) => `${mode}:${difficultyId}`

function isBestRecordMap(value: unknown): value is Record<string, BestRecord> {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && Object.values(value).every((entry) => (
      typeof entry === "object"
      && entry !== null
      && !Array.isArray(entry)
      && typeof (entry as BestRecord).moves === "number"
      && Number.isFinite((entry as BestRecord).moves)
      && (entry as BestRecord).moves >= 0
      && typeof (entry as BestRecord).time === "number"
      && Number.isFinite((entry as BestRecord).time)
      && (entry as BestRecord).time >= 0
    ))
}

const previewDurationFor = (mode: GlobalDifficulty, difficultyId: Difficulty["id"], reviewing = false) => {
  if (mode === "gentle") return reviewing ? 6000 : 8000
  if (mode === "challenge") return reviewing ? 1400 : 1000
  return reviewing ? 3000 : difficultyId === "easy" ? 2000 : 1500
}

export function CatMemoryGame() {
  const { state, recordEvent } = useProgression()
  const [gameState, setGameState] = useState<MemoryGameState>("idle")
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0])
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matchedCount, setMatchedCount] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [message, setMessage] = useState("場所を覚えてね！")
  const [reviewCount, setReviewCount] = useState(0)
  const [runGlobalDifficulty, setRunGlobalDifficulty] = useState<GlobalDifficulty>("standard")
  const [bestRecords, setBestRecords] = useLocalStorage<Record<string, BestRecord>>("catMemoryBestRecordsV3", {}, isBestRecordMap)
  const [recordSaveFailed, setRecordSaveFailed] = useState(false)
  const lockRef = useRef(false)
  const gameStateRef = useRef<MemoryGameState>("idle")
  const cardsRef = useRef<MemoryCard[]>([])
  const flippedIdsRef = useRef<number[]>([])
  const previewTimerRef = useRef<number | null>(null)
  const resolutionTimerRef = useRef<number | null>(null)
  const focusFrameRef = useRef<number | null>(null)
  const completionEventIdRef = useRef<string | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const setupHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const returningToSetupRef = useRef(false)
  const globalDifficulty = state.settings.difficulty as GlobalDifficulty
  const activeGlobalDifficulty = gameState === "idle" ? globalDifficulty : runGlobalDifficulty

  const focusAvailableCard = () => {
    if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
    focusFrameRef.current = window.requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus()
      focusFrameRef.current = null
    })
  }

  const finishPreviewAfter = (duration: number) => {
    if (previewTimerRef.current !== null) window.clearTimeout(previewTimerRef.current)
    previewTimerRef.current = window.setTimeout(() => {
      const hiddenCards = cardsRef.current.map((card) => ({ ...card, isFlipped: card.isMatched }))
      cardsRef.current = hiddenCards
      setCards(hiddenCards)
      setMessage("同じ絵を2枚見つけよう")
      gameStateRef.current = "playing"
      setGameState("playing")
      lockRef.current = false
      previewTimerRef.current = null
    }, duration)
  }

  const startGame = (nextDifficulty = difficulty) => {
    if (gameStateRef.current !== "idle" && gameStateRef.current !== "finished") return
    setRecordSaveFailed(false)
    gameStateRef.current = "preview"
    if (resolutionTimerRef.current !== null) window.clearTimeout(resolutionTimerRef.current)
    resolutionTimerRef.current = null
    completionEventIdRef.current = createEventId("game-memory")
    setRunGlobalDifficulty(globalDifficulty)
    setDifficulty(nextDifficulty)
    const selected = shuffle(CAT_PAIRS).slice(0, nextDifficulty.pairs)
    const deck = shuffle(selected.flatMap((pair, index) => [
      { id: index * 2, ...pair, isFlipped: true, isMatched: false },
      { id: index * 2 + 1, ...pair, isFlipped: true, isMatched: false },
    ]))
    cardsRef.current = deck
    flippedIdsRef.current = []
    setCards(deck)
    setFlippedIds([])
    setMoves(0)
    setMatchedCount(0)
    setElapsedTime(0)
    setReviewCount(0)
    setMessage("場所を覚えてね！")
    setGameState("preview")
    lockRef.current = true
    finishPreviewAfter(previewDurationFor(globalDifficulty, nextDifficulty.id))
  }

  const reviewCards = () => {
    const reviewLimit = runGlobalDifficulty === "gentle" ? Number.POSITIVE_INFINITY : runGlobalDifficulty === "standard" ? 1 : 0
    if (gameStateRef.current !== "playing" || lockRef.current || flippedIdsRef.current.length > 0 || reviewCount >= reviewLimit) return
    setReviewCount((value) => value + 1)
    setMessage("もう一度、場所をゆっくり確認しよう")
    const revealedCards = cardsRef.current.map((card) => ({ ...card, isFlipped: true }))
    cardsRef.current = revealedCards
    setCards(revealedCards)
    gameStateRef.current = "preview"
    setGameState("preview")
    lockRef.current = true
    finishPreviewAfter(previewDurationFor(runGlobalDifficulty, difficulty.id, true))
  }

  useEffect(() => () => {
    if (previewTimerRef.current !== null) window.clearTimeout(previewTimerRef.current)
    if (resolutionTimerRef.current !== null) window.clearTimeout(resolutionTimerRef.current)
    if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
  }, [])

  useEffect(() => {
    if (gameState === "playing") focusFrameRef.current = window.requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus())
    if (gameState === "finished") focusFrameRef.current = window.requestAnimationFrame(() => resultHeadingRef.current?.focus())
    if (gameState === "idle" && returningToSetupRef.current) {
      returningToSetupRef.current = false
      focusFrameRef.current = window.requestAnimationFrame(() => setupHeadingRef.current?.focus())
    }
    return () => {
      if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
      focusFrameRef.current = null
    }
  }, [gameState])

  useEffect(() => {
    if (gameState !== "playing") return
    const timer = window.setInterval(() => setElapsedTime((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [gameState])

  const flipCard = (id: number) => {
    if (lockRef.current || gameStateRef.current !== "playing") return
    const card = cardsRef.current.find((item) => item.id === id)
    if (!card || card.isFlipped || card.isMatched) return

    const nextFlipped = [...flippedIdsRef.current, id]
    const nextCards = cardsRef.current.map((item) => item.id === id ? { ...item, isFlipped: true } : item)
    cardsRef.current = nextCards
    flippedIdsRef.current = nextFlipped
    setCards(nextCards)
    setFlippedIds(nextFlipped)
    if (nextFlipped.length < 2) {
      focusAvailableCard()
      return
    }

    lockRef.current = true
    setMoves((value) => value + 1)
    const [firstId, secondId] = nextFlipped
    const first = cardsRef.current.find((item) => item.id === firstId)!
    const second = cardsRef.current.find((item) => item.id === secondId)!

    if (first.label === second.label) {
      setMessage(`「${first.label}」がそろった！ ${PAIR_REACTIONS[first.label]}`)
      resolutionTimerRef.current = window.setTimeout(() => {
        const matchedCards = cardsRef.current.map((item) => item.id === firstId || item.id === secondId ? { ...item, isMatched: true } : item)
        cardsRef.current = matchedCards
        flippedIdsRef.current = []
        setCards(matchedCards)
        setFlippedIds([])
        setMatchedCount((value) => value + 1)
        lockRef.current = false
        resolutionTimerRef.current = null
        focusAvailableCard()
      }, 460)
    } else {
      setMessage(MEMORY_MISS_REACTIONS[moves % MEMORY_MISS_REACTIONS.length])
      resolutionTimerRef.current = window.setTimeout(() => {
        const hiddenCards = cardsRef.current.map((item) => item.id === firstId || item.id === secondId ? { ...item, isFlipped: false } : item)
        cardsRef.current = hiddenCards
        flippedIdsRef.current = []
        setCards(hiddenCards)
        setFlippedIds([])
        lockRef.current = false
        resolutionTimerRef.current = null
        focusAvailableCard()
      }, 760)
    }
  }

  useEffect(() => {
    if (gameState !== "playing" || cards.length === 0 || matchedCount !== cards.length / 2) return
    const eventId = completionEventIdRef.current
    if (eventId) {
      completionEventIdRef.current = null
      recordEvent({
        type: "game.completed",
        eventId,
        occurredAt: new Date().toISOString(),
        gameId: "memory",
        score: Math.max(1, difficulty.pairs * 200 - moves * 10 - elapsedTime),
        won: true,
      })
    }
    gameStateRef.current = "finished"
    setGameState("finished")
    const recordKey = recordKeyFor(runGlobalDifficulty, difficulty.id)
    const currentBest = bestRecords[recordKey]
    if (!currentBest || moves < currentBest.moves || (moves === currentBest.moves && elapsedTime < currentBest.time)) {
      setRecordSaveFailed(!setBestRecords({ ...bestRecords, [recordKey]: { moves, time: elapsedTime } }))
    }
  }, [bestRecords, cards.length, difficulty.id, difficulty.pairs, elapsedTime, gameState, matchedCount, moves, recordEvent, runGlobalDifficulty, setBestRecords])

  const record = bestRecords[recordKeyFor(runGlobalDifficulty, difficulty.id)]
  const stars = moves <= difficulty.pairs + 2 ? 3 : moves <= difficulty.pairs + 6 ? 2 : 1
  const returnToSetup = () => {
    returningToSetupRef.current = true
    gameStateRef.current = "idle"
    setGameState("idle")
  }

  return (
    <GameShell title="にゃんこ神経衰弱" subtitle="最初のプレビューを覚えて、同じ絵のペアを見つけよう。" icon={Layers} tone="lavender">
      {gameState === "idle" && (
        <div className="game-start-view">
          <div className="game-intro-mark"><Layers aria-hidden="true" /></div>
          <h3 ref={setupHeadingRef} tabIndex={-1}>カードの場所を覚えよう</h3>
          <p>{activeGlobalDifficulty === "gentle"
            ? "ゲーム開始後に8秒間ぜんぶ見えるよ。プレイ中も何度でもカードを見直せます。"
            : activeGlobalDifficulty === "challenge"
              ? "ゲーム開始後の1秒プレビューを覚えて、全ペアをそろえよう。"
              : "ゲーム開始直後に全部のカードが少しだけ見えるよ。プレイ中に一度だけ見直せます。"}</p>
          <div className="game-difficulty-grid">
            {DIFFICULTIES.map((item) => {
              const best = bestRecords[recordKeyFor(globalDifficulty, item.id)]
              return <button key={item.id} type="button" onClick={() => startGame(item)}>
                <strong>{item.name}</strong><span>{globalDifficulty === "gentle" ? "8秒プレビュー・見直し自由" : globalDifficulty === "challenge" ? "1秒プレビュー" : item.description}</span><small>{best ? `ベスト ${best.moves}手 / ${formatTime(best.time)}` : "記録なし"}</small>
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
          <p className={`game-live-message ${gameState === "preview" ? "is-preview" : ""}`} aria-live="polite" aria-atomic="true">{message}</p>
          {gameState === "playing" && runGlobalDifficulty !== "challenge" && (runGlobalDifficulty === "gentle" || reviewCount < 1) && flippedIds.length === 0 && (
            <button type="button" className="memory-review-button" onClick={reviewCards}>
              <Eye aria-hidden="true" />カードをもう一度見る
            </button>
          )}
          <div ref={gridRef} className="memory-grid" data-pairs={difficulty.pairs} aria-label="記憶カード">
            {cards.map((card, index) => {
              const Icon = card.icon
              const visible = card.isFlipped || card.isMatched
              const position = `${cards.length}枚中${index + 1}番`
              return (
                <button key={card.id} type="button" data-state={card.isMatched ? "matched" : visible ? "flipped" : "hidden"} onClick={() => flipCard(card.id)} disabled={gameState !== "playing" || visible || flippedIds.length >= 2} aria-label={visible ? `${position}、${card.label}` : `${position}、裏向きのカード`}>
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
          <h3 ref={resultHeadingRef} tabIndex={-1}>{moves}手</h3>
          <div className="game-result-stars" aria-label={`${stars}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= stars ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{difficulty.name}を{formatTime(elapsedTime)}でクリア。最後までよく覚えたね！</p>
          <p>{memoryResultCopy(stars)}</p>
          <div className="game-result-record"><Clock3 aria-hidden="true" /><span>{recordSaveFailed ? "保存ずみのベスト" : "ベスト記録"}</span><strong>{record ? `${record.moves}手 / ${formatTime(record.time)}` : recordSaveFailed ? "記録なし" : `${moves}手`}</strong></div>
          {recordSaveFailed ? <p role="status">今回の新記録は端末に保存できませんでした。</p> : null}
          <GamePrimaryButton onClick={() => startGame()}><RotateCcw aria-hidden="true" />同じむずかしさで遊ぶ</GamePrimaryButton>
          <button type="button" className="game-secondary-button" onClick={returnToSetup}>むずかしさを変える</button>
        </div>
      )}
    </GameShell>
  )
}
