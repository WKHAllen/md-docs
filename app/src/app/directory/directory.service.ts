import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiGet, apiPost } from '../api';

export interface DirectoryInfo {
  id: string;
  name: string;
  group_id: string;
  parent_directory_id?: string;
  depth: number;
  create_time: number;
}

@Injectable({
  providedIn: 'root',
})
export class DirectoryService {
  constructor(private http: HttpClient) {}
}
