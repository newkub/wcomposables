import { ref, onMounted, onUnmounted, type Ref, watch } from 'vue'

export interface IntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export interface IntersectionResult {
  isIntersecting: boolean
  intersectionRatio: number
  target: Element
  entry: IntersectionObserverEntry
}

export function useIntersectionObserver(
  target: Element | Ref<Element | null> | (() => Element | null),
  options: IntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px'
  } = options

  const isSupported = ref(!!window.IntersectionObserver)
  const isIntersecting = ref(false)
  const intersectionRatio = ref(0)
  const targetElement = ref<Element | null>(null)
  const entries = ref<IntersectionObserverEntry[]>([])

  let observer: IntersectionObserver | null = null

  const getTargetElement = (): Element | null => {
    if (typeof target === 'function') {
      return target()
    } else if (typeof target === 'object' && 'value' in target) {
      return target.value
    } else {
      return target
    }
  }

  const setupObserver = () => {
    if (!isSupported.value) return

    const element = getTargetElement()
    if (!element) return

    targetElement.value = element

    observer = new IntersectionObserver(
      (observerEntries) => {
        entries.value = observerEntries

        for (const entry of observerEntries) {
          if (entry.target === element) {
            isIntersecting.value = entry.isIntersecting
            intersectionRatio.value = entry.intersectionRatio
            break
          }
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    )

    observer.observe(element)
  }

  const start = () => {
    if (observer) {
      stop()
    }
    setupObserver()
  }

  const stop = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    isIntersecting.value = false
    intersectionRatio.value = 0
    entries.value = []
  }

  const pause = () => {
    if (observer) {
      observer.unobserve(targetElement.value!)
    }
  }

  const resume = () => {
    if (observer && targetElement.value) {
      observer.observe(targetElement.value)
    }
  }

  const updateOptions = (newOptions: Partial<IntersectionObserverOptions>) => {
    Object.assign(options, newOptions)
    start()
  }

  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    isSupported,
    isIntersecting,
    intersectionRatio,
    targetElement,
    entries,
    start,
    stop,
    pause,
    resume,
    updateOptions
  }
}

// Multiple elements intersection observer
export function useIntersectionObserverMultiple(
  targets: (Element | Ref<Element | null> | (() => Element | null))[],
  options: IntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px'
  } = options

  const isSupported = ref(!!window.IntersectionObserver)
  const results = ref<Map<Element, IntersectionResult>>(new Map())
  const entries = ref<IntersectionObserverEntry[]>([])

  let observer: IntersectionObserver | null = null

  const getTargetElements = (): Element[] => {
    return targets
      .map(target => {
        if (typeof target === 'function') {
          return target()
        } else if (typeof target === 'object' && 'value' in target) {
          return target.value
        } else {
          return target
        }
      })
      .filter(Boolean) as Element[]
  }

  const setupObserver = () => {
    if (!isSupported.value) return

    const elements = getTargetElements()
    if (elements.length === 0) return

    observer = new IntersectionObserver(
      (observerEntries) => {
        entries.value = observerEntries

        for (const entry of observerEntries) {
          const result: IntersectionResult = {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            target: entry.target,
            entry
          }
          results.value.set(entry.target, result)
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    )

    elements.forEach(element => {
      observer!.observe(element)
    })
  }

  const start = () => {
    if (observer) {
      stop()
    }
    setupObserver()
  }

  const stop = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    results.value.clear()
    entries.value = []
  }

  const getResult = (target: Element): IntersectionResult | undefined => {
    return results.value.get(target)
  }

  const isIntersecting = (target: Element): boolean => {
    return results.value.get(target)?.isIntersecting ?? false
  }

  const getIntersectionRatio = (target: Element): number => {
    return results.value.get(target)?.intersectionRatio ?? 0
  }

  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    isSupported,
    results,
    entries,
    start,
    stop,
    getResult,
    isIntersecting,
    getIntersectionRatio
  }
}

// Lazy loading helper
export function useLazyLoad(
  target: Element | Ref<Element | null> | (() => Element | null),
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverOptions = {}
) {
  const { isIntersecting, entries, start, stop } = useIntersectionObserver(target, {
    threshold: 0.1,
    ...options
  })

  let hasTriggered = ref(false)

  const handleIntersection = () => {
    if (isIntersecting.value && !hasTriggered.value) {
      hasTriggered.value = true
      const entry = entries.value.find(e => e.isIntersecting)
      if (entry) {
        callback(entry)
        stop() // Stop observing after callback
      }
    }
  }

  const reset = () => {
    hasTriggered.value = false
    start()
  }

  // Watch for intersection changes
  const unwatch = watch(isIntersecting, handleIntersection)

  onUnmounted(() => {
    unwatch()
  })

  return {
    isIntersecting,
    hasTriggered,
    reset,
    start,
    stop
  }
}
