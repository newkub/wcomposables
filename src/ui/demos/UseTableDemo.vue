<script setup lang="ts">
import { ref } from 'vue'
import { useTable } from './useTable'

interface TestData {
  id: number
  name: string
  age: number
  city: string
  email: string
}

const testData: TestData[] = [
  { id: 1, name: 'John Doe', age: 25, city: 'New York', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 30, city: 'London', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 35, city: 'Paris', email: 'bob@example.com' },
  { id: 4, name: 'Alice Brown', age: 28, city: 'Tokyo', email: 'alice@example.com' },
  { id: 5, name: 'Charlie Wilson', age: 32, city: 'Berlin', email: 'charlie@example.com' },
  { id: 6, name: 'Diana Miller', age: 27, city: 'Sydney', email: 'diana@example.com' },
  { id: 7, name: 'Edward Davis', age: 40, city: 'Toronto', email: 'edward@example.com' },
  { id: 8, name: 'Fiona Garcia', age: 29, city: 'Madrid', email: 'fiona@example.com' },
  { id: 9, name: 'George Martinez', age: 33, city: 'Rome', email: 'george@example.com' },
  { id: 10, name: 'Helen Rodriguez', age: 26, city: 'Amsterdam', email: 'helen@example.com' },
  { id: 11, name: 'Ian Lee', age: 31, city: 'Seoul', email: 'ian@example.com' },
  { id: 12, name: 'Julia Kim', age: 24, city: 'Singapore', email: 'julia@example.com' }
]

const columns = [
  { key: 'id' as keyof TestData, label: 'ID', sortable: true },
  { key: 'name' as keyof TestData, label: 'Name', sortable: true, filterable: true },
  { key: 'age' as keyof TestData, label: 'Age', sortable: true },
  { key: 'city' as keyof TestData, label: 'City', sortable: true, filterable: true },
  { key: 'email' as keyof TestData, label: 'Email', sortable: true }
]

const {
  data,
  filteredData,
  searchQuery,
  setSearch,
  sortBy,
  sortOrder,
  setSort,
  isSortedBy,
  getSortDirection,
  filters,
  setFilter,
  clearFilter,
  clearAllFilters,
  getUniqueValues,
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  startIndex,
  endIndex,
  setPage,
  setPageSize,
  nextPage,
  prevPage,
  firstPage,
  lastPage,
  getCellValue
} = useTable({
  data: testData,
  columns,
  initialPageSize: 5
})
</script>

<template>
  <div class="use-table-demo">
    <h2>Use Table Demo</h2>
    
    <div class="controls">
      <div class="search">
        <input 
          v-model="searchQuery" 
          placeholder="Search..." 
          @input="setSearch"
        />
      </div>
      
      <div class="filters">
        <select @change="setFilter('city', ($event.target as HTMLSelectElement).value)">
          <option value="">All Cities</option>
          <option v-for="city in getUniqueValues('city')" :key="city" :value="city">
            {{ city }}
          </option>
        </select>
        
        <input 
          type="number" 
          placeholder="Min Age" 
          @input="setFilter('age', Number(($event.target as HTMLInputElement).value) || '')"
        />
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              @click="column.sortable && setSort(column.key)"
              :class="{ sortable: column.sortable, sorted: isSortedBy(column.key) }"
            >
              {{ column.label }}
              <span v-if="isSortedBy(column.key)" class="sort-direction">
                {{ getSortDirection(column.key) === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data" :key="row.id">
            <td v-for="column in columns" :key="column.key">
              {{ getCellValue(row, column) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <div class="info">
        Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ totalItems }} items
      </div>
      
      <div class="controls">
        <button @click="firstPage" :disabled="currentPage === 1">First</button>
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        <button @click="lastPage" :disabled="currentPage === totalPages">Last</button>
        
        <select @change="setPageSize(Number(($event.target as HTMLSelectElement).value))">
          <option :value="10" :selected="pageSize === 10">10 per page</option>
          <option :value="25" :selected="pageSize === 25">25 per page</option>
          <option :value="50" :selected="pageSize === 50">50 per page</option>
        </select>
      </div>
    </div>

    <div class="stats">
      <h3>Statistics</h3>
      <div class="stat-grid">
        <div class="stat">
          <label>Total Items:</label>
          <span>{{ totalItems }}</span>
        </div>
        <div class="stat">
          <label>Filtered Items:</label>
          <span>{{ filteredData.length }}</span>
        </div>
        <div class="stat">
          <label>Current Page:</label>
          <span>{{ currentPage }}</span>
        </div>
        <div class="stat">
          <label>Total Pages:</label>
          <span>{{ totalPages }}</span>
        </div>
        <div class="stat">
          <label>Sort By:</label>
          <span>{{ sortBy || 'None' }}</span>
        </div>
        <div class="stat">
          <label>Sort Order:</label>
          <span>{{ sortOrder }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.use-table-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 200px;
}

.filters {
  display: flex;
  gap: 10px;
}

.filters select,
.filters input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

th.sortable {
  cursor: pointer;
  user-select: none;
}

th.sortable:hover {
  background: #e9ecef;
}

th.sorted {
  background: #007bff;
  color: white;
}

.sort-direction {
  margin-left: 5px;
  font-weight: bold;
}

tbody tr:hover {
  background: #f8f9fa;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination .controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.pagination button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background: #0056b3;
}

.page-info {
  font-weight: 600;
  margin: 0 10px;
}

.stats {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
}

.stats h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.stat label {
  font-weight: 600;
  color: #495057;
}

.stat span {
  color: #212529;
}
</style>
