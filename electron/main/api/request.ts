import { ipcMain } from 'electron';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RequestConfig, CacheItem, ApiResponse } from '../modules/types';

/**
 * 请求缓存管理器
 * 管理API请求的缓存，避免重复请求
 */
class RequestCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly cacheDuration: number;

  constructor(cacheDuration = 60 * 1000) {
    this.cacheDuration = cacheDuration;
  }

  /**
   * 获取缓存项
   */
  get<T>(key: string): T | null {
    if (!this.cache.has(key)) return null;

    const { response, timestamp } = this.cache.get(key) as CacheItem<T>;
    // 检查缓存是否过期
    if (Date.now() - timestamp < this.cacheDuration) {
      return response;
    }

    // 缓存过期，删除
    this.delete(key);
    return null;
  }

  /**
   * 设置缓存项
   */
  set<T>(key: string, response: T): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });
  }

  /**
   * 删除缓存项
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, { timestamp }] of this.cache.entries()) {
      if (now - timestamp > this.cacheDuration) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * 创建请求处理
 * 设置IPC通信来处理API请求
 */
export default function createRequest(): void {
  // 创建请求缓存，1分钟过期
  const requestCache = new RequestCache(60 * 1000);

  // 创建axios实例，应用全局配置
  const axiosInstance = createAxiosInstance();

  // 处理API请求
  ipcMain.handle(
    'request',
    async (_, args: RequestConfig): Promise<ApiResponse> => {
      const { path, data, method = 'get', useCache = true } = args;

      // 生成缓存键
      const cacheKey = useCache
        ? `${method}:${path}:${JSON.stringify(data)}`
        : '';

      // 检查缓存
      if (cacheKey && useCache) {
        const cachedResponse = requestCache.get(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      try {
        // 发送请求
        const response = await sendRequest(axiosInstance, method, path, data);

        // 缓存响应
        if (cacheKey && useCache) {
          requestCache.set(cacheKey, response);
        }

        return response;
      } catch (error) {
        console.error(`API请求错误 (${path}):`, error);
        return formatError(error);
      }
    },
  );

  // 清除请求缓存
  ipcMain.handle('clear-request-cache', (): { success: boolean } => {
    requestCache.clear();
    return { success: true };
  });

  // 定期清理过期缓存 (每5分钟)
  setInterval(
    () => {
      requestCache.cleanup();
    },
    5 * 60 * 1000,
  );
}

/**
 * 创建Axios实例
 */
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    timeout: 10000, // 10秒超时
    headers: {
      'X-Client-Type': 'electron-app',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 可以添加认证token等
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('请求超时:', error.config?.url);
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

/**
 * 发送API请求
 */
async function sendRequest(
  axiosInstance: AxiosInstance,
  method: string,
  path: string,
  data?: any,
): Promise<any> {
  const baseURL = `http://localhost:${process.env.PORT || 3000}`;
  const url = `${baseURL}${path}`;

  switch (method.toLowerCase()) {
    case 'get':
      return (await axiosInstance.get(url, { params: data })).data;
    case 'post':
      return (await axiosInstance.post(url, data)).data;
    case 'put':
      return (await axiosInstance.put(url, data)).data;
    case 'delete':
      return (await axiosInstance.delete(url, { params: data })).data;
    default:
      throw new Error(`不支持的请求方法: ${method}`);
  }
}

/**
 * 格式化错误响应
 */
function formatError(error: any): ApiResponse {
  return {
    error: true,
    message: error instanceof Error ? error.message : String(error),
    status: error?.response?.status || 500,
  };
}
