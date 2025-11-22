// Core
export * from './ui/interactions/useMouse'
export * from './browser/media/useClipboard'
export * from './browser/screen/useFullscreen'

// Storage
export * from './storage/useIndexedDB'
export * from './storage/useCookie'

// State
export * from './state/useToggle'
export * from './state/useBoolean'
export * from './state/useAsyncState'
export * from './state/useHistory'
export * from './state/useLocalStorageState'
export * from './state/useSessionStorageState'

// Events
export * from './events/useKeyboard'
export * from './events/useOnClickOutside'
export * from './events/useScroll'

// Validation
export * from './validation/useFormValidation'
export * from './validation/useFieldValidation'

// Browser
export * from './browser/screen/useTitle'
export * from './browser/screen/usePreferredDark'
export * from './browser/screen/useWindowSize'
export * from './browser/location/useGeolocation'
export * from './browser/location/useScreenOrientation'
export * from './browser/device/useBattery'
export * from './browser/device/useVibration'
export * from './browser/device/useWakeLock'
export * from './browser/device/useMediaDevices'
export * from './browser/permissions/useShare'
// export * from './browser/useInstallPrompt' // Temporarily disabled due to type issues
export * from './browser/screen/usePageVisibility'
export * from './browser/system/useConnection'
export * from './browser/permissions/usePermission'
export * from './browser/system/useIdle'
export * from './browser/system/useLanguage'
export * from './browser/system/usePointer'
export { useDeviceOrientation as useDeviceOrientationSensors, type DeviceOrientationOptions as DeviceOrientationSensorsOptions } from './browser/system/useDeviceOrientation'
export { useClipboardAPI, type ClipboardAPIOptions } from './browser/system/useClipboardAPI'
export * from './browser/system/useScreenCapture'
export { useMarkdownRender, type MarkdownRenderOptions } from './browser/system/useMarkdownRender'

// Utils
export * from './browser/screen/useWindowSize'
export * from './ui/utilities/useMediaQuery'
export * from './time/useDateFormat'
export * from './data/utils/useColor'
export * from './browser/network/useUrl'
export * from './data/generators/useGenerator'
export * from './data/utils/useDragAndDrop'
export * from './time/useTimer'
export * from './data/arrays/useArray'
export * from './data/filters/useFilter'
export * from './data/utils/useSort'
export * from './data/utils/useSearch'
export * from './data/tables/usePagination'
export * from './data/files/useImageUpload'
export * from './data/files/useFilePicker'
export * from './data/tables/useTable'

// Animation
export * from './animation/useTransition'
export * from './animation/useTimeoutFn'
export * from './animation/useIntervalFn'

// Network
// Note: useOnline and useNetwork have been moved to browser directory
// export * from './network/useOnline'
// export * from './network/useNetwork'

// Form
export * from './form/useForm'

// Time
export { useNow } from './time/useNow'
export { useCountdown as useCountdownTimer, type UseCountdownOptions as UseCountdownTimerOptions } from './time/useCountdown'

// Math
export * from './math/useCounter'

// Time
export * from './time/useDebounce'
export * from './time/useThrottle'

// UI
export * from './ui/utilities/useResize'
export * from './ui/interactions/useDraggable'

// Data
export * from './data/arrays/useArray'
export * from './data/utils/useSort'
export * from './data/filters/useFilter'
export * from './data/tables/usePagination'
export * from './data/tables/useTable'

// Navigation
// TODO: Add navigation utilities when available
// export * from './navigation/useRouter'
// export * from './navigation/useNavigation'

// New Composables
export { useMarkdownEditor, type MarkdownEditorOptions, type MarkdownEditorCommands, type MarkdownEditorState } from './ui/components/useMarkdownEditor'
export { useVideoRecording, type VideoRecordingOptions, type VideoRecordingState, type MediaDevices, type RecordingStats } from './browser/media/useVideoRecording'
export { useHtmlToMarkdown, type HtmlToMarkdownOptions, type ConversionState } from './data/utils/useHtmlToMarkdown'
