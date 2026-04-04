"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { assetPath } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Play, RotateCcw, CheckCircle, XCircle, Camera } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

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
  const [timeProgress, setTimeProgress] = useState(100)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(true) // デフォルトをtrueに変更
  const [highScore, setHighScore] = useLocalStorage("catBreedQuizHighScore", 0)

  const animationFrameRef = useRef<number | null>(null)

  const startQuiz = () => {
    const shuffled = [...BREED_QUESTIONS].sort(() => 0.5 - Math.random())
    // 各問題の選択肢もシャッフルする
    const questionsWithShuffledOptions = shuffled.slice(0, 10).map((q) => ({
      ...q,
      options: [...q.options].sort(() => 0.5 - Math.random()) as [string, string, string, string],
    }))
    setSessionQuestions(questionsWithShuffledOptions)

    setGameState("playing")
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setIsTimedOut(false)
    setShowDescription(false)
    setImageLoaded(true)
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
      setImageLoaded(true)
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
        }
      }

      setShowDescription(true)

      setTimeout(() => {
        nextQuestion()
      }, 3000)
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
      return (
        <div className="text-center space-y-4 flex flex-col items-center">
          <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
          <h3 className="text-xl md:text-2xl font-bold">クイズ終了！</h3>
          <p className="text-3xl md:text-4xl font-bold">{score}点</p>
          <p className="text-lg">ハイスコア: {highScore}点</p>
          <div className="text-sm text-[#8A6E59]">
            <p>
              正解数: {Math.floor(score / 10)}問 / {sessionQuestions.length}問
            </p>
          </div>
          <Button onClick={startQuiz} className="bg-[#D4A57A] hover:bg-[#C7946A] text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            もう一度挑戦
          </Button>
        </div>
      )
    }

    if (gameState === "playing") {
      if (sessionQuestions.length === 0) {
        return <div>クイズを準備中...</div>
      }
      const currentQuestion = sessionQuestions[currentQuestionIndex]
      return (
        <div className="w-full flex flex-col items-center space-y-4">
          <div className="w-full flex justify-between items-center font-bold">
            <span>
              第{currentQuestionIndex + 1}問 / {sessionQuestions.length}問
            </span>
            <span>スコア: {score}</span>
          </div>
          <div className="w-full space-y-2">
            <Progress value={timeProgress} className="w-full h-3" />
          </div>

          {/* 猫の画像 */}
          <div className="relative w-full max-w-sm mx-auto">
            {isTimedOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-lg">
                <p className="text-white font-bold text-2xl animate-ping-once">時間切れ！</p>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-[#EAD8C0]">
              <Image
                src={currentQuestion.imageUrl || assetPath("/placeholder.svg")}
                alt="猫の品種クイズ"
                width={300}
                height={300}
                className="w-full h-64 object-cover rounded-md"
                priority={currentQuestionIndex === 0}
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg md:text-xl font-bold text-[#8A6E59]">この猫の品種は？</p>
          </div>

          {/* 解説表示 */}
          {showDescription && (
            <div className="w-full max-w-md mx-auto bg-[#FDEEDC]/80 rounded-lg p-3 border border-[#EAD8C0] animate-slide-in-bottom">
              <p className="text-sm text-[#5C3A21] text-center">
                <strong>{currentQuestion.correctBreed}</strong>
                <br />
                {currentQuestion.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correctBreed
              let buttonClass = "bg-[#D4A57A] hover:bg-[#C7946A]"
              if (isAnswered) {
                if (isCorrect) {
                  buttonClass = "bg-green-500 hover:bg-green-600"
                } else if (selectedAnswer === option) {
                  buttonClass = "bg-red-500 hover:bg-red-600"
                }
              }

              return (
                <Button
                  key={option}
                  onClick={() => handleAnswerClick(option)}
                  disabled={isAnswered}
                  className={`text-white h-auto min-h-[3rem] py-2 whitespace-normal transition-all duration-300 ${buttonClass}`}
                >
                  {option}
                  {isAnswered && isCorrect && <CheckCircle className="ml-2" />}
                  {isAnswered && selectedAnswer === option && !isCorrect && <XCircle className="ml-2" />}
                </Button>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg md:text-xl font-bold">ねこ品種クイズ</h3>
        <p className="text-sm md:text-base">
          猫の写真を見て品種を当てよう！
          <br />
          20品種の中からランダムで10問出題。
          <br />
          1問15秒、早く答えるほど高得点だよ。
        </p>
        <p className="font-bold">ハイスコア: {highScore}点</p>
        <Button onClick={startQuiz} className="bg-[#D4A57A] hover:bg-[#C7946A] text-white">
          <Play className="w-4 h-4 mr-2" />
          クイズ開始
        </Button>
      </div>
    )
  }

  return (
    <section className="w-full">
      <Card className="bg-white/80 border-2 border-dashed border-[#EAD8C0]/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardHeader className="bg-[#FDEEDC]/60 rounded-t-lg">
          <CardTitle className="flex items-center justify-center text-xl md:text-2xl space-x-2">
            <Camera className="w-5 h-5 md:w-6 md:h-6" />
            <span>ねこ品種クイズ</span>
            <Camera className="w-5 h-5 md:w-6 md:h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[32rem] md:min-h-[36rem] p-4 md:p-6">
          {renderContent()}
        </CardContent>
      </Card>
    </section>
  )
}
