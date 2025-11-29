const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (data: {
    name: string;
    email: string;
    password: string;
    company: string;
    role: string;
  }) =>
    apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest("/auth/me"),
  logout: () =>
    apiRequest("/auth/logout", {
      method: "POST",
    }),
};

// Dashboard API
export const dashboardApi = {
  getAdminStats: () => apiRequest("/dashboard/admin"),
  getEmployeeStats: () => apiRequest("/dashboard/employee"),
  getLeaderboard: () => apiRequest("/dashboard/leaderboard"),
};

// Projects API
export const projectsApi = {
  getAll: () => apiRequest("/projects"),
  getById: (id: string) => apiRequest(`/projects/${id}`),
  create: (data: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  }) =>
    apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/projects/${id}`, {
      method: "DELETE",
    }),
  getKPI: (id: string) => apiRequest(`/projects/${id}/kpi`),
  getOverview: (id: string) => apiRequest(`/projects/${id}/overview`),

  getProgress: async () => {
    const [projectsRes, tasksRes] = await Promise.all([
      apiRequest<any>("/projects"),
      apiRequest<any>("/tasks"),
    ]);

    const projects = (projectsRes as any).data || projectsRes;
    const tasks = (tasksRes as any).data || tasksRes;

    return (projects || []).map((p: any, index: number) => {
      const projectTasks = (tasks || []).filter(
        (t: any) => t.project === p._id
      );

      const colors = ["#3b82f6", "#22c55e", "#eab308", "#a855f7", "#f97316"];
      const color = p.color || colors[index % colors.length];

      return {
        ...p,
        color,
        tasks: projectTasks,
      };
    });
  },

  getKpiProgress: () => apiRequest("/projects/kpi-progress"),
};

// Tasks API
export const tasksApi = {
  getAll: (filters?: { userId?: string; projectId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.projectId) params.append("projectId", filters.projectId);
    const query = params.toString();
    return apiRequest(`/tasks${query ? `?${query}` : ""}`);
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
    apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/tasks/${id}`, {
      method: "DELETE",
    }),
  addComment: (id: string, data: { text: string }) =>
    apiRequest(`/tasks/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiRequest("/users"),
  getEmployeeDropdown: () => apiRequest("/users/employee-dropdown"),
  getById: (id: string) => apiRequest(`/users/${id}`),
  getMyProfile: () => apiRequest("/users/me/profile"),
  update: (id: string, data: any) =>
    apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/users/${id}`, {
      method: "DELETE",
    }),
};

// Teams API
export const teamsApi = {
  getAll: () => apiRequest("/teams"),
  getByProject: (projectId: string) =>
    apiRequest(`/teams/project/${projectId}`),
  upsertForProject: (
    projectId: string,
    data: { name: string; memberIds: string[] }
  ) =>
    apiRequest(`/teams/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/teams/${id}`, {
      method: "DELETE",
    }),
};

// Goals API
export const goalsApi = {
  create: (payload: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    targetPoints?: number;
    priority?: number;
  }) =>
    apiRequest("/goals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getToday: () => apiRequest("/goals/today"),
  getCompleted: () => apiRequest("/goals/completed"),
  complete: (id: string) =>
    apiRequest(`/goals/${id}/complete`, {
      method: "PATCH",
    }),
};

// Chatbot API (used by ChatbotPage)
export const chatbotApi = {
  send: (messages: { role: string; content: string }[]) =>
    apiRequest("/chatbot", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }),
};

export default {
  authApi,
  dashboardApi,
  projectsApi,
  tasksApi,
  usersApi,
  teamsApi,
  goalsApi,
  chatbotApi,
};
