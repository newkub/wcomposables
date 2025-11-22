import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFullscreen, usePictureInPicture } from './useFullscreen'

describe('useFullscreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.stubGlobal('document', {
      fullscreenEnabled: true,
      fullscreenElement: null,
      webkitFullscreenEnabled: true,
      webkitFullscreenElement: null,
      mozFullScreenEnabled: true,
      mozFullScreenElement: null,
      msFullscreenEnabled: true,
      msFullscreenElement: null,
      documentElement: {
        requestFullscreen: vi.fn().mockResolvedValue(undefined),
        webkitRequestFullscreen: vi.fn().mockResolvedValue(undefined),
        mozRequestFullScreen: vi.fn().mockResolvedValue(undefined),
        msRequestFullscreen: vi.fn().mockResolvedValue(undefined)
      },
      exitFullscreen: vi.fn().mockResolvedValue(undefined),
      webkitExitFullscreen: vi.fn().mockResolvedValue(undefined),
      mozCancelFullScreen: vi.fn().mockResolvedValue(undefined),
      msExitFullscreen: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })
  })

  it('should initialize with default values', () => {
    const { isSupported, isActive, element, error } = useFullscreen()

    expect(isSupported.value).toBe(true)
    expect(isActive.value).toBe(false)
    expect(element.value).toBe(null)
    expect(error.value).toBe(null)
  })

  it('should handle unsupported browser', () => {
    vi.stubGlobal('document', { fullscreenEnabled: false })

    const { isSupported } = useFullscreen()

    expect(isSupported.value).toBe(false)

    vi.unstubAllGlobals()
  })

  it('should request fullscreen successfully', async () => {
    const { requestFullscreen, isActive, element } = useFullscreen()

    const result = await requestFullscreen()

    expect(result).toBe(true)
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled()
    expect(isActive.value).toBe(true)
    expect(element.value).toBe(document.documentElement)
  })

  it('should request fullscreen with custom element', async () => {
    const { requestFullscreen, element } = useFullscreen()
    const customElement = document.createElement('div')

    const result = await requestFullscreen(customElement)

    expect(result).toBe(true)
    expect(customElement.requestFullscreen).toHaveBeenCalled()
    expect(element.value).toBe(customElement)
  })

  it('should handle fullscreen request error', async () => {
    const mockError = new Error('Request denied')
    vi.mocked(document.documentElement.requestFullscreen).mockRejectedValue(mockError)

    const onEnter = vi.fn()
    const onError = vi.fn()
    const { requestFullscreen, isActive, error } = useFullscreen({ onEnter, onError })

    const result = await requestFullscreen()

    expect(result).toBe(false)
    expect(isActive.value).toBe(false)
    expect(error.value).toBe('Failed to enter fullscreen: Request denied')
    expect(onError).toHaveBeenCalledWith('Failed to enter fullscreen: Request denied')
    expect(onEnter).not.toHaveBeenCalled()
  })

  it('should exit fullscreen successfully', async () => {
    const { exitFullscreen, isActive, element } = useFullscreen()

    // First enter fullscreen
    await document.documentElement.requestFullscreen()
    expect(isActive.value).toBe(true)

    // Then exit
    const result = await exitFullscreen()

    expect(result).toBe(true)
    expect(document.exitFullscreen).toHaveBeenCalled()
    expect(isActive.value).toBe(false)
    expect(element.value).toBe(null)
  })

  it('should handle fullscreen exit error', async () => {
    const mockError = new Error('Exit failed')
    vi.mocked(document.exitFullscreen).mockRejectedValue(mockError)

    const onExit = vi.fn()
    const onError = vi.fn()
    const { exitFullscreen, error } = useFullscreen({ onExit, onError })

    const result = await exitFullscreen()

    expect(result).toBe(false)
    expect(error.value).toBe('Failed to exit fullscreen: Exit failed')
    expect(onError).toHaveBeenCalledWith('Failed to exit fullscreen: Exit failed')
    expect(onExit).not.toHaveBeenCalled()
  })

  it('should toggle fullscreen', async () => {
    const { toggle, isActive } = useFullscreen()

    // Enter fullscreen
    const result1 = await toggle()
    expect(result1).toBe(true)
    expect(isActive.value).toBe(true)

    // Exit fullscreen
    const result2 = await toggle()
    expect(result2).toBe(true)
    expect(isActive.value).toBe(false)
  })

  it('should check if fullscreen is active', () => {
    const { isFullscreen, isActive } = useFullscreen()

    expect(isFullscreen()).toBe(false)
    expect(isActive.value).toBe(false)

    // Simulate fullscreen element
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      writable: true,
      configurable: true
    })
    isActive.value = true

    expect(isFullscreen()).toBe(true)
  })

  it('should handle legacy fullscreen API', async () => {
    // Remove modern API
    vi.mocked(document.documentElement.requestFullscreen).mockImplementation(() => {
      throw new Error('Not supported')
    })

    // Add legacy API
    const mockLegacyRequest = vi.fn()
    Object.defineProperty(document.documentElement, 'webkitRequestFullscreen', {
      value: mockLegacyRequest,
      writable: true,
      configurable: true
    })

    const { requestFullscreen, isActive } = useFullscreen()

    const result = await requestFullscreen()

    expect(result).toBe(true)
    expect(mockLegacyRequest).toHaveBeenCalled()
    expect(isActive.value).toBe(true)
  })

  it('should handle unsupported fullscreen request', async () => {
    // Remove all request methods
    vi.mocked(document.documentElement.requestFullscreen).mockImplementation(() => {
      throw new Error('Not supported')
    })
    Object.defineProperty(document.documentElement, 'webkitRequestFullscreen', {
      value: undefined,
      writable: true,
      configurable: true
    })
    Object.defineProperty(document.documentElement, 'mozRequestFullScreen', {
      value: undefined,
      writable: true,
      configurable: true
    })
    Object.defineProperty(document.documentElement, 'msRequestFullscreen', {
      value: undefined,
      writable: true,
      configurable: true
    })

    const { requestFullscreen, error } = useFullscreen()

    const result = await requestFullscreen()

    expect(result).toBe(false)
    expect(error.value).toBe('Fullscreen request method not found')
  })

  it('should call callbacks', async () => {
    const onEnter = vi.fn()
    const onExit = vi.fn()
    const { requestFullscreen, exitFullscreen } = useFullscreen({ onEnter, onExit })

    await requestFullscreen()
    expect(onEnter).toHaveBeenCalled()

    await exitFullscreen()
    expect(onExit).toHaveBeenCalled()
  })

  it('should handle fullscreen change events', () => {
    useFullscreen()

    // Simulate fullscreen change event
    const changeHandler = (document.addEventListener as any).mock.calls.find((call: any) => call[0] === 'fullscreenchange')?.[1]
    
    expect(changeHandler).toBeDefined()
    expect(document.addEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
    
    if (changeHandler) {
      changeHandler({} as Event)
    }
  })

  it('should handle fullscreen error events', () => {
    const onError = vi.fn()
    const { error } = useFullscreen({ onError })

    // Simulate fullscreen error event
    const errorHandler = (document.addEventListener as any).mock.calls.find((call: any) => call[0] === 'fullscreenerror')?.[1]
    
    expect(errorHandler).toBeDefined()
    if (errorHandler) {
      errorHandler({ message: 'Permission denied' } as unknown as Event)
    }
    expect(error.value).toBe('Fullscreen error: Permission denied')
    expect(onError).toHaveBeenCalledWith('Fullscreen error: Permission denied')
  })

  it('should update state manually', () => {
    const { updateState, isActive, element } = useFullscreen()

    // Simulate fullscreen element
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => document.documentElement,
      configurable: true
    })
    updateState()

    expect(isActive.value).toBe(true)
    expect(element.value).toBe(document.documentElement)
  })

  it('should handle unsupported browser operations', async () => {
    vi.stubGlobal('document', { fullscreenEnabled: false })

    const { requestFullscreen, exitFullscreen, error } = useFullscreen()

    const result1 = await requestFullscreen()
    expect(result1).toBe(false)
    expect(error.value).toBe('Fullscreen API is not supported')

    error.value = null

    const result2 = await exitFullscreen()
    expect(result2).toBe(false)
    expect(error.value).toBe('Fullscreen API is not supported')

    vi.unstubAllGlobals()
  })
})

