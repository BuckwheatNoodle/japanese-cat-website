"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { BookOpenCheck, Cat, Heart, MessageCircle, Palette, PartyPopper, RotateCcw, Sparkles, Star, Users } from "lucide-react"
import { useSkin } from "@/components/skin-provider"
import { useProgression } from "@/components/progression-provider"
import { getLocalDateKey } from "@/lib/progression"
import { assetPath } from "@/lib/utils"

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
  { main: "「ありがとう」をひとつ伝えると、うれしいことが増えそう。", study: "好きな教科から始めると集中できるよ。", friend: "友だちの話を最後まで聞いてみよう。", play: "みんなでできる遊びがおすすめ。", miyuki: "いい日になりそう。なおくんは先に猫へ三回お礼してるよ。", cat: "猫たちの返事は、しっぽを一回ぴん！", image: "/content/fortune/gratitude.webp", imageAlt: "美雪が猫に花を渡して感謝を伝えるイラスト" },
  { main: "少し体を動かすと、元気がもっとわいてくる日。", study: "10分だけ集中してから休けいしよう。", friend: "自分から元気にあいさつしてみよう。", play: "外遊びやリズム遊びがぴったり。", miyuki: "なおくんの準備運動、なぜか最後はうんちポーズ。", cat: "猫たちは見なかったふりで毛づくろい中。", image: "/content/fortune/energy.webp", imageAlt: "美雪と猫たちが元気に体を動かすイラスト" },
  { main: "急がなくて大丈夫。自分のペースがいちばん。", study: "じっくり考える問題にちょうせんしよう。", friend: "やさしい言葉をひとつ届けてみよう。", play: "読書やお絵かきでのんびりしよう。", miyuki: "のんびり大賛成。なおくんはもう雲うんちで昼寝してるよ。", cat: "ふわふわなので、猫ベッドに仮採用。", image: "/content/fortune/own-pace.webp", imageAlt: "猫たちが読書やお絵かきをしてのんびり過ごすイラスト" },
  { main: "小さな予定をひとつ決めると、すっきり進めそう。", study: "宿題はできるところから始めよう。", friend: "困っている子がいたら声をかけてみよう。", play: "パズルや工作がおすすめ。", miyuki: "予定表の一番下に『なおくん変身』って勝手に書かれてる。", cat: "猫会議で、今日も全員一致の予定です。", image: "/content/fortune/small-plan.webp", imageAlt: "美雪と猫たちが絵カードで小さな予定を立てるイラスト" },
  { main: "きれいな色や形を見つけると、いい気分になれそう。", study: "ノートを好きな色で見やすくまとめよう。", friend: "友だちのすてきなところを伝えてみよう。", play: "ぬりえや飾り作りにぴったり。", miyuki: "虹色を選んだら、なおくんまで七色うんちになりました。", cat: "まぶしいので、猫たちは目を細めています。", image: "/content/fortune/colors.webp", imageAlt: "猫たちがきれいな虹と色とりどりの形を描くイラスト" },
  { main: "笑顔が幸運を連れてきてくれる日。", study: "クイズみたいに楽しく覚えてみよう。", friend: "みんなが笑える話をしてみよう。", play: "新しいゲームを考えてみよう。", miyuki: "なおくんが笑わせる係に立候補。もう変身帽子をかぶってるよ。", cat: "開始前なのに、猫席は満員です。", image: "/content/fortune/laughter.webp", imageAlt: "美雪と猫たちが新しいゲームを考えて笑うイラスト" },
  { main: "昨日できなかったことに、もう一度挑戦してみよう。", study: "少しむずかしい問題をひとつ選ぼう。", friend: "思っていることをやさしく伝えてみよう。", play: "やったことのない遊びに挑戦。", miyuki: "失敗しても大丈夫。なおくんは変身を三回失敗して全部楽しそう。", cat: "四回目は猫みみうんちを希望します。", image: "/content/fortune/try-again.webp", imageAlt: "仲間に応援されながら輪くぐりに再挑戦する猫のイラスト" },
  { main: "思いやりの気持ちが、幸運を運んでくれる日。", study: "分からないところはだれかに聞いてみよう。", friend: "ひとりの子がいたら声をかけてみよう。", play: "みんなが楽しめる遊びを選ぼう。", miyuki: "やさしい日だね。なおくんは猫へ特等席をゆずりました。", cat: "その席、うんちクッション付きならもっと最高。", image: "/content/fortune/kindness.webp", imageAlt: "猫たちが窓辺の特等席とクッションを譲り合うイラスト" },
] as const

