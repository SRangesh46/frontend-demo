import { Component, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { OverviewService } from './overview.service';
import { CartService } from '../cart/cart-service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';
import { filter } from 'rxjs/operators';
import { DiseaseService } from '../disease/disease.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent {
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  isLoading: boolean = false
     get isMHLStaff(): boolean {
  return localStorage.getItem('usertype') === '3';
}
  addedCartItems: any=[]
  historyObject: any = {}
  currentPath:any;
    selectedScheduleTest: any = null;
  constructor(private router: Router, private encryptDecrypt: EncryptdecryptService, public overviewService: OverviewService,private cartService:CartService,
     private cookieService: CookieService,private toastr: ToastrService,private modalService: BsModalService,private navbarService : NavbarService,
    private diseaseService : DiseaseService) {
     
      }

     
    
  tab: any = 'Overview';
  add_cart(e: any) {
    let element: any = $(e.target)
    if (element.hasClass("overaddedtocart")) {
      this.router.navigate(["/cart"])
    }
    if (element.hasClass("overaddtocart")) {
      element.addClass("overaddedtocart")
      element.removeClass("add_cart")
      element.html(" Added")
    }
  }

  ngOnInit() {
    setInterval(() => {
      const sections = document.querySelectorAll("section");
      const navLi = document.querySelectorAll("nav .dos_nav ul li");
      const scroll :any= document.querySelector(".overview.tab-container")
      window.onscroll = () => {
        var current:any = "";
      
        sections.forEach((section) => {
          const sectionTop = section.offsetTop;
          if (pageYOffset >= sectionTop - 350) {
            current = section.getAttribute("id"); }
        });
      
        navLi.forEach((li) => {
          li.classList.remove("active");
          if (li.classList.contains(current)) {
            li.classList.add("active");
          }
        });
      };
    }, 100);
    this.historyObject = history.state
    console.log(this.historyObject,'history');
    
    this.navbarService.changeData(this.historyObject.name ? this.historyObject.name :'List')
    this.getFieldInfo()
    this.getTestInfo();
    this.getCartItems();
    if (localStorage.getItem('user')) {
      let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
      let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
      this.userid = userDecrypted.data.userid;
      console.log(this.userid);
      let locationId = sessionStorage.getItem('locationId')
       ? sessionStorage.getItem('locationId'): localStorage.getItem('locationId') ;
      this.locationId = locationId;
      this.locationId = this.cookieService.get('locationId')
       this.getTestCartDetailsByUserId();
    }
  }

  testInfo: any = {}
  containerInfo: any =[]
  isAdded: boolean;
  testData:any;
  clusterName:any;
  orgId:any;
  gender:any;

  testSheduledays:any={}

    // attuneFlag: boolean = localStorage.getItem('attune') === 'Yes';
    attuneFlag: boolean = localStorage.getItem('attune')?.toUpperCase() === 'Y';
  attuneScheduleData: any = null;

  sampleType:any;

  removeDuplicates(sampleType: any[]): any[] {
    const uniqueSampleTypes = new Set<string>();
    return sampleType.filter(item => {
      if (!uniqueSampleTypes.has(item.SampleType)) {
        uniqueSampleTypes.add(item.SampleType);
        return true;
      }
      return false;
    });
  } 

  clinicalUtilityList:any=[];
  testGender:any
  getTestInfo() {
    
   if (localStorage.getItem('clusterName') || localStorage.getItem('orgId')) {
    this.clusterName= localStorage.getItem('clusterName');
   }
    this.isAdded = history.state.isAdded
    this.testData=history.state.item
    console.log(this.testData);
    
    const cartItems:any = localStorage.getItem('cartItems');
    if (cartItems) {
      this.addedCartItems = JSON.parse(cartItems);
      console.log(this.addedCartItems);
      let isadded =   this.addedCartItems.find((res:any)=>res.TESTPK == this.testData.TESTPK)
      console.log(isadded);
      if(isadded){
        this.testData.isAdded = isadded
      }else{
        this.testData.isAdded = isadded
      }
      
    }
    
    let request = {
      "testId": history.state.testPk ? history.state.testPk : '',
      "locationName": history.state.location ? history.state.location : '',
      "orgId": history.state.orgId ? history.state.orgId : null,
      "clusterName":this.clusterName
    }
    this.isLoading = true;
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(request)
    this.requestModel.payload = this.encrydecryresponse.data
    console.log("overview req: ", request);
    this.overviewService.getTestInfo(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.isLoading = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.length > 0) {
        this.testInfo = this.encrydecryresponse.data[0]
        console.log(this.testInfo)
        // this.clinicalUtilityList= this.testInfo.clinicalUtility.split('.');
        // this.clinicalUtilityList=this.testInfo?.clinicalUtility?.split('>');
     this.clinicalUtilityList = this.testInfo?.clinicalUtility
  ?.split('>')
  .map((item: string) => item.trim()) // explicitly type item as string
  .filter((item: string) => item);    // explicitly type item as string


        console.log(this.clinicalUtilityList,'clinicalUtility');
        console.log(this.testInfo,'this.testInfo');

        this.testSheduledays=this.testInfo?.OrgWiseInfo[0]
        console.log(this.testSheduledays,'this.testSheduledays');

        // If Attune API is ON, fetch schedule & TAT from Attune
        // this.attuneFlag = localStorage.getItem('attune') === 'Yes';
        this.attuneFlag = localStorage.getItem('attune')?.toUpperCase() === 'Y';
        if (this.attuneFlag) {
          this.getAttuneScheduleAndTAT();
        }

        this.sampleType = this.removeDuplicates(this.testInfo?.SampleType);
        console.log(this.sampleType);  
        
        this.testGender = this.testInfo.Gender;  // Assign Gender to a variable
        console.log(this.testGender);  // Optionally log the gender value
  
        
        if (this.encrydecryresponse.data[0].Container.length > 0) {
          this.containerInfo = this.encrydecryresponse.data[0].Container
          console.log(this.containerInfo,'this.containerInfo');
        }
        if (this.testInfo.uploadedReportTemplate != '') {
          let extension = this.getFileExtension(this.testInfo.uploadedReportTemplate)
          this.testInfo.templateExtension = extension
        } else {
          this.testInfo.templateExtension = ''
        }
        if (this.testInfo.uploadedTestBrochure != '') {
          let extension = this.getFileExtension(this.testInfo.uploadedTestBrochure)
          this.testInfo.brochureExtension = extension
        } else {
          this.testInfo.brochureExtension = ''
        }
        if (this.testInfo.testRequisition && this.testInfo.testRequisition != '') {
  let extension = this.getFileExtension(this.testInfo.testRequisition);
  this.testInfo.testRequisitionExtension = extension;
} else {
  this.testInfo.testRequisitionExtension = '';
}

if (this.testInfo.consentForms && this.testInfo.consentForms != '') {
  let extension = this.getFileExtension(this.testInfo.consentForms);
  this.testInfo.consentFormsExtension = extension;
} else {
  this.testInfo.consentFormsExtension = '';
}

      }
      console.log("overview res: ", this.encrydecryresponse.data);
    });
  }
  navigateToList(){
    this.router.navigate(["/list"], { state: { name: 'list' } });
  }
  rotation: number = 0; // Initial rotation
  public zoom = 1;
  totalPages: number;
  page = 1;
  @ViewChild('pdfViewer', { static: true }) pdfViewer: any;


  zoomin() {
    if (this.zoom <= 1.4000000000000004) {
      this.zoom += 0.1;
    }
    console.log(this.zoom);

  }

  zoomout() {
    if (this.zoom > 0.40000000000000013) {
      this.zoom -= 0.1;
      console.log(this.zoom);

    }
  }


  rotateClockwise() {
    this.rotation += 90;
    if (this.pdfViewer) {
      this.pdfViewer.renderPage();
    }
  }

  rotateCounterClockwise() {
    this.rotation -= 90;
    if (this.pdfViewer) {
      this.pdfViewer.renderPage();
    }
  }
  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    console.log(this.totalPages);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
    }

  }

  prevPage() {
    if (this.page>1) {
      this.page--;
    }
  }
  closePdf(){
    this.zoom =1
  }

  public src:any;
  public modalRef:any;

  open_pdf(template: any,pdfLink:any) {
    console.log(pdfLink,'pdf');
    this.isLoading = true

     this.src = pdfLink    ;
    console.log(this.src,'src');


  this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-xxl',
    });
    setTimeout(() => {
      this.isLoading = false
     }, 100);
  }

  closeModal() {
    this.modalRef.hide();
  }

