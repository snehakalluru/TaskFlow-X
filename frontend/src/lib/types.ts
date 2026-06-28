export type ThemeMode = 'light' | 'dark';

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error?: {
    message?: string;
    details?: any;
  };
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  theme?: ThemeMode;
  profileImageUrl?: string;
};

