"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BrainCircuit, Trophy, Play, RotateCcw, CheckCircle, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useLocalStorage } from "@/hooks/use-local-storage"

type QuizGameState = "idle" | "playing" | "finished"

type QuizQuestion = {
  question: string
  options: [string, string, string, string]
  correctAnswer: string
}

const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // Existing 20 questions
  {
    question: "猫が甘いものを感じられないのはなぜ？",
    options: ["舌が小さいから", "甘味の受容体がないから", "甘いものが嫌いだから", "鼻が効きすぎるから"],
    correctAnswer: "甘味の受容体がないから",
  },
  {
    question: "猫の集団のことを英語で何と呼ぶ？",
    options: ["A pack", "A herd", "A clowder", "A school"],
    correctAnswer: "A clowder",
  },
  {
    question: "猫が喉をゴロゴロ鳴らすのは、どんな時？",
    options: ["満足している時だけ", "不安な時だけ", "骨折を治すため", "満足な時も不安な時も"],
    correctAnswer: "満足な時も不安な時も",
  },
  {
    question: "猫のひげの平均的な本数は、片側で何本？",
    options: ["約5本", "約12本", "約20本", "約30本"],
    correctAnswer: "約12本",
  },
  {
    question: "猫が飼い主をゆっくりと瞬きするのは、どんな意味？",
    options: ["眠い", "敵意がない、信頼の証", "目が疲れている", "獲物を狙っている"],
    correctAnswer: "敵意がない、信頼の証",
  },
  {
    question: "世界で最も多くのギネス記録を持つ猫の種類は？",
    options: ["メインクーン", "シャム", "ペルシャ", "特にない"],
    correctAnswer: "メインクーン",
  },
  {
    question: "猫の鎖骨はどうなっている？",
    options: ["人間と同じ形", "とても太い", "存在しない", "体に埋まっている"],
    correctAnswer: "体に埋まっている",
  },
  {
    question: "猫が自分の身長の何倍までジャンプできる？",
    options: ["約2倍", "約3倍", "約5倍", "約10倍"],
    correctAnswer: "約5倍",
  },
  {
    question: "猫がマタタビに反応する原因となる成分は？",
    options: ["マタタビン", "ネペタラクトン", "カプサイシン", "カフェイン"],
    correctAnswer: "ネペタラクトン",
  },
  {
    question: "猫の平熱は、人間と比べてどう？",
    options: ["同じくらい", "低い", "高い", "季節によって変わる"],
    correctAnswer: "高い",
  },
  {
    question: "猫の「フレーメン反応」とは、何をしている時？",
    options: ["怒っている時", "獲物を見つけた時", "匂いを詳しく分析している時", "眠い時"],
    correctAnswer: "匂いを詳しく分析している時",
  },
  {
    question: "三毛猫のオスが非常に珍しい理由は何？",
    options: ["体が弱いから", "毛の色を決める遺伝子が性染色体上にあるから", "メスに人気がないから", "模様が複雑だから"],
    correctAnswer: "毛の色を決める遺伝子が性染色体上にあるから",
  },
  {
    question: "猫が箱や狭い場所に入りたがるのはなぜ？",
    options: ["体が柔らかいから", "暗い場所が好きだから", "安心できるから", "ただの遊び"],
    correctAnswer: "安心できるから",
  },
  {
    question: "猫の「肉球」の主な役割でないものはどれ？",
    options: ["汗をかく", "滑り止め", "獲物を捕まえる", "衝撃を吸収する"],
    correctAnswer: "獲物を捕まえる",
  },
  {
    question: "猫の目が暗闇で光って見えるのはなぜ？",
    options: ["目に電気があるから", "網膜の後ろにあるタペタムが光を反射するから", "目が大きいから", "水晶体が光るから"],
    correctAnswer: "網膜の後ろにあるタペタムが光を反射するから",
  },
  {
    question: "猫が前足でふみふみする行動の由来は？",
    options: ["ストレッチ", "子猫が母乳を飲むときの名残", "マーキング", "飼い主への愛情表現"],
    correctAnswer: "子猫が母乳を飲むときの名残",
  },
  {
    question: "「猫に小判」ということわざの意味は？",
    options: ["猫は賢い", "価値のわからない人に貴重なものを与えても無駄", "猫は小判が好き", "猫は金運を呼ぶ"],
    correctAnswer: "価値のわからない人に貴重なものを与えても無駄",
  },
  {
    question: "猫のしっぽの付け根を叩くと喜ぶことがあるのはなぜ？",
    options: ["そこが一番かゆいから", "神経が集中しているから", "しっぽの筋肉がほぐれるから", "特に意味はない"],
    correctAnswer: "神経が集中しているから",
  },
  {
    question: "猫がよく毛づくろいをする一番の理由は何？",
    options: ["体を清潔に保つため", "暇だから", "飼い主にかまってほしいから", "毛並みを整えるため"],
    correctAnswer: "体を清潔に保つため",
  },
  {
    question: "猫の聴力は人間の何倍優れていると言われている？",
    options: ["ほぼ同じ", "約2倍", "約4倍", "約10倍"],
    correctAnswer: "約4倍",
  },
  // New 20 questions
  {
    question: "猫の視野は、約何度あると言われている？",
    options: ["約120度", "約180度", "約200度", "約360度"],
    correctAnswer: "約200度",
  },
  {
    question: "宇宙に行った最初の猫の名前は何？",
    options: ["ライカ", "フェリセット", "ミスター・ビッグルワース", "ソックス"],
    correctAnswer: "フェリセット",
  },
  {
    question: "ほとんどの猫の指の数は、合計で何本？",
    options: ["16本", "18本", "20本", "22本"],
    correctAnswer: "18本",
  },
  {
    question: "子猫の集団のことを、特に何と呼ぶ？",
    options: ["ア・キンドル", "ア・ギャング", "ア・スクール", "ア・ファミリー"],
    correctAnswer: "ア・キンドル",
  },
  {
    question: "古代、猫を神聖な動物として崇拝していた文明はどこ？",
    options: ["古代ローマ", "古代ギリシャ", "古代エジプト", "古代中国"],
    correctAnswer: "古代エジプト",
  },
  {
    question: "イエネコの学名は何？",
    options: ["Panthera leo", "Canis lupus", "Felis catus", "Mus musculus"],
    correctAnswer: "Felis catus",
  },
  {
    question: "猫のゴロゴロ音の周波数には、どんな効果があると言われている？",
    options: ["虫を追い払う", "骨の治癒を促進する", "植物の成長を助ける", "天気を予測する"],
    correctAnswer: "骨の治癒を促進する",
  },
  {
    question: "猫好きの人を指す言葉は何？",
    options: ["愛猫家（アイビョウカ）", "愛犬家（アイケンカ）", "愛鳥家（アイチョウカ）", "愛魚家（アイギョカ）"],
    correctAnswer: "愛猫家（アイビョウカ）",
  },
  {
    question: "猫が顔をこすりつけてくる主な理由は何？",
    options: ["顔がかゆいから", "愛情表現", "自分の匂いをつけるマーキング行動", "甘えているだけ"],
    correctAnswer: "自分の匂いをつけるマーキング行動",
  },
  {
    question: "室内飼いの猫の平均寿命は、およそ何年？",
    options: ["5～8年", "8～12年", "12～18年", "20年以上"],
    correctAnswer: "12～18年",
  },
  {
    question: "「ヘミングウェイの猫」として知られる、指の数が多い猫を何と呼ぶ？",
    options: ["多指症の猫", "幸運の猫", "六本指の猫", "賢い猫"],
    correctAnswer: "多指症の猫",
  },
  {
    question: "猫は「完全肉食動物」です。これはどういう意味？",
    options: ["肉しか食べられない", "肉を最も好む", "生きるために動物性タンパク質が不可欠", "野菜を食べると病気になる"],
    correctAnswer: "生きるために動物性タンパク質が不可欠",
  },
  {
    question: "猫の妊娠期間は、およそどのくらい？",
    options: ["約1ヶ月", "約2ヶ月", "約3ヶ月", "約4ヶ月"],
    correctAnswer: "約2ヶ月",
  },
  {
    question: "『不思議の国のアリス』に登場する、ニヤニヤ笑う猫の名前は何？",
    options: ["トムキャット", "フィガロ", "チェシャ猫", "ダイナ"],
    correctAnswer: "チェシャ猫",
  },
  {
    question: "猫がしっぽをピンと立てている時、どんな気持ち？",
    options: ["怒っている", "怖がっている", "友好的な挨拶、嬉しい", "警戒している"],
    correctAnswer: "友好的な挨拶、嬉しい",
  },
  {
    question: "世界最古のペットの猫の骨が見つかった場所はどこ？",
    options: ["エジプト", "ギリシャ", "キプロス島", "日本"],
    correctAnswer: "キプロス島",
  },
  {
    question: "猫が獲物を見つけた時に「カカカッ」と鳴く行動を何と呼ぶ？",
    options: ["クラッキング", "チャタリング", "グルーミング", "マーキング"],
    correctAnswer: "チャタリング",
  },
  {
    question: "猫の鼻にある模様のことを何と呼ぶ？",
    options: ["ノーズマーク", "鼻紋（びもん）", "ハナパターン", "キャットスポット"],
    correctAnswer: "鼻紋（びもん）",
  },
  {
    question: "猫の耳の付け根にある袋状の皮膚の部分の名前は何？",
    options: ["ヘンリーのポケット", "猫袋（ねこぶくろ）", "イヤーポーチ", "聴覚ポケット"],
    correctAnswer: "ヘンリーのポケット",
  },
  {
    question: "猫が液体のように狭い場所を通り抜けられる理由の一つは何？",
    options: [
      "骨がとても柔らかいから",
      "鎖骨が体に固定されていないから",
      "体がゼリーでできているから",
      "筋肉が特殊だから",
    ],
    correctAnswer: "鎖骨が体に固定されていないから",
  },
]

