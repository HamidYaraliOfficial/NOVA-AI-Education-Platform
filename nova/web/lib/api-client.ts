const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("nova.accessToken");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" })
};

// Domain-specific convenience calls -----------------------------------------

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string }>("/auth/login", { email, password }),
  register: (payload: { fullName: string; email: string; password: string }) =>
    api.post("/auth/register", payload),
  me: () => api.get("/auth/me")
};

export const courseApi = {
  list: () => api.get("/courses"),
  get: (id: string) => api.get(`/courses/${id}`),
  updateProgress: (courseId: string, lessonId: string, positionSeconds: number) =>
    api.patch(`/courses/${courseId}/lessons/${lessonId}/progress`, { positionSeconds })
};

export const aiTutorApi = {
  ask: (courseId: string, lessonId: string | null, message: string) =>
    api.post<{ answer: string }>("/ai/tutor/ask", { courseId, lessonId, message }),
  generateFlashcards: (courseId: string, lessonId: string) =>
    api.post("/ai/tutor/flashcards", { courseId, lessonId }),
  generateQuiz: (courseId: string, lessonId: string, count: number) =>
    api.post("/ai/tutor/quiz", { courseId, lessonId, count })
};

export const codeExecApi = {
  run: (language: string, sourceCode: string, stdin?: string) =>
    api.post<{ stdout: string; stderr: string; exitCode: number; durationMs: number }>(
      "/code-execution/run",
      { language, sourceCode, stdin }
    )
};

export const studyPlannerApi = {
  getAvailability: () => api.get("/study-planner/availability"),
  saveAvailability: (windows: unknown[]) => api.post("/study-planner/availability", { windows }),
  nextSession: () =>
    api.get<{ isOpenNow: boolean; nextStartAt: string | null; nextEndAt: string | null }>(
      "/study-planner/next-session"
    )
};
