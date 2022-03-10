import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CustomEncoder } from '../shared/custom-encoder';
import { IAddress } from '../shared/models/address';
import { ForgotPasswordDto } from '../shared/models/ForgotPasswordDto';
import { ResetPasswordDto } from '../shared/models/ResetPasswordDto';
import { IUser } from '../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<IUser>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  loadCurrentUser(token: string) {
    if (token === null) {
      this.currentUserSource.next(null);
      return of(null);
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http.get(this.baseUrl + 'account', {headers}).pipe(
      map((user: IUser) => {
        if (user) {
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      })
    )
  }

  login(values: any) {
    return this.http.post(this.baseUrl + 'account/login', values).pipe(
      map((user: IUser) => {
        if (user) {
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      })
    )
  }

  register(values: any) {
    return this.http.post(this.baseUrl + 'account/register', values).pipe(
      map((user: IUser) => {
        if (user) {
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      })
    )
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSource.next(null);
    this.router.navigateByUrl('/');
  }

  checkEmailExists(email: string) {
    return this.http.get(this.baseUrl + 'account/emailexists?email=' + email);
  }

  getUserAddress() {
    return this.http.get<IAddress>(this.baseUrl + 'account/address');
  }

  updateUserAddress(address: IAddress) {
    return this.http.put<IAddress>(this.baseUrl + 'account/address', address);
  }
  public forgotPassword = (route: string, body: ForgotPasswordDto) => {
    return this.http.post(this.baseUrl+'Account/ForgotPassword', body);
  }

  public resetPassword = (route: string, body: ResetPasswordDto) => {
    return this.http.post(this.baseUrl+'account/ResetPassword', body);
  }
  public validateConfirmPassword = (passwordControl: AbstractControl): ValidatorFn => {
    return (confirmationControl: AbstractControl) : { [key: string]: boolean } | null => {

      const confirmValue = confirmationControl.value;
      const passwordValue = passwordControl.value;

      if (confirmValue === '') {
          return;
      }

      if (confirmValue !== passwordValue) {
          return  { mustMatch: true }
      } 

      return null;
    };
  }
  public confirmEmail = (route: string, token: string, email: string) => {
    let params = new HttpParams({ encoder: new CustomEncoder() })
    params = params.append('token', token);
    params = params.append('email', email);
    //return this.http.post(this.baseUrl+"account/EmailConfirmation",{email,token},{responseType : 'text'});
    //return this._http.get(this.createCompleteRoute(route, this.baseUrl), { params: params });
    return this.http.get(this.baseUrl+'Account/EmailConfirmation', { params: params });
  }
}