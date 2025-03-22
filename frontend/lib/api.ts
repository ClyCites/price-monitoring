import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong. Please try again."

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    })
  },
)

export const api = {
  get: (url: string, params = {}) => axiosInstance.get(url, { params }),
  post: (url: string, data = {}) => axiosInstance.post(url, data),
  put: (url: string, data = {}) => axiosInstance.put(url, data),
  delete: (url: string) => axiosInstance.delete(url),

  // Auth token management
  setAuthToken: (token: string) => {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`
  },
  removeAuthToken: () => {
    delete axiosInstance.defaults.headers.common["Authorization"]
  },
}

