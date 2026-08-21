import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"

// 基础URL配置
const BASE_URL = "http://60.205.12.90:5012"
// const BASE_URL = "http://127.0.0.1:5012"
const LLM_BASE_URL = "http://127.0.0.1:6080"

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10秒超时
  headers: {
    "Content-Type": "application/json",
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误状态码
      console.error("API Error:", error.response.status, error.response.data)

      switch (error.response.status) {
        case 401:
          // 未授权，可以跳转到登录页
          console.error("未授权访问")
          break
        case 403:
          // 禁止访问
          console.error("禁止访问")
          break
        case 404:
          // 资源未找到
          console.error("资源未找到")
          break
        case 500:
          // 服务器内部错误
          console.error("服务器内部错误")
          break
        default:
          console.error("请求失败")
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error("网络错误，请检查网络连接")
    } else {
      // 其他错误
      console.error("请求配置错误:", error.message)
    }

    return Promise.reject(error)
  },
)

// 导出API实例和基础URL
export { apiClient, BASE_URL, LLM_BASE_URL }

// 导出便捷的请求方法
export const api = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.get(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.post(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.put(url, data, config),

  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.delete(url, config),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.patch(url, data, config),
}

export default api
