"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, PawPrint, Sparkles } from "lucide-react"
import { AVAILABLE_DIARY_MONTHS, DIARY_ENTRIES, type DiaryEntry } from "@/lib/diary"
import { useSkin } from "@/components/skin-provider"

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"]

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

function getLocalTodayKey() {
  const today = new Date()
  return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-")
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

export function PictureDiary() {
  const { skin } = useSkin()
  const [displayedMonth, setDisplayedMonth] = useState(AVAILABLE_DIARY_MONTHS[0])
  const [selectedDate, setSelectedDate] = useState(DIARY_ENTRIES[0].date)
  const [todayKey, setTodayKey] = useState("")
  const detailRef = useRef<HTMLElement>(null)

  useEffect(() => setTodayKey(getLocalTodayKey()), [])

  const entriesByDate = useMemo(
    () => new Map(DIARY_ENTRIES.map((entry) => [entry.date, entry])),
    [],
  )
  const monthEntries = useMemo(
    () => DIARY_ENTRIES.filter((entry) => entry.date.startsWith(displayedMonth)).sort((a, b) => a.date.localeCompare(b.date)),
    [displayedMonth],
  )
  const calendarWeeks = useMemo(() => createCalendarWeeks(displayedMonth), [displayedMonth])
  const selectedEntry = entriesByDate.get(selectedDate) ?? monthEntries.at(-1) ?? DIARY_ENTRIES[0]
  const selectedEntryIndex = monthEntries.findIndex((entry) => entry.date === selectedEntry.date)
  const monthIndex = AVAILABLE_DIARY_MONTHS.indexOf(displayedMonth)
  const previousEntry = selectedEntryIndex > 0 ? monthEntries[selectedEntryIndex - 1] : null
  const nextEntry = selectedEntryIndex >= 0 && selectedEntryIndex < monthEntries.length - 1 ? monthEntries[selectedEntryIndex + 1] : null

  const selectEntry = (entry: DiaryEntry, moveToDetail = true) => {
    setSelectedDate(entry.date)
    if (moveToDetail) {
      window.requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        detailRef.current?.focus({ preventScroll: true })
      })
    }
  }

  const showMonthAt = (nextMonthIndex: number) => {
    const nextMonth = AVAILABLE_DIARY_MONTHS[nextMonthIndex]
    if (!nextMonth) return
    const entries = DIARY_ENTRIES.filter((entry) => entry.date.startsWith(nextMonth)).sort((a, b) => a.date.localeCompare(b.date))
    setDisplayedMonth(nextMonth)
    if (entries.length > 0) setSelectedDate(entries.at(-1)!.date)
  }

  const illustration = skin.assets.diaryIllustrations[selectedEntry.illustration] ?? skin.assets.activityDiary

  return (
    <section className="feature-screen diary-screen" aria-labelledby="diary-title">
      <div className="screen-hero diary-hero">
        <div className="diary-hero-art" aria-hidden="true">
          <Image src={skin.assets.activityDiary} alt="" fill sizes="150px" />
        </div>
        <div>
          <p className="screen-kicker">MIYUKI&apos;S PICTURE DIARY</p>
          <h2 id="diary-title">美雪の絵日記</h2>
          <p>カレンダーの肉球から、読みたい日を選んでね。</p>
        </div>
      </div>

      <div className="diary-cast-strip" aria-label="絵日記の登場人物">
        <span><b>美雪</b><small>ツッコミ役</small></span>
        <span className="is-naokun"><i aria-hidden="true">💩</i><b>なおくん</b><small>美雪の兄・うんち役が大好き</small></span>
        <span><b>猫たち</b><small>自由な主役</small></span>
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
              disabled={monthIndex >= AVAILABLE_DIARY_MONTHS.length - 1}
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
                        {isToday && <span className="calendar-today-label">きょう</span>}
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

      <article ref={detailRef} className="diary-entry-card" tabIndex={-1} aria-labelledby="diary-entry-title">
        <div className="diary-entry-topline">
          <time dateTime={selectedEntry.date}>{formatFullDate(selectedEntry.date)}</time>
          <span><Sparkles aria-hidden="true" /> 美雪・なおくん・猫の観察日記</span>
        </div>

        <div className="diary-entry-layout">
          <div className="diary-entry-image">
            <Image
              src={illustration}
              alt={selectedEntry.alt}
              fill
              sizes="(max-width: 719px) 92vw, 420px"
              priority={selectedEntry.date === DIARY_ENTRIES[0].date}
            />
            {selectedEntry.date.startsWith("2026-") && (
              <span className="diary-poop-sticker"><i aria-hidden="true">💩</i><b>なおくん</b><small>うんち変身中！</small></span>
            )}
          </div>

          <div className="diary-entry-copy" aria-live="polite">
            <p className="diary-entry-label">きょうの兄・なおくんと猫たち</p>
            <h3 id="diary-entry-title">{selectedEntry.title}</h3>
            <p className="diary-entry-body">{selectedEntry.body}</p>
            <div className="miyuki-note">
              <PawPrint aria-hidden="true" />
              <div>
                <strong>美雪のひとこと</strong>
                <p>{selectedEntry.miyukiNote}</p>
              </div>
            </div>
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
    </section>
  )
}
