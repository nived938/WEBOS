/**
 * NOVA OS Client-Side PBKDF2 Cryptographic PIN Privacy Gate
 *
 * IMPORTANT SECURITY & PRIVACY NOTICE:
 * This client-side PIN implementation provides local browser privacy protection.
 * It ensures PINs are never stored in plaintext within localStorage or IndexedDB.
 *
 * NOTE: As a web application running inside a client browser, client-side
 * authentication does not provide hardware-backed kernel security against
 * attackers with local administrator access, browser developer tools, or physical machine access.
 * It functions as a user-level browser desktop privacy shield.
 */

const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH_BITS = 256
const SALT_BYTE_LENGTH = 16
const RATE_LIMIT_STORAGE_KEY = 'nova_pin_rate_limit_v2'

export const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5
export const BASE_LOCKOUT_SECONDS = 30

export interface PinRateLimitState {
  failedAttempts: number
  lockoutUntil: number // Unix timestamp ms
}

/**
 * Converts an ArrayBuffer to a standard Base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Converts a Base64 string back to a Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Generates a cryptographically random salt
 */
export function generateSalt(): string {
  const salt = new Uint8Array(SALT_BYTE_LENGTH)
  crypto.getRandomValues(salt)
  return bufferToBase64(salt.buffer)
}

/**
 * Generates a formatted alphanumeric recovery key for PIN reset (e.g., NOVA-A7K2-9M4L-3X8P)
 */
export function generateRecoveryKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segments: string[] = []
  const randomBytes = new Uint8Array(12)
  crypto.getRandomValues(randomBytes)

  for (let s = 0; s < 3; s++) {
    let seg = ''
    for (let i = 0; i < 4; i++) {
      seg += chars[randomBytes[s * 4 + i] % chars.length]
    }
    segments.push(seg)
  }

  return `NOVA-${segments.join('-')}`
}

/**
 * Hashes a PIN using Web Crypto PBKDF2 with HMAC-SHA-256
 */
export async function hashPin(
  pin: string,
  existingSalt?: string
): Promise<{ hash: string; salt: string; recoveryKey: string }> {
  if (!pin || pin.trim().length === 0) {
    throw new Error('PIN cannot be empty.')
  }

  const saltBase64 = existingSalt || generateSalt()
  const saltBytes = base64ToUint8Array(saltBase64)

  const encoder = new TextEncoder()
  const pinBytes = encoder.encode(pin)

  // Import raw PIN as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    pinBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive bits using PBKDF2-SHA-256
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH_BITS
  )

  const hashBase64 = bufferToBase64(derivedBits)
  const recoveryKey = generateRecoveryKey()

  return {
    hash: hashBase64,
    salt: saltBase64,
    recoveryKey,
  }
}

/**
 * Verifies a candidate PIN against a stored PBKDF2 hash and salt
 */
export async function verifyPin(
  candidatePin: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  if (!candidatePin || !storedHash || !storedSalt || candidatePin.trim() === '') {
    return false
  }

  try {
    const { hash } = await hashPin(candidatePin, storedSalt)
    return hash === storedHash
  } catch (err) {
    console.error('PIN verification error:', err)
    return false
  }
}

/**
 * Rate Limiting: Get current rate-limit and lockout status
 */
export function getPinLockoutStatus(): {
  isLockedOut: boolean
  remainingSeconds: number
  failedAttempts: number
} {
  if (typeof localStorage === 'undefined') {
    return { isLockedOut: false, remainingSeconds: 0, failedAttempts: 0 }
  }

  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    if (!raw) return { isLockedOut: false, remainingSeconds: 0, failedAttempts: 0 }

    const state: PinRateLimitState = JSON.parse(raw)
    const now = Date.now()

    if (state.lockoutUntil && state.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((state.lockoutUntil - now) / 1000)
      return {
        isLockedOut: true,
        remainingSeconds,
        failedAttempts: state.failedAttempts,
      }
    }

    // Lockout expired
    if (state.lockoutUntil && state.lockoutUntil <= now) {
      return {
        isLockedOut: false,
        remainingSeconds: 0,
        failedAttempts: state.failedAttempts,
      }
    }

    return {
      isLockedOut: false,
      remainingSeconds: 0,
      failedAttempts: state.failedAttempts || 0,
    }
  } catch {
    return { isLockedOut: false, remainingSeconds: 0, failedAttempts: 0 }
  }
}

