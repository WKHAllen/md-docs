import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiGet, apiPost } from '../api';
import { DirectoryInfo } from '../directory/directory.service';
import { GroupInfo } from '../group/group.service';
import { UserInfo } from '../profile/profile.service';

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

  public async createDocument(
    name: string,
    groupID: string,
    directoryID: string | null = null
  ): Promise<DocumentInfo> {
    return await apiPost<DocumentInfo>(this.http, '/create_document', {
      name,
      group_id: groupID,
      directory_id: directoryID,
    });
  }

  public async getDocumentInfo(documentID: string): Promise<DocumentInfo> {
    return await apiGet<DocumentInfo>(this.http, '/get_document_info', {
      document_id: documentID,
    });
  }

  public async renameDocument(
    documentID: string,
    newName: string
  ): Promise<DocumentInfo> {
    return await apiPost<DocumentInfo>(this.http, '/rename_document', {
      document_id: documentID,
      new_name: newName,
    });
  }

  public async getDocumentGroup(documentID: string): Promise<GroupInfo> {
    return await apiGet<GroupInfo>(this.http, '/get_document_group', {
      document_id: documentID,
    });
  }

  public async getDirectoryContainingDocument(
    documentID: string
  ): Promise<DirectoryInfo> {
    return await apiGet<DirectoryInfo>(
      this.http,
      '/get_directory_containing_document',
      { document_id: documentID }
    );
  }

  public async getDocumentEditRequests(
    documentID: string
  ): Promise<DocumentEditInfo[]> {
    return await apiGet<DocumentEditInfo[]>(
      this.http,
      '/get_document_edit_requests',
      { document_id: documentID }
    );
  }

  public async getDocumentPath(documentID: string): Promise<DirectoryInfo[]> {
    return await apiGet<DirectoryInfo[]>(this.http, '/get_document_path', {
      document_id: documentID,
    });
  }

  public async deleteDocument(documentID: string): Promise<void> {
    await apiPost(this.http, '/delete_document', { document_id: documentID });
  }

  public async requestDocumentEdit(
    documentID: string,
    newContent: string,
    description: string
  ): Promise<DocumentEditInfo> {
    return await apiPost<DocumentEditInfo>(
      this.http,
      '/request_document_edit',
      { document_id: documentID, new_content: newContent, description }
    );
  }

  public async getDocumentEdit(
    documentEditID: string
  ): Promise<DocumentEditInfo> {
    return await apiGet<DocumentEditInfo>(this.http, '/get_document_edit', {
      document_edit_id: documentEditID,
    });
  }

  public async getDocumentEditor(documentEditID: string): Promise<UserInfo> {
    return await apiGet<UserInfo>(this.http, '/get_document_editor', {
      document_edit_id: documentEditID,
    });
  }

  public async getDocumentEditGroup(
    documentEditID: string
  ): Promise<GroupInfo> {
    return await apiGet<GroupInfo>(this.http, '/get_document_edit_group', {
      document_edit_id: documentEditID,
    });
  }

  public async getDocumentEditDocument(
    documentEditID: string
  ): Promise<DocumentInfo> {
    return await apiGet<DocumentInfo>(
      this.http,
      '/get_document_edit_document',
      { document_edit_id: documentEditID }
    );
  }

  public async approveEdits(documentEditID: string): Promise<void> {
    await apiPost(this.http, '/approve_edits', {
      document_edit_id: documentEditID,
    });
  }

  public async denyEdits(documentEditID: string): Promise<void> {
    await apiPost(this.http, '/deny_edits', {
      document_edit_id: documentEditID,
    });
  }

  public async deleteDocumentEditRequest(
    documentEditID: string
  ): Promise<void> {
    await apiPost(this.http, '/delete_document_edit_request', {
      document_edit_id: documentEditID,
    });
  }
}
