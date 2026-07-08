import { OnInit, ChangeDetectorRef, Component, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { LandingHomeService } from './landing-home.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { TableRequestModel } from 'src/app/models/TableRequestModel';
import { SharedService } from 'src/app/shared/shared.service';
import { FormControl, FormGroup } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../cart/cart-service/cart.service';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';
import { ElasticRequestModel } from 'src/app/models/ElasticRequestModel';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { __values } from 'tslib';
import { filter } from 'rxjs/operators';
import { Table } from 'primeng/table';
import * as $ from 'jquery';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as pako from 'pako'; // Import pako for compression
import { DiseaseService } from '../disease/disease.service';
import { environment } from 'src/environments/environment';
interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}
@Component({
  selector: 'app-landing-home',
  templateUrl: './landing-home.component.html',
  styleUrls: ['./landing-home.component.css']
})
export class LandingHomeComponent implements OnInit {
  @ViewChild('scroll', { static: true }) scroll: ElementRef;

  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  public tableRequestModel: TableRequestModel = new TableRequestModel();
  private dataSubscription: Subscription;
  private dataSubscription1: Subscription;
  private dataAlphabetSubs: Subscription;
  private tabSubscription: Subscription;
  private masterSubscription: Subscription;
  get isMHLStaff(): boolean {
  return localStorage.getItem('usertype') === '3';
}
  isLoading: boolean = false;
  modalRef?: BsModalRef; // for modal popup
  search_active: any = false;
  search_content: any = '';
  popularSearchtItems: any = [];
  letter: any = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#"];
  open_Modal = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-md',
  };
  customOptions: any = {
    loop: true,
    autoplay: true,
    center: true,
    dots: true,
    autoHeight: false,
    autoWidth: false,
    responsive: {
      0: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
    navSpeed: 10,
  };
  reponsive_table: any = {}
  public testStatusMaster = [{ "value": "Y", "name": "Active" }, { "value": "N", "name": "Inactive" }]
  public testForm: any
  public addedCartItems: any = []
  public cartItems: any = []
  public testDetails: any = []
  public elasticSearchRequest: any = {}
  showTable: any = true;
  userid: any;
  public locationId: any
  public locationName: any

  public notificationList: any = []
  public showPaginator: boolean = false;
  first: number = 0;
  totalRecords: number;
  rows: number = 20;
  options: { label: string; value: number }[] = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 }
  ];
  items: any;

  selectedItem: any;

  suggestions: any;
  loading: boolean = false;
  public url:any;
  search(event: AutoCompleteCompleteEvent) {
    this.router.navigate(['/']);
    console.log('complete search');
    this.selectSearchKeyWord = event.query
    if (event.query.trim().length >= 3) {
      let reqgetGloalSearchData = {
        "globalSearch": event.query,
        "orgId": localStorage.getItem('orgId') || sessionStorage.getItem('orgId'),
        "clusterName": localStorage.getItem('clusterName') || sessionStorage.getItem('clusterName'),
        "isGender" : this.isActiveTab 
      }
      console.log(reqgetGloalSearchData, 'reqgetGloalSearchData');

      this.isLoading = false;

      this.requestModel = new RequestModel()
      this.encrydecryresponse = new EncryptDecryptResponse()
      this.encrydecryresponse = this.encryptDecrypt.encryption(reqgetGloalSearchData)
      this.requestModel.payload = this.encrydecryresponse.data

      this.landingHomeService.getGloalSearchData(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
        this.responseModel = new ResponseModel()
        let clientSecret = response.headers.get('clientsecret')
        this.responseModel = response.body
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        console.log("getCatalogNotificationdetails res: ", this.encrydecryresponse);
        // console.log("getCatalogNotificationdetails res: ", this.encrydecryresponse.data);

        if (this.encrydecryresponse.data) {
          // console.log("test")
          this.suggestions = [...this.encrydecryresponse.data].map(item => item.testCode  + '-' + '(' + item.testName + ')');
          // this.encrydecryresponse.data.forEach((value :any)=>{
          //   this.suggestions.push(value.testName)
          // })
          // this.suggestions = this.encrydecryresponse.data
          this.isLoading = false;
          this.notificationList = this.encrydecryresponse.data
          console.log(this.notificationList, "this.notificationList")
        }
      });
    }
    else {
      console.log(event);

      this.testDetails = [];
      this.searchedWords = ''
      this.search_active = false;
      this.isLoading = false;

    }

  }
  isActiveTab:any=1
  constructor(private toastr: ToastrService, private diseaseService:DiseaseService,
    public tableChange: ChangeDetectorRef, private navbarService: NavbarService, private cartService: CartService, private cookieService: CookieService, private sharedservice: SharedService, private serviceMethod: PostmethodService, private encryptDecrypt: EncryptdecryptService, private router: Router, private modalService: BsModalService, private cdr: ChangeDetectorRef, private landingHomeService: LandingHomeService) {
    
  

    this.tabSubscription= this.navbarService.currentTab.subscribe((tab:any)=>{
      console.log('00001');
      
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
      }
     })

   

   const url:any=window.location.pathname.split('/')[1];
   this.url=url;
   console.log(url,'url');
   

    this.locationId = this.cookieService.get('locationId')
    console.log(this.locationId, "this.locationId");
    if (this.cookieService?.get('location')) {
      this.locationName = JSON.parse(this.cookieService?.get('location'))
      console.log(this.locationName, "this.locationName");
    }


    // Total number of records
    this.totalRecords = this.notificationList.length;
  }

  currentPath: any = ''

  getCurrentPath() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      console.log(event, 'event');
      this.currentPath = event.url
      console.log('Current path:', event.url);
    });
  }

  navigateToLandingPage() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(["/landing"], { state: { name: '' } });
    });
  }







  pdfList: any = []
  public data: any = [];
  selectedLocation: any = ''
  ngOnInit(): void {
    // Fetch data from backend or any data source

    this.getMasterData();
    this.initializeTable();
    this.createForm();
    this.getCartItems();
    //get Location data
    // this.navbarService.currentLocationData.subscribe((res: any) => {
    //   console.log(res,'res');
    //   this.selectedLocation = res
    // })


    this.navbarService.currentLocationData.subscribe((res: any) => {
      console.log(res,'res');
      this.selectedLocation = res;
      // Re-read attune flag whenever location changes
      // this.attuneFlag = localStorage.getItem('attune') === 'Yes';
      this.attuneFlag = localStorage.getItem('attune')?.toUpperCase() === 'Y';
      if (res) {                     
  this.getLocationMaster();       
} 

  const currentOrgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId');
  const currentLocationId = this.cookieService.get('locationId');

  const cartItems = localStorage.getItem('cartItems');
  if (cartItems) {
    const filtered = JSON.parse(cartItems).filter((item: any) =>
      item.orgId == currentOrgId && item.locationId == currentLocationId
    );
    localStorage.setItem('cartItems', JSON.stringify(filtered));
    this.cartService.addedCartItem = filtered;
    this.cartService.changeData(filtered.length.toString());
  }

  this.getCartItems(); 
    })


    this.dataSubscription = this.navbarService.currentNavbarSearchedData.subscribe((res: any) => {
      this.searchedFlag = 1
      this.selectSearchKeyWord = res
      let searchTest = res.replace(/[-,\/:$&@!+=^%-]/g, ' ')
      this.search_content = searchTest
      console.log(searchTest, 'res');
      if (this.search_content != '') {
      if(this.url!=='banner')
      {
        
        this.getTestData()

      }
      }
    })
this.dataSubscription1= this.navbarService.currentData.subscribe((res: any) => {
    
      console.log(res, 'res');
      this.getCurrentPath()
      console.log(this.currentPath, 'this.currentPath');
      this.selectedPopularKeyWord=''
      // this.search_content= this.search_content ? this.search_content : ""
      if (res == "location" && !this.currentPath || res == "location" && this.currentPath == '/'  ) {
        if(this.url !== 'banner'){
          
        this.getTestData()
        }
      }
    })
    this.dataAlphabetSubs = this.navbarService.currentAlphabetSearchedData.subscribe((res: any) => {
      this.searchedFlag = 2
      this.selectedPopularKeyWord = ''
      console.log(res, 'res..');
      this.search_content = res;
       if(this.url!=='banner' && res)
      {
        this.getTestData()

      }
    })

    this.locationId = this.cookieService.get('locationId')
    console.log(this.locationId, "this.locationId");
    if (localStorage.getItem('user')) {
      let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
      // console.log(userEncrypted, 'userEncrypted ');
      let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
      console.log(userDecrypted, 'userDecrypted');
      this.userid = userDecrypted.data.userid;
      let locationId = sessionStorage.getItem('locationId'); sessionStorage.getItem('locationId')
        ? sessionStorage.getItem('locationId') : localStorage.getItem('locationId');
      this.locationId = locationId;
      this.locationId = this.cookieService.get('locationId')
      this.getTestCartDetailsByUserId()

      this.showPaginator = false;
    }
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.dataSubscription1) {
      this.dataSubscription1.unsubscribe();
    }

    if (this.dataAlphabetSubs) {
      this.dataAlphabetSubs.unsubscribe();
    }

    if (this.tabSubscription) {
      this.tabSubscription.unsubscribe();
    }
  }

  // getCartItems() {
  //   const cartItems: any | null = localStorage.getItem('cartItems');
  //   if (cartItems?.length > 0) {
  //     let data: any = JSON.parse(cartItems);
  //     this.cartService.changeData((data.length).toString())
  //     data.forEach((val: any) => {
  //       this.testDetails.map((value: any) => {
  //         if (value.TESTPK == val.TESTPK && value.orgId == val.orgId) {
  //           value.isAdded = true;
  //         }
  //       });
  //       //console.log(this.testDetails, 'testDetails');
  //     });
  //     return this.cartService.addedCartItem = JSON.parse(cartItems);
  //   } else {
  //     return [];
  //   }
  // }



