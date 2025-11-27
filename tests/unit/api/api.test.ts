import { api } from '../../../src/utils/api';
import { vi } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

vi.mock('../../../src/utils/supabase', () => ({
  supabase: mockSupabase,
}));

describe('API Integration', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    is_completed: false,
    created_at: '2025-11-27T20:00:00.000Z',
    due_date: '2025-12-01T10:00:00.000Z',
    category: 'Work',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [mockTask], error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await api.getTasks();

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual([mockTask]);
    });

    it('should handle fetch error', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await expect(api.getTasks()).rejects.toThrow('Database error');
    });

    it('should handle null data response', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await api.getTasks();
      expect(result).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const newTaskData = {
        title: 'New Task',
        description: 'New Description',
        is_completed: false,
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { ...mockTask, ...newTaskData }, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await api.createTask(newTaskData);

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockChain.insert).toHaveBeenCalledWith(newTaskData);
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual({ ...mockTask, ...newTaskData });
    });

    it('should handle create error', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await expect(api.createTask({ title: 'Failed Task', is_completed: false }))
        .rejects.toThrow('Insert failed');
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const updateData = { title: 'Updated Task', is_completed: true };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await api.updateTask(1, updateData);

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockChain.update).toHaveBeenCalledWith(updateData);
      expect(mockChain.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should handle update error', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await expect(api.updateTask(1, { title: 'Failed Update' }))
        .rejects.toThrow('Update failed');
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await api.deleteTask(1);

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should handle delete error', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await expect(api.deleteTask(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockRejectedValue(new Error('Network error')),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await expect(api.getTasks()).rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: 'invalid', error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      // Should handle invalid data gracefully
      const result = await api.getTasks();
      expect(result).toEqual('invalid');
    });
  });

  describe('API Contract Validation', () => {
    it('should call Supabase with correct table name', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await api.getTasks();

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
    });

    it('should use correct column selection', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await api.getTasks();

      expect(mockChain.select).toHaveBeenCalledWith('*');
    });

    it('should use correct ordering', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await api.getTasks();

      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });
});