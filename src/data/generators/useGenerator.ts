import { ref } from 'vue'

export interface UseGeneratorOptions<T> {
  initial?: T
  getNext: (current: T) => T
}

export function useGenerator<T>(options: UseGeneratorOptions<T>) {
  const { initial, getNext } = options
  
  const current = ref<T>(initial as T)
  const history = ref<T[]>(initial ? [initial] : [])

  const next = () => {
    const nextValue = getNext(current.value)
    current.value = nextValue
    history.value.push(current.value)
    return nextValue
  }

  const reset = (value?: T) => {
    if (value !== undefined) {
      current.value = value
      history.value = [value]
    } else if (initial !== undefined) {
      current.value = initial
      history.value = [initial]
    } else {
      current.value = getNext(current.value)
      history.value = [current.value]
    }
  }

  const clear = () => {
    history.value = []
  }

  return {
    current,
    history,
    next,
    reset,
    clear
  }
}

// Specialized generators
export function useCounterGenerator(start: number = 0, step: number = 1) {
  return useGenerator({
    initial: start,
    getNext: (current) => current + step
  })
}

export function useIdGenerator(prefix: string = 'id', start: number = 1) {
  return useGenerator({
    initial: `${prefix}${start}`,
    getNext: (current) => {
      const match = current.match(/\d+$/)
      const number = match ? parseInt(match[0]) + 1 : start
      return `${prefix}${number}`
    }
  })
}

export function useUuidGenerator() {
  return useGenerator({
    initial: crypto.randomUUID(),
    getNext: () => crypto.randomUUID()
  })
}

export function useArrayGenerator<T>(items: T[], loop: boolean = true) {
  let index = 0
  
  return useGenerator({
    initial: items[0] ?? undefined,
    getNext: (current): T => {
      if (items.length === 0) return current as T
      index = (index + 1) % items.length
      if (!loop && index === 0) {
        return current as T // Return same value when not looping
      }
      return items[index] as T
    }
  })
}

export function useColorGenerator() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ]
  
  return useArrayGenerator(colors, true)
}

export function useWordGenerator(words: string[] = []) {
  const defaultWords = [
    'apple', 'banana', 'cherry', 'date', 'elderberry',
    'fig', 'grape', 'honeydew', 'kiwi', 'lemon'
  ]
  
  const wordList = words.length > 0 ? words : defaultWords
  return useArrayGenerator(wordList, true)
}
