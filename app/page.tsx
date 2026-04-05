"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { MiyukiProfile } from "@/components/miyuki-profile"
import { SectionDivider } from "@/components/section-divider"
import { WelcomeToast } from "@/components/welcome-toast"
import { FloatingCatGuide } from "@/components/floating-cat-guide"
import { BottomTabs, type TabId } from "@/components/bottom-tabs"
import { GamesHub } from "@/components/games-hub"

const ColoringBook = dynamic(() => import("@/components/coloring-book").then((m) => m.ColoringBook))
const CatFortune = dynamic(() => import("@/components/cat-fortune").then((m) => m.CatFortune))
const PictureDiary = dynamic(() => import("@/components/picture-diary").then((m) => m.PictureDiary))

export default function MiyukiCatPage() {
  const [activeTab, setActiveTab] = useState<TabId>("home")

  return (
    <div className="flex flex-col items-center min-h-screen pb-20">
      <Header />
      <WelcomeToast />
      <FloatingCatGuide />

      <main className="flex flex-col items-center w-full max-w-4xl px-4 py-6 md:py-8">
        {activeTab === "home" && (
          <div data-testid="home-content" className="w-full space-y-8 md:space-y-12 animate-slide-in-bottom">
            <Hero />
            <SectionDivider />
            <MiyukiProfile />
          </div>
        )}

        {activeTab === "games" && (
          <div data-testid="games-content" className="w-full animate-slide-in-bottom">
            <GamesHub />
          </div>
        )}

        {activeTab === "coloring" && (
          <div data-testid="coloring-content" className="w-full animate-slide-in-bottom">
            <ColoringBook />
          </div>
        )}

        {activeTab === "fortune" && (
          <div data-testid="fortune-content" className="w-full animate-slide-in-bottom">
            <CatFortune />
          </div>
        )}

        {activeTab === "diary" && (
          <div data-testid="diary-content" className="w-full animate-slide-in-bottom">
            <PictureDiary />
          </div>
        )}
      </main>

      <footer className="w-full py-6 mt-auto text-center text-sm text-[#8A6E59]">
        <p>© 2025 美雪の猫ページ All rights reserved.</p>
      </footer>

      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
