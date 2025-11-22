import { ref, onMounted, onUnmounted } from 'vue'

export interface UseScrollOptions {
  target?: HTMLElement | Window
  throttle?: number
}

export function useScroll(options: UseScrollOptions = {}) {
  const { target = window } = options

  const x = ref(0)
  const y = ref(0)
  const isScrolling = ref(false)
  const scrollDirection = ref<'up' | 'down' | 'left' | 'right' | null>(null)
  const arrivedState = ref({
    top: true,
    bottom: false,
    left: true,
    right: false
  })

  let lastScrollX = 0
  let lastScrollY = 0
  let scrollTimeout: NodeJS.Timeout

  const getScrollPosition = () => {
    if (target === window) {
      return {
        x: window.scrollX,
        y: window.scrollY,
        maxX: document.documentElement.scrollWidth - window.innerWidth,
        maxY: document.documentElement.scrollHeight - window.innerHeight
      }
    } else {
      const element = target as HTMLElement
      return {
        x: element.scrollLeft,
        y: element.scrollTop,
        maxX: element.scrollWidth - element.clientWidth,
        maxY: element.scrollHeight - element.clientHeight
      }
    }
  }

  const updateScrollState = () => {
    const { x: currentX, y: currentY, maxX, maxY } = getScrollPosition()

    // Update scroll position
    x.value = currentX
    y.value = currentY

    // Update scroll direction
    if (currentY > lastScrollY) scrollDirection.value = 'down'
    else if (currentY < lastScrollY) scrollDirection.value = 'up'
    else if (currentX > lastScrollX) scrollDirection.value = 'right'
    else if (currentX < lastScrollX) scrollDirection.value = 'left'

    // Update arrived state
    arrivedState.value = {
      top: currentY <= 0,
      bottom: currentY >= maxY,
      left: currentX <= 0,
      right: currentX >= maxX
    }

    lastScrollX = currentX
    lastScrollY = currentY

    // Set scrolling state
    isScrolling.value = true
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }

  const scrollTo = (options: ScrollToOptions) => {
    if (target === window) {
      window.scrollTo(options)
    } else {
      const element = target as HTMLElement
      if (options.left !== undefined) element.scrollLeft = options.left
      if (options.top !== undefined) element.scrollTop = options.top
    }
  }

  const scrollToX = (x: number) => scrollTo({ left: x })
  const scrollToY = (y: number) => scrollTo({ top: y })

  const scrollBy = (options: ScrollToOptions) => {
    if (target === window) {
      window.scrollBy(options)
    } else {
      const element = target as HTMLElement
      if (options.left !== undefined) element.scrollLeft += options.left
      if (options.top !== undefined) element.scrollTop += options.top
    }
  }

  const scrollByX = (x: number) => scrollBy({ left: x })
  const scrollByY = (y: number) => scrollBy({ top: y })

  onMounted(() => {
    updateScrollState()
    target.addEventListener('scroll', updateScrollState, { passive: true })
  })

  onUnmounted(() => {
    target.removeEventListener('scroll', updateScrollState)
    clearTimeout(scrollTimeout)
  })

  return {
    x,
    y,
    isScrolling,
    scrollDirection,
    arrivedState,
    scrollTo,
    scrollToX,
    scrollToY,
    scrollBy,
    scrollByX,
    scrollByY
  }
}
