import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiGet } from '../api';

export interface OtherUserInfo {
  id: string;
  username: string;
  image_id: string;
  join_time: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  public async getSpecificUserInfo(userID: number): Promise<OtherUserInfo> {
    return await apiGet<OtherUserInfo>(this.http, '/get_specific_user_info', {
      user_id: userID,
    });
  }
}
