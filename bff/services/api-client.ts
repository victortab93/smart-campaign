import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export class ApiClient {
  private client: AxiosInstance
  private apiToken: string

  constructor(apiToken: string) {
    this.apiToken = apiToken
    this.client = axios.create({
      baseURL: process.env.API_BASE_URL || 'http://localhost:3002',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.client.interceptors.request.use((config) => {
      if (this.apiToken) {
        config.headers.Authorization = `Bearer ${this.apiToken}`
      }
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Client Error:', error.response?.data || error.message)
        throw error
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}
