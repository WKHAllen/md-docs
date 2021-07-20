import { Component } from '@angular/core';
import { LoginRegisterService } from './login-register.service';
import { inputAppearance } from '../constants';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'mdd-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public submittingRegistration: boolean = false;
  public registerSuccess: boolean = false;
  public errors: string[] = [];
  public hidePassword: boolean = true;
  public hideConfirmPassword: boolean = true;
  readonly inputAppearance = inputAppearance;

  constructor(private loginRegisterService: LoginRegisterService) {}

  public async onRegister(form: RegisterForm): Promise<void> {
    this.errors = [];

    if (form.username.length < 3 || form.username.length > 63) {
      this.errors.push('Username must be between 3 and 63 characters');
    }
    if (form.email.length < 5 || form.email.length > 63) {
      this.errors.push('Email must be between 5 and 63 characters');
    }
    if (form.password.length < 8 || form.password.length > 255) {
      this.errors.push('Password must be at least 8 characters');
    }
    if (form.password !== form.confirmPassword) {
      this.errors.push('Passwords do not match');
    }

    if (this.errors.length === 0) {
      this.submittingRegistration = true;

      try {
        await this.loginRegisterService.register(
          form.username,
          form.email,
          form.password
        );
        this.registerSuccess = true;
      } catch (err) {
        this.submittingRegistration = false;
        this.errors.push(err);
      }
    }
  }
}
