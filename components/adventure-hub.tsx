"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  BookHeart,
  Check,
  CircleDollarSign,
  Clock3,
  Gift,
  Home,
  LibraryBig,
  Sparkles,
  Star,
} from "lucide-react"
import { ExperienceArtwork } from "@/components/experience-artwork"
import styles from "@/components/experience.module.css"
import type { ActionCheck } from "@/lib/progression"

export type AdventureDestination = "room" | "collections" | "story"

export type AdventureMission = {
  id: string
  title: string
  description: string
  progress: number
  goal: number
  rewardCoins: number
  status: "open" | "complete" | "claimed"
}

export type AdventureHubProps = {
  coins: number
  streakDays: number
  missions: readonly AdventureMission[]
  collectionCount: number
  collectionTotal: number
  roomItemCount: number
  storyChapterLabel?: string
  onClaimMission: (missionId: string) => ActionCheck
  onOpen: (destination: AdventureDestination) => void
}

type MissionClaimFeedback = {
  state: "pending" | "success" | "error"
  message: string
}

function claimFailureMessage(reason: Exclude<ActionCheck, { ok: true }>["reason"]) {
  switch (reason) {
    case "read-only":
      return "記録が保護されているため、ごほうびを受け取れませんでした。"
    case "storage-capacity":
      return "保存できる記録がいっぱいです。保護者といっしょにバックアップを確認してね。"
    case "already-claimed":
      return "このごほうびは、もう受け取りずみです。"
    case "not-complete":
      return "このミッションは、まだ完了していません。"
    case "wrong-day":
      return "日付が変わりました。きょうのミッションを確認してね。"
    case "not-found":
      return "ミッションを見つけられませんでした。画面を更新して、もう一度ためしてね。"
    case "already-owned":
    case "not-enough-coins":
    case "locked":
      return "ごほうびを受け取れませんでした。画面を更新して、もう一度ためしてね。"
  }
}

const ENTRANCES: Array<{
  id: AdventureDestination
  eyebrow: string
  title: string
  description: string
  art: string
  alt: string
  icon: typeof Home
  tone: "mint" | "butter" | "blush"
}> = [
  {
    id: "room",
    eyebrow: "MY CAT CAFE",
    title: "おへやづくり",
    description: "集めた家具で、ねこカフェをかわいくしよう。",
    art: "/content/room/empty-cafe.webp",
    alt: "クリームソーダ色の家具が並ぶ、かわいい猫カフェのお部屋",
    icon: Home,
    tone: "mint",
  },
  {
    id: "collections",
    eyebrow: "COLLECTION BOOK",
    title: "ねこと変身ずかん",
    description: "出会った猫となおくんの変身を見返せるよ。",
    art: "/content/collections/cat-book.webp",
    alt: "猫となおくんの変身カードが並ぶ図鑑",
    icon: LibraryBig,
    tone: "butter",
  },
  {
    id: "story",
    eyebrow: "CAT CAFE STORY",
    title: "ものがたりモード",
    description: "選んだ答えでお話が変わる、猫カフェの大事件。",
    art: "/content/story/paw-key-discovery.webp",
    alt: "不思議な扉を見つけた美雪と猫たちとなおくん",
    icon: BookHeart,
    tone: "blush",
  },
]

