import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRegisterService } from './login-register.service';

@Component({
  selector: 'gp-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  public error: string = '';

  constructor(
    private loginRegisterService: LoginRegisterService,
    private router: Router
  ) {}

  public async ngOnInit() {
    try {
      await this.loginRegisterService.logout();
      await this.router.navigate(['/']);
    } catch (err) {
      this.error = err;
    }
  }
}
