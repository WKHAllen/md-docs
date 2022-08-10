import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { apiPost } from '../api';

@Injectable({
  providedIn: 'root',
})
export class LoginRegisterService {
  public loggedInChange = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  public async register(
    username: string,
    email: string,
    password: string
  ): Promise<void> {
    await apiPost(this.http, '/register', { username, email, password });
  }

  public async login(email: string, password: string): Promise<void> {
    await apiPost(this.http, '/login', { email, password });
    this.setLoggedIn(true);
  }

  public async logout(): Promise<void> {
    await apiPost(this.http, '/logout');
    this.setLoggedIn(false);
  }

  public async logoutEverywhere(): Promise<void> {
    await apiPost(this.http, '/logout_everywhere');
    this.setLoggedIn(false);
  }

  public loggedIn(): boolean {
    return !!this.getCookie('sessionID');
  }

  private setLoggedIn(loggedIn: boolean): void {
    this.loggedInChange.next(loggedIn);
  }

  private getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    const cookieName = `${name}=`;

    for (const cookie of cookies) {
      const c = cookie.replace(/^\s+/g, '');

      if (c.indexOf(cookieName) === 0) {
        return c.substring(cookieName.length, c.length);
      }
    }

    return null;
  }
}
