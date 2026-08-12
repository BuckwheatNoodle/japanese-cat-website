"use client"

import Image from "next/image"
import { ArrowRight, CircleDollarSign, Gamepad2, PawPrint, Sparkles } from "lucide-react"
import { useSkin } from "@/components/skin-provider"
import type { TabId } from "@/components/bottom-tabs"
import { HomePassport, type ActivityTab } from "@/components/home-passport"
import { assetPath } from "@/lib/utils"

type HeroProps = {
  onNavigate: (tab: TabId) => void
  visitedTabs: ActivityTab[]
  lastActivity: ActivityTab | null
  recommendation: ActivityTab
  coins: number
  onOpenClub: () => void
}

export function Hero({ onNavigate, visitedTabs, lastActivity, recommendation, coins, onOpenClub }: HeroProps) {
  const { skin } = useSkin()

  const activities = [
    { id: "coloring" as const, label: "ぬりえ", image: skin.assets.activityColoring },
    { id: "fortune" as const, label: "占い", image: skin.assets.activityFortune },
    { id: "diary" as const, label: "日記", image: skin.assets.activityDiary },
  ]

  return (
    <section className="home-screen" aria-labelledby="home-title">
      <h2 id="home-title" className="sr-only">
        美雪のねこカフェ、今日も開店中
      </h2>

      <div className="hero-art">
        <Image
          src={skin.assets.hero}
          alt="クリームソーダのある猫カフェで、茶トラ猫を抱っこして笑う美雪"
          fill
          sizes="(max-width: 640px) 100vw, 760px"
          priority
        />
      </div>

      <div className="home-actions">
        <button type="button" className="play-button" onClick={() => onNavigate("games")}>
          <span className="play-icon" aria-hidden="true">
            <Gamepad2 />
          </span>
          <span>ゲームを選ぶ</span>
          <PawPrint className="play-paw" aria-hidden="true" />
        </button>

        <div className="activity-grid" aria-label="ほかの遊び">
          {activities.map((activity) => (
            <button
              key={activity.id}
              type="button"
              className={`activity-card activity-${activity.id}`}
              onClick={() => onNavigate(activity.id)}
            >
              <span className="activity-title">{activity.label}</span>
              <span className="activity-image">
                <Image
                  src={activity.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 31vw, 220px"
                />
              </span>
            </button>
          ))}
        </div>

        <button type="button" className="home-club-card" onClick={onOpenClub}>
          <span className="home-club-art" aria-hidden="true">
            <Image src={assetPath("/content/missions/daily-board.webp")} alt="" fill sizes="132px" />
          </span>
          <span className="home-club-copy">
            <small><Sparkles aria-hidden="true" /> MIYUKI CAT CLUB</small>
            <strong>猫クラブ活動ボード</strong>
            <span>ミッション・カフェ編集・いつもの三匹図鑑</span>
            <b><CircleDollarSign aria-hidden="true" /> {coins.toLocaleString("ja-JP")} にゃんコイン</b>
          </span>
          <ArrowRight className="home-club-arrow" aria-hidden="true" />
        </button>

        <HomePassport
          visitedTabs={visitedTabs}
          lastActivity={lastActivity}
          recommendation={recommendation}
          onNavigate={onNavigate}
        />
      </div>
      <div className="footer-trim" aria-hidden="true">
        <Image src={skin.assets.footerTrim} alt="" fill sizes="(max-width: 640px) 100vw, 820px" />
      </div>

    </section>
  )
}
