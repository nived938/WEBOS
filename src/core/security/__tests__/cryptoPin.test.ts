import { describe, it, expect, beforeEach } from 'vitest'
import {
  hashPin,
  verifyPin,
  generateRecoveryKey,
  generateSalt,
  getPinLockoutStatus,
  recordFailedPinAttempt,
  resetPinRateLimit,
  validatePinFormat,
  createSecurePin,
  verifyRecoveryKey,
  MAX_ATTEMPTS_BEFORE_LOCKOUT,
} from '../cryptoPin'

// Provide localStorage mock for node test environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {}
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val.toString()
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
    },
    writable: true,
  })
}

describe('cryptoPin - PBKDF2 PIN Cryptographic Security', () => {
  beforeEach(() => {
    resetPinRateLimit()
  })

  it('generates a valid Base64 salt and formatted recovery key', () => {
    const salt = generateSalt()
    expect(typeof salt).toBe('string')
    expect(salt.length).toBeGreaterThan(10)

    const recoveryKey = generateRecoveryKey()
    expect(recoveryKey).toMatch(/^NOVA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  })

  it('correctly hashes and verifies a valid PIN', async () => {
    const testPin = '5829'
    const { hash, salt, recoveryKey } = await hashPin(testPin)

    expect(hash).toBeTruthy()
    expect(salt).toBeTruthy()
    expect(recoveryKey).toBeTruthy()

    // Verification with correct PIN
    const isValid = await verifyPin(testPin, hash, salt)
    expect(isValid).toBe(true)

    // Verification with incorrect PIN
    const isInvalid = await verifyPin('0000', hash, salt)
    expect(isInvalid).toBe(false)
  })

  it('rejects empty or corrupt parameters gracefully', async () => {
    expect(await verifyPin('', 'hash', 'salt')).toBe(false)
    expect(await verifyPin('5829', '', 'salt')).toBe(false)
    expect(await verifyPin('5829', 'hash', '')).toBe(false)
  })

  it('validates PIN format rules strictly', () => {
    expect(validatePinFormat('').valid).toBe(false)
    expect(validatePinFormat('12').valid).toBe(false) // too short
    expect(validatePinFormat('1234').valid).toBe(false) // default 1234 prohibited
    expect(validatePinFormat('8492').valid).toBe(true)
    expect(validatePinFormat('super-secure-passphrase-99').valid).toBe(true)
  })

  it('enforces rate limiting and temporary lockout after repeated failed attempts', () => {
    resetPinRateLimit()
    let status = getPinLockoutStatus()
    expect(status.isLockedOut).toBe(false)
    expect(status.failedAttempts).toBe(0)

    // Record failed attempts up to threshold
    for (let i = 1; i < MAX_ATTEMPTS_BEFORE_LOCKOUT; i++) {
      const res = recordFailedPinAttempt()
      expect(res.isLockedOut).toBe(false)
      expect(res.failedAttempts).toBe(i)
    }

    // 5th attempt breaches threshold and activates lockout
    const breach = recordFailedPinAttempt()
    expect(breach.isLockedOut).toBe(true)
    expect(breach.remainingSeconds).toBeGreaterThan(0)

    // Subsequent check confirms lockout
    status = getPinLockoutStatus()
    expect(status.isLockedOut).toBe(true)

    // Resetting clears lockout state
    resetPinRateLimit()
    expect(getPinLockoutStatus().isLockedOut).toBe(false)
  })

  it('verifies recovery keys accurately and case-insensitively', () => {
    const key = 'NOVA-A7K2-9M4L-3X8P'
    expect(verifyRecoveryKey(key, key)).toBe(true)
    expect(verifyRecoveryKey('nova-a7k2-9m4l-3x8p', key)).toBe(true)
    expect(verifyRecoveryKey('NOVA A7K2 9M4L 3X8P', key)).toBe(true)
    expect(verifyRecoveryKey('WRONG-KEY', key)).toBe(false)
    expect(verifyRecoveryKey('', key)).toBe(false)
  })
})
