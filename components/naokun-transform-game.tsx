"use client"

import Image from "next/image"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  WandSparkles,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"
import { useProgression } from "@/components/progression-provider"
import { createEventId } from "@/lib/progression"
import { assetPath } from "@/lib/utils"

type FormId = "cloud" | "chef" | "conductor" | "space"
type GamePhase = "intro" | "playing" | "finished"
type GlobalDifficulty = "gentle" | "standard" | "challenge"

type TransformForm = {
  id: FormId
  name: string
  shortName: string
  description: string
  image: string
}

type TransformQuestion = {
  id: string
  prompt: string
  hint: string
  answerId: FormId
  explanation: string
  correctReaction: string
  wrongReactions: Record<FormId, string>
}

type Round = TransformQuestion & {
  optionIds: FormId[]
}

const FORMS: readonly TransformForm[] = [
  {
    id: "cloud",
    name: "ふわふわ雲うんちなおくん",
    shortName: "雲",
    description: "空をぷかぷかする変身",
    image: "/content/collections/naokun/poop-cloud.webp",
  },
  {
    id: "chef",
    name: "シェフうんちなおくん",
    shortName: "シェフ",
    description: "厨房の外で注文札とタイマーを守る変身",
    image: "/content/collections/naokun/poop-chef.webp",
  },
  {
    id: "conductor",
    name: "車掌うんちなおくん",
    shortName: "車掌",
    description: "ねこ列車を案内する変身",
    image: "/content/collections/naokun/poop-conductor.webp",
  },
  {
    id: "space",
    name: "宇宙飛行士うんちなおくん",
    shortName: "宇宙",
    description: "星のあいだを旅する変身",
    image: "/content/collections/naokun/poop-space.webp",
  },
]

const FORM_BY_ID = Object.fromEntries(FORMS.map((form) => [form.id, form])) as Record<FormId, TransformForm>

const reactionSet = (
  correctReaction: string,
  cloud: string,
  chef: string,
  conductor: string,
  space: string,
): Pick<TransformQuestion, "correctReaction" | "wrongReactions"> => ({
  correctReaction,
  wrongReactions: { cloud, chef, conductor, space },
})

