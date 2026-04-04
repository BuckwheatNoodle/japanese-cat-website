"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopySlash as Crystal, Star, Heart } from "lucide-react"

const CAT_TYPES = [
  "あまえんぼうにゃん",
  "げんきいっぱいにゃん",
  "のんびりにゃん",
  "しっかりものにゃん",
  "おしゃれにゃん",
  "おちゃめにゃん",
  "つよがりにゃん",
  "やさしいにゃん",
] as const

const LUCKY_ITEMS = [
  "えんぴつ",
  "ノート",
  "シール",
  "ハンカチ",
  "ぼうし",
  "おりがみ",
  "みどりのはっぱ",
  "きれいないし",
  "おもちゃ",
  "ほん",
  "くつした",
  "リボン",
] as const

const LUCKY_COLORS = [
  "#FFB6C1", // ピンク
  "#FFC0CB", // ライトピンク
  "#98FB98", // ライトグリーン
  "#87CEEB", // スカイブルー
  "#DDA0DD", // プラム
  "#F0E68C", // カーキ
  "#F5DEB3", // ウィート
  "#FFE4B5", // モカシン
  "#FFDAB9", // ピーチパフ
  "#E0E0E0", // ライトグレー
] as const

const ADVICE_MESSAGES = {
  あまえんぼうにゃん: {
    main: "今日はだれかに「ありがとう」を言ってみよう！",
    study: "好きな教科から始めると集中できるよ",
    friend: "友達の話をよく聞いてあげよう",
    play: "みんなで遊ぶゲームがおすすめ",
  },
  げんきいっぱいにゃん: {
    main: "体を動かすと運気アップ！外で遊ぼう",
    study: "短い時間で集中して勉強しよう",
    friend: "新しい友達に話しかけてみよう",
    play: "かけっこや鬼ごっこで元気いっぱい",
  },
  のんびりにゃん: {
    main: "ゆっくりマイペースで過ごそう",
    study: "じっくり考える問題が得意な日",
    friend: "やさしい言葉をかけてあげよう",
    play: "読書やお絵かきでリラックス",
  },
  しっかりものにゃん: {
    main: "計画を立てて行動すると良い日",
    study: "宿題は早めに終わらせよう",
    friend: "困っている友達を助けてあげよう",
    play: "パズルや工作がおすすめ",
  },
  おしゃれにゃん: {
    main: "きれいなものを見つけると幸せになれる日",
    study: "ノートをきれいに書こう",
    friend: "友達の良いところを見つけよう",
    play: "お絵かきやアクセサリー作り",
  },
  おちゃめにゃん: {
    main: "笑顔でいると良いことが起こる日",
    study: "楽しく覚えられる方法を見つけよう",
    friend: "みんなを笑わせてあげよう",
    play: "面白いゲームや遊びを考えてみよう",
  },
  つよがりにゃん: {
    main: "がんばっている自分をほめてあげよう",
    study: "難しい問題にチャレンジしてみよう",
    friend: "本当の気持ちを伝えてみよう",
    play: "新しいことに挑戦してみよう",
  },
  やさしいにゃん: {
    main: "思いやりの気持ちが幸運を呼ぶ日",
    study: "友達と一緒に勉強すると良いよ",
    friend: "困っている人がいたら声をかけよう",
    play: "みんなが楽しめる遊びを提案しよう",
  },
}

// ランダム占い結果を生成
function generateRandomFortune() {
  const catType = CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)]
  const stars = Math.floor(Math.random() * 5) + 1
  const luckyItem = LUCKY_ITEMS[Math.floor(Math.random() * LUCKY_ITEMS.length)]
  const luckyColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)]
  const advice = ADVICE_MESSAGES[catType]

  return {
    catType,
    stars,
    luckyItem,
    luckyColor,
    advice,
    date: new Date().toISOString().slice(0, 10),
  }
}

