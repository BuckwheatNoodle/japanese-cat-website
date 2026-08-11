"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { BottomTabs, type TabId } from "@/components/bottom-tabs"
import { GamesHub } from "@/components/games-hub"
import { SkinProvider } from "@/components/skin-provider"

const ColoringBook = dynamic(() => import("@/components/coloring-book").then((m) => m.ColoringBook))
const CatFortune = dynamic(() => import("@/components/cat-fortune").then((m) => m.CatFortune))
const PictureDiary = dynamic(() => import("@/components/picture-diary").then((m) => m.PictureDiary))

const TAB_IDS: TabId[] = ["home", "games", "coloring", "fortune", "diary"]

function MiyukiCatApp() {
  const [activeTab, setActiveTab] = useState<TabId>("home")

  const changeTab = useCallback((tab: TabId) => {
    setActiveTab(tab)
    window.history.replaceState(null, "", tab === "home" ? "#home" : `#${tab}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
    window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }))
  }, [])

  useEffect(() => {
    const tabFromHash = window.location.hash.slice(1) as TabId
    if (TAB_IDS.includes(tabFromHash)) setActiveTab(tabFromHash)
  }, [])

  return (
    <div className="site-frame">
      <a className="skip-link" href="#main-content">
        本文へ移動
      </a>
      <Header />

      <main id="main-content" className="main-stage" tabIndex={-1}>
        {activeTab === "home" && (
          <div data-testid="home-content" className="screen-enter">
            <Hero onNavigate={changeTab} />
          </div>
        )}

        {activeTab === "games" && (
          <div data-testid="games-content" className="screen-enter">
            <GamesHub />
          </div>
        )}

        {activeTab === "coloring" && (
          <div data-testid="coloring-content" className="screen-enter">
            <ColoringBook />
          </div>
        )}

        {activeTab === "fortune" && (
          <div data-testid="fortune-content" className="screen-enter">
            <CatFortune />
          </div>
        )}

        {activeTab === "diary" && (
          <div data-testid="diary-content" className="screen-enter">
            <PictureDiary />
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p>美雪の猫ページ</p>
        <p>おうちの人といっしょに、安心して楽しんでね。</p>
      </footer>

      <BottomTabs activeTab={activeTab} onTabChange={changeTab} />
    </div>
  )
}

export default function MiyukiCatPage() {
  return (
    <SkinProvider>
      <MiyukiCatApp />
    </SkinProvider>
  )
}