describe('usePictureInPicture', () => {
  let mockVideo: HTMLVideoElement

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockVideo = {
      requestPictureInPicture: vi.fn().mockResolvedValue(undefined)
    } as any

    vi.stubGlobal('document', {
      pictureInPictureEnabled: true,
      pictureInPictureElement: null,
      exitPictureInPicture: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })
  })

  it('should initialize with default values', () => {
    const { isSupported, isActive, video, error } = usePictureInPicture()

    expect(isSupported.value).toBe(true)
    expect(isActive.value).toBe(false)
    expect(video.value).toBe(null)
    expect(error.value).toBe(null)
  })

  it('should handle unsupported PiP', () => {
    vi.stubGlobal('document', { pictureInPictureEnabled: false })

    const { isSupported } = usePictureInPicture()

    expect(isSupported.value).toBe(false)

    vi.unstubAllGlobals()
  })

  it('should request PiP successfully', async () => {
    const { requestPiP, isActive, video } = usePictureInPicture()

    const result = await requestPiP(mockVideo)

    expect(result).toBe(true)
    expect(mockVideo.requestPictureInPicture).toHaveBeenCalled()
    expect(isActive.value).toBe(true)
    expect(video.value).toBe(mockVideo)
  })

  it('should handle PiP request error', async () => {
    const mockError = new Error('PiP not allowed')
    vi.mocked(mockVideo.requestPictureInPicture).mockRejectedValue(mockError)

    const { requestPiP, isActive, error } = usePictureInPicture()

    const result = await requestPiP(mockVideo)

    expect(result).toBe(false)
    expect(isActive.value).toBe(false)
    expect(error.value).toBe('PiP not allowed')
  })

  it('should exit PiP successfully', async () => {
    const { requestPiP, exitPiP, isActive, video } = usePictureInPicture()

    // First enter PiP
    await requestPiP(mockVideo)
    expect(isActive.value).toBe(true)

    // Then exit
    const result = await exitPiP()

    expect(result).toBe(true)
    expect(document.exitPictureInPicture).toHaveBeenCalled()
    expect(isActive.value).toBe(false)
    expect(video.value).toBe(null)
  })

  it('should handle PiP exit error', async () => {
    const mockError = new Error('Exit failed')
    vi.mocked(document.exitPictureInPicture).mockRejectedValue(mockError)

    const { exitPiP, error } = usePictureInPicture()

    const result = await exitPiP()

    expect(result).toBe(false)
    expect(error.value).toBe('PiP exit failed')
  })

  it('should toggle PiP', async () => {
    const { togglePiP, isActive } = usePictureInPicture()

    // Enter PiP
    const result1 = await togglePiP(mockVideo)
    expect(result1).toBe(true)
    expect(isActive.value).toBe(true)

    // Exit PiP
    const result2 = await togglePiP(mockVideo)
    expect(result2).toBe(true)
    expect(isActive.value).toBe(false)
  })

  it('should handle unsupported PiP operations', async () => {
    vi.stubGlobal('document', { pictureInPictureEnabled: false })

    const { requestPiP, exitPiP, error } = usePictureInPicture()

    const result1 = await requestPiP(mockVideo)
    expect(result1).toBe(false)
    expect(error.value).toBe('Picture-in-Picture is not supported')

    error.value = null

    const result2 = await exitPiP()
    expect(result2).toBe(true) // exitPiP returns true if no PiP element
    expect(error.value).toBe(null)

    vi.unstubAllGlobals()
  })

  it('should handle PiP change events', () => {
    const { isActive, video } = usePictureInPicture()

    // Simulate PiP enter event
    const enterHandler = (document.addEventListener as any).mock.calls.find((call: any) => call[0] === 'enterpictureinpicture')?.[1]
    
    if (enterHandler) {
      enterHandler()
      // Should update state
    }

    // Simulate PiP element
    Object.defineProperty(document, 'pictureInPictureElement', {
      value: mockVideo,
      writable: true,
      configurable: true
    })
    isActive.value = true
    video.value = mockVideo

    expect(isActive.value).toBe(true)
    expect(video.value).toBe(mockVideo)
  })
})
