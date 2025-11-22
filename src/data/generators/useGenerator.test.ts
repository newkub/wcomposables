import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  useGenerator, 
  useCounterGenerator, 
  useIdGenerator, 
  useArrayGenerator,
  useColorGenerator,
  useWordGenerator
} from './useGenerator'

describe('useGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate sequential values', () => {
    const { current, next, history } = useGenerator({
      initial: 1,
      getNext: (current) => current + 1
    })

    expect(current.value).toBe(1)
    expect(history.value).toEqual([1])

    const nextValue = next()
    expect(nextValue).toBe(2)
    expect(current.value).toBe(2)
    expect(history.value).toEqual([1, 2])

    next()
    expect(current.value).toBe(3)
    expect(history.value).toEqual([1, 2, 3])
  })

  it('should reset to initial value', () => {
    const { current, next, reset, history: historyRef } = useGenerator({
      initial: 1,
      getNext: (current) => current + 1
    })

    next()
    next()
    expect(current.value).toBe(3)

    reset()
    expect(current.value).toBe(1)
    expect(historyRef.value).toEqual([1])
  })

  it('should reset to custom value', () => {
    const { current, next, reset, history: historyRef } = useGenerator({
      initial: 1,
      getNext: (current) => current + 1
    })

    next()
    reset(10)
    expect(current.value).toBe(10)
    expect(historyRef.value).toEqual([10])
  })

  it('should clear history', () => {
    const { current, next, clear, history: historyRef } = useGenerator({
      initial: 1,
      getNext: (current) => current + 1
    })

    next()
    next()
    expect(historyRef.value).toHaveLength(3)

    clear()
    expect(historyRef.value).toHaveLength(0)
    expect(current.value).toBe(3) // Current value remains unchanged
  })
})

describe('useCounterGenerator', () => {
  it('should generate sequential numbers', () => {
    const { current, next } = useCounterGenerator(0, 2)

    expect(current.value).toBe(0)
    next()
    expect(current.value).toBe(2)
    next()
    expect(current.value).toBe(4)
  })

  it('should use default start and step', () => {
    const { current, next } = useCounterGenerator()

    expect(current.value).toBe(0)
    next()
    expect(current.value).toBe(1)
  })
})

describe('useIdGenerator', () => {
  it('should generate sequential IDs', () => {
    const { current, next } = useIdGenerator('item', 1)

    expect(current.value).toBe('item1')
    next()
    expect(current.value).toBe('item2')
    next()
    expect(current.value).toBe('item3')
  })

  it('should use default prefix', () => {
    const { current, next } = useIdGenerator()

    expect(current.value).toBe('id1')
    next()
    expect(current.value).toBe('id2')
  })
})

describe('useArrayGenerator', () => {
  it('should cycle through array items', () => {
    const items = ['a', 'b', 'c']
    const { current, next } = useArrayGenerator(items)

    expect(current.value).toBe('a')
    next()
    expect(current.value).toBe('b')
    next()
    expect(current.value).toBe('c')
    next()
    expect(current.value).toBe('a') // Should loop back
  })

  it('should not loop when disabled', () => {
    const items = ['a', 'b', 'c']
    const { current, next } = useArrayGenerator(items, false)

    expect(current.value).toBe('a')
    next()
    expect(current.value).toBe('b')
    next()
    expect(current.value).toBe('c')
    next()
    expect(current.value).toBe('c') // Should stay at last item
  })

  it('should handle empty array', () => {
    const { current } = useArrayGenerator([])

    expect(current.value).toBeUndefined()
  })
})

describe('useColorGenerator', () => {
  it('should generate colors from predefined list', () => {
    const { current, next } = useColorGenerator()

    expect(typeof current.value).toBe('string')
    expect(current.value).toMatch(/^#[0-9A-F]{6}$/i)

    const firstColor = current.value
    next()
    expect(current.value).not.toBe(firstColor)
  })
})

describe('useWordGenerator', () => {
  it('should generate words from default list', () => {
    const { current } = useWordGenerator()

    expect(typeof current.value).toBe('string')
    expect(['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon']).toContain(current.value)
  })

  it('should use custom word list', () => {
    const customWords = ['hello', 'world', 'test']
    const { current } = useWordGenerator(customWords)

    expect(['hello', 'world', 'test']).toContain(current.value)
  })
})
