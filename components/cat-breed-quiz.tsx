"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { assetPath } from "@/lib/utils"
import { ArrowRight, Camera, CheckCircle, Eye, Lightbulb, Play, RotateCcw, Sparkles, Star, Timer, Trophy, XCircle } from "lucide-react"
import { isFiniteNumberRecord, useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"
import { useProgression } from "@/components/progression-provider"
import { createEventId } from "@/lib/progression"

type BreedQuizState = "idle" | "playing" | "finished"
type GlobalDifficulty = "gentle" | "standard" | "challenge"
type QuestionCount = 5 | 10

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
    description: "青い目と、顔・耳・足先などが濃い色になるポイントカラーが美しい猫です",
  },
  {
    id: "maine_coon",
    imageUrl: assetPath("/large-maine-coon-cat-with-long-fur-and-tufted-ears.jpg"),
    correctBreed: "メインクーン",
    options: ["メインクーン", "ノルウェージャンフォレストキャット", "サイベリアン", "ラグドール"],
    description: "大型で、耳先に房毛（ふさげ）がある猫です",
  },
  {
    id: "british_shorthair",
    imageUrl: assetPath("/british-shorthair-cat-with-round-face-and-dense-gr.jpg"),
    correctBreed: "ブリティッシュショートヘア",
    options: ["ブリティッシュショートヘア", "ロシアンブルー", "シャルトリュー", "スコティッシュフォールド"],
    description: "丸い顔と、密な被毛（ひもう・体をおおう毛）が特徴的な猫です",
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
    description: "銀青色の美しい被毛（ひもう・体をおおう毛）と緑の目が特徴です",
  },
  {
    id: "abyssinian",
    imageUrl: assetPath("/abyssinian-cat-with-ticked-coat-and-large-ears.jpg"),
    correctBreed: "アビシニアン",
    options: ["アビシニアン", "ソマリ", "ベンガル", "オシキャット"],
    description: "一本の毛に何色かが入るティックドコートと、大きな耳が特徴的です",
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
    description: "北欧（ヨーロッパ北部）で生まれた、大型の長毛猫です",
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
    description: "大きな耳と、ほっそりした体つきが特徴です",
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
    description: "カールした被毛（ひもう・体をおおう毛）と大きな耳が特徴的です",
  },
]

const TIME_PER_QUESTION = 15000 // 15秒
const recordKeyFor = (mode: GlobalDifficulty, questionCount: QuestionCount) => `${mode}:${questionCount}`

const BREED_CORRECT_REACTIONS = [
  "美雪『写真だけで正解！』トラちゃんから大きな肉球スタンプが届きました。",
  "大正解！ キキがしっぽをぴんと立てて合格を知らせています。",
  "猫博士級の観察力！ フワも写真の横で得意そうな顔です。",
] as const

function breedReaction(question: BreedQuestion, selectedAnswer: string | null, timedOut: boolean, index: number) {
  if (timedOut) return "時間切れでも特徴を読めば収穫あり。耳・目・毛・しっぽを順番に見てみよう。"
  if (selectedAnswer === question.correctBreed) return BREED_CORRECT_REACTIONS[index % BREED_CORRECT_REACTIONS.length]
  if ((selectedAnswer?.length ?? 0) >= 16) return `美雪『正解は${question.correctBreed}！ 長い名前は、区切って覚えると分かりやすいよ』`
  return `美雪『正解は${question.correctBreed}！』写真の耳・目・毛・しっぽをもう一度見てみよう。`
}

