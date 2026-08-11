"use client"

import Image from "next/image"
import { useSkin } from "@/components/skin-provider"
import type { SkinAssets } from "@/lib/skins"

export type TabId = "home" | "games" | "coloring" | "fortune" | "diary"

type Tab = {
  id: TabId
  label: string
  assetKey: keyof Pick<SkinAssets, "navHome" | "navGames" | "navColoring" | "navFortune" | "navDiary">
  testId: string
}

const TABS: Tab[] = [
  { id: "home", label: "ホーム", assetKey: "navHome", testId: "tab-home" },
  { id: "games", label: "ゲーム", assetKey: "navGames", testId: "tab-games" },
  { id: "coloring", label: "ぬりえ", assetKey: "navColoring", testId: "tab-coloring" },
  { id: "fortune", label: "占い", assetKey: "navFortune", testId: "tab-fortune" },
  { id: "diary", label: "日記", assetKey: "navDiary", testId: "tab-diary" },
]

type BottomTabsProps = {
  activeTab: TabId | null
  onTabChange: (tab: TabId) => void
}

export function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
  const { skin } = useSkin()

  return (
    <nav data-testid="bottom-tabs" className="bottom-tabs" aria-label="メインメニュー">
      <div className="bottom-tabs-inner">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={tab.testId}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onTabChange(tab.id)}
              className="bottom-tab"
            >
              <span className="tab-icon-wrap" aria-hidden="true">
                <Image src={skin.assets[tab.assetKey]} alt="" fill sizes="40px" />
              </span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
