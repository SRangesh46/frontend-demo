import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PostmethodService } from '../app-config/postmethod.service';
import { RequestModel } from '../models/RequestModel';
import { SessionKeys } from './../app-config/SessionKeys';
@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(private ws: PostmethodService) { }

  validateUser(request: any, iv: string) {
    return this.ws.wsPostNoToken(request, environment.commonServiceUrl + "login", iv);
  }

  getPermission(request: RequestModel, iv: string) {
    return this.ws.wsPost(request, environment.commonServiceUrl + "getuserpermission", iv);
  }


  getCartRelatedPackageTestDetails(request: RequestModel, iv: string) {
    return this.ws.wsPostNoToken(request, environment.CatalogueServiceUrl + "getCartRelatedPackageTestDetails", iv);
  }

  public debugLog(type: string, msg: string, data?: any): void {
    // tslint:disable-next-line: no-console
    console.debug(type, msg, data);
  }

  removeToken() {
    sessionStorage.removeItem(SessionKeys.autho_token);
    sessionStorage.removeItem(SessionKeys.userDetail);
    sessionStorage.removeItem(SessionKeys.USER);
    sessionStorage.removeItem(SessionKeys.Menu_Details);
  }
}
