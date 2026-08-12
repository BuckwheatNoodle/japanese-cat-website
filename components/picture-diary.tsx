"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, PawPrint, Sparkles, Square, Volume2 } from "lucide-react"
import { DIARY_CAT_BY_ID, DIARY_ENTRIES, type DiaryEntry } from "@/lib/diary"
import { useSkin } from "@/components/skin-provider"
import { useProgression } from "@/components/progression-provider"
import {
  CONTENT_OVERRIDE_APPLIED_KEY,
  readContentOverrides,
  type DiaryContentOverride,
} from "@/lib/content-overrides"
import { assetPath, getLocalDateKey } from "@/lib/utils"

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"]

export type DisplayDiaryEntry = Omit<DiaryEntry, "collectionId"> & {
  collectionId?: DiaryEntry["collectionId"]
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return { year, month, day }
}

function formatMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number)
  return `${year}年${month}月`
}

function formatFullDate(dateKey: string) {
  const { year, month, day } = parseDateKey(dateKey)
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(year, month - 1, day, 12))
}

function createCalendarWeeks(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number)
  const firstWeekday = new Date(year, month - 1, 1, 12).getDay()
  const daysInMonth = new Date(year, month, 0, 12).getDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  while (cells.length % 7 !== 0) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7))
}

function dateKeyFor(monthKey: string, day: number) {
  return `${monthKey}-${String(day).padStart(2, "0")}`
}

export function mergeDiaryEntries(overrides: readonly DiaryContentOverride[]) {
  const merged = new Map<string, DisplayDiaryEntry>(DIARY_ENTRIES.map((entry) => [entry.date, entry]))
  for (const override of overrides) {
    if (override.hidden) {
      merged.delete(override.date)
    } else {
      merged.set(override.date, {
        date: override.date,
        title: override.title,
        body: override.body,
        miyukiNote: override.miyukiNote,
        illustration: override.illustration,
        imagePath: override.illustration,
        alt: override.alt,
        collectionId: override.transformationForm && override.transformationForm !== "none"
          ? override.transformationForm
          : undefined,
        catIds: override.catIds ?? [],
        punchlineType: "surprise-reveal",
        glossary: [],
      })
    }
  }
  return [...merged.values()].sort((a, b) => b.date.localeCompare(a.date))
}

export function diaryReadMetadataSignature(
  entry: Pick<DisplayDiaryEntry, "catIds" | "collectionId">,
) {
  const form = entry.collectionId ?? "none"
  const cats = [...new Set(entry.catIds)].sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
  return `${form}--${cats.length > 0 ? cats.join(".") : "no-cats"}`
}

export function createDiaryReadEvent(
  entry: Pick<DisplayDiaryEntry, "date" | "catIds" | "collectionId">,
  actionNow = new Date(),
) {
  const actionDateKey = getLocalDateKey(actionNow)
  const metadataSignature = diaryReadMetadataSignature(entry)
  return {
    type: "diary.read" as const,
    eventId: `diary:${actionDateKey}:${entry.date}:${metadataSignature}`,
    occurredAt: actionNow.toISOString(),
    diaryDate: entry.date,
    catIds: [...entry.catIds],
    ...(entry.collectionId ? { naokunFormId: entry.collectionId } : {}),
  }
}

