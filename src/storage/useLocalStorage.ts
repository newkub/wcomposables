import { ref, watch, onUnmounted, type Ref } from 'vue'

export interface UseLocalStorageOptions<T> {
  defaultValue?: T
  serializer?: {
    read: (value: string) => T
    write: (value: T) => string
  }
  onError?: (error: Error) => void
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): { value: Ref<T>; remove: () => void; clear: () => void } {
  const {
    defaultValue = initialValue,
    serializer = {
      read: (value: string) => {
        try {
          return JSON.parse(value)
        } catch {
          return defaultValue
        }
      },
      write: (value: T) => JSON.stringify(value)
    },
    onError = (error) => console.error(error)
  } = options

  const storedValue = ref<T>(defaultValue)

  const read = (): T => {
    try {
      const rawValue = localStorage.getItem(key)
      if (rawValue === null) {
        return defaultValue
      }
      return serializer.read(rawValue)
    } catch (error) {
      onError(error as Error)
      return defaultValue
    }
  }

  const write = (value: T) => {
    try {
      localStorage.setItem(key, serializer.write(value))
    } catch (error) {
      onError(error as Error)
    }
  }

  storedValue.value = read()

  watch(storedValue, (newValue) => {
    write(newValue)
  }, { deep: true })

  const remove = () => {
    try {
      localStorage.removeItem(key)
      storedValue.value = defaultValue
    } catch (error) {
      onError(error as Error)
    }
  }

  const clear = () => {
    remove()
  }

  onUnmounted(() => {
    const finalValue = storedValue.value
    write(finalValue)
  })

  return {
    value: storedValue as Ref<T>,
    remove,
    clear
  }
}
