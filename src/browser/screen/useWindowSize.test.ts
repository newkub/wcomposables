import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWindowSize } from './useWindowSize'

describe('useWindowSize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
  })

  it('should initialize with default values', () => {
    const { width, height } = useWindowSize()

    expect(width.value).toBe(1024)
    expect(height.value).toBe(768)
  })

  it('should initialize with custom initial values', () => {
    const { width, height } = useWindowSize({ initialWidth: 800, initialHeight: 600 })

    expect(width.value).toBe(800)
    expect(height.value).toBe(600)
  })

  it('should update size on window resize', () => {
    const { width, height } = useWindowSize()

    window.innerWidth = 1920
    window.innerHeight = 1080
    window.dispatchEvent(new Event('resize'))

    expect(width.value).toBe(1920)
    expect(height.value).toBe(1080)
  })

  it('should handle multiple resize events', () => {
    const { width, height } = useWindowSize()

    window.innerWidth = 800
    window.innerHeight = 600
    window.dispatchEvent(new Event('resize'))

    expect(width.value).toBe(800)
    expect(height.value).toBe(600)

    window.innerWidth = 1200
    window.innerHeight = 900
    window.dispatchEvent(new Event('resize'))

    expect(width.value).toBe(1200)
    expect(height.value).toBe(900)
  })
})
