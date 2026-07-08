import { ChangeDetectorRef, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'ngx-cookie-service';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';

import { DiseaseService } from './disease.service';
import { LandingHomeService } from '../landing-home/landing-home.service';
import { FormControl, FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CartService } from '../cart/cart-service/cart.service';
import { ElasticRequestModel } from 'src/app/models/ElasticRequestModel';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-disease',
  templateUrl: './disease.component.html',
  styleUrls: ['./disease.component.css']
})
export class DiseaseComponent {
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  isLoading: boolean = false;
     get isMHLStaff(): boolean {
  return localStorage.getItem('usertype') === '3';
}
  letter: any = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#"];
  search_content: any = '';
  searchedFlag: any;
  popularSearchtItems: any = [];
  diseaseDetails: any = [];
  isActiveTab:any=1;

  customOptions: any = {
    loop: false,
    autoplay: false,
    center: false,
    touchDrag:true,
    dots: false,
    margin:10,
    navText: [
      '<img class="scroll-btn-left" src="assets/images/dos/scrol_left.png">',
      ' <img class="scroll-btn-right" src="/assets/images/dos/scrol_right.png">',
    ],
    autoHeight: false,
    autoWidth: true,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      1000: {
        items: 6,
      },
    },
    navSpeed: 10,
    nav:true,
  };

  clearDisease(){
    this.diseaseName=''
    this.diseaseService.changediseaseData(this.diseaseName)

  }

  private diseaseSubscription: Subscription;

  private tabSubscription: Subscription;
  constructor(
    private toastr: ToastrService, public tableChange: ChangeDetectorRef,private cartService: CartService, private landingHomeService: LandingHomeService, private navbarService: NavbarService, private cookieService: CookieService, private sharedservice: SharedService, private serviceMethod: PostmethodService, private encryptDecrypt: EncryptdecryptService, private router: Router, private modalService: BsModalService, private cdr: ChangeDetectorRef, private diseaseService: DiseaseService) {
   console.log(history.state);
   
      this.diseaseName=history.state.name ? history.state.name : '';
      console.log(this.diseaseName,'diseasename');
      
     setTimeout(() => {
      if(this.diseaseName){
        this.diseaseService.changediseaseData(this.diseaseName)
      }
      

      this.diseaseSubscription =  this.diseaseService.currentDiseaseData.subscribe((val:any)=>{
        //this.diseaseName=val
        console.log(this.diseaseName,'diseaseName');
        
        this.tabSubscription = this.navbarService.currentTab.subscribe((tab: any) => {
          if (sessionStorage.getItem('tabName')) {
            if (sessionStorage.getItem('tabName') == 'Human') {
              this.isActiveTab = 1
              this.getDiseaseMaster();
            } else {
              this.isActiveTab = 2;
              this.getDiseaseMaster();

            }
            console.log(this.isActiveTab, 'isActiveTab');
          }
        })
        
       
       })
     }, 300);
  
  }
  attuneFlag: boolean = localStorage.getItem('attune')?.toUpperCase() === 'Y';
  selectedScheduleTest: any = null;


  alphabets(e: any, event: any) {
    this.search_content = e;
    this.selectedPopularKeyWord = ''
    this.searchedFlag = 2
    this.getDiseaseData()
    $('.alphabets').map((e, l: any) => { $(l).removeClass('active') })
    $(event.target).addClass("active")
  }

  ngOnInit(): void {
    $(".main-menu.THRESHOLD.ssddropdown.Catalog a.main-menu-link").addClass('active')
    this.getPopularTestSearch()
    if (history.state.request) {
      this.selectedPopularKeyWord = history.state.request.keyword
      this.searchedFlag = history.state.request.flag
      this.search_content = history.state.request.globalSearch ? history.state.request.globalSearch : history.state.request.keyword
      this.getDiseaseData();
    }

    this.getDiseaseMaster();
    this.diseaseSubscription =  this.diseaseService.currentDiseaseData.subscribe((val:any)=>{
      this.diseaseName=val
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
     })

  }

  

  selectedPopularKeyWord: any = ''
  searchedValue(event: any) {
    this.selectedPopularKeyWord = ''
  }

  keypress(e: any) {
    this.searchedFlag = 1
  }

  remove(i: any) {
    if (this.popularSearchtItems.indexOf(i) > -1) { // only splice array when item is found
      this.popularSearchtItems.splice(this.popularSearchtItems.indexOf(i), 1); // 2nd parameter means remove one item only
    }
  }

  isSubmitting: boolean = false
  getSumptomsOnEnter(event: any) {
    if (this.search_content.length == 0 || this.search_content.trim().length == 0) {
      this.toastr.error("Please enter keywords to search!")
    } else {
      this.searchedFlag = 1
      this.isSubmitting = true;
      this.getDiseaseData()
    }
  }

  selectedPopularKey(data: any) {
    this.searchedFlag = 1
    this.selectedPopularKeyWord = data.keyword;
    this.search_content = this.selectedPopularKeyWord
    this.getDiseaseData()
  }

  navigateToOverviews(data: any) {
    console.log(data, 'data');

    this.router.navigate(["/Diseases"], { state: { id: data.diseasePkId, page: 'Diseases', name: data.DiseaseName, request: this.requestObject , tabName:'Diseases'} })
  }
  diseaseName:any='';
  getDiseaseName(diseaseName: any) {
      this.diseaseName = diseaseName;
      //this.diseaseService.changediseaseData(diseaseName)
      this.getTestData()
  }

  scrollRight() {
    const container = document.querySelector('.scroll-container') as HTMLElement;
    container.scrollBy({ left: 200, behavior: 'smooth' });
  }

  scrollLeft() {
    const container = document.querySelector('.scroll-container') as HTMLElement;
    container.scrollBy({ left: -200, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
   
    if (this.tabSubscription) {
      this.tabSubscription.unsubscribe();
    }
    if (this.diseaseSubscription) {
      this.diseaseSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.tabSubscription) {
      this.tabSubscription.unsubscribe();
    }
    if (this.diseaseSubscription) {
      this.diseaseSubscription.unsubscribe();
    }
  }

  myControl = new FormControl<string>('');
  filteredDiseaseList:any=[];
  requestObject: any = {}
  getDiseaseData() {
    this.diseaseDetails = []
    this.searchedWords = this.selectedPopularKeyWord ? this.selectedPopularKeyWord : this.search_content
    let requestObj: any = {
      "globalSearch": this.selectedPopularKeyWord ? '' : this.search_content ? this.search_content : '',
      "flag": this.searchedFlag,
      "keyword": this.selectedPopularKeyWord ? this.selectedPopularKeyWord : ''
    }
    this.requestObject = requestObj
    console.log("disease request::: ", requestObj);
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(requestObj)
    this.requestModel.payload = this.encrydecryresponse.data
    this.isLoading = true;
    this.diseaseService.getDiseases(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.isLoading = false;
      this.isSubmitting = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("disease response::: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.length > 0) {
        this.diseaseDetails = this.encrydecryresponse.data
       
        this.isSubmitting = false;
      }
    });
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    let filter = this.diseaseDetails.filter((diseases: any) => {
      return diseases.DiseaseName.toLowerCase().includes(filterValue)
    }
    );
    return filter; 
  }                      
  getDiseaseMaster() {
    // this.isLoading = new BehaviorSubject<boolean>(true);
    this.landingHomeService.getDiseaseMaster().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data);
      // this.isLoading = new BehaviorSubject<boolean>(false);
      this.diseaseDetails = this.encrydecryresponse.data
      if (this.isActiveTab == 1) {
        this.diseaseDetails = this.encrydecryresponse.data.filter((val: any) => val.isGender == 1)
         this.diseaseDetails =  [...new Set(this.diseaseDetails)]
      } else {
        this.diseaseDetails = this.encrydecryresponse.data.filter((val: any) => val.isGender == 2)
        this.diseaseDetails =  [...new Set(this.diseaseDetails)]
      }
        // Remove duplicates by sampleType name (assuming sampleType is the name you want to use to filter)
        const uniqueSampleTypes = this.diseaseDetails.filter((value: { DiseaseName: any; }, index: any, self: any[]) =>
          index === self.findIndex((t: { DiseaseName: any; }) => (
              t.DiseaseName === value.DiseaseName
          ))
      );

      this.diseaseDetails = [...uniqueSampleTypes];
      
      this.filteredDiseaseList=this.diseaseDetails
      this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value || ''))
      )
      .subscribe(filtered => {
        this.filteredDiseaseList = filtered;
      });
      console.log("diseaseMasterList: ", this.diseaseDetails);

    });
  }

  searchedWords: any = ''
  getPopularTestSearch() {
    // this.isLoading = new BehaviorSubject<boolean>(true);
    this.diseaseService.getPopularDisease().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("popularSearchtItems: ", JSON.stringify(this.encrydecryresponse.data));
      this.popularSearchtItems = this.encrydecryresponse.data
    });
  }
  private dataSubscription: Subscription;
  
  public list_view: any = true;
  public testStatusMaster = [{ "value": "Y", "name": "Active" }, { "value": "N", "name": "Inactive" }]
  public addedCartItems: any = []
  selectedLocation: any = ''
  userid: any;
  locationId: any
  public testForm: any
  showLimit: any = 12
  specialityName: any;
 
 

 

  createForm() {
    this.testForm = new FormGroup({
      department: new FormControl(''),
      category: new FormControl(''),
      method: new FormControl(''),
      reportOn: new FormControl(''),
      status: new FormControl(''),
      disease: new FormControl(''),
      speciality: new FormControl(''),
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
    this.router.navigate(["/overview"], { state: { testPk: data.TESTPK, orgId: data.orgId, location: this.selectedLocation, isAdded: data.isAdded, fromPage: "diseases", name: this.diseaseName, item: data, tabName:'Diseases' } })
  }



//  async addToCart(item: any) {
//     item.isLoading = true;
//     await this.getViewScheduleAndTAT(item);
//     item.ReportTAT = this.selectedScheduleTest?.ReportTAT;
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

  getMasterData() {
    // this.getDepartmentMaster();
    // this.getCategoryMaster();
    // this.getMethodMaster();
    // this.getReportedOnMaster();
    // this.getSampleTypeDetails();
  }

  public departmentMasterList: any = []
  getDepartmentMaster() {

    this.sharedservice.getDepartmentMaster().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        // this.isLoading = new BehaviorSubject<boolean>(false);
        this.departmentMasterList = this.encrydecryresponse.data.responseObj
      } else {
        // this.isLoading = new BehaviorSubject<boolean>(false);
      }
    });
  }

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
  nablList:any=[{id:1,nabl:'Yes'},{id:2,nabl:'No'}]

  public sampleTypeDetailsMaster: any = []
  getSampleTypeDetails() {
    this.sharedservice.getSampleTypeDetails().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj
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

  public testDetails: any = []
  public testDetailsGlobal: any = []
  public elasticSearchRequest: any = {}
  clusterName: any;
  orgId: any;
  getTestData() {

   

    if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
      this.clusterName = localStorage.getItem('clusterName');
      this.orgId = localStorage.getItem('orgId');
    }
    if (sessionStorage.getItem('tabName')) {
      if (sessionStorage.getItem('tabName') == 'Human') {
        this.isActiveTab = 1
      } else {
        this.isActiveTab = 2
      }
       console.log(this.isActiveTab,'isActiveTab');
    }
    if(sessionStorage.getItem('location') || localStorage.getItem('location')){
      let location :any= sessionStorage.getItem('location') || localStorage.getItem('location')
      this.selectedLocation = location
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
    this.elasticSearchRequest.diseasesName = this.diseaseName !='0' ? this.diseaseName : ''
    this.elasticSearchRequest.specilityName = this.specialityName ? this.specialityName : ''
    this.elasticSearchRequest.isAvtice = this.testForm.value.status ? this.testForm.value.status : ''
    this.elasticSearchRequest.flag = 1
    this.elasticSearchRequest.newOne = ""
    this.elasticSearchRequest.testType = ""
    this.elasticSearchRequest.popularFlag = "",
      this.elasticSearchRequest.clusterName = this.clusterName;
    this.elasticSearchRequest.orgId = this.orgId;
    this.elasticSearchRequest.isGender = this.isActiveTab ;
  this.elasticSearchRequest.sampleType=''
    this.elasticSearchRequest.nabl=''
    console.log("new test req: ", this.elasticSearchRequest);
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
      console.log("new test res: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.length > 0) {
        this.testDetails = this.encrydecryresponse.data.map((obj: any) => ({
          ...obj,
          'isAdded': false
        }));
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
    const doc: any = new jsPDF({ format: [800, 800], compress: true });

    // Calculate the text width
    let location = "METROPOLISEDOS_" + this.elasticSearchRequest.locationName;
    const textWidth = doc.getTextWidth(location);

    // Calculate the x-coordinate to center the text horizontally
    const xCoordinate = (doc.internal.pageSize.width - textWidth) / 2;

    // Add the text to the PDF with the calculated x-coordinate
    doc.text(location, xCoordinate, 10);

    // Convert the data array to a 2D array suitable for autotable
    const tableData = this.pdfList.map((item: any) => Object.values(item));

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

  viewTestDetails:any;
  modalRef?: BsModalRef; // for modal popup

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
    console.log('disease viewScheduleAndTAT req:', req);
    this.requestModel = new RequestModel();
    this.encrydecryresponse = new EncryptDecryptResponse();
    this.encrydecryresponse = this.encryptDecrypt.encryption(req);
    this.requestModel.payload = this.encrydecryresponse.data;
    await this.landingHomeService.getViewScheduleAndTAT(this.requestModel, this.encrydecryresponse.iv).toPromise().then((response: any) => {
      this.responseModel = new ResponseModel();
      const clientSecret = response.headers.get('clientsecret');
      this.responseModel = response.body;
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log('disease viewScheduleAndTAT res:', this.encrydecryresponse.data);
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
          TestScheduleDays: orgWiseInfo.TestScheduleDays || '',
          TestSchedule: orgWiseInfo.ScheduleName || '',
          ReportedOn: orgWiseInfo.ReportedOn || '',
          // ProcessingOrgName: rawData.processingLocationName || '-',
          // ProcessingOrgName: rawData.OrgName || rawData.processingLocationName || '-',
          ProcessingOrgName:rawData.ProcessingOrgName || '-',
          ReportTAT: rawData.ReportTAT || (orgWiseInfo.ProcessingTime ? `${orgWiseInfo.ProcessingTime} ${orgWiseInfo.Units || 'HRS'}` : '')
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
