"use client"

import Image from "next/image"
import { Gamepad2, PawPrint } from "lucide-react"
import { useSkin } from "@/components/skin-provider"
import type { TabId } from "@/components/bottom-tabs"

type HeroProps = {
  onNavigate: (tab: TabId) => void
}

export function Hero({ onNavigate }: HeroProps) {
  const { skin } = useSkin()

  const activities = [
    { id: "coloring" as const, label: "ぬりえ", image: skin.assets.activityColoring },
    { id: "fortune" as const, label: "占い", image: skin.assets.activityFortune },
    { id: "diary" as const, label: "日記", image: skin.assets.activityDiary },
  ]

  return (
    <section className="home-screen" aria-labelledby="home-title">
      <h2 id="home-title" className="sr-only">
        ねこカフェへようこそ
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
          <span>いっしょに遊ぼう！</span>
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
      </div>
      <div className="footer-trim" aria-hidden="true">
        <Image src={skin.assets.footerTrim} alt="" fill sizes="(max-width: 640px) 100vw, 820px" />
      </div>
    </section>
  )
}
