"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  canClaimDailyMission,
  canEquipRoomItem,
  canPurchaseRoomItem,
  createEventId,
  createInitialAppState,
  domainEventsHaveSameMeaning,
  getDailyMissionStatuses,
  getLocalDateKey,
  getProgressionWriteBlockReason,
  includesProgressionLedger,
  importProgressionBackup,
  hydrateProgressionState,
  hasProcessedEvent,
  isProgressionLedgerAtCapacity,
  loadProgressionState,
  PROGRESSION_STORAGE_KEY,
  reduceProgression,
  saveProgressionState,
  serializeProgressionBackup,
  type AccessibilitySettings,
  type ActionCheck,
  type AppStateV1,
  type BackupImportResult,
  type DailyMissionId,
  type DailyMissionStatus,
  type DomainEvent,
  type RoomSlotId,
} from "@/lib/progression"

type ProgressionContextValue = {
  state: AppStateV1
  ready: boolean
  dailyMissions: DailyMissionStatus[]
  storageWarnings: string[]
  recordEvent: (event: DomainEvent) => boolean
  purchase: (itemId: string) => ActionCheck
  equip: (itemId: string) => ActionCheck
  unequip: (slot: RoomSlotId) => void
  claim: (missionId: DailyMissionId) => ActionCheck
  updateSettings: (patch: Partial<AccessibilitySettings>) => ActionCheck
  exportBackup: () => string
  importBackup: (input: string) => BackupImportResult
}

const ProgressionContext = createContext<ProgressionContextValue | null>(null)
const PROGRESSION_LOCK_NAME = "miyuki-cat-progress-write-v1"
const PROGRESSION_CHANNEL_NAME = "miyuki-cat-progress-events-v3"
const EVENT_JOURNAL_LIMIT = 512
const STORAGE_UNAVAILABLE_WARNING = "端末の保存領域を利用できないため、この画面を開いている間だけ記録します。"
const LEDGER_CAPACITY_WARNING = "安全に保存できる履歴上限に達したため、新しい操作を停止しました。バックアップを保存して保護者に相談してください。"
const READ_ONLY_IMPORT_ERROR = "この記録は保護モードのため、バックアップで上書きできません。ページを再読み込みしてからもう一度確認してください。"

function eventTimestamp() {
  return new Date().toISOString()
}

function mergeWarnings(current: string[], additions: readonly string[]) {
  return [...new Set([...current, ...additions])]
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function isShortString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 160
}

