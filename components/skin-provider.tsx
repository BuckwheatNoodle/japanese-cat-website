"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { assetPath } from "@/lib/utils"
import { DEFAULT_SKIN_ID, getSeasonSkinId, isSkinId, SKINS, type SkinDefinition, type SkinId } from "@/lib/skins"

type SkinContextValue = {
  skin: SkinDefinition
  setSkin: (skinId: SkinId) => void
}

const SkinContext = createContext<SkinContextValue | null>(null)

type SkinProviderProps = {
  children: React.ReactNode
  configuredSkinId?: string
  onSkinChange?: (skinId: SkinId) => void
}

export function SkinProvider({ children, configuredSkinId, onSkinChange }: SkinProviderProps) {
  const [skinId, setSkinId] = useState<SkinId>(DEFAULT_SKIN_ID)

  useEffect(() => {
    const querySkin = new URLSearchParams(window.location.search).get("skin")
    let savedSkin: string | null = null
    try { savedSkin = window.localStorage.getItem("miyuki-cat-skin") } catch { /* 進行データ側の設定を使う */ }
    const configured = configuredSkinId === "season-auto"
      ? getSeasonSkinId()
      : isSkinId(configuredSkinId ?? null)
        ? configuredSkinId as SkinId
        : null
    const nextSkin = isSkinId(querySkin) ? querySkin : configured ?? (isSkinId(savedSkin) ? savedSkin : DEFAULT_SKIN_ID)
    setSkinId(nextSkin)
  }, [configuredSkinId])

  const value = useMemo<SkinContextValue>(() => {
    const source = SKINS[skinId]
    const { diaryIllustrations, passportStamps, gameCards, gameSprites, ...sharedAssets } = source.assets
    return {
      skin: {
        ...source,
        assets: {
          ...(Object.fromEntries(
            Object.entries(sharedAssets).map(([key, asset]) => [key, assetPath(asset)]),
          ) as Omit<SkinDefinition["assets"], "diaryIllustrations" | "passportStamps" | "gameCards" | "gameSprites">),
          diaryIllustrations: Object.fromEntries(
            Object.entries(diaryIllustrations).map(([key, asset]) => [key, assetPath(asset)]),
          ),
          passportStamps: Object.fromEntries(
            Object.entries(passportStamps).map(([key, asset]) => [key, assetPath(asset)]),
          ),
          gameCards: Object.fromEntries(
            Object.entries(gameCards).map(([key, asset]) => [key, assetPath(asset)]),
          ),
          gameSprites: Object.fromEntries(
            Object.entries(gameSprites).map(([key, asset]) => [key, assetPath(asset)]),
          ),
        },
      },
      setSkin: (nextSkinId) => {
        try { window.localStorage.setItem("miyuki-cat-skin", nextSkinId) } catch { /* 設定状態には保持する */ }
        setSkinId(nextSkinId)
        onSkinChange?.(nextSkinId)
      },
    }
  }, [onSkinChange, skinId])

  return (
    <SkinContext.Provider value={value}>
      <div
        className="cat-app"
        data-skin={skinId}
        style={SKINS[skinId].tokens as React.CSSProperties}
      >
        {children}
      </div>
    </SkinContext.Provider>
  )
}

export function useSkin() {
  const context = useContext(SkinContext)
  if (!context) throw new Error("useSkin must be used inside SkinProvider")
  return context
}