export function PictureDiary() {
  const { skin } = useSkin()
  const { state, ready, recordEvent } = useProgression()
  const [entries, setEntries] = useState<DisplayDiaryEntry[]>([])
  const [displayedMonth, setDisplayedMonth] = useState(DIARY_ENTRIES[0].date.slice(0, 7))
  const [selectedDate, setSelectedDate] = useState("")
  const [overridesReady, setOverridesReady] = useState(false)
  const [todayKey, setTodayKey] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechMessage, setSpeechMessage] = useState("")
  const detailRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const syncToday = () => setTodayKey(getLocalDateKey())
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") syncToday()
    }
    syncToday()
    const interval = window.setInterval(syncToday, 60_000)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const refresh = () => {
      try {
        const result = readContentOverrides(window.localStorage, "applied")
        const overrides = result.ok ? result.value.diaryEntries : []
        const nextEntries = mergeDiaryEntries(overrides)
        const nextMonths = [...new Set(nextEntries.map((entry) => entry.date.slice(0, 7)))].sort((a, b) => b.localeCompare(a))
        setEntries(nextEntries)
        setDisplayedMonth((current) => nextMonths.includes(current) ? current : nextMonths[0] ?? current)
        setSelectedDate((current) => nextEntries.some((entry) => entry.date === current) ? current : nextEntries[0]?.date ?? "")
      } catch {
        setEntries(DIARY_ENTRIES)
        setDisplayedMonth(DIARY_ENTRIES[0].date.slice(0, 7))
        setSelectedDate(DIARY_ENTRIES[0].date)
      } finally {
        setOverridesReady(true)
      }
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === CONTENT_OVERRIDE_APPLIED_KEY) refresh()
    }
    refresh()
    window.addEventListener("miyuki:content-overrides-applied", refresh)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("miyuki:content-overrides-applied", refresh)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const entriesByDate = useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry])),
    [entries],
  )
  const availableMonths = useMemo(
    () => [...new Set(entries.map((entry) => entry.date.slice(0, 7)))].sort((a, b) => b.localeCompare(a)),
    [entries],
  )
  const monthEntries = useMemo(
    () => entries.filter((entry) => entry.date.startsWith(displayedMonth)).sort((a, b) => a.date.localeCompare(b.date)),
    [displayedMonth, entries],
  )
  const calendarWeeks = useMemo(() => createCalendarWeeks(displayedMonth), [displayedMonth])
  const selectedEntry = entriesByDate.get(selectedDate) ?? monthEntries.at(-1) ?? entries[0]
  const selectedEntryIndex = selectedEntry ? monthEntries.findIndex((entry) => entry.date === selectedEntry.date) : -1
  const monthIndex = availableMonths.indexOf(displayedMonth)
  const previousEntry = selectedEntryIndex > 0 ? monthEntries[selectedEntryIndex - 1] : null
  const nextEntry = selectedEntryIndex >= 0 && selectedEntryIndex < monthEntries.length - 1 ? monthEntries[selectedEntryIndex + 1] : null

  useEffect(() => {
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setSpeechMessage("")
  }, [selectedEntry?.date, state.settings.readAloud])

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
  }, [])

  const recordDiaryRead = (entry: DisplayDiaryEntry, actionNow = new Date()) => {
    if (!ready || !overridesReady) return
    recordEvent(createDiaryReadEvent(entry, actionNow))
  }

  const selectEntry = (entry: DisplayDiaryEntry, moveToDetail = true) => {
    recordDiaryRead(entry)
    setSelectedDate(entry.date)
    if (moveToDetail) {
      window.requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: state.settings.reducedMotion ? "auto" : "smooth", block: "start" })
        detailRef.current?.focus({ preventScroll: true })
      })
    }
  }

  const showMonthAt = (nextMonthIndex: number) => {
    const nextMonth = availableMonths[nextMonthIndex]
    if (!nextMonth) return
    const nextEntries = entries.filter((entry) => entry.date.startsWith(nextMonth)).sort((a, b) => a.date.localeCompare(b.date))
    setDisplayedMonth(nextMonth)
    if (nextEntries.length > 0) setSelectedDate(nextEntries.at(-1)!.date)
  }

  const illustration = selectedEntry ? assetPath(selectedEntry.imagePath) : skin.assets.activityDiary
  const illustrationAlt = selectedEntry?.alt ?? ""
  const selectedCatNames = selectedEntry
    ? selectedEntry.catIds.map((catId) => DIARY_CAT_BY_ID[catId]?.name).filter(Boolean).join("・")
    : ""

  const toggleReadAloud = () => {
    if (!selectedEntry) return
    if (!("speechSynthesis" in window)) {
      setSpeechMessage("このブラウザでは読み上げを使えません。")
      return
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeechMessage("読み上げを止めました。")
      return
    }
    recordDiaryRead(selectedEntry)
    const spokenDiary = selectedEntry.title
      + "。" + selectedEntry.body
    const utterance = new SpeechSynthesisUtterance(spokenDiary)
    utterance.lang = "ja-JP"
    utterance.volume = Math.max(0.2, state.settings.sfxVolume)
    utterance.onend = () => {
      setIsSpeaking(false)
      setSpeechMessage("読み上げが終わりました。")
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setSpeechMessage("読み上げを続けられませんでした。")
    }
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
    setSpeechMessage("日記を読み上げています。")
  }

  return (
    <section className="feature-screen diary-screen" aria-labelledby="diary-title">
      <div className="screen-hero diary-hero">
        <div className="diary-hero-art" aria-hidden="true">
          <Image src={skin.assets.activityDiary} alt="" fill sizes="150px" />
        </div>
        <div>
          <p className="screen-kicker">MIYUKI&apos;S PICTURE DIARY</p>
          <h2 id="diary-title">美雪の絵日記</h2>
          <p>カレンダーで日付を選ぶと、美雪と三匹の猫の日々を短い記録で読めます。</p>
        </div>
      </div>

      <div className="diary-cast-strip" aria-label="絵日記の登場人物">
        <span><b>美雪</b><small>記録・検証・ツッコミ担当</small></span>
        <span><b>いつもの3匹</b><small>トラちゃん・キキ・フワ</small></span>
      </div>

      <section className="diary-calendar" aria-labelledby="calendar-heading">
        <div className="diary-calendar-heading">
          <div>
            <span className="calendar-kicker"><CalendarDays aria-hidden="true" /> 日記カレンダー</span>
            <h3 id="calendar-heading">{formatMonth(displayedMonth)}</h3>
          </div>
          <div className="calendar-month-controls">
            <button
              type="button"
              onClick={() => showMonthAt(monthIndex + 1)}
              disabled={monthIndex >= availableMonths.length - 1}
              aria-label="前の日記月を見る"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => showMonthAt(monthIndex - 1)}
              disabled={monthIndex <= 0}
              aria-label="次の日記月を見る"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <table className="diary-calendar-table">
          <caption className="sr-only">{formatMonth(displayedMonth)}の日記がある日を選ぶカレンダー</caption>
          <thead>
            <tr>
              {WEEKDAYS.map((weekday, index) => (
                <th key={weekday} scope="col" className={index === 0 ? "is-sunday" : index === 6 ? "is-saturday" : undefined}>
                  {weekday}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarWeeks.map((week, weekIndex) => (
              <tr key={`${displayedMonth}-${weekIndex}`}>
                {week.map((day, weekdayIndex) => {
                  if (day === null) return <td key={`empty-${weekdayIndex}`} aria-hidden="true" />

                  const dateKey = dateKeyFor(displayedMonth, day)
                  const entry = entriesByDate.get(dateKey)
                  const isSelected = selectedDate === dateKey
                  const isToday = todayKey === dateKey
                  const weekdayClass = weekdayIndex === 0 ? "is-sunday" : weekdayIndex === 6 ? "is-saturday" : ""

                  return (
                    <td key={dateKey} className={weekdayClass}>
                      <button
                        type="button"
                        className={["calendar-day", entry ? "has-entry" : "", isSelected ? "is-selected" : "", isToday ? "is-today" : ""].filter(Boolean).join(" ")}
                        onClick={() => entry && selectEntry(entry)}
                        disabled={!entry}
                        aria-pressed={entry ? isSelected : undefined}
                        aria-current={isToday ? "date" : undefined}
                        aria-label={entry ? `${formatFullDate(dateKey)}、${entry.title}を読む` : `${day}日、日記はありません`}
                      >
                        <span className="calendar-day-number">{day}</span>
                        {entry && <PawPrint className="calendar-paw" aria-hidden="true" />}
                        {isToday && <span className="calendar-today-label">今日</span>}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="calendar-legend">
          <span><PawPrint aria-hidden="true" /> 肉球の日に日記があるよ</span>
          <span>{monthEntries.length}日分</span>
        </div>
      </section>

      {!overridesReady ? (
        <article className="diary-entry-card" role="status" aria-labelledby="diary-loading-title">
          <div className="diary-entry-copy">
            <h3 id="diary-loading-title">日記を準備しています</h3>
            <p className="diary-entry-body">この端末の表示設定を確認しています。</p>
          </div>
        </article>
      ) : selectedEntry ? (
        <article ref={detailRef} className="diary-entry-card" tabIndex={-1} aria-labelledby="diary-entry-title">
        <div className="diary-entry-topline">
          <time dateTime={selectedEntry.date}>{formatFullDate(selectedEntry.date)}</time>
          <span><Sparkles aria-hidden="true" /> 美雪・なおくん・猫の観察日記</span>
        </div>

        <div className="diary-entry-layout">
          <div className="diary-entry-image">
            <Image
              src={illustration}
              alt={illustrationAlt}
              fill
              sizes="(max-width: 719px) 92vw, 420px"
              priority={selectedEntry.date === DIARY_ENTRIES[0].date}
            />
            {selectedEntry.collectionId?.startsWith("naokun-poop-") && (
              <span className="diary-poop-sticker"><i aria-hidden="true"><Image src={assetPath("/content/collections/naokun/poop-classic.webp")} alt="" width={38} height={38} /></i><b>なおくん</b><small>うんち変身中！</small></span>
            )}
          </div>

          <div className="diary-entry-copy">
            <p className="diary-entry-label">今日の猫：{selectedCatNames}</p>
            <h3 id="diary-entry-title">{selectedEntry.title}</h3>
            <p className="diary-entry-body">{selectedEntry.body}</p>
            {state.settings.readAloud ? (
              <button type="button" className="secondary-action diary-read-aloud" onClick={toggleReadAloud} aria-pressed={isSpeaking}>
                {isSpeaking ? <Square aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
                {isSpeaking ? "読み上げを止める" : "この日記を読み上げる"}
              </button>
            ) : null}
            <span className="sr-only" aria-live="polite">{speechMessage}</span>
          </div>
        </div>

        <div className="diary-entry-navigation" aria-label="前後の日記">
          <button type="button" disabled={!previousEntry} onClick={() => previousEntry && selectEntry(previousEntry, false)}>
            <ChevronLeft aria-hidden="true" />
            <span><small>前の日記</small>{previousEntry ? `${previousEntry.date.slice(-2).replace(/^0/, "")}日` : "ありません"}</span>
          </button>
          <span className="diary-entry-position">{selectedEntryIndex + 1} / {monthEntries.length}</span>
          <button type="button" disabled={!nextEntry} onClick={() => nextEntry && selectEntry(nextEntry, false)}>
            <span><small>次の日記</small>{nextEntry ? `${nextEntry.date.slice(-2).replace(/^0/, "")}日` : "ありません"}</span>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
        </article>
      ) : (
        <article className="diary-entry-card" role="status" aria-labelledby="diary-empty-title">
          <div className="diary-entry-copy">
            <p className="diary-entry-label">日記カレンダー</p>
            <h3 id="diary-empty-title">表示できる日記はありません</h3>
            <p className="diary-entry-body">おうちの人の設定で、すべての日記が非表示になっています。</p>
          </div>
        </article>
      )}
    </section>
  )
}