getAttuneScheduleAndTAT() {
    this.attuneScheduleData = null; // reset before API call
    const orgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId');
  const clusterName = localStorage.getItem('clusterName') || sessionStorage.getItem('clusterName');
  const req = {
    orgId: orgId,
    clusterName: clusterName,
    testCode: this.testInfo?.testCode
  };
  
  console.log('📤 Overview Request:', req);
  
  this.requestModel = new RequestModel();
  this.encrydecryresponse = new EncryptDecryptResponse();
  this.encrydecryresponse = this.encryptDecrypt.encryption(req);
  this.requestModel.payload = this.encrydecryresponse.data;
  
  this.overviewService.getViewScheduleAndTAT(this.requestModel, this.encrydecryresponse.iv)
    .subscribe((response: any) => {
      this.responseModel = new ResponseModel();
      const clientSecret = response.headers.get('clientsecret');
      this.responseModel = response.body;
      this.encrydecryresponse = this.encryptDecrypt.decryption(
        this.responseModel.responseData, 
        clientSecret
      );
      
      console.log('📥 Overview Response:', this.encrydecryresponse.data);
      
      const statusCode = this.encrydecryresponse.data?.statusCode;
      const message = this.encrydecryresponse.data?.message || 'No Record Found';

      // No record found
      if (statusCode === 404 || !this.encrydecryresponse.data) {
        this.attuneScheduleData = { noData: true, message: message };
        return;
      }

      const resData = this.encrydecryresponse.data?.responseObject || this.encrydecryresponse.data;

      if (resData) {
        const dataArray = Array.isArray(resData) ? resData : [resData];
        const rawData = dataArray.find((item: any) =>
          item.testCode === this.testInfo?.testCode ||
          item.TestCode === this.testInfo?.testCode
        ) || dataArray[0];

        const orgWiseInfo = rawData?.OrgWiseInfo && rawData.OrgWiseInfo.length > 0
          ? rawData.OrgWiseInfo[0]
          : {};
console.log('📥 orgWiseInfo Response:', rawData.TransitTimeValue);
        this.attuneScheduleData = {
          noData: false,
          TestScheduleDays: orgWiseInfo.TestScheduleDays || '-',
          TestSchedule: orgWiseInfo.ScheduleName || '-',
          ReportedOn: orgWiseInfo.ReportedOn || '-',
          // ProcessingOrgName: rawData.OrgName || rawData.processingLocationName || '-',
          ProcessingOrgName:rawData.ProcessingOrgName || '-',
          // TransitTime: rawData.TransitTimeValue ? `${rawData.TransitTimeValue}` : '-',
          TransitTime: rawData.TransitTimeValue ? `${rawData.TransitTimeValue} ${rawData.TransitTimeType || ''}`.trim() : '-',
          ReportTAT: rawData.ReportTAT || this.formatReportTAT(orgWiseInfo) || '-',
          NABL: orgWiseInfo.IsNABL || '-'
        };
        console.log('✅ Mapped Data:', this.attuneScheduleData);
      }
    },
    (error) => {
      this.attuneScheduleData = { noData: true, message: 'Something went wrong' };
    });
}