function breedResultCopy(correct: number, total: number) {
  const ratio = total ? correct / total : 0
  if (ratio === 1) return "全問正解で猫写真館の名誉館長！ 三匹から金の肉球スタンプです。"
  if (ratio >= 0.8) return "見分ける目はかなり本格派。トラちゃん、キキ、フワも拍手しています。"
  if (ratio >= 0.5) return "半分以上正解！ 特徴メモを見返せば、もっと見分けられそうです。"
  return "名前が長い品種も、耳・目・毛・しっぽに分ければ覚えやすいよ。"
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

export function CatBreedQuiz() {
  const { state, recordEvent } = useProgression()
  const [gameState, setGameState] = useState<BreedQuizState>("idle")
  const [sessionQuestions, setSessionQuestions] = useState<BreedQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)
  const [runQuestionCount, setRunQuestionCount] = useState<QuestionCount>(10)
  const [runGlobalDifficulty, setRunGlobalDifficulty] = useState<GlobalDifficulty>("standard")
  const [timeProgress, setTimeProgress] = useState(100)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [highScores, setHighScores] = useLocalStorage<Record<string, number>>("catBreedQuizHighScoresV2", {}, isFiniteNumberRecord)
  const [recordSaveFailed, setRecordSaveFailed] = useState(false)

  const animationFrameRef = useRef<number | null>(null)
  const focusFrameRef = useRef<number | null>(null)
  const gameStateRef = useRef<BreedQuizState>("idle")
  const answeredRef = useRef(false)
  const advancingRef = useRef(false)
  const imageLoadedRef = useRef(false)
  const completionEventIdRef = useRef<string | null>(null)
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const feedbackButtonRef = useRef<HTMLButtonElement | null>(null)
  const setupHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const returningToSetupRef = useRef(false)
  const globalDifficulty = state.settings.difficulty as GlobalDifficulty
  const activeGlobalDifficulty = gameState === "idle" ? globalDifficulty : runGlobalDifficulty
  const effectiveTimePerQuestion = activeGlobalDifficulty === "gentle" ? null : activeGlobalDifficulty === "challenge" ? 10000 : TIME_PER_QUESTION

  const recordCompletion = useCallback(() => {
    const eventId = completionEventIdRef.current
    if (!eventId) return
    completionEventIdRef.current = null
    recordEvent({
      type: "game.completed",
      eventId,
      occurredAt: new Date().toISOString(),
      gameId: "breed",
      score: Math.round((score / Math.max(1, sessionQuestions.length)) * (1000 / 160)),
      won: sessionQuestions.length > 0 && correctCount >= Math.ceil(sessionQuestions.length / 2),
    })
  }, [correctCount, recordEvent, score, sessionQuestions.length])

  const startQuiz = () => {
    if (gameStateRef.current !== "idle" && gameStateRef.current !== "finished") return
    gameStateRef.current = "playing"
    answeredRef.current = false
    advancingRef.current = false
    imageLoadedRef.current = false
    completionEventIdRef.current = createEventId("game-breed")
    setRunQuestionCount(questionCount)
    setRunGlobalDifficulty(globalDifficulty)
    const shuffled = shuffle(BREED_QUESTIONS)
    // 各問題の選択肢もシャッフルする
    const questionsWithShuffledOptions = shuffled.slice(0, questionCount).map((q) => ({
      ...q,
      options: shuffle(q.options) as [string, string, string, string],
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
    setImageFailed(false)
    setRecordSaveFailed(false)
    setQuestionStartTime(Date.now())
    setTimeProgress(100)
  }

  const nextQuestion = useCallback(() => {
    if (gameStateRef.current !== "playing" || !answeredRef.current || advancingRef.current) return
    advancingRef.current = true
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      answeredRef.current = false
      imageLoadedRef.current = false
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setIsTimedOut(false)
      setShowDescription(false)
      setShowHint(false)
      setImageLoaded(false)
      setImageFailed(false)
      setQuestionStartTime(Date.now())
      setTimeProgress(100)
    } else {
      gameStateRef.current = "finished"
      recordCompletion()
      setGameState("finished")
    }
  }, [currentQuestionIndex, recordCompletion, sessionQuestions.length])

  const handleAnswerClick = useCallback(
    (answer: string | null) => {
      if (gameStateRef.current !== "playing" || answeredRef.current || (!imageLoadedRef.current && answer !== null)) return
      answeredRef.current = true
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      setIsAnswered(true)

      if (answer === null) {
        setIsTimedOut(true)
      } else {
        setSelectedAnswer(answer)
        if (sessionQuestions.length > 0 && answer === sessionQuestions[currentQuestionIndex].correctBreed) {
          const points = effectiveTimePerQuestion === null
            ? 160
            : Math.floor((Math.max(0, effectiveTimePerQuestion - (Date.now() - questionStartTime)) / effectiveTimePerQuestion) * 150) + 10
          setScore((prev) => prev + points)
          setCorrectCount((value) => value + 1)
        }
      }

      setShowDescription(true)
    },
    [effectiveTimePerQuestion, currentQuestionIndex, questionStartTime, sessionQuestions],
  )

  useEffect(() => {
    if (gameState === "playing" && !isAnswered && imageLoaded && effectiveTimePerQuestion !== null) {
      const animate = () => {
        const elapsed = Date.now() - questionStartTime
        const adjustedElapsed = Math.max(0, elapsed - 40)
        const remaining = effectiveTimePerQuestion - adjustedElapsed

        if (remaining <= 0) {
          setTimeProgress(0)
          handleAnswerClick(null)
        } else {
          setTimeProgress((remaining / effectiveTimePerQuestion) * 100)
          animationFrameRef.current = requestAnimationFrame(animate)
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [effectiveTimePerQuestion, gameState, isAnswered, questionStartTime, handleAnswerClick, imageLoaded])

  useEffect(() => {
    if (gameState === "playing" && !isAnswered) focusFrameRef.current = window.requestAnimationFrame(() => questionHeadingRef.current?.focus())
    if (gameState === "playing" && isAnswered) focusFrameRef.current = window.requestAnimationFrame(() => feedbackButtonRef.current?.focus())
    if (gameState === "finished") focusFrameRef.current = window.requestAnimationFrame(() => resultHeadingRef.current?.focus())
    if (gameState === "idle" && returningToSetupRef.current) {
      returningToSetupRef.current = false
      focusFrameRef.current = window.requestAnimationFrame(() => setupHeadingRef.current?.focus())
    }
    return () => {
      if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
      focusFrameRef.current = null
    }
  }, [currentQuestionIndex, gameState, isAnswered])

  useEffect(() => {
    if (gameState === "playing") advancingRef.current = false
  }, [currentQuestionIndex, gameState])

  useEffect(() => {
    if (gameState !== "finished") return
    const recordKey = recordKeyFor(runGlobalDifficulty, runQuestionCount)
    if (score > (highScores[recordKey] ?? 0)) setRecordSaveFailed(!setHighScores({ ...highScores, [recordKey]: score }))
    recordCompletion()
  }, [gameState, highScores, recordCompletion, runGlobalDifficulty, runQuestionCount, score, setHighScores])

  const returnToSetup = () => {
    returningToSetupRef.current = true
    gameStateRef.current = "idle"
    answeredRef.current = false
    advancingRef.current = false
    imageLoadedRef.current = false
    setImageFailed(false)
    setGameState("idle")
  }

  const renderContent = () => {
    if (gameState === "finished") {
      const stars = correctCount >= sessionQuestions.length * 0.8 ? 3 : correctCount >= sessionQuestions.length * 0.5 ? 2 : 1
      return (
        <div className="game-result-view">
          <Trophy className="game-result-trophy" aria-hidden="true" />
          <p className="game-result-kicker">品種クイズ終了！</p>
          <h3 ref={resultHeadingRef} tabIndex={-1}>{correctCount} / {sessionQuestions.length}問正解</h3>
          <div className="game-result-stars" aria-label={`${stars}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= stars ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{score}点。耳・顔・毛並みを観察して見分けた記録です。</p>
          <p>{breedResultCopy(correctCount, sessionQuestions.length)}</p>
          <div className="game-result-record"><Camera aria-hidden="true" /><span>{recordSaveFailed ? "保存ずみのベスト" : `${runQuestionCount}問コースのベスト`}</span><strong>{recordSaveFailed ? (highScores[recordKeyFor(runGlobalDifficulty, runQuestionCount)] ?? 0) : Math.max(score, highScores[recordKeyFor(runGlobalDifficulty, runQuestionCount)] ?? 0)}点</strong></div>
          {recordSaveFailed ? <p role="status">今回の新記録は端末に保存できませんでした。</p> : null}
          <GamePrimaryButton onClick={startQuiz}><RotateCcw aria-hidden="true" />もう一度挑戦</GamePrimaryButton>
          <button type="button" className="game-secondary-button" onClick={returnToSetup}>問題数を変える</button>
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
          {effectiveTimePerQuestion === null
            ? <p className="quiz-untimed-note"><Timer aria-hidden="true" />時間制限なし・特徴を比較して回答</p>
            : <div className="quiz-time-track" aria-label={`残り時間${Math.ceil((timeProgress / 100) * (effectiveTimePerQuestion / 1000))}秒`}><span style={{ width: `${timeProgress}%` }} /></div>}

          {/* 猫の画像 */}
          <div className="breed-photo-card">
            {isTimedOut && (
              <span className="quiz-timeout"><Timer aria-hidden="true" />時間切れ</span>
            )}
            <Image
              key={currentQuestion.id}
              src={currentQuestion.imageUrl}
              alt="品種を当てる猫の写真"
              width={520}
              height={420}
              priority={currentQuestionIndex === 0}
              onLoad={() => {
                if (gameStateRef.current !== "playing" || answeredRef.current || imageLoadedRef.current) return
                imageLoadedRef.current = true
                setQuestionStartTime(Date.now())
                setImageLoaded(true)
              }}
              onError={() => {
                if (gameStateRef.current !== "playing" || answeredRef.current || imageLoadedRef.current) return
                imageLoadedRef.current = true
                setQuestionStartTime(Date.now())
                setImageLoaded(true)
                setImageFailed(true)
                setShowHint(true)
              }}
            />
            {!imageLoaded && <span className="breed-photo-loading">写真を準備中…</span>}
            {imageFailed && <span className="breed-photo-loading" role="status">写真を読み込めなかったため、ヒントを表示しています。</span>}
            <span className="breed-photo-number">第{currentQuestionIndex + 1}問</span>
          </div>

          <div className="breed-question-heading">
            <h3 ref={questionHeadingRef} tabIndex={-1}>この猫の品種は？</h3>
            {!isAnswered && (
              <button
                type="button"
                onClick={() => setShowHint((value) => !value)}
                aria-expanded={showHint}
                aria-controls="breed-question-hint"
              >
                <Lightbulb aria-hidden="true" />{showHint ? "ヒントを閉じる" : "ヒント"}
              </button>
            )}
          </div>
          <div id="breed-question-hint" className="breed-hint" role="status" aria-live="polite" hidden={!showHint || showDescription}>
            <Eye aria-hidden="true" /><p>{currentQuestion.description}</p>
          </div>

          <div className="quiz-options">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correctBreed
              const state = isAnswered ? isCorrect ? "correct" : selectedAnswer === option ? "wrong" : "muted" : "ready"

              return (
                <button type="button"
                  key={option}
                  onClick={() => handleAnswerClick(option)}
                  disabled={!imageLoaded || isAnswered}
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
              <div><strong>{currentQuestion.correctBreed}</strong><p>{currentQuestion.description}</p><p>{breedReaction(currentQuestion, selectedAnswer, isTimedOut, currentQuestionIndex)}</p></div>
              <button ref={feedbackButtonRef} type="button" onClick={nextQuestion}>{currentQuestionIndex === sessionQuestions.length - 1 ? "結果を見る" : "次の写真"}<ArrowRight aria-hidden="true" /></button>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="game-start-view">
        <div className="game-intro-mark"><Camera aria-hidden="true" /></div>
        <h3 ref={setupHeadingRef} tabIndex={-1}>猫品種・観察力テスト</h3>
        <p>20品種からランダム出題。{effectiveTimePerQuestion === null ? "時間制限なしで" : `1問${effectiveTimePerQuestion / 1000}秒で`}、迷ったら開閉できるヒントも使えます。</p>
        <div className="game-mode-options">
          {[5, 10].map((count) => <button key={count} type="button" className={questionCount === count ? "is-selected" : ""} onClick={() => setQuestionCount(count as QuestionCount)} aria-pressed={questionCount === count}>
            <strong>{count === 5 ? "5問スプリント" : "10問検定"}</strong><span>{count === 5 ? "特徴を短時間で確認" : "観察記録を更新"}</span>
          </button>)}
        </div>
        <div className="game-record-pill"><Trophy aria-hidden="true" />このコースのベスト <strong>{highScores[recordKeyFor(globalDifficulty, questionCount)] ?? 0}点</strong></div>
        <GamePrimaryButton onClick={startQuiz}><Play aria-hidden="true" />写真クイズ開始</GamePrimaryButton>
      </div>
    )
  }

  return <GameShell title="ねこ品種クイズ" subtitle="写真の特徴を観察して、20種類の猫を見分けよう。" icon={Camera} tone="butter">{renderContent()}</GameShell>
}
