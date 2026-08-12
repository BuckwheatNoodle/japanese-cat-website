export const PARENT_PIN_KEY = "miyuki-parent-editor-pin-v1"

const PARENT_PIN_HASH_PREFIX = "miyuki-parent-editor:"

type ParentPinStorage = Pick<Storage, "getItem">
type ParentPinCrypto = Pick<Crypto, "subtle">

export type ParentPinVerification =
  | { ok: true }
  | { ok: false; reason: "invalid-format" | "not-configured" | "mismatch" | "unavailable" }

export function cleanParentPin(value: string) {
  return value.replace(/\D/g, "").slice(0, 4)
}

export function isValidParentPin(pin: string) {
  return /^\d{4}$/.test(pin)
}

export async function hashParentPin(pin: string, cryptoApi: ParentPinCrypto = globalThis.crypto) {
  const encoded = new TextEncoder().encode(`${PARENT_PIN_HASH_PREFIX}${pin}`)
  const digest = await cryptoApi.subtle.digest("SHA-256", encoded)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function hasConfiguredParentPin(storage: ParentPinStorage) {
  return Boolean(storage.getItem(PARENT_PIN_KEY))
}

export async function verifyParentPin(
  storage: ParentPinStorage,
  pin: string,
  cryptoApi: ParentPinCrypto = globalThis.crypto,
): Promise<ParentPinVerification> {
  if (!isValidParentPin(pin)) return { ok: false, reason: "invalid-format" }
  try {
    const savedHash = storage.getItem(PARENT_PIN_KEY)
    if (!savedHash) return { ok: false, reason: "not-configured" }
    const candidateHash = await hashParentPin(pin, cryptoApi)
    return savedHash === candidateHash
      ? { ok: true }
      : { ok: false, reason: "mismatch" }
  } catch {
    return { ok: false, reason: "unavailable" }
  }
}
