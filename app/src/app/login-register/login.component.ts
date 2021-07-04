import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginRegisterService } from './login-register.service';
import { inputAppearance } from '../constants';

interface LoginForm {
  email: string;
  password: string;
}

@Component({
  selector: 'gp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public submittingLogin: boolean = false;
  public error: string = '';
  public after: string = '';
  readonly inputAppearance = inputAppearance;

  constructor(
    private loginRegisterService: LoginRegisterService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      this.after = queryParams.get('after') || '';
    });
  }

  public async onLogin(form: LoginForm) {
    this.error = '';
    this.submittingLogin = true;

    try {
      await this.loginRegisterService.login(form.email, form.password);
      await this.router.navigate([this.after || '/']);
    } catch (err) {
      this.submittingLogin = false;
      this.error = err;
    }
  }
}
