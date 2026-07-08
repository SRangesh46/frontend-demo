import { ChangeDetectorRef, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { SymptomsService } from './symptoms.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'ngx-cookie-service';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';

@Component({
  selector: 'app-symptoms',
  templateUrl: './symptoms.component.html',
  styleUrls: ['./symptoms.component.css']
})
export class SymptomsComponent {
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  isLoading: boolean = false;
  letter: any = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#"];
  search_content: any = '';
  searchedFlag: any;
  popularSearchtItems: any = [];
  symptomsDetails: any = [];
  constructor(private toastr: ToastrService, public tableChange: ChangeDetectorRef, private navbarService: NavbarService, private cookieService: CookieService, private sharedservice: SharedService, private serviceMethod: PostmethodService, private encryptDecrypt: EncryptdecryptService, private router: Router, private modalService: BsModalService, private cdr: ChangeDetectorRef, private symptomsService: SymptomsService) {
  }

  alphabets(e: any, event: any) {
    this.search_content = e;
    this.selectedPopularKeyWord = ''
    this.searchedFlag = 2
    this.getSymptomsData()
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
      this.getSymptomsData();
    }
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
      this.getSymptomsData()
    }
  }

  selectedPopularKey(data: any) {
    this.searchedFlag = 1
    this.selectedPopularKeyWord = data.keyword;
    this.search_content = this.selectedPopularKeyWord
    this.getSymptomsData()
  }

  navigateToOverviews(data: any) {
    this.router.navigate(["/overviews"], { state: { id: data.symptomsPkId, page: 'Symptoms', request: this.requestObject } })
  }

  requestObject: any = {}
  getSymptomsData() {
    this.symptomsDetails = []
    this.searchedWords = this.selectedPopularKeyWord ? this.selectedPopularKeyWord : this.search_content
    let requestObj: any = {
      "globalSearch": this.selectedPopularKeyWord ? '' : this.search_content ? this.search_content : '',
      "flag": this.searchedFlag,
      "keyword": this.selectedPopularKeyWord ? this.selectedPopularKeyWord : ''
    }
    this.requestObject = requestObj
    console.log("symptoms request::: ", requestObj);
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(requestObj)
    this.requestModel.payload = this.encrydecryresponse.data
    this.isLoading = true;
    this.symptomsService.getSymptoms(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.isLoading = false;
      this.isSubmitting = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("symptoms response::: ", this.encrydecryresponse.data);
      if (this.encrydecryresponse.data.length > 0) {
        this.symptomsDetails = this.encrydecryresponse.data
        this.isSubmitting = false;
      }
    });
  }

  searchedWords: any = ''
  getPopularTestSearch() {
    // this.isLoading = new BehaviorSubject<boolean>(true);
    this.symptomsService.getPopularSymptoms().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("popularSearchtItems: ", JSON.stringify(this.encrydecryresponse.data));
      this.popularSearchtItems = this.encrydecryresponse.data
    });
  }

}