const QUESTIONS: readonly TransformQuestion[] = [
  {
    id: "cafe-rain",
    prompt: "ねこカフェのお花に、ふわふわの雨を届けたい！",
    hint: "空をぷかぷかできる変身を選ぼう。",
    answerId: "cloud",
    explanation: "雲なおくんなら、猫といっしょに空をぷかぷかして、やさしい雨を届けられるね。",
    ...reactionSet(
      "美雪「雨は小さめでお願いね」なおくん雲は、じょうろ一杯ぶんだけ降らせました。猫審査員も肉球で合格！",
      "雲なおくんは得意顔。まだ一滴も降らせていないのに、虹のサインまで練習中です。",
      "シェフなおくんは案内台で雨の注文札を発行。美雪「お花は注文してないよ」",
      "車掌なおくんが時刻表を見せました。美雪「お花は電車に乗らないよ」",
      "宇宙飛行士なおくんは花を月へ届ける気です。猫たちが植木鉢を全力で守りました。",
    ),
  },
  {
    id: "cat-lunch",
    prompt: "ランチ作りが大いそがし。厨房の外で注文札とタイマーを見守ろう！",
    hint: "コック帽をかぶり、注文ボードを整理する変身はどれかな？",
    answerId: "chef",
    explanation: "シェフなおくんなら厨房の外の案内台で、猫用と人用の注文札やタイマーを分けて見守れるね。食べ物は美雪たち厨房係におまかせ！",
    ...reactionSet(
      "注文札を猫の耳の大きさ順に並べたシェフなおくん。美雪「受付番号順です」。帽子だけは満点！",
      "雲なおくんが注文札をふわっと飛ばしました。猫全員、無言で案内台を見ています。",
      "シェフなおくんはコック帽を三回直してからタイマー係を開始。猫たちは一回目で待てました。",
      "車掌なおくんは注文札に『ランチ一番線』と記入。美雪「ここは駅じゃないよ」",
      "宇宙飛行士なおくんは案内板に『月支店』を追加。猫たちは地球の席で待っています。",
    ),
  },
  {
    id: "cat-train",
    prompt: "ねこ列車がもうすぐ出発。みんなを安全に案内して！",
    hint: "笛を持って列車を見守る変身を探そう。",
    answerId: "conductor",
    explanation: "車掌なおくんなら、笛を鳴らして猫のお客さんを楽しく案内できるよ。",
    ...reactionSet(
      "車掌なおくんが『おやつ駅ゆきです！』。乗客の猫たちは、行き先だけ聞いて全員乗車しました。",
      "雲なおくんは線路の上をぷかぷか。美雪「それ、列車より先に着くけど案内できないよ」",
      "シェフなおくんは切符を注文札ボードへ並べました。猫駅長「それは改札へ戻して」",
      "車掌なおくんの笛より、猫の『ごはん！』の声のほうが大きく響きました。出発は成功です。",
      "宇宙飛行士なおくんは『次は月駅！』。猫たち「まず隣の駅にしてください」",
    ),
  },
  {
    id: "moon-delivery",
    prompt: "月の猫さんへ、密封されたお届け箱を運ぶロボットを案内しよう！",
    hint: "星の向こうまで先導できる変身はどれかな？",
    answerId: "space",
    explanation: "宇宙飛行士なおくんなら、お届けロボットを月まで先導できるね。箱は開けず、月の係へそのまま渡せるよ。",
    ...reactionSet(
      "月の猫から返信は肉球スタンプ一個。なおくんは『宇宙最高評価！』と額に飾りました。",
      "雲なおくんは月の手前で雨になりそう。美雪「お届けロボットをぬらす作戦は中止！」",
      "シェフなおくんは案内台で月サイズの配送札を作成。大きすぎて玄関を通りません。",
      "車掌なおくんは『月駅は終点です』。美雪「線路が地球から出ていません」",
      "宇宙飛行士なおくんは出発前から無重力の顔。まだ床にしっかり立っています。",
    ),
  },
  {
    id: "laundry-cloud",
    prompt: "急な雨！ 屋上の猫タオルを、ぬらさずふわっと運びたい。",
    hint: "風に乗り、やさしく浮かべる姿を考えよう。",
    answerId: "cloud",
    explanation: "雲なおくんならタオルをふわっと持ち上げ、雨雲のすき間から部屋へ運べるよ。",
    ...reactionSet(
      "なおくん雲がタオルを一枚ずつ運搬。最後は自分まで物干しざおに並び、美雪に回収されました。",
      "雲なおくんはタオルより先に自分がふわふわ。猫たちが下で回収係を始めました。",
      "シェフなおくんはタオル一枚ずつに注文番号を付けました。美雪「今日は洗濯番号だよ」",
      "車掌なおくんはタオルへ整理券を配布。猫たち「乗車しません」",
      "宇宙飛行士なおくんは全部を宇宙へ避難させる案。乾くけれど、遠すぎます。",
    ),
  },
  {
    id: "birthday-cake",
    prompt: "猫店長の誕生日。厨房の外で注文札とタイマーを見守り、作業順を知らせよう！",
    hint: "コック帽と注文ボードで、時間を知らせる役が必要だよ。",
    answerId: "chef",
    explanation: "シェフなおくんなら厨房の外で注文札を整理し、タイマーで美雪たち厨房係へ時間を知らせられるね。食べ物には触れない案内役だよ。",
    ...reactionSet(
      "タイマーが鳴るたび大きく敬礼するシェフなおくん。三回目は猫店長も肉球で敬礼しました。",
      "雲なおくんは受付札までふわふわ浮かせました。猫店長「番号が読めません」",
      "シェフなおくんはタイマーを三個並べて得意顔。どれが本番かは美雪に聞いています。",
      "車掌なおくんが撮影待ちの列へ一番線を追加。会場は一部屋なのに終点もあります。",
      "宇宙飛行士なおくんはタイマーを地球時間に直す会議を開始。美雪「いま押せば大丈夫」",
    ),
  },
  {
    id: "lost-ticket",
    prompt: "ねこ列車で迷子の子猫。切符の行き先を調べて家族の席へ案内しよう。",
    hint: "時刻表と車内をよく知る案内役はだれ？",
    answerId: "conductor",
    explanation: "車掌なおくんなら切符と座席表を照らし合わせ、迷子を安全に案内できるよ。",
    ...reactionSet(
      "子猫を家族の席へ案内した車掌なおくん。お礼の肉球スタンプを切符より大事に改札へ見せました。",
      "雲なおくんは車内の天井へ到着。子猫「席は、下です」",
      "シェフなおくんは切符を注文札ボードへ掲示。子猫「行き先はメニューじゃないよ」",
      "車掌なおくんは座席表を上下逆に見て、自分の席だけ先に発見しました。",
      "宇宙飛行士なおくんは『迷子ならレーダー！』。車内は三歩で見渡せます。",
    ),
  },
  {
    id: "satellite-rescue",
    prompt: "猫カフェの通信衛星が停止。無重力で部品を交換する任務だ！",
    hint: "空より高い場所で活動できる装備を選ぼう。",
    answerId: "space",
    explanation: "宇宙飛行士なおくんなら宇宙服と安全ロープで、衛星の部品を交換できるね。",
    ...reactionSet(
      "通信復旧！ 最初に届いた信号は猫の『おやつまだ？』。なおくんは宇宙で敬礼しました。",
      "雲なおくんは成層圏の手前でふわふわ休憩。任務はまだずっと上です。",
      "シェフなおくんは衛星を銀色の案内看板だと思いました。猫管制官「宇宙の部品です」",
      "車掌なおくんが安全ロープを線路と呼び始めました。宇宙に駅はありません。",
      "宇宙飛行士なおくんは工具より先に決め顔を装着。猫管制官から『作業をどうぞ』。",
    ),
  },
  {
    id: "summer-shade",
    prompt: "夏の中庭が暑すぎる。猫たちへ動く日かげを届けよう。",
    hint: "空から日ざしをやさしくさえぎれる姿だよ。",
    answerId: "cloud",
    explanation: "雲なおくんなら猫の歩く場所に合わせ、涼しい日かげを動かせるね。",
    ...reactionSet(
      "雲なおくんの日かげを猫が追い、なおくんが猫を追い、美雪が全員を追う行列になりました。",
      "雲なおくんは自分の真下だけ完璧に日かげ。猫たちが無言で横へ移動させました。",
      "シェフなおくんは日かげの撮影台に案内札を設置。美雪「まず日かげを動かそう」",
      "車掌なおくんが日かげへ乗車案内。定員は猫一匹、なおくんは立ち席です。",
      "宇宙飛行士なおくんは太陽を避けて月へ行く案。猫たちは中庭が好きです。",
    ),
  },
  {
    id: "cafe-rush",
    prompt: "注文が五つ同時に到着。厨房の外で注文札とタイマーを整理しよう。",
    hint: "コック帽をかぶり、案内台で作業順を知らせる変身を選ぼう。",
    answerId: "chef",
    explanation: "シェフなおくんなら厨房の外の案内台で注文札を受付順に並べ、タイマーで厨房係へ知らせられるよ。食べ物は美雪たちが安全に扱います。",
    ...reactionSet(
      "五枚の注文札を整理！ シェフなおくんは六枚目に『ぼくの記念撮影』を追加。美雪「それは注文じゃないよ」",
      "雲なおくんは注文票を風で並べ替えました。見事に読めなくなりました。",
      "シェフなおくんは注文札を背の順に整列。美雪「受付順です」。紙の列だけはきれいです。",
      "車掌なおくんが注文札へ一番線から番号を付けました。案内台は駅ではありません。",
      "宇宙飛行士なおくんは注文札を月へ送る提案。猫のお客さんが地球の席で待っています。",
    ),
  },
  {
    id: "festival-platform",
    prompt: "夏祭り駅が大混雑。乗る列と降りる列を分けて安全に案内しよう。",
    hint: "笛と案内板を使い、人の流れを整理する役だよ。",
    answerId: "conductor",
    explanation: "車掌なおくんなら案内板と声かけで列を分け、みんなを安全に誘導できるね。",
    ...reactionSet(
      "混雑解消！ 車掌なおくんだけ『うんち変身記念』の写真列を作り、猫駅長に解散させられました。",
      "雲なおくんは上空から案内しました。声がふわふわしすぎて、全員が空を見ています。",
      "シェフなおくんは列へ注文札ボードを設置。猫駅長「いま必要なのは乗り場案内です」",
      "車掌なおくんは完璧に誘導したあと、自分だけ出口を通り過ぎました。",
      "宇宙飛行士なおくんは管制塔を希望。猫駅長「地上勤務です」",
    ),
  },
  {
    id: "meteor-sample",
    prompt: "流れ星から届いた小さな石。宇宙で安全に観察して持ち帰ろう。",
    hint: "ヘルメットと専用ケースが必要な調査だよ。",
    answerId: "space",
    explanation: "宇宙飛行士なおくんなら専用ケースを使い、石を傷つけず安全に調べられるね。",
    ...reactionSet(
      "石はただの星形消しゴムでした。なおくん宇宙飛行士は『調査のため』と言って三回敬礼しています。",
      "雲なおくんは石を雨で洗おうとしました。猫研究員がケースのふたを守ります。",
      "シェフなおくんは案内板へ星の絵を追加。美雪「絵より先にケースを見てください」",
      "車掌なおくんは石へ片道切符を発行。帰り道がなくなるので却下です。",
      "宇宙飛行士なおくんはケースより大きな敬礼。石は静かにケースへ入りました。",
    ),
  },
]

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function createRounds(difficulty: GlobalDifficulty): Round[] {
  const questions = difficulty === "gentle" ? [...QUESTIONS] : shuffle(QUESTIONS)
  return questions.map((question) => ({
    ...question,
    optionIds: difficulty === "gentle" ? FORMS.map((form) => form.id) : shuffle(FORMS.map((form) => form.id)),
  }))
}

