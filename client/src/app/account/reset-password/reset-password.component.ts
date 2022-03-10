import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PasswordConfirmationValidatorService } from 'src/app/password-confirmation-validator.service';
import { ResetPasswordDto } from 'src/app/shared/models/ResetPasswordDto';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  public resetPasswordForm: FormGroup;
  public showSuccess: boolean;
  public showError: boolean;
  public errorMessage: string;
  private _token: string;
  private _email: string;

  constructor(private _authService: AccountService, private _passConfValidator: PasswordConfirmationValidatorService, 
    private _route: ActivatedRoute) { }
    ngOnInit(): void {
      this.resetPasswordForm = new FormGroup({
        password: new FormControl('', [Validators.required]),
        confirm: new FormControl('')
      });
      this.resetPasswordForm.get('confirm').setValidators([Validators.required,
        this._passConfValidator.validateConfirmPassword(this.resetPasswordForm.get('password'))]);
      
        this._token = this._route.snapshot.queryParams['token'];
        this._email = this._route.snapshot.queryParams['email'];
    }
  
    public validateControl = (controlName: string) => {
      return this.resetPasswordForm.controls[controlName].invalid && this.resetPasswordForm.controls[controlName].touched
    }
  
    public hasError = (controlName: string, errorName: string) => {
      return this.resetPasswordForm.controls[controlName].hasError(errorName)
    }
  
    public resetPassword = (resetPasswordFormValue) => {
      this.showError = this.showSuccess = false;
      const resetPass = { ... resetPasswordFormValue };
      const resetPassDto: ResetPasswordDto = {
        password: resetPass.password,
        confirmPassword: resetPass.confirm,
        token: this._token,
        email: this._email
      }
  
      this._authService.resetPassword('api/accounts/resetpassword', resetPassDto)
      .subscribe(_ => {
        this.showSuccess = true;
      },
      error => {
        this.showError = true;
        this.errorMessage = error;
      })
    }

}