//   async addToCart(item: any) {
//     // debugger
//     // if(this.selectedScheduleTest)
//     // {
//     item.isLoading = true;
//      await this.getViewScheduleAndTAT(item);
//       item.ReportTAT=this.selectedScheduleTest?.ReportTAT 
//     // }
//     if (!localStorage.getItem('user')) {
//       if (item.isAdded) {
//         item.isAdded = false;
//         this.cartService.addedCartItem = this.cartService.addedCartItem.filter((val: any) => val.TESTPK != item.TESTPK)
//         localStorage.setItem('cartItems', JSON.stringify(this.cartService.addedCartItem));
//         this.cartService.changeData((this.cartService.addedCartItem.length).toString())
//         this.cartService.addedCartItem = this.cartService.addedCartItem
//         this.getTotalPrice()
//       } else {
//        item.isAdded = true;
// item.quantity = 1
// item.total = item.testFees;
// const now = new Date();
// const day = String(now.getDate()).padStart(2, '0');
// const month = now.toLocaleString('en-GB', { month: 'short' });
// const year = now.getFullYear();
// const hours = String(now.getHours()).padStart(2, '0');
// const minutes = String(now.getMinutes()).padStart(2, '0');
// const seconds = String(now.getSeconds()).padStart(2, '0');
// item.timeOfAddition = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
//         this.cartService.addedCartItem.push(item)
//         localStorage.setItem('cartItems', JSON.stringify(this.cartService.addedCartItem));
//         this.cartService.changeData((this.cartService.addedCartItem.length).toString())
//         this.cartService.addedCartItem = this.cartService.addedCartItem
//         this.getTotalPrice()
//       }
//     } else {
//       if (item.isAdded) {
//         item.isAdded = false;
//         this.addedCartItems = this.addedCartItems.filter((val: any) => val.TESTPK != item.TESTPK)
//         this.cartService.addedCartItem = this.cartService.addedCartItem.filter((val: any) => val.TESTPK != item.TESTPK)
//         localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
//         this.addedCartItems = this.cartService.addedCartItem
//         setTimeout(() => {
//           this.cartService.changeData((this.addedCartItems.length).toString())
//         }, 100)
//         this.getTotalPrice()
//         this.insertUpdateTestCartDetails();
//       } else {
//         this.getTestCartDetailsByUserId();
//      item.isAdded = true;
// item.quantity = 1
// item.total = item.testFees;
// const now = new Date();
// const day = String(now.getDate()).padStart(2, '0');
// const month = now.toLocaleString('en-GB', { month: 'short' });
// const year = now.getFullYear();
// const hours = String(now.getHours()).padStart(2, '0');
// const minutes = String(now.getMinutes()).padStart(2, '0');
// const seconds = String(now.getSeconds()).padStart(2, '0');
// item.timeOfAddition = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
//         this.cartService.addedCartItem.push(item)
//         this.addedCartItems.push(item)
//         localStorage.setItem('cartItems', JSON.stringify(this.cartService.addedCartItem));
//         this.addedCartItems = this.cartService.addedCartItem
//         this.cartService.changeData((this.cartService.addedCartItem.length).toString())
//         this.getTotalPrice()
//         this.insertUpdateTestCartDetails();
//       }
//     }

//   }

