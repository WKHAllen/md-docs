import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GroupInfo } from '../group/group.service';
import { DocumentEditInfo } from '../document/document.service';
import { apiGet, apiPost } from '../api';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  image_id: string;
  join_time: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  public async getUserInfo(): Promise<UserInfo> {
    return await apiGet<UserInfo>(this.http, '/get_user_info');
  }

  public async setUsername(newUsername: string): Promise<void> {
    await apiPost(this.http, '/set_username', { new_username: newUsername });
  }

  public async setPassword(newPassword: string): Promise<void> {
    await apiPost(this.http, '/set_password', { new_password: newPassword });
  }

  public async setUserImage(imageData: string): Promise<void> {
    await apiPost(this.http, '/set_user_image', {
      image_data: imageData,
    });
  }

  public async deleteUserImage(): Promise<void> {
    await apiPost(this.http, '/delete_user_image');
  }

  public async getGroupsOwned(): Promise<GroupInfo[]> {
    return await apiGet<GroupInfo[]>(this.http, '/get_user_groups_owned');
  }

  public async getGroupsWithAccess(): Promise<GroupInfo[]> {
    return await apiGet<GroupInfo[]>(this.http, '/get_user_groups_with_access');
  }

  public async getDocumentEditRequests(): Promise<DocumentEditInfo[]> {
    return await apiGet<DocumentEditInfo[]>(
      this.http,
      '/get_user_document_edit_requests'
    );
  }

  public async favoriteUser(favoriteUserID: string): Promise<void> {
    await apiPost(this.http, '/favorite_user', {
      favorite_user_id: favoriteUserID,
    });
  }

  public async unfavoriteUser(favoriteUserID: string): Promise<void> {
    await apiPost(this.http, '/unfavorite_user', {
      favorite_user_id: favoriteUserID,
    });
  }

  public async favoriteUserByUsername(
    favoriteUserUsername: string
  ): Promise<void> {
    await apiPost(this.http, '/favorite_user_by_username', {
      favorite_user_username: favoriteUserUsername,
    });
  }

  public async unfavoriteUserByUsername(
    favoriteUserUsername: string
  ): Promise<void> {
    await apiPost(this.http, '/unfavorite_user_by_username', {
      favorite_user_username: favoriteUserUsername,
    });
  }

  public async userIsFavorite(favoriteUserID: string): Promise<boolean> {
    return await apiGet<boolean>(this.http, '/user_is_favorite', {
      favorite_user_id: favoriteUserID,
    });
  }

  public async getFavoriteUsers(): Promise<UserInfo[]> {
    return await apiGet<UserInfo[]>(this.http, '/get_favorite_users');
  }

  public async favoriteGroup(favoriteGroupID: string): Promise<void> {
    await apiPost(this.http, '/favorite_group', {
      favorite_group_id: favoriteGroupID,
    });
  }

  public async unfavoriteGroup(favoriteGroupID: string): Promise<void> {
    await apiPost(this.http, '/unfavorite_group', {
      favorite_group_id: favoriteGroupID,
    });
  }

  public async groupIsFavorite(favoriteGroupID: string): Promise<boolean> {
    return await apiGet<boolean>(this.http, '/group_is_favorite', {
      favorite_group_id: favoriteGroupID,
    });
  }

  public async getFavoriteGroups(): Promise<GroupInfo[]> {
    return await apiGet<GroupInfo[]>(this.http, '/get_favorite_groups');
  }
}