formatReportTAT(orgWiseInfo: any): string {
  if (!orgWiseInfo) return '-';
  const processingTime = orgWiseInfo.ProcessingTime;
  const units = orgWiseInfo.Units || 'HRS';
  if (processingTime) {
    return `${processingTime} ${units}`;
  }
  return '';
}

  brocherName:any
  temp:any;
  getUploadedTestBrocher(pdfLink:any,name:any,temp:any){
    console.log(pdfLink,name);
     this.brocherName=name;
     this.temp=temp
     this.open_pdf(temp,pdfLink)
  }

  downloadFile(url?:any,name?:any) {
    
    let fileUrl: any
    let newFilename: any
    // Define the file URL and new filename
    fileUrl = url ? url :this.src;
    newFilename = name ? name :this.brocherName;

    
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

  getFileExtension(url: any) {
    const fileParts = url.split('.');
    return fileParts.length > 1 ? fileParts[fileParts.length - 1] : null;
  }

  fieldInfo: any = {};
  getFieldInfo() {
    this.overviewService.getFieldInfo().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("fieldInfo:", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.statusCode == 200) {
        let responseData: any = this.encrydecryresponse.data.responseObject.getElasticSearchFieldInfoMaster[0]
        for (const key in responseData) {
          const newKey = key.replace(/\s+/g, '');
          this.fieldInfo[newKey] = responseData[key];    
          // console.log(this.fieldInfo,'this.fieldInfo');
                
        }
      }
    })
  }


  userid: any;
  locationId: any;
 

  

  // getCartItems() {
  //   const cartItems:any | null  = localStorage.getItem('cartItems');
  //   if (cartItems?.length > 0) {
  //     let data: any = JSON.parse(cartItems);
  //     this.cartService.changeData((data.length).toString())
  //     return this.cartService.addedCartItem = JSON.parse(cartItems);
  //   } else {
  //     return [];
  //   }
  // }

  getCartItems() {
  const cartKeyOrgId = localStorage.getItem('orgId') || sessionStorage.getItem('orgId');
  const cartKeyLocId = this.cookieService.get('locationId');
  const cartKey = `cartItems_${cartKeyOrgId}_${cartKeyLocId}`;
  const cartItems: any | null = localStorage.getItem(cartKey);
  if (cartItems?.length > 0) {
    const parsedItems: any[] = JSON.parse(cartItems);
    this.cartService.changeData(parsedItems.length.toString());
    return this.addedCartItems = parsedItems;
  } else {
    return [];
  }
}
  

