import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiGet, apiPost } from '../api';

export interface DocumentEditInfo {
  id: string;
  document_id: string;
  editor_user_id: string;
  description: string;
  new_content: string;
  edit_request_time: number;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private http: HttpClient) {}
}
