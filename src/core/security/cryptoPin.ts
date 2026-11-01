/**
 * NOVA OS Client-Side PBKDF2 Cryptographic PIN Privacy Gate
 *
 * IMPORTANT SECURITY NOTICE:
 * This client-side PIN implementation provides local browser privacy protection.
 * It ensures PINs are never stored in plaintext within localStorage or IndexedDB.
 * However, as a web application running inside a client browser, client-side
 * authentication does not provide kernel-level operating-system security against
 * users with physical access, developer tools, or direct browser storage inspection.
 */

const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH_BITS = 256
const SALT_BYTE_LENGTH = 16

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
 * Generates a random cryptographic salt
 */
export function generateSalt(): string {
  const salt = new Uint8Array(SALT_BYTE_LENGTH)
  crypto.getRandomValues(salt)
  return bufferToBase64(salt.buffer)
}

/**
 * Generates a formatted alphanumeric recovery key for PIN reset
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
  if (!candidatePin || !storedHash || !storedSalt) {
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
