import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

interface Body<T> {
  code: number;
  data: T;
  msg?: string;
}

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

http.interceptors.response.use(
  (response: AxiosResponse<Body<unknown>>) => {
    const data = response.data;
    if (data.code === 200) {
      // 运行时交出去的是这份业务 JSON。axios 的类型仍写成原始响应，所以这里做一次断言。
      return data as unknown as AxiosResponse<Body<unknown>>;
    }
    return Promise.reject(data);
  },
  (error) => Promise.reject(error),
);

/**
 * 拦截器在 code === 200 时返回业务 JSON，否则 reject。
 * 页面拿到的不是带 status、headers 的原始 HTTP 响应。
 * T 是业务数据的形状，这里把 JSON 里的 data 交出去。
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const body = (await http.request(config)) as unknown as Body<T>;
  return body.data;
}
