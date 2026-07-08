import { Component } from '@angular/core';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { SynOverviewService } from './syn-overview.service';
import { Router } from '@angular/router';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';

@Component({
  selector: 'app-syn-overview',
  templateUrl: './syn-overview.component.html',
  styleUrls: ['./syn-overview.component.css']
})
export class SynOverviewComponent {
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  isLoading: boolean = false
  overviewDetails: any = {}
  isDisease: boolean = false;
  constructor(private router: Router, private encryptDecrypt: EncryptdecryptService, public synsService: SynOverviewService) { }

  ngOnInit() {
    if (history.state.page == 'Diseases') {
      this.getDiseaseOverview()
      this.isDisease = true
    } else {
      this.getOverviewDetails();
    }
  }

  redirectToDisease() {
    this.router.navigate(["/diseases"], { state: { request: history.state.request } })
  }

  redirectToSymptoms() {
    this.router.navigate(["/symptoms"], { state: { request: history.state.request } })
  }

  getOverviewDetails() {
    let request: any = {
      symptomPK: history.state.id,
    }
    this.isLoading = true;
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(request)
    this.requestModel.payload = this.encrydecryresponse.data
    console.log("overview req: ", request);
    this.synsService.getSynOverview(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.isLoading = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("overview res: ", this.encrydecryresponse.data[0])
      if (this.encrydecryresponse.data.length > 0) {
        this.overviewDetails = this.encrydecryresponse.data[0]
      }
    })

  }

  getDiseaseOverview() {
    let request: any = {
      diseasePkId: history.state.id,
    }
    this.isLoading = true;
    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(request)
    this.requestModel.payload = this.encrydecryresponse.data
    console.log("overview req: ", request);
    this.synsService.getDiseaseOverview(this.requestModel, this.encrydecryresponse.iv).subscribe((response: any) => {
      this.isLoading = false;
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log("overview res: ", this.encrydecryresponse.data[0])
      if (this.encrydecryresponse.data.length > 0) {
        this.overviewDetails = this.encrydecryresponse.data[0]
      }
    })
  }
}