function resultCopy(correctCount: number) {
  if (correctCount === QUESTIONS.length) return { title: "十二変身ぜんぶ大成功！", detail: "美雪「全問正解！」猫たち「にゃー！」なおくん「では十三個目、昼寝うんちです」。それは今考えました。" }
  if (correctCount >= 9) return { title: "変身作戦の名参謀！", detail: `猫審査員から肉球${correctCount}個。なおくんは残りも正解した顔で記念写真に入りました。` }
  if (correctCount >= 6) return { title: "半分以上ぴったり！", detail: "美雪が作戦表を見直す横で、なおくんは四つの帽子を全部かぶっています。次は帽子ではなくヒントを見よう。" }
  return { title: "変身会議、延長決定！", detail: "猫たちは正解カードの上で昼寝中。なおくんは全変身を同時にやる案を出しました。まず一つずつ再挑戦！" }
}

export function NaokunTransformGame() {
  const { ready, state, recordEvent } = useProgression()
  const [phase, setPhase] = useState<GamePhase>("intro")
  const [rounds, setRounds] = useState<Round[]>(() => createRounds("standard"))
  const [runGlobalDifficulty, setRunGlobalDifficulty] = useState<GlobalDifficulty>("standard")
  const [roundIndex, setRoundIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<FormId | null>(null)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const phaseRef = useRef<GamePhase>("intro")
  const selectedIdRef = useRef<FormId | null>(null)
  const advancingRef = useRef(false)
  const completionRecordedRef = useRef(false)
  const runEventIdRef = useRef("")
  const nextButtonRef = useRef<HTMLButtonElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const globalDifficulty = state.settings.difficulty as GlobalDifficulty

  const round = rounds[roundIndex]
  const selectedIsCorrect = selectedId === round?.answerId
  const result = useMemo(() => resultCopy(correctCount), [correctCount])

  useEffect(() => {
    if (selectedId) nextButtonRef.current?.focus()
  }, [selectedId])

  useEffect(() => {
    if (phase === "playing") advancingRef.current = false
  }, [phase, roundIndex])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (phase === "playing" && !selectedId) questionHeadingRef.current?.focus()
      if (phase === "finished") resultHeadingRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [phase, roundIndex, selectedId])

  const startGame = () => {
    if (phaseRef.current !== "intro" && phaseRef.current !== "finished") return
    phaseRef.current = "playing"
    selectedIdRef.current = null
    advancingRef.current = false
    setRounds(createRounds(globalDifficulty))
    setRunGlobalDifficulty(globalDifficulty)
    setRoundIndex(0)
    setSelectedId(null)
    setScore(0)
    setCorrectCount(0)
    completionRecordedRef.current = false
    runEventIdRef.current = createEventId("naokun-transform-run")
    setPhase("playing")
  }

  const chooseForm = (formId: FormId) => {
    if (phaseRef.current !== "playing" || selectedIdRef.current || !round) return
    const isCorrect = formId === round.answerId
    selectedIdRef.current = formId
    setSelectedId(formId)
    if (isCorrect) {
      setScore((current) => current + 10)
      setCorrectCount((current) => current + 1)
    }
  }

  const finishGame = () => {
    if (phaseRef.current !== "playing") return
    phaseRef.current = "finished"
    if (!completionRecordedRef.current) {
      completionRecordedRef.current = true
      recordEvent({
        type: "game.completed",
        eventId: `${runEventIdRef.current || createEventId("naokun-transform-run")}:complete`,
        occurredAt: new Date().toISOString(),
        gameId: "naokun-transform",
        score,
        won: correctCount >= Math.ceil(QUESTIONS.length * 0.75),
      })
    }
    setPhase("finished")
  }

  const continueGame = () => {
    if (phaseRef.current !== "playing" || !selectedIdRef.current || advancingRef.current) return
    advancingRef.current = true
    if (roundIndex >= rounds.length - 1) {
      finishGame()
      return
    }

    selectedIdRef.current = null
    setRoundIndex((current) => current + 1)
    setSelectedId(null)
  }

  const handleOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, optionIndex: number) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) return
    event.preventDefault()
    const columnMove = event.key === "ArrowDown" ? 2 : event.key === "ArrowUp" ? -2 : 0
    const rowMove = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    const nextIndex = (optionIndex + columnMove + rowMove + FORMS.length) % FORMS.length
    optionRefs.current[nextIndex]?.focus()
  }

  return (
    <GameShell
      title="なおくん変身セレクト"
      subtitle="お題にぴったりのうんち変身を選ぼう"
      icon={WandSparkles}
      tone="mint"
    >
      {phase === "intro" && (
        <div className="game-start-view transform-intro">
          <div className="transform-gallery" aria-hidden="true">
            {FORMS.map((form) => (
              <div key={form.id} className="transform-gallery-item">
                <Image src={assetPath(form.image)} alt="" fill sizes="100px" />
              </div>
            ))}
          </div>
          <h3>美雪から変身のお題が届いたよ</h3>
          <p>{globalDifficulty === "gentle"
            ? "問題と変身を同じ順番で確認できる分析コース。条件・ヒント・説明を比較して選びます。"
            : globalDifficulty === "challenge"
              ? "ヒントと変身の説明をかくしたチャレンジコース。12の状況から役割と装備を考えよう。"
              : "12のお題を読み、4つの変身から条件に合う姿を選びます。正解だけでなく、36通りの誤答にも兄妹と猫の続きがあります。"}</p>
          <div className="transform-intro-meta" aria-label="ゲーム情報">
            <Clock3 aria-hidden="true" />
            <span>全12問・約3分</span>
          </div>
          <GamePrimaryButton onClick={startGame} disabled={!ready}>
            <Play aria-hidden="true" />
            {ready ? "変身を選びはじめる" : "記録を準備中…"}
          </GamePrimaryButton>
        </div>
      )}

      {phase === "playing" && round && (
        <div className="transform-play">
          <div className="game-stats-row" aria-label="ゲームの進み具合">
            <GameStat label="もんだい" value={`${roundIndex + 1} / ${rounds.length}`} icon={Target} />
            <GameStat label="せいかい" value={`${correctCount} 問`} icon={CheckCircle2} />
            <GameStat label="スコア" value={`${score} 点`} icon={Star} />
          </div>

          <section className="transform-prompt" aria-labelledby={`transform-question-${round.id}`}>
            <span><Sparkles aria-hidden="true" /> 美雪のお題</span>
            <h3 ref={questionHeadingRef} id={`transform-question-${round.id}`} tabIndex={-1}>{round.prompt}</h3>
            <p>{runGlobalDifficulty === "challenge" && !selectedId ? "チャレンジ中はヒントなし。画像と名前をよく見よう。" : round.hint}</p>
          </section>

          <div className="transform-options" role="group" aria-label="なおくんの変身を選ぶ">
            {round.optionIds.map((formId, optionIndex) => {
              const form = FORM_BY_ID[formId]
              const isAnswer = formId === round.answerId
              const isSelected = formId === selectedId
              const state = selectedId
                ? isAnswer
                  ? "correct"
                  : isSelected
                    ? "wrong"
                    : "muted"
                : "ready"

              return (
                <button
                  key={form.id}
                  ref={(node) => { optionRefs.current[optionIndex] = node }}
                  type="button"
                  className="transform-option"
                  data-state={state}
                  aria-pressed={isSelected}
                  disabled={selectedId !== null}
                  onClick={() => chooseForm(form.id)}
                  onKeyDown={(event) => handleOptionKeyDown(event, optionIndex)}
                >
                  <span className="transform-option-image">
                    <Image src={assetPath(form.image)} alt="" fill sizes="(max-width: 719px) 42vw, 150px" />
                  </span>
                  <span className="transform-option-copy">
                    <strong>{form.name}</strong>
                    {(runGlobalDifficulty !== "challenge" || selectedId) && <small>{form.description}</small>}
                  </span>
                  {selectedId && isAnswer && <CheckCircle2 className="transform-answer-mark" aria-label="正解" />}
                  {selectedId && isSelected && !isAnswer && <XCircle className="transform-answer-mark" aria-label="不正解" />}
                </button>
              )
            })}
          </div>

          <div
            className="transform-feedback"
            data-correct={selectedIsCorrect || undefined}
            role="status"
            aria-live="polite"
          >
            {selectedId ? (
              <>
                {selectedIsCorrect ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
                <div>
                  <strong>{selectedIsCorrect ? "ぴったり、大正解！" : `正解は「${FORM_BY_ID[round.answerId].shortName}」変身！`}</strong>
                  <p>{selectedIsCorrect ? round.correctReaction : round.wrongReactions[selectedId]}</p>
                  <p><b>作戦メモ：</b>{round.explanation}</p>
                </div>
              </>
            ) : (
              <>
                <WandSparkles aria-hidden="true" />
                <div>
                  <strong>どの変身かな？</strong>
                  <p>画像・条件・ヒントを比較して選択してください。</p>
                </div>
              </>
            )}
          </div>

          {selectedId && (
            <div className="transform-next-wrap">
              <button ref={nextButtonRef} type="button" className="game-primary-button" onClick={continueGame}>
                {roundIndex === rounds.length - 1 ? "結果を見る" : "つぎのお題へ"}
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "finished" && (
        <div className="game-result-view transform-result">
          <Trophy className="game-result-trophy" aria-hidden="true" />
          <p className="game-result-kicker">TRANSFORM COMPLETE</p>
          <h3 ref={resultHeadingRef} tabIndex={-1}>{result.title}</h3>
          <p>{result.detail}</p>
          <div className="transform-result-score">
            <strong>{score}</strong>
            <span>点 / {QUESTIONS.length * 10}点</span>
          </div>
          <div className="transform-result-stars" aria-label={`${correctCount}問正解`}>
            {QUESTIONS.map((question, index) => (
              <Star key={question.id} data-earned={index < correctCount || undefined} aria-hidden="true" />
            ))}
          </div>
          <GamePrimaryButton onClick={startGame}>
            <RotateCcw aria-hidden="true" />
            もう一度あそぶ
          </GamePrimaryButton>
        </div>
      )}

      <style jsx>{`
        .transform-intro {
          gap: 12px;
        }

        .transform-gallery {
          display: grid;
          width: min(100%, 292px);
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 6px;
          padding: 8px;
          border: 1px solid var(--skin-line);
          border-radius: 22px;
          background: color-mix(in srgb, var(--skin-mint) 22%, white);
          box-shadow: 0 5px 0 color-mix(in srgb, var(--skin-line) 45%, transparent);
        }

        .transform-gallery-item {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1;
          border-radius: 14px;
          background: var(--skin-paper-warm);
        }

        .transform-gallery-item :global(img) {
          object-fit: cover;
        }

        .transform-intro-meta {
          display: inline-flex;
          min-height: 36px;
          align-items: center;
          gap: 7px;
          padding: 6px 12px;
          border: 1px dashed var(--skin-line);
          border-radius: 999px;
          color: var(--skin-ink-soft);
          background: var(--skin-paper-warm);
          font-size: 0.76rem;
          font-weight: 800;
        }

        .transform-intro-meta :global(svg) {
          width: 16px;
          height: 16px;
          color: var(--skin-coral-strong);
        }

        .transform-play {
          max-width: 800px;
          margin: 0 auto;
        }

        .transform-prompt {
          margin: 12px 0;
          padding: 16px;
          border: 2px solid color-mix(in srgb, var(--skin-mint-strong) 30%, var(--skin-line));
          border-radius: 20px;
          background: linear-gradient(145deg, color-mix(in srgb, var(--skin-mint) 28%, white), white);
          text-align: left;
        }

        .transform-prompt > span {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--skin-coral-strong);
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .transform-prompt > span :global(svg) {
          width: 15px;
          height: 15px;
        }

        .transform-prompt h3 {
          margin: 7px 0 5px;
          color: var(--skin-ink);
          font-size: clamp(1.03rem, 4.8vw, 1.35rem);
          line-height: 1.5;
        }

        .transform-prompt p {
          margin: 0;
          color: var(--skin-ink-soft);
          font-size: 0.77rem;
          line-height: 1.65;
        }

        .transform-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .transform-option {
          position: relative;
          display: grid;
          min-width: 0;
          min-height: 48px;
          overflow: hidden;
          padding: 0;
          border: 2px solid var(--skin-line);
          border-radius: 18px;
          color: var(--skin-ink);
          background: white;
          box-shadow: 0 4px 0 color-mix(in srgb, var(--skin-line) 58%, transparent);
          text-align: left;
          transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
        }

        .transform-option:not(:disabled):hover {
          border-color: var(--skin-coral);
          transform: translateY(-2px);
        }

        .transform-option:focus-visible {
          outline: 3px solid var(--ring);
          outline-offset: 3px;
        }

        .transform-option:disabled {
          cursor: default;
          opacity: 1;
        }

        .transform-option[data-state="correct"] {
          border-color: var(--skin-mint-strong);
          background: color-mix(in srgb, var(--skin-mint) 22%, white);
          box-shadow: 0 4px 0 color-mix(in srgb, var(--skin-mint-strong) 52%, transparent);
        }

        .transform-option[data-state="wrong"] {
          border-color: var(--skin-coral-strong);
          background: color-mix(in srgb, var(--skin-blush) 40%, white);
        }

        .transform-option[data-state="muted"] {
          opacity: 0.64;
        }

        .transform-option-image {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: var(--skin-paper-warm);
        }

        .transform-option-image :global(img) {
          object-fit: cover;
        }

        .transform-option-copy {
          display: grid;
          gap: 2px;
          min-width: 0;
          padding: 9px 9px 10px;
        }

        .transform-option-copy strong {
          font-size: clamp(0.75rem, 3.4vw, 0.92rem);
          line-height: 1.35;
          overflow-wrap: anywhere;
          white-space: normal;
        }

        .transform-option-copy small {
          color: var(--skin-ink-soft);
          font-size: 0.75rem;
          line-height: 1.45;
        }

        .transform-answer-mark {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 27px;
          height: 27px;
          padding: 4px;
          border-radius: 50%;
          color: white;
          background: var(--skin-mint-strong);
          box-shadow: 0 2px 8px rgba(76, 55, 41, 0.2);
        }

        .transform-option[data-state="wrong"] .transform-answer-mark {
          background: var(--skin-coral-strong);
        }

        .transform-feedback {
          display: grid;
          min-height: 88px;
          grid-template-columns: 30px minmax(0, 1fr);
          align-items: start;
          gap: 10px;
          margin-top: 12px;
          padding: 12px;
          border: 1px solid var(--skin-line);
          border-radius: 16px;
          color: var(--skin-ink);
          background: var(--skin-paper-warm);
          text-align: left;
        }

        .transform-feedback[data-correct="true"] {
          border-color: color-mix(in srgb, var(--skin-mint-strong) 55%, var(--skin-line));
          background: color-mix(in srgb, var(--skin-mint) 32%, white);
        }

        .transform-feedback > :global(svg) {
          width: 26px;
          height: 26px;
          color: var(--skin-coral-strong);
        }

        .transform-feedback[data-correct="true"] > :global(svg) {
          color: var(--skin-mint-strong);
        }

        .transform-feedback strong {
          display: block;
          margin-bottom: 3px;
          font-size: 0.85rem;
        }

        .transform-feedback p {
          margin: 0;
          color: var(--skin-ink-soft);
          font-size: 0.75rem;
          line-height: 1.6;
        }

        .transform-feedback p + p {
          margin-top: 5px;
        }

        .transform-next-wrap {
          display: flex;
          justify-content: center;
          margin-top: 12px;
        }

        .transform-result {
          gap: 9px;
        }

        .transform-result-score {
          display: flex;
          align-items: baseline;
          gap: 5px;
          margin: 5px 0 0;
          color: var(--skin-ink);
        }

        .transform-result-score strong {
          color: var(--skin-coral-strong);
          font-size: clamp(2.2rem, 11vw, 3.25rem);
          line-height: 1;
        }

        .transform-result-score span {
          font-size: 0.78rem;
          font-weight: 800;
        }

        .transform-result-stars {
          display: flex;
          max-width: 360px;
          flex-wrap: wrap;
          justify-content: center;
          gap: 5px;
          margin-bottom: 8px;
        }

        .transform-result-stars :global(svg) {
          width: 27px;
          height: 27px;
          color: var(--skin-line);
        }

        .transform-result-stars :global(svg[data-earned="true"]) {
          color: #d89d2a;
          fill: var(--skin-butter);
        }

        @media (min-width: 720px) {
          .transform-gallery {
            width: min(100%, 364px);
          }

          .transform-options {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 11px;
          }

          .transform-option-copy {
            padding: 11px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .transform-option {
            transition: none;
          }

          .transform-option:not(:disabled):hover {
            transform: none;
          }
        }
      `}</style>
    </GameShell>
  )
}