// REPLACE line 349–366:
getCartItems() {
  const cartItems: any | null = localStorage.getItem('cartItems');


  this.testDetails.map((value: any) => value.isAdded = false);

  if (cartItems?.length > 0) {
    const allItems: any[] = JSON.parse(cartItems);

    const currentOrgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId');
    const currentLocationId = this.cookieService.get('locationId');

    const filteredItems = allItems.filter((item: any) =>
      item.orgId == currentOrgId && item.locationId == currentLocationId
    );

    this.cartService.changeData(filteredItems.length.toString());

    filteredItems.forEach((val: any) => {
      this.testDetails.map((value: any) => {
        if (value.TESTPK == val.TESTPK && value.orgId == val.orgId) {
          value.isAdded = true;
        }
      });
    });

    return this.cartService.addedCartItem = filteredItems;
  } else {
    return [];
  }
}


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
      item.quantity = 1;
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
      item.quantity = 1;
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



  detectChanges() {
    this.showTable = false;
    this.tableChange.detectChanges()
    this.showTable = true;
    this.initializeTable();
    this.tableChange.detectChanges()
  }

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


  selectedPopularKeyWord: any = ''
  selectedPopularKey(data: any) {
    this.searchedFlag = 1
    this.search_active = true;
    this.selectedPopularKeyWord = data.keyword;
    this.search_content = this.selectedPopularKeyWord
    this.selectSearchKeyWord = ''

    this.getTestData()
  }

  alphabets(e: any, event: any) {
    this.router.navigate(['/']);
    this.search_active = true;
    this.search_content = e;
    this.selectedPopularKeyWord = ''
    this.searchedFlag = 2
    this.selectSearchKeyWord = ''
    
    this.getTestData()
    $('.alphabets').map((e, l: any) => { $(l).removeClass('active') })
    $(event.target).addClass("active")
  }

  searchedFlag: any;
  searchContent: any;
  searchedValue(event: any) {
    this.router.navigate(['/']);
    console.log(event, 'event');
    let test = this.selectedItem.split('-')
    console.log(test, 'test');


    if (test.length > 1) {
      this.search_content = this.selectedItem.replace(/[-,\/:$&@!+=*^%-]/g, ' ').replace('#', '')

    } else {
      this.search_content = this.selectedItem.replace(/[-,\/:$&@!+=^%-]/g, ' ') .replace(/\s+/g, ' ') 
      .replace(/\s+$/, '');              
    }
    console.log(this.search_content, 'this.search_content');
    this.selectedPopularKeyWord = ''
  }

  keypress(e: any) {
    // if (e.key === "Enter") {
    //   var txt: any = document.getElementById("chipset");
    //   let val = txt.value;
    //   if (val !== "") {
    //     if (this.popularSearchtItems.indexOf(val) >= 0) {
    //       // alert("Tag name is a duplicate");
    //     } else {
    //       this.popularSearchtItems.unshift(val);
    //       txt.value = "";
    //       txt.focus();
    //     }
    //   } else {
    //     // alert("Please type a tag Name");
    //   }
    // }
    console.log('keypress');

    this.searchedFlag = 1
    this.isLoading = false;
this.router.navigate(['/']);

  }

  selectSearchKeyWord: any;
  onSelectGlobal($event: any) {
    this.router.navigate(['/']);
    // console.log('seonSelectGloballect', $event);
    this.selectSearchKeyWord = $event;
    this.search_content= $event
    this.search_content = $event.replace(/[-\/:$&@!+=*^%-]/g, ' ').replace('#', '')
    console.log(this.search_content, 'this.search_content');
    this.searchedFlag = 1
    this.isSubmitting = true;
    
    this.getTestData()
    this.navbarService.clearGlobalSearchfn(true);
  }

  remove(i: any) {
    if (this.popularSearchtItems.indexOf(i) > -1) { // only splice array when item is found
      this.popularSearchtItems.splice(this.popularSearchtItems.indexOf(i), 1); // 2nd parameter means remove one item only
    }
  }

  initializeTable() {
    this.reponsive_table = {
      initComplete: function () {
        let TableID = 'rolemanageweb_fix'
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
      dom: 't<"dos_pagination"p>',
      pagingType: 'full_numbers',
      autoWidth: false,
      pageLength: 100,
      responsive: true,
      lengthMenu: [10, 25, 50, 100],
      processing: true,
      columnDefs: [{
        'targets': [9], /* 0 to 6 */
        'orderable': false,
      }],
      language: {
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

  add_cart(e: any, data: any) {
    if (data.isAdded) {
      data.isAdded = false
    } else {
      data.isAdded = true
    }
  }

  nablList:any=[{id:1,nabl:'Yes'},{id:2,nabl:'No'}]

  getMasterData() {
    this.getDepartmentMaster();
    //this.getCategoryMaster();
    this.getMethodMaster();
    //this.getDiseaseMaster();
    this.getSpecilityTestMaster();
    //this.getReportedOnMaster();
    this.getSampleTypeDetails();
    this.getPopularTestSearch();
    this.getLocationMaster();
    this.getBanners();

    //this.getCatalogNotificationdetails();

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

  public categoryMasterList: any = []
  getCategoryMaster() {
    // this.isLoading = new BehaviorSubject<boolean>(true);
    this.sharedservice.getCategoryMaster().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        // this.isLoading = new BehaviorSubject<boolean>(false);
        this.categoryMasterList = this.encrydecryresponse.data.responseObj
        console.log("categoryMasterList: ", this.categoryMasterList);
      } else {
        // this.isLoading = new BehaviorSubject<boolean>(false);
      }
    });
  }

  public methodMasterList: any = []
  getMethodMaster() {
    // this.isLoading = new BehaviorSubject<boolean>(true);
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

  public diseaseMasterList: any = []
  getDiseaseMaster() {
    // this.isLoading = new BehaviorSubject<boolean>(true);
    this.landingHomeService.getDiseaseMaster().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data);


      // this.isLoading = new BehaviorSubject<boolean>(false);
      this.diseaseMasterList = this.encrydecryresponse.data
      console.log("diseaseMasterList: ", this.diseaseMasterList);

    });
  }

  public specialityMasterList: any = []
  getSpecilityTestMaster() {

    this.landingHomeService.getSpecilityTestMaster().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      // console.log("specialityMasterList: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.specialityMasterList = this.encrydecryresponse.data.responseObj
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
        // console.log("reportedOnMasterList: ", this.reportedOnMasterList);
      }
    });
  }

  // public sampleTypeDetailsMaster: any = []
  // getSampleTypeDetails() {
  //   this.sharedservice.getSampleTypeDetails().subscribe((response: any) => {
  //     this.responseModel = new ResponseModel()
  //     let clientSecret = response.headers.get('clientsecret')
  //     this.responseModel = response.body
  //     this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
  //     if (this.encrydecryresponse.data.statusCode == 200) {
  //       this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj
  //       if (this.isActiveTab == 1) {
  //         this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 1)
  //          this.sampleTypeDetailsMaster =  [...new Set(this.sampleTypeDetailsMaster)]
  //       } else {
  //         this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 2)
  //         this.sampleTypeDetailsMaster =  [...new Set(this.sampleTypeDetailsMaster)]
  //       }
  //        console.log("sampleTypeDetailsMaster: ", this.sampleTypeDetailsMaster);
  //     }
  //   });
  // }
  public sampleTypeDetailsMaster: any = []
  getSampleTypeDetails() {
    this.sharedservice.getSampleTypeDetails().subscribe((response: any) => {
        this.responseModel = new ResponseModel();
        let clientSecret = response?.headers?.get('clientsecret');
        if (clientSecret){
            this.responseModel = response.body;
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);

        if (this.encrydecryresponse.data.statusCode == 200) {
            this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj;

            // Filter by gender based on active tab
            if (this.isActiveTab == 1) {
                this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 1);
            } else {
                this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj.filter((val: any) => val.isGender == 2);
            }

            // Remove duplicates by sampleType name (assuming sampleType is the name you want to use to filter)
            const uniqueSampleTypes = this.sampleTypeDetailsMaster.filter((value: { sampleType: any; }, index: any, self: any[]) =>
                index === self.findIndex((t: { sampleType: any; }) => (
                    t.sampleType === value.sampleType
                ))
            );

            this.sampleTypeDetailsMaster = [...uniqueSampleTypes];

            console.log("sampleTypeDetailsMaster: ", this.sampleTypeDetailsMaster);
        }
        }
        else {
          this.loading = false;
        }
      
    });
}


  public popularTestMasterList: any = []
  getPopularTestSearch() {
    // this.isLoading = new BehaviorSubject<boolean>(true);
    this.landingHomeService.getPopularTestSearch().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      //   console.log("getPopularTestSearch: ", JSON.stringify(this.encrydecryresponse.data));
      this.popularSearchtItems = this.encrydecryresponse.data
    });
  }

  // public locationMasterList: any = []
  // getLocationMaster() {
  //   // this.isLoading = new BehaviorSubject<boolean>(true);
  //   this.landingHomeService.getB2cLocationMaster().subscribe((response: any) => {
  //     this.responseModel = new ResponseModel()
  //     let clientSecret = response.headers.get('clientsecret')
  //     this.responseModel = response.body
  //     this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
  //     if (this.encrydecryresponse.data.statusCode == 200) {
  //       this.locationMasterList = this.encrydecryresponse.data.responseObject.getB2cLocationMaster
  //     }
  //   });
  // }


  // karthick 
  // india location change

  public locationMasterList: any = [];