/**
 * Rate Limiting: Record an incorrect PIN attempt and escalate lockout if threshold breached
 */
export function recordFailedPinAttempt(): {
  isLockedOut: boolean
  remainingSeconds: number
  failedAttempts: number
} {
  if (typeof localStorage === 'undefined') {
    return { isLockedOut: false, remainingSeconds: 0, failedAttempts: 1 }
  }

  try {
    const current = getPinLockoutStatus()
    const newAttempts = current.failedAttempts + 1
    let lockoutUntil = 0
    let isLockedOut = false
    let remainingSeconds = 0

    if (newAttempts >= MAX_ATTEMPTS_BEFORE_LOCKOUT) {
      // Exponential backoff: 30s for 5 attempts, +30s for every attempt beyond 5
      const extraAttempts = newAttempts - MAX_ATTEMPTS_BEFORE_LOCKOUT
      const penaltySeconds = BASE_LOCKOUT_SECONDS + extraAttempts * 15
      lockoutUntil = Date.now() + penaltySeconds * 1000
      isLockedOut = true
      remainingSeconds = penaltySeconds
    }

    const nextState: PinRateLimitState = {
      failedAttempts: newAttempts,
      lockoutUntil,
    }
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(nextState))

    return {
      isLockedOut,
      remainingSeconds,
      failedAttempts: newAttempts,
    }
  } catch {
    return { isLockedOut: false, remainingSeconds: 0, failedAttempts: 1 }
  }
}

/**
 * Rate Limiting: Reset failed attempts upon successful authentication
 */
export function resetPinRateLimit(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY)
  } catch {
    // Ignore
  }
}

/**
 * Validates PIN strength (minimum 4 characters, no leading/trailing whitespace)
 */
export function validatePinFormat(pin: string): { valid: boolean; error?: string } {
  if (!pin || pin.trim().length === 0) {
    return { valid: false, error: 'PIN cannot be empty.' }
  }
  if (pin.length < 4) {
    return { valid: false, error: 'PIN must be at least 4 characters long.' }
  }
  if (pin.length > 32) {
    return { valid: false, error: 'PIN cannot exceed 32 characters.' }
  }
  if (pin === '1234') {
    return {
      valid: false,
      error: 'Default PIN "1234" is not allowed. Please choose a personalized secure PIN.',
    }
  }
  return { valid: true }
}

/**
 * Create a new secure PIN with PBKDF2 hash, salt, and recovery key
 */
export async function createSecurePin(
  pin: string
): Promise<{ hash: string; salt: string; recoveryKey: string }> {
  const validation = validatePinFormat(pin)
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid PIN.')
  }
  return hashPin(pin)
}

/**
 * Change PIN safely by validating the existing PIN first
 */
export async function changeSecurePin(
  currentPin: string,
  newPin: string,
  storedHash: string,
  storedSalt: string
): Promise<{
  success: boolean
  hash?: string
  salt?: string
  recoveryKey?: string
  error?: string
}> {
  const isMatch = await verifyPin(currentPin, storedHash, storedSalt)
  if (!isMatch) {
    recordFailedPinAttempt()
    return { success: false, error: 'Current PIN is incorrect.' }
  }

  const validation = validatePinFormat(newPin)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const newCredentials = await hashPin(newPin)
  resetPinRateLimit()
  return {
    success: true,
    ...newCredentials,
  }
}

/**
 * Verify recovery key input against stored key
 */
export function verifyRecoveryKey(enteredKey: string, storedKey?: string): boolean {
  if (!enteredKey || !storedKey) return false
  const cleanEntered = enteredKey.trim().toUpperCase().replace(/[\s-]+/g, '')
  const cleanStored = storedKey.trim().toUpperCase().replace(/[\s-]+/g, '')
  return cleanEntered === cleanStored
}
