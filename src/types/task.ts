export interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
  due_date?: string;
  category?: 'Work' | 'Personal' | 'Shopping' | 'Health';
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'created' | 'due' | 'title';
