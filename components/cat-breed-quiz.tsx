"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { assetPath } from "@/lib/utils"
import { ArrowRight, Camera, CheckCircle, Eye, Lightbulb, Play, RotateCcw, Sparkles, Star, Timer, Trophy, XCircle } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"

type BreedQuizState = "idle" | "playing" | "finished"

type BreedQuestion = {
  id: string
  imageUrl: string
  correctBreed: string
  options: [string, string, string, string]
  description: string
}

const BREED_QUESTIONS: BreedQuestion[] = [
  {
    id: "persian",
    imageUrl: assetPath("/fluffy-white-persian-cat-with-long-fur-and-flat-fa.jpg"),
    correctBreed: "ペルシャ",
    options: ["ペルシャ", "ラグドール", "メインクーン", "ノルウェージャンフォレストキャット"],
    description: "長い毛と平たい顔が特徴的な優雅な猫です",
  },
  {
    id: "siamese",
    imageUrl: assetPath("/siamese-cat-with-blue-eyes-and-cream-colored-body-.jpg"),
    correctBreed: "シャム",
    options: ["シャム", "ロシアンブルー", "オリエンタルショートヘア", "バーミーズ"],
    description: "青い目とポイントカラーが美しい猫です",
  },
  {
    id: "maine_coon",
    imageUrl: assetPath("/large-maine-coon-cat-with-long-fur-and-tufted-ears.jpg"),
    correctBreed: "メインクーン",
    options: ["メインクーン", "ノルウェージャンフォレストキャット", "サイベリアン", "ラグドール"],
    description: "大型で房毛のある耳が特徴的な猫です",
  },
  {
    id: "british_shorthair",
    imageUrl: assetPath("/british-shorthair-cat-with-round-face-and-dense-gr.jpg"),
    correctBreed: "ブリティッシュショートヘア",
    options: ["ブリティッシュショートヘア", "ロシアンブルー", "シャルトリュー", "スコティッシュフォールド"],
    description: "丸い顔と密な被毛が特徴的な猫です",
  },
  {
    id: "ragdoll",
    imageUrl: assetPath("/ragdoll-cat-with-blue-eyes-and-semi-long-colorpoin.jpg"),
    correctBreed: "ラグドール",
    options: ["ラグドール", "バーマン", "ヒマラヤン", "ペルシャ"],
    description: "大きくて穏やかな性格の長毛猫です",
  },
  {
    id: "scottish_fold",
    imageUrl: assetPath("/scottish-fold-cat-with-folded-ears-and-round-eyes.jpg"),
    correctBreed: "スコティッシュフォールド",
    options: [
      "スコティッシュフォールド",
      "ブリティッシュショートヘア",
      "アメリカンショートヘア",
      "エキゾチックショートヘア",
    ],
    description: "折れ曲がった耳が愛らしい猫です",
  },
  {
    id: "russian_blue",
    imageUrl: assetPath("/russian-blue-cat-with-silver-blue-fur-and-green-ey.jpg"),
    correctBreed: "ロシアンブルー",
    options: ["ロシアンブルー", "シャルトリュー", "ブリティッシュショートヘア", "コラット"],
    description: "銀青色の美しい被毛と緑の目が特徴です",
  },
  {
    id: "abyssinian",
    imageUrl: assetPath("/abyssinian-cat-with-ticked-coat-and-large-ears.jpg"),
    correctBreed: "アビシニアン",
    options: ["アビシニアン", "ソマリ", "ベンガル", "オシキャット"],
    description: "ティックドコートと大きな耳が特徴的です",
  },
  {
    id: "bengal",
    imageUrl: assetPath("/bengal-cat-with-leopard-like-spotted-pattern.jpg"),
    correctBreed: "ベンガル",
    options: ["ベンガル", "オシキャット", "エジプシャンマウ", "アビシニアン"],
    description: "ヒョウのような美しい斑点模様が特徴です",
  },
  {
    id: "sphynx",
    imageUrl: assetPath("/hairless-sphynx-cat-with-wrinkled-skin.jpg"),
    correctBreed: "スフィンクス",
    options: ["スフィンクス", "ドンスコイ", "ペテルボルド", "コーニッシュレックス"],
    description: "毛がなく、しわのある皮膚が特徴的な猫です",
  },
  {
    id: "norwegian_forest",
    imageUrl: assetPath("/norwegian-forest-cat-with-long-fur-and-bushy-tail.jpg"),
    correctBreed: "ノルウェージャンフォレストキャット",
    options: ["ノルウェージャンフォレストキャット", "メインクーン", "サイベリアン", "ラグドール"],
    description: "北欧原産の大型長毛猫です",
  },
  {
    id: "american_shorthair",
    imageUrl: assetPath("/american-shorthair-cat-with-silver-tabby-pattern.jpg"),
    correctBreed: "アメリカンショートヘア",
    options: [
      "アメリカンショートヘア",
      "ブリティッシュショートヘア",
      "エキゾチックショートヘア",
      "スコティッシュフォールド",
    ],
    description: "シルバータビーが有名なアメリカ原産の猫です",
  },
  {
    id: "birman",
    imageUrl: assetPath("/birman-cat-with-colorpoint-pattern-and-white-paws.jpg"),
    correctBreed: "バーマン",
    options: ["バーマン", "ラグドール", "ヒマラヤン", "シャム"],
    description: "白い手袋を履いたような足が特徴的です",
  },
  {
    id: "exotic_shorthair",
    imageUrl: assetPath("/exotic-shorthair-cat-with-flat-face-and-short-dens.jpg"),
    correctBreed: "エキゾチックショートヘア",
    options: ["エキゾチックショートヘア", "ペルシャ", "ブリティッシュショートヘア", "スコティッシュフォールド"],
    description: "ペルシャの短毛版とも呼ばれる猫です",
  },
  {
    id: "oriental_shorthair",
    imageUrl: assetPath("/oriental-shorthair-cat-with-large-ears-and-slender.jpg"),
    correctBreed: "オリエンタルショートヘア",
    options: ["オリエンタルショートヘア", "シャム", "コーニッシュレックス", "デボンレックス"],
    description: "大きな耳とスレンダーな体型が特徴です",
  },
  {
    id: "turkish_angora",
    imageUrl: assetPath("/turkish-angora-cat-with-silky-white-long-fur.jpg"),
    correctBreed: "ターキッシュアンゴラ",
    options: ["ターキッシュアンゴラ", "ペルシャ", "メインクーン", "ノルウェージャンフォレストキャット"],
    description: "絹のような美しい長毛が特徴的です",
  },
  {
    id: "manx",
    imageUrl: assetPath("/manx-cat-with-no-tail-and-round-body.jpg"),
    correctBreed: "マンクス",
    options: ["マンクス", "ブリティッシュショートヘア", "アメリカンショートヘア", "スコティッシュフォールド"],
    description: "しっぽがない（または短い）ことで有名な猫です",
  },
  {
    id: "somali",
    imageUrl: assetPath("/somali-cat-with-long-ticked-coat-and-bushy-tail.jpg"),
    correctBreed: "ソマリ",
    options: ["ソマリ", "アビシニアン", "メインクーン", "ノルウェージャンフォレストキャット"],
    description: "アビシニアンの長毛版とも呼ばれます",
  },
  {
    id: "japanese_bobtail",
    imageUrl: assetPath("/japanese-bobtail-cat-with-short-curved-tail.jpg"),
    correctBreed: "ジャパニーズボブテイル",
    options: ["ジャパニーズボブテイル", "マンクス", "アメリカンショートヘア", "ブリティッシュショートヘア"],
    description: "短くカーブした尻尾が特徴的な日本原産の猫です",
  },
  {
    id: "cornish_rex",
    imageUrl: assetPath("/cornish-rex-cat-with-curly-coat-and-large-ears.jpg"),
    correctBreed: "コーニッシュレックス",
    options: ["コーニッシュレックス", "デボンレックス", "オリエンタルショートヘア", "スフィンクス"],
    description: "カールした被毛と大きな耳が特徴的です",
  },
]

