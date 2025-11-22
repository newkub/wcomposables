import { ref, onMounted, onUnmounted } from 'vue'

export interface UseIdleOptions {
  timeout?: number
  events?: string[]
  initialState?: boolean
}

export function useIdle(options: UseIdleOptions = {}) {
  const {
    timeout = 60000, // 1 minute
    events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ],
    initialState = false
  } = options

  const idle = ref(initialState)
  const lastActive = ref(Date.now())

  let timeoutId: NodeJS.Timeout | null = null

  const handleActivity = () => {
    lastActive.value = Date.now()
    
    if (idle.value) {
      idle.value = false
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      idle.value = true
      timeoutId = null
    }, timeout)
  }

  const start = () => {
    handleActivity()
  }

  const stop = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const reset = () => {
    stop()
    idle.value = initialState
    lastActive.value = Date.now()
  }

  onMounted(() => {
    if (!initialState) {
      start()
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })
  })

  onUnmounted(() => {
    stop()
    events.forEach(event => {
      document.removeEventListener(event, handleActivity)
    })
  })

  return {
    idle,
    lastActive,
    start,
    stop,
    reset
  }
}
