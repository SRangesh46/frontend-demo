import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { NotifyService } from '../notify/notify.service';
import { SharedService } from '../shared.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SignupService } from './signup.service';
import { CountdownConfig, CountdownEvent } from 'ngx-countdown';
import { CartService } from 'src/app/core/cart/cart-service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { SessionKeys } from 'src/app/app-config/SessionKeys';
import { LandingHomeService } from 'src/app/core/landing-home/landing-home.service';
import { NavbarService } from './navbar.service';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { filter, map, startWith } from 'rxjs/operators';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { environment } from 'src/environments/environment.uat';
interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {

  SearchCountryField = SearchCountryField;
  CountryISO: any = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;

  public bindCountryNameFlag: any = 'IN'
  public username: any
  requestModel: RequestModel = new RequestModel();
  responseModel: ResponseModel = new ResponseModel();
  public citieslist: any = [{ 'name': 'Chennai' }, { 'name': 'Delhi' }, { 'name': 'Mumbai' }, { 'name': 'Bangalore' }];
  encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  popularTestMasterList: any = [{ label: "Popular test", items: [] }]
  selectedOption: any
  addedCartCount: any;

  //declare the Variables using Directives & Boolean Types

  mobileForm: any = FormGroup;
  signupForm: any = FormGroup;
  public submitted: boolean = false;
  public submitted1: boolean = false;
  public genderMasterList: any;

  modalRef: any;
  public otpSec: any;
  public otpValue: any = '';
  config: CountdownConfig;
  public showResendButton = false;
  public all_cookies?: any;
  public searchedTest: any = new FormControl('');
  public searchedLocation: any = new FormControl('');
  addedCartitems: any = [] = [];
  isLoading: boolean = false;

  currentPath: string;
  private clearSearchSubscription: Subscription;
  constructor(public fb: FormBuilder, private encryptDecrypt: EncryptdecryptService, private notify: NotifyService, private router: Router, private modalService: BsModalService,
    private cartservice: CartService, private cookieService: CookieService, private sharedservice: SharedService, private route: ActivatedRoute,
    private service: SignupService, private toastr: ToastrService, private landingHomeService: LandingHomeService, private navbarService: NavbarService,
    private activatedRoute: ActivatedRoute) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      map(route => route.snapshot.url)
    ).subscribe((segments) => {
      this.currentPath = segments[0]?.path;
      console.log(this.currentPath, 'this.currentPath');

    });

    this.cartservice.navigation.subscribe((val: any) => {
      this.searchedTest.patchValue('')
    })

    this.cartservice.currentData.subscribe((count: any) => {
      //console.log(count, 'count');
      let cookiesData: any = [];
      this.addedCartitems = localStorage.getItem('cartItems');
      let cartItems: any | null = JSON.parse(this.addedCartitems);
      //console.log(cartItems);
      //count = this.addedCartitems.length.toString()
      this.all_cookies = localStorage.getItem('cartItems');
      if (!localStorage.getItem('user')) {
        if (this.addedCartitems) {
          cookiesData = JSON.parse(this.all_cookies)
          //console.log(cookiesData, 'co');
          this.addedCartCount = cookiesData?.length.toString()
          //console.log(this.addedCartCount);
        } else {
          this.addedCartCount = cartItems?.length.toString() ? cartItems.length.toString() : "0"
        }
      } else {
        //debugger
        this.addedCartCount = cartItems?.length.toString() ? cartItems.length.toString() : "0"

      }
    })
    this.clearSearchSubscription = this.navbarService.clearGlobalSearchObs.subscribe((res: any) => {
      console.log(res, 'res');
      if (res) {
        this.searchedTest.patchValue('')
      }
    })
    this.service.currentData.subscribe((username: any) => {
      //console.log(username,'username');
      this.username = username;
    })


  }

  reload() {
    this.searchedTest.patchValue('');
     this.navbarService.changeNavbarSearchWord('');
    this.router.navigate(["/banner"])
    // setTimeout(() => {
    //   window.location.reload()
    // }, 100)
  }


  deleteMyCookie(): void {
    this.cookieService.deleteAll();
  }

  //restrict First Letter Space in UserName Fields
  restrictFirstLetterSpace(event: any) {
    if (event.target.value.length == 0) {
      if (event.code === 'Space') {
        event.preventDefault();
      }
    }
  }

  //restrict_special_char
  restrict_special_char(e: any) {
    if (/^[a-zA-Z0-9\s]*$/.test(e.key)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }


  allowAlphabetsOnly(e: any) {
    this.sharedservice.allowAlphabetsOnly(e)
  }

  // Handle OTP input change event
  onOtpChange(event: any) {
    this.otpValue = event;
  }


  userTypeId: any = ''
  getUser(id: any) {
    //console.log(id, 'id');
    this.userTypeId = id
  }

  scrollRight() {
    const container = document.querySelector('.scroll-container') as HTMLElement;
    container.scrollBy({ left: 200, behavior: 'smooth' });
  }

  scrollLeft() {
    const container = document.querySelector('.scroll-container') as HTMLElement;
    container.scrollBy({ left: -200, behavior: 'smooth' });
  }

public isPopupOpen:boolean=false;
closeDropCity()
{
  this.isPopupOpen=false;
  this.modalRef.hide();
  this.router.navigate(['/banner']);
}
  openModal(template: any, size: any) {

    // debugger
   
    // console.log(('model'));
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered`,
    });
    this.isPopupOpen=true;
    this.signUpForm();
  }


  openLoginModal(template: any, size: any) {
  const location = this.cookieService.get('location') || sessionStorage.getItem('location');
  if (!location) {
    this.toastr.error('Please choose a location first!', '', {
      toastClass: 'toast-error ngx-toastr'
    });
    return;
  }
  this.openModal(template, size);
}



  log_out(template: any, size: any) {
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered`,
    })
  }
  //restrict restrict Aphabets and SpecialKeys in Mobile Number Fields
  restrictAphabetsandSpecialKeys(event: any) {
    this.service.allowNumbersOnly(event)
  }

  validateMobileNumber(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (value && value.charAt(0) === '0') {
      return { leadingZero: true };
    }
    return null;
  }

  //Add User form validations
  get f() { return this.mobileForm.controls; }
  get f1() { return this.signupForm.controls; }

  public selectedLocation: any = ''
  public user: any;
  ngOnInit(): void {


    this.signUpForm();
    this.getGenderMaster();
    this.getCountryCode();
    this.getUserTypeMaster();
    // this.getActiveTab();
    this.flipCard()
    // Once User Enter Mobile Number The Timer Start. it's Timer is came from Response
    this.config = {
      leftTime: 60 * Number(this.otpSec ? this.otpSec : ''),
      format: 'mm:ss',
    };
    this.getLocation()
    if (localStorage.getItem('user')) {
      let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
      //console.log(userEncrypted, 'userEncrypted ');
      let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
      //console.log(userDecrypted, 'userDecrypted');
      this.user = userDecrypted
      this.username = userDecrypted.data.UserName;
      //console.log(this.username);
      this.userid = userDecrypted.data.userid
      let locationId = sessionStorage.getItem('locationId') ?
        sessionStorage.getItem('locationId') : localStorage.getItem('locationId')
      this.locationId = locationId;
      //console.log(this.username);
      this.getTestCartDetailsByUserId();
    } else {
      let username: any = localStorage.getItem('username')
      this.username = username
    }


    const location = this.cookieService.get('location');
    // const location:any = localStorage.getItem('location');



    if (location) {
      this.searchedLocation = new FormControl(JSON.parse(location));
      //console.log(location);
      this.selectedLocation = this.searchedLocation.value
      this.navbarService.changeLocationData(this.searchedLocation.value)
      1
    } else {
      let location: any = sessionStorage.getItem('location')
      this.searchedLocation = new FormControl(location);
      //console.log(location);
      this.selectedLocation = this.searchedLocation.value
      this.navbarService.changeLocationData(this.searchedLocation.value)
    }

    this.getPopularTest();


  }

  getActiveTab() {
    if (sessionStorage.getItem('tabName')) {
      if (sessionStorage.getItem('tabName') === 'Human') {
        this.isHuman = true;
        this.isVertinary = false;
        this.activeTabName = 'Human'; 
        this.backgroundColor = '#c0d442';
      } else {
        this.isVertinary = true;
        this.isHuman = false;
        this.activeTabName = 'Veterinary'; 
        this.backgroundColor = '#c0d442'; 
      }
    } else {
   
      this.isHuman = true;
      this.isVertinary = false;
      this.activeTabName = 'Human'; 
      this.backgroundColor = '#c0d442';
      sessionStorage.setItem('tabName', 'Human');  
    }
  }



  signUpForm() {
    this.mobileForm = this.fb.group({
      // mobileNumber: ['', [Validators.required, Validators.minLength(10), this.validateMobileNumber, Validators.pattern('^[6-9]\\d{9}$')]]
      mobileNumber: ['', [Validators.required]]
    });

    this.signupForm = this.fb.group({
      mobileNumber: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      emailid: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,8}$")]],
      age: ['', Validators.pattern('^[1-9][0-9]*$')],
      genderid: ['',],
      usertypeid: ['', [Validators.required]]

    });
  }

  changeUserType(usreType: number) {
    if (usreType === 2) {
      this.signupForm.addControl('registrationNo', this.fb.control('', [Validators.required, Validators.pattern("^[a-zA-Z0-9]*$")]));
    } else {
      this.signupForm.removeControl('registrationNo');
    }

    if (usreType === 3) {
      this.signupForm.addControl('employeeId', this.fb.control('', [Validators.required, Validators.pattern("^[a-zA-Z0-9]*$")]));
      const emailControl = this.signupForm.get('emailid');
      emailControl?.setValidators([Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@metropolisindia\.[a-zA-Z]{2,8}$")]);
      emailControl?.updateValueAndValidity();
    } else {
      this.signupForm.removeControl('employeeId');
      const emailControl = this.signupForm.get('emailid');
      emailControl?.setValidators([Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,8}$")]);
      emailControl?.updateValueAndValidity();
    }

    if (usreType === 4) {
      this.signupForm.addControl('clientCode', this.fb.control('', [Validators.required, Validators.pattern("^[a-zA-Z0-9]*$")]));
    } else {
      this.signupForm.removeControl('clientCode');
    }
  }


  // Click continue Button Check the Validation And API Integration Send OTP respected Mobile Number
   mobileNumber: any;
  mobileCode: any;

  continueSendOTP(temp: TemplateRef<any>, size: any) {
    // debugger
    // 
    // stop here if form is invalid
    this.submitted = true
    if (
      this.mobileForm.invalid) {
      return
    }
    //True if all the fields are filled
    else {
      this.submitted = false
      this.mobileNumber = this.mobileForm.value.mobileNumber.number.trim()
      // 
      let request = {
        mobileNumber: this.mobileForm.value.mobileNumber.number.trim(),
        domainType: this.domainType,
        mobileCode: this.mobileForm.value.mobileNumber.dialCode.replace("+", "")
      }
      // 
      this.encrydecryresponse = this.encryptDecrypt.encryption(request)
      this.requestModel.payload = this.encrydecryresponse.data
      this.service.continueSendOTP(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
        this.responseModel = new ResponseModel()
        this.responseModel = response.body
        let clientSecret = response.headers.get('clientsecret')
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        this.responseModel.responseObject = this.encrydecryresponse.data;
        console.log(this.encrydecryresponse.data);
        //if statusCodes == 200 response is success Navigate OTP page set the Timer. Else if Enter Invalid User we going to throw the Toaster Message     
        if (this.encrydecryresponse.data.statusCodes == 200) {
          sessionStorage.setItem('mobileNumber', this.encrydecryresponse.data.mobileNumber)
          this.toastr.success(this.encrydecryresponse.data.message);
          this.otpSec = this.encrydecryresponse.data.mins
          // this.otpSec = 0.1

          //console.log(this.otpSec, ' this.otpSec');
          //this.router.navigate(["/otp-verification"], { state: { otpSeconds: otpSec, request } });
          this.showResendButton = false
          this.config = {
            leftTime: 60 * Number(this.otpSec ? this.otpSec : ''),
            format: 'mm:ss',
          };
          this.modalRef.hide();
          this.openModal(temp, size);
        }
        else {
          this.toastr.error(this.encrydecryresponse.data.message)
        }
      })

    }
  }

 submitSignUpForm(temp: TemplateRef<any>, size: any) {
    //console.log('sign', this.signupForm.value);
    console.log("hi karthik");

    // this.mobileForm.value.mobileNumber = ''
    this.submitted1 = true;
    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return
    }
    //True if all the fields are filled
    else {
      let countryCodeId: any;
      this.countryCodeList.map((countryCode: any) => {
        let code: any = this.signupForm.value.mobileNumber.dialCode.replace("+", "")
        if (code == countryCode.CountryCode) {
          countryCodeId = countryCode.CountryId
          // console.log(countryCodeId, 'countryCodeId');

        }
        // console.log(code);
      })
      
      let request = {
        name: this.signupForm.value.name,
        mobileNumber: this.signupForm.value.mobileNumber.number.trim(),
        registrationNo: this.signupForm.value.registrationNo,
        clientCode: this.signupForm.value.clientCode,
        employeeId: this.signupForm.value.employeeId,
        emailid: this.signupForm.value.emailid,
        age: Number(this.signupForm.value.age),
        genderid: Number(this.signupForm.value.genderid),
        usertypeid: this.signupForm.value.usertypeid,
        countryCodeId: countryCodeId,
        domainType: this.domainType,
        mobileCode: this.signupForm.value.mobileNumber.dialCode.replace("+", "")

      }
      this.mobileNumber = this.signupForm.value.mobileNumber.number.trim()

      // console.log(request, 'reqqqqqq');

      this.encrydecryresponse = this.encryptDecrypt.encryption(request)
      this.requestModel.payload = this.encrydecryresponse.data
      // console.log(this.encrydecryresponse.data, 'this.encrydecryresponse.data');

      this.service.signup(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
        //console.log(response, "88888888");

        this.responseModel = new ResponseModel()
        this.responseModel = response.body
        let clientSecret = response.headers.get('clientsecret')
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        this.responseModel.responseObject = this.encrydecryresponse.data;
        //console.log(this.encrydecryresponse.data);
        //if statusCodes == 200 response is success Navigate OTP page set the Timer. Else if Enter Invalid User we going to throw the Toaster Message     
        if (this.encrydecryresponse.data.statusCodes == 200) {
          this.otpSec = this.encrydecryresponse.data.mins
          // this.otpSec = 0.1
          localStorage.setItem('mobileNumber', this.signupForm.value.mobileNumber.number.trim(),)
          sessionStorage.setItem('mobileNumber', this.signupForm.value.mobileNumber.number.trim(),)

          this.showResendButton = false
          this.config = {
            leftTime: 60 * Number(this.otpSec ? this.otpSec : ''),
            format: 'mm:ss',
          };
          this.modalRef.hide();
          this.openModal(temp, size);
          this.toastr.success(this.encrydecryresponse.data.message);

        }
        else if (this.encrydecryresponse.data.statusCodes == 400) {
          this.toastr.error(this.encrydecryresponse.data.message);
        }
      })
    }
  }
  selectedCountryCode = 'us';
  countryCodes = ['us', 'lu', 'de', 'bs', 'br', 'pt', 'in'];

  changeSelectedCountryCode(value: any): void {
    this.selectedCountryCode = value;
  }


  logout() {
    console.log('logout');

    //this.router.navigateByUrl('/')
    this.addedCartCount = 0
    localStorage.clear();
    sessionStorage.clear();
    this.deleteMyCookie()
    this.username = ''
    this.modalRef.hide()
    this.cartservice.addedCartItem = []
    this.addedCartItems = []
    localStorage.removeItem('cartItems')
    this.cartservice.changeData((this.addedCartItems.length).toString())
    //this.service.changeData('')
    //this.cartservice.changeData('0')
    this.searchedLocation = new FormControl('');
    this.clearForm()
    this.otpValue = ''
    this.openModalLocation(this.drop_city);
    this.router.navigateByUrl('')

  }

  clearForm() {
    this.signupForm.reset();
    this.mobileForm.reset();
    this.submitted = false;
    this.submitted1 = false;
    this.modalRef.hide()
  }

  async getGenderMaster() { //get getGenderMaster master service
    try {
      const genderMasterList = await this.service.getGenderMaster();
      this.responseModel = genderMasterList.body;
      let clientSecret = genderMasterList.headers.get('clientsecret');
      this.encrydecryresponse = this.encryptDecrypt.decryption(
        this.responseModel.responseData,
        clientSecret
      );
      //console.log(genderMasterList,'master');

      this.responseModel = this.encrydecryresponse.data;
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.genderMasterList = this.encrydecryresponse.data.responseObject.getCatalogGenderMaster;
      } else if (genderMasterList.body.statusCode == 440) {
        //this.sessionExpiry();
      }
      //this.isLoading = new BehaviorSubject<boolean>(false);
    } catch (error: any) {
      console.error(error);

    }
  }

  userTypeMaster: any;
  async getUserTypeMaster() { //get getUserTypeMaster master service
    try {
      const userMasterList = await this.service.getUserTypeMaster();
      this.responseModel = userMasterList.body;
      let clientSecret = userMasterList.headers.get('clientsecret');
      this.encrydecryresponse = this.encryptDecrypt.decryption(
        this.responseModel.responseData,
        clientSecret
      );
      //console.log(userMasterList, 'master');

      this.responseModel = this.encrydecryresponse.data;
      //console.log(this.encrydecryresponse.data);

      if (this.encrydecryresponse.data.statusCode == 200) {
        this.userTypeMaster = this.encrydecryresponse.data.responseObject.getUserTypeMaster;
        console.log('this.userTypeMaster ', this.userTypeMaster);
      } else if (userMasterList.body.statusCode == 440) {
        //this.sessionExpiry();
      }
      //this.isLoading = new BehaviorSubject<boolean>(false);
    } catch (error: any) {
      console.error(error);

    }
  }



  userid: any;
  addedCartItems: any = []
  VerifyOTPLogin() {
    let request: any = {}
    request.mobileNumber = this.mobileNumber ? this.mobileNumber.trim() : this.signupForm.value.mobileNumber.number.trim(),
      request.otp = this.otpValue
    this.encrydecryresponse = this.encryptDecrypt.encryption(request)
    this.requestModel.payload = this.encrydecryresponse.data
    this.service.VerifyOTPLogin(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      this.responseModel = response.body
      let clientSecret = response.headers.get('clientsecret')
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      this.responseModel.responseObject = this.encrydecryresponse.data
      console.log(this.responseModel, 'this.responseModel');
      //if Status == 200 response is success
      if (this.encrydecryresponse.data.responseObject.properties.catalogueloginWithOtp[0].statusCode == 200) {
        this.toastr.success(this.encrydecryresponse.data.responseObject.properties.catalogueloginWithOtp[0].message);
        let userToEncrypt = this.encrydecryresponse.data.responseObject.properties.catalogueloginWithOtp[0];
        let encryptedData = this.encryptDecrypt.passwordEncryption(userToEncrypt)
        localStorage.setItem(SessionKeys.userDetail, JSON.stringify(encryptedData.data));

        this.modalRef.hide();

        if (localStorage.getItem('user')) {
          let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
          //console.log(userEncrypted, 'userEncrypted ');
          let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
          //console.log(userDecrypted, 'userDecrypted');
          this.user = userDecrypted
          console.log(this.user, 'user');

          this.username = userDecrypted.data.UserName;
          localStorage.setItem('username', this.username)
          localStorage.setItem('usertype', userDecrypted.data.usertype || '')

          this.userid = userDecrypted.data.userid
          let locationId = sessionStorage.getItem('locationId')
            ? sessionStorage.getItem('locationId') : localStorage.getItem('locationId');
          this.locationId = locationId;
          //console.log(this.username);
          this.getTestCartDetailsByUserId();
          this.router.navigateByUrl('/')

        }
        this.service.changeData(this.username)
      }
      else {
        this.toastr.error(this.encrydecryresponse.data.responseObject.properties.catalogueloginWithOtp[0].message);
      }
    })
  }


  getTestCartDetailsByUserId() {
    let req = {
      "userId": this.userid,
      "locationId": Number(this.locationId)
    }
    console.log(req);

    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(req)
    this.requestModel.payload = this.encrydecryresponse.data
    this.cartservice.getTestCartDetailsByUserId(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      console.log(response, 'response');

      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray.length == 0) {
        this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = []
      } else {
        const isEmpty: any = Object?.values(this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray[0]).every(x => x === 0 || x === '0');
        console.log(isEmpty, 'isEmpty');
        if (isEmpty) {
          this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = []
        }
      }
      if (this.encrydecryresponse.data?.responseObject[0]?.cartTestDetailsArray) {
        let filterData: any[] = this.encrydecryresponse.data?.responseObject[0]?.cartTestDetailsArray;
        console.log(filterData, 'filterData');
        this.getCartItems()
        let newArr: any = []
        if (filterData.length > 0) {
          filterData.forEach((data: any) => {
            let filter: any = this.addedCartItems.every((obj: any) => data.TESTPK != obj.TESTPK)
            console.warn(filter, 'filter')
            if (filter) {
              newArr.push(data)
            }
          })
          console.log(newArr, 'newArr');
          setTimeout(() => {
            this.addedCartItems = this.addedCartItems.concat(newArr)
            localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
            this.getCartItems()
          }, 100);
        } else {
          this.addedCartItems = this.addedCartItems
          const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
          localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems ? this.addedCartItems : []));
          this.getCartItems()
        }
      }

    });
  }

  getCartItems() {
    const cartItems: any | null = localStorage.getItem('cartItems');
    if (cartItems?.length > 0) {
      let cartItem: any = JSON.parse(cartItems)
      this.cartservice.changeData((cartItem.length).toString())
      return this.addedCartItems = JSON.parse(cartItems);
    } else {
      return [];
    }
  }


  // the event binding should work correctly, and the handleEvent() method will receive the correct CountdownEvent.
  //The showResendButton will be set to true when the countdown is done, and the resend button will be displayed.
  handleEvent(event: CountdownEvent) {
    console.log(event);
    if (event.action === 'done') {
      this.otpValue = "";
      this.showResendButton = true;



    }
  }



  resendOtp() {
    // Send OTP logic here Reset the countdown
    $('.login_contain .themeinput input').val('')
    this.showResendButton = false;

    this.config = {
      leftTime: 60 * Number(this.otpSec ? this.otpSec : ''),
      format: 'mm:ss',
    };
    //Click Resend OTP API Integration. Again send OTP to User
    let request = {
      mobileNumber: this.mobileNumber ? this.mobileNumber.trim() : this.mobileForm.value.mobileNumber.number.trim()
    }
    //console.log(request, "Mobile Number");
    this.encrydecryresponse = this.encryptDecrypt.encryption(request)
    this.requestModel.payload = this.encrydecryresponse.data
    this.service.continueSendOTP(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      this.responseModel = response.body
      let clientSecret = response.headers.get('clientsecret')
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      this.responseModel.responseObject = this.encrydecryresponse.data
      console.log(this.encrydecryresponse.data);

      if (this.encrydecryresponse.data.statusCodes == 200) {
        this.toastr.success("OTP has been resent to your registered mobile number.");
      }
    })
  }

  locationMasterList: any = [];
  noRecordsFound: boolean = false; // Initialize noRecordsFound
  mostPopularLocationList: any = [];
  public domainType: string = environment.domainType;

  getLocation() {

    const domainType = this.domainType; // this project is international only

  let req = {
    domainType: domainType
  };

  this.requestModel = new RequestModel();
  this.encrydecryresponse = new EncryptDecryptResponse();
  this.encrydecryresponse = this.encryptDecrypt.encryption(req);
  this.requestModel.payload = this.encrydecryresponse.data;

    this.navbarService.getB2cLocationMaster(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      // console.log("getLocation res: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.locationMasterList = this.encrydecryresponse.data.responseObject.getB2cLocationMaster;
        console.log('locationMasterList:', this.locationMasterList);
        console.log('attune field check:', this.locationMasterList[0]?.attune);
        this.mostPopularLocationList = this.encrydecryresponse.data.responseObject.getB2cLocationMaster.filter((val: any) => val.isMostPopular)
        console.log(this.mostPopularLocationList, '  this.mostPopularLocationList')
        this.filteredLocationList = this.locationMasterList;
        this.noRecordsFound = false;
        // Subscribe to value changes and filter the list
        // debugger
        this.myControl.valueChanges
          .pipe(
            startWith(''),
            map(value => {
              const filtered = this._filter(value || '');
              this.noRecordsFound = filtered.length === 0; // Update noRecordsFound based on filtering
              return filtered;
            })
          ).subscribe(filtered => {
            this.filteredLocationList = filtered;
          });

      }
    });
  }
  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.locationMasterList.filter((location: any) =>
      location.b2cLocationName.toLowerCase().includes(filterValue)
    );
  }
  clusterName: any;
  orgId: any;
  getPopularTest() {

    if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
      this.clusterName = localStorage.getItem('clusterName');
      this.orgId = localStorage.getItem('orgId');
    }
    let req: any = {
      locationName: this.searchedLocation.value ? this.searchedLocation.value : '',
      testName: this.searchedTest.value ? this.searchedTest.value : null,
      clusterName: this.clusterName,
      orgId: this.orgId,
    }
    if (sessionStorage.getItem('tabName')) {
      if (sessionStorage.getItem('tabName') == 'Human') {
        req.isGender = 1
      } else {
        req.isGender = 2
      }
    } else {
      req.isGender = 1
    }



    console.log("req: ", req)
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(req)
    this.requestModel.payload = this.encrydecryresponse.data
    this.isLoading = true;
    this.landingHomeService.getPopularTest(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.isLoading = false;
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      // console.log("getPopularTest: ", this.encrydecryresponse.data);
      //  this.popularTestMasterList[0].items = this.encrydecryresponse.data
      this.popularTestMasterList = this.encrydecryresponse.data
      // console.log("getPopularTest: ", this.popularTestMasterList);
    });
  }

  getPopularTestKeyUp(event: any) {

    if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
      this.clusterName = localStorage.getItem('clusterName');
      this.orgId = localStorage.getItem('orgId');
    }

    const charCode = event.charCode;
    if (event.key == 'Alt' || event.key == 'Control' || event.key == 'Shift' || event.key === 'Tab') {
      event.preventDefault();
    } else {

      let req: any = {
        locationName: this.searchedLocation.value ? this.searchedLocation.value : '',
        testName: this.searchedTest.value ? this.searchedTest.value : '',
        clusterName: this.clusterName,
        orgId: this.orgId,
      }
      if (sessionStorage.getItem('tabName')) {
        if (sessionStorage.getItem('tabName') == 'Human') {
          req.isGender = 1
        } else {
          req.isGender = 2
        }
      } else {
        req.isGender = 1
      }
      console.log("req: ", req)
      this.encrydecryresponse = new EncryptDecryptResponse()
      this.encrydecryresponse = this.encryptDecrypt.encryption(req)
      this.requestModel.payload = this.encrydecryresponse.data
      // this.isLoading = true;
      this.landingHomeService.getPopularTest(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
        this.responseModel = new ResponseModel()
        let clientSecret = response.headers.get('clientsecret')
        this.responseModel = response.body
        this.isLoading = false;
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        console.log("getPopularTest: ", this.encrydecryresponse.data);
        //  this.popularTestMasterList[0].items = this.encrydecryresponse.data
        this.popularTestMasterList = this.encrydecryresponse.data
        console.log("getPopularTest: ", this.popularTestMasterList);
      });
    }
  }
  testDetails: any = [];
  searchTest() {
    this.navbarService.changeLocationData(this.searchedLocation.value);
    console.log("this.searchedTest", this.searchedTest);
    // debugger
    this.navbarService.changeNavbarSearchWord(this.searchedTest.value?.testName ? this.searchedTest.value?.testName : this.searchedTest.value)
    if (this.searchedLocation.value != '') {
      this.router.navigate([""])
    }
    // if (this.searchedTest.value != '') {
    //   let testObj = this.popularTestMasterList[0].items.find((data: any) => data.testName == this.searchedTest.value)
    //   this.router.navigate(["/overview"], { state: { testPk: testObj.TestId, orgId: testObj?.orgId, location: this.selectedLocation, fromPage: 'navbar' } })
    // }
  }
  selectedLocations: any;
  selectedName: any;
  setLocation(e: any) {
    this.router.navigate(['/']);
     this.searchedTest.patchValue('');
     this.navbarService.changeNavbarSearchWord('');
    console.log(e, 'e');
    const selectedName = e.b2cLocationName; // Get the selected b2cLocationName
    // Find the corresponding location object in locationMasterList
    this.selectedName = e.b2cLocationName;
    const selectedLocation = this.locationMasterList.find((location: { b2cLocationName: any; }) => location.b2cLocationName === selectedName);
    this.searchedLocation.patchValue(selectedName)
    console.log(selectedLocation, 'selectedlocation');
    console.log('attune value from backend:', selectedLocation?.attune);
    const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
    if (selectedLocation) {
      const selectedId = selectedLocation.Id;
      sessionStorage.setItem('locationId', selectedId)
      localStorage.setItem('locationId', selectedId)
      localStorage.setItem('clusterName', selectedLocation.clusterName)
      sessionStorage.setItem('clusterName', selectedLocation.clusterName)
      localStorage.setItem('orgId', selectedLocation.orgId)
      sessionStorage.setItem('orgId', selectedLocation.orgId);
      sessionStorage.setItem('location', this.selectedName);
      localStorage.setItem('location', this.selectedName);
     localStorage.setItem('limsOrgId', selectedLocation.limsOrgId);
    localStorage.setItem('attune', selectedLocation.attune?.toUpperCase() === 'Y' ? 'Y' : 'N');

        // Static value for testing
  // localStorage.setItem('attune', 'Yes');


      this.cookieService.set('locationId', JSON.stringify(selectedId), expirationTime, '/');
      console.log(`Selected ID: ${selectedId}`);
    }
    this.navbarService.changeLocationData(selectedName);
    this.cookieService.set('location', JSON.stringify(selectedName), expirationTime, '/');
    this.getCurrentPath()
    this.getPopularTest()
    this.navbarService.changeData('location')
    this.closeModal();
    // this.navigateToLandingPage();



  }

  getCurrentPath() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.url
      console.log('Current path:', event.url);
    });
  }

  navigateToLandingPage() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(["/landing"], { state: { name: '' } });
    });
  }

  routerCart() {
    this.router.navigateByUrl('cart')
  }

  @ViewChild('drop_city') drop_city: ElementRef;
  ngAfterViewInit() {
    if (this.selectedLocation == '' || this.selectedLocation == null) {
      this.openModalLocation(this.drop_city);
    }
  }

  open_Modal = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-xl',
  };

  openModalLocation(template: any) {
    this.modalRef = this.modalService.show(template, this.open_Modal);
  }

  isInput: any;
  closeModal() {
    this.modalService.hide();
    this.myControl.patchValue('')
    this.filteredLocationList = this.locationMasterList;
  }

  getCurrentLocation() {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: any) => {
        if (position) {
          console.log("Latitude: " + position.coords.latitude +
            "Longitude: " + position.coords.longitude);
          let lat = position.coords.latitude;
          let lng = position.coords.longitude;
          //console.log(lat);
          //console.log(lat);
          let req = {
            "latitude": lat,
            "longitude": lng
          }
          this.isLoading = true;
          this.requestModel = new RequestModel()
          this.encrydecryresponse = new EncryptDecryptResponse()
          this.encrydecryresponse = this.encryptDecrypt.encryption(req)
          this.requestModel.payload = this.encrydecryresponse.data
          console.log("location req: ", req);
          this.navbarService.getCurrentLocation(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
            this.isLoading = false;
            this.responseModel = new ResponseModel()
            let clientSecret = response.headers.get('clientsecret')
            this.responseModel = response.body
            this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
            console.log("location res: ", this.encrydecryresponse.data);
            if (this.encrydecryresponse.data.statusCode == 200) {
              this.searchedLocation.setValue(this.encrydecryresponse.data.responseData)
              const selectedName = this.searchedLocation.value; // Get the selected b2cLocationName

              // Find the corresponding location object in locationMasterList
              const selectedLocation = this.locationMasterList.find((location: { b2cLocationName: any; }) => location.b2cLocationName === selectedName);
              const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
              if (selectedLocation) {
                const selectedId = selectedLocation.Id;
                this.cookieService.set('locationId', JSON.stringify(selectedId), expirationTime, '/');
                localStorage.setItem('clusterName', selectedLocation.clusterName)
                console.log(localStorage.setItem('clusterName', selectedLocation.clusterName));

                // localStorage.setItem('locationId', JSON.stringify(selectedId));

              }
              this.modalRef?.hide()
            } else {
              this.toastr.error(this.encrydecryresponse.data.responseData)
            }
          });
        }
      },
        (error: any) => this.toastr.error('Please try again later!'));
    } else {
      this.toastr.error('Geolocation is not supported by this browser!');
    }
  }
  myControl = new FormControl<string>('');
  filteredPdfOptions: Observable<any>;
  filteredLocationList: any[];

  private filterlocationName(locationName: string) {
    const filterValue = locationName.toLowerCase();
    return this.locationMasterList
      .map((item: any) => ({
        ...item.filter((locationName: any) => locationName.b2cLocationName.toLocaleLowerCase().includes(filterValue)),
      }))
      .filter((item: any) => item.locationMasterList.length > 0);

  }
  filterLocation() {
    //this.pdfList = this.pdfList.slice().sort((a: { letter: string; }, b: { letter: any; }) => a.letter.localeCompare(b.letter));
    //console.log(this.pdfList,'pdfList');
    this.filteredPdfOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        const title = typeof value === 'string' ? value.trim() : value.some((val: any) => val.title);
        return title ? this.filterlocationName(title as string) : this.locationMasterList.slice();
      }),
    );

  }

  locationId: any;
  select_city(e: any) {
    console.log(e, 'e');
    this.locationId = e.Id
    this.selectedLocation = e.b2cLocationName
    this.searchedLocation.setValue(this.selectedLocation)
    console.log(this.searchedLocation, 'this.searchedLocation');
    this.searchedLocation.value = e.b2cLocationName
    this.navbarService.changeLocationData(this.selectedLocation)
    this.modalRef?.hide()
    sessionStorage.setItem('location', this.selectedLocation)
    sessionStorage.setItem('locationId', this.locationId)
    localStorage.setItem('clusterName', e.clusterName)
    localStorage.setItem('orgId', e.orgId)
    localStorage.setItem('location', this.selectedLocation)
    localStorage.setItem('locationId', this.locationId)

    const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
    this.cookieService.set('location', JSON.stringify(this.selectedLocation), expirationTime, '/');
    // localStorage.setItem('location', JSON.stringify(this.selectedLocation));

    this.cookieService.set('locationId', JSON.stringify(this.locationId), expirationTime, '/');
    // localStorage.setItem('locationId', JSON.stringify(this.locationId));

    this.navbarService.changeLocationData(this.selectedLocation)
    this.getPopularTest()
    this.navigateToLandingPage();



  }

  countryCodeList: any;
  getCountryCode() {


    //console.log(req
    this.service.getCountryCode().subscribe((response: any) => {
      //console.log(response,'res');
      this.responseModel = new ResponseModel()
      this.responseModel = response.body
      let clientSecret = response.headers.get('clientsecret')
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      this.responseModel.responseObject = this.encrydecryresponse.data
      console.log(this.encrydecryresponse.data);
      // console.log(this.encrydecryresponse.data, "countrycode")
      if (this.responseModel.statusCode == 200) {
        this.countryCodeList = this.encrydecryresponse.data.responseObject.getCatalogCountryMaster;
        console.log(this.countryCodeList);
        //  this.isLoading = new BehaviorSubject<boolean>(false);
      } else {
        // this.isLoading = new BehaviorSubject<boolean>(false);
      }
    })
  }





  /**
   * allow numbers only pattern validations
   */
  allowNumbersOnly(event: any) {
    this.sharedservice.allowNumbersOnly(event)
  }

  /**
   * allow numbers and dot only pattern validations
   */
  allowNumbersDotOnly(event: any) {
    this.sharedservice.allowNumbersDotOnly(event)
  }

  /**
   * allow numbers and alphabets only pattern validations
   */
  restrictSplCharsOnly(event: any) {
    this.sharedservice.restrict_special_char(event)
  }

  filteredPopular: any = []
  filterTest(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.popularTestMasterList as any[]).length; i++) {
      let obje = (this.popularTestMasterList as any[])[i];
      if (obje?.testName?.toLowerCase().includes(query?.toLowerCase())) {
        filtered.push(obje);
      }
    }
    this.filteredPopular = filtered;
  }


  activeTabName: any='Human'
  isHuman: boolean = true;
  isVertinary: boolean = false;
  isActiveTab: any = 1;
  backgroundColor: string = 'transparent';
  borderRadius: string = '0';
 
  ngOnDestroy(): void {
    if (this.clearSearchSubscription) {
      this.clearSearchSubscription.unsubscribe();
    }
  }

// changes start
isFlipped: boolean = true;
onTabClick(tabName:any) {
  this.activeTabName = tabName
  console.log(this.activeTabName);
  sessionStorage.setItem('tabName', this.activeTabName,)
  this.navbarService.changeLocationData(this.selectedName);
  this.navbarService.changeTab('activeTab')
  this.navbarService.changeData('location');
  this.backgroundColor = '#c0d442';
  this.borderRadius = '6px';
}
flipCard(): void {

  this.isFlipped = !this.isFlipped;
  let tabName= this.isFlipped ? "Veterinary" : "Human"
  this.onTabClick(tabName) 
}
//changes end
}
