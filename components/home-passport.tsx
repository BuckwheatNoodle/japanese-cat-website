"use client"

import Image from "next/image"
import { ArrowRight, Check, Clock3, LockKeyhole, Sparkles, Trophy } from "lucide-react"
import type { TabId } from "@/components/bottom-tabs"
import { useSkin } from "@/components/skin-provider"

export type ActivityTab = Exclude<TabId, "home">

type HomePassportProps = {
  visitedTabs: ActivityTab[]
  lastActivity: ActivityTab | null
  recommendation: ActivityTab
  onNavigate: (tab: TabId) => void
}

const ACTIVITIES: Array<{
  id: ActivityTab
  label: string
  shortLabel: string
  description: string
}> = [
  { id: "games", label: "ねこゲーム", shortLabel: "ゲーム", description: "5つのゲームから好きなものを選ぼう" },
  { id: "coloring", label: "ねこぬりえ", shortLabel: "ぬりえ", description: "好きな色で自分だけの作品を作ろう" },
  { id: "fortune", label: "今日のねこ占い", shortLabel: "占い", description: "今日のラッキーをねこに聞いてみよう" },
  { id: "diary", label: "美雪の絵日記", shortLabel: "日記", description: "美雪・なおくん・猫の事件を読もう" },
]

export function HomePassport({ visitedTabs, lastActivity, recommendation, onNavigate }: HomePassportProps) {
  const { skin } = useSkin()
  const unlocked = new Set(visitedTabs)
  const completed = visitedTabs.length === ACTIVITIES.length
  const recommendationInfo = ACTIVITIES.find((item) => item.id === recommendation) ?? ACTIVITIES[0]
  const lastActivityInfo = ACTIVITIES.find((item) => item.id === lastActivity)

  return (
    <section className="home-passport" aria-labelledby="passport-title">
      <div className="passport-heading">
        <div>
          <p className="passport-kicker"><Sparkles aria-hidden="true" /> MY CAT CAFE PASSPORT</p>
          <h3 id="passport-title">ねこカフェパスポート</h3>
          <p>遊びに行くと、かわいいスタンプが集まるよ。</p>
        </div>
        <div className="passport-count" aria-label={`${ACTIVITIES.length}個中${visitedTabs.length}個のスタンプを獲得`}>
          <strong>{visitedTabs.length}</strong><span>/ {ACTIVITIES.length}</span>
        </div>
      </div>

      <div className="passport-board">
        <div className="passport-board-art">
          <Image
            src={skin.assets.passportHero}
            alt="パスポートを持つ美雪と、うんち帽子で喜ぶなおくん、2匹の猫"
            fill
            sizes="(max-width: 719px) 92vw, 360px"
          />
        </div>

        <div className="passport-today">
          <span className="passport-today-label"><Sparkles aria-hidden="true" /> 今日のおすすめ</span>
          <h4>{recommendationInfo.label}</h4>
          <p>{recommendationInfo.description}</p>
          <button type="button" className="passport-primary" onClick={() => onNavigate(recommendationInfo.id)}>
            やってみる <ArrowRight aria-hidden="true" />
          </button>

          {lastActivityInfo && lastActivityInfo.id !== recommendationInfo.id && (
            <button type="button" className="passport-continue" onClick={() => onNavigate(lastActivityInfo.id)}>
              <Clock3 aria-hidden="true" />
              <span><small>つづきから</small>{lastActivityInfo.shortLabel}へ</span>
              <ArrowRight aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="passport-progress" aria-hidden="true">
        <span style={{ width: `${(visitedTabs.length / ACTIVITIES.length) * 100}%` }} />
      </div>

      <div className="passport-stamps" aria-label="集めたスタンプ">
        {ACTIVITIES.map((activity) => {
          const isUnlocked = unlocked.has(activity.id)
          return (
            <button
              key={activity.id}
              type="button"
              className={`passport-stamp ${isUnlocked ? "is-unlocked" : "is-locked"}`}
              onClick={() => onNavigate(activity.id)}
              aria-label={`${activity.label}。${isUnlocked ? "スタンプ獲得済み" : "開いてスタンプを集める"}`}
            >
              <span className="passport-stamp-art">
                <Image src={skin.assets.passportStamps[activity.id]} alt="" fill sizes="130px" />
                <span className="passport-stamp-status" aria-hidden="true">
                  {isUnlocked ? <Check /> : <LockKeyhole />}
                </span>
              </span>
              <strong>{activity.shortLabel}</strong>
              <small>{isUnlocked ? "ゲット！" : "タップして集める"}</small>
            </button>
          )
        })}
      </div>

      {completed && (
        <div className="passport-complete" role="status">
          <Trophy aria-hidden="true" />
          <span><strong>スタンプコンプリート！</strong>ねこカフェ名人に認定します。</span>
        </div>
      )}
    </section>
  )
}
