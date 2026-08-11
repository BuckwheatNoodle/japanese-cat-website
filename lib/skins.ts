export type SkinId = "cream-soda"

export type SkinAssets = {
  awning: string
  hero: string
  activityColoring: string
  activityFortune: string
  activityDiary: string
  passportHero: string
  gameGuide: string
  footerTrim: string
  navHome: string
  navGames: string
  navColoring: string
  navFortune: string
  navDiary: string
  diaryIllustrations: Record<string, string>
  passportStamps: Record<string, string>
  gameCards: Record<string, string>
  gameSprites: Record<string, string>
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
      passportHero: "/skins/cream-soda/passport/today-board.webp",
      gameGuide: "/cute-tabby-waving.png",
      footerTrim: "/skins/cream-soda/footer-trim-cropped.webp",
      navHome: "/skins/cream-soda/nav-home.webp",
      navGames: "/skins/cream-soda/nav-games.webp",
      navColoring: "/skins/cream-soda/nav-coloring.webp",
      navFortune: "/skins/cream-soda/nav-fortune.webp",
      navDiary: "/skins/cream-soda/nav-diary.webp",
      diaryIllustrations: {
        "2026-08-01": "/skins/cream-soda/diary/2026-08-01.webp",
        "2026-08-02": "/skins/cream-soda/diary/2026-08-02.webp",
        "2026-08-03": "/skins/cream-soda/diary/2026-08-03.webp",
        "2026-08-04": "/skins/cream-soda/diary/2026-08-04.webp",
        "2026-08-05": "/skins/cream-soda/diary/2026-08-05.webp",
        "2026-08-06": "/skins/cream-soda/diary/2026-08-06.webp",
        "2026-08-07": "/skins/cream-soda/diary/2026-08-07.webp",
        "2026-08-08": "/skins/cream-soda/diary/2026-08-08.webp",
        "2026-08-09": "/skins/cream-soda/diary/2026-08-09.webp",
        "2026-08-10": "/skins/cream-soda/diary/2026-08-10.webp",
        "2026-08-11": "/skins/cream-soda/diary/2026-08-11.webp",
        "2025-08-10": "/images/diary-2025-08-10.png",
        "2025-08-11": "/images/diary-2025-08-11.png",
        "2025-08-12": "/images/diary-2025-08-12.png",
        "2025-08-13": "/images/diary-2025-08-13.png",
        "2025-08-14": "/images/diary-2025-08-14.png",
        "2025-08-15": "/images/diary-2025-08-15.png",
        "2025-08-16": "/images/diary-2025-08-16.png",
        "2025-08-17": "/images/diary-2025-08-17.png",
        "2025-08-29": "/images/diary-2025-08-29.png",
        "2025-08-30": "/images/diary-2025-08-30.png",
        "2025-08-31": "/images/diary-2025-08-31.png",
      },
      passportStamps: {
        games: "/skins/cream-soda/passport/stamp-games.webp",
        coloring: "/skins/cream-soda/passport/stamp-coloring.webp",
        fortune: "/skins/cream-soda/passport/stamp-fortune.webp",
        diary: "/skins/cream-soda/passport/stamp-diary.webp",
      },
      gameCards: {
        rescue: "/skins/cream-soda/games/rescue.webp",
        quiz: "/skins/cream-soda/games/quiz.webp",
        breed: "/skins/cream-soda/games/breed.webp",
        memory: "/skins/cream-soda/games/memory.webp",
        simon: "/skins/cream-soda/games/simon.webp",
      },
      gameSprites: {
        tabby: "/skins/cream-soda/games/rescue-tabby.webp",
        white: "/white-cat.png",
        black: "/black-cat.png",
        dog: "/dog.png",
        poop: "/poop-icon.png",
      },
    },
  },
}

export function isSkinId(value: string | null): value is SkinId {
  return value !== null && Object.prototype.hasOwnProperty.call(SKINS, value)
}
