import { Component } from '@angular/core';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { TableRequestModel } from 'src/app/models/TableRequestModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { FaqService } from './faq.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent  {
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  public tableRequestModel: TableRequestModel = new TableRequestModel();
  isLoading=false;
  questionAndAnswerList:any
  constructor(private encryptDecrypt: EncryptdecryptService,private service : FaqService){}
  async getFaqDetails() {
    this.isLoading=true;
    try{
      const questionAndAnswerList =  await this.service.getFaqDetails();
      //console.log(report); 
      this.responseModel = new ResponseModel()
      let clientSecret = questionAndAnswerList.headers.get('clientsecret')
      this.responseModel = questionAndAnswerList.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
            this.questionAndAnswerList = this.encrydecryresponse.data.faqResponses.faq;
            this.isLoading=false;
            this.questionAndAnswerList.forEach((val:any)=>{
              this.sortByElasticSearchPkId(val.faqDetails)
            })
            console.log("questionAndAnswerList: ", this.questionAndAnswerList);
          }
    }catch(error:any){
     console.log(error);
    }
   
  }

  sortByElasticSearchPkId(faqDetails: any[]): any[] {
    return faqDetails.sort((a, b) => a.elasticSearchPkId - b.elasticSearchPkId);
  }
 
  ngOnInit() {
    // $(".main-menu.THRESHOLD.ssddropdown.FAQ a.main-menu-link").addClass('active')
    this.getFaqDetails();
  }
}