public filteredLocationList: any = [];
public domainType: string = environment.domainType;
// Domain type detection based on URL
getDomainType(): string {
  const url = window.location.href.toLowerCase();

  if (url.includes('india')) {
    return this.domainType;
  }
  return this.domainType; // this project is international only
}

getLocationMaster() {
  // debugger
  const domainType = this.domainType; // this project is international only

  let req = {
    domainType: domainType
  };

  this.requestModel = new RequestModel();
  this.encrydecryresponse = new EncryptDecryptResponse();
  this.encrydecryresponse = this.encryptDecrypt.encryption(req);
  this.requestModel.payload = this.encrydecryresponse.data;

  this.landingHomeService.getB2cLocationMaster(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
    // debugger
    this.responseModel = new ResponseModel();
    let clientSecret = response.headers.get('clientsecret');
    this.responseModel = response.body;
    this.encrydecryresponse = this.encryptDecrypt.decryption(
      this.responseModel.responseData,
      clientSecret
    );

    if (this.encrydecryresponse.data.statusCode == 200) {
      // debugger
      this.locationMasterList =
        this.encrydecryresponse.data.responseObject.getB2cLocationMaster;
      // ✅ Filter only INT locations
      // this.filteredLocationList = this.locationMasterList.filter(
      //   (location: any) => location.domainType?.toUpperCase() === 'INT'
      // );

       const currentOrgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId');
  const currentLocation = this.locationMasterList.find((loc: any) => loc.orgId == currentOrgId);
  if (currentLocation) {
    localStorage.setItem('attune', currentLocation.attune?.toUpperCase() === 'Y' ? 'Y' : 'N');
    this.attuneFlag = currentLocation.attune?.toUpperCase() === 'Y';
    console.log('attune updated:', this.attuneFlag);
  }
      
    }

    console.log(response, 'locationMasterList'); 
  });
}


  public bannnersList: any = []
  getBanners() {
    this.landingHomeService.getBanner().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.bannnersList = this.encrydecryresponse.data.responseObject.getCatalogBannerMaster
      }
    });
  }

  isSubmitting: boolean = false
  getTestOnEnter(event: any) {

    console.log('getTestOnEnter');

    if (event.target?.value == 0 || event.target?.value?.trim().length == 0) {

      this.toastr.error("Please enter keywords to search!")
    } else {
      this.selectSearchKeyWord =  event.target.value ;
       console.log(this.selectSearchKeyWord,'keyword')
      this.searchedFlag = 1
      this.isSubmitting = true;
      
      this.getTestData();
      this.navbarService.clearGlobalSearchfn(true);    
      this.router.navigate(['/']); 
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes, 'change');

    if (changes.hasOwnProperty('data')) {
      
      if(this.url!=='banner')
      {
        
        this.getTestData()

      }
    }
  }

  searchedWords: any = ''
  clusterName: any;
  orgId: any;
  location:any=''

  getTestData() {

    if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
      this.clusterName = localStorage.getItem('clusterName');
      this.orgId = localStorage.getItem('orgId');
    }
    if (sessionStorage.getItem('clusterName') || sessionStorage.getItem('orgId')) {
      this.clusterName = sessionStorage.getItem('clusterName');
      this.orgId = sessionStorage.getItem('orgId');
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
    }
  
    if(sessionStorage.getItem('location')  || localStorage.getItem('location')){
        this.location = sessionStorage.getItem('location')
        this.location = localStorage.getItem('location')
    }

    console.log(this.isActiveTab,'isActiveTab');
    this.searchedWords = this.selectedPopularKeyWord ? this.selectedPopularKeyWord : this.search_content
    this.isLoading = true;
    this.search_active = true;
    this.elasticSearchRequest = new ElasticRequestModel();
    this.elasticSearchRequest.locationName = this.selectedLocation ? this.selectedLocation : this.location
    this.elasticSearchRequest.globalSearch = this.selectedPopularKeyWord ? '' : this.search_content ? this.search_content : '';
    this.elasticSearchRequest.keyword = this.selectedPopularKeyWord ? this.selectedPopularKeyWord : '';
    this.elasticSearchRequest.department = this.testForm?.value?.department ? this.testForm?.value?.department : ''
    this.elasticSearchRequest.categoryName = this.testForm?.value?.category ? this.testForm?.value?.category : ''
    // this.elasticSearchRequest.methodName = this.testForm.value?.method?.length == 0 || this.testForm.value?.method == null ? '' : this.testForm.value.method;
     this.elasticSearchRequest.methodName = this.testForm?.value?.method ? this.testForm?.value?.method : ''
    this.elasticSearchRequest.reportedOn = this.testForm?.value?.reportOn ? this.testForm?.value?.reportOn : ''
    this.elasticSearchRequest.diseasesName = this.testForm?.value?.disease ? this.testForm?.value?.disease : ''
    this.elasticSearchRequest.specilityName = this.testForm?.value?.speciality ? this.testForm?.value?.speciality : ''
    this.elasticSearchRequest.isAvtice = this.testForm?.value?.status ? this.testForm?.value?.status : ''
    this.elasticSearchRequest.flag = this.searchedFlag ?  this.searchedFlag  : null ;
    this.elasticSearchRequest.clusterName = this.clusterName ? this.clusterName : null;
    this.elasticSearchRequest.orgId = this.orgId ? this.orgId : null ;
   this.elasticSearchRequest.isGender = this.isActiveTab ;
   this.elasticSearchRequest.sampleType = this.testForm?.value?.sampleType ? this.testForm?.value?.sampleType : null ;
   console.log(this.testForm?.value?.nabl,'this.testForm?.value?.nabl');
   
   if(this.testForm?.value?.nabl){
    let nabl:any=this.testForm?.value?.nabl == 1 ?  'Y' : 'N'
    this.elasticSearchRequest.nabl = nabl 
   }else{
    this.elasticSearchRequest.nabl = '' 
   }

    // this.elasticSearchRequest.isGenderFlag = this.isActiveTab
    this.navbarService.changeElasticReq(this.elasticSearchRequest)
    console.log("elasticgetTests req: ", this.elasticSearchRequest);
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(this.elasticSearchRequest)
    this.requestModel.payload = this.encrydecryresponse.data
    this.landingHomeService.elasticgetTests(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.isSubmitting = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("elasticgetTests res: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.length > 0) {
        this.testDetails = this.encrydecryresponse.data.map((obj: any) => ({
          ...obj,
          'isAdded': false
        }));
        this.isLoading=false;

        this.getCartItems()
        sessionStorage.setItem("testDetails", JSON.stringify(this.testDetails));
        this.detectChanges()
        this.isSubmitting = false;
      } else {
        this.isLoading=false;
        this.isSubmitting = false;
        this.testDetails = []
        this.detectChanges()
      }
      //this.getCartItems();
    });
  }

  navigateToOverview(data: any) {
    console.log(data);
    this.router.navigate(["/overview"], { state: { testPk: data.TESTPK, orgId: data.orgId, location: this.selectedLocation, isAdded: data.isAdded, fromPage: "home", item: data } })
  }

  exportData() {
    if (this.testDetails.length == 0) {
      this.toastr.error('No data available to export!')
    } else {
      this.isLoading = true;
      let data = this.testDetails.map((value: any) => {
        return {
          "Test Code": value.testCode,
          "Test Name": value.testName,
          "Method": value.MethodName,
          "Sample Quantity": value.SampleVolume,
          "Test Schedule": value.testSchdule,
          "Reported On": value.ReportedOn,
          "Price": value.testFees,
          "Test status": value.isActive == 'Y' ? 'Active' : 'Inactive'
        }
      });

      const fileName = "TestDetails.xlsx";
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "TestDetails");
      XLSX.writeFile(wb, fileName);
      setTimeout(() => {
        this.isLoading = false;
      }, 2000)

    }
  }

  selectedProduct: any = [];
  row_expand(ele: any) {
    this.selectedProduct.length = 0;
    this.selectedProduct.push(ele);
  }

  summaryPk: any;
  insertUpdateTestCartDetails(flag?: any) {
    if (localStorage.getItem('user')) {
      // console.log(this.addedCartItems);
      let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
      let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
      this.userid = userDecrypted.data.userid;
      // console.log(this.userid);
      let locationId = sessionStorage.getItem('locationId')
        ? sessionStorage.getItem('locationId') : localStorage.getItem('locationId');
      this.locationId = locationId;
      this.isLoading = true;
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
        // console.log(response, 'response');
        this.responseModel = new ResponseModel()
        let clientSecret = response.headers.get('clientsecret')
        this.responseModel = response.body
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        // console.log(this.encrydecryresponse, ' this.encrydecryresponse');
        if (this.encrydecryresponse.data.statusCode == 200) {
          this.isLoading = false;
          this.getTestCartDetailsByUserId()
        } else {
          this.toastr.error(this.encrydecryresponse.data.responseObject.insertUpdateContinentMaster[0].MESSAGE)
          this.isLoading=false;
        }
      });
    }
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
      console.warn(this.encrydecryresponse.data.responseObject, ' summary pK');
      this.cookieService.set('link', this.encrydecryresponse.data.responseObject[0].pdf)


      if (this.encrydecryresponse.data.statusCode == 200) {
        this.summaryPk = this.encrydecryresponse.data.responseObject[0].SummaryPk
        console.log(this.summaryPk, '  this.summaryPk');
        if (this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray.length == 0) {
          this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = []
        } else {
          const isEmpty = Object.values(this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray[0]).every(x => x === 0 || x === '0');
          // console.log(isEmpty, 'isEmpty');
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
              // console.warn(filter, 'filter')
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
              console.log(JSON.stringify(this.addedCartItems), 'this.newArr');
              console.log(this.addedCartItems, 'addedCartItems');

              const expirationTime = new Date(); expirationTime.setMinutes(expirationTime.getMinutes() + 1440);
              // this.cookieService.set('cartItems', JSON.stringify(this.addedCartItems), expirationTime, '/');
              localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));

              this.cartService.changeData((this.addedCartItems.length).toString())
              // this.getCartItems()
            }, 100);

            // setTimeout(() => {//hided by hari
            //   if(this.addedCartItems){
            //       this.addedCartItems=this.addedCartItems
            //   }else{
            //     this.addedCartItems =  this.addedCartItems.concat(newArr)
            //   }
            //   console.log(JSON.stringify(this.addedCartItems), 'this.newArr');
            //   this.cartService.changeData((this.addedCartItems.length).toString())


            // }, 100)



          } else {
            this.addedCartItems = this.addedCartItems
            this.cartService.changeData((this.addedCartItems.length).toString())
          }
        }

      }

    });
  }

  // formatTestFees(price: any) {
  //   return parseFloat(price != '' ? price : '').toLocaleString('en-IN', {
  //     maximumFractionDigits: 2,
  //     minimumFractionDigits: 1
  //   });;
  // }
  // formatTestFees(price: any) {
  //   const parsedPrice = parseFloat(price);
  //   return parsedPrice ? parsedPrice.toLocaleString('en-IN', {
  //     minimumFractionDigits: 2,  
  //     maximumFractionDigits: 2   
  //   }) : '0.00';
  // }
  formatTestFees(price: any) {
    return Math.floor(price);
  }

  getCatalogNotificationdetails() {
    if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
      this.clusterName = localStorage.getItem('clusterName');
      this.orgId = localStorage.getItem('orgId');
      //this.isLoading = true;
    }
    let req = {
      // "locationId": 1,
      "locationName": this.locationName,
      "flag": 1,
      "clusterName": this.clusterName ? this.clusterName : '',
      "orgId": this.orgId ? this.orgId : '',
    }
    console.log(req, "getCatalogNotificationdetails-req");

    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(req)
    this.requestModel.payload = this.encrydecryresponse.data

    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(req)
    this.requestModel.payload = this.encrydecryresponse.data
    this.landingHomeService.getCatalogNotificationdetails(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      // console.log("getCatalogNotificationdetails res: ", this.encrydecryresponse);
      // console.log("getCatalogNotificationdetails res: ", this.encrydecryresponse.data);

      if (this.encrydecryresponse.data) {
        // console.log("test")
        //this.isLoading = false;
        this.notificationList = this.encrydecryresponse.data
        console.log(this.notificationList, "this.notificationList")
      }
    });

  }


  onPageChange(event: any) {
    this.first = event.first;
  }
  onPageSizeChange(newRows: number) {
    this.rows = newRows;
    this.first = 0; // Reset the paginator to the first page
  }
  truePaginator() {
    this.showPaginator = true;
    setTimeout(() => {
      console.log('www')
      this.scrollToBot();
    }, 50);
  }

  scrollToBot() {
    // (document.querySelector('#scroll') as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'end' });
    $('#scroll').scrollTop($('#scroll')[0].scrollHeight);
  }

  header:any='https://is-onedos.s3.ap-south-1.amazonaws.com/B2C_project_logo/Header.png'
  footer:any='https://is-onedos.s3.ap-south-1.amazonaws.com/B2C_project_logo/Footer.png'
   dataGrid=[{
    "gender": "Both",
    "TESTPK": 42191,
    "TestId": 56373,
    "orgId": 23,
    "testCode": "A8805",
    "testName": " Allergen component rDer p 10",
    "MethodName": "Fluoroenzymeimmunoassay",
    "testFees": "1500.0",
    "CategoryName": "D",
    "SampleType": "Serum",
    "SampleVolume": "3 ml",
    "ShipAt": "2-8 C",
    "ScheduleDays": "MO,TU,WE,TH,FR,SA",
    "ReportedOn": "After 8 hrs",
    "TentativeReportReleaseTime": "",
    "FastingRequired": "No",
    "PatientConsentForm": "No",
    "NABL": "No",
    "ProcessingDepartment": "CLINICAL CHEMISTRY",
    "testSchdule": "NTAT547",
    
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},{
  "gender": "Both",
  "TESTPK": 42191,
  "TestId": 56373,
  "orgId": 23,
  "testCode": "A8805",
  "testName": " Allergen component rDer p 10",
  "MethodName": "Fluoroenzymeimmunoassay",
  "testFees": "1500.0",
  "CategoryName": "D",
  "SampleType": "Serum",
  "SampleVolume": "3 ml",
  "ShipAt": "2-8 C",
  "ScheduleDays": "MO,TU,WE,TH,FR,SA",
  "ReportedOn": "After 8 hrs",
  "TentativeReportReleaseTime": "",
  "FastingRequired": "No",
  "PatientConsentForm": "No",
  "NABL": "No",
  "ProcessingDepartment": "CLINICAL CHEMISTRY",
  "testSchdule": "NTAT547",
  
},]

  async downloadPDF() {
    try {
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

      // Style options
      const styles = {
        font: 'Helvetica',
        fontStyle: 'normal',
        fontSize: 15,
        halign: 'center',
        valign: 'middle',
        overflow: 'linebreak',
        lineWidth: 0.1,
        minCellWidth: 55,
        minCellHeight: 10,
      };

      // Define column styles to align specific columns
      const columnStyles = {
        // Example: Align the second column (index 1) to the right
        9: { halign: 'right' },
        1: { halign: 'left' },
        // 10: { halign: 'left' },

        // Add more as needed for other columns
      };

      // Generate the table using autotable with specified styles, column alignment, and column widths
      await doc.autoTable({
        head: [columns], // Column headers
        body: tableData, // Table data
        styles: styles, // Apply styles
        columnStyles: columnStyles, // Apply column styles
        headStyles: { fillColor: [45, 65, 84] }, // Change header color to #2d4154
      });


      // Save the compressed PDF
      doc.save("METROPOLISEDOS_" + this.elasticSearchRequest.locationName + ".pdf");
      this.isLoading = false;
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  }


//  async downloadPDF() {
//   //   try {
//   //     const doc: any = new jsPDF({ format: [800, 800], compress: true });
  
//   //     // Header image URL (your image is remote)
//   //     const headerImageUrl = this.header;
//   //     const footerImageUrl = this.footer;  // Assuming you have a footer image URL as well
  
//   //     // Load header and footer images asynchronously
//   //     const headerImage = new Image();
//   //     headerImage.src = headerImageUrl;
  
//   //     const footerImage = new Image();
//   //     footerImage.src = footerImageUrl;
  
//   //     // Wait for both images to load
//   //     await Promise.all([
//   //       new Promise((resolve, reject) => {
//   //         headerImage.onload = resolve;
//   //         headerImage.onerror = reject;
//   //       }),
//   //       new Promise((resolve, reject) => {
//   //         footerImage.onload = resolve;
//   //         footerImage.onerror = reject;
//   //       })
//   //     ]);
  
//   //     // Get the page size
//   //     const pageWidth = doc.internal.pageSize.width;
//   //     const pageHeight = doc.internal.pageSize.height;
  
//   //     // Set header image size and add it to the top of the page
//   //     const headerImageWidth = pageWidth - 20;  // 10px padding on each side
//   //     const headerImageHeight = (headerImage.height / headerImage.width) * headerImageWidth; // Proportional scaling
//   //     doc.addImage(headerImage, 'PNG', 10, 10, headerImageWidth, headerImageHeight);
  
//   //     // Set footer image size and add it to the bottom of the page
//   //     const footerImageWidth = pageWidth - 20;  // Same width as the header
//   //     const footerImageHeight = (footerImage.height / footerImage.width) * footerImageWidth;  // Proportional scaling
//   //     const footerY = pageHeight - footerImageHeight - 10;  // 10px padding from the bottom
//   //     doc.addImage(footerImage, 'PNG', 10, footerY, footerImageWidth, footerImageHeight);
  
//   //     // Now, we need to add the table between the header and footer
//   //     const tableStartY = 10 + headerImageHeight + 10;  // 10px below the header image
  
//   //     // Convert the data array to a 2D array suitable for autotable
//   //     const tableData = this.dataGrid.map((item: any) => Object.values(item));
  
//   //     // Define the columns for the table
//   //     const columns = Object.keys(this.dataGrid[0]);
  
//   //     // Style options for the table
//   //     const styles = {
//   //       font: 'Helvetica',
//   //       fontStyle: 'normal',
//   //       fontSize: 12,
//   //       halign: 'center',
//   //       valign: 'middle',
//   //       overflow: 'linebreak',
//   //       lineWidth: 0.1,
//   //       minCellWidth: 50,
//   //       minCellHeight: 10,
//   //     };
  
//   //     // Define column styles to align specific columns
//   //     const columnStyles = {
//   //       9: { halign: 'right' },
//   //       1: { halign: 'left' },
//   //     };
  
//   //     // Generate the table using autotable with specified styles, column alignment, and column widths
//   //     await doc.autoTable({
//   //       head: [columns],  // Column headers
//   //       body: tableData,  // Table data
//   //       styles: styles,   // Apply styles
//   //       columnStyles: columnStyles,  // Apply column styles
//   //       headStyles: { fillColor: [45, 65, 84] },  // Header color
//   //       startY: tableStartY,  // Start table below the header and above the footer
//   //     });
  
//   //     // Save the compressed PDF
//   //     doc.save("METROPOLISEDOS_" + this.elasticSearchRequest.locationName + ".pdf");
//   //     this.isLoading = false;
//   //   } catch (error) {
//   //     console.error("Error generating PDF:", error);
//   //     // Handle the error appropriately, e.g., show an error message to the user
//   //   }
//    }
  
  

//   async downloadPDF() {
//     try {
//       const doc: any = new jsPDF({ format:'a4', compress: true });
  
//       // Header and Footer image URLs (your images are remote)
//       const headerImageUrl = this.header;
//       const footerImageUrl = this.footer;  // Assuming you have a footer image URL as well
  
//       // Load header and footer images asynchronously
//       const headerImage = new Image();
//       headerImage.src = headerImageUrl;
  
//       const footerImage = new Image();
//       footerImage.src = footerImageUrl;
  
//       // Wait for both images to load
//       await Promise.all([
//         new Promise((resolve, reject) => {
//           headerImage.onload = resolve;
//           headerImage.onerror = reject;
//         }),
//         new Promise((resolve, reject) => {
//           footerImage.onload = resolve;
//           footerImage.onerror = reject;
//         })
//       ]);
  
//       // Get the page size
//       const pageWidth = doc.internal.pageSize.width;
//       const pageHeight = doc.internal.pageSize.height;
  
//       // Set header image size and add it to the top of the page
//       const headerImageWidth = pageWidth - 20;  // 10px padding on each side
//       const headerImageHeight = (headerImage.height / headerImage.width) * headerImageWidth; // Proportional scaling
//       doc.addImage(headerImage, 'PNG', 10, 10, headerImageWidth, headerImageHeight);
  
//       // Set footer image size and add it to the bottom of the page
//       const footerImageWidth = pageWidth - 20;  // Same width as the header
//       const footerImageHeight = (footerImage.height / footerImage.width) * footerImageWidth;  // Proportional scaling
//       const footerY = pageHeight - footerImageHeight - 10;  // 10px padding from the bottom
//       doc.addImage(footerImage, 'PNG', 10, footerY, footerImageWidth, footerImageHeight);
  
//       // Calculate available space for the table (height of the page minus header and footer)
//       const availableHeight = pageHeight - headerImageHeight - footerImageHeight - 30;  // 30px for padding
  
//       // Convert the data array to a 2D array suitable for autotable
//       const tableData = this.dataGrid.map((item: any) => Object.values(item));
  
//       // Define the columns for the table
//       const columns = Object.keys(this.dataGrid[0]);
  
//       // Calculate row height based on available space
//       const rowHeight = 8;  // Adjust this value to control row height
//       const numRowsPerPage = 15;  // We want exactly 15 rows per page
  
//       // If the table has more rows than can fit on one page, we will break it into multiple pages
//       const totalRows = this.dataGrid.length;
//       const pageCount = Math.ceil(totalRows / numRowsPerPage);  // Number of pages required
  
//       // Style options for the table
//       const styles = {
//         font: 'Helvetica',
//         fontStyle: 'normal',
//         fontSize: 10,
//         halign: 'center',
//         valign: 'middle',
//         overflow: 'linebreak',
//         lineWidth: 0.1,
//         minCellWidth: 50,
//         minCellHeight: rowHeight,
//       };
  
//       // Define column styles to align specific columns
//       const columnStyles = {
//         9: { halign: 'right' },
//         1: { halign: 'left' },
//       };
  
//       // Start Y-position for the table after the header image
//       let startY = 10 + headerImageHeight + 10;  // 10px below the header image
  
//       // Generate the table across multiple pages if needed
//       for (let page = 1; page <= pageCount; page++) {
//         if (page > 1) {
//           // Add a new page for overflow content
//           doc.addPage();
//           // Re-add header and footer images on the new page
//           doc.addImage(headerImage, 'PNG', 10, 10, headerImageWidth, headerImageHeight);
//           doc.addImage(footerImage, 'PNG', 10, footerY, footerImageWidth, footerImageHeight);
//           startY = 10 + headerImageHeight + 10;  // Reset the startY position for the new page
//         }
  
//         // Calculate the subset of table data to display on this page
//         const startRow = (page - 1) * numRowsPerPage;
//         const endRow = Math.min(page * numRowsPerPage, totalRows);
//         const tdata =  this.dataGrid.map((item: any) => Object.values(item))
//         const tableData = tdata.slice(startRow, endRow);
  
//         // Generate the table for this page
//         await doc.autoTable({
//           head: [columns],  // Column headers
//           body: tableData,  // Table data for the current page
//           styles: styles,   // Apply styles
//           columnStyles: columnStyles,  // Apply column styles
//           headStyles: { fillColor: [45, 65, 84] },  // Header color
//           startY: startY,  // Start the table at the calculated position
//           margin: { top: 10, bottom: 50 },  // Prevents overlap of table content with images
//           pageBreak: 'auto',  // Automatically break pages if needed
//         });
  
//         // Update the startY for the next page's table (leaving space between rows)
//         startY = doc.lastAutoTable.finalY + 10;  // 10px space after the table
      
  
//       }
  
//       // Save the PDF
//       doc.save("METROPOLISEDOS_" + this.elasticSearchRequest.locationName + ".pdf");
//       this.isLoading = false;
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       // Handle the error appropriately, e.g., show an error message to the user
//     }
//   }



  
  
  
  



  getCataloguePdfView() {
    if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
      let clusterName: any = localStorage.getItem('clusterName');
      let orgId: any = localStorage.getItem('orgId');
      this.isLoading = true;
      let req = {
        "locationName": this.locationName,
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


   // attuneFlag: true = Attune API ON (Yes), false = Attune API OFF (No)
  // Value comes from getB2cLocationMaster response → saved to localStorage on location select
  // attuneFlag: boolean = localStorage.getItem('attune')?.toLowerCase() === 'yes';
  attuneFlag: boolean = localStorage.getItem('attune')?.toUpperCase() === 'Y';
  selectedScheduleTest: any = null;


  view_data(template: any, size: any,data:any) {

    
    console.log(data,'data')
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
    // debugger
    this.selectedScheduleTest = null;
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: `modal-${size} modal-dialog-centered`,
    });
    this.getViewScheduleAndTAT(data);
  }

// ✅ EXACT FIX - Based on Actual API Response Structure


async getViewScheduleAndTAT(data: any):Promise<void> {
  // debugger 
  const orgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId');
  const clusterName = localStorage.getItem('clusterName') || sessionStorage.getItem('clusterName');
  
  const req = {
    orgId: orgId,
    clusterName: clusterName,
    testCode: data.testCode
  };
  
  console.log('📤 Request:', req);
  
  this.requestModel = new RequestModel();
  this.encrydecryresponse = new EncryptDecryptResponse();
  this.encrydecryresponse = this.encryptDecrypt.encryption(req);
  this.requestModel.payload = this.encrydecryresponse.data;
  await this.landingHomeService.getViewScheduleAndTAT(this.requestModel, this.encrydecryresponse.iv)
    .toPromise().then((response: any) => {
      this.responseModel = new ResponseModel();
      const clientSecret = response.headers.get('clientsecret');
      this.responseModel = response.body;
      this.encrydecryresponse = this.encryptDecrypt.decryption(
        this.responseModel.responseData, 
        clientSecret
      );
      
      console.log('📥 Response:', this.encrydecryresponse.data);
      
     const statusCode = this.encrydecryresponse.data?.statusCode;
      const message = this.encrydecryresponse.data?.message || 'No Record Found';
      const resData = this.encrydecryresponse.data?.responseObject || this.encrydecryresponse.data;

      if (statusCode === 404 || !resData || (Array.isArray(resData) && resData.length === 0)) {
        this.selectedScheduleTest = { noData: true, message: message };
        return;
      }
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
          ProcessingOrgName:rawData.ProcessingOrgName || '-',
          ReportTAT: rawData.ReportTAT || this.formatReportTAT(orgWiseInfo) || '-'
        };
        // debugger
          data.ReportTAT=this.selectedScheduleTest?.ReportTAT 
        
        data.isLoading = false;
        console.log('selectedScheduleTest:', this.selectedScheduleTest);
      }
    }, (error) => {
      console.error('❌ Error:', error);
      this.selectedScheduleTest = { noData: true, message: 'Something went wrong' };
       data.isLoading = false;
    });
}

