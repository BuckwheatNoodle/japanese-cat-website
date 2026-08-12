"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle, PawPrint } from "lucide-react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { BottomTabs, type TabId } from "@/components/bottom-tabs"
import { GamesHub } from "@/components/games-hub"
import { SkinProvider } from "@/components/skin-provider"
import { ProgressionProvider, useProgression } from "@/components/progression-provider"
import { AdventureHub } from "@/components/adventure-hub"
import { CollectionBook, COLLECTION_CATALOG } from "@/components/collection-book"
import { RoomStudio, ROOM_ITEM_CATALOG } from "@/components/room-studio"
import { StoryMode, STORY_CHAPTERS_UI } from "@/components/story-mode"
import type { ActivityTab } from "@/components/home-passport"
import type { ActionCheck } from "@/lib/progression"

const ColoringBook = dynamic(() => import("@/components/coloring-book").then((module) => module.ColoringBook), { loading: () => <FeatureLoading /> })
const CatFortune = dynamic(() => import("@/components/cat-fortune").then((module) => module.CatFortune), { loading: () => <FeatureLoading /> })
const PictureDiary = dynamic(() => import("@/components/picture-diary").then((module) => module.PictureDiary), { loading: () => <FeatureLoading /> })
const SettingsCenter = dynamic(() => import("@/components/settings-center").then((module) => module.SettingsCenter), { loading: () => <FeatureLoading /> })
const ParentEditor = dynamic(() => import("@/components/parent-editor").then((module) => module.ParentEditor), { loading: () => <FeatureLoading /> })

type AuxiliaryView = "club" | "room" | "collections" | "story" | "settings" | "parent"
type ViewId = TabId | AuxiliaryView

const TAB_IDS: TabId[] = ["home", "games", "coloring", "fortune", "diary"]
const VIEW_IDS: ViewId[] = [...TAB_IDS, "club", "room", "collections", "story", "settings", "parent"]
const ACTIVITY_TABS: ActivityTab[] = ["games", "coloring", "fortune", "diary"]
const STORY_PROGRESS = {
  "cafe-opening": { startNodeId: "opening", firstNodeId: "cafe-opening-1", finalNodeId: "cafe-opening-2" },
  "lost-star": { startNodeId: "night-opening", firstNodeId: "lost-star-1", finalNodeId: "lost-star-2" },
  "festival-night": { startNodeId: "festival-opening", firstNodeId: "festival-night-1", finalNodeId: "festival-night-2" },
} as const

type StoryChapterId = keyof typeof STORY_PROGRESS

function getStoryProgress(chapterId: string) {
  return STORY_PROGRESS[chapterId as StoryChapterId]
}

function FeatureLoading() {
  return <div className="feature-loading" role="status" aria-live="polite"><PawPrint aria-hidden="true" />ねこたちが準備しています…</div>
}

function isViewId(value: string): value is ViewId {
  return VIEW_IDS.includes(value as ViewId)
}

