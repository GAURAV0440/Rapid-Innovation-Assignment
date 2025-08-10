import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

function getToken() {
  try {
    return localStorage.getItem("ace_token");
  } catch {
    return null;
  }
}
function clearAuthAndRedirect() {
  try {
    localStorage.removeItem("ace_token");
    localStorage.removeItem("ace_role");
  } catch {}
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default api;
