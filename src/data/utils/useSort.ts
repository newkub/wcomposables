import { computed, ref } from 'vue'

export interface SortOption {
  key: string
  label: string
  compareFn?: (a: any, b: any) => number
}

export function useSort<T>(items: T[], compareFn?: (a: T, b: T) => number) {
  const sortBy = ref<keyof T | undefined>(undefined)
  const sortOrder = ref<'asc' | 'desc'>('asc')
  const currentSort = ref<{ key: keyof T; order: 'asc' | 'desc' } | undefined>(undefined)
  const sortOptions = ref<SortOption[]>([])

  const sortedItems = computed(() => {
    if (!compareFn) return [...items]
    return [...items].sort(compareFn)
  })

  const clearSort = () => {
    sortBy.value = undefined
    sortOrder.value = 'asc'
    currentSort.value = undefined
  }

  const isSortedBy = (key: keyof T) => {
    return sortBy.value === key
  }

  const getSortDirection = (key: keyof T) => {
    return isSortedBy(key) ? sortOrder.value : null
  }

  const addSortOption = (option: SortOption) => {
    sortOptions.value.push(option)
  }

  const removeSortOption = (key: string) => {
    sortOptions.value = sortOptions.value.filter(opt => opt.key !== key)
  }

  return {
    sortedItems,
    sortBy,
    sortOrder,
    clearSort,
    currentSort,
    isSortedBy,
    getSortDirection,
    addSortOption,
    removeSortOption,
    sortOptions
  }
}

export function createStringCompare() {
  return (a: any, b: any) => {
    const aStr = String(a).toLowerCase()
    const bStr = String(b).toLowerCase()
    return aStr.localeCompare(bStr)
  }
}

export function createDateCompare() {
  return (a: any, b: any) => {
    const aDate = new Date(a)
    const bDate = new Date(b)
    return aDate.getTime() - bDate.getTime()
  }
}