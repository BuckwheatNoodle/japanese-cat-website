"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { assetPath } from "@/lib/utils"
import { DEFAULT_SKIN_ID, isSkinId, SKINS, type SkinDefinition, type SkinId } from "@/lib/skins"

type SkinContextValue = {
  skin: SkinDefinition
  setSkin: (skinId: SkinId) => void
}

const SkinContext = createContext<SkinContextValue | null>(null)

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skinId, setSkinId] = useState<SkinId>(DEFAULT_SKIN_ID)

  useEffect(() => {
    const querySkin = new URLSearchParams(window.location.search).get("skin")
    const savedSkin = window.localStorage.getItem("miyuki-cat-skin")
    const nextSkin = isSkinId(querySkin) ? querySkin : isSkinId(savedSkin) ? savedSkin : DEFAULT_SKIN_ID
    setSkinId(nextSkin)
  }, [])

  const value = useMemo<SkinContextValue>(() => {
    const source = SKINS[skinId]
    return {
      skin: {
        ...source,
        assets: Object.fromEntries(
          Object.entries(source.assets).map(([key, value]) => [key, assetPath(value)]),
        ) as SkinDefinition["assets"],
      },
      setSkin: (nextSkinId) => {
        window.localStorage.setItem("miyuki-cat-skin", nextSkinId)
        setSkinId(nextSkinId)
      },
    }
  }, [skinId])

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