selectedItem:any;

async getViewScheduleAndTAT(data: any):Promise<void> {
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
  
  await this.overviewService.getViewScheduleAndTAT(this.requestModel, this.encrydecryresponse.iv)
    .toPromise()
    .then((response: any) => {
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
          TestScheduleDays: orgWiseInfo.TestScheduleDays || '',
          TestSchedule: orgWiseInfo.ScheduleName || '',
          ReportedOn: orgWiseInfo.ReportedOn || '',
          // ProcessingOrgName: rawData.OrgName || rawData.processingLocationName || '-',
          processingLocationName: rawData.processingLocationName || '-',
          ReportTAT: rawData.ReportTAT || this.formatReportTAT(orgWiseInfo) || ''
        };
        console.log('selectedScheduleTest:', this.selectedScheduleTest);
        data.isLoading = false;
      }
    }, (error) => {
      console.error('❌ Error:', error);
      this.selectedScheduleTest = { noData: true, message: 'Something went wrong' };
      data.isLoading = false;
    });
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
item.ReportTAT = this.attuneScheduleData?.ReportTAT || '';
        this.cartService.addedCartItem.push(item)
        localStorage.setItem('cartItems', JSON.stringify(this.cartService.addedCartItem));
         this.cartService.changeData((this.cartService.addedCartItem.length).toString())
        this.getTotalPrice()
      }


    } else {
      if (item.isAdded) {
        item.isAdded = false;
         console.log(this.addedCartItems,'added');
        this.addedCartItems = this.addedCartItems.filter((val: any) => val.TESTPK != item.TESTPK )
        localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
        setTimeout(() => {
          this.cartService.changeData((this.addedCartItems.length).toString())
        },100)
        this.getTotalPrice()
        this.insertUpdateTestCartDetails();

      } else {
        this.selectedItem = true;
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
        this.getTotalPrice()
        this.insertUpdateTestCartDetails();

      }
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
  summaryPk: any;
  insertUpdateTestCartDetails(flag?: any) {
    if (localStorage.getItem('user')) {
      // console.log(this.addedCartItems);
      let userEncrypted = JSON.parse(localStorage.getItem('user') as string)
      let userDecrypted = this.encryptDecrypt.passwordDecryption(userEncrypted);
      this.userid = userDecrypted.data.userid;
      // console.log(this.userid);
      let locationId = sessionStorage.getItem('locationId')
       ? sessionStorage.getItem('locationId') : localStorage.getItem('locationId')
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
        // console.log(response, 'response');
        this.responseModel = new ResponseModel()
        let clientSecret = response.headers.get('clientsecret')
        this.responseModel = response.body
        this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
        // console.log(this.encrydecryresponse, ' this.encrydecryresponse');
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
       console.warn(this.encrydecryresponse.data.responseObject, ' summary pK');
       this.cookieService.set('link',this.encrydecryresponse.data.responseObject[0].pdf)

      if (this.encrydecryresponse.data.statusCode == 200) {
        this.summaryPk = this.encrydecryresponse.data.responseObject[0].SummaryPk
        console.log(this.summaryPk, '  this.summaryPk');
        if(this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray.length == 0){
          this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = []
        }else{
        const isEmpty = Object.values(this.encrydecryresponse.data?.responseObject[0].cartTestDetailsArray[0]).every(x => x === 0 || x === '0');
        // console.log(isEmpty, 'isEmpty');
        if (isEmpty) {
          this.encrydecryresponse.data.responseObject[0].cartTestDetailsArray = []
        }
      }
        if (this.encrydecryresponse.data?.responseObject[0]?.cartTestDetailsArray) {
          let filterData: any = this.encrydecryresponse.data?.responseObject[0]?.cartTestDetailsArray
          console.log(filterData,'filterDaat');
          
          this.getCartItems()

          let newArr: any = []
          if (filterData.length > 0) {
            filterData.forEach((data: any) => {
              let filter: any = this.addedCartItems.every((obj: any) => data.TESTPK != obj.TESTPK )
              // console.warn(filter, 'filter')
              if (filter) {
                newArr.push(data)
              }else{
                let filterObj : any = this.addedCartItems.find((obj: any) => data.TESTPK == obj.TESTPK)
                filterObj.total = data.total
                filterObj.quantity =  data.quantity
              }
            })
            setTimeout(() => {
              this.addedCartItems = this.addedCartItems.concat(newArr)
           localStorage.setItem('cartItems', JSON.stringify(this.addedCartItems));
              this.cartService.changeData((this.addedCartItems.length).toString())
              if (this.addedCartItems) {
                let data= this.addedCartItems.filter((val:any)=> val.TESTPK == this.testData.TESTPK)
                if(data.length > 0){
                    this.testData.isAdded=true
                }else{
                  this.testData.isAdded=false
                }
                this.cartService.changeData((this.addedCartItems.length).toString())
              }
            }, 100);

          } else {
            this.addedCartItems = this.addedCartItems
            this.cartService.changeData((this.addedCartItems.length).toString())  
                  
          }
        }

      }

    });
  }

  onTabChanges(){
    $("div").scrollTop(0);
  }

  formatTestFees(price: any) {
    return Math.floor(price);
    // const parsedPrice = parseFloat(price);
    // return parsedPrice ? parsedPrice.toLocaleString('en-IN', {
    //   minimumFractionDigits: 2,  
    //   maximumFractionDigits: 2   
    // }) : '0.00';
  }

  nav_link(e: any) {
    let elem:any=document.querySelector(`#${e}`);
    $('.nav_link').map((e, l: any) => { $(l).removeClass('active') });
    window.scrollTo(0, elem.offsetTop-250)
  }
  navigateByUrl(url:any,tabname?:any){
    console.log(url,'url');
    console.log(tabname,'tabname');
    
    if(url=='diseases'){
      if(tabname=='Diseases'){
        this.router.navigateByUrl('/diseases')
        this.diseaseService.changediseaseData('')

      }else{
        this.router.navigate(['/diseases'],{ state: { name: history.state.name,}})
        this.diseaseService.changediseaseData(history.state.name)

      }
    }
    else if(url=='doctor-speciality'){
      this.router.navigate(['/doctor-speciality'],{ state: { name: history.state.name,}})
    }
    else if(url !=='speciality-testing'){
      this.router.navigate(['/'+this.historyObject.fromPage])
      console.log(this.historyObject);
    }
    else{
      this.router.navigate(["/speciality-testing"], { state: { name: history.state.name,} })
    }
  }

  
  downloadPdf(data: any) {
    //console.log(data, 'adata');
    let fileUrl: any
    let newFilename: any
    // Define the file URL and new filename
 
      fileUrl = data.formsPdf;
      newFilename = data.formsTitle + '.pdf';
    
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
