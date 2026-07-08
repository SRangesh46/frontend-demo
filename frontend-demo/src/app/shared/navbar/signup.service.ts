import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private data = new BehaviorSubject<string>('');
  currentData: any = this.data.asObservable();
  changeData(newData: string) {
    this.data.next(newData);
  }
  constructor(private ws: PostmethodService) { }

  //Mobile number hit the OTP Verify API
  continueSendOTP(request: RequestModel, iv: string) {
    return this.ws.wsPostNoToken(request, environment.commonServiceUrl + "loginWithOTPGenerate", iv);
  }

  VerifyOTPLogin(request: RequestModel, iv: string) {
    return this.ws.wsPostNoToken(request, environment.commonServiceUrl + "loginOtpVerify", iv);
  }

  signup(request: RequestModel, iv: string) {
    return this.ws.wsPostNoToken(request, environment.commonServiceUrl + "catalogueRegUserWithGenOtp", iv);
  }

  async getGenderMaster() {
    return this.ws.wsGet(environment.masterServiceUrl + "getCatalogGenderMaster").toPromise();
  }

  async getUserTypeMaster() {
    return this.ws.wsGet(environment.masterServiceUrl + "getUserTypeMaster").toPromise();
  }

  getCountryCode() {
    return this.ws.wsGet( environment.masterServiceUrl + "getCatalogCountryMaster", );
  }

  //Allow only Numberic values
  allowNumbersOnly(event: any) {
    let inp = String.fromCharCode(event.keyCode);
    if (/[\d]/.test(inp) || event.keyCode === 13) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
}