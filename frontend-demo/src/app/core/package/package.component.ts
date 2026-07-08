import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { TableRequestModel } from 'src/app/models/TableRequestModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';
import { SharedService } from 'src/app/shared/shared.service';
import { CartService } from '../cart/cart-service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { ElasticRequestModel } from 'src/app/models/ElasticRequestModel';
import { FormControl, FormGroup } from '@angular/forms';
import { LandingHomeService } from '../landing-home/landing-home.service';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.css']
})
export class PackageComponent implements OnInit {
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  public tableRequestModel: TableRequestModel = new TableRequestModel();
  public reponsive_table: any = {}
  public list_view: any = true;
  public testStatusMaster = [{ "value": "Y", "name": "Active" }, { "value": "N", "name": "Inactive" }]
     get isMHLStaff(): boolean {
  return localStorage.getItem('usertype') === '3';
}
  public addedCartItems: any = []
  selectedLocation: any = ''
  userid: any;
  locationId: any
  public testForm: any
  showLimit: any = 12
  private dataSubscription: Subscription;
  private tabSubscription: Subscription;
  isActiveTab:any=1;

  constructor(private toastr: ToastrService, public tableChange: ChangeDetectorRef, private navbarService: NavbarService, private cartService: CartService, private cookieService: CookieService, private sharedservice: SharedService, private serviceMethod: PostmethodService, private encryptDecrypt: EncryptdecryptService, private router: Router, private modalService: BsModalService, private cdr: ChangeDetectorRef, private landingHomeService: LandingHomeService) { }
  attuneFlag: boolean = localStorage.getItem('attune')?.toUpperCase() === 'Y';
  selectedScheduleTest: any = null;
  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.tabSubscription) {
      this.tabSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.tabSubscription= this.navbarService.currentTab.subscribe((tab:any)=>{
      if (sessionStorage.getItem('tabName')) {
        if (sessionStorage.getItem('tabName') == 'Human') {
          this.isActiveTab = 1
        } else {
          this.isActiveTab = 2
  
        }
         console.log(this.isActiveTab,'isActiveTab');
      }
     })
    this.createForm();
    this.getMasterData()
    this.dataSubscription = this.navbarService.currentLocationData.subscribe((res: any) => {
      this.attuneFlag = localStorage.getItem('attune')?.toUpperCase() === 'Y';
      this.selectedLocation = res
      this.getTestData()
    })
    this.locationId = this.cookieService.get('locationId')
    if (localStorage.getItem('user')) {
      let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
      let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
      console.log(userDecrypted, 'userDecrypted');
      this.userid = userDecrypted.data.userid;
      let locationId = sessionStorage.getItem('locationId'); sessionStorage.getItem('locationId')
        ? sessionStorage.getItem('locationId') : localStorage.getItem('locationId');
      this.locationId = locationId;
      this.locationId = this.cookieService.get('locationId')
      this.getTestCartDetailsByUserId()
    }

  }

  createForm() {
    this.testForm = new FormGroup({
      category: new FormControl(''),
      department: new FormControl(''),
      method: new FormControl(''),
      reportOn: new FormControl(''),
      status: new FormControl(''),
      sampleType: new FormControl(''),
      nabl: new FormControl('')
    })
  }

  selectedProduct: any = [];
  row_expand(ele: any) {
    this.selectedProduct.length = 0;
    this.selectedProduct.push(ele);
  }

  navigateToOverview(data: any) {
    this.router.navigate(["/overview"], { state: { testPk: data.TESTPK, orgId: data.orgId, location: this.selectedLocation, isAdded: data.isAdded, fromPage: "new-package", name: "New Package", item: data } })
  }

  // async addToCart(item: any) {
  //   item.isLoading = true;
  //   await this.getViewScheduleAndTAT(item);
  //   item.ReportTAT = this.selectedScheduleTest?.ReportTAT;
  async addToCart(item: any) {
  if (this.attuneFlag) {
    item.isLoading = true;
    await this.getViewScheduleAndTAT(item);
    item.ReportTAT = this.selectedScheduleTest?.ReportTAT;
  }
    if (!localStorage.getItem('user')) {
      if (item.isAdded) {
        item.isAdded = false;
        this.cartService.addedCartItem = this.cartService.addedCartItem.filter((val: any) => val.TESTPK != item.TESTPK)
        localStorage.setItem('cartItems', JSON.stringify(this.cartService.addedCartItem));
        this.cartService.changeData((this.cartService.addedCartItem.length).toString())
        this.cartService.addedCartItem = this.cartService.addedCartItem
        this.getTotalPrice()
      } else {
        item.isAdded = true;
item.quantity = 1
item.total = item.testFees;
item.orgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId'); 
item.locationId = this.cookieService.get('locationId');
const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = now.toLocaleString('en-GB', { month: 'short' });
const year = now.getFullYear();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
item.timeOfAddition = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
        this.cartService.addedCartItem.push(item)
        localStorage.setItem('cartItems', JSON.stringify(this.cartService.addedCartItem));
        this.cartService.changeData((this.cartService.addedCartItem.length).toString())
        this.cartService.addedCartItem = this.cartService.addedCartItem
        this.getTotalPrice()
      }
    } else {
      if (item.isAdded) {
        item.isAdded = false;
        this.addedCartItems = this.addedCartItems.filter((val: any) => val.TESTPK != item.TESTPK)
        this.cartService.addedCartItem = this.cartService.addedCartItem.filter((val: any) => val.TESTPK != item.TESTPK)
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        this.addedCartItems = this.cartService.addedCartItem
        setTimeout(() => {
          this.cartService.changeData((this.addedCartItems.length).toString())
        }, 100)
        this.getTotalPrice()
        this.insertUpdateTestCartDetails();
      } else {
        this.getTestCartDetailsByUserId();
        item.isAdded = true;
item.quantity = 1
item.total = item.testFees;
item.orgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId'); 
item.locationId = this.cookieService.get('locationId');
const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = now.toLocaleString('en-GB', { month: 'short' });
const year = now.getFullYear();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
item.timeOfAddition = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
        this.cartService.addedCartItem.push(item)
        // this.addedCartItems.push(item)
        localStorage.setItem('cartItems', JSON.stringify(this.cartService.addedCartItem));
        this.addedCartItems = this.cartService.addedCartItem
        this.cartService.changeData((this.cartService.addedCartItem.length).toString())
        this.getTotalPrice()
        this.insertUpdateTestCartDetails();
      }
    }
  }

  add_cart(e: any) {
    let element: any = $(e.target)
    if (element.hasClass("added_cart")) {
      this.router.navigate(["/cart"])
    }
    if (element.hasClass("add_cart")) {
      element.addClass("added_cart")
      element.removeClass("add_cart")
      element.html(" Added")
    }
  }

  getMasterData() {
    this.getMethodMaster();
    this.getCategoryMaster();
    this.getDepartmentMaster();
    //this.getReportedOnMaster();
    this.getSampleTypeDetails();

  }
  nablList:any=[{id:1,nabl:'Yes'},{id:2,nabl:'No'}]

  public categoryMasterList: any = []
  getCategoryMaster() {

    this.sharedservice.getCategoryMaster().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        // this.isLoading = new BehaviorSubject<boolean>(false);
        this.categoryMasterList = this.encrydecryresponse.data.responseObj
      } else {
        // this.isLoading = new BehaviorSubject<boolean>(false);
      }
    });
  }

  public methodMasterList: any = []
  getMethodMaster() {

    this.sharedservice.getMethodMaster().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        // this.isLoading = new BehaviorSubject<boolean>(false);
        this.methodMasterList = this.encrydecryresponse.data.responseObj
        if (this.isActiveTab == 1) {
          this.methodMasterList = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 1)
           this.methodMasterList =  [...new Set(this.methodMasterList)]
        } else {
          this.methodMasterList = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 2)
          this.methodMasterList =  [...new Set(this.methodMasterList)]
        }
      } else {
        // this.isLoading = new BehaviorSubject<boolean>(false);
      }
    });
  }

  public reportedOnMasterList: any = []
  getReportedOnMaster() {
    this.sharedservice.getReportedOnMaster().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.reportedOnMasterList = this.encrydecryresponse.data.responseObj
      }
    });
  }
  public sampleTypeDetailsMaster: any = []
  getSampleTypeDetails() {
    this.sharedservice.getSampleTypeDetails().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj
        if (this.isActiveTab == 1) {
          this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 1)
           this.sampleTypeDetailsMaster =  [...new Set(this.sampleTypeDetailsMaster)]
        } else {
          this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 2)
          this.sampleTypeDetailsMaster =  [...new Set(this.sampleTypeDetailsMaster)]
        }
         console.log("sampleTypeDetailsMaster: ", this.reportedOnMasterList);
      }
    });
  }

  totalPrice: any
  getTotalPrice() {
    this.totalPrice = 0;
    for (const item of this.addedCartItems) {
      this.totalPrice += item.testFees * item.quantity;
    }
    this.cartService.changePrice(this.totalPrice.toString())
    return this.totalPrice;
  }

  summaryPk: any;
  insertUpdateTestCartDetails(flag?: any) {
    if (localStorage.getItem('user')) {
      let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
      let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
      this.userid = userDecrypted.data.userid;
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
          }
        }),
        "flag": null
      }
      req.testDetails ? req.testDetails : []
      console.log(req);

      this.requestModel = new RequestModel()
      this.encrydecryresponse = new EncryptDecryptResponse()
      this.encrydecryresponse = this.encryptDecrypt.encryption(req)
      this.requestModel.payload = this.encrydecryresponse.data
      this.cartService.insertUpdateTestCartDetails(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
        this.responseModel = new ResponseModel()
        let clientSecret = response.headers.get('clientsecret')
        this.responseModel = response.body
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        if (this.encrydecryresponse.data.statusCode == 200) {
          this.getTestCartDetailsByUserId()
        } else {
          this.toastr.error(this.encrydecryresponse.data.responseObject.insertUpdateContinentMaster[0].MESSAGE)
        }
      });
    }
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
    this.cartService.getTestCartDetailsByUserId(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      this.cookieService.set('link', this.encrydecryresponse.data.responseObject[0].pdf)
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.summaryPk = this.encrydecryresponse.data.responseObject[0].SummaryPk
        if (this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray.length == 0) {
          this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = []
        } else {
          const isEmpty = Object.values(this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray[0]).every(x => x === 0 || x === '0');
          if (isEmpty) {
            this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = []
          }
        }
        if (this.encrydecryresponse.data?.responseObject[0]?.cartTestDetailsArray) {
          let filterData: any = this.encrydecryresponse.data?.responseObject[0]?.cartTestDetailsArray

          let newArr: any = []
          if (filterData.length > 0) {
            filterData.forEach((data: any) => {
              let filter: any = this.addedCartItems.every((obj: any) => data.TESTPK != obj.TESTPK)
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
              const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
              localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
              this.cartService.changeData((this.addedCartItems.length).toString())
            }, 100);
          } else {
            this.addedCartItems = this.addedCartItems
            this.cartService.changeData((this.addedCartItems.length).toString())
          }
        }
      }
    });
  }
  public departmentMasterList: any = []
  getDepartmentMaster() {

    // this.isLoading = new BehaviorSubject<boolean>(true);
    this.sharedservice.getDepartmentMaster().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        // this.isLoading = new BehaviorSubject<boolean>(false);
        this.departmentMasterList = this.encrydecryresponse.data.responseObj
        if (this.isActiveTab == 1) {
          this.departmentMasterList = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 1)
           this.departmentMasterList =  [...new Set(this.departmentMasterList)]
        } else {
          this.departmentMasterList = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 2)
          this.departmentMasterList =  [...new Set(this.departmentMasterList)]
        }
        // console.log("departmentMasterList: ", this.departmentMasterList);
      } else {
        // this.isLoading = new BehaviorSubject<boolean>(false);
      }
    });
  }
  public testDetails: any = []
  public testDetailsGlobal: any = []
  isLoading: boolean = false;
  public elasticSearchRequest: any = {}
  clusterName:any;
  orgId:any;
  getTestData() {
    
   if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
    this.clusterName= localStorage.getItem('clusterName');
    this.orgId= localStorage.getItem('orgId');
   }

   if (sessionStorage.getItem('tabName')) {
    if (sessionStorage.getItem('tabName') == 'Human') {
      this.isActiveTab = 1
      this.getDepartmentMaster();
      this.getSampleTypeDetails();
      this.getMethodMaster()
    } else {
      this.isActiveTab = 2
      this.getDepartmentMaster();
      this.getSampleTypeDetails();
      this.getMethodMaster()
    }
     console.log(this.isActiveTab,'isActiveTab');
  }

 
    this.getCartItems()
    this.isLoading = true;
    this.elasticSearchRequest = new ElasticRequestModel();
    this.elasticSearchRequest.locationName = this.selectedLocation ? this.selectedLocation : ""
    this.elasticSearchRequest.globalSearch = '';
    this.elasticSearchRequest.keyword = '';
    this.elasticSearchRequest.department = this.testForm.value.department ? this.testForm.value.department : ''
    this.elasticSearchRequest.categoryName = this.testForm.value.category ? this.testForm.value.category : ''
    this.elasticSearchRequest.methodName = this.testForm.value.method ? this.testForm.value.method : '';
    this.elasticSearchRequest.reportedOn = this.testForm.value.reportOn ? this.testForm.value.reportOn : ''
    this.elasticSearchRequest.diseasesName = ''
    this.elasticSearchRequest.specilityName = ''
    this.elasticSearchRequest.isAvtice = this.testForm.value.status ? this.testForm.value.status : ''
    this.elasticSearchRequest.flag = 1
    this.elasticSearchRequest.updated = ""
    this.elasticSearchRequest.testType = "PKG"
    this.elasticSearchRequest.popularFlag = ""
    this.elasticSearchRequest.newOne = "1"
    this.elasticSearchRequest.clusterName = this.clusterName;
    this.elasticSearchRequest.orgId = this.orgId;
    this.elasticSearchRequest.isGender = this.isActiveTab ;
    this.elasticSearchRequest.sampleType = this.testForm?.value?.sampleType ? this.testForm?.value?.sampleType : null ;
    if(this.testForm?.value?.nabl){
      let nabl:any=this.testForm?.value?.nabl == 1 ?  'Y' : 'N'
      this.elasticSearchRequest.nabl = nabl 
     }else{
      this.elasticSearchRequest.nabl = '' 
     }
  
   
    console.log("new pkg req: ", this.elasticSearchRequest);
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
      console.log("new pkg res: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.length > 0) {
        this.testDetails = this.encrydecryresponse.data.map((obj: any) => ({
          ...obj,
          'isAdded': false
        }));
        this.testDetails.sort((a: any, b: any) => {
          const dateA: any = new Date(
            a.TestCreatedDate.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")
          );
          const dateB: any = new Date(
            b.TestCreatedDate.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")
          );
          return dateB - dateA;
        });
        const cartItems: any = localStorage.getItem('cartItems');
        if (cartItems) {
          this.addedCartItems = JSON.parse(cartItems)
          this.addedCartItems.forEach((value: any) => {
            this.testDetails.map((val: any) => {
              if (value.TESTPK == val.TESTPK && value.orgId == val.orgId) {
                val.isAdded = true;
              }
            })
          })
        }
        this.testDetailsGlobal = this.testDetails;
      } else {
        this.testDetails = []
      }
    });
  }

  getCartItems() {
    const cartItems: any | null = localStorage.getItem('cartItems');
    if (cartItems?.length > 0) {
      let data: any = JSON.parse(cartItems);
      this.cartService.changeData((data.length).toString())
      data.forEach((val: any) => {
        this.testDetails.map((value: any) => {
          if (value.TESTPK == val.TESTPK && value.orgId == val.orgId) {
            value.isAdded = true;
          }
        });
      });
      return this.cartService.addedCartItem = JSON.parse(cartItems);
    } else {
      return [];
    }
  }

  viewMore() {
    this.isLoading = true;
    setTimeout(() => {
      this.showLimit = this.testDetails.length
      this.isLoading = false;
    }, 800)
  }

  viewLess() {
    this.isLoading = true;
    setTimeout(() => {
      this.showLimit = 12
      this.isLoading = false;
    }, 800)
  }

  searchInput = new FormControl();
  search() {
    if (this.searchInput.value) {
      this.testDetails = this.testDetailsGlobal
      let arr = this.testDetails
      this.testDetails = arr.filter((data: any) => data.testName.toString().toLowerCase().includes(this.searchInput.value.toString().toLowerCase()) || data.testCode.toString().toLowerCase().includes(this.searchInput.value.toString().toLowerCase()) || data?.testSchdule.toString().toLowerCase().includes(this.searchInput.value.toString().toLowerCase()) || data?.testFees.toString().toLowerCase().includes(this.searchInput.value.toString().toLowerCase()) || data?.ReportedOn.toString().toLowerCase().includes(this.searchInput.value.toString().toLowerCase()))
    }
    else {
      this.testDetails = this.testDetailsGlobal
      if (this.showLimit != 12) {
        this.showLimit = this.testDetailsGlobal.length
      }
    }
  }
  // formatTestFees(price: any) {
  //   return parseFloat(price != '' ? price : '').toLocaleString('en-IN', {
  //     maximumFractionDigits: 1,
  //     minimumFractionDigits: 1
  //   });;
  // }

  formatTestFees(price: any) {
    return Math.floor(price);
    // const parsedPrice = parseFloat(price);
    // return parsedPrice ? parsedPrice.toLocaleString('en-IN', {
    //   minimumFractionDigits: 2,  
    //   maximumFractionDigits: 2   
    // }) : '0.00';
  }
  async downloadPDF() {
    const doc:any = new jsPDF({ format: [800, 800],compress: true });

    // Calculate the text width
    let location = "METROPOLISEDOS_" + this.elasticSearchRequest.locationName;
    const textWidth = doc.getTextWidth(location);

    // Calculate the x-coordinate to center the text horizontally
    const xCoordinate = (doc.internal.pageSize.width - textWidth) / 2;

    // Add the text to the PDF with the calculated x-coordinate
    doc.text(location, xCoordinate, 10);

    // Convert the data array to a 2D array suitable for autotable
    const tableData = this.pdfList.map((item:any) => Object.values(item));

    // Define the columns for the table
    const columns = Object.keys(this.pdfList[0]);

    // Specify the width of each column (adjust the values as needed)

    // Style options
    const styles = {
        font: 'Helvetica', // font
        fontStyle: 'normal', // font style (normal, bold, italic)
        fontSize: 15, // font size in points
        halign: 'center', // Horizontal alignment
        valign: 'middle',
        overflow: 'linebreak', // overflow content behaviour
        lineWidth: 0.1, // line width for borders in units
        minCellWidth: 55, // Minimum width for cells
        minCellHeight: 10, // Minimum height for rows
    };

    // Define column styles to align specific columns
    const columnStyles = {
        // Example: Align the second column (index 1) to the left
        9: { halign: 'right' },
        1: { halign: 'left' },
        // 11: { halign: 'left' },

        // Add more as needed for other columns
    };

    // Wrap the autotable generation in a promise to simulate an asynchronous operation
    await new Promise<void>((resolve) => {
        // Generate the table using autotable with specified styles, column alignment, and column widths
        doc.autoTable({
            head: [columns], // Column headers
            body: tableData, // Table data
            styles: styles, // Apply styles
            columnStyles: columnStyles, // Apply column styles
            headStyles: { fillColor: [45, 65, 84] }, // Change header color to #2d4154
            didDrawPage: () => {
                resolve(); // Resolve the promise once the table is generated
            },
        });
    });

    // Save the PDF
    doc.save("METROPOLISEDOS_" + this.elasticSearchRequest.locationName);
    this.isLoading = false;
}

  pdfList: any = []
  getCataloguePdfView() {
    if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
      let clusterName: any = localStorage.getItem('clusterName');
      let orgId: any = localStorage.getItem('orgId');
      this.isLoading = true;
      let req = {
        "locationName": this.elasticSearchRequest.locationName,
        "clusterName": clusterName,
        "orgId": orgId
      }

      console.log(req);

      this.requestModel = new RequestModel()
      this.encrydecryresponse = new EncryptDecryptResponse()
      this.encrydecryresponse = this.encryptDecrypt.encryption(req)
      this.requestModel.payload = this.encrydecryresponse.data
      this.landingHomeService.getCataloguePdfView(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
        console.log(response, 'response');
        this.responseModel = new ResponseModel()
        let clientSecret = response.headers.get('clientsecret')
        this.responseModel = response.body
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        console.log(this.encrydecryresponse, ' this.encrydecryresponse');
        this.pdfList = this.encrydecryresponse.data
        this.downloadPDF()

      });
    }
  }

  modalRef?: BsModalRef; // for modal popup

  viewTestDetails:any;
  view_data(template: any, size: any,data:any) {
    // console.log(('model'));
    this.viewTestDetails=data
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered`,
    })
  }
  closeModal() {
    this.modalService.hide();
  }

  openSchedulePopup(template: any, size: any, data: any) {
    this.selectedScheduleTest = null;
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered`,
    });
    this.getViewScheduleAndTAT(data);
  }

  async getViewScheduleAndTAT(data: any): Promise<void> {
    const orgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId');
    const clusterName = localStorage.getItem('clusterName') || sessionStorage.getItem('clusterName');
    const req = {
      orgId: orgId,
      clusterName: clusterName,
      testCode: data.testCode
    };
    console.log('package viewScheduleAndTAT req:', req);
    this.requestModel = new RequestModel();
    this.encrydecryresponse = new EncryptDecryptResponse();
    this.encrydecryresponse = this.encryptDecrypt.encryption(req);
    this.requestModel.payload = this.encrydecryresponse.data;
    await this.landingHomeService.getViewScheduleAndTAT(this.requestModel, this.encrydecryresponse.iv).toPromise().then((response: any) => {
      this.responseModel = new ResponseModel();
      const clientSecret = response.headers.get('clientsecret');
      this.responseModel = response.body;
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log('package viewScheduleAndTAT res:', this.encrydecryresponse.data);
      const statusCode = this.encrydecryresponse.data?.statusCode;
      const message = this.encrydecryresponse.data?.message || 'No Record Found';

      if (statusCode === 404 || !this.encrydecryresponse.data) {
        this.selectedScheduleTest = { noData: true, message: message };
        return;
      }

      const resData = this.encrydecryresponse.data?.responseObject || this.encrydecryresponse.data;
      if (resData) {
        const dataArray = Array.isArray(resData) ? resData : [resData];
        const rawData = dataArray.find((item: any) =>
          item.testCode === data.testCode || item.TestCode === data.testCode
        ) || dataArray[0];
        const orgWiseInfo = rawData.OrgWiseInfo && rawData.OrgWiseInfo.length > 0
          ? rawData.OrgWiseInfo[0] : {};
        this.selectedScheduleTest = {
          noData: false,
          TestScheduleDays: orgWiseInfo.TestScheduleDays || '-',
          TestSchedule: orgWiseInfo.ScheduleName || '-',
          ReportedOn: orgWiseInfo.ReportedOn || '-',
          // ProcessingOrgName: rawData.processingLocationName || '-',
          // ProcessingOrgName: rawData.OrgName || rawData.processingLocationName || '-',
          ProcessingOrgName:rawData.ProcessingOrgName || '-',
          ReportTAT: rawData.ReportTAT || (orgWiseInfo.ProcessingTime ? `${orgWiseInfo.ProcessingTime} ${orgWiseInfo.Units || 'HRS'}` : '-')
        };
        console.log('✅ Mapped Data:', this.selectedScheduleTest);
        data.isLoading = false;
      }
    }, (error) => {
      console.error('❌ Error:', error);
      this.selectedScheduleTest = { noData: true, message: 'Something went wrong' };
      data.isLoading = false;
    });
  } 
}
