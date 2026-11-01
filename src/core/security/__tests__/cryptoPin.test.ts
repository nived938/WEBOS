import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin, generateRecoveryKey, generateSalt } from '../cryptoPin'

describe('cryptoPin - PBKDF2 PIN Cryptographic Security', () => {
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
    expect(await verifyPin('1234', '', 'salt')).toBe(false)
    expect(await verifyPin('1234', 'hash', '')).toBe(false)
  })
})