const NAOKUN_VISITS = [
  { title: "雲うんちで乱入！", line: "『占いの雲はぼくに任せて！』と浮いたけれど、猫に座布団と間違われました。", image: "/content/collections/naokun/poop-cloud.webp" },
  { title: "うんちシェフで乱入！", line: "厨房の外でラッキーおやつの注文札を並べる気満々。猫たちは札より先に一列になりました。", image: "/content/collections/naokun/poop-chef.webp" },
  { title: "宇宙うんちで乱入！", line: "ラッキー星を取りに出発。美雪に『まず玄関からね』と止められました。", image: "/content/collections/naokun/poop-space.webp" },
  { title: "金のうんち王で乱入！", line: "『今日の主役はぼく？』。猫たちはまぶしくて全員ほそ目になりました。", image: "/content/collections/naokun/poop-gold.webp" },
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
  const naokunVisit = (seed >>> 9) % 7 === 0
  return {
    catType: CAT_TYPES[typeIndex],
    stars: 3 + (seed % 3),
    luckyItem: LUCKY_ITEMS[(seed >>> 3) % LUCKY_ITEMS.length],
    luckyColor: LUCKY_COLORS[(seed >>> 5) % LUCKY_COLORS.length],
    advice: ADVICE[typeIndex],
    naokunVisit: naokunVisit ? NAOKUN_VISITS[(seed >>> 12) % NAOKUN_VISITS.length] : null,
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
    const fortuneId = `${fortuneDateKey}:${encodeURIComponent(fortuneName)}`
    recordEvent({
      type: "fortune.drawn",
      eventId: `fortune:${fortuneId}`,
      occurredAt: `${fortuneDateKey}T12:00:00.000Z`,
      fortuneId,
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
          <p>同じ日・同じ名前の結果は変わりません。名前を変えると結果を比較できます。</p>
        </div>
      </div>

      {!fortune ? (
        <div className="feature-panel fortune-form-panel">
          <label htmlFor="fortune-name">名前</label>
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
              placeholder="名前を入力"
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
            <p>{fortuneName}の今日の運勢</p>
            <h3 ref={resultHeadingRef} tabIndex={-1}>{fortune.catType}</h3>
            <div className="fortune-stars" aria-label={`星 ${fortune.stars} こ`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={index < fortune.stars ? "is-on" : ""} aria-hidden="true" />
              ))}
            </div>
            <div className="fortune-result-art">
              <Image
                src={assetPath(fortune.advice.image)}
                alt={fortune.advice.imageAlt}
                fill
                sizes="(max-width: 700px) calc(100vw - 72px), 520px"
              />
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

          <div className="fortune-banter" aria-label="美雪と猫たちのひとこと">
            <p><MessageCircle aria-hidden="true" /><span><strong>美雪メモ</strong>{fortune.advice.miyuki}</span></p>
            <p><Cat aria-hidden="true" /><span><strong>猫たち</strong>{fortune.advice.cat}</span></p>
          </div>

          {fortune.naokunVisit && (
            <aside className="fortune-naokun-visit" aria-label={`レア演出、${fortune.naokunVisit.title}`}>
              <span className="fortune-naokun-art">
                <Image src={assetPath(fortune.naokunVisit.image)} alt={fortune.naokunVisit.title} fill sizes="104px" />
              </span>
              <span className="fortune-naokun-copy">
                <small><PartyPopper aria-hidden="true" /> RARE! なおくん乱入</small>
                <strong>{fortune.naokunVisit.title}</strong>
                <span>{fortune.naokunVisit.line}</span>
              </span>
            </aside>
          )}

          <button type="button" className="secondary-action" onClick={resetFortune}>
            <RotateCcw aria-hidden="true" />
            名前を変える
          </button>
        </div>
      )}

      <style jsx>{`
        .fortune-result-art {
          position: relative;
          overflow: hidden;
          width: min(100%, 520px);
          aspect-ratio: 4 / 3;
          margin: 16px auto 0;
          border: 2px solid color-mix(in srgb, var(--skin-line) 82%, white);
          border-radius: 20px;
          background: var(--skin-paper-warm);
          box-shadow: 0 5px 0 color-mix(in srgb, var(--skin-line) 25%, transparent);
        }
        .fortune-result-art :global(img) {
          object-fit: cover;
        }
        .fortune-banter {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }
        .fortune-banter p {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr);
          align-items: start;
          gap: 8px;
          margin: 0;
          padding: 11px 12px;
          border: 1px dashed var(--skin-line);
          border-radius: 15px;
          color: var(--skin-ink-soft);
          background: color-mix(in srgb, var(--skin-mint) 22%, white);
          font-size: .82rem;
          line-height: 1.55;
          text-align: left;
        }
        .fortune-banter p:nth-child(2) {
          background: color-mix(in srgb, var(--skin-butter) 30%, white);
        }
        .fortune-banter :global(svg) {
          width: 23px;
          height: 23px;
          color: var(--skin-coral-strong);
        }
        .fortune-banter span {
          display: grid;
          gap: 2px;
        }
        .fortune-banter strong {
          color: var(--skin-ink);
          font-size: .78rem;
        }
        .fortune-naokun-visit {
          display: grid;
          grid-template-columns: 96px minmax(0, 1fr);
          align-items: center;
          gap: 11px;
          margin-top: 12px;
          padding: 10px;
          border: 2px solid var(--skin-coral);
          border-radius: 19px;
          background: linear-gradient(145deg, color-mix(in srgb, var(--skin-blush) 52%, white), color-mix(in srgb, var(--skin-butter) 38%, white));
          box-shadow: 0 4px 0 color-mix(in srgb, var(--skin-coral) 28%, transparent);
          text-align: left;
        }
        .fortune-naokun-art {
          position: relative;
          display: block;
          overflow: hidden;
          aspect-ratio: 1;
          border-radius: 15px;
          background: var(--skin-paper-warm);
        }
        .fortune-naokun-art :global(img) { object-fit: cover; }
        .fortune-naokun-copy {
          display: grid;
          gap: 4px;
          min-width: 0;
        }
        .fortune-naokun-copy small {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--skin-coral-strong);
          font-size: .75rem;
          font-weight: 900;
          letter-spacing: .04em;
        }
        .fortune-naokun-copy small :global(svg) { width: 14px; height: 14px; }
        .fortune-naokun-copy > strong { color: var(--skin-ink); font-size: .92rem; }
        .fortune-naokun-copy > span { color: var(--skin-ink-soft); font-size: .78rem; line-height: 1.55; }
        @media (max-width: 360px) {
          .fortune-naokun-visit { grid-template-columns: 78px minmax(0, 1fr); }
        }
      `}</style>
    </section>
  )
}
