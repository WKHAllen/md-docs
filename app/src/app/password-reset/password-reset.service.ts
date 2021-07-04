import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiGet, apiPost } from '../api';

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  constructor(private http: HttpClient) {}

  public async requestPasswordReset(email: string): Promise<void> {
    await apiPost(this.http, '/request_password_reset', { email });
  }

  public async passwordResetExists(resetID: string): Promise<boolean> {
    return await apiGet<boolean>(this.http, '/password_reset_exists', {
      reset_id: resetID,
    });
  }

  public async resetPassword(
    resetID: string,
    newPassword: string
  ): Promise<void> {
    await apiPost(this.http, '/reset_password', {
      reset_id: resetID,
      new_password: newPassword,
    });
  }
}
