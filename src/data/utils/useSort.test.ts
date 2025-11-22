import { describe, it, expect } from 'vitest'
import { useSort, createStringCompare, createDateCompare } from './useSort'

interface User {
  id: number
  name: string
  age: number
  active: boolean
  createdAt: Date
}

describe('useSort', () => {
  const users: User[] = [
    { id: 1, name: 'Alice', age: 30, active: true, createdAt: new Date('2023-01-01') },
    { id: 2, name: 'Bob', age: 25, active: false, createdAt: new Date('2023-01-02') },
    { id: 3, name: 'Charlie', age: 35, active: true, createdAt: new Date('2023-01-03') }
  ]

  it('should return unsorted items when no sort is applied', () => {
    const { sortedItems } = useSort(users)

    expect(sortedItems.value).toEqual(users)
  })

  it('should sort by key in ascending order', () => {
    const { sortedItems, sortBy } = useSort(users, createStringCompare())

    sortBy.value = 'name'
    expect(sortedItems.value.map(u => u.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('should sort by key in descending order', () => {
    const { sortedItems, sortBy, sortOrder } = useSort(users, createStringCompare())

    sortBy.value = 'name'
    sortOrder.value = 'desc'
    expect(sortedItems.value.map(u => u.name)).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  it('should sort by number field', () => {
    const { sortedItems, sortBy, sortOrder } = useSort(users, (a, b) => a.age - b.age)

    sortBy.value = 'age'
    expect(sortedItems.value.map(u => u.age)).toEqual([25, 30, 35])

    sortOrder.value = 'desc'
    expect(sortedItems.value.map(u => u.age)).toEqual([35, 30, 25])
  })

  it('should use custom compare function', () => {
    const { sortedItems, sortBy } = useSort(users, createStringCompare())

    sortBy.value = 'name'
    expect(sortedItems.value.map(u => u.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('should check if currently sorted', () => {
    const { isSortedBy, sortBy } = useSort(users)

    expect(isSortedBy('name')).toBe(false)

    sortBy.value = 'name'
    expect(isSortedBy('name')).toBe(true)
    expect(isSortedBy('age')).toBe(false)
  })

  it('should change sort key', () => {
    const { sortBy, currentSort } = useSort(users)

    sortBy.value = 'name'
    expect(currentSort.value?.key).toBe('name')
    expect(currentSort.value?.order).toBe('asc')

    sortBy.value = 'age'
    expect(currentSort.value?.key).toBe('age')
    expect(currentSort.value?.order).toBe('asc')
  })

  it('should clear sort', () => {
    const { sortedItems, sortBy, clearSort, currentSort } = useSort(users, createStringCompare())

    sortBy.value = 'name'
    expect(sortedItems.value.map(u => u.name)).toEqual(['Alice', 'Bob', 'Charlie'])

    clearSort()
    expect(sortedItems.value).toEqual(users)
    expect(currentSort.value).toBe(undefined)
  })


  it('should get sort direction', () => {
    const { getSortDirection, sortBy } = useSort(users)

    expect(getSortDirection('name')).toBe(null)

    sortBy.value = 'name'
    expect(getSortDirection('name')).toBe('asc')
  })

  it('should manage sort options', () => {
    const { addSortOption, removeSortOption, sortOptions } = useSort(users)

    addSortOption({ key: 'name', label: 'Name' })
    addSortOption({ key: 'age', label: 'Age' })

    expect(sortOptions.value).toHaveLength(2)

    removeSortOption('name')
    expect(sortOptions.value).toHaveLength(1)
    expect(sortOptions.value[0]?.key).toBe('age')
  })

  it('should sort with date compare function', () => {
    const { sortedItems, sortBy } = useSort(users, createDateCompare())

    sortBy.value = 'createdAt'
    const sortedDates = sortedItems.value.map(u => u.createdAt.toISOString())
    expect(sortedDates).toEqual([
      '2023-01-01T00:00:00.000Z',
      '2023-01-02T00:00:00.000Z',
      '2023-01-03T00:00:00.000Z'
    ])
  })

  it('should handle empty array', () => {
    const { sortedItems } = useSort<User[]>([])

    expect(sortedItems.value).toEqual([])
  })

  it('should handle array with single item', () => {
    const singleUser: User[] = [users[0]!]
    const { sortedItems, sortBy } = useSort<User>(singleUser)

    sortBy.value = 'name'
    expect(sortedItems.value).toEqual(singleUser)
  })
})
