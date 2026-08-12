export type SkinId = "cream-soda" | "spring-strawberry" | "summer-soda" | "autumn-caramel" | "winter-berry"

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

const CREAM_SODA_SKIN: SkinDefinition = {
    id: "cream-soda",
    name: "クリームソーダのねこカフェ",
    tokens: {
      "--background": "#fffaf0",
      "--foreground": "#482816",
      "--card": "#fffdf8",
      "--card-foreground": "#482816",
      "--popover": "#fffdf8",
      "--popover-foreground": "#482816",
      "--primary": "#b63f39",
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
      "--skin-coral-strong": "#a63f39",
      "--skin-action": "#b63f39",
      "--skin-coral-ink": "#a63f39",
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
      passportHero: "/skins/cream-soda/passport/today-board-three-cats.webp",
      gameGuide: "/cute-tabby-waving.webp",
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
        "2026-08-12": "/content/diary/2026-08-12.webp",
        "2025-08-10": "/images/diary-2025-08-10.webp",
        "2025-08-11": "/images/diary-2025-08-11.webp",
        "2025-08-12": "/images/diary-2025-08-12.webp",
        "2025-08-13": "/images/diary-2025-08-13.webp",
        "2025-08-14": "/images/diary-2025-08-14.webp",
        "2025-08-15": "/images/diary-2025-08-15.webp",
        "2025-08-16": "/images/diary-2025-08-16.webp",
        "2025-08-17": "/images/diary-2025-08-17.webp",
        "2025-08-29": "/images/diary-2025-08-29.webp",
        "2025-08-30": "/images/diary-2025-08-30.webp",
        "2025-08-31": "/images/diary-2025-08-31.webp",
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
        white: "/white-cat.webp",
        black: "/black-cat.webp",
        dog: "/dog.webp",
      },
    },
}

function makeSeasonSkin(
  id: Exclude<SkinId, "cream-soda">,
  name: string,
  tokens: Partial<SkinDefinition["tokens"]>,
): SkinDefinition {
  return {
    ...CREAM_SODA_SKIN,
    id,
    name,
    tokens: { ...CREAM_SODA_SKIN.tokens, ...tokens } as SkinDefinition["tokens"],
    assets: CREAM_SODA_SKIN.assets,
  }
}

export const SKINS: Record<SkinId, SkinDefinition> = {
  "cream-soda": CREAM_SODA_SKIN,
  "spring-strawberry": makeSeasonSkin("spring-strawberry", "春のいちごミルク", {
    "--background": "#fff7f3",
    "--skin-canvas": "#fff5f2",
    "--skin-paper-warm": "#fff0e7",
    "--skin-mint": "#c7e0cb",
    "--skin-mint-strong": "#58866d",
    "--skin-coral": "#ef8b8c",
    "--skin-coral-strong": "#983a46",
    "--skin-action": "#a93f4b",
    "--skin-coral-ink": "#8f3441",
    "--skin-blush": "#f7ced6",
    "--skin-butter": "#f4db9a",
  }),
  "summer-soda": makeSeasonSkin("summer-soda", "夏の青空ソーダ", {
    "--background": "#f5fcfb",
    "--skin-canvas": "#f2fbfa",
    "--skin-paper-warm": "#edf8f4",
    "--skin-mint": "#b9e0d6",
    "--skin-mint-strong": "#397a70",
    "--skin-coral": "#f18372",
    "--skin-coral-strong": "#963e35",
    "--skin-action": "#a94439",
    "--skin-coral-ink": "#8f372f",
    "--skin-butter": "#f6dc86",
    "--skin-lavender": "#c8dff1",
  }),
  "autumn-caramel": makeSeasonSkin("autumn-caramel", "秋のキャラメルカフェ", {
    "--background": "#fff8ee",
    "--skin-canvas": "#fff6e9",
    "--skin-paper-warm": "#faead5",
    "--skin-mint": "#cbd7b0",
    "--skin-mint-strong": "#657b4e",
    "--skin-coral": "#df8762",
    "--skin-coral-strong": "#8d402b",
    "--skin-action": "#9d4932",
    "--skin-coral-ink": "#813822",
    "--skin-butter": "#eec982",
    "--skin-blush": "#efc6ae",
    "--skin-lavender": "#d8c9b5",
  }),
  "winter-berry": makeSeasonSkin("winter-berry", "冬のベリークリーム", {
    "--background": "#fbf8ff",
    "--skin-canvas": "#f8f5fc",
    "--skin-paper-warm": "#f3edf8",
    "--skin-mint": "#c5dcd7",
    "--skin-mint-strong": "#4f7873",
    "--skin-coral": "#d9869b",
    "--skin-coral-strong": "#82384e",
    "--skin-action": "#934057",
    "--skin-coral-ink": "#773047",
    "--skin-butter": "#eee0aa",
    "--skin-blush": "#ead1dd",
    "--skin-lavender": "#d8d2ee",
  }),
}

export function getSeasonSkinId(date = new Date()): SkinId {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return "spring-strawberry"
  if (month >= 6 && month <= 8) return "summer-soda"
  if (month >= 9 && month <= 11) return "autumn-caramel"
  return "winter-berry"
}

export function isSkinId(value: string | null): value is SkinId {
  return value !== null && Object.prototype.hasOwnProperty.call(SKINS, value)
}
