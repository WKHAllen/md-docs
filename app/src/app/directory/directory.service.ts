import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiGet, apiPost } from '../api';
import { DocumentInfo } from '../document/document.service';
import { GroupInfo } from '../group/group.service';

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

  public async createDirectory(
    name: string,
    groupID: string,
    directoryID?: string
  ): Promise<DirectoryInfo> {
    return await apiPost<DirectoryInfo>(this.http, '/create_directory', {
      name,
      group_id: groupID,
      directory_id: directoryID,
    });
  }

  public async getDirectoryInfo(directoryID: string): Promise<DirectoryInfo> {
    return await apiGet<DirectoryInfo>(this.http, '/get_directory_info', {
      directory_id: directoryID,
    });
  }

  public async renameDirectory(
    directoryID: string,
    newName: string
  ): Promise<DirectoryInfo> {
    return await apiPost<DirectoryInfo>(this.http, '/rename_directory', {
      directory_id: directoryID,
      new_name: newName,
    });
  }

  public async getDirectoryGroup(directoryID: string): Promise<GroupInfo> {
    return await apiGet<GroupInfo>(this.http, '/get_directory_group', {
      directory_id: directoryID,
    });
  }

  public async getParentDirectory(
    directoryID: string
  ): Promise<DirectoryInfo | null> {
    return await apiGet<DirectoryInfo | null>(
      this.http,
      '/get_parent_directory',
      {
        directory_id: directoryID,
      }
    );
  }

  public async getSubdirectories(
    directoryID: string
  ): Promise<DirectoryInfo[]> {
    return await apiGet<DirectoryInfo[]>(this.http, '/get_subdirectories', {
      directory_id: directoryID,
    });
  }

  public async getDocumentsWithinDirectory(
    directoryID: string
  ): Promise<DocumentInfo[]> {
    return await apiGet<DocumentInfo[]>(
      this.http,
      '/get_documents_within_directory',
      { directory_id: directoryID }
    );
  }

  public async getDirectoryPath(directoryID: string): Promise<DirectoryInfo[]> {
    return await apiGet<DirectoryInfo[]>(this.http, '/get_directory_path', {
      directory_id: directoryID,
    });
  }

  public async deleteDirectory(directoryID: string): Promise<void> {
    await apiPost(this.http, '/delete_directory', {
      directory_id: directoryID,
    });
  }
}
