import { http, HttpResponse } from 'msw';
import { mockTask, createMockTask } from '../fixtures/task';
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/schema/unified-schema';

// Mock API base URL
const API_BASE = 'http://localhost:54321';

export const handlers = [
  // GET /rest/v1/tasks - Get all tasks
  http.get(`${API_BASE}/rest/v1/tasks`, () => {
    return HttpResponse.json([
      mockTask,
      createMockTask({ id: 2, title: 'Second Task', is_completed: true }),
      createMockTask({ id: 3, title: 'Third Task', priority: 'high' }),
    ]);
  }),

  // POST /rest/v1/tasks - Create new task
  http.post(`${API_BASE}/rest/v1/tasks`, async ({ request }) => {
    const newTask = await request.json() as TaskCreateInput;
    const createdTask = createMockTask({
      id: Math.floor(Math.random() * 1000),
      ...newTask,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return HttpResponse.json(createdTask, { status: 201 });
  }),

  // PATCH /rest/v1/tasks?id=eq.{id} - Update task
  http.patch(`${API_BASE}/rest/v1/tasks`, async ({ request, params }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id')?.replace('eq.', '');
    const updates = await request.json() as TaskUpdateInput;
    
    const updatedTask = createMockTask({
      id: parseInt(id || '1'),
      ...updates,
      updated_at: new Date().toISOString(),
    });
    
    return HttpResponse.json(updatedTask);
  }),

  // DELETE /rest/v1/tasks?id=eq.{id} - Delete task
  http.delete(`${API_BASE}/rest/v1/tasks`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id')?.replace('eq.', '');
    return HttpResponse.json({ message: `Task ${id} deleted` });
  }),

  // GET /rest/v1/tasks?id=eq.{id} - Get single task
  http.get(`${API_BASE}/rest/v1/tasks`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id')?.replace('eq.', '');
    
    if (id) {
      const task = createMockTask({ id: parseInt(id) });
      return HttpResponse.json([task]);
    }
    
    return HttpResponse.json([mockTask]);
  }),

  // Error handlers for testing error scenarios
  http.get(`${API_BASE}/rest/v1/tasks-error`, () => {
    return HttpResponse.json(
      { error: 'Internal Server Error', message: 'Database connection failed' },
      { status: 500 }
    );
  }),

  http.post(`${API_BASE}/rest/v1/tasks-error`, () => {
    return HttpResponse.json(
      { error: 'Bad Request', message: 'Invalid task data' },
      { status: 400 }
    );
  }),
];