formatReportTAT(orgWiseInfo: any): string {
  if (!orgWiseInfo) return '';
  const processingTime = orgWiseInfo.ProcessingTime;
  const units = orgWiseInfo.Units || 'HRS';
  if (processingTime) {
    return `${processingTime} ${units}`;
  }
  return '';
}



  // getViewScheduleAndTAT(data: any) {
  //   // STATIC TEST DATA - remove after testing
  //   this.selectedScheduleTest = {
  //     ScheduleDays: 'Mon, Tue, Wed, Thu, Fri, Sat',
  //     testSchduleName: 'Daily : 9:00am to 9:00pm',
  //     ReportedOn: 'After 6 hrs',
  //     processingLocationName: 'Metropolis Vidyavihar',
  //     ReportTAT: '2026-05-07T17:00:00'
  //   };
  //   return;

  //   // ACTUAL API CALL - uncomment after testing
  //   // const orgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId');
  //   // const req = {
  //   //   orgId: orgId,
  //   //   testCode: data.testCode
  //   // };
  //   // this.requestModel = new RequestModel();
  //   // this.encrydecryresponse = new EncryptDecryptResponse();
  //   // this.encrydecryresponse = this.encryptDecrypt.encryption(req);
  //   // this.requestModel.payload = this.encrydecryresponse.data;
  //   // this.landingHomeService.getViewScheduleAndTAT(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
  //   //   this.responseModel = new ResponseModel();
  //   //   const clientSecret = response.headers.get('clientsecret');
  //   //   this.responseModel = response.body;
  //   //   this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
  //   //   console.log('viewScheduleAndTAT res:', this.encrydecryresponse.data);
  //   //   if (this.encrydecryresponse.data) {
  //   //     this.selectedScheduleTest = this.encrydecryresponse.data;
  //   //   }
  //   // });
  // }


  // changes
