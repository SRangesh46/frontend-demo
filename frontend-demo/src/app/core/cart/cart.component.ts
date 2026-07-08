import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CartService } from './cart-service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as XLSX from 'xlsx';
import { CountdownConfig, CountdownEvent } from 'ngx-countdown';
import { SignupService } from 'src/app/shared/navbar/signup.service';

import * as saveAs from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { ElasticRequestModel } from 'src/app/models/ElasticRequestModel';
import { LandingHomeService } from '../landing-home/landing-home.service';



@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  @ViewChild('package_replace', { static: true }) packageReplaceTemplate: TemplateRef<any>;
  @ViewChild('test_recommedation', { static: true }) test_recommedation: TemplateRef<any>;

  modalRef: BsModalRef;

  cartItems: any = []
  addedCartItems: any = []
  searchText: string = '';
  locationId: any;
  filteredArray: any;
  isView: boolean = false;
  userid: any;
  location: any;
  isLoading: boolean = false
  userType: any = 1;
   attuneFlag: boolean = localStorage.getItem('attune')?.toUpperCase() === 'Y';
  public elasticSearchRequest: any = {}
  location1: any = ''
  isActiveTab: any = 1;
  private tabSubscription: Subscription;
  recommendationsHidden: any
 

  constructor(private router: Router, private cartService: CartService, private cookieService: CookieService, public tableChange: ChangeDetectorRef,
    private EncryptDecrypt: EncryptdecryptService,
    private modalService: BsModalService, private service: SignupService, private http: HttpClient, private navbarService: NavbarService,
    private toastr: ToastrService,
    private UserServices: AuthService,
    private encryptDecrypt: EncryptdecryptService,
    private landingHomeService: LandingHomeService) {
    this.getCartItems();
    this.cartTable();
    if (localStorage.getItem('user')) {
      let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
      let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
      console.log(userDecrypted, 'userDecrypted');

      this.userid = userDecrypted.data.userid;
      this.userType = userDecrypted.data.usertype
      console.log(this.userType, 'userType');

      console.log(this.userid);
      let locationId = sessionStorage.getItem('locationId')
        ? sessionStorage.getItem('locationId') : localStorage.getItem('locationId');
      let location = sessionStorage.getItem('location')
        ? sessionStorage.getItem('location') : localStorage.getItem('location');
      this.location = location
      this.locationId = locationId;
      this.locationId = this.cookieService.get('locationId')
      // this.deleteCookie()
      this.getTestCartDetailsByUserId()

    } else {
      let locationid = this.cookieService.get('locationId');
      let location = this.cookieService.get('location');
      this.locationId = locationid;
      this.locationId = this.cookieService.get('locationId')
      this.location = location;
      this.getRelatedPackage();
    }
    this.getCurrentPath();

    // this.navbarService.currentLocationData.subscribe((val:any)=>{
    //   if(this.currentPath =='/cart' || this.currentPath =='cart'){
    //     debugger
    //       this.getTestCartDetailsByUserId1()
    //   }
    // })
  }

  currentPath: any;
  limsOrgId: any;
  ngOnInit(): void {
    this.limsOrgId = localStorage.getItem('limsOrgId');

    this.package_list()
    this.tabSubscription = this.navbarService.currentTab.subscribe((tab: any) => {
      if (sessionStorage.getItem('tabName')) {
        if (sessionStorage.getItem('tabName') == 'Human') {
          this.isActiveTab = 1;
        } else {
          this.isActiveTab = 2
        }
        console.log(this.isActiveTab, 'isActiveTab');
      }
    })
    this.config = {
      leftTime: 60 * Number(this.otpSec ? this.otpSec : ''),
      format: 'mm:ss',
    };

  }

  getCurrentPath() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.url
      console.log('Current path:', event.url);
    });
  }
  public otpValue: any = '';
  public showResendButton = false;
  config: CountdownConfig;
  public otpSec: any;

  onOtpChange(event: any) {
    this.otpValue = event;
  }

  handleEvent(event: CountdownEvent) {
    console.log(event);
    if (event.action === 'done') {
      this.otpValue = "";
      this.showResendButton = true;
    }
  }
  cancelOtp() {
    this.modalRef.hide()

  }

  async VerifyOTP() {
    try {
      let userMobileNo: any = sessionStorage.getItem('mobileNumber')
      let request: any = {}
      request.mobilenumber = userMobileNo
      request.otp = this.otpValue
      console.log(request, 'req');

      this.encrydecryresponse = this.encryptDecrypt.encryption(request)
      this.requestModel.payload = this.encrydecryresponse.data
      const pdfOtp: any = await this.cartService.cartPdfWithOtpVerfication(this.requestModel, this.encrydecryresponse.iv)
      console.log(pdfOtp, 'pdfOtp')
      this.responseModel = new ResponseModel()
      let clientSecret = pdfOtp.headers.get('clientsecret')
      this.responseModel = pdfOtp.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.statusCode == 200) {

        if (this.encrydecryresponse.data.responseObject.cartPdfWithOtpVerfication[0].statusCode == 400) {
          this.toastr.error(this.encrydecryresponse.data.responseObject.cartPdfWithOtpVerfication[0].message);
        }
        else if (this.selectedName == 'pdf') {
          this.toastr.success(this.encrydecryresponse.data.responseObject.cartPdfWithOtpVerfication[0].message);

          this.downloadPdfFile();
          this.cancelOtp()
        } else {
          this.toastr.success(this.encrydecryresponse.data.responseObject.cartPdfWithOtpVerfication[0].message);
          this.exportCartData();
          this.cancelOtp()
        }
      } else {
        this.toastr.success(this.encrydecryresponse.data.responseObject.cartPdfWithOtpVerfication[0].message);
      }
    } catch (error: any) {
      console.log(error);

    }
  }

  navigateToHomeScreen() {
    this.router.navigate(["/"])
    this.cartService.navigateTolanding('cart');
  }

  async resendOtp() {
    // Send OTP logic here Reset the countdown
    $('.login_contain .themeinput input').val('')
    this.showResendButton = false;

    this.config = {
      leftTime: 60 * Number(this.otpSec ? this.otpSec : ''),
      format: 'mm:ss',
    };
    //Click Resend OTP API Integration. Again send OTP to User

    try {
      let userMobileNo: any = sessionStorage.getItem('mobileNumber')
      let request: any = {
        mobilenumber: userMobileNo
      }
      console.log(request, 'request');

      this.encrydecryresponse = this.encryptDecrypt.encryption(request)
      this.requestModel.payload = this.encrydecryresponse.data

      const pdfOtp: any = await this.cartService.cartPdfGenerateOtp(this.requestModel, this.encrydecryresponse.iv)
      console.log(pdfOtp, 'pdfOtp')
      this.responseModel = new ResponseModel()
      let clientSecret = pdfOtp.headers.get('clientsecret')
      this.responseModel = pdfOtp.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.toastr.success("OTP has been resent to your registered mobile number.");
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  selectedName: any;
  async getOtp(temp: TemplateRef<any>, size: any, name: any) {
    this.selectedName = name;
    try {

      if (!localStorage.getItem('user') && name == 'pdf' || !localStorage.getItem('user') && name == 'excel') {
        this.toastr.error("Please Login Before Exporting Data")
      } else {
        let userMobileNo: any = sessionStorage.getItem('mobileNumber') || localStorage.getItem('mobileNumber')
        let request: any = {
          mobilenumber: userMobileNo
        }
        console.log(request, 'request');

        this.encrydecryresponse = this.encryptDecrypt.encryption(request)
        this.requestModel.payload = this.encrydecryresponse.data

        const pdfOtp: any = await this.cartService.cartPdfGenerateOtp(this.requestModel, this.encrydecryresponse.iv)
        console.log(pdfOtp, 'pdfOtp')
        this.responseModel = new ResponseModel()
        let clientSecret = pdfOtp.headers.get('clientsecret')
        this.responseModel = pdfOtp.body
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        console.log(this.encrydecryresponse.data);
        if (this.encrydecryresponse.data.statusCode == 200) {
          //this.toastr.success(this.encrydecryresponse.data.message)
          this.toastr.success('OTP has been sent to your registered mobile number.')

          this.otpSec = this.encrydecryresponse.data.mins
          this.showResendButton = false
          this.config = {
            leftTime: 60 * Number(this.otpSec ? this.otpSec : ''),
            format: 'mm:ss',
          };
          // this.modalRef.hide();
          this.openModal(temp, size);
        }
        else if (this.encrydecryresponse.data.statusCode == 400) {
          this.toastr.error('SMS sending failed, Unable to download')
        }
        else {
          this.toastr.error('Please login before sending the email')
        }
      }




    } catch (error: any) {
      console.log(error);
    }
  }

  cart_table: any = {}
  cartTable() {
    this.cart_table = {
      initComplete: function () {
        let TableID = 'cart_table'
        $('#' + TableID + "_search").keyup(function () { ($('#' + TableID).DataTable() as any).search($(this).val()).draw() });
        $('#' + TableID + '_filter').wrap(
          "<div class='data_text_right'><div class='imgexport bt8'></div></div>"
        );
        $('#' + TableID).wrap(
          "<div class='tableFixHead' style=' margin-top: 10px !important;overflow:auto;min-height:auto;max-height: calc(100vh - 390px); width:100%;position:relative;'></div>"
        );

        $('#' + TableID + ' tbody').on('click', 'td.dt-control', function () {
          console.log(TableID);
          let tr = $(this).closest('tr')
          let thead_arr: any = []
          let tbody_arr: any = []
          tr.children().map((e, l) => { tbody_arr.push($(l).text()) });
          $('#' + TableID + ' thead tr').children().map((e, l) => { thead_arr.push($(l).html()) });

          let colspan: any = 0;
          let str = "";
          let only: any = []
          $('#' + TableID + ' tbody tr').children().map((e, l) => {
            if ($(l).hasClass("hide_data")) {
              only.push(e)
            } else {
              colspan++
            }
          });
          for (let i = 1; i < tbody_arr.length - 1; i++) {
            if (only.includes(i)) {
              str += `<tr><td>${thead_arr[i]}</td><td>: ${tbody_arr[i]}</td></tr>`;
            }
          }
          let table = `<tr class="show_chlid_tr${tbody_arr[0]}"><td colspan=${colspan}><table class="sub_table" cellspacing="0" border="0" style="width:100%">${str}</table></td></tr>`
          if (tr.hasClass('dt-hasChild')) {
            $(".show_chlid_tr" + tbody_arr[0]).remove()
            tr.removeClass('dt-hasChild');
          } else {
            $(`${table}`).insertAfter($(tr));
            tr.addClass('dt-hasChild');
          }
        });
      },
      dom: 't',
      pagingType: 'full_numbers',
      autoWidth: false,
      pageLength: -1,
      responsive: true,
      lengthMenu: [10, 25, 50, 100],
      processing: true,
      ordering: false,
      columnDefs: [{
        'targets': [4], /* 0 to 6 */
        'orderable': false,
      }],
      language: {
        zeroRecords: 'No matching items found in the cart',

        search: '',
        searchPlaceholder: 'Search',
        paginate: {
          last: '<i class="fa fa-angle-double-right"></i>',
          first: '<i class="fa fa-angle-double-left"></i>',
          previous: '<i class="fa fa-angle-left"></i>',
          next: '<i class="fa fa-angle-right"></i>',
        },
      },
    };
  }

  openModal(template: any, size: any) {
    // console.log(('model'));
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered`,
    })
  }



  deleteCookie() {
    this.cookieService.delete('cartItems');
  }

  incrementQuantity(item: any) {

    if (!localStorage.getItem('user')) {
      //console.log(item);
      item.quantity++;
      let total: any = 0;
      if (item.quantity >= 10) {
        item.quantity = 10;

      }
      else if (item.quantity > 1) {
        total += item.quantity * item.testFees;
        item.total = total;
        //console.log(this.addedCartItems);
        const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
        // this.cookieService.set('cartItems', JSON.stringify(this.addedCartItems), expirationTime, '/');
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));

        const cartItems = this.getCartItems();
        if (cartItems) {
          cartItems.forEach((value: any) => {
            if (value.TESTPK == item.TESTPK && value.orgId == item.orgId) {
              value.quantity = item.quantity--;
            }
          })
        }
        //console.log(cartItems);

      }
    } else {
      console.log(item);
      item.quantity++;
      let total: any = 0;
      if (item.quantity > 10) {
        item.quantity = 10;
        total += item.quantity * item.testFees;
      }
      else
        if (item.quantity > 1) {
          total += item.quantity * item.testFees;
          item.total = total;
        }
      const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
      // this.cookieService.set('cartItems', JSON.stringify(this.addedCartItems), expirationTime, '/');
      localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));

      this.insertUpdateTestCartDetails(1)
    }

  }

  decrementQuantity(item: any) {

    if (!localStorage.getItem('user')) {
      // console.log(item, 'dec');
      if (item.quantity > 1) {
        item.quantity--;
        let total: any = item.quantity * item.testFees;
        item.total = total;
        //console.log(total);
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        const cartItems = this.getCartItems();
        if (cartItems) {
          cartItems.forEach((value: any) => {
            if (value.TESTPK == item.TESTPK && value.orgId == item.orgId) {
              value.quantity = item.quantity--;
            }
          })
        }
        //console.log(cartItems)

      }
    } else {
      // console.log(item, 'dec');
      if (item.quantity > 1) {
        item.quantity--;
        let total: any = item.quantity * item.testFees;
        item.total = total;
        //console.log(total);
        //const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
        // this.cookieService.set('cartItems', JSON.stringify(this.addedCartItems), expirationTime, '/');
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));

        this.insertUpdateTestCartDetails(1)
      }
    }
  }

  showTable: boolean = true;
  addToCart(item: any) {
    //console.log(item);
    if (!localStorage.getItem('user')) {
      if (item.isAdded) {
        item.isAdded = false;
        this.addedCartItems = this.addedCartItems.filter((val: any) => val.TESTPK != item.TESTPK)
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        this.cartService.changeData((this.addedCartItems.length).toString())
        this.showTable = false
        this.cartTable()
        this.tableChange.detectChanges();
        this.showTable = true
        this.tableChange.detectChanges();
      } else {
        item.isAdded = true;
        this.related_Packages(item);
        // this.addedCartItems.push(item)
        // localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        // this.cartService.changeData((this.addedCartItems.length).toString())
        // this.showTable = false
        // this.cartTable()
        // this.tableChange.detectChanges();
        // this.showTable = true
        // this.tableChange.detectChanges();
      }

    } else {
      console.log(item);

      if (item.isAdded) {
        item.isAdded = false;
        this.addedCartItems = this.addedCartItems.filter((val: any) => val.TESTPK != item.TESTPK)
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        this.cartService.changeData((this.addedCartItems.length).toString())
        this.insertUpdateTestCartDetails(1)
      } else {
        this.related_Packages(item);
        // item.isAdded = true;
        // this.addedCartItems.push(item)
        // localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        // this.cartService.changeData((this.addedCartItems.length).toString())
        // this.showTable = false
        // this.cartTable()
        // this.tableChange.detectChanges();
        // this.showTable = true
        // this.tableChange.detectChanges();
        // this.insertUpdateTestCartDetails(1)
      }

    }

  }

  related_Packages(related_Packages: any) {

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    let location = sessionStorage.getItem('location')
      ? sessionStorage.getItem('location') : localStorage.getItem('location');
    this.location1 = this.cookieService.get('location');

    this.elasticSearchRequest = new ElasticRequestModel();
    this.elasticSearchRequest.locationName = location ? location : this.location1,
      this.elasticSearchRequest.globalSearch = related_Packages.testCode;
    this.elasticSearchRequest.keyword = '';
    this.elasticSearchRequest.department = '';
    this.elasticSearchRequest.categoryName = '';
    this.elasticSearchRequest.methodName = '';
    this.elasticSearchRequest.reportedOn = '';
    this.elasticSearchRequest.diseasesName = '';
    this.elasticSearchRequest.specilityName = '';
    this.elasticSearchRequest.isAvtice = '';
    this.elasticSearchRequest.flag = 1
    this.elasticSearchRequest.newOne = ""
    this.elasticSearchRequest.testType = ""
    this.elasticSearchRequest.popularFlag = "",
      this.elasticSearchRequest.clusterName = this.clusterName;
    this.elasticSearchRequest.orgId = this.orgId;
    this.elasticSearchRequest.isGender = this.isActiveTab;
    this.elasticSearchRequest.sampleType = ''
    this.elasticSearchRequest.nabl = ''
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(this.elasticSearchRequest)
    this.requestModel.payload = this.encrydecryresponse.data
    this.landingHomeService.elasticgetTests(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.isLoading = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("Add related cart res: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.length > 0) {
        // Process the returned additional test data
        const now = new Date();
        const timeOfAddition = now.toLocaleString('en-IN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: true
        });
        // const additionalTest = this.encrydecryresponse.data.map((obj: any) => ({
        //   ...obj,
        //   'isAdded': false,
        //   'timeOfAddition': timeOfAddition
        // }));


        const additionalTest = this.encrydecryresponse.data.map((obj: any) => {
  // Calculate Report TAT as per Time of Addition
  let calculatedReportTAT = '-';
  if (obj.ReportTAT) {
    try {
      const reportTATDate = new Date(obj.ReportTAT);
      const tatDurationMs = reportTATDate.getTime() - now.getTime();
      if (tatDurationMs > 0) {
        const additionTime = new Date(now.getTime() + tatDurationMs);
        calculatedReportTAT = additionTime.toLocaleString('en-IN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: true
        });
      } else {
        calculatedReportTAT = obj.ReportTAT;
      }
    } catch (e) {
      calculatedReportTAT = obj.ReportTAT || '-';
    }
  }
  return {
    ...obj,
    'isAdded': false,
    'timeOfAddition': timeOfAddition,
    'reportTAT': calculatedReportTAT
  };
});

        // Push each additional test to the addedCartItems array
        this.addedCartItems.push(...additionalTest);  // Using the spread operator to push individual items

        // Retrieve existing cart items from localStorage
        const cartItems: any = localStorage.getItem('cartItems');
        if (cartItems) {
          const storedItems = JSON.parse(cartItems);

          // Merge the newly added tests with existing ones in `addedCartItems`
          this.addedCartItems.forEach((newItem: any) => {
            // Check if the test already exists in localStorage
            const existingItem = storedItems.find((storedItem: any) =>
              storedItem.TESTPK === newItem.TESTPK && storedItem.orgId === newItem.orgId
            );

            if (existingItem) {
              // Mark the existing item as 'isAdded' if it's found
              newItem.isAdded = true;
            }
          });

          // Update localStorage with the updated `addedCartItems`
          localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));

          if (localStorage.getItem('user')) {
            this.insertUpdateTestCartDetails(1);
          }

        } else {
          // If no existing cart items in localStorage, store the new tests directly
          localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));

          if (localStorage.getItem('user')) {
            this.insertUpdateTestCartDetails(1);
          }
        }
        // console.log('Additional addedCartItems', this.addedCartItems);
      } else {
        // If no additional tests are returned, reset the addedCartItems array
        // this.addedCartItems = [];
        this.toastr.info("This Test is not available");
      }
    });
    setTimeout(() => {
      this.isLoading = false;
    }, 5000);

  }
//   getCartItems() {
//     const cartItems: any | null = localStorage.getItem('cartItems');
//     if (cartItems?.length > 0) {
//       let data: any = JSON.parse(cartItems);
//       this.cartService.changeData((data.length).toString())
//       data.forEach((val: any) => {
//         this.cartItems.forEach((value: any) => {
//           if (value.TESTPK == val.TESTPK) {
//             value.isAdded = true;
//             value.quantity = val.quantity,
//               value.total = value.testFees
//           }
//         });
//       });
//       console.log(this.addedCartItems, 'this.addedCartItems');
//       console.log(this.cartItems, 'this.cartItems');


//       // return this.addedCartItems = JSON.parse(cartItems);

//       const now = new Date();
//       const timeOfAddition = now.toLocaleString('en-IN', {
//         day: '2-digit', month: '2-digit', year: 'numeric',
//         hour: '2-digit', minute: '2-digit', second: '2-digit',
//         hour12: true
//       });
//       const parsedItems = JSON.parse(cartItems);
// //      parsedItems.forEach((item: any) => {
// //   if (item.timeOfAddition) {
// //     const d = new Date(item.timeOfAddition);
// //     const day = String(d.getDate()).padStart(2, '0');
// //     const month = String(d.getMonth() + 1).padStart(2, '0');
// //     const year = d.getFullYear();
// //     const hours = d.getHours();
// //     const minutes = String(d.getMinutes()).padStart(2, '0');
// //     const seconds = String(d.getSeconds()).padStart(2, '0');
// //     const ampm = hours >= 12 ? 'pm' : 'am';
// //     const hour12 = String(hours % 12 || 12).padStart(2, '0');
// //     item.timeOfAddition = `${day}-${month}-${year} ${hour12}:${minutes}:${seconds} ${ampm}`;
// //   }
// // });

// return this.addedCartItems = parsedItems;
//     } else {
//       return [];
//     }

//   }

getCartItems() {
  const cartItems: any | null = localStorage.getItem('cartItems');
  if (cartItems?.length > 0) {
    const allItems: any[] = JSON.parse(cartItems);

    // ← ADD: current location filter
    const currentOrgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId');
    const currentLocationId = this.cookieService.get('locationId');

    const filteredItems = allItems.filter((item: any) =>
      item.orgId == currentOrgId && item.locationId == currentLocationId
    );

    this.cartService.changeData(filteredItems.length.toString());

    filteredItems.forEach((val: any) => {
      this.cartItems.forEach((value: any) => {
        if (value.TESTPK == val.TESTPK && value.orgId == val.orgId) {
          value.isAdded = true;
          value.quantity = val.quantity;
          value.total = value.testFees;
        }
      });
    });

    return this.addedCartItems = filteredItems;
  } else {
    return [];
  }
}

  totalPrice: any;
  deletedFlag: any;
  getTotalPrice() {
    // console.log('this.addedCartItems', this.addedCartItems);

    // this.totalPrice = 0;
    // for (const item of this.addedCartItems) {
    //   this.totalPrice += item.testFees * item.quantity;
    // }
    // this.cartService.changePrice(this.totalPrice.toString())
    // return this.totalPrice;
    this.totalPrice = 0;
    for (const item of this.addedCartItems) {
      this.totalPrice += item.testFees * item.quantity;
    }

    this.totalPrice = Math.floor(this.totalPrice); // or Math.round(this.totalPrice)

    this.cartService.changePrice(this.totalPrice.toString());
    return this.totalPrice;

  }

  removeFromCart() {

    console.log(this.removeItem, 'this.removeItem');
    if (!localStorage.getItem('user')) {
      this.removeItem.isAdded = false;
      const index = this.addedCartItems.indexOf(this.removeItem);
      if (index > -1) {
        this.addedCartItems.splice(index, 1);
        const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);

        // this.cookieService.set('cartItems', JSON.stringify(this.addedCartItems), expirationTime, '/');
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));

        const cartItems = this.getCartItems()
        if (cartItems.length > 0) {
          cartItems.forEach((val: any) => {
            this.cartItems.forEach((value: any) => {
              if (value.TESTPK == val.TESTPK && value.orgId == val.orgId) {
                value.isAdded = true;
              } else {
                value.isAdded = false;
              }
            });
          });
        }
        else {
          this.cartItems.forEach((value: any) => {
            value.isAdded = false

          });
        }
      }
      if (this.removeItem.length > 0) {
        this.addedCartItems = []
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
      }
      this.getCartItems()
      // this.cartService.changeData((this.addedCartItems.length).toString())
      this.showTable = false
      this.cartTable()
      this.tableChange.detectChanges();
      this.showTable = true
      this.tableChange.detectChanges();
      this.modalRef.hide()
      this.package_list();
    } else {
      this.removeItem.isAdded = false;
      //console.log(this.removeItem);
      const index = this.addedCartItems.indexOf(this.removeItem);
      if (index > -1) {
        this.addedCartItems.splice(index, 1);
        const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
        // this.cookieService.set('cartItems', JSON.stringify(this.addedCartItems), expirationTime, '/');
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));

        this.cartItems.map((val: any) => {
          if (this.removeItem.TESTPK == val.TESTPK && this.removeItem.orgId == val.orgId) {
            val.isAdded = false
          }
        })


      }



      if (this.removeItem.length > 0) {
        this.addedCartItems = []
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
      }


      // this.cartService.changeData((this.addedCartItems.length).toString())
      this.getCartItems()

      this.showTable = false
      this.cartTable()
      this.tableChange.detectChanges();
      this.showTable = true
      this.tableChange.detectChanges();
      this.modalRef.hide()
      this.deletedFlag = 2
      this.insertUpdateTestCartDetails(this.deletedFlag);

      setTimeout(() => {
        this.package_list();
      }, 1000);



    }
  }





  private dataSubscription: Subscription;

  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  summaryPk: any;
  getTestCartDetailsByUserId() {
    // this.isLoading = true;
    if (sessionStorage.getItem('locationId') || localStorage.getItem('locationId')) {
      this.locationId = sessionStorage.getItem('locationId') || localStorage.getItem('locationId')
    }

    let req = {
      "userId": this.userid,
      "locationId": Number(this.locationId)
    }
    console.log(req, 'getTestCartDetailsByUserId');

    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(req)
    this.requestModel.payload = this.encrydecryresponse.data
    this.cartService.getTestCartDetailsByUserId(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      console.log(response, 'response');
      // debugger
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      // console.log(JSON.stringify(this.encrydecryresponse.data?.responseObject), ' this.encrydecryresponse');
      this.cookieService.set('link', this.encrydecryresponse.data.responseObject[0].pdf)
      //  console.log(this.encrydecryresponse.data.responseObject[0]);
      // debugger
      this.pdfLink = this.encrydecryresponse.data.responseObject[0].pdf
      console.log(this.encrydecryresponse.data, 'this.encrydecryresponse.data');

      //this.addedCartItems = concatenatedArray
      if (this.encrydecryresponse.data.responseObject[0].STATUS == 440) {
        localStorage.removeItem("user");
        localStorage.removeItem("username");
        sessionStorage.removeItem("user");
        this.router.navigate(["/"])
      }


      if (this.encrydecryresponse.data.statusCode == 200) {
        //this.isLoading = false;
        this.summaryPk = this.encrydecryresponse.data.responseObject[0].SummaryPk
        //console.log(this.summaryPk, '  this.summaryPk');
        if (this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray.length == 0) {
          this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = [];
        } else {
          const isEmpty: any = Object?.values(this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray[0]).every(x => x === 0 || x === '0');
          // console.log(isEmpty, 'isEmpty');
          if (isEmpty) {
            this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = []




          }
        }
        if (this.encrydecryresponse.data?.responseObject[0]?.cartTestDetailsArray) {
          let filterData: any = this.encrydecryresponse.data?.responseObject[0]?.cartTestDetailsArray
          //console.log(filterData, 'filterData');

          console.log(this.addedCartItems, 'this.addedCartItems');
          let newArr: any = []
          if (filterData.length > 0) {
            filterData.forEach((data: any) => {
              let filter: any = this.addedCartItems.every((obj: any) => data.TESTPK != obj.TESTPK)
              console.warn(filter, 'filter')
              if (filter) {
                newArr.push(data)
              } else {
                let filterObj: any = this.addedCartItems.find((obj: any) => data.TESTPK == obj.TESTPK)
                filterObj.total = data.total
                filterObj.quantity = data.quantity
              }
            })
            setTimeout(() => {
              this.addedCartItems = this.addedCartItems.concat(newArr)
              console.log(this.addedCartItems, 'addedCartItems');

              localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
              this.cartService.changeData((this.addedCartItems.length).toString())
              this.showTable = false
              this.cartTable()
              this.tableChange.detectChanges();
              this.showTable = true
              this.tableChange.detectChanges();
            }, 100);

            setTimeout(() => {//hided by hari
              // debugger
              this.cartService.changeData((this.addedCartItems.length).toString())
              this.showTable = false
              this.cartTable()
              this.tableChange.detectChanges();
              this.showTable = true
              this.tableChange.detectChanges();
              this.getRelatedPackage();
            }, 1000)



          } else {
            this.addedCartItems = this.addedCartItems
            setTimeout(() => {//hided by hari
              console.log(this.addedCartItems, 'this.addedCartItems ')
              this.cartService.changeData((this.addedCartItems.length).toString())
              this.showTable = false
              this.cartTable()
              this.tableChange.detectChanges();
              this.showTable = true
              this.tableChange.detectChanges();
              this.getRelatedPackage();
            }, 1000)

            //console.log(this.addedCartItems, 'this.addedCartItems');

          }
        }

      }

    });
  }

  getTestCartDetailsByUserId1() {
    // this.isLoading = true;
    // debugger

    if (sessionStorage.getItem('locationId') || localStorage.getItem('locationId')) {
      this.locationId = sessionStorage.getItem('locationId') || localStorage.getItem('locationId')
    }

    let req = {
      "userId": this.userid,
      "locationId": Number(this.locationId)
    }
    console.log(req, 'getTestCartDetailsByUserId');

    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(req)
    this.requestModel.payload = this.encrydecryresponse.data
    this.cartService.getTestCartDetailsByUserId(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      console.log(response, 'response');

      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      // console.log(JSON.stringify(this.encrydecryresponse.data?.responseObject), ' this.encrydecryresponse');
      this.cookieService.set('link', this.encrydecryresponse.data.responseObject[0].pdf)
      //  console.log(this.encrydecryresponse.data.responseObject[0]);
      this.pdfLink = this.encrydecryresponse.data.responseObject[0].pdf
      console.log(this.encrydecryresponse.data, 'this.encrydecryresponse.data');

      //this.addedCartItems = concatenatedArray

      if (this.encrydecryresponse.data.statusCode == 200) {
        //this.isLoading = false;
        this.summaryPk = this.encrydecryresponse.data.responseObject[0].SummaryPk
        //console.log(this.summaryPk, '  this.summaryPk');
        if (this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray.length == 0) {
          this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = [];
        }

        else {
          const isEmpty: any = Object?.values(this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray[0]).every(x => x === 0 || x === '0');
          // console.log(isEmpty, 'isEmpty');
          if (isEmpty) {
            this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = []
            this.addedCartItems = [];
            this.cartItems = [];
            localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
            this.cartService.changeData((this.addedCartItems.length).toString())
          } else {
            this.addedCartItems = this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray
            console.log(this.addedCartItems, 'addedCartItems');
            localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
            this.cartService.changeData((this.addedCartItems.length).toString())
            this.getRelatedPackage();

          }
        }


      }

    });
  }



  exportCartData() {
    if (localStorage.getItem('user') == '') {
      this.toastr.error("Please Login Before Exporting Data")
    } else {
      if (this.addedCartItems.length == 0) {
        this.toastr.error("No data to export!")
      }
      else {

        if (this.addedCartItems.length > 0) {
          let data = this.addedCartItems.map((value: any) => {
            return {

              'Test Code': value.testCode,
              'Test Name': value.testName,
              "Method": value.MethodName,
              "Sample Type": value.SampleType,
              "Report TAT": value.ReportTAT,
              'Price': value.testFees,
              // 'Quantity': value.quantity,
              // 'Total': value.total,
              // 'Summary Total': this.totalPrice

            }
          });
          data.push({
            'Test Code': '',
            'Test Name': '',
            "Method": '',
            "Sample Type": '',
            "Report TAT (as per Time of addition)": 'Grand Total',
            "Time of addition": '',
            "Price": this.totalPrice
          });
          const fileName = "Cart.xlsx";
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Cart");
          XLSX.writeFile(wb, fileName);
        } else {
          this.toastr.error("Data export failed")
        }
      }
    }
  }

  viewMoreCartItem: any;
  clusterName: any;
  orgId: any;
  getRelatedPackage() {
    //this.isLoading = true;

    if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
      this.clusterName = localStorage.getItem('clusterName');
      this.orgId = localStorage.getItem('orgId');
    }
    let location = sessionStorage.getItem('location')
      ? sessionStorage.getItem('location') : localStorage.getItem('location');
    this.location1 = this.cookieService.get('location');

    ///console.log(this.addedCartItems);

    let req = {
      "locationName": location ? location : this.location1,
      "elasticRelatedTestIdsReqModel": [],
      "clusterName": this.clusterName,
      "orgId": this.orgId


    }
    let elasticRelatedTestIdsReqModel = this.addedCartItems.map((value: any) => {
      return {
        testname: value.testName
      }
    })
    if (this.removeAllFlag == 1) {
      req.elasticRelatedTestIdsReqModel = [];

    } else {
      req.elasticRelatedTestIdsReqModel = elasticRelatedTestIdsReqModel;

    }
    console.log(req);
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(req)
    this.requestModel.payload = this.encrydecryresponse.data
    this.cartService.getRelatedPackage(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      //console.log(response, 'response');
      //this.isLoading = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      //console.log(this.encrydecryresponse, ' this.encrydecryresponse');
      this.removeAllFlag = 0
      this.cartItems = this.encrydecryresponse.data;
      this.viewMoreCartItem = this.encrydecryresponse.data
      this.cartItems.map((value: any) => [
        value.isAdded = false,
        value.quantity = 1,
        value.total = value.testFees
      ])
      if (!this.isView) {
        this.filteredArray = this.cartItems.slice(0, 6);
        this.cartItems = this.filteredArray
        this.addedCartItems.forEach((val: any) => {
          this.cartItems.forEach((value: any) => {
            if (value.TESTPK == val.TESTPK) {
              value.isAdded = true;

            }
          });
        });
      }

      this.addedCartItems.forEach((val: any) => {
        this.viewMoreCartItem.forEach((value: any) => {
          if (value.TESTPK == val.TESTPK) {
            value.isAdded = true;

          }
        });
      });
      console.log(this.addedCartItems, 'added');


    });
  }
  viewMore() {
    this.isView = true
    this.cartItems = this.viewMoreCartItem;
    this.addedCartItems.forEach((val: any) => {
      this.cartItems.forEach((value: any) => {
        if (value.TESTPK == val.TESTPK) {
          value.isAdded = true;

        }
      });
    });

  }
  viewLess() {
    this.isView = false
    let filterArray = this.cartItems.slice(0, 6);
    this.cartItems = filterArray;
    this.addedCartItems.forEach((val: any) => {
      this.cartItems.forEach((value: any) => {
        if (value.TESTPK == val.TESTPK) {
          value.isAdded = true;

        }
      });
    });
  }
  closeCart() {
    this.removeAllFlag = 0
    //this.addedCartItems=[]
  }

  pdfLink: any;
  insertUpdateTestCartDetails(flag?: any) {
    this.isLoading = true;
    if (localStorage.getItem('user')) {
      // console.log(this.addedCartItems);
      let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
      let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
      this.userid = userDecrypted.data.userid;
      console.log(userDecrypted);
      let locationId = sessionStorage.getItem('locationId')
        ? sessionStorage.getItem('locationId') : localStorage.getItem('locationId');
      this.locationId = locationId;
      let req = {
        "userId": this.userid,
        "subTotal": "",
        "total": this.totalPrice,
        "locationId": Number(this.locationId),

        "testDetails": this.addedCartItems.map((value: any) => {
          return {
    "testId": value.TESTPK,
    "orgId": value.orgId,
    "price": value.testFees.toString(),
    "quantity": 1,
    "totalPrice": Number(value.total),
    'summaryPk': this.summaryPk == 0 ? null : this.summaryPk,
    "timeOfAddition": value.timeOfAddition || '',
// "reportTAT": value.reportTAT || '-',
// "reportTAT": this.attuneFlag ? (value.reportTAT || '-') : (value.ReportedOn || '-'),
}
        }),
        "flag": null
      }
      if (this.removeAllFlag == 1) {
        req.testDetails = [];
        req.total = 0

      } else {
        req.testDetails ? req.testDetails : []
      }
      console.log(req);
      this.requestModel = new RequestModel()
      this.encrydecryresponse = new EncryptDecryptResponse()
      this.encrydecryresponse = this.encryptDecrypt.encryption(req)
      this.requestModel.payload = this.encrydecryresponse.data
      this.cartService.insertUpdateTestCartDetails(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
        //console.log(response, 'response');
        this.isLoading = false;
        this.pdfLink = response.body.link
        this.responseModel = new ResponseModel()
        let clientSecret = response.headers.get('clientsecret')
        this.responseModel = response.body
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        //console.log(this.encrydecryresponse, ' this.encrydecryresponse');
        if (this.encrydecryresponse.data.statusCode == 200) {
          if (flag != 1 && flag != 2) {
            this.isLoading = false;
            this.toastr.success(this.encrydecryresponse.data.responseObject.insertUpdateContinentMaster[0].MESSAGE)
          } else if (flag == 2) {
            this.isLoading = false;
            this.toastr.success('The item has been successfully removed from your cart.')

          }
          //this.cartService.addedCartItem=[]
          this.getTestCartDetailsByUserId()
        } else {
          this.toastr.error(this.encrydecryresponse.data.responseObject.insertUpdateContinentMaster[0].MESSAGE)
        }
      });
    } else {
      (document.getElementById('loginPopup') as any).click()
      this.isLoading = false;

    }

  }


  removeItem: any
  remove(template: any, size: any, data: any) {

    this.removeItem = data
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered`,
    })
  }

  removeAllFlag: any


  removeAll(template: any, size: any, data: any, flag: any) {

    console.log(data, 'removeAllData');

    this.removeItem = data
    this.removeAllFlag = flag
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered`,
    });
    this.recommendationsHidden = true;
  }

  navigateToOverviewByTestRecom(data: any) {
    console.log(data);
  }
  navigateToOverview(data: any) {
    console.log(data);
    console.log("need object ;    ", { state: { testPk: data.TESTPK, orgId: data.orgId, location: this.location, isAdded: data.isAdded ? data.isAdded : true, item: data, fromPage: "cart" } });

    //console.log(data.isAdded, 'isAdded');
    data.isAdded = data.isAdded == false ? false : true
    this.router.navigate(["/overview"], { state: { testPk: data.TESTPK, orgId: data.orgId, location: this.location, isAdded: data.isAdded ? data.isAdded : true, item: data, fromPage: "cart" } })
  }

  downloadPdfFile() {
    console.log('download');

    if (localStorage.getItem('user') == '') {
      this.toastr.error("Please Login Before Exporting Data")
    }
    else {
      let fileUrl: any
      let newFilename: any
      // Define the file URL and new filename
      fileUrl = this.pdfLink;
      console.log(fileUrl, 'file');

      newFilename = 'Cart Summary.pdf';
      // Fetch the file as a blob
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          // Create an object URL for the blob
          const blobUrl = window.URL.createObjectURL(blob);

          // Create a temporary anchor element to trigger the download
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = newFilename;
          // Trigger a click event on the anchor element
          a.click();
          // Cleanup: Revoke the object URL
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
          console.error('Error fetching the file:', error);
        });
    }
  }

  downloadPdf() {
    this.http.get(this.pdfLink, { responseType: 'blob' }).subscribe((data: Blob) => {
      console.log(data, 'fileData');
      let newFilename = 'Cart Summary.pdf';
      saveAs(data, newFilename + '.pdf');
    });
  }

  formatTestFees(price: any) {
    return Math.floor(price)
    // return parseFloat(price != '' ? price : '').toLocaleString('en-IN', {
    //   maximumFractionDigits: 1,
    //   minimumFractionDigits: 1
    // });
  }

  async smsCatalogCartPdf() {

    if (localStorage.getItem('locationId') && this.userid) {
      try {
        let req = {
          "locationId": Number(this.locationId),
          "userId": this.userid
        }
        console.log(req, 'sms api');
        this.requestModel = new RequestModel()
        this.encrydecryresponse = new EncryptDecryptResponse()
        this.encrydecryresponse = this.encryptDecrypt.encryption(req)
        this.requestModel.payload = this.encrydecryresponse.data
        const sms: any = await this.cartService.smsCatalogCartPdf(this.requestModel, this.encrydecryresponse.iv)
        console.log(sms, 'sms')
        this.responseModel = new ResponseModel()
        let clientSecret = sms.headers.get('clientsecret')
        //  debugger
        this.responseModel = sms.body

        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        console.log(this.encrydecryresponse.data);
        if (this.encrydecryresponse.data.statusCode == 200) {
          this.isLoading = false;
          this.toastr.success(this.encrydecryresponse.data.message)
        } else {
          this.toastr.success(this.encrydecryresponse.data.message)
          this.isLoading = false;
        }
      } catch (error: any) {
        console.log(error);

      }


    } else {
      this.toastr.error('Please login before sending the SMS')
    }
  }

  async mailCatalogCartPdf() {
    this.isLoading = true;
    if (localStorage.getItem('locationId') && this.userid) {
      try {
        let req = {
          "locationId": Number(this.locationId),
          "userId": this.userid
        }
        console.log(req, 'mail req');
        this.requestModel = new RequestModel()
        this.encrydecryresponse = new EncryptDecryptResponse()
        this.encrydecryresponse = this.encryptDecrypt.encryption(req)
        this.requestModel.payload = this.encrydecryresponse.data
        const mail: any = await this.cartService.mailCatalogCartPdf(this.requestModel, this.encrydecryresponse.iv)
        console.log(mail, 'mail')
        this.responseModel = new ResponseModel()
        let clientSecret = mail.headers.get('clientsecret')
        this.responseModel = mail.body
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        console.log(this.encrydecryresponse.data);
        if (this.encrydecryresponse.data.statusCode == 200) {
          this.isLoading = false;
          this.toastr.success('Email Sent Successfully')
        } else {
          this.toastr.error(this.encrydecryresponse.data.message)
          this.isLoading = false;
        }
      } catch (error: any) {
        console.log(error);
        this.isLoading = false;
      }


    } else {
      this.isLoading = false;
      this.toastr.error('Please login before sending Email')
    }
  }

  async emailCatalog() {
    if (localStorage.getItem('locationId') && this.userid) {
      try {
        let req = {
          "locationId": Number(this.locationId),
          "userId": this.userid
        }
        console.log(req, 'email api');
        this.requestModel = new RequestModel()
        this.encrydecryresponse = new EncryptDecryptResponse()
        this.encrydecryresponse = this.encryptDecrypt.encryption(req)
        this.requestModel.payload = this.encrydecryresponse.data
        const sms: any = await this.cartService.emailCatalogCart(this.requestModel, this.encrydecryresponse.iv)
        console.log(sms, 'sms')
        this.responseModel = new ResponseModel()
        let clientSecret = sms.headers.get('clientsecret')
        this.responseModel = sms.body
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        console.log(this.encrydecryresponse.data);
        if (this.encrydecryresponse.data.statusCode == 200) {
          this.isLoading = false;
          this.toastr.success(this.encrydecryresponse.data.message)
        } else {
          this.toastr.success(this.encrydecryresponse.data.message)
          this.isLoading = false;

        }
      } catch (error: any) {
        console.log(error);
      }
    } else {
      this.toastr.error('Please login before sending the email')
    }
  }


  infoItem: any = []
  infoItem_clinc: any = []
  info_pop(template: any, size: any, data: any) {
    console.log(data, 'data');

    // this.infoItem = data?.clinicalUtility?.split('.')
    this.infoItem = data?.clinicalUtility?.split('.').filter((item: any) => item.trim() !== '')
    console.log(this.infoItem, ' this.infoItem');

    this.infoItem_clinc = data?.ClinicalUse?.split('.').filter((item: any) => item.trim() !== '');
    console.log(this.infoItem_clinc, ' this.infoItem_clinc');

    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered info_size`,
    })
  }
  package_pop(template: any, size: any, data: any) {
    console.log("pop works")
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered`,
    })
  }

  package_recommendations: any;
  test_recommendations: any;
  package_list() {

    let tests: any = [];


    this.addedCartItems.forEach((x: any) => {
      tests.push(x.testCode);
    });
    console.log("tests req array : ", tests);
    let data = {
      "is_web_request": "y",
      "mobile": "",
      "orgid": this.limsOrgId,
      "pid": "",
      "sex": "",
      "age": "",
      "tests": tests
    }

    this.requestModel = new RequestModel()
    console.log('package list', data)
    this.encrydecryresponse = this.EncryptDecrypt.encryption(data)
    this.requestModel.payload = this.encrydecryresponse.data

    this.UserServices.getCartRelatedPackageTestDetails(this.requestModel, this.encrydecryresponse.iv)
      .subscribe((response: any) => {
        this.responseModel = response.body;


        const clientSecret = response.headers.get('clientsecret');
        
       if(clientSecret){
                this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
         if (this.encrydecryresponse.data.status == 200) {

          this.responseModel.responseObject = this.encrydecryresponse;
          // this.package_recommendations = this.encrydecryresponse.data.package_recommendations;
          // this.test_recommendations = this.encrydecryresponse.data.test_recommendations;

          console.log("test_recommendations    :  ", this.encrydecryresponse.data.test_recommendations);
          localStorage.setItem('test_recommendations', JSON.stringify(this.encrydecryresponse.data.test_recommendations));
          let test_recommendations_storage = JSON.parse(localStorage.getItem('test_recommendations') as string)
          const duplicates1 = test_recommendations_storage.filter((obj1: any) => !this.addedCartItems.some((obj2: any) => obj1.product_code === obj2.testCode));
          this.test_recommendations = duplicates1;

          console.log("package_recommendations    :  ", this.encrydecryresponse.data.package_recommendations);
          localStorage.setItem('package_recommendations', JSON.stringify(this.encrydecryresponse.data.package_recommendations));
          let package_recommendations_storage = JSON.parse(localStorage.getItem('package_recommendations') as string)
          const duplicates2 = package_recommendations_storage.filter((obj1: any) => !this.addedCartItems.some((obj2: any) => obj1.product_code === obj2.testCode));
          this.package_recommendations = duplicates2;
          // this.toastr.success(this.encrydecryresponse.data.message)
        } else {
          this.toastr.error(this.encrydecryresponse.data.message)
        }

       }
       else {
        this.isLoading = false;
       }
        console.log("package Res:  ", this.encrydecryresponse.data);

      }, (error) => {
        console.error('Error fetching package details', error);
      });
  }
  getPackageRecommendationDetails() {
    setTimeout(() => {
      this.isLoading = true;
    }, 500);
    this.package_list();

    // localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
    // this.addedCartItems.push(items)
    let location = sessionStorage.getItem('location')
      ? sessionStorage.getItem('location') : localStorage.getItem('location');
    this.location1 = this.cookieService.get('location');

    this.elasticSearchRequest = new ElasticRequestModel();
    this.elasticSearchRequest.locationName = location ? location : this.location1,
      this.elasticSearchRequest.globalSearch = this.packageRecomm_obj.product_code;
    this.elasticSearchRequest.keyword = '';
    this.elasticSearchRequest.department = '';
    this.elasticSearchRequest.categoryName = '';
    this.elasticSearchRequest.methodName = '';
    this.elasticSearchRequest.reportedOn = '';
    this.elasticSearchRequest.diseasesName = '';
    this.elasticSearchRequest.specilityName = '';
    this.elasticSearchRequest.isAvtice = '';
    this.elasticSearchRequest.flag = 1
    this.elasticSearchRequest.newOne = ""
    this.elasticSearchRequest.testType = ""
    this.elasticSearchRequest.popularFlag = "",
      this.elasticSearchRequest.clusterName = this.clusterName;
    this.elasticSearchRequest.orgId = this.orgId;
    this.elasticSearchRequest.isGender = this.isActiveTab;
    this.elasticSearchRequest.sampleType = ''
    this.elasticSearchRequest.nabl = ''
    console.log("Add related cart req: ", this.elasticSearchRequest);
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(this.elasticSearchRequest)
    this.requestModel.payload = this.encrydecryresponse.data
    this.landingHomeService.elasticgetTests(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.isLoading = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("Add related cart res: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.length > 0) {
        // Process the returned additional test data
        const additionalTest = this.encrydecryresponse.data.map((obj: any) => ({
          ...obj,
          'isAdded': false,  // Add the `isAdded` flag to mark if it's already added to cart
        }));

        // Push each additional test to the addedCartItems array
        this.addedCartItems.push(...additionalTest);  // Using the spread operator to push individual items

        // Retrieve existing cart items from localStorage
        const cartItems: any = localStorage.getItem('cartItems');
        if (cartItems) {
          const storedItems = JSON.parse(cartItems);

          // Merge the newly added tests with existing ones in `addedCartItems`
          this.addedCartItems.forEach((newItem: any) => {
            // Check if the test already exists in localStorage
            const existingItem = storedItems.find((storedItem: any) =>
              storedItem.TESTPK === newItem.TESTPK && storedItem.orgId === newItem.orgId
            );

            if (existingItem) {
              // Mark the existing item as 'isAdded' if it's found
              newItem.isAdded = true;
            }
          });

          // Update localStorage with the updated `addedCartItems`
          localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        } else {
          // If no existing cart items in localStorage, store the new tests directly
          localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        }
        this.removePackageRecom();
        // console.log('Additional addedCartItems', this.addedCartItems);
      } else {
        // If no additional tests are returned, reset the addedCartItems array
        // this.addedCartItems = []
        this.toastr.error("This   " + this.packageRecomm_obj.product_name + "  Package is not available in DOS 2.0. Unable to Add to Cart !");
        this.isLoading = false;
      }
    });
    setTimeout(() => {
      this.isLoading = false;
    }, 5000);
  }
  testRecomm_obj: any
  recommendedTestName: any;
  addToCart1(items: any) {
    console.log('Additional test', items);
    this.testRecomm_obj = items
    this.recommendedTestName = items.product_name
    // this.getRecommendationDetails();
    this.OpenTestRecommendationModel();
    // localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
    // //this.getCartItems()
    // this.cartService.changeData((this.addedCartItems.length).toString())
    // this.showTable = false
    // this.cartTable()
    // this.tableChange.detectChanges();
    // this.showTable = true
    // this.tableChange.detectChanges();

  }
  product_name: any;
  productCodeChechForPopUp: any = [];
  packageRecomm_obj: any;
  packageName: any;
  addToCart2(items: any) {
    this.packageRecomm_obj = items
    this.packageName = items.product_name
    this.productCodeChechForPopUp = [];
    console.log(items);

    if (items.testFees == 0) {
      this.toastr.error(`${this.packageName} is not available in DOS 2.0. Unable to Add to Cart !`);
      console.log('Test fees are 0, item not added to cart');
      return;
    }

    if (items.test_parameters_testcode) {
      let testArray = items.test_parameters_testcode.split(',');

      testArray.forEach((x: any) => {
        let check = this.addedCartItems.find((obj: any) => x == obj.testCode);
        if (check) {
          this.productCodeChechForPopUp.push(check);
        }
      });

      console.log(this.productCodeChechForPopUp); // Log the product data for debugging
      this.openPackageReplaceModal(); // Trigger the modal
    }
    else {
      this.openPackageReplaceModal();
      // this.toastr.error(`${this.packageName} is not available in DOS 2.0. Unable to Add to Cart !`);

    }


  }


  // Open the modal when the package replace action is triggered
  openPackageReplaceModal() {
    // Show the modal using ngx-bootstrap
    this.modalRef = this.modalService.show(this.packageReplaceTemplate, { class: 'modal-lg' });
  }

  // Open the modal when the package replace action is triggered
  OpenTestRecommendationModel() {
    // Show the modal using ngx-bootstrap
    this.modalRef = this.modalService.show(this.test_recommedation, { class: 'modal-lg' });
  }

  // Close the modal
  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide(); // Close the modal by calling hide() on BsModalRef
    }
  }

  packageRecomAdded() {

    // this.addToCart1(this.packageRecomm_obj);
    this.getPackageRecommendationDetails();
    this.modalRef.hide()

  }

  testRecomAdded() {

    setTimeout(() => {
      this.isLoading = true;
    }, 500);

    this.package_list();

    // localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
    // this.addedCartItems.push(items)
    let location = sessionStorage.getItem('location')
      ? sessionStorage.getItem('location') : localStorage.getItem('location');
    this.location1 = this.cookieService.get('location');

    this.elasticSearchRequest = new ElasticRequestModel();
    this.elasticSearchRequest.locationName = location ? location : this.location1,
      this.elasticSearchRequest.globalSearch = this.testRecomm_obj.product_code;
    this.elasticSearchRequest.keyword = '';
    this.elasticSearchRequest.department = '';
    this.elasticSearchRequest.categoryName = '';
    this.elasticSearchRequest.methodName = '';
    this.elasticSearchRequest.reportedOn = '';
    this.elasticSearchRequest.diseasesName = '';
    this.elasticSearchRequest.specilityName = '';
    this.elasticSearchRequest.isAvtice = '';
    this.elasticSearchRequest.flag = 1
    this.elasticSearchRequest.newOne = ""
    this.elasticSearchRequest.testType = ""
    this.elasticSearchRequest.popularFlag = "",
      this.elasticSearchRequest.clusterName = this.clusterName;
    this.elasticSearchRequest.orgId = this.orgId;
    this.elasticSearchRequest.isGender = this.isActiveTab;
    this.elasticSearchRequest.sampleType = ''
    this.elasticSearchRequest.nabl = ''
    console.log("Add related cart req: ", this.elasticSearchRequest);
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(this.elasticSearchRequest)
    this.requestModel.payload = this.encrydecryresponse.data
    this.landingHomeService.elasticgetTests(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.isLoading = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("Add related cart res: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.length > 0) {
        // Process the returned additional test data
        const additionalTest = this.encrydecryresponse.data.map((obj: any) => ({
          ...obj,
          'isAdded': false,  // Add the `isAdded` flag to mark if it's already added to cart
        }));

        // Push each additional test to the addedCartItems array
        this.addedCartItems.push(...additionalTest);  // Using the spread operator to push individual items

        // Retrieve existing cart items from localStorage
        const cartItems: any = localStorage.getItem('cartItems');
        if (cartItems) {
          const storedItems = JSON.parse(cartItems);

          // Merge the newly added tests with existing ones in `addedCartItems`
          this.addedCartItems.forEach((newItem: any) => {
            // Check if the test already exists in localStorage
            const existingItem = storedItems.find((storedItem: any) =>
              storedItem.TESTPK === newItem.TESTPK && storedItem.orgId === newItem.orgId
            );

            if (existingItem) {
              // Mark the existing item as 'isAdded' if it's found
              newItem.isAdded = true;
            }
          });

          // Update localStorage with the updated `addedCartItems`
          localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        } else {
          // If no existing cart items in localStorage, store the new tests directly
          localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        }
        this.removePackageRecom();
        // console.log('Additional addedCartItems', this.addedCartItems);
      } else {
        // If no additional tests are returned, reset the addedCartItems array
        // this.addedCartItems = [];
        this.toastr.error("This Test is not available in DOS 2.0. Unable to Add to Cart !");
        this.isLoading = false;
      }
    });
    this.modalRef.hide()
    setTimeout(() => {
      this.isLoading = false;
    }, 5000);
  }

  removePackageRecom() {
    console.log(this.addedCartItems);
    console.log(this.productCodeChechForPopUp);

    this.productCodeChechForPopUp.forEach((removeItem: any) => {
      // Find the index of the object in testArray with the same test_id and test_name
      const index = this.addedCartItems.findIndex((item: any) =>
        item.testCode === removeItem.testCode
      );
      // If the item is found (index !== -1), remove it from testArray
      if (index !== -1) {
        this.addedCartItems.splice(index, 1);
      }
    });

    setTimeout(() => {
      localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
      this.getCartItems();
      // this.cartService.changeData((this.addedCartItems.length).toString())
      this.showTable = false
      this.cartTable()
      this.tableChange.detectChanges();
      this.showTable = true
      this.tableChange.detectChanges();
    }, 5000);
  }
}


