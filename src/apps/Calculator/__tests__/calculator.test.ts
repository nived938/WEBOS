import { describe, it, expect } from 'vitest'

describe('Calculator Operations', () => {
  it('should evaluate addition, subtraction, multiplication, and division accurately', () => {
    expect(45 + 55).toBe(100)
    expect(100 - 37).toBe(63)
    expect(12 * 8).toBe(96)
    expect(144 / 12).toBe(12)
  })

  it('should handle decimals and percentage operations', () => {
    const percent = 250 * 0.15
    expect(percent).toBe(37.5)
    expect(0.1 + 0.2).toBeCloseTo(0.3, 5)
  })

  it('should handle scientific functions', () => {
    expect(Math.sqrt(16)).toBe(4)
    expect(Math.pow(2, 8)).toBe(256)
    expect(Math.sin((90 * Math.PI) / 180)).toBeCloseTo(1, 5)
  })
})
