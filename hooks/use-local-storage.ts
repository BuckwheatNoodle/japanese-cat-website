"use client"

import { useCallback, useState, useEffect, useRef, type SetStateAction } from "react"

const MAX_LEGACY_STORAGE_CHARACTERS = 100_000

function isCompatibleValue(value: unknown, template: unknown): boolean {
  if (template === null) return value === null
  if (Array.isArray(template)) return Array.isArray(value)
  if (typeof template === "number") return typeof value === "number" && Number.isFinite(value)
  if (typeof template !== "object") return typeof value === typeof template
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false

  return Object.entries(template as Record<string, unknown>).every(([property, propertyTemplate]) => (
    Object.prototype.hasOwnProperty.call(value, property)
      && isCompatibleValue((value as Record<string, unknown>)[property], propertyTemplate)
  ))
}

export function isFiniteNumberRecord(value: unknown): value is Record<string, number> {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && Object.values(value).every((entry) => typeof entry === "number" && Number.isFinite(entry) && entry >= 0)
}

function readStoredValue<T>(key: string, initialValue: T, validateValue?: (value: unknown) => value is T): T {
  try {
    const item = window.localStorage.getItem(key)
    if (!item || item.length > MAX_LEGACY_STORAGE_CHARACTERS) return initialValue
    const parsed = JSON.parse(item) as unknown
    return (validateValue ? validateValue(parsed) : isCompatibleValue(parsed, initialValue)) ? parsed as T : initialValue
  } catch {
    return initialValue
  }
}

export type LocalStorageSetter<T> = (value: SetStateAction<T>) => boolean

export function useLocalStorage<T>(key: string, initialValue: T, validateValue?: (value: unknown) => value is T): [T, LocalStorageSetter<T>] {
  const initialValueRef = useRef(initialValue)
  const [storedValue, setStoredValue] = useState<T>(initialValueRef.current)
  const storedValueRef = useRef(storedValue)

  const setValue = useCallback<LocalStorageSetter<T>>((value) => {
    const valueToStore = value instanceof Function ? value(storedValueRef.current) : value
    if (typeof window === "undefined") return false

    try {
      const serialized = JSON.stringify(valueToStore)
      if (serialized === undefined) return false
      window.localStorage.setItem(key, serialized)
    } catch {
      return false
    }

    storedValueRef.current = valueToStore
    setStoredValue(valueToStore)
    return true
  }, [key])

  useEffect(() => {
    const nextValue = readStoredValue(key, initialValueRef.current, validateValue)
    storedValueRef.current = nextValue
    setStoredValue(nextValue)

    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== null && event.key !== key) return
      const updatedValue = readStoredValue(key, initialValueRef.current, validateValue)
      storedValueRef.current = updatedValue
      setStoredValue(updatedValue)
    }
    window.addEventListener("storage", syncFromAnotherTab)
    return () => window.removeEventListener("storage", syncFromAnotherTab)
  }, [key, validateValue])

  return [storedValue, setValue]
}