export function CatFortune() {
  const [name, setName] = useState("")
  const [fortune, setFortune] = useState<ReturnType<typeof generateRandomFortune> | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleFortune = () => {
    if (!name.trim()) return

    setIsAnimating(true)

    // アニメーション効果のために少し遅延
    setTimeout(() => {
      const result = generateRandomFortune()
      setFortune(result)
      setIsAnimating(false)
    }, 1000)
  }

  return (
    <section className="w-full">
      <Card className="bg-white/80 border-2 border-dashed border-[#EAD8C0]/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardHeader className="bg-[#FDEEDC]/60 rounded-t-lg">
          <CardTitle className="flex items-center justify-center text-xl md:text-2xl space-x-2">
            <Crystal className="w-5 h-5 md:w-6 md:h-6" />
            <span>ねこ占い</span>
            <Crystal className="w-5 h-5 md:w-6 md:h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 入力フォーム */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#8A6E59] font-semibold">
                  なまえ
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  className="mt-1 bg-white border-[#EAD8C0]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && name.trim()) {
                      handleFortune()
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleFortune}
                disabled={!name.trim() || isAnimating}
                className="w-full bg-[#D4A57A] hover:bg-[#C7946A] text-white"
              >
                <Crystal className={`w-4 h-4 mr-2 ${isAnimating ? "animate-spin" : ""}`} />
                {isAnimating ? "占い中..." : "今日の運勢を見る"}
              </Button>

              <p className="text-xs text-[#8A6E59] text-center">
                ※ 名前を入力するだけで占えるよ！
                <br />
                結果は毎回ランダムで変わります
              </p>
            </div>

            {/* 占い結果 */}
            <div>
              {isAnimating ? (
                <div className="bg-gradient-to-br from-[#FDEEDC] to-white rounded-2xl p-8 text-center border-2 border-[#EAD8C0]">
                  <Crystal className="w-12 h-12 mx-auto mb-4 animate-pulse text-[#D4A57A]" />
                  <p className="text-[#8A6E59] animate-pulse">
                    猫の神様が占い中...
                    <br />
                    にゃーん♪
                  </p>
                </div>
              ) : fortune ? (
                <div className="bg-gradient-to-br from-[#FDEEDC] to-white rounded-2xl p-4 border-2 border-[#EAD8C0] animate-slide-in-bottom">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-[#8A6E59] mb-2">{name}ちゃんの今日の運勢</h3>
                    <div className="text-2xl font-bold text-[#D4A57A] mb-2">{fortune.catType}</div>
                    <div className="flex justify-center items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 transition-all duration-300 ${
                            i < fortune.stars ? "text-yellow-400 fill-yellow-400 animate-pulse" : "text-gray-300"
                          }`}
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span className="text-sm font-semibold text-[#8A6E59]">ラッキーアイテム:</span>
                      <span className="bg-white px-2 py-1 rounded-full text-sm border border-[#EAD8C0]">
                        {fortune.luckyItem}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-[#8A6E59]"
                        style={{ backgroundColor: fortune.luckyColor }}
                      />
                      <span className="text-sm font-semibold text-[#8A6E59]">ラッキーカラー:</span>
                      <span className="text-sm">{fortune.luckyColor}</span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-[#5C3A21]">
                      <p>
                        <strong>今日のアドバイス:</strong> {fortune.advice.main}
                      </p>
                      <p>
                        <strong>勉強:</strong> {fortune.advice.study}
                      </p>
                      <p>
                        <strong>友達:</strong> {fortune.advice.friend}
                      </p>
                      <p>
                        <strong>遊び:</strong> {fortune.advice.play}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EAD8C0]">
                      <Button
                        onClick={handleFortune}
                        variant="outline"
                        className="w-full bg-white hover:bg-[#FDEEDC] text-[#8A6E59] border-[#EAD8C0]"
                        size="sm"
                      >
                        もう一度占う
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FDEEDC]/30 rounded-2xl p-8 text-center text-[#8A6E59]">
                  <Crystal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>
                    名前を入力して
                    <br />
                    ボタンを押してね！
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