const TIME_PER_QUESTION = 10000 // 10秒 (ミリ秒)

export function CatQuiz() {
  const [gameState, setGameState] = useState<QuizGameState>("idle")
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeProgress, setTimeProgress] = useState(100)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [highScore, setHighScore] = useLocalStorage("catQuizHighScore", 0)

  const animationFrameRef = useRef<number | null>(null)

  const startQuiz = () => {
    const shuffled = [...ALL_QUIZ_QUESTIONS].sort(() => 0.5 - Math.random())
    setSessionQuestions(shuffled.slice(0, 10))

    setGameState("playing")
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setIsTimedOut(false)
    setQuestionStartTime(Date.now())
    setTimeProgress(100)
  }

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setIsTimedOut(false)
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
        if (sessionQuestions.length > 0 && answer === sessionQuestions[currentQuestionIndex].correctAnswer) {
          const timeTaken = Date.now() - questionStartTime
          const points = Math.floor(Math.max(0, TIME_PER_QUESTION - timeTaken) / 10)
          setScore((prev) => prev + points)
        }
      }

      setTimeout(() => {
        nextQuestion()
      }, 2000)
    },
    [isAnswered, currentQuestionIndex, questionStartTime, nextQuestion, sessionQuestions],
  )

  useEffect(() => {
    if (gameState === "playing" && !isAnswered) {
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
  }, [gameState, isAnswered, questionStartTime, handleAnswerClick])

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
          <div className="relative w-full min-h-[8rem] flex items-center justify-center">
            {isTimedOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-lg">
                <p className="text-white font-bold text-3xl animate-ping-once">時間切れ！</p>
              </div>
            )}
            <p className="text-lg md:text-xl font-bold text-center">{currentQuestion.question}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correctAnswer
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
        <h3 className="text-lg md:text-xl font-bold">にゃんこクイズ</h3>
        <p className="text-sm md:text-base">
          猫に関する40問の中からランダムで10問出題！
          <br />
          1問10秒、早く答えるほど高得点だよ。
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
            <BrainCircuit className="w-5 h-5 md:w-6 md:h-6" />
            <span>にゃんこクイズ</span>
            <BrainCircuit className="w-5 h-5 md:w-6 md:h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[28rem] md:min-h-[32rem] p-4 md:p-6">
          {renderContent()}
        </CardContent>
      </Card>
    </section>
  )
}
