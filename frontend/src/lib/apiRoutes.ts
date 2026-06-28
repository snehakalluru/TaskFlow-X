// Centralized API route definitions (must match backend mount paths)

export const apiRoutes = {
  // Auth
  register: '/api/auth/register',
  login: '/api/auth/login',
  logout: '/api/auth/logout',

  // Users
  me: '/api/users/me',

  // Tasks
  tasks: '/api/tasks',
  taskById: (id: string) => `/api/tasks/${id}`,
  completeTask: (id: string) => `/api/tasks/${id}/complete`,
  taskStatus: (id: string) => `/api/tasks/${id}/status`,
  taskMembers: '/api/tasks/members',

  // Categories
  categories: '/api/categories',
  categoryById: (id: string) => `/api/categories/${id}`,

  // Notifications
  notifications: '/api/notifications',
  notificationById: (id: string) => `/api/notifications/${id}`,
  markNotificationRead: (id: string) => `/api/notifications/${id}/read`,

  // Analytics
  analyticsSummary: '/api/analytics/summary',
  analyticsProductivity: '/api/analytics/productivity',
  analyticsCategories: '/api/analytics/categories',
};

