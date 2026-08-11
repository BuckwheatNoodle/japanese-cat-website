export type SkinId = "cream-soda"

export type SkinAssets = {
  awning: string
  hero: string
  activityColoring: string
  activityFortune: string
  activityDiary: string
  gameGuide: string
  footerTrim: string
  navHome: string
  navGames: string
  navColoring: string
  navFortune: string
  navDiary: string
}

export type SkinDefinition = {
  id: SkinId
  name: string
  tokens: Record<`--${string}`, string>
  assets: SkinAssets
}

export const DEFAULT_SKIN_ID: SkinId = "cream-soda"

export const SKINS: Record<SkinId, SkinDefinition> = {
  "cream-soda": {
    id: "cream-soda",
    name: "クリームソーダのねこカフェ",
    tokens: {
      "--background": "#fffaf0",
      "--foreground": "#482816",
      "--card": "#fffdf8",
      "--card-foreground": "#482816",
      "--popover": "#fffdf8",
      "--popover-foreground": "#482816",
      "--primary": "#f17469",
      "--primary-foreground": "#ffffff",
      "--secondary": "#c7dfc9",
      "--secondary-foreground": "#3f2a1d",
      "--muted": "#f5ead7",
      "--muted-foreground": "#765d4b",
      "--accent": "#f8d99b",
      "--accent-foreground": "#482816",
      "--destructive": "#c84e49",
      "--destructive-foreground": "#ffffff",
      "--border": "#dec5a5",
      "--input": "#ead7bd",
      "--ring": "#e1655d",
      "--skin-canvas": "#fff9ed",
      "--skin-paper": "#fffdf7",
      "--skin-paper-warm": "#fff3dc",
      "--skin-ink": "#482816",
      "--skin-ink-soft": "#765d4b",
      "--skin-line": "#d9b78e",
      "--skin-mint": "#b8d8bf",
      "--skin-mint-strong": "#72a889",
      "--skin-coral": "#f17469",
      "--skin-coral-strong": "#d95c54",
      "--skin-butter": "#f7d692",
      "--skin-blush": "#f6c7c2",
      "--skin-lavender": "#d9c7e6",
      "--skin-shadow": "0 10px 28px rgba(100, 68, 39, 0.14)",
      "--skin-shadow-soft": "0 5px 16px rgba(100, 68, 39, 0.1)",
      "--skin-radius": "24px",
      "--skin-radius-small": "16px",
    },
    assets: {
      awning: "/skins/cream-soda/cafe-awning.webp",
      hero: "/skins/cream-soda/hero-cafe-v2.webp",
      activityColoring: "/skins/cream-soda/activity-coloring.webp",
      activityFortune: "/skins/cream-soda/activity-fortune.webp",
      activityDiary: "/skins/cream-soda/activity-diary.webp",
      gameGuide: "/cute-tabby-waving.png",
      footerTrim: "/skins/cream-soda/footer-trim-cropped.webp",
      navHome: "/skins/cream-soda/nav-home.webp",
      navGames: "/skins/cream-soda/nav-games.webp",
      navColoring: "/skins/cream-soda/nav-coloring.webp",
      navFortune: "/skins/cream-soda/nav-fortune.webp",
      navDiary: "/skins/cream-soda/nav-diary.webp",
    },
  },
}

export function isSkinId(value: string | null): value is SkinId {
  return value !== null && Object.prototype.hasOwnProperty.call(SKINS, value)
}
