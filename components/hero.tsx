"use client"

import Image from "next/image"
import { ArrowRight, CircleDollarSign, Gamepad2, PawPrint, Sparkles } from "lucide-react"
import { useSkin } from "@/components/skin-provider"
import type { TabId } from "@/components/bottom-tabs"
import { HomePassport, type ActivityTab } from "@/components/home-passport"
import { assetPath } from "@/lib/utils"

const TODAY_NAOKUN = [
  {
    title: "雲うんちで空中おひるね",
    setup: "なおくんが『今日はふわふわ担当！』と浮かびました。",
    punchline: "3秒後、猫たち全員のベッドになりました。本人はうれしそう。",
    image: "/content/collections/naokun/poop-cloud.webp",
    destination: "diary" as const,
  },
  {
    title: "パン屋うんち、看板だけ完売",
    setup: "なおくんは厨房の外の撮影台で、猫パンの絵札を持つ看板係です。",
    punchline: "マロンは絵札より先になおくんをクッション認定。本人は大喜び！",
    image: "/content/collections/naokun/poop-bakery.webp",
    destination: "diary" as const,
  },
  {
    title: "忍者うんち、かくれきれず",
    setup: "なおくんは完ぺきに隠れたと言っています。",
    punchline: "しっぽがないのに、猫全員から一秒で見つかりました。",
    image: "/content/collections/naokun/poop-ninja.webp",
    destination: "games" as const,
  },
  {
    title: "宇宙うんち、玄関で待機",
    setup: "『月まで行ってくる！』と出発したなおくん。",
    punchline: "美雪に上ばきを忘れたと言われ、まだ玄関です。",
    image: "/content/collections/naokun/poop-space.webp",
    destination: "fortune" as const,
  },
  {
    title: "芸術家うんちの大作",
    setup: "なおくんが自分の肖像画を描きました。",
    punchline: "どこから見ても茶色い丸。猫たちは満場一致で本人だと認定！",
    image: "/content/collections/naokun/poop-artist.webp",
    destination: "coloring" as const,
  },
  {
    title: "猫うんち、仲間入りに挑戦",
    setup: "なおくんが猫みみをつけて『にゃおくんです』。",
    punchline: "クロから肉球テストを出され、うんちポーズで合格しました。",
    image: "/content/collections/naokun/poop-cat.webp",
    destination: "games" as const,
  },
  {
    title: "金のうんち王、まぶしすぎ",
    setup: "なおくんが『今日のぼく、レア！』と登場。",
    punchline: "美雪も猫も全員ほそ目。なおくんだけ満面の笑みです。",
    image: "/content/collections/naokun/poop-gold.webp",
    destination: "diary" as const,
  },
] as const

function getDailyNaokun(dateKey: string) {
  const digitTotal = [...dateKey].reduce((total, character) => total + (Number(character) || 0), 0)
  return TODAY_NAOKUN[digitTotal % TODAY_NAOKUN.length]
}

type HeroProps = {
  onNavigate: (tab: TabId) => void
  visitedTabs: ActivityTab[]
  lastActivity: ActivityTab | null
  recommendation: ActivityTab
  coins: number
  dateKey: string
  onOpenClub: () => void
}

export function Hero({ onNavigate, visitedTabs, lastActivity, recommendation, coins, dateKey, onOpenClub }: HeroProps) {
  const { skin } = useSkin()
  const todayNaokun = getDailyNaokun(dateKey)

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

        <button
          type="button"
          className="today-naokun-card"
          onClick={() => onNavigate(todayNaokun.destination)}
          aria-label={`今日のなおくん。${todayNaokun.title}。${todayNaokun.punchline}`}
        >
          <span className="today-naokun-art">
            <Image src={assetPath(todayNaokun.image)} alt={todayNaokun.title} fill sizes="112px" />
          </span>
          <span className="today-naokun-copy">
            <small><Sparkles aria-hidden="true" /> TODAY&apos;S NAOKUN</small>
            <strong>今日のなおくん</strong>
            <b>{todayNaokun.title}</b>
            <span>{todayNaokun.setup}</span>
            <em>{todayNaokun.punchline}</em>
          </span>
          <ArrowRight className="today-naokun-arrow" aria-hidden="true" />
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
            <span>ミッション・カフェ編集・図鑑・分岐ストーリー</span>
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

      <style jsx>{`
        .today-naokun-card {
          display: grid;
          width: 100%;
          min-height: 132px;
          grid-template-columns: 106px minmax(0, 1fr) 22px;
          align-items: center;
          gap: 10px;
          padding: 10px;
          overflow: hidden;
          border: 2px solid var(--skin-coral);
          border-radius: 21px;
          color: var(--skin-ink);
          background: linear-gradient(145deg, color-mix(in srgb, var(--skin-blush) 48%, white), color-mix(in srgb, var(--skin-butter) 38%, white));
          box-shadow: 0 5px 0 color-mix(in srgb, var(--skin-coral) 32%, transparent);
          text-align: left;
        }
        .today-naokun-art {
          position: relative;
          display: block;
          width: 106px;
          aspect-ratio: 1;
          overflow: hidden;
          border: 2px solid white;
          border-radius: 16px;
          background: var(--skin-paper-warm);
        }
        .today-naokun-art :global(img) { object-fit: cover; }
        .today-naokun-copy { display: grid; gap: 3px; min-width: 0; overflow-wrap: anywhere; }
        .today-naokun-copy small {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--skin-coral-strong);
          flex-wrap: wrap;
          font-size: .75rem;
          font-weight: 900;
          letter-spacing: .04em;
        }
        .today-naokun-copy small :global(svg) { width: 13px; height: 13px; }
        .today-naokun-copy > strong { font-size: .8rem; color: var(--skin-coral-strong); }
        .today-naokun-copy > b { font-size: 1rem; line-height: 1.4; }
        .today-naokun-copy > span { color: var(--skin-ink-soft); font-size: .82rem; line-height: 1.55; }
        .today-naokun-copy > em { color: var(--skin-ink); font-size: .85rem; font-style: normal; font-weight: 800; line-height: 1.55; }
        .today-naokun-arrow { width: 21px; color: var(--skin-coral-strong); }
        @media (max-width: 370px) {
          .today-naokun-card { grid-template-columns: 76px minmax(0, 1fr); align-items: start; gap: 8px; padding: 9px; }
          .today-naokun-art { width: 76px; }
          .today-naokun-arrow { display: none; }
        }
      `}</style>
    </section>
  )
}