function isDateKeyValue(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isBroadcastDomainEvent(value: unknown): value is DomainEvent {
  const event = asRecord(value)
  if (!event || !isShortString(event.eventId) || typeof event.occurredAt !== "string" || event.occurredAt.trim() === "" || event.occurredAt.length > 80) return false
  switch (event.type) {
    case "game.completed":
      return isShortString(event.gameId) && typeof event.score === "number" && Number.isFinite(event.score)
        && (event.won === undefined || typeof event.won === "boolean")
    case "coloring.completed":
      return isShortString(event.pageId)
    case "fortune.drawn":
      return isShortString(event.fortuneId)
    case "diary.read":
      return isDateKeyValue(event.diaryDate)
        && (event.catIds === undefined || (Array.isArray(event.catIds) && event.catIds.length <= 50 && event.catIds.every(isShortString)))
        && (event.naokunFormId === undefined || isShortString(event.naokunFormId))
    case "collection.unlocked":
      return (event.collectionKind === "cat" || event.collectionKind === "naokun-form")
        && isShortString(event.collectionId)
        && (event.sourceId === undefined || isShortString(event.sourceId))
    case "mission.claimed":
      return ["play-game", "read-diary", "draw-fortune", "finish-coloring"].includes(String(event.missionId))
        && isDateKeyValue(event.missionDate)
    case "room.itemPurchased":
    case "room.itemEquipped":
      return isShortString(event.itemId)
    case "room.itemRemoved":
      return ["wall", "window", "shelf", "table", "floorLeft", "floorCenter", "floorRight"].includes(String(event.slot))
    case "diary.favoriteToggled":
      return isDateKeyValue(event.diaryDate)
    case "room.menuSaved": {
      const menu = asRecord(event.menu)
      return Boolean(menu && isShortString(menu.id)
        && ["soda", "milk", "berry"].includes(String(menu.base))
        && ["vanilla", "strawberry", "mint"].includes(String(menu.scoop))
        && ["cherry", "cookie", "star"].includes(String(menu.topping))
        && ["ribbon", "paw", "flower"].includes(String(menu.garnish)))
    }
    case "request.claimed":
      return isShortString(event.requestId) && isDateKeyValue(event.requestDate)
    case "story.nodeCompleted":
      return isShortString(event.nodeId) && (event.choiceId === undefined || isShortString(event.choiceId))
    case "settings.updated":
      return asRecord(event.patch) !== null && Object.keys(event.patch as Record<string, unknown>).length <= 20
    case "day.changed":
      return isDateKeyValue(event.date)
    default:
      return false
  }
}

function runWithProgressionLock(work: () => void) {
  const lockManager = (navigator as Navigator & { locks?: LockManager }).locks
  if (!lockManager) {
    work()
    return
  }
  let started = false
  const runOnce = () => {
    if (started) return
    started = true
    work()
  }
  try {
    void lockManager.request(PROGRESSION_LOCK_NAME, { mode: "exclusive" }, runOnce).catch(() => runOnce())
  } catch {
    runOnce()
  }
}

export function ProgressionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppStateV1>(() => createInitialAppState())
  const [ready, setReady] = useState(false)
  const [storageWarnings, setStorageWarnings] = useState<string[]>([])
  const stateRef = useRef(state)
  const persistenceBlockedRef = useRef(false)
  const readOnlyRef = useRef(false)
  const hasUnsavedChangesRef = useRef(false)
  const eventJournalRef = useRef(new Map<string, DomainEvent>())
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    let cancelled = false
    runWithProgressionLock(() => {
      const storage = safeStorage()
      if (!storage) {
        const temporaryState = createInitialAppState(getLocalDateKey())
        persistenceBlockedRef.current = true
        readOnlyRef.current = false
        hasUnsavedChangesRef.current = true
        if (cancelled) return
        stateRef.current = temporaryState
        setState(temporaryState)
        setStorageWarnings([STORAGE_UNAVAILABLE_WARNING])
        setReady(true)
        return
      }

      const hydrated = loadProgressionState(storage, getLocalDateKey())
      const warnings = [...hydrated.warnings]
      persistenceBlockedRef.current = hydrated.persistence === "read-only"
      readOnlyRef.current = hydrated.persistence === "read-only"

      if (hydrated.persistence === "write") {
        const saved = saveProgressionState(storage, hydrated.state)
        if (!saved.ok) warnings.push(saved.error)
        hasUnsavedChangesRef.current = !saved.ok
      }

      if (cancelled) return
      stateRef.current = hydrated.state
      setState(hydrated.state)
      setStorageWarnings([...new Set(warnings)])
      setReady(true)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== PROGRESSION_STORAGE_KEY || !event.newValue) return
      const incoming = hydrateProgressionState(event.newValue, getLocalDateKey())
      if (incoming.persistence === "read-only") {
        persistenceBlockedRef.current = true
        readOnlyRef.current = true
        setStorageWarnings((warnings) => mergeWarnings(warnings, incoming.warnings))
        return
      }

      const incomingSavedAt = new Date(incoming.state.savedAt).getTime()
      const currentSavedAt = new Date(stateRef.current.savedAt).getTime()
      const preservesCurrentEvents = includesProgressionLedger(incoming.state, stateRef.current)
      const timestampsComparable = !Number.isNaN(currentSavedAt) && !Number.isNaN(incomingSavedAt)
      if (timestampsComparable && incomingSavedAt < currentSavedAt) return
      if (hasUnsavedChangesRef.current && !preservesCurrentEvents) return
      if ((!timestampsComparable || incomingSavedAt === currentSavedAt) && !preservesCurrentEvents) return

      persistenceBlockedRef.current = false
      readOnlyRef.current = false
      hasUnsavedChangesRef.current = false
      stateRef.current = incoming.state
      setState(incoming.state)
      setStorageWarnings((warnings) => mergeWarnings(warnings, incoming.warnings))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const rememberEvent = useCallback((event: DomainEvent) => {
    const existing = eventJournalRef.current.get(event.eventId)
    if (existing) {
      if (!domainEventsHaveSameMeaning(existing, event)) {
        setStorageWarnings((warnings) => mergeWarnings(warnings, ["同じIDで内容の異なる同期イベントを検出し、後から届いた内容を無視しました。"]))
      }
      return false
    }

    if (eventJournalRef.current.size >= EVENT_JOURNAL_LIMIT) {
      const oldestEventId = eventJournalRef.current.keys().next().value as string | undefined
      if (oldestEventId) eventJournalRef.current.delete(oldestEventId)
    }
    eventJournalRef.current.set(event.eventId, event)
    return true
  }, [])

  const applyKnownEvents = useCallback(() => {
    runWithProgressionLock(() => {
      const storage = safeStorage()
      const latest = storage ? loadProgressionState(storage, getLocalDateKey()) : null
      if (latest) setStorageWarnings((warnings) => mergeWarnings(warnings, latest.warnings))
      if (latest?.persistence === "read-only") {
        persistenceBlockedRef.current = true
        readOnlyRef.current = true
        return
      }
      if (!storage && readOnlyRef.current) return
      if (storage) readOnlyRef.current = false

      const base = !storage || hasUnsavedChangesRef.current ? stateRef.current : latest?.state ?? stateRef.current
      const events = [...eventJournalRef.current.values()].sort((left, right) => (
        left.occurredAt.localeCompare(right.occurredAt) || left.eventId.localeCompare(right.eventId)
      ))
      const blockedEventIds: string[] = []
      let next = base
      for (const event of events) {
        if (hasProcessedEvent(next, event.eventId)) continue
        if (isProgressionLedgerAtCapacity(next)) {
          blockedEventIds.push(event.eventId)
          continue
        }
        const candidate = reduceProgression(next, event)
        if (candidate === next && isProgressionLedgerAtCapacity(next)) blockedEventIds.push(event.eventId)
        next = candidate
      }
      for (const eventId of blockedEventIds) eventJournalRef.current.delete(eventId)
      if (blockedEventIds.length > 0) {
        setStorageWarnings((warnings) => mergeWarnings(warnings, [LEDGER_CAPACITY_WARNING]))
      }

      if (!storage) {
        persistenceBlockedRef.current = true
        readOnlyRef.current = false
        hasUnsavedChangesRef.current = true
        stateRef.current = next
        setState(next)
        setStorageWarnings((warnings) => mergeWarnings(warnings, [STORAGE_UNAVAILABLE_WARNING]))
        return
      }

      const saved = saveProgressionState(storage, next)
      if (!saved.ok) {
        hasUnsavedChangesRef.current = true
        setStorageWarnings((warnings) => mergeWarnings(warnings, [saved.error]))
      } else {
        hasUnsavedChangesRef.current = false
        persistenceBlockedRef.current = false
        readOnlyRef.current = false
      }
      stateRef.current = next
      setState(next)
    })
  }, [])

  const recordEvent = useCallback((event: DomainEvent): boolean => {
    const blockReason = getProgressionWriteBlockReason(stateRef.current, event.eventId, readOnlyRef.current)
    if (blockReason === "read-only") return false
    if (blockReason === "storage-capacity") {
      setStorageWarnings((warnings) => mergeWarnings(warnings, [LEDGER_CAPACITY_WARNING]))
      return false
    }
    const isNewEvent = rememberEvent(event)
    applyKnownEvents()
    if (!isNewEvent || !broadcastChannelRef.current) return true
    try {
      broadcastChannelRef.current.postMessage({ type: "progression.event", event })
    } catch {
      setStorageWarnings((warnings) => mergeWarnings(warnings, ["ほかのタブへ記録を同期できませんでした。このタブの記録は端末に保存しています。"]))
    }
    return true
  }, [applyKnownEvents, rememberEvent])

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return
    let channel: BroadcastChannel
    try {
      channel = new BroadcastChannel(PROGRESSION_CHANNEL_NAME)
    } catch {
      setStorageWarnings((warnings) => mergeWarnings(warnings, ["このブラウザではタブ間の即時同期を利用できません。"]))
      return
    }

    broadcastChannelRef.current = channel
    const onMessage = (message: MessageEvent<unknown>) => {
      const envelope = asRecord(message.data)
      if (envelope?.type === "progression.reset") {
        eventJournalRef.current.clear()
        return
      }
      if (envelope?.type !== "progression.event" || !isBroadcastDomainEvent(envelope.event)) return
      if (!rememberEvent(envelope.event)) return
      applyKnownEvents()
    }
    channel.addEventListener("message", onMessage)
    return () => {
      channel.removeEventListener("message", onMessage)
      channel.close()
      if (broadcastChannelRef.current === channel) broadcastChannelRef.current = null
    }
  }, [applyKnownEvents, rememberEvent])

  useEffect(() => {
    const checkDate = () => {
      const today = getLocalDateKey()
      if (today <= stateRef.current.daily.date) return
      recordEvent({
        type: "day.changed",
        eventId: createEventId("day"),
        occurredAt: eventTimestamp(),
        date: today,
      })
    }

    const interval = window.setInterval(checkDate, 60_000)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkDate()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [recordEvent])

  const purchase = useCallback((itemId: string): ActionCheck => {
    const check = canPurchaseRoomItem(stateRef.current, itemId)
    if (!check.ok) return check
    const accepted = recordEvent({
      type: "room.itemPurchased",
      eventId: createEventId("purchase"),
      occurredAt: eventTimestamp(),
      itemId,
    })
    return accepted ? { ok: true } : { ok: false, reason: readOnlyRef.current ? "read-only" : "storage-capacity" }
  }, [recordEvent])

  const equip = useCallback((itemId: string): ActionCheck => {
    const check = canEquipRoomItem(stateRef.current, itemId)
    if (!check.ok) return check
    const accepted = recordEvent({
      type: "room.itemEquipped",
      eventId: createEventId("equip"),
      occurredAt: eventTimestamp(),
      itemId,
    })
    return accepted ? { ok: true } : { ok: false, reason: readOnlyRef.current ? "read-only" : "storage-capacity" }
  }, [recordEvent])

  const claim = useCallback((missionId: DailyMissionId): ActionCheck => {
    const dateKey = getLocalDateKey()
    const check = canClaimDailyMission(stateRef.current, missionId, dateKey)
    if (!check.ok) return check
    const accepted = recordEvent({
      type: "mission.claimed",
      eventId: createEventId("mission"),
      occurredAt: eventTimestamp(),
      missionId,
      missionDate: dateKey,
    })
    return accepted ? { ok: true } : { ok: false, reason: readOnlyRef.current ? "read-only" : "storage-capacity" }
  }, [recordEvent])

  const unequip = useCallback((slot: RoomSlotId) => {
    recordEvent({
      type: "room.itemRemoved",
      eventId: createEventId("unequip"),
      occurredAt: eventTimestamp(),
      slot,
    })
  }, [recordEvent])

  const updateSettings = useCallback((patch: Partial<AccessibilitySettings>): ActionCheck => {
    const accepted = recordEvent({
      type: "settings.updated",
      eventId: createEventId("settings"),
      occurredAt: eventTimestamp(),
      patch,
    })
    return accepted ? { ok: true } : { ok: false, reason: readOnlyRef.current ? "read-only" : "storage-capacity" }
  }, [recordEvent])

  const exportBackup = useCallback(() => serializeProgressionBackup(stateRef.current), [])

  const importBackup = useCallback((input: string): BackupImportResult => {
    if (readOnlyRef.current) return { ok: false, errors: [READ_ONLY_IMPORT_ERROR] }
    const result = importProgressionBackup(input, getLocalDateKey())
    if (!result.ok) return result
    const storage = safeStorage()
    if (!storage) return { ok: false, errors: ["端末の保存領域を利用できないため、バックアップを復元できません。"] }
    const saved = saveProgressionState(storage, result.state)
    if (!saved.ok) return { ok: false, errors: [saved.error] }
    eventJournalRef.current.clear()
    try {
      broadcastChannelRef.current?.postMessage({ type: "progression.reset" })
    } catch {
      // The imported state is already durable; the storage event remains the fallback.
    }
    persistenceBlockedRef.current = false
    readOnlyRef.current = false
    hasUnsavedChangesRef.current = false
    stateRef.current = result.state
    setState(result.state)
    setStorageWarnings(result.warnings)
    return result
  }, [])

  const dailyMissions = useMemo(() => getDailyMissionStatuses(state, state.daily.date), [state])

  const value = useMemo<ProgressionContextValue>(() => ({
    state,
    ready,
    dailyMissions,
    storageWarnings,
    recordEvent,
    purchase,
    equip,
    unequip,
    claim,
    updateSettings,
    exportBackup,
    importBackup,
  }), [claim, dailyMissions, equip, exportBackup, importBackup, purchase, ready, recordEvent, state, storageWarnings, unequip, updateSettings])

  return <ProgressionContext.Provider value={value}>{children}</ProgressionContext.Provider>
}

export function useProgression() {
  const context = useContext(ProgressionContext)
  if (!context) throw new Error("useProgression must be used inside ProgressionProvider")
  return context
}
