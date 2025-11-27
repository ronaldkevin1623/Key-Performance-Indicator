// API Configuration and Utility Functions
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (data: {
    name: string;
    email: string;
    password: string;
    company: string;
    role: string;
  }) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest('/auth/me'),
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};

// Dashboard API
export const dashboardApi = {
  getAdminStats: () => apiRequest('/dashboard/admin'),
  getEmployeeStats: () => apiRequest('/dashboard/employee'),
  getLeaderboard: () => apiRequest('/dashboard/leaderboard'),
};

// Projects API
export const projectsApi = {
  getAll: () => apiRequest('/projects'),
  getById: (id: string) => apiRequest(`/projects/${id}`),
  create: (data: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  }) =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    }),
  getKPI: (id: string) => apiRequest(`/projects/${id}/kpi`),
  getOverview: (id: string) => apiRequest(`/projects/${id}/overview`),
};

// Tasks API
export const tasksApi = {
  getAll: (filters?: { userId?: string; projectId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    const query = params.toString();
    return apiRequest(`/tasks${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiRequest(`/tasks/${id}`),
  create: (data: {
    title: string;
    description: string;
    project: string;
    assignedTo: string;
    priority: string;
    points: number;
    dueDate: string;
    endTime?: string | null;
    graceTime?: string | null;
  }) =>
    apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    }),
  addComment: (id: string, data: { text: string }) =>
    apiRequest(`/tasks/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiRequest('/users'),
  getEmployeeDropdown: () => apiRequest('/users/employee-dropdown'),
  getById: (id: string) => apiRequest(`/users/${id}`),
  update: (id: string, data: any) =>
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Teams API
export const teamsApi = {
  getAll: () => apiRequest('/teams'),
  getByProject: (projectId: string) => apiRequest(`/teams/project/${projectId}`), // NEW
  upsertForProject: (projectId: string, data: { name: string; memberIds: string[] }) =>
    apiRequest(`/teams/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/teams/${id}`, {
      method: 'DELETE',
    }),
};

export default {
  authApi,
  dashboardApi,
  projectsApi,
  tasksApi,
  usersApi,
  teamsApi,
};
