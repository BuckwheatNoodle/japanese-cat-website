"use client"

import { Home, Gamepad2, Palette, CopySlash as Crystal, BookOpen } from "lucide-react"

export type TabId = "home" | "games" | "coloring" | "fortune" | "diary"

type Tab = {
  id: TabId
  label: string
  icon: React.ElementType
  testId: string
}

const TABS: Tab[] = [
  { id: "home", label: "ホーム", icon: Home, testId: "tab-home" },
  { id: "games", label: "ゲーム", icon: Gamepad2, testId: "tab-games" },
  { id: "coloring", label: "ぬりえ", icon: Palette, testId: "tab-coloring" },
  { id: "fortune", label: "占い", icon: Crystal, testId: "tab-fortune" },
  { id: "diary", label: "日記", icon: BookOpen, testId: "tab-diary" },
]

type BottomTabsProps = {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
  return (
    <nav
      data-testid="bottom-tabs"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t-2 border-[#EAD8C0] safe-area-bottom"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              data-testid={tab.testId}
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive
                  ? "text-[#D4A57A]"
                  : "text-[#8A6E59]/60 hover:text-[#8A6E59]"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
              <span className={`text-[10px] leading-tight ${isActive ? "font-bold" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#D4A57A]" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
