import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface UseCounterOptions {
  min?: number
  max?: number
  step?: number
}

export interface UseCounterReturn {
  count: Ref<number>
  inc: (delta?: number) => void
  dec: (delta?: number) => void
  set: (value: number) => void
  reset: () => void
  min: ComputedRef<number | undefined>
  max: ComputedRef<number | undefined>
  step: ComputedRef<number>
  canIncrement: ComputedRef<boolean>
  canDecrement: ComputedRef<boolean>
  isAtMin: ComputedRef<boolean>
  isAtMax: ComputedRef<boolean>
  percentage: ComputedRef<number>
}

export function useCounter(initialValue = 0, options: UseCounterOptions = {}) {
  const {
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    step = 1
  } = options

  const count = ref(initialValue)
  const stepRef = ref(step)
  const minRef = ref(min)
  const maxRef = ref(max)

  const canIncrement = computed(() => count.value + stepRef.value <= maxRef.value)
  const canDecrement = computed(() => count.value - stepRef.value >= minRef.value)
  const isAtMin = computed(() => count.value <= minRef.value)
  const isAtMax = computed(() => count.value >= maxRef.value)

  const percentage = computed(() => {
    if (minRef.value === Number.NEGATIVE_INFINITY || maxRef.value === Number.POSITIVE_INFINITY) {
      return 0
    }
    
    const range = maxRef.value - minRef.value
    if (range === 0) return 100
    
    return Math.round(((count.value - minRef.value) / range) * 100)
  })

  const inc = (delta = stepRef.value) => {
    const newValue = count.value + delta
    if (newValue <= maxRef.value) {
      count.value = newValue
    }
  }

  const dec = (delta = stepRef.value) => {
    const newValue = count.value - delta
    if (newValue >= minRef.value) {
      count.value = newValue
    }
  }

  const set = (value: number) => {
    const clampedValue = Math.min(Math.max(value, minRef.value), maxRef.value)
    count.value = clampedValue
  }

  const reset = () => {
    count.value = initialValue
  }

  return {
    count,
    inc,
    dec,
    set,
    reset,
    min: computed(() => minRef.value),
    max: computed(() => maxRef.value),
    step: computed(() => stepRef.value),
    canIncrement,
    canDecrement,
    isAtMin,
    isAtMax,
    percentage
  }
}
