"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { BookOpenCheck, Heart, Palette, RotateCcw, Sparkles, Star, Users } from "lucide-react"
import { useSkin } from "@/components/skin-provider"
import { useProgression } from "@/components/progression-provider"
import { getLocalDateKey } from "@/lib/progression"

const CAT_TYPES = [
  "あまえんぼうにゃん",
  "げんきいっぱいにゃん",
  "のんびりにゃん",
  "しっかりものにゃん",
  "おしゃれにゃん",
  "おちゃめにゃん",
  "ちょうせんにゃん",
  "やさしいにゃん",
] as const

const LUCKY_ITEMS = ["えんぴつ", "ノート", "シール", "ハンカチ", "ぼうし", "おりがみ", "きれいないし", "リボン"] as const

const LUCKY_COLORS = [
  { name: "さくらピンク", value: "#f6aeb8" },
  { name: "ミントグリーン", value: "#9bc8a8" },
  { name: "ソーダブルー", value: "#91cbd8" },
  { name: "すみれ色", value: "#b9a1cf" },
  { name: "はちみつ色", value: "#eebf63" },
  { name: "クリーム色", value: "#f4dfb7" },
] as const

const ADVICE = [
  { main: "「ありがとう」をひとつ伝えると、うれしいことが増えそう。", study: "好きな教科から始めると集中できるよ。", friend: "友だちの話を最後まで聞いてみよう。", play: "みんなでできる遊びがおすすめ。" },
  { main: "少し体を動かすと、元気がもっとわいてくる日。", study: "10分だけ集中してから休けいしよう。", friend: "自分から元気にあいさつしてみよう。", play: "外遊びやリズム遊びがぴったり。" },
  { main: "急がなくて大丈夫。自分のペースがいちばん。", study: "じっくり考える問題にちょうせんしよう。", friend: "やさしい言葉をひとつ届けてみよう。", play: "読書やお絵かきでのんびりしよう。" },
  { main: "小さな予定をひとつ決めると、すっきり進めそう。", study: "宿題はできるところから始めよう。", friend: "困っている子がいたら声をかけてみよう。", play: "パズルや工作がおすすめ。" },
  { main: "きれいな色や形を見つけると、いい気分になれそう。", study: "ノートを好きな色で見やすくまとめよう。", friend: "友だちのすてきなところを伝えてみよう。", play: "ぬりえや飾り作りにぴったり。" },
  { main: "笑顔が幸運を連れてきてくれる日。", study: "クイズみたいに楽しく覚えてみよう。", friend: "みんなが笑える話をしてみよう。", play: "新しいゲームを考えてみよう。" },
  { main: "昨日できなかったことに、もう一度挑戦してみよう。", study: "少しむずかしい問題をひとつ選ぼう。", friend: "思っていることをやさしく伝えてみよう。", play: "やったことのない遊びに挑戦。" },
  { main: "思いやりの気持ちが、幸運を運んでくれる日。", study: "分からないところはだれかに聞いてみよう。", friend: "ひとりの子がいたら声をかけてみよう。", play: "みんなが楽しめる遊びを選ぼう。" },
] as const

