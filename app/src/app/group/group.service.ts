import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiGet, apiPost } from '../api';

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
}
