const API_URL = import.meta.env.VITE_API_URL;

export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

// Helper function to make API requests with authentication
// waits for the response and returns the data or throws an error if the request fails
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

//sends a POST request to the /register/ endpoint with the user registration data
export function registerUser(payload) {
  return request("/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  const data = await request("/token/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(data.access);
  return data;
}

export function fetchTasks() {
  return request("/tasks/");
}

export function createTask(payload) {
  return request("/tasks/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTask(taskId, payload) {
  return request(`/tasks/${taskId}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}/`, {
    method: "DELETE",
  });
}

export function logout() {
  setToken(null);
}