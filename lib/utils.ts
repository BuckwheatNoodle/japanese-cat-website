import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
const basePath = configuredBasePath === "/"
  ? ""
  : `${configuredBasePath.startsWith("/") ? "" : "/"}${configuredBasePath}`.replace(/\/$/, "")

export function assetPath(path: string): string {
  if (!basePath || !path.startsWith("/")) return path
  if (path === basePath || path.startsWith(`${basePath}/`)) return path
  return `${basePath}${path}`
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
