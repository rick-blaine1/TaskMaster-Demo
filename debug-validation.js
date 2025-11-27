import { validateTask } from './schema/validation.js';

// Test with empty title
const invalidTask = { title: '', description: 'Valid description' };
const result = validateTask(invalidTask);

console.log('Validation result:', result);
if (!result.success) {
  console.log('Errors:', result.errors);
}

// Test with long title
const longTitleTask = { title: 'a'.repeat(201), description: 'Valid description' };
const result2 = validateTask(longTitleTask);

console.log('Long title result:', result2);
if (!result2.success) {
  console.log('Long title errors:', result2.errors);
}