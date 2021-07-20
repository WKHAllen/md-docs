import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PasswordResetService } from './password-reset.service';
import { inputAppearance } from '../constants';

interface RequestPasswordResetForm {
  email: string;
}

interface PasswordResetForm {
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'mdd-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit {
  public submittingForm: boolean = false;
  public requestSuccess: boolean = false;
  public resetSuccess: boolean = false;
  public resetID: string = '';
  public checkingResetID: boolean = false;
  public validResetID: boolean = true;
  public error: string = '';
  public hidePassword: boolean = true;
  public hideConfirmPassword: boolean = true;
  readonly inputAppearance = inputAppearance;

  constructor(
    private passwordResetService: PasswordResetService,
    private activatedRoute: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      const resetID = paramMap.get('resetID');

      if (resetID !== null) {
        this.checkingResetID = true;

        try {
          const exists = await this.passwordResetService.passwordResetExists(
            resetID
          );

          this.resetID = resetID;
          this.validResetID = exists;
          this.checkingResetID = false;
        } catch (err) {
          this.error = err;
        }
      }
    });
  }

  public async onRequestPasswordReset(
    form: RequestPasswordResetForm
  ): Promise<void> {
    this.error = '';

    if (form.email.length < 5 || form.email.length > 63) {
      this.error = 'Email must be between 5 and 63 characters';
    }

    if (!this.error) {
      this.submittingForm = true;

      try {
        await this.passwordResetService.requestPasswordReset(form.email);
        this.requestSuccess = true;
      } catch (err) {
        this.submittingForm = false;
        this.error = err;
      }
    }
  }

  public async onPasswordReset(form: PasswordResetForm): Promise<void> {
    this.error = '';

    if (form.password.length < 8 || form.password.length > 255) {
      this.error = 'New password must be at least 8 characters';
    }
    if (form.password !== form.confirmPassword) {
      this.error = 'New passwords do not match';
    }

    if (!this.error) {
      this.submittingForm = true;

      try {
        await this.passwordResetService.resetPassword(
          this.resetID,
          form.password
        );
        this.resetSuccess = true;
      } catch (err) {
        this.submittingForm = false;
        this.error = err;
      }
    }
  }
}
