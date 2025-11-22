import { ref, onMounted, onUnmounted } from 'vue'

export interface UseWindowSizeOptions {
  initialWidth?: number
  initialHeight?: number
}

export function useWindowSize(options: UseWindowSizeOptions = {}) {
  const { initialWidth = 0, initialHeight = 0 } = options

  const width = ref(initialWidth)
  const height = ref(initialHeight)

  const updateSize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return {
    width,
    height
  }
}
