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
  { id: "games", label: "ゲーム攻略室", shortLabel: "ゲーム", description: "6競技から選んでベスト記録を更新。なおくんの珍プレーも検証できます。" },
  { id: "coloring", label: "カラー設計室", shortLabel: "ぬりえ", description: "配色と細部を自分で設計。作品は端末に自動保存されます。" },
  { id: "fortune", label: "今日のねこ占い", shortLabel: "占い", description: "名前ごとの結果を比較。まれになおくんが勝手に乱入します。" },
  { id: "diary", label: "美雪の事件記録", shortLabel: "日記", description: "美雪・なおくん・猫が起こした事件と、そのオチを調査します。" },
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
          <p className="passport-kicker"><Sparkles aria-hidden="true" /> MY CAT CAFE ACTIVITY LOG</p>
          <h3 id="passport-title">ねこカフェ活動ログ</h3>
          <p>各エリアを開くと調査記録が残ります。次に挑む場所もここで確認できます。</p>
        </div>
        <div className="passport-count" aria-label={`${ACTIVITIES.length}エリア中${visitedTabs.length}エリアを調査済み`}>
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
          <span className="passport-today-label"><Sparkles aria-hidden="true" /> 次の挑戦</span>
          <h4>{recommendationInfo.label}</h4>
          <p>{recommendationInfo.description}</p>
          <button type="button" className="passport-primary" onClick={() => onNavigate(recommendationInfo.id)}>
            挑戦を始める <ArrowRight aria-hidden="true" />
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

      <div className="passport-stamps" aria-label="エリアの調査記録">
        {ACTIVITIES.map((activity) => {
          const isUnlocked = unlocked.has(activity.id)
          return (
            <button
              key={activity.id}
              type="button"
              className={`passport-stamp ${isUnlocked ? "is-unlocked" : "is-locked"}`}
              onClick={() => onNavigate(activity.id)}
              aria-label={`${activity.label}。${isUnlocked ? "調査済み" : "未調査。開いて記録する"}`}
            >
              <span className="passport-stamp-art">
                <Image src={skin.assets.passportStamps[activity.id]} alt="" fill sizes="130px" />
                <span className="passport-stamp-status" aria-hidden="true">
                  {isUnlocked ? <Check /> : <LockKeyhole />}
                </span>
              </span>
              <strong>{activity.shortLabel}</strong>
              <small>{isUnlocked ? "調査済み" : "未調査"}</small>
            </button>
          )
        })}
      </div>

      {completed && (
        <div className="passport-complete" role="status">
          <Trophy aria-hidden="true" />
          <span><strong>全エリア調査完了。</strong>美雪が記録を確認している横で、なおくんは勝手に「うんち調査本部長」の名札を作りました。</span>
        </div>
      )}
    </section>
  )
}