function hashText(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function makeFortune(name: string, dateKey = getLocalDateKey()) {
  const seed = hashText(`${name.trim()}-${dateKey}`)
  const typeIndex = seed % CAT_TYPES.length
  return {
    catType: CAT_TYPES[typeIndex],
    stars: 3 + (seed % 3),
    luckyItem: LUCKY_ITEMS[(seed >>> 3) % LUCKY_ITEMS.length],
    luckyColor: LUCKY_COLORS[(seed >>> 5) % LUCKY_COLORS.length],
    advice: ADVICE[typeIndex],
  }
}

export function CatFortune() {
  const { skin } = useSkin()
  const { ready, recordEvent } = useProgression()
  const [name, setName] = useState("")
  const [fortune, setFortune] = useState<ReturnType<typeof makeFortune> | null>(null)
  const [fortuneName, setFortuneName] = useState("")
  const [fortuneDateKey, setFortuneDateKey] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const animationTimerRef = useRef<number | null>(null)
  const focusFrameRef = useRef<number | null>(null)
  const drawLockedRef = useRef(false)
  const returningToFormRef = useRef(false)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    if (!ready || !fortuneName || !fortuneDateKey) return
    recordEvent({
      type: "fortune.drawn",
      eventId: `fortune:${fortuneDateKey}`,
      occurredAt: `${fortuneDateKey}T12:00:00.000Z`,
      fortuneId: `${fortuneDateKey}:${hashText(fortuneName)}`,
    })
  }, [fortuneDateKey, fortuneName, ready, recordEvent])

  useEffect(() => {
    if (fortune) {
      focusFrameRef.current = window.requestAnimationFrame(() => resultHeadingRef.current?.focus())
    } else if (returningToFormRef.current) {
      returningToFormRef.current = false
      focusFrameRef.current = window.requestAnimationFrame(() => nameInputRef.current?.focus())
    }
    return () => {
      if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
      focusFrameRef.current = null
    }
  }, [fortune])

  useEffect(() => () => {
    if (animationTimerRef.current !== null) window.clearTimeout(animationTimerRef.current)
  }, [])

  const handleFortune = () => {
    const safeName = name.trim().slice(0, 12)
    if (!safeName || drawLockedRef.current) return
    drawLockedRef.current = true
    setIsAnimating(true)
    animationTimerRef.current = window.setTimeout(() => {
      const drawDateKey = getLocalDateKey()
      animationTimerRef.current = null
      setFortuneName(safeName)
      setFortuneDateKey(drawDateKey)
      setFortune(makeFortune(safeName, drawDateKey))
      setIsAnimating(false)
      drawLockedRef.current = false
    }, 650)
  }

  const resetFortune = () => {
    returningToFormRef.current = true
    setFortune(null)
  }

  return (
    <section className="feature-screen fortune-screen" aria-labelledby="fortune-title">
      <div className="screen-hero fortune-hero">
        <div className="fortune-hero-art" aria-hidden="true">
          <Image src={skin.assets.activityFortune} alt="" fill sizes="150px" />
        </div>
        <div>
          <p className="screen-kicker">TODAY&apos;S CAT FORTUNE</p>
          <h2 id="fortune-title">今日のねこ占い</h2>
          <p>同じ名前なら、今日の結果はいつ見ても同じだよ。</p>
        </div>
      </div>

      {!fortune ? (
        <div className="feature-panel fortune-form-panel">
          <label htmlFor="fortune-name">なまえ</label>
          <div className="fortune-input-row">
            <input
              ref={nameInputRef}
              id="fortune-name"
              value={name}
              maxLength={12}
              autoComplete="off"
              inputMode="text"
              disabled={isAnimating}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleFortune()}
              placeholder="なまえを入れてね"
            />
            <button type="button" className="primary-action" disabled={!name.trim() || isAnimating} onClick={handleFortune}>
              <Sparkles aria-hidden="true" />
              {isAnimating ? "占い中…" : "占う"}
            </button>
          </div>
          <p className="privacy-note">入力した名前は、この端末にも保存せず、外にも送信しません。</p>
        </div>
      ) : (
        <div className="fortune-result">
          <div className="fortune-result-head">
            <p>{fortuneName}ちゃんの今日の運勢</p>
            <h3 ref={resultHeadingRef} tabIndex={-1}>{fortune.catType}</h3>
            <div className="fortune-stars" aria-label={`星 ${fortune.stars} こ`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={index < fortune.stars ? "is-on" : ""} aria-hidden="true" />
              ))}
            </div>
            <p className="fortune-main">{fortune.advice.main}</p>
          </div>

          <div className="fortune-lucky-grid">
            <div>
              <Heart aria-hidden="true" />
              <span>ラッキーアイテム</span>
              <strong>{fortune.luckyItem}</strong>
            </div>
            <div>
              <Palette aria-hidden="true" />
              <span>ラッキーカラー</span>
              <strong><i style={{ backgroundColor: fortune.luckyColor.value }} />{fortune.luckyColor.name}</strong>
            </div>
          </div>

          <div className="fortune-advice-grid">
            <p><BookOpenCheck aria-hidden="true" /><span><strong>勉強</strong>{fortune.advice.study}</span></p>
            <p><Users aria-hidden="true" /><span><strong>友だち</strong>{fortune.advice.friend}</span></p>
            <p><Sparkles aria-hidden="true" /><span><strong>遊び</strong>{fortune.advice.play}</span></p>
          </div>

          <button type="button" className="secondary-action" onClick={resetFortune}>
            <RotateCcw aria-hidden="true" />
            名前を変える
          </button>
        </div>
      )}
    </section>
  )
}
