/**
 * 服务器处理程序类型
 * 用于停止已经启动的服务器
 */
export type ServerStopHandler = () => Promise<void>;

/**
 * 窗口配置类型
 */
export interface WindowConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  showOnReady?: boolean;
  devTools?: boolean;
  resizable?: boolean;
  title?: string;
}

/**
 * 托盘菜单项类型
 */
export interface TrayMenuItem {
  label: string;
  click: () => void;
}

/**
 * 应用程序信息类型
 */
export interface AppInfo {
  appVersion: string;
  platform: NodeJS.Platform;
  isProduction: boolean;
  appName: string;
}

/**
 * 请求配置类型
 */
export interface RequestConfig {
  path: string;
  data?: any;
  method?: 'get' | 'post' | 'put' | 'delete';
  useCache?: boolean;
}

/**
 * 缓存项类型
 */
export interface CacheItem<T> {
  response: T;
  timestamp: number;
}

/**
 * API响应类型
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: boolean;
  message?: string;
  status?: number;
}
