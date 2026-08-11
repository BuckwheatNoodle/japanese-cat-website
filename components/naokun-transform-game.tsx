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
    description: "おいしい料理を作る変身",
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

const QUESTIONS: readonly TransformQuestion[] = [
  {
    id: "cafe-rain",
    prompt: "ねこカフェのお花に、ふわふわの雨を届けたい！",
    hint: "空をぷかぷかできる変身を選ぼう。",
    answerId: "cloud",
    explanation: "雲なおくんなら、猫といっしょに空をぷかぷかして、やさしい雨を届けられるね。",
  },
  {
    id: "cat-lunch",
    prompt: "おなかをすかせた猫たちに、特製ランチを作ろう！",
    hint: "帽子をかぶって料理ができる変身はどれかな？",
    answerId: "chef",
    explanation: "シェフなおくんは、猫の形のパンまで焼ける料理上手。これでランチは大成功！",
  },
  {
    id: "cat-train",
    prompt: "ねこ列車がもうすぐ出発。みんなを安全に案内して！",
    hint: "笛を持って列車を見守る変身を探そう。",
    answerId: "conductor",
    explanation: "車掌なおくんなら、笛を鳴らして猫のお客さんを楽しく案内できるよ。",
  },
  {
    id: "moon-delivery",
    prompt: "月の猫さんへ、肉球クッキーを届けに行こう！",
    hint: "星の向こうまで飛んでいける変身はどれかな？",
    answerId: "space",
    explanation: "宇宙飛行士なおくんなら、宇宙服で月までひとっ飛び。クッキーも無事に届いたよ。",
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

function resultCopy(score: number) {
  if (score === 100) return { title: "変身マスター！", detail: "全部大正解。美雪もなおくんもびっくりの完ぺき案内だったよ。" }
  if (score >= 75) return { title: "変身名人！", detail: "なおくんの得意な変身を、ほとんど見分けられたね。" }
  if (score >= 50) return { title: "いい調子！", detail: "ヒントをもう一度読めば、次はもっとぴったり選べそう。" }
  return { title: "もう一度変身会議！", detail: "どのなおくんも楽しそうで迷うよね。画像とヒントを見くらべて再挑戦しよう。" }
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
  const result = useMemo(() => resultCopy(score), [score])

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
      setScore((current) => current + 25)
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
        won: score >= 75,
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
            ? "問題と変身がいつも同じ順番で並ぶ、ゆっくりコース。ヒントと説明を見くらべて選んでね。"
            : globalDifficulty === "challenge"
              ? "ヒントと変身の説明をかくしたチャレンジコース。画像と名前をよく見て選ぼう。"
              : "ヒントを読んで、なおくんの4つの変身からぴったりの姿を選んでね。全部で4問、楽しい解説も読めるよ。"}</p>
          <div className="transform-intro-meta" aria-label="ゲーム情報">
            <Clock3 aria-hidden="true" />
            <span>全4問・約1分</span>
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
                  <p>{round.explanation}</p>
                </div>
              </>
            ) : (
              <>
                <WandSparkles aria-hidden="true" />
                <div>
                  <strong>どの変身かな？</strong>
                  <p>画像とヒントを見くらべて選んでね。</p>
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
            <span>点 / 100点</span>
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
          font-size: 0.72rem;
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
          font-size: 0.72rem;
          line-height: 1.6;
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
