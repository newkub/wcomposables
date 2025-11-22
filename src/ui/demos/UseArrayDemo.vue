<script setup lang="ts">
import { ref } from 'vue'
import { useArray } from './useArray'

const newItem = ref('')

const {
  array,
  length,
  first,
  last,
  isEmpty,
  add,
  addAt,
  remove,
  removeAt,
  clear,
  reset,
  filter,
  map,
  reduce,
  includes,
  reverse,
  shuffle,
  unique,
  clone
} = useArray({
  initial: [1, 2, 3, 'test', 4, 5, 'test', 6]
})

const addItem = () => {
  if (newItem.value.trim()) {
    const value = isNaN(Number(newItem.value)) ? newItem.value : Number(newItem.value)
    add(value)
    newItem.value = ''
  }
}
</script>

<template>
  <div class="use-array-demo">
    <h2>Use Array Demo</h2>
    
    <div class="controls">
      <input v-model="newItem" placeholder="Enter item" @keyup.enter="addItem" />
      <button @click="addItem">Add Item</button>
      <button @click="clear">Clear All</button>
      <button @click="reset">Reset</button>
      <button @click="shuffle">Shuffle</button>
      <button @click="reverse">Reverse</button>
    </div>

    <div class="array-info">
      <p>Length: {{ length }}</p>
      <p>First: {{ first }}</p>
      <p>Last: {{ last }}</p>
      <p>Is Empty: {{ isEmpty }}</p>
    </div>

    <div class="array-display">
      <h3>Array Items:</h3>
      <div class="items">
        <div 
          v-for="(item, index) in array" 
          :key="index"
          class="item"
        >
          <span>{{ item }}</span>
          <button @click="removeAt(index)">Remove</button>
        </div>
      </div>
    </div>

    <div class="operations">
      <h3>Operations:</h3>
      <div class="operation-group">
        <h4>Filter even numbers:</h4>
        <p>{{ filter(item => typeof item === 'number' && item % 2 === 0).join(', ') || 'None' }}</p>
      </div>
      
      <div class="operation-group">
        <h4>Map to squares:</h4>
        <p>{{ map(item => typeof item === 'number' ? item * item : item).join(', ') }}</p>
      </div>
      
      <div class="operation-group">
        <h4>Sum (reduce):</h4>
        <p>{{ reduce((acc, item) => typeof item === 'number' ? acc + item : acc, 0) }}</p>
      </div>
      
      <div class="operation-group">
        <h4>Contains 'test'?</h4>
        <p>{{ includes('test') ? 'Yes' : 'No' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.use-array-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.controls input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.controls button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.controls button:hover {
  background: #0056b3;
}

.array-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.array-info p {
  margin: 5px 0;
}

.array-display h3 {
  margin-bottom: 10px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px;
  background: #e9ecef;
  border-radius: 4px;
}

.item button {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  background: #dc3545;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.item button:hover {
  background: #c82333;
}

.operations h3 {
  margin-bottom: 15px;
}

.operation-group {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.operation-group h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.operation-group p {
  margin: 0;
  font-family: monospace;
}
</style>