getEstimationDate(test: {
  ScheduleDays?: string;
  ReportedOn?: string;
  testSchduleName?: string;
}): string {
  if (!test?.ScheduleDays || !test?.ReportedOn) return '';

  const scheduleDays: string[] = test.ScheduleDays.split(',').map(d => d.trim().toUpperCase());
  const reportedText: string = test.ReportedOn.toUpperCase().trim();
  const scheduleText: string = (test.testSchduleName || '').toUpperCase();

  const dayMap: { [key: string]: number } = {
    'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6
  };

  let now: Date = new Date();

  // 🕑  If time is after 2 PM → move to next day before finding schedule
  if (now.getHours() >= 14) {
    now.setDate(now.getDate() + 1);
    now.setHours(9, 0, 0, 0); // reset to morning for scheduling
  }

  // 1️⃣ Find next valid schedule day
  const getNextScheduleDate = (): Date => {
    const todayIndex = now.getDay();
    for (let i = 0; i < 14; i++) {
      const checkIndex = (todayIndex + i) % 7;
      const checkCode = Object.keys(dayMap).find(k => dayMap[k] === checkIndex);
      if (checkCode && scheduleDays.includes(checkCode)) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        return d;
      }
    }
    return new Date(now);
  };

  let estimationDate: Date = getNextScheduleDate();

  // 2️⃣ Handle "After / Upto X hrs/days/weeks"
  const afterMatch = reportedText.match(/(AFTER|UPTO)\s+(\d+)\s*(HRS?|DAYS?|WEEKS?)/i);
  if (afterMatch) {
    const num = parseInt(afterMatch[2], 10);
    const unit = afterMatch[3].toUpperCase();
    if (unit.includes('HR')) estimationDate = new Date(now.getTime() + num * 60 * 60 * 1000);
    else if (unit.includes('DAY')) estimationDate.setDate(estimationDate.getDate() + num);
    else if (unit.includes('WEEK')) estimationDate.setDate(estimationDate.getDate() + num * 7);
  }

  // 3️⃣ Handle "Next Day"
  if (reportedText.includes('NEXT DAY')) {
    estimationDate.setDate(estimationDate.getDate() + 1);
  }

  // 4️⃣ Handle "12th day", "3rd day", etc.
  const ordinalMatch = reportedText.match(/(\d+)(ST|ND|RD|TH)\s+DAY/i);
  if (ordinalMatch) {
    const dayOffset = parseInt(ordinalMatch[1], 10);
    estimationDate.setDate(estimationDate.getDate() + dayOffset);
  }

  // 5️⃣ Extract TIME — prioritize ReportedOn over ScheduleName
  let selectedTime: string | null = null;
  const reportTimeMatch = reportedText.match(/(\d{1,2}(:\d{2})?\s*[AP]M)/i);
  if (reportTimeMatch) {
    selectedTime = reportTimeMatch[1];
  } else {
    const timeMatches = scheduleText.match(/(\d{1,2}(:\d{2})?\s*[AP]M)/gi) || [];
    if (timeMatches.length > 1) selectedTime = timeMatches[timeMatches.length - 1];
    else if (timeMatches.length === 1) selectedTime = timeMatches[0];
  }

  if (selectedTime) {
    const timeStr = selectedTime.replace(/\s+/g, '').toUpperCase();
    const [h, mPart] = timeStr.split(':');
    let hours = parseInt(h, 10);
    const minutes = mPart ? parseInt(mPart.replace(/[AP]M/i, ''), 10) : 0;
    const isPM = timeStr.includes('PM');
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    estimationDate.setHours(hours, minutes, 0, 0);
  }

  // ✅ Format result
  return estimationDate.toLocaleString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}




}