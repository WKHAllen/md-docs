import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiPost } from '../api';

@Injectable({
  providedIn: 'root',
})
export class VerifyService {
  constructor(private http: HttpClient) {}

  public async verifyAccount(verifyID: string): Promise<void> {
    await apiPost(this.http, '/verify_account', { verify_id: verifyID });
  }
}
