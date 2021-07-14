import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiGet, apiPost } from '../api';
import { DirectoryInfo } from '../directory/directory.service';

export interface DocumentInfo {
  id: string;
  creator_user_id: string;
  group_id: string;
  directory_id?: string;
  name: string;
  content: string;
  create_time: number;
  last_edit_time?: number;
  last_edit_user_id?: string;
}

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

  public async getDocumentInfo(documentID: string): Promise<DocumentInfo> {
    return await apiGet<DocumentInfo>(this.http, '/get_document_info', {
      document_id: documentID,
    });
  }

  public async getDocumentPath(documentID: string): Promise<DirectoryInfo[]> {
    return await apiGet<DirectoryInfo[]>(this.http, '/get_document_path', {
      document_id: documentID,
    });
  }
}
