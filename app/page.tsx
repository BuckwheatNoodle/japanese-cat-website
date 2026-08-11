"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { BottomTabs, type TabId } from "@/components/bottom-tabs"
import { GamesHub } from "@/components/games-hub"
import { SkinProvider } from "@/components/skin-provider"
import type { ActivityTab } from "@/components/home-passport"

const ColoringBook = dynamic(() => import("@/components/coloring-book").then((m) => m.ColoringBook))
const CatFortune = dynamic(() => import("@/components/cat-fortune").then((m) => m.CatFortune))
const PictureDiary = dynamic(() => import("@/components/picture-diary").then((m) => m.PictureDiary))

const TAB_IDS: TabId[] = ["home", "games", "coloring", "fortune", "diary"]
const ACTIVITY_TABS: ActivityTab[] = ["games", "coloring", "fortune", "diary"]
const PASSPORT_STORAGE_KEY = "miyuki-cat-passport-v1"
const LAST_ACTIVITY_STORAGE_KEY = "miyuki-cat-last-activity"

function MiyukiCatApp() {
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [visitedTabs, setVisitedTabs] = useState<ActivityTab[]>([])
  const [lastActivity, setLastActivity] = useState<ActivityTab | null>(null)
  const [recommendation, setRecommendation] = useState<ActivityTab>("games")

  const rememberActivity = useCallback((tab: ActivityTab) => {
    setVisitedTabs((currentTabs) => {
      if (currentTabs.includes(tab)) return currentTabs
      const nextTabs = [...currentTabs, tab]
      window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(nextTabs))
      return nextTabs
    })
    setLastActivity(tab)
    window.localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, tab)
  }, [])

  const changeTab = useCallback((tab: TabId) => {
    setActiveTab(tab)
    if (tab !== "home") rememberActivity(tab)
    window.history.replaceState(null, "", tab === "home" ? "#home" : `#${tab}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
    window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }))
  }, [rememberActivity])

  useEffect(() => {
    const savedTabs = (() => {
      try {
        const value = JSON.parse(window.localStorage.getItem(PASSPORT_STORAGE_KEY) ?? "[]")
        return Array.isArray(value) ? value.filter((tab): tab is ActivityTab => ACTIVITY_TABS.includes(tab)) : []
      } catch {
        return []
      }
    })()
    const savedLastActivity = window.localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY)
    const tabFromHash = window.location.hash.slice(1) as TabId
    const initialTab = TAB_IDS.includes(tabFromHash) ? tabFromHash : "home"

    setVisitedTabs(savedTabs)
    setLastActivity(ACTIVITY_TABS.includes(savedLastActivity as ActivityTab) ? savedLastActivity as ActivityTab : null)
    setRecommendation(ACTIVITY_TABS[new Date().getDate() % ACTIVITY_TABS.length])
    setActiveTab(initialTab)

    if (initialTab !== "home") rememberActivity(initialTab)

    const syncTabWithHash = () => {
      const nextTab = window.location.hash.slice(1) as TabId
      if (!TAB_IDS.includes(nextTab)) return
      setActiveTab(nextTab)
      if (nextTab !== "home") rememberActivity(nextTab)
    }
    window.addEventListener("hashchange", syncTabWithHash)
    return () => window.removeEventListener("hashchange", syncTabWithHash)
  }, [rememberActivity])

  return (
    <div className="site-frame">
      <a className="skip-link" href="#main-content">
        本文へ移動
      </a>
      <Header />

      <main id="main-content" className="main-stage" tabIndex={-1}>
        {activeTab === "home" && (
          <div data-testid="home-content" className="screen-enter">
            <Hero
              onNavigate={changeTab}
              visitedTabs={visitedTabs}
              lastActivity={lastActivity}
              recommendation={recommendation}
            />
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
