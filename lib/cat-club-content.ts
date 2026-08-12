import type { AppStateV1 } from "@/lib/progression"

export type CatGesture = {
  id: string
  name: string
  description: string
  catName: "トラちゃん" | "キキ" | "フワ"
  emoji: string
  unlockHint: string
  unlocked: boolean
}

export function getCatGestures(state: AppStateV1): CatGesture[] {
  const completed = new Set(state.stats.completedColoringPageIds)
  const played = new Set(Object.keys(state.stats.gameHighScores))
  return [
    { id: "tail-up", name: "しっぽをぴん", description: "うれしい挨拶。しっぽを立てて近づきます。", catName: "トラちゃん", emoji: "！", unlockHint: "ゲームを1回遊ぶ", unlocked: state.stats.gamesPlayed > 0 },
    { id: "zoomies", name: "急に大運動会", description: "元気が余ると部屋を一気に駆け抜けます。", catName: "トラちゃん", emoji: "➜", unlockHint: "2種類のゲームを遊ぶ", unlocked: played.size >= 2 },
    { id: "loaf", name: "香箱座り", description: "前足をしまって、食パンのように丸く座ります。", catName: "キキ", emoji: "▰", unlockHint: "日記を3件読む", unlocked: state.stats.readDiaryDates.length >= 3 },
    { id: "slow-blink", name: "ゆっくりまばたき", description: "安心しているときの、静かな好きの合図です。", catName: "キキ", emoji: "◡", unlockHint: "日記をお気に入りにする", unlocked: state.diary.favoriteDates.length > 0 },
    { id: "kneading", name: "ふみふみ", description: "柔らかい場所を前足で交互に押します。", catName: "フワ", emoji: "♩", unlockHint: "ぬりえを1枚完成", unlocked: state.stats.coloringsCompleted > 0 || completed.size > 0 },
    { id: "belly-up", name: "へそ天", description: "おなかを上にして、すっかり安心して眠ります。", catName: "フワ", emoji: "☁", unlockHint: "占いとメニュー工房で遊ぶ", unlocked: state.stats.fortunesDrawn > 0 && state.room.menuCreations.length > 0 },
  ]
}

export type WeeklyNews = {
  weekLabel: string
  activities: AppStateV1["stats"]["activityLog"]
  counts: Record<ActivityType, number>
  headline: string
  catComment: string
}

type ActivityType = AppStateV1["stats"]["activityLog"][number]["type"]

function startOfWeek(now: Date) {
  const start = new Date(now)
  const day = start.getDay()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - day)
  return start
}

export function getWeeklyNews(state: AppStateV1, now = new Date()): WeeklyNews {
  const start = startOfWeek(now)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const activities = state.stats.activityLog.filter((entry) => new Date(entry.occurredAt) >= start)
  const counts: Record<ActivityType, number> = { game: 0, coloring: 0, fortune: 0, diary: 0, room: 0, favorite: 0, menu: 0, request: 0 }
  activities.forEach((entry) => { counts[entry.type] += 1 })
  const main = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const labels: Record<string, string> = { game: "ゲーム攻略", coloring: "配色研究", fortune: "ねこ占い", diary: "事件調査", room: "カフェ改装", favorite: "名オチ選び", menu: "新メニュー", request: "三匹のお願い" }
  return {
    weekLabel: `${start.getMonth() + 1}月${start.getDate()}日〜${end.getMonth() + 1}月${end.getDate()}日`,
    activities,
    counts,
    headline: activities.length ? `今週いちばん活発だったのは「${labels[main[0]]}」でした` : "今週の第一報を猫たちが待っています",
    catComment: activities.length >= 5
      ? "トラちゃんは速報担当、キキは校正、フワは新聞の上でお昼寝担当でした。"
      : "三匹は次の記事候補を相談中。小さな活動も立派な一面記事です。",
  }
}