const TIME_PER_QUESTION = 15000 // 15秒

export function CatBreedQuiz() {
  const [gameState, setGameState] = useState<BreedQuizState>("idle")
  const [sessionQuestions, setSessionQuestions] = useState<BreedQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [questionCount, setQuestionCount] = useState<5 | 10>(10)
  const [timeProgress, setTimeProgress] = useState(100)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [highScore, setHighScore] = useLocalStorage("catBreedQuizHighScore", 0)

  const animationFrameRef = useRef<number | null>(null)

  const startQuiz = () => {
    const shuffled = [...BREED_QUESTIONS].sort(() => 0.5 - Math.random())
    // 各問題の選択肢もシャッフルする
    const questionsWithShuffledOptions = shuffled.slice(0, questionCount).map((q) => ({
      ...q,
      options: [...q.options].sort(() => 0.5 - Math.random()) as [string, string, string, string],
    }))
    setSessionQuestions(questionsWithShuffledOptions)

    setGameState("playing")
    setCurrentQuestionIndex(0)
    setScore(0)
    setCorrectCount(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setIsTimedOut(false)
    setShowDescription(false)
    setShowHint(false)
    setImageLoaded(false)
    setQuestionStartTime(Date.now())
    setTimeProgress(100)
  }

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setIsTimedOut(false)
      setShowDescription(false)
      setShowHint(false)
      setImageLoaded(false)
      setQuestionStartTime(Date.now())
      setTimeProgress(100)
    } else {
      setGameState("finished")
    }
  }, [currentQuestionIndex, sessionQuestions.length])

  const handleAnswerClick = useCallback(
    (answer: string | null) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      if (isAnswered) return
      setIsAnswered(true)

      if (answer === null) {
        setIsTimedOut(true)
      } else {
        setSelectedAnswer(answer)
        if (sessionQuestions.length > 0 && answer === sessionQuestions[currentQuestionIndex].correctBreed) {
          const timeTaken = Date.now() - questionStartTime
          const points = Math.floor(Math.max(0, TIME_PER_QUESTION - timeTaken) / 100) + 10
          setScore((prev) => prev + points)
          setCorrectCount((value) => value + 1)
        }
      }

      setShowDescription(true)
    },
    [isAnswered, currentQuestionIndex, questionStartTime, nextQuestion, sessionQuestions],
  )

  useEffect(() => {
    if (gameState === "playing" && !isAnswered && imageLoaded) {
      const animate = () => {
        const elapsed = Date.now() - questionStartTime
        const adjustedElapsed = Math.max(0, elapsed - 40)
        const remaining = TIME_PER_QUESTION - adjustedElapsed

        if (remaining <= 0) {
          setTimeProgress(0)
          handleAnswerClick(null)
        } else {
          setTimeProgress((remaining / TIME_PER_QUESTION) * 100)
          animationFrameRef.current = requestAnimationFrame(animate)
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, isAnswered, questionStartTime, handleAnswerClick, imageLoaded])

  useEffect(() => {
    if (gameState === "finished" && score > highScore) {
      setHighScore(score)
    }
  }, [gameState, score, highScore, setHighScore])

  const renderContent = () => {
    if (gameState === "finished") {
      const stars = correctCount >= sessionQuestions.length * 0.8 ? 3 : correctCount >= sessionQuestions.length * 0.5 ? 2 : 1
      return (
        <div className="game-result-view">
          <Trophy className="game-result-trophy" aria-hidden="true" />
          <p className="game-result-kicker">品種クイズ終了！</p>
          <h3>{correctCount} / {sessionQuestions.length}問正解</h3>
          <div className="game-result-stars" aria-label={`${stars}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= stars ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{score}点をゲット。写真の特徴を見つける目が、ぐんと育ったね！</p>
          <div className="game-result-record"><Camera aria-hidden="true" /><span>ハイスコア</span><strong>{Math.max(score, highScore)}点</strong></div>
          <GamePrimaryButton onClick={startQuiz}><RotateCcw aria-hidden="true" />もう一度挑戦</GamePrimaryButton>
          <button type="button" className="game-secondary-button" onClick={() => setGameState("idle")}>問題数を変える</button>
        </div>
      )
    }

    if (gameState === "playing") {
      if (sessionQuestions.length === 0) {
        return <div>クイズを準備中...</div>
      }
      const currentQuestion = sessionQuestions[currentQuestionIndex]
      return (
        <div className="quiz-play-view breed-quiz-view">
          <div className="game-stats-row">
            <GameStat icon={Camera} label="問題" value={`${currentQuestionIndex + 1}/${sessionQuestions.length}`} />
            <GameStat icon={Sparkles} label="正解" value={`${correctCount}問`} />
            <GameStat icon={Trophy} label="スコア" value={`${score}点`} />
          </div>
          <div className="quiz-time-track" aria-label={`残り時間${Math.ceil(timeProgress / (100 / 15))}秒`}><span style={{ width: `${timeProgress}%` }} /></div>

          {/* 猫の画像 */}
          <div className="breed-photo-card">
            {isTimedOut && (
              <span className="quiz-timeout"><Timer aria-hidden="true" />時間切れ</span>
            )}
            <Image src={currentQuestion.imageUrl || assetPath("/placeholder.svg")} alt="品種を当てる猫の写真" width={520} height={420} priority={currentQuestionIndex === 0} onLoad={() => { setQuestionStartTime(Date.now()); setImageLoaded(true) }} />
            {!imageLoaded && <span className="breed-photo-loading">写真を準備中…</span>}
            <span className="breed-photo-number">第{currentQuestionIndex + 1}問</span>
          </div>

          <div className="breed-question-heading"><h3>この猫の品種は？</h3>{!isAnswered && <button type="button" onClick={() => setShowHint(true)} disabled={showHint}><Lightbulb aria-hidden="true" />ヒント</button>}</div>
          {showHint && !showDescription && <div className="breed-hint"><Eye aria-hidden="true" /><p>{currentQuestion.description}</p></div>}

          <div className="quiz-options">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correctBreed
              const state = isAnswered ? isCorrect ? "correct" : selectedAnswer === option ? "wrong" : "muted" : "ready"

              return (
                <button type="button"
                  key={option}
                  onClick={() => handleAnswerClick(option)}
                  disabled={isAnswered}
                  data-state={state}
                >
                  {option}
                  {isAnswered && isCorrect && <CheckCircle aria-hidden="true" />}
                  {isAnswered && selectedAnswer === option && !isCorrect && <XCircle aria-hidden="true" />}
                </button>
              )
            })}
          </div>
          {showDescription && (
            <div className={`quiz-feedback ${selectedAnswer === currentQuestion.correctBreed ? "is-correct" : "is-wrong"}`} aria-live="polite">
              <div><strong>{currentQuestion.correctBreed}</strong><p>{currentQuestion.description}</p></div>
              <button type="button" onClick={nextQuestion}>{currentQuestionIndex === sessionQuestions.length - 1 ? "結果を見る" : "次の写真"}<ArrowRight aria-hidden="true" /></button>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="game-start-view">
        <div className="game-intro-mark"><Camera aria-hidden="true" /></div>
        <h3>写真をよく見て当てよう</h3>
        <p>20品種からランダム出題。写真の毛・耳・顔の形を観察して、迷ったらヒントも使えます。</p>
        <div className="game-mode-options">
          {[5, 10].map((count) => <button key={count} type="button" className={questionCount === count ? "is-selected" : ""} onClick={() => setQuestionCount(count as 5 | 10)} aria-pressed={questionCount === count}>
            <strong>{count}問コース</strong><span>{count === 5 ? "まずは気軽に" : "猫博士を目指す"}</span>
          </button>)}
        </div>
        <div className="game-record-pill"><Trophy aria-hidden="true" />ハイスコア <strong>{highScore}点</strong></div>
        <GamePrimaryButton onClick={startQuiz}><Play aria-hidden="true" />写真クイズ開始</GamePrimaryButton>
      </div>
    )
  }

  return <GameShell title="ねこ品種クイズ" subtitle="写真の特徴を観察して、20種類の猫を見分けよう。" icon={Camera} tone="butter">{renderContent()}</GameShell>
}
