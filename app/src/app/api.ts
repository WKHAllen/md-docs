import { HttpClient } from '@angular/common/http';

export const APIURL = '/api';

export interface StandardResponse<T = undefined> {
  res?: T;
  error?: string;
}

export async function apiGet<T>(
  http: HttpClient,
  url: string,
  params: any = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    http
      .get<StandardResponse<T>>(APIURL + url, {
        params,
        withCredentials: true,
      })
      .subscribe((res) => {
        if (!res.error) {
          resolve(res.res as T);
        } else {
          reject(res.error);
        }
      });
  });
}

export async function apiPost<T>(
  http: HttpClient,
  url: string,
  params: any = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    http
      .post<StandardResponse<T>>(APIURL + url, params, {
        withCredentials: true,
      })
      .subscribe((res) => {
        if (!res.error) {
          resolve(res.res as T);
        } else {
          reject(res.error);
        }
      });
  });
}