export function AdventureHub({
  coins,
  streakDays,
  missions,
  collectionCount,
  collectionTotal,
  roomItemCount,
  storyChapterLabel = "第1話をプレイ",
  onClaimMission,
  onOpen,
}: AdventureHubProps) {
  const completedCount = missions.filter((mission) => mission.status === "complete" || mission.status === "claimed").length
  const [pendingClaimIds, setPendingClaimIds] = useState<ReadonlySet<string>>(() => new Set())
  const [claimFeedback, setClaimFeedback] = useState<Record<string, MissionClaimFeedback>>({})
  const [claimMessage, setClaimMessage] = useState("")
  const pendingClaimIdsRef = useRef(new Set<string>())
  const claimRequestFramesRef = useRef(new Map<string, number>())
  const claimTimeoutsRef = useRef(new Map<string, number>())
  const focusFramesRef = useRef(new Set<number>())
  const missionHeadingRefs = useRef(new Map<string, HTMLHeadingElement>())
  const missionClaimButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const hasActivityToday = streakDays > 0

  useEffect(() => {
    const claimed = missions.filter((mission) => (
      pendingClaimIdsRef.current.has(mission.id) && mission.status === "claimed"
    ))
    const currentMissionIds = new Set(missions.map((mission) => mission.id))
    const missing = [...pendingClaimIdsRef.current].filter((missionId) => !currentMissionIds.has(missionId))
    if (claimed.length === 0 && missing.length === 0) return

    const nextFeedback: Record<string, MissionClaimFeedback> = {}
    const messages: string[] = []
    claimed.forEach((mission) => {
      pendingClaimIdsRef.current.delete(mission.id)
      const timeout = claimTimeoutsRef.current.get(mission.id)
      if (timeout !== undefined) window.clearTimeout(timeout)
      claimTimeoutsRef.current.delete(mission.id)
      const message = `${mission.title}のごほうび、${mission.rewardCoins}にゃんコインを受け取りました。`
      nextFeedback[mission.id] = { state: "success", message }
      messages.push(message)
    })
    missing.forEach((missionId) => {
      pendingClaimIdsRef.current.delete(missionId)
      const timeout = claimTimeoutsRef.current.get(missionId)
      if (timeout !== undefined) window.clearTimeout(timeout)
      claimTimeoutsRef.current.delete(missionId)
      const message = "ミッションが切り替わったため、受け取りを中止しました。"
      nextFeedback[missionId] = { state: "error", message }
      messages.push(message)
    })

    setPendingClaimIds(new Set(pendingClaimIdsRef.current))
    setClaimFeedback((current) => ({ ...current, ...nextFeedback }))
    setClaimMessage(messages.join(" "))

    const focusMission = claimed.at(-1)
    if (focusMission) {
      const frame = window.requestAnimationFrame(() => {
        focusFramesRef.current.delete(frame)
        missionHeadingRefs.current.get(focusMission.id)?.focus({ preventScroll: true })
      })
      focusFramesRef.current.add(frame)
    }
  }, [missions])

  useEffect(() => () => {
    claimRequestFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame))
    claimRequestFramesRef.current.clear()
    claimTimeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout))
    claimTimeoutsRef.current.clear()
    focusFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame))
    focusFramesRef.current.clear()
  }, [])

  const claimMission = (mission: AdventureMission) => {
    if (mission.status !== "complete" || pendingClaimIdsRef.current.has(mission.id)) return

    pendingClaimIdsRef.current.add(mission.id)
    setPendingClaimIds(new Set(pendingClaimIdsRef.current))
    setClaimFeedback((current) => ({
      ...current,
      [mission.id]: { state: "pending", message: `${mission.title}のごほうびを受け取っています。` },
    }))
    setClaimMessage(`${mission.title}のごほうびを受け取っています。`)

    const requestFrame = window.requestAnimationFrame(() => {
      claimRequestFramesRef.current.delete(mission.id)
      let result: ActionCheck | null = null
      let unexpectedFailure = false
      try {
        result = onClaimMission(mission.id)
      } catch {
        unexpectedFailure = true
      }
      if (result?.ok) {
        const timeout = window.setTimeout(() => {
          claimTimeoutsRef.current.delete(mission.id)
          if (!pendingClaimIdsRef.current.delete(mission.id)) return
          setPendingClaimIds(new Set(pendingClaimIdsRef.current))
          const message = "ごほうびの保存結果を確認できませんでした。画面を更新して、記録を確認してね。"
          setClaimFeedback((current) => ({
            ...current,
            [mission.id]: { state: "error", message },
          }))
          setClaimMessage(message)
          const focusFrame = window.requestAnimationFrame(() => {
            focusFramesRef.current.delete(focusFrame)
            const target = missionClaimButtonRefs.current.get(mission.id) ?? missionHeadingRefs.current.get(mission.id)
            target?.focus({ preventScroll: true })
          })
          focusFramesRef.current.add(focusFrame)
        }, 4000)
        claimTimeoutsRef.current.set(mission.id, timeout)
        return
      }

      pendingClaimIdsRef.current.delete(mission.id)
      setPendingClaimIds(new Set(pendingClaimIdsRef.current))
      const message = unexpectedFailure || !result
        ? "ごほうびの受け取り中に問題が起きました。もう一度ためしてね。"
        : claimFailureMessage(result.reason)
      setClaimFeedback((current) => ({
        ...current,
        [mission.id]: { state: "error", message },
      }))
      setClaimMessage(message)
      const focusFrame = window.requestAnimationFrame(() => {
        focusFramesRef.current.delete(focusFrame)
        missionClaimButtonRefs.current.get(mission.id)?.focus({ preventScroll: true })
      })
      focusFramesRef.current.add(focusFrame)
    })
    claimRequestFramesRef.current.set(mission.id, requestFrame)
  }

  return (
    <section className={styles.experienceScreen} aria-labelledby="adventure-title">
      <header className={styles.adventureHero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><Sparkles aria-hidden="true" /> MIYUKI CAT CLUB</p>
          <h2 id="adventure-title">きょうの猫クラブ</h2>
          <p>遊んで集めて、猫カフェをもっとすてきにしよう。</p>
          <div className={styles.heroStats} aria-label="猫クラブの記録">
            <span><CircleDollarSign aria-hidden="true" /><strong>{coins.toLocaleString("ja-JP")}</strong> にゃんコイン</span>
            <span><Star aria-hidden="true" /><strong>{hasActivityToday ? "きょう活動したよ" : "きょうはこれから"}</strong></span>
          </div>
        </div>
        <ExperienceArtwork
          src="/content/missions/daily-board.webp"
          alt="猫クラブのボードを持つ美雪と猫たち"
          className={styles.adventureHeroArt}
          eager
        />
      </header>

      <section className={styles.missionSection} aria-labelledby="mission-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}><Clock3 aria-hidden="true" /> TODAY&apos;S MISSION</p>
            <h3 id="mission-title">きょうのミッション</h3>
          </div>
          <span className={styles.countBadge} aria-label={`完了 ${completedCount} / ${missions.length}`}>完了 {completedCount} / {missions.length}</span>
        </div>

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{claimMessage}</p>

        {missions.length === 0 ? (
          <p className={styles.emptyNotice}>きょうのミッションは準備中だよ。猫とひと休みしよう。</p>
        ) : (
          <div className={styles.missionList}>
            {missions.map((mission) => {
              const safeGoal = Math.max(1, mission.goal)
              const safeProgress = Math.min(Math.max(0, mission.progress), safeGoal)
              const progressLabel = `${safeProgress} / ${safeGoal}`
              const feedback = claimFeedback[mission.id]
              const isPending = pendingClaimIds.has(mission.id)
              return (
                <article key={mission.id} className={styles.missionCard} data-status={mission.status}>
                  <span className={styles.missionIcon} aria-hidden="true">
                    {mission.status === "claimed" ? <Check /> : <Star />}
                  </span>
                  <div className={styles.missionCopy}>
                    <h4
                      ref={(node) => {
                        if (node) missionHeadingRefs.current.set(mission.id, node)
                        else missionHeadingRefs.current.delete(mission.id)
                      }}
                      tabIndex={-1}
                    >
                      {mission.title}
                    </h4>
                    <p>{mission.description}</p>
                    <div className={styles.progressRow}>
                      <progress
                        max={safeGoal}
                        value={safeProgress}
                        aria-label={`${mission.title}の進みぐあい ${progressLabel}`}
                      />
                      <span>{progressLabel}</span>
                    </div>
                  </div>
                  <div className={styles.rewardArea}>
                    <span><CircleDollarSign aria-hidden="true" /> {mission.rewardCoins}</span>
                    {mission.status === "complete" ? (
                      <button
                        ref={(node) => {
                          if (node) missionClaimButtonRefs.current.set(mission.id, node)
                          else missionClaimButtonRefs.current.delete(mission.id)
                        }}
                        type="button"
                        onClick={() => claimMission(mission)}
                        disabled={isPending}
                        aria-busy={isPending}
                      >
                        <Gift aria-hidden="true" /> {isPending ? "受け取り中…" : "うけとる"}
                      </button>
                    ) : mission.status === "claimed" ? (
                      <strong><Check aria-hidden="true" /> うけとったよ</strong>
                    ) : (
                      <small>あと {Math.max(0, safeGoal - safeProgress)}</small>
                    )}
                    {feedback?.state === "error" ? <small>{feedback.message}</small> : null}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className={styles.entranceSection} aria-labelledby="entrance-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}><Sparkles aria-hidden="true" /> LET&apos;S EXPLORE</p>
            <h3 id="entrance-title">どこへ行く？</h3>
          </div>
        </div>

        <div className={styles.entranceGrid}>
          {ENTRANCES.map((entrance) => {
            const Icon = entrance.icon
            const meta = entrance.id === "room"
              ? `家具 ${roomItemCount}こ`
              : entrance.id === "collections"
                ? `発見 ${collectionCount} / ${collectionTotal}`
                : storyChapterLabel

            return (
              <button
                key={entrance.id}
                type="button"
                className={styles.entranceCard}
                data-tone={entrance.tone}
                onClick={() => onOpen(entrance.id)}
              >
                <ExperienceArtwork src={entrance.art} alt={entrance.alt} className={styles.entranceArt} fit="cover" />
                <span className={styles.entranceCopy}>
                  <span className={styles.entranceEyebrow}><Icon aria-hidden="true" /> {entrance.eyebrow}</span>
                  <strong>{entrance.title}</strong>
                  <span>{entrance.description}</span>
                  <small>{meta}</small>
                </span>
                <ArrowRight className={styles.entranceArrow} aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </section>
    </section>
  )
}
