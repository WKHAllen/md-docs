import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiGet, apiPost } from '../api';
import { OtherUserInfo } from '../user/user.service';
import { DocumentInfo, DocumentEditInfo } from '../document/document.service';
import { DirectoryInfo } from '../directory/directory.service';

export enum PermissionType {
  Anyone = 'ANYONE',
  ThoseWithAccess = 'THOSE_WITH_ACCESS',
  OwnerOnly = 'OWNER_ONLY',
}

export interface GroupInfo {
  id: string;
  creator_user_id?: string;
  owner_user_id: string;
  name: string;
  description: string;
  details_visible: boolean;
  searchable: boolean;
  edit_documents_permission_id: PermissionType;
  approve_edits_permission_id: PermissionType;
  image_id?: string;
  create_time: number;
}

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor(private http: HttpClient) {}

  public async createGroup(
    name: string,
    description: string = ''
  ): Promise<GroupInfo> {
    return await apiPost<GroupInfo>(this.http, '/create_group', {
      name,
      description,
    });
  }

  public async getGroupInfo(groupID: string): Promise<GroupInfo> {
    return await apiGet<GroupInfo>(this.http, '/get_group_info', {
      group_id: groupID,
    });
  }

  public async getGroupCreator(groupID: string): Promise<OtherUserInfo | null> {
    return await apiGet<OtherUserInfo | null>(this.http, 'get_group_creator', {
      group_id: groupID,
    });
  }

  public async getGroupOwner(groupID: string): Promise<OtherUserInfo> {
    return await apiGet<OtherUserInfo>(this.http, 'get_group_owner', {
      group_id: groupID,
    });
  }

  public async setGroupName(groupID: string, newName: string): Promise<void> {
    await apiPost(this.http, '/set_group_name', {
      group_id: groupID,
      new_name: newName,
    });
  }

  public async setGroupDescription(
    groupID: string,
    newDescription: string
  ): Promise<void> {
    await apiPost(this.http, '/set_group_description', {
      group_id: groupID,
      new_description: newDescription,
    });
  }

  public async passGroupOwnership(
    groupID: string,
    newOwnerID: string
  ): Promise<void> {
    await apiPost(this.http, '/pass_group_ownership', {
      group_id: groupID,
      new_owner_id: newOwnerID,
    });
  }

  public async setDetailsVisible(
    groupID: string,
    detailsVisible: boolean
  ): Promise<void> {
    await apiPost(this.http, '/set_details_visible', {
      group_id: groupID,
      details_visible: detailsVisible,
    });
  }

  public async setSearchable(
    groupID: string,
    searchable: boolean
  ): Promise<void> {
    await apiPost(this.http, '/set_searchable', {
      group_id: groupID,
      searchable,
    });
  }

  public async setEditPermissions(
    groupID: string,
    permissions: PermissionType
  ): Promise<void> {
    await apiPost(this.http, '/set_edit_permissions', {
      group_id: groupID,
      permissions,
    });
  }

  public async setApproveEditsPermissions(
    groupID: string,
    permissions: PermissionType
  ): Promise<void> {
    await apiPost(this.http, '/set_approve_edits_permissions', {
      group_id: groupID,
      permissions,
    });
  }

  public async grantGroupAccess(
    groupID: string,
    userID: string
  ): Promise<void> {
    await apiPost(this.http, '/grant_group_access', {
      group_id: groupID,
      user_id: userID,
    });
  }

  public async revokeGroupAccess(
    groupID: string,
    userID: string
  ): Promise<void> {
    await apiPost(this.http, '/revoke_group_access', {
      group_id: groupID,
      user_id: userID,
    });
  }

  public async hasGroupAccess(groupID: string): Promise<boolean> {
    return await apiGet<boolean>(this.http, '/has_group_access', {
      group_id: groupID,
    });
  }

  public async getUsersWithAccess(groupID: string): Promise<OtherUserInfo[]> {
    return await apiGet<OtherUserInfo[]>(this.http, '/get_users_with_access', {
      group_id: groupID,
    });
  }

  public async getGroupDocumentEditRequests(
    groupID: string
  ): Promise<DocumentEditInfo[]> {
    return await apiGet<DocumentEditInfo[]>(
      this.http,
      '/get_group_document_edit_requests',
      { group_id: groupID }
    );
  }

  public async getGroupDocumentEditRequestDocuments(
    groupID: string
  ): Promise<DocumentInfo[]> {
    return await apiGet<DocumentInfo[]>(
      this.http,
      '/get_group_document_edit_request_documents',
      { group_id: groupID }
    );
  }

  public async getRootDirectories(groupID: string): Promise<DirectoryInfo[]> {
    return await apiGet<DirectoryInfo[]>(this.http, '/get_root_directories', {
      group_id: groupID,
    });
  }

  public async getRootDocuments(groupID: string): Promise<DocumentInfo[]> {
    return await apiGet<DocumentInfo[]>(this.http, '/get_root_documents', {
      group_id: groupID,
    });
  }

  public async canViewGroupDetails(groupID: string): Promise<boolean> {
    return await apiGet<boolean>(this.http, '/can_view_group_details', {
      group_id: groupID,
    });
  }

  public async canEditGroupDocuments(groupID: string): Promise<boolean> {
    return await apiGet<boolean>(this.http, '/can_edit_group_documents', {
      group_id: groupID,
    });
  }

  public async canApproveGroupDocumentEdits(groupID: string): Promise<boolean> {
    return await apiGet<boolean>(
      this.http,
      '/can_approve_group_document_edits',
      { group_id: groupID }
    );
  }
}
