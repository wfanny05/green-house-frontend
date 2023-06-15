import httpRequest from './http-request'

const axiosInstance = httpRequest({
  // custom option
  baseURL: import.meta.env.VITE_BACKEND_URL
})

export default axiosInstance