function MiyukiCatApp() {
  const {
    state,
    ready,
    dailyMissions,
    storageWarnings,
    recordEvent,
    purchase,
    equip,
    unequip,
    claim,
  } = useProgression()
  const [activeView, setActiveView] = useState<ViewId>("home")
  const [lastActivity, setLastActivity] = useState<ActivityTab | null>(null)
  const [recommendation, setRecommendation] = useState<ActivityTab>(ACTIVITY_TABS[0])
  const reducedMotionRef = useRef(state.settings.reducedMotion)

  const visitedTabs = useMemo<ActivityTab[]>(() => {
    const visited: ActivityTab[] = []
    if (state.stats.gamesPlayed > 0) visited.push("games")
    if (state.stats.coloringsCompleted > 0) visited.push("coloring")
    if (state.stats.fortunesDrawn > 0) visited.push("fortune")
    if (state.stats.diariesRead > 0) visited.push("diary")
    return visited
  }, [state.stats.coloringsCompleted, state.stats.diariesRead, state.stats.fortunesDrawn, state.stats.gamesPlayed])

  useEffect(() => {
    reducedMotionRef.current = state.settings.reducedMotion
  }, [state.settings.reducedMotion])

  useEffect(() => {
    setRecommendation(ACTIVITY_TABS[new Date().getDate() % ACTIVITY_TABS.length])
  }, [])

  const changeView = useCallback((view: ViewId, historyMode: "push" | "replace" = "push") => {
    setActiveView(view)
    if (ACTIVITY_TABS.includes(view as ActivityTab)) setLastActivity(view as ActivityTab)
    const nextHash = `#${view}`
    if (historyMode === "replace") window.history.replaceState(null, "", nextHash)
    else if (window.location.hash !== nextHash) window.history.pushState(null, "", nextHash)
    window.scrollTo({ top: 0, behavior: reducedMotionRef.current ? "auto" : "smooth" })
    window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }))
  }, [])

  useEffect(() => {
    const initialView = window.location.hash.slice(1)
    const initial = isViewId(initialView) ? initialView : "home"
    setActiveView(initial)
    if (ACTIVITY_TABS.includes(initial as ActivityTab)) setLastActivity(initial as ActivityTab)
    window.history.replaceState(null, "", `#${initial}`)

    const syncView = () => {
      const next = window.location.hash.slice(1)
      if (isViewId(next)) {
        setActiveView(next)
        if (ACTIVITY_TABS.includes(next as ActivityTab)) setLastActivity(next as ActivityTab)
        window.scrollTo({ top: 0, behavior: "auto" })
        window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }))
      }
    }
    window.addEventListener("popstate", syncView)
    window.addEventListener("hashchange", syncView)
    return () => {
      window.removeEventListener("popstate", syncView)
      window.removeEventListener("hashchange", syncView)
    }
  }, [changeView])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.miyukiFont = state.settings.fontSize
    root.dataset.miyukiMotion = state.settings.reducedMotion ? "reduced" : "full"
    root.dataset.miyukiContrast = state.settings.highContrast ? "high" : "normal"
    root.dataset.miyukiFurigana = state.settings.furigana ? "shown" : "hidden"
  }, [state.settings.fontSize, state.settings.furigana, state.settings.highContrast, state.settings.reducedMotion])

  const roomItems = useMemo(() => ROOM_ITEM_CATALOG.map((item) => ({
    ...item,
    owned: state.inventory.ownedItemIds.includes(item.id),
  })), [state.inventory.ownedItemIds])

  const unlockedCollectionIds = useMemo(() => [...new Set([
    ...Object.keys(state.collections.cats).map((id) => id === "tabby" ? "cat-maron" : id),
    ...Object.keys(state.collections.naokunForms),
  ])], [state.collections.cats, state.collections.naokunForms])

  const missionCards = dailyMissions.map((mission) => ({
    id: mission.id,
    title: mission.title,
    description: mission.description,
    character: mission.character,
    completionLine: mission.completionLine,
    progress: mission.progress,
    goal: mission.goal,
    rewardCoins: mission.reward,
    status: mission.claimed ? "claimed" as const : mission.completed ? "complete" as const : "open" as const,
  }))

  const completedStoryChapterIds = STORY_CHAPTERS_UI
    .filter((chapter) => {
      const progress = getStoryProgress(chapter.id)
      return progress ? state.story.completedNodeIds.includes(progress.finalNodeId) : false
    })
    .map((chapter) => chapter.id)
  const nextStoryChapter = STORY_CHAPTERS_UI.find((chapter) => (
    state.story.unlockedChapterIds.includes(chapter.id) && !completedStoryChapterIds.includes(chapter.id)
  ))
  const storyChapterLabel = nextStoryChapter ? `第${nextStoryChapter.number}話をプレイ` : "全3話クリア！"

  const claimMission = (missionId: string): ActionCheck => {
    const mission = dailyMissions.find((candidate) => candidate.id === missionId)
    return mission ? claim(mission.id) : { ok: false, reason: "not-found" }
  }

  const finishStory = (chapterId: string, endingChoiceId: string | undefined) => {
    const chapterProgress = getStoryProgress(chapterId)
    if (!chapterProgress) return false
    return recordEvent({
      type: "story.nodeCompleted",
      eventId: `story:${chapterId}:${chapterProgress.finalNodeId}`,
      occurredAt: new Date().toISOString(),
      nodeId: chapterProgress.finalNodeId,
      ...(endingChoiceId ? { choiceId: endingChoiceId } : {}),
    })
  }

  const mainTab = TAB_IDS.includes(activeView as TabId) ? activeView as TabId : null

  if (!ready) {
    return (
      <div className="site-frame" aria-busy="true">
        <main id="main-content" className="main-stage app-startup" tabIndex={-1}>
          <FeatureLoading />
        </main>
      </div>
    )
  }

  return (
    <div className="site-frame">
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header coins={state.wallet.nyanCoins} onOpenClub={() => changeView("club")} onOpenSettings={() => changeView("settings")} />

      <main id="main-content" className="main-stage" tabIndex={-1}>
        {activeView === "home" && (
          <div data-testid="home-content" className="screen-enter">
            <Hero
              onNavigate={changeView}
              onOpenClub={() => changeView("club")}
              visitedTabs={visitedTabs}
              lastActivity={lastActivity}
              recommendation={recommendation}
              coins={state.wallet.nyanCoins}
              dateKey={state.daily.date}
            />
          </div>
        )}

        {activeView === "games" && <div data-testid="games-content" className="screen-enter"><GamesHub /></div>}
        {activeView === "coloring" && <div data-testid="coloring-content" className="screen-enter"><ColoringBook /></div>}
        {activeView === "fortune" && <div data-testid="fortune-content" className="screen-enter"><CatFortune /></div>}
        {activeView === "diary" && <div data-testid="diary-content" className="screen-enter"><PictureDiary /></div>}

        {activeView === "club" && (
          <div data-testid="club-content" className="screen-enter">
            <AdventureHub
              coins={state.wallet.nyanCoins}
              streakDays={Object.values(state.daily.progress).some(Boolean) ? 1 : 0}
              missions={missionCards}
              collectionCount={unlockedCollectionIds.length}
              collectionTotal={COLLECTION_CATALOG.length}
              roomItemCount={state.inventory.ownedItemIds.length}
              storyChapterLabel={storyChapterLabel}
              onClaimMission={claimMission}
              onOpen={(destination) => changeView(destination)}
            />
          </div>
        )}

        {activeView === "room" && (
          <div data-testid="room-content" className="screen-enter">
            <RoomStudio
              coins={state.wallet.nyanCoins}
              equipped={state.room.equipped}
              items={roomItems}
              onPlaceItem={(slot, itemId) => itemId ? equip(itemId) : unequip(slot)}
              onBuyItem={purchase}
              onBack={() => changeView("club")}
            />
          </div>
        )}

        {activeView === "collections" && (
          <div data-testid="collections-content" className="screen-enter">
            <CollectionBook unlockedIds={unlockedCollectionIds} onBack={() => changeView("club")} />
          </div>
        )}

        {activeView === "story" && (
          <div data-testid="story-content" className="screen-enter">
            <StoryMode
              chapters={STORY_CHAPTERS_UI}
              unlockedChapterIds={state.story.unlockedChapterIds}
              completedChapterIds={completedStoryChapterIds}
              onChoose={(chapterId, nodeId, choiceId) => {
                const chapterProgress = getStoryProgress(chapterId)
                if (!chapterProgress || nodeId !== chapterProgress.startNodeId) return true
                return recordEvent({
                  type: "story.nodeCompleted",
                  eventId: `story:${chapterId}:${chapterProgress.firstNodeId}`,
                  occurredAt: new Date().toISOString(),
                  nodeId: chapterProgress.firstNodeId,
                  choiceId,
                })
              }}
              onComplete={finishStory}
              onBack={() => changeView("club")}
            />
          </div>
        )}

        {activeView === "settings" && (
          <div data-testid="settings-content" className="screen-enter">
            <SettingsCenter onBack={() => changeView("club")} onOpenParentEditor={() => changeView("parent")} />
          </div>
        )}

        {activeView === "parent" && (
          <div data-testid="parent-content" className="screen-enter">
            {storageWarnings.length > 0 ? (
              <aside className="app-storage-warning" role="status" aria-live="polite">
                <AlertTriangle aria-hidden="true" />
                <div>
                  <strong>保護者向け・記録の技術情報</strong>
                  <p>{storageWarnings.join(" ")}</p>
                </div>
              </aside>
            ) : null}
            <ParentEditor onBack={() => changeView("settings")} />
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p>美雪の猫ページ</p>
        <p>ゲーム記録と作品は、この端末の中に保存されます。</p>
        <button type="button" className="footer-settings-link" onClick={() => changeView("settings")}>設定・保護者メニュー</button>
      </footer>

      <BottomTabs activeTab={mainTab} onTabChange={(tab) => changeView(tab)} />
    </div>
  )
}

function ProgressionSkinBridge() {
  const { state } = useProgression()
  return <SkinProvider configuredSkinId={state.settings.skinId}><MiyukiCatApp /></SkinProvider>
}

export default function MiyukiCatPage() {
  return <ProgressionProvider><ProgressionSkinBridge /></ProgressionProvider>
}
