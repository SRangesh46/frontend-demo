import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionKeys } from './SessionKeys';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { EncryptDecryptResponse } from '../models/response/EncryAndDecryResponse';
import { EncryptdecryptService } from '../../app/auth/encryptdecrypt.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class PostmethodService {
  public generateToken :any
  isLoading = new Subject<boolean>();
  encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  htheadeer: HttpHeaders = new HttpHeaders()

  constructor(private http: HttpClient,private encryptDecrypt: EncryptdecryptService,private _router: Router,private toastr: ToastrService,) { }

  // public wsPost(RequestModel: any, url: string, iv: string): Observable<any> {
  //   let headers = new HttpHeaders({
  //     'Content-Type': 'application/json; charset=utf-8',
  //     'Authorization': "Bearer " + JSON.parse(sessionStorage.getItem(SessionKeys.autho_token) || '{}'),
  //     'ClientSecret': iv
  //   });
  //   return this.http.post(url, RequestModel, { headers: headers, observe: 'response' }).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  public wsPost(RequestModel: any, url: string, iv: string): Observable<any> {
    const dataEnc = JSON.parse(localStorage.getItem(SessionKeys.userDetail) as string)
    const dataDecrypted = this.encryptDecrypt.passwordDecryption(dataEnc)
  
    let headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': "Bearer " + dataDecrypted.data.TOKEN,
      'ClientSecret': iv
    });
    return this.http.post(url, RequestModel, { headers: headers, observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  public wsPostNoToken(RequestModel: any, url: string, iv: string) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'ClientSecret': iv
    });
    return this.http.post(url, RequestModel, { headers: headers, observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  public wsGet(url: string): Observable<any> {
    let headerss = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      // 'Authorization': "Bearer " + JSON.parse(sessionStorage.getItem(SessionKeys.autho_token) || '{}'),
    });
    return this.http.get(url, { headers: headerss,observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  public wsPostStaticToken(RequestModel: any, url: string, iv: string): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIweDAyMDAwMDAwRjU2QkRGOTA3Qjg2NUMxRjhEQTk2NTdCQjNENTUxQ0VGNTYyRTk2RDNCMTFCQzgzM0Y1MkFDRDg0NEY3RTVEMiIsImF1dGgiOiIweDAyMDAwMDAwRjdEODc3NkY2MEFGOTZGNzZENDlBNDJBQkQ2MDJENDE5MTU2QzlDQUFDMjExOEJCMDM0RjFGN0QzNzQ4Q0JERSIsImlhdCI6MTY5MDk2MzUxNSwiZXhwIjoxNjkwOTYzNTE1fQ.3qgjQsfLKLlte5CJ_pW0S3_W8fj0kceJyEi-RGQlyh0",
      'ClientSecret': iv
    });
    return this.http.post(url, RequestModel, { headers: headers, observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  public wsGetStaticToken(url: string): Observable<any> {    
    let headerss = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIweDAyMDAwMDAwRjU2QkRGOTA3Qjg2NUMxRjhEQTk2NTdCQjNENTUxQ0VGNTYyRTk2RDNCMTFCQzgzM0Y1MkFDRDg0NEY3RTVEMiIsImF1dGgiOiIweDAyMDAwMDAwRjdEODc3NkY2MEFGOTZGNzZENDlBNDJBQkQ2MDJENDE5MTU2QzlDQUFDMjExOEJCMDM0RjFGN0QzNzQ4Q0JERSIsImlhdCI6MTY5MDk2MzUxNSwiZXhwIjoxNjkwOTYzNTE1fQ.3qgjQsfLKLlte5CJ_pW0S3_W8fj0kceJyEi-RGQlyh0",
      'ClientSecret':''
    });
    return this.http.get(url, { headers: headerss,observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  public wsGetToken(url: string): Observable<any> {
    const dataEnc = JSON.parse(localStorage.getItem(SessionKeys.userDetail) as string)      
    const dataDecrypted = this.encryptDecrypt.passwordDecryption(dataEnc)

    let headerss = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': "Bearer " + dataDecrypted.data.TOKEN,
      'ClientSecret':''
    });
    return this.http.get(url, { headers: headerss,observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }


  handleError(Error :any) {
    let errorMessage = '';
    if(Error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = Error.error.message;

    } else {
      // Get server-side error
      errorMessage = `Error Code: ${Error.status}\nMessage: ${Error.message}`;

      if(Error.error === 'Token Expired' || Error.error === 'Invalid Token'){
      localStorage.clear();
      sessionStorage.clear();
      //window.location.reload();
      }
    }
    return throwError(errorMessage);
 }


 show() {
     this.isLoading.next(true);
 }

 hide() {
     this.isLoading.next(false);
 }


}
