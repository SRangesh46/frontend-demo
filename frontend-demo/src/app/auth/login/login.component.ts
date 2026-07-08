import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { EncryptdecryptService } from '../encryptdecrypt.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotifyService } from '../../shared/notify/notify.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { SessionKeys } from 'src/app/app-config/SessionKeys';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  request: RequestModel;
  responseModel: ResponseModel;
  encrydecryresponse: EncryptDecryptResponse;
  requestModel: RequestModel = new RequestModel();
  public landingMenu: any = [];
  public inputType: string = 'password'
  public filterMenu: any
  public routine: any
  public user: {
    loginUser: string;
    password: string;
    loginType: string;
    loginMode: string;
    langId: string;
  };
  public isSubmitted: boolean = false;

  constructor(
    private UserServices: AuthService,
    private router: Router,
    private EncryptDecrypt: EncryptdecryptService,
    private notify: NotifyService,
    private toastr: ToastrService,
    private encryptDecrypt: EncryptdecryptService,
  ) { }

  ngOnInit(): void {
    let Hour = new Date().getHours() % 24;
    if (Hour < 12) {
      this.routine = 'Good Morning';
    }
    else if (Hour >= 12 && Hour < 17) {
      this.routine = 'Good Afternoon';
    }
    else if (Hour >= 17 && Hour <= 24) {
      this.routine = 'Good Evening';
    }

    this.user = {
      loginUser: null || "",
      password: null || "",
      loginType: 'Password',
      loginMode: '4',
      langId: '1',
    };


    let encstring = "AVa/IqIqwV8Ce4o42aO5Hw=="

    let clientsecret = "8578336bfb7b6a7eed70addfa9dd0bfe"
    let encrydecryresponsess = new EncryptDecryptResponse()
    encrydecryresponsess = this.EncryptDecrypt.decryption(encstring, clientsecret)
    console.log(encrydecryresponsess)


  }





  loginForm: any = new FormGroup({
    loginUser: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(''),
  });

  get f() {
    return this.loginForm.controls;
  }

  public login() {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      this.toastr.error('Invalid User name or Password')
      this.UserServices.debugLog('Login', 'Wrong User Name or Password', new Date())
    } else {

      this.encrydecryresponse = new EncryptDecryptResponse()
      this.encrydecryresponse = this.EncryptDecrypt.encryption(this.user)

      this.request = new RequestModel();
      this.request.payload = this.encrydecryresponse.data;
      console.log(this.encrydecryresponse)
      console.log(this.request)
      console.log(this.encrydecryresponse.iv)

      this.UserServices.validateUser(this.request, this.encrydecryresponse.iv).subscribe((response: any) => {

        this.responseModel = new ResponseModel()
        let clientSecret = response.headers.get('clientsecret')
        this.responseModel = response.body
        this.encrydecryresponse = this.EncryptDecrypt.decryption(this.responseModel.responseData, clientSecret);

        this.responseModel.responseObject = this.encrydecryresponse.data.responseObject.object
        console.log('data check', this.responseModel.responseObject)
        if (this.responseModel.responseObject.status == 200) {
          this.encrydecryresponse = this.EncryptDecrypt.passwordEncryption(this.user)
          sessionStorage.setItem(SessionKeys.autho_token, JSON.stringify(this.responseModel.responseObject.Token));
          sessionStorage.setItem(SessionKeys.userDetail, JSON.stringify(this.responseModel.responseObject));
          sessionStorage.setItem(SessionKeys.USER, JSON.stringify(this.encrydecryresponse.data))
          var data = {
            userid: parseInt(this.responseModel.responseObject.MM_MU_USERID),
            lang_id: '1'
          }
          this.getPermissionDetails(data)
          // this.router.navigate(["/metropolis"])
          // this.toastr.success(this.responseModel.responseObject.message)
          this.toastr.success(this.responseModel.responseObject.message.split('.')[1], this.responseModel.responseObject.message.split('.')[0], {
            timeOut: 15000,
            toastClass: "tostr_blink toast-container ngx-toastr",
            tapToDismiss: false,
          })
          this.UserServices.debugLog('Login', this.responseModel.responseObject.message, new Date())
          if (this.loginForm.value.remember == true) {
            this.encrydecryresponse = new EncryptDecryptResponse()
            this.encrydecryresponse = this.EncryptDecrypt.encryption(
              this.loginForm.value.remember
            );
            localStorage.setItem('rememberMe', this.encrydecryresponse.data);
          }
        } else {
          this.UserServices.debugLog('Login', this.responseModel.responseObject.Message, new Date())
          this.toastr.error(this.responseModel.responseObject.Message)
        }
      });
    }
  }

  getPermissionDetails(data: any) {
    console.log(data, 'data');

    this.requestModel = new RequestModel()
    this.encrydecryresponse = this.EncryptDecrypt.encryption(data)
    this.requestModel.payload = this.encrydecryresponse.data
    this.UserServices.getPermission(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      this.responseModel = response.body
      let clientSecret = response.headers.get('clientsecret')
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      this.responseModel.responseObject = this.encrydecryresponse.data
      console.log(this.encrydecryresponse.data)
      this.landingMenu = this.encrydecryresponse.data.responseObject.properties.getUserRolePermission;
      let data = this.landingMenu.find((value: any) => value.MM_TAR_LANDING === true)
      console.log(data.URL)
      if (this.responseModel.statusCode == 200) {
        this.router.navigate(["/" + data.URL])


        this.filterMenu = this.landingMenu.filter((value: any) => value.View === true)
      } else {
        //this.notify.errorMessage("fail", "failed to get clients")URL
      }

    })
  }

}
