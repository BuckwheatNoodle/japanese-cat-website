"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowRight, BrainCircuit, CheckCircle, Clock3, Play, RotateCcw, Sparkles, Star, Timer, Trophy, XCircle } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"

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
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [questionCount, setQuestionCount] = useState<5 | 10>(10)
  const [timeProgress, setTimeProgress] = useState(100)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [highScore, setHighScore] = useLocalStorage("catQuizHighScore", 0)

  const animationFrameRef = useRef<number | null>(null)

  const startQuiz = () => {
    const shuffled = [...ALL_QUIZ_QUESTIONS].sort(() => 0.5 - Math.random())
    setSessionQuestions(shuffled.slice(0, questionCount))

    setGameState("playing")
    setCurrentQuestionIndex(0)
    setScore(0)
    setCorrectCount(0)
    setStreak(0)
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
        setStreak(0)
      } else {
        setSelectedAnswer(answer)
        if (sessionQuestions.length > 0 && answer === sessionQuestions[currentQuestionIndex].correctAnswer) {
          const timeTaken = Date.now() - questionStartTime
          const points = Math.floor(Math.max(0, TIME_PER_QUESTION - timeTaken) / 10)
          setScore((prev) => prev + points)
          setCorrectCount((value) => value + 1)
          setStreak((value) => value + 1)
        } else {
          setStreak(0)
        }
      }
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
      const stars = correctCount >= sessionQuestions.length * 0.8 ? 3 : correctCount >= sessionQuestions.length * 0.5 ? 2 : 1
      return (
        <div className="game-result-view">
          <Trophy className="game-result-trophy" aria-hidden="true" />
          <p className="game-result-kicker">クイズ終了！</p>
          <h3>{correctCount} / {sessionQuestions.length}問正解</h3>
          <div className="game-result-stars" aria-label={`${stars}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= stars ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{score}点をゲット。答えを読んで、猫博士にまた一歩近づいたね！</p>
          <div className="game-result-record"><Clock3 aria-hidden="true" /><span>ハイスコア</span><strong>{Math.max(score, highScore)}点</strong></div>
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
        <div className="quiz-play-view">
          <div className="game-stats-row">
            <GameStat icon={BrainCircuit} label="問題" value={`${currentQuestionIndex + 1}/${sessionQuestions.length}`} />
            <GameStat icon={Sparkles} label="連続正解" value={`${streak}問`} />
            <GameStat icon={Trophy} label="スコア" value={`${score}点`} />
          </div>
          <div className="quiz-time-track" aria-label={`残り時間${Math.ceil(timeProgress / 10)}秒`}><span style={{ width: `${timeProgress}%` }} /></div>
          <div className="quiz-question-card">
            {isTimedOut && (
              <span className="quiz-timeout"><Timer aria-hidden="true" />時間切れ</span>
            )}
            <small>第{currentQuestionIndex + 1}問</small>
            <h3>{currentQuestion.question}</h3>
          </div>
          <div className="quiz-options">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correctAnswer
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
          {isAnswered && (
            <div className={`quiz-feedback ${selectedAnswer === currentQuestion.correctAnswer ? "is-correct" : "is-wrong"}`} aria-live="polite">
              <div><strong>{selectedAnswer === currentQuestion.correctAnswer ? "正解！" : "正解はこちら"}</strong><p>{currentQuestion.correctAnswer}</p></div>
              <button type="button" onClick={nextQuestion}>{currentQuestionIndex === sessionQuestions.length - 1 ? "結果を見る" : "次の問題"}<ArrowRight aria-hidden="true" /></button>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="game-start-view">
        <div className="game-intro-mark"><BrainCircuit aria-hidden="true" /></div>
        <h3>猫博士にチャレンジ</h3>
        <p>40問からランダム出題。1問10秒で、答えたあとは正解を読んでから自分のペースで次へ進めます。</p>
        <div className="game-mode-options" aria-label="問題数を選ぶ">
          {[5, 10].map((count) => <button key={count} type="button" className={questionCount === count ? "is-selected" : ""} onClick={() => setQuestionCount(count as 5 | 10)} aria-pressed={questionCount === count}>
            <strong>{count}問コース</strong><span>{count === 5 ? "さくっと遊ぶ" : "たっぷり挑戦"}</span>
          </button>)}
        </div>
        <div className="game-record-pill"><Trophy aria-hidden="true" />ハイスコア <strong>{highScore}点</strong></div>
        <GamePrimaryButton onClick={startQuiz}><Play aria-hidden="true" />クイズ開始</GamePrimaryButton>
      </div>
    )
  }

  return <GameShell title="にゃんこクイズ" subtitle="猫のふしぎを知って、答えを読んで、猫博士になろう。" icon={BrainCircuit} tone="mint">{renderContent()}</GameShell>
}
